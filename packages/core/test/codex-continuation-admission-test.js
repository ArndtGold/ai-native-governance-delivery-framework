import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { createCodexContinuationAdmission } from '../lib/companion/codex-continuation.js';
import { observeCodexActivity } from '../lib/companion/codex-activity.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { pendingRunStepPath } from '../lib/control-state/run-step-pending.js';

const eligible = () => true;
const moduleUrl = new URL('../lib/companion/codex-continuation.js', import.meta.url).href;

function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-codex-continuation-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { target_id } = resolveControlCommandTarget(root);
  const scope = { root, target_id, run_id: 'fixture', revision_id: randomUUID(), operation_key: 'implementation.execute' };
  return { root, scope, view: randomUUID(), admission: createCodexContinuationAdmission(root) };
}

function competitor(root, scope, operation) {
  const code = `
    import { createCodexContinuationAdmission } from ${JSON.stringify(moduleUrl)};
    import { randomUUID } from 'node:crypto';
    const [root, scope, operation] = process.argv.slice(1);
    const admission = createCodexContinuationAdmission(root);
    const binding = JSON.parse(scope);
    process.stdout.write('ready\\n');
    for await (const ignored of process.stdin) {
      const view = randomUUID();
      const result = operation === 'claim' ? admission.claim(binding, {}, () => true) : admission.reserve(binding, view, () => true);
      if (result.reserved) result.publication = admission.publish(binding, view, result.attempt_id, () => true);
      process.stdout.write(JSON.stringify(result) + '\\n');
      break;
    }
  `;
  const processResult = spawn(process.execPath, ['--input-type=module', '-e', code, root, JSON.stringify(scope), operation],
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

test('a Run has one send permit across two processes and an unrelated Run remains free', { timeout: 10_000 }, async t => {
  const { root, scope, admission } = fixture(t);
  const first = competitor(root, scope, 'reserve'), second = competitor(root, scope, 'reserve');
  const results = Promise.all([first.result, second.result]);
  await Promise.all([first.started, second.started]);
  first.start(); second.start();
  const rows = await results;
  assert.equal(rows.filter(row => row.publication?.send).length, 1);
  assert.equal(rows.filter(row => row.reserved).length, 1);
  assert.equal(admission.inspect(scope).state, 'pending');
  assert.equal(admission.claim({ ...scope, run_id: 'independent' }, {}, eligible).admitted, true);
});

test('a chat continuation and a Companion action use one admission authority', { timeout: 10_000 }, async t => {
  const { root, scope } = fixture(t);
  const view = competitor(root, scope, 'reserve'), chat = competitor(root, scope, 'claim');
  const results = Promise.all([view.result, chat.result]);
  await Promise.all([view.started, chat.started]);
  view.start(); chat.start();
  const [inView, inChat] = await results;
  assert.equal(Number(Boolean(inView.publication?.send)) + Number(Boolean(inChat.admitted)), 1);
});

test('closing or reopening after a lost publication response preserves the same pending claim', t => {
  const { root, scope, view, admission } = fixture(t);
  const first = admission.reserve(scope, view, eligible);
  assert.equal(first.reserved, true);
  assert.equal(admission.publish(scope, view, first.attempt_id, eligible).send, true);
  const reopened = createCodexContinuationAdmission(root);
  for (const response of [reopened.inspect(scope), reopened.cancelReservation(scope, view, first.attempt_id),
    reopened.publish(scope, view, first.attempt_id, eligible), reopened.reserve(scope, randomUUID(), eligible),
    reopened.claim(scope, {}, eligible), reopened.claim(scope, { attemptId: randomUUID() }, eligible)]) {
    assert.deepEqual(response, { state: 'pending' });
  }
  const changed = { ...scope, revision_id: randomUUID(), operation_key: 'review.code' };
  assert.deepEqual(reopened.claim(changed, { attemptId: first.attempt_id }, eligible), { state: 'pending' });
  const claim = reopened.claim(scope, { attemptId: first.attempt_id }, eligible);
  assert.equal(claim.attempt_id, first.attempt_id);
  assert.deepEqual(reopened.claim(scope, { attemptId: first.attempt_id }, eligible), { state: 'running' });
  assert.equal(reopened.claim(changed, { owner: claim.owner }, eligible).attempt_id, first.attempt_id);
});

test('an action cancelled before publication or proven stale never earns a send permit', t => {
  const { scope, view, admission } = fixture(t);
  const cancelled = admission.reserve(scope, view, eligible);
  assert.deepEqual(admission.cancelReservation(scope, view, cancelled.attempt_id), { state: 'ready' });
  assert.equal(admission.publish(scope, view, cancelled.attempt_id, eligible).send, undefined);
  const stale = admission.reserve(scope, view, eligible);
  assert.notEqual(stale.attempt_id, cancelled.attempt_id);
  assert.deepEqual(admission.publish(scope, view, stale.attempt_id, () => false), { state: 'stale' });
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.equal(admission.claim(scope, { attemptId: stale.attempt_id }, eligible).admitted, undefined);
});

test('unreadable durable admission never becomes a new reservation', t => {
  const { root, scope, view, admission } = fixture(t);
  const original = admission.reserve(scope, view, eligible);
  assert.equal(original.reserved, true);
  const directory = join(root, 'codex-continuation');
  const record = join(directory, readdirSync(directory).find(name => name.endsWith('.json')));
  writeFileSync(record, 'incomplete-write');
  const restarted = createCodexContinuationAdmission(root);
  assert.equal(restarted.inspect(scope).state, 'unavailable');
  assert.equal(restarted.reserve(scope, randomUUID(), eligible).reserved, undefined);
  assert.equal(restarted.claim(scope, {}, eligible).admitted, undefined);
  assert.equal(readFileSync(record, 'utf8'), 'incomplete-write');
});

test('a matching native turn and a clean mutation check are required to settle work', t => {
  const { root, scope, admission } = fixture(t);
  const claim = admission.claim(scope, {}, eligible);
  const nativeTurn = { session_id: 'chat', turn_id: 'turn-1' };
  const hook = (event, fields = {}) => observeCodexActivity(root, { ...nativeTurn, hook_event_name: event, ...fields });
  const result = {
    authorizes: false, terminal: false, target: { governance_target: root },
    continuation: { run_id: scope.run_id, work_admission: { target_id: scope.target_id, run_id: scope.run_id, ...claim } },
  };
  const post = { tool_name: 'mcp__agdf__agdf_dispatch', tool_use_id: 'tool-1',
    tool_input: { continue_delivery: true, run_id: scope.run_id }, tool_response: { structuredContent: result } };
  hook('UserPromptSubmit');
  hook('PostToolUse', post);
  hook('Stop', { session_id: 'foreign-chat' });
  hook('Interrupt');
  const stopping = { state: 'running', interrupt_requested: true };
  assert.deepEqual(createCodexContinuationAdmission(root).inspect(scope), stopping);
  assert.deepEqual(admission.reserve(scope, randomUUID(), eligible), stopping);
  assert.deepEqual(admission.claim(scope, {}, eligible), stopping);
  assert.deepEqual(admission.claim({ ...scope, revision_id: randomUUID() }, { owner: claim.owner }, eligible), stopping);
  const pendingPath = pendingRunStepPath(root, scope.run_id);
  mkdirSync(dirname(pendingPath), { recursive: true });
  writeFileSync(pendingPath, '{}');
  hook('Stop');
  assert.deepEqual(admission.inspect(scope), stopping);
  rmSync(pendingPath);
  assert.equal(admission.inspect(scope).state, 'ready');
  const newAttempt = admission.claim(scope, {}, eligible);
  assert.notEqual(newAttempt.attempt_id, claim.attempt_id);
  hook('PostToolUse', post);
  hook('Stop');
  assert.equal(admission.inspect(scope).state, 'running');
});

for (const first of ['Stop', 'Interrupt']) test(first + ' before the tool result is matched to its actual claim', t => {
  const { root, scope, admission } = fixture(t);
  const claim = admission.claim(scope, {}, eligible);
  const identity = { session_id: 'chat', turn_id: 'turn' };
  observeCodexActivity(root, { ...identity, hook_event_name: 'UserPromptSubmit' }, 1000);
  observeCodexActivity(root, { ...identity, hook_event_name: first }, 1001);
  observeCodexActivity(root, { ...identity, hook_event_name: 'Interrupt' }, 1002);
  assert.equal(admission.inspect(scope).state, 'running');
  observeCodexActivity(root, { ...identity, hook_event_name: 'PostToolUse', tool_use_id: 'tool',
    tool_name: 'mcp__agdf__agdf_dispatch', tool_input: { continue_delivery: true, run_id: scope.run_id },
    tool_response: { structuredContent: { authorizes: false, terminal: false, target: { governance_target: root },
      continuation: { run_id: scope.run_id, work_admission: { target_id: scope.target_id, run_id: scope.run_id, ...claim } } } } }, 1003);
  if (first === 'Interrupt') {
    assert.deepEqual(admission.inspect(scope), { state: 'running', interrupt_requested: true });
    observeCodexActivity(root, { ...identity, hook_event_name: 'Stop' }, 1004);
  }
  assert.equal(admission.inspect(scope).state, 'ready');
});
