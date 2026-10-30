import { randomUUID } from "node:crypto";
import { channel } from "node:diagnostics_channel";
import { closeSync, fchmodSync, fstatSync, fsyncSync, existsSync, lstatSync, linkSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { renameSyncWithRetry } from "./fs-swap.js";

// Shared durable file primitives. Run semantics remain in control-state/run-state-writer.js.
export function fsyncDirectory(path) {
  if (process.platform === "win32") return;
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

export function atomicWrite(path, content, { checkpoint = () => {}, temporaryPath } = {}) {
  let previousMode;
  if (existsSync(path)) {
    const destination = lstatSync(path);
    if (destination.isSymbolicLink() || !destination.isFile()) {
      throw new Error("AGDF_RUN_PATH_INVALID");
    }
    previousMode = destination.mode & 0o777;
  }

  const parent = lstatSync(dirname(path));
  if (parent.isSymbolicLink() || !parent.isDirectory()) {
    throw new Error("AGDF_RUN_PATH_INVALID");
  }

  const temp = temporaryPath ?? `${path}.tmp-${process.pid}-${randomUUID()}`;
  if (typeof temp !== 'string' || temp === path || dirname(temp) !== dirname(path)) throw new Error('AGDF_RUN_PATH_INVALID');
  let descriptor;

  try {
    descriptor = openSync(temp, "wx", 0o600);
    checkpoint("temp_opened");
    writeFileSync(descriptor, content, "utf8");
    checkpoint("temp_written");
    if (previousMode !== undefined && process.platform !== "win32") fchmodSync(descriptor, previousMode);
    fsyncSync(descriptor);
    checkpoint("after_file_sync");
    closeSync(descriptor);
    descriptor = undefined;

    // Windows scanners briefly lock fresh files; the same bounded retry as the marketplace swap.
    checkpoint("before_rename");
    renameSyncWithRetry(temp, path);
    checkpoint("after_rename");
    fsyncDirectory(dirname(path));
    checkpoint("after_directory_sync");
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temp);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") throw cleanupError;
    }
    throw error;
  }
}

function lockError(path) {
  const error = new Error("AGDF_RUN_WRITE_LOCKED");
  error.lock_path = path;
  // A simultaneous reclaim inspection can hold the short guard while the real
  // publication owner is live. Classify only a stable, regular, bounded owner
  // record; this does not reclaim, remove or authorize a wait for an unknown lock.
  try {
    const before = lstatSync(path);
    if (before.isFile() && !before.isSymbolicLink() && before.size <= 4096) {
      const bytes = readFileSync(path, 'utf8'), owner = JSON.parse(bytes), after = lstatSync(path);
      if (before.dev === after.dev && before.ino === after.ino && !after.isSymbolicLink()
        && readFileSync(path, 'utf8') === bytes && ownerState(owner) === 'live') error.lock_owner_status = 'live';
    }
  } catch {}
  return error;
}

const LOCK_TOKEN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iu;

function validOwnerRecord(owner) {
  return Boolean(owner) && Object.keys(owner).sort().join(',') === 'pid,schema_version,started_at,token'
    && owner.schema_version === 1 && typeof owner.started_at === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(owner.started_at)
    && Number.isFinite(Date.parse(owner.started_at)) && new Date(owner.started_at).toISOString() === owner.started_at
    && Number.isSafeInteger(owner.pid) && owner.pid > 0
    && typeof owner.token === "string" && LOCK_TOKEN.test(owner.token);
}

function ownerState(owner) {
  if (!validOwnerRecord(owner)) return "unknown";
  try {
    process.kill(owner.pid, 0);
    return "live";
  } catch (error) {
    return error?.code === "ESRCH" ? "gone" : "unknown";
  }
}

