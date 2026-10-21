import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { codexAdapter, inspectCodexSetup } from '../lib/mcp-lifecycle/adapters/codex.js';

test('SCN-032: governance registration preserves the separately named cockpit connection', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-cockpit-config-'));
  const path = join(target, '.codex', 'config.toml');
  const cockpit = '[mcp_servers.agdf-cockpit-local]\ncommand = "/local/node"\nargs = ["/local/cockpit"]\n';
  const spec = { command: '/local/node', args: ['/local/governance', '--surface', 'codex'], version: '0.14.5', digest: 'a'.repeat(64) };
  const input = { scope: 'project', target, spec, env: { CODEX_HOME: join(target, 'empty-user') }, exec: () => '{}' };
  try {
    mkdirSync(join(target, '.codex'));
    writeFileSync(path, cockpit);
    assert.equal(codexAdapter.inspect(input).selected_status, 'absent');
    const enable = codexAdapter.createTransaction({ ...input, action: 'enable' }); enable.apply();
    assert.equal(codexAdapter.inspect(input).selected_status, 'matched');
    assert.ok(readFileSync(path, 'utf8').includes(cockpit));
    codexAdapter.createTransaction({ ...input, action: 'disable' }).apply();
    assert.equal(readFileSync(path, 'utf8').trim(), cockpit.trim());
    for (const malformed of ['[mcp_servers.agdf.child]\ncommand = "/bad"\n', 'mcp_servers.agdf.command = "/bad"\n']) {
      writeFileSync(path, malformed);
      assert.throws(() => codexAdapter.inspect(input), /AGDF_MCP_CODEX_CONFIG_INVALID/);
    }
    for (const existing of ['  [mcp_servers.agdf]\ncommand = "/foreign"\n', '[mcp_servers.agdf]\ncommand = "/foreign"\n  [mcp_servers.agdf]\ncommand = "/duplicate"\n']) {
      writeFileSync(path, existing);
      assert.throws(() => codexAdapter.createTransaction({ ...input, action: 'enable' }), /REGISTRATION_FOREIGN|CODEX_CONFIG_INVALID/);
      assert.equal(readFileSync(path, 'utf8'), existing, 'Indented foreign/duplicate declarations cannot be shadowed.');
    }
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('Closed Codex roles revalidate preview and preserve concurrent foreign changes on rollback', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-codex-role-'));
  const path = join(target, '.codex/config.toml');
  const spec = { command: '/node', args: ['/cockpit', '--surface', 'codex', '--cockpit-dir', target],
    version: '0.14.5', digest: 'a'.repeat(64), role: 'cockpit', serverId: 'agdf-cockpit' };
  const input = { scope: 'project', target, spec, env: { CODEX_HOME: join(target, 'user') }, exec: () => '{}' };
  try {
    mkdirSync(join(target, '.codex')); writeFileSync(path, '# FOREIGN_CANARY\n');
    const stale = codexAdapter.createTransaction({ ...input, action: 'enable' });
    writeFileSync(path, '# FOREIGN_NEW\n');
    assert.throws(() => stale.apply(), /AGDF_MCP_CODEX_SOURCE_CHANGED/);
    assert.equal(readFileSync(path, 'utf8'), '# FOREIGN_NEW\n');
    const transaction = codexAdapter.createTransaction({ ...input, action: 'enable' });
    const changedWrapper = codexAdapter.createTransaction({ ...input, action: 'enable', revalidate() { throw Error('wrapper_changed'); } });
    assert.throws(() => changedWrapper.apply(), /wrapper_changed/);
    assert.equal(readFileSync(path, 'utf8'), '# FOREIGN_NEW\n');
    transaction.apply(); transaction.apply();
    const unchanged = codexAdapter.createTransaction({ ...input, action: 'enable' });
    const exact = readFileSync(path, 'utf8');
    writeFileSync(path, exact + '# CONCURRENT_CHANGE\n');
    assert.throws(() => unchanged.apply(), /SOURCE_CHANGED/);
    writeFileSync(path, exact);
    assert.equal(codexAdapter.inspect(input).selected_status, 'matched');
    writeFileSync(path, readFileSync(path, 'utf8') + '[foreign]\n# FOREIGN_LATER\nvalue = true\n');
    assert.throws(() => transaction.rollback(), /AGDF_MCP_CODEX_ROLLBACK_CONFLICT/);
    assert.ok(readFileSync(path, 'utf8').includes('# FOREIGN_LATER'));
    // Editing even an owned section does not grant adoption for a different expected command.
    const foreign = { ...input, spec: { ...spec, command: '/another-node' } };
    assert.throws(() => codexAdapter.createTransaction({ ...foreign, action: 'disable' }), /AGDF_MCP_REGISTRATION_FOREIGN/);
    codexAdapter.createTransaction({ ...input, action: 'disable' }).apply();
    assert.ok(readFileSync(path, 'utf8').includes('# FOREIGN_LATER'));
    assert.throws(() => codexAdapter.inspect({ ...input, spec: { ...spec, serverId: 'node_repl' } }), /ROLE_INVALID/);
    const quoted = 'prompt = """\n' + readFileSync(path, 'utf8') + '\n"""\n';
    writeFileSync(path, quoted);
    assert.throws(() => codexAdapter.createTransaction({ ...input, action: 'enable' }), /CONFIG_INVALID/);
    assert.equal(readFileSync(path, 'utf8'), quoted);
    writeFileSync(path, '# FOREIGN_LATER\n');
    assert.throws(() => codexAdapter.inspect({ ...input, spec: { ...spec, role: 'diagnostic', serverId: 'agdf-decision-probe' } }), /ROLE_INVALID/);
    const diagnostic = { ...input, spec: { ...spec, role: 'diagnostic', serverId: 'agdf-test-owned' } };
    codexAdapter.createTransaction({ ...diagnostic, action: 'enable' }).apply();
    assert.equal(codexAdapter.inspect(diagnostic).selected_status, 'matched');
    codexAdapter.createTransaction({ ...diagnostic, action: 'disable' }).apply();
    codexAdapter.createTransaction({ ...diagnostic, action: 'disable' }).apply();
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('Derived setup separates declarations from desktop/runtime/App observations and leaks no payload', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-codex-setup-'));
  try {
    mkdirSync(join(target, '.codex'));
    writeFileSync(join(target, '.codex/config.toml'), '[mcp_servers.agdf-cockpit-local]\ncommand = "/node"\nargs = ["/opaque"]\nstartup_timeout_sec = 20\nenv = { SECRET = "PRIVATE_CANARY" }\n\n[mcp_servers.agdf-cockpit-draft-check]\ncommand = "/node"\n');
    const result = inspectCodexSetup({ target, env: { CODEX_HOME: join(target, 'user') } });
    assert.equal(result.entries.length, 2);
    assert.equal(result.entries[0].role, 'cockpit');
    assert.equal(result.entries[1].role, 'diagnostic');
    assert.equal(result.entries[0].declared_startup_timeout_sec, 20);
    assert.equal(result.entries[0].effective_policy, 'unknown');
    assert.equal(result.entries[0].app_rendered, 'unobserved');
    assert.equal(result.entries[0].owner, 'unconfirmed');
    assert.equal(JSON.stringify(result).includes('PRIVATE_CANARY'), false);
    writeFileSync(join(target, '.codex/config.toml'), '  [mcp_servers.agdf-cockpit-local]\nenabled = invalid_boolean\n');
    const unknown = inspectCodexSetup({ target, env: { CODEX_HOME: join(target, 'user') } });
    assert.equal(unknown.entries[0].role, 'cockpit');
    assert.equal(unknown.entries[0].configured, 'unknown');
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('inventory retains foreign names and separates plugin/local providers without payload', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-cockpit-provider-'));
  try {
    mkdirSync(join(target, '.codex'));
    writeFileSync(join(target, '.codex/config.toml'), '[mcp_servers.agdf_cockpit]\ncommand = "/foreign"\n[ mcp_servers.bad ]\n');
    const plugin = join(target, 'plugin'); mkdirSync(plugin);
    writeFileSync(join(plugin, 'mcp.json'), JSON.stringify({ mcpServers: {
      agdf: { type: 'stdio', command: 'node', args: [] },
      'agdf-cockpit': { type: 'stdio', command: 'node', args: ['SECRET_LAUNCHER'] },
    } }));
    const setup = inspectCodexSetup({ target, env: { CODEX_HOME: join(target, 'user') }, pluginRoot: plugin });
    assert.ok(setup.entries.some(row => row.server_id === 'agdf_cockpit' && row.config_source === 'project'));
    assert.ok(setup.entries.some(row => row.server_id === 'agdf-cockpit' && row.scope === 'plugin'));
    assert.equal(JSON.stringify(setup).includes('SECRET_LAUNCHER'), false);
    assert.equal(setup.effective_host_policy, 'unknown');
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('candidate admission blocks same keys, normalized aliases and unsupported sources before mutation', async () => {
  const { inspectCodexCockpitAdmission } = await import('../lib/mcp-lifecycle/adapters/codex.js');
  const target = mkdtempSync(join(tmpdir(), 'agdf-cockpit-admission-'));
  const env = { CODEX_HOME: join(target, 'user') };
  try {
    mkdirSync(join(target, '.codex')); mkdirSync(env.CODEX_HOME);
    const project = join(target, '.codex/config.toml'), user = join(env.CODEX_HOME, 'config.toml');
    writeFileSync(project, '# CANARY\n[mcp_servers.agdf-cockpit-local]\ncommand = "/legacy"\n');
    assert.equal(inspectCodexCockpitAdmission({ target, env }).admitted, true);
    const nestedForeign = '[mcp_servers.foreign]\ncommand = "/foreign"\n[mcp_servers.foreign.env]\nSECRET = "PRIVATE_CANARY"\n[mcp_servers.foreign.tools.read]\napproval_mode = "never"\n';
    writeFileSync(user, nestedForeign);
    const ordinary = inspectCodexCockpitAdmission({ target, env });
    assert.equal(ordinary.admitted, true);
    assert.equal(JSON.stringify(ordinary).includes('PRIVATE_CANARY'), false);
    assert.equal(readFileSync(user, 'utf8'), nestedForeign);
    for (const name of ['agdf-cockpit', 'agdf_cockpit', 'AGDF_COCKPIT']) {
      const content = `[mcp_servers.${name}]\ncommand = "/foreign"\n`;
      writeFileSync(user, content);
      const result = inspectCodexCockpitAdmission({ target, env });
      assert.equal(result.admitted, false); assert.equal(result.conflicts[0].path, user);
      assert.equal(readFileSync(user, 'utf8'), content);
    }
    writeFileSync(user, '');
    const native = inspectCodexCockpitAdmission({ target, env, exec: () => JSON.stringify([
      { name: 'agdf-cockpit', enabled: true, transport: { command: '/foreign', args: ['/foreign'] } },
    ]) });
    assert.equal(native.admitted, false);
    assert.equal(native.conflicts[0].reason, 'host_same_key_or_possible_alias');
    assert.equal(inspectCodexCockpitAdmission({ target, env, exec() { throw Error('unavailable'); } }).admitted, false);
    writeFileSync(user, '[mcp_servers.agdf-cockpit]\nenabled = false\n');
    assert.equal(inspectCodexCockpitAdmission({ target, env }).admitted, true);
    writeFileSync(user, '[mcp_servers."agdf-cockpit"]\nenabled = false\n');
    assert.equal(inspectCodexCockpitAdmission({ target, env }).admitted, false);
    writeFileSync(user, '[mcp_servers.agdf-cockpit.tools.read]\napproval_mode = "never"\n');
    assert.equal(inspectCodexCockpitAdmission({ target, env }).admitted, false);
    assert.match(readFileSync(project, 'utf8'), /CANARY/);
  } finally { rmSync(target, { recursive: true, force: true }); }
});

// A process cwd is insufficient: the unscoped host deliberately omits Legacy.
// Exercise the actual protocol owner against a bounded child transport.
import { EventEmitter } from 'node:events';
import { observeCodexOrigins } from '../lib/mcp-lifecycle/adapters/codex-origin-probe.js';
import { CODEX_MCP_STARTUP_ARGS, independentCodexEnvironment } from '../lib/host-adapters/codex/mcp-startup.js';
test('independent native discovery preserves security settings and waits within existing startup limits', () => {
  const source = { CODEX_THREAD_ID: 'parent', CODEX_SESSION_ID: 'parent', CODEX_APP_TOOLS_PIPE_PATH: '/parent',
    CODEX_SANDBOX: 'seatbelt', CODEX_SANDBOX_NETWORK_DISABLED: '1', CODEX_HOME: '/own', PATH: '/bin' };
  const isolated = independentCodexEnvironment(source);
  assert.equal(isolated.CODEX_THREAD_ID, undefined); assert.equal(isolated.CODEX_SESSION_ID, undefined);
  assert.equal(isolated.CODEX_APP_TOOLS_PIPE_PATH, undefined);
  for (const key of ['CODEX_SANDBOX', 'CODEX_SANDBOX_NETWORK_DISABLED', 'CODEX_HOME', 'PATH']) assert.equal(isolated[key], source[key]);
  assert.equal(source.CODEX_THREAD_ID, 'parent');
  assert.deepEqual(CODEX_MCP_STARTUP_ARGS, ['-c', 'mcp_optional_startup_grace_ms=0']);
});
for (const fault of [null, 'wrong-target', 'persistent', 'start-error', 'paged', 'inventory-error']) {
  test(`Codex origin discovery binds a disposable project context (${fault ?? 'success'})`, async () => {
    const target = process.cwd(), writes = [];
    const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
    child.kill = () => { child.killed = true; };
    child.stdin = new EventEmitter();
    child.stdin.end = () => { child.ended = true; queueMicrotask(() => child.emit('exit', 0, null)); };
    child.stdin.write = line => {
      const request = JSON.parse(line); writes.push(request);
      const reply = result => queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, result }) + '\n'));
      if (request.method === 'initialize') reply({});
      if (request.method === 'thread/start') {
        assert.deepEqual(request.params, { cwd: target, ephemeral: true });
        if (fault === 'start-error') queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, error: {} }) + '\n'));
        else reply({ cwd: target, thread: { id: 'ephemeral-fixture', cwd: fault === 'wrong-target' ? '/foreign' : target, ephemeral: fault !== 'persistent' } });
      }
      if (request.method === 'mcpServerStatus/list') {
        assert.equal(request.params.threadId, 'ephemeral-fixture');
        if (fault === 'inventory-error') queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, error: {} }) + '\n'));
        else reply({ data: request.params.threadId ? [
          { name: 'agdf-cockpit', pluginId: 'agdf@agdf', runtimeStatus: 'connected', tools: { agdf_cockpit: {}, agdf_cockpit_read: {} } },
          { name: 'agdf-cockpit-local', pluginId: null, runtimeStatus: 'connected', tools: { agdf_cockpit: {}, agdf_cockpit_read: {} } },
        ] : [], nextCursor: fault === 'paged' ? 'unread-page' : null });
      }
    };
    const result = await observeCodexOrigins({ target, all: true, command: { executable: 'fixture', prefixArgs: [] }, spawnProcess: () => child });
    assert.equal(result.status, fault ? 'unavailable' : 'observed');
    if (!fault) assert.deepEqual(result.providers.map(row => row.server_id), ['agdf-cockpit', 'agdf-cockpit-local']);
    if (['wrong-target', 'persistent', 'start-error'].includes(fault)) assert.equal(writes.some(row => row.method === 'mcpServerStatus/list'), false);
    assert.equal(writes.some(row => row.method === 'turn/start'), false);
    assert.equal(child.ended, true);
    assert.notEqual(child.killed, true, 'ordinary discovery waits for owned process exit rather than killing its MCP children');
  });
}
test('Codex project origin timeout closes its process without global-inventory fallback', async () => {
  const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter();
  const writes = []; child.stdin.write = line => writes.push(JSON.parse(line)); child.kill = () => { child.killed = true; };
  const result = await observeCodexOrigins({ target: process.cwd(), timeoutMs: 10, command: { executable: 'fixture', prefixArgs: [] }, spawnProcess: () => child });
  assert.deepEqual(result, { status: 'unavailable', reason: 'timeout' });
  assert.deepEqual(writes.map(row => row.method), ['initialize']);
  assert.equal(child.killed, true);
});
test('narrow origin output waits for every connection owned by its temporary context', async () => {
  const target = process.cwd(), child = new EventEmitter(), writes = [];
  child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter();
  let inventories = 0;
  child.stdin.end = () => { assert.equal(inventories, 2); queueMicrotask(() => child.emit('exit', 0, null)); };
  child.kill = () => assert.fail('a settled disposable context must close without forced termination');
  child.stdin.write = line => {
    const request = JSON.parse(line); writes.push(request);
    const reply = result => queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, result }) + '\n'));
    if (request.method === 'initialize') reply({});
    if (request.method === 'thread/start') reply({ cwd: target, thread: { id: 'owned-context', cwd: target, ephemeral: true } });
    if (request.method === 'mcpServerStatus/list') {
      assert.equal(request.params.serverName, undefined, 'discovery must also finish the sibling governance connection');
      reply({ data: [
        { name: 'agdf-cockpit', pluginId: 'agdf@agdf', runtimeStatus: 'connected', tools: {} },
        { name: 'agdf', pluginId: 'agdf@agdf', runtimeStatus: ++inventories === 1 ? 'connecting' : 'connected', tools: {} },
      ] });
    }
  };
  const result = await observeCodexOrigins({ target, command: { executable: 'fixture', prefixArgs: [] }, spawnProcess: () => child });
  assert.equal(result.status, 'observed');
  assert.deepEqual(result.providers.map(row => row.server_id), ['agdf-cockpit']);
  assert.equal(inventories, 2); assert.equal(writes.some(row => row.method === 'turn/start'), false);
});
test('an inventory at the exhausted deadline cannot substitute for confirmed host exit', async () => {
  const target = process.cwd(), child = new EventEmitter();
  child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = new EventEmitter();
  child.stdin.end = () => assert.fail('the exhausted observation has no teardown budget');
  child.kill = () => { child.killed = true; };
  child.stdin.write = line => {
    const request = JSON.parse(line);
    const result = request.method === 'initialize' ? {} : request.method === 'thread/start'
      ? { cwd: target, thread: { id: 'deadline-context', cwd: target, ephemeral: true } } : { data: [] };
    if (request.id) queueMicrotask(() => child.stdout.emit('data', JSON.stringify({ id: request.id, result }) + '\n'));
  };
  let readings = 0;
  const result = await observeCodexOrigins({ target, now: () => readings++ ? 45000 : 0,
    command: { executable: 'fixture', prefixArgs: [] }, spawnProcess: () => child });
  assert.deepEqual(result, { status: 'unavailable', reason: 'teardown_unconfirmed' });
  assert.equal(child.killed, true);
});
