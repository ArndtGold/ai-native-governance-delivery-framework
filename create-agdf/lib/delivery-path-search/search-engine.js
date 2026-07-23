import { CONTRACT_VERSION, SCORING_POLICY_VERSION, validateEvaluation, validateSearchInput } from "./contracts.js";
import { candidateLegality, candidatesFromInput, generatedCandidatesFromResponse } from "./candidate-policy.js";
import { scoreEvaluation } from "./scoring.js";
import { generatorRequestFromInput } from "./state-adapter.js";

function generatorFailureCode(error) {
  if (error?.code === "GENERATOR_MUTATION_DETECTED") return "generator_mutation_detected";
  if (error?.code === "GENERATOR_TIMEOUT") return "generator_timeout";
  if (error?.code === "GENERATOR_AUTHENTICATION_FAILED") return "generator_authentication_failed";
  if (error?.code === "ENOENT") return "generator_unavailable";
  if (/auth/i.test(error?.message ?? "")) return "generator_authentication_failed";
  if (/context|disallowed/i.test(error?.message ?? "")) return "generator_context_rejected";
  if (/budget/i.test(error?.message ?? "")) return "generator_budget_exceeded";
  return "generator_schema_invalid";
}

export async function runDeliveryPathSearch(inputValue, evaluator, options = {}) {
  const input = validateSearchInput(inputValue);
  const startedAt = Date.now();
  const baseline = [...(options.candidates ?? candidatesFromInput(input))];
  const queue = [...baseline];
  const rejected = [];
  const evaluated = [];
  let evaluations = 0;
  let costUnits = 0;
  let lastLeaderId = null;
  let stableComparisons = 0;
  let stoppingReason = "candidate_queue_exhausted";
  const generation = {
    status: input.generation?.enabled ? "failed" : "disabled",
    adapter: options.generator?.metadata ?? null,
    budgets: input.generation ?? null,
    returned: 0,
    accepted: 0,
    rejected: [],
    cost_units: 0,
    duration_ms: 0,
    failure_code: null,
  };

  if (input.generation?.enabled) {
    if (!options.generator) {
      generation.failure_code = "generator_unavailable";
    } else {
      const generationStartedAt = Date.now();
      try {
        const response = await options.generator.generate(generatorRequestFromInput(input));
        const elapsed = Date.now() - generationStartedAt;
        generation.returned = response.proposals.length;
        generation.cost_units = response.cost_units;
        costUnits += response.cost_units;
        if (elapsed > input.generation.max_duration_ms) {
          const error = new Error("generator duration budget exceeded");
          error.code = "GENERATOR_TIMEOUT";
          throw error;
        }
        if (response.cost_units > input.generation.max_cost_units || response.proposals.length > input.generation.max_proposals) {
          const error = new Error("generator response exceeds configured budget");
          error.code = "GENERATOR_BUDGET_EXCEEDED";
          throw error;
        }
        const filtered = generatedCandidatesFromResponse(response, input, baseline);
        generation.accepted = filtered.accepted.length;
        generation.rejected = filtered.rejected;
        queue.push(...filtered.accepted.slice(0, input.generation.max_proposals));
        generation.status = filtered.accepted.length === response.proposals.length ? "success" : "partial";
        if (!filtered.accepted.length) generation.failure_code = "generator_no_diverse_proposals";
      } catch (error) {
        generation.failure_code = generatorFailureCode(error);
        if (generation.failure_code === "generator_mutation_detected") throw error;
      } finally {
        generation.duration_ms = Date.now() - generationStartedAt;
      }
    }
  }

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
            source: "expanded",
            expected_evidence: [],
            tests: [],
            assumptions: evaluation.assumptions,
          });
        }
      }
    } catch (error) {
      if (error?.fatalEvaluator === true) throw error;
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
    generation,
    budgets: { configured: input.budgets, evaluations, cost_units: costUnits, stable_comparisons: stableComparisons, duration_ms: Date.now() - startedAt },
    stopping_reason: stoppingReason,
    next_gate_action: "Run canonical AGDF gate-check; search does not grant permission.",
  };
}
