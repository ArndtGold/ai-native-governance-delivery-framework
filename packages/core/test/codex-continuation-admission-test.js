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

test('an unresolved predecessor executable blocks new work until its retention is released', t => {
  const { root, scope, view, admission } = fixture(t);
  const claims = join(root, 'mcp', 'generations', 'a'.repeat(64), '0.32.0', '.agdf-executable-claims');
  mkdirSync(claims, { recursive: true });
  const claim = join(claims, randomUUID() + '.json');
  writeFileSync(claim, '{}'); // Unknown retained executable: no assertion of PID liveness.
  const blocked = { state: 'unavailable', legacy_runtime: true };
  assert.deepEqual(admission.inspect(scope), blocked);
  assert.deepEqual(admission.reserve(scope, view, eligible), blocked);
  assert.deepEqual(admission.claim(scope, {}, eligible), blocked);
  rmSync(claim); // Simulated acknowledged release by the executable owner, never by admission.
  assert.equal(admission.inspect(scope).state, 'ready');
  assert.equal(admission.claim(scope, {}, eligible).admitted, true);
});

test('a predecessor appearing before publication or receipt cannot earn a send or work grant', t => {
  const { root, scope, view, admission } = fixture(t);
  const claims = join(root, 'mcp', 'generations', 'b'.repeat(64), '0.32.0', '.agdf-executable-claims');
  const claim = join(claims, randomUUID() + '.json');
  const retain = () => { mkdirSync(claims, { recursive: true }); writeFileSync(claim, '{}'); };
  const first = admission.reserve(scope, view, eligible);
  retain();
  assert.deepEqual(admission.publish(scope, view, first.attempt_id, eligible), { state: 'unavailable', legacy_runtime: true });
  rmSync(claim);
  assert.equal(admission.inspect(scope).state, 'ready', 'no send was issued');
  const second = admission.reserve(scope, view, eligible);
  assert.equal(admission.publish(scope, view, second.attempt_id, eligible).send, true);
  retain();
  assert.equal(admission.inspect(scope).state, 'pending', 'observation preserves an uncertain handoff');
  assert.deepEqual(admission.claim(scope, { attemptId: second.attempt_id }, eligible), { state: 'unavailable', legacy_runtime: true });
  rmSync(claim);
  assert.equal(admission.inspect(scope).state, 'ready', 'the exact receiver positively declined before work');
  assert.equal(admission.claim(scope, { attemptId: second.attempt_id }, eligible).admitted, undefined);
});

test('only the adapter-owned current runtime is exempt and unsafe claim directories stay protected', t => {
  const { root, scope, view } = fixture(t);
  const current = join(root, 'mcp', 'generations', 'c'.repeat(64), '0.32.0');
  mkdirSync(join(current, '.agdf-executable-claims'), { recursive: true });
  writeFileSync(join(current, '.agdf-executable-claims', randomUUID() + '.json'), '{}');
  const admission = createCodexContinuationAdmission(root, { runtimeRoot: current });
  assert.equal(admission.inspect(scope).state, 'ready');
  const other = join(root, 'mcp', 'generations', 'd'.repeat(64), '0.32.0');
  mkdirSync(other, { recursive: true });
  writeFileSync(join(other, '.agdf-executable-claims'), 'not a directory');
  assert.deepEqual(admission.reserve(scope, view, eligible), { state: 'unavailable', legacy_runtime: true });
  assert.equal(readFileSync(join(other, '.agdf-executable-claims'), 'utf8'), 'not a directory');
});

test('a matching native interrupt settles work without Stop after mutation checks clear', t => {
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
  hook('Interrupt', { turn_id: 'foreign-turn' });
  assert.equal(admission.inspect(scope).state, 'running');
  const pendingPath = pendingRunStepPath(root, scope.run_id);
  mkdirSync(dirname(pendingPath), { recursive: true });
  writeFileSync(pendingPath, '{}');
  hook('Interrupt');
  const stopping = { state: 'running', interrupt_requested: true };
  assert.deepEqual(createCodexContinuationAdmission(root).inspect(scope), stopping);
  assert.deepEqual(admission.reserve(scope, randomUUID(), eligible), stopping);
  assert.deepEqual(admission.claim(scope, {}, eligible), stopping);
  assert.deepEqual(admission.claim({ ...scope, revision_id: randomUUID() }, { owner: claim.owner }, eligible), stopping);
  assert.deepEqual(admission.inspect(scope), stopping);
  rmSync(pendingPath);
  assert.equal(admission.inspect(scope).state, 'ready');
  const newAttempt = admission.claim(scope, {}, eligible);
  assert.notEqual(newAttempt.attempt_id, claim.attempt_id);
  hook('PostToolUse', post);
  hook('Stop');
  assert.equal(admission.inspect(scope).state, 'running');
});

