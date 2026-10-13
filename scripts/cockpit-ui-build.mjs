// Single validation owner for the built cockpit MCP app resource (packages/control-ui build:mcp).
// Used by the npm cockpit assembly and the Claude plugin build; both ship these exact bytes.
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_UI_URI, DECISION_UI_URI } from '../packages/core/lib/control-inspect/cockpit-contract.js';
import { repoRoot } from './core-projection.mjs';

export const COCKPIT_UI_BUILD_ROOT = join(repoRoot, 'packages', 'control-ui', 'dist-mcp');
export const COCKPIT_UI_BUILD_COMMAND = 'npm --prefix packages/control-ui run build:mcp';

// A valid HTML digest proves its bytes, not that it was built from current UI
// sources. Both resource builds and every package consumer use this same owner.
export function mcpUiSourceDigest() {
  const files = [];
  function collect(path) {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw Error('AGDF_UI_SOURCE_INVALID');
    if (stat.isDirectory()) for (const name of readdirSync(path).sort()) collect(join(path, name));
    else if (stat.isFile()) files.push(path);
    else throw Error('AGDF_UI_SOURCE_INVALID');
  }
  for (const path of ['packages/control-ui/src', 'packages/control-ui/scripts/build-mcp.mjs',
    'packages/control-ui/mcp.html', 'packages/control-ui/decision.html', 'packages/control-ui/vite.config.mjs',
    'packages/control-ui/package.json', 'packages/control-ui/package-lock.json',
    'packages/core/lib/interaction-catalog.js', 'packages/core/lib/mcp-resource-contract.js',
    'packages/core/lib/control-inspect/cockpit-contract.js',
    'packages/core/lib/control-inspect/cockpit-list.js', 'packages/core/lib/control-state/backlog-summary-shape.js',
    'packages/core/lib/control-evaluation/backlog-vocabulary.js',
    'pages/src/design/tokens.json', 'pages/src/styles/design-tokens.css', 'pages/scripts/design-tokens.mjs',
    'scripts/cockpit-ui-build.mjs']) collect(join(repoRoot, path));
  const hash = createHash('sha256');
  for (const path of files.sort()) {
    hash.update(relative(repoRoot, path).replaceAll('\\', '/')); hash.update('\0');
    hash.update(readFileSync(path)); hash.update('\0');
  }
  return 'sha256:' + hash.digest('hex');
}

export function readCockpitUiBuild({ uiRoot = COCKPIT_UI_BUILD_ROOT, failure = 'AGDF_COCKPIT_UI_INVALID' } = {}) {
  return readBuiltUi(uiRoot, failure, 'manifest.json', 'cockpit.html', COCKPIT_UI_URI);
}
export function readDecisionUiBuild({ uiRoot = COCKPIT_UI_BUILD_ROOT, failure = 'AGDF_DECISION_UI_INVALID' } = {}) {
  return readBuiltUi(uiRoot, failure, 'decision-manifest.json', 'decision.html', DECISION_UI_URI);
}
function readBuiltUi(uiRoot, failure, manifestName, htmlName, uri) {
  let build;
  try {
    for (const path of [uiRoot, join(uiRoot, manifestName), join(uiRoot, htmlName)]) if (lstatSync(path).isSymbolicLink()) throw Error();
    const html = readFileSync(join(uiRoot, htmlName));
    const manifestBytes = readFileSync(join(uiRoot, manifestName));
    const manifest = JSON.parse(manifestBytes.toString('utf8'));
    if (html.length > COCKPIT_LIMITS.html || manifest.bytes !== html.length || manifest.uri !== uri
      || manifest.mime_type !== COCKPIT_MIME || manifest.schema_version !== '1'
      || manifest.digest !== 'sha256:' + createHash('sha256').update(html).digest('hex')
      || manifest.source_digest !== mcpUiSourceDigest()) throw Error();
    build = Object.freeze({ root: uiRoot, manifest, files: Object.freeze({ [manifestName]: manifestBytes, [htmlName]: html }) });
  } catch { throw new Error(failure); }
  return build;
}
