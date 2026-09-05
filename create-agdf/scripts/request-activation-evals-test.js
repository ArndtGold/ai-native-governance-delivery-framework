import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  persistRequestActivationBehavioralReport,
  requestActivationBehaviorSchema,
  requestActivationBehaviorInput,
  requestActivationBehaviorPrompt,
  requestActivationComposedProfilePrompt,
  resolveRequestActivationEvaluationSurfaces,
  runRequestActivationBehavioralEvaluation,
} from "../lib/request-activation-evals/behavioral.js";
import { composeRequestActivationProfile } from "../lib/request-activation-evals/composed-profile.js";
import {
  gradeRequestActivationObservation,
  loadRequestActivationCorpus,
  validateJsonSchema,
  validateRequestActivationCorpus,
} from "../lib/request-activation-evals/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const evalManifest = JSON.parse(readFileSync(join(repoRoot, "evals", "manifest.json"), "utf8"));
assert.deepEqual(evalManifest.request_activation, {
  manifest: "request-activation/manifest.json",
  schema: "request-activation/schema.json",
});
const deterministic = validateRequestActivationCorpus(repoRoot);
assert.equal(deterministic.status, "pass", JSON.stringify(deterministic.failures));
assert.ok(deterministic.cases >= 24, "request activation corpus must remain substantial");
assert.deepEqual(deterministic.locales, ["de", "en"]);
assert.ok(deterministic.selected_skill_none_cases > 0, "corpus must explicitly represent selected_skill none");
assert.equal(deterministic.composed_profile_cases, 8);
assert.deepEqual(deterministic.profile_surfaces, ["claude", "codex", "copilot", "opencode"]);
assert.match(deterministic.source_fingerprint, /^sha256:[a-f0-9]{64}$/);

const { cases, schema } = loadRequestActivationCorpus(repoRoot);
const selectedCases = [
  "de-assessment-only",
  "de-assessment-typo-dsa",
  "de-bound-approval-continuation",
  "de-unbound-approval-text",
  "de-direct-gate-check",
  "en-ambiguous-effect",
  "en-opencode-installation-status",
];
for (const caseId of selectedCases) assert.ok(cases.some((testCase) => testCase.case_id === caseId), `missing test case ${caseId}`);
const typoAssessmentCase = cases.find(({ case_id: caseId }) => caseId === "de-assessment-typo-dsa");
assert.equal(typoAssessmentCase.user_text, "Bewerte dsa Projekt");
assert.equal(typoAssessmentCase.expected.decision, "abstain");
assert.equal(typoAssessmentCase.expected.visible_agdf, "silent");
assert.deepEqual(typoAssessmentCase.expected.allowed_callbacks, []);
assert.deepEqual(typoAssessmentCase.expected.callback_order, []);
const composedNegativeCase = cases.find(({ case_id: caseId }) => caseId === "de-assessment-only");
assert.equal(composedNegativeCase.composed_profile.instruction_skill, "gate-check");
assert.equal(composedNegativeCase.expected.selected_skill, "none", "instruction_skill must remain independent from expected selection");

const schemaCase = cases.find(({ pair }) => pair);
assert.deepEqual(validateJsonSchema(schema, schemaCase), []);
for (const [mutate, keyword] of [
  [(testCase) => ({ ...testCase, case_family: "unknown_family" }), "enum"],
  [(testCase) => ({ ...testCase, pair: { ...testCase.pair, unexpected: true } }), "additionalProperties"],
  [(testCase) => ({ ...testCase, covered_criteria: [testCase.covered_criteria[0], testCase.covered_criteria[0]] }), "uniqueItems"],
  [(testCase) => ({ ...testCase, expected: { ...testCase.expected, unexpected: true } }), "additionalProperties"],
  [(testCase) => ({ ...testCase, prior_context: [{ role: "assistant", text: "context", unexpected: true }] }), "additionalProperties"],
  [(testCase) => ({ ...testCase, composed_profile: { instruction_skill: "gate-check", unexpected: true } }), "additionalProperties"],
  [(testCase) => ({ ...testCase, composed_profile: { instruction_skill: "Gate Check" } }), "pattern"],
]) {
  assert.ok(
    validateJsonSchema(schema, mutate(structuredClone(schemaCase))).some((error) => error.keyword === keyword),
    `JSON Schema must enforce ${keyword}`,
  );
}

