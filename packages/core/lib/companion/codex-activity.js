import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { atomicWrite, withOwnedFileLockWait } from '../owned-file-lock.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { hasSymlinkComponent } from '../control-state/contained-file.js';
import { createCodexContinuationAdmission } from './codex-continuation.js';
import { activityRecordLimit, codexTurnBound, isActivityId, isAgdfDispatchTool, quarantineActivity, retireTurns, selectActivity,
  updateActivity, workBinding } from './activity.js';

// The Codex Companion hook profile this build observes with. Codex runs a new or changed hook only after
// the person trusts it again, so a sign of life counts only for the profile that wrote it. A Core test pins
// this value to the digest of the Companion hook entries and the hook entry script.
export const CODEX_HOOK_PROFILE = '2';
// A sign of life of the hooks counts this long; every later session start or prompt renews it.
const LIVENESS_WINDOW = 24 * 60 * 60_000;
// A row holds at most 14 ASCII IDs of 128 bytes: session, turn and 12 tool IDs. The ASCII scope,
// timestamps and JSON framing fit in the remaining 768 bytes. The one sign-of-life row has its own place
// beside the activity rows, so a full store never hides that the hooks run.
const storeRowLimit = activityRecordLimit + 1;
const maxBytes = storeRowLimit * (14 * 128 + 768);
// Hooks of other Codex sessions hold the store only for one bounded write; an event waits that long.
const LOCK_WAIT_MS = 250;
const STORE_FILE = 'codex-activity.json';
const INVALID_STORE = 'invalid_activity_store';
const invalidStore = () => Object.assign(new Error(INVALID_STORE), { code: INVALID_STORE });
const linkedStore = () => Object.assign(new Error('activity_store_link'), { code: 'activity_store_link' });
const isLiveness = row => row.liveness === true;
const livenessRow = now => ({ liveness: true, profile: CODEX_HOOK_PROFILE, at: now, until: now + LIVENESS_WINDOW });
const UNKNOWN = Object.freeze({ activity: null, liveness: 'unknown' });

function directory(dataRoot, create = false) {
  if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()) return null;
  const path = join(dataRoot, 'companion');
  if (create) mkdirSync(path, { mode: 0o700, recursive: true });
  return lstatSync(path).isDirectory() ? path : null;
}

