// Presentation of one canonical control assessment. This module never evaluates or authorizes work.
export function projectWorkSituation({ assessment, gate, blockingReason, missingApproval, closureOutcome, persistedGate, persistedNext, nextAllowedAction } = {}) {
  if (persistedGate !== undefined && (persistedGate !== gate || !(assessment === 'ended' && closureOutcome) && persistedNext !== nextAllowedAction)) assessment = 'unconfirmed';
  let kind = 'unconfirmed';
  if (assessment === 'open') kind = gate === 'CD+Tests' ? 'in_progress' : 'open';
  else if (assessment === 'blocked') {
    kind = blockingReason === 'presentation_version_decided' ? 'revision_required'
      : blockingReason === 'none' && missingApproval === `Approval: ${gate}` ? 'approval_required'
      : gate === 'UR' && blockingReason === 'AGDF_UR_REQUIREMENTS_INCOMPLETE' ? 'clarification_required' : 'blocked';
  } else if (assessment === 'completed') kind = 'completed';
  else if (assessment === 'ended' && closureOutcome) kind = 'ended';
  const values = {
    revision_required: ['clarification_required', 'Revision required', 'Überarbeitung nötig'],
    approval_required: ['decision_required', 'Approval required', 'Freigabe erforderlich'],
    clarification_required: ['clarification_required', 'Clarification required', 'Klärung erforderlich'],
    in_progress: ['in_progress', 'In implementation', 'In Umsetzung'],
    open: ['in_progress', 'Work may continue', 'Weiterarbeit offen'],
    blocked: ['blocked', 'Blocked', 'Blockiert'],
    completed: ['none', 'Completed', 'Vorhaben abgeschlossen'],
    ended: ['none', 'Ended', 'Vorhaben beendet'],
    unconfirmed: ['unclear', 'Current conditions unconfirmed', 'Aktuelle Voraussetzungen nicht bestätigt'],
  };
  const [code, en, de] = values[kind];
  return { kind, code, en, de };
}
