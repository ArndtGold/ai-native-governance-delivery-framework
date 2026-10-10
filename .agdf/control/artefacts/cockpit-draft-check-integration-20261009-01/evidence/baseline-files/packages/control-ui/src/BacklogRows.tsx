import type { CockpitList, CockpitListRow } from '../../core/lib/control-inspect/cockpit-list.js';
import type { BacklogEntry, Diagnostic, TitleObservation } from './types';
import { reportFindingsLabel } from './presentation';

export function BacklogCounts({ list, displayed }: { list: CockpitList<BacklogEntry, Diagnostic>; displayed?: number }) {
  if (list.coverage === 'unavailable') return <p className="muted" role="status">Bereich nicht verfügbar · Anzahl nicht bestimmbar</p>;
  return <p className="backlog-counts" role="status">
    {list.sectionCount} {list.coverage === 'partial' ? 'lesbare Einträge · Eingeschränkt' : list.sectionCount === 1 ? 'Eintrag' : 'Einträge'}
    {list.query && <> · {list.matchCount} {list.coverage === 'partial' ? 'lesbare Treffer' : 'Treffer'}</>}
    {displayed !== undefined && <> · {displayed} angezeigt</>}
  </p>;
}
export function BacklogEmpty({ list }: { list: CockpitList<BacklogEntry, Diagnostic> }) {
  if (list.rows.length) return null;
  return <p className="muted" role="status">{list.coverage === 'unavailable'
    ? 'Dieser Bereich ist nicht auswertbar. Die Quelle prüfen und bewusst neu laden.'
    : list.coverage === 'partial' ? 'Keine lesbaren Treffer. Der Bestand ist eingeschränkt; weitere Vorhaben können fehlen.'
    : list.query ? 'Keine gespeicherten Vorhaben für diese Suche.' : 'In diesem Bereich sind keine Vorhaben gespeichert.'}</p>;
}
// Presentation only: membership/order/identity/provenance are supplied by Core.
export function BacklogRow({ row, current, onSelect, observation }: { row: CockpitListRow<BacklogEntry>; current: boolean; onSelect: (id: string) => void; observation?: TitleObservation; compact?: boolean }) {
  const r = row.entry, archived = r.section === 'Completed / Superseded Pointers';
  const summary = r.saved_summary, record = summary?.record;
  return <li data-backlog-row={row.identity}>
    <h3><button className="run-link" disabled={!current || !row.selectable} data-focus-id={r.key} onClick={() => onSelect(r.key)}>{row.displayTitle}</button></h3>
    <span className="status">Gespeicherter Stand laut Backlog: {r.stored_status || 'Nicht angegeben'}</span>
    {record && <p className="row-phase">{record.phase} · {summary?.label_de}{record.open_obligation_count > 0 && ` · ${reportFindingsLabel(record.open_obligation_count)}`}</p>}
    <p className="row-step">{archived ? 'Ergebnis laut Backlog' : 'Nächster Schritt laut Backlog'}: {record?.display_action || r.stored_next_step || 'Nicht angegeben'}</p>
    <p className="muted row-limitation">{summary?.limitation_de ?? 'Gespeicherter Stand; Quellenbezug und aktueller Run nicht geprüft.'}</p>
    {!row.selectable && <p className="muted">Dieser Eintrag ist nicht eindeutig zugeordnet und kann nicht geöffnet werden.</p>}
    <details className="row-source"><summary>Gespeicherte Angaben und Quellen</summary>
      <dl><dt>Titelherkunft</dt><dd>Gespeicherter Backlog-Titel</dd>
        <dt>Originaltitel</dt><dd>{row.provenance.originalTitle}</dd><dt>Schlüssel</dt><dd><code>{r.original_key}</code></dd>
        <dt>Backlog-Quelle</dt><dd><code>{row.provenance.path}</code></dd>
        <dt>Backlog-Digest</dt><dd><code>{row.provenance.digest}</code></dd>
        {record && <><dt>Gespeicherte Run-Revision</dt><dd><code>{record.revision_id}</code></dd>
          <dt>Synchronisiert</dt><dd>{new Date(record.observed_at).toLocaleString('de-DE')}</dd>
          {record.decisive_obligation && <><dt>Offene Aufgabe</dt><dd>{record.decisive_obligation.id} · {record.decisive_obligation.routing_target}</dd>
            <dt>Originalaktion</dt><dd>{record.decisive_obligation.action}</dd></>}
          <dt>Beobachtete Quellen</dt><dd>{record.sources.map(s => <p key={s.path}><code>{s.path}</code><br/><code>{s.digest}</code></p>)}</dd>
          {!!record.limitations.length && <><dt>Einschränkungen</dt><dd>{record.limitations.join(' · ')}</dd></>}
        </>}
        {observation && <><dt>Ergänzende UR-Überschrift</dt><dd>{observation.heading ?? 'Nicht verfügbar'}{observation.code && <code> · {observation.code}</code>}</dd>
          <dt>Beobachtet</dt><dd>{new Date(observation.observed_as_of).toLocaleString('de-DE')}</dd>
          {observation.path && <><dt>UR-Quelle</dt><dd><code>{observation.path}</code></dd></>}
          {observation.content_digest && <><dt>UR-Quelldigest</dt><dd><code>{observation.content_digest}</code></dd></>}
        </>}
        {r.priority && <><dt>Priorität</dt><dd>{r.priority}</dd></>}
        {r.scope && <><dt>Umfang</dt><dd>{r.scope}</dd></>}
        <dt>{archived ? 'Ergebnis' : 'Nächster Schritt'}</dt><dd>{r.stored_next_step || 'Nicht angegeben'}</dd>
        <dt>Quellen</dt><dd>{r.source_links || 'Keine Links gespeichert'}</dd>
        {r.current_spec && <><dt>Spezifikation</dt><dd>{r.current_spec}</dd></>}
      </dl>
    </details>
  </li>;
}
