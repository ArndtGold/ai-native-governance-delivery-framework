import { randomUUID } from 'node:crypto';
import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readdirSync, readSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { hasSymlinkComponent } from '../control-state/contained-file.js';
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from '../control-state/run-identity.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { inspectMutationClaims } from '../control-state/control-layout.js';
import { pendingRunStepPath } from '../control-state/run-step-pending.js';
import { atomicWrite, withOwnedFileLockWait } from '../owned-file-lock.js';

const directory = 'codex-continuation';
const targetPattern = /^sha256:[a-f0-9]{64}$/;
const operationPattern = /^[a-z][a-z0-9._-]{0,127}$/;
const recordPattern = /^[a-f0-9]{64}-[a-z0-9][a-z0-9._-]{0,127}\.json$/;
const maxBytes = 4096;
const unavailable = Object.freeze({ state: 'unavailable' });
const ready = Object.freeze({ state: 'ready' });

function uuid(value) { return typeof value === 'string' && REVISION_ID_PATTERN.test(value); }
function isTurnId(value) { return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/u.test(value); }

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
  binding(record);
  if (record.schema_version !== 1 || runFile(record) !== relative || !uuid(record.attempt_id)
    || typeof record.root !== 'string' || !isAbsolute(record.root)
    || !['reserved', 'pending', 'running', 'settled'].includes(record.phase)
    || (record.view_id !== null && !uuid(record.view_id))
    || (record.owner !== null && !uuid(record.owner))
    || (record.phase === 'running' && !uuid(record.owner))
    || (['reserved', 'pending'].includes(record.phase) && (!uuid(record.view_id) || record.owner !== null))
    || (record.ended !== undefined && (record.ended !== true || !record.turn || !['running', 'settled'].includes(record.phase)))
    || (record.turn !== null && (!isTurnId(record.turn?.session) || !isTurnId(record.turn?.id))))
    throw Error('continuation_record_invalid');
  return record;
}

