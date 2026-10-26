import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { copilotAdapter } from '../lib/mcp-lifecycle/adapters/copilot.js';
import { opencodeAdapter } from '../lib/mcp-lifecycle/adapters/opencode.js';
import { createMcpDispatchRuntime } from '../lib/mcp-dispatch-runtime.js';

function fixture(body) {
  const root = mkdtempSync(join(tmpdir(), 'agdf-mcp-config-'));
  const target = join(root, 'project'); mkdirSync(target);
  const env = { COPILOT_HOME: join(root, 'copilot'), OPENCODE_CONFIG_DIR: join(root, 'opencode') };
  const spec = { command: 'node', args: ['/fixture/agdf-mcp.js'], version: '0.20.1', digest: 'fixture',
    scope: 'project', target, host: { config_variant: 'flat_v1' } };
  const input = { scope: 'project', target, env, spec, exec: () => '{}' };
  const write = (path, content) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); };
  try { return body({ root, target, env, spec, input, write }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test('Copilot manual registration exposes every default server tool', () => fixture(({ input }) => {
  const tx = copilotAdapter.createTransaction({ ...input, action: 'enable' }); tx.apply();
  const configured = JSON.parse(readFileSync(tx.path, 'utf8')).mcpServers.agdf;
  assert.deepEqual(configured.tools, createMcpDispatchRuntime({ surface: 'copilot' }).tools.map(tool => tool.name));
  assert.equal(copilotAdapter.inspect(input).status, 'matched');
  tx.rollback(); assert.equal(existsSync(tx.path), false);
}));

for (const wrapped of [false, true]) test(`Copilot detects and preserves higher-priority ${wrapped ? 'wrapped' : 'bare'} entries`, () => fixture(({ input, target, write }) => {
  const path = join(target, '.mcp.json'), server = { type: 'local', command: '/foreign', args: [] };
  const content = JSON.stringify(wrapped ? { mcpServers: { agdf: server } } : { agdf: server }); write(path, content);
  const result = copilotAdapter.inspect(input);
  assert.equal(result.status, 'precedence_conflict'); assert.equal(result.effective_source, 'project_override');
  assert.throws(() => copilotAdapter.createTransaction({ ...input, action: 'enable' }), /PRECEDENCE_CONFLICT/);
  assert.equal(readFileSync(path, 'utf8'), content); assert.equal(existsSync(join(target, '.github/mcp.json')), false);
}));

test('Copilot updates and disables an owned bare file without nesting or touching foreign servers', () => fixture(({ input, target, write }) => {
  const path = join(target, '.github/mcp.json'), foreign = { type: 'local', command: '/foreign', args: [] };
  write(path, JSON.stringify({ other: foreign }));
  const enable = copilotAdapter.createTransaction({ ...input, action: 'enable' }); enable.apply();
  const current = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(current.mcpServers, undefined); assert.deepEqual(current.other, foreign);
  assert.equal(copilotAdapter.inspect(input).status, 'matched');
  const update = copilotAdapter.createTransaction({ ...input, action: 'enable', previousSpec: input.spec,
    spec: { ...input.spec, args: ['/fixture/new.js'] } }); update.apply();
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')).agdf.args, ['/fixture/new.js']);
  update.rollback(); assert.equal(readFileSync(path, 'utf8'), `${JSON.stringify(current, null, 2)}\n`);
  copilotAdapter.createTransaction({ ...input, action: 'disable' }).apply();
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { other: foreign });
}));

for (const scope of ['project', 'user']) for (const nested of [false, true]) {
  test(`OpenCode ${scope} ${nested ? 'v2' : 'v1'} edits JSONC in place and restores it exactly`, () => fixture(({ input, env, target, spec, write }) => {
    const path = join(scope === 'project' ? target : env.OPENCODE_CONFIG_DIR, 'opencode.jsonc');
    const content = '{\n  // Keep model choice, Unicode and comment-like string data.\n  "model": "provider/😀//model",\n  "flags": [true/*adjacent*/, false,],\n  "mcp": {' + (nested ? '"servers": {' : '')
      + '\n    /* foreign server */ "other": {"type":"local","command":["other"],},\n' + (nested ? '},' : '') + '\n  },\n}\n';
    write(path, content);
    const options = { ...input, scope, spec: { ...spec, scope, host: { config_variant: nested ? 'nested_v2' : 'flat_v1' } } };
    const tx = opencodeAdapter.createTransaction({ ...options, action: 'enable' });
    assert.equal(tx.path, path); tx.apply();
    const enabled = readFileSync(path, 'utf8');
    assert.ok(enabled.includes('// Keep model choice')); assert.ok(enabled.includes('"model": "provider/😀//model"'));
    assert.ok(enabled.includes('/*adjacent*/')); assert.ok(enabled.includes('/* foreign server */ "other": {"type":"local","command":["other"],},'));
    assert.equal(opencodeAdapter.inspect(options).status, 'matched');
    assert.equal(existsSync(path.slice(0, -1)), false, 'no parallel JSON configuration');
    const disable = opencodeAdapter.createTransaction({ ...options, action: 'disable' }); disable.apply();
    assert.equal(opencodeAdapter.inspect(options).status, 'absent');
    assert.ok(readFileSync(path, 'utf8').includes('/* foreign server */'));
    disable.rollback(); assert.equal(readFileSync(path, 'utf8'), enabled);
    tx.rollback(); assert.equal(readFileSync(path, 'utf8'), content);
  }));
}

test('OpenCode recognizes foreign JSONC entries and never overwrites them', () => fixture(({ input, target, write }) => {
  const path = join(target, 'opencode.jsonc'), content = '{/*keep*/"mcp":{"agdf":{"type":"local","command":["foreign"],},},}';
  write(path, content); assert.equal(opencodeAdapter.inspect(input).status, 'foreign');
  assert.throws(() => opencodeAdapter.createTransaction({ ...input, action: 'enable' }), /REGISTRATION_FOREIGN/);
  assert.equal(readFileSync(path, 'utf8'), content);
}));

test('OpenCode sees JSON entries beneath JSONC without creating a shadow registration', () => fixture(({ input, target, write }) => {
  const json = join(target, 'opencode.json'), jsonc = join(target, 'opencode.jsonc');
  write(json, '{"mcp":{"agdf":{"type":"local","command":["foreign"]}}}'); write(jsonc, '{//preferences\n"model":"other",}');
  assert.equal(opencodeAdapter.inspect(input).status, 'foreign');
  assert.throws(() => opencodeAdapter.createTransaction({ ...input, action: 'enable' }), /REGISTRATION_FOREIGN/);
  write(json, '{"mcp":{"other":{"type":"local","command":["other"]}}}');
  const tx = opencodeAdapter.createTransaction({ ...input, action: 'enable' }); tx.apply();
  assert.equal(opencodeAdapter.inspect(input).status, 'matched');
  assert.equal(tx.path, jsonc); assert.ok(readFileSync(json, 'utf8').includes('"other"'));
}));

test('OpenCode JSONC overrides JSON server definitions', () => fixture(({ input, target, write }) => {
  const tx = opencodeAdapter.createTransaction({ ...input, action: 'enable' }); tx.apply();
  write(join(target, 'opencode.jsonc'), '{"mcp":{"agdf":{"type":"local","command":["foreign"]}},}');
  const result = opencodeAdapter.inspect(input);
  assert.equal(result.status, 'foreign'); assert.ok(result.path.endsWith('.jsonc'));
}));

test('OpenCode parses custom and inline JSONC without mistaking string contents for comments', () => fixture(({ input, root, env, write }) => {
  const content = '{"mcp":{"agdf":{"type":"local","command":["https://example/*literal*/"],},},}';
  env.OPENCODE_CONFIG = join(root, 'custom.jsonc'); write(env.OPENCODE_CONFIG, content);
  assert.equal(opencodeAdapter.inspect(input).effective_source, 'custom');
  env.OPENCODE_CONFIG_CONTENT = content;
  assert.equal(opencodeAdapter.inspect(input).effective_source, 'inline');
}));

for (const order of ['first', 'middle', 'last', 'trailing']) test(`OpenCode removes its ${order} entry without damaging neighboring JSONC`, () => fixture(({ input, target, write }) => {
  const tx = opencodeAdapter.createTransaction({ ...input, action: 'enable' }); tx.apply();
  const own = JSON.stringify(JSON.parse(readFileSync(tx.path, 'utf8')).mcp.agdf);
  rmSync(tx.path);
  const other = '"other":{"type":"local","command":["other"]}', more = '"more":{"type":"local","command":["more"]}';
  const members = order === 'first' ? `"agdf":${own},/*keep*/${other}` : order === 'middle'
    ? `${other},"agdf":${own},/*keep*/${more}` : `${other},/*keep*/"agdf":${own}${order === 'trailing' ? ',' : ''}`;
  const path = join(target, 'opencode.jsonc'); write(path, `{"mcp":{${members}}}`);
  assert.equal(opencodeAdapter.inspect(input).status, 'matched');
  opencodeAdapter.createTransaction({ ...input, action: 'disable' }).apply();
  assert.equal(opencodeAdapter.inspect(input).status, 'absent');
  const after = readFileSync(path, 'utf8'); assert.ok(after.includes(other)); assert.ok(after.includes('/*keep*/'));
}));

test('OpenCode preserves JSONC syntax even in a .json file and migrates its owned schema', () => fixture(({ input, target, write }) => {
  const path = join(target, 'opencode.json'); write(path, '{//keep\n"model":"provider/model",}');
  opencodeAdapter.createTransaction({ ...input, action: 'enable' }).apply();
  const updated = { ...input, spec: { ...input.spec, host: { config_variant: 'nested_v2' } } };
  assert.equal(opencodeAdapter.inspect(updated).status, 'owned_mismatch');
  opencodeAdapter.createTransaction({ ...updated, previousSpec: input.spec, action: 'enable' }).apply();
  assert.equal(opencodeAdapter.inspect(updated).status, 'matched');
  opencodeAdapter.createTransaction({ ...updated, action: 'disable' }).apply();
  assert.equal(opencodeAdapter.inspect(updated).status, 'absent');
  assert.ok(readFileSync(path, 'utf8').includes('//keep'));
}));

for (const content of ['{/*unterminated', '{"mcp":{},"mcp":{}}', '{"a":[,]}', '{"a":true,,}', '{"mcp":[]}', '{"mcp":{"servers":[]}}']) {
  test(`OpenCode rejects malformed or ambiguous JSONC: ${content}`, () => fixture(({ input, target, write }) => {
    const path = join(target, 'opencode.jsonc'); write(path, content);
    assert.throws(() => opencodeAdapter.createTransaction({ ...input, action: 'enable' }), /CONFIG_INVALID/);
    assert.equal(readFileSync(path, 'utf8'), content);
  }));
}
