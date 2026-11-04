import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { inspectCodexStartup } from '../lib/lifecycle/codex-startup-status.js';
import { observeCodexOrigins, codexStartupConfiguration } from '../lib/mcp-lifecycle/adapters/codex-origin-probe.js';
import { CODEX_MCP_STARTUP_ARGS } from '../lib/host-adapters/codex/mcp-startup.js';

test('configuration-only observation has no wait override, thread, turn or configuration write; only safe facts escape', async () => {
  const writes = [], target = process.cwd(); let argv;
  const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter();
  child.stdin.end = () => queueMicrotask(() => child.emit('exit', 0, null)); child.kill = () => {};
  child.stdin.write = line => {
    const request = JSON.parse(line); writes.push(request);
    const result = request.method === 'config/read' ? { config: { mcp_optional_startup_grace_ms: 0, PRIVATE: 'SECRET' },
      origins: { mcp_optional_startup_grace_ms: { name: { type: 'user', file: 'SECRET' } } }, layers: ['SECRET'] } : {};
    if (request.id) queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, result }) + '\n'));
  };
  const result = await observeCodexOrigins({ target, mode: 'configuration', command: { executable: 'fixture', prefixArgs: [] },
    spawnProcess(_exe, args) { argv = args; return child; } });
  assert.deepEqual(argv, ['app-server']);
  assert.deepEqual(writes.map(row => row.method), ['initialize', 'initialized', 'config/read']);
  assert.deepEqual(writes[2].params, { includeLayers: true, cwd: target });
  assert.deepEqual(result, { status: 'observed', wait_ms: 0, origin: { kind: 'user' }, reason: null });
  assert(!JSON.stringify(result).includes('SECRET'));
  assert.equal(codexStartupConfiguration({ config: {} }).status, 'unknown');
  assert.equal(codexStartupConfiguration({ config: { mcp_optional_startup_grace_ms: -1 } }).wait_ms, null);
});
test('default status never launches catalog; explicit native mode retains bounds and requires the owned tools', async () => {
  const target = process.cwd(), calls = []; let clock = 0;
  const dependencies = { now: () => clock, observe: async args => {
    calls.push(args); clock += 15000;
    return args.mode === 'configuration' ? { status: 'unknown', wait_ms: null, origin: null, reason: 'setting_not_exposed' }
      : { status: 'observed', providers: [{ server_id: 'agdf', plugin_id: 'agdf@agdf', runtime_status: 'ready', tools: ['agdf_inspect', 'agdf_project'] }] };
  } };
  assert.equal((await inspectCodexStartup({ target }, dependencies)).catalog.status, 'not_observed');
  assert.equal(calls.length, 1); calls.length = 0; clock = 0;
  const ready = await inspectCodexStartup({ target, native: true }, dependencies);
  assert.equal(ready.catalog.status, 'discovered_ready'); assert.equal(ready.configuration.status, 'unknown');
  assert.deepEqual(ready.catalog.invocation_override, [...CODEX_MCP_STARTUP_ARGS]);
  assert.deepEqual(calls.map(c => c.timeoutMs), [15000, 30000]);
  for (const providers of [[], [{ server_id: 'agdf', plugin_id: 'foreign', tools: ['agdf_inspect', 'agdf_project'] }],
    [{ server_id: 'agdf', plugin_id: 'agdf@agdf', tools: ['agdf_inspect'] }]]) {
    const r = await inspectCodexStartup({ target, native: true }, { observe: async () => ({ status: 'observed', providers }) });
    assert.equal(r.catalog.status, 'unavailable');
  }
  const failed = await inspectCodexStartup({ target, native: true }, { observe: async () => ({ status: 'unavailable', reason: 'teardown_unconfirmed' }) });
  assert.equal(failed.catalog.status, 'unavailable'); assert.equal(failed.catalog.reason, 'teardown_unconfirmed');
});
