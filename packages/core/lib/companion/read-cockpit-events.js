import { constants, closeSync, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { parseEventLines } from './events.js';
import { JOURNAL_DIRECTORY, JOURNAL_FILE, JOURNAL_LIMIT_BYTES, JOURNAL_ROTATED_FILE } from './journal.js';

const limit = 5;
const reasonCode = /^[a-z][a-z0-9_]{0,127}$/u;
const unavailable = { state: 'unavailable', items: [] };
// Concurrent writers may cross the writer's bound before the next rotation (journal.js), so the
// reader keeps headroom like the Claude companion's bounded read (JOURNAL_READ_LIMIT).
export const COCKPIT_EVENTS_READ_LIMIT = 2 * JOURNAL_LIMIT_BYTES;
// Windows has neither flag; there the identity check after opening rejects a swapped path.
const openFlags = constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0);
// The parsed lines of each journal file by path, kept while the opened file's identity, size and
// modification time stay the same, so a freshness poll does not re-read an unchanged journal.
const parsed = new Map();

function journalEvents(path) {
  let fd;
  try {
    const entry = lstatSync(path, { bigint: true });
    if (!entry.isFile()) throw Error('journal_unavailable');
    fd = openSync(path, openFlags);
    const stat = fstatSync(fd, { bigint: true });
    if (!stat.isFile() || stat.dev !== entry.dev || stat.ino !== entry.ino || stat.size > BigInt(COCKPIT_EVENTS_READ_LIMIT)) {
      throw Error('journal_unavailable');
    }
    const signature = `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}`;
    const cached = parsed.get(path);
    if (cached?.signature === signature) return cached.events;
    // Reads exactly the opened file's measured size: a rotation keeps this file whole, and a line
    // appended after the measurement is read by the next poll.
    const size = Number(stat.size);
    const buffer = Buffer.allocUnsafe(size);
    let length = 0;
    while (length < size) {
      const n = readSync(fd, buffer, length, size - length, null);
      if (!n) break;
      length += n;
    }
    const events = parseEventLines(buffer.subarray(0, length).toString('utf8'));
    parsed.set(path, { signature, events });
    return events;
  } catch (error) {
    parsed.delete(path);
    if (error.code === 'ENOENT') return [];
    throw error;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export function readCockpitEvents(dataRoot, projectRoot, runId) {
  try {
    if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()) return unavailable;
    const folder = join(dataRoot, JOURNAL_DIRECTORY);
    try { if (!lstatSync(folder).isDirectory()) return unavailable; }
    catch (error) {
      if (error.code === 'ENOENT') return { state: 'available', items: [] };
      throw error;
    }
    const canonicalProject = realpathSync(projectRoot);
    const roots = new Map();
    const matchesProject = root => {
      if (typeof root !== 'string' || root.length > 4096 || !isAbsolute(root)) return false;
      if (!roots.has(root)) {
        let matches = root === projectRoot || root === canonicalProject;
        if (!matches) {
          try { matches = relative(realpathSync(root), canonicalProject) === ''; } catch { /* No verified alias. */ }
        }
        roots.set(root, matches);
      }
      return roots.get(root);
    };
    // The current file first: a rotation between both reads then moves lines the reader already
    // has into the rotation file, instead of moving unread lines past it.
    const current = journalEvents(join(folder, JOURNAL_FILE));
    // The rotation file holds older history only; an oversized or unreadable one is skipped.
    let rotated = [];
    try { rotated = journalEvents(join(folder, JOURNAL_ROTATED_FILE)); } catch { /* Older history stays unread. */ }
    const unique = new Map();
    for (const event of [...rotated, ...current]) {
      if (event.run_id !== runId || !matchesProject(event.root) || !event.id || event.id.length > 128) continue;
      const time = Date.parse(event.at);
      const item = { id: event.id, at: Number.isFinite(time) ? new Date(time).toISOString() : null, kind: event.kind,
        gate: typeof event.gate === 'string' && event.gate.length <= 64 ? event.gate : null,
        reason: typeof event.reason === 'string' && reasonCode.test(event.reason) ? event.reason : null };
      unique.set(item.id, item);
    }
    const items = [...unique.values()].reverse().sort((left, right) => (right.at ?? '').localeCompare(left.at ?? '')).slice(0, limit);
    return { state: 'available', items };
  } catch { return unavailable; }
}
