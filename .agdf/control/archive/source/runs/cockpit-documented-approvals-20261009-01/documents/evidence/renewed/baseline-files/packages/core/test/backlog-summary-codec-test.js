import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture } from './control-cockpit-fixtures.js';
import { recordBacklogSummary, decodeBacklogMarker } from '../lib/control-state/backlog-summary.js';
import { runWorkSummary } from '../lib/control-evaluation/run-work-summary.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { projectCockpitBacklog } from '../lib/control-inspect/cockpit-backlog.js';
import { canonicalJson } from '../lib/control-state/approval-command-contract.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';

const f = fixture(), path = join(f.root, '.agdf/control/MASTER_BACKLOG.md'), section = 'Active Backlog';
let checks = 0; const pass = label => { checks++; console.log('PASS ' + label); };
try {
  const original = readFileSync(path, 'utf8');
  const row = '| P1 | fixture-a | Original title | Needs UR | [UR](artefacts/fixture-a/UR.md) | | A stored next action |';
  const other = '| P2 | foreign | Protected foreign title | In Progress | | | Protected foreign action |';
  const initial = original.replace('|---:|---|---|---|---|---|---|', '|---:|---|---|---|---|---|---|\n' + row + '\n' + other);
  const run = readFileSync(f.runPath, 'utf8'), revision = parseRunState(run).meta.revision_id;
  const summary = runWorkSummary(f.root, run, f.runPath);
  const saved = recordBacklogSummary(f.root, initial, 'fixture-a', section, summary, revision);
  assert.ok(saved.includes(row)); assert.ok(saved.includes(other));
  const marker = saved.split('\n').find(line => line.startsWith('<!-- agdf-backlog-summary-'));
  assert.ok(saved.includes(other + '\n\n<!--'));
  assert.equal(recordBacklogSummary(f.root, saved, 'fixture-a', section, summary, revision), saved);
  assert.throws(() => recordBacklogSummary(f.root, initial + 'x'.repeat(2097152), 'fixture-a', section, summary, revision), /AGDF_BACKLOG_LAYOUT_UNSUPPORTED/);
  assert.throws(() => recordBacklogSummary(f.root, initial, 'fixture-a', section, { ...summary, display_action: 'x'.repeat(65536) }, revision), /AGDF_BACKLOG_SUMMARY_INVALID/);
  const nearLimit = initial + 'x'.repeat(2097152 - Buffer.byteLength(initial) - 10);
  assert.throws(() => recordBacklogSummary(f.root, nearLimit, 'fixture-a', section, summary, revision), /AGDF_BACKLOG_LAYOUT_UNSUPPORTED/);
  writeFileSync(path, saved); const projected = projectCockpitBacklog(f.root);
  assert.equal(projected.data.entries[0].saved_summary.provenance_state, 'recorded');
  assert.equal(projected.data.entries[1].saved_summary.provenance_state, 'unverified');
  assert.equal(projected.data.entries[0].title, 'Original title');
  pass('bounded saved roundtrip outside table preserves title, foreign row and exact repeat bytes');

  for (const replacement of [marker.replace('-v1 ', '-v2 '), '<!-- agdf-backlog-summary-v1 !!!! -->',
    '<!-- agdf-backlog-summary-v1 ' + 'A'.repeat(90000) + ' -->']) {
    writeFileSync(path, saved.replace(marker, replacement));
    assert.equal(projectCockpitBacklog(f.root).data.entries[0].saved_summary.provenance_state, 'invalid');
    assert.equal(projectCockpitBacklog(f.root).data.entries[0].stored_next_step, 'A stored next action');
  }
  for (const modify of [r => ({ ...r, authorizes: true }), r => ({ ...r, target_id: 'sha256:' + '0'.repeat(64) }),
    r => ({ ...r, sources: [{ path: '../../secret', digest: 'sha256:' + '0'.repeat(64), state: 'available' }] }),
    r => ({ ...r, unknown: 'not accepted' }), r => ({ ...r, schema_version: 2 })]) {
    const record = modify(decodeBacklogMarker(marker).record);
    const modified = '<!-- agdf-backlog-summary-v1 ' + Buffer.from(canonicalJson(record)).toString('base64') + ' -->';
    writeFileSync(path, saved.replace(marker, modified));
    assert.equal(projectCockpitBacklog(f.root).data.entries[0].saved_summary.provenance_state, 'invalid');
  }
  for (const content of [saved + '\n' + marker, saved.replace('Original title', 'Edited title'), saved.replace(row, row.replace('Needs UR', 'Edited status')),
    saved.replace('A stored next action', 'Other next action')]) {
    writeFileSync(path, content); assert.equal(projectCockpitBacklog(f.root).data.entries[0].saved_summary.provenance_state, 'invalid');
  }
  pass('unknown versions, malformed/oversized/foreign/path/prototype-like fields and row mutations fail closed');

  writeFileSync(path, initial); assert.equal(projectCockpitBacklog(f.root).data.entries[0].saved_summary.provenance_state, 'unverified');
  const legacy = initial.replace('| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |',
    '| Prio | Key | Title | Status | UR | Brownfield Review | PRD | SD | TP | QA | OR | Current spec | Notes |')
    .replace('|---:|---|---|---|---|---|---|', '|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    .replace(row, '| P1 | fixture-a | Original title | In Progress | [UR](artefacts/fixture-a/UR.md) | | | | | | | retained | Old raw notes |')
    .replace(other, '| P2 | foreign | Protected foreign title | In Progress | | | | | | | | | Protected foreign action |');
  writeFileSync(path, legacy); assert.equal(projectCockpitBacklog(f.root).data.entries[0].stored_next_step, 'Old raw notes');
  assert.equal(projectCockpitBacklog(f.root).data.entries[0].saved_summary.provenance_state, 'unverified');
  pass('old seven/thirteen-column rows retain stored text without migration');

  writeFileSync(path, saved);
  const before = readFileSync(path); const reader = createCockpitReader(f.root); const snapshot = reader.snapshot();
  assert.equal(snapshot.data.file_count, 1, 'saved summary list does not resolve a Run or QA report');
  assert.equal(snapshot.data.entries[0].saved_summary.provenance_state, 'recorded');
  assert.deepEqual(readFileSync(path), before, 'read is never synchronization');
  pass('saved-only immutable scope reads exactly the Backlog and never writes');
} finally { f.close(); }
console.log(`${checks} codec checks passed`);
