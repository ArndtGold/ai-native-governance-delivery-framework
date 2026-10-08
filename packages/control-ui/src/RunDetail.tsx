import type { Envelope, Detail, Resource } from './types';
import { WorkStep } from './WorkStep';
import { ReadState, label } from './feedback';
import { documentName, documentPurpose } from './presentation';
export function RunDetail({ result, onOpen, summaryOnly = false, current = true }: { result: Envelope<Detail>; onOpen: (resource: Resource, origin?: string) => void; summaryOnly?: boolean; current?: boolean }) {
  const data = result.data, e = data?.evaluation, p = data?.persisted;
  return <>
    {result.code && <ReadState code={result.code} state={result.state}/>}
    {e && p && (p.current_gate !== e.current_gate || p.next_allowed_action !== e.next_allowed_action) && <ReadState state="partial" code="persisted_mismatch"/>}
    {!summaryOnly && <><div className="context-line"><code>{data?.run_id}</code><span>{label(data?.lifecycle)}</span></div>
      {data?.objective && <p className="objective">{data.objective}</p>}</>}
    {data && <WorkStep data={data} onOpen={onOpen} condensed={summaryOnly} current={current && result.state === 'available' && !(e && p && (p.current_gate !== e.current_gate || p.next_allowed_action !== e.next_allowed_action))}/>}
    {summaryOnly && <details className="run-goal"><summary>Ziel und Run-ID · Originalangaben</summary><code>{data?.run_id}</code><p className="objective">{data?.objective || 'Kein Zieltext verfügbar.'}</p></details>}
    {!summaryOnly && e && <details className="control-details"><summary>Kontrollstatus und Quellen</summary><div className="detail-columns"><section className="panel agdf-surface"><div className="eyebrow">Bestehende Core-Auswertung</div><h2>{current ? 'Aktueller Kontrollstatus' : 'Zuletzt beobachteter Kontrollstatus'}</h2><dl className="status-fields">
      <dt>Gate</dt><dd>{e.current_gate}</dd><dt>Auswertung</dt><dd>{label(e.status)}</dd><dt>Blocker</dt><dd>{label(e.blocking_reason)}</dd><dt>Fehlende Freigabe</dt><dd>{label(e.missing_approval)}</dd><dt>Kontrollprüfung</dt><dd>{label(e.doctor_status)}</dd></dl>
      <h3>Nächste erlaubte Aktion · Information</h3>{e.status === 'not_evaluated'
        ? <p>Im Cockpit nicht ausgewertet: Die Kontrollauswertung braucht registrierte Quellen außerhalb von <code>.agdf/control</code>. Den aktuellen Stand im bestehenden AGDF-Ablauf prüfen.</p>
        : <><p>{e.next_action_de ?? 'Keine deutsche Zuordnung verfügbar. Originalangabe der Core-Auswertung:'}</p>{!e.next_action_de && <p className="source-text">{e.next_allowed_action}</p>}</>}
      <p className="muted">Git-basierte Nachweise sind in dieser Leseschnittstelle nicht verfügbar. Entscheidungen erfolgen im bestehenden AGDF-Ablauf.</p>
    </section><section className="panel agdf-surface"><div className="eyebrow">Gespeicherte Angaben · Quelle</div><h2>Run-Dokument</h2><dl className="status-fields"><dt>Gate-Angabe</dt><dd>{p?.current_gate || 'Nicht verfügbar'}</dd><dt>Entscheidungsangabe</dt><dd>{label(p?.decision)}</dd><dt>Run-Revision</dt><dd><code>{data?.revision_id}</code></dd></dl>
      <p className="source-text">{p?.next_allowed_action}</p>
      <h3>Gespeicherte Freigaben</h3><ul className="approval-list">{e.approvals.map(row => <li key={row.gate}><strong>{row.gate}</strong><span>{label(row.status)}</span><small>{row.evidence}</small></li>)}</ul>
    </section></div>{!!e.missing_evidence.length && <section className="panel agdf-surface"><h2>Fehlende Nachweise · Originalangaben</h2><pre>{JSON.stringify(e.missing_evidence, null, 2)}</pre></section>}</details>}
    {!summaryOnly && <section className="panel agdf-surface"><div className="eyebrow">Quellen zum Vorhaben</div><h2>Dokumente</h2><p className="muted">Öffne die passende Quelle, um Ziel, Lösung oder Nachweise nachzulesen.</p><div className="resources">{data?.resources.map(r => <button key={r.resource_id} data-focus-id={r.resource_id} onClick={() => onOpen(r)}><strong>{documentName(r.type)}</strong><span>{documentPurpose(r.type)}</span><small>{r.type} · {r.registered_reference}</small><span aria-hidden="true">↗</span></button>)}</div>{!data?.resources.length && <p>Keine registrierten Ressourcen verfügbar.</p>}</section>}
    {!summaryOnly && !!(e?.diagnostics.length || data?.diagnostics?.length) && <section className="panel agdf-surface"><h2>Diagnosen · Originalangaben</h2>{(e?.diagnostics ?? data?.diagnostics ?? []).map((d, i) => <details key={i}><summary>{d.code}</summary><p>{d.message}</p><code>{d.path}</code><p>{d.next_step}</p></details>)}</section>}
  </>;
}
