import { resolutionRecordVersion } from './input-resolution.js';
import { readFileSync, existsSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseRunState } from './run-state-parser.js';

import { withOwnedFileLock } from './run-state-writer.js';
import { commitRunStepLocked, recoverPendingRunStepLocked, readPendingRunStepJournal, pendingRunStepConflictIds } from './run-step-transaction.js';
import { pendingRunStepPath } from './run-step-pending.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { runWorkSummary, assertSummarySources } from '../control-evaluation/run-work-summary.js';
import { withControlMutation, assertLayoutRunWrite } from './control-layout.js';

export function withRunMutationLock(root, path, work, options = {}) {
  const relativePath = relative(root, path).split(sep).join('/');
  if (hasSymlinkComponent(root, relativePath) || containedRegularFile(root, relativePath).status !== 'valid') throw Error('AGDF_RUN_PATH_INVALID');
  return withOwnedFileLock(path, () => {
    const run = parseRunState(readFileSync(path, 'utf8'));
    if (!run.valid) throw Error('AGDF_RUN_STATE_INVALID');
    return withControlMutation(root, { resource: `run:${run.meta.run_id}`, operation_id: options.operationContext?.operation_id ?? randomUUID(),
      resume: true, proveOutcome: result => ['accepted', 'already_applied', 'recorded', 'recovered'].includes(result?.outcome) || Boolean(result?.meta?.revision_id) }, () => {
      assertLayoutRunWrite(root, run);
      const other = pendingRunStepConflictIds(root, run.meta.run_id).find(id => id !== run.meta.run_id);
      if (other) { const error = Error('AGDF_RUN_STEP_RECOVERY_REQUIRED'); error.pending_run_id = other; throw error; }
      if (existsSync(pendingRunStepPath(root, run.meta.run_id))) {
        const pending = readPendingRunStepJournal(root, run.meta.run_id), expected = options.operationContext;
        if (expected && (resolutionRecordVersion(pending) !== 7 || pending.operation_id !== expected.operation_id || pending.kind !== expected.kind
          || pending.target_id !== expected.target_id || pending.request_digest !== expected.request_digest)) throw Error('AGDF_RUN_STEP_RECOVERY_REQUIRED');
      }
      recoverPendingRunStepLocked(root, run.meta.run_id);
      return work();
    });
  }, options);
}

// A mutation publishes only the selected Run and its captured owned outputs.
export function writeRunMutationLocked(root, path, content, revisionId, options = {}) {
  const old = readFileSync(path, 'utf8'), run = parseRunState(old);
  if (!run.valid) throw Error('AGDF_RUN_STATE_INVALID');
  if (run.meta.revision_id !== revisionId || options.expectedContent !== undefined && old !== options.expectedContent) throw Error('AGDF_STALE_RUN_REVISION');
  const nextRevisionId = options.nextRevisionId ?? randomUUID();
  const summary = runWorkSummary(root, content, path);
  const guard = () => assertSummarySources(root, summary);
  options.validateBeforeWrite?.(); guard();
  return { ...commitRunStepLocked(root, { runId: run.meta.run_id, runPath: path, content,
    revisionId, expectedContent: old, operationContext: options.operationContext, nextRevisionId,
    writeOptions: { ...options, validateBeforeWrite: () => { options.validateDuringTransaction?.(); guard(); } }, afterWrite: options.afterWrite }) };
}
export function writeRunMutation(root, path, content, revisionId, options = {}) {
  return withRunMutationLock(root, path, () => writeRunMutationLocked(root, path, content, revisionId, options));
}
