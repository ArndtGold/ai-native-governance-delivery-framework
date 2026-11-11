import type { Detail } from './types';
import { completionUnconfirmed, observedAssessment } from './presentation';

export function WorkStandLabel({ data, current, stale, reopen = false }: { data: Detail; current: boolean; stale: boolean; reopen?: boolean }) {
  const confirmed = observedAssessment(data, current) !== 'unconfirmed' && !completionUnconfirmed(data);
  return <div className="work-stand-label">
    <p>{confirmed ? 'Aktueller Arbeitsstand' : 'Zuletzt beobachteter Arbeitsstand'}</p>
    {stale && <span>{reopen ? 'Sitzung nicht verfügbar. Cockpit erneut öffnen.' : 'Datenstand nicht aktuell. Bitte aktualisieren.'}</span>}
  </div>;
}
