// Companion event journal (SD SDD-006, SDD-008): the runtime appends one line per event of a final
// AGDF MCP tool result to `companion/events.jsonl` below the plugin data root, bounded to 256 KiB with
// one rotation file `events.1.jsonl`. It is a notification channel only, never a source of truth, and
// nothing here writes under `.agdf/control`. Every failure is swallowed: the tool result never changes.
import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, statSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { resolveTaskTarget } from '../task-target-resolution.js';
import { artefactFileDigest } from '../control-state/run-seal-compute.js';
import { containedRegularFile } from '../control-state/contained-file.js';
import { atomicWrite, withOwnedFileLock } from '../owned-file-lock.js';
import { commandGate, deriveEvent, eventKind, reviewFact } from './events.js';

export const JOURNAL_DIRECTORY = 'companion';
export const JOURNAL_FILE = 'events.jsonl';
export const JOURNAL_ROTATED_FILE = 'events.1.jsonl';
export const JOURNAL_LIMIT_BYTES = 256 * 1024;
// The launcher hands its data root (CLAUDE_PLUGIN_DATA on Claude, --data on Codex) to the runtime
// processes through this variable (SDD-006).
export const COMPANION_DATA_ROOT_ENV = 'AGDF_COMPANION_DATA_ROOT';
const SOURCE_TEXT_LIMIT = 1024 * 1024;
const RESERVATIONS_FILE = 'approval-requests.json';
const RESERVATIONS_LIFETIME_MS = 30 * 60_000;
const RESERVATIONS_MAX_ENTRIES = 8192;
const RESERVATIONS_MAX_BYTES = 1024 * 1024;
const RESERVATIONS_LOCK_WAIT_MS = 50;
const DIGEST = /^[a-f0-9]{64}$/u;

export const journalPath = dataRoot => join(dataRoot, JOURNAL_DIRECTORY, JOURNAL_FILE);

const isLink = path => { try { return lstatSync(path).isSymbolicLink(); } catch { return false; } };

function readReservations(path) {
  let stat;
  try { stat = lstatSync(path); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  if (!stat.isFile() || stat.size > RESERVATIONS_MAX_BYTES) throw Error('invalid notification reservations');
  const bytes = readFileSync(path);
  if (bytes.length > RESERVATIONS_MAX_BYTES) throw Error('invalid notification reservations');
  const stored = JSON.parse(bytes);
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) throw Error('invalid notification reservations');
  const entries = Object.entries(stored);
  if (entries.length > RESERVATIONS_MAX_ENTRIES
      || entries.some(([key, expires]) => !DIGEST.test(key) || !Number.isSafeInteger(expires) || expires < 0)) {
    throw Error('invalid notification reservations');
  }
  return entries;
}

// Only the notification survives a serving-process restart. Neither this
// reservation nor the journal line participates in delivery or approval.
function reserveApprovalRequest(dataRoot, input, at) {
  const identity = [input.target_id, input.run_id, input.expected_revision_id,
    input.command.payload.presentation_id, input.operation_id];
  if (!identity.every(value => typeof value === 'string' && value.length > 0)) return false;
  const key = createHash('sha256').update(JSON.stringify(identity)).digest('hex');
  const directory = join(dataRoot, JOURNAL_DIRECTORY);
  if (isLink(dataRoot) || isLink(directory)) return false;
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, RESERVATIONS_FILE);
  const deadline = performance.now() + RESERVATIONS_LOCK_WAIT_MS;
  for (;;) {
    try {
      return withOwnedFileLock(path, () => {
        const live = new Map(readReservations(path).filter(([, expires]) => expires > at));
        if (live.has(key) || live.size >= RESERVATIONS_MAX_ENTRIES) return false;
        live.set(key, at + RESERVATIONS_LIFETIME_MS);
        const bytes = JSON.stringify(Object.fromEntries(live));
        if (Buffer.byteLength(bytes) > RESERVATIONS_MAX_BYTES) return false;
        atomicWrite(path, bytes);
        return true;
      });
    } catch (error) {
      const remaining = deadline - performance.now();
      if (error.lock_owner_status !== 'live' || remaining <= 0) return false;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(5, remaining));
    }
  }
}

// Appends one event line; rotates first when the line would cross the bound. Returns whether the line
// was written. Concurrent servers may interleave whole lines or lose some at rotation (accepted).
export function appendJournalEvent(dataRoot, event, { limit = JOURNAL_LIMIT_BYTES } = {}) {
  try {
    if (typeof dataRoot !== 'string' || !dataRoot || !event) return false;
    const directory = join(dataRoot, JOURNAL_DIRECTORY);
    if (isLink(dataRoot) || isLink(directory)) return false;
    mkdirSync(directory, { recursive: true });
    const line = `${JSON.stringify(event)}\n`;
    const size = Buffer.byteLength(line, 'utf8');
    if (size > limit) return false;
    const file = join(directory, JOURNAL_FILE);
    if (isLink(file)) return false;
    let current = 0;
    try { current = statSync(file).size; } catch { current = 0; }
    if (current > 0 && current + size > limit) renameSync(file, join(directory, JOURNAL_ROTATED_FILE));
    appendFileSync(file, line, 'utf8');
    return true;
  } catch {
    return false;
  }
}

