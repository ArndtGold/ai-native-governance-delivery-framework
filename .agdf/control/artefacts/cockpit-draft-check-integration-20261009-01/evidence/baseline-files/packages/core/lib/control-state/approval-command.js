import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { prepareGateApproval } from "./run-recording.js";
import { readRun } from "./run-state-edits.js";
import { parseControlState, parseRunState } from "./run-state-parser.js";
import { runSealState } from "./run-seal.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { appendApprovalOperation, readApprovalOperations } from "./approval-operations.js";
import { approvalRequestDigest, commandBinding, COOPERATIVE_ASSURANCE, ownDataValue, resolveControlCommandTarget, validateApprovalCommand } from "./approval-command-contract.js";
import { flushRunCommit } from "./run-state-writer.js";
import { withRunBacklogLock, writeRunWithBacklogLocked } from "./run-backlog-writer.js";
import { backlogSkip } from "./run-backlog.js";

function sealIsValid(root, content) {
  try { return runSealState(root, content).status === "valid"; } catch { return false; }
}

function observe(root, command, evaluateGateCheck) {
  const run = readRun(root, command.run_id);
  if (run.rejection || !sealIsValid(root, run.content)) return { available: false, reason: run.rejection?.reason ?? "seal_invalid" };
  let report;
  try { report = evaluateGateCheck(root, { runId: command.run_id }); } catch { return { available: false, reason: "evaluation_unavailable" }; }
  return { available: true, revision: Number(run.meta.revision), revision_id: run.meta.revision_id,
    approval_status: parseControlState(run.content, { userGates: [command.gate] }).approvals.get(command.gate)?.status ?? "missing",
    lifecycle: run.meta.lifecycle, gate: report.current_gate, status: report.status,
    missing_approval: report.missing_approval, next_allowed_action: report.next_allowed_action,
    blocking_reason: report.blocking_reason ?? null };
}

