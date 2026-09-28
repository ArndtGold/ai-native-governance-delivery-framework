import assert from "node:assert/strict";
import { buildSkillDispatchRegistry, serializeSkillDispatchResult } from "../lib/skill-dispatch/contract.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import {
  INVALID_PRESENTATION_LANGUAGE_CASES,
  VALID_PRESENTATION_LANGUAGE_CASES,
} from "./fixtures/skill-dispatch-language.js";
import { runValidatorCli } from "../lib/runtime/validator-application.js";
import { interactionLocales, pluginDefinition } from "../lib/cli/runtime-context.js";

const skillSet = [
  { slug: "gate-check", dispatch: { mode: "deterministic_control", deterministicCommand: "gate-check", requiresControlSnapshot: true } },
  { slug: "qa-gate", dispatch: { mode: "judgement_required", requiresControlSnapshot: true } },
];
const completeRegistry = buildSkillDispatchRegistry(pluginDefinition.skillSet);
assert.equal(completeRegistry.size, 10);
assert.deepEqual([...completeRegistry.keys()].sort(), pluginDefinition.skillSet.map(({ slug }) => slug).sort());
assert.equal(completeRegistry.get("gate-check").dispatch_mode, "deterministic_control");
for (const [skillId, entry] of completeRegistry) {
  assert.equal(entry.skill_id, skillId);
  assert.equal(entry.contract_version, 1);
  assert.equal(entry.requires_control_snapshot, true);
  if (skillId !== "gate-check") assert.equal(entry.dispatch_mode, "judgement_required");
}
const base = {
  skillSet,
  interactionLocales,
  surface: "copilot",
  presentationLanguage: "de",
  workingDirectory: "/tmp/agdf-chat",
  expectedVersion: "1.2.3",
};
const unresolved = {
  schema_version: "1",
  resolution_state: "unresolved",
  reason_code: "no_reliable_target",
  primary_target: "",
  governance_target: "",
  working_directory: base.workingDirectory,
  target_changed: false,
  next_action: "Ein primäres Ziel benennen.",
  authorizes: false,
};
const resolved = {
  ...unresolved,
  resolution_state: "resolved",
  reason_code: "continued_target",
  primary_target: "/tmp/agdf-repo",
  governance_target: "/tmp/agdf-repo",
  next_action: "",
};
const orientation = { schema_version: "1", semantic_block: "task_target_orientation", presentation_language: "de", markdown: "target", authorizes: false };

let gateCalls = 0;
const unresolvedDispatch = createSkillDispatchService({
  resolveTaskTarget: () => unresolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => { gateCalls += 1; throw new Error("must not run"); },
  env: {},
});
const unresolvedResult = unresolvedDispatch({ ...base, skillId: "gate-check" });
assert.equal(unresolvedResult.outcome, "target_unresolved");
assert.equal(unresolvedResult.terminal, true);
assert.equal(unresolvedResult.authorizes, false);
assert.equal(unresolvedResult.presentation, orientation);
assert.equal(unresolvedResult.recovery.action, unresolved.next_action);
assert.deepEqual(unresolvedResult.host_action, {
  mode: "transmit_presentation_verbatim_and_stop",
  source: "presentation.markdown",
  text: "target",
  allow_surrounding_text: false,
  may_request_run_or_evidence: false,
});
assert.equal(gateCalls, 0, "unresolved dispatch must not evaluate repository control");

