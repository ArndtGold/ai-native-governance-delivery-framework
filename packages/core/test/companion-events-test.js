// Companion events (TP T-007, T-008; SCN-012 pure part, SCN-010 rotation, SCN-013 preview bounds):
// the pure mapping from projected MCP tool results to events, the bounded preview, the journal reader
// and the bounded journal writer.
import assert from 'node:assert/strict';
import test from 'node:test';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { projectToolResult, TOOL_RESULT_META } from '../lib/mcp-tool-errors.js';
import { interactionLocales } from '../lib/resources/context.js';
import { localePack } from '../lib/interaction-presentation.js';
import { COMPANION_EVENT_SCHEMA, EVENT_KINDS, PREVIEW_LIMITS, TOAST_KINDS, TOOL_RESULT_META_KEY, deriveEvent, eventKind,
  parseEventLines, reviewFact, reviewPreview, sameRoot } from '../lib/companion/events.js';
import { COMPANION_DATA_ROOT_ENV, JOURNAL_LIMIT_BYTES, JOURNAL_ROTATED_FILE, appendJournalEvent, createCompanionJournal, eventRoot, journalPath, reviewFacts } from '../lib/companion/journal.js';
import { COMPANION_DATA_ROOT_ENV as LAUNCHER_ENV } from '../../cli/lib/mcp-lifecycle/plugin-runtime.js';

const pack = localePack(interactionLocales, 'en');
const RUN = 'run-11111111-2222-4333-8444-555555555555';
const base = { schema_version: '1', presentation_language: 'en', working_directory: '/p', primary_target: '/p', target_source: 'explicit_target',
  target_id: `sha256:${'a'.repeat(64)}`, run_id: RUN, expected_revision_id: '11111111-2222-4333-8444-555555555555',
  operation_id: '66666666-7777-4888-8999-000000000000', assurance: 'cooperative_local' };
const input = (kind, payload) => ({ ...base, command: { kind, payload } });
const accepted = { schema_version: '1', outcome: 'accepted', authorizes: false, receipt: null };
// Results as the runtime projects them, with the private tool-result descriptor.
const project = (tool, value, result, facts) => projectToolResult(tool, value, result, pack, facts);
const at = { id: 'e1', at: '2026-11-05T12:00:00.000Z' };

test('the descriptor key and the launcher variable agree with their owners', () => {
  assert.equal(TOOL_RESULT_META_KEY, TOOL_RESULT_META);
  assert.equal(LAUNCHER_ENV, COMPANION_DATA_ROOT_ENV);
});

