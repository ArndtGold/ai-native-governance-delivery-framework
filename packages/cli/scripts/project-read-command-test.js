import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { currentFixture } from '../../core/test/fixtures/current-run.js';
import { createCoreServices } from '../../core/lib/index.js';
import { resources } from '../lib/runtime/control-context.js';
import { cliGitObservation } from '../lib/control-evaluation/git-observation.js';
import { runValidatorCli } from '../lib/runtime/validator-application.js';
import { readInitializationReceipt } from '../../core/lib/control-state/canonical-initialization.js';

const entry = new URL('../bin/create-agdf.js', import.meta.url);
const call = args => spawnSync(process.execPath, [fileURLToPath(entry), ...args], { encoding: 'utf8', timeout: 30000 });
function manifest(root) {
  const rows = {};
  function walk(path, rel) { for (const name of readdirSync(path)) { const p = join(path, name), key = rel + '/' + name;
    if (lstatSync(p).isDirectory()) walk(p, key); else rows[key] = readFileSync(p).toString('base64'); } }
  walk(join(root, '.agdf'), '.agdf'); return rows;
}
test('public project reads use Core facts, retain original UUID and never write', t => {
  const f = currentFixture(t), before = manifest(f.root);
  for (const module of [undefined, `project.initialize/${randomUUID()}`]) {
    const operation = module ? 'operation-status' : 'project-state';
    const r = call([operation, '--dir', f.root, '--json', ...(module ? ['--module', module] : [])]);
    assert.equal(r.status, 0, r.stderr || r.stdout);
    const result = JSON.parse(r.stdout);
    const core = createCoreServices({ resources, observers: { gitObservation: cliGitObservation } }).inspect({
      operation, presentationLanguage: 'en', interactionLocales: resources.interactionLocales,
      expectedVersion: resources.pluginDefinition.version, targetSource: 'explicit_target', primaryTarget: f.root,
      workingDirectory: f.root, ...(module ? { contractModule: module } : {}),
    });
    assert.deepEqual(result.report, core.report);
    assert.deepEqual(manifest(f.root), before);
    if (module) { assert.equal(result.report.operation_id, module.split('/')[1]); assert.notEqual(result.report.status, 'recorded'); }
  }
  const human = call(['project-state', '--dir', f.root, '--language', 'de']);
  assert.equal(human.status, 0, human.stderr); assert.match(human.stdout, /initialized/);
  assert.match(human.stdout, /Plan: 16 files; sha256:/); assert.match(human.stdout, /Receipt: sha256:/);
});
test('the installed validator exposes the same reads and pending is a complete observation', async t => {
  let interrupted = false;
  const f = currentFixture(t, { initialize: false, checkpoint(phase) {
    if (!interrupted && phase === 'project_after_prospective_receipt') { interrupted = true; throw Error('synthetic_interruption'); }
  } });
  const input = f.request('project.initialize', { language: 'en' }); f.execute(input);
  assert.equal(interrupted, true);
  const before = manifest(f.root), lines = [];
  const exit = await runValidatorCli(['operation-status', '--dir', f.root, '--module', `project.initialize/${input.operation_id}`, '--json'],
    { io: { log: line => lines.push(line), error: line => lines.push(line) } });
  assert.equal(exit, 0, lines.join('\n')); assert.equal(JSON.parse(lines[0]).report.status, 'pending');
  const human = call(['operation-status', '--dir', f.root, '--module', `project.initialize/${input.operation_id}`]);
  assert.equal(human.status, 0, human.stderr); assert.match(human.stdout, /Current setup: pending/);
  assert.match(human.stdout, /Recovery: Replay only the saved original project.initialize UUID\/payload/);
  assert.deepEqual(manifest(f.root), before);
});
test('project reads reject irrelevant selectors and unconfirmed targets', t => {
  const f = currentFixture(t, { initialize: false });
  for (const args of [[], ['--dir', '.'], ['--dir', f.root, '--run', 'foreign'], ['--dir', f.root, '--force'],
    ['--dir', f.root, '--surface', 'codex'], ['--dir', f.root, '--module', 'quality'], ['--dir', f.root, '--native']]) {
    assert.equal(call(['project-state', ...args]).status, 1, JSON.stringify(args));
  }
  for (const module of ['', randomUUID(), `run.create/${randomUUID()}`, 'project.initialize/bad']) {
    assert.equal(call(['operation-status', '--dir', f.root, ...(module ? ['--module', module] : [])]).status, 1);
  }
  const r = call(['project-state', '--dir', tmpdir(), '--json']);
  assert.equal(r.status, 2); assert.equal(JSON.parse(r.stdout).report?.available ?? false, false);
});
test('broken current configuration cannot hide a confirmed original setup receipt', t => {
  const f = currentFixture(t), operation = readInitializationReceipt(join(f.root, '.agdf/control')).operation.operation_id;
  writeFileSync(join(f.root, '.agdf/control/config.json'), '{');
  const before = manifest(f.root), r = call(['operation-status', '--dir', f.root, '--module', `project.initialize/${operation}`, '--json']);
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.equal(JSON.parse(r.stdout).report.status, 'recorded');
  const human = call(['operation-status', '--dir', f.root, '--module', `project.initialize/${operation}`]);
  assert.equal(human.status, 0, human.stderr); assert.match(human.stdout, /Current setup: blocked/);
  assert.match(human.stdout, /Receipt: sha256:/);
  assert.deepEqual(manifest(f.root), before);
  const doctor = call(['doctor', '--dir', f.root, '--json']);
  assert.equal(doctor.status, 2, doctor.stderr || doctor.stdout);
  assert(JSON.parse(doctor.stdout).summary.block > 0);
  // Existing all-active inventory admission rejects an unreadable layout before
  // aggregation. Empty-inventory explanation must not relax that owner.
  const inventory = call(['doctor', '--dir', f.root, '--json', '--all-active']);
  assert.equal(inventory.status, 1); assert.match(inventory.stderr, /AGDF_CONTROL_LAYOUT_INVALID/);
});