// Internal dependencies expose I/O checkpoints for deterministic fault/process tests. The public
// facade supplies only canonical policy, Git observations and package metadata, never caller policy.
export function executeApprovalCommand(root, command, { evaluateGateCheck, packageVersion,
  checkpoint = () => {}, flush = flushRunCommit, afterWrite } = {}) {
  let target, requestDigest, path, snapshot;
  const result = (outcome, reason = null, receipt = null, details = {}) => Object.freeze({
    schema_version: "1", outcome, reason,
    operation_id: typeof ownDataValue(command, "operation_id") === "string" ? ownDataValue(command, "operation_id") : null, request_digest: requestDigest ?? null,
    binding: command && typeof command === "object" ? commandBinding(command) : null,
    effect: receipt?.effect ?? null, assurance: COOPERATIVE_ASSURANCE,
    current: target ? observe(target.root, command, evaluateGateCheck) : { available: false, reason: "target_unavailable" },
    observations: { commit: receipt ? "canonical_receipt_observed" : "no_receipt_acknowledged",
      durability: ["accepted", "already_applied"].includes(outcome) ? (process.platform === "win32" ? "file_sync_completed_directory_sync_unavailable" : "file_and_directory_sync_completed") : "unconfirmed",
      independent_human_proof: "unavailable" },
    recovery: outcome === "retryable_failure" ? "Retry the identical command with the original operation UUID and payload; do not create a new decision."
      : outcome === "recovery_required" ? "Inspect the canonical run and pending transaction or lock owner before retrying; preserve the original command and do not infer approval."
      : null,
    ...details,
  });
  const invalid = validateApprovalCommand(command);
  if (invalid) return result("rejected", invalid);
  requestDigest = approvalRequestDigest(command);
  try { target = resolveControlCommandTarget(root); } catch { return result("rejected", "target_invalid"); }
  if (target.target_id !== command.target_id) return result("rejected", "target_binding_mismatch");
  const relativePath = `.agdf/control/runs/${command.run_id}/RUN_STATE.md`;
  path = join(target.root, relativePath);
  if (hasSymlinkComponent(target.root, relativePath) || containedRegularFile(target.root, relativePath).status !== "valid") {
    return result("rejected", "run_path_invalid");
  }
  try {
    return withRunBacklogLock(target.root, path, () => {
      const run = readRun(target.root, command.run_id);
      if (run.rejection) return result("recovery_required", run.rejection.reason);
      snapshot = run.content;
      if (!sealIsValid(target.root, run.content)) return result("recovery_required", "seal_invalid");
      const operations = readApprovalOperations(run.content);
      const existing = operations.receipts.find((item) => item.operation_id === command.operation_id);
      // Check history before freshness: an acknowledged historical effect grants no current approval.
      if (existing) {
        if (existing.request_digest !== requestDigest) return result("rejected", "operation_payload_conflict");
        flush(path);
        return result("already_applied", null, existing);
      }
      const prepared = prepareGateApproval(target.root, {
        runId: command.run_id, gate: command.gate, revisionId: command.expected_revision_id,
        presentationId: command.presentation_id, response: command.response,
      }, { evaluateGateCheck });
      if (prepared.outcome === "rejected") return result("rejected", prepared.reason, null, {
        recovery: prepared.recovery ?? "Follow current.next_allowed_action. For a changed binding, prepare the current presentation and obtain a NEW deliberate reply; never rebind an earlier reply.",
      });
      const receipt = {
        schema_version: "1", action: command.action, operation_id: command.operation_id,
        request_digest: requestDigest, binding: commandBinding(command), assurance: COOPERATIVE_ASSURANCE,
        created_at: new Date().toISOString(), producer: { contract: "approval-service/1", package_version: packageVersion },
        effect: { previous_revision_id: command.expected_revision_id, resulting_revision_id: randomUUID(),
          revision: Number(run.meta.revision) + 1, gate: command.gate, approval: `Approval: ${command.gate}`,
          artefact_digest: prepared.digest, presentation_digest: prepared.presentation.digest,
          next_gate_after_approval: prepared.after.current_gate, allowed_after_approval: prepared.after.next_allowed_action },
      };
      checkpoint("before_final_validation");
      const written = writeRunWithBacklogLocked(target.root, path, appendApprovalOperation(prepared.next, receipt), command.expected_revision_id, {
        allowApprovalChange: true, expectedContent: run.content, appendedReceipt: receipt,
        nextRevisionId: receipt.effect.resulting_revision_id, validateBeforeWrite: prepared.validateBeforeWrite,
        validateDuringTransaction: prepared.validateDuringTransaction, checkpoint, afterWrite,
      });
      checkpoint("before_response");
      return result("accepted", null, receipt, backlogSkip({ status: written.backlog, reason: written.backlog_reason }));
    }, { checkpoint });
  } catch (error) {
    if (error.message === "AGDF_RUN_WRITE_LOCKED") return result(error.lock_owner_status === "unknown" ? "recovery_required" : "retryable_failure",
      error.lock_owner_status === "unknown" ? "lock_owner_unconfirmed" : "run_write_locked");
    if (error.message === "AGDF_STALE_RUN_REVISION") return result("rejected", "stale_revision", null,
      { recovery: "Prepare the current presentation and obtain a NEW deliberate reply; never rebind an earlier reply." });
    // Rename can succeed before sync or lock release fails. Never infer absence from an exception.
    let current = readRun(target.root, command.run_id);
    // A committed receipt remains observable while its Backlog journal is pending.
    // This acknowledgement is recovery-required, never a readiness/approval claim.
    if (current.rejection?.reason === "run_step_recovery_required") {
      try {
        if (hasSymlinkComponent(target.root, relativePath) || containedRegularFile(target.root, relativePath).status !== "valid") throw Error("run_path_invalid");
        const content = readFileSync(path, "utf8"), parsed = parseRunState(content, command.run_id);
        if (parsed.valid) current = { content, meta: parsed.meta };
      } catch { /* Preserve the unavailable observation. */ }
    }
    if (!current.rejection && sealIsValid(target.root, current.content)) {
      const receipt = readApprovalOperations(current.content).receipts.find((item) => item.operation_id === command.operation_id);
      if (receipt?.request_digest === requestDigest) return result("recovery_required", "commit_acknowledgement_unconfirmed", receipt,
        { recovery: "Retry the identical command to synchronize and acknowledge the canonical receipt." });
      if (current.content === snapshot) return result("retryable_failure", "write_not_committed");
    }
    return result("recovery_required", "canonical_state_unconfirmed",
      null, { recovery: "Inspect the canonical run and pending transaction before retrying; do not infer approval from this response." });
  }
}
