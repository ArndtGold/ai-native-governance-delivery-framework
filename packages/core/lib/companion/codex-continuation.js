import { randomUUID } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readdirSync, readSync, unlinkSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { hasSymlinkComponent } from '../control-state/contained-file.js';
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from '../control-state/run-identity.js';
import { atomicWrite, withOwnedFileLockWait } from '../owned-file-lock.js';

const directory = 'codex-continuation';
const targetPattern = /^sha256:[a-f0-9]{64}$/;
const operationPattern = /^[a-z][a-z0-9._-]{0,127}$/;
const recordPattern = /^[a-f0-9]{64}-[a-z0-9][a-z0-9._-]{0,127}\.json$/;
const maxBytes = 4096;
// How long each handoff phase lasts after its last change. A reservation must be published, a published
// handoff picked up by Codex, and a picked-up handoff is shown as running until the activity lease takes over.
export const HANDOFF_BOUNDS = Object.freeze({ reserved: 2 * 60_000, pending: 10 * 60_000, claimed: 60_000 });
const longest = HANDOFF_BOUNDS.pending;
const fields = ['schema_version', 'target_id', 'run_id', 'revision_id', 'operation_key', 'attempt_id', 'view_id', 'phase', 'since'];
const unavailable = Object.freeze({ state: 'unavailable' });
const ready = Object.freeze({ state: 'ready' });
const stale = Object.freeze({ state: 'stale' });

function uuid(value) { return typeof value === 'string' && REVISION_ID_PATTERN.test(value); }

function runFile(scope) {
  if (!scope || typeof scope.target_id !== 'string' || !targetPattern.test(scope.target_id)
    || typeof scope.run_id !== 'string' || !RUN_ID_PATTERN.test(scope.run_id)) throw Error('continuation_scope_invalid');
  return `${directory}/${scope.target_id.slice(7)}-${scope.run_id}.json`;
}

function binding(scope) {
  runFile(scope);
  if (!uuid(scope.revision_id) || typeof scope.operation_key !== 'string'
    || !operationPattern.test(scope.operation_key)) throw Error('continuation_binding_invalid');
  return { target_id: scope.target_id, run_id: scope.run_id, revision_id: scope.revision_id, operation_key: scope.operation_key };
}

function matches(record, scope) {
  return record.target_id === scope.target_id && record.run_id === scope.run_id
    && record.revision_id === scope.revision_id && record.operation_key === scope.operation_key;
}

function validateRecord(record, relative) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || Object.keys(record).length !== fields.length
    || !fields.every(key => Object.hasOwn(record, key))) throw Error('continuation_record_invalid');
  binding(record);
  if (record.schema_version !== 2 || runFile(record) !== relative || !uuid(record.attempt_id) || !uuid(record.view_id)
    || !Object.hasOwn(HANDOFF_BOUNDS, record.phase) || !Number.isSafeInteger(record.since) || record.since < 0)
    throw Error('continuation_record_invalid');
  return record;
}

// Reads one record: null when there is none, the record, a record of the PR #84 format (`legacy`), or content
// this build cannot judge (`foreign`, with its file time). A link or another file type is never judged or removed.
function readRecord(dataRoot, relative) {
  if (hasSymlinkComponent(dataRoot, relative)) throw Error('continuation_path_invalid');
  const path = join(dataRoot, relative);
  let descriptor;
  try { descriptor = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0)); }
  catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  try {
    const stat = fstatSync(descriptor), named = lstatSync(path);
    if (!stat.isFile() || named.isSymbolicLink() || stat.ino !== named.ino || stat.dev !== named.dev) throw Error('continuation_path_invalid');
    const foreign = { foreign: true, modified: stat.mtimeMs };
    const bytes = Buffer.alloc(maxBytes + 1);
    let offset = 0, count;
    while (offset < bytes.length && (count = readSync(descriptor, bytes, offset, bytes.length - offset, null)) > 0) offset += count;
    if (offset > maxBytes) return foreign;
    let value;
    try { value = JSON.parse(bytes.subarray(0, offset).toString('utf8')); } catch { return foreign; }
    if (value?.schema_version === 1) return { legacy: true };
    try { return { record: validateRecord(value, relative) }; } catch { return foreign; }
  } finally {
    closeSync(descriptor);
  }
}

