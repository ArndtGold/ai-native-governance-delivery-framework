import { assertRunOperationsChange, validRunOperation } from "./run-operations.js";
import { assertEvidenceBindingsChange, validEvidenceBinding } from './evidence-bindings.js';
import { validateEarlyPrdHistory, validEarlyPrdEffect, earlyPrdHistoryReference } from './run-revision-history.js';
import { assertApprovalOperationsChange, readApprovalOperations, validApprovalReceipt } from "./approval-operations.js";
import { assertArtefactBindingsChange, validArtefactBinding } from "./artefact-bindings.js";
import { assertSourceRevisionsChange, validSourceRevision, validSourceRevisionEffect } from "./run-source-revisions.js";
import { validateRevisionHistory, archivedRunMatches } from "./run-revision-history.js";
import { randomUUID } from "node:crypto";
import { channel } from "node:diagnostics_channel";
import {
  closeSync,
  fchmodSync,
  fstatSync,
  fsyncSync,
  existsSync,
  lstatSync,
  linkSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { renameSyncWithRetry } from "../fs-swap.js";
import { basename, dirname, join } from "node:path";

import { duplicateArtefactRowTypes, parseControlState, parseRunState } from "./run-state-parser.js";
import { APPROVAL_GATES, approvalSeal, canonicalRunText, runRootFromStatePath, runSealState, sealRunState } from "./run-seal.js";
import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { prepareRunContentState } from "../control-evaluation/run-state.js";

export function fsyncDirectory(path) {
  if (process.platform === "win32") return;
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function stampRunActivity(content, updatedAt = new Date().toISOString()) {
  if (/^- updated_at:.*$/mu.test(content)) {
    return content.replace(/^- updated_at:.*$/mu, `- updated_at: ${updatedAt}`);
  }
  return content.replace(/(^## Run Meta\s*\n(?:.*\n)*?- revision_id:.*$)/mu, `$1\n- updated_at: ${updatedAt}`);
}

export function atomicWrite(path, content, { checkpoint = () => {}, temporaryPath } = {}) {
  let previousMode;
  if (existsSync(path)) {
    const destination = lstatSync(path);
    if (destination.isSymbolicLink() || !destination.isFile()) {
      throw new Error("AGDF_RUN_PATH_INVALID");
    }
    previousMode = destination.mode & 0o777;
  }

  const parent = lstatSync(dirname(path));
  if (parent.isSymbolicLink() || !parent.isDirectory()) {
    throw new Error("AGDF_RUN_PATH_INVALID");
  }

  const temp = temporaryPath ?? `${path}.tmp-${process.pid}-${randomUUID()}`;
  if (typeof temp !== 'string' || temp === path || dirname(temp) !== dirname(path)) throw new Error('AGDF_RUN_PATH_INVALID');
  let descriptor;

  try {
    descriptor = openSync(temp, "wx", 0o600);
    checkpoint("temp_opened");
    writeFileSync(descriptor, content, "utf8");
    checkpoint("temp_written");
    if (previousMode !== undefined && process.platform !== "win32") fchmodSync(descriptor, previousMode);
    fsyncSync(descriptor);
    checkpoint("after_file_sync");
    closeSync(descriptor);
    descriptor = undefined;

    // Windows scanners briefly lock fresh files; the same bounded retry as the marketplace swap.
    checkpoint("before_rename");
    renameSyncWithRetry(temp, path);
    checkpoint("after_rename");
    fsyncDirectory(dirname(path));
    checkpoint("after_directory_sync");
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temp);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") throw cleanupError;
    }
    throw error;
  }
}

// Every write advances the revision and re-seals the run. Approval rows may change only when the
// caller has validated one exact gate approval (run-approve) or the bounded PRD supersession
// (run-revise); any other write must keep them intact.
function lockError(path) {
  const error = new Error("AGDF_RUN_WRITE_LOCKED");
  error.lock_path = path;
  // A simultaneous reclaim inspection can hold the short guard while the real
  // publication owner is live. Classify only a stable, regular, bounded owner
  // record; this does not reclaim, remove or authorize a wait for an unknown lock.
  try {
    const before = lstatSync(path);
    if (before.isFile() && !before.isSymbolicLink() && before.size <= 4096) {
      const bytes = readFileSync(path, 'utf8'), owner = JSON.parse(bytes), after = lstatSync(path);
      if (before.dev === after.dev && before.ino === after.ino && !after.isSymbolicLink()
        && readFileSync(path, 'utf8') === bytes && ownerState(owner) === 'live') error.lock_owner_status = 'live';
    }
  } catch {}
  return error;
}

const LOCK_TOKEN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu;

function validOwnerRecord(owner) {
  return Boolean(owner) && Object.keys(owner).sort().join(',') === 'pid,schema_version,started_at,token'
    && owner.schema_version === 1 && typeof owner.started_at === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(owner.started_at)
    && Number.isFinite(Date.parse(owner.started_at)) && new Date(owner.started_at).toISOString() === owner.started_at
    && Number.isSafeInteger(owner.pid) && owner.pid > 0
    && typeof owner.token === "string" && LOCK_TOKEN.test(owner.token);
}

function ownerState(owner) {
  if (!validOwnerRecord(owner)) return "unknown";
  try {
    process.kill(owner.pid, 0);
    return "live";
  } catch (error) {
    return error?.code === "ESRCH" ? "gone" : "unknown";
  }
}

function reclaimAbandonedLock(path) {
  const guard = `${path}.reclaim`;
  let descriptor;
  try {
    descriptor = openSync(guard, "wx");
  } catch {
    throw lockError(path);
  }
  try {
    let original;
    try {
      const file = lstatSync(path);
      if (!file.isFile() || file.size > 4096) throw lockError(path);
      original = readFileSync(path, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    let owner;
    try { owner = JSON.parse(original); } catch { owner = null; }
    const status = ownerState(owner);
    if (status !== "gone") {
      const error = lockError(path);
      error.lock_owner_status = status;
      throw error;
    }
    if (!lstatSync(path).isFile() || readFileSync(path, "utf8") !== original) throw lockError(path);
    unlinkSync(path);
    fsyncDirectory(dirname(path));
  } finally {
    closeSync(descriptor);
    unlinkSync(guard);
  }
}

function publishOwnedLock(lockPath, owner, checkpoint) {
  const stagedPath = `${lockPath}.${owner.token}.pending`;
  const descriptor = openSync(stagedPath, 'wx', 0o600);
  const created = fstatSync(descriptor);
  let published = false;
  try {
    writeFileSync(descriptor, `${JSON.stringify(owner)}\n`, 'utf8'); fsyncSync(descriptor);
    checkpoint('owner_staged');
    // Exclusive hard-link publication exposes one complete record or EEXIST,
    // never the previous visible-but-empty owner window. Both names are local
    // to this directory and inode; a changed staging path cannot be adopted.
    const staged = lstatSync(stagedPath);
    if (staged.isSymbolicLink() || staged.dev !== created.dev || staged.ino !== created.ino) throw lockError(lockPath);
    linkSync(stagedPath, lockPath);
    published = true;
    checkpoint('owner_published');
    unlinkSync(stagedPath);
    return descriptor;
  } catch (error) {
    // Failure before handing off the descriptor must not strand our live lock.
    // Never unlink a replaced or modified owner record.
    try {
      if (published) {
        const current = lstatSync(lockPath);
        if (!current.isSymbolicLink() && current.dev === created.dev && current.ino === created.ino
          && readFileSync(lockPath, 'utf8') === `${JSON.stringify(owner)}\n`) unlinkSync(lockPath);
      }
    } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') throw cleanupError; }
    finally { closeSync(descriptor); }
    try {
      const staged = lstatSync(stagedPath);
      if (!staged.isSymbolicLink() && staged.dev === created.dev && staged.ino === created.ino) unlinkSync(stagedPath);
    } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') throw cleanupError; }
    throw error;
  }
}

// Ownership announcements let a host that runs writers on threads (the MCP worker
// executor) release a lock whose owning thread was terminated before its finally
// block ran. Owner records keep their format; without subscribers nothing happens.
export const OWNED_LOCK_CHANNEL = "agdf:owned-file-lock";
const ownedLockChannel = channel(OWNED_LOCK_CHANNEL);
function announceOwnedLock(phase, lockPath, token) {
  if (ownedLockChannel.hasSubscribers) ownedLockChannel.publish({ phase, lock_path: lockPath, token });
}

// Releases a lock whose owning thread has actually exited; the caller proves the exit.
// This function proves the record is that thread's own (exact token, this process,
// unchanged bytes) under the same guard as reclaimAbandonedLock. It never throws for
// a foreign, guarded or unknown lock: it reports the outcome and leaves it in place.
export function releaseAbandonedOwnedLock(lockPath, token) {
  if (typeof lockPath !== "string" || !lockPath.endsWith(".lock") || typeof token !== "string" || !LOCK_TOKEN.test(token)) return "unknown";
  try {
    const staged = `${lockPath}.${token}.pending`, file = lstatSync(staged);
    if (file.isFile() && !file.isSymbolicLink()) unlinkSync(staged);
  } catch (error) { if (error?.code !== "ENOENT") return "unknown"; }
  const guard = `${lockPath}.reclaim`;
  let descriptor;
  try { descriptor = openSync(guard, "wx"); } catch (error) { return error?.code === "EEXIST" ? "guarded" : "unknown"; }
  try {
    let original;
    try {
      const file = lstatSync(lockPath);
      if (!file.isFile() || file.size > 4096) return "unknown";
      original = readFileSync(lockPath, "utf8");
    } catch (error) { return error?.code === "ENOENT" ? "absent" : "unknown"; }
    let owner;
    try { owner = JSON.parse(original); } catch { return "unknown"; }
    if (!validOwnerRecord(owner)) return "unknown";
    if (owner.token !== token || owner.pid !== process.pid) return "foreign";
    if (!lstatSync(lockPath).isFile() || readFileSync(lockPath, "utf8") !== original) return "foreign";
    unlinkSync(lockPath);
    fsyncDirectory(dirname(lockPath));
    return "released";
  } catch { return "unknown"; }
  finally {
    closeSync(descriptor);
    try { unlinkSync(guard); } catch {}
  }
}

export function withOwnedFileLock(path, work, { checkpoint = () => {} } = {}) {
  const lockPath = `${path}.lock`;
  const owner = { schema_version: 1, pid: process.pid, token: randomUUID(), started_at: new Date().toISOString() };
  let lockDescriptor;
  // Announce before staging: a thread stopped right after publication is still known.
  announceOwnedLock("intent", lockPath, owner.token);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        lockDescriptor = publishOwnedLock(lockPath, owner, checkpoint); break;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        try { reclaimAbandonedLock(lockPath); }
        catch (locked) {
          if (attempt < 2 && !existsSync(lockPath)) continue; // Fresh proven absence; no wait/reclaim of an unknown owner.
          throw locked;
        }
        if (attempt === 2) throw lockError(lockPath);
      }
    }
  } catch (error) {
    // No "released" here: if publishOwnedLock's own cleanup failed, the record may still
    // exist, and the host must keep the token to release it after the thread exits.
    throw error;
  }
  const created = fstatSync(lockDescriptor);
  try {
    checkpoint("lock_acquired");
    const result = work(owner);
    checkpoint("before_lock_release");
    return result;
  } finally {
    closeSync(lockDescriptor);
    // A changed lock does not belong to this invocation and must never be removed by it.
    try {
      const currentFile = lstatSync(lockPath);
      if (currentFile.dev === created.dev && currentFile.ino === created.ino) {
        const current = JSON.parse(readFileSync(lockPath, "utf8"));
        if (current.token === owner.token) unlinkSync(lockPath);
      }
    } catch (error) {
      if (error?.code !== "ENOENT" && error instanceof SyntaxError === false) throw error;
    }
    announceOwnedLock("released", lockPath, owner.token);
    checkpoint("after_lock_release");
  }
}

export function withRunLock(path, work, options) {
  return withOwnedFileLock(path, work, options);
}

export function writeRunLocked(path, content, expectedRevisionId, { allowApprovalChange = false, allowContentChange = false, allowPendingTransaction = false, nextRevisionId = randomUUID(), expectedContent, validateBeforeWrite, appendedReceipt, appendedBinding, appendedRevision, appendedOperation, appendedEvidence, checkpoint } = {}) {
  const root = runRootFromStatePath(path);
  if (!allowPendingTransaction && existsSync(join(dirname(path), "RUN_STEP_PENDING.json"))) {
    throw new Error("AGDF_RUN_STEP_RECOVERY_REQUIRED");
  }
    const currentContent = readFileSync(path, "utf8");
    const current = parseRunState(currentContent);
    if (!current.valid) throw new Error("AGDF_RUN_STATE_INVALID");
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
