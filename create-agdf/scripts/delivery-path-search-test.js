import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDeliveryPathSearch } from "../lib/delivery-path-search/search-engine.js";
import { fixtureEvaluator } from "../lib/delivery-path-search/evaluators/protocol.js";
import { fixtureGenerator } from "../lib/delivery-path-search/generators/protocol.js";
import { persistSearchResult } from "../lib/delivery-path-search/persistence.js";

const baseInput = {
  contract_version: "1",
  scope_key: "fixture-scope",
  objective: "Choose the safest next delivery step",
  current_gate: "CD+Tests",
  allowed_actions: ["inspect existing tests", "implement approved task"],
  forbidden_actions: ["release"],
  evidence_refs: ["TP.md"],
  risks: ["regression"],
  enforcement: { level: "tool_enforced", evidence: ["fixture read-only tools"] },
  budgets: { max_candidates: 3, max_depth: 1, max_evaluations: 3, max_duration_ms: 5000, max_cost_units: 10, stability_window: 3 },
};

const candidates = [
  { id: "safe", action: "inspect existing tests", expected_evidence: ["test inventory"], tests: [], assumptions: [], depth: 0 },
  { id: "illegal", action: "release", expected_evidence: [], tests: [], assumptions: [], depth: 0 },
];
const evaluations = {
  safe: {
    contract_version: "1",
    candidate_id: "safe",
    scope_fit: 5,
    gate_readiness: 5,
    risk_reduction: 4,
    evidence_gain: 5,
    testability: 5,
    reversibility: 5,
    cost: 1,
    uncertainty: 1,
    rationale: "Inspects current evidence before changing implementation.",
    risks: [],
    assumptions: [],
    child_actions: [],
  },
};

const result = await runDeliveryPathSearch(baseInput, fixtureEvaluator(evaluations), { candidates });
assert.equal(result.status, "recommendation");
assert.equal(result.recommendation.candidate_id, "safe");
assert.equal(result.rejected[0].candidate_id, "illegal");
assert.match(result.rejected[0].reason, /forbidden_by_gate/);
assert.equal(result.enforcement.level, "tool_enforced");

await assert.rejects(
  () => runDeliveryPathSearch({ ...baseInput, scope_key: "../../escape" }, fixtureEvaluator(evaluations), { candidates }),
  /safe path segment/,
);

const substringSmuggling = await runDeliveryPathSearch(
  baseInput,
  fixtureEvaluator({}),
  { candidates: [{ ...candidates[0], id: "smuggle", action: "inspect existing tests and release" }] },
);
assert.equal(substringSmuggling.status, "no_safe_recommendation");
assert.match(substringSmuggling.rejected[0].reason, /not_in_allowed_actions/);

const costLimited = await runDeliveryPathSearch(
  { ...baseInput, budgets: { ...baseInput.budgets, max_cost_units: 1 } },
  fixtureEvaluator(evaluations),
  { candidates: [candidates[0], { ...candidates[0], id: "second" }] },
);
assert.equal(costLimited.stopping_reason, "cost_budget_exhausted");
assert.equal(costLimited.budgets.evaluations, 1);

const noSafe = await runDeliveryPathSearch(
  { ...baseInput, allowed_actions: ["inspect existing tests"] },
  fixtureEvaluator({}),
  { candidates: [{ ...candidates[1], action: "release" }] },
);
assert.equal(noSafe.status, "no_safe_recommendation");
assert.equal(noSafe.budgets.evaluations, 0);

const invalidEvaluation = await runDeliveryPathSearch(
  baseInput,
  fixtureEvaluator({ safe: { ...evaluations.safe, scope_fit: 9 } }),
  { candidates: [candidates[0]] },
);
assert.equal(invalidEvaluation.status, "no_safe_recommendation");
assert.match(invalidEvaluation.rejected[0].reason, /invalid_evaluation/);

const generatedInput = {
  ...baseInput,
  generation: { enabled: true, max_calls: 1, max_proposals: 5, max_duration_ms: 3000, max_cost_units: 5 },
};
const generatedResponse = {
  contract_version: "1", cost_units: 2, proposals: [{
    proposal_id: "p1", gate_action: "implement approved task", intent: "implement the approved task through the existing search core",
    expected_evidence: ["integration test"], tests: ["generated path fixture"], assumptions: [], affected_boundaries: ["search core"],
    risk_strategy: "extend existing owner", reversibility: "additive change",
  }],
};
const generatedCandidateEvaluation = {
  ...evaluations.safe,
  candidate_id: "generated-p1",
  rationale: "Uses the existing owner with explicit evidence.",
};
const generatedResult = await runDeliveryPathSearch(
  generatedInput,
  fixtureEvaluator({ ...evaluations, "candidate-1": { ...evaluations.safe, candidate_id: "candidate-1" }, "candidate-2": { ...evaluations.safe, candidate_id: "candidate-2" }, "generated-p1": generatedCandidateEvaluation }),
  { generator: fixtureGenerator(generatedResponse) },
);
assert.equal(generatedResult.generation.status, "success");
assert.equal(generatedResult.generation.accepted, 1);
assert.equal(generatedResult.generation.cost_units, 2);
assert.ok(generatedResult.alternatives.some((item) => item.candidate_id === "generated-p1") || generatedResult.recommendation.candidate_id === "generated-p1");

const generatorFailure = await runDeliveryPathSearch(
  generatedInput,
  fixtureEvaluator({ "candidate-1": { ...evaluations.safe, candidate_id: "candidate-1" }, "candidate-2": { ...evaluations.safe, candidate_id: "candidate-2" } }),
  { generator: { async generate() { throw new Error("schema invalid"); }, metadata: { name: "broken" } } },
);
assert.equal(generatorFailure.generation.status, "failed");
assert.equal(generatorFailure.generation.failure_code, "generator_schema_invalid");
assert.equal(generatorFailure.status, "recommendation", "deterministic baseline must survive generator failure");

const strictGenerationBudget = await runDeliveryPathSearch(
  { ...generatedInput, generation: { ...generatedInput.generation, max_cost_units: 1 } },
  fixtureEvaluator({ "candidate-1": { ...evaluations.safe, candidate_id: "candidate-1" }, "candidate-2": { ...evaluations.safe, candidate_id: "candidate-2" } }),
  { generator: fixtureGenerator(generatedResponse) },
);
assert.equal(strictGenerationBudget.generation.status, "failed");
assert.equal(strictGenerationBudget.generation.failure_code, "generator_budget_exceeded");
assert.equal(strictGenerationBudget.generation.cost_units, 2, "reported over-budget consumption must remain visible");
assert.equal(strictGenerationBudget.status, "recommendation");

const temp = mkdtempSync(join(tmpdir(), "agdf-dps-test-"));
try {
  const persisted = persistSearchResult(temp, {
    ...result,
    raw_prompt: "must not persist",
    hidden_reasoning: "must not persist",
  });
  const json = readFileSync(persisted.jsonPath, "utf8");
  assert.doesNotMatch(json, /must not persist/);
  assert.match(readFileSync(persisted.markdownPath, "utf8"), /gate-check remains authoritative/);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("Delivery Path Search focused tests passed.");
