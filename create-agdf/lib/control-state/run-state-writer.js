import { randomUUID } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  existsSync,
  lstatSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { parseRunState } from "./run-state-parser.js";
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
  if (existsSync(path)) {
    const destination = lstatSync(path);
    if (destination.isSymbolicLink() || !destination.isFile()) {
      throw new Error("AGDF_RUN_PATH_INVALID");
    }
  }

  const parent = lstatSync(dirname(path));
  if (parent.isSymbolicLink() || !parent.isDirectory()) {
    throw new Error("AGDF_RUN_PATH_INVALID");
  }

  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let descriptor;

  try {
    descriptor = openSync(temp, "wx");
    writeFileSync(descriptor, content, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;

    renameSync(temp, path);
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
// caller has validated one exact gate approval (run-approve); any other write must keep them intact.
export function writeRun(path, content, expectedRevisionId, { allowApprovalChange = false, expectedContent } = {}) {
  const root = runRootFromStatePath(path);
  const lockPath = `${path}.lock`;
  let lockDescriptor;
  try {
    lockDescriptor = openSync(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST") throw new Error("AGDF_RUN_WRITE_LOCKED");
    throw error;
  }

  try {
    const currentContent = readFileSync(path, "utf8");
    const current = parseRunState(currentContent);
    if (!current.valid) throw new Error("AGDF_RUN_STATE_INVALID");
    if (current.meta.revision_id !== expectedRevisionId
        || (expectedContent !== undefined && currentContent !== expectedContent)) {
      throw new Error("AGDF_STALE_RUN_REVISION");
    }
    const seal = runSealState(root, currentContent);
    if (seal.status === "invalid") throw new Error("AGDF_RUN_SEAL_INVALID");
    if (!allowApprovalChange && seal.status !== "unsealed" && approvalSeal(content) !== seal.recorded.approval_seal) {
      throw new Error("AGDF_RUN_APPROVALS_UNRECORDED");
    }

    const next = sealRunState(root, canonicalRunText(content)
      .replace(
        /^- revision:\s*.*$/m,
        `- revision: ${Number(current.meta.revision) + 1}`,
      )
      .replace(/^- revision_id:\s*.*$/m, `- revision_id: ${randomUUID()}`));
    const candidate = parseRunState(next);
    if (!candidate.valid || candidate.meta.run_id !== current.meta.run_id) {
      throw new Error("AGDF_RUN_STATE_INVALID");
    }

    atomicWrite(path, next);
    return candidate;
  } finally {
    closeSync(lockDescriptor);
    unlinkSync(lockPath);
  }
}
