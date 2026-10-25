import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { codexAdapter, inspectCodexSetup, inspectCodexCockpitAdmission } from '../lib/mcp-lifecycle/adapters/codex.js';
import { codexConfigSyntax } from '../lib/host-adapters/codex/config-source.js';
import { installCodexGlobalPlugin } from '../lib/host-adapters/codex/plugin.js';
import { pluginDefinition } from '../lib/cli/runtime-context.js';

// Public synthetic counterpart of desktop Git instructions. Never copy a user's
// private config into a repository fixture or test output.
const instructions = [
  '# Both delimiters in a comment: """ and \'\'\'',
  'git-commit-instructions = """',
  'PRIVATE_CANARY 🧭: preserve Unicode offsets and example declarations.',
  '# AGDF-OWNED-MCP: {"owner":"create-agdf:mcp-runtime"}',
  '[mcp_servers.agdf]',
  'command = "/example"',
  '[mcp_servers.agdf-cockpit]',
  'enabled = false',
  '[plugins."agdf@agdf"]',
  'enabled = false',
  'mcp_servers = { example = {} }',
  'An escaped delimiter stays inside this string: \\"""',
  '"""',
  "git-pr-instructions = '''",
  '[mcp_servers.AGDF_COCKPIT]',
  'enabled = true',
  'Backslashes do not escape literal strings: \\',
  "'''",
  'quoted-delimiter = "literal \'\'\' and # within a basic string"',
].join('\n') + '\n';

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
    assert.equal(codexAdapter.inspect(input).selected_status, 'absent', 'A quoted ownership marker cannot establish a registration.');
    const quotedEnable = codexAdapter.createTransaction({ ...input, action: 'enable' });
    quotedEnable.apply();
    assert.equal(codexAdapter.inspect(input).selected_status, 'matched');
    assert.ok(readFileSync(path, 'utf8').startsWith(quoted));
    quotedEnable.rollback();
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

for (const eol of ['\n', '\r\n']) {
  test(`Multiline instructions preserve real admission, diagnosis and registration (${JSON.stringify(eol)})`, () => {
    const target = mkdtempSync(join(tmpdir(), 'agdf-codex-multiline-'));
    const user = join(target, 'user'), path = join(user, 'config.toml');
    const prefix = instructions.replaceAll('\n', eol);
    const real = '[plugins."agdf@agdf"]\nenabled = true\n[mcp_servers.foreign]\nenabled = false\n'.replaceAll('\n', eol);
    const original = prefix + real;
    const input = { target, scope: 'user', env: { CODEX_HOME: user }, exec: (_command, args) => args[1] === 'list' ? '[]' : '{}',
      spec: { command: '/node', args: ['/owned'], version: '0.20.0', digest: 'a'.repeat(64) } };
    try {
      mkdirSync(user); writeFileSync(path, original);
      const syntax = codexConfigSyntax(original);
      assert.equal(syntax.length, original.length);
      assert.deepEqual([...syntax.matchAll(/[\r\n]/g)].map(row => row.index), [...original.matchAll(/[\r\n]/g)].map(row => row.index));
      assert.equal(syntax.indexOf('[mcp_servers.foreign]'), original.indexOf('[mcp_servers.foreign]'));
      assert.equal(syntax.includes('PRIVATE_CANARY'), false);
      assert.equal(inspectCodexCockpitAdmission(input).admitted, true);
      const setup = inspectCodexSetup(input);
      assert.deepEqual(setup.entries.map(row => [row.server_id, row.configured]), [['agdf', 'declared'], ['foreign', 'disabled']]);
      assert.ok(setup.checked_sources.every(row => row.status !== 'unavailable'));
      assert.equal(JSON.stringify(setup).includes('PRIVATE_CANARY'), false);
      assert.equal(codexAdapter.inspect(input).selected_status, 'absent');
      const tx = codexAdapter.createTransaction({ ...input, action: 'enable' });
      tx.apply();
      assert.equal(codexAdapter.inspect(input).selected_status, 'matched');
      assert.ok(readFileSync(path, 'utf8').startsWith(original.trimEnd()));
      const disable = codexAdapter.createTransaction({ ...input, action: 'disable' });
      disable.apply();
      assert.equal(codexAdapter.inspect(input).selected_status, 'absent');
      disable.rollback(); tx.rollback();
      assert.equal(readFileSync(path, 'utf8'), original);
      for (const suffix of [
        '[mcp_servers.agdf-cockpit]\ncommand = "/foreign"\n',
        '[mcp_servers.agdf-cockpit]\nnotes = """\nenabled = false\n"""\n',
        '[mcp_servers.AGDF_COCKPIT]\nenabled = true\n',
        '[mcp_servers."agdf-cockpit"]\nenabled = false\n',
        '[[mcp_servers.agdf-cockpit]]\nenabled = false\n',
        '[mcp_servers]\nagdf-cockpit = {}\n',
        '"mcp_servers" = {}\n',
      ]) {
        writeFileSync(path, prefix + suffix);
        assert.equal(inspectCodexCockpitAdmission(input).admitted, false, suffix);
        assert.equal(readFileSync(path, 'utf8'), prefix + suffix);
      }
    } finally { rmSync(target, { recursive: true, force: true }); }
  });
}

