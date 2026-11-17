import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activityLifetime, activityRecordLimit, isActivityId, quarantineActivity, renewActivity, workBinding, updateActivity, selectActivity } from '../../../plugins/agdf/host-templates/claude/companion/activity.mjs';

const target = '/repo';
const run = 'run-a.with-dots';
const revision = '04fed55f-a7a2-49dd-9014-a5da27b0a7d3';
const scope = { target_id: target, run_id: run, revision_id: revision, gate: 'Brownfield Review' };
const request = { continue_delivery: true, primary_target: target, run_id: run };
const result = {
  outcome: 'skill_continuation', terminal: false, authorizes: false,
  target: { resolution_state: 'resolved', governance_target: target },
  continuation: { governance_target: target, phase: 'post_ur_review', run_id: run, revision_id: revision },
  control: { current_gate: scope.gate, next_operation: { actor: 'agent' } },
};
const clock = 1_000_000;
const work = { kind: 'work', session: 'session-a', turn: 'turn-a', tool: 'tool-a', binding: scope };
const apply = (records, event, elapsed = 0) => updateActivity(records, event, clock + elapsed);
const selected = (records, binding = scope, elapsed = 0) => selectActivity(records, binding, clock + elapsed);
const phase = (name, gate, extra = {}) => ({ ...result, continuation: { ...result.continuation, phase: name, ...extra },
  control: { ...result.control, current_gate: gate } });

test('work requires a matching current continuation for the agent', () => {
  assert.deepEqual(workBinding(request, result), scope);
  for (const [input, response] of [
    [{ ...request, continue_delivery: false }, result],
    [{ ...request, run_id: 'another' }, result],
    [request, { ...result, authorizes: true }],
    [request, { ...result, terminal: true }],
    [request, { ...result, continuation: { ...result.continuation, revision_id: [] } }],
    [request, { ...result, control: { ...result.control, next_operation: { actor: 'human' } } }],
    [request, { ...result, control: { ...result.control, current_gate: 'PRD' } }],
    [request, { ...result, target: { ...result.target, governance_target: '/another' } }],
    [request, phase('tp_clarification', 'TP')],
    [request, phase('required_gate_artifact', 'QA', { gate: 'CR' })],
  ]) assert.equal(workBinding(input, response), null);
});

test('the target is Core resolution, whatever spelling the request used', () => {
  for (const primary_target of ['/repo/', '/repo/./', '/linked-repo', 'C:/repo', undefined]) {
    assert.deepEqual(workBinding({ ...request, primary_target }, result), scope, String(primary_target));
  }
});

test('every agent work phase binds the gate Core emits it for', () => {
  for (const [name, gate, extra] of [
    ['post_ur_review', 'Mode/Slice Decision'], ['pre_implementation_analysis', 'Brownfield Analysis'],
    ['prd_definition', 'PRD'], ['sd_definition', 'SD'], ['tp_definition', 'TP'], ['implementation', 'CD+Tests'],
    ['compact_implementation', 'Quick Task Execution'], ['compact_implementation', 'Verified Change Execution'],
    ['verified_change_record', 'Verified Change Execution'], ['compact_closeout', 'Quick Task Execution'], ['compact_closeout', 'OR'],
    ['required_gate_artifact', 'CR', { gate: 'CR' }], ['required_gate_artifact', 'QA'], ['post_uat_closeout', 'OR'],
  ]) assert.deepEqual(workBinding(request, phase(name, gate, extra)), { ...scope, gate }, `${name} at ${gate}`);
  assert.equal(workBinding(request, phase('implementation', 'TP')), null, 'a phase never binds another gate');
});

test('host IDs are ASCII only', () => {
  assert.equal(isActivityId('toolu_01AbC-9'), true);
  for (const value of ['\u212A'.repeat(4), 'ſession', 'a'.repeat(129), '', 'a b']) assert.equal(isActivityId(value), false, value);
});

test('only the exact selected scope shows fresh, unambiguous work', () => {
  const records = apply([], work);
  assert.ok(selected(records));
  for (const field of Object.keys(scope)) assert.equal(selected(records, { ...scope, [field]: 'another' }), null, field);
  assert.equal(apply(records, work, 1000), null, 'a duplicate does not renew the activity');
  assert.ok(selected(records, scope, activityLifetime - 1));
  assert.equal(selected(records, scope, activityLifetime), null);
  const renewed = apply(records, { ...work, tool: 'tool-b' }, activityLifetime);
  assert.ok(selected(renewed, scope, activityLifetime + 1));
  assert.equal(selected(apply(renewed, { ...work, turn: 'turn-b' }, activityLifetime), scope, activityLifetime), null);
  assert.equal(selected(apply(renewed, { ...work, kind: 'lost', tool: 'tool-c' }, activityLifetime), scope, activityLifetime), null);
});

test('a running host turn renews only its own live work', () => {
  const records = apply(apply([], work), { ...work, turn: 'turn-b', binding: { ...scope, run_id: 'run-b' } });
  const renew = (value, elapsed) => renewActivity(value, work, clock + elapsed);
  const renewed = renew(records, activityLifetime - 1);
  assert.ok(selected(renewed, scope, 2 * activityLifetime - 2), 'renewed work outlives its first lifetime');
  assert.equal(selected(renewed, { ...scope, run_id: 'run-b' }, activityLifetime), null, 'another turn is not renewed');
  assert.equal(renew(records, activityLifetime), null, 'expired work stays expired');
  assert.equal(renew(apply(records, { ...work, kind: 'ended' }, 1), 2), null, 'a retired turn stays retired');
  assert.equal(renew(apply(records, { ...work, kind: 'lost', tool: 'tool-b' }, 1), 2), null, 'lost work stays lost');
});

for (const kind of ['ended', 'interrupted']) {
  test(`${kind} retires its exact turn, including a result received later`, () => {
    const terminal = { ...work, kind };
    const afterWork = apply(apply([], work), terminal, 1);
    const beforeWork = apply([], terminal);
    assert.equal(selected(afterWork, scope, 2), null);
    assert.equal(apply(afterWork, work, 2), null);
    assert.equal(apply(beforeWork, work, 2), null);
    const newer = apply(afterWork, { ...work, turn: 'turn-b' }, 3);
    assert.equal(selected(apply(newer, terminal, 4), scope, 4)?.turn, 'turn-b');
    assert.equal(apply(newer, { ...work, tool: 'not valid' }, 5), null);
  });
}

test('an overflowing observation window clears work and cannot revive a dropped turn', () => {
  let records = [];
  for (let index = 0; index <= activityRecordLimit; index++) {
    records = apply(records, { ...work, turn: `turn-${index}`, kind: 'ended' });
  }
  assert.deepEqual(records, quarantineActivity(clock));
  assert.equal(selected(records), null);
  assert.equal(apply(records, work, 1), null);
});
