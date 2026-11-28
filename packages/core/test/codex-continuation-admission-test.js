import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { HANDOFF_BOUNDS, createCodexContinuationAdmission } from '../lib/companion/codex-continuation.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';

const eligible = () => true;
const moduleUrl = new URL('../lib/companion/codex-continuation.js', import.meta.url).href;

function fixture(t, clock) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-codex-continuation-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { target_id } = resolveControlCommandTarget(root);
  const scope = { target_id, run_id: 'fixture', revision_id: randomUUID(), operation_key: 'implementation.execute' };
  const admission = createCodexContinuationAdmission(root, clock ? { now: () => clock.time } : undefined);
  const file = (runId = scope.run_id) => join(root, 'codex-continuation', `${target_id.slice(7)}-${runId}.json`);
  return { root, scope, view: randomUUID(), admission, file };
}

const records = root => readdirSync(join(root, 'codex-continuation')).filter(name => name.endsWith('.json'));
const touch = (path, ms) => utimesSync(path, ms / 1000, ms / 1000);
// The record a reservation and publication leave behind, as the store wrote it.
function handoff(admission, scope, view = randomUUID()) {
  const reserved = admission.reserve(scope, view, eligible);
  assert.equal(reserved.reserved, true);
  assert.equal(admission.publish(scope, view, reserved.attempt_id, eligible).send, true);
  return reserved.attempt_id;
}

function competitor(root, scope) {
  const code = `
    import { createCodexContinuationAdmission } from ${JSON.stringify(moduleUrl)};
    import { randomUUID } from 'node:crypto';
    const [root, scope] = process.argv.slice(1);
    const admission = createCodexContinuationAdmission(root);
    const binding = JSON.parse(scope);
    process.stdout.write('ready\\n');
    for await (const ignored of process.stdin) {
      const view = randomUUID();
      const result = admission.reserve(binding, view, () => true);
      if (result.reserved) result.publication = admission.publish(binding, view, result.attempt_id, () => true);
      process.stdout.write(JSON.stringify(result) + '\\n');
      break;
    }
  `;
  const processResult = spawn(process.execPath, ['--input-type=module', '-e', code, root, JSON.stringify(scope)],
    { stdio: ['pipe', 'pipe', 'inherit'] });
  let output = '', ready;
  const started = new Promise(resolve => { ready = resolve; });
  const result = new Promise((resolve, reject) => {
    processResult.stdout.setEncoding('utf8').on('data', chunk => {
      output += chunk;
      if (output.startsWith('ready\n')) ready();
    });
    processResult.once('error', reject);
    processResult.once('close', code => {
      if (code !== 0) return reject(Error('independent admission process failed'));
      try { resolve(JSON.parse(output.trim().split('\n')[1])); }
      catch (error) { reject(error); }
    });
  });
  return { started, result, start: () => processResult.stdin.end('start\n') };
}

// SCN-001
test('a Run has one send permit across two processes and an unrelated Run remains free', { timeout: 10_000 }, async t => {
  const { root, scope, admission, file } = fixture(t);
  const first = competitor(root, scope), second = competitor(root, scope);
  const results = Promise.all([first.result, second.result]);
  await Promise.all([first.started, second.started]);
  first.start(); second.start();
  const rows = await results;
  assert.equal(rows.filter(row => row.publication?.send).length, 1);
  assert.equal(rows.filter(row => row.reserved).length, 1);
  assert.equal(admission.inspect(scope).state, 'pending');
  const stored = JSON.parse(readFileSync(file(), 'utf8'));
  assert.deepEqual(Object.keys(stored).sort(), ['attempt_id', 'operation_key', 'phase', 'revision_id', 'run_id', 'schema_version',
    'since', 'target_id', 'view_id']);
  assert.equal(stored.schema_version, 2);
  assert.equal(stored.phase, 'pending');
  assert.equal(admission.reserve({ ...scope, run_id: 'independent' }, randomUUID(), eligible).reserved, true);
});

