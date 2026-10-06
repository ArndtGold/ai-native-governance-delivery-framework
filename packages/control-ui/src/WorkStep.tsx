import { useId, type ReactNode } from 'react';
import type { Detail, Resource } from './types';
import { label } from './feedback';
import { documentName, phaseName } from './presentation';

// Presentation of existing Core facts only; no gate rules or inferred evidence relationships.
export function WorkStep({ data, compact = false, condensed = false, current = true, onOpen, children }: {
  data: Detail; compact?: boolean; condensed?: boolean; current?: boolean; onOpen?: (resource: Resource) => void; children?: ReactNode;
}) {
  const id = useId(), e = data.evaluation;
  if (!e) return <>{children}</>;
  const blocked = e.blocking_reason !== 'none' || e.missing_approval !== 'none';
  const knownOpen = current && !blocked && e.status === 'open' && e.doctor_status === 'pass' && data.lifecycle === 'active';
  const approvals = e.approvals.filter(a => a.status === 'approved');
  const evidenceSources = data.resources.filter(r => r.type === e.current_gate || r.type === 'Run State');
  return <section className={`work-step agdf-surface agdf-controlled-surface${compact ? ' work-step--compact' : ' panel'}`} aria-labelledby={id}>
    <div className="work-step-heading"><h2 id={id}>{current ? 'So geht dein Vorhaben weiter' : 'Zuletzt beobachteter Arbeitsschritt'}</h2><span className="work-step-phase">{phaseName(e.current_gate)}</span></div>
    <div className="work-step-status"><span>{data.persisted ? 'Gespeicherter Stand: ' : 'Auswertung: '}<span>{label(data.persisted?.decision ?? e.status)}</span></span><code>{e.current_gate}</code></div>
    <p className="work-step-action">{e.next_action_de ?? e.next_allowed_action}</p>
    <div className="work-step-prerequisites">
      <h3>Voraussetzungen · {current ? 'aktueller Kontrollstand' : 'nicht bestätigter Kontrollstand'}</h3>
      <p className={blocked ? 'work-step-blocked' : 'muted'}>{!current ? 'Kontrollstand nicht vollständig bestätigt · Voraussetzungen erneut prüfen.' : blocked ? 'Vor der Weiterarbeit zu klären:' : knownOpen ? 'Die Kontrollauswertung weist diesen Schritt als offen aus.' : `Beginn nicht bestätigt · Kontrollauswertung: ${label(e.status)}, Kontrollprüfung: ${label(e.doctor_status)}.`}</p>
      {e.blocking_reason !== 'none' && <p className="work-step-blocked">Blocker: <strong>{e.blocking_reason}</strong></p>}
      {e.missing_approval !== 'none' && <p className="work-step-blocked">Freigabe ausstehend: <strong>{e.missing_approval}</strong></p>}
      <details className="work-step-approvals"><summary>Gespeicherte Freigaben{approvals.length ? ` · ${approvals.map(a => a.gate).join(' · ')}` : ' · keine'}</summary>
        <p className="muted">Freigaben allein bestätigen nicht, dass alle Voraussetzungen erfüllt sind.</p>
        <ul>{approvals.map(a => <li key={a.gate}><strong>{a.gate}</strong><span>{a.evidence || 'Kein Quellenhinweis verfügbar.'}</span>{onOpen && data.resources.filter(r => r.type === a.gate).map(r => <button className="text-link" key={r.resource_id} onClick={() => onOpen(r)}>{documentName(r.type)} ansehen</button>)}</li>)}</ul>
      </details>
    </div>
    {condensed && <p className="work-step-evidence-brief">{e.missing_evidence.length ? `${e.missing_evidence.length} ${e.missing_evidence.length === 1 ? 'offener Nachweis' : 'offene Nachweise'}. Prüfe die Originalangaben und die registrierten Quellen.` : 'Keine offenen Nachweise ausgewiesen.'}</p>}
    <details className="work-step-evidence" open={compact || condensed ? undefined : true}><summary>{condensed ? 'Originalangaben zu den offenen Nachweisen' : 'Offene Nachweise'} <span className="work-step-count">{e.missing_evidence.length}</span></summary>
      {e.missing_evidence.length ? <><p className="muted">Ob ein Punkt den Beginn blockiert oder noch erarbeitet werden muss, ist den jeweiligen Quellen zu entnehmen.</p><ul>{e.missing_evidence.map((item, i) => {
        const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
        return <li key={i}>{typeof row.missing_evidence === 'string' ? <strong>{row.missing_evidence}</strong> : typeof item === 'string' ? <strong>{item}</strong> : <><strong>Nachweis ohne lesbare Kurzbeschreibung</strong><pre>{JSON.stringify(item, null, 2)}</pre></>}
          {typeof row.impact === 'string' && <p>{row.impact}</p>}
          {typeof row.required_next_step === 'string' && <p><span className="work-step-label">Laut Quelle als Nächstes:</span> {row.required_next_step}</p>}
        </li>;
      })}</ul></> : <p className="muted">Keine offenen Nachweise ausgewiesen.</p>}
    </details>
    {onOpen && <div className="work-step-sources">{evidenceSources.map(r => <button className="text-link" key={r.resource_id} data-focus-id={r.resource_id} onClick={() => onOpen(r)}>{documentName(r.type)} öffnen</button>)}{!evidenceSources.length && <p className="muted">Keine registrierte Nachweisquelle für diesen Schritt verfügbar.</p>}</div>}
    {children}
  </section>;
}