function reclaimAbandonedLock(path) {
  const guard = `${path}.reclaim`;
  let descriptor;
  try {
    descriptor = openSync(guard, "wx");
  } catch {
    throw lockError(path);
  }
  try {
    let original;
    try {
      const file = lstatSync(path);
      if (!file.isFile() || file.size > 4096) throw lockError(path);
      original = readFileSync(path, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    let owner;
    try { owner = JSON.parse(original); } catch { owner = null; }
    const status = ownerState(owner);
    if (status !== "gone") {
      const error = lockError(path);
      error.lock_owner_status = status;
      throw error;
    }
    if (!lstatSync(path).isFile() || readFileSync(path, "utf8") !== original) throw lockError(path);
    unlinkSync(path);
    fsyncDirectory(dirname(path));
  } finally {
    closeSync(descriptor);
    unlinkSync(guard);
  }
}

function publishOwnedLock(lockPath, owner, checkpoint) {
  const stagedPath = `${lockPath}.${owner.token}.pending`;
  const descriptor = openSync(stagedPath, 'wx', 0o600);
  const created = fstatSync(descriptor);
  let published = false;
  try {
    writeFileSync(descriptor, `${JSON.stringify(owner)}\n`, 'utf8'); fsyncSync(descriptor);
    checkpoint('owner_staged');
    // Exclusive hard-link publication exposes one complete record or EEXIST,
    // never the previous visible-but-empty owner window. Both names are local
    // to this directory and inode; a changed staging path cannot be adopted.
    const staged = lstatSync(stagedPath);
    if (staged.isSymbolicLink() || staged.dev !== created.dev || staged.ino !== created.ino) throw lockError(lockPath);
    linkSync(stagedPath, lockPath);
    published = true;
    checkpoint('owner_published');
    unlinkSync(stagedPath);
    return descriptor;
  } catch (error) {
    // Failure before handing off the descriptor must not strand our live lock.
    // Never unlink a replaced or modified owner record.
    try {
      if (published) {
        const current = lstatSync(lockPath);
        if (!current.isSymbolicLink() && current.dev === created.dev && current.ino === created.ino
          && readFileSync(lockPath, 'utf8') === `${JSON.stringify(owner)}\n`) unlinkSync(lockPath);
      }
    } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') throw cleanupError; }
    finally { closeSync(descriptor); }
    try {
      const staged = lstatSync(stagedPath);
      if (!staged.isSymbolicLink() && staged.dev === created.dev && staged.ino === created.ino) unlinkSync(stagedPath);
    } catch (cleanupError) { if (cleanupError.code !== 'ENOENT') throw cleanupError; }
    throw error;
  }
}

// Ownership announcements let a host that runs writers on threads (the MCP worker
// executor) release a lock whose owning thread was terminated before its finally
// block ran. Owner records keep their format; without subscribers nothing happens.
export const OWNED_LOCK_CHANNEL = "agdf:owned-file-lock";
const ownedLockChannel = channel(OWNED_LOCK_CHANNEL);
function announceOwnedLock(phase, lockPath, token) {
  if (ownedLockChannel.hasSubscribers) ownedLockChannel.publish({ phase, lock_path: lockPath, token });
}

// Releases a lock whose owning thread has actually exited; the caller proves the exit.
// This function proves the record is that thread's own (exact token, this process,
// unchanged bytes) under the same guard as reclaimAbandonedLock. It never throws for
// a foreign, guarded or unknown lock: it reports the outcome and leaves it in place.
export function releaseAbandonedOwnedLock(lockPath, token) {
  if (typeof lockPath !== "string" || !lockPath.endsWith(".lock") || typeof token !== "string" || !LOCK_TOKEN.test(token)) return "unknown";
  try {
    const staged = `${lockPath}.${token}.pending`, file = lstatSync(staged);
    if (file.isFile() && !file.isSymbolicLink()) unlinkSync(staged);
  } catch (error) { if (error?.code !== "ENOENT") return "unknown"; }
  const guard = `${lockPath}.reclaim`;
  let descriptor;
  try { descriptor = openSync(guard, "wx"); } catch (error) { return error?.code === "EEXIST" ? "guarded" : "unknown"; }
  try {
    let original;
    try {
      const file = lstatSync(lockPath);
      if (!file.isFile() || file.size > 4096) return "unknown";
      original = readFileSync(lockPath, "utf8");
    } catch (error) { return error?.code === "ENOENT" ? "absent" : "unknown"; }
    let owner;
    try { owner = JSON.parse(original); } catch { return "unknown"; }
    if (!validOwnerRecord(owner)) return "unknown";
    if (owner.token !== token || owner.pid !== process.pid) return "foreign";
    if (!lstatSync(lockPath).isFile() || readFileSync(lockPath, "utf8") !== original) return "foreign";
    unlinkSync(lockPath);
    fsyncDirectory(dirname(lockPath));
    return "released";
  } catch { return "unknown"; }
  finally {
    closeSync(descriptor);
    try { unlinkSync(guard); } catch {}
  }
}

export function withOwnedFileLock(path, work, { checkpoint = () => {} } = {}) {
  const lockPath = `${path}.lock`;
  const owner = { schema_version: 1, pid: process.pid, token: randomUUID(), started_at: new Date().toISOString() };
  let lockDescriptor;
  // Announce before staging: a thread stopped right after publication is still known.
  announceOwnedLock("intent", lockPath, owner.token);
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        lockDescriptor = publishOwnedLock(lockPath, owner, checkpoint); break;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        try { reclaimAbandonedLock(lockPath); }
        catch (locked) {
          if (attempt < 2 && !existsSync(lockPath)) continue; // Fresh proven absence; no wait/reclaim of an unknown owner.
          throw locked;
        }
        if (attempt === 2) throw lockError(lockPath);
      }
    }
  } catch (error) {
    // No "released" here: if publishOwnedLock's own cleanup failed, the record may still
    // exist, and the host must keep the token to release it after the thread exits.
    throw error;
  }
  const created = fstatSync(lockDescriptor);
  try {
    checkpoint("lock_acquired");
    const result = work(owner);
    checkpoint("before_lock_release");
    return result;
  } finally {
    closeSync(lockDescriptor);
    // A changed lock does not belong to this invocation and must never be removed by it.
    try {
      const currentFile = lstatSync(lockPath);
      if (currentFile.dev === created.dev && currentFile.ino === created.ino) {
        const current = JSON.parse(readFileSync(lockPath, "utf8"));
        if (current.token === owner.token) unlinkSync(lockPath);
      }
    } catch (error) {
      if (error?.code !== "ENOENT" && error instanceof SyntaxError === false) throw error;
    }
    announceOwnedLock("released", lockPath, owner.token);
    checkpoint("after_lock_release");
  }
}

