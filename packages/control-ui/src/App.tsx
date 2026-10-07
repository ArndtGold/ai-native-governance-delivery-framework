import { useEffect, useLayoutEffect, useReducer, useRef, useCallback, useState } from 'react';
import { createApi, type ReadTransport } from './api';
import { initialState, readingReducer, hasExpiredSession } from './state';
import type { Inventory, Detail, DocumentData, Route, Resource } from './types';
import { ReadState, ReadingFeedback, label } from './feedback';
import { Overview } from './Overview';
import { RunDetail } from './RunDetail';
import { DocumentView } from './DocumentView';
import { CompactCockpit } from './mcp/CompactCockpit';
import { BrandMark } from './BrandMark';
import { BrandHeader } from './BrandHeader';
import { useCardVisibility } from './useCardVisibility';
import { documentName } from './presentation';
import { Icon } from './mcp/Icon';
import { ContextPanel } from './ContextPanel';
import type { HandoffController } from './mcp/handoff';

export function App({ secret = '', transport, compact = false, onExpand, initialRunId, handoff }: { secret?: string; transport?: ReadTransport; compact?: boolean; onExpand?: () => void; initialRunId?: string; handoff?: HandoffController }) {
  const enabled = !!transport || !!secret;
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const [readerMode, setReaderMode] = useState<'summary' | 'details'>('summary');
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
  const documentOrigin = useRef<string | null>(null);
  const previousCompact = useRef(compact);
  useLayoutEffect(() => { if (previousCompact.current !== compact) heading.current?.focus(); previousCompact.current = compact; }, [compact]);
  const read = useRef(transport ?? createApi(secret)).current;
  const initialRoute = useRef<Route>(initialRunId ? { view: 'detail', runId: initialRunId } : { view: 'overview' }).current;
  const navigate = useCallback(async (requested: Route, reload = false, background = false) => {
    if (hasExpiredSession(live.current)) return;
    void handoff?.invalidate();
    if (!reload && !background && (requested.view === 'overview' || requested.runId !== live.current.route.runId)) setReaderMode('summary');
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    const generation = ++sequence.current;
    focusAfterRead.current = !background;
    dispatch({ type: 'begin', generation, route: requested, background });
    try {
      let inventory = live.current.inventory;
      const refresh = reload || live.current.stale || !inventory?.snapshot_id;
      if (refresh) inventory = await read<Inventory>('/api/snapshot', controller.signal);
      if (controller.signal.aborted || generation !== sequence.current) return;
      if (!inventory) throw Error('read_failed');
      if (inventory.code && !inventory.data) {
        if (live.current.inventory?.data) throw Error(inventory.code);
        dispatch({ type: 'ready', generation, route: { view: 'overview' }, inventory, detail: null, document: null });
        return;
      }
      if (!inventory.data || !Array.isArray(inventory.data.runs) || inventory.data.runs.some(r => typeof r.run_id !== 'string' || typeof r.valid !== 'boolean')) throw Error('dto_invalid');
      let route = requested, detail = null, document = null, removed = false;
      const expected = { target: inventory.target.target_id, snapshot: inventory.snapshot_id! };
      if (route.runId && !inventory.data.runs.some(r => r.run_id === route.runId)) { route = { view: 'overview' }; removed = true; }
      if (route.view !== 'overview') {
        detail = await read<Detail>(`/api/runs/${route.runId}?snapshot=${inventory.snapshot_id}`, controller.signal, expected);
        if (controller.signal.aborted || generation !== sequence.current) return;
        if (detail.code === 'source_changed' || !detail.data) throw Error(detail.code ?? 'read_failed');
        if (detail.data.run_id !== route.runId || !Array.isArray(detail.data.resources)) throw Error('dto_invalid');
        if (route.view === 'document') {
          const resource = refresh ? detail.data.resources.find(r => r.registered_reference === route.resourcePath) : detail.data.resources.find(r => r.resource_id === route.resourceId);
          if (!resource) { route = { view: 'detail', runId: route.runId }; removed = true; }
          else {
            route = { ...route, resourceId: resource.resource_id, resourcePath: resource.registered_reference };
            document = await read<DocumentData>(`/api/documents/${resource.resource_id}?snapshot=${inventory.snapshot_id}`, controller.signal, expected);
            if (controller.signal.aborted || generation !== sequence.current) return;
            if (document.code === 'source_changed' || !document.data) throw Error(document.code ?? 'read_failed');
            if (document.data.resource?.run_id !== route.runId || document.data.resource.resource_id !== route.resourceId) throw Error('dto_invalid');
          }
        }
      }
      dispatch({ type: 'ready', generation, route, inventory, detail, document, removed });
    } catch (error) { if (!controller.signal.aborted) dispatch({ type: 'error', generation, code: error instanceof Error && error.message in knownErrors ? error.message : 'read_failed' }); }
  }, [read, handoff]);
  useEffect(() => { if (enabled) void navigate(initialRoute, true); return () => pending.current?.abort(); }, [navigate, enabled, initialRoute]);
  useLayoutEffect(() => {
    if (state.phase !== 'ready' || !focusAfterRead.current) return;
    const origin = returnFocus.current; returnFocus.current = null;
    const control = origin ? [...document.querySelectorAll<HTMLElement>('[data-focus-id]')].find(e => e.dataset.focusId === origin) : null;
    // Returning to an inspected source must restore a visible focus target, even when
    // the newly mounted summary starts with closed disclosures.
    if (control) for (let parent = control.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    (control ?? heading.current)?.focus();
  }, [state.phase, state.route]);
  useEffect(() => {
    const justShown = cardVisible && !wasCardVisible.current; wasCardVisible.current = cardVisible;
    const snapshot = state.inventory?.snapshot_id;
    if (!snapshot || state.stale || state.phase !== 'ready' || !cardVisible) return;
    let checking = false; const controller = new AbortController();
    const check = async () => {
      if (document.hidden || checking) return; checking = true;
      const generation = sequence.current;
      try {
        const result = await read('/api/freshness?snapshot=' + snapshot, controller.signal, { target: state.inventory!.target.target_id, snapshot });
        if (controller.signal.aborted || generation !== sequence.current || document.hidden) return;
        if (result.code === 'source_changed' && compact) void navigate(live.current.route, true, true);
        else if (result.code) { void handoff?.invalidate(); dispatch({ type: 'stale', snapshot, code: result.code }); }
      } catch { if (!controller.signal.aborted && generation === sequence.current) { void handoff?.invalidate(); dispatch({ type: 'stale', snapshot, code: 'read_failed' }); } }
      finally { checking = false; }
    };
    const visibility = () => { void handoff?.invalidate(); if (!document.hidden) void check(); };
    const timer = window.setInterval(check, 5000); document.addEventListener('visibilitychange', visibility);
    if (compact && justShown) void check();
    return () => { window.clearInterval(timer); controller.abort(); document.removeEventListener('visibilitychange', visibility); };
  }, [state.inventory, state.stale, state.phase, read, navigate, compact, cardVisible, handoff]);
  useEffect(() => () => { void handoff?.invalidate(); }, [handoff]);
  const open = (resource: Resource, origin = resource.resource_id) => {
    documentOrigin.current = origin;
    void navigate({ view: 'document', runId: resource.run_id, resourceId: resource.resource_id, resourcePath: resource.registered_reference });
  };
  const showOverview = () => {
    returnFocus.current = state.route.runId ?? null;
    void navigate({ view: 'overview' });
  };
  const showRun = () => {
    returnFocus.current = documentOrigin.current ?? state.route.resourceId ?? null;
    void navigate({ view: 'detail', runId: state.route.runId });
  };
  const summarizing = state.route.view === 'detail' && (!wideReader || readerMode === 'summary') && !!state.detail?.data?.evaluation;
  const documentVisible = state.route.view === 'document';
  const current = state.route.view === 'document' ? state.document : state.route.view === 'detail' ? state.detail : state.inventory;
  const expired = hasExpiredSession(state), reloadRoute = state.requestedRoute ?? state.route;
  const runTitle = state.inventory?.data?.runs.find(run => run.run_id === state.route.runId)?.title ?? state.detail?.data?.title ?? state.route.runId;
  const pageTitle = state.route.view === 'overview' ? 'Run-Übersicht' : state.route.view === 'detail' || summarizing ? runTitle ?? 'Run verstehen' : documentName(state.document?.data?.resource.type);
  if (compact) return <CompactCockpit state={state} headingRef={heading} enabled={enabled} initialRunId={initialRoute.runId}
    onSelect={id => void navigate({ view: 'detail', runId: id })}
    onReload={() => void navigate(reloadRoute, true)} onOverview={() => void navigate({ view: 'overview' })}
    onOpen={(resource, origin) => { open(resource, origin); onExpand?.(); }} onBack={showRun} onExpand={onExpand}/>;
  return <div className="shell"><aside className="rail"><div className="brand"><BrandMark className="brand-mark"/><span>AGDF<small>Control Cockpit</small></span></div><div className="rail-label">Lokaler Arbeitsbereich</div><button className="nav-item" disabled={expired} onClick={() => void navigate({ view: 'overview' })}>▦ <span>Run-Übersicht</span></button><div className="rail-footer"><span className="live-dot"/> Lokale Sitzung<br/><small>Entscheidungen bleiben bei dir.</small></div></aside>
    <div className={`workspace${summarizing ? ' workspace--summary' : ''}`} ref={workspace}><BrandHeader projectPath={state.inventory?.target.display_path} contextTitle={state.route.view !== 'overview' ? runTitle : undefined} variant={documentVisible ? 'document' : 'view'}>
      <button className={`refresh-control${state.stale ? ' refresh-control--stale' : ''}`} aria-label={state.stale ? 'Daten aktualisieren' : 'Neu laden'} title={state.stale ? 'Veralteten Datenstand aktualisieren' : 'Datenstand neu laden'} onClick={() => void navigate(reloadRoute, true)} disabled={expired || !enabled || state.phase === 'loading'}><Icon name="reload"/></button>
    </BrandHeader><main>
      {state.route.view !== 'overview' && <nav className="breadcrumbs" aria-label="Vorhaben-Pfad"><ol>
        <li><button onClick={showOverview} disabled={expired || state.phase === 'loading'}>Alle Vorhaben</button></li>
        <li>{documentVisible ? <button onClick={showRun} disabled={expired || state.phase === 'loading'}>{runTitle}</button> : <span aria-current="page">{runTitle}</span>}</li>
        {documentVisible && <li><span aria-current="page">{pageTitle}</span></li>}
      </ol></nav>}
      <div className={`page-title${documentVisible ? ' page-title--document' : ''}`}><div>{!summarizing && <div className="eyebrow">Dein Repository · Deine Vorhaben</div>}<h1 ref={heading} tabIndex={-1}>{pageTitle}</h1>{!summarizing && <p>{state.route.view === 'overview' ? 'Welches Vorhaben braucht deine Aufmerksamkeit?' : state.route.view === 'detail' || summarizing ? 'Ziel, offene Punkte und nächster erlaubter Schritt.' : 'Registrierte Quelle und ihre Bedeutung für das Vorhaben.'}</p>}</div>
        {documentVisible && <button type="button" className="document-close" aria-label="Dokument schließen" title="Dokument schließen" onClick={showRun} disabled={expired || state.phase === 'loading'}><Icon name="close"/></button>}
        {state.route.view === 'detail' && state.detail?.data?.evaluation && <div className="view-switch" data-mode={summarizing ? 'summary' : 'details'} role="group" aria-label="Ansicht"><button aria-pressed={summarizing} onClick={() => setReaderMode('summary')}>Zusammenfassung</button><button aria-pressed={!summarizing} onClick={() => setReaderMode('details')}>Details</button></div>}
      </div>
      {!enabled && <ReadState state="blocked" code="session_invalid"/>}
      <div className="data-observation">
        {state.inventory ? <details className="provenance-details"><summary>Stand {state.inventory.observed_as_of ? new Date(state.inventory.observed_as_of).toLocaleString('de-DE') : 'nicht verfügbar'} · Datenstand und Herkunft</summary><div className="provenance"><div><span>Repository</span><code>{state.inventory.target.display_path}</code></div><div><span>Beobachtet</span><time>{state.inventory.observed_as_of ? new Date(state.inventory.observed_as_of).toLocaleString('de-DE') : 'Nicht verfügbar'}</time></div><div><span>Datenstand</span><code>{state.inventory.snapshot_id}</code></div></div></details> : <span className="muted">Datenstand noch nicht verfügbar</span>}
      </div>
      <ReadingFeedback state={state}/>
      {(state.phase === 'error' || state.inventory?.retryable && !state.inventory.data) && enabled && !expired && <button className="retry" onClick={() => void navigate(reloadRoute, true)}>Wiederholen</button>}
      <div className={state.phase === 'loading' ? 'previous-content' : ''} aria-busy={state.phase === 'loading'}>
        {state.inventory?.data && state.route.view === 'overview' && <Overview result={state.inventory} onSelect={id => void navigate({ view: 'detail', runId: id })}/>}
        {state.detail && state.route.view === 'detail' && <RunDetail result={state.detail} onOpen={open} summaryOnly={summarizing} current={!state.stale && !state.problem && state.phase === 'ready'}/>}
        {state.document && state.route.view === 'document' && <DocumentView result={state.document} runTitle={runTitle} onOpen={id => { const resource = state.detail?.data?.resources.find(r => r.resource_id === id); if (resource) open(resource); }}/>}</div>
      {state.detail && state.route.view !== 'overview' && <ContextPanel key={`${state.inventory?.snapshot_id}:${state.route.runId}:${state.route.resourceId ?? 'run'}`} read={read} detail={state.detail} document={state.route.view === 'document' ? state.document : null} disabled={expired || state.stale || state.phase !== 'ready'} handoff={handoff}/>}
      <footer>Lokale Beobachtung · {label(state.stale ? 'stale' : current?.state)} · Das Cockpit verändert keine Kontrolldateien.</footer>
    </main></div></div>;
}
const knownErrors: Record<string, boolean> = Object.fromEntries(['source_changed', 'session_invalid', 'session_expired', 'resource_denied', 'read_failed', 'busy', 'timeout', 'resource_limit', 'control_absent', 'dto_invalid'].map(c => [c, true]));
