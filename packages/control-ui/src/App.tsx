import { useEffect, useReducer, useRef, useCallback } from 'react';
import { createApi } from './api';
import { initialState, readingReducer } from './state';
import type { Inventory, Detail, DocumentData, Route, Resource } from './types';
import { ReadState, label } from './feedback';
import { Overview } from './Overview';
import { RunDetail } from './RunDetail';
import { DocumentView } from './DocumentView';

export function App({ secret }: { secret: string }) {
  const [state, dispatch] = useReducer(readingReducer, initialState);
  const live = useRef(state); live.current = state;
  const sequence = useRef(0), pending = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<string | null>(null);
  const read = useRef(createApi(secret)).current;
  const navigate = useCallback(async (requested: Route, reload = false) => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    const generation = ++sequence.current;
    dispatch({ type: 'begin', generation, route: requested });
    try {
      let inventory = live.current.inventory;
      if (reload || !inventory?.snapshot_id) inventory = await read<Inventory>('/api/snapshot', controller.signal);
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
        if (detail.code === 'source_changed' || !detail.data) throw Error(detail.code ?? 'read_failed');
        if (detail.data.run_id !== route.runId || !Array.isArray(detail.data.resources)) throw Error('dto_invalid');
        if (route.view === 'document') {
          const resource = reload ? detail.data.resources.find(r => r.registered_reference === route.resourcePath) : detail.data.resources.find(r => r.resource_id === route.resourceId);
          if (!resource) { route = { view: 'detail', runId: route.runId }; removed = true; }
          else {
            route = { ...route, resourceId: resource.resource_id, resourcePath: resource.registered_reference };
            document = await read<DocumentData>(`/api/documents/${resource.resource_id}?snapshot=${inventory.snapshot_id}`, controller.signal, expected);
            if (document.code === 'source_changed' || !document.data) throw Error(document.code ?? 'read_failed');
            if (document.data.resource?.run_id !== route.runId || document.data.resource.resource_id !== route.resourceId) throw Error('dto_invalid');
          }
        }
      }
      dispatch({ type: 'ready', generation, route, inventory, detail, document, removed });
    } catch (error) { if (!controller.signal.aborted) dispatch({ type: 'error', generation, code: error instanceof Error && error.message in knownErrors ? error.message : 'read_failed' }); }
  }, [read]);
  useEffect(() => { if (secret) void navigate({ view: 'overview' }, true); return () => pending.current?.abort(); }, [navigate, secret]);
  useEffect(() => {
    if (state.phase !== 'ready') return;
    const origin = returnFocus.current; returnFocus.current = null;
    const control = origin ? [...document.querySelectorAll<HTMLElement>('[data-focus-id]')].find(e => e.dataset.focusId === origin) : null;
    (control ?? heading.current)?.focus();
  }, [state.phase, state.route]);
  useEffect(() => {
    const snapshot = state.inventory?.snapshot_id;
    if (!snapshot || state.stale || state.phase !== 'ready') return;
    let checking = false; const controller = new AbortController();
    const check = async () => {
      if (document.hidden || checking) return; checking = true;
      try {
        const result = await read('/api/freshness?snapshot=' + snapshot, controller.signal, { target: state.inventory!.target.target_id, snapshot });
        if (result.code) dispatch({ type: 'stale', snapshot, code: result.code });
      } catch { if (!controller.signal.aborted) dispatch({ type: 'stale', snapshot, code: 'read_failed' }); }
      finally { checking = false; }
    };
    const timer = window.setInterval(check, 5000); document.addEventListener('visibilitychange', check);
    return () => { window.clearInterval(timer); controller.abort(); document.removeEventListener('visibilitychange', check); };
  }, [state.inventory, state.stale, state.phase, read]);
  const open = (resource: Resource) => void navigate({ view: 'document', runId: resource.run_id, resourceId: resource.resource_id, resourcePath: resource.registered_reference });
  const back = () => {
    returnFocus.current = state.route.view === 'document' ? state.route.resourceId ?? null : state.route.runId ?? null;
    void navigate(state.route.view === 'document' ? { view: 'detail', runId: state.route.runId } : { view: 'overview' });
  };
  const current = state.route.view === 'document' ? state.document : state.route.view === 'detail' ? state.detail : state.inventory;
  return <div className="shell"><aside className="rail"><div className="brand"><span className="brand-mark">a</span><span>AGDF<small>Control Cockpit</small></span></div><div className="rail-label">Lokaler Arbeitsbereich</div><button className="nav-item" onClick={() => void navigate({ view: 'overview' })}>▦ <span>Run-Übersicht</span></button><div className="rail-footer"><span className="live-dot"/> Lokale Sitzung<br/><small>Entscheidungen bleiben bei dir.</small></div></aside>
    <div className="workspace"><header><span>AGDF / Kontrollübersicht</span><span className="read-only">◉ Nur Lesen</span></header><main>
      <div className="page-title"><div><div className="eyebrow">Dein Repository · Deine Quellen</div><h1 ref={heading} tabIndex={-1}>{state.route.view === 'overview' ? 'Run-Übersicht' : state.route.view === 'detail' ? 'Run verstehen' : 'Dokument lesen'}</h1><p>Kontrollstatus und Nachweise an einem Ort.</p></div><div className="actions">{state.route.view !== 'overview' && <button onClick={back} disabled={state.phase === 'loading'}>← Zurück</button>}<button className="primary" onClick={() => void navigate(state.route, true)} disabled={!secret || state.phase === 'loading'}>Neu laden</button></div></div>
      {!secret && <ReadState state="blocked" code="session_invalid"/>}
      {state.inventory && <div className="provenance"><div><span>Repository</span><code>{state.inventory.target.display_path}</code></div><div><span>Beobachtet</span><time>{state.inventory.observed_as_of ? new Date(state.inventory.observed_as_of).toLocaleString('de-DE') : 'Nicht verfügbar'}</time></div><div><span>Datenstand</span><code>{state.inventory.snapshot_id}</code></div></div>}
      <div aria-live="polite" className="reading-feedback">{state.phase === 'loading' && <p>Kontrolldaten werden gelesen …{state.inventory ? ' Vorheriger Datenstand bleibt sichtbar.' : ''}</p>}</div>
      {state.problem && <ReadState state={state.stale ? 'stale' : 'error'} code={state.problem}/>}
      {(state.phase === 'error' || state.inventory?.retryable && !state.inventory.data) && secret && <button className="retry" onClick={() => void navigate(state.route, true)}>Wiederholen</button>}
      {state.removed && <ReadState state="missing" code="run_removed"/>}
      {state.stale && <p className="stale-label">Vorheriger Datenstand · Diese Ansicht ist keine aktuelle Auswertung.</p>}
      <div className={state.phase === 'loading' ? 'previous-content' : ''} aria-busy={state.phase === 'loading'}>
        {state.inventory && state.route.view === 'overview' && <Overview result={state.inventory} onSelect={id => void navigate({ view: 'detail', runId: id })}/>}
        {state.detail && state.route.view === 'detail' && <RunDetail result={state.detail} onOpen={open}/>}
        {state.document && state.route.view === 'document' && <DocumentView result={state.document} onOpen={id => { const resource = state.detail?.data?.resources.find(r => r.resource_id === id); if (resource) open(resource); }}/>}</div>
      <footer>Lokale Beobachtung · {label(current?.state)} · Das Cockpit verändert keine Kontrolldateien.</footer>
    </main></div></div>;
}
const knownErrors: Record<string, boolean> = Object.fromEntries(['source_changed', 'session_invalid', 'resource_denied', 'read_failed', 'busy', 'timeout', 'resource_limit', 'control_absent', 'dto_invalid'].map(c => [c, true]));