const approvalPresentation = {
  schema_version: "1",
  revision_id: "approval-revision",
  markdown: "full approval review with linked artefact",
  preview_markdown: "review summary and linked artefact",
  sequence: ["run_status_card", "gate_transition_card", "approval_interaction"],
  blocks: {
    run_status_card: { markdown: "approval status" },
    gate_transition_card: { markdown: "approval transition" },
  },
  approval_interaction: { exact_text_fallback: "approval fallback" },
  authorizes: false,
};
const gateReport = {
  status: "open",
  current_gate: "QA",
  blocking_reason: "none",
  missing_approval: "Approval: QA",
  next_allowed_action: "Run QA",
  doctor_status: "pass",
  status_card: { run_id: "delivery-run" },
  candidate_runs: [{
    run_id: "candidate-run",
    display_title: "Candidate run",
    objective: "Evaluate one candidate.",
    current_gate: "QA",
    decision: "revise",
    next_allowed_action: "Repair QA evidence",
    revision_id: "candidate-revision",
    ignored_internal_detail: "must not cross the snapshot boundary",
  }],
  approval_presentation: approvalPresentation,
};
const evaluatedRunIds = [];
const evaluatedPresentationLanguages = [];
const resolvedDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: (_target, options) => {
    gateCalls += 1;
    evaluatedRunIds.push(options.runId);
    evaluatedPresentationLanguages.push(options.presentationLanguage);
    return gateReport;
  },
  env: { AGDF_MACHINE_VALIDATION: "owned_version_matched" },
});
const controlResult = resolvedDispatch({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(controlResult.outcome, "control_result");
assert.equal(controlResult.terminal, true);
assert.equal(controlResult.control.run_id, "delivery-run");
assert.equal(controlResult.control.current_gate, "QA");
assert.equal(controlResult.control.approval_presentation, undefined, "read-only dispatch keeps the full approval text out of the control payload");
assert.equal(controlResult.host_action.mode, "transmit_presentation_verbatim_and_stop");
assert.equal(controlResult.host_action.text, approvalPresentation.preview_markdown);
assert.equal(controlResult.runtime.machine_validation, "owned_version_matched");
assert.equal(evaluatedRunIds.at(-1), "delivery-run");
assert.equal(evaluatedPresentationLanguages.at(-1), "de");
assert.ok(controlResult.timing.total_ms < 2000, "deterministic dispatch must remain below two seconds");

const incompleteApprovalDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({ ...gateReport, approval_presentation: null,
    status_card: { ...gateReport.status_card, interaction_kind: "gate_approval" } }),
  env: {},
})({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(incompleteApprovalDispatch.outcome, "evaluator_error");
assert.equal(incompleteApprovalDispatch.host_action.mode, "transmit_recovery_verbatim_and_stop");
assert.doesNotMatch(incompleteApprovalDispatch.host_action.text, /Approval: QA/u);

const unpresentablePrd = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({ ...gateReport, current_gate: "PRD", missing_approval: "Approval: PRD",
    approval_presentation: null, status_card: { run_id: "delivery-run", interaction_kind: "gate_approval",
      mode_slice_decision: "structured_delivery" },
    presentation_diagnostics: { approval_presentation_errors: ["approval_artefact_too_large"] } }),
  env: {},
})({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run", continueDelivery: true });
assert.equal(unpresentablePrd.outcome, "evaluator_error", "an existing unpresentable PRD must not be sent back to drafting");
assert.equal(unpresentablePrd.host_action.mode, "transmit_recovery_verbatim_and_stop");

const immutableRuntimeEvidence = Object.freeze({
  machine_validation: "local_exact_version_digest",
  plugin_root: "/owned/create-agdf",
  runtime_digest: "a".repeat(64),
  provenance_status: "matched",
});
const trustedRuntimeDispatch = createSkillDispatchService({
  resolveTaskTarget: () => unresolved,
  renderTaskTargetOrientation: () => orientation,
  runtimeEvidence: immutableRuntimeEvidence,
  env: {
    AGDF_MACHINE_VALIDATION: "untrusted",
    AGDF_DISPATCH_PLUGIN_ROOT: "/untrusted",
    AGDF_DISPATCH_RUNTIME_DIGEST: "secret",
  },
});
const trustedRuntimeResult = trustedRuntimeDispatch({ ...base, skillId: "gate-check" });
assert.deepEqual(trustedRuntimeResult.runtime, {
  machine_validation: "local_exact_version_digest",
  expected_version: "1.2.3",
  plugin_root: "/owned/create-agdf",
  runtime_digest: "a".repeat(64),
  provenance_status: "matched",
});

const missingPresentation = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({ ...gateReport, approval_presentation: null, status_presentation: null, presentation_diagnostics: { status_presentation_errors: ["unlocalized"] } }),
  env: {},
})({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(missingPresentation.outcome, "evaluator_error");
assert.equal(missingPresentation.diagnostics[0].code, "dispatch_control_presentation_failed");
assert.equal(missingPresentation.recovery.action, "Gate-Darstellung reparieren und einmal erneut versuchen.");

const continuation = resolvedDispatch({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(continuation.outcome, "skill_continuation");
assert.equal(continuation.terminal, false);
assert.equal(continuation.authorizes, false);
assert.equal(continuation.continuation.skill_id, "qa-gate");
assert.equal(continuation.continuation.governance_target, "/tmp/agdf-repo");
for (const [presentationLanguage, action] of [
  ["de", "AGDF-Plugin reparieren oder neu installieren: Paketierte Laufzeitverträge konnten nicht geladen werden. Danach einmal erneut versuchen."],
  ["en", "Repair or reinstall the AGDF plugin: packaged runtime contracts could not be loaded. Then retry once."],
]) {
const missingContracts = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => gateReport,
  readSkillRuntimeContracts: () => { throw new Error("runtime_contracts_unavailable"); },
  env: {},
})({ ...base, presentationLanguage, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(missingContracts.outcome, "evaluator_error");
assert.equal(missingContracts.terminal, true);
assert.equal(missingContracts.authorizes, false);
assert.ok(!missingContracts.continuation);
assert.equal(missingContracts.recovery.action, action);
assert.equal(missingContracts.host_action.text, action);
}
assert.equal(continuation.control.current_gate, "QA");
assert.deepEqual(continuation.control.candidate_runs, [{
  run_id: "candidate-run",
  display_title: "Candidate run",
  objective: "Evaluate one candidate.",
  current_gate: "QA",
  decision: "revise",
  next_allowed_action: "Repair QA evidence",
  revision_id: "candidate-revision",
}]);
assert.equal(Object.isFrozen(continuation.control.candidate_runs), true);
assert.equal(Object.isFrozen(continuation.control.candidate_runs[0]), true);
assert.equal(Object.isFrozen(continuation.continuation), true);
assert.deepEqual(continuation.host_action, {
  mode: "continue_named_skill",
  source: "continuation",
  bound_to_target: true,
});

let intakeState = { phase: "run_missing", run_id: null, revision_id: null };
const intakeCalls = [];
const intakeDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => gateReport,
  deliveryIntakePhase: (target, control) => { intakeCalls.push({ target, control }); return intakeState; },
  env: {},
});
const intakeInput = { ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", intake: true };
const runMissing = intakeDispatch(intakeInput);
assert.equal(runMissing.outcome, "intake_continuation");
assert.equal(runMissing.terminal, false);
assert.equal(runMissing.authorizes, false);
assert.equal(runMissing.presentation, null);
assert.deepEqual(runMissing.host_action, { mode: "continue_delivery_intake", source: "continuation.steps", bound_to_target: true });
assert.equal(runMissing.continuation.operation_id, "delivery.start");
assert.equal(runMissing.continuation.phase, "run_missing");
assert.equal(runMissing.continuation.governance_target, "/tmp/agdf-repo");
assert.deepEqual(runMissing.continuation.steps.map((step) => step.id), ["create_run", "write_ur", "record_ur", "dispatch_again"]);
assert.equal(runMissing.continuation.steps[0].command, "run-create --dir '/tmp/agdf-repo' --run <run_id>");
assert.deepEqual(runMissing.continuation.steps[0].argv, ["run-create", "--dir", "/tmp/agdf-repo", "--run", "<run_id>"]);
assert.equal(runMissing.continuation.steps[1].template, ".agdf/control/templates/artefacts/UR.md");
assert.match(runMissing.continuation.instruction, /approve no gate and authorize no implementation/u);
assert.equal(Object.isFrozen(runMissing.continuation), true);
assert.equal(Object.isFrozen(runMissing.continuation.steps[0]), true);
assert.equal(intakeCalls.at(-1).target, "/tmp/agdf-repo");
assert.equal(intakeCalls.at(-1).control, gateReport);

intakeState = { phase: "ur_missing", run_id: "delivery-run", revision_id: "rev-1" };
const urMissing = intakeDispatch(intakeInput);
assert.equal(urMissing.outcome, "intake_continuation");
assert.equal(urMissing.continuation.run_id, "delivery-run");
assert.equal(urMissing.continuation.revision_id, "rev-1");
assert.deepEqual(urMissing.continuation.steps.map((step) => step.id), ["write_ur", "record_ur", "dispatch_again"]);
assert.equal(urMissing.continuation.steps[0].path, ".agdf/control/artefacts/delivery-run/UR.md");
assert.match(urMissing.continuation.steps[1].command, /--run delivery-run --revision rev-1 --step ur --title/u);
assert.match(urMissing.continuation.steps[2].rule, /again with intake, intake_mode resume and run_id delivery-run/u);

intakeState = null;
const intakeReady = intakeDispatch(intakeInput);
assert.equal(intakeReady.outcome, "intake_continuation");
assert.equal(intakeReady.terminal, false, "ready decisions require explicit preparation");
assert.equal(intakeReady.host_action.mode, "continue_delivery_intake");

intakeState = { phase: "run_missing", run_id: null, revision_id: null };
const intakeCallsBefore = intakeCalls.length;
const directGateCheck = intakeDispatch({ ...intakeInput, intake: undefined });
assert.equal(directGateCheck.outcome, "control_result", "a read-only gate-check stays terminal and offers no approval");
assert.equal(directGateCheck.host_action.text, approvalPresentation.preview_markdown);
assert.equal(intakeCalls.length, intakeCallsBefore, "intake state is evaluated only for an intake dispatch");
let structuredRoute = "structured_delivery";
const sdContinuationDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({
    status: "open",
    current_gate: "SD",
    blocking_reason: "none",
    missing_approval: "Approval: SD",
    revision_id: "approved-prd-revision",
    status_card: { run_id: "delivery-run", mode_slice_decision: structuredRoute },
    delivery_map: { relationships: [{ from: "SD", relationship: "derived_from", to: "PRD", status: "missing" }] },
    approval_presentation: null,
  }),
  env: {},
});
const sdContinuation = sdContinuationDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run",
  continueDelivery: true,
});
assert.equal(sdContinuation.outcome, "skill_continuation", "PRD approval must lead to SD preparation before the SD card");
assert.equal(sdContinuation.terminal, false);
assert.equal(sdContinuation.continuation.phase, "required_gate_artifact");
assert.equal(sdContinuation.continuation.gate, "SD");
assert.equal(sdContinuation.continuation.artifact_path, ".agdf/control/artefacts/delivery-run/SD.md");
assert.deepEqual(sdContinuation.continuation.source_artifacts, [".agdf/control/artefacts/delivery-run/PRD.md"]);
assert.match(sdContinuation.continuation.instruction, /approved PRD before presenting the next user card/u);
assert.match(sdContinuation.continuation.instruction, /Do not create the Task\/Test Plan or implement code/u);
assert.equal(sdContinuation.host_action.mode, "continue_named_skill");
assert.equal(sdContinuation.authorizes, false);
const tpContinuationDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({
    status: "open",
    current_gate: "TP",
    blocking_reason: "none",
    missing_approval: "Approval: TP",
    revision_id: "approved-sd-revision",
    status_card: { run_id: "delivery-run", mode_slice_decision: structuredRoute },
    delivery_map: { relationships: [{ from: "TP", relationship: "derived_from", to: "SD", status: "missing" }] },
    approval_presentation: null,
  }),
  env: {},
});
const tpContinuation = tpContinuationDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run",
  continueDelivery: true,
});
assert.equal(tpContinuation.outcome, "skill_continuation", "SD approval must lead to TP preparation before the TP card");
assert.equal(tpContinuation.terminal, false);
assert.equal(tpContinuation.continuation.phase, "required_gate_artifact");
assert.equal(tpContinuation.continuation.gate, "TP");
assert.equal(tpContinuation.continuation.artifact_path, ".agdf/control/artefacts/delivery-run/TP.md");
assert.deepEqual(tpContinuation.continuation.source_artifacts, [
  ".agdf/control/artefacts/delivery-run/PRD.md",
  ".agdf/control/artefacts/delivery-run/SD.md",
]);
assert.match(tpContinuation.continuation.instruction, /approved PRD and Solution Design before presenting the next user card/u);
assert.match(tpContinuation.continuation.instruction, /Do not implement code/u);
assert.equal(tpContinuation.host_action.mode, "continue_named_skill");
assert.equal(tpContinuation.authorizes, false);
const runtimeContractReads = [];
const postTpDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({
    status: "open",
    current_gate: "Brownfield Analysis",
    blocking_reason: "none",
    missing_approval: "none",
    revision_id: "approved-tp-revision",
    status_card: {
      run_id: "delivery-run",
      mode_slice_decision: structuredRoute,
      breadcrumb: [{ gate: "TP", status: "fulfilled" }],
      runState: { content: "- revision_id: approved-tp-revision" },
    },
  }),
  readSkillRuntimeContracts: (skillId) => { runtimeContractReads.push(skillId); return [`contracts:${skillId}`]; },
  env: {},
});
const brownfieldContinuation = postTpDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run",
  continueDelivery: true,
});
assert.equal(brownfieldContinuation.outcome, "skill_continuation", "TP approval must hand off to implementation-preparation Brownfield Analysis");
assert.equal(brownfieldContinuation.continuation.phase, "pre_implementation_analysis");
assert.equal(brownfieldContinuation.continuation.skill_id, "brownfield-analysis");
assert.equal(brownfieldContinuation.continuation.mode, "pre_implementation_analysis");
assert.deepEqual(brownfieldContinuation.continuation.runtime_contracts, ["contracts:brownfield-analysis"]);
assert.match(brownfieldContinuation.continuation.instruction, /before CD\+Tests/u);
assert.match(brownfieldContinuation.continuation.instruction, /without continue_delivery/u);
assert.equal(runtimeContractReads.at(-1), "brownfield-analysis");
let orStatus = "missing";
const postUatDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({
    status: "open",
    current_gate: "OR",
    blocking_reason: "none",
    missing_approval: "none",
    revision_id: "approved-uat-revision",
    status_card: {
      run_id: "delivery-run",
      mode_slice_decision: structuredRoute,
      breadcrumb: [{ gate: "UAT", status: "fulfilled" }],
      runState: { content: "- revision_id: approved-uat-revision", artefacts: new Map(orStatus === "missing" ? [] : [["OR", { status: orStatus }]]) },
    },
    status_presentation: { semantic_block: "run_status_card", markdown: "OR recorded" },
  }),
  readSkillRuntimeContracts: (skillId) => { runtimeContractReads.push(skillId); return [`contracts:${skillId}`]; },
  env: {},
});
const closeoutContinuation = postUatDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run",
  continueDelivery: true,
});
assert.equal(closeoutContinuation.outcome, "skill_continuation", "UAT approval must hand off to required OR closeout");
assert.equal(closeoutContinuation.continuation.phase, "post_uat_closeout");
assert.equal(closeoutContinuation.continuation.skill_id, "release-or");
assert.deepEqual(closeoutContinuation.continuation.runtime_contracts, ["contracts:release-or"]);
assert.match(closeoutContinuation.continuation.instruction, /do not perform commit, push, PR, release/u);
assert.equal(runtimeContractReads.at(-1), "release-or");
orStatus = "done";
const alreadyClosed = postUatDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf-repo",
  runId: "delivery-run",
  continueDelivery: true,
});
assert.equal(alreadyClosed.outcome, "control_result", "a durable OR prevents duplicate closeout continuation");
structuredRoute = "structured_slice";
orStatus = "missing";
for (const [dispatch, phase] of [
  [sdContinuationDispatch, "required_gate_artifact"],
  [tpContinuationDispatch, "required_gate_artifact"],
  [postTpDispatch, "pre_implementation_analysis"],
  [postUatDispatch, "post_uat_closeout"],
]) {
  const result = dispatch({
    ...base,
    skillId: "gate-check",
    targetSource: "continued_target",
    primaryTarget: "/tmp/agdf-repo",
    runId: "delivery-run",
    continueDelivery: true,
  });
  assert.equal(result.outcome, "skill_continuation", `structured_slice must continue at ${phase}`);
  assert.equal(result.continuation.phase, phase);
  assert.equal(result.terminal, false);
  assert.equal(result.authorizes, false);
}
for (const invalidOperation of [
  { ...intakeInput, skillId: "qa-gate" },
  { ...intakeInput, intake: "delivery.start" },
]) {
  const result = intakeDispatch(invalidOperation);
  assert.equal(result.outcome, "invalid_input");
  assert.equal(result.terminal, true);
  assert.equal(result.diagnostics[0].field, "intake");
}
assert.equal(intakeCalls.length, intakeCallsBefore, "invalid operations stop before control evaluation");

