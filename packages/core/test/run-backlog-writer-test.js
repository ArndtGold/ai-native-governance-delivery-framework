import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { commandFixture } from '../../../scripts/support/control-command-fixture.js';
import { executeApprovalCommand } from '../lib/control-state/approval-command.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { recordRunRevision } from '../lib/control-state/run-recording.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { readApprovalOperations } from '../lib/control-state/approval-operations.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';

const dependencies = { evaluateGateCheck, packageVersion: '0.20.2' };
const backlogPath = f => join(f.root, '.agdf/control/MASTER_BACKLOG.md');
const bytes = f => ({ run: readFileSync(f.runPath, 'utf8'), backlog: existsSync(backlogPath(f)) ? readFileSync(backlogPath(f), 'utf8') : null });
for (const phase of ['intent', 'run']) {
  const f = commandFixture();
  try {
    const original = bytes(f);
    const result = executeApprovalCommand(f.root, f.command, { ...dependencies, afterWrite(stage) { if (stage === phase) throw Error(`injected ${phase}`); } });
    assert.equal(result.outcome, phase === 'intent' ? 'retryable_failure' : 'recovery_required');
    if (phase === 'intent') assert.deepEqual(bytes(f), original);
    else assert.equal(JSON.parse(readFileSync(join(f.root, '.agdf/control/runs', f.runId, 'RUN_STEP_PENDING.json'), 'utf8')).backlog, null);
    const retry = executeApprovalCommand(f.root, f.command, dependencies);
    assert.equal(retry.outcome, phase === 'intent' ? 'accepted' : 'already_applied', JSON.stringify(retry));
    const committed = bytes(f);
    assert.equal(committed.backlog, original.backlog);
    assert.equal(runSealState(f.root, committed.run).status, 'valid');
    assert.equal(readApprovalOperations(committed.run).receipts.length, 1);
    assert.equal(executeApprovalCommand(f.root, f.command, dependencies).outcome, 'already_applied');
    assert.deepEqual(bytes(f), committed);
  } finally { f.cleanup(); }
}
const f = commandFixture();
try {
  const original = bytes(f);
  assert.equal(executeApprovalCommand(f.root, { ...f.command, response: 'go ahead' }, dependencies).outcome, 'rejected');
  assert.deepEqual(bytes(f), original);
  const presentationPath = join(f.root, '.agdf/control/runs', f.runId, 'presentations', `${f.command.presentation_id}.json`);
  const presentation = readFileSync(presentationPath, 'utf8');
  const changed = executeApprovalCommand(f.root, f.command, { ...dependencies, afterWrite(stage) { if (stage === 'intent') writeFileSync(presentationPath, '{}'); } });
  assert.equal(changed.outcome, 'rejected'); assert.deepEqual(bytes(f), original);
  writeFileSync(presentationPath, presentation);
  assert.equal(executeApprovalCommand(f.root, f.command, dependencies).outcome, 'accepted');
  const accepted = bytes(f), revisionId = parseRunState(accepted.run).meta.revision_id;
  for (const legacy of ['# Old planning\nRetained idea.\n', '<<<<<<< old\n=======\n>>>>>>> new\n', null]) {
    if (legacy === null) rmSync(backlogPath(f), { force: true }); else writeFileSync(backlogPath(f), legacy);
    const before = bytes(f), update = recordRunRevision(f.root, { runId: f.runId, revisionId });
    assert.equal(update.outcome, 'unchanged'); assert.equal(update.backlog, 'not_required');
    assert.deepEqual(bytes(f), before, 'legacy synchronization does not create, repair or normalize shared data');
  }
  assert.equal(recordRunRevision(f.root, { runId: f.runId, revisionId: f.command.expected_revision_id }).reason, 'stale_revision');
  const evidence = recordRunStep(f.root, { runId: f.runId, revisionId, step: 'evidence', evidence: 'Synthetic check' }, { policy: policyForRunContent });
  assert.equal(evidence.outcome, 'recorded'); assert.equal(evidence.backlog, 'not_required');
  assert.equal(existsSync(backlogPath(f)), false); assert.equal(runSealState(f.root, bytes(f).run).status, 'valid');
} finally { f.cleanup(); }
console.log('Run-only approval, replay, tamper and deprecated synchronization checks passed.');
