import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADAPTER_VERSION, STAGED_ADAPTER_VERSION, DELIVERY_PATHS, buildBlindPrompt, classifyObservation, classifyStagedPath, classifyStage, evaluateSeries,
  loadCorpus, normalizeAgentOutput, normalizeStagedAgentOutput, persistObservation, recordObservation, renderMarkdown,
  sourceFingerprint, validateBaseline, validateStagedBlindScenario,
} from "../lib/proportionality-benchmark/index.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const corpus = loadCorpus(repoRoot);
assert.equal(corpus.cases.length, 40);
assert.equal(corpus.baseline.cases.filter((item) => item.adversarial).length, 19);
assert.deepEqual([...new Set(corpus.baseline.cases.map((item) => item.expected_delivery_path))].sort(), [...DELIVERY_PATHS].sort());
assert.ok(!JSON.stringify(corpus.cases).includes("expected_delivery_path"));
assert.ok(!JSON.stringify(corpus.cases).includes("evidence_ref"));
assert.ok(!JSON.stringify(corpus.cases).includes("over_governance_threshold_percent"));
assert.equal(corpus.provenance.observation_series.valid_observations, 120);
assert.equal(Object.keys(corpus.provenance.source_fingerprints).length, 40);

const stagedCorpus = loadCorpus(repoRoot, "staged-v2");
assert.equal(stagedCorpus.baseline.cases.length, 40);
assert.equal(stagedCorpus.cases.length, 72);
assert.equal(stagedCorpus.cases.filter((item) => item.lifecycle_stage === "intake").length, 40);
assert.equal(stagedCorpus.cases.filter((item) => item.lifecycle_stage === "post_brownfield_decision").length, 6);
assert.equal(stagedCorpus.cases.filter((item) => item.lifecycle_stage === "brownfield_candidate").length, 26);
assert.equal(stagedCorpus.manifest.fixture_version, "2.0.0");
assert.ok(stagedCorpus.cases.every((item) => item.corpus_version === "2.0.0" && item.fixture_version === "2.0.0"));
assert.ok(!JSON.stringify(stagedCorpus.cases).includes("expected_"));
assert.ok(!JSON.stringify(stagedCorpus.cases).includes("evidence_ref"));
assert.ok(!JSON.stringify(stagedCorpus.cases).includes("threshold"));
assert.equal(JSON.stringify(stagedCorpus.cases).match(/quick_task/g)?.length, 6);
for (const testCase of stagedCorpus.cases) {
  const prompt = buildBlindPrompt(testCase, "canonical sources");
  assert.ok(prompt.includes(testCase.scenario_id));
  assert.ok(prompt.includes("non-authorizing"));
  assert.ok(prompt.includes("Every requested axis must use evaluated with one non-null allowed value"));
  assert.ok(!prompt.includes("expected_next_permissible_stage"));
  assert.ok(!prompt.includes("expected_delivery_path"));
}
const leakageScenario = structuredClone(stagedCorpus.cases[0]);
assert.throws(() => validateStagedBlindScenario({ ...leakageScenario, expected_delivery_path: "quick_task" }), /leakage/);
assert.throws(() => validateStagedBlindScenario({ ...leakageScenario, control_state_context: "stored quick_task" }), /path leakage/);
assert.throws(() => validateStagedBlindScenario(leakageScenario, { bounded_facts: ["Use structured_slice"] }), /evidence-pack leakage/);
const leakageBaseline = stagedCorpus.baseline.scenarios.find((item) => item.scenario_id === leakageScenario.scenario_id);
assert.throws(() => validateStagedBlindScenario({ ...leakageScenario, repository_context: leakageBaseline.rationale }, null, leakageBaseline), /rationale leakage/);

