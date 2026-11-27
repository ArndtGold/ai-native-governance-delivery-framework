import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkpointExecutableBootBoundary, createExecutableBootBoundary } from '../lib/companion/executable-boot-boundary.js';
import { createCodexContinuationAdmission } from '../lib/companion/codex-continuation.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';

const before = randomUUID(), after = randomUUID();
function fixture(t) {
  const data = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-boot-boundary-')));
  t.after(() => rmSync(data, { recursive: true, force: true }));
  const root = join(data, 'mcp/generations', 'a'.repeat(64), '0.32.0');
  mkdirSync(join(root, '.agdf-executable-claims'), { recursive: true });
  const scope = { root: data, target_id: resolveControlCommandTarget(data).target_id, run_id: 'fixture', revision_id: randomUUID(), operation_key: 'implementation.execute' };
  const retain = (bootId, token = randomUUID()) => {
    const name = token + '.json', path = join(root, '.agdf-executable-claims', name);
    writeFileSync(path, JSON.stringify({ schema_version: bootId ? 2 : 1, ...(bootId && { boot_id: bootId }),
      owner: 'create-agdf:mcp-runtime', root, token, owner_epoch: randomUUID(), generation: 1,
      server_digest: '1'.repeat(64), dispatcher_digest: '2'.repeat(64), sdk_digest: '3'.repeat(64) }));
    return { name, path };
  };
  const authority = bootId => createCodexContinuationAdmission(data, { bootId });
  return { data, root, scope, retain, authority, manifest: join(data, 'mcp/executable-boot-boundary.json') };
}

test('an exact legacy checkpoint survives a new OS boot without erasing retained executable evidence', t => {
  const f = fixture(t), old = f.retain(), bytes = readFileSync(old.path, 'utf8');
  assert.deepEqual(checkpointExecutableBootBoundary(f.data, before), { state: 'checkpointed', captured: 1, unknown: 0 });
  assert.deepEqual(f.authority(before).inspect(f.scope), { state: 'unavailable', legacy_runtime: true, boot_restart_required: true });
  assert.equal(f.authority(after).inspect(f.scope).state, 'ready');
  checkpointExecutableBootBoundary(f.data, after);
  assert.equal(f.authority(after).inspect(f.scope).state, 'ready', 'startup does not replace the first observed boot');
  assert.equal(readFileSync(old.path, 'utf8'), bytes);
  assert.equal(f.authority(after).claim(f.scope, {}, () => true).admitted, true);
  assert.equal(f.authority(after).claim(f.scope, {}, () => true).admitted, undefined);
});

test('a later legacy claim blocks again; elapsed time and a repeated checkpoint cannot clear it', t => {
  const f = fixture(t); f.retain(); checkpointExecutableBootBoundary(f.data, before);
  f.retain();
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable', 'new token has no old-boot proof');
  checkpointExecutableBootBoundary(f.data, after);
  assert.equal(f.authority(after).inspect(f.scope).boot_restart_required, true);
  checkpointExecutableBootBoundary(f.data, after);
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable');
});

test('new executable claims carry boot identity without requiring a legacy checkpoint', t => {
  const f = fixture(t), old = f.retain(before);
  assert.equal(createExecutableBootBoundary(f.data, before)(f.root, old.name), 'same_boot');
  assert.equal(createExecutableBootBoundary(f.data, after)(f.root, old.name), 'ended');
  assert.equal(f.authority(after).inspect(f.scope).state, 'ready');
  f.retain(after);
  assert.equal(f.authority(after).inspect(f.scope).boot_restart_required, true);
});

test('boot proof never releases an uncertain handoff or an uncorrelated running claim', t => {
  const f = fixture(t), view = randomUUID();
  const reservation = f.authority(before).reserve(f.scope, view, () => true);
  f.authority(before).publish(f.scope, view, reservation.attempt_id, () => true);
  f.retain(); checkpointExecutableBootBoundary(f.data, before);
  assert.equal(f.authority(after).inspect(f.scope).state, 'pending');
  assert.equal(f.authority(after).claim(f.scope, {}, () => true).admitted, undefined);
  const receiving = f.authority(after).claim(f.scope, { attemptId: reservation.attempt_id }, () => true);
  assert.equal(receiving.admitted, true);
  assert.equal(f.authority(randomUUID()).inspect(f.scope).state, 'running', 'OS boot is not the per-Run work result');
});

