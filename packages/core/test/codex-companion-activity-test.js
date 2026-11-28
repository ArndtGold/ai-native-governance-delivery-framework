import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { agdfDispatchToolPattern, codexTurnBound } from '../lib/companion/activity.js';
import { CODEX_HOOK_PROFILE, observeCodexActivity, readCodexObservation } from '../lib/companion/codex-activity.js';
import { DISPATCH_TOOL_MATCHER, codexCompanionHooks } from '../../../plugins/agdf/scripts/codex-companion-hooks.mjs';

const HOUR = codexTurnBound;
const DAY = 24 * 60 * 60_000;

function fixture(t, run_id = 'run-a') {
  const root = mkdtempSync(join(tmpdir(), 'codex-activity-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const revision_id = randomUUID();
  const gate = 'Brownfield Review';
  const { target_id } = resolveControlCommandTarget(root);
  const binding = { target_id, run_id, revision_id, gate };
  const common = { session_id: 'chat-1', turn_id: 'turn-1' };
  const post = { ...common, hook_event_name: 'PostToolUse', tool_use_id: 'tool-1', tool_name: 'mcp__agdf__agdf_dispatch',
    tool_input: { continue_delivery: true, run_id }, tool_response: { structuredContent: {
      outcome: 'skill_continuation', authorizes: false, terminal: false,
      control: { current_gate: gate, next_operation: { actor: 'agent' } },
      target: { resolution_state: 'resolved', governance_target: root },
      continuation: { phase: 'post_ur_review', governance_target: root, run_id, revision_id },
    } } };
  const activity = (binding_, now) => readCodexObservation(root, binding_, now).activity;
  return { root, run_id, binding, gate, common, post, activity };
}

// SCN-001 (SDD-002): work lasts until the turn ends, beyond the 30 s lease of a renewing host.
test('Codex work is scoped and lasts until its turn ends', t => {
  const { root, run_id, binding, gate, common, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, { ...post, tool_input: { run_id } }, 1000), false);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  assert.deepEqual(activity(binding, 1001), { gate, expires_at: 1000 + HOUR });
  assert.equal(observeCodexActivity(root, post, 2000), false, 'a duplicate result changes nothing');
  for (const other of [{ run_id: 'run-b' }, { target_id: 'foreign' }, { gate: 'PRD' }]) {
    assert.equal(activity({ ...binding, ...other }, 2000), null, JSON.stringify(other));
  }
  // SCN-007 (SDD-001): a revision recorded later in the same turn keeps its work visible.
  assert.deepEqual(activity({ ...binding, revision_id: randomUUID() }, 2000), { gate, expires_at: 1000 + HOUR });
  assert.ok(activity(binding, 46_000), 'work still shows after 45 s');
  assert.ok(activity(binding, 1000 + 59 * 60_000), 'and after 59 minutes');
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: 'Stop' }, 60_000), true);
  assert.equal(activity(binding, 60_001), null, 'the turn end clears work');
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'late' }, 60_002), false, 'a late result cannot revive it');
});

for (const ending of ['Stop', 'Interrupt']) test(`a phase-less Code Review is live until ${ending} and late results cannot revive it`, t => {
  const { root, binding, common, post, activity } = fixture(t);
  const gate = 'CR', skill_id = 'code-review';
  const review = { ...post, tool_response: { structuredContent: {
    ...post.tool_response.structuredContent,
    skill: { skill_id, dispatch_mode: 'judgement_required' },
    control: { current_gate: gate, next_operation: { actor: 'agent', gate, skill_id } },
    continuation: { governance_target: root, run_id: binding.run_id, revision_id: binding.revision_id, skill_id },
  } } };
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: 'UserPromptSubmit' }, 1000), true);
  assert.equal(observeCodexActivity(root, review, 1001), true);
  assert.deepEqual(activity({ ...binding, gate }, 1002), { gate, expires_at: 1001 + HOUR });
  assert.equal(activity(binding, 1002), null, 'work never attaches to another gate');
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: ending }, 2000), true);
  assert.equal(activity({ ...binding, gate }, 2001), null);
  assert.equal(observeCodexActivity(root, { ...review, tool_use_id: 'late-review' }, 2002), false);
  assert.equal(activity({ ...binding, gate }, 2003), null);
});

