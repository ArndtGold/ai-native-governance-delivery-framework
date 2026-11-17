import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { atomicWrite, withOwnedFileLock } from '../owned-file-lock.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { companionActivityURL } from '../resources/binding.js';

const { activityRecordLimit, workBinding, updateActivity, quarantineActivity, selectActivity, isActivityId } = await import(companionActivityURL);
// A row holds at most 14 ASCII IDs of 128 bytes: session, turn and 12 tool IDs. The ASCII scope,
// timestamps and JSON framing fit in the remaining 768 bytes.
const maxBytes = activityRecordLimit * (14 * 128 + 768);
// Hooks of other Codex sessions hold the store only for one bounded write; an event waits that long.
const LOCK_WAIT_MS = 250;
const INVALID_STORE = 'invalid_activity_store';
const invalidStore = () => Object.assign(new Error(INVALID_STORE), { code: INVALID_STORE });

function directory(dataRoot, create = false) {
  if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()) return null;
  const path = join(dataRoot, 'companion');
  if (create) mkdirSync(path, { mode: 0o700, recursive: true });
  return lstatSync(path).isDirectory() ? path : null;
}

// Content this build cannot accept is an invalid store; a link, another file type or an I/O failure
// is not, so it is never overwritten.
function load(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = fstatSync(fd);
    if (!stat.isFile()) throw Error('activity_store_not_file');
    if (stat.size > maxBytes) throw invalidStore();
    const bytes = Buffer.allocUnsafe(stat.size + 1);
    let length = 0, read;
    while (length < bytes.length && (read = readSync(fd, bytes, length, bytes.length - length, null)) > 0) length += read;
    if (length > maxBytes) throw invalidStore();
    let value;
    try { value = JSON.parse(bytes.subarray(0, length).toString('utf8')); } catch { throw invalidStore(); }
    if (!Array.isArray(value) || value.length > activityRecordLimit
      || value.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw invalidStore();
    return value;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

function withStoreLock(path, work) {
  const deadline = performance.now() + LOCK_WAIT_MS;
  for (;;) {
    try { return withOwnedFileLock(path, work); }
    catch (error) {
      const remaining = deadline - performance.now();
      if (error.lock_owner_status !== 'live' || remaining <= 0) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(5, remaining));
    }
  }
}

export function observeCodexActivity(dataRoot, input, now = Date.now()) {
  const { hook_event_name: event, session_id: session, turn_id: turn, tool_use_id: tool } = input ?? {};
  if (!isActivityId(session) || !isActivityId(turn)) return false;
  const terminal = event === 'Stop' || event === 'Interrupt';
  if (!terminal && (event !== 'PostToolUse' || input.tool_name !== 'mcp__agdf__agdf_dispatch'
    || input.tool_input?.continue_delivery !== true || !isActivityId(tool))) return false;

  try {
    const binding = terminal || input.tool_response?.isError === true
      ? null : workBinding(input.tool_input, input.tool_response?.structuredContent);
    if (binding) binding.target_id = resolveControlCommandTarget(binding.target_id).target_id;
    const kind = terminal ? (event === 'Stop' ? 'ended' : 'interrupted') : (binding ? 'work' : 'lost');
    const root = directory(dataRoot, terminal || Boolean(binding));
    if (!root) return false;
    const path = join(root, 'codex-activity.json');
    return withStoreLock(path, () => {
      let records;
      try { records = load(path); } catch (error) {
        if (error.code !== INVALID_STORE) throw error;
        // An unreadable store cannot prove which turns ended: every observation waits one window, then
        // the store starts over. Repairing it here keeps a store from an older or newer build recoverable.
        atomicWrite(path, JSON.stringify(quarantineActivity(now)));
        return false;
      }
      // A turn that ends after its tool results needs no marker unless it observed work: nothing of it
      // can arrive later. An interruption keeps its marker, since a running tool may still answer.
      if (event === 'Stop' && !records.some(row => row.session === session && row.turn === turn && row.until > now)) return false;
      const next = updateActivity(records, { kind, session, turn, tool, binding }, now);
      if (!next) return false;
      const bytes = JSON.stringify(next);
      if (Buffer.byteLength(bytes, 'utf8') > maxBytes) return false;
      atomicWrite(path, bytes);
      return true;
    });
  } catch { return false; }
}

export function readCodexActivity(dataRoot, binding, now = Date.now()) {
  try {
    const root = directory(dataRoot);
    if (!root || !binding?.gate) return null;
    const record = selectActivity(load(join(root, 'codex-activity.json')), binding, now);
    return record ? { gate: binding.gate, expires_at: record.expires_at } : null;
  } catch { return null; }
}
