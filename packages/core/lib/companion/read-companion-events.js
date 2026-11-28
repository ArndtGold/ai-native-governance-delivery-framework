// The single reader of the companion event journal (run run-71aa7dbb, SD SDD-001): the events of one
// project root, optionally of one run, for the Codex Cockpit observation and for the run view the
// Claude companion reads. Lines are parsed only by events.js; nothing here writes.
import { constants, closeSync, fstatSync, lstatSync, openSync, readSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { SOURCE_MATCHES, parseEventLines } from './events.js';
import { JOURNAL_DIRECTORY, JOURNAL_FILE, JOURNAL_LIMIT_BYTES, JOURNAL_ROTATED_FILE } from './journal.js';

// Concurrent writers may cross the writer's bound before the next rotation (journal.js), so the
// reader keeps headroom of twice that bound for each file.
export const COMPANION_EVENTS_READ_LIMIT = 2 * JOURNAL_LIMIT_BYTES;
// The newest events of a root (or run) one read returns (SD SDD-003, SDD-006).
export const COMPANION_EVENT_HISTORY_LIMIT = 32;
const PREVIEW_CHARACTERS = 4096;
const reasonCode = /^[A-Za-z][A-Za-z0-9_]{0,127}$/u;
const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const unavailable = () => ({ state: 'unavailable', items: [] });
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
    if (!stat.isFile() || stat.dev !== entry.dev || stat.ino !== entry.ino || stat.size > BigInt(COMPANION_EVENTS_READ_LIMIT)) {
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

const boundedText = (value, limit) => (typeof value === 'string' && value.length > 0 && value.length <= limit ? value : null);

// The first review fact of a staging or recording event, reduced to the writer's field set
// (events.js reviewFact); the preview stays bounded even for a hand-written line.
function reviewFact(fact) {
  if (!fact || typeof fact !== 'object' || Array.isArray(fact)) return null;
  const preview = typeof fact.preview === 'string' ? fact.preview : null;
  const cut = preview !== null && preview.length > PREVIEW_CHARACTERS;
  return {
    slot: boundedText(fact.slot, 256),
    source: fact.source === 'path' ? 'path' : 'staged',
    path: boundedText(fact.path, 256),
    digest: digestPattern.test(fact.digest ?? '') ? fact.digest : null,
    bytes: Number.isSafeInteger(fact.bytes) && fact.bytes >= 0 ? fact.bytes : null,
    preview: cut ? preview.slice(0, PREVIEW_CHARACTERS) : preview,
    truncated: cut ? true : typeof fact.truncated === 'boolean' ? fact.truncated : null,
    source_match: SOURCE_MATCHES.includes(fact.source_match) ? fact.source_match : 'unavailable',
  };
}

function item(event, { review }) {
  const time = Date.parse(event.at);
  const shaped = {
    id: event.id,
    at: Number.isFinite(time) ? new Date(time).toISOString() : null,
    run_id: boundedText(event.run_id, 128),
    kind: event.kind,
    gate: boundedText(event.gate, 64),
    reason: typeof event.reason === 'string' && reasonCode.test(event.reason) ? event.reason : null,
  };
  const fact = review && Array.isArray(event.review) ? reviewFact(event.review[0]) : null;
  return fact ? { ...shaped, review: [fact] } : shaped;
}

// Whether an event root names the project root: the same spelling, the project's realpath, or a
// spelling whose realpath is the project's (junction, symlink, drive-letter case; path.relative
// compares without case on Windows). A project root that does not resolve matches its spelling only.
function rootMatcher(projectRoot) {
  let canonical = null;
  try { canonical = realpathSync(projectRoot); } catch { /* exact spelling only */ }
  const known = new Map();
  return root => {
    if (typeof root !== 'string' || root.length > 4096 || !isAbsolute(root)) return false;
    if (!known.has(root)) {
      let matches = root === projectRoot || (canonical !== null && root === canonical);
      if (!matches && canonical !== null) {
        try { matches = relative(realpathSync(root), canonical) === ''; } catch { /* no verified alias */ }
      }
      known.set(root, matches);
    }
    return known.get(root);
  };
}

// The events of `projectRoot` (and of `runId` when given) in journal order, each id once, the newest
// `limit` of them: { state: 'available' | 'unavailable', items }. A missing journal is available and
// empty; an unreadable or oversized current file is unavailable; an oversized or unreadable rotation
// file only holds older history and is skipped. `review` adds the first review fact of an event.
export function readCompanionEvents(dataRoot, projectRoot, { runId = null, limit = COMPANION_EVENT_HISTORY_LIMIT, review = false } = {}) {
  try {
    if (typeof dataRoot !== 'string' || !isAbsolute(dataRoot) || !lstatSync(dataRoot).isDirectory()) return unavailable();
    if (typeof projectRoot !== 'string' || !isAbsolute(projectRoot)) return unavailable();
    const folder = join(dataRoot, JOURNAL_DIRECTORY);
    try { if (!lstatSync(folder).isDirectory()) return unavailable(); }
    catch (error) {
      if (error.code === 'ENOENT') return { state: 'available', items: [] };
      throw error;
    }
    // The current file first: a rotation between both reads then moves lines the reader already
    // has into the rotation file, instead of moving unread lines past it.
    const current = journalEvents(join(folder, JOURNAL_FILE));
    let rotated = [];
    try { rotated = journalEvents(join(folder, JOURNAL_ROTATED_FILE)); } catch { /* Older history stays unread. */ }
    const matchesRoot = rootMatcher(projectRoot);
    const seen = new Set();
    const items = [];
    for (const event of [...rotated, ...current]) {
      if (seen.has(event.id) || event.id.length > 128) continue;
      if ((runId !== null && event.run_id !== runId) || !matchesRoot(event.root)) continue;
      seen.add(event.id);
      items.push(item(event, { review }));
    }
    return { state: 'available', items: limit > 0 ? items.slice(-limit) : [] };
  } catch { return unavailable(); }
}