for (const runId of ["delivery_run", "delivery.run", "delivery-run"]) {
  const result = resolvedDispatch({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId });
  assert.equal(result.outcome, "skill_continuation", `canonical run id must be accepted: ${runId}`);
  assert.equal(evaluatedRunIds.at(-1), runId);
}

const invalid = resolvedDispatch({ ...base, skillId: "unknown" });
assert.equal(invalid.outcome, "invalid_input");
assert.equal(invalid.diagnostics[0].field, "skill_id");
assert.equal(Object.hasOwn(invalid.diagnostics[0], "message"), false);
const unpaired = resolvedDispatch({ ...base, skillId: "gate-check", targetSource: "explicit_target" });
assert.equal(unpaired.outcome, "invalid_input");
assert.equal(unpaired.diagnostics[0].field, "primary_target");

const invalidTargetSource = resolvedDispatch({
  ...base,
  skillId: "gate-check",
  targetSource: "user",
  primaryTarget: "/tmp/agdf-repo",
});
assert.equal(invalidTargetSource.outcome, "invalid_input");
assert.deepEqual(invalidTargetSource.diagnostics[0].allowed_values, ["explicit_target", "continued_target", "current_repository"]);
assert.equal(
  invalidTargetSource.host_action.text,
  "Ungültiger Wert für target_source. Erlaubt: explicit_target, continued_target, current_repository. Korrigieren und einmal erneut versuchen.",
);
assert.equal(invalidTargetSource.host_action.text, invalidTargetSource.recovery.action);
assert.doesNotMatch(invalidTargetSource.host_action.text, /\buser\b/u);

