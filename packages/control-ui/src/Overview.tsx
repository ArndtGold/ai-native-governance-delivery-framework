import { useState } from 'react';
import type { Envelope, Inventory } from './types';
import { label, ReadState } from './feedback';
import { phaseName, runAttention, runStatus } from './presentation';
export function Overview({ result, onSelect }: { result: Envelope<Inventory>; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState('');
  const runs = result.data?.runs ?? [], shown = runs.filter(r => `${r.run_id} ${r.title} ${r.objective ?? ''} ${phaseName(r.current_gate)}`.toLocaleLowerCase('de').includes(filter.toLocaleLowerCase('de')));
  const active = runs.filter(r => r.lifecycle === 'active').length;
  return <>
    {result.code && result.data && <ReadState code={result.code} state={result.state}/>}
    <div className="metrics"><div><strong>{runs.length}</strong><span>Runs erfasst</span></div><div><strong>{active}</strong><span>Aktive Runs</span></div><div><strong>{runs.filter(r => r.lifecycle === 'completed').length}</strong><span>Abgeschlossen</span></div><div><strong>{runs.filter(r => r.code).length}</strong><span>Mit Lesehinweisen</span></div></div>
    <section className="panel agdf-surface"><div className="section-toolbar"><div><div className="eyebrow">Deine Vorhaben</div><h2>Runs im Repository</h2><p className="muted">Wähle ein Vorhaben, um seinen Stand, offene Punkte und den nächsten erlaubten Schritt zu verstehen.</p></div><label className="search">Runs suchen<input type="search" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Vorhaben, Ziel oder Run-ID"/></label></div>
      {result.state === 'empty' ? <ReadState state="empty"/> : !result.data ? <ReadState state={result.state} code={result.code}/> : <div className="table-scroll"><table className="undertaking-list"><thead><tr><th scope="col">Vorhaben</th><th scope="col">Arbeitsschritt und offene Nachweise</th></tr></thead><tbody>{shown.map(r => <tr key={r.run_id}><td data-label="Vorhaben"><button className="run-link" data-focus-id={r.run_id} onClick={() => onSelect(r.run_id)}>{r.title}</button>{r.objective && r.objective !== r.title && <p className="run-objective">{r.objective}</p>}<small className="run-identity"><code>{r.run_id}</code></small></td><td data-label="Arbeitsschritt und offene Nachweise"><span className={r.code ? 'status warning' : 'status'}>{runStatus(r)}</span><strong className="row-step">{phaseName(r.current_gate)}</strong><details className="row-source"><summary>Kontrolldaten</summary><small>Lebenszyklus: {label(r.lifecycle)} · Gate: {r.current_gate || 'Nicht verfügbar'} · Auswertung: {label(r.status)}</small></details><ul className="attention-list">{runAttention(r).map(item => <li key={item}>{item}</li>)}</ul><button className="text-link row-evidence" onClick={() => onSelect(r.run_id)}>{!r.valid || r.code ? 'Quelle prüfen' : 'Schritt und Nachweise ansehen'}</button></td></tr>)}</tbody></table>{!shown.length && <p>Keine Runs für diese Suche.</p>}</div>}
    </section>
  </>;
}