// SCN-002
test('a live handoff gives no second reservation and survives a lost publication response', t => {
  const { root, scope, view, admission } = fixture(t);
  const first = admission.reserve(scope, view, eligible);
  assert.deepEqual(admission.reserve(scope, randomUUID(), eligible), { state: 'pending' });
  assert.equal(admission.publish(scope, view, first.attempt_id, eligible).send, true);
  const reopened = createCodexContinuationAdmission(root);
  for (const response of [reopened.inspect(scope), reopened.cancelReservation(scope, view, first.attempt_id),
    reopened.publish(scope, view, first.attempt_id, eligible), reopened.reserve(scope, randomUUID(), eligible)]) {
    assert.deepEqual(response, { state: 'pending' });
  }
  assert.deepEqual(reopened.claim(scope, randomUUID(), eligible), { state: 'stale' });
  assert.equal(reopened.inspect(scope).state, 'pending', 'a foreign attempt leaves the handoff untouched');
});

// SCN-003
test('every handoff phase ends after its bound and leaves no file behind', t => {
  const clock = { time: Date.now() };
  const { root, scope, admission, file } = fixture(t, clock);
  const reserved = admission.reserve(scope, randomUUID(), eligible);
  clock.time += HANDOFF_BOUNDS.reserved - 1;
  assert.equal(admission.inspect(scope).state, 'pending');
  clock.time += 1;
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.deepEqual(admission.claim(scope, reserved.attempt_id, eligible), { state: 'stale' });
  assert.equal(existsSync(file()), false, 'the next transition removes an ended reservation');
  const attempt = handoff(admission, scope);
  clock.time += HANDOFF_BOUNDS.pending - 1;
  assert.equal(admission.inspect(scope).state, 'pending');
  clock.time += 1;
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.deepEqual(admission.claim(scope, attempt, eligible), { state: 'stale' });
  assert.equal(existsSync(file()), false);
  assert.equal(admission.reserve(scope, randomUUID(), eligible).reserved, true);

  // A record dated in the future counts only within its own bound.
  const stored = JSON.parse(readFileSync(file(), 'utf8'));
  writeFileSync(file(), JSON.stringify({ ...stored, phase: 'pending', since: clock.time + HANDOFF_BOUNDS.pending }));
  assert.equal(admission.inspect(scope).state, 'pending');
  writeFileSync(file(), JSON.stringify({ ...stored, phase: 'pending', since: clock.time + HANDOFF_BOUNDS.pending + 1 }));
  assert.equal(admission.inspect(scope).state, 'ready');
});

// SCN-003
test('a reservation prunes only other Runs records that can no longer be live', t => {
  const clock = { time: Date.now() };
  const { root, scope, admission, file } = fixture(t, clock);
  const seed = (runId, content, modified) => {
    const value = typeof content === 'string' ? content : JSON.stringify({ schema_version: 2, target_id: scope.target_id,
      run_id: runId, revision_id: scope.revision_id, operation_key: scope.operation_key, attempt_id: randomUUID(),
      view_id: randomUUID(), ...content });
    writeFileSync(file(runId), value);
    touch(file(runId), modified);
  };
  const old = clock.time - HANDOFF_BOUNDS.pending - 1;
  mkdirSync(join(root, 'codex-continuation'), { recursive: true });
  seed('ended-old', { phase: 'pending', since: old }, old);
  seed('live-old-file', { phase: 'pending', since: clock.time - 1000 }, old);
  seed('ended-young-file', { phase: 'reserved', since: clock.time - HANDOFF_BOUNDS.reserved - 1 }, clock.time);
  seed('unreadable-old', 'incomplete-write', old);
  seed('unreadable-young', 'incomplete-write', clock.time);
  assert.equal(admission.reserve(scope, randomUUID(), eligible).reserved, true);
  assert.deepEqual(records(root).sort(), ['fixture', 'live-old-file', 'ended-young-file', 'unreadable-young']
    .map(runId => file(runId).split(/[\\/]/).at(-1)).sort(),
    'pruning removes ended and aged unreadable files only; a live record and a young file stay');
});