const invalidTargetSourceEnglish = resolvedDispatch({
  ...base,
  skillId: "gate-check",
  presentationLanguage: "en",
  targetSource: "user",
  primaryTarget: "/tmp/agdf-repo",
});
assert.equal(
  invalidTargetSourceEnglish.host_action.text,
  "Invalid value for target_source. Allowed: explicit_target, continued_target, current_repository. Correct it and retry once.",
);

const unsupportedLanguage = resolvedDispatch({
  ...base,
  skillId: "qa-gate",
  presentationLanguage: "fr-FR",
});
assert.equal(unsupportedLanguage.outcome, "skill_continuation");
assert.equal(unsupportedLanguage.terminal, false);
assert.equal(unsupportedLanguage.continuation.presentation_language, "en");
assert.equal(evaluatedPresentationLanguages.at(-1), "en");
assert.deepEqual(unsupportedLanguage.diagnostics, []);

let invalidLanguageTargetCalls = 0;
let invalidLanguageGateCalls = 0;
const strictLanguageDispatch = createSkillDispatchService({
  resolveTaskTarget: () => { invalidLanguageTargetCalls += 1; return unresolved; },
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => { invalidLanguageGateCalls += 1; return gateReport; },
  env: {},
});
for (const row of INVALID_PRESENTATION_LANGUAGE_CASES) {
  const result = strictLanguageDispatch({
    ...base,
    skillId: "gate-check",
    presentationLanguage: row.omit ? undefined : row.value,
  });
  assert.equal(result.outcome, "invalid_input", row.id);
  assert.equal(result.terminal, true, row.id);
  assert.equal(result.target, null, row.id);
  assert.equal(result.control, null, row.id);
  assert.deepEqual(result.diagnostics, [{ code: "dispatch_input_invalid", field: "presentation_language" }], row.id);
  assert.equal(result.host_action.text, "Provide one well-formed BCP 47 presentation_language tag and retry once.", row.id);
}
assert.equal(invalidLanguageTargetCalls, 0, "invalid language must stop before target evaluation");
assert.equal(invalidLanguageGateCalls, 0, "invalid language must stop before gate evaluation");