test('Installer accepts unrelated multiline instructions before publishing and still blocks real conflicts', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-codex-install-multiline-'));
  const user = join(target, 'user'), path = join(user, 'config.toml');
  let preparations = 0, commits = 0;
  try {
    mkdirSync(user); writeFileSync(path, instructions);
    const input = { target, env: { CODEX_HOME: user }, migrateMcp: () => [],
      prepare() { preparations++; return { root: join(target, 'marketplace'), commit() { commits++; } }; },
      exec(command, args) {
        assert.equal(command, 'codex');
        if (args.join(' ') === 'mcp list --json') return '[]';
        if (args.join(' ') === 'plugin marketplace list --json') return '{"marketplaces":[]}';
        if (args.join(' ') === 'plugin list') return `agdf@agdf ${pluginDefinition.version}\n`;
        return '';
      } };
    assert.equal(installCodexGlobalPlugin(input).verificationStatus, 'healthy');
    assert.deepEqual([preparations, commits], [1, 1]);
    assert.equal(readFileSync(path, 'utf8'), instructions);
    writeFileSync(path, instructions + '[mcp_servers.agdf-cockpit]\ncommand = "/foreign"\n');
    assert.throws(() => installCodexGlobalPlugin(input), /Cockpit server identity/);
    assert.deepEqual([preparations, commits], [1, 1], 'A real conflict stops before publication.');
  } finally { rmSync(target, { recursive: true, force: true }); }
});

test('String boundaries handle escapes, literal quotes, closing runs and comments without leaking example fields', () => {
  for (const quote of ['"', "'"]) for (const extra of [0, 1, 2]) {
    const source = `prompt = ${quote.repeat(3)}\n[mcp_servers.agdf-cockpit]\nenabled = false\n${quote.repeat(3 + extra)}\n[real]\nenabled = true\n`;
    assert.equal(codexConfigSyntax(source).includes('mcp_servers'), false);
    assert.ok(codexConfigSyntax(source).includes('[real]\nenabled = true'));
  }
  const source = 'notes = """\n' + String.raw`escaped \"""` + '\n[mcp_servers.agdf-cockpit]\n"""\n[real]\nenabled = true # """\n';
  assert.equal(codexConfigSyntax(source).includes('mcp_servers'), false);
  assert.ok(codexConfigSyntax(source).includes('[real]\nenabled = true'));
});

test('Unclosed or oversized sources stay unavailable and cannot publish or mutate a registration', () => {
  const target = mkdtempSync(join(tmpdir(), 'agdf-codex-invalid-string-'));
  const path = join(target, '.codex/config.toml');
  const input = { target, scope: 'project', env: { CODEX_HOME: join(target, 'user') },
    spec: { command: '/node', args: [], version: '0.20.0', digest: 'a'.repeat(64) } };
  try {
    mkdirSync(join(target, '.codex'));
    for (const content of ['prompt = """\n[real]\n', "prompt = '''\n[real]\n", 'prompt = "unclosed\n',
      'prompt = "bad\\\ncontinued"\n', '#'.repeat(65_537)]) {
      writeFileSync(path, content);
      assert.throws(() => codexAdapter.createTransaction({ ...input, action: 'enable' }), /CONFIG_INVALID/);
      assert.equal(inspectCodexCockpitAdmission(input).admitted, false);
      assert.ok(inspectCodexSetup(input).checked_sources.some(row => row.status === 'unavailable'));
      assert.equal(readFileSync(path, 'utf8'), content);
    }
    writeFileSync(path, '[mcp_servers.foreign]\nenabled = """\nfalse\n"""\n');
    assert.equal(inspectCodexSetup(input).entries[0].configured, 'unknown');
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
  // A real 10 ms timer can fire before Date.now() reaches the deadline. Pin the
  // exhausted observation budget; teardown uncertainty has its own test below.
  let readings = 0;
  child.stdin.end = () => assert.fail('the timed-out observation has no teardown budget');
  const result = await observeCodexOrigins({ target: process.cwd(), timeoutMs: 10, now: () => readings++ ? 10 : 0,
    command: { executable: 'fixture', prefixArgs: [] }, spawnProcess: () => child });
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
