// Shared companion journal fixtures (run run-71aa7dbb, TP T-006, SD SDD-008): real journal files below a
// temporary plugin data root, written line by line in the versioned `companion-event/1` format, so the
// single Core reader and both of its consumers (run view for the Claude companion, Cockpit observation
// for the Codex card) are checked against the same bytes.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COMPANION_EVENT_SCHEMA } from '../../lib/companion/events.js';
import { JOURNAL_DIRECTORY, JOURNAL_FILE, JOURNAL_ROTATED_FILE } from '../../lib/companion/journal.js';
import { COMPANION_EVENTS_READ_LIMIT } from '../../lib/companion/read-companion-events.js';

// One journal line; `fields` override the defaults of an approval request of `fixture-a`.
export function journalLine(root, id, minute, fields = {}) {
  return JSON.stringify({ schema_version: COMPANION_EVENT_SCHEMA, id, at: `2026-11-27T09:${String(minute).padStart(2, '0')}:00.000Z`,
    root, run_id: 'fixture-a', gate: 'UR', kind: 'approval_requested', outcome: 'accepted', reason: null, operation_id: `op-${id}`,
    review: null, ...fields });
}

// Lines no reader may return: a cut line, malformed JSON, a foreign schema, an unknown kind, a line
// without id, and an event of another project root.
export function noiseLines(root, otherRoot) {
  return [
    '{"schema_version":"companion-event/1","id":"cut","kind":"approval_requ',
    '{not json',
    journalLine(root, 'foreign-schema', 1, { schema_version: 'companion-event/2' }),
    journalLine(root, 'unknown-kind', 1, { kind: 'approval_guessed' }),
    JSON.stringify({ schema_version: COMPANION_EVENT_SCHEMA, at: '2026-11-27T09:01:00.000Z', root, kind: 'approval_requested' }),
    journalLine(otherRoot, 'other-root', 2),
  ];
}

// A plugin data root with a `companion` folder; `write(current, rotated)` replaces both journal files
// (null removes one); `oversize(file)` makes one file larger than the reader's bound.
export function journalFixture(t) {
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-journal-contract-'));
  t.after(() => rmSync(dataRoot, { recursive: true, force: true }));
  const folder = join(dataRoot, JOURNAL_DIRECTORY);
  mkdirSync(folder, { recursive: true });
  const file = name => join(folder, name);
  const put = (name, lines) => {
    if (lines === null) rmSync(file(name), { force: true });
    else writeFileSync(file(name), lines.map(line => `${line}\n`).join(''));
  };
  return {
    dataRoot,
    folder,
    write(current, rotated = null) { put(JOURNAL_FILE, current); put(JOURNAL_ROTATED_FILE, rotated); },
    oversize(name, lines = []) { writeFileSync(file(name), `${' '.repeat(COMPANION_EVENTS_READ_LIMIT)}\n${lines.map(line => `${line}\n`).join('')}`); },
  };
}
