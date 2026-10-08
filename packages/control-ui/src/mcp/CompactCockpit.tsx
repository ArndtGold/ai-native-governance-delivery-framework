import { useId, useRef, useState, type RefObject } from 'react';
import { hasExpiredSession, type ReadingState } from '../state';
import { ReadState, ReadingFeedback, readingStatus } from '../feedback';
import { BrandHeader } from '../BrandHeader';
import { RefreshControl } from '../RefreshControl';
import { Icon } from './Icon';
import { WorkStep } from '../WorkStep';
import { DocumentView } from '../DocumentView';
import type { Resource } from '../types';

export function CompactCockpit({ state, headingRef, enabled, initialRunId, onSelect, onReload, onOverview, onExpand, onOpen, onBack }: {
  state: ReadingState; headingRef: RefObject<HTMLHeadingElement | null>; enabled: boolean;
  initialRunId?: string;
  onSelect: (id: string) => void; onReload: () => void; onOverview: () => void; onExpand?: () => void;
  onOpen?: (resource: Resource, origin?: string) => void; onBack?: () => void;
}) {
  const entries = state.inventory?.data?.entries ?? [];
  const [search, setSearch] = useState('');
  const pickerId = useId(), picker = useRef<HTMLDivElement>(null);
  const shown = entries.filter(r => `${r.title} ${r.key} ${r.stored_status}`.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')));
  const data = state.detail?.data, e = data?.evaluation;
  const selected = data ? { run_id: data.run_id, title: data.title ?? data.run_id } : null;
  const expired = hasExpiredSession(state);
  const status = readingStatus(state);
  const busy = state.phase === 'loading', usable = !expired && enabled && !busy && !state.stale && !state.problem && state.phase === 'ready' && !!state.scope?.data;
  const target = state.scope?.target.display_path;
  const inventoryHints = !!state.inventory?.data?.diagnostics.length && <details className="compact-inventory"><summary>Backlog-Hinweise · {state.inventory.data.diagnostics.length}</summary><ReadState state={state.inventory.state} code={state.inventory.code}/><ul>{state.inventory.data.diagnostics.map((d, i) => <li key={i}><code>{d.code}</code>{d.message && <p>{d.message}</p>}</li>)}</ul></details>;
  return <section className="compact-cockpit agdf-surface" aria-label="AGDF Cockpit" aria-busy={busy || state.refreshing}>
    <BrandHeader variant="card" projectPath={target} contextTitle={selected?.title} headingRef={headingRef}>
      <RefreshControl state={state} enabled={enabled} onReload={onReload}/>
    </BrandHeader>
    {state.route.view === 'overview' && state.inventory?.data && <div className="compact-controls" id={pickerId} ref={picker}>
    <div className="compact-counts"><span><strong>{entries.length}</strong> Backlog-Einträge</span></div>
    {entries.length > 12 && <label className="compact-search">Vorhaben suchen<input type="search" placeholder="Titel, Schlüssel oder gespeicherter Status" value={search} onChange={event => setSearch(event.target.value)}/></label>}
    <label className="compact-select">Vorhaben auswählen
      <select value="" disabled={!usable || !entries.length} onChange={event => { if (event.target.value) onSelect(event.target.value); }}>
        <option value="">Gespeicherte Vorhaben · bewusst auswählen</option>
        {shown.map((r, index) => <option key={`${r.section}:${r.key}:${index}`} value={r.key} disabled={!r.selectable}>{r.title} · gespeichert: {r.stored_status} · {r.key}</option>)}
      </select>
    </label>
    {search && <p className="compact-search-result" role="status">{shown.length} Treffer</p>}
    </div>}
    {!enabled && <ReadState state="blocked" code="session_invalid"/>}
    <ReadingFeedback state={state}/>
    <div className={busy ? 'previous-content' : undefined}>
      {state.route.view === 'document' && state.document ? <div className="compact-document">
        <button className="text-link" onClick={onBack} disabled={!usable}>Zurück zum Arbeitsstand</button>
        <DocumentView result={state.document} detail={state.detail ?? undefined} current={!state.stale && !state.problem && state.phase === 'ready'} runTitle={selected?.title} onOpen={id => { const resource = data?.resources.find(r => r.resource_id === id); if (resource) onOpen?.(resource); }}/>
      </div> : selected && data ? <div className="compact-run">
        <div className="compact-run-summary">
        <h2>{selected.title}</h2>
        {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
        {e && data.persisted && (data.persisted.current_gate !== e.current_gate || data.persisted.next_allowed_action !== e.next_allowed_action) && <ReadState state="partial" code="persisted_mismatch"/>}
        </div><div className="compact-run-followup">
        <WorkStep data={data} compact onOpen={onOpen} sourceDisabled={!usable} current={usable && state.detail?.state === 'available' && !(e && data.persisted && (data.persisted.current_gate !== e.current_gate || data.persisted.next_allowed_action !== e.next_allowed_action))}>
        <div className="compact-actions"><button className="text-link" disabled={!usable || !onExpand} onClick={onExpand}>Run ansehen <Icon name="expand"/></button><button className="text-link" disabled={expired || busy} onClick={onOverview}>Alle Vorhaben</button></div>
        </WorkStep></div>
        <details className="compact-identity"><summary>Ziel und Run-ID · Originalangaben</summary><code className="compact-run-id">{data.run_id}</code>
        {data.objective && data.objective !== selected.title && <p className="compact-goal">{data.objective}</p>}</details>
      </div> : state.route.view === 'overview' && state.inventory?.data ? <div className="compact-overview">
        <p className="compact-muted">Das Masterbacklog zeigt gespeicherte Angaben. Öffne ein Vorhaben für seinen aktuellen Kontrollstand.</p>
        <button className="primary" disabled={!usable || !onExpand} onClick={onExpand}>Vorhaben-Übersicht <span aria-hidden="true">↗</span></button>
      </div> : null}
    </div>
    {inventoryHints}
    <div className="compact-footnote"><span>Freigaben bleiben bei dir.{status.previous && ' Vorheriger Datenstand bleibt sichtbar.'}</span>{state.scope?.observed_as_of && <time dateTime={state.scope.observed_as_of}>Stand {new Date(state.scope.observed_as_of).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</time>}</div>
  </section>;
}
