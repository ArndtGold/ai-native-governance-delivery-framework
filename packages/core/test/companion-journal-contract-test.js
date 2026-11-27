// Companion journal contract (run run-71aa7dbb, TP T-006, SCN-001, SCN-003 to SCN-005, SCN-012; SD
// SDD-008): Core's single journal reader on shared journal fixtures, and both of its consumers on the
// same bytes: the run view as the Claude companion maps it, and the Codex Cockpit observation of one run.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { journalFixture, journalLine, noiseLines } from './fixtures/companion-journal-fixtures.js';
import { fixture as cockpitFixture } from './control-cockpit-fixtures.js';
import { COMPANION_EVENT_HISTORY_LIMIT, readCompanionEvents } from '../lib/companion/read-companion-events.js';
import { readRunView } from '../lib/companion/run-view.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { JOURNAL_FILE, JOURNAL_ROTATED_FILE } from '../lib/companion/journal.js';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const templates = join(repoRoot, 'plugins', 'agdf', 'host-templates', 'claude', 'companion');
const { snapshotFromRunView } = await import(pathToFileURL(join(templates, 'run-state.mjs')).href);
const ids = result => result.items.map(item => item.id);
const otherRoot = () => mkdtempSync(join(tmpdir(), 'agdf-journal-other-'));

test('SCN-001: the Claude companion templates read no journal content and parse no journal line', () => {
  for (const name of readdirSync(templates).filter(file => file.endsWith('.mjs'))) {
    const source = readFileSync(join(templates, name), 'utf8');
    for (const word of ['parseJournal', 'normalizeRoot', 'sameRoot', 'JOURNAL_READ_LIMIT', 'JOURNAL_ROTATED_FILE', 'events.1.jsonl', 'companion-event/1']) {
      assert.equal(source.includes(word), false, `${name} names ${word}`);
    }
    assert.doesNotMatch(source, /\$\.fs\.read\([^)]*(?:journal|JOURNAL|companion\/|events\.jsonl)/u, `${name} reads no journal file`);
  }
  const register = readFileSync(join(templates, 'register.mjs'), 'utf8');
  assert.match(register, /\$\.fs\.list\(journalDirectory\(session\.dataDir\)\)/u, 'the companion watches the journal by its listing only');
});

test('SCN-003: valid events of the root in journal order, each once, narrowed by run and limit', t => {
  const f = cockpitFixture();
  t.after(() => f.close());
  const other = otherRoot();
  t.after(() => rmSync(other, { recursive: true, force: true }));
  const journal = journalFixture(t);
  journal.write([...noiseLines(f.root, other), journalLine(f.root, 'b', 3, { run_id: 'fixture-b' }), journalLine(f.root, 'a', 4),
    journalLine(f.root, 'c', 5, { kind: 'write_rejected', outcome: 'rejected', reason: 'stale_revision' })],
  [journalLine(f.root, 'a', 0), journalLine(other, 'rotated-other', 0)]);
  const all = readCompanionEvents(journal.dataRoot, f.root);
  assert.equal(all.state, 'available');
  assert.deepEqual(ids(all), ['a', 'b', 'c'], 'rotation file before the current file, a repeated id once, noise skipped');
  assert.deepEqual(all.items[0], { id: 'a', at: '2026-11-27T09:00:00.000Z', run_id: 'fixture-a', kind: 'approval_requested', gate: 'UR', reason: null },
    'the item shape, without review facts unless asked');
  assert.equal(all.items[2].reason, 'stale_revision');
  assert.deepEqual(ids(readCompanionEvents(journal.dataRoot, f.root, { runId: 'fixture-a' })), ['a', 'c']);
  assert.deepEqual(ids(readCompanionEvents(journal.dataRoot, f.root, { limit: 2 })), ['b', 'c'], 'the newest within the limit');
  assert.equal(COMPANION_EVENT_HISTORY_LIMIT, 32);
  journal.write(Array.from({ length: 40 }, (_, index) => journalLine(f.root, `n${index}`, index % 60)));
  assert.deepEqual(ids(readCompanionEvents(journal.dataRoot, f.root)), Array.from({ length: 32 }, (_, index) => `n${index + 8}`));
});

test('SCN-004: read bounds, rotation and missing or invalid data roots', t => {
  const f = cockpitFixture();
  t.after(() => f.close());
  const journal = journalFixture(t);
  assert.deepEqual(readCompanionEvents(journal.dataRoot, f.root), { state: 'available', items: [] }, 'a missing journal is empty');
  const bare = mkdtempSync(join(tmpdir(), 'agdf-journal-bare-'));
  t.after(() => rmSync(bare, { recursive: true, force: true }));
  assert.deepEqual(readCompanionEvents(bare, f.root), { state: 'available', items: [] }, 'a missing companion folder is empty');
  for (const dataRoot of ['relative/data', join(bare, 'absent'), null]) {
    assert.deepEqual(readCompanionEvents(dataRoot, f.root), { state: 'unavailable', items: [] }, `${dataRoot} is unavailable`);
  }
  journal.oversize(JOURNAL_FILE, [journalLine(f.root, 'late', 9)]);
  assert.deepEqual(readCompanionEvents(journal.dataRoot, f.root), { state: 'unavailable', items: [] }, 'an oversized current file');
  journal.write([journalLine(f.root, 'current', 9)]);
  journal.oversize(JOURNAL_ROTATED_FILE, [journalLine(f.root, 'rotated', 8)]);
  assert.deepEqual(ids(readCompanionEvents(journal.dataRoot, f.root)), ['current'], 'an oversized rotation file is skipped');
});

