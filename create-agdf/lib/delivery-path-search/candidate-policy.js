import { validateCandidate } from "./contracts.js";

function normalized(value) {
  return String(value).toLowerCase().replace(/[`*_]/g, "").replace(/\s+/g, " ").trim();
}

export function candidateLegality(candidateValue, input) {
  const candidate = validateCandidate(candidateValue);
  const action = normalized(candidate.action);
  const forbiddenMatch = input.forbidden_actions.find((item) => {
    const forbidden = normalized(item);
    return forbidden && action === forbidden;
  });
  if (forbiddenMatch) return { legal: false, reason: `forbidden_by_gate: ${forbiddenMatch}`, candidate };

  const allowedMatch = input.allowed_actions.some((item) => {
    const allowed = normalized(item);
    return allowed && action === allowed;
  });
  if (!allowedMatch) return { legal: false, reason: "not_in_allowed_actions", candidate };
  return { legal: true, reason: "allowed_by_current_gate", candidate };
}

export function candidatesFromInput(input) {
  return input.allowed_actions.slice(0, input.budgets.max_candidates).map((action, index) => ({
    id: `candidate-${index + 1}`,
    action,
    expected_evidence: input.evidence_refs,
    tests: [],
    assumptions: [],
    depth: 0,
    parent_id: null,
  }));
}
