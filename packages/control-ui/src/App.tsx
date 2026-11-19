import { useEffect, useLayoutEffect, useReducer, useRef, useCallback, useState, type RefObject } from 'react';
import { createApi, type ReadTransport } from './api';
import { initialState, readingReducer, hasExpiredSession } from './state';
import type { CompanionActivity, Inventory, OverviewInventory, Detail, DocumentData, Route, Resource, ReadingScope, Envelope } from './types';
import { ReadState, ReadingFeedback, readingStatus, label } from './feedback';
import { Overview, type WorkView } from './Overview';
import { RunDetail, detailHasMismatch, focusSituation } from './RunDetail';
import { RunFigure } from './RunFigure';
import { OverviewFigure } from './OverviewFigure';
import { WorkStandLabel } from './WorkStandLabel';
import { DocumentView, PassiveMarkdown } from './DocumentView';
import { FlowEvidence } from './FlowEvidence';
import { WorkStep } from './WorkStep';
import { ReviewControls, ReviewHeader, captureReviewAnchor, restoreReviewAnchor, newReviewPositionNotice, type ReadingAnchor, type ReviewView } from './mcp/review-view';
import { CompactCockpit } from './mcp/CompactCockpit';
import { companionDecision, companionSource, resolveSource, sourceKey, type CompanionSource } from './companion-source';
import { useCompanionReader } from './useCompanionReader';
import type { CompanionConstraints } from './mcp/CompanionWorkspace';
import { useCompanionSound } from './mcp/useCompanionSound';
import { BrandMark } from './BrandMark';
import { BrandHeader } from './BrandHeader';
import { RefreshControl } from './RefreshControl';
import { useCardVisibility } from './useCardVisibility';
import { documentName, observedAssessment, reviewBlocker, reviewTask } from './presentation';
import { projectWorkSituation } from '../../core/lib/control-inspect/work-situation.js';
import { Icon } from './mcp/Icon';
import { useDraftCheck } from './useDraftCheck';
import { DraftCheck } from './DraftCheck';
import { ContextPanel } from './ContextPanel';
import type { HandoffController } from './mcp/handoff';
import type { CockpitProvenance } from './mcp/bootstrap';
import { AboutCockpit } from './AboutCockpit';
import type { CockpitHost } from './host-label';

export interface CockpitCheckpoint {
  target: string; runId: string; revision: string; path: string; type: string; digest: string; anchor?: ReadingAnchor;
}

type ObservedSource = { target: string; snapshot: string; revision: string; resource: Resource; digest: string; decision?: string | null; recoverBinding?: boolean };
type CompanionRefresh = { snapshot: string; generation: number; activity?: CompanionActivity; unknown: boolean };
const sameActivity = (a?: CompanionActivity, b?: CompanionActivity) => a === b || (!!a && !!b && a.target_id === b.target_id
  && a.run_id === b.run_id && a.revision_id === b.revision_id && a.gate === b.gate && a.expires_at === b.expires_at);
export type CompanionDisplay = { status: string; gate?: string; gate_state?: 'current' | 'done' };

