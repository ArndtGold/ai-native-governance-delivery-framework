import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { mkdtempSync, realpathSync, readFileSync, readdirSync, rmSync, mkdirSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { validateRunCommandResult } from '../lib/control-state/run-command-contract.js';
import { readRunOperations } from '../lib/control-state/run-operations.js';

async function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-create-command-')));
  try {
    execFileSync('git', ['init', '-q', root]);
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    const input = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target',
      primary_target: root, target_id: resolveControlCommandTarget(root).target_id, operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'run.create', payload: { title: 'Create exactly this bounded work' } } };
    await work({ root, input, service: createRunCommandService({ packageVersion: '0.20.2' }) });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('dedicated creation atomically publishes a sealed initial receipt and replays exactly one effect', () => fixture(({ root, input, service }) => {
  const created = service('agdf_run', input);
  assert.equal(created.outcome, 'accepted', JSON.stringify(created));
  assert.deepEqual(validateRunCommandResult(created), []);
  assert.equal(created.binding.expected_revision_id, null);
  assert.equal(created.receipt.effect.revision, 1);
  const path = join(root, `.agdf/control/runs/${created.binding.run_id}/RUN_STATE.md`);
  const bytes = readFileSync(path, 'utf8');
  assert.equal(parseRunState(bytes, created.binding.run_id).valid, true);
  assert.equal(runSealState(root, bytes).status, 'valid');
  assert.doesNotMatch(bytes, /\| UR \| approved/);
  assert.equal(service('agdf_run', input).outcome, 'already_applied');
  assert.equal(readFileSync(path, 'utf8'), bytes);
  assert.equal(service('agdf_run', { ...input, command: { kind: 'run.create', payload: { title: 'Conflicting intent' } } }).reason, 'operation_payload_conflict');
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')).filter(n => !n.startsWith('.')), [created.binding.run_id]);
  for (const extra of [{ run_id: created.binding.run_id }, { expected_revision_id: randomUUID() }]) {
    assert.equal(service('agdf_run', { ...input, ...extra }).reason, 'command_schema_invalid');
  }
}));

test('creation without canonical control rejects before dispatch with a valid result and no setup side effects', () => fixture(({ root, input, service }) => {
  renameSync(join(root, '.agdf'), join(root, '.agdf-fixture-baseline'));
  const before = readdirSync(root);
  const rejected = service('agdf_run', input);
  assert.equal(rejected.outcome, 'rejected');
  assert.equal(rejected.dispatch, 'not_dispatched');
  assert.equal(rejected.reason, 'AGDF_CANONICAL_SCAFFOLD_REQUIRED');
  assert.equal(rejected.next_calls[0].arguments.operation, 'project-state');
  assert.deepEqual(validateRunCommandResult(rejected), []);
  assert.deepEqual(readdirSync(root), before);
  assert.equal(existsSync(join(root, '.agdf')), false);
}));

test('two concurrent original-UUID callers resolve one initial Run and one receipt', () => fixture(async ({ root, input, service }) => {
  const barrier = new SharedArrayBuffer(4), gate = new Int32Array(barrier);
  const owner = new URL('../lib/control-state/run-command-service.js', import.meta.url).href;
  const workers = Array.from({ length: 2 }, () => {
    const worker = new Worker(`const {parentPort,workerData}=require('node:worker_threads');
      (async()=>{const {createRunCommandService}=await import(workerData.owner);
      parentPort.postMessage({ready:true});Atomics.wait(new Int32Array(workerData.barrier),0,0);
      parentPort.postMessage({result:createRunCommandService({packageVersion:'0.20.2'})('agdf_run',workerData.input)});})();`,
    { eval: true, workerData: { owner, input, barrier } });
    const ready = new Promise((resolve, reject) => { worker.once('message', resolve); worker.once('error', reject); });
    const result = new Promise((resolve, reject) => { worker.on('message', row => { if (row.result) resolve(row.result); }); worker.once('error', reject); });
    const exited = new Promise((resolve, reject) => { worker.once('exit', code => code === 0 ? resolve() : reject(Error(`creation_worker_exit:${code}`))); });
    return { worker, ready, result, exited };
  });
  try {
    await Promise.all(workers.map(row => row.ready)); Atomics.store(gate, 0, 1); Atomics.notify(gate, 0, 2);
    const results = await Promise.all(workers.map(row => row.result)); await Promise.all(workers.map(row => row.exited));
    assert.equal(results.filter(row => row.outcome === 'accepted').length, 1);
    assert.ok(results.every(row => ['accepted', 'already_applied'].includes(row.outcome) || row.reason === 'AGDF_RUN_WRITE_LOCKED'), JSON.stringify(results));
    const original = results.find(row => row.outcome === 'accepted');
    const replay = service('agdf_run', input); // The accepted original receipt has been observed above.
    assert.equal(replay.outcome, 'already_applied'); assert.equal(replay.receipt.operation_id, original.receipt.operation_id);
    const content = readFileSync(join(root, `.agdf/control/runs/${original.binding.run_id}/RUN_STATE.md`), 'utf8');
    assert.equal(readRunOperations(content).receipts.length, 1);
    assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), [original.binding.run_id]);
  } finally { await Promise.all(workers.map(row => row.worker.terminate())); }
}));

