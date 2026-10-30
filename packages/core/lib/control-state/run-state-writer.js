import { assertRunOperationsChange, assertRunNotEnded, validRunOperation } from "./run-operations.js";
import { assertEvidenceBindingsChange, validEvidenceBinding } from './evidence-bindings.js';
import { validateEarlyPrdHistory, validEarlyPrdEffect, earlyPrdHistoryReference } from './run-revision-history.js';
import { assertApprovalOperationsChange, readApprovalOperations, validApprovalReceipt } from "./approval-operations.js";
import { assertArtefactBindingsChange, validArtefactBinding } from "./artefact-bindings.js";
import { assertSourceRevisionsChange, validSourceRevision, validSourceRevisionEffect } from "./run-source-revisions.js";
import { validateRevisionHistory, archivedRunMatches } from "./run-revision-history.js";
import { randomUUID } from "node:crypto";
import { closeSync, fsyncSync, existsSync, lstatSync, openSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { duplicateArtefactRowTypes, parseControlState, parseRunState } from "./run-state-parser.js";
import { APPROVAL_GATES, approvalSeal, canonicalRunText, runRootFromStatePath, runSealState, sealRunState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { prepareRunContentState } from "../control-evaluation/run-state.js";

import { atomicWrite, fsyncDirectory, withOwnedFileLock } from "../owned-file-lock.js";
export { atomicWrite, fsyncDirectory, withOwnedFileLock, releaseAbandonedOwnedLock, OWNED_LOCK_CHANNEL } from "../owned-file-lock.js";

function stampRunActivity(content, updatedAt = new Date().toISOString()) {
  if (/^- updated_at:.*$/mu.test(content)) {
    return content.replace(/^- updated_at:.*$/mu, `- updated_at: ${updatedAt}`);
  }
  return content.replace(/(^## Run Meta\s*\n(?:.*\n)*?- revision_id:.*$)/mu, `$1\n- updated_at: ${updatedAt}`);
}

export function withRunLock(path, work, options) {
  return withOwnedFileLock(path, work, options);
}

// Every write advances the revision and re-seals the run. Approval rows may change only when the
// caller has validated one exact gate approval (run-approve) or the bounded PRD supersession
// (run-revise); any other write must keep them intact.
export function writeRunLocked(path, content, expectedRevisionId, { allowApprovalChange = false, allowContentChange = false, allowPendingTransaction = false, nextRevisionId = randomUUID(), expectedContent, validateBeforeWrite, appendedReceipt, appendedBinding, appendedRevision, appendedOperation, appendedEvidence, checkpoint } = {}) {
  const root = runRootFromStatePath(path);
  if (!allowPendingTransaction && existsSync(join(dirname(path), "RUN_STEP_PENDING.json"))) {
    throw new Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  }
    const currentContent = readFileSync(path, "utf8");
    const current = parseRunState(currentContent);
    if (!current.valid) throw new Error("AGDF_RUN_STATE_INVALID");
    // A superseded or abandoned Run is final; its own closure write starts from active.
    assertRunNotEnded(currentContent);
    if (current.meta.revision_id !== expectedRevisionId
        || (expectedContent !== undefined && currentContent !== expectedContent)) {
      throw new Error("AGDF_STALE_RUN_REVISION");
    }
    const seal = runSealState(root, currentContent);
    if (seal.status === "unsealed" || seal.status === "invalid") throw new Error("AGDF_RUN_SEAL_INVALID");
    if (seal.status === "approvals_changed") throw new Error("AGDF_RUN_APPROVALS_UNRECORDED");
    if (seal.status === "content_changed" && !allowContentChange) throw new Error("AGDF_RUN_SEAL_INVALID");
    if (!allowApprovalChange && approvalSeal(content) !== seal.recorded.approval_seal) {
      throw new Error("AGDF_RUN_APPROVALS_UNRECORDED");
    }

    assertApprovalOperationsChange(currentContent, content, appendedReceipt);
    assertArtefactBindingsChange(currentContent, content, appendedBinding);
    assertSourceRevisionsChange(currentContent, content, appendedRevision);
    assertRunOperationsChange(currentContent, content, appendedOperation);
    assertEvidenceBindingsChange(currentContent, content, appendedEvidence);
    if (appendedEvidence && (!validEvidenceBinding(appendedEvidence) || appendedEvidence.run_id !== current.meta.run_id
      || appendedEvidence.operation_id !== (appendedOperation?.operation_id ?? appendedBinding?.operation.id))) throw Error('AGDF_EVIDENCE_BINDINGS_INVALID');
    if (appendedOperation && (!validRunOperation(appendedOperation) || (allowApprovalChange !== (appendedOperation.kind === 'prd_revision.reopen')) || appendedReceipt || appendedBinding || appendedRevision
        || appendedOperation.run_id !== current.meta.run_id || appendedOperation.expected_revision_id !== expectedRevisionId
        || appendedOperation.effect.resulting_revision_id !== nextRevisionId || appendedOperation.effect.revision !== Number(current.meta.revision) + 1)) throw Error("AGDF_RUN_OPERATIONS_INVALID");
    if (appendedOperation?.kind === 'prd_revision.reopen' && (!validateBeforeWrite || !validateEarlyPrdHistory(root, appendedOperation)
      || !archivedRunMatches(root, earlyPrdHistoryReference(appendedOperation), currentContent) || !validEarlyPrdEffect(currentContent, content))) throw Error('AGDF_RUN_OPERATIONS_INVALID');
    if (appendedRevision && (!allowApprovalChange || appendedReceipt || appendedBinding || !validateBeforeWrite
        || !validSourceRevision(appendedRevision) || appendedRevision.run_id !== current.meta.run_id
        || appendedRevision.previous_revision_id !== expectedRevisionId || appendedRevision.resulting_revision_id !== nextRevisionId
        || appendedRevision.revision !== Number(current.meta.revision) + 1 || !validateRevisionHistory(root, appendedRevision)
        || !archivedRunMatches(root, appendedRevision, currentContent) || !validSourceRevisionEffect(currentContent, content, appendedRevision))) {
      throw Error("AGDF_SOURCE_REVISIONS_INVALID");
    }
    if (appendedBinding && (!validArtefactBinding(appendedBinding) || allowApprovalChange
        || appendedBinding.run_id !== current.meta.run_id || appendedBinding.operation.previous_revision_id !== expectedRevisionId
        || appendedBinding.operation.resulting_revision_id !== nextRevisionId
        || appendedBinding.operation.revision !== Number(current.meta.revision) + 1)) throw new Error("AGDF_ARTEFACT_BINDINGS_INVALID");
    if (appendedReceipt && (!allowApprovalChange || !validApprovalReceipt(appendedReceipt)
        || appendedReceipt.binding.run_id !== current.meta.run_id
        || appendedReceipt.effect.previous_revision_id !== expectedRevisionId
        || appendedReceipt.effect.resulting_revision_id !== nextRevisionId
        || appendedReceipt.effect.revision !== Number(current.meta.revision) + 1
        || parseControlState(content, { userGates: APPROVAL_GATES }).approvals.get(appendedReceipt.binding.gate)?.status !== "approved")) {
      throw new Error("AGDF_APPROVAL_OPERATIONS_INVALID");
    }
    if (duplicateArtefactRowTypes(content).length) throw new Error("AGDF_ARTEFACT_ROW_DUPLICATE");
    validateBeforeWrite?.();
    const next = sealRunState(root, stampRunActivity(canonicalRunText(content))
      .replace(
        /^- revision:\s*.*$/m,
        `- revision: ${Number(current.meta.revision) + 1}`,
      )
      .replace(/^- revision_id:\s*.*$/m, `- revision_id: ${nextRevisionId}`));
    const candidate = parseRunState(next);
    if (!candidate.valid || candidate.meta.run_id !== current.meta.run_id) {
      throw new Error("AGDF_RUN_STATE_INVALID");
    }

    atomicWrite(path, next, { checkpoint });
    return candidate;
}

export function unapproveRecoveryApprovals(content) {
  const lines = canonicalRunText(content).split("\n");
  let approvalSection = "";
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^##\s+(.+?)\s*$/u);
    if (heading) { approvalSection = heading[1]; continue; }
    if (!["Approvals", "Gate Checklist"].includes(approvalSection) || !lines[index].trimStart().startsWith("|")) continue;
    const cells = lines[index].split("|").slice(1, -1).map((cell) => cell.trim());
    if (!APPROVAL_GATES.includes(cells[0])) continue;
    cells[1] = "missing";
    if (cells.length > 2) cells[2] = "";
    lines[index] = `| ${cells.join(" | ")} |`;
  }
  let candidate = lines.join("\n");
  const state = prepareRunContentState("", candidate);
  const decision = transitionDecisionForRunState(state);
  candidate = candidate.replace(/^- current_gate:.*$/mu, `- current_gate: ${decision.current_gate}`)
    .replace(/^- next_allowed_action:.*$/mu, `- next_allowed_action: ${decision.next_allowed_action}`);
  const answers = new Map([
    ["What is known?", "Recovery reset approvals without independent provenance; the ordinary approval sequence resumes."],
    ["What is approved?", "Nothing yet."],
    ["What is missing?", `Exact ${decision.missing_approval}.`],
    ["What is the next allowed action?", decision.next_allowed_action],
    ["What is explicitly forbidden right now?", decision.forbidden.join("; ")],
  ]);
  const projected = candidate.split("\n");
  let controlSection = "";
  for (let index = 0; index < projected.length; index += 1) {
    const heading = projected[index].match(/^##\s+(.+?)\s*$/u);
    if (heading) { controlSection = heading[1]; continue; }
    if (controlSection !== "Current Control State" || !projected[index].trimStart().startsWith("|")) continue;
    const cells = projected[index].split("|").slice(1, -1).map((cell) => cell.trim());
    if (answers.has(cells[0])) {
      cells[1] = answers.get(cells[0]);
      projected[index] = `| ${cells.join(" | ")} |`;
    }
  }
  return projected.join("\n");
}

// Recovery is the sole exception to the ordinary fail-closed seal check. Callers must hold the
// existing run lock and provide the exact preview snapshot; normal run-update never reaches here.
export function recoveryRunContent(root, candidateContent, { revision, nextRevisionId, updatedAt }) {
  const bumped = stampRunActivity(canonicalRunText(candidateContent), updatedAt)
    .replace(/^- revision:\s*.*$/m, `- revision: ${Number(revision) + 1}`)
    .replace(/^- revision_id:\s*.*$/m, `- revision_id: ${nextRevisionId}`);
  return sealRunState(root, bumped);
}

export function writeRunRecoveryLocked(path, candidateContent, {
  expectedContent,
  expectedRevisionId,
  nextRevisionId,
  updatedAt,
  validateBeforeWrite,
} = {}) {
  const root = runRootFromStatePath(path);
  if (existsSync(join(dirname(path), "RUN_STEP_PENDING.json"))) {
    throw new Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  }
  const currentContent = readFileSync(path, "utf8");
  const current = parseRunState(currentContent);
  if (!current.valid) throw new Error("AGDF_RUN_STATE_INVALID");
  if (current.meta.run_id !== basename(dirname(path))) throw new Error("AGDF_RUN_PATH_INVALID");
  assertRunNotEnded(currentContent);
  if (current.meta.lifecycle !== "active") throw new Error("AGDF_RECOVERY_LIFECYCLE_UNSUPPORTED");
  if (current.meta.revision_id !== expectedRevisionId || currentContent !== expectedContent) {
    throw new Error("AGDF_STALE_RUN_REVISION");
  }
  assertRecoveryOperationsTrusted(currentContent);
  assertApprovalOperationsChange(currentContent, candidateContent);
  assertRunOperationsChange(currentContent, candidateContent);
  assertEvidenceBindingsChange(currentContent, candidateContent);
  const currentSeal = runSealState(root, currentContent);
  if (!["unsealed", "invalid"].includes(currentSeal.status)) {
    throw new Error("AGDF_RUN_RECOVERY_NOT_REQUIRED");
  }
  if (canonicalRunText(candidateContent) !== canonicalRunText(unapproveRecoveryApprovals(currentContent))) {
    throw new Error("AGDF_RUN_RECOVERY_CANDIDATE_INVALID");
  }
  if (duplicateArtefactRowTypes(candidateContent).length) throw new Error("AGDF_ARTEFACT_ROW_DUPLICATE");
  const candidate = parseRunState(candidateContent);
  if (!candidate.valid || candidate.meta.run_id !== current.meta.run_id) throw new Error("AGDF_RUN_STATE_INVALID");
  validateBeforeWrite?.();
  const sealed = recoveryRunContent(root, candidateContent, { revision: current.meta.revision, nextRevisionId, updatedAt });
  const validated = parseRunState(sealed);
  if (!validated.valid || runSealState(root, sealed).status !== "valid") throw new Error("AGDF_RUN_STATE_INVALID");
  atomicWrite(path, sealed);
  return validated;
}

export function writeRun(path, content, expectedRevisionId, options = {}) {
  return withRunLock(path, () => writeRunLocked(path, content, expectedRevisionId, options));
}

// A retry acknowledges the existing canonical revision without writing another one.
export function flushRunCommit(path) {
  // Windows FlushFileBuffers requires a writable handle. r+ opens the existing
  // canonical file without truncating it; replay still writes no new revision.
  const descriptor = openSync(path, process.platform === "win32" ? "r+" : "r");
  try {
    const file = lstatSync(path);
    if (file.isSymbolicLink() || !file.isFile()) throw new Error("AGDF_RUN_PATH_INVALID");
    fsyncSync(descriptor);
  } finally { closeSync(descriptor); }
  fsyncDirectory(dirname(path));
}

export function assertRecoveryOperationsTrusted(content) {
  const operations = readApprovalOperations(content);
  if (!operations.valid || (operations.present && parseRunState(content).meta.approval_seal !== approvalSeal(content))) {
    throw new Error("AGDF_APPROVAL_OPERATIONS_UNTRUSTED");
  }
}