// The governance root of a command input, resolved like the material store does; the input's own
// target path when it does not resolve.
export function commandRoot(input = {}) {
  try {
    const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
    if (target.resolution_state === 'resolved' && target.governance_target) return target.governance_target;
  } catch { /* fall back to the input path */ }
  return input.primary_target ?? input.working_directory ?? null;
}

// The event's root: the caller's target path when it names the same directory as the resolved root
// through another spelling (junction, symlink, subst drive), so a host comparing with its own session
// root still matches (SD SDD-005 "the MCP target path", CR finding A6); else the resolved root.
// Review facts keep reading below the resolved root.
export function eventRoot(input = {}, root = commandRoot(input)) {
  const given = typeof input.primary_target === 'string' && isAbsolute(input.primary_target) ? resolve(input.primary_target) : null;
  if (!given || !root || given === root) return root;
  try { return realpathSync(given) === realpathSync(root) ? given : root; } catch { return root; }
}

// Review facts of a path source: the file read now, its canonical digest from the node digest owner
// compared with the declared digest (match or mismatch); unreadable files are unavailable.
function pathFact(root, slot, source) {
  const current = root ? artefactFileDigest(root, source.path) : 'unresolved';
  if (!/^sha256:/u.test(current)) return reviewFact({ slot, source: 'path', path: source.path, digest: source.digest, sourceMatch: 'unavailable' });
  let text = null;
  try {
    const file = containedRegularFile(root, String(source.path).trim());
    if (file.status === 'valid' && statSync(file.path).size <= SOURCE_TEXT_LIMIT) text = readFileSync(file.path, 'utf8');
  } catch { text = null; }
  return reviewFact({ slot, source: 'path', path: source.path, digest: source.digest, text, sourceMatch: current === source.digest ? 'match' : 'mismatch' });
}

// Review facts (SDD-008, decision P4): sealed staged material carries its preview, size and digest
// with source_match not_determinable; a recording from a path carries the path, the recorded digest
// and whether the file still matches it; a recording from staged material names its digest only.
export function reviewFacts(toolName, input, result, { sealedFiles = () => null, root = commandRoot(input) } = {}) {
  const kind = eventKind(toolName, input, result);
  const command = input?.command ?? {};
  if (kind === 'material_staged') {
    const files = sealedFiles(command.payload?.transfer_id) ?? [];
    return files.map(file => reviewFact({ slot: file.slot, source: 'staged', digest: file.digest, text: file.content, sourceMatch: 'not_determinable' }));
  }
  if (kind !== 'document_recorded') return null;
  const payload = command.payload ?? {};
  const source = payload.source ?? payload.material ?? null;
  const slot = commandGate(command);
  if (source?.path) return [pathFact(root, slot, source)];
  if (source?.material_id) return [reviewFact({ slot, source: 'staged', digest: source.digest, sourceMatch: 'not_determinable' })];
  return null;
}

// The runtime's observer of final tool results. Without a data root it does nothing.
export function createCompanionJournal({ dataRoot = process.env[COMPANION_DATA_ROOT_ENV], sealedFiles = () => null,
  now = () => new Date(), newId = randomUUID, limit = JOURNAL_LIMIT_BYTES } = {}) {
  const enabled = typeof dataRoot === 'string' && dataRoot.length > 0;
  return Object.freeze({
    enabled,
    path: enabled ? journalPath(dataRoot) : null,
    // Whether `observe` writes an event for this result, without writing: a facade asks this for a
    // result its generation produced, and so already journaled.
    observes(toolName, input, result) {
      if (!enabled) return false;
      try { return Boolean(eventKind(toolName, input, result)); } catch { return false; }
    },
    observe(toolName, input, result) {
      if (!enabled) return false;
      try {
        const kind = eventKind(toolName, input, result);
        if (!kind) return false;
        const root = commandRoot(input);
        const review = reviewFacts(toolName, input, result, { sealedFiles, root });
        const at = now();
        const event = deriveEvent(toolName, input, result, { id: newId(), at: at.toISOString(), root: eventRoot(input, root), review });
        if (!event) return false;
        if (kind === 'approval_requested' && !reserveApprovalRequest(dataRoot, input, at.getTime())) return false;
        return appendJournalEvent(dataRoot, event, { limit });
      } catch {
        return false;
      }
    },
  });
}
