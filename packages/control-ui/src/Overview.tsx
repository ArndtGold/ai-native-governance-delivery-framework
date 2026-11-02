import { RunOverview } from "./RunOverview";
import type { OverviewInventory, RunInventory } from "./types";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from 'react';
import { COCKPIT_WORK_SECTIONS, projectCockpitList } from '../../core/lib/control-inspect/cockpit-list.js';
import type { Envelope, Inventory, PlannedDocument } from './types';
import { ReadState } from './feedback';
import { WorkCounts, WorkEmpty, WorkRow } from './WorkRows';

const labels = ['Aktiv', 'Geplant', 'Archiv'];
const headings = ['Aktive Vorhaben', 'Geplante Vorhaben', 'Archivierte Vorhaben'];
export interface WorkView { section: string; filter: string }
function WorkOverview({ result, onSelect, loadPlanned, view, onViewChange, current = true }: { result: Envelope<Inventory>; onSelect: (id: string) => void; loadPlanned?: (rowId: string, signal: AbortSignal) => Promise<Envelope<PlannedDocument>>; view?: WorkView; onViewChange?: (view: WorkView) => void; current?: boolean }) {
  const [localView, setLocalView] = useState<WorkView>({ section: COCKPIT_WORK_SECTIONS[0], filter: '' });
  const { section: rawSelected, filter } = view ?? localView;
  const selected = COCKPIT_WORK_SECTIONS.some(section => section === rawSelected) ? rawSelected : COCKPIT_WORK_SECTIONS[0];
  const changeView = onViewChange ?? setLocalView;
  const inventory = result.data;
  const [planned, setPlanned] = useState<PlannedDocument | null>(null), [problem, setProblem] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => { pending.current?.abort(); setPlanned(null); setProblem(null); return () => pending.current?.abort(); }, [result.snapshot_id, current]);
  const openPlanned = loadPlanned ? async (rowId: string) => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setPlanned(null); setProblem(null);
    try { const response = await loadPlanned(rowId, controller.signal); if (!controller.signal.aborted) { if (!response.data) throw Error(response.code ?? 'read_failed'); setPlanned(response.data); } }
    catch (error) { if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : 'read_failed'); }
  } : undefined;
  const list = projectCockpitList(inventory, { section: selected, query: filter });
  const areas = COCKPIT_WORK_SECTIONS.map((section, index) => ({ section, label: labels[index], list: projectCockpitList(inventory, { section }) }));
  const areaIndex = COCKPIT_WORK_SECTIONS.findIndex(section => section === selected);
  return <section className="panel agdf-surface backlog-overview" aria-label="Geplante URs und Runs">
    <div className="backlog-controls">
    <div className="backlog-tools">
    <div className="backlog-switch" role="group" aria-label="Bestandsbereich">
      {areas.map(area => <button key={area.section} type="button" aria-pressed={selected === area.section} aria-controls="backlog-list"
        onClick={() => changeView({ section: area.section, filter: '' })}>
        <span className="backlog-area-label">{area.label}</span><strong>{area.list.sectionCount ?? 'Nicht verfügbar'}</strong>
        {area.list.coverage === 'partial' && <small>Eingeschränkt</small>}
      </button>)}
    </div>
    {inventory && <label className="search backlog-search">{labels[areaIndex]}: Vorhaben suchen<input type="search" data-focus-id="backlog-search" value={filter} onChange={e => changeView({ section: selected, filter: e.target.value })} placeholder="Titel, Schlüssel oder gespeicherter Status"/></label>}
    </div>
    {!!list.diagnostics.length && <details className="notice backlog-notice" role="status"><summary>Teilweise verfügbar · {labels[areaIndex]} · {list.diagnostics.length} {list.diagnostics.length === 1 ? 'Lesehinweis' : 'Lesehinweise'}</summary>
      <p>Hier sind Tabellen oder Einträge nicht eindeutig lesbar. Eingeschränkte Zähler sind kein vollständiger Bestand.</p>
      <ul>{list.diagnostics.map((d, i) => <li key={i}><code>{d.code}</code>{d.key && <code> · {d.key}</code>}{d.message && <p>{d.message}</p>}</li>)}</ul>
    </details>}
    <p className="muted">Geplante URs nach Priorität und Titel; Runs in der kanonischen Bestandsreihenfolge. Die Suche umfasst Titel, Kennung und Quellenstand.</p>
    <div className="backlog-heading">
      <h2 tabIndex={-1} data-focus-id="backlog-heading">{headings[areaIndex]}</h2><WorkCounts list={list}/>
    </div>
    </div>
    <div id="backlog-list" role="region" aria-label={`Vorhaben · ${labels[areaIndex]}`} tabIndex={0}>
      {!inventory ? <ReadState state={result.state} code={result.code}/> : <WorkEmpty list={list}/>}
      {!!list.rows.length && <ul className="undertaking-list">{list.rows.map(row => <WorkRow key={row.identity} row={row} current={current} onSelect={onSelect} onSelectPlanned={openPlanned}/>)}</ul>}
    </div>
    {problem && <p role="alert">UR konnte nicht sicher gelesen werden: {problem}. Bestand neu laden.</p>}
    {planned && current && <article aria-label="Geplante UR" className="panel"><h2>{planned.entry.title}</h2>
      <p>Nur UR-Planung · Keine Run-Freigabe · {planned.entry.readiness.ready ? 'Übergabe ausdrücklich bestätigen' : 'Klärung offen'}</p>
      <button onClick={() => setPlanned(null)}>UR schließen</button><pre style={{ whiteSpace: 'pre-wrap' }}>{planned.entry.content}</pre>
      <p><code>{planned.entry.path}</code> · <code>{planned.entry.digest}</code></p></article>}
  </section>;
}

export function Overview(props: Omit<ComponentProps<typeof WorkOverview>, 'result'> & { result: Envelope<OverviewInventory> }) {
  return props.result.data?.kind === 'runs'
    ? <RunOverview result={props.result as Envelope<RunInventory>} onSelect={props.onSelect} current={props.current ?? true} view={props.view} onViewChange={props.onViewChange}/>
    : <WorkOverview {...props} result={props.result as Envelope<Inventory>}/>;
}
