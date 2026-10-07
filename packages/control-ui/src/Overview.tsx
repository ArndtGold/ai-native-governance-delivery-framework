import { useState } from 'react';
import type { Envelope, Inventory } from './types';
import { ReadState } from './feedback';
import { backlogRowKey, useBacklogTitles, type TitleLoader, type BacklogTitleStore } from './useBacklogTitles';

const areas = [
  { section: 'Active Backlog', label: 'Aktiv' },
  { section: 'Planned / Parking Lot', label: 'Geplant' },
  { section: 'Completed / Superseded Pointers', label: 'Archiv' },
] as const;
const unreadableLayout = /^(backlog_(section_missing|layout_missing|layout_unsupported)|AGDF_BACKLOG_LAYOUT_UNKNOWN)$/;
const titleWithoutScope = (title: string) => title.replace(/^\[(framework[-_]maintenance|external[-_]delivery)\]\s*/i, '') || title;
export interface BacklogView { section: string; filter: string }

export function Overview({ result, onSelect, view, onViewChange, loadTitles, titlesEnabled = true, titleStore, resetTitles = false }: { result: Envelope<Inventory>; onSelect: (id: string) => void; view?: BacklogView; onViewChange?: (view: BacklogView) => void; loadTitles?: TitleLoader; titlesEnabled?: boolean; titleStore?: BacklogTitleStore; resetTitles?: boolean }) {
  const [localView, setLocalView] = useState<BacklogView>({ section: areas[0].section, filter: '' });
  const { section: selected, filter } = view ?? localView;
  const changeView = onViewChange ?? setLocalView;
  const inventory = result.data, entries = inventory?.entries ?? [];
  const diagnostics = inventory?.diagnostics ?? [];
  const titles = useBacklogTitles(inventory, titlesEnabled, loadTitles, titleStore, resetTitles);
  const inArea = entries.map((row, index) => ({ row, identity: backlogRowKey(row, index) })).filter(r => r.row.section === selected).reverse();
  const shown = inArea.filter(({row, identity}) => `${row.key} ${row.title} ${row.stored_status} ${titles.cache.get(identity)?.title ?? ''}`.toLocaleLowerCase('de').includes(filter.trim().toLocaleLowerCase('de')));
  const areaName = areas.find(a => a.section === selected)!.label;
  const affected = (section: string) => diagnostics.filter(d => !d.section || d.section === section);
  const unavailable = (section: string) => !inventory || !(section in inventory.counts) || affected(section).some(d => unreadableLayout.test(d.code));
  const affectedNames = areas.filter(a => affected(a.section).length).map(a => a.label).join(', ');
  return <section className="panel agdf-surface backlog-overview" aria-label="Vorhaben nach Backlog-Bereich">
    <div className="backlog-switch" role="group" aria-label="Backlog-Bereich">
      {areas.map(area => <button key={area.section} type="button" aria-pressed={selected === area.section} aria-controls="backlog-list"
        onClick={() => changeView({ section: area.section, filter: '' })}>
        <span className="backlog-area-label">{area.label}</span>
        <strong>{unavailable(area.section) ? 'Nicht verfügbar' : inventory!.counts[area.section]}</strong>
        {affected(area.section).length > 0 && !unavailable(area.section) && <small>Eingeschränkt</small>}
      </button>)}
    </div>
    {!!diagnostics.length && <details className="notice backlog-notice" role="status"><summary>Teilweise verfügbar · {affectedNames}<span> · {diagnostics.length} {diagnostics.length === 1 ? 'Lesehinweis' : 'Lesehinweise'}</span></summary>
      <p>Hier sind Tabellen oder Einträge nicht eindeutig lesbar. Lesbare Vorhaben kannst du weiterhin öffnen; eingeschränkte Zähler sind kein vollständiger Bestand.</p>
      <ul>{diagnostics.map((d, i) => <li key={i}>
        {d.section && <span>{areas.find(a => a.section === d.section)?.label ?? d.section}: </span>}<code>{d.code}</code>{d.key && <code> · {d.key}</code>}{d.message && <p>{d.message}</p>}
      </li>)}</ul>
    </details>}
    {inventory && <label className="search backlog-search">{areaName}: Vorhaben suchen<input type="search" value={filter} onChange={e => changeView({ section: selected, filter: e.target.value })} placeholder="Titel, Schlüssel oder gespeicherter Status"/></label>}
    <p className="muted">Letzter gespeicherter Eintrag zuerst. Die Suche umfasst Backlog-Angaben und bereits geladene UR-Titel.</p>
    {titles.loading && <p className="muted" role="status">Überschriften sichtbarer Vorhaben werden geladen.</p>}
    <div id="backlog-list" role="region" aria-label={`Vorhaben · ${areaName}`}>
      <h2>{selected === areas[0].section ? 'Aktive Vorhaben' : selected === areas[1].section ? 'Geplante Vorhaben' : 'Archivierte Vorhaben'}</h2>
      {!inventory ? <ReadState state={result.state} code={result.code}/> : !shown.length ? <p className="muted" role="status">
        {unavailable(selected) ? 'Dieser Bereich ist nicht auswertbar. Die Quelle prüfen und bewusst neu laden.'
          : filter.trim() ? 'Keine gespeicherten Vorhaben für diese Suche.' : 'In diesem Bereich sind keine Vorhaben gespeichert.'}
      </p> : <ul className="undertaking-list" ref={titles.list}>{shown.map(({row: r, identity}) => { const observation = titles.cache.get(identity); return <li key={identity} data-backlog-row={identity}>
        <h3><button className="run-link" disabled={!r.selectable} data-focus-id={r.key} onClick={() => onSelect(r.key)}>{observation?.state === 'available' ? observation.title : titleWithoutScope(r.title)}</button></h3>
        <span className="status">Gespeicherter Stand laut Backlog: {r.stored_status || 'Nicht angegeben'}</span>
        <p className="row-step">{selected === areas[2].section ? 'Ergebnis laut Backlog' : 'Nächster Schritt laut Backlog'}: {r.stored_next_step || 'Nicht angegeben'}</p>
        {!r.selectable && <p className="muted">Dieser Eintrag ist nicht eindeutig zugeordnet und kann nicht geöffnet werden.</p>}
        <details className="row-source"><summary>Gespeicherte Angaben und Quellen</summary>
          <dl><dt>Titelherkunft</dt><dd>{observation?.state === 'available' ? 'Beobachtete UR-Überschrift' : observation ? 'Backlog-Titel · UR-Überschrift nicht verfügbar' : 'Gespeicherter Backlog-Titel'}</dd>
            <dt>Originaltitel</dt><dd>{r.title}</dd><dt>Schlüssel</dt><dd><code>{r.original_key}</code></dd>
            {observation && <><dt>UR-Überschrift</dt><dd>{observation.heading ?? 'Nicht verfügbar'}{observation.code && <code> · {observation.code}</code>}</dd>
              <dt>Beobachtet</dt><dd>{new Date(observation.observed_as_of).toLocaleString('de-DE')}</dd>
              {observation.path && <><dt>UR-Quelle</dt><dd><code>{observation.path}</code></dd></>}
              {observation.content_digest && <><dt>Quelldigest</dt><dd><code>{observation.content_digest}</code></dd></>}
              <dt>Backlog-Digest</dt><dd><code>{observation.backlog_digest}</code></dd></>}
            {r.priority && <><dt>Priorität</dt><dd>{r.priority}</dd></>}
            {r.scope && <><dt>Umfang</dt><dd>{r.scope}</dd></>}
            <dt>{selected === areas[2].section ? 'Ergebnis' : 'Nächster Schritt'}</dt><dd>{r.stored_next_step || 'Nicht angegeben'}</dd>
            <dt>Quellen</dt><dd>{r.source_links || 'Keine Links gespeichert'}</dd>
            {r.current_spec && <><dt>Spezifikation</dt><dd>{r.current_spec}</dd></>}
          </dl>
        </details>
      </li>; })}</ul>}
    </div>
  </section>;
}