test('SCN-012: each kind is derived exactly once from its MCP outcome; reads, replays and other commands derive none', () => {
  const cases = [
    ['agdf_prepare', input('presentation.deliver', { gate: 'SD', presentation_id: base.operation_id, route: 'markdown' }), accepted, undefined, 'approval_requested', 'SD'],
    ['agdf_approve', input('approval.record', { gate: 'SD', presentation_id: base.operation_id, response: 'Approval: SD' }), accepted, undefined, 'approval_recorded', 'SD'],
    ['agdf_closeout', input('closeout.record', { or: { path: 'x.md', digest: `sha256:${'b'.repeat(64)}` }, confirmation: 'c' }), accepted, undefined, 'run_completed', 'OR'],
    ['agdf_record', input('material.stage', { action: 'seal', transfer_id: base.operation_id }), accepted, undefined, 'material_staged', null],
    ['agdf_record', input('step.record', { step: 'ur', title: 't', source: { path: 'u.md', digest: `sha256:${'c'.repeat(64)}` } }), accepted, undefined, 'document_recorded', 'UR'],
    ['agdf_record', input('step.record', { step: 'internal', internal_step: 'CD+Tests', decision: 'pass', source: { path: 'e.md', digest: `sha256:${'c'.repeat(64)}` } }), accepted, undefined, 'document_recorded', 'CD+Tests'],
    ['agdf_record', input('artefact.record', { gate: 'PRD', material: { material_id: base.operation_id, digest: `sha256:${'d'.repeat(64)}` }, reviewer: 'r', reviewed: true }), accepted, undefined, 'document_recorded', 'PRD'],
    // Review finding 7: the two other document recordings of run-steps.recordRunStep are events too.
    ['agdf_record', input('verified_change.record', { phase: 'execution', source: { path: 'v.md', digest: `sha256:${'c'.repeat(64)}` } }), accepted, undefined, 'document_recorded', 'Verified Change'],
    ['agdf_revise', input('ur_draft.replace', { title: 't', source: { material_id: base.operation_id, digest: `sha256:${'d'.repeat(64)}` } }), accepted, undefined, 'document_recorded', 'UR'],
    ['agdf_record', input('step.record', { step: 'ur', title: 't', source: { path: 'u.md', digest: `sha256:${'c'.repeat(64)}` } }),
      { schema_version: '1', outcome: 'rejected', authorizes: false, reason: 'material_transfer_expired', dispatch: 'not_dispatched' }, { code: 'material_transfer_expired', dispatch: 'not_dispatched' }, 'write_rejected', 'UR'],
    ['agdf_approve', input('approval.record', { gate: 'UR', presentation_id: base.operation_id, response: 'Approval: UR' }),
      { schema_version: '1', outcome: 'rejected', authorizes: false, reason: 'stale_revision' }, undefined, 'write_rejected', 'UR'],
    ['agdf_record', input('step.record', { step: 'evidence', reason: 'r', covers: 'c', source: { path: 'e.md', digest: `sha256:${'c'.repeat(64)}` } }),
      { schema_version: '1', outcome: 'effect_unknown', authorizes: false, reason: 'dispatch_timeout', operation_id: base.operation_id }, { code: 'dispatch_timeout', dispatch: 'unknown' }, 'effect_unknown', 'EVIDENCE'],
    ['agdf_closeout', input('closeout.record', { or: { path: 'x.md', digest: `sha256:${'b'.repeat(64)}` }, confirmation: 'c' }),
      { schema_version: '1', outcome: 'recovery_required', authorizes: false, reason: 'recovery_required' }, undefined, 'recovery_required', 'OR'],
  ];
  for (const [tool, value, result, facts, kind, gate] of cases) {
    const projected = project(tool, value, result, facts);
    assert.equal(eventKind(tool, value, projected), kind, `${tool} ${value.command.kind} ${result.outcome}`);
    const event = deriveEvent(tool, value, projected, { ...at, root: '/p' });
    assert.deepEqual([event.schema_version, event.kind, event.run_id, event.gate, event.at, event.operation_id, event.root],
      [COMPANION_EVENT_SCHEMA, kind, RUN, gate, at.at, base.operation_id, '/p']);
    assert.equal(event.reason, projected._meta[TOOL_RESULT_META].failed ? projected._meta[TOOL_RESULT_META].code : null);
  }
  for (const kind of EVENT_KINDS) assert.ok(cases.some(row => row[4] === kind), `${kind} has a case`);
  // Reads, a replay, a staging step before the seal and other accepted commands derive no event.
  const none = [
    ['agdf_inspect', { operation: 'gate-check' }, { outcome: 'inspect_result', authorizes: false }],
    ['agdf_dispatch', {}, { outcome: 'control_result' }],
    ['agdf_record', input('material.stage', { action: 'append', transfer_id: base.operation_id, file: 0, offset: 0, data: '' }), accepted],
    ['agdf_prepare', input('presentation.prepare', { gate: 'UR' }), accepted],
    ['agdf_run', input('run.create', { title: 't' }), accepted],
    ['agdf_approve', input('approval.record', { gate: 'UR' }), { outcome: 'already_applied', authorizes: false, receipt: null }],
  ];
  for (const [tool, value, result] of none) {
    assert.equal(eventKind(tool, value, result), null, `${tool} ${value.command?.kind ?? value.operation ?? ''}`);
    assert.equal(deriveEvent(tool, value, result, at), null);
  }
  assert.deepEqual(TOAST_KINDS, ['approval_requested', 'effect_unknown', 'recovery_required', 'run_completed']);
});

