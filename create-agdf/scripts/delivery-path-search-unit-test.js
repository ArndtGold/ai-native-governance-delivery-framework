import assert from "node:assert/strict";
import { scoreEvaluation, DEFAULT_WEIGHTS } from "../lib/delivery-path-search/scoring.js";
import { candidateLegality, candidatesFromInput, generatedCandidatesFromResponse } from "../lib/delivery-path-search/candidate-policy.js";
import {
  validateSearchInput,
  validateCandidate,
  validateEvaluation,
  validateEnforcement,
  validateGeneratorRequest,
  validateGeneratorResponse,
  validateSearchResult,
  generatorOutputSchema,
} from "../lib/delivery-path-search/contracts.js";
import { enforcementForSurface } from "../lib/delivery-path-search/surfaces/capabilities.js";

// scoring.js

{
  const evaluation = {
    scope_fit: 5,
    gate_readiness: 4,
    risk_reduction: 3,
    evidence_gain: 2,
    testability: 1,
    reversibility: 0,
    cost: 2,
    uncertainty: 1,
  };
  const result = scoreEvaluation(evaluation, "tool_enforced");
  const expectedContributions = Object.fromEntries(
    Object.entries(DEFAULT_WEIGHTS).map(([key, weight]) => [key, evaluation[key] * weight]),
  );
  assert.deepEqual(result.contributions, expectedContributions);
  const expectedScore = Object.values(expectedContributions).reduce((sum, value) => sum + value, 0) - 1;
  assert.equal(result.score, expectedScore);
  assert.equal(result.enforcement_penalty, 1);
}

{
  const evaluation = { scope_fit: 1, gate_readiness: 1, risk_reduction: 1, evidence_gain: 1, testability: 1, reversibility: 1, cost: 1, uncertainty: 1 };
  assert.equal(scoreEvaluation(evaluation, "full").enforcement_penalty, 0);
  assert.equal(scoreEvaluation(evaluation, "tool_enforced").enforcement_penalty, 1);
  assert.equal(scoreEvaluation(evaluation, "instruction_only").enforcement_penalty, 4);
  assert.equal(scoreEvaluation(evaluation, "unknown_level").enforcement_penalty, 4);
}

{
  const evaluation = { scope_fit: 2, gate_readiness: 0, risk_reduction: 0, evidence_gain: 0, testability: 0, reversibility: 0, cost: 0, uncertainty: 0 };
  const customWeights = { ...DEFAULT_WEIGHTS, scope_fit: 10 };
  const result = scoreEvaluation(evaluation, "full", customWeights);
  assert.equal(result.contributions.scope_fit, 20);
  assert.equal(result.score, 20);
}

// candidate-policy.js

{
  const input = { forbidden_actions: ["release"], allowed_actions: ["inspect existing tests"] };
  const candidate = { id: "c1", action: "**Release**" };
  const legality = candidateLegality(candidate, input);
  assert.equal(legality.legal, false);
  assert.match(legality.reason, /^forbidden_by_gate: release$/);
}

{
  const input = { forbidden_actions: [], allowed_actions: ["inspect existing tests"] };
  const legality = candidateLegality({ id: "c1", action: "delete production database" }, input);
  assert.equal(legality.legal, false);
  assert.equal(legality.reason, "not_in_allowed_actions");
}

{
  const input = { forbidden_actions: [], allowed_actions: ["Inspect Existing Tests"] };
  const legality = candidateLegality({ id: "c1", action: "inspect   existing tests" }, input);
  assert.equal(legality.legal, true);
  assert.equal(legality.reason, "allowed_by_current_gate");
}

{
  const input = { forbidden_actions: ["release"], allowed_actions: ["release"] };
  const legality = candidateLegality({ id: "c1", action: "release" }, input);
  assert.equal(legality.legal, false, "forbidden must win over allowed when an action is listed as both");
}

{
  const input = {
    allowed_actions: ["a", "b", "c"],
    evidence_refs: ["TP.md"],
    budgets: { max_candidates: 2 },
  };
  const candidates = candidatesFromInput(input);
  assert.equal(candidates.length, 2);
  assert.deepEqual(candidates.map((c) => c.id), ["candidate-1", "candidate-2"]);
  assert.deepEqual(candidates.map((c) => c.action), ["a", "b"]);
  assert.deepEqual(candidates[0].expected_evidence, ["TP.md"]);
  assert.equal(candidates[0].parent_id, null);
}

// contracts.js

