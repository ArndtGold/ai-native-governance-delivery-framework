import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDeliveryPathSearch } from "../lib/delivery-path-search/search-engine.js";
import { fixtureEvaluator } from "../lib/delivery-path-search/evaluators/protocol.js";
import { fixtureGenerator } from "../lib/delivery-path-search/generators/protocol.js";
import { persistSearchResult } from "../lib/delivery-path-search/persistence.js";
import { searchInputFromControl } from "../lib/delivery-path-search/state-adapter.js";

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
  const blockedRoot = join(temp, "blocked");
  assert.throws(() => persistSearchResult(blockedRoot, inputUnavailable), /not persistable/);
  assert.equal(existsSync(blockedRoot), false, "non-persistable results must not create output directories");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

const canonicalRoot = mkdtempSync(join(tmpdir(), "agdf-dps-canonical-"));
try {
  const cli = join(import.meta.dirname, "..", "bin", "create-agdf.js");
  execFileSync(process.execPath, [cli, "init", "--dir", canonicalRoot]);
  rmSync(join(canonicalRoot, ".agdf", "control", "AGDF_RUN.md"), { force: true });
  execFileSync(process.execPath, [cli, "run-create", "--dir", canonicalRoot, "--run", "canonical-search"]);
  const artefactRoot = join(canonicalRoot, ".agdf", "control", "artefacts", "canonical-search");
  mkdirSync(artefactRoot, { recursive: true });
  for (const name of ["UR.md", "PRD.md", "SD.md", "TP.md", "BROWNFIELD_REVIEW.md", "BROWNFIELD_ANALYSIS.md"]) {
    writeFileSync(join(artefactRoot, name), `# ${name}\n`);
  }
  writeFileSync(join(canonicalRoot, ".agdf", "control", "MASTER_BACKLOG.md"), `# AGDF Master Backlog

## Active Backlog

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---:|---|---|---|---|---|---|
| 1 | \`canonical-search\` | Canonical search fixture | In Progress | [UR](artefacts/canonical-search/UR.md) · [Brownfield](artefacts/canonical-search/BROWNFIELD_REVIEW.md) · [PRD](artefacts/canonical-search/PRD.md) · [SD](artefacts/canonical-search/SD.md) · [TP](artefacts/canonical-search/TP.md) | [TP](artefacts/canonical-search/TP.md) | Implement approved tasks |
`);
  writeFileSync(join(canonicalRoot, ".agdf", "control", "runs", "canonical-search", "RUN_STATE.md"), `# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: canonical-search
- lifecycle: active
- revision: 1
- revision_id: 11111111-1111-4111-8111-111111111111
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: test

## Objective

Verify canonical actions without a persisted Run Status Card.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved implementation fixture. |
| What is approved? | UR through TP and Brownfield Analysis. |
| What is missing? | Implementation. |
| What is the next allowed action? | Implement approved tasks. |
| What is explicitly forbidden right now? | QA pass; release. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Approval: UR |
| PRD | approved | Approval: PRD |
| SD | approved | Approval: SD |
| TP | approved | Approval: TP |
| QA | missing | none |
| UAT | missing | none |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/canonical-search/UR.md | approved | ready |
| Brownfield Review | .agdf/control/artefacts/canonical-search/BROWNFIELD_REVIEW.md | done | ready |
| PRD | .agdf/control/artefacts/canonical-search/PRD.md | approved | ready |
| SD | .agdf/control/artefacts/canonical-search/SD.md | approved | ready |
| TP | .agdf/control/artefacts/canonical-search/TP.md | approved | ready |
| Brownfield Analysis | .agdf/control/artefacts/canonical-search/BROWNFIELD_ANALYSIS.md | done | pass |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Public contract fixture.
- evidence: fixture

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| PRD | derived_from | UR | fixture |
| SD | derived_from | PRD | fixture |
| TP | derived_from | SD | fixture |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Canonical fixture | test | action parity | direct |

## Risks

| Risk | Evidence | Severity | Required action |
|---|---|---|---|
| Regression | fixture | revise | test |

## Closeout

- next_allowed_action: Implement approved tasks.
`);
  const canonicalInput = searchInputFromControl(canonicalRoot, { scopeKey: "canonical-search" });
  assert.equal(canonicalInput.scope_key, "canonical-search");
  assert.equal(canonicalInput.scope_revision, "11111111-1111-4111-8111-111111111111");
  assert.ok(canonicalInput.allowed_actions.includes("implement the approved TP tasks"));
  assert.equal(canonicalInput.input_failure_code, undefined);
  assert.doesNotMatch(readFileSync(join(canonicalRoot, ".agdf", "control", "runs", "canonical-search", "RUN_STATE.md"), "utf8"), /## Run Status Card/);

  const staleInput = searchInputFromControl(canonicalRoot, { scopeKey: "canonical-search" }, {
    evaluateGateCheck: () => ({
      status_card: { run_id: "canonical-search" },
      status_presentation: { revision_id: "stale-revision" },
      current_gate: "CD+Tests",
      allowed: ["implement the approved TP tasks"],
      forbidden: ["release"],
      evidence_refs: [],
      next_allowed_action: "Refresh control state.",
    }),
    readRunState: () => ({
      content: readFileSync(join(canonicalRoot, ".agdf", "control", "runs", "canonical-search", "RUN_STATE.md"), "utf8"),
      risks: [],
    }),
  });
  assert.equal(staleInput.input_failure_code, "stale_control_snapshot");
  assert.deepEqual(staleInput.allowed_actions, []);
} finally {
  rmSync(canonicalRoot, { recursive: true, force: true });
}

console.log("Delivery Path Search focused tests passed.");
