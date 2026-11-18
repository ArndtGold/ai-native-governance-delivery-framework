import { ArchiveDetail, type ArchiveLoader } from './ArchiveDetail';
import { RunOverview } from "./RunOverview";
import { OverviewList } from './OverviewList';
import { Icon } from './mcp/Icon';
import type { OverviewInventory, RunInventory } from "./types";
import type { ComponentProps } from "react";
import type { WorkSituation } from '../../core/lib/control-inspect/work-situation.js';
import { useEffect, useRef, useState } from 'react';
import { projectCockpitList } from '../../core/lib/control-inspect/cockpit-list.js';
import type { Envelope, Inventory, PlannedDocument } from './types';
import { ReadState } from './feedback';
import { WorkEmpty, WorkRow } from './WorkRows';
import { areaCount, SelectionFilter } from './StatusFilter';
import { LifecycleFilter } from './LifecycleFilter';

const areasConfig = [{ section: 'runs', label: 'Runs' }, { section: 'planned', label: 'Geplant' }, { section: 'archive', label: 'Archiv' }];
export interface WorkView { section: string; filter: string; lifecycle?: string }
function WorkOverview({ result, onSelect, loadPlanned, loadArchive, view, onViewChange, current = true, compact = false, selectedId, selectedTitle, selectedSituation }: { compact?: boolean; result: Envelope<Inventory>; onSelect: (id: string) => void; loadArchive?: ArchiveLoader; loadPlanned?: (rowId: string, signal: AbortSignal) => Promise<Envelope<PlannedDocument>>; view?: WorkView; onViewChange?: (view: WorkView) => void; current?: boolean; selectedId?: string; selectedTitle?: string; selectedSituation?: WorkSituation }) {
  const [localView, setLocalView] = useState<WorkView>({ section: 'runs', filter: '' });
  const { section: rawSelected, filter, lifecycle = '' } = view ?? localView;
  const selected = areasConfig.some(area => area.section === rawSelected) ? rawSelected : 'runs';
  const changeView = onViewChange ?? setLocalView;
  const inventory = result.data;
  const archiveFocus = useRef<string | null>(null);
  const [archiveRow, setArchiveRow] = useState<string | null>(null);
  const [planned, setPlanned] = useState<PlannedDocument | null>(null), [problem, setProblem] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    if (archiveRow || !archiveFocus.current) return;
    const key = archiveFocus.current; archiveFocus.current = null;
    const element = [...document.querySelectorAll<HTMLElement>('[data-focus-id]')].find(node => node.dataset.focusId === key);
    element?.focus();
  }, [archiveRow]);
  useEffect(() => { pending.current?.abort(); setPlanned(null); setArchiveRow(null); setProblem(null); return () => pending.current?.abort(); }, [result.snapshot_id, current]);
  const openPlanned = loadPlanned ? async (rowId: string) => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setPlanned(null); setProblem(null);
    try { const response = await loadPlanned(rowId, controller.signal); if (!controller.signal.aborted) { if (!response.data) throw Error(response.code ?? 'read_failed'); setPlanned(response.data); } }
    catch (error) { if (!controller.signal.aborted) setProblem(error instanceof Error ? error.message : 'read_failed'); }
  } : undefined;
  let projected = projectCockpitList(inventory, { section: selected, query: filter });
  if (filter.trim() && selectedId && selectedTitle?.toLocaleLowerCase('de').includes(filter.trim().toLocaleLowerCase('de'))) {
    const all = projectCockpitList(inventory, { section: selected });
    const matching = new Set(projected.rows.map(row => row.identity));
    const rows = all.rows.filter(row => matching.has(row.identity) || row.entry.kind === 'run' && row.entry.key === selectedId);
    projected = { ...projected, rows, matchCount: rows.length };
  }
  const rows = selected === 'runs' && lifecycle ? projected.rows.filter(row => (row.entry.lifecycle ?? 'unknown') === lifecycle) : projected.rows;
  const list = { ...projected, rows, matchCount: projected.matchCount === null ? null : rows.length };
  const areas = areasConfig.map(area => ({ ...area, list: projectCockpitList(inventory, { section: area.section }) }));
  const areaLabel = areasConfig.find(area => area.section === selected)!.label;
  if (archiveRow && loadArchive && current) return <ArchiveDetail rowId={archiveRow} load={loadArchive}
    onClose={() => { archiveFocus.current = inventory?.entries.find(row => row.row_id === archiveRow)?.key ?? null; setArchiveRow(null); }}/>;
  return <section className="panel agdf-surface backlog-overview" aria-label="Geplante URs und Runs">
    <div className="backlog-controls">
    <div className="backlog-tools"><div className="backlog-selects">
    <SelectionFilter label="Bestandsbereich" focusId="backlog-heading" value={selected} options={areas.map(area => ({ value: area.section, label: area.label,
      detail: areaCount(area.list.coverage === 'partial' ? area.list.rows.filter(row => row.selectable).length : area.list.sectionCount, area.list.coverage) }))}
      onChange={section => changeView({ section, filter: '' })}/>
    {inventory && selected === 'runs' && <LifecycleFilter value={lifecycle} unknown={inventory.entries.some(row => row.kind === 'run' && !row.lifecycle)} onChange={lifecycle => changeView({ section: selected, filter, lifecycle })}/>}
    </div>{inventory && <label className="search backlog-search">Suchen<span className="backlog-search-input"><Icon name="search"/><input type="search" data-focus-id="backlog-search" value={filter} onChange={e => changeView({ section: selected, filter: e.target.value, lifecycle })} placeholder="Titel oder Kennung"/></span></label>}
    </div>
    {!!list.diagnostics.length && <details className="notice backlog-notice" role="status"><summary>Teilweise verfügbar · {areaLabel} · {list.diagnostics.length} {list.diagnostics.length === 1 ? 'Lesehinweis' : 'Lesehinweise'}</summary>
      <p>Hier sind Tabellen oder Einträge nicht eindeutig lesbar. Eingeschränkte Zähler sind kein vollständiger Bestand.</p>
      <ul>{list.diagnostics.map((d, i) => <li key={i}><code>{d.code}</code>{d.key && <code> · {d.key}</code>}{d.message && <p>{d.message}</p>}</li>)}</ul>
    </details>}
    {list.coverage === 'partial' && !list.diagnostics.length && <p role="status">Bestand eingeschränkt lesbar. Weitere Anforderungen können fehlen.</p>}
    </div>
    <OverviewList compact={compact} label={`Vorhaben · ${areaLabel}`}>
      {!inventory ? <ReadState state={result.state} code={result.code}/> : lifecycle && selected === 'runs' && !list.rows.length && list.coverage !== 'unavailable' ? <p role="status">Keine Runs für diesen Lifecycle und diese Suche.</p> : <WorkEmpty list={list}/>}
      {!!list.rows.length && <ul className="undertaking-list">{list.rows.map(row => <WorkRow compact={compact} key={row.identity} row={row} current={current} selected={row.entry.kind === 'run' && row.entry.key === selectedId} selectedTitle={selectedTitle} selectedSituation={selectedSituation} onSelect={onSelect} onSelectPlanned={openPlanned} onSelectArchive={loadArchive ? setArchiveRow : undefined}/>)}</ul>}
    </OverviewList>
    {problem && <p role="alert">UR konnte nicht sicher gelesen werden: {problem}. Bestand neu laden.</p>}
    {planned && current && <article aria-label="Geplante UR" className="panel"><h2>{planned.entry.title}</h2>
      <p>Nur UR-Planung · Keine Run-Freigabe · {planned.entry.readiness.ready ? 'Übergabe ausdrücklich bestätigen' : 'Klärung offen'}</p>
      <button onClick={() => setPlanned(null)}>UR schließen</button><pre style={{ whiteSpace: 'pre-wrap' }}>{planned.entry.content}</pre>
      <p><code>{planned.entry.path}</code> · <code>{planned.entry.digest}</code></p></article>}
  </section>;
}

export function Overview(props: Omit<ComponentProps<typeof WorkOverview>, 'result'> & { result: Envelope<OverviewInventory> }) {
  return props.result.data?.kind === 'runs'
    ? <RunOverview result={props.result as Envelope<RunInventory>} onSelect={props.onSelect} current={props.current ?? true} view={props.view} onViewChange={props.onViewChange} compact={props.compact} selectedId={props.selectedId} selectedTitle={props.selectedTitle} selectedSituation={props.selectedSituation}/>
    : <WorkOverview {...props} result={props.result as Envelope<Inventory>}/>;
}
