import { useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { hasExpiredSession, type ReadingState } from '../state';
import { label, ReadState, ReadingFeedback } from '../feedback';
import { BrandHeader } from '../BrandHeader';
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
  const runs = state.inventory?.data?.runs ?? [], active = runs.filter(r => r.lifecycle === 'active');
  const [search, setSearch] = useState('');
  const [choosing, setChoosing] = useState(false);
  const pickerId = useId(), picker = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (choosing) picker.current?.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')?.focus();
  }, [choosing]);
  const shown = runs.filter(r => `${r.title} ${r.run_id} ${r.current_gate ?? ''}`.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')));
  const affected = runs.filter(r => !r.valid || r.code);
  const selected = runs.find(r => r.run_id === state.route.runId), data = state.detail?.data, e = data?.evaluation;
  const focused = !!initialRunId && !!selected?.valid && data?.run_id === selected.run_id
    && (state.detail?.state === 'available' || state.detail?.state === 'partial') && !state.problem && !state.removed;
  const expired = hasExpiredSession(state);
  const busy = state.phase === 'loading', usable = !expired && enabled && !busy && !state.stale && state.phase === 'ready' && !!state.inventory?.data;
  const target = state.inventory?.target.display_path;
  const inventoryNotice = state.inventory?.code && state.inventory.data && !state.problem ? <ReadState state={state.inventory.state} code={state.inventory.code}/> : null;
  const inventoryHints = !expired && inventoryNotice && <details className="compact-inventory"><summary>Inventarhinweise{affected.length > 0 && <span> · {affected.length} von {runs.length} Runs eingeschränkt</span>}</summary>
    {affected.length ? <><p>Betroffene Runs auswählen, um die verfügbaren Diagnosen zu lesen.</p><ul>{affected.map(r => <li key={r.run_id}><button className="text-link" disabled={expired || busy} onClick={() => onSelect(r.run_id)}>{r.title} · {r.run_id}</button><small>{label(r.valid ? 'blocked' : 'invalid')} · {r.code ?? 'invalid_run'}</small><code>{r.source_path}</code></li>)}</ul></> : inventoryNotice}
  </details>;
  return <section className="compact-cockpit agdf-surface" aria-label="AGDF Cockpit" aria-busy={busy || state.refreshing}>
    <BrandHeader variant="card" projectPath={target} contextTitle={selected?.title} headingRef={headingRef}>
      <button className="compact-reload" onClick={onReload} disabled={expired || !enabled || busy} aria-label="Neu laden"><Icon name="reload"/></button>
    </BrandHeader>
    {state.route.view !== 'document' && (!focused || choosing) && <div className="compact-controls" id={pickerId} ref={picker}>
    <div className="compact-counts"><span><strong>{active.length}</strong> aktive Runs</span><span>{runs.length} insgesamt</span></div>
    {runs.length > 12 && <label className="compact-search">Runs suchen<input type="search" placeholder="Titel, Run-ID oder Gate" value={search} onChange={event => setSearch(event.target.value)}/></label>}
    <label className="compact-select">Run auswählen
      <select value={selected?.run_id ?? ''} disabled={expired || !enabled || busy || !runs.length} onChange={event => event.target.value ? onSelect(event.target.value) : onOverview()}>
        <option value="">Alle Runs · bewusst auswählen</option>
        {selected && !shown.some(r => r.run_id === selected.run_id) && <option value={selected.run_id}>{selected.title} · {selected.run_id}</option>}
        <optgroup label="Aktive Runs">{shown.filter(r => r.lifecycle === 'active').map(r => <option key={r.run_id} value={r.run_id}>{r.title} · {r.current_gate ?? 'Gate fehlt'} · {r.run_id}</option>)}</optgroup>
        <optgroup label="Weitere Runs">{shown.filter(r => r.lifecycle !== 'active').map(r => <option key={r.run_id} value={r.run_id}>{r.title} · {label(r.lifecycle)} · {r.run_id}</option>)}</optgroup>
      </select>
    </label>
    {search && <p className="compact-search-result" role="status">{shown.length} Treffer · Die aktuelle Auswahl bleibt erhalten.</p>}
    </div>}
    {!enabled && <ReadState state="blocked" code="session_invalid"/>}
    <ReadingFeedback state={state}/>
    <div className={busy ? 'previous-content' : undefined}>
      {state.route.view === 'document' && state.document ? <div className="compact-document">
        <button className="text-link" onClick={onBack} disabled={!usable}>Zurück zum Arbeitsstand</button>
        <DocumentView result={state.document} runTitle={selected?.title} onOpen={id => { const resource = data?.resources.find(r => r.resource_id === id); if (resource) onOpen?.(resource); }}/>
      </div> : selected && data ? <div className="compact-run">
        <div className="compact-run-summary">
        <h2>{selected.title}</h2>
        {state.detail?.code && <ReadState state={state.detail.state} code={state.detail.code}/>}
        {e && data.persisted && (data.persisted.current_gate !== e.current_gate || data.persisted.next_allowed_action !== e.next_allowed_action) && <ReadState state="partial" code="persisted_mismatch"/>}
        </div><div className="compact-run-followup">
        <WorkStep data={data} compact onOpen={onOpen} sourceDisabled={!usable} current={usable && state.detail?.state === 'available' && !(e && data.persisted && (data.persisted.current_gate !== e.current_gate || data.persisted.next_allowed_action !== e.next_allowed_action))}>
        <div className="compact-actions"><button className="text-link" disabled={!usable || !onExpand} onClick={onExpand}>Run ansehen <Icon name="expand"/></button>{focused ? <button className="text-link" disabled={expired || busy} aria-expanded={choosing} aria-controls={pickerId} onClick={() => setChoosing(value => !value)}>{choosing ? 'Auswahl schließen' : 'Anderen Run wählen'}</button> : <button className="text-link" disabled={expired || busy} onClick={onOverview}>Alle Runs</button>}</div>
        </WorkStep></div>
        <details className="compact-identity"><summary>Ziel und Run-ID · Originalangaben</summary><code className="compact-run-id">{data.run_id}</code>
        {data.objective && data.objective !== selected.title && <p className="compact-goal">{data.objective}</p>}</details>
      </div> : <div className="compact-overview">
        <p className="compact-muted">Wähle einen Run für Status, offene Nachweise und den nächsten erlaubten Schritt.</p>
        <button className="primary" disabled={!usable || !onExpand} onClick={onExpand}>Run-Übersicht <span aria-hidden="true">↗</span></button>
      </div>}
    </div>
    {inventoryHints}
    <div className="compact-footnote">Freigaben bleiben bei dir.{state.inventory?.observed_as_of && <time dateTime={state.inventory.observed_as_of}>Stand {new Date(state.inventory.observed_as_of).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</time>}</div>
  </section>;
}
