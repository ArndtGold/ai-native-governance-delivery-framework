import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { clarifiedUr } from './planned-fixtures.js';
import { parseControlState, parseRunState } from '../lib/control-state/run-state-parser.js';
import { runDocumentPath } from '../lib/control-state/run-identity.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';
const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-current-cli-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root]);
  const call = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args, '--dir', root, '--language', 'en'], { encoding: 'utf8' });
    let value; try { value = JSON.parse(result.stdout); } catch { /* diagnostics may be plain text */ }
    return { ...result, value };
  };
  const initialized = call('init'); assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
  const created = call('run-create', '--title', 'CLI current Run', '--operation', randomUUID());
  assert.equal(created.status, 0, created.stderr || created.stdout);
  const runId = created.value.family_result.run_id, state = join(root, '.agdf/control/runs', runId, 'RUN_STATE.md');
  const revision = () => parseRunState(readFileSync(state, 'utf8')).meta.revision_id;
  const source = join(root, 'incoming.md'); writeFileSync(source, clarifiedUr);
  return { root, call, runId, state, revision, source };
}
test('current CLI normalizes explicit inputs and replays the original content across process restarts', t => {
  const f = fixture(t), revision = f.revision(), operation = randomUUID();
  const args = ['run-step', '--run', f.runId, '--revision', revision, '--operation', operation, '--step', 'ur', '--title', 'Independent work', '--evidence', f.source];
  const first = f.call(...args); assert.equal(first.status, 0, first.stderr || first.stdout);
  assert.equal(first.value.outcome, 'accepted');
  assert.equal(first.value.receipt.schema_version, 'resolved/1');
  assert.equal(resolutionRecord(first.value.receipt).schema_version, '4');
  const before = readFileSync(f.state, 'utf8'), document = readFileSync(join(f.root, runDocumentPath(f.runId, 'UR.md')), 'utf8');
  const replay = f.call(...args); assert.equal(replay.status, 0, replay.stderr || replay.stdout);
  assert.equal(replay.value.outcome, 'already_applied');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  writeFileSync(f.source, clarifiedUr + '\nChanged intent.\n');
  const conflict = f.call(...args); assert.notEqual(conflict.status, 0);
  assert.equal(readFileSync(f.state, 'utf8'), before);
  assert.equal(readFileSync(join(f.root, runDocumentPath(f.runId, 'UR.md')), 'utf8'), document);
});
test('current CLI exact presentation and synthetic gate reply use the common canonical receipt owner', t => {
  const f = fixture(t);
  const written = f.call('run-step', '--run', f.runId, '--revision', f.revision(), '--step', 'ur', '--title', 'Independent work', '--evidence', f.source);
  assert.equal(written.status, 0, written.stderr || written.stdout);
  const prepared = f.call('run-present', '--run', f.runId, '--revision', f.revision(), '--gate', 'UR');
  assert.equal(prepared.status, 0, prepared.stderr || prepared.stdout);
  const approved = f.call('run-approve', '--run', f.runId, '--revision', f.revision(), '--gate', 'UR', '--presentation', prepared.value.family_result.presentation_id,
    '--response', 'Approval: UR', '--operation', randomUUID());
  assert.equal(approved.status, 0, approved.stderr || approved.stdout);
  assert.equal(resolutionRecord(approved.value.receipt).schema_version, '4');
  assert.equal(parseControlState(readFileSync(f.state, 'utf8')).approvals.get('UR').status, 'approved');
});
test('removed migration, projection, reset and synchronization commands fail without changing current control', t => {
  const f = fixture(t), before = readFileSync(f.state, 'utf8'), config = readFileSync(join(f.root, '.agdf/control/config.json'), 'utf8');
  for (const command of ['layout-migrate', 'run-migrate', 'run-render-legacy', 'run-update', 'run-recovery']) {
    const result = f.call(command); assert.notEqual(result.status, 0, command);
    assert.match(result.stderr, /unsupported|unknown|not supported/iu);
    assert.equal(readFileSync(f.state, 'utf8'), before); assert.equal(readFileSync(join(f.root, '.agdf/control/config.json'), 'utf8'), config);
  }
  assert.notEqual(f.call('init', '--control-migration', 'safe').status, 0);
  assert.equal(readFileSync(f.state, 'utf8'), before);
});

test('current CLI refuses unrelated or repeated fields without changing its selected Run', t => {
  const f = fixture(t), before = readFileSync(f.state, 'utf8');
  for (const args of [
    ['run-create', '--title', 'Ignored route must fail', '--route', 'quick_task'],
    ['run-create', '--title', 'Repeated original UUID', '--operation', randomUUID(), '--operation', randomUUID()],
    ['run-step', '--run', f.runId, '--revision', f.revision(), '--step', 'ur', '--title', 'UR', '--evidence', f.source, '--reviewer', 'Unrelated'],
    ['run-revise', '--run', f.runId, '--revision', f.revision(), '--gate', 'UR', '--operation', randomUUID()],
  ]) {
    const result = f.call(...args); assert.notEqual(result.status, 0, JSON.stringify(args));
    assert.equal(readFileSync(f.state, 'utf8'), before);
  }
});