let regionalRequestedLocale = "";
const regionalLanguageDispatch = createSkillDispatchService({
  resolveTaskTarget: () => unresolved,
  renderTaskTargetOrientation: (_target, { requestedLocale }) => {
    regionalRequestedLocale = requestedLocale;
    return { ...orientation, presentation_language: requestedLocale };
  },
  env: {},
})({ ...base, skillId: "qa-gate", presentationLanguage: "de-DE" });
assert.equal(regionalLanguageDispatch.outcome, "target_unresolved");
assert.equal(regionalRequestedLocale, "de");
assert.equal(regionalLanguageDispatch.presentation.presentation_language, "de");

for (const row of VALID_PRESENTATION_LANGUAGE_CASES) {
  let requestedLocale = "";
  const result = createSkillDispatchService({
    resolveTaskTarget: () => unresolved,
    renderTaskTargetOrientation: (_target, options) => {
      requestedLocale = options.requestedLocale;
      return { ...orientation, presentation_language: requestedLocale };
    },
    evaluateGateCheck: () => { throw new Error("unresolved target must stop before gate evaluation"); },
    env: {},
  })({ ...base, skillId: "qa-gate", presentationLanguage: row.value });
  assert.equal(result.outcome, "target_unresolved", row.id);
  assert.equal(requestedLocale, row.expectedLocale, row.id);
  assert.equal(result.presentation.presentation_language, row.expectedLocale, row.id);
}

