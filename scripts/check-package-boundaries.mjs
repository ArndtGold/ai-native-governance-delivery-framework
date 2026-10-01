import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'acorn';
import { coreRoot, repoRoot } from './core-projection.mjs';
const files = root => readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]);
const graph = new Map();
for (const file of files(join(coreRoot, 'lib')).filter(file => file.endsWith('.js'))) {
  const source = readFileSync(file, 'utf8');
  assert.doesNotMatch(source, /(?:from|import\s*\()\s*["']node:(?:child_process|readline|net|http|https|tls|dgram|dns)/u);
  const dependencies = [];
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if ((['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) && node.source) || node.type === 'ImportExpression') {
      assert.equal(node.source.type, 'Literal', 'Core dynamic imports need an explicit bounded owner');
      const specifier = node.source.value;
      if (!specifier.startsWith('node:')) {
        assert.ok(specifier.startsWith('.'), `Core external import ${specifier}`);
        const target = resolve(dirname(file), specifier);
        assert.ok(!relative(coreRoot, target).startsWith('..'), `Core backimport ${target}`);
        assert.ok(existsSync(target), `Core import missing ${target}`); dependencies.push(target);
      }
    }
    for (const value of Object.values(node)) { if (Array.isArray(value)) value.forEach(walk); else if (value?.type) walk(value); }
  }
  walk(parse(source, { ecmaVersion: 'latest', sourceType: 'module' })); graph.set(file, dependencies);
}
const visited = new Set(), visiting = new Set();
function visit(file) { if (visiting.has(file)) throw new Error(`Core cycle ${file}`); if (visited.has(file)) return; visiting.add(file); (graph.get(file) ?? []).forEach(visit); visiting.delete(file); visited.add(file); }
[...graph.keys()].forEach(visit);
const manifest = JSON.parse(readFileSync(join(coreRoot, 'package.json'), 'utf8'));
assert.equal(manifest.private, true); assert.equal(manifest.engines.node, '>=22'); assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0);
const fixture = mkdtempSync(join(tmpdir(), 'agdf-core-isolation-'));
try {
  cpSync(coreRoot, join(fixture, 'core'), { recursive: true, filter: path => !path.includes('node_modules') && !path.includes('/test') });
  const entry = pathToFileURL(join(fixture, 'core/lib/index.js')).href;
  const result = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { createCoreServices, resources, createResourceContext } from ${JSON.stringify(entry)};
    const service = createCoreServices();
    assert.equal(Object.isFrozen(resources.pluginDefinition), true);
    assert.equal(Object.isFrozen(resources.interactionLocales), true);
    assert.equal(service.readRuntimeContract('quality').ok, true);
    assert.equal(service.readRuntimeContract('../../secret').reason, 'module_unknown');
    assert.throws(() => service.readSkillRuntimeContracts('unknown'), /runtime_contracts_unavailable/);
    assert.throws(() => createResourceContext({}), /runtime_resources_unavailable/);
    const packageURL = new URL('./core/', ${JSON.stringify(pathToFileURL(fixture+'/').href)});
    assert.throws(() => createResourceContext({ packageURL, generatedURL: new URL('generated/', packageURL), contractsURL: new URL('generated/plugins/agdf/meta/contracts/', packageURL), expectedVersion: '0.0.0' }), /runtime_resources_unavailable/);
    console.log('isolated Core: immutable resources, contracts, locale and version bounds passed');
  `], { cwd: fixture, env: { ...process.env, AGDF_DISPATCH_PLUGIN_ROOT: '/untrusted/client', AGDF_PLUGIN_ROOT: '/untrusted/client' }, encoding: 'utf8' });
  console.log(result.trim());
  const metadata = join(fixture, 'core/generated/plugins/agdf/meta');
  const definitionPath = join(metadata, 'agdf-plugin.definition.json');
  const localePath = join(metadata, 'agdf-interaction-locales.json');
  for (const [path, mutate] of [
    [definitionPath, value => { value.runtimeContract.modules.push('meta/contracts/../secret.md'); }],
    [definitionPath, value => { value.runtimeContract.modules.push(value.runtimeContract.modules[0]); }],
    [localePath, value => { value.fallbackLocale = 'missing'; }],
    [localePath, value => { delete value.locales.en; }],
    [join(fixture, 'core/package.json'), value => { delete value.version; }],
  ]) {
    const original = readFileSync(path);
    const value = JSON.parse(original); mutate(value); writeFileSync(path, JSON.stringify(value));
    assert.throws(() => execFileSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(entry)})`], { cwd: fixture, encoding: 'utf8', stdio: 'pipe' }));
    writeFileSync(path, original);
  }
  console.log('negative definition/module/locale/package-version fixtures reject before service creation');

  rmSync(join(fixture, 'core/generated/plugins/agdf/meta/contracts/quality.md'));
  const failure = execFileSync(process.execPath, ['--input-type=module', '-e', `import assert from 'node:assert/strict'; import { createCoreServices } from ${JSON.stringify(entry)}; const service = createCoreServices(); assert.equal(service.readRuntimeContract('quality').reason,'module_unavailable'); assert.throws(()=>service.readSkillRuntimeContracts('code-review'),/runtime_contracts_unavailable/); console.log('missing resource stays unavailable without checkout or environment fallback');`], { cwd: fixture, encoding: 'utf8' });
  console.log(failure.trim());
} finally { rmSync(fixture, { recursive: true, force: true }); }
console.log(`Core boundary and cycle checks passed (${graph.size} modules).`);
