// Descriptive saved labels only. Gate policy and QA remain the decision owners.
export const SUMMARY_KINDS = Object.freeze(['work_pending', 'approval_pending', 'qa_report_pending',
  'qa_evidence_open', 'qa_correction_open', 'qa_source_decision', 'qa_blocked', 'source_unconfirmed',
  'closeout_pending', 'completed', 'unconfirmed']);
export const SUMMARY_LABELS = Object.freeze({
  work_pending: ['Work pending', 'Arbeit offen'], approval_pending: ['Approval pending', 'Freigabe ausstehend'],
  qa_report_pending: ['QA report pending', 'QA-Bericht ausstehend'],
  qa_evidence_open: ['QA evidence open', 'QA-Nachweis offen'],
  qa_correction_open: ['QA correction open', 'QA-Korrektur offen'],
  qa_source_decision: ['QA source decision required', 'QA: vorgelagerte Entscheidung erforderlich'],
  qa_blocked: ['QA blocked', 'QA blockiert'], source_unconfirmed: ['Source unconfirmed', 'Quelle nicht bestätigt'],
  closeout_pending: ['Closeout pending', 'Abschluss offen'], completed: ['Completed', 'Abgeschlossen'],
  unconfirmed: ['Unconfirmed', 'Nicht bestätigt'],
});
export const summaryLabel = (kind, language = 'en') => SUMMARY_LABELS[kind]?.[language === 'de' ? 1 : 0] ?? SUMMARY_LABELS.unconfirmed[language === 'de' ? 1 : 0];