test('the hard bound ends abandoned work, and a later dispatch of the turn renews it', t => {
  const { root, binding, common, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  assert.equal(activity(binding, 1000 + HOUR), null, 'without Stop, work ends at the bound');
  assert.equal(observeCodexActivity(root, { ...common, turn_id: 'turn-2', hook_event_name: 'UserPromptSubmit' }, 1500), true);
  assert.equal(observeCodexActivity(root, { ...common, turn_id: 'turn-2', tool_use_id: 'tool-2', hook_event_name: 'PostToolUse',
    tool_name: post.tool_name, tool_input: post.tool_input, tool_response: post.tool_response }, 2000), true);
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'turn-2', tool_use_id: 'tool-3' }, 50 * 60_000), true);
  assert.ok(activity(binding, 50 * 60_000 + HOUR - 1), 'the later dispatch renews the bound');
  assert.equal(observeCodexActivity(root, { ...common, turn_id: 'turn-2', hook_event_name: 'Interrupt' }, 51 * 60_000), true);
  assert.equal(activity(binding, 51 * 60_000 + 1), null, 'an interruption clears work');
});

// SCN-002 (SDD-003): a new prompt retires the earlier turns of its own session only.
test('a new prompt retires a turn whose end was missed', t => {
  const { root, binding, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  const otherSession = { ...post, session_id: 'chat-2', turn_id: 'turn-10', tool_use_id: 'tool-9' };
  assert.equal(observeCodexActivity(root, { session_id: 'chat-2', turn_id: 'turn-10', hook_event_name: 'UserPromptSubmit' }, 1500), true);
  assert.ok(activity(binding, 1600), 'a prompt of another session leaves the work');
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', turn_id: 'turn-2', hook_event_name: 'UserPromptSubmit' }, 2000), true);
  assert.equal(activity(binding, 2001), null, 'the earlier turn of the same session is retired');
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'late' }, 2002), false, 'a late result of the retired turn changes nothing');
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'turn-2', tool_use_id: 'tool-2' }, 3000), true);
  assert.ok(activity(binding, 3001), 'the new turn shows its own work');
  assert.equal(observeCodexActivity(root, otherSession, 3500), true);
  assert.deepEqual(activity(binding, 3501), { gate: binding.gate, expires_at: 3500 + HOUR }, 'two sessions on the same step show the later work');
});

test('a new prompt and its Stop reject the first delayed result of the previous turn', t => {
  const { root, binding, common, post, activity } = fixture(t);
  const current = { ...common, turn_id: 'turn-current' };
  assert.equal(observeCodexActivity(root, { ...current, hook_event_name: 'UserPromptSubmit' }, 1000), true);
  assert.equal(observeCodexActivity(root, { ...current, hook_event_name: 'Stop' }, 1001), true);
  assert.equal(observeCodexActivity(root, post, 1002), false, 'the old turn had no result when the new prompt arrived');
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'late-older' }, 302_000), false, 'the short deduplication window is insufficient for a whole turn');
  assert.equal(observeCodexActivity(root, { ...post, ...current, tool_use_id: 'late-current' }, 302_001), false, 'Stop also fences late results of the current turn');
  assert.equal(activity(binding, 302_002), null);
  assert.equal(observeCodexActivity(root, { ...current, turn_id: 'turn-next', hook_event_name: 'UserPromptSubmit' }, 302_003), true);
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'turn-next', tool_use_id: 'next-work' }, 302_004), true);
  assert.ok(activity(binding, 302_005), 'a deliberate next turn still shows its own work');
});

