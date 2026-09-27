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

// Intake bookkeeping the agent finishes without a user decision after authorized setup: no active
// run yet, or a run whose UR revision is not persisted. Every other state stays terminal.
export function deliveryIntakePhase(targetDir, control, input = {}) {
  if (input.intake_mode === "new") {
    assertCanonicalRunStore(targetDir);
    let exists = true;
    try { lstatSync(dirname(runPath(targetDir, input.run_id))); }
    catch (error) { if (error.code !== "ENOENT") throw error; exists = false; }
    if (exists) throw new Error("AGDF_RUN_COLLISION");
    return Object.freeze({ phase: "run_missing", run_id: input.run_id, revision_id: null });
  }
  const blockers = (control?.doctor_report?.findings ?? []).filter((finding) => finding.severity === "block");
  if (control?.blocking_reason === "AGDF_ACTIVE_RUN_MISSING"
      && blockers.every((finding) => finding.code === "AGDF_ACTIVE_RUN_MISSING")) {
    return Object.freeze({ phase: "run_missing", run_id: null, revision_id: null });
  }
  const runState = control?.status_card?.runState;
  if (control?.status === "open" && control.current_gate === "UR" && control.missing_approval === "Approval: UR"
      && !control.approval_presentation && runState && !isDurableApprovalArtefactPresent(targetDir, runState, "UR")) {
    const revisionId = extractField(runState.content ?? "", "revision_id");
    if (!control.status_card.run_id || !revisionId) return null;
    return Object.freeze({ phase: "ur_missing", run_id: control.status_card.run_id, revision_id: revisionId });
  }
  return null;
}

export function deliveryIntakeSteps(governanceTarget, intake) {
  const runId = intake.run_id ?? "<run_id>";
  const revisionId = intake.revision_id ?? "<revision_id from run-create>";
  const dir = `--dir ${quoteDispatchArgument(governanceTarget)}`;
  return Object.freeze([
    ...(intake.phase === "run_missing" ? [{
      id: "create_run",
      command: `run-create ${dir} --run ${runId}`,
      argv: ["run-create", "--dir", governanceTarget, "--run", runId],
      rule: "Choose one new lowercase run id for the requested change; the output names its revision_id.",
    }] : []),
    {
      id: "write_ur",
      path: `.agdf/control/artefacts/${runId}/UR.md`,
      template: UR_TEMPLATE,
      rule: "Write or complete the user requirement of the original delivery request; leave its approval pending.",
    },
    {
      id: "record_ur",
      command: `run-step ${dir} --run ${runId} --revision ${revisionId} --step ur --title "<short requirement title>"`,
      argv: ["run-step", "--dir", governanceTarget, "--run", runId, "--revision", revisionId, "--step", "ur", "--title", "<short requirement title>"],
    },
    {
      id: "dispatch_again",
      rule: `Dispatch gate-check again with intake, intake_mode resume and run_id ${runId}; that result decides the response.`,
    },
  ].map((step) => Object.freeze(step)));
}