function removeFile(path) {
  try { unlinkSync(path); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

function readyRoot(dataRoot, create) {
  if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()
    || hasSymlinkComponent(dataRoot, directory)) throw Error('continuation_path_invalid');
  if (create) mkdirSync(join(dataRoot, directory), { recursive: true, mode: 0o700 });
}

function status(record) {
  if (!record) return ready;
  return { state: record.phase === 'claimed' ? 'running' : 'pending' };
}

// The handoff from the Codex Companion to Codex chat: one record per target and Run, which exists only while a
// handoff is reserved, published or just picked up. The lock protects one short read / check / write; every
// phase ends on its own after its bound. Ordinary chat continuations never read or write this store.
export function createCodexContinuationAdmission(dataRoot, { now = Date.now } = {}) {
  const live = (record, at) => {
    const bound = HANDOFF_BOUNDS[record.phase];
    return at - record.since < bound && record.since - at <= bound;
  };
  // What a read means for the Run: a live record, absence (removing what is left), or a file that blocks
  // Companion operations until it is older than the longest handoff bound.
  function current(read, at) {
    if (!read || read.legacy) return { record: null, remove: Boolean(read) };
    // A file time further in the future than the bound cannot age; it counts as aged like a past one.
    if (read.foreign) return at - read.modified >= longest || read.modified - at > longest ? { record: null, remove: true } : { blocked: true };
    return live(read.record, at) ? { record: read.record } : { record: null, remove: true };
  }

  function change(scope, transition) {
    try {
      const relative = runFile(scope);
      readyRoot(dataRoot, true);
      const path = join(dataRoot, relative);
      return withOwnedFileLockWait(path, () => {
        const at = now();
        const seen = current(readRecord(dataRoot, relative), at);
        if (seen.blocked) return unavailable;
        const result = transition(seen.record, at);
        if (result.record) atomicWrite(path, JSON.stringify(validateRecord(result.record, relative)));
        else if (result.remove || seen.remove) removeFile(path);
        return result.projection;
      }, { waitMs: 250 });
    } catch { return unavailable; }
  }

  // Removes other Runs' records that can no longer be live. A record that is busy or cannot be read
  // is left for a later reservation.
  function prune(own) {
    try {
      for (const name of readdirSync(join(dataRoot, directory))) {
        const relative = `${directory}/${name}`;
        if (relative === own || !recordPattern.test(name)) continue;
        try {
          const path = join(dataRoot, relative);
          if (now() - lstatSync(path).mtimeMs < longest) continue;
          withOwnedFileLockWait(path, () => {
            const seen = current(readRecord(dataRoot, relative), now());
            if (!seen.blocked && !seen.record) removeFile(path);
          }, { waitMs: 0 });
        } catch { /* Busy, linked or unreadable: never removed here. */ }
      }
    } catch { /* Pruning is best effort. */ }
  }

  return Object.freeze({
    inspect(scope) {
      try {
        readyRoot(dataRoot, false);
        const seen = current(readRecord(dataRoot, runFile(scope)), now());
        return seen.blocked ? unavailable : status(seen.record);
      } catch { return unavailable; }
    },
    reserve(scope, viewId, eligible) {
      if (!uuid(viewId)) return unavailable;
      const result = change(scope, (old, at) => {
        if (old) return { projection: status(old) };
        if (eligible() !== true) return { projection: stale };
        const record = { schema_version: 2, ...binding(scope), attempt_id: randomUUID(), view_id: viewId, phase: 'reserved', since: at };
        return { record, projection: { state: 'pending', attempt_id: record.attempt_id, reserved: true } };
      });
      if (result.reserved) prune(runFile(scope));
      return result;
    },
    publish(scope, viewId, attemptId, eligible) {
      return change(scope, (old, at) => {
        if (old?.phase !== 'reserved' || old.view_id !== viewId || old.attempt_id !== attemptId || !matches(old, scope))
          return { projection: status(old) };
        if (eligible() !== true) return { remove: true, projection: stale };
        // Persist pending before issuing the sole permission to send. The same
        // response cannot be produced again, including after a lost reply.
        return { record: { ...old, phase: 'pending', since: at }, projection: { state: 'pending', attempt_id: attemptId, send: true } };
      });
    },
    cancelReservation(scope, viewId, attemptId) {
      return change(scope, old => old?.phase === 'reserved' && old.view_id === viewId && old.attempt_id === attemptId && matches(old, scope)
        ? { remove: true, projection: ready } : { projection: status(old) });
    },
    // A pickup that has nothing to continue (a terminal result) ends its published handoff at once.
    release(scope, attemptId) {
      if (!uuid(attemptId)) return unavailable;
      return change(scope, old => old?.phase === 'pending' && old.attempt_id === attemptId
        ? { remove: true, projection: ready } : { projection: status(old) });
    },
    // Codex picks up a published handoff exactly once. Any other attempt, a changed Run or an ended
    // handoff is stale; a handoff whose Run is no longer eligible is removed.
    claim(scope, attemptId, eligible) {
      if (!uuid(attemptId)) return unavailable;
      return change(scope, (old, at) => {
        if (old?.attempt_id !== attemptId) return { projection: stale };
        if (old.phase !== 'pending' || !matches(old, scope)) return { remove: old.phase === 'pending', projection: stale };
        if (eligible() !== true) return { remove: true, projection: stale };
        return { record: { ...old, phase: 'claimed', since: at }, projection: { state: 'running', attempt_id: attemptId, admitted: true } };
      });
    },
  });
}
