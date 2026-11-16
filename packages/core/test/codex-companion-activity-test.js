import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { observeCodexActivity, readCodexActivity } from '../lib/companion/codex-activity.js';

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
  return { root, run_id, binding, gate, common, post };
}

test('Codex activity is scoped, expires, and cannot revive after turn termination', t => {
  const { root, run_id, binding, gate, common, post } = fixture(t);
  assert.equal(observeCodexActivity(root, { ...post, tool_input: { run_id } }, 1000), false);
  assert.equal(observeCodexActivity(root, post, 1000), true);
  assert.deepEqual(readCodexActivity(root, binding, 1001), { gate, expires_at: 31_000 });
  assert.equal(observeCodexActivity(root, post, 2000), false);
  for (const other of [{ run_id: 'run-b' }, { target_id: 'foreign' }, { revision_id: randomUUID() }, { gate: 'PRD' }]) {
    assert.equal(readCodexActivity(root, { ...binding, ...other }, 2000), null);
  }
  assert.equal(readCodexActivity(root, binding, 31_000), null);
  assert.equal(observeCodexActivity(root, post, 32_000), false);
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'continued' }, 32_100), true);
  assert.deepEqual(readCodexActivity(root, binding, 32_200), { gate, expires_at: 62_100 });
  assert.equal(observeCodexActivity(root, { ...common, hook_event_name: 'Interrupt' }, 32_300), true);
  assert.equal(observeCodexActivity(root, { ...post, tool_use_id: 'late' }, 32_400), false);
  assert.equal(readCodexActivity(root, binding, 32_500), null);
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
  const { root, binding, gate, post } = fixture(t, 'a'.repeat(128));
  // The case-insensitive host ID validator also accepts the three-byte Kelvin sign.
  const character = 'K';
  const store = seedStore(root, fullRows(binding, 63, character));
  for (let tool = 0; tool < 12; tool++) {
    const event = { ...post, session_id: character.repeat(128),
      turn_id: '63'.padStart(128, character), tool_use_id: String(tool).padStart(128, character) };
    assert.equal(observeCodexActivity(root, event, 1000), true, `tool ${tool}`);
  }
  const bytes = statSync(store).size;
  assert.ok(bytes > 144 * 1024 && bytes <= 384 * 1024);
  assert.equal(observeCodexActivity(root, post, 301_001), true);
  assert.deepEqual(readCodexActivity(root, binding, 301_002), { gate, expires_at: 331_001 });
});

test('an oversized store from the previous build accepts fresh work and retains terminal markers', t => {
  const { root, binding, gate, post } = fixture(t, 'a'.repeat(128));
  const data = fullRows(binding, 23, 'a');
  data.push({ session: 'chat-1', turn: 'ended-turn', until: 301_000, terminal: true, kind: 'interrupted' });
  const store = seedStore(root, data);
  assert.ok(statSync(store).size > 48 * 1024);
  assert.equal(observeCodexActivity(root, post, 32_000), true);
  assert.equal(observeCodexActivity(root, { ...post, turn_id: 'ended-turn' }, 32_001), false);
  assert.deepEqual(readCodexActivity(root, binding, 32_002), { gate, expires_at: 62_000 });
});
