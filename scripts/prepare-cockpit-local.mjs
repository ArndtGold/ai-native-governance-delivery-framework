// Opt-in local preparation. Writes only the owned profile and reviewable connection snippet.
import { readFileSync, writeFileSync, realpathSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { digestDirectory, digestMcpDispatcherPackage } from '../packages/core/lib/runtime/plugin-provenance.js';
import { execFileSync } from 'node:child_process';
import { isAbsolute, join } from 'node:path';
import { assembleNpm } from './assemble-npm.mjs';
import { repoRoot } from './core-projection.mjs';
import { prepareLocalMcpPackageSources } from '../packages/cli/lib/installers/local-development.js';
import { prepareMcpServerPackage, inspectMcpServerPackage } from '../packages/cli/lib/mcp-lifecycle/package.js';
import { runMcpLifecycle } from '../packages/cli/lib/mcp-lifecycle/service.js';

export function prepareCockpitLocal({ target, nodeExecutable = process.execPath } = {}) {
  if (typeof target !== 'string' || !isAbsolute(target) || !isAbsolute(nodeExecutable)) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const root = realpathSync(target);
  if (!lstatSync(root).isDirectory()) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const packages = assembleNpm({ surface: 'codex', cockpit: true });
  const profile = join(repoRoot, 'dist', 'local', 'codex-cockpit');
  const version = packages[0].version;
  const dispatcherPackageRoot = packages.find(row => row.name === 'create-agdf').output;
  const mcpServerPackageRoot = packages.find(row => row.name === '@agdf/mcp-server').output;
  const sourceIdentity = createHash('sha256').update(JSON.stringify({ version, nodeExecutable,
    server: digestDirectory(mcpServerPackageRoot), dispatcher: digestMcpDispatcherPackage(dispatcherPackageRoot) })).digest('hex');
  const dataRoot = join(profile, 'runtime', 'generations', sourceIdentity);
  const exec = (command, args, options) => execFileSync(command, args, { ...options,
    env: { ...process.env, npm_config_cache: join(profile, '.npm-cache'), npm_config_fetch_retries: '0', npm_config_fetch_timeout: '20000' } });
  const sources = prepareLocalMcpPackageSources({ dataRoot, dispatcherPackageRoot, mcpServerPackageRoot, expectedVersion: version, exec });
  let runtime;
  try {
    const existing = inspectMcpServerPackage({ dataRoot, expectedVersion: version });
    if (!['matched', 'absent'].includes(existing.status)) throw Error('AGDF_COCKPIT_RUNTIME_UNOWNED');
    runtime = prepareMcpServerPackage({ dataRoot, immutable: true, expectedVersion: version, execPath: nodeExecutable,
      packageSpec: sources.packageSpec, dispatcherPackageSpec: sources.dispatcherPackageSpec, exec });
    const args = [runtime.entrypoint, '--surface', 'codex', '--cockpit-dir', root];
    const config = `[mcp_servers.agdf-cockpit]\ncommand = ${JSON.stringify(nodeExecutable)}\nargs = ${JSON.stringify(args)}\n`;
    const configPath = join(profile, 'codex-project-config.toml');
    writeFileSync(configPath, config);
    const ui = JSON.parse(readFileSync(join(runtime.packageRoot, 'ui', 'manifest.json'), 'utf8'));
    const result = { schema_version: '1', profile: 'codex-cockpit', name: 'agdf-cockpit', display_name: 'AGDF Cockpit', target: root,
      role: 'cockpit', runtime_root: runtime.root, lifecycle_owner: 'create-agdf:mcp-runtime',
      node: nodeExecutable, version, config_path: configPath, entrypoint: runtime.entrypoint,
      server_digest: runtime.digest, dispatcher_digest: runtime.dispatcherDigest, sdk_digest: runtime.sdkDigest,
      ui, activated: false, authorizes: false };
    writeFileSync(join(profile, 'preparation.json'), JSON.stringify(result, null, 2) + '\n');
    if (runtime.digest !== digestDirectory(mcpServerPackageRoot) || runtime.dispatcherDigest !== digestMcpDispatcherPackage(dispatcherPackageRoot)) throw Error('AGDF_COCKPIT_SOURCE_CHANGED');
    runtime.commit();
    return result;
  } catch (error) { runtime?.rollback(); throw error; }
  finally { sources.cleanup(); }
}

// Explicit opt-in through the existing role/transaction owner; preparation never activates.
export function setCockpitLocal({ preparation, action, env = process.env } = {}) {
  if (preparation?.profile !== 'codex-cockpit' || preparation.name !== 'agdf-cockpit' || preparation.activated !== false) throw Error('AGDF_COCKPIT_PREPARATION_INVALID');
  return runMcpLifecycle({ action, surface: 'codex', scope: 'project', role: 'cockpit', serverId: preparation.name,
    target: preparation.target, execPath: preparation.node, env,
    preparedRuntime: { root: preparation.runtime_root, digest: preparation.server_digest,
      dispatcherDigest: preparation.dispatcher_digest, sdkDigest: preparation.sdk_digest } });
}
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url))) {
  if (process.argv.length !== 4 || process.argv[2] !== '--dir') throw Error('AGDF_COCKPIT_ARGUMENTS_INVALID');
  console.log(JSON.stringify(prepareCockpitLocal({ target: process.argv[3] }), null, 2));
}
