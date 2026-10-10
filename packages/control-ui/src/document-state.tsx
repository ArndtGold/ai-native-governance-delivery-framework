import type { DocumentState } from './types';

// Presentation of validated Core descriptions only; no proof or authoring evaluation.
const states = {
  approved: ['✓', 'Freigegeben', 'Diese gelesene Fassung ist der dokumentierten Freigabe zugeordnet.'],
  draft: ['○', 'Entwurf', 'Für diese Fassung liegt keine aktuelle Entwurfsprüfung vor.'],
  draft_checked: ['✓', 'Entwurf geprüft', 'Die Autorenprüfung ist bestanden. Die Freigabe steht noch aus.'],
  revision_required: ['⚠', 'Überarbeitung nötig', 'Die aktuelle Autorenprüfung nennt konkrete Korrekturen für diese Fassung.'],
  check_unavailable: ['?', 'Prüfung nicht verfügbar', 'Für diese Fassung ist keine verlässliche aktuelle Entwurfsprüfung verfügbar.'],
  approval_unconfirmed: ['?', 'Freigabe dieser Fassung nicht bestätigt', 'Eine frühere Freigabe ist dokumentiert. Ihre Zuordnung zur aktuell gelesenen Fassung ist nicht bestätigt.'],
  unavailable: ['?', 'Dokumentstand nicht verfügbar', 'Der Dokumentstand konnte nicht verlässlich festgestellt werden.'],
} as const;
const approvedActions: Record<string, string> = {
  UR: 'Freigegebene Anforderungen ansehen', PRD: 'Freigegebene Produktanforderungen ansehen',
  SD: 'Freigegebenes Lösungskonzept ansehen', TP: 'Freigegebenen Taskplan ansehen',
  QA: 'Freigegebenen Qualitätsbericht ansehen', UAT: 'Freigegebene Abnahme ansehen',
};
export function documentPresentation(state: DocumentState | undefined, type: string, current = true, recordedApproval = false) {
  const [icon, text, explanation] = state ? states[state.state] : recordedApproval ? states.approval_unconfirmed
    : ['?', 'Dokumentstand nicht bestätigt', 'Der Lesedienst liefert keine bestätigten Zustandsangaben zu dieser Fassung.'];
  return { icon: current ? icon : '?', text: current ? text : `Zuletzt beobachtet: ${text}`, explanation: current ? explanation : 'Diese Angaben gehören zur letzten Beobachtung. Lade den Stand neu.',
    action: state?.version_kind === 'approved' ? approvedActions[type] ?? 'Freigegebenes Dokument ansehen'
      : state?.version_kind === 'draft' ? 'Entwurf ansehen' : 'Aktuelle Fassung ansehen' };
}
export function DocumentStateLabel({ state, type, current = true, recordedApproval = false }: { state?: DocumentState; type: string; current?: boolean; recordedApproval?: boolean }) {
  const p = documentPresentation(state, type, current, recordedApproval);
  return <span className="run-document-state" data-document-state={current ? state?.state ?? 'unconfirmed' : 'stale'}><span aria-hidden="true">{p.icon}</span> {p.text}</span>;
}
