// Opt-in local preparation. Writes only the owned profile and reviewable connection snippet.
import { readFileSync, writeFileSync, realpathSync, lstatSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isAbsolute, join } from 'node:path';
import { assembleNpm } from './assemble-npm.mjs';
import { repoRoot } from './core-projection.mjs';
import { prepareLocalMcpPackageSources } from '../packages/cli/lib/installers/local-development.js';
import { prepareMcpServerPackage, inspectMcpServerPackage, createMcpRuntimeRetirementTransaction } from '../packages/cli/lib/mcp-lifecycle/package.js';

export function prepareCockpitLocal({ target, nodeExecutable = process.execPath } = {}) {
  if (typeof target !== 'string' || !isAbsolute(target) || !isAbsolute(nodeExecutable)) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const root = realpathSync(target);
  if (!lstatSync(root).isDirectory()) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const packages = assembleNpm({ surface: 'codex', cockpit: true });
  const profile = join(repoRoot, 'dist', 'local', 'codex-cockpit');
  const dataRoot = join(profile, 'runtime');
  const version = packages[0].version;
  const dispatcherPackageRoot = packages.find(row => row.name === 'create-agdf').output;
  const mcpServerPackageRoot = packages.find(row => row.name === '@agdf/mcp-server').output;
  const exec = (command, args, options) => execFileSync(command, args, { ...options,
    env: { ...process.env, npm_config_cache: join(profile, '.npm-cache'), npm_config_fetch_retries: '0', npm_config_fetch_timeout: '20000' } });
  const sources = prepareLocalMcpPackageSources({ dataRoot, dispatcherPackageRoot, mcpServerPackageRoot, expectedVersion: version, exec });
  let retirement, runtime;
  try {
    const existing = inspectMcpServerPackage({ dataRoot, expectedVersion: version });
    if (existing.status === 'matched') {
      const configPath = join(root, '.codex', 'config.toml');
      if (existsSync(configPath) && readFileSync(configPath, 'utf8').includes('[mcp_servers.agdf-cockpit-local]')) {
        throw Error('AGDF_COCKPIT_RUNTIME_REGISTERED: stop/remove the named cockpit connection before replacing its owned runtime');
      }
      retirement = createMcpRuntimeRetirementTransaction(existing);
      retirement.apply();
    } else if (existing.status !== 'absent') throw Error('AGDF_COCKPIT_RUNTIME_UNOWNED');
    runtime = prepareMcpServerPackage({ dataRoot, expectedVersion: version, execPath: nodeExecutable,
      packageSpec: sources.packageSpec, dispatcherPackageSpec: sources.dispatcherPackageSpec, exec });
    const args = [runtime.entrypoint, '--surface', 'codex', '--cockpit-dir', root];
    const config = `[mcp_servers.agdf-cockpit-local]\ncommand = ${JSON.stringify(nodeExecutable)}\nargs = ${JSON.stringify(args)}\ncwd = ${JSON.stringify(root)}\nstartup_timeout_sec = 20\ntool_timeout_sec = 15\n`;
    const configPath = join(profile, 'codex-project-config.toml');
    writeFileSync(configPath, config);
    const ui = JSON.parse(readFileSync(join(runtime.packageRoot, 'ui', 'manifest.json'), 'utf8'));
    const result = { schema_version: '1', profile: 'codex-cockpit', name: 'agdf-cockpit-local', target: root,
      node: nodeExecutable, version, config_path: configPath, entrypoint: runtime.entrypoint,
      server_digest: runtime.digest, dispatcher_digest: runtime.dispatcherDigest, sdk_digest: runtime.sdkDigest,
      ui, activated: false, authorizes: false };
    writeFileSync(join(profile, 'preparation.json'), JSON.stringify(result, null, 2) + '\n');
    runtime.commit(); retirement?.commit();
    return result;
  } catch (error) { runtime?.rollback(); retirement?.rollback(); throw error; }
  finally { sources.cleanup(); }
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url))) {
  if (process.argv.length !== 4 || process.argv[2] !== '--dir') throw Error('AGDF_COCKPIT_ARGUMENTS_INVALID');
  console.log(JSON.stringify(prepareCockpitLocal({ target: process.argv[3] }), null, 2));
}
