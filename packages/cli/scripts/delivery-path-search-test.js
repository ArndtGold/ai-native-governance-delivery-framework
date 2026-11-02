import "../../../scripts/support/english-locale.js";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDeliveryPathSearch } from "#agdf-core/delivery-path-search/search-engine.js";
import { fixtureEvaluator } from "../lib/delivery-path-search/evaluators/protocol.js";
import { fixtureGenerator } from "../lib/delivery-path-search/generators/protocol.js";
import { persistSearchResult } from "#agdf-core/delivery-path-search/persistence.js";
import { searchInputFromControl } from "#agdf-core/delivery-path-search/state-adapter.js";
import { currentFixture, currentRun } from '../../core/test/fixtures/current-run.js';
import { structuredCurrentRun } from '../../core/test/fixtures/current-structured-run.js';

const baseInput = {
  contract_version: "1",
  scope_key: "fixture-scope",
  scope_revision: "fixture-revision-1",
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
assert.equal(substringSmuggling.status, "no_legal_candidates");
assert.equal(substringSmuggling.outcome_phase, "candidate");
assert.equal(substringSmuggling.provenance.evaluation_attempts, 0);
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
assert.equal(noSafe.status, "no_legal_candidates");
assert.equal(noSafe.budgets.evaluations, 0);

const invalidEvaluation = await runDeliveryPathSearch(
  baseInput,
  fixtureEvaluator({ safe: { ...evaluations.safe, scope_fit: 9 } }),
  { candidates: [candidates[0]] },
);
assert.equal(invalidEvaluation.status, "evaluator_error");
assert.equal(invalidEvaluation.outcome_phase, "evaluation");
assert.equal(invalidEvaluation.provenance.evaluation_attempts, 1);
assert.equal(invalidEvaluation.provenance.invalid_evaluations, 1);
assert.match(invalidEvaluation.rejected[0].reason, /invalid_evaluation/);

let unavailableEvaluatorCalls = 0;
const inputUnavailable = await runDeliveryPathSearch(
  {
    ...baseInput,
    allowed_actions: [],
    input_failure_code: "canonical_actions_unavailable",
    input_recovery_action: "Repair canonical control state.",
  },
  { async evaluate() { unavailableEvaluatorCalls += 1; return evaluations.safe; }, metadata: { name: "must-not-run" } },
);
assert.equal(inputUnavailable.status, "input_unavailable");
assert.equal(inputUnavailable.outcome_phase, "input");
assert.equal(inputUnavailable.provenance.evaluation_attempts, 0);
assert.equal(unavailableEvaluatorCalls, 0);
assert.equal(inputUnavailable.recommendation, null);

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

const persistenceCleanups = [], persistenceFixture = currentFixture({ after: callback => persistenceCleanups.push(callback) });
const persistenceRun = currentRun(persistenceFixture), temp = persistenceFixture.root;
try {
  const persisted = persistSearchResult(temp, {
    ...result, scope_key: persistenceRun.id, scope_revision: persistenceRun.binding().expected_revision_id,
    raw_prompt: "must not persist",
    hidden_reasoning: "must not persist",
  });
  const json = readFileSync(persisted.jsonPath, "utf8");
  assert.doesNotMatch(json, /must not persist/);
  assert.match(readFileSync(persisted.markdownPath, "utf8"), /gate-check remains authoritative/);
  const blockedRoot = join(temp, "blocked");
  assert.throws(() => persistSearchResult(blockedRoot, inputUnavailable), /not persistable/);
  assert.equal(existsSync(blockedRoot), false, "non-persistable results must not create output directories");
} finally {
  for (const cleanup of persistenceCleanups.reverse()) cleanup();
}

const disposers = [];
const current = structuredCurrentRun({ after: dispose => disposers.push(dispose) });
const canonicalRoot = current.f.root, runId = current.id;
try {
  assert.equal(current.step('internal', '# Brownfield Analysis\nDecision: pass\nSynthetic path-search prerequisite.\n', { internal_step: 'Brownfield Analysis', decision: 'pass' }).outcome, 'accepted');
  const canonicalInput = searchInputFromControl(canonicalRoot, { scopeKey: runId });
  assert.equal(canonicalInput.scope_key, runId);
  assert.equal(canonicalInput.scope_revision, current.binding().expected_revision_id);
  assert.ok(canonicalInput.allowed_actions.includes("implement the approved TP tasks"));
  assert.equal(canonicalInput.input_failure_code, undefined);
  assert.doesNotMatch(readFileSync(join(canonicalRoot, ".agdf", "control", "runs", runId, "RUN_STATE.md"), "utf8"), /## Run Status Card/);

  const staleInput = searchInputFromControl(canonicalRoot, { scopeKey: runId }, {
    evaluateGateCheck: () => ({
      status_card: { run_id: runId },
      status_presentation: { revision_id: "stale-revision" },
      current_gate: "CD+Tests",
      allowed: ["implement the approved TP tasks"],
      forbidden: ["release"],
      evidence_refs: [],
      next_allowed_action: "Refresh control state.",
    }),
    readRunState: () => ({
      content: readFileSync(join(canonicalRoot, ".agdf", "control", "runs", runId, "RUN_STATE.md"), "utf8"),
      risks: [],
    }),
  });
  assert.equal(staleInput.input_failure_code, "stale_control_snapshot");
  assert.deepEqual(staleInput.allowed_actions, []);
} finally {
  for (const dispose of disposers.reverse()) dispose();
}

console.log("Delivery Path Search focused tests passed.");