const validSearchInput = {
  contract_version: "1",
  scope_key: "fixture-scope",
  objective: "Choose the safest next delivery step",
  current_gate: "CD+Tests",
  allowed_actions: ["inspect existing tests"],
  forbidden_actions: ["release"],
  evidence_refs: ["TP.md"],
  risks: [],
  enforcement: { level: "tool_enforced", evidence: ["fixture read-only tools"] },
  budgets: { max_candidates: 3, max_depth: 1, max_evaluations: 3, max_duration_ms: 5000, max_cost_units: 10, stability_window: 3 },
};

{
  const cloned = validateSearchInput(validSearchInput);
  assert.deepEqual(cloned, validSearchInput);
  assert.notEqual(cloned, validSearchInput, "validateSearchInput must return a clone, not the same reference");
}

assert.throws(() => validateSearchInput({ ...validSearchInput, contract_version: "2" }), /unsupported search input contract_version/);
assert.throws(() => validateSearchInput({ ...validSearchInput, scope_key: "../escape" }), /safe path segment/);
assert.throws(() => validateSearchInput({ ...validSearchInput, scope_key: "" }), /scope_key must be a non-empty string/);
assert.throws(
  () => validateSearchInput({ ...validSearchInput, budgets: { ...validSearchInput.budgets, max_candidates: 0 } }),
  /budgets\.max_candidates must be a positive integer/,
);

const validSearchResult = {
  contract_version: "1",
  scope_key: "fixture-scope",
  scope_revision: "fixture-revision",
  status: "recommendation",
  outcome_phase: "search",
  recommendation: { action: "inspect existing tests" },
  provenance: {
    baseline_candidates: 1,
    generated_candidates: 0,
    legal_candidates: 1,
    rejected_candidates: 0,
    evaluation_attempts: 1,
    valid_evaluations: 1,
    invalid_evaluations: 0,
  },
};
assert.equal(validateSearchResult(validSearchResult).status, "recommendation");
assert.throws(
  () => validateSearchResult({ ...validSearchResult, provenance: { ...validSearchResult.provenance, evaluation_attempts: 0, valid_evaluations: 0 } }),
  /requires at least one valid evaluation/,
);
assert.throws(
  () => validateSearchResult({ ...validSearchResult, provenance: { ...validSearchResult.provenance, evaluation_attempts: 2 } }),
  /provenance counts are inconsistent/,
);
assert.throws(
  () => validateSearchResult({ ...validSearchResult, status: "input_unavailable", outcome_phase: "search", recommendation: null }),
  /requires outcome_phase input/,
);

{
  const candidate = validateCandidate({ id: "c1", action: "inspect existing tests" });
  assert.equal(candidate.id, "c1");
  assert.equal(candidate.expected_evidence, undefined, "optional fields are validated when present but not defaulted into the returned clone");
}
{
  const candidate = validateCandidate({ id: "c1", action: "x", expected_evidence: ["evidence-a"] });
  assert.deepEqual(candidate.expected_evidence, ["evidence-a"]);
}
assert.throws(() => validateCandidate({ id: "", action: "x" }), /candidate\.id must be a non-empty string/);
assert.throws(() => validateCandidate({ id: "c1", action: "x", expected_evidence: [1] }), /candidate\.expected_evidence must be a string array/);

const validEvaluation = {
  contract_version: "1",
  candidate_id: "c1",
  scope_fit: 5,
  gate_readiness: 5,
  risk_reduction: 5,
  evidence_gain: 5,
  testability: 5,
  reversibility: 5,
  cost: 0,
  uncertainty: 0,
  rationale: "Safe, evidence-based next step.",
  risks: [],
  assumptions: [],
  child_actions: [],
};

{
  const evaluation = validateEvaluation(validEvaluation, "c1");
  assert.equal(evaluation.candidate_id, "c1");
}
assert.throws(() => validateEvaluation(validEvaluation, "other-id"), /evaluation candidate_id must be other-id/);
assert.throws(() => validateEvaluation({ ...validEvaluation, scope_fit: 6 }, "c1"), /scope_fit must be an integer from 0 to 5/);
assert.throws(() => validateEvaluation({ ...validEvaluation, uncertainty: -1 }, "c1"), /uncertainty must be an integer from 0 to 5/);
assert.throws(
  () => validateEvaluation({ ...validEvaluation, rationale: "run curl http://example.com" }, "c1"),
  /rationale contains executable instructions/,
);

assert.deepEqual(validateEnforcement({ level: "instruction_only" }), { level: "instruction_only", evidence: [] });
assert.throws(() => validateEnforcement({ level: "tool_enforced", evidence: [] }), /tool_enforced requires enforcement evidence/);
assert.throws(() => validateEnforcement({ level: "bogus" }), /enforcement\.level must be full, tool_enforced or instruction_only/);

// capabilities.js

