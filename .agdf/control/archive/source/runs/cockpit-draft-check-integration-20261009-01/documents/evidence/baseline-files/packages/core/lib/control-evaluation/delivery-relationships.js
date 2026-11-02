// Sole registry shared by audit, prospective readiness and reviewed artefact recording.
export const deliveryRelationships = Object.freeze([
  { from: "UR", relationship: "approved_by", to: "Approval: UR", requiredBy: "UR" },
  { from: "PRD", relationship: "derived_from", to: "UR", requiredBy: "PRD" },
  { from: "SD", relationship: "derived_from", to: "PRD", requiredBy: "SD" },
  { from: "TP", relationship: "derived_from", to: "SD", requiredBy: "TP" },
  { from: "QA_REPORT", relationship: "tests", to: "TP", requiredBy: "QA" },
].map(Object.freeze));

export const relationshipForGate = gate => deliveryRelationships.find(row => row.requiredBy === gate);
export const sameRelationship = (row, expected) => row.from === expected.from
  && row.relationship === expected.relationship && row.to === expected.to;

export function relationshipRequired(expected, { approvalStatus, satisfied, currentGate, artefact, resolveFile } = {}) {
  if (approvalStatus === "not_applicable") return false;
  if (satisfied) return true;
  if (expected.requiredBy === "UR") return false; // Only a deliberate UR approval creates this row.
  const readyStatus = expected.requiredBy === "QA" ? ["pass", "passed"] : ["draft", "ready"];
  return currentGate === expected.requiredBy && readyStatus.includes(artefact?.status)
    && Boolean(artefact.path && resolveFile?.(artefact.path));
}
