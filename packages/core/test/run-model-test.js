import { clarifiedUr } from './planned-fixtures.js';
import { planningId, inspectPlannedEntry } from '../lib/control-state/planned-entry.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cliGitObservation } from '../../cli/lib/control-evaluation/git-observation.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { createRunMaterialStore } from '../lib/control-state/run-material.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { runRelativePath, runDocumentPath, runControlPath, runHistoryPath, CURRENT_LAYOUT } from '../lib/control-state/run-identity.js';
import { parseRunState, parseControlState } from '../lib/control-state/run-state-parser.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';

function fixture(t, options = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-run-model-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root]);
  const target = resolveControlCommandTarget(root), store = createRunMaterialStore();
  t.after(() => store.close());
  const base = { schema_version: '1', working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: target.target_id, presentation_language: 'en', assurance: 'cooperative_local' };
  const execute = (group, input) => createRunCommandService({ packageVersion: '0.20.2', gitObservation: cliGitObservation,
    ...options, materialGrants: input.command.kind === 'material.stage' ? undefined : store.grants(input) })(group, input);
  const request = (kind, payload, binding = {}) => ({ ...base, operation_id: randomUUID(), ...binding, command: { kind, payload } });
  const initialized = execute('agdf_project', request('project.initialize', { language: 'en' }));
  assert.equal(initialized.outcome, 'accepted', JSON.stringify(initialized));
  return { root, store, request, execute };
}
function create(f) {
  const input = f.request('run.create', { title: 'Current Run model test' }), result = f.execute('agdf_run', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  const id = result.family_result.run_id, path = join(f.root, runRelativePath(id, '', 'RUN_STATE.md'));
  return { input, result, id, path, binding: { run_id: id, expected_revision_id: result.receipt.effect.resulting_revision_id } };
}
function material(f, binding, slot, content) {
  const bytes = Buffer.from(content), stage = payload => f.store.stage(f.request(binding.planning ? 'planned_material.stage' : 'material.stage', payload, binding));
  const started = stage({ action: 'begin', files: [{ slot, bytes: bytes.length }] });
  assert.equal(started.outcome, 'accepted', JSON.stringify(started));
  const transfer_id = started.family_result.transfer_id;
  assert.equal(stage({ action: 'append', transfer_id, file: 0, offset: 0, data: bytes.toString('base64') }).outcome, 'accepted');
  const sealed = stage({ action: 'seal', transfer_id }); assert.equal(sealed.outcome, 'accepted', JSON.stringify(sealed));
  return sealed.family_result.files[0].reference;
}

test('fresh current store: creation, exact replay and no parallel current tables', t => {
  const f = fixture(t), run = create(f), before = readFileSync(run.path, 'utf8');
  assert.equal(JSON.parse(readFileSync(join(f.root, '.agdf/control/config.json'), 'utf8')).control_layout, CURRENT_LAYOUT);
  assert.equal(parseRunState(before).meta.control_state_version, '4');
  assert.equal(runSealState(f.root, before).status, 'valid');
  assert.equal(resolutionRecord(run.result.receipt).schema_version, '4');
  assert.doesNotMatch(before, /^## (?:Approvals|Artefacts|Evidence|Artefact Chain|Current Control State)$/mu);
  assert.doesNotMatch(before, /^- (?:current_gate|next_allowed_action):/mu);
  assert.equal(f.execute('agdf_run', run.input).outcome, 'already_applied');
  assert.equal(readFileSync(run.path, 'utf8'), before);
  assert(!readdirSync(join(f.root, '.agdf/control')).includes('MASTER_BACKLOG.md'));
  assert(!readdirSync(join(f.root, '.agdf/control')).includes('artefacts'));
});

test('UR recording publishes the canonical document, binding and current journal atomically', t => {
  const f = fixture(t), run = create(f), content = '# UR: Current model\n\n## Goal\nKeep every Run-owned document together.\n';
  const source = material(f, run.binding, 'UR', content);
  const input = f.request('step.record', { step: 'ur', title: 'Current model', source }, run.binding);
  const result = f.execute('agdf_record', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.available, true, JSON.stringify(result.current));
  assert.equal(readFileSync(join(f.root, runDocumentPath(run.id, 'UR.md')), 'utf8'), content);
  const stored = readFileSync(run.path, 'utf8'), parsed = parseControlState(stored, { userGates: ['UR'] });
  assert.equal(parsed.artefacts.get('UR').path, runDocumentPath(run.id, 'UR.md'));
  assert.equal(parsed.artefacts.get('UR').status, 'draft');
  assert.equal(parsed.approvals.get('UR').status, 'missing');
  assert.equal(runSealState(f.root, stored).status, 'valid');
  assert.deepEqual(Object.keys(resolutionRecord(result.receipt).effect.record).sort(), ['covers', 'evidence_binding_id', 'status']);
  assert(!readdirSync(join(f.root, runControlPath(run.id, ''))).includes('RUN_STEP_PENDING.json'));
  assert.equal(f.execute('agdf_record', input).outcome, 'already_applied');
  assert.equal(readFileSync(run.path, 'utf8'), stored);
});

test('unsupported old layouts and Run versions are refused without mutation', t => {
  const f = fixture(t), run = create(f), current = readFileSync(run.path, 'utf8');
  for (const version of ['2', '3']) {
    const old = current.replace('control_state_version: 4', `control_state_version: ${version}`);
    writeFileSync(run.path, old);
    assert(parseRunState(old).findings.some(row => row.code === 'AGDF_RUN_VERSION_UNSUPPORTED'));
    assert.notEqual(f.execute('agdf_run', run.input).outcome, 'accepted');
    assert.equal(readFileSync(run.path, 'utf8'), old);
  }
  writeFileSync(run.path, current);
  const path = join(f.root, '.agdf/control/config.json'), config = JSON.parse(readFileSync(path, 'utf8'));
  for (const layout of ['master-backlog-v1', 'planned-urs-v1', undefined]) {
    const old = JSON.stringify({ ...config, control_layout: layout }); writeFileSync(path, old);
    const result = f.execute('agdf_run', f.request('run.create', { title: 'Must be refused' }));
    assert.equal(result.outcome, 'rejected', JSON.stringify(result));
    assert.equal(result.reason, 'control_layout_unsupported');
    assert.equal(readFileSync(path, 'utf8'), old);
    assert.equal(readFileSync(run.path, 'utf8'), current);
  }
});

test('pure Run paths reject traversal and unsupported roles', () => {
  for (const id of ['../foreign', '/absolute', 'a/b', '', 'x\\y']) assert.throws(() => runDocumentPath(id, 'UR.md'));
  for (const path of ['../UR.md', '/UR.md', 'a/../UR.md', 'a//UR.md', 'x\\UR.md', 'C:UR.md']) assert.throws(() => runDocumentPath('run-safe', path));
  assert.throws(() => runRelativePath('run-safe', 'artefacts', 'UR.md'));
});

function planned(f) {
  const operation_id = randomUUID(), id = planningId(operation_id), binding = { planning: { plan_id: id, expected_digest: null } };
  const source = material(f, binding, 'UR', clarifiedUr);
  const input = { ...f.request('planned_ur.create', { source }, binding), operation_id };
  const created = f.execute('agdf_record', input);
  assert.equal(created.outcome, 'accepted', JSON.stringify(created));
  const entry = inspectPlannedEntry(f.root, id);
  assert.equal(entry.readiness.ready, true, JSON.stringify(entry.readiness));
  const handoff = f.request('run.create_from_planned', { title: entry.title }, { planning: { plan_id: id, expected_digest: entry.digest } });
  return { id, entry, handoff };
}
test('planned handoff publishes UR and immutable origin together; replay creates no sibling', t => {
  const f = fixture(t), p = planned(f), result = f.execute('agdf_run', p.handoff);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  const runId = result.family_result.run_id, state = join(f.root, runRelativePath(runId, '', 'RUN_STATE.md'));
  const before = readFileSync(state, 'utf8'), receipt = resolutionRecord(result.receipt);
  assert.deepEqual(Object.keys(receipt.effect.record).sort(), ['planned', 'snapshot', 'title']);
  assert.equal(receipt.effect.record.snapshot.path, runHistoryPath(runId, 'planning/UR.md'));
  assert.equal(readFileSync(join(f.root, runDocumentPath(runId, 'UR.md')), 'utf8'), p.entry.content);
  assert.equal(readFileSync(join(f.root, runHistoryPath(runId, 'planning/UR.md')), 'utf8'), p.entry.content);
  assert.equal(runSealState(f.root, before).status, 'valid');
  assert.deepEqual(readdirSync(join(f.root, runDocumentPath(runId, ''))), ['UR.md']);
  assert.equal(f.execute('agdf_run', p.handoff).outcome, 'already_applied');
  assert.equal(readFileSync(state, 'utf8'), before);
  assert.deepEqual(readdirSync(join(f.root, '.agdf/control/runs')).filter(name => !name.startsWith('.')), [runId]);
});
for (const phase of ['handoff_output_UR.md', 'handoff_output_snapshot', 'handoff_before_run_publish', 'handoff_run_committed']) {
  test(`handoff interruption at ${phase} preserves its original identity and exact snapshot`, t => {
    let interrupted = false;
    const f = fixture(t, { checkpoint(point) { if (!interrupted && point === phase) { interrupted = true; throw Error('synthetic_interruption'); } } });
    const p = planned(f), first = f.execute('agdf_run', p.handoff);
    assert.notEqual(first.outcome, 'accepted'); assert.equal(interrupted, true);
    const retried = f.execute('agdf_run', p.handoff);
    assert(['accepted', 'already_applied'].includes(retried.outcome), JSON.stringify(retried));
    const runId = retried.family_result.run_id;
    assert.equal(readFileSync(join(f.root, runHistoryPath(runId, 'planning/UR.md')), 'utf8'), p.entry.content);
    assert.equal(runSealState(f.root, readFileSync(join(f.root, runRelativePath(runId, '', 'RUN_STATE.md')), 'utf8')).status, 'valid');
  });
}

test('current UR presentation freezes the document and approval is projected from its receipt', t => {
  const f = fixture(t), run = create(f), source = material(f, run.binding, 'UR', clarifiedUr);
  const written = f.execute('agdf_record', f.request('step.record', { step: 'ur', title: 'Independent work', source }, run.binding));
  assert.equal(written.outcome, 'accepted', JSON.stringify(written));
  const binding = { run_id: run.id, expected_revision_id: written.receipt.effect.resulting_revision_id };
  const prepared = f.execute('agdf_prepare', f.request('presentation.prepare', { gate: 'UR' }, binding));
  assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const presentationId = prepared.family_result.presentation_id;
  const envelope = JSON.parse(readFileSync(join(f.root, runControlPath(run.id, `presentations/${presentationId}.json`)), 'utf8'));
  assert.equal(resolutionRecord(envelope.record).schema_version, 7);
  const approved = f.execute('agdf_approve', f.request('approval.record', { gate: 'UR', presentation_id: presentationId, response: 'Approval: UR' }, binding));
  assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
  const stored = readFileSync(run.path, 'utf8'), control = parseControlState(stored, { userGates: ['UR'] });
  assert.equal(control.approvals.get('UR').status, 'approved');
  assert.equal(control.artefacts.get('UR').status, 'approved');
  assert.equal(resolutionRecord(approved.receipt).schema_version, '4');
  assert.equal(runSealState(f.root, stored).status, 'valid');
  assert.doesNotMatch(stored, /^## Approvals$/mu);
});