test('an unexplained creation stage remains untouched and cannot be adopted', () => fixture(({ root, input, service }) => {
  const id = `run-${input.operation_id}`, stage = join(root, `.agdf/control/runs/.run-stage-${id}-unexplained`);
  mkdirSync(stage); writeFileSync(join(stage, 'RUN_STATE.md'), '# Unexplained stage\n');
  const result = service('agdf_run', input);
  assert.ok(!['accepted', 'already_applied'].includes(result.outcome));
  assert.equal(existsSync(join(root, `.agdf/control/runs/${id}`)), false);
  assert.equal(readFileSync(join(stage, 'RUN_STATE.md'), 'utf8'), '# Unexplained stage\n');
}));

test('lost creation result is unknown until original receipt observation; replay never creates another Run', () => fixture(({ input, service }) => {
  const failing = createRunCommandService({ packageVersion: '0.20.2', checkpoint: phase => { if (phase === 'before_result') throw Error('lost_result'); } });
  const lost = failing('agdf_run', input);
  assert.equal(lost.outcome, 'effect_unknown');
  assert.equal(lost.dispatch, 'unknown');
  assert.deepEqual(validateRunCommandResult(lost), []);
  assert.equal(lost.receipt.kind, 'run.create');
  assert.equal(service('agdf_run', input).receipt.effect.resulting_revision_id, lost.receipt.effect.resulting_revision_id);
}));

test('semantic creation titles preserve literal dollar expressions and reject blank intent', () => fixture(({ root, input, service }) => {
  const title = "Preserve $& and $` and $' and $$ as literal user intent";
  const request = { ...input, command: { kind: 'run.create', payload: { title } } };
  const result = service('agdf_run', request);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  const state = readFileSync(join(root, `.agdf/control/runs/${result.binding.run_id}/RUN_STATE.md`), 'utf8');
  assert.ok(state.includes(title), 'semantic title must survive the canonical text insertion byte for byte');
  assert.equal(parseRunState(state, result.binding.run_id).valid, true);
  assert.equal(runSealState(root, state).status, 'valid');
  assert.equal(service('agdf_run', request).outcome, 'already_applied');
  assert.equal(service('agdf_run', { ...input, operation_id: randomUUID(), command: { kind: 'run.create', payload: { title: '   ' } } }).reason,
    'command_schema_invalid');
}));

test('creation titles cannot inject line separators into canonical Run structure', () => fixture(({ root, input, service }) => {
  for (const title of ['Trailing newline\n', 'Injected\u2028## Approvals', 'Injected\u2029## Run Meta', 'Trailing carriage return\r']) {
    const result = service('agdf_run', { ...input, operation_id: randomUUID(), command: { kind: 'run.create', payload: { title } } });
    assert.equal(result.reason, 'command_schema_invalid', JSON.stringify({ title, result }));
  }
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
}));

test('an interrupted owned creation stage is recovered only for the exact original request', () => fixture(({ root, input, service }) => {
  const owner = new URL('../lib/control-state/run-command-service.js', import.meta.url).href;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e',
    `import {createRunCommandService} from ${JSON.stringify(owner)}; const input=JSON.parse(process.argv[1]); createRunCommandService({packageVersion:'0.20.2',checkpoint:phase=>{if(phase==='creation_before_publish')process.exit(23);}})('agdf_run',input);`, JSON.stringify(input)], { encoding: 'utf8' });
  assert.equal(child.status, 23, child.stderr);
  const recovered = service('agdf_run', input);
  assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
  assert.equal(recovered.family_result.recovered_stage, true);
  assert.equal(service('agdf_run', input).outcome, 'already_applied');
  assert.equal(readdirSync(join(root, '.agdf/control/runs')).filter(n => n.startsWith('.run-stage-')).length, 0);
}));