function readRecord(dataRoot, relative) {
  if (hasSymlinkComponent(dataRoot, relative)) throw Error('continuation_path_invalid');
  const path = join(dataRoot, relative);
  let descriptor;
  try {
    descriptor = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const stat = fstatSync(descriptor), named = lstatSync(path);
    if (!stat.isFile() || named.isSymbolicLink() || stat.ino !== named.ino || stat.dev !== named.dev || stat.size > maxBytes)
      throw Error('continuation_record_invalid');
    const bytes = Buffer.alloc(maxBytes + 1);
    let offset = 0, count;
    while (offset < bytes.length && (count = readSync(descriptor, bytes, offset, bytes.length - offset, null)) > 0) offset += count;
    if (offset > maxBytes) throw Error('continuation_record_invalid');
    return validateRecord(JSON.parse(bytes.subarray(0, offset).toString('utf8')), relative);
  } catch (error) {
    if (descriptor === undefined && error.code === 'ENOENT') return null;
    throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function readyRoot(dataRoot, create) {
  if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()
    || hasSymlinkComponent(dataRoot, directory)) throw Error('continuation_path_invalid');
  if (create) mkdirSync(join(dataRoot, directory), { recursive: true, mode: 0o700 });
}

function canRelease(record) {
  try {
    if (resolveControlCommandTarget(record.root).target_id !== record.target_id
      || inspectMutationClaims(record.root).some(row => row.resource === `run:${record.run_id}`)) return false;
    try { lstatSync(pendingRunStepPath(record.root, record.run_id)); return false; }
    catch (error) { return error.code === 'ENOENT'; }
  } catch { return false; }
}

function status(record) {
  if (!record || record.phase === 'settled') return ready;
  if (record.phase === 'running' && record.ended === true && canRelease(record)) return ready;
  return { state: record.phase === 'running' ? 'running' : 'pending' };
}

function newRecord(scope, phase, { viewId = null, owner = null } = {}) {
  return { schema_version: 1, ...binding(scope), root: scope.root, attempt_id: randomUUID(), phase, view_id: viewId, owner, turn: null };
}

// The lock protects a short read / check / write. The durable record, not the
// lock or the Companion activity lease, protects the run while work is unresolved.
export function createCodexContinuationAdmission(dataRoot) {
  function change(scope, transition) {
    try {
      const relative = runFile(scope);
      readyRoot(dataRoot, true);
      return withOwnedFileLockWait(join(dataRoot, relative), () => {
        const old = readRecord(dataRoot, relative);
        const result = transition(old);
        if (result.record) atomicWrite(join(dataRoot, relative), JSON.stringify(validateRecord(result.record, relative)));
        return result.projection;
      }, { waitMs: 250 });
    } catch { return unavailable; }
  }

  function settleRunning(scope, attemptId, turn) {
    return change(scope, old => {
      if (old?.phase !== 'running' || old.attempt_id !== attemptId
        || old.turn?.session !== turn?.session || old.turn?.id !== turn?.id || !old.turn)
        return { projection: status(old) };
      const ended = { ...old, ended: true };
      return canRelease(ended)
        ? { record: { ...ended, phase: 'settled' }, projection: ready }
        : { record: ended, projection: { state: 'running' } };
    });
  }

  return Object.freeze({
    inspect(scope) {
      try { readyRoot(dataRoot, false); return status(readRecord(dataRoot, runFile(scope))); }
      catch { return unavailable; }
    },
    reserve(scope, viewId, eligible) {
      if (!uuid(viewId)) return unavailable;
      return change(scope, old => {
        const prior = status(old);
        if (prior.state !== 'ready') return { projection: prior };
        if (eligible() !== true) return { projection: { state: 'stale' } };
        const record = newRecord(scope, 'reserved', { viewId });
        return { record, projection: { state: 'pending', attempt_id: record.attempt_id, reserved: true } };
      });
    },
    publish(scope, viewId, attemptId, eligible) {
      return change(scope, old => {
        if (old?.phase !== 'reserved' || old.view_id !== viewId || old.attempt_id !== attemptId || !matches(old, scope))
          return { projection: status(old) };
        if (eligible() !== true) return { record: { ...old, phase: 'settled' }, projection: { state: 'stale' } };
        // Persist pending before issuing the sole permission to send. The same
        // response cannot be produced again, including after a lost reply.
        return { record: { ...old, phase: 'pending' }, projection: { state: 'pending', attempt_id: attemptId, send: true } };
      });
    },
    cancelReservation(scope, viewId, attemptId) {
      return change(scope, old => old?.phase === 'reserved' && old.view_id === viewId && old.attempt_id === attemptId && matches(old, scope)
        ? { record: { ...old, phase: 'settled' }, projection: ready } : { projection: status(old) });
    },
    claim(scope, { attemptId, owner } = {}, eligible) {
      if ((attemptId !== undefined && !uuid(attemptId)) || (owner !== undefined && !uuid(owner))
        || (attemptId !== undefined && owner !== undefined)) return unavailable;
      return change(scope, old => {
        if (eligible() !== true) return { projection: { state: 'stale' } };
        if (owner !== undefined) {
          if (old?.phase !== 'running' || old.ended === true || old.owner !== owner) return { projection: status(old).state === 'ready' ? { state: 'stale' } : status(old) };
          if (matches(old, scope)) return { projection: status(old) };
          const record = { ...old, ...binding(scope) };
          return { record, projection: { state: 'running', attempt_id: record.attempt_id, owner, admitted: true } };
        }
        if (attemptId !== undefined) {
          if (old?.phase !== 'pending' || old.attempt_id !== attemptId || !matches(old, scope))
            return { projection: status(old).state === 'ready' ? { state: 'stale' } : status(old) };
        } else if (status(old).state !== 'ready') return { projection: status(old) };
        const token = randomUUID();
        const record = attemptId === undefined ? newRecord(scope, 'running', { owner: token }) : { ...old, phase: 'running', owner: token };
        return { record, projection: { state: 'running', attempt_id: record.attempt_id, owner: token, admitted: true } };
      });
    },
    associateTurn(scope, attemptId, owner, turn) {
      if (!isTurnId(turn?.session) || !isTurnId(turn?.id)) return unavailable;
      return change(scope, old => {
        if (old?.phase !== 'running' || old.attempt_id !== attemptId || old.owner !== owner
          || old.turn && (old.turn.session !== turn.session || old.turn.id !== turn.id)) return { projection: unavailable };
        return { record: { ...old, turn }, projection: { state: 'running', matched: true } };
      });
    },
    settleRunning,
    settleTurn(turn) {
      if (!isTurnId(turn?.session) || !isTurnId(turn?.id)) return;
      try {
        readyRoot(dataRoot, false);
        const names = readdirSync(join(dataRoot, directory));
        if (names.length > 512) return;
        for (const name of names) {
          if (!recordPattern.test(name)) continue;
          let old;
          try { old = readRecord(dataRoot, `${directory}/${name}`); }
          catch { continue; }
          if (old?.phase === 'running' && old.turn?.session === turn.session && old.turn?.id === turn.id)
            settleRunning(old, old.attempt_id, turn);
        }
      } catch { /* A missing or unreadable record cannot prove a release. */ }
    },
  });
}