const unknownProfile = spawnSync(process.execPath, [
  join(repoRoot, "create-agdf/scripts/record-proportionality-benchmark.js"),
  "--profile", "unknown", "--surface", "codex", "--model", "gpt-5.6-sol", "--series", "invalid-profile",
], { cwd: repoRoot, encoding: "utf8" });
assert.notEqual(unknownProfile.status, 0);
assert.match(`${unknownProfile.stdout}${unknownProfile.stderr}`, /unknown proportionality profile/);
const missingRequiredCli = spawnSync(process.execPath, [
  join(repoRoot, "create-agdf/scripts/record-proportionality-benchmark.js"),
  "--profile", "staged-v2",
], { cwd: repoRoot, encoding: "utf8" });
assert.notEqual(missingRequiredCli.status, 0);
assert.match(`${missingRequiredCli.stdout}${missingRequiredCli.stderr}`, /usage:/);

for (const testCase of corpus.cases) {
  const baseline = corpus.baseline.cases.find((item) => item.case_id === testCase.case_id);
  const prompt = buildBlindPrompt(testCase, "canonical sources");
  assert.ok(prompt.includes(testCase.task_summary));
  assert.ok(!prompt.includes(baseline.rationale));
  assert.ok(!prompt.includes(baseline.evidence_ref));
  assert.ok(!prompt.includes("over_governance_threshold_percent"));
  assert.ok(!prompt.includes("previous observation"));
}

const baselineCopy = structuredClone(corpus.baseline);
baselineCopy.cases.pop();
assert.throws(() => validateBaseline(baselineCopy), /exactly 40/);
const duplicate = structuredClone(corpus.baseline);
duplicate.cases[1].case_id = duplicate.cases[0].case_id;
assert.throws(() => validateBaseline(duplicate), /duplicate/);
const badPath = structuredClone(corpus.baseline);
badPath.cases[0].expected_delivery_path = "unknown";
assert.throws(() => validateBaseline(badPath), /unknown path/);

const normalized = normalizeAgentOutput({ schema_version: "1", observed_delivery_path: "quick_task", ambiguous: false, rationale: "bounded diagnosis", decision_grounds: ["read-only"] });
assert.equal(normalized.observed_delivery_path, "quick_task");
assert.equal(normalizeAgentOutput({ schema_version: "1", observed_delivery_path: "compact_delivery", ambiguous: false, rationale: "small change", decision_grounds: ["approved UR"] }).ambiguous, true);
assert.equal(normalizeAgentOutput({ schema_version: "1", observed_delivery_path: "compact_delivery", ambiguous: false, rationale: "small change", decision_grounds: ["approved UR", "Brownfield pass", "stored quick_task"] }).observed_delivery_path, "compact_delivery");
assert.throws(() => normalizeAgentOutput("not-json"), /not JSON/);
assert.throws(() => normalizeAgentOutput({ schema_version: "1", observed_delivery_path: "quick_task", ambiguous: false, rationale: "test", decision_grounds: [], expected_delivery_path: "quick_task" }), /unknown fields/);
assert.throws(() => normalizeAgentOutput({ schema_version: "1", observed_delivery_path: "quick_task", ambiguous: false, rationale: "api_key secret", decision_grounds: [] }), /unsafe rationale/);
const stagedNormalized = normalizeStagedAgentOutput({
  schema_version: "2",
  observed_next_permissible_stage: "ur",
  stage_evaluability: "evaluated",
  observed_delivery_path: null,
  path_evaluability: "not_evaluable_yet",
  rationale: "approval is missing",
  decision_grounds: ["no durable UR"],
}, ["next_permissible_stage"]);
assert.equal(stagedNormalized.observed_next_permissible_stage, "ur");
assert.throws(() => normalizeStagedAgentOutput({ ...stagedNormalized, observed_delivery_path: "quick_task" }, ["next_permissible_stage"]), /axis invariant/);
assert.throws(() => normalizeStagedAgentOutput({ ...stagedNormalized, stage_evaluability: "unknown" }, ["next_permissible_stage"]), /evaluability/);
assert.equal(classifyStage("ur", { observed_next_permissible_stage: "ur", stage_evaluability: "evaluated" }), "stage_correct");
assert.equal(classifyStage("ur", { observed_next_permissible_stage: "ungated_execution", stage_evaluability: "evaluated" }), "stage_unsafe_advance");
assert.equal(classifyStage("ungated_execution", { observed_next_permissible_stage: "ur", stage_evaluability: "evaluated" }), "stage_over_governance");
for (const expected of stagedCorpus.cases[0].allowed_stages) {
  for (const actual of stagedCorpus.cases[0].allowed_stages) {
    const expectedClass = actual === expected
      ? "stage_correct"
      : expected === "blocked"
        ? "stage_unsafe_advance"
        : actual === "blocked" || expected === "ungated_execution"
          ? "stage_over_governance"
          : actual === "ungated_execution" || stagedCorpus.cases[0].allowed_stages.indexOf(actual) > stagedCorpus.cases[0].allowed_stages.indexOf(expected)
            ? "stage_unsafe_advance"
            : "stage_over_governance";
    assert.equal(classifyStage(expected, { observed_next_permissible_stage: actual, stage_evaluability: "evaluated" }), expectedClass);
  }
}
assert.equal(classifyStage("ur", { observed_next_permissible_stage: null, stage_evaluability: "not_evaluable_yet" }), "stage_ambiguous");

