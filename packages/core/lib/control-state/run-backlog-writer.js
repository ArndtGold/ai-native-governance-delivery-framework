import { runWorkSummary, assertSummarySources } from '../control-evaluation/run-work-summary.js';
import { resolutionRecordVersion } from './input-resolution.js';
import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { parseRunState } from "./run-state-parser.js";
import { runSealState } from "./run-seal.js";
import { withOwnedFileLock } from "./run-state-writer.js";
import { commitRunStepLocked, recoverPendingRunStepLocked, readPendingRunStepJournal, pendingRunStepConflictIds } from "./run-step-transaction.js";
import { containedRegularFile, hasSymlinkComponent } from "./contained-file.js";
import { randomUUID } from "node:crypto";
import { existsSync } from 'node:fs';
import { pendingRunStepPath } from './run-step-pending.js';

export function withRunBacklogLock(root, path, work, options = {}) {
  const relativePath = relative(root, path).split(sep).join("/");
  if (hasSymlinkComponent(root, relativePath) || containedRegularFile(root, relativePath).status !== "valid") throw Error("AGDF_RUN_PATH_INVALID");
  // Validate the Run path before acquiring its checkout-local lock.
  return withOwnedFileLock(path, () => {
    const run = parseRunState(readFileSync(path, "utf8"));
    if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
    const other = pendingRunStepConflictIds(root, run.meta.run_id).find(id => id !== run.meta.run_id);
    if (other) { const error = Error("AGDF_RUN_STEP_RECOVERY_REQUIRED"); error.pending_run_id = other; throw error; }
    if (existsSync(pendingRunStepPath(root, run.meta.run_id))) {
      const pending = readPendingRunStepJournal(root, run.meta.run_id), expected = options.operationContext;
      if (pending.backlog || expected && (![3, 4].includes(resolutionRecordVersion(pending)) || pending.operation_id !== expected.operation_id || pending.kind !== expected.kind
        || pending.target_id !== expected.target_id || pending.request_digest !== expected.request_digest)) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
    }
    recoverPendingRunStepLocked(root, run.meta.run_id);
    return work();
  }, options);
}

// The compatibility export names are retained; new operations hold only the Run lock.
// Existing journals retain receipt, seal, revision and output recovery at the Run commit point.
export function writeRunWithBacklogLocked(root, path, content, revisionId, options = {}) {
  const old = readFileSync(path, "utf8"), run = parseRunState(old);
  if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
  if (run.meta.revision_id !== revisionId || options.expectedContent !== undefined && old !== options.expectedContent) throw Error("AGDF_STALE_RUN_REVISION");
  const nextRevisionId = options.nextRevisionId ?? randomUUID();
  const summary = runWorkSummary(root, content, path);
  const guard = () => assertSummarySources(root, summary);
  const withBacklog = state => ({ ...state, backlog: 'not_required' });
  // Gate/presentation evaluation sees the original sealed Run. Recheck bound sources at commit.
  options.validateBeforeWrite?.(); guard();
  return withBacklog(commitRunStepLocked(root, { runId: run.meta.run_id, runPath: path, content,
    revisionId, expectedContent: old, backlog: null, or: null,
    operationContext: options.operationContext,
    nextRevisionId,
    writeOptions: { ...options, validateBeforeWrite: () => { options.validateDuringTransaction?.(); guard(); } }, afterWrite: options.afterWrite }));
}

export function writeRunWithBacklog(root, path, content, revisionId, options = {}) {
  return withRunBacklogLock(root, path, () => writeRunWithBacklogLocked(root, path, content, revisionId, options));
}

// Legacy synchronization is a read-only no-longer-required outcome.
export function synchronizeRunBacklog(root, path, revisionId) {
  return withRunBacklogLock(root, path, () => {
    const content = readFileSync(path, "utf8"), run = parseRunState(content);
    if (!run.valid) throw Error("AGDF_RUN_STATE_INVALID");
    if (run.meta.revision_id !== revisionId) throw Error("AGDF_STALE_RUN_REVISION");
    if (runSealState(root, content).status !== "valid") throw Error("AGDF_RUN_SEAL_INVALID");
    return { meta: run.meta, backlog: 'not_required' };
  });
}