test('an accepted next native prompt retires only its own completed work and retains pending mutations', t => {
  const { root, scope, admission } = fixture(t);
  const first = admission.claim(scope, {}, eligible);
  const turn = { session: 'same-chat', id: 'old-turn' };
  admission.associateTurn(scope, first.attempt_id, first.owner, turn);
  const prompt = (session, id, now) => observeCodexActivity(root,
    { session_id: session, turn_id: id, hook_event_name: 'UserPromptSubmit' }, now);
  prompt(turn.session, turn.id, 1000);
  prompt('other-chat', 'next-turn', 1001);
  assert.equal(admission.inspect(scope).state, 'running');
  observeCodexActivity(root, { session_id: turn.session, hook_event_name: 'SessionStart' }, 1002);
  assert.equal(admission.inspect(scope).state, 'running', 'compaction is not a terminal signal');
  const pending = pendingRunStepPath(root, scope.run_id);
  mkdirSync(dirname(pending), { recursive: true }); writeFileSync(pending, '{}');
  prompt(turn.session, 'next-turn', 1003);
  assert.equal(admission.inspect(scope).state, 'running', 'unfinished writes retain the original claim');
  rmSync(pending);
  assert.equal(admission.inspect(scope).state, 'ready');
  const second = admission.claim(scope, {}, eligible);
  admission.associateTurn(scope, second.attempt_id, second.owner, { session: turn.session, id: 'next-turn' });
  prompt(turn.session, turn.id, 1004);
  prompt(turn.session, 'next-turn', 1005);
  assert.equal(admission.inspect(scope).state, 'running', 'retired and duplicate prompts cannot release the successor');
});

test('a quarantined activity store cannot retire durable work on a prompt', t => {
  const { root, scope, admission } = fixture(t);
  const first = admission.claim(scope, {}, eligible);
  admission.associateTurn(scope, first.attempt_id, first.owner, { session: 'chat', id: 'old' });
  mkdirSync(join(root, 'companion'), { recursive: true });
  writeFileSync(join(root, 'companion/codex-activity.json'), 'broken');
  observeCodexActivity(root, { session_id: 'chat', turn_id: 'new', hook_event_name: 'UserPromptSubmit' }, 1000);
  assert.equal(admission.inspect(scope).state, 'running');
});

test('a delayed claim result recovers a prior accepted native prompt retirement', t => {
  const { root, scope, admission } = fixture(t);
  const first = admission.claim(scope, {}, eligible);
  observeCodexActivity(root, { session_id: 'chat', turn_id: 'old', hook_event_name: 'UserPromptSubmit' }, 1000);
  observeCodexActivity(root, { session_id: 'chat', turn_id: 'new', hook_event_name: 'UserPromptSubmit' }, 1001);
  assert.equal(admission.inspect(scope).state, 'running', 'the receiving turn is not yet correlated');
  observeCodexActivity(root, { session_id: 'chat', turn_id: 'old', hook_event_name: 'PostToolUse', tool_use_id: 'late-tool',
    tool_name: 'mcp__agdf__agdf_dispatch', tool_input: { continue_delivery: true, run_id: scope.run_id },
    tool_response: { structuredContent: { authorizes: false, terminal: false, target: { governance_target: root },
      continuation: { run_id: scope.run_id, work_admission: { target_id: scope.target_id, run_id: scope.run_id, ...first } } } } }, 1002);
  assert.equal(admission.inspect(scope).state, 'ready');
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
  assert.equal(admission.inspect(scope).state, 'ready');
});

test('an interrupt-only record from the preceding build releases after its mutation check clears', t => {
  const { root, scope, admission } = fixture(t);
  const claim = admission.claim(scope, {}, eligible);
  admission.associateTurn(scope, claim.attempt_id, claim.owner, { session: 'legacy-chat', id: 'legacy-turn' });
  const directory = join(root, 'codex-continuation');
  const recordPath = join(directory, readdirSync(directory).find(name => name.endsWith('.json')));
  const record = JSON.parse(readFileSync(recordPath, 'utf8'));
  writeFileSync(recordPath, JSON.stringify({ ...record, interrupt_requested: true }));
  const pendingPath = pendingRunStepPath(root, scope.run_id);
  mkdirSync(dirname(pendingPath), { recursive: true });
  writeFileSync(pendingPath, '{}');
  const restarted = createCodexContinuationAdmission(root);
  assert.deepEqual(restarted.inspect(scope), { state: 'running', interrupt_requested: true });
  assert.equal(restarted.reserve(scope, randomUUID(), eligible).reserved, undefined);
  rmSync(pendingPath);
  assert.equal(restarted.inspect(scope).state, 'ready');
  assert.equal(restarted.claim(scope, { owner: claim.owner }, eligible).admitted, undefined);
  assert.equal(restarted.reserve(scope, randomUUID(), eligible).reserved, true);
});