// SCN-004
test('a PR #84 record never blocks and an unreadable record blocks only until it ages out', t => {
  const clock = { time: Date.now() };
  const { scope, admission, file } = fixture(t, clock);
  handoff(admission, scope);
  const legacy = { schema_version: 1, target_id: scope.target_id, run_id: scope.run_id, revision_id: scope.revision_id,
    operation_key: scope.operation_key, root: '/legacy', attempt_id: randomUUID(), phase: 'running', view_id: null,
    owner: randomUUID(), turn: null };
  writeFileSync(file(), JSON.stringify(legacy));
  assert.equal(admission.inspect(scope).state, 'ready');
  const replaced = admission.reserve(scope, randomUUID(), eligible);
  assert.equal(replaced.reserved, true);
  assert.equal(JSON.parse(readFileSync(file(), 'utf8')).schema_version, 2);

  writeFileSync(file(), 'incomplete-write');
  touch(file(), clock.time);
  assert.equal(admission.inspect(scope).state, 'unavailable');
  assert.equal(admission.reserve(scope, randomUUID(), eligible).state, 'unavailable');
  assert.equal(readFileSync(file(), 'utf8'), 'incomplete-write', 'a young unreadable record is never overwritten');
  touch(file(), clock.time - HANDOFF_BOUNDS.pending);
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.equal(admission.reserve(scope, randomUUID(), eligible).reserved, true);
  assert.equal(JSON.parse(readFileSync(file(), 'utf8')).phase, 'reserved');

  // A file time further ahead than the bound cannot age either way; it counts as aged.
  writeFileSync(file(), 'incomplete-write');
  touch(file(), clock.time + HANDOFF_BOUNDS.pending);
  assert.equal(admission.inspect(scope).state, 'unavailable');
  touch(file(), clock.time + HANDOFF_BOUNDS.pending + 1000);
  assert.equal(admission.inspect(scope).state, 'ready');
});

// SCN-005
test('Codex picks a published handoff up exactly once and shows it as running for one bound', t => {
  const clock = { time: Date.now() };
  const { scope, admission, file } = fixture(t, clock);
  const attempt = handoff(admission, scope);
  assert.deepEqual(admission.claim(scope, attempt, eligible), { state: 'running', attempt_id: attempt, admitted: true });
  assert.equal(admission.inspect(scope).state, 'running');
  assert.deepEqual(admission.claim(scope, attempt, eligible), { state: 'stale' });
  assert.deepEqual(admission.claim(scope, randomUUID(), eligible), { state: 'stale' });
  assert.deepEqual(admission.reserve(scope, randomUUID(), eligible), { state: 'running' });
  clock.time += HANDOFF_BOUNDS.claimed - 1;
  assert.equal(admission.inspect(scope).state, 'running');
  clock.time += 1;
  assert.equal(admission.inspect(scope).state, 'ready');

  const changed = handoff(admission, scope);
  assert.deepEqual(admission.claim({ ...scope, revision_id: randomUUID() }, changed, eligible), { state: 'stale' });
  assert.equal(existsSync(file()), false, 'a handoff for an older revision is removed');
  const ineligible = handoff(admission, scope);
  assert.deepEqual(admission.claim(scope, ineligible, () => false), { state: 'stale' });
  assert.equal(existsSync(file()), false, 'a handoff whose Run is no longer eligible is removed');

  const finished = handoff(admission, scope);
  assert.deepEqual(admission.release(scope, randomUUID()), { state: 'pending' }, 'another attempt keeps the handoff');
  assert.deepEqual(admission.release(scope, finished), { state: 'ready' });
  assert.equal(existsSync(file()), false, 'a pickup with nothing to continue ends its handoff');
});

// SCN-011
test('a cancelled or stale reservation never earns a send permit and leaves no file', t => {
  const { scope, view, admission, file } = fixture(t);
  const cancelled = admission.reserve(scope, view, eligible);
  assert.deepEqual(admission.cancelReservation(scope, view, cancelled.attempt_id), { state: 'ready' });
  assert.equal(existsSync(file()), false);
  assert.deepEqual(admission.publish(scope, view, cancelled.attempt_id, eligible), { state: 'ready' });
  const stale = admission.reserve(scope, view, eligible);
  assert.notEqual(stale.attempt_id, cancelled.attempt_id);
  assert.deepEqual(admission.publish(scope, view, stale.attempt_id, () => false), { state: 'stale' });
  assert.equal(existsSync(file()), false);
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.deepEqual(admission.claim(scope, stale.attempt_id, eligible), { state: 'stale' });
});
