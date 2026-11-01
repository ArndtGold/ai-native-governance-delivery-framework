import { inspectRunOperation } from '../lib/control-state/run-operation-status.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { clarifiedUr } from './planned-fixtures.js';
import { runControlPath, runDocumentPath } from '../lib/control-state/run-identity.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { resolutionRecordVersion } from '../lib/control-state/input-resolution.js';
import { runSealState } from '../lib/control-state/run-seal.js';
const childEntry = fileURLToPath(new URL('./fixtures/current-run-process.mjs', import.meta.url));
function intent(f, run) {
  const input = { operation_id: randomUUID(), binding: run.binding(), title: 'Synthetic transaction', content: clarifiedUr };
  const path = join(f.root, `intent-${input.operation_id}.json`); writeFileSync(path, JSON.stringify(input));
  const source = f.material(input.binding, 'UR', input.content);
  return { input, path, request: f.request('step.record', { step: 'ur', title: input.title, source }, { ...input.binding, operation_id: input.operation_id }) };
}
function kill(f, operation, phase) {
  const child = spawnSync(process.execPath, [childEntry, f.root, operation.path, phase], { encoding: 'utf8', timeout: 20000 });
  assert.equal(child.error, undefined); assert.equal(child.stdout, 'AGDF_KILL_CHECKPOINT'); assert.equal(child.stderr, '');
  if (process.platform === 'win32') assert(child.signal === 'SIGKILL' || child.status !== null && child.status !== 0);
  else assert.equal(child.signal, 'SIGKILL');
}
for (const phase of ['intent', 'output', 'run_after_rename', 'run', 'retired']) test(`current journal: real SIGKILL at ${phase} replays only the original operation`, t => {
  const f = currentFixture(t), run = currentRun(f), operation = intent(f, run), before = run.content();
  kill(f, operation, phase);
  const pending = join(f.root, runControlPath(run.id, 'RUN_STEP_PENDING.json'));
  if (existsSync(pending)) {
    const journal = readPendingRunStepJournal(f.root, run.id);
    assert.equal(resolutionRecordVersion(journal), 7); assert.equal(Object.hasOwn(journal, 'backlog'), false);
    assert.equal(journal.operation_id, operation.input.operation_id);
  }
  if (existsSync(pending)) {
    const observed = inspectRunOperation(f.root, { runId: run.id, operationId: operation.input.operation_id, targetId: f.base.target_id });
    const revision = parseRunState(run.content()).meta.revision_id;
    const recovered = f.call('operation.recover', { original_kind: 'step.record', pending_digest: observed.pending.pending_digest, recovery_revision_id: revision }, { run_id: run.id, expected_revision_id: revision, operation_id: operation.input.operation_id });
    assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
  }
  const result = f.execute(operation.request); assert(['accepted', 'already_applied'].includes(result.outcome), JSON.stringify(result));
  assert.notEqual(run.content(), before); assert.equal(runSealState(f.root, run.content()).status, 'valid');
  assert.equal(readFileSync(join(f.root, runDocumentPath(run.id, 'UR.md')), 'utf8'), clarifiedUr);
  assert.equal(existsSync(pending), false);
  const committed = run.content(); assert.equal(f.execute(operation.request).outcome, 'already_applied'); assert.equal(run.content(), committed);
});
test('current journal: unsupported/foreign members remain byte-exact and cannot be silently recovered', t => {
  const f = currentFixture(t), run = currentRun(f), operation = intent(f, run);
  kill(f, operation, 'intent');
  const path = join(f.root, runControlPath(run.id, 'RUN_STEP_PENDING.json')), original = readFileSync(path, 'utf8'), before = run.content();
  for (const change of [row => ({ ...row, backlog: null }), row => ({ ...row, input_resolution: { ...row.input_resolution, record_version: 6 } })]) {
    const foreign = JSON.stringify(change(JSON.parse(original))); writeFileSync(path, foreign);
    assert.throws(() => f.execute(operation.request), /original_operation_unconfirmed|RECOVERY_REQUIRED/u);
    assert.equal(readFileSync(path, 'utf8'), foreign); assert.equal(run.content(), before);
  }
});
test('current journals: another live Run remains independent while one original transaction owns its lock', async t => {
  const f = currentFixture(t), first = currentRun(f), other = currentRun(f), operation = intent(f, first), release = join(f.root, 'release');
  const child = spawn(process.execPath, [childEntry, f.root, operation.path, 'intent', release], { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  t.after(() => { if (child.exitCode === null) child.kill(); });
  let stderr = ''; child.stderr.on('data', chunk => { stderr += chunk; });
  const exited = once(child, 'exit');
  await Promise.race([once(child, 'message'), exited.then(() => { throw Error(`checkpoint unavailable: ${stderr}`); })]);
  const independent = other.step('ur', clarifiedUr, { title: 'Independent current Run' });
  assert.equal(independent.outcome, 'accepted', JSON.stringify(independent));
  assert.throws(() => f.execute(operation.request), /RECOVERY_REQUIRED/u, 'staging cannot bypass a live original transaction');
  writeFileSync(release, 'release'); assert.deepEqual(await exited, [0, null], stderr);
  assert.equal(f.execute(operation.request).outcome, 'already_applied');
  for (const run of [first, other]) assert.equal(runSealState(f.root, run.content()).status, 'valid');
});
