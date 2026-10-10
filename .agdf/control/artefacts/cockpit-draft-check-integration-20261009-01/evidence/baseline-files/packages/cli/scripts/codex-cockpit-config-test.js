import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { codexAdapter } from '../lib/mcp-lifecycle/adapters/codex.js';

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
  } finally { rmSync(target, { recursive: true, force: true }); }
});
