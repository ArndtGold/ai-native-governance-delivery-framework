import type { Detail, Envelope, WorkEntry } from './types';

export function SourceInfo({ result, current, entry }: { result: Envelope<Detail>; current: boolean; entry?: WorkEntry }) {
  const data = result.data;
  if (!data) return null;
  const ur = data.resources.find(resource => resource.type === 'UR' && resource.run_id === data.run_id);
  const titleSource = data.title_source === 'ur' ? 'Überschrift des registrierten UR-Dokuments'
    : data.title_source === 'objective' ? 'Ziel aus dem Run-Dokument'
    : data.title_source === 'run_id' ? 'Run-Kennung' : 'Nicht gesondert bestätigt';
  const observed = result.observed_as_of && !Number.isNaN(Date.parse(result.observed_as_of)) ? new Date(result.observed_as_of) : null;
  return <details className="source-info"><summary>Quellen und Datenstand</summary>
    <dl>
      <dt>Run-Kennung</dt><dd><code>{data.run_id}</code></dd>
      <dt>Run-Dokument</dt><dd><code>{`.agdf/control/runs/${data.run_id}/RUN_STATE.md`}</code></dd>
      <dt>Titelquelle</dt><dd>{titleSource}{data.title_source === 'ur' && ur && <> · <code>{ur.registered_reference}</code></>}</dd>
      <dt>Beobachtet</dt><dd>{observed ? <time dateTime={result.observed_as_of!}>{observed.toLocaleString('de-DE')}</time> : 'Nicht verfügbar'}{!current && ' · Datenstand nicht aktuell'}</dd>
      {entry && <><dt>Listenquelle</dt><dd><code>{entry.source.path}</code></dd><dt>Inhaltskennung der Liste</dt><dd><code>{entry.source.digest ?? 'Nicht verfügbar'}</code></dd><dt>Gespeicherter nächster Schritt</dt><dd>{entry.stored_next_step || 'Nicht angegeben'}</dd></>}
    </dl>
    {result.state !== 'available' && <p>Quellen sind nur eingeschränkt verfügbar.</p>}
  </details>;
}
