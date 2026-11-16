import { constants, closeSync, fstatSync, lstatSync, mkdirSync, openSync, readSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { atomicWrite, withOwnedFileLock } from '../owned-file-lock.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { companionActivityURL } from '../resources/binding.js';

const { activityRecordLimit, workBinding, updateActivity, selectActivity, isActivityId } = await import(companionActivityURL);
// A row needs at most 14 × 128 × 3 UTF-8 bytes for session, turn and tool IDs.
// The ASCII scope, timestamps and JSON framing fit in the remaining 768 bytes.
const maxBytes = activityRecordLimit * 6 * 1024;

function directory(dataRoot, create = false) {
  if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()) return null;
  const path = join(dataRoot, 'companion');
  if (create) mkdirSync(path, { mode: 0o700, recursive: true });
  return lstatSync(path).isDirectory() ? path : null;
}

function load(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > maxBytes) throw Error('invalid_activity_store');
    const bytes = Buffer.alloc(maxBytes + 1);
    const length = readSync(fd, bytes, 0, bytes.length, null);
    if (length > maxBytes) throw Error('invalid_activity_store');
    const value = JSON.parse(bytes.subarray(0, length).toString('utf8'));
    if (!Array.isArray(value) || value.length > activityRecordLimit) throw Error('invalid_activity_store');
    return value;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  } finally {
    if (fd !== undefined) closeSync(fd);
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
    return withOwnedFileLock(path, () => {
      const next = updateActivity(load(path), { kind, session, turn, tool, binding }, now);
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