test('changed, unknown and malformed records stay protected and a damaged checkpoint is never overwritten', t => {
  const f = fixture(t), old = f.retain(); checkpointExecutableBootBoundary(f.data, before);
  writeFileSync(old.path, readFileSync(old.path, 'utf8') + ' ');
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable', 'only exact captured bytes are known');
  writeFileSync(old.path, '{}');
  assert.equal(checkpointExecutableBootBoundary(f.data, before).unknown, 1);
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable');
  writeFileSync(f.manifest, 'broken');
  assert.throws(() => checkpointExecutableBootBoundary(f.data, after));
  assert.equal(readFileSync(f.manifest, 'utf8'), 'broken');
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable');
});

test('an unavailable native boot identity supplies no release or checkpoint authority', t => {
  const f = fixture(t); f.retain(before);
  assert.equal(f.authority(null).inspect(f.scope).state, 'unavailable');
  assert.deepEqual(checkpointExecutableBootBoundary(f.data, 'not-an-os-boot-id'), { state: 'unavailable' });
});

test('a producer-declared shared admission generation coexists without requiring another computer restart', t => {
  const f = fixture(t), old = f.retain(before);
  const value = JSON.parse(readFileSync(old.path, 'utf8'));
  writeFileSync(old.path, JSON.stringify({ ...value, admission_protocol: 'codex-shared-v1' }));
  assert.equal(f.authority(before).inspect(f.scope).state, 'ready', 'same-boot compatible generations share the Run guard');
  assert.equal(f.authority(null).inspect(f.scope).state, 'ready', 'compatibility does not depend on optional OS boot support');
  assert.equal(f.authority(before).claim(f.scope, {}, () => true).admitted, true);
  assert.equal(f.authority(before).claim(f.scope, {}, () => true).admitted, undefined);
});

test('a retained publication staging file is reconciled only by its exact old-boot checkpoint', t => {
  const f = fixture(t), token = randomUUID();
  const path = join(f.data, 'mcp/generations', 'a'.repeat(64), `.agdf-publication.lock.${token}.pending`);
  const bytes = JSON.stringify({ schema_version: 1, pid: 123, token, started_at: '2026-11-27T10:00:00.000Z' });
  writeFileSync(path, bytes);
  checkpointExecutableBootBoundary(f.data, before);
  assert.equal(f.authority(before).inspect(f.scope).boot_restart_required, true);
  assert.equal(f.authority(after).inspect(f.scope).state, 'ready');
  assert.equal(readFileSync(path, 'utf8'), bytes, 'publication evidence is not removed or reclaimed');
});

test('an already connected admission reader observes a later checkpoint and rejects later file edits', t => {
  const f = fixture(t), old = f.retain(), admission = f.authority(after);
  assert.equal(admission.inspect(f.scope).state, 'unavailable');
  checkpointExecutableBootBoundary(f.data, before);
  assert.equal(admission.inspect(f.scope).state, 'ready');
  assert.equal(admission.inspect(f.scope).state, 'ready', 'cached identity is still current');
  writeFileSync(old.path, readFileSync(old.path, 'utf8') + ' ');
  assert.equal(admission.inspect(f.scope).state, 'unavailable', 'a changed file invalidates cached proof');
});

test('linked and oversized checkpoints cannot certify or overwrite historical ownership', t => {
  const f = fixture(t); f.retain();
  const foreign = join(f.data, 'foreign.json'); writeFileSync(foreign, '{}');
  try { symlinkSync(foreign, f.manifest); }
  catch (error) { if (['EPERM', 'ENOSYS', 'EACCES'].includes(error.code)) return t.skip('native symlink capability unavailable'); throw error; }
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable');
  assert.throws(() => checkpointExecutableBootBoundary(f.data, before));
  assert.equal(readFileSync(foreign, 'utf8'), '{}');
  rmSync(f.manifest); writeFileSync(f.manifest, ' '.repeat(12 * 1024 * 1024 + 1));
  assert.throws(() => checkpointExecutableBootBoundary(f.data, before));
  assert.equal(f.authority(after).inspect(f.scope).state, 'unavailable');
});
