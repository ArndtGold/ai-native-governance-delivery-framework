import type { WorkSituation } from '../../core/lib/control-inspect/work-situation.js';
import type { CockpitList, CockpitListRow } from '../../core/lib/control-inspect/cockpit-list.js';
import type { WorkEntry, Diagnostic } from './types';
import { Icon } from './mcp/Icon';
export function WorkCounts({ list, filtered = false }: { list: CockpitList<WorkEntry, Diagnostic>; filtered?: boolean }) {
  if (list.coverage === 'unavailable') return <p className="muted" role="status">Bereich nicht verfügbar · Anzahl nicht bestimmbar</p>;
  return <p className="backlog-counts" role="status">{list.sectionCount} {list.coverage === 'partial' ? 'lesbare Einträge · Eingeschränkt' : list.sectionCount === 1 ? 'Eintrag' : 'Einträge'}
    {(list.query || filtered) && <> · {list.matchCount} Treffer</>}</p>;
}
export function WorkEmpty({ list }: { list: CockpitList<WorkEntry, Diagnostic> }) {
  if (list.rows.length) return null;
  return <p className="muted" role="status">{list.coverage === 'unavailable' ? 'Dieser Bereich ist nicht auswertbar. Die Quelle prüfen und bewusst neu laden.'
    : list.coverage === 'partial' ? 'Keine lesbaren Treffer. Der Bestand ist eingeschränkt; weitere Vorhaben können fehlen.'
    : list.query ? 'Keine Vorhaben für diese Suche.' : 'In diesem Bereich sind keine Vorhaben gespeichert.'}</p>;
}
export function WorkRow({ row, current, compact = false, selected = false, selectedTitle, selectedSituation, onSelect, onSelectPlanned, onSelectArchive }: { row: CockpitListRow<WorkEntry>; current: boolean; compact?: boolean; selected?: boolean; selectedTitle?: string; selectedSituation?: WorkSituation;
  onSelect: (id: string) => void; onSelectPlanned?: (rowId: string) => void; onSelectArchive?: (rowId: string) => void }) {
  const r = row.entry;
  const status = selected && selectedSituation ? selectedSituation.de : r.stored_status;
  const attention = selected && selectedSituation ? selectedSituation.code : r.attention_code ?? 'unclear';
  const activity = r.last_activity?.at && !Number.isNaN(Date.parse(r.last_activity.at)) ? new Date(r.last_activity.at) : null;
  const sealLabel = r.seal === 'valid' ? 'Siegel gültig' : r.seal === 'invalid' ? 'Siegelprüfung fehlgeschlagen' : r.seal === 'unsealed' ? 'Kein Siegel vorhanden' : 'Siegel nicht geprüft';
  const lifecycles = { active: ['●', 'Aktiv'], completed: ['✓', 'Abgeschlossen'], superseded: ['↪', 'Abgelöst'], abandoned: ['■', 'Abgebrochen'] } as const;
  const lifecycle = r.lifecycle ? lifecycles[r.lifecycle] : undefined;
  return <li data-work-row={row.identity} data-selected={selected || undefined}>
    {r.kind === 'run' && <span className={`work-row-lifecycle work-row-lifecycle--${r.lifecycle ?? 'unknown'}`}><span aria-hidden="true">{lifecycle?.[0] ?? '○'}</span> {lifecycle?.[1] ?? 'Lifecycle unbekannt'}</span>}
    <h3><button className="run-link" disabled={!current || !row.selectable || r.kind === 'planned' && !onSelectPlanned || r.kind === 'archive' && !onSelectArchive}
      data-focus-id={r.key} aria-current={selected ? 'true' : undefined} onClick={() => r.kind === 'planned' ? onSelectPlanned?.(r.row_id!) : r.kind === 'archive' ? onSelectArchive?.(r.row_id!) : onSelect(r.key)}>{r.kind === 'run' ? (selected && selectedTitle ? selectedTitle : r.title_source === 'objective' ? r.key : row.displayTitle) : row.displayTitle}{compact && <span className="compact-row-arrow" aria-hidden="true">›</span>}</button></h3>
    {r.kind === 'run' && r.objective && <p className="work-row-objective">{r.objective}</p>}
    {r.kind === 'run' && r.title_source === 'run_id' && <p className="work-row-source-note">Name aus Run-Kennung; ein UR-Titel ist nicht verfügbar.</p>}
    <div className="work-row-status" data-attention={attention}><span aria-hidden="true" className="work-row-status-icon">{attention === 'decision_required' ? '◷' : attention === 'blocked' || attention === 'clarification_required' ? '!' : attention === 'none' ? '✓' : '•'}</span><div><span className="status">{status || 'Nicht angegeben'}</span><small>{selected && selectedSituation ? 'Aktueller Arbeitsstand' : 'Zuletzt beobachteter Stand'}</small></div></div>
    {r.kind === 'run' && <div className="work-row-meta">{activity && <time dateTime={r.last_activity!.at!}>Letzte Aktivität: {activity.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</time>}{r.seal && <span className={`work-row-seal work-row-seal--${r.seal}`}><Icon name={r.seal === 'valid' ? 'shield' : r.seal === 'invalid' ? 'shield-alert' : 'shield-unknown'}/>{sealLabel}</span>}</div>}
    {compact && r.kind === 'run' && <p className="compact-row-id">{r.key}</p>}
    {!compact && (r.kind !== 'run' || !row.selectable) && <>
    <details className="row-source"><summary>Quellenangaben</summary><dl>
      <dt>Umfang</dt><dd>{r.scope}{r.priority ? ` · Priorität: ${r.priority}` : ''}</dd>
      <dt>Nächster gespeicherter Schritt</dt><dd className="row-step">Nächster Schritt: {r.stored_next_step || 'Nicht angegeben'}</dd>
      <dt>Originaltitel</dt><dd>{row.provenance.originalTitle}</dd>
      <dt>Kennung</dt><dd><code>{r.key}</code></dd>
      <dt>Quelle</dt><dd><code>{row.provenance.path}</code></dd>
      <dt>Inhaltskennung</dt><dd><code>{row.provenance.digest ?? 'Nicht verfügbar'}</code></dd>
    </dl></details></>}
  </li>;
}