for (const [override, field] of [
  [{ surface: "generic" }, "surface"],
  [{ presentationLanguage: "x".repeat(65) }, "presentation_language"],
  [{ workingDirectory: "relative/path" }, "working_directory"],
  [{ primaryTarget: "/tmp/repo", targetSource: "guessed" }, "target_source"],
  [{ runId: "Invalid Run" }, "run_id"],
]) {
  const result = resolvedDispatch({ ...base, skillId: "gate-check", ...override });
  assert.equal(result.outcome, "invalid_input");
  assert.equal(result.diagnostics[0].field, field);
}

assert.throws(
  () => buildSkillDispatchRegistry([{ slug: "qa-gate", dispatch: { mode: "deterministic_control", deterministicCommand: "gate-check", requiresControlSnapshot: true } }]),
  /deterministic skill qa-gate must map to gate-check/,
);
assert.throws(
  () => buildSkillDispatchRegistry([skillSet[0], skillSet[0]]),
  /duplicate slugs/,
);
assert.throws(
  () => buildSkillDispatchRegistry([{ slug: "qa-gate", dispatch: { mode: "unsupported", requiresControlSnapshot: true } }]),
  /invalid dispatch metadata/,
);
assert.throws(
  () => buildSkillDispatchRegistry([{ slug: "qa-gate", dispatch: { mode: "judgement_required" } }]),
  /must declare requiresControlSnapshot/,
);

