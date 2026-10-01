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
  mkdirSync(target, { recursive: true });
  rmSync(join(target, 'lib'), { recursive: true, force: true });
  cpSync(join(coreRoot, 'lib'), join(target, 'lib'), { recursive: true });
  // Only the explicit build-owned resource descriptor differs from private source composition.
  const contracts = copilot ? '../../copilot-skills/contracts/' : 'plugins/agdf/meta/contracts/';
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
