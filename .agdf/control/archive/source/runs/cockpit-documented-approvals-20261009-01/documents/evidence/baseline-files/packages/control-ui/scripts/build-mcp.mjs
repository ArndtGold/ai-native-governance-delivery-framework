import { build } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS } from '../../core/lib/control-inspect/cockpit-contract.js';
import { writeDesignTokens } from '../../../pages/scripts/design-tokens.mjs';

writeDesignTokens();
const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({ root, build: { write: false, cssCodeSplit: false, assetsInlineLimit: Infinity,
  rolldownOptions: { input: join(root, 'mcp.html'), output: { codeSplitting: false } } } });
const output = Array.isArray(result) ? result[0].output : result.output;
const files = new Map(output.map(item => [item.fileName, item.type === 'chunk' ? item.code : String(item.source)]));
let html = files.get('mcp.html');
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
const manifest = { schema_version: '1', uri: COCKPIT_UI_URI, mime_type: COCKPIT_MIME, bytes,
  digest: 'sha256:' + createHash('sha256').update(html).digest('hex') };
const directory = join(root, 'dist-mcp');
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, 'cockpit.html'), html);
writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest));
