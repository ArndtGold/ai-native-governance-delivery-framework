import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cliRoot, coreRoot, mcpRoot, repoRoot, projectCore, coreImports } from './core-projection.mjs';
const OWNER = 'agdf:npm-assembly';
export function assembleNpm({ beforePublish, surface } = {}) {
  if (surface && !['codex', 'claude', 'copilot', 'opencode'].includes(surface)) throw new Error('AGDF_ASSEMBLY_SURFACE_INVALID');
  const dist = surface ? join(repoRoot, 'dist', 'local', surface) : join(repoRoot, 'dist');
  const output = join(dist, 'npm');
  for (const root of relative(repoRoot, output).split(sep).map((_, index, parts) => join(repoRoot, ...parts.slice(0, index + 1)))) if (existsSync(root) && (lstatSync(root).isSymbolicLink() || !lstatSync(root).isDirectory())) throw new Error('AGDF_ASSEMBLY_PATH_INVALID');
  if (existsSync(output) && JSON.parse(readFileSync(join(output, 'assembly.json'), 'utf8')).owner !== OWNER) throw new Error('AGDF_ASSEMBLY_FOREIGN_OUTPUT');
  const definition = JSON.parse(readFileSync(join(repoRoot, 'plugins/agdf/meta/agdf-plugin.definition.json'), 'utf8'));
  const coreManifest = JSON.parse(readFileSync(join(coreRoot, 'package.json'), 'utf8'));
  if (coreManifest.private !== true || coreManifest.version !== definition.version) throw new Error('AGDF_ASSEMBLY_CORE_VERSION_SKEW');
  const sources = { 'create-agdf': cliRoot, agdf: join(cliRoot, 'distribution/agdf'), 'agdf-mcp-server': mcpRoot };
  mkdirSync(dist, { recursive: true });
  const stage = mkdtempSync(join(dist, '.npm-stage-')), backup = `${stage}-previous`;
  const results = [];
  let moved = false, published = false;
  try {
    for (const [name, source] of Object.entries(sources)) {
      const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
      if (manifest.version !== definition.version) throw new Error(`AGDF_ASSEMBLY_VERSION_SKEW: ${name}`);
      const target = join(stage, name); mkdirSync(target);
      const excludedProfiles = surface ? new Set([
        'generated/submissions/openai/agdf',
        ...(surface === 'copilot' ? [] : ['generated/plugins/copilot/agdf']),
        ...(surface === 'opencode' ? [] : ['generated/.opencode', 'generated/opencode.json']),
      ]) : new Set();
      manifest.files = manifest.files.filter(entry => !excludedProfiles.has(entry));
      for (const entry of manifest.files) {
        if (!existsSync(join(source, entry))) throw new Error(`AGDF_ASSEMBLY_SOURCE_MISSING: ${name}/${entry}`);
        cpSync(join(source, entry), join(target, entry), { recursive: true });
      }
      cpSync(join(repoRoot, 'LICENSE'), join(target, 'LICENSE'));
      delete manifest.devDependencies;
      manifest.scripts = {};
      if (name === 'create-agdf') { projectCore(target); manifest.imports = coreImports; manifest.files = [...new Set([...manifest.files, 'runtime/core'])]; }
      writeFileSync(join(target, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
      results.push({ name: manifest.name, version: manifest.version, source, output: join(output, name) });
    }
    writeFileSync(join(stage, 'assembly.json'), JSON.stringify({ owner: OWNER, version: definition.version, packages: results }, null, 2) + '\n');
    beforePublish?.({ stage, output });
    if (existsSync(output)) { renameSync(output, backup); moved = true; }
    renameSync(stage, output); published = true;
    if (moved) rmSync(backup, { recursive: true });
    return results;
  } catch (error) {
    if (moved && !published && !existsSync(output)) renameSync(backup, output);
    throw error;
  } finally {
    if (!published) rmSync(stage, { recursive: true, force: true });
  }
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) console.log(JSON.stringify(assembleNpm(), null, 2));
