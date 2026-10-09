import { SCORING_POLICY_VERSION } from "./contracts.js";

export const DEFAULT_WEIGHTS = Object.freeze({
  scope_fit: 3,
  gate_readiness: 3,
  risk_reduction: 2,
  evidence_gain: 2,
  testability: 2,
  reversibility: 1,
  cost: -1,
  uncertainty: -2,
});

const enforcementPenalty = { full: 0, tool_enforced: 1, instruction_only: 4 };

export function scoreEvaluation(evaluation, enforcementLevel, weights = DEFAULT_WEIGHTS) {
  const contributions = Object.fromEntries(Object.entries(weights).map(([key, weight]) => [key, evaluation[key] * weight]));
  const penalty = enforcementPenalty[enforcementLevel] ?? 4;
  const score = Object.values(contributions).reduce((sum, value) => sum + value, 0) - penalty;
  return { score, contributions, enforcement_penalty: penalty, scoring_policy_version: SCORING_POLICY_VERSION };
}
