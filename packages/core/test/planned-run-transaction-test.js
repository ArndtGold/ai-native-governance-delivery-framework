import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { plannedFixture, commandBinding, stagedUr } from './planned-fixtures.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { readPendingRunStepJournal, recoverPendingRunStep } from '../lib/control-state/run-step-transaction.js';
import { resolutionRecordVersion } from '../lib/control-state/input-resolution.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { inspectMutationClaims } from '../lib/control-state/control-layout.js';

test('SCN-001/002: new-layout Run writes and replay never create or lock a backlog', t => {
  const root = plannedFixture(t), binding = commandBinding(root);
  const { input, materialGrants } = stagedUr(t, binding);
  const service = createRunCommandService({ materialGrants });
  const result = service('agdf_record', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(Object.hasOwn(result.family_result, 'backlog'), false);
  assert.equal(service('agdf_record', input).outcome, 'already_applied');
  assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false);
  assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md.lock')), false);
  assert.equal(inspectMutationClaims(root).length, 0);
});

for (const stage of ['intent', 'output', 'run_after_rename', 'run', 'retired']) {
  test(`SCN-002: v7 ${stage} interruption recovers only selected owned effects`, t => {
    const root = plannedFixture(t, ['first', 'second']);
    const { input, materialGrants } = stagedUr(t, commandBinding(root));
    const before = readFileSync(join(root, '.agdf/control/runs/first/RUN_STATE.md'), 'utf8');
    let failed = false;
    const result = createRunCommandService({ materialGrants, checkpoint(phase) {
      if (phase === stage && !failed) { failed = true; throw Error('injected_fault'); }
    } })('agdf_record', input);
    assert.equal(failed, true, JSON.stringify(result));
    const pendingPath = join(root, '.agdf/control/runs/first/control/RUN_STEP_PENDING.json');
    if (existsSync(pendingPath)) {
      const journal = readPendingRunStepJournal(root, 'first');
      assert.equal(resolutionRecordVersion(journal), 7);
      assert.equal(Object.hasOwn(journal, 'backlog'), false);
      // Another Run remains writable while the first needs its own recovery.
      const other = stagedUr(t, commandBinding(root, 'second'));
      assert.equal(createRunCommandService({ materialGrants: other.materialGrants })('agdf_record', other.input).outcome, 'accepted');
      assert.equal(recoverPendingRunStep(root, 'first').status, 'completed');
    }
    const after = readFileSync(join(root, '.agdf/control/runs/first/RUN_STATE.md'), 'utf8');
    assert.equal(runSealState(root, after).status, 'valid');
    assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false);
    if (['intent', 'output'].includes(stage)) assert.equal(after, before, 'precommit rollback keeps the original Run');
    else assert.notEqual(after, before, 'postcommit recovery keeps the same committed Run');
  });
}

test('SCN-002: foreign version-7 journal members stop recovery without deletion', t => {
  const root = plannedFixture(t);
  const { input, materialGrants } = stagedUr(t, commandBinding(root));
  createRunCommandService({ materialGrants, checkpoint(phase) { if (phase === 'run') throw Error('injected_fault'); } })('agdf_record', input);
  const path = join(root, '.agdf/control/runs/first/control/RUN_STEP_PENDING.json');
  const journal = JSON.parse(readFileSync(path, 'utf8'));
  journal.backlog = null;
  const foreign = JSON.stringify(journal); writeFileSync(path, foreign);
  assert.throws(() => recoverPendingRunStep(root, 'first'), /RECOVERY_REQUIRED/);
  assert.equal(readFileSync(path, 'utf8'), foreign);
});