test('SCN-005: another spelling of the project root matches; another directory does not', t => {
  const f = cockpitFixture();
  t.after(() => f.close());
  const other = otherRoot();
  const links = mkdtempSync(join(tmpdir(), 'agdf-journal-alias-'));
  t.after(() => { rmSync(links, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true }); });
  const journal = journalFixture(t);
  const lines = [journalLine(other, 'other', 1)];
  if (process.platform === 'win32') {
    const letter = f.root[0];
    const swapped = (letter === letter.toLowerCase() ? letter.toUpperCase() : letter.toLowerCase()) + f.root.slice(1);
    lines.push(journalLine(swapped, 'drive-case', 2));
  }
  const alias = join(links, 'alias');
  let aliased = true;
  try { symlinkSync(f.root, alias, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { aliased = false; t.diagnostic(`alias case skipped: ${error.code}`); }
  if (aliased) lines.push(journalLine(alias, 'alias', 3));
  journal.write(lines);
  const expected = [...(process.platform === 'win32' ? ['drive-case'] : []), ...(aliased ? ['alias'] : [])];
  assert.deepEqual(ids(readCompanionEvents(journal.dataRoot, f.root)), expected);
  if (!aliased) t.skip('the platform refused to create a junction or symlink (evidence gap, see diagnostic)');
});

test('SCN-012: the Claude companion through the run view and the Codex observation receive the reader\'s events', async t => {
  const f = cockpitFixture();
  t.after(() => f.close());
  const other = otherRoot();
  t.after(() => rmSync(other, { recursive: true, force: true }));
  const journal = journalFixture(t);
  const review = [{ slot: 'UR', source: 'staged', path: null, digest: `sha256:${'a'.repeat(64)}`, bytes: 6, preview: '# UR\n', truncated: false, source_match: 'not_determinable' }];
  journal.write([...noiseLines(f.root, other), journalLine(f.root, 'b', 3, { run_id: 'fixture-b' }),
    journalLine(f.root, 'm', 4, { kind: 'material_staged', review }), journalLine(f.root, 'c', 5, { kind: 'effect_unknown', outcome: 'effect_unknown', reason: 'dispatch_timeout' })],
  [journalLine(f.root, 'a', 0, { kind: 'approval_recorded' })]);
  const pick = items => items.map(({ id, kind, gate, reason, at }) => ({ id, kind, gate, reason, at }));
  const reader = readCompanionEvents(journal.dataRoot, f.root, { review: true });
  assert.deepEqual(ids(reader), ['a', 'b', 'm', 'c']);

  // The Claude companion: run view with the data root, mapped by the template's own snapshot reader.
  const snapshot = snapshotFromRunView(JSON.stringify(readRunView(f.root, { language: 'en', companionDataRoot: journal.dataRoot })), { now: 0 });
  assert.equal(snapshot.events.state, 'available');
  assert.deepEqual(pick(snapshot.events.items), pick(reader.items), 'all runs of the root, in journal order');
  assert.deepEqual(snapshot.events.items.find(item => item.id === 'm').review, review, 'the review fact reaches the companion');
  assert.equal(snapshotFromRunView(JSON.stringify(readRunView(f.root, { language: 'en' })), { now: 0 }).events, null, 'no data root, no events');

  // The Codex card: the Cockpit observation of the selected run, newest first.
  const service = createCockpitSessionService(f.root, { integrationSurface: 'codex', companionDataRoot: journal.dataRoot });
  t.after(() => service.close());
  const { _meta } = await service.render({ run_id: 'fixture-a' });
  const observed = (await service.read({ session_id: _meta.agdf_cockpit.session_id, operation: 'snapshot', run_id: 'fixture-a' })).companion_observation.events;
  assert.equal(observed.state, 'available');
  const ofRun = reader.items.filter(item => item.run_id === 'fixture-a').reverse();
  assert.deepEqual(pick(observed.items), pick(ofRun), 'the selected run\'s events, newest first');
  assert.ok(observed.items.every(item => item.run_id === 'fixture-a' && !('review' in item)));

  // An unusable journal is unavailable for both consumers alike.
  journal.oversize(JOURNAL_FILE);
  assert.deepEqual(snapshotFromRunView(JSON.stringify(readRunView(f.root, { language: 'en', companionDataRoot: journal.dataRoot })), { now: 0 }).events,
    { state: 'unavailable', items: [] });
  const fresh = await service.read({ session_id: _meta.agdf_cockpit.session_id, operation: 'freshness', snapshot_id: (await service.read({
    session_id: _meta.agdf_cockpit.session_id, operation: 'snapshot', run_id: 'fixture-a' })).snapshot_id });
  assert.deepEqual(fresh.companion_observation.events, { state: 'unavailable', items: [] });
});