// CR finding: a session that died without Stop must not hide the work of the next session.
test('an abandoned session does not hide the work of a new session', t => {
  const { root, binding, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  assert.equal(observeCodexActivity(root, { session_id: 'chat-2', hook_event_name: 'SessionStart', source: 'startup' }, 600_000), true);
  assert.equal(observeCodexActivity(root, { session_id: 'chat-2', turn_id: 'turn-1', hook_event_name: 'UserPromptSubmit' }, 600_100), true);
  assert.equal(observeCodexActivity(root, { ...post, session_id: 'chat-2', tool_use_id: 'tool-2' }, 600_200), true);
  assert.deepEqual(activity(binding, 600_300), { gate: binding.gate, expires_at: 600_200 + HOUR }, 'the new session shows its work');
  assert.equal(observeCodexActivity(root, { session_id: 'chat-2', turn_id: 'turn-1', hook_event_name: 'Stop' }, 700_000), true);
  assert.deepEqual(activity(binding, 700_001), { gate: binding.gate, expires_at: 1000 + HOUR },
    'after it ends, only the abandoned turn remains until its bound');
});

// SCN-003 (SDD-004): the card can tell a resting agent from a blind Companion.
test('a sign of life of the current hook profile tells observed from unknown', t => {
  const { root, binding, post } = fixture(t);
  const liveness = now => readCodexObservation(root, binding, now).liveness;
  assert.deepEqual(readCodexObservation(root, binding, 1000), { activity: null, liveness: 'unknown' }, 'no store');
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', hook_event_name: 'SessionStart', source: 'startup' }, 1000), true);
  assert.equal(liveness(1001), 'observed');
  assert.equal(liveness(1000 + DAY), 'unknown', 'a sign of life counts 24 hours');
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', turn_id: 'turn-2', hook_event_name: 'UserPromptSubmit' }, 2000), true);
  assert.equal(liveness(1000 + DAY), 'observed', 'a prompt renews it');
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'turn-2' }, 3000), true);
  assert.equal(liveness(3001), 'observed', 'activity writes keep the sign of life');
  const store = join(root, 'companion', 'codex-activity.json');
  const rows = JSON.parse(readFileSync(store, 'utf8'));
  writeFileSync(store, JSON.stringify(rows.map(row => (row.liveness ? { ...row, profile: '1' } : row))));
  assert.equal(liveness(3002), 'unknown', 'a sign of life of an older hook profile does not count');
  assert.equal(observeCodexActivity(root, { hook_event_name: 'SessionStart' }, 3003), false, 'an event without a session is ignored');
});

test('an unreadable store leaves activity and liveness unknown', t => {
  const { root, binding, post } = fixture(t);
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', hook_event_name: 'SessionStart' }, 1000), true);
  writeFileSync(join(root, 'companion', 'codex-activity.json'), '{"broken"');
  assert.deepEqual(readCodexObservation(root, binding, 1001), { activity: null, liveness: 'unknown' });
  assert.equal(observeCodexActivity(root, post, 1002), false, 'the store is quarantined');
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', hook_event_name: 'SessionStart' }, 1003), true, 'a sign of life is still recorded');
  assert.equal(readCodexObservation(root, binding, 1004).liveness, 'unknown', 'a quarantined store is not trusted');
  assert.deepEqual(readCodexObservation(join(root, 'missing'), binding, 1005), { activity: null, liveness: 'unknown' });
  assert.deepEqual(readCodexObservation(root, null, 1005), { activity: null, liveness: 'unknown' });
});

// SCN-006 (SDD-005): any server name passes the name rule; only a confirmed AGDF result records work.
test('the AGDF dispatch is recognised under another server name, a foreign result never', t => {
  const { root, binding, post, activity } = fixture(t);
  const foreign = { ...post, tool_name: 'mcp__other__agdf_dispatch', tool_use_id: 'foreign',
    tool_response: { structuredContent: { outcome: 'ok', terminal: false } } };
  assert.equal(observeCodexActivity(root, foreign, 1000), false);
  assert.equal(activity(binding, 1001), null);
  assert.equal(observeCodexActivity(root, { ...post, tool_name: 'mcp__agdf__agdf_record' }, 1002), false, 'another AGDF tool is not a dispatch');
  assert.equal(observeCodexActivity(root, { ...post, tool_name: 'mcp__agdf-local__agdf_dispatch' }, 1003), true);
  assert.ok(activity(binding, 1004));
});

