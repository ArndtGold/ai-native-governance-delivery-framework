import { CONTRACT_VERSION, SCORING_POLICY_VERSION, validateEvaluation, validateSearchInput } from "./contracts.js";
import { candidateLegality, candidatesFromInput } from "./candidate-policy.js";
import { scoreEvaluation } from "./scoring.js";

export async function runDeliveryPathSearch(inputValue, evaluator, options = {}) {
  const input = validateSearchInput(inputValue);
  const startedAt = Date.now();
  const queue = [...(options.candidates ?? candidatesFromInput(input))];
  const rejected = [];
  const evaluated = [];
  let evaluations = 0;
  let costUnits = 0;
  let lastLeaderId = null;
  let stableComparisons = 0;
  let stoppingReason = "candidate_queue_exhausted";

  while (queue.length > 0) {
    if (evaluations >= input.budgets.max_evaluations) { stoppingReason = "evaluation_budget_exhausted"; break; }
    if (costUnits >= input.budgets.max_cost_units) { stoppingReason = "cost_budget_exhausted"; break; }
    if (Date.now() - startedAt >= input.budgets.max_duration_ms) { stoppingReason = "duration_budget_exhausted"; break; }
    const candidate = queue.shift();
    const legality = candidateLegality(candidate, input);
    if (!legality.legal) {
      rejected.push({ candidate_id: candidate.id, action: candidate.action, reason: legality.reason });
      continue;
    }

    try {
      const evaluation = validateEvaluation(await evaluator.evaluate(input, candidate), candidate.id);
      evaluations += 1;
      costUnits += evaluation.cost;
      const scored = scoreEvaluation(evaluation, input.enforcement.level);
      evaluated.push({ candidate, evaluation, ...scored });
      const currentLeader = [...evaluated].sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id))[0];
      if (currentLeader?.candidate.id === lastLeaderId) stableComparisons += 1;
      else stableComparisons = 1;
      lastLeaderId = currentLeader?.candidate.id ?? null;
      if (evaluated.length > 1 && stableComparisons >= input.budgets.stability_window) {
        stoppingReason = "stable_leader";
        break;
      }
      if ((candidate.depth ?? 0) + 1 < input.budgets.max_depth) {
        for (const [index, action] of evaluation.child_actions.slice(0, input.budgets.max_candidates).entries()) {
          queue.push({
            id: `${candidate.id}.${index + 1}`,
            parent_id: candidate.id,
            depth: (candidate.depth ?? 0) + 1,
            action,
            expected_evidence: [],
            tests: [],
            assumptions: evaluation.assumptions,
          });
        }
      }
    } catch (error) {
      rejected.push({ candidate_id: candidate.id, action: candidate.action, reason: `invalid_evaluation: ${error.message}` });
    }
  }

  evaluated.sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
  const leader = evaluated[0];
  if (!leader) stoppingReason = rejected.length ? "no_safe_candidate" : stoppingReason;
  return {
    contract_version: CONTRACT_VERSION,
    scoring_policy_version: SCORING_POLICY_VERSION,
    scope_key: input.scope_key,
    current_gate: input.current_gate,
    status: leader ? "recommendation" : "no_safe_recommendation",
    recommendation: leader ? {
      candidate_id: leader.candidate.id,
      action: leader.candidate.action,
      score: leader.score,
      rationale: leader.evaluation.rationale,
      expected_evidence: leader.candidate.expected_evidence,
      tests: leader.candidate.tests,
      risks: leader.evaluation.risks,
      assumptions: leader.evaluation.assumptions,
    } : null,
    alternatives: evaluated.slice(1).map((item) => ({
      candidate_id: item.candidate.id,
      action: item.candidate.action,
      score: item.score,
      rejection_reason: `ranked_below_${leader?.candidate.id ?? "safety_threshold"}`,
    })),
    rejected,
    enforcement: input.enforcement,
    evaluator: evaluator.metadata ?? { name: evaluator.name ?? "unknown" },
    budgets: { configured: input.budgets, evaluations, cost_units: costUnits, stable_comparisons: stableComparisons, duration_ms: Date.now() - startedAt },
    stopping_reason: stoppingReason,
    next_gate_action: "Run canonical AGDF gate-check; search does not grant permission.",
  };
}
