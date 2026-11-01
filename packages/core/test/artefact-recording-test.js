import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { clarifiedUr } from './planned-fixtures.js';
import { syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { readArtefactBindings } from '../lib/control-state/artefact-bindings.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';
import { runDocumentPath } from '../lib/control-state/run-identity.js';
import { treeBytes } from './control-cockpit-fixtures.js';
const accepted = result => { assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result; };
function fixture(t) {
  const run = currentRun(currentFixture(t));
  accepted(run.step('ur', clarifiedUr, { title: 'Synthetic reviewed sources' })); accepted(run.approve('UR'));
  accepted(run.step('route', '# Brownfield Review\n- ux_intent_definition_required: no\nExisting source owner reviewed.\n', { route: 'structured_delivery', reason: 'Synthetic scoped prerequisite' }));
  return run;
}
test('current binding contains the reviewed attestation and exact source; it derives the chain without request/proof JSON', t => {
  const run = fixture(t), request = run.f.request('artefact.record', { gate: 'PRD', material: run.f.material(run.binding(), 'PRD', syntheticPrd()),
    reviewer: 'Synthetic current reviewer', reviewed: true, update_draft: false }, run.binding());
  const result = accepted(run.f.execute(request)), binding = readArtefactBindings(run.content()).latest[0], value = resolutionRecord(binding);
  assert.equal(value.schema_version, '3'); assert.deepEqual(value.review, { reviewer: 'Synthetic current reviewer', reviewed: true });
  assert.equal(value.source.path, runDocumentPath(run.id, 'UR.md')); assert.equal(value.destination.path, runDocumentPath(run.id, 'PRD.md'));
  assert.equal(run.control().artefact_chain.find(row => row.from === 'PRD').to, 'UR');
  assert.equal(run.control().artefacts.get('PRD').status, 'draft'); assert.equal(run.control().approvals.get('PRD').status, 'missing');
  assert.equal(runSealState(run.f.root, run.content()).status, 'valid');
  assert(readdirSync(join(run.f.root, '.agdf/control/runs', run.id, 'documents')).every(name => name.endsWith('.md')));
  const before = treeBytes(run.f.root); assert.equal(run.f.execute(request).outcome, 'already_applied'); assert.deepEqual(treeBytes(run.f.root), before);
  assert.equal(result.authorizes, false);
});
for (const change of [payload => payload.reviewed = false, payload => payload.reviewer = '', payload => payload.reviewed_request = { path: 'RECORD.json', digest: 'sha256:' + 'a'.repeat(64) },
  payload => payload.material = { path: '../foreign.md', digest: 'sha256:' + 'a'.repeat(64) }]) test('unreviewed, old request/proof or foreign material is rejected without changing canonical bytes', t => {
  const run = fixture(t), payload = { gate: 'PRD', material: run.f.material(run.binding(), 'PRD', syntheticPrd()), reviewer: 'Synthetic reviewer', reviewed: true, update_draft: false };
  change(payload); const before = treeBytes(run.f.root), result = run.call('artefact.record', payload);
  assert.equal(result.outcome, 'rejected', JSON.stringify(result)); assert.deepEqual(treeBytes(run.f.root), before);
});
test('draft replacement requires explicit reviewed intent and retains exact superseded binding history', t => {
  const run = fixture(t); accepted(run.record('PRD', syntheticPrd()));
  const first = readArtefactBindings(run.content()).latest[0], before = treeBytes(run.f.root);
  assert.equal(run.record('PRD', syntheticPrd() + '\nReviewed narrower wording.\n').outcome, 'rejected'); assert.deepEqual(treeBytes(run.f.root), before);
  accepted(run.record('PRD', syntheticPrd() + '\nReviewed narrower wording.\n', true));
  const history = readArtefactBindings(run.content()); assert.equal(history.receipts.length, 2); assert.equal(history.latest[0].supersedes, first.binding_id);
  assert.equal(runSealState(run.f.root, run.content()).status, 'valid');
  accepted(run.approve('PRD')); const approved = treeBytes(run.f.root);
  assert.equal(run.record('PRD', syntheticPrd(), true).outcome, 'rejected'); assert.deepEqual(treeBytes(run.f.root), approved);
});
test('changed upstream bytes cannot be adopted by recording a new downstream binding', t => {
  const run = fixture(t), path = join(run.f.root, runDocumentPath(run.id, 'UR.md')), original = readFileSync(path, 'utf8');
  // Stage first, then replace a canonical source to observe the actual write guard.
  const payload = { gate: 'PRD', material: run.f.material(run.binding(), 'PRD', syntheticPrd()), reviewer: 'Synthetic reviewer', reviewed: true, update_draft: false };
  writeFileSync(path, original + '\nForeign source change.\n'); const before = treeBytes(run.f.root);
  assert.throws(() => run.call('artefact.record', payload), /material_binding_invalid/); assert.deepEqual(treeBytes(run.f.root), before);
});