export function App({ secret = '', transport, compact: hostCompact = false, onExpand, initialRunId, companionEmpty = false, companionFallback, handoff, provenance, host = 'unknown', onDisplay, companionConstraints, review, checkpoint }: {
  secret?: string; transport?: ReadTransport; compact?: boolean; onExpand?: () => void; onReturnToCompact?: () => Promise<void>;
  review?: ReviewView; checkpoint?: RefObject<CockpitCheckpoint | null>;
  initialRunId?: string; companionEmpty?: boolean; companionFallback?: boolean; handoff?: HandoffController; provenance?: CockpitProvenance; host?: CockpitHost;
  onDisplay?: (snapshotId: string, signal: AbortSignal, presentation?: CompanionDisplay) => Promise<boolean>; companionConstraints?: CompanionConstraints;
}) {
  const enabled = !!transport || !!secret;
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const [companionRefresh, setCompanionRefresh] = useState<CompanionRefresh | null>(null);
  const [backlogView, setWorkView] = useState<WorkView>({ section: 'runs', filter: '' });
  const [overviewSnapshot, setOverviewSnapshot] = useState<Envelope<OverviewInventory> | null>(null);
  // Codex can open the app directly in a fullscreen host surface, including a narrow side panel.
  // A selected Run starts at the Companion card in either host surface.
  const compact = hostCompact || (host === 'codex' && (state.route.view === 'detail' || companionEmpty));
  const [companionWide, setCompanionWide] = useState(false);
  const [wideWorkspace, setWideWorkspace] = useState(false);
  const [technicalView, setTechnicalView] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [companionMotion, setCompanionMotion] = useState(true);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  useLayoutEffect(() => { setTechnicalView(false); }, [state.route.runId]);
  const [backlogReturnNotice, setBacklogReturnNotice] = useState<string | null>(null);
  const [unavailableObservation, setUnavailableObservation] = useState<string | null>(null);
  const freshnessPending = useRef<AbortController | null>(null);
  const draftPending = useRef<AbortController | null>(null);
  const contextPending = useRef<symbol | null>(null);
  const beforeContextRead = useCallback(() => {
    const token = Symbol(); contextPending.current = token;
    // Context replaces the server capture, just like navigation and draft reads.
    // A late freshness reply belongs to the preceding capture, not this view.
    freshnessPending.current?.abort();
    return () => { if (contextPending.current === token) contextPending.current = null; };
  }, []);
  const workspace = useRef<HTMLDivElement>(null);
  const detailViewport = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = workspace.current;
    if (compact || !element) { setWideWorkspace(false); return; }
    const measure = () => setWideWorkspace(element.getBoundingClientRect().width >= 1100);
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element); window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [compact]);
  useEffect(() => { if (state.route.view === 'overview' && state.inventory?.data && state.phase === 'ready' && !state.stale) setOverviewSnapshot(state.inventory); }, [state.route.view, state.inventory, state.phase, state.stale]);
  const live = useRef(state); live.current = state;
  const sequence = useRef(0), pending = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  const cardVisible = useCardVisibility(heading, compact, !!review && !!state.detail?.data), wasCardVisible = useRef(true), focusAfterRead = useRef(true);
  const displayReported = useRef(false);
  const initialView = initialRunId ? state.route.view === 'detail' && state.detail?.data?.run_id === initialRunId
    : state.route.view === 'overview' && !!state.inventory?.data;
  const displaySnapshot = initialView && state.phase === 'ready' && !state.stale && !state.problem
    && state.scope && ['available', 'empty', 'partial'].includes(state.scope.state) ? state.scope.snapshot_id : null;
  useEffect(() => {
    if (!onDisplay || !displaySnapshot || displayReported.current || typeof IntersectionObserver === 'undefined') return;
    const element = compact ? heading.current?.closest('.compact-cockpit')?.querySelector('.compact-run h2, .compact-overview-heading h2') : heading.current;
    if (!element) return;
    const controller = new AbortController();
    let intersecting = false, pending = false;
    const report = async () => {
      if (!intersecting || document.visibilityState !== 'visible' || !element.isConnected || getComputedStyle(element).visibility !== 'visible'
        || controller.signal.aborted || pending || displayReported.current) return;
      pending = true;
      try {
        const card = element.closest<HTMLElement>('.companion-card');
        const status = card?.querySelector('.companion-signal')?.textContent?.trim();
        const gate = card?.dataset.displayGate;
        const gateState = card?.dataset.displayGateState;
        const presentation: CompanionDisplay | undefined = status ? { status,
          ...(gate && (gateState === 'current' || gateState === 'done') ? { gate, gate_state: gateState } : {}) } : undefined;
        if (await onDisplay(displaySnapshot, controller.signal, presentation)) displayReported.current = true;
      } catch { /* A failed acknowledgement leaves display status pending and reading usable. */ }
      finally { pending = false; }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = !!entry?.isIntersecting && entry.intersectionRatio > 0;
      void report();
    });
    observer.observe(element);
    const visibilityChanged = () => { void report(); };
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => { observer.disconnect(); controller.abort(); document.removeEventListener('visibilitychange', visibilityChanged); };
  }, [onDisplay, displaySnapshot, compact]);
  const returnFocus = useRef<string | null>(null);
  const returnSource = useRef<{ type: string; reference: string; prefix: string } | null>(null);
  const documentOrigin = useRef<string | null>(null);
  const returnListScroll = useRef<number | null>(null);
  const readingPosition = useRef<{ generation: number; open: string[]; scroll: { element: Element; top: number; left: number }[]; x: number; y: number; focus: string | null; activeElement: Element | null;
    resource?: { type: string; reference: string; prefix: string } } | null>(null);
  const disclosureKey = (element: Element) => (element.closest('[data-backlog-row]')?.querySelector('[data-focus-id]')?.getAttribute('data-focus-id') ?? '')
    + ':' + (element.querySelector('summary')?.textContent?.replace(/ · \d+$/, '') ?? '');
  const previousCompact = useRef(compact);
  useLayoutEffect(() => {
    if (previousCompact.current !== compact) heading.current?.focus();
    previousCompact.current = compact;
  }, [compact]);
  const read = useRef(transport ?? createApi(secret)).current;
  const loadArchive = useCallback((rowId: string, resourceId: string | undefined, signal: AbortSignal) => {
    const scope = live.current.inventory;
    if (!scope?.snapshot_id) return Promise.reject(Error('source_changed'));
    return read<import('./types').ArchiveData>(`/api/archive/${rowId}?snapshot=${scope.snapshot_id}${resourceId ? '&resource=' + resourceId : ''}`,
      signal, { target: scope.target.target_id, snapshot: scope.snapshot_id });
  }, [read]);
  const reviewRoot = useRef<HTMLElement>(null);
  const restore = useRef(checkpoint?.current && checkpoint.current.runId === initialRunId ? checkpoint.current : null);
  const hadCheckpointOnOpen = useRef(!!restore.current).current;
  const [reviewNotice, setReviewNotice] = useState('');
  const initialRoute = useRef<Route>(restore.current ? { view: 'document', runId: restore.current.runId, resourcePath: restore.current.path }
    : initialRunId ? { view: 'detail', runId: initialRunId } : { view: 'overview' }).current;
  const capturePosition = (generation: number) => {
      const root = workspace.current ?? heading.current?.closest('.compact-cockpit');
      const elements = root ? [root, ...root.querySelectorAll('*')] : [];
      for (let parent = root?.parentElement; parent; parent = parent.parentElement) elements.push(parent);
      const focus = document.activeElement?.getAttribute('data-focus-id') ?? null;
      const resource = live.current.detail?.data?.resources.find(r => focus?.endsWith(r.resource_id));
      readingPosition.current = { generation, open: root ? [...root.querySelectorAll('details[open]')].map(disclosureKey) : [],
        scroll: elements.filter(e => e.scrollTop || e.scrollLeft).map(element => ({ element, top: element.scrollTop, left: element.scrollLeft })),
        x: window.scrollX, y: window.scrollY, focus, activeElement: document.activeElement,
        ...(resource && focus ? { resource: { type: resource.type, reference: resource.registered_reference, prefix: focus.slice(0, -resource.resource_id.length) } } : {}) };
  };
  const navigate = useCallback(async (requested: Route, reload = false, background = false, observed?: ObservedSource, companionRead = false) => {
    if (hasExpiredSession(live.current)) return;
    draftPending.current?.abort();
    void handoff?.invalidate();
    // A cancelled title response may already have replaced the server capture.
    // Start a named capture instead of sending selectors from the previous one.
    freshnessPending.current?.abort();
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    const generation = ++sequence.current;
    const displayed = review && background && requested.view === 'document' && live.current.document?.state === 'available'
      ? live.current.document : null;
    if (background) capturePosition(generation); else readingPosition.current = null;
    focusAfterRead.current = !background && !companionRead;
    dispatch({ type: 'begin', generation, route: companionRead ? { view: 'detail', runId: requested.runId } : requested, background });
    try {
      let scope = live.current.scope;
      const refresh = reload || live.current.stale || !scope?.snapshot_id;
      let route = requested;
      if (observed && (refresh || scope?.target.target_id !== observed.target || scope.snapshot_id !== observed.snapshot
        || live.current.detail?.data?.revision_id !== observed.revision)) throw Error('source_changed');
      const expected = scope?.snapshot_id ? { target: scope.target.target_id, snapshot: scope.snapshot_id, replacement: true } : undefined;
      if (refresh || requested.view === 'overview') {
        scope = await read<ReadingScope>('/api/snapshot' + (requested.runId ? '?run_id=' + requested.runId : ''), controller.signal, expected);
      } else if (requested.view === 'detail') {
        scope = await read<ReadingScope>(`/api/runs/${requested.runId}?snapshot=${scope!.snapshot_id}`, controller.signal, expected);
      }
      if (controller.signal.aborted || generation !== sequence.current) return;
      if (!scope) throw Error('read_failed');
      if (!scope.data) {
        if (live.current.scope?.data) throw Error(scope.code ?? 'read_failed');
        dispatch({ type: 'ready', generation, route, scope, inventory: null, detail: null, document: null });
        return;
      }
      let removed = false;
      if (requested.view === 'document' && scope.data.kind !== 'work' && scope.data.kind !== 'runs') {
        if (!('run' in scope.data) || !scope.data.run || scope.data.run.run_id !== route.runId) throw Error('dto_invalid');
        const shown = displayed?.data;
        if (review && shown && scope.target.target_id === displayed.target.target_id
          && shown.resource.run_id === requested.runId && shown.resource.registered_reference === requested.resourcePath) {
          const replacement = scope.data.run.document_states?.find(row =>
            row.type === shown.resource.type && row.registered_reference === shown.resource.registered_reference);
          if (replacement?.content_digest !== shown.content_digest) {
            dispatch({ type: 'ready', generation, route, scope, inventory: null,
              detail: { ...scope, data: scope.data.run }, document: displayed });
            return;
          }
        }
        let resource = scope.data.run.resources.find(r => refresh
          ? r.registered_reference === route.resourcePath : r.resource_id === route.resourceId);
        if (!resource) {
          if (observed) throw Error('source_changed');
          route = { view: 'detail', runId: route.runId }; removed = true;
        }
        else {
          const readDocument = (selected: Resource, binding: Envelope<ReadingScope>) =>
            read<ReadingScope>(`/api/documents/${selected.resource_id}?snapshot=${binding.snapshot_id}`, controller.signal,
              { target: binding.target.target_id, snapshot: binding.snapshot_id!, replacement: true });
          try {
            scope = await readDocument(resource, scope);
            if (observed && !scope.data) throw Error(scope.code ?? 'read_failed');
          } catch (error) {
            if (controller.signal.aborted || generation !== sequence.current) return;
            const code = error instanceof Error && error.message in knownErrors ? error.message : 'read_failed';
            if (!observed?.recoverBinding || !['resource_denied', 'read_failed'].includes(code)) throw error;
            // Another capture can retire the panel's selectors during host expansion.
            // Rebind once and only read the same registered bytes for the same decision.
            const fresh = await read<ReadingScope>(`/api/snapshot?run_id=${requested.runId}`, controller.signal, expected);
            if (controller.signal.aborted || generation !== sequence.current) return;
            const run = fresh.data?.kind === 'run' ? fresh.data.run : null;
            const source = run && fresh.state === 'available' && fresh.snapshot_id ? companionSource(run, fresh.target.target_id, !detailHasMismatch(run)) : null;
            if (!source || fresh.target.target_id !== observed.target || run?.revision_id !== observed.revision
              || source.decision !== observed.decision || source.key !== sourceKey(observed.target, observed.resource, observed.digest)
              || source.resource.path !== observed.resource.path) throw Error(fresh.code ?? 'source_changed');
            resource = source.resource;
            scope = await readDocument(resource, fresh);
          }
          if (controller.signal.aborted || generation !== sequence.current) return;
          if (!scope.data || scope.data.kind !== 'document' || scope.data.run.run_id !== route.runId) throw Error(scope.code ?? 'dto_invalid');
          if (observed) {
            const document = scope.data.document;
            if (scope.state !== 'available' || !document || document.content === undefined) throw Error(scope.code ?? 'document_missing');
            if (scope.target.target_id !== observed.target || scope.data.run.revision_id !== observed.revision
              || document.resource.run_id !== observed.resource.run_id || document.resource.type !== observed.resource.type
              || document.resource.registered_reference !== observed.resource.registered_reference || document.resource.path !== observed.resource.path
              || document.resource.status !== observed.resource.status
              || document.content_digest !== observed.digest
              || observed.decision && companionSource(scope.data.run, scope.target.target_id, true)?.decision !== observed.decision) throw Error('source_changed');
          }
          if (!scope.data.document) { route = { view: 'detail', runId: route.runId }; removed = true; }
          else {
            if (scope.data.document.resource.type !== resource.type || scope.data.document.resource.registered_reference !== resource.registered_reference) throw Error('dto_invalid');
            route = { ...route, resourceId: scope.data.document.resource.resource_id, resourcePath: resource.registered_reference };
          }
        }
      }
      const data = scope.data;
      if (data.kind === 'work' || data.kind === 'runs') {
        if (requested.runId && (!data.removed_run_id || data.removed_run_id !== requested.runId
          || live.current.detail?.data?.run_id !== requested.runId || !live.current.detail.data.evaluation)) throw Error('dto_invalid');
        if (data.removed_run_id && data.removed_run_id !== requested.runId) throw Error('dto_invalid');
        removed = !!data.removed_run_id; route = { view: 'overview' };
      }
      else if (!data.run && data.kind === 'run') {
        if (data.requested_run_id !== requested.runId) throw Error('dto_invalid');
      } else if (data.run?.run_id !== requested.runId) throw Error('dto_invalid');
      const inventory = data.kind === 'work' || data.kind === 'runs' ? { ...scope, data } as Envelope<OverviewInventory> : null;
      const detail = data.kind !== 'work' && data.kind !== 'runs' && data.run ? { ...scope, data: data.run } as Envelope<Detail> : null;
      const document = data.kind === 'document' && data.document ? { ...scope, data: data.document } as Envelope<DocumentData> : null;
      const retained = restore.current;
      if (retained && (scope.target.target_id !== retained.target || detail?.data?.run_id !== retained.runId
        || detail?.data?.revision_id !== retained.revision || document?.state !== 'available'
        || document.data?.resource.registered_reference !== retained.path || document.data.resource.type !== retained.type
        || document.data.content_digest !== retained.digest)) {
        restore.current = null;
        if (checkpoint) checkpoint.current = null;
        setReviewNotice('Die bisherige Fassung konnte nicht bestätigt werden. Öffne die aktuelle Prüfung erneut.');
        dispatch({ type: 'ready', generation, route: { view: 'detail', runId: requested.runId }, scope, inventory: null, detail, document: null });
        return;
      }
      dispatch({ type: 'ready', generation, route: companionRead ? { view: 'detail', runId: requested.runId } : route, scope, inventory, detail, document: companionRead ? null : document, removed });
      return observed && document && detail ? { generation, capture: { document, detail } } : undefined;
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: 'error', generation, code: error instanceof Error && error.message in knownErrors ? error.message : 'read_failed',
        ...(observed && { recoverRoute: { view: 'detail' as const, runId: observed.resource.run_id } }) });
    }
  }, [read, handoff, checkpoint, !!review]);
  const draftAction = useDraftCheck({ live, read, visible: cardVisible, pending: draftPending, handoff,
    before: () => { freshnessPending.current?.abort(); },
    commit: (scope, original) => {
      if (!scope.data || scope.data.kind !== 'run' || !scope.data.run || !original.scope?.snapshot_id) return;
      capturePosition(original.generation); focusAfterRead.current = false;
      const action = { type: 'draft-check' as const, generation: original.generation, snapshot: original.scope.snapshot_id,
        scope, detail: { ...scope, data: scope.data.run } as Envelope<Detail> };
      live.current = readingReducer(live.current, action); dispatch(action);
    },
  });
  useEffect(() => { if (enabled) void navigate(initialRoute, true); return () => pending.current?.abort(); }, [navigate, enabled, initialRoute]);
  useLayoutEffect(() => {
    if (state.phase !== 'ready' || state.refreshing) return;
    const position = readingPosition.current;
    if (position?.generation === state.generation) {
      readingPosition.current = null;
      const root = workspace.current ?? heading.current?.closest('.compact-cockpit');
      for (const element of root?.querySelectorAll('details') ?? []) (element as HTMLDetailsElement).open = position.open.includes(disclosureKey(element));
      for (const { element, top, left } of position.scroll) { element.scrollTop = top; element.scrollLeft = left; }
      if (window.scrollX !== position.x || window.scrollY !== position.y) window.scrollTo(position.x, position.y);
      const resource = position.resource && state.detail?.data?.resources.find(r => r.type === position.resource!.type && r.registered_reference === position.resource!.reference);
      const focusId = resource ? position.resource!.prefix + resource.resource_id : position.focus;
      const focus = [...(root?.querySelectorAll<HTMLElement>('[data-focus-id]') ?? [])].find(e => e.dataset.focusId === focusId);
      const active = document.activeElement;
      // Background reads must not undo a user's focus movement while awaiting IO.
      if (active === position.activeElement || !active || active === document.body || !active.isConnected) focus?.focus({ preventScroll: true });
    }
    if (!focusAfterRead.current) return;
    let origin = returnFocus.current; returnFocus.current = null;
    if (returnSource.current) {
      const binding = returnSource.current; returnSource.current = null;
      const resource = state.detail?.data?.resources.find(r => r.type === binding.type && r.registered_reference === binding.reference);
      if (resource) origin = binding.prefix + resource.resource_id;
    }
    const focusTargets = state.route.view === 'overview' ? '.undertaking-list .run-link[data-focus-id]' : '[data-focus-id]';
    const control = origin ? [...document.querySelectorAll<HTMLElement>(focusTargets)].find(e => e.dataset.focusId === origin && !(e instanceof HTMLButtonElement && e.disabled)) : null;
    if (origin && !control && state.route.view === 'overview' && state.inventory?.data) {
      const exists = state.inventory.data.kind === 'runs' ? state.inventory.data.runs.some(entry => entry.run_id === origin) : state.inventory.data.entries.some(entry => entry.key === origin);
      setBacklogReturnNotice(exists
        ? 'Das Vorhaben liegt außerhalb des aktuellen Ausschnitts oder ist nicht auswählbar. Suche anpassen oder die Übersicht vergrößern.'
        : 'Das zuvor geöffnete Vorhaben ist nicht mehr im gelesenen Bestand enthalten.');
    }
    const fallback = state.route.view === 'overview' ? document.querySelector<HTMLElement>('[data-focus-id="backlog-heading"]')
      : state.route.view === 'detail' && origin?.startsWith('companion:') ? document.querySelector<HTMLElement>('[data-focus-id="companion-run-heading"]') : null;
    // Returning to an inspected source must restore a visible focus target, even when
    // the newly mounted summary starts with closed disclosures.
    if (control) for (let parent = control.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    (control ?? fallback ?? heading.current)?.focus();
  }, [state.phase, state.route, state.refreshing, state.generation, state.scope]);
  // Activity outside the control files appears only while a shown Codex step waits for the agent;
  // every other view keeps the regular freshness interval.
  const watchActivity = host === 'codex' && compact && state.route.view === 'detail'
    && state.detail?.data?.evaluation?.next_operation?.actor === 'agent';
  useEffect(() => {
    const justShown = cardVisible && !wasCardVisible.current; wasCardVisible.current = cardVisible;
    const snapshot = state.scope?.snapshot_id;
    if (!snapshot || state.stale || state.phase !== 'ready' || !cardVisible || draftAction.busy) return;
    if (review) {
      const target = state.scope!.target.target_id;
      const controller = new AbortController();
      let restart: ReturnType<typeof setTimeout> | undefined;
      let waiting: AbortController | null = null;
      const schedule = () => {
        window.clearTimeout(restart);
        if (!controller.signal.aborted && !document.hidden) restart = window.setTimeout(() => { void listen(); }, 250);
      };
      const refresh = () => { void navigate(live.current.route, true, true); };
      const listen = async () => {
        if (controller.signal.aborted || document.hidden || waiting) return;
        if (contextPending.current || draftPending.current) { schedule(); return; }
        if (!read.waitForChanges) { setUnavailableObservation(snapshot); return; }
        const request = new AbortController(), generation = sequence.current;
        waiting = request; freshnessPending.current = request;
        const current = () => !controller.signal.aborted && !document.hidden && generation === sequence.current;
        try {
          const result = await read.waitForChanges(snapshot, request.signal, target);
          if (!current() || request.signal.aborted) return;
          if (result.code || typeof result.data?.changed !== 'boolean') throw Error('observation_unavailable');
          setUnavailableObservation(null);
          if (result.data.changed) refresh();
          else schedule();
        } catch {
          if (current() && !request.signal.aborted) setUnavailableObservation(snapshot);
        } finally {
          if (waiting === request) waiting = null;
          if (freshnessPending.current === request) freshnessPending.current = null;
          if (request.signal.aborted && current()) schedule();
        }
      };
      const visibility = () => {
        void handoff?.invalidate();
        waiting?.abort(); window.clearTimeout(restart);
        if (!document.hidden) refresh();
      };
      document.addEventListener('visibilitychange', visibility);
      if (justShown && !document.hidden) refresh(); else void listen();
      return () => {
        controller.abort(); waiting?.abort(); window.clearTimeout(restart);
        document.removeEventListener('visibilitychange', visibility);
      };
    }
    let checking = false; const controller = new AbortController();
    const check = async () => {
      if (document.hidden || checking || draftPending.current || contextPending.current) return; checking = true;
      const generation = sequence.current;
      try {
        const request = new AbortController(); freshnessPending.current = request;
        const cancel = () => request.abort(); controller.signal.addEventListener('abort', cancel, { once: true });
        let result;
        try { result = await read('/api/freshness?snapshot=' + snapshot, request.signal, { target: state.scope!.target.target_id, snapshot }); }
        catch (error) { if (request.signal.aborted) return; throw error; }
        finally { controller.signal.removeEventListener('abort', cancel); if (freshnessPending.current === request) freshnessPending.current = null; }
        if (request.signal.aborted || controller.signal.aborted || generation !== sequence.current || document.hidden) return;
        if (result.code === 'source_changed' && live.current.route.view === 'detail') void navigate(live.current.route, true, true);
        else if (result.code) { void handoff?.invalidate(); dispatch({ type: 'stale', snapshot, code: result.code }); }
        else if (host === 'codex' && compact) {
          // An unchanged observation keeps its state, so a quiet poll does not redraw the Cockpit.
          const activity = result.companion_observation?.activity;
          const unknown = result.companion_observation?.liveness === 'unknown';
          setCompanionRefresh(previous => previous?.snapshot === snapshot && previous.generation === generation
            && sameActivity(previous.activity, activity) && previous.unknown === unknown ? previous : { snapshot, generation, activity, unknown });
        }
      } catch (error) {
        if (!controller.signal.aborted && generation === sequence.current) {
          const code = error instanceof Error && error.message === 'session_expired' ? error.message : 'read_failed';
          void handoff?.invalidate();
          dispatch({ type: 'stale', snapshot, code });
        }
      }
      finally { checking = false; }
    };
    let waiting: AbortController | null = null;
    const listen = async () => {
      if (!read.waitForChanges || document.hidden || controller.signal.aborted || waiting || contextPending.current) return;
      waiting = new AbortController(); const request = waiting, generation = sequence.current;
      try {
        const result = await read.waitForChanges(snapshot, request.signal, state.scope!.target.target_id);
        if (!request.signal.aborted && !controller.signal.aborted && generation === sequence.current && !document.hidden) {
          if (!result.data || typeof result.data.changed !== 'boolean') return;
          if (result.data.changed && !contextPending.current) await check();
        }
      } catch { return; /* Hosts without this operation keep the freshness fallback. */ }
      finally { if (waiting === request) waiting = null; }
      if (!controller.signal.aborted && !document.hidden && generation === sequence.current) {
        // Bound retries also prevent a fast unsupported response from spinning.
        restart = window.setTimeout(() => { void listen(); }, 250);
      }
    };
    let restart: ReturnType<typeof setTimeout> | undefined;
    const visibility = () => {
      void handoff?.invalidate(); waiting?.abort(); window.clearTimeout(restart);
      if (!document.hidden) { void check(); restart = window.setTimeout(() => { void listen(); }, 250); }
    };
    const timer = window.setInterval(check, watchActivity ? 2000 : 5000); document.addEventListener('visibilitychange', visibility);
    if (justShown) void check();
    void listen();
    return () => { window.clearInterval(timer); window.clearTimeout(restart); waiting?.abort(); controller.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [state.scope, state.stale, state.phase, watchActivity, read, navigate, host, compact, cardVisible, handoff, draftAction.busy, !!review]);
  useEffect(() => () => { void handoff?.invalidate(); }, [handoff]);
  const recordReviewPosition = useCallback(() => {
    const value = live.current, doc = value.document?.data, run = value.detail?.data, root = reviewRoot.current;
    if (!checkpoint || !root || value.phase !== 'ready' || value.stale || value.document?.state !== 'available'
      || !doc?.content_digest || !run?.revision_id || run.run_id !== doc.resource.run_id) return;
    const anchor = captureReviewAnchor(root);
    checkpoint.current = { target: value.document.target.target_id, runId: run.run_id, revision: run.revision_id,
      path: doc.resource.registered_reference, type: doc.resource.type, digest: doc.content_digest, ...(anchor ? { anchor } : {}) };
  }, [checkpoint]);
  useEffect(() => {
    if (!review || review.role === 'card') return;
    window.addEventListener('scroll', recordReviewPosition, { passive: true });
    return () => window.removeEventListener('scroll', recordReviewPosition);
  }, [review?.role, recordReviewPosition]);
  useLayoutEffect(() => {
    if (!review || review.role === 'card' || state.phase !== 'ready' || state.stale || !reviewRoot.current || !state.document) return;
    const retained = restore.current;
    if (retained) {
      restore.current = null;
      if (!retained.anchor || !restoreReviewAnchor(reviewRoot.current, retained.anchor))
        setReviewNotice('Die vorherige Lesestelle ist nicht verfügbar. Die bestätigte Fassung beginnt hier.');
    } else if (checkpoint?.current?.anchor && checkpoint.current.digest === state.document.data?.content_digest
      && checkpoint.current.runId === state.route.runId && checkpoint.current.revision === state.detail?.data?.revision_id
      && checkpoint.current.path === state.document.data?.resource.registered_reference) restoreReviewAnchor(reviewRoot.current, checkpoint.current.anchor);
    recordReviewPosition();
  }, [review?.role, state.phase, state.stale, state.document, state.route.runId, checkpoint, recordReviewPosition]);
  const open = (resource: Resource, origin = resource.resource_id) => {
    restore.current = null;
    if (checkpoint) checkpoint.current = null;
    setReviewNotice('');
    const list = workspace.current?.querySelector<HTMLElement>('#backlog-list');
    returnListScroll.current = list?.scrollTop ?? null;
    documentOrigin.current = origin;
    returnSource.current = null;
    // A draft check may already have replaced the server capture before cancellation.
    void navigate({ view: 'document', runId: resource.run_id, resourceId: resource.resource_id, resourcePath: resource.registered_reference }, !!draftPending.current);
  };
  const showOverview = () => {
    setBacklogReturnNotice(null);
    if (checkpoint) checkpoint.current = null;
    returnFocus.current = state.route.runId ?? null;
    void navigate({ view: 'overview' });
  };
  const showRun = async () => {
    const generation = sequence.current;
    if (generation !== sequence.current) return;
    returnFocus.current = documentOrigin.current ?? state.route.resourceId ?? null;
    const resource = state.document?.data?.resource;
    if (resource) returnSource.current = { type: resource.type, reference: resource.registered_reference,
      prefix: documentOrigin.current?.includes(':') ? documentOrigin.current.slice(0, documentOrigin.current.indexOf(':') + 1) : '' };
    void navigate({ view: 'detail', runId: state.route.runId }, state.stale);
  };
  const documentVisible = state.route.view === 'document';
  const returningToCompanion = documentVisible && documentOrigin.current?.startsWith('companion:');
  const splitView = !compact && wideWorkspace && !!overviewSnapshot && !documentVisible;
  useLayoutEffect(() => {
    if (!splitView || state.phase !== 'ready' || returnListScroll.current === null) return;
    const list = workspace.current?.querySelector<HTMLElement>('#backlog-list');
    if (list) { list.scrollTop = returnListScroll.current; returnListScroll.current = null; }
  }, [splitView, state.phase]);
  const status = readingStatus(state);
  const renderedGeneration = state.generation;
  const expired = hasExpiredSession(state), reloadRoute = state.requestedRoute ?? state.route;
  const pinnedDocument = state.route.view === 'document' && !!state.document && state.document.snapshot_id !== state.scope?.snapshot_id;
  const observationNotice = unavailableObservation && state.scope?.snapshot_id === unavailableObservation ? <>
    <p role="status">Live-Status nicht verfügbar. Der zuletzt gelesene Stand bleibt sichtbar.</p>
    <button type="button" onClick={() => void navigate(reloadRoute, true, true)}>Live-Status erneut prüfen</button>
  </> : null;
  const runTitle = state.detail?.data?.title ?? state.route.runId;
  const pageTitle = state.route.view === 'overview' ? 'Arbeit am Projekt' : runTitle ?? (documentVisible ? documentName(state.document?.data?.resource.type) : 'Run verstehen');
  const detail = state.detail?.data;
  const selectedSituation = detail?.evaluation && state.route.view === 'detail' && detail.run_id === state.route.runId
    && state.detail?.state === 'available' && state.phase === 'ready' && !state.refreshing && !state.stale && !state.problem && !expired
    ? projectWorkSituation({ assessment: observedAssessment(detail, true), gate: detail.evaluation.current_gate,
      blockingReason: detail.evaluation.blocking_reason, missingApproval: detail.evaluation.missing_approval, closureOutcome: detail.closure?.outcome }) : undefined;
  const sourceEntry = overviewSnapshot?.data?.kind === 'work' && detail
    ? overviewSnapshot.data.entries.find(row => row.kind === 'run' && row.key === detail.run_id) : undefined;
  const observedFocusGate = detail && state.detail?.state === 'available' && !detailHasMismatch(detail) ? focusSituation(detail, true).gate : null;
  const focusGate = !state.stale && !state.problem && state.phase === 'ready' ? observedFocusGate : null;
  const draftSource = detail?.draft_check?.source;
  const draftDisplay = detail?.draft_check?.display.state;
  const focusedDraft = !!observedFocusGate && draftSource?.gate === observedFocusGate;
  const sourcePending = draftAction.busy || !!(focusedDraft && draftSource?.available && (draftAction.invalidated
    || draftDisplay === 'unchecked' && !draftAction.problem && cardVisible && !document.hidden));
  const loadCompanionSource = useCallback(async (source: CompanionSource, automatic: boolean, recoverBinding: boolean) => {
    const active = live.current, scope = active.scope, revision = active.detail?.data?.revision_id;
    if (!revision || !scope?.snapshot_id || draftPending.current || active.phase !== 'ready' || active.stale || active.problem
      || active.route.view !== 'detail' || active.route.runId !== source.resource.run_id
      || !active.detail?.data?.resources.includes(source.resource)) return;
    const result = await navigate({ view: 'document', runId: source.resource.run_id, resourceId: source.resource.resource_id,
      resourcePath: source.resource.registered_reference }, false, automatic,
      { target: scope.target.target_id, snapshot: scope.snapshot_id, revision, resource: source.resource, digest: source.digest, decision: source.decision, recoverBinding }, true);
    return result?.capture;
  }, [navigate]);
  const reader = useCompanionReader({ state, enabled: host === 'codex' && compact, visible: cardVisible, wide: companionWide, sourcePending, load: loadCompanionSource });
  const companionVisible = cardVisible && (!reader.open || companionWide);
  const openCompanionSource = (resource: Resource, digest: string) => {
    const source = reader.offered;
    if (source && source.resource === resource && source.digest === digest) void reader.openSource(source);
  };
  const currentCompanion = host === 'codex' && compact && enabled && companionVisible && state.route.view === 'detail'
    && !!state.scope?.data && !state.requestedRoute && state.phase === 'ready' && !state.refreshing && !state.stale && !state.problem && !expired
    && state.detail?.state === 'available' && detail && detail.run_id === state.route.runId
    ? companionDecision(detail, !detailHasMismatch(detail)) : null;
  const soundScope = currentCompanion && currentCompanion.assessment !== 'unconfirmed'
    ? JSON.stringify([state.scope?.target.target_id, detail?.run_id]) : null;
  const decisionMaterial = detail?.companion?.decision_material_version;
  const { sound, onToggleSound, silenceNextSelection } = useCompanionSound(soundScope, currentCompanion?.human && decisionMaterial
    ? JSON.stringify([detail?.evaluation?.current_gate, decisionMaterial]) : null);
  const activeRunIds = detail?.active_run_ids ?? [];
  const runIndex = detail?.lifecycle === 'active' ? activeRunIds.indexOf(detail.run_id) : -1;
  const browseRun = (runId: string, focusId?: string) => {
    if (runId === state.route.runId || state.phase === 'loading' || state.refreshing) return;
    reader.savePosition();
    silenceNextSelection();
    returnFocus.current = focusId ?? null;
    // A background draft check can already have replaced the old selector on the server.
    void navigate({ view: 'detail', runId }, true);
  };
  const onStepRun = (offset: -1 | 1) => {
    if (runIndex < 0 || activeRunIds.length < 2 || state.phase !== 'ready' || state.requestedRoute || state.stale || state.problem) return;
    const nextRun = activeRunIds[(runIndex + offset + activeRunIds.length) % activeRunIds.length];
    browseRun(nextRun, offset === 1 ? 'companion-next-run' : 'companion-previous-run');
  };
  const chatRunId = companionFallback ? undefined : initialRoute.runId;
  const onReturnToChatRun = chatRunId && state.route.runId !== chatRunId ? () => browseRun(chatRunId) : undefined;
  const draftBinding = draftSource?.available && JSON.stringify([draftSource.run_id, draftSource.gate, draftSource.revision_id, draftSource.artifact_digest]);
  const refreshedChangedDraft = useRef<string | null>(null);
  useEffect(() => {
    if (!focusGate || !focusedDraft || !draftBinding || !cardVisible) return;
    const sourceChanged = draftAction.problem === 'source_changed' && refreshedChangedDraft.current !== draftBinding;
    if (!draftAction.invalidated && !sourceChanged) return;
    const refreshDraft = () => {
      const active = live.current;
      if (document.hidden || active.phase !== 'ready' || active.stale || active.requestedRoute) return;
      if (sourceChanged) refreshedChangedDraft.current = draftBinding;
      void navigate(active.route, true, true);
    };
    refreshDraft();
    document.addEventListener('visibilitychange', refreshDraft);
    return () => document.removeEventListener('visibilitychange', refreshDraft);
  }, [focusGate, focusedDraft, draftBinding, cardVisible, draftAction.invalidated, draftAction.problem, navigate]);
  // Attempt once for each selected source capture; technical failures need a deliberate retry.
  const autoChecked = useRef<string | null>(null);
  useEffect(() => {
    if (!focusGate || !cardVisible || state.route.view !== 'detail' || state.phase !== 'ready' || state.stale || state.problem
      || draftAction.invalidated || draftAction.busy || draftAction.problem || document.hidden
      || !draftSource?.available || draftSource.gate !== focusGate || draftDisplay !== 'unchecked' || !state.scope?.snapshot_id) return;
    const key = JSON.stringify([state.generation, draftSource.run_id, draftSource.gate, draftSource.revision_id, draftSource.artifact_digest]);
    if (autoChecked.current === key) return;
    autoChecked.current = key;
    void draftAction.check();
  }, [focusGate, cardVisible, state.route.view, state.phase, state.stale, state.problem, state.generation,
    state.scope?.snapshot_id, draftSource?.available, draftSource?.gate, draftSource?.run_id, draftSource?.revision_id,
    draftSource?.artifact_digest, draftDisplay, draftAction.invalidated, draftAction.busy, draftAction.problem]);
  const technicalContext = state.detail && state.route.view !== 'overview' && <ContextPanel key={`${state.route.runId}:${state.route.resourcePath ?? 'run'}`} read={read} beforeRead={beforeContextRead} onScope={value => {
        if (draftPending.current || state.scope?.snapshot_id !== live.current.scope?.snapshot_id || renderedGeneration !== sequence.current || value.data?.kind !== 'context' || value.data.run.run_id !== live.current.route.runId) return;
        // A successful context scope can have no graph nodes or unavailable refs.
        // Core returns this kind only after reading the selected Run/document.
        const selected = value.code === null && ['available', 'empty', 'partial'].includes(value.state)
          ? { ...value, state: 'available' as const } : value;
        const parent = { ...selected, data: value.data.run } as Envelope<Detail>;
        const doc = value.data.document ? { ...selected, data: value.data.document } as Envelope<DocumentData> : null;
        dispatch({ type: 'ready', generation: sequence.current, route: { ...live.current.route, resourceId: doc?.data?.resource.resource_id }, scope: value, inventory: null, detail: parent, document: doc });
      }} detail={state.detail} document={state.route.view === 'document' ? state.document : null} disabled={expired || pinnedDocument || state.stale || state.phase !== 'ready' || draftAction.busy} handoff={handoff}/>;
  const pageHeader = <div className={`page-title${documentVisible ? ' page-title--document' : ''}${state.route.view !== 'overview' ? ' page-title--run' : ''}`}><div>{state.route.view === 'detail' && detail && <WorkStandLabel data={detail} current={enabled && !expired && state.phase === 'ready' && !state.refreshing && !state.stale && !state.problem && state.detail?.state === 'available'} stale={state.stale && !state.refreshing && state.phase !== 'loading'} reopen={expired || state.problem === 'session_invalid' || state.scope?.code === 'session_invalid'}/>}{splitView && state.route.view === 'detail' ? <h2 ref={heading} tabIndex={-1}>{pageTitle}</h2> : <h1 ref={heading} tabIndex={-1}>{pageTitle}</h1>}{state.route.view !== 'overview' && state.detail?.data && <p className="run-header-meta">{label(state.detail.data.lifecycle)}{state.scope?.observed_as_of && <> · Stand {new Date(state.scope.observed_as_of).toLocaleString('de-DE')}</>}</p>}{state.route.view === 'overview' && <p className="overview-repository"><span>Repository</span> <code>{state.scope?.target.display_path ?? 'Noch nicht verfügbar'}</code></p>}</div>
        {state.route.view === 'overview' && state.inventory?.data && <OverviewFigure/>}
        {state.route.view !== 'overview' && state.detail?.data && !detailHasMismatch(state.detail.data) && <RunFigure state={state} enabled={enabled}/>}
      </div>;
  const readingContent = <>
      {!documentVisible && pageHeader}
      {!enabled && <ReadState state="blocked" code="session_invalid"/>}
      {state.route.view === 'overview' && backlogReturnNotice && <p role="status">{backlogReturnNotice}</p>}
      <ReadingFeedback state={state} backlogHintsInView={state.route.view === 'overview' && !!state.inventory?.data}/>
      {(state.phase === 'error' || state.scope?.retryable && !state.scope.data) && enabled && !expired && <button className="retry" onClick={() => void navigate(reloadRoute, true)}>Wiederholen</button>}
      <div className={`reading-results${state.phase === 'loading' ? ' previous-content' : ''}`} aria-busy={state.phase === 'loading'}>
        {state.inventory?.data && state.route.view === 'overview' && <Overview result={state.inventory} current={state.phase === 'ready' && !state.stale && !state.problem} view={backlogView} onViewChange={setWorkView} onSelect={id => void navigate({ view: 'detail', runId: id })}
          loadArchive={loadArchive} loadPlanned={(rowId, signal) => read(`/api/planned/${rowId}?snapshot=${state.inventory!.snapshot_id}`, signal, { target: state.inventory!.target.target_id, snapshot: state.inventory!.snapshot_id! })}/>}
        {state.detail && state.route.view === 'detail' && <RunDetail sourceEntry={sourceEntry} technicalView={technicalView} onOpenTechnical={() => setTechnicalView(true)} onBackFromTechnical={() => setTechnicalView(false)} result={state.detail} onOpen={open} read={read} technicalContext={<>{state.scope && <details className="provenance-details"><summary>Datenstand und Herkunft</summary><div className="provenance"><div><span>Repository</span><code>{state.scope.target.display_path}</code></div><div><span>Beobachtet</span><time>{state.scope.observed_as_of ?? 'Nicht verfügbar'}</time></div><div><span>Datenstand</span><code>{state.scope.snapshot_id}</code></div></div></details>}{technicalContext}</>} draftCheck={<DraftCheck inline={focusedDraft} result={state.detail} action={draftAction} current={!state.stale && !state.problem && state.phase === 'ready' && !draftAction.invalidated} onReload={() => void navigate(reloadRoute, true, focusedDraft)}/>} current={!state.stale && !state.problem && state.phase === 'ready'}/>}
        {state.document && state.route.view === 'document' && <DocumentView simple result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={runTitle} onOpen={id => { const resource = state.detail?.data?.resources.find(r => r.resource_id === id); if (resource) open(resource); }}/>}</div>
      {state.route.view === 'document' && technicalContext}

  </>;
  const selected = state.detail?.data;
  if (review && selected && state.route.view !== 'overview') {
    const ready = enabled && !expired && !state.stale && !state.problem && state.phase === 'ready' && state.detail?.state === 'available';
    const source = selected.resources.find(resource => resource.run_id === selected.run_id
      && resource.status === 'registered' && resource.type === selected.evaluation?.current_gate);
    const blocker = reviewBlocker(selected, ready);
    const task = blocker ?? reviewTask(selected, ready, !!source);
    const document = (ready || pinnedDocument) && state.document?.state === 'available' ? state.document.data : null;
    const newer = pinnedDocument && document ? selected.document_states?.find(row => row.type === document.resource.type
      && row.registered_reference === document.resource.registered_reference && row.source_state === 'available'
      && row.content_digest && row.content_digest !== document.content_digest) : null;
    const version = document?.document_state?.version_kind;
    const reviewSource = ready && !blocker && source && (!document || document.resource.resource_id === source.resource_id) ? source : null;
    const reviewVersion = selected.document_states?.find(row => row.resource_id === reviewSource?.resource_id
      && row.source_state === 'available')?.version_kind;
    const taskText = <p className="review-task" role={blocker ? 'status' : undefined}>{task}</p>;
    const openReview = () => {
      if (!ready) return;
      if (blocker) {
        void review.show('workspace');
        return;
      }
      if (!document && source) open(source);
      void review.show('reader');
    };
    const card = review.role === 'card';
    const positionNotice = reviewNotice || (review.openedExpanded && !hadCheckpointOnOpen ? newReviewPositionNotice() : '');
    return <section className={card ? 'compact-cockpit agdf-surface' : 'review-reader agdf-surface'} data-role={review.role}
      ref={reviewRoot} onScrollCapture={recordReviewPosition} aria-label={card ? 'AGDF Cockpit' : 'AGDF Prüfung'}>
      <ReviewHeader title={selected.title || selected.objective || 'Vorhaben ohne Titel'} headingRef={heading} role={review.role}/>
      {card ? <>
      <div className="review-task-card" data-blocked={!!blocker}>
        {reviewSource && <p className="review-task-meta">{documentName(reviewSource.type)}{
          reviewVersion === 'approved' ? ' · Freigegebene Fassung' : reviewVersion === 'draft' ? ' · Entwurf' : ''
        }</p>}
        {taskText}
        <ReadingFeedback state={state}/>
        {observationNotice}
        {reviewNotice && <p role="status">{reviewNotice}</p>}
        {ready ? <button type="button" className="primary" onClick={openReview}>{!blocker && (source || document) ? 'Prüfung öffnen' : 'Arbeitsstand ansehen'}</button>
          : !expired && <button type="button" disabled={state.phase === 'loading'} onClick={() => void navigate(reloadRoute, true)}>Daten erneut prüfen</button>}
      </div>
      <details><summary>Weitere Optionen</summary><button type="button" onClick={showOverview} disabled={expired}>Alle Vorhaben</button>
        <RefreshControl state={state} enabled={enabled} onReload={() => void navigate(reloadRoute, true)}/>
        <p>Run <code>{selected.run_id}</code></p></details>
      </> : <>
      {taskText}
      <ReviewControls view={review}/>
      <ReadingFeedback state={state}/>
      {observationNotice}
      {pinnedDocument && <p role="status">{newer ? 'Eine neuere Fassung ist verfügbar.' : 'Die aktuelle Fassung ist nicht verfügbar.'}
        {newer && <button type="button" onClick={() => void navigate(state.route, true)}>Neuere Fassung öffnen</button>}
      </p>}
      {positionNotice && <p role="status">{positionNotice}</p>}
      {document && typeof document.content === 'string' ? <>
        <div className="review-source"><strong>{documentName(document.resource.type)}</strong> · <span>{
          version === 'approved' ? 'Freigegebene Fassung' : version === 'draft' ? 'Entwurf' : 'Gelesene Fassung'
        }</span>
          <details><summary>Quellenangaben</summary><code>{document.resource.registered_reference}</code>
            <p>Revision <code>{document.document_state?.revision_id ?? (pinnedDocument ? null : selected.revision_id)}</code></p><p>Prüfsumme <code>{document.content_digest}</code></p></details>
        </div>
        <article className="document" data-review-source>{document.format === 'markdown'
          ? <PassiveMarkdown content={document.content} links={document.links ?? {}} onOpen={id => {
            const item = !pinnedDocument && selected.resources.find(r => r.resource_id === id); if (item) open(item);
          }}/> : <pre>{document.content}</pre>}</article>
      </> : ready && source ? <button type="button" className="primary" onClick={() => open(source)}>{reviewNotice ? 'Aktuelle Quelle öffnen' : documentName(source.type) + ' öffnen'}</button>
        : ready && !source ? <p role="status">Für diesen Schritt liegt kein registriertes Dokument zur Prüfung vor.</p>
        : !expired && state.phase !== 'loading' && <button type="button" onClick={() => void navigate(reloadRoute, true)}>Wiederholen</button>}
      </>}
      <div hidden={review.role !== 'workspace'}>
        <details><summary>Nachweise</summary><FlowEvidence data={selected} current={ready} onOpen={open}/></details>
        <details><summary>Verlauf</summary>
          {selected.evaluation?.approvals.map(row => <p key={row.gate}>{row.gate} · {row.status}</p>)}
          <p>Ein Fassungsvergleich ist in einer gebundenen Entscheidungsansicht verfügbar.</p></details>
        <details><summary>Arbeitsstand und Quellen</summary>
          <WorkStep data={selected} current={ready} onOpen={open} sourceDisabled={!ready}/>
          {state.route.view === 'detail' && state.detail && <DraftCheck result={state.detail} action={draftAction}
            current={ready && !draftAction.invalidated} onReload={() => void navigate(reloadRoute, true)}/>}
        </details>
        {technicalContext}
      </div>
    </section>;
  }
  const refreshed = companionRefresh?.snapshot === state.scope?.snapshot_id && companionRefresh?.generation === state.generation
    ? companionRefresh : null;
  if (compact) return <><CompactCockpit observationNotice={observationNotice} host={host}
    activity={refreshed ? refreshed.activity : state.scope?.companion_observation?.activity}
    activityUnknown={refreshed ? refreshed.unknown : state.scope?.companion_observation?.liveness === 'unknown'} companionEmpty={companionEmpty} onAbout={() => setAboutOpen(true)} sourceEntry={sourceEntry} visible={companionVisible} reader={reader} onReaderClose={() => {
      reader.close();
      void navigate({ view: 'detail', runId: state.route.runId }, state.stale, true);
    }} onReaderLink={id => {
      if (!reader.current || !detail || !state.scope) return;
      const original = reader.capture?.detail.data?.resources.find(r => r.resource_id === id);
      const resource = detail.resources.find(r => r.type === original?.type && r.registered_reference === original?.registered_reference);
      const row = detail.document_states?.find(r => r.resource_id === resource?.resource_id);
      if (!resource || !row?.content_digest) return;
      const source = resolveSource(detail, state.scope.target.target_id, sourceKey(state.scope.target.target_id, resource, row.content_digest));
      if (source) void reader.openSource(source);
    }} onReaderWidth={setCompanionWide} companionConstraints={companionConstraints} loadArchive={loadArchive} loadPlanned={(rowId, signal) => read(`/api/planned/${rowId}?snapshot=${state.inventory!.snapshot_id}`, signal, { target: state.inventory!.target.target_id, snapshot: state.inventory!.snapshot_id! })} draftCheck={state.detail && <DraftCheck automatic={!!focusGate && state.detail.data?.draft_check?.source.gate === focusGate} result={state.detail} action={draftAction} current={!state.stale && !state.problem && state.phase === 'ready' && !draftAction.invalidated} onReload={() => void navigate(reloadRoute, true)}/>} state={state} headingRef={heading} enabled={enabled}
    onSelect={id => void navigate({ view: 'detail', runId: id })}
    view={backlogView} onViewChange={setWorkView} returnNotice={backlogReturnNotice}
    onReload={() => void navigate(reloadRoute, true)} onOverview={showOverview} onRuns={() => void navigate({ view: 'overview' })}
    onOpen={(resource, origin) => { open(resource, origin); onExpand?.(); }} onOpenCompanion={openCompanionSource} onBack={showRun}
    onExpand={onExpand}
    motion={companionMotion} onToggleMotion={() => setCompanionMotion(motion => !motion)} sourcePending={sourcePending}
    sound={sound} onToggleSound={onToggleSound} activeRunCount={activeRunIds.length} runIndex={runIndex}
    onStepRun={onStepRun} onReturnToChatRun={onReturnToChatRun}/>{aboutOpen && <AboutCockpit onClose={closeAbout} provenance={provenance} host={host}/>}</>;
  return <div className="shell"><aside className="rail"><div className="brand"><BrandMark className="brand-mark"/><span>AGDF<small>Control Cockpit</small></span></div><div className="rail-label">Lokaler Arbeitsbereich</div><button className="nav-item" disabled={expired} onClick={() => void navigate({ view: 'overview' })}>▦ <span>Run-Übersicht</span></button><div className="rail-footer"><span className="live-dot"/> Lokale Sitzung<br/><small>Entscheidungen bleiben bei dir.</small></div></aside>
    <div className={`workspace${state.route.view === 'overview' || splitView ? ' workspace--overview' : ''}${documentVisible ? ' workspace--document' : ''}`} ref={workspace}><BrandHeader host={host} projectPath={state.scope?.target.display_path} contextTitle={documentVisible ? runTitle : undefined} variant={documentVisible ? 'document' : 'view'}>
      <button type="button" className="run-technical-toggle" aria-label="Über das Cockpit" title="Über das Cockpit" onClick={() => setAboutOpen(true)}><Icon name="info"/></button>
      <RefreshControl state={state} enabled={enabled} onReload={() => void navigate(reloadRoute, true)}/>
    </BrandHeader><main>
      {!splitView && state.route.view !== 'overview' && <nav className="breadcrumbs" aria-label="Vorhaben-Pfad"><ol>
        <li>{documentVisible ? <button onClick={showRun} disabled={expired || state.phase === 'loading'}><Icon name="back"/>{wideWorkspace && overviewSnapshot && !returningToCompanion ? 'Zurück zur Übersicht' : 'Zurück zur Statuskarte'}</button>
          : <button onClick={showOverview} disabled={expired || state.phase === 'loading'}><Icon name="back"/>Alle Vorhaben</button>}</li>
      </ol></nav>}
      {splitView ? <>
        <div className="page-title overview-project-heading"><div className="overview-project-identity"><div><h1 ref={state.route.view === 'overview' ? heading : undefined} tabIndex={-1}>Arbeit am Projekt</h1><p className="overview-repository"><span>Repository</span> <code>{overviewSnapshot?.target.display_path}</code></p></div><OverviewFigure/></div></div>
        <div className="overview-split reading-results">
          <div className="overview-split-list"><p className="overview-split-observation">Liste zuletzt geladen{overviewSnapshot?.observed_as_of ? ` · ${new Date(overviewSnapshot.observed_as_of).toLocaleString('de-DE')}` : ''}</p>
            <Overview result={overviewSnapshot!} current={!expired && enabled && state.phase === 'ready' && !state.problem && !state.stale}
              selectedId={state.requestedRoute?.runId ?? (state.route.view === 'detail' ? state.route.runId : undefined)}
              selectedTitle={state.phase === 'ready' && !state.problem && !state.stale && detail?.run_id === state.route.runId ? detail?.title : undefined}
              selectedSituation={selectedSituation}
              view={backlogView} onViewChange={next => { setWorkView(next); if (state.route.view === 'detail' && (next.section !== backlogView.section || next.section === 'runs' && next.lifecycle && next.lifecycle !== (detail?.lifecycle ?? 'unknown'))) void navigate({ view: 'overview' }); }}
              onSelect={id => { if (state.route.view !== 'detail' || state.route.runId !== id || state.stale) { if (detailViewport.current) detailViewport.current.scrollTop = 0; void navigate({ view: 'detail', runId: id }, true); } }}
              loadPlanned={state.route.view === 'overview' ? (rowId, signal) => read(`/api/planned/${rowId}?snapshot=${state.inventory!.snapshot_id}`, signal, { target: state.inventory!.target.target_id, snapshot: state.inventory!.snapshot_id! }) : undefined}
              loadArchive={state.route.view === 'overview' ? loadArchive : undefined}/>
          </div>
          <section ref={detailViewport} className="overview-split-detail" aria-label="Ausgewählte Anforderung" aria-busy={state.phase === 'loading'}>
            {state.phase === 'loading' ? <p role="status">Anforderung wird geladen …</p>
              : state.requestedRoute && state.problem ? <><ReadingFeedback state={state}/><button onClick={() => void navigate(state.requestedRoute!, true)}>Erneut laden</button></>
              : state.route.view === 'detail' && state.detail?.data?.run_id === state.route.runId ? readingContent
              : <p className="overview-split-empty">Wähle eine Anforderung, um ihren aktuellen Stand zu sehen.</p>}
          </section>
        </div>
      </> : documentVisible ? <><div className="document-page-header">{pageHeader}</div><section className="document-reading agdf-surface" aria-label="Dokument lesen">{readingContent}</section></> : readingContent}
      <footer className="cockpit-footer"><span>Lokale Beobachtung · {status.title}{status.previous && ' · Vorheriger Datenstand bleibt sichtbar'} · Das Cockpit verändert keine Kontrolldateien.</span></footer>
    </main></div>{aboutOpen && <AboutCockpit onClose={closeAbout} provenance={provenance} host={host}/>}</div>;
}
const knownErrors: Record<string, boolean> = Object.fromEntries(['source_changed', 'session_invalid', 'session_expired', 'resource_denied', 'document_missing', 'document_removed', 'document_unsupported', 'read_failed', 'busy', 'timeout', 'resource_limit', 'control_absent', 'dto_invalid', 'control_layout_unsupported', 'run_version_unsupported', 'control_invalid', 'run_missing', 'invalid_run'].map(c => [c, true]));