// SCN-006 and SCN-014 (SDD-005, AC-010): the hook profile and Core use one rule and no catch-all hook.
test('the Codex hook profile observes only session start, prompts, the AGDF dispatch and the turn end', () => {
  assert.equal(DISPATCH_TOOL_MATCHER, agdfDispatchToolPattern);
  const shared = { hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'runtime-check' }] }] } };
  const { hooks } = codexCompanionHooks(shared);
  assert.deepEqual(Object.keys(hooks).sort(), ['Interrupt', 'PostToolUse', 'SessionStart', 'Stop', 'UserPromptSubmit']);
  assert.equal(hooks.SessionStart[0], shared.hooks.SessionStart[0], 'the shared runtime check stays first');
  assert.equal(hooks.SessionStart.length, 2);
  assert.deepEqual(hooks.PostToolUse.map(group => group.matcher), [agdfDispatchToolPattern]);
  for (const group of Object.values(hooks).flat()) {
    assert.ok(group.matcher === undefined || !['', '*', '.*'].includes(group.matcher), 'no catch-all matcher');
  }
  for (const name of ['mcp__agdf__agdf_dispatch', 'mcp__plugin_agdf_agdf__agdf_dispatch']) {
    assert.match(name, new RegExp(DISPATCH_TOOL_MATCHER, 'u'), 'the Claude Companion tool names satisfy the rule');
  }
});

// SCN-003 (SDD-004): any change to the Companion hooks or their entry script needs a new profile.
const PINNED_PROFILE = { profile: '2', digest: '5b270e8a41d9cbf5ee588a94c0cf9f1430aa60ee5d00824682f864bf2287fc45' };
test('the hook profile identity is pinned to the hook entries and the entry script', () => {
  const entries = codexCompanionHooks({ hooks: {} }).hooks;
  const script = readFileSync(new URL('../../../plugins/agdf/host-templates/codex/companion-activity.mjs', import.meta.url), 'utf8').replace(/\r\n/gu, '\n');
  const digest = createHash('sha256').update(JSON.stringify(entries)).update('\n').update(script).digest('hex');
  assert.deepEqual({ profile: CODEX_HOOK_PROFILE, digest }, PINNED_PROFILE,
    'A Codex Companion hook changed: raise CODEX_HOOK_PROFILE in codex-activity.js and pin the new digest here');
});

function seedStore(root, activity) {
  const directory = join(root, 'companion');
  const path = join(directory, 'codex-activity.json');
  mkdirSync(directory);
  writeFileSync(path, JSON.stringify(activity));
  return path;
}

function fullRows(binding, count, character) {
  return Array.from({ length: count }, (_, turn) => ({
    session: character.repeat(128), turn: String(turn).padStart(128, character),
    ...binding, tools: Array.from({ length: 12 }, (_, tool) => String(tool).padStart(128, character)),
    expires_at: 31_000, until: 301_000,
  }));
}

test('the maximum valid observation set stays writable and expires normally', t => {
  const { root, binding, gate, post, activity } = fixture(t, 'a'.repeat(128));
  const character = 'k';
  const store = seedStore(root, fullRows(binding, 63, character));
  for (let tool = 0; tool < 12; tool++) {
    const event = { ...post, session_id: character.repeat(128),
      turn_id: '63'.padStart(128, character), tool_use_id: String(tool).padStart(128, character) };
    assert.equal(observeCodexActivity(root, event, 1000), true, `tool ${tool}`);
  }
  const bytes = statSync(store).size;
  assert.ok(bytes > 128 * 1024 && bytes <= 160 * 1024, String(bytes));
  assert.equal(observeCodexActivity(root, { session_id: 'chat-1', hook_event_name: 'SessionStart' }, 1001), true);
  const full = JSON.parse(readFileSync(store, 'utf8'));
  assert.equal(full.length, 65, 'a full store keeps the sign of life beside its 64 activity rows');
  assert.equal(readCodexObservation(root, binding, 1002).liveness, 'observed', 'a full store never hides that the hooks run');
  assert.equal(observeCodexActivity(root, post, 1000 + HOUR + 1), true);
  assert.deepEqual(activity(binding, 1000 + HOUR + 2), { gate, expires_at: 1000 + 2 * HOUR + 1 });
});

