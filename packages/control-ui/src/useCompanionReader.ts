import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Detail, DocumentData, Envelope } from './types';
import { hasExpiredSession, type ReadingState } from './state';
import { detailHasMismatch } from './RunDetail';
import { companionSource, resolveSource, type CompanionSource } from './companion-source';

export type ReaderCapture = { document: Envelope<DocumentData>; detail: Envelope<Detail> };
type Position = { top: number; left: number };
type Selection = Pick<CompanionSource, 'key' | 'decision'> & { type: string; draft: boolean; knownDecision: string | null };
type RunMemory = { dismissed: Set<string>; selection: Selection | null; open: boolean; positions: Map<string, Position> };
type View = { run: string | null; open: boolean; standalone: boolean; source: Selection | null; capture: ReaderCapture | null; shownSource: Selection | null; loading: boolean; problem: string | null };
const emptyView: View = { run: null, open: false, standalone: false, source: null, capture: null, shownSource: null, loading: false, problem: null };

// App owns one active immutable capture. Other Runs retain only source identity,
// dismissal and reading position; their document bytes must be read again.
export function useCompanionReader({ state, enabled, visible, wide, sourcePending, load }: {
  state: ReadingState; enabled: boolean; visible: boolean; wide: boolean; sourcePending: boolean;
  load: (source: CompanionSource, automatic: boolean, recoverBinding: boolean) => Promise<ReaderCapture | undefined>;
}) {
  const [view, setView] = useState<View>(emptyView);
  const memories = useRef(new Map<string, RunMemory>());
  const inFlight = useRef(false);
  const epoch = useRef(0), attempted = useRef<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null), readerHeading = useRef<HTMLHeadingElement>(null);
  const manualFocus = useRef(false), restorePosition = useRef(false);
  const wasVisible = useRef(false);
  const data = state.detail?.data, target = state.scope?.target.target_id;
  const run = enabled && state.route.view === 'detail' && data && data.run_id === state.route.runId && target
    ? JSON.stringify([target, data.run_id]) : null;
  const current = !!run && state.phase === 'ready' && !state.refreshing && !state.requestedRoute && !state.stale && !state.problem
    && state.detail?.state === 'available' && !detailHasMismatch(data);
  const offered = data && target ? companionSource(data, target, current) : null;
  const autoOpen = !!(run && offered?.decision && !memories.current.get(run)?.dismissed.has(offered.decision));
  const retained = view.run === run && view.open;
  const readerVisible = retained && (wide || view.standalone);
  const stateSnapshot = useRef(state.detail?.snapshot_id); stateSnapshot.current = state.detail?.snapshot_id;
  const live = useRef({ run, current, offered, data, view, sourcePending, wide, readerVisible });
  live.current = { run, current, offered, data, view, sourcePending, wide, readerVisible };
  const memory = (key: string) => {
    let value = memories.current.get(key);
    if (!value) { value = { dismissed: new Set(), selection: null, open: false, positions: new Map() }; memories.current.set(key, value); }
    return value;
  };
  const savePosition = useCallback(() => {
    const { view: active, readerVisible } = live.current, element = viewport.current;
    if (readerVisible && active.run && active.shownSource && element)
      memory(active.run).positions.set(active.shownSource.key, { top: element.scrollTop, left: element.scrollLeft });
  }, []);
  useLayoutEffect(() => {
    if (view.run === run) return;
    epoch.current++; inFlight.current = false; attempted.current = null;
    const remembered = run ? memory(run) : null;
    setView({ ...emptyView, run, open: remembered?.open ?? false, source: remembered?.selection ?? null });
  }, [run, view.run]);
  useLayoutEffect(() => {
    if (wide && view.standalone) setView(previous => ({ ...previous, standalone: false }));
  }, [wide, view.standalone]);
  const open = useCallback(async (source: CompanionSource, automatic = false, revalidate = false) => {
    const active = live.current;
    if (!active.run || !active.current || active.sourcePending || inFlight.current) return;
    if (!revalidate && !active.view.problem && active.view.open && active.view.capture
      && active.view.capture.detail.snapshot_id === stateSnapshot.current
      && active.view.shownSource?.key === source.key && active.view.shownSource.decision === source.decision) {
      if (!automatic) {
        if (active.readerVisible) readerHeading.current?.focus({ preventScroll: true });
        else {
          manualFocus.current = true;
          setView(previous => ({ ...previous, standalone: true }));
        }
      }
      return;
    }
    savePosition();
    const selection: Selection = {
      key: source.key, decision: source.decision, type: source.resource.type,
      draft: active.data?.document_states?.some(row => row.resource_id === source.resource.resource_id && row.content_digest === source.digest && row.version_kind === 'draft') ?? false,
      knownDecision: automatic && active.view.open && active.view.source?.key === source.key && active.view.source.decision === source.decision
        ? active.view.source.knownDecision : active.offered?.decision ?? null,
    };
    const ticket = ++epoch.current;
    inFlight.current = true;
    const remembered = memory(active.run); remembered.open = true; remembered.selection = selection;
    manualFocus.current = !automatic; restorePosition.current = true;
    setView(previous => ({ ...previous, run: active.run, open: true, standalone: previous.standalone || !automatic && !active.wide,
      loading: true, problem: null, source: selection }));
    const capture = await load(source, automatic, automatic && !!source.decision && !active.view.capture);
    if (ticket !== epoch.current || live.current.run !== active.run) return;
    inFlight.current = false;
    if (!capture) { restorePosition.current = false; manualFocus.current = false; remembered.selection = active.view.shownSource ?? selection; }
    setView(previous => ({ ...previous, source: capture ? selection : active.view.shownSource ?? selection,
      capture: capture ?? active.view.capture, shownSource: capture ? selection : active.view.shownSource,
      loading: false, problem: capture ? null : 'Die gewählte Fassung konnte nicht bestätigt werden. Lies den Run erneut und öffne die aktuelle Quelle.' }));
  }, [load, savePosition]);
  useEffect(() => {
    if (!run || view.run !== run || !current || !visible || sourcePending || view.loading || !data || !target) return;
    if (view.open) {
      if (!readerVisible || view.problem || !view.source) return;
      if (view.capture) {
        const sameSource = resolveSource(data, target, view.source.key);
        if (sameSource && sameSource.decision === view.source.decision && view.capture.detail.snapshot_id !== state.detail?.snapshot_id) {
          const key = JSON.stringify([run, state.detail?.snapshot_id, view.source.key]);
          if (attempted.current !== key) { attempted.current = key; void open(sameSource, true, true); }
        }
        return;
      }
      const source = resolveSource(data, target, view.source.key);
      if (!source || source.decision !== view.source.decision) {
        setView(previous => ({ ...previous, problem: 'Die zuvor gelesene Fassung ist nicht mehr verfügbar. Öffne die aktuelle Quelle oder kehre zur Statuskarte zurück.' }));
        return;
      }
      void open(source, true);
    } else if (wide && offered && autoOpen) {
      const key = JSON.stringify([run, offered.decision, offered.key]);
      if (attempted.current === key) return;
      attempted.current = key;
      void open(offered, true);
    }
  }, [run, current, visible, wide, sourcePending, view, data, target, offered?.key, offered?.decision, autoOpen, readerVisible, state.detail?.snapshot_id, open]);
  useLayoutEffect(() => {
    const becameVisible = readerVisible && !wasVisible.current;
    wasVisible.current = readerVisible;
    if (!readerVisible || view.loading || !view.capture) return;
    if ((restorePosition.current || becameVisible) && view.shownSource && view.run) {
      restorePosition.current = false;
      const position = memory(view.run).positions.get(view.shownSource.key);
      if (viewport.current) { viewport.current.scrollTop = position?.top ?? 0; viewport.current.scrollLeft = position?.left ?? 0; }
    }
    if (manualFocus.current) { manualFocus.current = false; readerHeading.current?.focus({ preventScroll: true }); }
  }, [readerVisible, view]);
  const close = useCallback(() => {
    const active = live.current;
    savePosition(); epoch.current++; inFlight.current = false;
    if (active.run) {
      const remembered = memory(active.run); remembered.open = false;
      for (const key of [active.view.shownSource?.decision, active.view.source?.knownDecision, active.offered?.decision]) if (key) remembered.dismissed.add(key);
    }
    manualFocus.current = false;
    setView(previous => ({ ...previous, open: false, standalone: false, loading: false }));
  }, [savePosition]);
  const capture = view.run === run ? view.capture : null;
  const selected = capture?.document.data;
  const verified = !!(current && !sourcePending && capture?.detail.snapshot_id === state.detail?.snapshot_id && selected && data && target && view.shownSource && resolveSource(data, target, view.shownSource.key)
    && (!view.shownSource.decision || view.shownSource.decision === offered?.decision) && !view.loading && !view.problem);
  return { ...view, canOpen: current && !sourcePending && !view.loading, canReload: !hasExpiredSession(state) && state.phase !== 'loading', expired: hasExpiredSession(state), open: readerVisible, retained, capture, current: verified,
    offered, showWidthHint: !wide && !readerVisible && autoOpen,
    pendingDecision: !!(view.open && offered?.decision && (view.shownSource?.knownDecision ?? view.source?.knownDecision) !== offered.decision),
    sourceShown: !!(readerVisible && capture && verified && offered?.key === view.shownSource?.key),
    openSource: open, close, savePosition, viewport, readerHeading };
}
export type CompanionReader = ReturnType<typeof useCompanionReader>;
