import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cliRoot, coreRoot, mcpRoot, repoRoot, projectCore, coreImports } from './core-projection.mjs';
import { createHash } from 'node:crypto';
import { COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS } from '../packages/core/lib/control-inspect/cockpit-contract.js';
import { renameSyncWithRetry } from '../packages/core/lib/fs-swap.js';
const OWNER = 'agdf:npm-assembly';
export function assembleNpm({ beforePublish, surface, cockpit = false } = {}) {
  if (surface && !['codex', 'claude', 'copilot', 'opencode'].includes(surface)) throw new Error('AGDF_ASSEMBLY_SURFACE_INVALID');
  if (typeof cockpit !== 'boolean' || cockpit && surface !== 'codex') throw new Error('AGDF_ASSEMBLY_COCKPIT_INVALID');
  let ui;
  if (cockpit) {
    const uiRoot = join(repoRoot, 'packages', 'control-ui', 'dist-mcp');
    for (const path of [uiRoot, join(uiRoot, 'manifest.json'), join(uiRoot, 'cockpit.html')]) if (lstatSync(path).isSymbolicLink()) throw new Error('AGDF_ASSEMBLY_UI_INVALID');
    const bytes = readFileSync(join(uiRoot, 'cockpit.html'));
    const manifest = JSON.parse(readFileSync(join(uiRoot, 'manifest.json'), 'utf8'));
    if (bytes.length > COCKPIT_LIMITS.html || manifest.bytes !== bytes.length || manifest.uri !== COCKPIT_UI_URI
      || manifest.mime_type !== COCKPIT_MIME || manifest.schema_version !== '1'
      || manifest.digest !== 'sha256:' + createHash('sha256').update(bytes).digest('hex')) throw new Error('AGDF_ASSEMBLY_UI_INVALID');
    ui = uiRoot;
  }
  const dist = surface ? join(repoRoot, 'dist', 'local', cockpit ? 'codex-cockpit' : surface) : join(repoRoot, 'dist');
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
      if (cockpit && name === 'agdf-mcp-server') {
        const directory = join(target, 'ui'); mkdirSync(directory);
        for (const file of ['manifest.json', 'cockpit.html']) cpSync(join(ui, file), join(directory, file));
        manifest.files = [...manifest.files, 'ui'];
      }
      cpSync(join(repoRoot, 'LICENSE'), join(target, 'LICENSE'));
      delete manifest.devDependencies;
      manifest.scripts = {};
      if (name === 'create-agdf') { projectCore(target); manifest.imports = coreImports; manifest.files = [...new Set([...manifest.files, 'runtime/core'])]; }
      writeFileSync(join(target, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
      results.push({ name: manifest.name, version: manifest.version, source, output: join(output, name) });
    }
    writeFileSync(join(stage, 'assembly.json'), JSON.stringify({ owner: OWNER, version: definition.version, ...(cockpit ? { profile: 'codex-cockpit' } : {}), packages: results }, null, 2) + '\n');
    beforePublish?.({ stage, output });
    if (existsSync(output)) { renameSyncWithRetry(output, backup); moved = true; }
    renameSyncWithRetry(stage, output); published = true;
    if (moved) rmSync(backup, { recursive: true });
    return results;
  } catch (error) {
    if (moved && !published && !existsSync(output)) renameSyncWithRetry(backup, output);
    throw error;
  } finally {
    if (!published) rmSync(stage, { recursive: true, force: true });
  }
}
if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) console.log(JSON.stringify(assembleNpm(), null, 2));