test('an oversized store from the previous build accepts fresh work and retains terminal markers', t => {
  const { root, binding, gate, post, activity } = fixture(t, 'a'.repeat(128));
  const data = fullRows(binding, 23, 'a');
  data.push({ session: 'chat-1', turn: 'ended-turn', until: 301_000, terminal: true, kind: 'interrupted' });
  const store = seedStore(root, data);
  assert.ok(statSync(store).size > 48 * 1024);
  assert.equal(observeCodexActivity(root, post, 32_000), true);
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'ended-turn' }, 32_001), false);
  assert.deepEqual(activity(binding, 32_002), { gate, expires_at: 32_000 + HOUR });
});

test('an unreadable store holds observations for one window and then starts over', t => {
  const { root, binding, gate, post, activity } = fixture(t);
  for (const content of ['{"broken"', '[null]', JSON.stringify({ rows: [] }), 'x'.repeat(161 * 1024)]) {
    const store = join(root, 'companion', 'codex-activity.json');
    if (existsSync(store)) rmSync(store); else mkdirSync(join(root, 'companion'));
    writeFileSync(store, content);
    assert.equal(observeCodexActivity(root, post, 1000), false, 'the repair itself records nothing');
    assert.deepEqual(JSON.parse(readFileSync(store, 'utf8')), [{ quarantined: true, until: 301_000 }]);
    assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'held' }, 2000), false, 'work waits for the window');
    assert.equal(activity(binding, 2000), null);
    assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'later' }, 301_000), true);
    assert.deepEqual(activity(binding, 301_001), { gate, expires_at: 301_000 + HOUR });
  }
});

test('a turn that ends without observed work leaves the store as it is', t => {
  const { root, common, post } = fixture(t);
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: 'Stop' }, 1000), false);
  assert.equal(existsSync(join(root, 'companion', 'codex-activity.json')), false);
  assert.equal(observeCodexActivity(root, post, 1100), true);
  assert.equal(observeCodexActivity(root, { ...common, turn_id: 'quiet-turn', hook_event_name: 'Stop' }, 1200), false);
  assert.equal(JSON.parse(readFileSync(join(root, 'companion', 'codex-activity.json'), 'utf8')).length, 1);
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: 'Stop' }, 1300), true, 'a turn with work is retired');
  assert.equal(observeCodexActivity(root, { ...common, turn_id: 'interrupted', hook_event_name: 'Interrupt' }, 1400), true,
    'an interruption keeps its marker against a late result');
});

test('a store reached through a file link is neither read nor written', t => {
  const { root, binding, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  const store = join(root, 'companion', 'codex-activity.json');
  const target = join(root, 'elsewhere.json');
  renameSync(store, target);
  const bytes = readFileSync(target, 'utf8');
  try { symlinkSync(target, store, 'file'); } catch (error) {
    if (error.code !== 'EPERM') throw error;
    t.skip('creating a file symlink needs a privilege on this machine');
    return;
  }
  assert.equal(activity(binding, 1001), null, 'matching work behind a link is not read');
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'through-link' }, 1002), false);
  assert.equal(readFileSync(target, 'utf8'), bytes, 'the link target stays unchanged');
});

test('a companion directory reached through a junction is neither read nor written', t => {
  const { root, binding, post, activity } = fixture(t);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  const companion = join(root, 'companion');
  const moved = join(root, 'companion-target');
  renameSync(companion, moved);
  const bytes = readFileSync(join(moved, 'codex-activity.json'), 'utf8');
  symlinkSync(moved, companion, 'junction');
  assert.equal(activity(binding, 1001), null);
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'through-junction' }, 1002), false);
  assert.equal(readFileSync(join(moved, 'codex-activity.json'), 'utf8'), bytes);
});
