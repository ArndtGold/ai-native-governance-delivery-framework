import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { releasedBaseline, extractBaseline, installedIdentity, makeOwnedStale, installBaseline } from './lib/release-lifecycle.mjs';
import { digestNormalizedPluginSource } from '../../packages/core/lib/runtime/plugin-provenance.js';
import { candidateFixture } from './test-support.mjs';
import { releasePolicy } from './lib/release-policy.mjs';

test('native entrypoints parse without running hosts or using credentials', () => {
  for (const file of ['codex-host-e2e.mjs','claude-host-e2e.mjs','release-evidence.mjs'])
    execFileSync(process.execPath, ['--check', fileURLToPath(new URL(file, import.meta.url))], { stdio: 'pipe' });
});
test('baseline subprocess stays in its isolated project instead of the invoking repository', () => {
  const work = mkdtempSync(join(tmpdir(), 'agdf-baseline-cwd-'));
  try {
    const isolated = join(work, 'isolated'); mkdirSync(isolated);
    const cli = join(work, 'baseline.cjs');
    writeFileSync(cli, 'console.log(JSON.stringify({result:"success",cwd:process.cwd(),surface:process.argv[2]}));');
    const result = installBaseline(cli, 'codex', {}, { cwd: isolated });
    assert.equal(realpathSync(result.cwd), realpathSync(isolated)); assert.equal(result.surface, 'codex');
    assert.notEqual(result.cwd, process.cwd());
  } finally { rmSync(work, { recursive: true, force: true }); }
});

function archive(entries) {
  return gzipSync(Buffer.concat([...entries.flatMap(({ name, content = '', type = '0' }) => {
    const data = Buffer.from(content), h = Buffer.alloc(512);
    h.write(name, 0, 100); h.write('0000600\0', 100); h.write('0000000\0', 108); h.write('0000000\0', 116);
    h.write(data.length.toString(8).padStart(11, '0')+'\0', 124); h.write('00000000000\0', 136); h.fill(32, 148, 156); h.write(type, 156);
    const sum = h.reduce((a,b) => a+b, 0); h.write(sum.toString(8).padStart(6,'0')+'\0 ',148);
    return [h, data, Buffer.alloc((512-data.length%512)%512)];
  }), Buffer.alloc(1024)]));
}
test('released baseline integrity and archive entry restrictions are enforced before writes', async () => {
  const work = mkdtempSync(join(tmpdir(), 'agdf-baseline-'));
  try {
    const bytes = archive([{ name: 'package/package.json', content: JSON.stringify({ name: 'create-agdf', version: '0.14.5' }) }, { name: 'package/bin/create-agdf.js', content: '// fixture\n' }]);
    const metadata = { name: 'create-agdf', version: '0.14.5', dist: { tarball: 'https://registry.npmjs.org/create-agdf/-/create-agdf-0.14.5.tgz', integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` } };
    const fetchImpl = async url => ({ ok: true, json: async () => metadata, arrayBuffer: async () => bytes });
    const baseline = await releasedBaseline(join(work, 'good'), { fetchImpl });
    assert.equal(baseline.version, '0.14.5'); assert.ok(existsSync(baseline.cli));
    const bad = structuredClone(metadata); bad.dist.integrity = `sha512-${'a'.repeat(88)}`;
    await assert.rejects(releasedBaseline(join(work, 'bad'), { fetchImpl: async () => ({ ok: true, json: async () => bad, arrayBuffer: async () => bytes }) }), /integrity_mismatch/u);
    assert.equal(existsSync(join(work,'bad')), false);
    for (const entry of [{ name: 'package/../../escape' }, { name: '/absolute' }, { name: 'package/link', type: '2' }, { name: 'package/hardlink', type: '1' }]) {
      assert.throws(() => extractBaseline(archive([entry]), join(work, 'unsafe')));
      assert.equal(existsSync(join(work, 'unsafe')), false);
    }
    const development = { ...metadata, version: '0.20.0' };
    await assert.rejects(releasedBaseline(join(work, 'development'), { fetchImpl: async () => ({ ok: true, json: async () => development }) }));
  } finally { rmSync(work, { recursive: true, force: true }); }
});
test('stale-state injection verifies complete owned provenance and refuses foreign ownership', () => {
  const root = mkdtempSync(join(tmpdir(), 'agdf-owned-'));
  try {
    mkdirSync(join(root,'runtime')); writeFileSync(join(root,'runtime/runtime-manifest.json'), JSON.stringify({ digest:'b'.repeat(64) }));
    const marker = { schema_version: 1, owner: 'create-agdf', canonical_version: '0.20.0', source_digest: digestNormalizedPluginSource(root,'0.20.0'), runtime_digest:'b'.repeat(64) };
    writeFileSync(join(root,'.agdf-installation.json'), JSON.stringify(marker));
    assert.equal(installedIdentity(root,'0.20.0').source_digest, marker.source_digest);
    writeFileSync(join(root,'.agdf-installation.json'), JSON.stringify({ ...marker, owner:'foreign' }));
    const before = readFileSync(join(root,'runtime/runtime-manifest.json'));
    assert.throws(() => makeOwnedStale(root,'0.20.0'), /owner_unknown/u);
    assert.deepEqual(readFileSync(join(root,'runtime/runtime-manifest.json')), before);
    writeFileSync(join(root,'.agdf-installation.json'), JSON.stringify(marker));
    makeOwnedStale(root,'0.20.0'); assert.throws(() => installedIdentity(root,'0.20.0'), /source_mismatch/u);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('host tiers and Codex compatibility projection have one canonical owner', () => {
  const f = candidateFixture();
  try {
    const policy = releasePolicy(f.root);
    assert.deepEqual(policy.codex, JSON.parse(readFileSync(new URL('./codex-release-policy.json',import.meta.url),'utf8')));
    const path = join(f.root,'plugins/agdf/meta/agdf-plugin.definition.json');
    const definition = JSON.parse(readFileSync(path)); definition.hostSupport.tiers.copilot='qualified'; writeFileSync(path,JSON.stringify(definition));
    assert.throws(() => releasePolicy(f.root));
  } finally { rmSync(f.root, { recursive:true, force:true }); }
});
