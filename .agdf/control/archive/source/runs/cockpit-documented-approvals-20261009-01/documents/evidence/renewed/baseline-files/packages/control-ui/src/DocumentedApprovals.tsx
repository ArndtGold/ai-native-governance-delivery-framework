import type { Detail, Resource } from './types';
import { documentName } from './presentation';

// Describes recorded facts only. The existing reader owns current resources and freshness.
export function DocumentedApprovals({ approvals, resources, runId, onOpen, sourceDisabled = false }: {
  approvals: NonNullable<Detail['evaluation']>['approvals']; resources: Resource[]; runId: string;
  onOpen?: (resource: Resource, origin?: string) => void; sourceDisabled?: boolean;
}) {
  const recorded = approvals.filter(a => a.status === 'approved');
  const sources = resources.filter(r => r.status === 'registered' && r.run_id === runId);
  return <details className="work-step-approvals">
    <summary>Dokumentierte Freigaben · {recorded.length}</summary>
    <p className="muted documented-approvals-note">Die Nachweise beziehen sich auf die dokumentierte Freigabe. Den aktuellen Kontrollstatus bestimmt die Kontrollauswertung. Der Lesedienst öffnet aktuelle Quellen; die genaue freigegebene Fassung ist nicht bestätigt.</p>
    {recorded.length === 0 ? <p className="work-step-empty">Keine Freigaben dokumentiert.</p> : <>
      <div className="documented-approvals-columns" aria-hidden="true"><span>Dokument</span><span>Freigabenachweis</span><span>Dokumentfassung</span></div>
      <ul className="documented-approvals-list" aria-label="Dokumentierte Freigaben">
        {recorded.map(a => {
          const name = documentName(a.gate), matches = sources.filter(r => r.type === a.gate);
          return <li className="documented-approval-row" key={a.gate}>
            <div className="documented-approval-group"><span className="documented-approval-label">Dokument</span><strong>{name}</strong></div>
            <div className="documented-approval-group"><span className="documented-approval-label">Freigabenachweis</span>
              <details className="documented-approval-evidence">
                <summary aria-label={`Dokumentiert: ${name}`}>Dokumentiert</summary>
                <dl className="documented-approval-facts">
                  <dt>Freigabe</dt><dd>{a.gate} · dokumentiert</dd>
                  <dt>Vorhaben</dt><dd>{runId}</dd>
                  <dt>Freigegebene Fassung</dt><dd>Nicht bestätigt.</dd>
                  <dt>Freigabezeitpunkt</dt><dd>Keine strukturierte Angabe verfügbar.</dd>
                  <dt>Freigebende Person</dt><dd>Keine bestätigte Identität verfügbar.</dd>
                  <dt>Aussagebereich</dt><dd>Keine strukturierte Angabe verfügbar.</dd>
                  <dt>Grundlage</dt><dd>Keine strukturierte Angabe verfügbar.</dd>
                </dl>
                <p className="documented-approval-original-label">Originalnachweis</p>
                <p className="source-text">{a.evidence.trim() ? a.evidence : 'Kein Originalnachweis verfügbar.'}</p>
              </details>
            </div>
            <div className="documented-approval-group"><span className="documented-approval-label">Dokumentfassung</span>
              {onOpen && matches.length ? matches.map(r => <div className="documented-approval-source" key={r.resource_id}>
                <button className="text-link" aria-label={`Aktuelle Fassung ansehen: ${name} · ${r.registered_reference}`} data-focus-id={`approval:${r.resource_id}`} disabled={sourceDisabled} onClick={() => onOpen(r, `approval:${r.resource_id}`)}>Aktuelle Fassung ansehen</button>
                {matches.length > 1 && <span className="documented-approval-reference">{r.registered_reference}</span>}
              </div>) : <p className="muted">Aktuelle Fassung nicht verfügbar.</p>}
            </div>
          </li>;
        })}
      </ul>
    </>}
  </details>;
}