const cliErrors = [];
const cliExit = await runValidatorCli(
  ["skill-dispatch", "--json", "--skill", "gate-check", "--surface", "copilot", "--language", "de"],
  { io: { log() {}, error(message) { cliErrors.push(message); } }, parser: { cwd: "/tmp/agdf-chat" } },
);
assert.equal(cliExit, 1);
assert.deepEqual(cliErrors, ["skill-dispatch requires --working-directory"]);

const oversized = serializeSkillDispatchResult(
  { ...controlResult, control: { body: "x".repeat(1024 * 1024) } },
  { outputTooLargeRecovery: "Ausgabegrenze des Dispatchers reparieren und einmal erneut versuchen." },
);
const oversizedResult = JSON.parse(oversized);
assert.equal(oversizedResult.diagnostics[0].code, "dispatch_output_too_large");
assert.equal(oversizedResult.host_action.text, "Ausgabegrenze des Dispatchers reparieren und einmal erneut versuchen.");

const evaluatorFailure = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => { throw new Error("broken evaluator"); },
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(evaluatorFailure.outcome, "evaluator_error");
assert.equal(evaluatorFailure.terminal, true);
assert.equal(evaluatorFailure.host_action.mode, "transmit_recovery_verbatim_and_stop");
assert.equal(evaluatorFailure.diagnostics[0].code, "dispatch_control_evaluation_failed");
assert.equal(evaluatorFailure.host_action.text, "Gate-Auswertung reparieren und einmal erneut versuchen.");

const targetEvaluationFailure = createSkillDispatchService({
  resolveTaskTarget: () => { throw new Error("sensitive target detail"); },
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(targetEvaluationFailure.diagnostics[0].code, "dispatch_target_evaluation_failed");
assert.equal(targetEvaluationFailure.host_action.text, "Arbeitszielauswertung reparieren und einmal erneut versuchen.");
assert.doesNotMatch(JSON.stringify(targetEvaluationFailure), /sensitive target detail/);

const targetPresentationFailure = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => null,
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(targetPresentationFailure.diagnostics[0].code, "dispatch_target_presentation_failed");
assert.equal(targetPresentationFailure.host_action.text, "Arbeitszieldarstellung reparieren und einmal erneut versuchen.");

const internalFailure = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => null,
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(internalFailure.diagnostics[0].code, "dispatch_internal_failure");
assert.equal(internalFailure.host_action.text, "Dispatcher reparieren und einmal erneut versuchen.");

const recoveryRendererFailure = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => { throw new Error("broken evaluator"); },
  renderSkillDispatchRecovery: () => { throw new Error("broken recovery renderer"); },
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(recoveryRendererFailure.diagnostics[0].code, "dispatch_control_evaluation_failed");
assert.equal(recoveryRendererFailure.host_action.text, "Repair the installed locale registry and retry once.");

console.log("skill dispatch tests passed");
