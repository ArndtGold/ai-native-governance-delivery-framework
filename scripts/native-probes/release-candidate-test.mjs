import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { candidateFixture } from './test-support.mjs';
import { candidateManifest, normalizedBytes, validateCandidate } from './lib/release-candidate.mjs';

test('candidate binds new and changed sources, locks, policies and shipped bytes', () => {
  const f = candidateFixture();
  try {
    assert.equal(validateCandidate(f.root, f.candidate, { requireClean: true }).candidate_id, f.candidate.candidate_id);
    for (const path of ['scripts/new-code.mjs', 'packages/core/input.txt', 'package-lock.json', 'dist/npm/create-agdf/input.txt']) {
      const before = (() => { try { return readFileSync(join(f.root, path)); } catch { return null; } })();
      f.put(path, 'modified\n'); assert.throws(() => validateCandidate(f.root, f.candidate), /candidate_content_mismatch/u);
      if (before) f.put(path, before); else rmSync(join(f.root, path));
    }
    f.put('scripts/binary.bin', Buffer.from([0, 13, 10]));
    const binary = candidateManifest(f.root); f.put('scripts/binary.bin', Buffer.from([0, 10]));
    assert.notEqual(candidateManifest(f.root).candidate_id, binary.candidate_id);
    const invalidUtf8 = Buffer.from([255, 13, 10]);
    assert.deepEqual(normalizedBytes(invalidUtf8), invalidUtf8);
    f.put('scripts/binary.bin', invalidUtf8);
    const invalidBinary = candidateManifest(f.root);
    f.put('scripts/binary.bin', Buffer.from([254, 13, 10]));
    assert.notEqual(candidateManifest(f.root).candidate_id, invalidBinary.candidate_id, 'distinct non-UTF8 bytes without NUL must not collapse');
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('normalized text and fixed evidence-only fields preserve content identity', () => {
  const f = candidateFixture();
  try {
    f.put('packages/core/input.txt', 'fixture\r\n');
    f.put('evals/host-compatibility/native/results.json', '{}');
    f.put('evals/host-compatibility/observations/results.json', '{}');
    f.put('evals/host-compatibility/manifest.json', JSON.stringify({ schema_version: 1, native_sources: ['new-observation'], native_targets: ['new-target'], public_evidence: ['new-evidence'], inputs: ['fixture'] }));
    assert.equal(candidateManifest(f.root).candidate_id, f.candidate.candidate_id);
    f.git('add', '.'); f.git('commit', '-qm', 'result-only');
    assert.equal(validateCandidate(f.root, f.candidate, { requireClean: true }).candidate_id, f.candidate.candidate_id);
    f.put('packages/core/input.txt', 'real code change');
    assert.throws(() => validateCandidate(f.root, f.candidate), /mismatch/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('missing payloads, forged inventory and source symlinks cannot qualify', () => {
  const f = candidateFixture();
  try {
    const forged = structuredClone(f.candidate); forged.source.pop();
    assert.throws(() => validateCandidate(f.root, forged), /modified/u);
    rmSync(join(f.root, 'dist/npm/agdf'), { recursive: true });
    assert.throws(() => candidateManifest(f.root), /payload_missing/u);
    f.put('dist/npm/agdf/input.txt', 'fixture\n');
    // Windows may disallow symlink creation without developer mode; rejection is tested where available.
    try { symlinkSync(join(f.root, 'package.json'), join(f.root, 'scripts/link.json')); }
    catch (error) { if (['EPERM','EACCES'].includes(error.code)) return; throw error; }
    assert.throws(() => candidateManifest(f.root), /symlink/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
