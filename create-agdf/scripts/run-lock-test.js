import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  writeFileSync(lock, "ambiguous lock\n");
  assert.throws(() => withOwnedFileLock(path, () => {}), /AGDF_RUN_WRITE_LOCKED/);
  assert.equal(readFileSync(lock, "utf8"), "ambiguous lock\n");
  const deadOwner = { ...liveOwner, pid: 2147483647, token: randomUUID() };
  writeFileSync(lock, `${JSON.stringify(deadOwner)}\n`);
  assert.equal(withOwnedFileLock(path, () => "reclaimed"), "reclaimed");
  assert.throws(() => readFileSync(lock, "utf8"), /ENOENT/);
} finally { rmSync(root, { recursive: true, force: true }); }

console.log("Run lock owner recovery passed.");
