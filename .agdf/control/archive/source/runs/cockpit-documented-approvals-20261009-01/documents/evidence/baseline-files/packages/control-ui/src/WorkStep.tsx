import { useId, type ReactNode } from 'react';
import type { Detail, Resource } from './types';
import { label } from './feedback';
import { documentName, phaseName, observedAssessment, reportFindingsLabel } from './presentation';

// Core supplies the assessment. A retained or mismatched observation cannot confirm current work.
export function WorkStep({ data, compact = false, condensed = false, current = true, onOpen, sourceDisabled = false, children }: {
  data: Detail; compact?: boolean; condensed?: boolean; current?: boolean; onOpen?: (resource: Resource, origin?: string) => void; sourceDisabled?: boolean; children?: ReactNode;
}) {
  const id = useId(), e = data.evaluation;
  if (!e) return <>{children}</>;
  const assessment = observedAssessment(data, current);
  const approvals = e.approvals.filter(a => a.status === 'approved');
  const sources = data.resources.filter(r => r.status === 'registered' && r.run_id === data.run_id);
  const stepSource = sources.find(r => r.type === e.current_gate), runSource = sources.find(r => r.type === 'Run State');
  const primarySource = assessment === 'open' ? stepSource ?? runSource : runSource ?? stepSource;
  const title = assessment === 'open' ? 'Weiterarbeit offen' : assessment === 'blocked' ? 'Vor der Weiterarbeit klären'
    : assessment === 'completed' ? 'Vorhaben abgeschlossen' : 'Aktuelle Voraussetzungen nicht bestätigt';
  const explanation = assessment === 'open' ? 'Laut aktueller Kontrollauswertung. Die Weiterarbeit bleibt auf den freigegebenen Umfang begrenzt.'
    : assessment === 'blocked' ? e.missing_approval !== 'none' ? 'Die Kontrollauswertung weist eine ausstehende Freigabe aus.' : 'Die Kontrollauswertung weist einen Blocker aus.'
    : assessment === 'completed' ? 'Dieser Run ist als abgeschlossen gespeichert. Daraus folgt keine Freigabe für neue Arbeit.'
    : 'Aus diesem Stand lässt sich nicht bestätigen, dass der Schritt jetzt begonnen oder fortgesetzt werden darf.';
  const count = e.missing_evidence.length;
  const reportCount = data.work_summary?.open_obligation_count ?? 0;
  const reportSources = sources.filter(r => data.work_summary?.sources.some(s => s.path === r.path));
  return <section className={`work-step agdf-surface agdf-controlled-surface${compact ? ' work-step--compact' : ' panel'}${condensed ? ' work-step--condensed' : ''}`} aria-label={current ? 'So geht dein Vorhaben weiter' : 'Zuletzt beobachteter Arbeitsschritt'}>
    <div className="work-step-heading"><span className="work-step-eyebrow">Gespeicherter Arbeitsstand</span><h2>{phaseName(data.persisted?.current_gate ?? e.current_gate)}</h2></div>
    <p className="work-step-saved">{data.persisted ? <>Zuletzt als „{label(data.persisted.decision)}“ gespeichert.</> : 'Gespeicherte Entscheidung nicht verfügbar.'}</p>
    <div className="work-step-prerequisites" data-assessment={assessment}>
      <h3>{title}</h3><p>{explanation}</p>
      {assessment === 'open' && <p className="work-step-action">{e.next_action_de ?? e.next_allowed_action}</p>}
      {assessment === 'blocked' && <p className="work-step-action">{e.next_action_de ?? e.next_allowed_action}</p>}
      {onOpen && primarySource && <button className="primary work-step-primary" data-focus-id={`step:${primarySource.resource_id}`} disabled={sourceDisabled} onClick={() => onOpen(primarySource, `step:${primarySource.resource_id}`)}>{documentName(primarySource.type)} öffnen</button>}
      {onOpen && !primarySource && <p className="muted">Keine registrierte Nachweisquelle für diesen Schritt verfügbar.</p>}
      {children}
    </div>
    <div className="work-step-support">
      <details className="work-step-evidence" aria-labelledby={id}><summary id={id}>{reportCount ? `Nachweise und offene Punkte · ${reportFindingsLabel(reportCount)}` : `Nachweislücken im Run-Dokument · ${count}`}</summary>
        {reportCount > 0 && <div className="work-step-report-findings"><p>{reportFindingsLabel(reportCount)} in den registrierten Berichten. Ein Sachverhalt kann in mehreren Berichten geführt sein.</p>
          {data.work_summary?.decisive_obligation && <p>Maßgeblicher Befund: <code>{data.work_summary.decisive_obligation.id}</code></p>}
          <div className="work-step-sources">{onOpen && reportSources.map(r => <button className="text-link" key={r.resource_id} disabled={sourceDisabled} data-focus-id={`report:${r.resource_id}`} onClick={() => onOpen(r, `report:${r.resource_id}`)}>{documentName(r.type)} öffnen</button>)}</div>
        </div>}
        <p className="muted">{count ? `${count} ${count === 1 ? 'Nachweislücke ist' : 'Nachweislücken sind'} im Run-Dokument gespeichert. Ihre Bedeutung steht in der jeweiligen Quelle; die Kontrollaussage oben bleibt maßgeblich.` : 'Im Run-Dokument sind keine Nachweislücken gespeichert. Diese Angabe zählt keine Befunde aus QA- und Review-Berichten.'}</p>
        <ul>{e.missing_evidence.map((item, i) => {
          const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
          const summary = typeof row.missing_evidence === 'string' ? row.missing_evidence : typeof item === 'string' ? item : 'Nachweis ohne lesbare Kurzbeschreibung';
          return <li key={i}><strong>{summary}</strong>
            {typeof row.required_next_step === 'string' && <p><span className="work-step-label">Laut Quelle als Nächstes:</span> {row.required_next_step}</p>}
            <details className="work-step-original"><summary>Originalangaben zu diesem Nachweis</summary><pre>{typeof item === 'string' ? item : JSON.stringify(item, null, 2)}</pre></details>
          </li>;
        })}</ul>
        <div className="work-step-sources">{onOpen && [stepSource, runSource].filter((r, i, all): r is Resource => !!r && all.findIndex(x => x?.resource_id === r.resource_id) === i).filter(r => r.resource_id !== primarySource?.resource_id && !(reportCount > 0 && reportSources.some(s => s.resource_id === r.resource_id))).map(r => <button className="text-link" key={r.resource_id} disabled={sourceDisabled} data-focus-id={`proof:${r.resource_id}`} onClick={() => onOpen(r, `proof:${r.resource_id}`)}>{documentName(r.type)} öffnen</button>)}</div>
        <details className="work-step-original"><summary>Kontrollauswertung · Originalangaben</summary>
          <dl className="work-step-facts"><dt>Kontrollstatus</dt><dd>{label(e.status)}</dd><dt>Kontrollprüfung</dt><dd>{label(e.doctor_status)}</dd><dt>{current ? 'Blocker' : 'Zuletzt gespeicherter Blocker'}</dt><dd><code>{e.blocking_reason}</code></dd><dt>{current ? 'Ausstehende Freigabe' : 'Zuletzt ausstehende Freigabe'}</dt><dd><code>{e.missing_approval}</code></dd><dt>Nächster Schritt laut Quelle</dt><dd>{e.next_allowed_action}</dd></dl>
        </details>
      </details>
      <details className="work-step-approvals"><summary>Gespeicherte Freigaben · {approvals.length}</summary>
        <p className="muted">{approvals.length ? 'Diese Freigaben sind gespeichert. Sie ersetzen keine aktuelle Kontrollauswertung.' : 'Keine Freigaben gespeichert.'}</p>
        <ul>{approvals.map(a => <li key={a.gate}><strong>{documentName(a.gate)} · freigegeben</strong>
          {onOpen && sources.filter(r => r.type === a.gate).map(r => <button className="text-link" key={r.resource_id} data-focus-id={`approval:${r.resource_id}`} disabled={sourceDisabled} onClick={() => onOpen(r, `approval:${r.resource_id}`)}>{documentName(r.type)} ansehen</button>)}
          <details className="work-step-original"><summary>Gespeicherter Freigabenachweis · {a.gate}</summary><p className="source-text">{a.evidence || 'Kein Quellenhinweis verfügbar.'}</p></details>
        </li>)}</ul>
      </details>
    </div>
  </section>;
}
