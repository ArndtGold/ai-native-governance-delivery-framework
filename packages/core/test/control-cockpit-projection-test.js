import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createCockpitReader, projectCockpitAssessment } from '../lib/control-inspect/cockpit.js';
import { READ_LIMITS } from '../lib/control-read/snapshot.js';
import { runEvidencePath } from '../lib/control-state/run-identity.js';
import { canonicalEvidenceDigest } from '../lib/control-state/evidence-bindings.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { upsertTableRow } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { readRunView } from '../lib/companion/run-view.js';
test('a current writer-bound evidence report opens through the scoped document selector', () => {
  const f = fixture();
  try {
    const runId = 'fixture-a';
    const content = '# Session recovery evidence\n\nThe selected run opened again.\n';
    const binding = f.binding();
    const source = f.context.material(binding, 'EVIDENCE', content);
    assert.equal(f.context.call('step.record', {
      step: 'evidence', source, reason: 'Session recovery observed', covers: 'Native Cockpit read',
    }, binding).outcome, 'accepted');
    const path = runEvidencePath(runId, `EVIDENCE-${source.digest.slice(7)}.md`);
    const before = treeBytes(f.root);
    const reader = createCockpitReader(f.root);
    const snapshot = reader.snapshot(runId);
    const { resources, evidence_applicability } = snapshot.data.run;
    assert.ok(evidence_applicability.current.some(row => row.path === path && row.available === true));
    const reportResources = resources.filter(row => row.registered_reference === path);
    assert.equal(reportResources.length, 1, 'The registered report has one resource in the selected Run');
    const report = reportResources[0];
    assert.equal(report.status, 'registered');
    assert.throws(() => reader.document(report.resource_id, snapshot.snapshot_id, 'fixture-completed'), /resource_denied/);
    const document = reader.document(report.resource_id, snapshot.snapshot_id, runId);
    assert.equal(document.state, 'available');
    assert.equal(document.data.document.content, content);
    assert.equal(document.data.document.resource.registered_reference, path);
    assert.throws(() => reader.document(report.resource_id, snapshot.snapshot_id, runId), /resource_denied/);
    assert.deepEqual(treeBytes(f.root), before);

    fs.writeFileSync(join(f.root, path), 'Changed report bytes');
    assert.equal(reader.snapshot(runId).data.run.resources.some(row => row.registered_reference === path), false);
    fs.unlinkSync(join(f.root, path));
    assert.equal(reader.snapshot(runId).data.run.resources.some(row => row.registered_reference === path), false);
  } finally { f.close(); }
});
test('evidence registration preserves existing artefact identity and withholds unsupported files', () => {
  const f = fixture();
  try {
    const runId = 'fixture-a';
    const recordEvidence = (path, content) => {
      assert.equal(f.context.call('step.record', {
        step: 'evidence', source: { path, digest: canonicalEvidenceDigest(content) },
        reason: 'Fixture report', covers: 'Native Cockpit read',
      }, f.binding()).outcome, 'accepted');
    };
    recordEvidence(f.documentPath, fs.readFileSync(join(f.root, f.documentPath), 'utf8'));
    const reader = createCockpitReader(f.root);
    const resources = reader.snapshot(runId).data.run.resources.filter(row => row.registered_reference === f.documentPath);
    assert.equal(resources.length, 1);
    assert.equal(resources[0].type, 'UR');

    const path = runEvidencePath(runId, 'report.html');
    const content = '<h1>Unsupported report</h1>';
    fs.mkdirSync(join(f.root, runEvidencePath(runId, '')), { recursive: true });
    fs.writeFileSync(join(f.root, path), content);
    recordEvidence(path, content);
    const snapshot = reader.snapshot(runId);
    assert.ok(snapshot.data.run.evidence_applicability.current.some(row => row.path === path && row.available === true));
    assert.equal(snapshot.data.run.resources.some(row => row.registered_reference === path), false);
  } finally { f.close(); }
});
test('Run overview works without a legacy backlog with bounded current source dependencies', () => {
  const f = fixture();
  try {
    fs.rmSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), { force: true });
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), result = reader.snapshot();
    assert.equal(result.schema_version, '2');
    assert.equal(result.data.kind, 'work');
    assert.ok(result.data.entries.some(run => run.key === 'fixture-a'));
    assert.ok(result.data.entries.some(run => run.key === 'fixture-completed'));
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('invalid directory identities stay accounted diagnostics with no Run selector', () => {
  const f = fixture();
  try {
    fs.mkdirSync(join(f.root, '.agdf/control/runs/BAD NAME'));
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), result = reader.snapshot();
    assert.equal(result.state, 'partial');
    assert.equal(result.data.entries.find(run => run.key === 'BAD NAME').selectable, false);
    assert.equal(result.data.entries.find(run => run.key === 'fixture-a').selectable, true);
    assert.equal(Object.values(result.data.counts).reduce((sum,n)=>sum+n,0), result.data.entries.length);
    assert.throws(() => reader.run('BAD NAME', result.snapshot_id), /resource_denied/);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('cockpit assessment projects the evaluated outcome without a second doctor-warning veto', () => {
  const report = { status: 'open', blocking_reason: 'none', missing_approval: 'none', doctor_status: 'warn' };
  assert.deepEqual(projectCockpitAssessment(report, 'active'), { state: 'open', authorizes: false });
  assert.equal(projectCockpitAssessment({ ...report, status: 'blocked' }, 'active').state, 'blocked');
  assert.equal(projectCockpitAssessment({ ...report, missing_approval: 'Approval: QA' }, 'active').state, 'blocked');
  assert.equal(projectCockpitAssessment({ ...report, status: 'unknown' }, 'active').state, 'unconfirmed');
  assert.equal(projectCockpitAssessment(report, 'abandoned').state, 'ended');
  assert.deepEqual(projectCockpitAssessment(report, 'completed'), { state: 'unconfirmed', authorizes: false });
  assert.equal(projectCockpitAssessment({ ...report, completion: { fulfilled: true } }, 'completed').state, 'completed');
});
test('captured assessment matches canonical gate evaluation and performs no writes', () => {
  const f = fixture(); try {
    const before = treeBytes(f.root), report = evaluateGateCheck(f.root, { runId:'fixture-a', ignoreRunIdEnv:true });
    const reader = createCockpitReader(f.root), s = reader.snapshot(), detail = reader.run('fixture-a', s.snapshot_id).data.run;
    assert.deepEqual(detail.evaluation.control_assessment, projectCockpitAssessment(report, detail.lifecycle));
    assert.equal(detail.evaluation.status, report.status);
    assert.deepEqual(detail.figure, { mood: 'wartet', reason: { key: 'waitingApproval', gate: 'UR' } });
    assert.deepEqual(detail.figure, readRunView(f.root, { runIds: ['fixture-a'] }).runs.find(run => run.run_id === 'fixture-a').figure);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('cockpit title identifies the bound UR instead of a generic current artefact heading', () => {
  const f = fixture(); try {
    const path = '.agdf/control/runs/fixture-a/documents/CURRENT.md';
    fs.writeFileSync(join(f.root,path),'# Implementation Checkpoint\n');f.register('Brownfield Review',path);
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), snapshot = reader.snapshot();
    const run = reader.run('fixture-a', snapshot.snapshot_id).data.run;
    assert.equal(run.title, 'Fixture document'); // Presentation omits the document-kind prefix.
    assert.deepEqual(treeBytes(f.root), before);
    fs.rmSync(join(f.root, f.documentPath));
    const next = reader.snapshot('fixture-a');
    assert.notEqual(next.data.run.title, 'Implementation Checkpoint');
  } finally { f.close(); }
});
test('SCN-001/002/008/020: Run inventory stays passive; selected valid, completed and invalid Runs retain Core semantics and no writes', () => {
  const f = fixture(); try {
    fs.mkdirSync(join(f.root, '.agdf/control/runs/broken')); fs.writeFileSync(join(f.root, '.agdf/control/runs/broken/RUN_STATE.md'), 'invalid');
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), snapshot = reader.snapshot();
    assert.equal(snapshot.data.kind, 'work'); assert.equal(snapshot.data.entries.some(row => row.key === 'broken' && !row.selectable), true);
    const detail = reader.run('fixture-a', snapshot.snapshot_id); assert.equal(detail.state, 'available');
    assert.equal(detail.data.run.lifecycle, 'active');
    const resource = detail.data.run.resources.find(r => r.type === 'UR');
    const document = reader.document(resource.resource_id, detail.snapshot_id);
    assert.match(document.data.document.content, /日本語/);
    assert.throws(() => reader.document('unknown', document.snapshot_id), /resource_denied/);
    reader.freshness(document.snapshot_id); assert.deepEqual(treeBytes(f.root), before);
    const completed = reader.run('fixture-completed', document.snapshot_id);
    assert.equal(completed.data.run.lifecycle, 'completed'); assert.equal(completed.data.run.evaluation.control_assessment.state, 'unconfirmed', 'A synthetic lifecycle scalar alone supplies no completion evidence');
    assert.equal(completed.data.run.figure, undefined);
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
      const path = '.agdf/control/runs/fixture-a/documents/' + name; if (bytes) fs.writeFileSync(join(f.root, path), bytes);
      f.register('UR', path); const s = reader.snapshot(), d = reader.run('fixture-a', s.snapshot_id), resource = d.data.run.resources.find(r => r.type === 'UR');
      const result = reader.document(resource.resource_id, d.snapshot_id); assert.equal(result.state, state, name); assert.equal(result.code, code, name);
    }
  } finally { f.close(); }
});
test('SCN-006/015: mutation of selected dependencies invalidates related reads, and current work captures its Run sources', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root), overview = reader.snapshot();
    fs.writeFileSync(join(f.root, f.documentPath), 'changed');
    assert.throws(()=>reader.freshness(overview.snapshot_id),/source_changed/);
    const selected = reader.snapshot('fixture-a');
    fs.writeFileSync(join(f.root, f.documentPath), 'changed again');
    assert.throws(() => reader.run('fixture-a', selected.snapshot_id), /source_changed/);
    assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
    assert.equal(reader.snapshot('fixture-a').state, 'available');
  } finally { f.close(); }
});
test('SCN-002/008: absent and genuinely empty stores differ, JSON/text retain exact source and registered links resolve only within manifest', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root);
    const json = '.agdf/control/runs/fixture-a/documents/PRD.json', txt = '.agdf/control/runs/fixture-a/documents/SD.txt';
    fs.writeFileSync(join(f.root, json), '{"source":"日本語"}\n'); fs.writeFileSync(join(f.root, txt), 'Original text\n');
    fs.writeFileSync(join(f.root, f.documentPath), '# Links\n[JSON](PRD.json) [unknown](secret.txt) [outside](../../../../secret.txt)');
    f.register('Brownfield Analysis',json);f.register('CD+Tests',txt);
    let d = reader.snapshot('fixture-a');
    for (const type of ['Brownfield Analysis','CD+Tests']) {
      const r = d.data.run.resources.find(r => r.type === type);
      const doc = reader.document(r.resource_id, d.snapshot_id);
      assert.equal(doc.data.document.content, fs.readFileSync(join(f.root, r.path), 'utf8'));
      d = doc;
    }
    const r = d.data.run.resources.find(r => r.type === 'UR'), doc = reader.document(r.resource_id, d.snapshot_id);
    assert.deepEqual(Object.keys(doc.data.document.links), ['PRD.json']);
    fs.rmSync(join(f.root, '.agdf/control/runs'), { recursive: true }); fs.mkdirSync(join(f.root, '.agdf/control/runs'));
    // Empty canonical store remains distinct from optional legacy information.
    assert.equal(reader.snapshot().data.kind, 'work');
    const backlog = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
    fs.writeFileSync(backlog, '# AGDF Master Backlog\n\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
    assert.equal(reader.snapshot().state, 'empty');
    fs.chmodSync(backlog,0);try{assert.equal(reader.snapshot().state,'empty','Foreign old planning is never read or promoted into the current inventory');}finally{fs.chmodSync(backlog,0o600);}
    fs.rmSync(join(f.root, '.agdf/control'), { recursive: true }); assert.equal(reader.snapshot().code, 'control_absent');
  } finally { f.close(); }
});

