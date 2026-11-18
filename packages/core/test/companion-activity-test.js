import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activityLifetime, activityRecordLimit, agdfDispatchToolPattern, codexTurnBound, isActivityId, isAgdfDispatchTool, matchesActivity,
  plannedWorkBinding, quarantineActivity, renewActivity, retireTurns, workBinding, updateActivity, selectActivity } from '../lib/companion/activity.js';

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
  for (const field of ['target_id', 'run_id', 'gate']) assert.equal(selected(records, { ...scope, [field]: 'another' }), null, field);
  // SCN-007 (SDD-001): the same turn records new revisions of its own work; the revision is not compared.
  assert.ok(selected(records, { ...scope, revision_id: 'cbe2cf4c-3a9b-4f2e-9c1d-1a2b3c4d5e6f' }), 'a later revision of the same step keeps work');
  assert.ok(selected(records, { target_id: target, run_id: run, gate: scope.gate }), 'a scope without a revision still matches');
  assert.equal(selected(records, { target_id: target, plan_id: run, gate: scope.gate }), null, 'Run work never matches a planning entry');
  assert.equal(apply(records, work, 1000), null, 'a duplicate does not renew the activity');
  assert.ok(selected(records, scope, activityLifetime - 1));
  assert.equal(selected(records, scope, activityLifetime), null);
  const renewed = apply(records, { ...work, tool: 'tool-b' }, activityLifetime);
  assert.ok(selected(renewed, scope, activityLifetime + 1));
  // Several turns on the same step show work; the one that lasts longest is shown (CR finding: an abandoned
  // turn must not hide the work of the turn that runs now).
  const both = apply(renewed, { ...work, session: 'session-b', turn: 'turn-b', binding: scope }, activityLifetime + 1);
  assert.equal(selected(both, scope, activityLifetime + 2)?.session, 'session-b');
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

// SCN-001 and SCN-002 (SDD-002): a host without its own renewal leases work for the whole turn, up to the bound.
test('a turn lease lasts until its bound and no record may claim more', () => {
  const lease = { lifetime: codexTurnBound };
  const records = updateActivity([], work, clock, lease);
  assert.ok(selected(records, scope, 45_000), 'work outlives the 30 s lease of a renewing host');
  assert.ok(selected(records, scope, codexTurnBound - 1));
  assert.equal(selected(records, scope, codexTurnBound), null, 'the bound ends abandoned work');
  const renewed = updateActivity(records, { ...work, tool: 'tool-b' }, clock + 50 * 60_000, lease);
  assert.ok(selected(renewed, scope, 50 * 60_000 + codexTurnBound - 1), 'a later dispatch of the turn renews the bound');
  assert.equal(selected(renewed, scope, 50 * 60_000 + codexTurnBound), null);
  for (const lifetime of [0, -1, 1.5, codexTurnBound + 1, '30000']) {
    assert.equal(updateActivity([], work, clock, { lifetime }), null, String(lifetime));
    assert.equal(renewActivity(records, work, clock + 1, { lifetime }), null, String(lifetime));
  }
  const forged = [{ ...records[0], expires_at: clock + codexTurnBound + 1 }];
  assert.equal(selected(forged), null, 'an expiry beyond the bound is not trusted');
  assert.equal(records[0].until >= records[0].expires_at, true, 'the row is kept as long as its work lasts');
});

// SCN-009 (SDD-006): the tool list is a sliding window, so a late hand-off always ends work.
test('a hand-off after many results still ends work, and recent duplicates are ignored', () => {
  let records = [];
  for (let index = 0; index < 13; index++) records = apply(records, { ...work, tool: `tool-${index}` }, index);
  assert.ok(selected(records, scope, 13), 'the thirteenth dispatch is recorded');
  assert.equal(records[0].tools.length, 12);
  assert.equal(apply(records, { ...work, tool: 'tool-12' }, 14), null, 'a duplicate inside the window is ignored');
  const handedOff = apply(records, { ...work, kind: 'lost', tool: 'hand-off' }, 15);
  assert.ok(handedOff, 'the hand-off is not refused');
  assert.equal(selected(handedOff, scope, 16), null);
});

