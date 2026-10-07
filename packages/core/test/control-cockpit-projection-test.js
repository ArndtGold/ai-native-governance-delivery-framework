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
    const reader = createCockpitReader(f.root), s = reader.snapshot(), detail = reader.run('fixture-a', s.snapshot_id).data;
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
    const run = snapshot.data.runs.find(r => r.run_id === 'fixture-a');
    assert.equal(run.title, 'Fixture document'); // Presentation omits the document-kind prefix.
    assert.equal(reader.run('fixture-a', snapshot.snapshot_id).data.title, run.title);
    assert.deepEqual(treeBytes(f.root), before);
    fs.rmSync(join(f.root, f.documentPath));
    const next = reader.snapshot();
    assert.notEqual(next.data.runs.find(r => r.run_id === 'fixture-a').title, 'Implementation Checkpoint');
  } finally { f.close(); }
});
test('SCN-001/002/008/020: active/completed/invalid inventory, registered resources and full byte invariance', () => {
  const f = fixture(); try {
    fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), snapshot = reader.snapshot();
    assert.equal(snapshot.state, 'partial'); assert.equal(snapshot.data.runs.length, 3); assert.equal(snapshot.data.runs.find(r => r.run_id === 'fixture-completed').lifecycle, 'completed'); assert.equal(snapshot.data.runs.find(r => r.run_id === 'broken').valid, false);
    const detail = reader.run('fixture-a', snapshot.snapshot_id); assert.equal(detail.state, 'available'); const resource = detail.data.resources.find(r => r.type === 'UR');
    assert.deepEqual(snapshot.data.runs.find(r => r.run_id === 'fixture-a').attention, {
      blocking_reason: detail.data.evaluation.blocking_reason, missing_approval: detail.data.evaluation.missing_approval,
      missing_evidence_count: detail.data.evaluation.missing_evidence.length,
    });
    assert.equal(snapshot.data.runs.find(r => r.run_id === 'broken').attention, undefined);
    assert.match(reader.document(resource.resource_id, snapshot.snapshot_id).data.content, /日本語/); assert.throws(() => reader.document('unknown', snapshot.snapshot_id), /resource_denied/);
    reader.freshness(snapshot.snapshot_id); assert.deepEqual(treeBytes(f.root), before);
    assert.equal(reader.run('broken', snapshot.snapshot_id).code, 'invalid_run');
    const newer = reader.snapshot(); assert.throws(() => reader.run('fixture-a', snapshot.snapshot_id), /source_changed/); assert.notEqual(newer.snapshot_id, snapshot.snapshot_id);
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
      f.register('UR', path); const s = reader.snapshot(), d = reader.run('fixture-a', s.snapshot_id), resource = d.data.resources.find(r => r.type === 'UR');
      const result = reader.document(resource.resource_id, s.snapshot_id); assert.equal(result.state, state, name); assert.equal(result.code, code, name);
    }
  } finally { f.close(); }
});
test('SCN-006/015: document mutation invalidates existing related reads and new snapshot selectors', () => {
  const f = fixture(); try { const reader = createCockpitReader(f.root), s = reader.snapshot(); fs.writeFileSync(join(f.root, f.documentPath), 'changed'); assert.throws(() => reader.run('fixture-a', s.snapshot_id), /source_changed/); assert.throws(() => reader.freshness(s.snapshot_id), /source_changed/); assert.equal(reader.snapshot().state, 'available'); } finally { f.close(); }
});
test('SCN-002/008: absent and genuinely empty stores differ, JSON/text retain exact source and registered links resolve only within manifest', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root);
    const json = '.agdf/control/artefacts/fixture-a/PRD.json', txt = '.agdf/control/artefacts/fixture-a/SD.txt';
    fs.writeFileSync(join(f.root, json), '{"source":"日本語"}\n'); fs.writeFileSync(join(f.root, txt), 'Original text\n');
    fs.writeFileSync(join(f.root, f.documentPath), '# Links\n[JSON](PRD.json) [unknown](secret.txt) [outside](../../../../secret.txt)');
    f.register('PRD', json); f.register('SD', txt);
    const s = reader.snapshot(), d = reader.run('fixture-a', s.snapshot_id);
    for (const type of ['PRD', 'SD']) { const r = d.data.resources.find(r => r.type === type); assert.equal(reader.document(r.resource_id, s.snapshot_id).data.content, fs.readFileSync(join(f.root, r.path), 'utf8')); }
    const r = d.data.resources.find(r => r.type === 'UR'), doc = reader.document(r.resource_id, s.snapshot_id);
    assert.deepEqual(Object.keys(doc.data.links), ['PRD.json']);
    fs.rmSync(join(f.root, '.agdf/control/runs'), { recursive: true }); fs.mkdirSync(join(f.root, '.agdf/control/runs')); assert.equal(reader.snapshot().state, 'empty');
    const locked = join(f.root, '.agdf/control/unreadable'); fs.mkdirSync(locked); fs.chmodSync(locked, 0);
    try { const failed = reader.snapshot(); assert.equal(failed.code, 'read_failed'); assert.equal(failed.state, 'error'); assert.equal(failed.data, null); }
    finally { fs.chmodSync(locked, 0o700); }
    fs.rmSync(join(f.root, '.agdf/control'), { recursive: true }); assert.equal(reader.snapshot().code, 'control_absent');
  } finally { f.close(); }
});