// Content this build cannot accept is an invalid store; a link, another file type or an I/O failure
// is not, so it is never overwritten. Windows has no O_NOFOLLOW: a link is refused before opening,
// and the opened descriptor must still be the file the path names.
function load(root) {
  const path = join(root, STORE_FILE);
  if (hasSymlinkComponent(root, STORE_FILE)) throw linkedStore();
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0));
    const stat = fstatSync(fd);
    const named = lstatSync(path);
    if (named.isSymbolicLink() || named.dev !== stat.dev || named.ino !== stat.ino) throw linkedStore();
    if (!stat.isFile()) throw Error('activity_store_not_file');
    if (stat.size > maxBytes) throw invalidStore();
    const bytes = Buffer.allocUnsafe(stat.size + 1);
    let length = 0, read;
    while (length < bytes.length && (read = readSync(fd, bytes, length, bytes.length - length, null)) > 0) length += read;
    if (length > maxBytes) throw invalidStore();
    let value;
    try { value = JSON.parse(bytes.subarray(0, length).toString('utf8')); } catch { throw invalidStore(); }
    if (!Array.isArray(value) || value.length > storeRowLimit
      || value.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw invalidStore();
    return value;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

// Changes the store under its lock. `change` receives the live activity rows and the live sign of life
// and returns the new ones, or null to leave the store as it is. The sign of life never reaches the
// activity policy, which bounds the activity rows itself.
function mutate(dataRoot, create, now, change) {
  const root = directory(dataRoot, create);
  if (!root) return false;
  const path = join(root, STORE_FILE);
  return withOwnedFileLockWait(path, () => {
    let records;
    try { records = load(root); } catch (error) {
      if (error.code !== INVALID_STORE) throw error;
      // An unreadable store cannot prove which turns ended: every observation waits one window, then
      // the store starts over. Repairing it here keeps a store from an older or newer build recoverable.
      atomicWrite(path, JSON.stringify(quarantineActivity(now)));
      return false;
    }
    const current = records.filter(row => row.until > now);
    const result = change(current.filter(row => !isLiveness(row)), current.find(isLiveness) ?? null);
    if (!result) return false;
    const rows = result.liveness ? [...result.activity, result.liveness] : result.activity;
    const bytes = JSON.stringify(rows);
    if (Buffer.byteLength(bytes, 'utf8') > maxBytes) return false;
    atomicWrite(path, bytes);
    return true;
  }, { waitMs: LOCK_WAIT_MS });
}

function observeContinuation(dataRoot, input, now) {
  const turn = { session: input.session_id, id: input.turn_id };
  const admission = createCodexContinuationAdmission(dataRoot);
  if (input.hook_event_name === 'Stop') {
    admission.settleTurn(turn);
    return;
  }
  if (input.hook_event_name !== 'PostToolUse' || !isAgdfDispatchTool(input.tool_name) || input.tool_response?.isError === true) return;
  const output = input.tool_response?.structuredContent;
  const work = output?.continuation?.work_admission;
  if (input.tool_input?.continue_delivery !== true || output?.terminal !== false || output.authorizes !== false
    || !work || work.run_id !== input.tool_input.run_id || work.run_id !== output.continuation.run_id) return;
  const root = output.target?.governance_target;
  if (resolveControlCommandTarget(root).target_id !== work.target_id) return;
  if (!admission.associateTurn(work, work.attempt_id, work.owner, turn).matched) return;
  const records = load(directory(dataRoot));
  if (records.some(row => row.session === turn.session && row.turn === turn.id && row.terminal === true
    && row.kind === 'ended' && row.until > now)) admission.settleRunning(work, work.attempt_id, turn);
}

export function observeCodexActivity(dataRoot, input, now = Date.now()) {
  const { hook_event_name: event, session_id: session, turn_id: turn, tool_use_id: tool } = input ?? {};
  if (!isActivityId(session)) return false;
  try {
    // A session start is a sign of life only: compaction can start a session inside a running turn.
    if (event === 'SessionStart') return mutate(dataRoot, true, now, activity => ({ activity, liveness: livenessRow(now) }));
    if (!isActivityId(turn)) return false;
    // A new prompt proves that the earlier turns of its session are over, whether or not they reported it.
    if (event === 'UserPromptSubmit') {
      return mutate(dataRoot, true, now, activity => ({ activity: retireTurns(activity, { session, turn }, now) ?? activity, liveness: livenessRow(now) }));
    }
    const terminal = event === 'Stop' || event === 'Interrupt';
    if (!terminal && (event !== 'PostToolUse' || !isAgdfDispatchTool(input.tool_name)
      || input.tool_input?.continue_delivery !== true || !isActivityId(tool))) return false;
    const binding = terminal || input.tool_response?.isError === true
      ? null : workBinding(input.tool_input, input.tool_response?.structuredContent);
    // Admission evidence is correlated even for a continuation phase with no
    // visual activity projection. Display failures never settle an attempt.
    try { observeContinuation(dataRoot, input, now); } catch { /* Preserve admission on uncertainty. */ }
    if (binding) binding.target_id = resolveControlCommandTarget(binding.target_id).target_id;
    const kind = terminal ? (event === 'Stop' ? 'ended' : 'interrupted') : (binding ? 'work' : 'lost');
    return mutate(dataRoot, terminal || Boolean(binding), now, (activity, liveness) => {
      // A turn that ends after its tool results needs no marker unless it observed work: nothing of it
      // can arrive later. An interruption keeps its marker, since a running tool may still answer.
      if (event === 'Stop' && !activity.some(row => row.session === session && row.turn === turn)) return null;
      // Codex has no timer to renew a running turn: its work lasts until the turn ends, a later prompt
      // retires it, or the bound passes after its last confirmed dispatch.
      const next = updateActivity(activity, { kind, session, turn, tool, binding }, now, { lifetime: codexTurnBound });
      return next && { activity: next, liveness };
    });
  } catch { return false; }
}

// What the Cockpit may show for its shown step: the matching work, and whether the Companion hooks of this
// profile gave a sign of life. A missing, unreadable or quarantined store leaves both unknown.
export function readCodexObservation(dataRoot, binding, now = Date.now()) {
  try {
    const root = directory(dataRoot);
    if (!root || !binding?.gate) return UNKNOWN;
    const records = load(root).filter(row => row.until > now);
    if (records.some(row => row.quarantined)) return UNKNOWN;
    const record = selectActivity(records.filter(row => !isLiveness(row)), binding, now);
    const observed = records.some(row => isLiveness(row) && row.profile === CODEX_HOOK_PROFILE && Number.isSafeInteger(row.at) && row.at <= now);
    return { activity: record ? { gate: binding.gate, expires_at: record.expires_at } : null, liveness: observed ? 'observed' : 'unknown' };
  } catch { return UNKNOWN; }
}
