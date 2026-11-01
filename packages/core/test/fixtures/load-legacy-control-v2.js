import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
export function legacyControlV2(t) {
  const compressed = readFileSync(new URL('./agdf-0.20.2-control-v2.json.gz', import.meta.url));
  if (hash(compressed) !== 'sha256:81261fe1af30463c514e85789c210cc5956c06dcc78ca35b5e08fb4c776a682c') throw Error('legacy_fixture_digest_mismatch');
  const fixture = JSON.parse(gunzipSync(compressed, { maxOutputLength: 8 * 1024 * 1024 }));
  if (fixture.schema_version !== 1 || fixture.version !== '0.20.2' || fixture.source_kind !== 'installed_pre_feature_runtime'
    || fixture.source_base_commit !== '8e482d913289f0d2b466128d6d2a0d8b5815f0a3' || fixture.files.length !== 69) throw Error('legacy_fixture_provenance_mismatch');
  const root = mkdtempSync(join(tmpdir(), 'agdf-frozen-v2-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const names = new Set();
  for (const file of fixture.files) {
    if (typeof file.path !== 'string' || !/^[a-zA-Z0-9_.\/-]+$/u.test(file.path) || file.path.startsWith('/')
      || file.path.split('/').some(name => !name || name === '.' || name === '..') || names.has(file.path)) throw Error('legacy_fixture_path_invalid');
    const bytes = Buffer.from(file.base64, 'base64');
    if (bytes.toString('base64') !== file.base64 || hash(bytes) !== file.digest) throw Error('legacy_fixture_source_mismatch');
    names.add(file.path);
    const path = join(root, file.path); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, bytes);
  }
  return { root, provenance: { version: fixture.version, source_kind: fixture.source_kind, runtime_digest: fixture.runtime_digest } };
}
