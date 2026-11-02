import type { CockpitList, CockpitListRow } from '../../core/lib/control-inspect/cockpit-list.js';
import type { WorkEntry, Diagnostic } from './types';
export function WorkCounts({ list }: { list: CockpitList<WorkEntry, Diagnostic> }) {
  if (list.coverage === 'unavailable') return <p className="muted" role="status">Bereich nicht verfügbar · Anzahl nicht bestimmbar</p>;
  return <p className="backlog-counts" role="status">{list.sectionCount} {list.coverage === 'partial' ? 'lesbare Einträge · Eingeschränkt' : list.sectionCount === 1 ? 'Eintrag' : 'Einträge'}
    {list.query && <> · {list.matchCount} Treffer</>}</p>;
}
export function WorkEmpty({ list }: { list: CockpitList<WorkEntry, Diagnostic> }) {
  if (list.rows.length) return null;
  return <p className="muted" role="status">{list.coverage === 'unavailable' ? 'Dieser Bereich ist nicht auswertbar. Die Quelle prüfen und bewusst neu laden.'
    : list.coverage === 'partial' ? 'Keine lesbaren Treffer. Der Bestand ist eingeschränkt; weitere Vorhaben können fehlen.'
    : list.query ? 'Keine Vorhaben für diese Suche.' : 'In diesem Bereich sind keine Vorhaben gespeichert.'}</p>;
}
export function WorkRow({ row, current, onSelect, onSelectPlanned, onSelectArchive }: { row: CockpitListRow<WorkEntry>; current: boolean;
  onSelect: (id: string) => void; onSelectPlanned?: (rowId: string) => void; onSelectArchive?: (rowId: string) => void }) {
  const r = row.entry;
  return <li data-work-row={row.identity}>
    <h3><button className="run-link" disabled={!current || !row.selectable || r.kind === 'planned' && !onSelectPlanned || r.kind === 'archive' && !onSelectArchive}
      data-focus-id={r.key} onClick={() => r.kind === 'planned' ? onSelectPlanned?.(r.row_id!) : r.kind === 'archive' ? onSelectArchive?.(r.row_id!) : onSelect(r.key)}>{row.displayTitle}</button></h3>
    <span className="status">Beobachteter Quellenstand: {r.stored_status || 'Nicht angegeben'}</span>
    <p>{r.scope}{r.priority ? ` · Priorität: ${r.priority}` : ''}</p>
    <p className="row-step">Nächster Schritt: {r.stored_next_step || 'Nicht angegeben'}</p>
    <details className="row-source"><summary>Quellenangaben</summary><dl>
      <dt>Originaltitel</dt><dd>{row.provenance.originalTitle}</dd>
      <dt>Kennung</dt><dd><code>{r.key}</code></dd>
      <dt>Quelle</dt><dd><code>{row.provenance.path}</code></dd>
      <dt>Inhaltskennung</dt><dd><code>{row.provenance.digest ?? 'Nicht verfügbar'}</code></dd>
    </dl></details>
  </li>;
}
