import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { redact } from './codex-hook-payload-probe.mjs';

const probe = fileURLToPath(new URL('./codex-hook-payload-probe.mjs', import.meta.url));
const identifiers = { session_id: 'probe-session', turn_id: 'probe-turn', tool_use_id: 'probe-tool',
  tool_name: 'mcp__agdf__agdf_dispatch', hook_event_name: 'PostToolUse' };
const markers = ['SYNTHETIC_TOKEN', 'SYNTHETIC_RESULT', 'SYNTHETIC_PROMPT', 'SYNTHETIC_PATH', 'SYNTHETIC_KEY'];
const payload = () => ({ ...identifiers,
  tool_input: { command: 'curl -H "Authorization: Bearer SYNTHETIC_TOKEN" https://example.invalid',
    args: ['SYNTHETIC_TOKEN'] },
  tool_response: { content: [{ type: 'text', text: 'SYNTHETIC_RESULT' }], SYNTHETIC_KEY: 'private',
    turn_id: 'SYNTHETIC_TOKEN' },
  prompt: 'SYNTHETIC_PROMPT', last_assistant_message: 'SYNTHETIC_RESULT',
  messages: [{ content: 'SYNTHETIC_PROMPT' }], cwd: '/private/SYNTHETIC_PATH',
  authorization: 'Bearer SYNTHETIC_TOKEN', extra: { nested: true, count: 123 },
});
const noContents = value => {
  const bytes = JSON.stringify(value);
  for (const marker of markers) assert.ok(!bytes.includes(marker), marker);
};

test('the hook probe retains only top-level host identities and redacts opaque payloads', () => {
  const result = redact(payload());
  for (const [key, value] of Object.entries(identifiers)) assert.equal(result[key], value);
  assert.deepEqual(result.tool_input, { redacted_value: true, type: 'object', fields: 2 });
  assert.equal(result.tool_response.type, 'object');
  assert.equal(result.messages.type, 'array');
  assert.equal(result.prompt.redacted_text, true);
  assert.equal(result.authorization, '<redacted>');
  noContents(result);
  assert.equal(redact({ turn_id: 'SYNTHETIC_TOKEN with spaces' }).turn_id.redacted_text, true);
  assert.equal(redact({ hook_event_name: 'SYNTHETIC_PROMPT' }).hook_event_name.redacted_text, true);
  assert.equal(redact({ source: 'SYNTHETIC_RESULT' }).source.redacted_text, true);
  assert.equal(redact({ source: 'resume' }).source, 'resume');
});

test('recorded files and summaries contain no tool content or parser-error excerpts', t => {
  const out = mkdtempSync(join(tmpdir(), 'agdf-probe-redaction-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const record = input => {
    const result = spawnSync(process.execPath, [probe, 'record', '--out', out], { input, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '{}\n');
  };
  record(JSON.stringify(payload()));
  record(JSON.stringify({ session_id: identifiers.session_id, turn_id: identifiers.turn_id,
    hook_event_name: 'Stop', last_assistant_message: 'SYNTHETIC_RESULT' }));
  record('{"prompt":"SYNTHETIC_PROMPT", invalid }');
  const lines = readFileSync(join(out, 'raw-events.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line));
  noContents(lines);
  assert.equal(lines[0].payload.tool_use_id, identifiers.tool_use_id);
  assert.equal(lines[2].error, 'invalid_payload');
  const summarized = spawnSync(process.execPath, [probe, 'summarize', '--out', out], { encoding: 'utf8' });
  assert.equal(summarized.status, 0, summarized.stderr);
  const summary = JSON.parse(readFileSync(join(out, 'summary.json'), 'utf8'));
  noContents(summary);
  noContents(readFileSync(join(out, 'summary.md'), 'utf8'));
  assert.equal(summary.errors, 1);
  assert.equal(summary.event_count, 2);
  assert.deepEqual(summary.turns[0].events, ['PostToolUse', 'Stop']);
  assert.deepEqual(summary.agdf_tool_names, [identifiers.tool_name]);
  assert.ok(summary.fields.PostToolUse.includes('tool_response'));
});
