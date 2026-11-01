import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { importCockpitArchive } from './import-cockpit-archive.mjs';
import { legacyArchiveFixture } from './support/legacy-archive-fixture.mjs';
import { createCockpitReader } from '../packages/core/lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../packages/core/lib/control-inspect/cockpit-session.js';
import { readCockpitArchive } from '../packages/core/lib/control-inspect/cockpit-archive.js';
import { fixture as currentCockpitFixture } from '../packages/core/test/control-cockpit-fixtures.js';
import { readRunInventory } from '../packages/core/lib/control-state/run-inventory-reader.js';
import { startControlServer } from '../packages/control-ui/server/service.mjs';
const fixture = t => { const f = legacyArchiveFixture(); t.after(f.dispose); return f; };
function imported(t, options) { const f = fixture(t), plan = importCockpitArchive(f.root); const result = importCockpitArchive(f.root, { apply: true, expected: plan.source_digest, ...options }); return { ...f, plan, result }; }
test('preview writes nothing; apply retains exact original files/empty directories and creates only historical entries', t => {
  const f = fixture(t), original = fs.readFileSync(join(f.root, '.agdf/control/artefacts/old-run/UR.md'));
  const before = fs.readdirSync(join(f.root, '.agdf'));
  const plan = importCockpitArchive(f.root); assert.deepEqual(fs.readdirSync(join(f.root, '.agdf')), before);
  assert.equal(plan.archived_entries, 2); assert.equal(plan.active_runs_created, 0);
  const result = importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
  assert.equal(result.status, 'archived'); assert.equal(result.approvals_created, 0);
  assert.deepEqual(fs.readFileSync(join(f.root, result.backup, 'artefacts/old-run/UR.md')), original);
  assert.deepEqual(fs.readFileSync(join(f.root, '.agdf/control/archive/source/runs/old-run/documents/UR.md')), original);
  assert.ok(fs.statSync(join(f.root, '.agdf/control/archive/source/runs/old-run/documents/empty')).isDirectory());
  assert.ok(!fs.existsSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md')));
  assert.equal(JSON.parse(fs.readFileSync(join(f.root, '.agdf/control/config.json'))).control_layout, 'run-folders-v1');
  assert.equal(readRunInventory(f.root).runs.length, 0);
  assert.equal(importCockpitArchive(f.root, { apply: true, expected: plan.source_digest }).status, 'already_archived');
});
test('inert captured locks and unusual file names remain byte-exact historical documents', t => {
  const f = fixture(t); f.put('artefacts/old-run/evidence/capture/.coordination.lock', 'historical bytes');
  f.put('artefacts/old-run/evidence/name:älter.txt', 'older unicode filename');
  const plan = importCockpitArchive(f.root); assert.deepEqual(plan.blockers, []);
  importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
  const index = readCockpitArchive(f.root), doc = index.entries.find(r => r.id === 'old-run').documents.find(d => d.original_path.endsWith('name:älter.txt'));
  assert.equal(fs.readFileSync(join(f.root, doc.path), 'utf8'), 'older unicode filename');
});
test('current scaffold preserves valid separate chat and artefact language preferences', t => {
  const f = fixture(t); f.put('config.json', '{"artifact_language":"en","chat_language":"de","runtime_language":"en"}');
  const plan = importCockpitArchive(f.root); importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
  const current = JSON.parse(fs.readFileSync(join(f.root, '.agdf/control/config.json')));
  assert.equal(current.chat_language, 'de'); assert.equal(current.artifact_language, 'en'); assert.equal(current.control_layout, 'run-folders-v1');
});
test('invalid old metadata is preserved without inventing historical facts; current admission blocks import', t => {
  const f = fixture(t); f.put('config.json', 'null'); f.put('runs/old-run/RUN_STATE.md', Buffer.from([0xff, 0xfe, 0x00]));
  const plan = importCockpitArchive(f.root); importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
  const old = readCockpitArchive(f.root).entries.find(r => r.id === 'old-run');
  assert.equal(old.recorded_lifecycle, null); assert.equal(old.recorded_gate, null); assert.deepEqual(old.recorded_approvals, []);
  const other = fixture(t); other.put('maintenance/admission/original.json', '{"original":"unknown"}');
  const pending = importCockpitArchive(other.root); assert.equal(pending.blockers.length, 1);
  assert.throws(() => importCockpitArchive(other.root, { apply: true, expected: pending.source_digest }), /pending_operations_or_locks/);
});
test('stale preview, pending operations and symlinks refuse without replacing the source', t => {
  const f = fixture(t), plan = importCockpitArchive(f.root);
  f.put('extra.txt', 'Changed after preview');
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: plan.source_digest }), /preview_digest_required_or_stale/);
  assert.ok(!fs.existsSync(join(f.root, '.agdf/backups')));
  f.put('runs/old-run/RUN_STEP_PENDING.json', '{}');
  const pending = importCockpitArchive(f.root); assert.equal(pending.blockers.length, 1);
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: pending.source_digest }), /pending_operations_or_locks/);
  if (process.platform !== 'win32') { fs.symlinkSync(join(f.root, '.agdf/control/extra.txt'), join(f.root, '.agdf/control/link')); assert.throws(() => importCockpitArchive(f.root), /symlink_denied/); }
});
test('unknown backup entries, including a dangling symlink, are never replaced', t => {
  const f = fixture(t), plan = importCockpitArchive(f.root), backup = join(f.root, plan.backup);
  fs.mkdirSync(backup, { recursive: true }); fs.writeFileSync(join(backup, 'foreign.txt'), 'Keep foreign bytes');
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: plan.source_digest }), /backup_already_exists/);
  assert.equal(fs.readFileSync(join(backup, 'foreign.txt'), 'utf8'), 'Keep foreign bytes');
  if (process.platform !== 'win32') {
    const other = fixture(t), selected = importCockpitArchive(other.root), link = join(other.root, selected.backup);
    fs.mkdirSync(join(other.root, '.agdf/backups')); fs.symlinkSync(join(other.root, 'missing-target'), link);
    assert.throws(() => importCockpitArchive(other.root, { apply: true, expected: selected.source_digest }), /backup_already_exists/);
    assert.ok(fs.lstatSync(link).isSymbolicLink());
  }
});
for (const phase of ['after_backup', 'after_publish']) test(`interrupted ${phase} retains journal/backup and resumes the exact original import`, t => {
  const f = fixture(t), plan = importCockpitArchive(f.root);
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: plan.source_digest, checkpoint: p => { if (p === phase) throw Error('simulated_exit'); } }), /simulated_exit/);
  assert.ok(fs.existsSync(join(f.root, '.agdf/ARCHIVE_IMPORT_PENDING.json')));
  assert.throws(() => importCockpitArchive(f.root), /resume_required/);
  assert.throws(() => importCockpitArchive(f.root, { apply: true, resume: true, expected: 'sha256:' + '0'.repeat(64) }), /journal_invalid/);
  assert.equal(importCockpitArchive(f.root, { apply: true, resume: true, expected: plan.source_digest }).status, 'archived');
  assert.equal(readRunInventory(f.root).runs.length, 0);
  assert.ok(!fs.existsSync(join(f.root, '.agdf/ARCHIVE_IMPORT_PENDING.json')));
});
test('changed source before commit and changed backup during recovery stay protected', t => {
  const f = fixture(t), plan = importCockpitArchive(f.root);
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: plan.source_digest, checkpoint: p => { if (p === 'before_commit') f.put('extra.txt', 'Foreign write'); } }), /source_changed/);
  assert.ok(fs.existsSync(join(f.root, '.agdf/control/extra.txt')));
  const fresh = importCockpitArchive(f.root);
  assert.throws(() => importCockpitArchive(f.root, { apply: true, expected: fresh.source_digest, checkpoint: p => { if (p === 'after_backup') throw Error('simulated_exit'); } }), /simulated_exit/);
  fs.writeFileSync(join(f.root, fresh.backup, 'extra.txt'), 'Foreign backup change');
  assert.throws(() => importCockpitArchive(f.root, { apply: true, resume: true, expected: fresh.source_digest }), /backup_changed/);
  assert.ok(fs.existsSync(join(f.root, '.agdf/ARCHIVE_IMPORT_PENDING.json')));
});
test('Cockpit archive is read-only, digest-bound and never evaluated as a current Run', t => {
  const f = imported(t), reader = createCockpitReader(f.root), overview = reader.snapshot();
  assert.equal(overview.state, 'available', JSON.stringify(overview)); assert.equal(overview.data.counts.active, 0); assert.equal(overview.data.counts.archive, 2);
  const row = overview.data.entries.find(r => r.key === 'old-run'); assert.equal(row.kind, 'archive');
  const data = reader.archive(row.row_id, overview.snapshot_id); assert.equal(data.data.entry.recorded_lifecycle, 'completed');
  assert.equal(data.data.entry.recorded_approvals[0].status, 'approved'); assert.equal(data.data.entry.authorizes, false);
  assert.equal(data.data.entry.evaluation, undefined);
  assert.throws(() => reader.archive(randomUUID(), overview.snapshot_id), /resource_denied/);
  assert.throws(() => reader.archive(row.row_id, overview.snapshot_id, randomUUID()), /resource_denied/);
  const doc = data.data.entry.resources.find(r => r.original_path.endsWith('/UR.md'));
  const document = reader.archive(row.row_id, overview.snapshot_id, doc.resource_id);
  assert.equal(document.data.document.content, fs.readFileSync(join(f.root, doc.path), 'utf8'));
  fs.appendFileSync(join(f.root, doc.path), 'tampered');
  assert.throws(() => reader.archive(row.row_id, overview.snapshot_id, doc.resource_id), /source_changed/);
});
test('recorded active source remains archived; the new global history folder and live gate fields are absent', t => {
  const f = fixture(t), state = join(f.root, '.agdf/control/runs/old-run/RUN_STATE.md');
  fs.writeFileSync(state, fs.readFileSync(state, 'utf8').replace('- lifecycle: completed', '- lifecycle: active'));
  const plan = importCockpitArchive(f.root); importCockpitArchive(f.root, { apply: true, expected: plan.source_digest });
  const index = readCockpitArchive(f.root); assert.equal(index.schema, 'cockpit-archive/1');
  assert.equal(index.runs, undefined); assert.equal(index.entries.find(r => r.id === 'old-run').entry_kind, 'run');
  assert.ok(!fs.existsSync(join(f.root, '.agdf/control/history')));
  const reader = createCockpitReader(f.root), overview = reader.snapshot(), row = overview.data.entries.find(r => r.key === 'old-run');
  assert.deepEqual(overview.data.counts, { active: 0, planned: 0, completed: 0, archive: 2 });
  assert.equal(row.kind, 'archive'); assert.equal(row.section, 'archive');
  const archived = reader.archive(row.row_id, overview.snapshot_id).data.entry;
  assert.equal(archived.recorded_lifecycle, 'active'); assert.equal(archived.lifecycle, undefined); assert.equal(archived.gate, undefined);
  assert.equal(archived.authorizes, false); assert.equal(archived.evaluation, undefined);
});
test('ended current Runs and imported archives have independent counts and routes', t => {
  const f = imported(t), live = currentCockpitFixture(); t.after(live.dispose);
  fs.cpSync(join(f.root, '.agdf/control/archive'), join(live.root, '.agdf/control/archive'), { recursive: true });
  const reader = createCockpitReader(live.root), overview = reader.snapshot();
  assert.equal(overview.data.counts.active, 1); assert.equal(overview.data.counts.completed, 1); assert.equal(overview.data.counts.archive, 2);
  assert.ok(overview.data.entries.filter(r => r.section === 'completed').every(r => r.kind === 'run'));
  assert.ok(overview.data.entries.filter(r => r.section === 'archive').every(r => r.kind === 'archive'));
});
test('malicious archive manifest cannot register arbitrary paths', t => {
  const f = imported(t), path = join(f.root, '.agdf/control/archive/INDEX.json'), index = JSON.parse(fs.readFileSync(path));
  index.entries[0].documents[0].path = '.agdf/control/archive/source/../../config.json'; fs.writeFileSync(path, JSON.stringify(index));
  assert.throws(() => readCockpitArchive(f.root), /archive_invalid/);
});
test('production MCP session and actual HTTP route expose the same scoped historical document', async t => {
  const f = imported(t), service = createCockpitSessionService(f.root); t.after(() => service.close());
  const session_id = (await service.render())._meta.agdf_cockpit.session_id;
  const overview = await service.read({ session_id, operation: 'snapshot' });
  const row = overview.data.entries.find(r => r.key === 'old-run');
  const first = await service.read({ session_id, operation: 'archive', snapshot_id: overview.snapshot_id, row_id: row.row_id });
  assert.equal(first.data.entry.recorded_lifecycle, 'completed');
  const resource = first.data.entry.resources.find(r => r.original_path.endsWith('/UR.md'));
  const doc = await service.read({ session_id, operation: 'archive', snapshot_id: overview.snapshot_id, row_id: row.row_id, resource_id: resource.resource_id });
  assert.equal(doc.data.document.available, true);
  assert.equal((await service.read({ session_id, operation: 'archive', snapshot_id: overview.snapshot_id, row_id: row.row_id, resource_id: randomUUID() })).code, 'resource_denied');
  const server = await startControlServer({ dir: f.root }); t.after(() => server.close());
  const get = async path => { const r = await fetch(server.origin + path, { headers: { 'x-agdf-session': server.secret } }); assert.equal(r.status, 200); return r.json(); };
  const obsolete = await fetch(server.origin + `/api/history/${row.row_id}?snapshot=${overview.snapshot_id}`, { headers: { 'x-agdf-session': server.secret } });
  assert.equal(obsolete.status, 403, 'unpublished history alias is not retained');
  const http = await get('/api/snapshot'), hrow = http.data.entries.find(r => r.key === 'old-run');
  const hd = await get(`/api/archive/${hrow.row_id}?snapshot=${http.snapshot_id}&resource=${resource.resource_id}`);
  assert.equal(hd.data.document.content, doc.data.document.content);
});
