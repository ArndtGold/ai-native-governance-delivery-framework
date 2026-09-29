import { randomUUID } from "node:crypto";
import {
  closeSync,
  fchmodSync,
  fstatSync,
  fsyncSync,
  existsSync,
  lstatSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { renameSyncWithRetry } from "../fs-swap.js";
import { dirname, join } from "node:path";

import { duplicateArtefactRowTypes, parseRunState } from "./run-state-parser.js";
import { approvalSeal, canonicalRunText, runRootFromStatePath, runSealState, sealRunState } from "./run-seal.js";

function fsyncDirectory(path) {
  if (process.platform === "win32") return;
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

export function atomicWrite(path, content) {
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

  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let descriptor;

  try {
    descriptor = openSync(temp, "wx", 0o600);
    writeFileSync(descriptor, content, "utf8");
    if (previousMode !== undefined && process.platform !== "win32") fchmodSync(descriptor, previousMode);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;

    // Windows scanners briefly lock fresh files; the same bounded retry as the marketplace swap.
    renameSyncWithRetry(temp, path);
    fsyncDirectory(dirname(path));
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
  return error;
}

function ownerIsProvenGone(owner) {
  if (!owner || !Number.isSafeInteger(owner.pid) || owner.pid <= 0
      || typeof owner.token !== "string" || !/^[0-9a-f-]{36}$/iu.test(owner.token)) return false;
  try {
    process.kill(owner.pid, 0);
    return false;
  } catch (error) {
    return error?.code === "ESRCH";
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
      if (!lstatSync(path).isFile()) throw lockError(path);
      original = readFileSync(path, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    let owner;
    try { owner = JSON.parse(original); } catch { throw lockError(path); }
    if (!ownerIsProvenGone(owner)) throw lockError(path);
    if (!lstatSync(path).isFile() || readFileSync(path, "utf8") !== original) throw lockError(path);
    unlinkSync(path);
    fsyncDirectory(dirname(path));
  } finally {
    closeSync(descriptor);
    unlinkSync(guard);
  }
}

export function withOwnedFileLock(path, work) {
  const lockPath = `${path}.lock`;
  let lockDescriptor;
  try {
    lockDescriptor = openSync(lockPath, "wx");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    reclaimAbandonedLock(lockPath);
    try {
      lockDescriptor = openSync(lockPath, "wx");
    } catch (retryError) {
      if (retryError.code === "EEXIST") throw lockError(lockPath);
      throw retryError;
    }
  }
  const owner = { schema_version: 1, pid: process.pid, token: randomUUID(), started_at: new Date().toISOString() };
  const created = fstatSync(lockDescriptor);
  let ownerWritten = false;
  try {
    writeFileSync(lockDescriptor, `${JSON.stringify(owner)}\n`, "utf8");
    fsyncSync(lockDescriptor);
    ownerWritten = true;
    return work(owner);
  } finally {
    closeSync(lockDescriptor);
    // A changed lock does not belong to this invocation and must never be removed by it.
    try {
      const currentFile = lstatSync(lockPath);
      if (currentFile.dev === created.dev && currentFile.ino === created.ino) {
        const current = ownerWritten ? JSON.parse(readFileSync(lockPath, "utf8")) : null;
        if (!ownerWritten || current.token === owner.token) unlinkSync(lockPath);
      }
    } catch (error) {
      if (error?.code !== "ENOENT" && error instanceof SyntaxError === false) throw error;
    }
  }
}

export function withRunLock(path, work) {
  return withOwnedFileLock(path, work);
}

export function writeRunLocked(path, content, expectedRevisionId, { allowApprovalChange = false, allowContentChange = false, allowPendingTransaction = false, nextRevisionId = randomUUID(), expectedContent, validateBeforeWrite } = {}) {
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

    if (duplicateArtefactRowTypes(content).length) throw new Error("AGDF_ARTEFACT_ROW_DUPLICATE");
    validateBeforeWrite?.();
    const next = sealRunState(root, canonicalRunText(content)
      .replace(
        /^- revision:\s*.*$/m,
        `- revision: ${Number(current.meta.revision) + 1}`,
      )
      .replace(/^- revision_id:\s*.*$/m, `- revision_id: ${nextRevisionId}`));
    const candidate = parseRunState(next);
    if (!candidate.valid || candidate.meta.run_id !== current.meta.run_id) {
      throw new Error("AGDF_RUN_STATE_INVALID");
    }

    atomicWrite(path, next);
    return candidate;
}

export function writeRun(path, content, expectedRevisionId, options = {}) {
  return withRunLock(path, () => writeRunLocked(path, content, expectedRevisionId, options));
}
