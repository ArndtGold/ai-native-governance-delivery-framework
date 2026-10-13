import { build } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS } from '../../core/lib/control-inspect/cockpit-contract.js';
import { DECISION_UI_URI } from '../../core/lib/mcp-resource-contract.js';
import { writeDesignTokens } from '../../../pages/scripts/design-tokens.mjs';
import { mcpUiSourceDigest } from '../../../scripts/cockpit-ui-build.mjs';

writeDesignTokens();
const sourceDigest = mcpUiSourceDigest();
const root = fileURLToPath(new URL('../', import.meta.url));
for (const resource of [{ input: 'mcp.html', html: 'cockpit.html', manifest: 'manifest.json', uri: COCKPIT_UI_URI },
  { input: 'decision.html', html: 'decision.html', manifest: 'decision-manifest.json', uri: DECISION_UI_URI }]) {
const result = await build({ root, build: { write: false, cssCodeSplit: false, assetsInlineLimit: Infinity,
  rolldownOptions: { input: join(root, resource.input), output: { codeSplitting: false } } } });
const output = Array.isArray(result) ? result[0].output : result.output;
const files = new Map(output.map(item => [item.fileName, item.type === 'chunk' ? item.code : String(item.source)]));
let html = files.get(resource.input);
if (!html) throw Error('AGDF_COCKPIT_BUILD_INVALID');
html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const script = files.get(src.replace(/^\//, ''));
  if (script === undefined) throw Error('AGDF_COCKPIT_BUILD_EXTERNAL');
  return `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>`;
}).replace(/<link\b[^>]*href="([^"]+)"[^>]*>/g, (tag, href) => {
  if (!/rel="stylesheet"/.test(tag)) throw Error('AGDF_COCKPIT_BUILD_EXTERNAL');
  const css = files.get(href.replace(/^\//, ''));
  if (css === undefined) throw Error('AGDF_COCKPIT_BUILD_EXTERNAL');
  return `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
});
const bytes = Buffer.byteLength(html, 'utf8');
if (bytes > COCKPIT_LIMITS.html) throw Error('AGDF_COCKPIT_BUILD_LIMIT');
const manifest = { schema_version: '1', uri: resource.uri, mime_type: COCKPIT_MIME, bytes,
  digest: 'sha256:' + createHash('sha256').update(html).digest('hex'), source_digest: sourceDigest };
if (mcpUiSourceDigest() !== sourceDigest) throw Error('AGDF_UI_SOURCE_CHANGED_DURING_BUILD');
const directory = join(root, 'dist-mcp');
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, resource.html), html);
writeFileSync(join(directory, resource.manifest), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
}
