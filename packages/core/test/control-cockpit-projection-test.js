import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createCockpitReader, projectCockpitAssessment } from '../lib/control-inspect/cockpit.js';
import { READ_LIMITS } from '../lib/control-read/snapshot.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { upsertTableRow } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
test('cockpit assessment projects the evaluated outcome without a second doctor-warning veto', () => {
  const report = { status: 'open', blocking_reason: 'none', missing_approval: 'none', doctor_status: 'warn' };
  assert.deepEqual(projectCockpitAssessment(report, 'active'), { state: 'open', authorizes: false });
  assert.equal(projectCockpitAssessment({ ...report, status: 'blocked' }, 'active').state, 'blocked');
  assert.equal(projectCockpitAssessment({ ...report, missing_approval: 'Approval: QA' }, 'active').state, 'blocked');
  assert.equal(projectCockpitAssessment({ ...report, status: 'unknown' }, 'active').state, 'unconfirmed');
  assert.equal(projectCockpitAssessment(report, 'abandoned').state, 'unconfirmed');
  assert.deepEqual(projectCockpitAssessment(report, 'completed'), { state: 'completed', authorizes: false });
});
test('captured assessment matches canonical gate evaluation and performs no writes', () => {
  const f = fixture(); try {
    const before = treeBytes(f.root), report = evaluateGateCheck(f.root, { runId:'fixture-a', ignoreRunIdEnv:true });
    const reader = createCockpitReader(f.root), s = reader.snapshot(), detail = reader.run('fixture-a', s.snapshot_id).data.run;
    assert.deepEqual(detail.evaluation.control_assessment, projectCockpitAssessment(report, detail.lifecycle));
    assert.equal(detail.evaluation.status, report.status);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('cockpit title identifies the bound UR instead of a generic current artefact heading', () => {
  const f = fixture(); try {
    const path = '.agdf/control/artefacts/fixture-a/CURRENT.md';
    fs.writeFileSync(join(f.root, f.documentPath), '# UR: Fixture document\n');
    fs.writeFileSync(join(f.root, path), '# Implementation Checkpoint\n');
    f.register('UR', f.documentPath);
    f.register('Brownfield Review', path);
    const content = upsertTableRow(fs.readFileSync(f.runPath, 'utf8'), 'Approvals', 0, 'UR', ['UR', 'not_applicable', 'Synthetic projection fixture only']);
    fs.writeFileSync(f.runPath, sealRunState(f.root, content));
    assert.equal(evaluateGateCheck(f.root, {runId:'fixture-a',ignoreRunIdEnv:true}).status_card.humanPresentation.runTitle, 'Implementation Checkpoint');
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), snapshot = reader.snapshot();
    const run = reader.run('fixture-a', snapshot.snapshot_id).data.run;
    assert.equal(run.title, 'Fixture document'); // Presentation omits the document-kind prefix.
    assert.deepEqual(treeBytes(f.root), before);
    fs.rmSync(join(f.root, f.documentPath));
    const next = reader.snapshot('fixture-a');
    assert.notEqual(next.data.run.title, 'Implementation Checkpoint');
  } finally { f.close(); }
});
test('SCN-001/002/008/020: backlog inventory stays passive; selected valid, completed and invalid Runs retain Core semantics and no writes', () => {
  const f = fixture(); try {
    fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), snapshot = reader.snapshot();
    assert.equal(snapshot.data.kind, 'backlog'); assert.equal(snapshot.data.entries.some(row => row.key === 'broken'), false);
    const detail = reader.run('fixture-a', snapshot.snapshot_id); assert.equal(detail.state, 'available');
    assert.equal(detail.data.run.lifecycle, 'active');
    const resource = detail.data.run.resources.find(r => r.type === 'UR');
    const document = reader.document(resource.resource_id, detail.snapshot_id);
    assert.match(document.data.document.content, /日本語/);
    assert.throws(() => reader.document('unknown', document.snapshot_id), /resource_denied/);
    reader.freshness(document.snapshot_id); assert.deepEqual(treeBytes(f.root), before);
    const completed = reader.run('fixture-completed', document.snapshot_id);
    assert.equal(completed.data.run.lifecycle, 'completed'); assert.equal(completed.data.run.evaluation.control_assessment.state, 'completed');
    const broken = reader.run('broken', completed.snapshot_id); assert.equal(broken.code, 'invalid_run');
    assert.equal(broken.data.run.resources.length, 0); assert.ok(broken.data.run.diagnostics.length);
    const newer = reader.snapshot(); assert.throws(() => reader.run('fixture-a', broken.snapshot_id), /resource_denied/);
    assert.notEqual(newer.snapshot_id, broken.snapshot_id); assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('SCN-010: missing, binary, invalid UTF8 and inclusive preview boundary', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root);
    for (const [name, bytes, state, code] of [
      ['none.txt', null, 'missing', 'document_missing'], ['binary.pdf', Buffer.from('pdf'), 'unsupported', 'document_unsupported'],
      ['invalid.txt', Buffer.from([255]), 'unsupported', 'document_unsupported'], ['exact.txt', Buffer.alloc(READ_LIMITS.preview, 97), 'available', null],
      ['large.txt', Buffer.alloc(READ_LIMITS.preview + 1, 97), 'unsupported', 'resource_limit']]) {
      const path = '.agdf/control/artefacts/fixture-a/' + name; if (bytes) fs.writeFileSync(join(f.root, path), bytes);
      f.register('UR', path); const s = reader.snapshot(), d = reader.run('fixture-a', s.snapshot_id), resource = d.data.run.resources.find(r => r.type === 'UR');
      const result = reader.document(resource.resource_id, d.snapshot_id); assert.equal(result.state, state, name); assert.equal(result.code, code, name);
    }
  } finally { f.close(); }
});
test('SCN-006/015: mutation of selected dependencies invalidates related reads, while backlog remains independent', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root), overview = reader.snapshot();
    fs.writeFileSync(join(f.root, f.documentPath), 'changed');
    assert.equal(reader.freshness(overview.snapshot_id).data.unchanged, true);
    const selected = reader.run('fixture-a', overview.snapshot_id);
    fs.writeFileSync(join(f.root, f.documentPath), 'changed again');
    assert.throws(() => reader.run('fixture-a', selected.snapshot_id), /source_changed/);
    assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
    assert.equal(reader.snapshot('fixture-a').state, 'available');
  } finally { f.close(); }
});
test('SCN-002/008: absent and genuinely empty stores differ, JSON/text retain exact source and registered links resolve only within manifest', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root);
    const json = '.agdf/control/artefacts/fixture-a/PRD.json', txt = '.agdf/control/artefacts/fixture-a/SD.txt';
    fs.writeFileSync(join(f.root, json), '{"source":"日本語"}\n'); fs.writeFileSync(join(f.root, txt), 'Original text\n');
    fs.writeFileSync(join(f.root, f.documentPath), '# Links\n[JSON](PRD.json) [unknown](secret.txt) [outside](../../../../secret.txt)');
    f.register('PRD', json); f.register('SD', txt);
    let d = reader.snapshot('fixture-a');
    for (const type of ['PRD', 'SD']) {
      const r = d.data.run.resources.find(r => r.type === type);
      const doc = reader.document(r.resource_id, d.snapshot_id);
      assert.equal(doc.data.document.content, fs.readFileSync(join(f.root, r.path), 'utf8'));
      d = doc;
    }
    const r = d.data.run.resources.find(r => r.type === 'UR'), doc = reader.document(r.resource_id, d.snapshot_id);
    assert.deepEqual(Object.keys(doc.data.document.links), ['PRD.json']);
    fs.rmSync(join(f.root, '.agdf/control/runs'), { recursive: true }); fs.mkdirSync(join(f.root, '.agdf/control/runs'));
    // The overview follows the stored backlog, not Run discovery.
    assert.equal(reader.snapshot().data.kind, 'backlog');
    const backlog = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
    fs.writeFileSync(backlog, '# AGDF Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
    assert.equal(reader.snapshot().state, 'empty');
    fs.chmodSync(backlog, 0);
    try { const failed = reader.snapshot(); assert.equal(failed.code, 'resource_denied'); assert.equal(failed.state, 'error'); assert.equal(failed.data, null); }
    finally { fs.chmodSync(backlog, 0o600); }
    fs.rmSync(join(f.root, '.agdf/control'), { recursive: true }); assert.equal(reader.snapshot().code, 'control_absent');
  } finally { f.close(); }
});
