import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { withRunLock, writeRunLocked } from '../lib/control-state/run-state-writer.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { evaluateDoctor } from '../lib/control-evaluation/doctor.js';
import { treeBytes } from './control-cockpit-fixtures.js';
import { clarifiedUr } from './planned-fixtures.js';
const accepted = result => { assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
for (const lifecycle of ['superseded', 'abandoned']) test(`current ${lifecycle} Run refuses every new delivery operation and preserves historical replay`, t => {
  const f = currentFixture(t), run = currentRun(f), successor = currentRun(f);
  const original = f.request('step.record', { step: 'ur', title: 'Original synthetic intent', source: f.material(run.binding(), 'UR', clarifiedUr) }, run.binding());
  accepted(f.execute(original));
  const preview = accepted(f.call('closure.preview', { entries: [{ run_id: run.id, outcome: lifecycle, reason: 'Synthetic deliberate ending',
    ...(lifecycle === 'superseded' ? { successor_run: successor.id } : {}) }] })).family_result;
  accepted(f.call('closure.apply', { preview_id: preview.preview_id, confirmation: preview.confirmation_phrase }));
  const source = { path: `.agdf/control/runs/${run.id}/documents/UR.md`, digest: 'sha256:' + 'a'.repeat(64) }, service = createRunCommandService();
  for (const [group, kind, payload] of [
    ['agdf_record', 'step.record', { step: 'evidence', source, reason: 'New work', covers: 'scope' }],
    ['agdf_record', 'artefact.record', { gate: 'PRD', material: source, reviewer: 'Synthetic reviewer', reviewed: true, update_draft: false }],
    ['agdf_record', 'presentation_decision.record', { gate: 'UR', presentation_id: randomUUID(), action: 'reject', comment: '' }],
    ['agdf_prepare', 'presentation.prepare', { gate: 'UR' }],
    ['agdf_approve', 'approval.record', { gate: 'UR', presentation_id: randomUUID(), response: 'Approval: UR' }],
    ['agdf_revise', 'ur_draft.replace', { source, title: 'Changed need' }],
    ['agdf_revise', 'prd_revision.reopen', { prd: source, confirmation: 'x' }],
    ['agdf_revise', 'source_revision.preview', { source_gate: 'UR', proposal: source }],
    ['agdf_closeout', 'closeout.record', { or: source, confirmation: 'x' }],
  ]) {
    const before = treeBytes(f.root), result = service(group, f.request(kind, payload, run.binding()));
    assert.equal(result.reason, 'lifecycle_ended', JSON.stringify({ kind, result })); assert.deepEqual(treeBytes(f.root), before);
  }
  const before = treeBytes(f.root);
  assert.throws(() => withRunLock(run.path, () => writeRunLocked(run.path, run.content().replace(/^- owner:.*$/mu, '- owner: Changed'), run.binding().expected_revision_id)), /LIFECYCLE_ENDED/);
  assert.deepEqual(treeBytes(f.root), before);
  assert.equal(f.execute(original).outcome, 'already_applied'); assert.deepEqual(treeBytes(f.root), before);
  const report = evaluateGateCheck(f.root, { runId: run.id }); assert.equal(report.status, 'closed'); assert.equal(report.next_operation, null);
  assert.equal(report.completion.status, lifecycle); assert.deepEqual(report.allowed, []);
  assert(evaluateDoctor(f.root, { allActive: true }).runs.every(row => row.run_id !== run.id));
});
