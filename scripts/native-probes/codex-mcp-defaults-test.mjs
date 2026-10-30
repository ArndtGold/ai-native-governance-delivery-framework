import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EventEmitter } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { METHODS, assertFixtureCall, appServer, assertNativeReplay } from './codex-mcp-defaults.mjs';
import { resolveControlCommandTarget } from '../../packages/core/lib/control-state/approval-command-contract.js';

function processFixture(respond = true) {
  const child = new EventEmitter(), sent = [];
  child.stdout = new PassThrough(); child.stderr = new PassThrough();
  child.stdin = new Writable({ write(bytes, encoding, done) {
    for (const line of bytes.toString().trim().split('\n')) {
      const message = JSON.parse(line); sent.push(message);
      if (respond && message.id !== undefined && message.method) queueMicrotask(() => child.stdout.write(JSON.stringify({ id: message.id, result: { accepted: message.method } }) + '\n'));
    }
    done();
  }, final(done) { done(); queueMicrotask(() => child.emit('close', 0, null)); } });
  child.kill = signal => { child.emit('close', null, signal); };
  return { child, sent, spawnProcess(executable, args) { assert.equal(executable, 'fake-codex'); assert.deepEqual(args, ['app-server']); return child; } };
}
test('native replay compares JSON values across host key ordering and still refuses changed effects', () => {
  const receipt = { schema_version: 'resolved/1', input_resolution: { effective_digest: 'same', fields: { presentation_language: 'en', assurance: 'cooperative_local' } } };
  const reordered = { input_resolution: { fields: { assurance: 'cooperative_local', presentation_language: 'en' }, effective_digest: 'same' }, schema_version: 'resolved/1' };
  assert.doesNotThrow(() => assertNativeReplay({ structuredContent: { outcome: 'already_applied', receipt: reordered } }, receipt));
  assert.throws(() => assertNativeReplay({ structuredContent: { outcome: 'accepted', receipt: reordered } }, receipt), /PROBE_REPLAY_FAILED/);
  assert.throws(() => assertNativeReplay({ structuredContent: { outcome: 'already_applied', receipt: { ...reordered, schema_version: 'changed' } } }, receipt), /PROBE_REPLAY_FAILED/);
});
test('fixed direct API permits no model turn or model execution process', async () => {
  const fixture = processFixture(), host = appServer({}, '/tmp', 'fake-codex', fixture);
  for (const method of ['turn/start', 'turn/steer', 'thread/fork', 'command/exec']) await assert.rejects(host.call(method, {}), /PROBE_METHOD_FORBIDDEN/);
  assert.deepEqual(METHODS, ['initialize', 'thread/start', 'mcpServerStatus/list', 'mcpServer/tool/call']);
  assert.deepEqual(await host.call('initialize', {}), { accepted: 'initialize' });
  host.notify('initialized'); assert.throws(() => host.notify('turn/start'), /PROBE_METHOD_FORBIDDEN/);
  assert.equal(fixture.sent.filter(row => row.method === 'initialize').length, 1);
  assert.deepEqual(await host.close(), { code: 0, signal: null });
});
test('bounded call guard confines writes to supplied synthetic targets and exact operation', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-native-guard-')));
  try {
    const base = { primary_target: root, working_directory: root, target_source: 'explicit_target' };
    const write = { ...base, target_id: resolveControlCommandTarget(root).target_id,
      command: { kind: 'run.create', payload: { title: 'Synthetic MCP defaults comparison' } } };
    assertFixtureCall('agdf_inspect', { ...base, operation: 'project-state' }, [root]);
    assertFixtureCall('agdf_inspect', { operation: 'inventory' }, [root]);
    assertFixtureCall('agdf_run', write, [root]);
    for (const [tool, args] of [['agdf_approve', write], ['agdf_run', { ...write, primary_target: '/another' }],
      ['agdf_run', { ...write, target_id: 'invented' }], ['agdf_run', { ...write, command: { kind: 'run.create', payload: { title: 'Other work' } } }],
      ['agdf_inspect', { ...base, operation: 'gate-check' }]]) assert.throws(() => assertFixtureCall(tool, args, [root]), /PROBE_/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('timeout remains a failure and unexpected host requests abort instead of approving', async () => {
  const fixture = processFixture(false), host = appServer({}, '/tmp', 'fake-codex', { ...fixture, timeoutMs: 10 });
  await assert.rejects(host.call('initialize', {}), /PROBE_TIMEOUT/);
  const pending = host.call('thread/start', {});
  fixture.child.stdout.write(JSON.stringify({ id: 200, method: 'approval/request', params: {} }) + '\n');
  await assert.rejects(pending, /PROBE_UNEXPECTED_SERVER_REQUEST/);
  assert.equal(fixture.sent.at(-1).error.code, -32601);
  await host.close();
});
