import type { WorkSituation } from '../../core/lib/control-inspect/work-situation.js';
import { useState } from 'react';
import { projectCockpitRuns } from '../../core/lib/control-inspect/cockpit-list.js';
import type { Envelope, RunInventory } from './types';
import type { WorkView } from './Overview';
import { ReadState } from './feedback';
import { OverviewList } from './OverviewList';
import { Icon } from './mcp/Icon';
import { SelectionFilter } from './StatusFilter';
import { LifecycleFilter } from './LifecycleFilter';

export function RunOverview({ result, onSelect, current, view, onViewChange, compact = false, selectedId, selectedTitle, selectedSituation }: { compact?: boolean; selectedId?: string; selectedTitle?: string; selectedSituation?: WorkSituation;
  result: Envelope<RunInventory>; onSelect: (id: string) => void; current: boolean;
  view?: WorkView; onViewChange?: (view: WorkView) => void;
}) {
  const [local, setLocal] = useState<WorkView>({ section: 'runs', filter: '' });
  const value = view ?? local, section = ['runs', 'planned', 'archive'].includes(value.section) ? value.section : 'runs';
  const change = onViewChange ?? setLocal, inventory = result.data;
  if (!inventory) return <ReadState state={result.state} code={result.code}/>;
  const projected = projectCockpitRuns(inventory, { section: 'runs', query: value.filter });
  const rows = section !== 'runs' ? [] : value.lifecycle ? projected.rows.filter(run => (run.lifecycle ?? 'unknown') === value.lifecycle) : projected.rows;
  const list = { ...projected, rows, matchCount: rows.length };
  return <section className="panel agdf-surface backlog-overview" aria-label="Run-Übersicht">
    <div className="backlog-controls"><div className="backlog-tools"><div className="backlog-selects"><SelectionFilter label="Bestandsbereich" focusId="backlog-heading" value={section}
      options={[{value:'runs',label:'Runs'}, {value:'planned',label:'Geplant',detail:'Nicht verfügbar'}, {value:'archive',label:'Archiv',detail:'Nicht verfügbar'}]}
      onChange={section => change({ section, filter: '' })}/>
    {section === 'runs' && <LifecycleFilter value={value.lifecycle ?? ''} unknown={inventory.runs.some(run => !run.lifecycle)} onChange={lifecycle => change({ ...value, section, lifecycle })}/>}</div>
    <label className="search backlog-search">Suchen<span className="backlog-search-input"><Icon name="search"/><input type="search" data-focus-id="backlog-search" value={value.filter}
      placeholder="Titel oder Kennung" onChange={event => change({ ...value, section, filter: event.target.value })}/></span></label></div>
    {list.coverage !== 'complete' && <p role="status">{list.coverage === 'partial' ? 'Bestand eingeschränkt lesbar. Zähler und Suche können unvollständig sein.' : 'Run-Bestand nicht verfügbar. Dies ist kein vollständiger leerer Bestand.'}</p>}
    {!!inventory.diagnostics.length && <details className="notice"><summary>{inventory.diagnostics.length} Lesehinweise</summary><ul>{inventory.diagnostics.map((d, i) => <li key={i}><code>{d.code}</code>{d.message && <p>{d.message}</p>}{d.next_step && <p>{d.next_step}</p>}</li>)}</ul></details>}
    </div>
    {section !== 'runs' ? <p role="status">Dieser Bereich ist in diesem Datenstand nicht verfügbar.</p> : !list.rows.length && list.coverage !== 'unavailable' && <p>{value.filter || value.lifecycle ? 'Keine passenden Runs im gelesenen Bestand. Suche oder Lifecycle ändern.' : 'Keine Runs im gelesenen Bestand.'}</p>}
    <OverviewList compact={compact} label="Run-Liste"><ul className="undertaking-list" aria-label="Runs">{list.rows.map(run => <li key={run.run_id} data-backlog-row data-selected={run.run_id === selectedId || undefined}>
      <article className="undertaking"><h3><button className="run-link" data-focus-id={run.run_id} aria-current={run.run_id === selectedId ? 'true' : undefined} disabled={!current || !run.selectable} onClick={() => onSelect(run.run_id)}>{run.run_id === selectedId && selectedTitle ? selectedTitle : run.run_id}{compact && <span className="compact-row-arrow" aria-hidden="true">›</span>}</button></h3>
      <p>{compact ? 'Zuletzt: ' : ''}{run.run_id === selectedId && selectedSituation ? selectedSituation.de : run.attention.label}{!compact && run.lifecycle ? ` · ${run.lifecycle}` : !compact ? ' · Zustand unbestätigt' : ''}</p>
      {compact && <p className="compact-row-id">{run.run_id}</p>}{!compact && <><p>{run.basis}</p>{run.next_action && <p>{run.next_action}</p>}
      <details><summary>Run-ID und Herkunft</summary><code>{run.run_id}</code><p>{run.path}</p><p>Revision: {run.revision_id ?? 'unbekannt'}</p>
        <p>Titelquelle: {run.title_source === 'run_id' ? 'Run-ID als Rückfall' : 'gespeichertes Ziel'}</p><p>Letzte bekannte Aktivität: {run.last_activity.at ?? 'unbekannt'}</p>
        {!run.valid && <p>{run.selectable ? 'Ungültiger Eintrag: Öffnen zeigt die Diagnose, keine bestätigte Freigabe.' : 'Ungültige Run-ID: Eintrag nur als Diagnose lesbar.'}</p>}</details>
      </>}</article></li>)}</ul></OverviewList>
  </section>;
}
