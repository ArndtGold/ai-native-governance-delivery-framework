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
  // The Claude Code installation drift check has no Copilot consumer either.
  if (copilot) for (const module of [
    'runtime/host-installation.js',
    'control-inspect/cockpit.js', 'control-inspect/cockpit-backlog.js', 'control-inspect/cockpit-contract.js', 'control-inspect/cockpit-session.js', 'control-inspect/cockpit-context.js',
    'control-inspect/cockpit-list.js', 'control-inspect/cockpit-list.d.ts',
    'control-read/cockpit-pool.js', 'control-read/cockpit-worker.js', 'control-read/control-changes.js',
    'control-inspect/decision-session.js',
    'control-state/decision-action-service.js',
    'control-state/decision-action-contract.js', 'interaction-catalog.d.ts',
  ]) rmSync(join(target, 'lib', module));
  // Only the explicit build-owned resource descriptor differs from private source composition.
  writeFileSync(join(target, 'lib', 'resources', 'binding.js'), renderProjectedBinding({ copilot }));
  return target;
}
// Package-shipped resources are authoritative. An environment plugin root may overlay them only
// when its runtime manifest carries this package's exact version, so a stale or foreign root can
// never supply contracts or templates. Template roots are probed in layout order: plugin bundle
// (<plugin>/runtime/create-agdf → <plugin>/control/templates), then the npm package copy.
export function renderProjectedBinding({ copilot = false } = {}) {
  // Copilot moves the dispatcher into an isolated generation, so its contracts may come from the
  // version-matched plugin root; the other hosts keep the package-shipped generated contracts.
  const contracts = copilot
    ? 'export const contractsURL = (pluginRoot ? directoryURL(join(pluginRoot, "skills", "contracts")) : null)\n  ?? new URL("../../skills/contracts/", packageURL);'
    : 'export const contractsURL = new URL("plugins/agdf/meta/contracts/", generatedURL);';
  return [
    '// Generated resource binding; canonical Core implementation bytes are copied unchanged.',
    'import { existsSync, readFileSync } from "node:fs";',
    'import { isAbsolute, join, sep } from "node:path";',
    'import process from "node:process";',
    'import { fileURLToPath, pathToFileURL } from "node:url";',
    'export const packageURL = new URL("../../../../", import.meta.url);',
    'export const generatedURL = new URL("generated/", packageURL);',
    'function readVersion(path) {',
    '  try { return JSON.parse(readFileSync(path, "utf8")).version ?? null; } catch { return null; }',
    '}',
    'function directoryURL(path) {',
    '  return existsSync(path) ? pathToFileURL(`${path}${sep}`) : null;',
    '}',
    '// Only an absolute, exact-version-matched plugin root overlays the package-shipped resources.',
    'function trustedPluginRoot() {',
    '  const root = process.env.AGDF_DISPATCH_PLUGIN_ROOT;',
    '  if (!root || !isAbsolute(root)) return null;',
    '  const packageVersion = readVersion(fileURLToPath(new URL("package.json", packageURL)));',
    '  return packageVersion !== null && readVersion(join(root, "runtime", "runtime-manifest.json")) === packageVersion ? root : null;',
    '}',
    'const pluginRoot = trustedPluginRoot();',
    contracts,
    'export const templatesURL = (pluginRoot ? directoryURL(join(pluginRoot, "control", "templates")) : null)',
    '  ?? directoryURL(fileURLToPath(new URL("../../control/templates/", packageURL)))',
    '  ?? directoryURL(fileURLToPath(new URL("plugins/agdf/control/templates/", generatedURL)))',
    '  ?? null;',
    '',
  ].join('\n');
}
export function projectPrivateCoreResources() {
  const target = join(coreRoot, 'generated', 'plugins', 'agdf', 'meta');
  mkdirSync(target, { recursive: true });
  for (const name of ['agdf-plugin.definition.json', 'agdf-interaction-locales.json']) cpSync(join(repoRoot, 'plugins', 'agdf', 'meta', name), join(target, name));
  rmSync(join(target, 'contracts'), { recursive: true, force: true });
  cpSync(join(repoRoot, 'plugins', 'agdf', 'meta', 'contracts'), join(target, 'contracts'), { recursive: true });
}
