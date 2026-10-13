import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { CODEX_PLUGIN_LIST_MAX_BUFFER, inspectCodexPlugin } from '../lib/host-adapters/codex/plugin.js';
import { pluginDefinition } from '../lib/cli/runtime-context.js';

// Owned subprocesses only: no native Codex call, installation or network access.
const program = `process.stdout.write('agdf@agdf  installed, enabled  ${pluginDefinition.version}  /owned-fixture\\n'); process.stdout.write('x'.repeat(Number(process.argv[1])));`;
const run = (size, expectedOptions) => (_command, _args, options) => {
  assert.equal(options.maxBuffer, expectedOptions);
  return execFileSync(process.execPath, ['-e', program, String(size)], options);
};
assert.throws(() => execFileSync(process.execPath, ['-e', program, String(2 * 1024 * 1024)], { encoding: 'utf8', stdio: 'pipe' }), error => error.code === 'ENOBUFS');
assert.equal(inspectCodexPlugin(run(2 * 1024 * 1024, CODEX_PLUGIN_LIST_MAX_BUFFER), {}, 'codex').status, 'healthy');
assert.equal(inspectCodexPlugin(run(5 * 1024 * 1024, CODEX_PLUGIN_LIST_MAX_BUFFER), {}, 'codex').status, 'unknown', 'Over-budget output cannot verify an installation');
console.log('Codex plugin-list capture: reproduced 1 MiB ENOBUFS, verified >1 MiB exact version, retained bounded oversize rejection (owned subprocesses only).');
