import { useState } from 'react';
import { projectCockpitRuns } from '../../core/lib/control-inspect/cockpit-list.js';
import type { Envelope, RunInventory } from './types';
import type { BacklogView } from './Overview';
import { ReadState } from './feedback';

export function RunOverview({ result, onSelect, current, view, onViewChange }: {
  result: Envelope<RunInventory>; onSelect: (id: string) => void; current: boolean;
  view?: BacklogView; onViewChange?: (view: BacklogView) => void;
}) {
  const [local, setLocal] = useState<BacklogView>({ section: 'active', filter: '' });
  const value = view ?? local, section = value.section === 'history' ? 'history' : 'active';
  const change = onViewChange ?? setLocal, inventory = result.data;
  if (!inventory) return <ReadState state={result.state} code={result.code}/>;
  const list = projectCockpitRuns(inventory, { section, query: value.filter });
  const count = (n: number) => list.coverage === 'partial' ? `mindestens ${n}` : list.coverage === 'unavailable' ? 'nicht verfügbar' : String(n);
  return <section className="panel agdf-surface backlog-overview" aria-label="Run-Übersicht">
    <div className="backlog-controls"><div className="backlog-switch" role="group" aria-label="Run-Bereich">
      {(['active', 'history'] as const).map(area => <button key={area} type="button" aria-pressed={section === area} onClick={() => change({ section: area, filter: '' })}>
        {area === 'active' ? 'Aktiv' : 'Historie'} <strong>{count(projectCockpitRuns(inventory, { section: area }).sectionCount)}</strong>
      </button>)}
    </div>
    <label className="search backlog-search">{section === 'active' ? 'Aktiv' : 'Historie'}: Runs suchen<input type="search" data-focus-id="backlog-search" value={value.filter}
      placeholder="Inventartitel, Run-ID oder gespeicherter Status" onChange={event => change({ section, filter: event.target.value })}/></label>
    <p className="muted">Gespeicherte Orientierung · Inventarreihenfolge nach Aufmerksamkeit und Aktivität. Die Suche umfasst den angezeigten Titel, Run-ID und Status. Erst das Öffnen prüft den Run aktuell.</p>
    {list.coverage !== 'complete' && <p role="status">{list.coverage === 'partial' ? 'Bestand eingeschränkt lesbar. Zähler und Suche können unvollständig sein.' : 'Run-Bestand nicht verfügbar. Dies ist kein vollständiger leerer Bestand.'}</p>}
    {!!inventory.diagnostics.length && <details className="notice"><summary>{inventory.diagnostics.length} Lesehinweise</summary><ul>{inventory.diagnostics.map((d, i) => <li key={i}><code>{d.code}</code>{d.message && <p>{d.message}</p>}{d.next_step && <p>{d.next_step}</p>}</li>)}</ul></details>}
    <div className="backlog-heading"><h2 tabIndex={-1} data-focus-id="backlog-heading">{section === 'active' ? 'Aktive Runs' : 'Run-Historie'}</h2><p role="status">{count(list.matchCount)} Treffer · Bereich: {count(list.sectionCount)}</p></div></div>
    {!list.rows.length && list.coverage !== 'unavailable' && <p>{value.filter ? 'Keine passenden Runs im gelesenen Bestand. Suche ändern oder löschen.' : 'Keine Runs in diesem Bereich im gelesenen Bestand.'}</p>}
    <div id="backlog-list" role="region" aria-label="Run-Liste" tabIndex={0}><ul className="undertaking-list" aria-label={section === 'active' ? 'Aktive Runs' : 'Run-Historie'}>{list.rows.map(run => <li key={run.run_id} data-backlog-row>
      <article className="undertaking"><h3><button className="run-link" data-focus-id={run.run_id} disabled={!current || !run.selectable} onClick={() => onSelect(run.run_id)}>{run.title}</button></h3>
      <p>{run.attention.label}{run.lifecycle ? ` · ${run.lifecycle}` : ' · Zustand unbestätigt'}</p>
      <p>{run.basis}</p>{run.next_action && <p>{run.next_action}</p>}
      <details><summary>Run-ID und Herkunft</summary><code>{run.run_id}</code><p>{run.path}</p><p>Revision: {run.revision_id ?? 'unbekannt'}</p>
        <p>Titelquelle: {run.title_source === 'run_id' ? 'Run-ID als Rückfall' : 'gespeichertes Ziel'}</p><p>Letzte bekannte Aktivität: {run.last_activity.at ?? 'unbekannt'}</p>
        {!run.valid && <p>{run.selectable ? 'Ungültiger Eintrag: Öffnen zeigt die Diagnose, keine bestätigte Freigabe.' : 'Ungültige Run-ID: Eintrag nur als Diagnose lesbar.'}</p>}</details>
      </article></li>)}</ul></div>
  </section>;
}