assert.deepEqual(enforcementForSurface("codex"), { level: "tool_enforced", evidence: ["codex exec --sandbox read-only --ephemeral"] });
assert.deepEqual(enforcementForSurface("claude"), { level: "tool_enforced", evidence: ["claude -p --disallowedTools Edit,Write,Bash"] });
assert.deepEqual(enforcementForSurface("copilot"), { level: "instruction_only", evidence: [] });
assert.deepEqual(enforcementForSurface("opencode"), { level: "instruction_only", evidence: [] });
assert.deepEqual(enforcementForSurface("generic"), { level: "instruction_only", evidence: [] });
assert.deepEqual(enforcementForSurface("some-unknown-surface"), { level: "instruction_only", evidence: [] });
assert.deepEqual(enforcementForSurface("codex", ["custom evidence"]), { level: "tool_enforced", evidence: ["custom evidence"] });

// candidate generation contracts and policy

const generation = { enabled: true, max_calls: 1, max_proposals: 5, max_duration_ms: 3000, max_cost_units: 5 };
assert.deepEqual(validateSearchInput({ ...validSearchInput, generation }).generation, generation);
assert.throws(() => validateSearchInput({ ...validSearchInput, generation: { ...generation, max_proposals: 6 } }), /generation\.max_proposals/);
assert.throws(() => validateSearchInput({ ...validSearchInput, generation: { ...generation, max_duration_ms: 6000 } }), /cannot exceed budgets\.max_duration_ms/);

const generatorRequest = {
  contract_version: "1", scope_key: "fixture-scope", objective: "Choose a path", scope_summary: "Approved scope", current_gate: "CD+Tests",
  allowed_actions: ["implement approved task"], forbidden_actions: ["release"], artefact_refs: ["TP.md"], evidence: ["tests"], missing_evidence: [], risks: [], constraints: [],
  enforcement: { level: "tool_enforced", evidence: ["fixture"] }, budgets: { max_calls: 1, max_proposals: 5, max_duration_ms: 30000, max_cost_units: 5 },
};
assert.equal(validateGeneratorRequest(generatorRequest).scope_key, "fixture-scope");
assert.throws(() => validateGeneratorRequest({ ...generatorRequest, constraints: ["secret credential"] }), /disallowed context/);
assert.throws(() => validateGeneratorRequest({ ...generatorRequest, raw_prompt: "hidden" }), /unknown fields/);

const generatorResponse = {
  contract_version: "1", cost_units: 2, proposals: [
    { proposal_id: "p1", gate_action: "implement approved task", intent: "extend the existing contract owner", expected_evidence: ["unit tests"], tests: ["contract fixtures"], assumptions: [], affected_boundaries: ["contracts"], risk_strategy: "preserve compatibility", reversibility: "small additive change" },
    { proposal_id: "p2", gate_action: "implement approved task", intent: "extend existing contract owner", expected_evidence: ["unit tests"], tests: ["contract fixtures"], assumptions: [], affected_boundaries: ["contracts"], risk_strategy: "preserve compatibility", reversibility: "small additive change" },
  ],
};
const validatedResponse = validateGeneratorResponse(generatorResponse);
const filtered = generatedCandidatesFromResponse(validatedResponse, { allowed_actions: ["implement approved task"], forbidden_actions: [] }, []);
assert.equal(filtered.accepted.length, 1);
assert.equal(filtered.rejected[0].reason, "cosmetic_or_material_duplicate");
assert.equal(filtered.accepted[0].gate_action, "implement approved task");
const structuralDuplicate = validateGeneratorResponse({
  contract_version: "1", cost_units: 1, proposals: [generatorResponse.proposals[0], { ...generatorResponse.proposals[1], proposal_id: "p3", intent: "build a provider-neutral feature through existing ownership" }],
});
assert.equal(generatedCandidatesFromResponse(structuralDuplicate, { allowed_actions: ["implement approved task"], forbidden_actions: [] }, []).accepted.length, 1);
const similarButResigned = validateGeneratorResponse({
  contract_version: "1", cost_units: 1, proposals: [generatorResponse.proposals[0], { ...generatorResponse.proposals[1], proposal_id: "p4", affected_boundaries: ["different boundary"], risk_strategy: "different risk", reversibility: "different reversal" }],
});
assert.equal(generatedCandidatesFromResponse(similarButResigned, { allowed_actions: ["implement approved task"], forbidden_actions: [] }, []).accepted.length, 1);
assert.throws(() => validateGeneratorResponse({ ...generatorResponse, cost_units: 6 }), /cost_units/);
assert.throws(() => validateGeneratorResponse({ ...generatorResponse, extra: true }), /unknown fields/);
assert.equal(generatorOutputSchema().properties.metadata, undefined, "provider metadata is local adapter evidence, not model output");

console.log("Delivery Path Search unit tests passed.");