test('Run membership captures creation/removal and invalid entries independently of legacy pointers', () => {
  const f = fixture();
  try {
    fs.rmSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'),{force:true});
    const reader = createCockpitReader(f.root), first = reader.snapshot();
    const added = createRun(f.root, 'new.run');
    assert.throws(() => reader.freshness(first.snapshot_id), /source_changed/);
    let before = treeBytes(f.root), fresh = reader.snapshot();
    assert.ok(fresh.data.entries.some(run => run.key === 'new.run'));
    assert.notEqual(first.snapshot_id, fresh.snapshot_id);
    assert.deepEqual(treeBytes(f.root), before);
    fs.writeFileSync(added, '# Broken Run state\n');
    fresh = reader.snapshot();
    const invalid = fresh.data.entries.find(run => run.key === 'new.run');
    assert.equal(invalid.selectable, false);
    assert.equal(fresh.state, 'partial');
    assert.ok(fresh.data.entries.some(run => run.key === 'fixture-completed'));
    before = treeBytes(f.root);
    const selected = reader.run('new.run', fresh.snapshot_id);
    assert.equal(selected.code, 'invalid_run');
    assert.equal(selected.data.run.run_id, 'new.run');
    assert.equal(selected.data.run.resources.length, 0);
    assert.ok(selected.data.run.diagnostics.length);
    assert.deepEqual(treeBytes(f.root), before);
    fs.rmSync(join(f.root, '.agdf/control/runs/new.run'), { recursive: true });
    fresh = reader.snapshot();
    assert.equal(fresh.data.entries.some(run => run.key === 'new.run'), false);
    assert.equal(fresh.state, 'available');
    assert.equal(fs.existsSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md')), false);
  } finally { f.close(); }
});
