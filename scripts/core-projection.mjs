import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const repoRoot = fileURLToPath(new URL('../', import.meta.url));
export const cliRoot = join(repoRoot, 'packages', 'cli');
export const coreRoot = join(repoRoot, 'packages', 'core');
export const mcpRoot = join(repoRoot, 'packages', 'mcp-server');
export const coreImports = Object.freeze({ '#agdf-core': './runtime/core/lib/index.js', '#agdf-core/*': './runtime/core/lib/*' });
export function projectCore(packageRoot, { copilot = false } = {}) {
  const target = join(packageRoot, 'runtime', 'core');
  // The entire projection is build-owned. Replacing only lib retains sibling copies
  // that the runtime inventory would otherwise adopt as required payload files.
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(join(coreRoot, 'lib'), join(target, 'lib'), { recursive: true });
  // Copilot exposes the default dispatcher/inspector, never the private Codex cockpit.
  // Keep the shared snapshot owner: default artifact-readiness imports it too.
  if (copilot) for (const module of [
    'control-inspect/cockpit.js', 'control-inspect/cockpit-backlog.js', 'control-inspect/cockpit-contract.js', 'control-inspect/cockpit-session.js', 'control-inspect/cockpit-context.js',
    'control-inspect/cockpit-list.js', 'control-inspect/cockpit-list.d.ts',
    'control-read/cockpit-pool.js', 'control-read/cockpit-worker.js', 'control-read/control-changes.js',
  ]) rmSync(join(target, 'lib', module));
  // Only the explicit build-owned resource descriptor differs from private source composition.
  const contracts = copilot ? '../../skills/contracts/' : 'plugins/agdf/meta/contracts/';
  writeFileSync(join(target, 'lib', 'resources', 'binding.js'), `// Generated resource binding; canonical Core implementation bytes are copied unchanged.\nexport const packageURL = new URL("../../../../", import.meta.url);\nexport const generatedURL = new URL("generated/", packageURL);\nexport const contractsURL = new URL(${JSON.stringify(contracts)}, ${copilot ? 'packageURL' : 'generatedURL'});\n`);
  return target;
}
export function projectPrivateCoreResources() {
  const target = join(coreRoot, 'generated', 'plugins', 'agdf', 'meta');
  mkdirSync(target, { recursive: true });
  for (const name of ['agdf-plugin.definition.json', 'agdf-interaction-locales.json']) cpSync(join(repoRoot, 'plugins', 'agdf', 'meta', name), join(target, name));
  rmSync(join(target, 'contracts'), { recursive: true, force: true });
  cpSync(join(repoRoot, 'plugins', 'agdf', 'meta', 'contracts'), join(target, 'contracts'), { recursive: true });
}
