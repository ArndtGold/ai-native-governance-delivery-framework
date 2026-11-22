import { structuredCurrentRun } from './fixtures/current-structured-run.js';
import { structuredCloseout } from './fixtures/current-closeout.js';
import { closeoutConfirmation } from '../lib/control-evaluation/closeout-readiness.js';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { clarifiedUr } from './planned-fixtures.js';
import { syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { syntheticTp } from '../../cli/scripts/fixtures/tp-definition.js';
import { withSyntheticQaContent } from './fixtures/decision-content.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';
const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
test('current structured journey retains exact approved source mappings and derives each next gate', t => {
  const run = structuredCurrentRun(t);
  assert.equal(run.decision().current_gate, 'Brownfield Analysis');
  accepted(run.step('internal', '# Brownfield Analysis\n\nDecision: pass\n\nExisting store and isolated test owner confirmed.\n', { internal_step: 'Brownfield Analysis', decision: 'pass' }));
  assert.equal(run.decision().current_gate, 'CD+Tests');
  accepted(run.step('internal', '# CD+Tests\n\nDecision: pass\n\nSynthetic filter values compared in this disposable test.\n', { internal_step: 'CD+Tests', decision: 'pass' }));
  for (const type of ['TP Review', 'Clean Implementation Review', 'CR']) {
    accepted(run.step('internal', `# ${type}\n\nDecision: pass\n\nSynthetic fixture checks meet the declared local scope.\n`, { internal_step: type, decision: 'pass' }));
  }
  assert.equal(run.decision().current_gate, 'QA');
  accepted(run.record('QA', withSyntheticQaContent('# QA Report\n\nDecision: pass\n\n## Evidence\nSynthetic local fixture checks passed.\n')));
  assert.equal(runSealState(run.f.root, run.content()).status, 'valid');
  accepted(run.approve('QA'));
  assert.equal(run.decision().current_gate, 'UAT');
  const reader = createCockpitReader(run.f.root);
  assert.equal(reader.snapshot(run.id).data.run.companion.uat_presentation, undefined);
  const presentationId = accepted(run.present('UAT')).family_result.presentation_id;
  const snapshot = reader.snapshot(run.id);
  const source = snapshot.data.run.companion.uat_presentation;
  const document = reader.document(source.resource_id, snapshot.snapshot_id, run.id).data.document;
  const file = join(run.f.root, '.agdf/control/runs', run.id, 'control/presentations', presentationId + '.document');
  const original = readFileSync(file, 'utf8');
  assert.equal(document.format, 'markdown');
  assert.equal(document.content, original);
  assert.equal(document.content_digest, source.content_digest);
  writeFileSync(file, original + 'Changed');
  assert.equal(reader.snapshot(run.id).data.run.companion.uat_presentation, undefined);
  writeFileSync(file, original);
  accepted(run.call('approval.record', { gate: 'UAT', presentation_id: presentationId, response: 'Approval: UAT' }));
  assert.equal(reader.snapshot(run.id).data.run.companion.uat_presentation, undefined);
  assert.equal(run.decision().current_gate, 'OR');
  assert.equal(reader.snapshot(run.id).data.run.companion.closeout_report, undefined);
  const control = run.control();
  for (const gate of ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT']) assert.equal(control.approvals.get(gate).status, 'approved');
  assert.doesNotMatch(run.content(), /^## (Approvals|Artefacts|Artefact Chain|Current Control State|Evidence)$/mu);
  const directory = join(run.f.root, '.agdf/control/runs', run.id);
  assert.deepEqual(readdirSync(directory).sort(), ['RUN_STATE.md', 'control', 'documents']);
  assert(readdirSync(join(directory, 'documents')).includes('QA_REPORT.md'));
  for (const name of readdirSync(join(directory, 'control/presentations'))) {
    if (!name.endsWith('.json')) continue;
    assert.equal(resolutionRecord(JSON.parse(readFileSync(join(directory, 'control/presentations', name), 'utf8')).record)?.schema_version, 7);
  }
  const operation_id = randomUUID(), binding = run.binding();
  const or = run.f.material(binding, 'OR', structuredCloseout(run));
  const completed = run.f.call('closeout.record', { or,
    confirmation: closeoutConfirmation(run.id, binding.expected_revision_id, operation_id, or.digest) }, { ...binding, operation_id });
  accepted(completed);
  const reportSnapshot = reader.snapshot(run.id);
  const reportSource = reportSnapshot.data.run.companion.closeout_report;
  const reportDocument = reader.document(reportSource.resource_id, reportSnapshot.snapshot_id, run.id).data.document;
  assert.equal(reportDocument.resource.path, `.agdf/control/runs/${run.id}/documents/OR.md`);
  assert.equal(reportDocument.content_digest, reportSource.content_digest);
  assert.equal(reportDocument.content, readFileSync(join(directory, 'documents', 'OR.md'), 'utf8'));
  assert.equal(run.state().meta.lifecycle, 'completed');
  assert.equal(runSealState(run.f.root, run.content()).status, 'valid');
  assert.equal(run.f.execute({ ...run.f.request('closeout.record', { or,
    confirmation: closeoutConfirmation(run.id, binding.expected_revision_id, operation_id, or.digest) }, { ...binding, operation_id }) }).outcome, 'already_applied');

});
