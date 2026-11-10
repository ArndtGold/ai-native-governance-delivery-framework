import { useEffect, useLayoutEffect, useReducer, useRef, useCallback, useState } from 'react';
import { createApi, type ReadTransport } from './api';
import { initialState, readingReducer, hasExpiredSession } from './state';
import type { Inventory, OverviewInventory, Detail, DocumentData, Route, Resource, ReadingScope, Envelope } from './types';
import { ReadState, ReadingFeedback, readingStatus, label } from './feedback';
import { Overview, type WorkView } from './Overview';
import { RunDetail, detailHasMismatch, focusSituation } from './RunDetail';
import { RunFigure } from './RunFigure';
import { OverviewFigure } from './OverviewFigure';
import { WorkStandLabel } from './WorkStandLabel';
import { DocumentView } from './DocumentView';
import { CompactCockpit } from './mcp/CompactCockpit';
import { BrandMark } from './BrandMark';
import { BrandHeader } from './BrandHeader';
import { RefreshControl } from './RefreshControl';
import { useCardVisibility } from './useCardVisibility';
import { documentName, observedAssessment } from './presentation';
import { projectWorkSituation } from '../../core/lib/control-inspect/work-situation.js';
import { Icon } from './mcp/Icon';
import { useDraftCheck } from './useDraftCheck';
import { DraftCheck } from './DraftCheck';
import { ContextPanel } from './ContextPanel';
import type { HandoffController } from './mcp/handoff';
import type { CockpitProvenance } from './mcp/bootstrap';
import { AboutCockpit } from './AboutCockpit';
import type { CockpitHost } from './host-label';