test('SCN-013: the preview keeps exactly 40 lines and 4096 bytes and truncates beyond', () => {
  const lines = count => Array.from({ length: count }, (_, index) => `line ${index + 1}`).join('\n');
  assert.deepEqual(reviewPreview(lines(40)), { text: lines(40), truncated: false, bytes: Buffer.byteLength(lines(40)) });
  assert.deepEqual(reviewPreview(`${lines(40)}\n`).truncated, false, 'a final line break is no 41st line');
  const over = reviewPreview(lines(41));
  assert.deepEqual([over.text, over.truncated], [`${lines(40)}\n`, true]);
  const exact = 'x'.repeat(PREVIEW_LIMITS.bytes);
  assert.deepEqual(reviewPreview(exact), { text: exact, truncated: false, bytes: 4096 });
  const long = reviewPreview(`${exact}y`);
  assert.deepEqual([long.text.length, long.truncated, long.bytes], [4096, true, 4097]);
  // A multi-byte character is never cut in half.
  const umlauts = reviewPreview('ä'.repeat(2049));
  assert.deepEqual([Buffer.byteLength(umlauts.text), umlauts.truncated], [4096, true]);
  assert.deepEqual(reviewFact({ slot: 'UR', source: 'staged', digest: 'nonsense', text: 'a', sourceMatch: 'guess' }),
    { slot: 'UR', source: 'staged', path: null, digest: null, bytes: 1, preview: 'a', truncated: false, source_match: 'unavailable' }, 'unknown facts are unavailable, never guessed');
});

test('the journal reader skips malformed and foreign lines; roots compare normalized', () => {
  const good = deriveEvent('agdf_approve', input('approval.record', { gate: 'UR' }), project('agdf_approve', input('approval.record', { gate: 'UR' }), accepted), at);
  const text = [JSON.stringify(good), '{"schema_version":"companion-event/1","kind":"approval_rec', '{"schema_version":"other","kind":"approval_recorded","id":"x","at":"y"}', '', 'not json'].join('\n');
  assert.deepEqual(parseEventLines(text), [good]);
  assert.ok(sameRoot('C:\\Work\\Repo\\', 'c:/work/repo', { win32: true }));
  assert.ok(!sameRoot('C:\\Work\\Repo', 'c:/work/repo'));
  assert.ok(!sameRoot('/p/a', '/p/ab'));
  assert.ok(!sameRoot(null, null));
});

test('SCN-010: the journal rotates at 256 KiB into one rotation file and swallows write failures', t => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-journal-'));
  t.after(() => rmSync(dataRoot, { recursive: true, force: true }));
  const event = { ...deriveEvent('agdf_approve', input('approval.record', { gate: 'UR' }), project('agdf_approve', input('approval.record', { gate: 'UR' }), accepted), at), reason: 'x'.repeat(200) };
  const line = Buffer.byteLength(`${JSON.stringify(event)}\n`);
  const fit = Math.floor(JOURNAL_LIMIT_BYTES / line);
  for (let index = 0; index < fit; index += 1) assert.equal(appendJournalEvent(dataRoot, event), true);
  assert.equal(existsSync(join(dataRoot, 'companion', JOURNAL_ROTATED_FILE)), false);
  assert.ok(statSync(journalPath(dataRoot)).size <= JOURNAL_LIMIT_BYTES);
  assert.equal(appendJournalEvent(dataRoot, event), true);
  assert.equal(statSync(join(dataRoot, 'companion', JOURNAL_ROTATED_FILE)).size, fit * line, 'the full journal moved to the rotation file');
  assert.equal(statSync(journalPath(dataRoot)).size, line, 'the new journal starts with the new line');
  assert.equal(parseEventLines(readFileSync(journalPath(dataRoot), 'utf8')).length, 1);
  // An oversized line, a missing root and an unwritable root are refused without throwing.
  assert.equal(appendJournalEvent(dataRoot, { ...event, reason: 'x'.repeat(JOURNAL_LIMIT_BYTES) }), false);
  assert.equal(appendJournalEvent('', event), false);
  const blocked = mkdtempSync(join(tmpdir(), 'agdf-journal-blocked-'));
  t.after(() => rmSync(blocked, { recursive: true, force: true }));
  writeFileSync(join(blocked, 'companion'), 'a file where the directory belongs');
  assert.equal(appendJournalEvent(blocked, event), false);
});

