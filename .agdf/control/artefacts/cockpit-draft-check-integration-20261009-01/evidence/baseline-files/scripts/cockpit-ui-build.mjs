// Single validation owner for the built cockpit MCP app resource (packages/control-ui build:mcp).
// Used by the npm cockpit assembly and the Claude plugin build; both ship these exact bytes.
import { lstatSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_UI_URI } from '../packages/core/lib/control-inspect/cockpit-contract.js';
import { repoRoot } from './core-projection.mjs';

export const COCKPIT_UI_BUILD_ROOT = join(repoRoot, 'packages', 'control-ui', 'dist-mcp');
export const COCKPIT_UI_BUILD_COMMAND = 'npm --prefix packages/control-ui run build:mcp';

export function readCockpitUiBuild({ uiRoot = COCKPIT_UI_BUILD_ROOT, failure = 'AGDF_COCKPIT_UI_INVALID' } = {}) {
  let build;
  try {
    for (const path of [uiRoot, join(uiRoot, 'manifest.json'), join(uiRoot, 'cockpit.html')]) if (lstatSync(path).isSymbolicLink()) throw Error();
    const html = readFileSync(join(uiRoot, 'cockpit.html'));
    const manifestBytes = readFileSync(join(uiRoot, 'manifest.json'));
    const manifest = JSON.parse(manifestBytes.toString('utf8'));
    if (html.length > COCKPIT_LIMITS.html || manifest.bytes !== html.length || manifest.uri !== COCKPIT_UI_URI
      || manifest.mime_type !== COCKPIT_MIME || manifest.schema_version !== '1'
      || manifest.digest !== 'sha256:' + createHash('sha256').update(html).digest('hex')) throw Error();
    build = Object.freeze({ root: uiRoot, manifest, files: Object.freeze({ 'manifest.json': manifestBytes, 'cockpit.html': html }) });
  } catch { throw new Error(failure); }
  return build;
}
