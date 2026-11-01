// Pure resource identities shared by serving and build owners. Importing an
// address must never load a control-state reader, writer or generated catalog.
export const COCKPIT_UI_URI = 'ui://agdf/cockpit/v2.html';
export const DECISION_UI_URI = 'ui://agdf/decision/v1.html';
