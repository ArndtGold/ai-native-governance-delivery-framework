import { readFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function loadCockpitResource({ uri, mimeType, limit, kind = 'cockpit', directory = new URL('../ui/', import.meta.url) } = {}) {
  try {
    if (!['cockpit', 'decision'].includes(kind)) throw Error();
    const manifestURL = new URL(kind === 'decision' ? 'decision-manifest.json' : 'manifest.json', directory), htmlURL = new URL(kind + '.html', directory);
    for (const url of [directory, manifestURL, htmlURL]) if (lstatSync(url).isSymbolicLink()) throw Error();
    const manifest = JSON.parse(readFileSync(manifestURL, 'utf8'));
    const stat = lstatSync(htmlURL);
    if (!stat.isFile() || !Number.isSafeInteger(limit) || stat.size > limit) throw Error();
    const bytes = readFileSync(htmlURL);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (manifest.schema_version !== '1' || manifest.uri !== uri || manifest.mime_type !== mimeType
      || manifest.bytes !== bytes.length || manifest.digest !== `sha256:${digest}`) throw Error();
    const text = new TextDecoder('utf8', { fatal: true }).decode(bytes);
    return { uri, mimeType, text, digest,
      _meta: { ui: { csp: { connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [] } } } };
  } catch { throw new TypeError('AGDF_COCKPIT_UI_INVALID'); }
}
