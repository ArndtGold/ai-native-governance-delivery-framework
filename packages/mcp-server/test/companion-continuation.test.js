import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createMcpCockpitRuntime, createMcpDispatchRuntime, inspectMcpDispatcherRuntime } from '../../cli/lib/mcp-dispatch-runtime.js';
import { approvalFixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { observeCodexActivity } from '../../core/lib/companion/codex-activity.js';
import { createCodexContinuationAdmission } from '../../core/lib/companion/codex-continuation.js';
import { CODEX_CONTINUATION_OBSERVATIONS, inspectCodexContinuationQualification } from '../../core/lib/runtime/plugin-provenance.js';

const runId = 'fixture-a';
const refusal = /This Companion handoff was already used, has expired or the Run has changed\./;

function dataRoot(t) {
  const path = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-continuation-mcp-')));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

// The real dispatch and Cockpit runtimes of one qualified Codex server over a shared Companion data root.
async function companion(t, f) {
  const root = dataRoot(t);
  const options = { surface: 'codex', companionDataRoot: root, continuationQualified: true };
  const dispatch = createMcpDispatchRuntime(options);
  const cockpit = await createMcpCockpitRuntime({ ...options, cockpitMode: 'plugin' });
  t.after(async () => { await cockpit.close(); await dispatch.close(); f.close(); });
  const target = { working_directory: f.root, primary_target: f.root, target_source: 'explicit_target' };
  const rendered = await cockpit.tools.find(tool => tool.name === 'agdf_cockpit').execute({ ...target, run_id: runId });
  const session_id = rendered._meta.agdf_cockpit.session_id;
  assert.equal(rendered._meta.agdf_cockpit.continuation, true);
  const read = cockpit.tools.find(tool => tool.name === 'agdf_cockpit_read');
  const action = cockpit.tools.find(tool => tool.name === 'agdf_cockpit_continue');
  const snapshot = await read.execute({ session_id, operation: 'snapshot', run_id: runId });
  assert.equal(snapshot.state, 'available');
  const binding = { session_id, snapshot_id: snapshot.snapshot_id, revision_id: f.revision(), run_id: runId };
  const gate = dispatch.tool('agdf_dispatch');
  return {
    root, snapshot, binding,
    display: () => read.execute({ session_id, operation: 'display_ack', snapshot_id: snapshot.snapshot_id }),
    act: (operation, fields) => action.execute(action.parse({ ...binding, operation, ...fields })),
    dispatch: fields => gate.execute(gate.parse({ ...target, presentation_language: 'en', skill_id: 'gate-check',
      continue_delivery: true, run_id: runId, ...fields })),
    start(act) {
      const reserved = act('reserve');
      assert.equal(reserved.reserved, true, JSON.stringify(reserved));
      assert.equal(act('publish', { attempt_id: reserved.attempt_id }).send, true);
      return reserved;
    },
  };
}

function withoutOwner(result) {
  assert.equal(result.continuation?.work_admission, undefined);
  assert.equal(result.continuation?.resume_call?.arguments.continuation_owner, undefined);
}

// SCN-013
test('qualification matches candidate bytes and requires the native ordinary-continuation evidence', t => {
  const root = dataRoot(t);
  const path = 'qualification/fixture.json', evidence = '{"kind":"fixture"}';
  mkdirSync(join(root, 'qualification'));
  writeFileSync(join(root, path), evidence);
  const digest = createHash('sha256').update(evidence).digest('hex');
  const candidate = { server_digest: '1'.repeat(64), dispatcher_digest: '2'.repeat(64), sdk_digest: '3'.repeat(64) };
  const qualification = { schema_version: 1, surface: 'codex', result: 'qualified', assurance: 'cooperative_local', authorizes: false,
    host: { name: 'test fixture', version: '1', os: process.platform, arch: process.arch },
    candidate, observations: [...CODEX_CONTINUATION_OBSERVATIONS], evidence: [{ path, digest }] };
  const check = (record, expected = candidate) => inspectCodexContinuationQualification(root, record, expected);
  assert.ok(CODEX_CONTINUATION_OBSERVATIONS.includes('running_from_activity'));
  assert.ok(!CODEX_CONTINUATION_OBSERVATIONS.includes('competing_normal_continuation'));
  assert.equal(check(null).qualified, false);
  assert.equal(check(qualification).qualified, true);
  assert.equal(check(qualification, { ...candidate, dispatcher_digest: '4'.repeat(64) }).reason, 'qualification_candidate_mismatch');
  assert.equal(check({ ...qualification, observations: qualification.observations.filter(row => row !== 'ordinary_continuation_unblocked') }).reason,
    'qualification_observations_incomplete');
  writeFileSync(join(root, path), 'changed');
  assert.equal(check(qualification).reason, 'qualification_evidence_digest_mismatch');
});

// SCN-006, SCN-009, SCN-012
test('the approval handoff is picked up once, opens only the decision and carries no owner', async t => {
  const f = await approvalFixture();
  const c = await companion(t, f);
  assert.equal(c.act('reserve').state, 'stale', 'action requires a displayed snapshot');
  assert.equal(c.act('status').state, 'unavailable', 'a pending display acknowledgement is retryable');
  assert.equal(c.act('status', { revision_id: randomUUID() }).state, 'stale', 'foreign bindings remain stale');
  await c.display();
  assert.equal(c.act('status').state, 'ready', 'display acknowledgement makes the same binding usable');
  assert.equal(c.act('reserve', { revision_id: randomUUID() }).state, 'stale');
  const approval = c.start(c.act);
  assert.equal(approval.operation_key, 'approval.record');
  const before = treeBytes(f.root);
  const decision = c.dispatch({ continuation_attempt_id: approval.attempt_id });
  assert.equal(decision.continuation?.phase, 'presentation_required',
    JSON.stringify({ diagnostics: decision.diagnostics, text: decision.host_action?.text, control: decision.control }));
  assert.equal(decision.continuation.next_calls[0].tool, 'agdf_prepare');
  withoutOwner(decision);
  assert.deepEqual(treeBytes(f.root), before, 'opening the decision does not record approval');
  assert.equal(c.act('status').state, 'running', 'a picked-up handoff is shown as running');
  const repeated = c.dispatch({ continuation_attempt_id: approval.attempt_id });
  assert.equal(repeated.terminal, true);
  assert.match(repeated.host_action.text, refusal);
  assert.match(c.dispatch({ continuation_attempt_id: randomUUID() }).host_action.text, refusal);

  // A pickup with nothing to continue ends its handoff at once instead of leaving it pending.
  const store = createCodexContinuationAdmission(c.root);
  const ghost = { target_id: c.snapshot.target.target_id, run_id: 'ghost-run', revision_id: randomUUID(), operation_key: 'implementation.execute' };
  const view = randomUUID(), reserved = store.reserve(ghost, view, () => true);
  assert.equal(store.publish(ghost, view, reserved.attempt_id, () => true).send, true);
  const finished = c.dispatch({ run_id: 'ghost-run', continuation_attempt_id: reserved.attempt_id });
  assert.equal(finished.terminal, true, JSON.stringify(finished.host_action));
  assert.equal(store.inspect(ghost).state, 'ready');
});

// SCN-007, SCN-008, SCN-009
test('ordinary continuations are never refused and running work comes from the activity lease', async t => {
  const f = await approvalFixture();
  const before = f.revision();
  assert.equal(f.approve().outcome, 'accepted');
  const c = await companion(t, f);
  await c.display();
  const continues = (result, label) => {
    assert.equal(result.terminal, false, label + ': ' + result.host_action?.text);
    assert.ok(result.continuation, label);
    withoutOwner(result);
    return result;
  };
  const handoff = c.start(c.act);
  continues(c.dispatch({}), 'while a handoff is pending');
  assert.equal(c.act('status').state, 'pending', 'an ordinary continuation leaves the handoff untouched');
  continues(c.dispatch({ continuation_attempt_id: handoff.attempt_id }), 'the pickup');
  continues(c.dispatch({}), 'after the pickup');
  const records = join(c.root, 'codex-continuation');
  const [file] = readdirSync(records).filter(name => name.endsWith('.json'));
  writeFileSync(join(records, file), 'unreadable');
  assert.equal(c.act('status').state, 'unavailable');
  const ordinary = continues(c.dispatch({}), 'with an unreadable record');
  rmSync(join(records, file));
  assert.equal(c.act('status').state, 'ready');

  const turn = { session_id: 'fixture-chat', turn_id: 'fixture-turn' };
  assert.equal(observeCodexActivity(c.root, { ...turn, hook_event_name: 'UserPromptSubmit' }), true);
  assert.equal(observeCodexActivity(c.root, { ...turn, hook_event_name: 'PostToolUse', tool_use_id: 'fixture-tool',
    tool_name: 'mcp__agdf__agdf_dispatch', tool_input: { continue_delivery: true, run_id: runId },
    tool_response: { structuredContent: ordinary } }), true);
  assert.equal(c.act('status').state, 'running');
  assert.deepEqual(c.act('reserve'), { schema_version: '1', authorizes: false, state: 'running' });
  assert.equal(existsSync(join(records, file)), false, 'no reservation while Codex works');
  continues(c.dispatch({}), 'while Codex works');
  assert.equal(observeCodexActivity(c.root, { ...turn, hook_event_name: 'Stop' }), true);
  assert.equal(c.act('status').state, 'ready');
  assert.equal(c.act('reserve').reserved, true);
  // A reservation of this view that the store no longer holds never leaves the card stuck.
  rmSync(join(records, file));
  assert.equal(c.act('reserve').reserved, true, 'an ended own reservation does not block a new one');

  const stale = f.context.call('approval.record', { gate: 'UR', presentation_id: f.presentationId, response: 'Approval: UR' },
    { run_id: runId, expected_revision_id: before });
  assert.notEqual(stale.outcome, 'accepted', 'a write against an outdated revision is still rejected');
});

test('missing ownership or generation identity keeps continuation unavailable', async t => {
  for (const observation of [
    { provenanceStatus: 'unowned', generationIdentity: { server_digest: '1'.repeat(64) } },
    { provenanceStatus: 'matched', generationIdentity: null },
  ]) {
    const inspected = { ...inspectMcpDispatcherRuntime(), ...observation, continuationQualified: false };
    const runtime = await createMcpCockpitRuntime({ surface: 'codex', cockpitMode: 'plugin', companionDataRoot: dataRoot(t), inspected });
    t.after(() => runtime.close());
    assert.equal(runtime.tools.some(tool => tool.name === 'agdf_cockpit_continue'), false);
  }
});

test('an unresolved predecessor blocks a Companion start but never an ordinary continuation', async t => {
  const f = await approvalFixture();
  assert.equal(f.approve().outcome, 'accepted');
  const c = await companion(t, f);
  await c.display();
  const claims = join(c.root, 'mcp', 'generations', 'a'.repeat(64), '0.32.0', '.agdf-executable-claims');
  mkdirSync(claims, { recursive: true });
  const path = join(claims, randomUUID() + '.json');
  writeFileSync(path, '{}');
  assert.equal(c.act('status').legacy_runtime, true);
  assert.equal(c.act('reserve').reserved, undefined);
  const ordinary = c.dispatch({});
  assert.equal(ordinary.terminal, false, ordinary.host_action?.text);
  assert.ok(ordinary.continuation);
  rmSync(path); // Fixture simulation of the retention owner's confirmed release.
  assert.equal(c.act('status').state, 'ready');
  assert.equal(c.act('reserve').reserved, true);
});
