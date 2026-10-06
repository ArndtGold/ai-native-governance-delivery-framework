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
  // The current step's registered source leads; Run State remains a separate source.
  const evidenceSources = data.resources.filter(r => r.type === e.current_gate || r.type === 'Run State')
    .sort((a, b) => Number(b.type === e.current_gate) - Number(a.type === e.current_gate));
  const count = e.missing_evidence.length;
  const beginning = !current ? 'Beginn unklar' : blocked ? 'Beginn blockiert' : knownOpen ? 'Beginn offen' : 'Beginn unklar';
  return <section className={`work-step agdf-surface agdf-controlled-surface${compact ? ' work-step--compact' : ' panel'}`} aria-label={current ? 'So geht dein Vorhaben weiter' : 'Zuletzt beobachteter Arbeitsschritt'}>
    <div className="work-step-heading"><span className="work-step-eyebrow">{current ? 'Nächster Arbeitsschritt' : 'Vorheriger Datenstand'}</span><h2>{current ? phaseName(e.current_gate) : 'Zuletzt beobachteter Arbeitsschritt'}</h2></div>
    <p className="work-step-action">{e.next_action_de ?? e.next_allowed_action}</p>
    <div className="work-step-support">
      <div className="work-step-prerequisites">
        <h3>Voraussetzungen</h3>
        <p className={`work-step-beginning${current && blocked ? ' work-step-blocked' : ''}`}><strong>{beginning}</strong><span>{!current ? 'Quelldaten erneut prüfen.' : knownOpen ? 'Laut Kontrollauswertung.' : blocked ? 'Vor der Weiterarbeit klären.' : 'Kontrollstand nicht vollständig bestätigt.'}</span></p>
        {e.blocking_reason !== 'none' && <p className="work-step-blocked">{current ? 'Blocker' : 'Zuletzt gespeicherter Blocker'}: <strong>{e.blocking_reason}</strong></p>}
        {e.missing_approval !== 'none' && <p className="work-step-blocked">{current ? 'Freigabe ausstehend' : 'Zuletzt ausstehende Freigabe'}: <strong>{e.missing_approval}</strong></p>}
        <details className="work-step-approvals"><summary>Kontrollgrundlage · {approvals.length} {approvals.length === 1 ? 'Freigabe' : 'Freigaben'}</summary>
          <div className="work-step-status"><span>{data.persisted ? 'Gespeicherter Stand: ' : 'Auswertung: '}{label(data.persisted?.decision ?? e.status)}</span><code>{e.current_gate}</code></div>
          <p className="muted">{!current ? 'Kontrollstand nicht vollständig bestätigt · Voraussetzungen erneut prüfen.' : knownOpen ? 'Die Kontrollauswertung weist diesen Schritt als offen aus.' : `Beginn nicht bestätigt · Kontrollauswertung: ${label(e.status)}, Kontrollprüfung: ${label(e.doctor_status)}.`}</p>
          <p className="muted">Freigaben allein bestätigen nicht, dass alle Voraussetzungen erfüllt sind.</p>
          <p className="muted">Gespeicherte Freigaben{approvals.length ? ` · ${approvals.map(a => a.gate).join(' · ')}` : ' · keine'}</p>
          <ul>{approvals.map(a => <li key={a.gate}><strong>{a.gate}</strong><span>{a.evidence || 'Kein Quellenhinweis verfügbar.'}</span>{onOpen && data.resources.filter(r => r.type === a.gate).map(r => <button className="text-link" key={r.resource_id} onClick={() => onOpen(r)}>{documentName(r.type)} ansehen</button>)}</li>)}</ul>
        </details>
      </div>
      <div className="work-step-proof" aria-labelledby={id}>
        <h3 id={id}>Nachweise</h3>
        {count ? <details className="work-step-evidence" open={compact || condensed ? undefined : true}><summary>{count} {count === 1 ? 'offenen Nachweis' : 'offene Nachweise'} ansehen</summary>
          <p className="muted">Originalangaben: Ob ein Punkt den Beginn blockiert oder noch erarbeitet werden muss, ist den jeweiligen Quellen zu entnehmen.</p><ul>{e.missing_evidence.map((item, i) => {
            const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            return <li key={i}>{typeof row.missing_evidence === 'string' ? <strong>{row.missing_evidence}</strong> : typeof item === 'string' ? <strong>{item}</strong> : <><strong>Nachweis ohne lesbare Kurzbeschreibung</strong><pre>{JSON.stringify(item, null, 2)}</pre></>}
              {typeof row.impact === 'string' && <p>{row.impact}</p>}
              {typeof row.required_next_step === 'string' && <p><span className="work-step-label">Laut Quelle als Nächstes:</span> {row.required_next_step}</p>}
            </li>;
          })}</ul>
        </details> : <p className="work-step-empty">Keine offenen Nachweise ausgewiesen.</p>}
        {onOpen && <div className="work-step-sources">{evidenceSources.map(r => <button className="text-link" key={r.resource_id} data-focus-id={r.resource_id} onClick={() => onOpen(r)}>{documentName(r.type)} öffnen</button>)}{!evidenceSources.length && <p className="muted">Keine registrierte Nachweisquelle für diesen Schritt verfügbar.</p>}</div>}
        {children}
      </div>
    </div>
  </section>;
}
