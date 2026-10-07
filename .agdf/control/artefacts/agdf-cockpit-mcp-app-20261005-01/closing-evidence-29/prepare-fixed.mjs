import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, lstatSync, renameSync, existsSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { prepareCockpitLocal } from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/scripts/prepare-cockpit-local.mjs';
import { inspectMcpServerPackage } from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/lib/mcp-lifecycle/package.js';
const root = '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const profile = root + '/dist/local/codex-cockpit', path = root + '/.codex/config.toml';
const before = readFileSync(path), empty = Buffer.alloc(0), mode = lstatSync(path).mode & 0o777;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(before), '9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9');
assert.equal(before.toString(), readFileSync(profile + '/codex-project-config.toml', 'utf8'));
assert.equal((before.toString().match(/^\[/gm) || []).length, 1);
assert(!lstatSync(path).isSymbolicLink());
const oldPreparation = JSON.parse(readFileSync(profile + '/preparation.json'));
const owned = inspectMcpServerPackage({ dataRoot: profile + '/runtime', expectedVersion: '0.14.5' });
assert.equal(owned.status, 'matched'); assert.equal(owned.references.length, 0);
assert.equal(owned.digest, oldPreparation.server_digest);
const ps = spawnSync('/bin/ps', ['-axo', 'pid=,command='], { encoding: 'utf8' });
assert.equal(ps.status, 0);
assert.equal(ps.stdout.split('\n').filter(line => line.trim().replace(/^\d+\s+/, '').startsWith(oldPreparation.node + ' ' + owned.entrypoint + ' ')).length, 0);
function replace(expected, next) {
  assert.deepEqual(readFileSync(path), expected, 'never overwrite a foreign configuration change');
  assert(!lstatSync(path).isSymbolicLink());
  const tmp = root + '/.codex/.cockpit-prepare-29-' + process.pid + '.tmp';
  try { writeFileSync(tmp, next, { flag: 'wx', mode }); assert.deepEqual(readFileSync(path), expected); renameSync(tmp, path); }
  finally { if (existsSync(tmp)) unlinkSync(tmp); }
}
let result;
replace(before, empty);
try {
  result = prepareCockpitLocal({ target: root, nodeExecutable: oldPreparation.node });
  assert.equal(readFileSync(result.config_path, 'utf8'), before.toString());
  assert.equal(inspectMcpServerPackage({ dataRoot: profile + '/runtime', expectedVersion: '0.14.5' }).status, 'matched');
} finally { replace(empty, before); }
writeFileSync('/private/tmp/cockpit-prepared-29-fixed.json', JSON.stringify({ schema_version: '1', authorizes: false,
  old_preparation: oldPreparation, preparation: result, config_exactly_restored: true,
  global_or_plugin_configuration_changed: false, native_reconnect: 'pending', completed_at: new Date().toISOString() }, null, 2) + '\n');
console.log(JSON.stringify({ status: 'pass', server_digest: result.server_digest, ui: result.ui, config_exactly_restored: true }));
