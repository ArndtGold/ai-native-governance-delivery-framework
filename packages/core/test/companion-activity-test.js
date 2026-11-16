import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activityLifetime, activityRecordLimit, workBinding, updateActivity, selectActivity } from '../../../plugins/agdf/host-templates/claude/companion/activity.mjs';

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

test('work requires a matching current continuation for the agent', () => {
  assert.deepEqual(workBinding(request, result), scope);
  for (const [input, response] of [
    [{ ...request, continue_delivery: false }, result],
    [{ ...request, primary_target: '/another' }, result],
    [{ ...request, run_id: 'another' }, result],
    [request, { ...result, authorizes: true }],
    [request, { ...result, terminal: true }],
    [request, { ...result, continuation: { ...result.continuation, revision_id: [] } }],
    [request, { ...result, control: { ...result.control, next_operation: { actor: 'human' } } }],
    [request, { ...result, control: { ...result.control, current_gate: 'PRD' } }],
  ]) assert.equal(workBinding(input, response), null);
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
  assert.equal(selected(records), null);
  assert.equal(apply(records, work, 1), null);
});
