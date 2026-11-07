// Pure shared policy inputs; no host, filesystem, receipt-validation or clock access.
export function extractField(content, field) {
  const pattern = new RegExp(`^- ${field}:[^\\S\\r\\n]*(.*)$`, "m");
  return content.match(pattern)?.[1]?.trim() ?? "";
}

export const verifiedChangeEscalationTargets = new Set(["structured_slice", "structured_delivery"]);
export const STRUCTURED_REQUIRED_REVIEWS = Object.freeze(['TP Review', 'Clean Implementation Review']);
// The skill that owns each required review report.
export const REVIEW_SKILLS = Object.freeze({ 'TP Review': 'task-plan-review', 'Clean Implementation Review': 'clean-implementation-review' });
// `Clean Review` is the supported legacy name of the Clean Implementation Review row.
export const reviewArtefactType = (state, step) => step === 'Clean Implementation Review' && !state.artefacts.get(step)?.path
  && state.artefacts.get('Clean Review')?.path ? 'Clean Review' : step;