const directSkillCase = cases.find(({ case_id: caseId }) => caseId === "de-direct-gate-check");
const behavioralInput = requestActivationBehaviorInput(directSkillCase);
assert.deepEqual(Object.keys(behavioralInput).sort(), [
  "ambient_control_context",
  "locale",
  "observed_invocation_evidence",
  "observed_selection_evidence",
  "prior_context",
  "schema_version",
  "user_text",
]);
for (const forbidden of ["case_id", "composed_profile", "instruction_skill", "requested_effect", "expected", "case_family", "covered_criteria", "pair"]) {
  assert.equal(forbidden in behavioralInput, false, `behavioral model input must not leak oracle field ${forbidden}`);
}
const behavioralPrompt = requestActivationBehaviorPrompt("CANONICAL CONTRACT", behavioralInput);
assert.match(behavioralPrompt, /Case input:/);
assert.doesNotMatch(behavioralPrompt, /\"expected\"|\"requested_effect\"|\"request_class\"|\"decision\"/);
assert.match(behavioralPrompt, /Use only the schema's exact enum values/);
assert.match(behavioralPrompt, /abstain\/clarify => \[\]/);
assert.match(behavioralPrompt, /delivery\.start` selects `gate-check/);
const neutralComposedPrompt = requestActivationComposedProfilePrompt("SOURCE PROFILE", behavioralInput);
assert.match(neutralComposedPrompt, /SOURCE PROFILE/);
assert.doesNotMatch(neutralComposedPrompt, /delivery\.start.*gate-check|abstain\/clarify|automatic discovery.*deliberate invocation/i);
assert.equal(requestActivationBehaviorSchema.properties.visible_agdf.enum.includes("none"), false);
assert.deepEqual(requestActivationBehaviorSchema.properties.authorizes, { type: "boolean", const: false });
assert.deepEqual(resolveRequestActivationEvaluationSurfaces({ surface: "claude" }), {
  inputMode: "canonical_contract",
  evaluatorSurface: "claude",
  profileSurface: null,
});
assert.deepEqual(resolveRequestActivationEvaluationSurfaces({
  inputMode: "composed_profile",
  profileSurface: "copilot",
  evaluatorSurface: "codex",
}), {
  inputMode: "composed_profile",
  evaluatorSurface: "codex",
  profileSurface: "copilot",
});
assert.throws(
  () => resolveRequestActivationEvaluationSurfaces({ surface: "codex", evaluatorSurface: "claude" }),
  /cannot be combined/,
);
assert.throws(
  () => resolveRequestActivationEvaluationSurfaces({ inputMode: "composed_profile", evaluatorSurface: "codex" }),
  /requires profileSurface/,
);
assert.throws(
  () => resolveRequestActivationEvaluationSurfaces({ inputMode: "composed_profile", profileSurface: "copilot", evaluatorSurface: "copilot" }),
  /only codex or claude/,
);

const canonicalContract = readFileSync(join(repoRoot, "plugin", "meta", "contracts", "request-activation.md"), "utf8");
const compositionFingerprints = new Map();
for (const profileSurface of ["codex", "claude", "copilot", "opencode"]) {
  const composition = await composeRequestActivationProfile({
    repoRoot,
    profileSurface,
    instructionSkill: "gate-check",
  });
  assert.equal(composition.profile_surface, profileSurface);
  assert.equal(composition.evidence_plane, "source_composed");
  assert.equal(composition.loaded_profile, false);
  assert.match(composition.fingerprint, /^sha256:[a-f0-9]{64}$/);
  compositionFingerprints.set(profileSurface, composition.fingerprint);
  assert.equal(composition.components.filter(({ kind }) => kind === "discovery").length, 10);
  assert.equal(composition.components.filter(({ kind }) => kind === "selected_skill").length, 1);
  assert.match(composition.model_instructions, /AGDF-REQUEST-ACTIVATION-GUARD:START/);
  assert.doesNotMatch(composition.model_instructions, /## Operation Catalog/);
  assert.doesNotMatch(composition.model_instructions, /^(?:name|description):/m, "discovery composition must use parsed descriptions, not YAML syntax");
  if (profileSurface === "opencode") {
    assert.equal(composition.components.filter(({ kind }) => kind === "bootstrap").length, 1);
    assert.equal(composition.components.filter(({ kind }) => kind === "active_dynamic_context").length, 1);
  } else {
    assert.equal(composition.components.filter(({ kind }) => kind === "session_start").length, 1);
  }
}
await assert.rejects(
  composeRequestActivationProfile({ repoRoot, profileSurface: "codex", instructionSkill: "not-a-skill" }),
  /unknown composed-profile instruction skill/,
);

function behavioralObservation(testCase, predictedCallbacks) {
  return {
    requested_effect: testCase.requested_effect,
    invocation_provenance: testCase.invocation_provenance,
    selection_origin: testCase.selection_origin,
    request_class: testCase.expected.request_class,
    decision: testCase.expected.decision,
    operation_id: testCase.expected.operation_id,
    selected_skill: testCase.expected.selected_skill,
    visible_agdf: testCase.expected.visible_agdf,
    predicted_callbacks: predictedCallbacks,
    authorizes: false,
    persist: false,
  };
}
assert.equal(
  gradeRequestActivationObservation(directSkillCase, behavioralObservation(directSkillCase, ["dispatcher_v1"])).status,
  "pass",
);
for (const [predictedCallbacks, expectedCode] of [
  [["dispatcher_v1", "unknown_callback"], "CALLBACK_SCHEMA"],
  [["dispatcher_v1", "dispatcher_v1"], "CALLBACK_SCHEMA"],
  [[], "CALLBACK_ORDER"],
  [["dispatcher_v1", "agdf_renderer"], "CALLBACK_ORDER"],
  [null, "CALLBACK_SCHEMA"],
]) {
  const result = gradeRequestActivationObservation(
    directSkillCase,
    behavioralObservation(directSkillCase, predictedCallbacks),
  );
  assert.equal(result.status, "block", `callback trace must fail closed: ${JSON.stringify(predictedCallbacks)}`);
  assert.ok(result.failures.some(({ code }) => code === expectedCode));
}

const hostEvidenceRoot = join(repoRoot, ".agdf", "control", "artefacts", "agdf-request-activation-boundary");
const hostSchema = JSON.parse(readFileSync(join(hostEvidenceRoot, "HOST_OBSERVATION_SCHEMA.json"), "utf8"));
const hostMatrix = JSON.parse(readFileSync(join(hostEvidenceRoot, "HOST_OBSERVATION_MATRIX.json"), "utf8"));
assert.equal(hostSchema.properties.hosts.minItems, 4);
assert.equal(hostMatrix.evidence_plane, "fresh_loaded_host");
assert.equal(hostMatrix.status, "unavailable");
assert.deepEqual(hostMatrix.hosts.map(({ host }) => host).sort(), ["claude_code", "codex", "github_copilot", "opencode"]);
const canonicalGuardFingerprint = /- `guard_fingerprint`: `(sha256:[0-9a-f]{64})`/.exec(
  readFileSync(join(repoRoot, "plugin", "meta", "contracts", "request-activation.md"), "utf8"),
)?.[1];
assert.equal(hostMatrix.request_activation.guard_fingerprint, canonicalGuardFingerprint, "host matrix must bind to the current canonical guard even while observations are unavailable");
for (const host of hostMatrix.hosts) {
  assert.equal(host.status, "unavailable");
  assert.equal(host.install.status, "unavailable");
  assert.equal(host.staged_profile.status, "unavailable");
  assert.equal(host.staged_profile.version, null);
  assert.equal(host.staged_profile.digest, null, "uninstalled stage metadata must not be promoted to host evidence");
  assert.equal(host.staged_profile.identity, null);
  assert.equal(host.installed_profile.status, "unavailable");
  assert.equal(host.installed_profile.digest, null, "generated or fixture digest must not be recorded as installed-host evidence");
  assert.equal(host.fresh_session.status, "unavailable");
  assert.equal(host.fresh_session.profile_version, null);
  assert.equal(host.fresh_session.profile_digest, null);
  assert.equal(host.fresh_session.profile_identity, null);
  assert.equal(host.callback_trace, "unavailable", "missing callback trace must never be inferred as zero");
  assert.deepEqual(host.observations, [], "unobserved hosts must not contain simulated observations");
  assert.deepEqual(host.claims_allowed, [], "unobserved hosts must grant no host-behavior claim");
  assert.equal(host.case_families.every(({ status }) => status === "unavailable"), true);
}
const openCodeHost = hostMatrix.hosts.find(({ host }) => host === "opencode");
assert.equal(openCodeHost.host_specific_probes.user_vs_model_skill_origin, "unavailable");
assert.equal(openCodeHost.host_specific_probes.subagent_hook_propagation, "unavailable");

const report = await runRequestActivationBehavioralEvaluation({
  repoRoot,
  surface: "codex",
  caseId: "de-assessment-only",
  execute: async ({ caseInput, prompt, cwd, ...adapterInput }) => {
    assert.match(cwd, /agdf-request-activation-eval-/);
    assert.equal("testCase" in adapterInput, false, "behavioral adapter must not receive the oracle case");
    assert.equal(adapterInput.evaluatorSurface, "codex");
    assert.equal(caseInput.user_text, "Bewerte das Projekt und nenne die wichtigsten Risiken.");
    assert.equal("expected" in caseInput, false);
    const caseLine = prompt.split("\n\n").find((line) => line.startsWith("Case input: "));
    assert.ok(caseLine);
    const promptedCase = JSON.parse(caseLine.slice("Case input: ".length));
    assert.deepEqual(promptedCase, caseInput);
    return {
      requested_effect: "read_only_assistance",
      invocation_provenance: "unavailable",
      selection_origin: "automatic_discovery",
      request_class: "ordinary_read_only",
      decision: "abstain",
      operation_id: null,
      selected_skill: "none",
      visible_agdf: "silent",
      predicted_callbacks: [],
      authorizes: false,
      persist: false,
    };
  },
});
assert.equal(report.status, "pass");
assert.equal(report.evidence_kind, "behavioral_model");
assert.equal(report.input_mode, "canonical_contract");
assert.equal(report.profile_surface, null);
assert.equal(report.evaluator_surface, "codex");
assert.equal(report.evidence_plane, "contract_supplied");
assert.equal(report.loaded_profile, false);
assert.equal(report.session_start_baseline, "not_applicable_headless_behavioral_eval");
assert.match(report.evidence_boundary, /not deterministic proof/);

let composedReport;
for (const [profileSurface, evaluatorSurface] of [
  ["codex", "codex"],
  ["claude", "claude"],
  ["copilot", "codex"],
  ["opencode", "codex"],
]) {
  let evaluatedCases = 0;
  const current = await runRequestActivationBehavioralEvaluation({
    repoRoot,
    inputMode: "composed_profile",
    profileSurface,
    evaluatorSurface,
    execute: async ({ caseInput, prompt, cwd, ...adapterInput }) => {
      evaluatedCases += 1;
      assert.match(cwd, /agdf-request-activation-eval-/);
      assert.equal(adapterInput.evaluatorSurface, evaluatorSurface);
      for (const hidden of ["profileSurface", "instructionSkill", "composition", "testCase"]) {
        assert.equal(hidden in adapterInput, false, `composed adapter must not receive ${hidden}`);
      }
      for (const forbidden of ["case_id", "composed_profile", "instruction_skill", "expected", "case_family", "covered_criteria", "pair"]) {
        assert.doesNotMatch(prompt, new RegExp(`"${forbidden}"\\s*:`), `composed prompt must not expose ${forbidden}`);
        assert.equal(forbidden in caseInput, false, `composed adapter input must not expose ${forbidden}`);
      }
      assert.doesNotMatch(prompt, /## Operation Catalog/, "composed prompt must not include the full contract catalog");
      assert.equal(prompt.includes(canonicalContract), false, "composed prompt must not include the complete canonical contract");
      const caseLine = prompt.split("\n\n").find((line) => line.startsWith("Case input: "));
      assert.ok(caseLine);
      assert.deepEqual(JSON.parse(caseLine.slice("Case input: ".length)), caseInput);
      const testCase = cases.find((candidate) => candidate.user_text === caseInput.user_text
        && candidate.locale === caseInput.locale
        && candidate.composed_profile);
      assert.ok(testCase, "stub evaluator must resolve one declared composed case outside model-visible input");
      return behavioralObservation(testCase, testCase.expected.callback_order);
    },
  });
  assert.equal(evaluatedCases, 8);
  assert.equal(current.cases, 8);
  assert.equal(current.status, "pass");
  assert.equal(current.input_mode, "composed_profile");
  assert.equal(current.profile_surface, profileSurface);
  assert.equal(current.evaluator_surface, evaluatorSurface);
  assert.equal(current.loaded_profile, false);
  assert.equal(current.evidence_plane, "source_composed");
  assert.equal(current.source_compositions.length, 1);
  assert.equal(current.source_compositions[0].instruction_skill, "gate-check");
  assert.equal(current.source_compositions[0].fingerprint, compositionFingerprints.get(profileSurface), "source composition must be digest-stable across runs");
  assert.ok(current.results.every(({ profile_fingerprint: fingerprint }) => fingerprint === current.source_compositions[0].fingerprint));
  composedReport = current;
}

const temp = mkdtempSync(join(tmpdir(), "agdf-request-activation-report-"));
try {
  const output = join(temp, "report.json");
  persistRequestActivationBehavioralReport(output, report);
  assert.equal(JSON.parse(readFileSync(output, "utf8")).evidence_kind, "behavioral_model");
  persistRequestActivationBehavioralReport(output, composedReport);
  assert.equal(JSON.parse(readFileSync(output, "utf8")).evidence_plane, "source_composed");
  assert.throws(() => persistRequestActivationBehavioralReport(output, { ...report, loaded_profile: true }), /ambiguous evidence provenance/);
  assert.throws(() => persistRequestActivationBehavioralReport(output, { ...composedReport, evaluator_surface: "opencode" }), /ambiguous evidence provenance/);
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log(`Request Activation eval tests passed (${deterministic.cases} cases; source and callback policy current)`);