export function App({ secret = '', transport, compact = false, onExpand, initialRunId, handoff, provenance, host = 'unknown' }: { secret?: string; transport?: ReadTransport; compact?: boolean; onExpand?: () => void; initialRunId?: string; handoff?: HandoffController; provenance?: CockpitProvenance; host?: CockpitHost }) {
  const enabled = !!transport || !!secret;
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const [backlogView, setWorkView] = useState<WorkView>({ section: 'runs', filter: '' });
  const [overviewSnapshot, setOverviewSnapshot] = useState<Envelope<OverviewInventory> | null>(null);
  const [wideWorkspace, setWideWorkspace] = useState(false);
  const [technicalView, setTechnicalView] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  useLayoutEffect(() => { setTechnicalView(false); }, [state.route.runId]);
  const [backlogReturnNotice, setBacklogReturnNotice] = useState<string | null>(null);
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
  const cardVisible = useCardVisibility(heading, compact), wasCardVisible = useRef(true), focusAfterRead = useRef(true);
  const returnFocus = useRef<string | null>(null);
  const returnSource = useRef<{ type: string; reference: string; prefix: string } | null>(null);
  const documentOrigin = useRef<string | null>(null);
  const returnListScroll = useRef<number | null>(null);
  const readingPosition = useRef<{ generation: number; open: string[]; scroll: { element: Element; top: number; left: number }[]; x: number; y: number; focus: string | null;
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
  const initialRoute = useRef<Route>(initialRunId ? { view: 'detail', runId: initialRunId } : { view: 'overview' }).current;
  const capturePosition = (generation: number) => {
      const root = workspace.current ?? heading.current?.closest('.compact-cockpit');
      const elements = root ? [root, ...root.querySelectorAll('*')] : [];
      for (let parent = root?.parentElement; parent; parent = parent.parentElement) elements.push(parent);
      const focus = document.activeElement?.getAttribute('data-focus-id') ?? null;
      const resource = live.current.detail?.data?.resources.find(r => focus?.endsWith(r.resource_id));
      readingPosition.current = { generation, open: root ? [...root.querySelectorAll('details[open]')].map(disclosureKey) : [],
        scroll: elements.filter(e => e.scrollTop || e.scrollLeft).map(element => ({ element, top: element.scrollTop, left: element.scrollLeft })),
        x: window.scrollX, y: window.scrollY, focus,
        ...(resource && focus ? { resource: { type: resource.type, reference: resource.registered_reference, prefix: focus.slice(0, -resource.resource_id.length) } } : {}) };
  };
  const navigate = useCallback(async (requested: Route, reload = false, background = false) => {
    if (hasExpiredSession(live.current)) return;
    draftPending.current?.abort();
    void handoff?.invalidate();
    // A cancelled title response may already have replaced the server capture.
    // Start a named capture instead of sending selectors from the previous one.
    freshnessPending.current?.abort();
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    const generation = ++sequence.current;
    if (background) capturePosition(generation); else readingPosition.current = null;
    focusAfterRead.current = !background;
    dispatch({ type: 'begin', generation, route: requested, background });
    try {
      let scope = live.current.scope;
      const refresh = reload || live.current.stale || !scope?.snapshot_id;
      let route = requested;
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
        const resource = scope.data.run.resources.find(r => refresh
          ? r.registered_reference === route.resourcePath : r.resource_id === route.resourceId);
        if (!resource) { route = { view: 'detail', runId: route.runId }; removed = true; }
        else {
          scope = await read<ReadingScope>(`/api/documents/${resource.resource_id}?snapshot=${scope.snapshot_id}`, controller.signal,
            { target: scope.target.target_id, snapshot: scope.snapshot_id!, replacement: true });
          if (controller.signal.aborted || generation !== sequence.current) return;
          if (!scope.data || scope.data.kind !== 'document' || scope.data.run.run_id !== route.runId) throw Error(scope.code ?? 'dto_invalid');
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
      dispatch({ type: 'ready', generation, route, scope, inventory, detail, document, removed });
    } catch (error) { if (!controller.signal.aborted) dispatch({ type: 'error', generation, code: error instanceof Error && error.message in knownErrors ? error.message : 'read_failed' }); }
  }, [read, handoff]);
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
      focus?.focus({ preventScroll: true });
    }
    if (!focusAfterRead.current) return;
    let origin = returnFocus.current; returnFocus.current = null;
    if (returnSource.current) {
      const binding = returnSource.current; returnSource.current = null;
      const resource = state.detail?.data?.resources.find(r => r.type === binding.type && r.registered_reference === binding.reference);
      origin = resource ? binding.prefix + resource.resource_id : null;
    }
    const focusTargets = state.route.view === 'overview' ? '.undertaking-list .run-link[data-focus-id]' : '[data-focus-id]';
    const control = origin ? [...document.querySelectorAll<HTMLElement>(focusTargets)].find(e => e.dataset.focusId === origin && !(e instanceof HTMLButtonElement && e.disabled)) : null;
    if (origin && !control && state.route.view === 'overview' && state.inventory?.data) {
      const exists = state.inventory.data.kind === 'runs' ? state.inventory.data.runs.some(entry => entry.run_id === origin) : state.inventory.data.entries.some(entry => entry.key === origin);
      setBacklogReturnNotice(exists
        ? 'Das Vorhaben liegt außerhalb des aktuellen Ausschnitts oder ist nicht auswählbar. Suche anpassen oder die Übersicht vergrößern.'
        : 'Das zuvor geöffnete Vorhaben ist nicht mehr im gelesenen Bestand enthalten.');
    }
    const fallback = state.route.view === 'overview' ? document.querySelector<HTMLElement>('[data-focus-id="backlog-heading"]') : null;
    // Returning to an inspected source must restore a visible focus target, even when
    // the newly mounted summary starts with closed disclosures.
    if (control) for (let parent = control.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    (control ?? fallback ?? heading.current)?.focus();
  }, [state.phase, state.route, state.refreshing, state.generation, state.scope]);
  useEffect(() => {
    const justShown = cardVisible && !wasCardVisible.current; wasCardVisible.current = cardVisible;
    const snapshot = state.scope?.snapshot_id;
    if (!snapshot || state.stale || state.phase !== 'ready' || !cardVisible || draftAction.busy) return;
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
    const timer = window.setInterval(check, 5000); document.addEventListener('visibilitychange', visibility);
    if (justShown) void check();
    void listen();
    return () => { window.clearInterval(timer); window.clearTimeout(restart); waiting?.abort(); controller.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [state.scope, state.stale, state.phase, read, navigate, compact, cardVisible, handoff, draftAction.busy]);
  useEffect(() => () => { void handoff?.invalidate(); }, [handoff]);
  const open = (resource: Resource, origin = resource.resource_id) => {
    const list = workspace.current?.querySelector<HTMLElement>('#backlog-list');
    returnListScroll.current = list?.scrollTop ?? null;
    documentOrigin.current = origin;
    returnSource.current = null;
    void navigate({ view: 'document', runId: resource.run_id, resourceId: resource.resource_id, resourcePath: resource.registered_reference });
  };
  const showOverview = () => {
    setBacklogReturnNotice(null);
    returnFocus.current = state.route.runId ?? null;
    void navigate({ view: 'overview' });
  };
  const showRun = () => {
    returnFocus.current = documentOrigin.current ?? state.route.resourceId ?? null;
    const resource = state.document?.data?.resource;
    if (resource) returnSource.current = { type: resource.type, reference: resource.registered_reference,
      prefix: documentOrigin.current?.includes(':') ? documentOrigin.current.slice(0, documentOrigin.current.indexOf(':') + 1) : '' };
    void navigate({ view: 'detail', runId: state.route.runId });
  };
  const documentVisible = state.route.view === 'document';
  const splitView = !compact && wideWorkspace && !!overviewSnapshot && !documentVisible;
  useLayoutEffect(() => {
    if (!splitView || state.phase !== 'ready' || returnListScroll.current === null) return;
    const list = workspace.current?.querySelector<HTMLElement>('#backlog-list');
    if (list) { list.scrollTop = returnListScroll.current; returnListScroll.current = null; }
  }, [splitView, state.phase]);
  const status = readingStatus(state);
  const renderedGeneration = state.generation;
  const expired = hasExpiredSession(state), reloadRoute = state.requestedRoute ?? state.route;
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
      }} detail={state.detail} document={state.route.view === 'document' ? state.document : null} disabled={expired || state.stale || state.phase !== 'ready' || draftAction.busy} handoff={handoff}/>;
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
        {state.detail && state.route.view === 'detail' && <RunDetail sourceEntry={sourceEntry} technicalView={technicalView} onBackFromTechnical={() => setTechnicalView(false)} result={state.detail} onOpen={open} read={read} technicalContext={<>{state.scope && <details className="provenance-details"><summary>Datenstand und Herkunft</summary><div className="provenance"><div><span>Repository</span><code>{state.scope.target.display_path}</code></div><div><span>Beobachtet</span><time>{state.scope.observed_as_of ?? 'Nicht verfügbar'}</time></div><div><span>Datenstand</span><code>{state.scope.snapshot_id}</code></div></div></details>}{technicalContext}</>} draftCheck={<DraftCheck inline={focusedDraft} result={state.detail} action={draftAction} current={!state.stale && !state.problem && state.phase === 'ready' && !draftAction.invalidated} onReload={() => void navigate(reloadRoute, true, focusedDraft)}/>} current={!state.stale && !state.problem && state.phase === 'ready'}/>}
        {state.document && state.route.view === 'document' && <DocumentView simple result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={runTitle} onOpen={id => { const resource = state.detail?.data?.resources.find(r => r.resource_id === id); if (resource) open(resource); }}/>}</div>
      {state.route.view === 'document' && technicalContext}

  </>;
  if (compact) return <><CompactCockpit host={host} onAbout={() => setAboutOpen(true)} sourceEntry={sourceEntry} visible={cardVisible} loadArchive={loadArchive} loadPlanned={(rowId, signal) => read(`/api/planned/${rowId}?snapshot=${state.inventory!.snapshot_id}`, signal, { target: state.inventory!.target.target_id, snapshot: state.inventory!.snapshot_id! })} draftCheck={state.detail && <DraftCheck automatic={!!focusGate && state.detail.data?.draft_check?.source.gate === focusGate} result={state.detail} action={draftAction} current={!state.stale && !state.problem && state.phase === 'ready' && !draftAction.invalidated} onReload={() => void navigate(reloadRoute, true)}/>} state={state} headingRef={heading} enabled={enabled} initialRunId={initialRoute.runId}
    onSelect={id => void navigate({ view: 'detail', runId: id })}
    view={backlogView} onViewChange={setWorkView} returnNotice={backlogReturnNotice}
    onReload={() => void navigate(reloadRoute, true)} onOverview={showOverview} onRuns={() => void navigate({ view: 'overview' })}
    onOpen={(resource, origin) => { open(resource, origin); onExpand?.(); }} onBack={showRun} onExpand={onExpand}/>{aboutOpen && <AboutCockpit onClose={closeAbout} provenance={provenance} host={host}/>}</>;
  return <div className="shell"><aside className="rail"><div className="brand"><BrandMark className="brand-mark"/><span>AGDF<small>Control Cockpit</small></span></div><div className="rail-label">Lokaler Arbeitsbereich</div><button className="nav-item" disabled={expired} onClick={() => void navigate({ view: 'overview' })}>▦ <span>Run-Übersicht</span></button><div className="rail-footer"><span className="live-dot"/> Lokale Sitzung<br/><small>Entscheidungen bleiben bei dir.</small></div></aside>
    <div className={`workspace${state.route.view === 'overview' || splitView ? ' workspace--overview' : ''}${documentVisible ? ' workspace--document' : ''}`} ref={workspace}><BrandHeader host={host} projectPath={state.scope?.target.display_path} contextTitle={documentVisible ? runTitle : undefined} variant={documentVisible ? 'document' : 'view'}>
      <button type="button" className="run-technical-toggle" aria-label="Über das Cockpit" title="Über das Cockpit" onClick={() => setAboutOpen(true)}><Icon name="info"/></button>
      <RefreshControl state={state} enabled={enabled} onReload={() => void navigate(reloadRoute, true)}/>
    </BrandHeader><main>
      {!splitView && state.route.view !== 'overview' && <nav className="breadcrumbs" aria-label="Vorhaben-Pfad"><ol>
        <li>{documentVisible ? <button onClick={showRun} disabled={expired || state.phase === 'loading'}><Icon name="back"/>{wideWorkspace && overviewSnapshot ? 'Zurück zur Übersicht' : 'Zurück zur Statuskarte'}</button>
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
const knownErrors: Record<string, boolean> = Object.fromEntries(['source_changed', 'session_invalid', 'session_expired', 'resource_denied', 'read_failed', 'busy', 'timeout', 'resource_limit', 'control_absent', 'dto_invalid', 'control_layout_unsupported', 'run_version_unsupported', 'control_invalid', 'run_missing', 'invalid_run'].map(c => [c, true]));
