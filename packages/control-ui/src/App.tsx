import { useEffect, useLayoutEffect, useReducer, useRef, useCallback, useState } from 'react';
import { createApi, type ReadTransport } from './api';
import { initialState, readingReducer, hasExpiredSession } from './state';
import type { Inventory, Detail, DocumentData, Route, Resource, ReadingScope, Envelope } from './types';
import { ReadState, ReadingFeedback, readingStatus } from './feedback';
import { Overview, type BacklogView } from './Overview';
import { RunDetail } from './RunDetail';
import { DocumentView } from './DocumentView';
import { CompactCockpit } from './mcp/CompactCockpit';
import { BrandMark } from './BrandMark';
import { BrandHeader } from './BrandHeader';
import { RefreshControl } from './RefreshControl';
import { useCardVisibility } from './useCardVisibility';
import { documentName } from './presentation';
import { Icon } from './mcp/Icon';
import { ContextPanel } from './ContextPanel';
import type { HandoffController } from './mcp/handoff';
import { createBacklogTitleStore, type TitleLoader } from './useBacklogTitles';
import { COCKPIT_BACKLOG_SECTIONS } from '../../core/lib/control-inspect/cockpit-list.js';

export function App({ secret = '', transport, compact = false, onExpand, initialRunId, handoff }: { secret?: string; transport?: ReadTransport; compact?: boolean; onExpand?: () => void; initialRunId?: string; handoff?: HandoffController }) {
  const enabled = !!transport || !!secret;
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const [readerMode, setReaderMode] = useState<'summary' | 'details'>('summary');
  const [backlogView, setBacklogView] = useState<BacklogView>({ section: 'Active Backlog', filter: '' });
  const [backlogReturnNotice, setBacklogReturnNotice] = useState<string | null>(null);
  const [titleEpoch, setTitleEpoch] = useState(0);
  const titleStore = useRef(createBacklogTitleStore());
  const titlePending = useRef<AbortController | null>(null), freshnessPending = useRef<AbortController | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const [wideReader, setWideReader] = useState(true);
  useLayoutEffect(() => {
    const element = workspace.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width !== undefined) setWideReader(width >= 720);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [compact]);
  useLayoutEffect(() => {
    if (!wideReader && state.route.view === 'detail') setReaderMode('summary');
  }, [wideReader, readerMode, state.route.view]);
  const live = useRef(state); live.current = state;
  const sequence = useRef(0), pending = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  const cardVisible = useCardVisibility(heading, compact), wasCardVisible = useRef(true), focusAfterRead = useRef(true);
  const returnFocus = useRef<string | null>(null);
  const returnSource = useRef<{ type: string; reference: string; prefix: string } | null>(null);
  const documentOrigin = useRef<string | null>(null);
  const readingPosition = useRef<{ generation: number; open: string[]; scroll: { element: Element; top: number; left: number }[]; x: number; y: number; focus: string | null;
    resource?: { type: string; reference: string; prefix: string } } | null>(null);
  const disclosureKey = (element: Element) => (element.closest('[data-backlog-row]')?.querySelector('[data-focus-id]')?.getAttribute('data-focus-id') ?? '')
    + ':' + (element.querySelector('summary')?.textContent?.replace(/ · \d+$/, '') ?? '');
  const previousCompact = useRef(compact);
  useLayoutEffect(() => {
    if (previousCompact.current !== compact) {
      if (compact && backlogView.section !== COCKPIT_BACKLOG_SECTIONS[0]) {
        setBacklogView({ section: COCKPIT_BACKLOG_SECTIONS[0], filter: '' });
        setBacklogReturnNotice('Die kompakte Ansicht zeigt wieder den aktiven Bereich ohne Suche.');
      }
      heading.current?.focus();
    }
    previousCompact.current = compact;
  }, [compact, backlogView.section]);
  const read = useRef(transport ?? createApi(secret)).current;
  const initialRoute = useRef<Route>(initialRunId ? { view: 'detail', runId: initialRunId } : { view: 'overview' }).current;
  const navigate = useCallback(async (requested: Route, reload = false, background = false) => {
    if (hasExpiredSession(live.current)) return;
    void handoff?.invalidate();
    // A cancelled title response may already have replaced the server capture.
    // Start a named capture instead of sending selectors from the previous one.
    const replacingTitles = !!titlePending.current;
    titlePending.current?.abort(); freshnessPending.current?.abort();
    if (reload || live.current.stale) { titleStore.current.cache.clear(); titleStore.current.attempted.clear(); setTitleEpoch(value => value + 1); }
    if (!reload && !background && (requested.view === 'overview' || requested.runId !== live.current.route.runId)) setReaderMode('summary');
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    const generation = ++sequence.current;
    if (background) {
      const root = workspace.current ?? heading.current?.closest('.compact-cockpit');
      const elements = root ? [root, ...root.querySelectorAll('*')] : [];
      for (let parent = root?.parentElement; parent; parent = parent.parentElement) elements.push(parent);
      const focus = document.activeElement?.getAttribute('data-focus-id') ?? null;
      const resource = live.current.detail?.data?.resources.find(r => focus?.endsWith(r.resource_id));
      readingPosition.current = { generation, open: root ? [...root.querySelectorAll('details[open]')].map(disclosureKey) : [],
        scroll: elements.filter(e => e.scrollTop || e.scrollLeft).map(element => ({ element, top: element.scrollTop, left: element.scrollLeft })),
        x: window.scrollX, y: window.scrollY, focus,
        ...(resource && focus ? { resource: { type: resource.type, reference: resource.registered_reference, prefix: focus.slice(0, -resource.resource_id.length) } } : {}) };
    } else readingPosition.current = null;
    focusAfterRead.current = !background;
    dispatch({ type: 'begin', generation, route: requested, background });
    try {
      let scope = live.current.scope;
      const refresh = reload || replacingTitles || live.current.stale || !scope?.snapshot_id;
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
      if (requested.view === 'document' && scope.data.kind !== 'backlog') {
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
      if (data.kind === 'backlog') {
        if (requested.runId && (!data.removed_run_id || data.removed_run_id !== requested.runId
          || live.current.detail?.data?.run_id !== requested.runId || !live.current.detail.data.evaluation)) throw Error('dto_invalid');
        if (data.removed_run_id && data.removed_run_id !== requested.runId) throw Error('dto_invalid');
        removed = !!data.removed_run_id; route = { view: 'overview' };
      }
      else if (!data.run && data.kind === 'run') {
        if (data.requested_run_id !== requested.runId) throw Error('dto_invalid');
      } else if (data.run?.run_id !== requested.runId) throw Error('dto_invalid');
      const inventory = data.kind === 'backlog' ? { ...scope, data } as Envelope<Inventory> : null;
      const detail = data.kind !== 'backlog' && data.run ? { ...scope, data: data.run } as Envelope<Detail> : null;
      const document = data.kind === 'document' && data.document ? { ...scope, data: data.document } as Envelope<DocumentData> : null;
      dispatch({ type: 'ready', generation, route, scope, inventory, detail, document, removed });
    } catch (error) { if (!controller.signal.aborted) dispatch({ type: 'error', generation, code: error instanceof Error && error.message in knownErrors ? error.message : 'read_failed' }); }
  }, [read, handoff]);
  const loadTitles = useCallback<TitleLoader>(async (ids, signal) => {
    const current = live.current, scope = current.scope;
    if (current.phase !== 'ready' || current.stale || current.route.view !== 'overview' || scope?.data?.kind !== 'backlog' || !scope.snapshot_id) return null;
    freshnessPending.current?.abort();
    const controller = new AbortController(), generation = sequence.current;
    titlePending.current = controller;
    const cancel = () => controller.abort(); signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) controller.abort();
    try {
      const result = await read<Inventory>(`/api/backlog-titles?snapshot=${scope.snapshot_id}&rows=${ids.join(',')}`, controller.signal,
        { target: scope.target.target_id, snapshot: scope.snapshot_id, replacement: true });
      if (controller.signal.aborted || generation !== sequence.current || live.current.route.view !== 'overview') return null;
      if (!result.data) throw Error(result.code ?? 'read_failed');
      if (result.data.kind !== 'backlog' || result.data.content_digest !== scope.data.content_digest) throw Error('source_changed');
      const fields = ['section', 'key', 'original_key', 'title', 'stored_status', 'scope', 'priority', 'stored_next_step', 'source_links', 'current_spec', 'selectable'] as const;
      const originalRows = scope.data.entries;
      if (result.data.entries.length !== originalRows.length || result.data.entries.some((row, index) => fields.some(field => row[field] !== originalRows[index][field]))) throw Error('dto_invalid');
      live.current = { ...live.current, inventory: result, scope: result };
      dispatch({ type: 'titles', generation, inventory: result });
      return result;
    } catch (error) {
      if (!controller.signal.aborted && generation === sequence.current) {
        void handoff?.invalidate();
        dispatch({ type: 'stale', snapshot: scope.snapshot_id, code: error instanceof Error ? error.message : 'read_failed' });
      }
      return null;
    } finally { signal.removeEventListener('abort', cancel); if (titlePending.current === controller) titlePending.current = null; }
  }, [read, handoff]);
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
      const exists = state.inventory.data.entries.some(entry => entry.key === origin);
      setBacklogReturnNotice(exists
        ? 'Das Vorhaben liegt außerhalb des aktuellen Ausschnitts oder ist nicht auswählbar. Suche anpassen oder die Übersicht vergrößern.'
        : 'Das zuvor geöffnete Vorhaben ist nicht mehr im Backlog enthalten.');
    }
    const fallback = state.route.view === 'overview' ? document.querySelector<HTMLElement>('[data-focus-id="backlog-heading"]') : null;
    // Returning to an inspected source must restore a visible focus target, even when
    // the newly mounted summary starts with closed disclosures.
    if (control) for (let parent = control.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    (control ?? fallback ?? heading.current)?.focus();
  }, [state.phase, state.route, state.refreshing, state.generation]);
  useEffect(() => {
    const justShown = cardVisible && !wasCardVisible.current; wasCardVisible.current = cardVisible;
    const snapshot = state.scope?.snapshot_id;
    if (!snapshot || state.stale || state.phase !== 'ready' || !cardVisible) return;
    let checking = false; const controller = new AbortController();
    const check = async () => {
      if (document.hidden || checking || titlePending.current) return; checking = true;
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
      } catch { if (!controller.signal.aborted && generation === sequence.current) { void handoff?.invalidate(); dispatch({ type: 'stale', snapshot, code: 'read_failed' }); } }
      finally { checking = false; }
    };
    let waiting: AbortController | null = null;
    const listen = async () => {
      if (!read.waitForChanges || document.hidden || controller.signal.aborted || waiting) return;
      waiting = new AbortController(); const request = waiting, generation = sequence.current;
      try {
        const result = await read.waitForChanges(snapshot, request.signal, state.scope!.target.target_id);
        if (!request.signal.aborted && !controller.signal.aborted && generation === sequence.current && !document.hidden) {
          if (!result.data || typeof result.data.changed !== 'boolean') return;
          if (result.data.changed) await check();
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
  }, [state.scope, state.stale, state.phase, read, navigate, compact, cardVisible, handoff]);
  useEffect(() => () => { void handoff?.invalidate(); }, [handoff]);
  const open = (resource: Resource, origin = resource.resource_id) => {
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
  const summarizing = state.route.view === 'detail' && (!wideReader || readerMode === 'summary') && !!state.detail?.data?.evaluation;
  const documentVisible = state.route.view === 'document';
  const status = readingStatus(state);
  const renderedGeneration = state.generation;
  const expired = hasExpiredSession(state), reloadRoute = state.requestedRoute ?? state.route;
  const runTitle = state.detail?.data?.title ?? state.route.runId;
  const pageTitle = state.route.view === 'overview' ? 'Gespeicherte Vorhaben' : state.route.view === 'detail' || summarizing ? runTitle ?? 'Run verstehen' : documentName(state.document?.data?.resource.type);
  const readingContent = <>
      <div className={`page-title${documentVisible ? ' page-title--document' : ''}`}><div>{!summarizing && <div className="eyebrow">Dein Repository · Deine Vorhaben</div>}<h1 ref={heading} tabIndex={-1}>{pageTitle}</h1>{!summarizing && <p>{state.route.view === 'overview' ? 'Orientierung aus dem Masterbacklog. Öffne ein Vorhaben für die aktuelle Prüfung.' : state.route.view === 'detail' || summarizing ? 'Ziel, offene Punkte und nächster erlaubter Schritt.' : 'Registrierte Quelle und ihre Bedeutung für das Vorhaben.'}</p>}</div>
        {documentVisible && <button type="button" className="document-close" aria-label="Dokument schließen" title="Dokument schließen" onClick={showRun} disabled={expired || state.phase === 'loading'}><Icon name="close"/></button>}
        {state.route.view === 'detail' && state.detail?.data?.evaluation && <div className="view-switch" data-mode={summarizing ? 'summary' : 'details'} role="group" aria-label="Ansicht"><button aria-pressed={summarizing} onClick={() => setReaderMode('summary')}>Zusammenfassung</button><button aria-pressed={!summarizing} onClick={() => setReaderMode('details')}>Details</button></div>}
      </div>
      {!enabled && <ReadState state="blocked" code="session_invalid"/>}
      <div className="data-observation">
        {state.scope ? <details className="provenance-details"><summary>Stand {state.scope.observed_as_of ? new Date(state.scope.observed_as_of).toLocaleString('de-DE') : 'nicht verfügbar'} · Datenstand und Herkunft</summary><div className="provenance"><div><span>Repository</span><code>{state.scope.target.display_path}</code></div><div><span>Beobachtet</span><time>{state.scope.observed_as_of ? new Date(state.scope.observed_as_of).toLocaleString('de-DE') : 'Nicht verfügbar'}</time></div><div><span>Datenstand</span><code>{state.scope.snapshot_id}</code></div></div></details> : <span className="muted">Datenstand noch nicht verfügbar</span>}
      </div>
      {state.route.view === 'overview' && backlogReturnNotice && <p role="status">{backlogReturnNotice}</p>}
      <ReadingFeedback state={state} backlogHintsInView={state.route.view === 'overview' && !!state.inventory?.data}/>
      {(state.phase === 'error' || state.scope?.retryable && !state.scope.data) && enabled && !expired && <button className="retry" onClick={() => void navigate(reloadRoute, true)}>Wiederholen</button>}
      <div className={`reading-results${state.phase === 'loading' ? ' previous-content' : ''}`} aria-busy={state.phase === 'loading'}>
        {state.inventory?.data && state.route.view === 'overview' && <Overview key={titleEpoch} result={state.inventory} current={state.phase === 'ready' && !state.stale && !state.problem} view={backlogView} onViewChange={setBacklogView} loadTitles={loadTitles} titleStore={titleStore.current} resetTitles={state.stale} titlesEnabled={state.phase === 'ready' && !state.stale && cardVisible} onSelect={id => void navigate({ view: 'detail', runId: id })}/>}
        {state.detail && state.route.view === 'detail' && <RunDetail result={state.detail} onOpen={open} summaryOnly={summarizing} current={!state.stale && !state.problem && state.phase === 'ready'}/>}
        {state.document && state.route.view === 'document' && <DocumentView result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={runTitle} onOpen={id => { const resource = state.detail?.data?.resources.find(r => r.resource_id === id); if (resource) open(resource); }}/>}</div>
      {state.detail && state.route.view !== 'overview' && <ContextPanel key={`${state.route.runId}:${state.route.resourcePath ?? 'run'}`} read={read} onScope={value => {
        if (renderedGeneration !== sequence.current || value.data?.kind !== 'context' || value.data.run.run_id !== live.current.route.runId) return;
        const parent = { ...value, data: value.data.run } as Envelope<Detail>;
        const doc = value.data.document ? { ...value, data: value.data.document } as Envelope<DocumentData> : null;
        dispatch({ type: 'ready', generation: sequence.current, route: { ...live.current.route, resourceId: doc?.data?.resource.resource_id }, scope: value, inventory: null, detail: parent, document: doc });
      }} detail={state.detail} document={state.route.view === 'document' ? state.document : null} disabled={expired || state.stale || state.phase !== 'ready'} handoff={handoff}/>}
  </>;
  if (compact) return <CompactCockpit state={state} headingRef={heading} enabled={enabled} initialRunId={initialRoute.runId}
    onSelect={id => void navigate({ view: 'detail', runId: id })}
    view={backlogView} onViewChange={setBacklogView} returnNotice={backlogReturnNotice}
    onReload={() => void navigate(reloadRoute, true)} onOverview={showOverview}
    onOpen={(resource, origin) => { open(resource, origin); onExpand?.(); }} onBack={showRun} onExpand={onExpand}/>;
  return <div className="shell"><aside className="rail"><div className="brand"><BrandMark className="brand-mark"/><span>AGDF<small>Control Cockpit</small></span></div><div className="rail-label">Lokaler Arbeitsbereich</div><button className="nav-item" disabled={expired} onClick={() => void navigate({ view: 'overview' })}>▦ <span>Run-Übersicht</span></button><div className="rail-footer"><span className="live-dot"/> Lokale Sitzung<br/><small>Entscheidungen bleiben bei dir.</small></div></aside>
    <div className={`workspace${state.route.view === 'overview' ? ' workspace--overview' : ''}${documentVisible ? ' workspace--document' : ''}${summarizing ? ' workspace--summary' : ''}`} ref={workspace}><BrandHeader projectPath={state.scope?.target.display_path} contextTitle={state.route.view !== 'overview' ? runTitle : undefined} variant={documentVisible ? 'document' : 'view'}>
      <RefreshControl state={state} enabled={enabled} onReload={() => void navigate(reloadRoute, true)}/>
    </BrandHeader><main>
      {state.route.view !== 'overview' && <nav className="breadcrumbs" aria-label="Vorhaben-Pfad"><ol>
        <li><button onClick={showOverview} disabled={expired || state.phase === 'loading'}>Alle Vorhaben</button></li>
        <li>{documentVisible ? <button onClick={showRun} disabled={expired || state.phase === 'loading'}>{runTitle}</button> : <span aria-current="page">{runTitle}</span>}</li>
        {documentVisible && <li><span aria-current="page">{pageTitle}</span></li>}
      </ol></nav>}
      {documentVisible ? <section className="document-reading agdf-surface" aria-label="Dokument lesen">{readingContent}</section> : readingContent}
      <footer>Lokale Beobachtung · {status.title}{status.previous && ' · Vorheriger Datenstand bleibt sichtbar'} · Das Cockpit verändert keine Kontrolldateien.</footer>
    </main></div></div>;
}
const knownErrors: Record<string, boolean> = Object.fromEntries(['source_changed', 'session_invalid', 'session_expired', 'resource_denied', 'read_failed', 'busy', 'timeout', 'resource_limit', 'control_absent', 'dto_invalid', 'backlog_missing', 'backlog_unsupported', 'run_missing', 'invalid_run'].map(c => [c, true]));