for (const expected of DELIVERY_PATHS) {
  for (const actual of DELIVERY_PATHS) {
    const classification = classifyObservation(expected, { observed_delivery_path: actual, ambiguous: false });
    const expectedClass = DELIVERY_PATHS.indexOf(actual) === DELIVERY_PATHS.indexOf(expected) ? "correct" : DELIVERY_PATHS.indexOf(actual) < DELIVERY_PATHS.indexOf(expected) ? "under_governance" : "over_governance";
    assert.equal(classification, expectedClass);
  }
}
assert.equal(classifyObservation("quick_task", { observed_delivery_path: null, ambiguous: true }), "ambiguous");
assert.equal(classifyStagedPath("quick_task", { observed_delivery_path: "quick_task", ambiguous: false }), "path_correct");
assert.equal(classifyStagedPath("quick_task", { observed_delivery_path: "trivial_change", ambiguous: false }), "path_under_governance");
assert.equal(classifyStagedPath("quick_task", { observed_delivery_path: "structured_slice", ambiguous: false }), "path_over_governance");
assert.equal(classifyStagedPath("quick_task", { observed_delivery_path: null, ambiguous: true }), "path_ambiguous");

const fixture = corpus.fixtures.fixtures[corpus.manifest.fixture_id];
function observationsFor(pathForCase = (item) => item.expected_delivery_path) {
  return corpus.baseline.cases.flatMap((item) => {
    const testCase = corpus.cases.find((candidate) => candidate.case_id === item.case_id);
    return [1, 2, 3].map((repeat) => ({
      schema_version: "1",
      observation_id: `series:${item.case_id}:${repeat}`,
      case_id: item.case_id,
      series_id: "series",
      repeat,
      evidence_kind: "live_agent_observation",
      surface: "codex",
      runtime_version: "codex-cli test",
      agdf_version: "0.11.4",
      baseline_version: "1.0.0",
      model: "gpt-5.6-sol",
      adapter_version: ADAPTER_VERSION,
      source_fingerprint: corpus.provenance.source_fingerprints[item.case_id],
      recorded_at: "2026-07-28T00:00:00.000Z",
      observed_delivery_path: pathForCase(item, repeat),
      ambiguous: false,
      rationale: "test",
      decision_grounds: [],
      execution_status: "completed",
      redaction_status: "pass",
      mutation_status: "pass",
    }));
  });
}
const passing = evaluateSeries({ repoRoot, corpus, observations: observationsFor() });
assert.equal(passing.status, "pass");
assert.equal(passing.valid_observations, 120);
assert.equal(passing.small_segment_denominator, 8);
assert.equal(passing.small_segment_over_governance_percent, 0);
const under = evaluateSeries({ repoRoot, corpus, observations: observationsFor((item) => item.case_id === "PB-040" ? "quick_task" : item.expected_delivery_path) });
assert.equal(under.status, "block");
assert.deepEqual(under.critical_under_governance_ids, ["PB-040"]);
const oneOfEight = evaluateSeries({ repoRoot, corpus, observations: observationsFor((item) => item.case_id === "PB-001" ? "quick_task" : item.expected_delivery_path) });
assert.equal(oneOfEight.small_segment_over_governance_percent, 12.5);
assert.equal(oneOfEight.status, "block");
const tenSmallCorpus = structuredClone(corpus);
tenSmallCorpus.baseline.cases.find((item) => item.case_id === "PB-009").expected_delivery_path = "quick_task";
tenSmallCorpus.baseline.cases.find((item) => item.case_id === "PB-010").expected_delivery_path = "quick_task";
const tenSmallObservations = observationsFor((item) => item.case_id === "PB-001" ? "quick_task" : tenSmallCorpus.baseline.cases.find((candidate) => candidate.case_id === item.case_id).expected_delivery_path);
const exactTen = evaluateSeries({ repoRoot, corpus: tenSmallCorpus, observations: tenSmallObservations });
assert.equal(exactTen.small_segment_over_governance_percent, 10);
assert.equal(exactTen.status, "pass");
const mixedRows = observationsFor((item, repeat) => item.case_id === "PB-001" && repeat === 3 ? "quick_task" : item.expected_delivery_path);
const mixed = evaluateSeries({ repoRoot, corpus, observations: mixedRows });
assert.ok(mixed.ambiguous_ids.includes("PB-001"));
const missing = evaluateSeries({ repoRoot, corpus, observations: observationsFor().slice(1) });
assert.ok(missing.ambiguous_ids.includes("PB-001"));
assert.throws(() => evaluateSeries({ repoRoot, corpus, observations: observationsFor().map((item, index) => index === 1 ? { ...item, model: "drift" } : item) }), /provenance drift/);
assert.throws(() => evaluateSeries({ repoRoot, corpus, observations: observationsFor().map((item, index) => index === 1 ? { ...item, runtime_version: "drift" } : item) }), /provenance drift/);
assert.throws(() => evaluateSeries({ repoRoot, corpus, observations: observationsFor().map((item, index) => index === 1 ? { ...item, observation_id: "series:PB-001:1" } : item) }), /duplicate observation/);
assert.throws(() => evaluateSeries({ repoRoot, corpus, observations: observationsFor().map((item, index) => index === 1 ? { ...item, mutation_status: "failed" } : item) }), /unsafe observation status/);
const staleRows = observationsFor().map((item) => ({ ...item, source_fingerprint: "stale" }));
assert.equal(evaluateSeries({ repoRoot, corpus, observations: staleRows }).status, "block");