test('SDD-006: two interleaving writers with rotation leave a bounded, readable journal', t => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-journal-interleave-'));
  t.after(() => rmSync(dataRoot, { recursive: true, force: true }));
  const template = deriveEvent('agdf_approve', input('approval.record', { gate: 'UR' }), project('agdf_approve', input('approval.record', { gate: 'UR' }), accepted), at);
  const limit = 4096;
  const written = [];
  // Two servers append in turn to the same journal, each rotating when its line would cross the bound.
  for (let index = 0; index < 60; index += 1) {
    for (const writer of ['a', 'b']) {
      const id = `${writer}-${index}`;
      if (appendJournalEvent(dataRoot, { ...template, id }, { limit })) written.push(id);
    }
  }
  const read = name => parseEventLines(readFileSync(join(dataRoot, 'companion', name), 'utf8'));
  const kept = [...read(JOURNAL_ROTATED_FILE), ...read('events.jsonl')].map(event => event.id);
  assert.equal(written.length, 120, 'every append succeeds');
  assert.ok(statSync(journalPath(dataRoot)).size <= limit && statSync(join(dataRoot, 'companion', JOURNAL_ROTATED_FILE)).size <= limit, 'both files stay bounded');
  assert.deepEqual(kept, written.slice(written.length - kept.length), 'the newest lines survive in write order, older ones rotate out');
  assert.ok(kept.includes('b-59') && kept.length > 1);

  // A writer that died mid-line leaves a cut line: the line joined to it is skipped, nothing else.
  const cutRoot = mkdtempSync(join(tmpdir(), 'agdf-journal-cut-'));
  t.after(() => rmSync(cutRoot, { recursive: true, force: true }));
  assert.equal(appendJournalEvent(cutRoot, { ...template, id: 'before' }), true);
  appendFileSync(journalPath(cutRoot), '{"schema_version":"companion-event/1","kind":"approval_rec');
  assert.equal(appendJournalEvent(cutRoot, { ...template, id: 'joined' }), true);
  assert.equal(appendJournalEvent(cutRoot, { ...template, id: 'after' }), true);
  assert.deepEqual(parseEventLines(readFileSync(journalPath(cutRoot), 'utf8')).map(event => event.id), ['before', 'after']);
});

test('CR A6: the event root keeps the caller\'s spelling of the same directory (junction), never a foreign one', t => {
  const base = mkdtempSync(join(tmpdir(), 'agdf-event-root-'));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const real = join(base, 'project'), other = join(base, 'other'), link = join(base, 'linked');
  mkdirSync(real); mkdirSync(other);
  symlinkSync(real, link, 'junction');
  const root = realpathSync(real);
  assert.equal(eventRoot({ primary_target: link }, root), link, 'a junction to the root keeps its spelling');
  assert.equal(eventRoot({ primary_target: real }, root), root);
  assert.equal(eventRoot({ primary_target: other }, root), root, 'another directory never replaces the resolved root');
  assert.equal(eventRoot({ primary_target: 'relative/path' }, root), root);
  assert.equal(eventRoot({}, root), root);
});

test('Review finding 7: the other document recordings carry review facts like step.record', t => {
  const root = mkdtempSync(join(tmpdir(), 'agdf-review-facts-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const facts = (tool, value) => reviewFacts(tool, value, project(tool, value, accepted), { root });
  const digest = `sha256:${'c'.repeat(64)}`;
  const byPath = facts('agdf_record', input('verified_change.record', { phase: 'execution', source: { path: 'missing.md', digest } }));
  assert.deepEqual(byPath.map(fact => [fact.slot, fact.source, fact.path, fact.digest, fact.source_match]), [['Verified Change', 'path', 'missing.md', digest, 'unavailable']]);
  const staged = facts('agdf_revise', input('ur_draft.replace', { title: 't', source: { material_id: base.operation_id, digest } }));
  assert.deepEqual(staged.map(fact => [fact.slot, fact.source, fact.digest, fact.source_match]), [['UR', 'staged', digest, 'not_determinable']]);
});

test('Review finding 4: a journal says whether a result leaves an event without writing one', t => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-observes-'));
  t.after(() => rmSync(dataRoot, { recursive: true, force: true }));
  const journal = createCompanionJournal({ dataRoot });
  const recorded = input('step.record', { step: 'ur', title: 't', source: { path: 'u.md', digest: `sha256:${'c'.repeat(64)}` } });
  assert.equal(journal.observes('agdf_record', recorded, project('agdf_record', recorded, accepted)), true);
  assert.equal(journal.observes('agdf_inspect', { operation: 'gate-check' }, { outcome: 'inspect_result', authorizes: false }), false);
  assert.equal(existsSync(journalPath(dataRoot)), false, 'asking writes nothing');
  assert.equal(createCompanionJournal({ dataRoot: '' }).observes('agdf_record', recorded, project('agdf_record', recorded, accepted)), false);
});
