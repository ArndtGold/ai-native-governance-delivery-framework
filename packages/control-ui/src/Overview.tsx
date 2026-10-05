import { useState } from 'react';
import type { Envelope, Inventory } from './types';
import { label, ReadState } from './feedback';
export function Overview({ result, onSelect }: { result: Envelope<Inventory>; onSelect: (id: string) => void }) {
  const [filter, setFilter] = useState('');
  const runs = result.data?.runs ?? [], shown = runs.filter(r => `${r.run_id} ${r.title}`.toLocaleLowerCase('de').includes(filter.toLocaleLowerCase('de')));
  const active = runs.filter(r => r.lifecycle === 'active').length;
  return <>
    {result.code && <ReadState code={result.code} state={result.state}/>}
    <div className="metrics"><div><strong>{runs.length}</strong><span>Runs erfasst</span></div><div><strong>{active}</strong><span>Aktive Runs</span></div><div><strong>{runs.filter(r => r.lifecycle === 'completed').length}</strong><span>Abgeschlossen</span></div><div><strong>{runs.filter(r => r.code).length}</strong><span>Mit Lesehinweisen</span></div></div>
    <section className="panel"><div className="section-toolbar"><div><div className="eyebrow">Kontrollbaum</div><h2>Runs im Repository</h2></div><label className="search">Runs suchen<input type="search" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Run-ID oder Ziel"/></label></div>
      {result.state === 'empty' ? <ReadState state="empty"/> : !result.data ? <ReadState state={result.state} code={result.code}/> : <div className="table-scroll"><table><thead><tr><th>Run & Ziel</th><th>Lebenszyklus</th><th>Core-Gate</th><th>Auswertung</th></tr></thead><tbody>{shown.map(r => <tr key={r.run_id}><td><button className="run-link" data-focus-id={r.run_id} onClick={() => onSelect(r.run_id)}>{r.run_id}</button><small>{r.title}</small></td><td><span className="badge">{label(r.lifecycle)}</span></td><td>{r.current_gate || 'Nicht verfügbar'}</td><td><span className={r.code ? 'status warning' : 'status'}>{r.code ? label(r.valid ? 'blocked' : 'invalid') : label(r.status)}</span></td></tr>)}</tbody></table>{!shown.length && <p>Keine Runs für diese Suche.</p>}</div>}
    </section>
  </>;
}