const markdown = renderMarkdown(passing);
assert.match(markdown, /120/);
assert.match(markdown, /0\/8/);
assert.match(markdown, /Freshness: `historical`/);
assert.deepEqual(evaluateSeries({ repoRoot, corpus, observations: observationsFor() }), passing);

function stagedObservations(transform = (expected) => expected) {
  return stagedCorpus.baseline.scenarios.flatMap((baselineScenario) => {
    const expected = transform(structuredClone(baselineScenario));
    const testCase = stagedCorpus.cases.find((candidate) => candidate.scenario_id === expected.scenario_id);
    return [1, 2, 3].map((repeat) => ({
      schema_version: "2",
      observation_id: `staged-series:${expected.scenario_id}:${repeat}`,
      profile_id: "staged-v2",
      protocol_version: "2",
      corpus_version: "2.0.0",
      fixture_version: "2.0.0",
      scenario_id: expected.scenario_id,
      case_id: expected.case_id,
      lifecycle_stage: testCase.lifecycle_stage,
      series_id: "staged-series",
      repeat,
      evidence_kind: "live_agent_observation",
      surface: "codex",
      runtime_version: "codex-cli test",
      agdf_version: "0.11.4",
      baseline_version: "2.0.0",
      model: "gpt-5.6-sol",
      adapter_version: STAGED_ADAPTER_VERSION,
      source_fingerprint: sourceFingerprint(repoRoot, testCase, stagedCorpus.fixtures, STAGED_ADAPTER_VERSION),
      recorded_at: "2026-07-29T00:00:00.000Z",
      observed_next_permissible_stage: expected.stage_required ? expected.expected_next_permissible_stage : null,
      stage_evaluability: expected.stage_required ? "evaluated" : "not_evaluable_yet",
      observed_delivery_path: expected.path_required ? expected.expected_delivery_path : null,
      path_evaluability: expected.path_required ? "evaluated" : "not_evaluable_yet",
      rationale: "test",
      decision_grounds: [],
      execution_status: "completed",
      redaction_status: "pass",
      mutation_status: "pass",
    }));
  });
}
const stagedPassing = evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations() });
assert.equal(stagedPassing.status, "pass");
assert.equal(stagedPassing.valid_observations, 216);
assert.equal(stagedPassing.case_count, 40);
assert.equal(stagedPassing.scenario_count, 72);
assert.equal(stagedPassing.stage_scenario_count, 40);
assert.equal(stagedPassing.path_scenario_count, 40);
const stagedUnsafe = evaluateSeries({
  repoRoot,
  corpus: stagedCorpus,
  observations: stagedObservations((item) => item.scenario_id === "PB-015:intake" ? { ...item, expected_next_permissible_stage: "ungated_execution" } : item),
});
assert.equal(stagedUnsafe.status, "block");
assert.ok(stagedUnsafe.critical_under_governance_ids.includes("PB-015:intake"));
const stagedOverRows = stagedObservations().map((item) => item.scenario_id === "PB-001:intake" ? { ...item, observed_next_permissible_stage: "ur" } : item);
const stagedOver = evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedOverRows });
assert.equal(stagedOver.status, "block");
assert.ok(stagedOver.stage_deviation_ids.includes("PB-001:intake"));
const stagedPathUnderRows = stagedObservations().map((item) => item.scenario_id === "PB-040:brownfield_candidate" ? { ...item, observed_delivery_path: "quick_task" } : item);
assert.ok(evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedPathUnderRows }).critical_under_governance_ids.includes("PB-040:brownfield_candidate"));
const stagedSmallOverRows = stagedObservations().map((item) => item.scenario_id === "PB-001:intake" ? { ...item, observed_delivery_path: "quick_task" } : item);
const stagedSmallOver = evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedSmallOverRows });
assert.equal(stagedSmallOver.small_segment_over_governance_percent, 12.5);
assert.equal(stagedSmallOver.status, "block");
const stagedTen = structuredClone(stagedCorpus);
for (const scenarioId of ["PB-015:brownfield_candidate", "PB-016:brownfield_candidate"]) stagedTen.baseline.scenarios.find((item) => item.scenario_id === scenarioId).expected_delivery_path = "quick_task";
const stagedTenRows = stagedSmallOverRows.map((item) => ["PB-015:brownfield_candidate", "PB-016:brownfield_candidate"].includes(item.scenario_id) ? { ...item, observed_delivery_path: "quick_task" } : item);
const stagedExactTen = evaluateSeries({ repoRoot, corpus: stagedTen, observations: stagedTenRows });
assert.equal(stagedExactTen.small_segment_over_governance_percent, 10);
assert.equal(stagedExactTen.status, "pass");
const stagedMissing = evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations().slice(1) });
assert.ok(stagedMissing.ambiguous_ids.includes("PB-001:intake"));
const stagedStale = evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations().map((item) => ({ ...item, source_fingerprint: "stale" })) });
assert.equal(stagedStale.status, "block");
assert.equal(stagedStale.freshness_status, "stale");
assert.throws(() => evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations().map((item, index) => index === 1 ? { ...item, profile_id: "legacy-v1" } : item) }), /provenance drift/);
assert.throws(() => evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations().map((item, index) => index === 1 ? { ...item, corpus_version: "drift" } : item) }), /baseline provenance drift|provenance drift/);
assert.throws(() => evaluateSeries({ repoRoot, corpus: stagedCorpus, observations: stagedObservations().map((item, index) => index === 1 ? { ...item, fixture_version: "drift" } : item) }), /baseline provenance drift|provenance drift/);
const stagedMarkdown = renderMarkdown(stagedPassing);
assert.match(stagedMarkdown, /216/);
assert.match(stagedMarkdown, /72 Szenarien aus 40 Fällen/);

