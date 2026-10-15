import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { withOwnedFileLock } from "../lib/control-state/run-state-writer.js";

const root = mkdtempSync(join(tmpdir(), "agdf-lock-owner-"));
const path = join(root, "RUN_STATE.md");
const lock = `${path}.lock`;
try {
  writeFileSync(path, "fixture\n");
  const liveOwner = { schema_version: 1, pid: process.pid, token: randomUUID(), started_at: "2000-01-01T00:00:00.000Z" };
  writeFileSync(lock, `${JSON.stringify(liveOwner)}\n`);
  assert.throws(() => withOwnedFileLock(path, () => {}), /AGDF_RUN_WRITE_LOCKED/);
  assert.equal(JSON.parse(readFileSync(lock, "utf8")).token, liveOwner.token);
  writeFileSync(lock + '.reclaim', 'another inspector');
  assert.throws(() => withOwnedFileLock(path, () => {}), error => error.message === 'AGDF_RUN_WRITE_LOCKED' && error.lock_owner_status === 'live');
  assert.equal(readFileSync(lock + '.reclaim', 'utf8'), 'another inspector');
  writeFileSync(lock, 'unknown owner');
  assert.throws(() => withOwnedFileLock(path, () => {}), error => error.message === 'AGDF_RUN_WRITE_LOCKED' && error.lock_owner_status !== 'live');
  rmSync(lock + '.reclaim');
  writeFileSync(lock, JSON.stringify({ pid: process.pid, token: randomUUID() }));
  assert.throws(() => withOwnedFileLock(path, () => {}), error => error.lock_owner_status === 'unknown');
  for (const malformed of [{ ...liveOwner, token: '-'.repeat(36) }, { ...liveOwner, started_at: '2026-02-30T00:00:00.000Z' }, { ...liveOwner, owner: 'foreign' }]) {
    writeFileSync(lock, JSON.stringify(malformed));
    assert.throws(() => withOwnedFileLock(path, () => {}), error => error.lock_owner_status === 'unknown');
    assert.equal(readFileSync(lock, 'utf8'), JSON.stringify(malformed));
  }
  writeFileSync(lock, 'X'.repeat(4097));
  assert.throws(() => withOwnedFileLock(path, () => {}), /AGDF_RUN_WRITE_LOCKED/);
  assert.equal(readFileSync(lock, 'utf8').length, 4097);
  writeFileSync(lock, "ambiguous lock\n");
  assert.throws(() => withOwnedFileLock(path, () => {}), /AGDF_RUN_WRITE_LOCKED/);
  assert.equal(readFileSync(lock, "utf8"), "ambiguous lock\n");
  const deadOwner = { ...liveOwner, pid: 2147483647, token: randomUUID() };
  writeFileSync(lock, `${JSON.stringify(deadOwner)}\n`);
  assert.equal(withOwnedFileLock(path, () => "reclaimed"), "reclaimed");
  assert.throws(() => readFileSync(lock, "utf8"), /ENOENT/);
  let staged = false;
  withOwnedFileLock(path, () => { assert.equal(staged, true); assert.equal(JSON.parse(readFileSync(lock, 'utf8')).schema_version, 1); },
    { checkpoint(phase) { if (phase === 'owner_staged') { staged = true; assert.equal(existsSync(lock), false, 'Incomplete owner metadata is never published.'); } } });
  assert.throws(() => withOwnedFileLock(path, () => assert.fail('Work must not start'),
    { checkpoint(phase) { if (phase === 'owner_published') throw Error('publication interrupted'); } }), /publication interrupted/);
  assert.equal(existsSync(lock), false, 'A failed handoff releases only its own published lock.');
  assert.throws(() => withOwnedFileLock(path, () => assert.fail('Work must not start'),
    { checkpoint(phase) { if (phase === 'owner_published') { writeFileSync(lock, 'foreign replacement'); throw Error('publication interrupted'); } } }), /publication interrupted/);
  assert.equal(readFileSync(lock, 'utf8'), 'foreign replacement');
} finally { rmSync(root, { recursive: true, force: true }); }

console.log("Run lock owner recovery passed.");
