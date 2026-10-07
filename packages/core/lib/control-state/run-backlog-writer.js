import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parseRunState } from "./run-state-parser.js";
import { runSealState } from "./run-seal.js";
import { atomicWrite, withOwnedFileLock, writeRunLocked } from "./run-state-writer.js";
import { commitRunStepLocked, recoverPendingRunStepLocked } from "./run-step-transaction.js";
import { pendingRunStepIds } from "./run-step-pending.js";
import { assertBacklogPath, BACKLOG_RELATIVE_PATH, prepareRunBacklog } from "./run-backlog.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";

export function withRunBacklogLock(root, path, work, options = {}) {
  const relativePath = relative(root, path).split(sep).join("/");
  if (hasSymlinkComponent(root, relativePath) || containedRegularFile(root, relativePath).status !== "valid") throw Error("AGDF_RUN_PATH_INVALID");
  return withOwnedFileLock(path, () => {
    assertBacklogPath(root);
    return withOwnedFileLock(join(root, BACKLOG_RELATIVE_PATH), () => {
      const run = parseRunState(readFileSync(path, "utf8"));
      if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
      const other = pendingRunStepIds(root).find(id => id !== run.meta.run_id);
      if (other) { const error = Error("AGDF_RUN_STEP_RECOVERY_REQUIRED"); error.pending_run_id = other; throw error; }
      recoverPendingRunStepLocked(root, run.meta.run_id);
      return work();
    });
  }, options);
}

// Both locks are held by the caller. The existing journal keeps receipt, seal, revision
// and Backlog projection recoverable at the same Run commit point.
export function writeRunWithBacklogLocked(root, path, content, revisionId, options = {}) {
  const old = readFileSync(path, "utf8"), run = parseRunState(old);
  if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
  if (run.meta.revision_id !== revisionId || options.expectedContent !== undefined && old !== options.expectedContent) throw Error("AGDF_STALE_RUN_REVISION");
  const plan = prepareRunBacklog(root, run.meta.run_id, content, path);
  if (!plan.update) return writeRunLocked(path, content, revisionId, options);
  // Full gate/presentation evaluation still sees the original sealed Run, under both
  // locks. The journal then rechecks its captured source digests and envelope at commit.
  options.validateBeforeWrite?.();
  return commitRunStepLocked(root, { runId: run.meta.run_id, runPath: path, content,
    revisionId, expectedContent: old, backlog: plan.update, or: null,
    nextRevisionId: options.nextRevisionId,
    writeOptions: { ...options, validateBeforeWrite: options.validateDuringTransaction }, afterWrite: options.afterWrite });
}

export function writeRunWithBacklog(root, path, content, revisionId, options = {}) {
  return withRunBacklogLock(root, path, () => writeRunWithBacklogLocked(root, path, content, revisionId, options));
}

// Explicit repair of a valid sealed Run's stale pointer needs only one atomic file write;
// no fabricated Run revision, new approval or reader-side write is necessary.
export function synchronizeRunBacklog(root, path, revisionId) {
  return withRunBacklogLock(root, path, () => {
    const content = readFileSync(path, "utf8"), run = parseRunState(content);
    if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
    if (run.meta.revision_id !== revisionId) throw Error("AGDF_STALE_RUN_REVISION");
    if (runSealState(root, content).status !== "valid") throw Error("AGDF_RUN_SEAL_INVALID");
    const plan = prepareRunBacklog(root, run.meta.run_id, content, path);
    if (plan.update) {
      if (readFileSync(path, "utf8") !== content || runSealState(root, content).status !== "valid"
          || readFileSync(join(root, BACKLOG_RELATIVE_PATH), "utf8") !== plan.update.old) throw Error("AGDF_STALE_RUN_REVISION");
      atomicWrite(join(root, BACKLOG_RELATIVE_PATH), plan.update.next);
    }
    return { meta: run.meta, backlog: plan.status };
  });
}
