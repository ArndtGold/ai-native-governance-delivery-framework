import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { plannedFixture, clarifiedUr } from './planned-fixtures.js';
import { mutatePlannedUr, inspectPlannedEntry, plannedTextDigest } from '../lib/control-state/planned-entry.js';
import { createRunFromPlanned } from '../lib/control-state/planned-handoff.js';
import { inspectMutationClaims } from '../lib/control-state/control-layout.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { previewPlannedLayout, applyPlannedLayout, recoverPlannedLayout, inspectPlannedLayoutOperation } from '../lib/control-maintenance/planned-layout.js';
const url = path => new URL(path, import.meta.url).href;
function killed(root, module, fn, input, phase) {
  const code = `import {${fn}} from ${JSON.stringify(url(module))}; import {writeSync} from 'node:fs';
    ${fn}(process.argv[1], JSON.parse(process.argv[2]), {checkpoint(point){if(point===process.argv[3]) {writeSync(1,'AGDF_KILL_CHECKPOINT');process.kill(process.pid,'SIGKILL')}}});`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', code, root, JSON.stringify(input), phase], { encoding: 'utf8', timeout: 15000 });
  assert.equal(result.error, undefined); assert.equal(result.stdout, 'AGDF_KILL_CHECKPOINT'); assert.equal(result.stderr, '');
  // Windows reports forced process termination as a nonzero exit instead of a
  // POSIX signal. The checkpoint marker plus empty stderr rules out an exception.
  if (process.platform === 'win32') assert.ok(result.signal === 'SIGKILL' || result.status !== null && result.status !== 0);
  else assert.equal(result.signal, 'SIGKILL');
}
for (const phase of ['create_intent', 'create_committed', 'replace_intent', 'replace_committed']) test(`SCN-005/017/024: real SIGKILL at ${phase}; original UUID proves outcome and retires its retained admission claim`, t => {
  const root = plannedFixture(t, []), operation_id = randomUUID();
  let input = { kind: 'planned_ur.create', operation_id, expected_digest: null, content: clarifiedUr };
  if (phase.startsWith('replace')) {
    const entry = mutatePlannedUr(root, { ...input, operation_id: randomUUID() }).entry;
    input = { kind: 'planned_ur.replace', operation_id, plan_id: entry.plan_id, expected_digest: entry.digest, content: entry.content + '\nA clarified detail.\n' };
  }
  killed(root, '../lib/control-state/planned-entry.js', 'mutatePlannedUr', input, phase);
  assert.equal(inspectMutationClaims(root).length, 1);
  const result = mutatePlannedUr(root, input); assert.ok(['accepted', 'already_applied'].includes(result.outcome));
  assert.equal(inspectMutationClaims(root).length, 0); assert.equal(inspectPlannedEntry(root, result.entry.plan_id).digest, result.entry.digest);
});
for (const phase of ['handoff_before_run_publish', 'handoff_run_committed']) test(`SCN-017/019: real handoff SIGKILL at ${phase} resumes exactly one unapproved Run`, t => {
  const root = plannedFixture(t, []), entry = mutatePlannedUr(root, { kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null, content: clarifiedUr }).entry;
  const input = { plan_id: entry.plan_id, expected_digest: entry.digest, target_id: resolveControlCommandTarget(root).target_id,
    operation_id: randomUUID(), request_digest: plannedTextDigest('original deliberate handoff') };
  killed(root, '../lib/control-state/planned-handoff.js', 'createRunFromPlanned', input, phase);
  const result = createRunFromPlanned(root, input);
  assert.equal(result.run_id, `run-${input.operation_id}`); assert.equal(inspectMutationClaims(root).length, 0);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), [result.run_id]);
  assert.match(readFileSync(join(root, `.agdf/control/runs/${result.run_id}/RUN_STATE.md`), 'utf8'), /\| UR \| missing \|/u);
});
for (const phase of ['migration_run_published', 'migration_config_committed']) test(`SCN-021/024: real cutover SIGKILL at ${phase} retains freeze and recovers the original bounded operation`, t => {
  const root = plannedFixture(t, []), config = join(root, '.agdf/control/config.json');
  writeFileSync(config, JSON.stringify({ ...JSON.parse(readFileSync(config, 'utf8')), control_layout: 'master-backlog-v1' }));
  const oldBacklog = canonicalInitPlan('en', undefined, { layout: 'master-backlog-v1' }).find(row => row.path.endsWith('MASTER_BACKLOG.md')).content;
  writeFileSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), oldBacklog); createRun(root, 'active');
  const path = join(root, '.agdf/control/runs/active/RUN_STATE.md'), old = readFileSync(path, 'utf8'), preview = previewPlannedLayout(root);
  const input = { operation_id: randomUUID(), preview_digest: preview.preview_digest, confirmation: preview.confirmation };
  killed(root, '../lib/control-maintenance/planned-layout.js', 'applyPlannedLayout', input, phase);
  const status = inspectPlannedLayoutOperation(root, input.operation_id); assert.equal(status.status, 'pending');
  const recovered = recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest });
  assert.equal(recovered.outcome, phase === 'migration_config_committed' ? 'applied' : 'rolled_back');
  if (recovered.outcome === 'rolled_back') assert.equal(readFileSync(path, 'utf8'), old);
});
test('SCN-019: two live processes starting the same entry serialize at its resource and converge on one Run', async t => {
  const root = plannedFixture(t, []), entry = mutatePlannedUr(root, { kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null, content: clarifiedUr }).entry;
  const base = { plan_id: entry.plan_id, expected_digest: entry.digest, target_id: resolveControlCommandTarget(root).target_id, request_digest: plannedTextDigest('same selected source') };
  const first = { ...base, operation_id: randomUUID() }, second = { ...base, operation_id: randomUUID() }, release = join(root, 'release');
  const code = `import {createRunFromPlanned} from ${JSON.stringify(url('../lib/control-state/planned-handoff.js'))};import{existsSync}from'node:fs';
    createRunFromPlanned(process.argv[1],JSON.parse(process.argv[2]),{checkpoint(point){if(point==='handoff_intent'){process.send('held');const deadline=Date.now()+10000;while(!existsSync(process.argv[3])){if(Date.now()>deadline)throw Error('barrier_timeout');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}}}});process.disconnect();`;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code, root, JSON.stringify(first), release], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  t.after(() => { if (child.exitCode === null) child.kill(); }); const exited = once(child, 'exit');
  await once(child, 'message');
  assert.throws(() => createRunFromPlanned(root, second), /WRITE_LOCKED/u);
  writeFileSync(release, 'release'); assert.deepEqual(await exited, [0, null]);
  const retry = createRunFromPlanned(root, second); assert.equal(retry.run_id, `run-${first.operation_id}`);
  assert.equal(retry.outcome, 'already_transferred'); assert.equal(readdirSync(join(root, '.agdf/control/runs')).length, 1);
});
