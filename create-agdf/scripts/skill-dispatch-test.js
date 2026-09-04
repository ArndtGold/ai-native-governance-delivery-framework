import assert from "node:assert/strict";
import { buildSkillDispatchRegistry, serializeSkillDispatchResult } from "../lib/skill-dispatch/contract.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { runValidatorCli } from "../lib/runtime/validator-application.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";

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
  interactionLocales: {},
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

const approvalPresentation = { schema_version: "1", markdown: "approval", authorizes: false };
const gateReport = {
  status: "open",
  current_gate: "QA",
  blocking_reason: "none",
  missing_approval: "Approval: QA",
  next_allowed_action: "Run QA",
  doctor_status: "pass",
  status_card: { run_id: "delivery-run" },
  approval_presentation: approvalPresentation,
};
const evaluatedRunIds = [];
const resolvedDispatch = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: (_target, options) => { gateCalls += 1; evaluatedRunIds.push(options.runId); return gateReport; },
  env: { AGDF_MACHINE_VALIDATION: "owned_version_matched" },
});
const controlResult = resolvedDispatch({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(controlResult.outcome, "control_result");
assert.equal(controlResult.terminal, true);
assert.equal(controlResult.control, gateReport);
assert.equal(controlResult.presentation, approvalPresentation);
assert.equal(controlResult.host_action.mode, "transmit_presentation_verbatim_and_stop");
assert.equal(controlResult.runtime.machine_validation, "owned_version_matched");
assert.equal(evaluatedRunIds.at(-1), "delivery-run");
assert.ok(controlResult.timing.total_ms < 2000, "deterministic dispatch must remain below two seconds");

const missingPresentation = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => ({ ...gateReport, approval_presentation: null, status_presentation: null, presentation_diagnostics: { status_presentation_errors: ["unlocalized"] } }),
  env: {},
})({ ...base, skillId: "gate-check", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(missingPresentation.outcome, "evaluator_error");
assert.match(missingPresentation.diagnostics[0].message, /deterministic_control_presentation_unavailable/);

const continuation = resolvedDispatch({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId: "delivery-run" });
assert.equal(continuation.outcome, "skill_continuation");
assert.equal(continuation.terminal, false);
assert.equal(continuation.authorizes, false);
assert.equal(continuation.continuation.skill_id, "qa-gate");
assert.equal(continuation.continuation.governance_target, "/tmp/agdf-repo");
assert.equal(continuation.control.current_gate, "QA");
assert.equal(Object.isFrozen(continuation.continuation), true);
assert.deepEqual(continuation.host_action, {
  mode: "continue_named_skill",
  source: "continuation",
  bound_to_target: true,
});

for (const runId of ["delivery_run", "delivery.run", "delivery-run"]) {
  const result = resolvedDispatch({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo", runId });
  assert.equal(result.outcome, "skill_continuation", `canonical run id must be accepted: ${runId}`);
  assert.equal(evaluatedRunIds.at(-1), runId);
}

const invalid = resolvedDispatch({ ...base, skillId: "unknown" });
assert.equal(invalid.outcome, "invalid_input");
assert.equal(invalid.diagnostics[0].field, "skill_id");
const unpaired = resolvedDispatch({ ...base, skillId: "gate-check", targetSource: "explicit_target" });
assert.equal(unpaired.outcome, "invalid_input");
assert.equal(unpaired.diagnostics[0].field, "primary_target");

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

const oversized = serializeSkillDispatchResult({ ...controlResult, control: { body: "x".repeat(1024 * 1024) } });
assert.equal(JSON.parse(oversized).diagnostics[0].code, "dispatch_output_too_large");

const evaluatorFailure = createSkillDispatchService({
  resolveTaskTarget: () => resolved,
  renderTaskTargetOrientation: () => orientation,
  evaluateGateCheck: () => { throw new Error("broken evaluator"); },
  env: {},
})({ ...base, skillId: "qa-gate", targetSource: "continued_target", primaryTarget: "/tmp/agdf-repo" });
assert.equal(evaluatorFailure.outcome, "evaluator_error");
assert.equal(evaluatorFailure.terminal, true);
assert.equal(evaluatorFailure.host_action.mode, "transmit_recovery_verbatim_and_stop");
assert.equal(evaluatorFailure.host_action.text, "Repair the existing evaluator or renderer and retry once.");

console.log("skill dispatch tests passed");
