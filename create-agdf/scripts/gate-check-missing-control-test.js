import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRun } from "../lib/control-state/index.js";
import { evaluateGateCheck } from "../lib/control-evaluation/gate-check.js";
import { interactionLocales, pluginDefinition } from "../lib/cli/runtime-context.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";

const canonicalLocales = JSON.parse(readFileSync(new URL("../../plugin/meta/agdf-interaction-locales.json", import.meta.url), "utf8"));
for (const key of Object.keys(interactionLocales)) delete interactionLocales[key];
Object.assign(interactionLocales, canonicalLocales);

const roots = [];
const root = (label) => {
  const value = mkdtempSync(join(tmpdir(), `agdf-missing-control-${label}-`));
  roots.push(value);
  return value;
};

function assertSetupRequired(report, target) {
  assert.equal(report.status, "blocked");
  assert.equal(report.current_gate, "UR");
  assert.equal(report.blocking_reason, "AGDF_CONTROL_FILE_MISSING");
  assert.equal(report.missing_approval, "none");
  assert.equal(report.approval_presentation, null);
  assert.equal(report.interaction_kind, "control_setup");
  assert.equal(report.native_attempt_required, false);
  assert.equal(report.status_card.interaction_kind, "control_setup");
  assert.equal(report.status_card.native_attempt_required, false);
  assert.equal(report.status_presentation?.semantic_block, "control_setup");
  assert.equal(report.status_presentation?.status, "control_setup_required");
  assert.equal(report.status_presentation?.target, target);
  assert.equal(report.status_presentation?.durable_scope, ".agdf/control");
  assert.equal(report.status_presentation?.authorizes, false);
  assert.deepEqual(report.status_presentation?.excluded_authority, ["automatic_run_creation", "automatic_ur_persistence", "gate_approval"]);
  assert.equal(JSON.stringify({
    allowed: report.allowed,
    next_allowed_action: report.next_allowed_action,
    missing_approval: report.missing_approval,
    status_presentation: report.status_presentation,
  }).includes("Approval: UR"), false);
}

try {
  const absent = root("absent");
  const absentReport = evaluateGateCheck(absent);
  assertSetupRequired(absentReport, absent);
  assert.equal((absentReport.status_presentation.markdown.match(/control setup required/giu) ?? []).length, 1);

  const partial = root("partial");
  mkdirSync(join(partial, ".agdf", "control"), { recursive: true });
  assertSetupRequired(evaluateGateCheck(partial), partial);

  const resolved = {
    schema_version: "1",
    resolution_state: "resolved",
    reason_code: "explicit_target",
    primary_target: absent,
    governance_target: absent,
    working_directory: absent,
    target_changed: false,
    evidence_sources: ["explicit_target"],
    next_action: "",
    authorizes: false,
  };
  const targetOrientation = {
    schema_version: "1",
    semantic_block: "task_target_orientation",
    presentation_language: "en",
    markdown: "resolved target",
    authorizes: false,
  };
  const dispatch = createSkillDispatchService({
    resolveTaskTarget: () => resolved,
    renderTaskTargetOrientation: () => targetOrientation,
    evaluateGateCheck: () => absentReport,
    env: {},
  });
  const dispatchInput = {
    skillSet: pluginDefinition.skillSet,
    interactionLocales: {},
    skillId: "gate-check",
    surface: "codex",
    presentationLanguage: "en",
    workingDirectory: absent,
    targetSource: "explicit_target",
    primaryTarget: absent,
    expectedVersion: pluginDefinition.version,
  };
  const dispatched = dispatch(dispatchInput);
  assert.equal(dispatched.contract_version, 1);
  assert.equal(dispatched.outcome, "control_result");
  assert.equal(dispatched.terminal, true);
  assert.equal(dispatched.authorizes, false);
  assert.equal(dispatched.presentation.status, "control_setup_required");
  assert.equal(dispatched.host_action.mode, "transmit_presentation_verbatim_and_stop");
  assert.equal(dispatched.host_action.allow_surrounding_text, false);
  assert.equal(dispatched.host_action.may_request_run_or_evidence, false);
  assert.equal(dispatched.host_action.text.includes("Approval: UR"), false);

  let controlCalls = 0;
  const unresolvedDispatch = createSkillDispatchService({
    resolveTaskTarget: () => ({
      ...resolved,
      resolution_state: "unresolved",
      reason_code: "no_reliable_target",
      primary_target: "",
      governance_target: "",
      next_action: "Name one target.",
      evidence_sources: [],
    }),
    renderTaskTargetOrientation: () => targetOrientation,
    evaluateGateCheck: () => { controlCalls += 1; throw new Error("must not evaluate control"); },
    env: {},
  })(dispatchInput);
  assert.equal(unresolvedDispatch.outcome, "target_unresolved");
  assert.equal(unresolvedDispatch.control, null);
  assert.equal(controlCalls, 0);

  const configured = root("configured");
  initializeCanonicalControl(configured, generatedFilesForTarget("init", configured, false, "en"));
  const emptyRunStoreReport = evaluateGateCheck(configured);
  assert.equal(emptyRunStoreReport.status, "blocked");
  assert.equal(emptyRunStoreReport.current_gate, "UR");
  assert.equal(emptyRunStoreReport.blocking_reason, "AGDF_ACTIVE_RUN_MISSING");
  assert.equal(emptyRunStoreReport.missing_approval, "none");
  assert.equal(emptyRunStoreReport.approval_presentation, null);
  assert.notEqual(emptyRunStoreReport.interaction_kind, "control_setup");
  assert.ok(emptyRunStoreReport.allowed.includes("create or migrate a canonical run with an explicit run id"));
  createRun(configured, "configured-run");
  const configuredReport = evaluateGateCheck(configured, { runId: "configured-run" });
  assert.notEqual(configuredReport.blocking_reason, "AGDF_CONTROL_FILE_MISSING");
  assert.notEqual(configuredReport.interaction_kind, "control_setup");
  assert.notEqual(configuredReport.status_presentation?.semantic_block, "control_setup");

  console.log("Gate-check missing-control tests passed.");
} finally {
  for (const value of roots) rmSync(value, { recursive: true, force: true });
}
