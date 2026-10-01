import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, cpSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { digestDirectory } from '../packages/core/lib/runtime/plugin-provenance.js';
import { assembleNpm } from './assemble-npm.mjs';
import { repoRoot } from './core-projection.mjs';
const hash = data => createHash('sha256').update(data).digest('hex');
const fixture = mkdtempSync(join(tmpdir(), 'agdf-cutover-checkpoint-'));
try {
  const source = join(fixture, 'source.js'), output = join(fixture, 'output.js');
  cpSync(join(repoRoot, 'packages/core/lib/resources/context.js'), source);
  cpSync(join(repoRoot, 'dist/npm/create-agdf/runtime/core/lib/resources/context.js'), output);
  assert.deepEqual(readFileSync(source), readFileSync(output), 'real canonical/assembled Core pair');
  const snapshot = [source, output].map(path => ({ path, before: readFileSync(path) }));
  for (const item of snapshot) { writeFileSync(item.path, 'own changed'); item.post = hash(readFileSync(item.path)); }
  const index = Buffer.from('fixture index'); const expectedIndex = hash(index);
  function restore(actualIndex) {
    if (hash(actualIndex) !== expectedIndex || snapshot.some(item => hash(readFileSync(item.path)) !== item.post)) throw new Error('checkpoint_conflict');
    for (const item of snapshot) writeFileSync(item.path, item.before);
  }
  writeFileSync(source, 'foreign changed');
  assert.throws(() => restore(index), /checkpoint_conflict/);
  assert.equal(readFileSync(output, 'utf8'), 'own changed');
  writeFileSync(source, 'own changed');
  assert.throws(() => restore(Buffer.from('other index')), /checkpoint_conflict/);
  restore(index);
  for (const item of snapshot) assert.deepEqual(readFileSync(item.path), item.before);
  console.log('Owned source/output fixture restored together; overlapping foreign bytes and changed index reject before writes.');
  const manifest = join(repoRoot, 'dist/npm/assembly.json');
  assert.ok(existsSync(manifest), 'build before checkpoint test');
  const before = readFileSync(manifest);
  const outputDigest = digestDirectory(join(repoRoot, 'dist/npm'));
  assert.throws(() => assembleNpm({ beforePublish() { throw new Error('injected_pre_publish_failure'); } }), /injected_pre_publish_failure/);
  assert.deepEqual(readFileSync(manifest), before);
  assert.equal(digestDirectory(join(repoRoot, 'dist/npm')), outputDigest, 'all three prior owned assemblies unchanged');
  assert.equal(readdirSync(join(repoRoot, 'dist')).some(name => name.startsWith('.npm-stage-')), false);
  console.log('Real assembly pre-publish failure preserves the prior owned output and removes only its own staging directory.');
} finally { rmSync(fixture, { recursive: true, force: true }); }
