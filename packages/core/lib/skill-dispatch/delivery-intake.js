import { lstatSync } from "node:fs";
import { dirname } from "node:path";
import { assertCanonicalRunStore } from "../control-state/run-store-inspection.js";
import { runPath } from "../control-state/run-state-reader.js";
import { isDurableApprovalArtefactPresent } from "../control-evaluation/gate-check.js";
import { extractField } from "../control-evaluation/verified-change.js";

export const DELIVERY_INTAKE_OPERATION = "delivery.start";

// POSIX preview only; hosts should execute structured argv using their own command adapter.
export const quoteDispatchArgument = (value) => "'" + String(value).replaceAll("'", "'\"'\"'") + "'";

const UR_TEMPLATE = ".agdf/control/templates/artefacts/UR.md";

// Run assignment precedes this phase. Bookkeeping addresses one concrete new or resumed run;
// candidate count never establishes the original request's scope.
export function deliveryIntakePhase(targetDir, control, input = {}) {
  const blockers = (control?.doctor_report?.findings ?? []).filter((finding) => finding.severity === "block");
  if (input.intake_mode === "new") {
    // The not-yet-created run is expected to be unselectable; any other blocker keeps the result terminal.
    if (blockers.some((finding) => !["AGDF_RUN_NOT_SELECTABLE", "AGDF_ACTIVE_RUN_MISSING"].includes(finding.code))) return null;
    assertCanonicalRunStore(targetDir);
    let exists = true;
    try { lstatSync(dirname(runPath(targetDir, input.run_id))); }
    catch (error) { if (error.code !== "ENOENT") throw error; exists = false; }
    if (exists) throw new Error("AGDF_RUN_COLLISION");
    return Object.freeze({ phase: "run_missing", run_id: input.run_id, revision_id: null });
  }

  return null;
}

export function deliveryIntakeSteps(governanceTarget, intake) {
  const runId = intake.run_id;
  if (!runId) throw new Error("AGDF_INTAKE_RUN_BINDING_REQUIRED");
  const dir = `--dir ${quoteDispatchArgument(governanceTarget)}`;
  if (intake.phase === "run_missing") {
    return Object.freeze([
      Object.freeze({
        id: "create_run",
        command: `run-create ${dir} --run ${runId}`,
        argv: ["run-create", "--dir", governanceTarget, "--run", runId],
        rule: "Create this exact run; use its returned revision_id for the following resume dispatch.",
      }),
      Object.freeze({
        id: "dispatch_again",
        rule: `Dispatch gate-check with intake: true, intake_mode: resume, run_id: ${runId} and expected_revision_id from run-create. Its next continuation supplies the concrete UR steps.`,
      }),
    ]);
  }
  throw new Error("AGDF_INTAKE_PHASE_INVALID");
}

// This is a routing boundary, not semantic requirement authoring or implementation permission.
export function urDefinitionPhase(targetDir, control, input) {
  const runState = control?.status_card?.runState;
  if (!input.run_id || control?.status_card?.run_id !== input.run_id || !runState
      || control.current_gate !== "UR" || control.missing_approval !== "Approval: UR"
      || !["open", "blocked"].includes(control.status)
      || !["none", "AGDF_UR_REQUIREMENTS_INCOMPLETE"].includes(control.blocking_reason)
      || (control.doctor_report?.findings ?? []).some(f => ["block", "revise"].includes(f.severity))) return null;
  const revisionId = extractField(runState.content ?? "", "revision_id");
  if (!revisionId) return null;
  const registered = isDurableApprovalArtefactPresent(targetDir, runState, "UR");
  const canonicalPath = `.agdf/control/artefacts/${input.run_id}/UR.md`;
  // Never substitute an existing noncanonical draft path.
  if (registered && String(runState.artefacts.get("UR")?.path ?? "").replaceAll("`", "") !== canonicalPath) return null;
  if (input.skill_id !== "ur-definition" && !(input.intake || input.continue_delivery)) return null;
  if (registered && input.skill_id !== "ur-definition" && input.ur_action !== "revise"
      && control.ur_readiness?.ready !== false) return null;
  return Object.freeze({
    phase: "ur_definition", skill_id: "ur-definition", governance_target: targetDir,
    run_id: input.run_id, revision_id: revisionId, presentation_language: input.presentation_language,
    artifact_path: canonicalPath, template_path: UR_TEMPLATE, draft_registered: registered,
    ...(input.intake ? { operation_id: DELIVERY_INTAKE_OPERATION } : {}),
    instruction: "Execute ur-definition with the original request and answered context for this exact unapproved UR. Follow the focused contract, record through the existing canonical writer, then redispatch gate-check. Dispatch approves no gate; a changed draft requires a new presentation and a new deliberate response.",
  });
}