// SCN-002 (SDD-003): a new prompt retires every earlier unfinished turn of its session only.
test('a new prompt retires earlier turns of its own session', () => {
  const other = { ...work, session: 'session-b', turn: 'turn-x', tool: 'tool-x', binding: { ...scope, run_id: 'run-b' } };
  const records = apply(apply([], work), other);
  assert.equal(retireTurns(records, { session: 'session-c', turn: 'turn-z' }, clock + 1), null, 'another session retires nothing');
  assert.equal(retireTurns(records, { session: 'session-a', turn: 'turn-a' }, clock + 1), null, 'a prompt of the same turn retires nothing');
  const retired = retireTurns(records, { session: 'session-a', turn: 'turn-b' }, clock + 1);
  assert.equal(selected(retired, scope, 2), null);
  assert.ok(selected(retired, { ...scope, run_id: 'run-b' }, 2), 'the other session keeps its work');
  assert.equal(apply(retired, { ...work, tool: 'late' }, 3), null, 'a late result cannot revive a retired turn');
  assert.ok(selected(apply(retired, { ...work, turn: 'turn-b', tool: 'new' }, 3), scope, 4), 'the new turn is judged on its own');
  assert.equal(retireTurns(quarantineActivity(clock), { session: 'session-a', turn: 'turn-b' }, clock + 1), null);
  assert.equal(retireTurns(records, { session: 'not valid', turn: 'turn-b' }, clock + 1), null);
});

// SCN-010 (SDD-010): drafting binds exactly the requested planning entry.
test('planned-UR authoring binds only its own planning entry', () => {
  const plan = 'plan-1a2b3c4d';
  const planning = { planning: { plan_id: plan, expected_digest: null } };
  const planned = {
    outcome: 'skill_continuation', terminal: false, authorizes: false,
    target: { resolution_state: 'resolved', governance_target: target },
    control: { scope: 'planning', current_gate: null },
    continuation: { phase: 'planned_ur_definition', governance_target: target, planning: planning.planning },
  };
  const binding = plannedWorkBinding(planning, planned);
  assert.deepEqual(binding, { target_id: target, plan_id: plan, gate: 'UR' });
  for (const [input, response] of [
    [{ planning: { plan_id: 'plan-other', expected_digest: null } }, planned],
    [{}, planned],
    [planning, { ...planned, terminal: true }],
    [planning, { ...planned, authorizes: true }],
    [planning, { ...planned, continuation: { ...planned.continuation, phase: 'ur_definition' } }],
    [planning, { ...planned, target: { ...planned.target, governance_target: '/another' } }],
  ]) assert.equal(plannedWorkBinding(input, response), null);
  const records = apply([], { ...work, binding });
  const planScope = { target_id: target, plan_id: plan, gate: 'UR' };
  assert.ok(selected(records, planScope));
  assert.equal(selected(records, { ...planScope, plan_id: 'plan-other' }), null);
  assert.equal(selected(records, { target_id: target, run_id: plan, gate: 'UR' }), null, 'planning work never matches a Run');
  assert.equal(matchesActivity(records[0], { target_id: target, gate: 'UR' }, clock), false, 'a scope needs a Run or planning entry');
});

// SCN-006 (SDD-005): the dispatch tool rule accepts every server name, never another tool.
test('the AGDF dispatch tool is recognised under any MCP server name', () => {
  assert.equal(agdfDispatchToolPattern, '^mcp__[A-Za-z0-9_-]+__agdf_dispatch$');
  for (const name of ['mcp__agdf__agdf_dispatch', 'mcp__plugin_agdf_agdf__agdf_dispatch', 'mcp__agdf-local__agdf_dispatch']) {
    assert.equal(isAgdfDispatchTool(name), true, name);
  }
  for (const name of ['agdf_dispatch', 'mcp__agdf__agdf_dispatch_extra', 'mcp__agdf__agdf_record', 'mcp____agdf_dispatch',
    'mcp__a b__agdf_dispatch', 'xmcp__agdf__agdf_dispatch', undefined, 7]) assert.equal(isAgdfDispatchTool(name), false, String(name));
});
