import { constants, closeSync, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { parseEventLines } from './events.js';
import { JOURNAL_DIRECTORY, JOURNAL_FILE, JOURNAL_LIMIT_BYTES, JOURNAL_ROTATED_FILE } from './journal.js';

const limit = 5;
const reasonCode = /^[a-z][a-z0-9_]{0,127}$/u;
const unavailable = { state: 'unavailable', items: [] };

function journalText(path) {
  let fd;
  try {
    if (!lstatSync(path).isFile()) throw Error('journal_unavailable');
    fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > JOURNAL_LIMIT_BYTES) throw Error('journal_unavailable');
    // Size checks apply to the same opened file, even if another process rotates it.
    const buffer = Buffer.allocUnsafe(JOURNAL_LIMIT_BYTES + 1);
    let length = 0;
    while (length < buffer.length) {
      const n = readSync(fd, buffer, length, buffer.length - length, null);
      if (!n) break;
      length += n;
    }
    if (length > JOURNAL_LIMIT_BYTES) throw Error('journal_unavailable');
    return buffer.subarray(0, length).toString('utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return '';
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
    const events = [JOURNAL_ROTATED_FILE, JOURNAL_FILE].flatMap(name => parseEventLines(journalText(join(folder, name))));
    const unique = new Map();
    for (const event of events) {
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
