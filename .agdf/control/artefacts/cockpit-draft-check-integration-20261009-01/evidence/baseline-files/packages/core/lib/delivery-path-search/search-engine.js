import { CONTRACT_VERSION, SCORING_POLICY_VERSION, validateEvaluation, validateSearchInput, validateSearchResult } from "./contracts.js";
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

function evaluatorFailureCode(error) {
  if (error?.code === "ENOENT") return "evaluator_unavailable";
  if (/auth/i.test(error?.message ?? "")) return "evaluator_authentication_failed";
  if (/unavailable|not found|not configured/i.test(error?.message ?? "")) return "evaluator_unavailable";
  return "evaluator_output_invalid";
}

export function classifyTerminalOutcome({
  inputUnavailable = false,
  legalCandidates = 0,
  evaluationAttempts = 0,
  validEvaluations = 0,
  invalidEvaluations = 0,
  evaluatorUnavailable = false,
  leader = null,
}) {
  if (inputUnavailable) return { status: "input_unavailable", outcome_phase: "input" };
  if (legalCandidates === 0) return { status: "no_legal_candidates", outcome_phase: "candidate" };
  if (validEvaluations === 0 && evaluatorUnavailable) return { status: "evaluator_unavailable", outcome_phase: "evaluation" };
  if (validEvaluations === 0 && legalCandidates > 0) return { status: "evaluator_error", outcome_phase: "evaluation" };
  if (leader) return { status: "recommendation", outcome_phase: "search" };
  return { status: "no_safe_recommendation", outcome_phase: "search" };
}

export async function runDeliveryPathSearch(inputValue, evaluator, options = {}) {
  const input = validateSearchInput(inputValue);
  const startedAt = Date.now();
  const baseline = [...(options.candidates ?? candidatesFromInput(input))];
  const queue = [...baseline];
  const rejected = [];
  const evaluated = [];
  let evaluations = 0;
  let evaluationAttempts = 0;
  let invalidEvaluations = 0;
  let legalCandidates = 0;
  let rejectedCandidates = 0;
  let evaluatorUnavailable = false;
  let evaluationFailureCode = null;
  let costUnits = 0;
  let lastLeaderId = null;
  let stableComparisons = 0;
  let stoppingReason = "candidate_queue_exhausted";
  const generation = {
    status: input.generation?.enabled ? "not_run" : "disabled",
    adapter: options.generator?.metadata ?? null,
    budgets: input.generation ?? null,
    returned: 0,
    accepted: 0,
    rejected: [],
    cost_units: 0,
    duration_ms: 0,
    failure_code: null,
  };

  const finish = ({ leader = null, outcome, failureCode = null, recoveryAction = null }) => {
    evaluated.sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
    const result = {
      contract_version: CONTRACT_VERSION,
      scoring_policy_version: SCORING_POLICY_VERSION,
      scope_key: input.scope_key,
      scope_revision: input.scope_revision ?? "unversioned",
      objective: input.objective,
      current_gate: input.current_gate,
      outcome_phase: outcome.outcome_phase,
      status: outcome.status,
      recommendation: outcome.status === "recommendation" && leader ? {
        candidate_id: leader.candidate.id,
        action: leader.candidate.action,
        score: leader.score,
        rationale: leader.evaluation.rationale,
        expected_evidence: leader.candidate.expected_evidence,
        tests: leader.candidate.tests,
        risks: leader.evaluation.risks,
        assumptions: leader.evaluation.assumptions,
      } : null,
      alternatives: outcome.outcome_phase === "search" ? evaluated.slice(1).map((item) => ({
        candidate_id: item.candidate.id,
        action: item.candidate.action,
        score: item.score,
        rejection_reason: `ranked_below_${leader?.candidate.id ?? "search_policy"}`,
      })) : [],
      rejected,
      provenance: {
        baseline_candidates: baseline.length,
        generated_candidates: generation.accepted,
        legal_candidates: legalCandidates,
        rejected_candidates: rejectedCandidates + generation.rejected.length,
        evaluation_attempts: evaluationAttempts,
        valid_evaluations: evaluations,
        invalid_evaluations: invalidEvaluations,
      },
      enforcement: input.enforcement,
      evaluator: evaluator?.metadata ?? { name: evaluator?.name ?? "unknown" },
      generation,
      budgets: { configured: input.budgets, evaluations, cost_units: costUnits, stable_comparisons: stableComparisons, duration_ms: Date.now() - startedAt },
      stopping_reason: stoppingReason,
      failure_code: failureCode,
      next_action: recoveryAction ?? "Run canonical AGDF gate-check; search does not grant permission.",
      next_gate_action: recoveryAction ?? "Run canonical AGDF gate-check; search does not grant permission.",
    };
    return validateSearchResult(result);
  };

  if (input.input_failure_code || input.allowed_actions.length === 0) {
    stoppingReason = input.input_failure_code || "canonical_actions_unavailable";
    return finish({
      outcome: classifyTerminalOutcome({ inputUnavailable: true }),
      failureCode: input.input_failure_code || "canonical_actions_unavailable",
      recoveryAction: input.input_recovery_action || "Run canonical AGDF gate-check and repair the selected control state.",
    });
  }

  if (input.generation?.enabled) {
    generation.status = "failed";
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
    const candidate = queue.shift();
    const legality = candidateLegality(candidate, input);
    if (!legality.legal) {
      rejectedCandidates += 1;
      rejected.push({ candidate_id: candidate.id, action: candidate.action, reason: legality.reason });
      continue;
    }
    legalCandidates += 1;
    if (evaluations >= input.budgets.max_evaluations) { stoppingReason = "evaluation_budget_exhausted"; evaluationFailureCode = stoppingReason; break; }
    if (costUnits >= input.budgets.max_cost_units) { stoppingReason = "cost_budget_exhausted"; evaluationFailureCode = stoppingReason; break; }
    if (Date.now() - startedAt >= input.budgets.max_duration_ms) { stoppingReason = "duration_budget_exhausted"; evaluationFailureCode = stoppingReason; break; }

    try {
      evaluationAttempts += 1;
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
      invalidEvaluations += 1;
      evaluationFailureCode = evaluatorFailureCode(error);
      evaluatorUnavailable ||= evaluationFailureCode === "evaluator_unavailable" || evaluationFailureCode === "evaluator_authentication_failed";
      rejected.push({ candidate_id: candidate.id, action: candidate.action, reason: `invalid_evaluation: ${error.message}` });
      if (evaluatorUnavailable) break;
    }
  }

  evaluated.sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
  const leader = evaluated[0];
  const outcome = classifyTerminalOutcome({
    legalCandidates,
    evaluationAttempts,
    validEvaluations: evaluations,
    invalidEvaluations,
    evaluatorUnavailable,
    leader,
  });
  if (!leader) {
    stoppingReason = outcome.status === "no_legal_candidates"
      ? "no_legal_candidates"
      : outcome.status === "evaluator_unavailable"
        ? "evaluator_unavailable"
        : outcome.status === "evaluator_error"
          ? "evaluator_error"
          : stoppingReason;
  }
  return finish({
    leader,
    outcome,
    failureCode: outcome.outcome_phase === "evaluation" ? evaluationFailureCode : null,
    recoveryAction: outcome.outcome_phase === "evaluation"
      ? "Repair the declared evaluator capability and retry from a fresh canonical control snapshot."
      : null,
  });
}