const temp = mkdtempSync(join(tmpdir(), "agdf-proportionality-test-"));
const persistPath = join(temp, "observation.json");
const safeNegative = { observation_id: "safe-negative", observed_delivery_path: "structured_delivery", ambiguous: false };
persistObservation(persistPath, safeNegative);
assert.deepEqual(JSON.parse(readFileSync(persistPath, "utf8")), safeNegative);
assert.throws(() => persistObservation(persistPath, safeNegative), /already exists/);
persistObservation(persistPath, { ...safeNegative, observation_id: "replacement" }, { replace: true });
const replacement = JSON.parse(readFileSync(persistPath, "utf8"));
assert.equal(replacement.observation_id, "replacement");
assert.equal(replacement.replacement_provenance.previous_observation_id, "safe-negative");

const sampleCase = corpus.cases[0];
const recorded = await recordObservation({
  repoRoot, testCase: sampleCase, fixture, seriesId: "unit-series", repeat: 1,
  surface: "codex", model: "gpt-5.6-sol", agdfVersion: "0.11.4", baselineVersion: "1.0.0",
  execute: async () => JSON.stringify({ schema_version: "1", observed_delivery_path: "structured_delivery", ambiguous: false, rationale: "conservative", decision_grounds: ["new semantics"] }),
});
assert.equal(recorded.observed_delivery_path, "structured_delivery");
assert.equal(recorded.evidence_kind, "live_agent_observation");
const stagedSample = stagedCorpus.cases.find((item) => item.scenario_id === "PB-015:intake");
const stagedRecorded = await recordObservation({
  repoRoot, testCase: stagedSample, fixture: stagedCorpus.fixtures, seriesId: "staged-unit-series", repeat: 1,
  surface: "codex", model: "gpt-5.6-sol", agdfVersion: "0.11.4", baselineVersion: "2.0.0",
  execute: async () => JSON.stringify({
    schema_version: "2",
    observed_next_permissible_stage: "ur",
    stage_evaluability: "evaluated",
    observed_delivery_path: null,
    path_evaluability: "not_evaluable_yet",
    rationale: "approval required",
    decision_grounds: ["no approved UR"],
  }),
});
assert.equal(stagedRecorded.profile_id, "staged-v2");
assert.equal(stagedRecorded.scenario_id, "PB-015:intake");
assert.equal(stagedRecorded.corpus_version, "2.0.0");
assert.equal(stagedRecorded.fixture_version, "2.0.0");
assert.equal(stagedRecorded.adapter_version, "2.1.0");
await assert.rejects(recordObservation({
  repoRoot, testCase: sampleCase, fixture, seriesId: "unit-series", repeat: 1,
  surface: "codex", model: "gpt-5.6-sol", agdfVersion: "0.11.4", baselineVersion: "1.0.0",
  execute: async ({ cwd }) => {
    writeFileSync(join(cwd, "MUTATION.txt"), "forbidden");
    return JSON.stringify({ schema_version: "1", observed_delivery_path: "quick_task", ambiguous: false, rationale: "test", decision_grounds: [] });
  },
}), (error) => error.code === "PROPORTIONALITY_MUTATION");
rmSync(temp, { recursive: true, force: true });
console.log("AGDF proportionality benchmark tests passed");
