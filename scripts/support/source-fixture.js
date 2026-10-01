import { cpSync, existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const repository = fileURLToPath(new URL('../../', import.meta.url));
export function copySourceFixture(target, { git = false, dependencies = true } = {}) {
  mkdirSync(target, { recursive: true });
  const excluded = new Set(['node_modules', '.git', 'generated', 'dist', '.astro']);
  for (const name of ['packages', 'scripts', 'evals', 'plugins', 'pages', '.agdf', '.agents', '.claude-plugin', '.github', 'LICENSE', 'NOTICE', 'README.md', 'INSTALL.md', 'docs', 'package.json', 'package-lock.json']) {
    if (existsSync(join(repository, name))) cpSync(join(repository, name), join(target, name), { recursive: true,
      filter: source => !excluded.has(source.split(/[/\\]/u).at(-1)) && !source.replaceAll('\\', '/').includes('/packages/cli/runtime') });
  }
  if (dependencies) copyFixtureDependencies(target);
  if (git) cpSync(join(repository, '.git'), join(target, '.git'), { recursive: true });
  return target;
}
export function copyFixtureDependencies(target) {
  // Copy bundled third-party dependencies, then create links pointing only inside the fixture.
  cpSync(join(repository, 'node_modules'), join(target, 'node_modules'), { recursive: true, verbatimSymlinks: true,
    filter: source => !['@agdf', 'create-agdf'].includes(source.split(/[/\\]/u).at(-1)) });
  for (const [name, local] of [['@agdf/core', 'packages/core'], ['create-agdf', 'packages/cli']]) {
    const link = join(target, 'node_modules', name); mkdirSync(join(link, '..'), { recursive: true });
    symlinkSync(relative(join(link, '..'), join(target, local)), link, 'junction');
  }
  const serverDependencies = join(repository, 'packages/mcp-server/node_modules');
  cpSync(serverDependencies, join(target, 'packages/mcp-server/node_modules'), { recursive: true, dereference: true,
    filter: source => source.split(/[/\\]/u).at(-1) !== 'create-agdf' });
}
