import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createExpandedSourceRevisionFixture } from '../../cli/scripts/fixtures/expanded-source-revision.js';
import { syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { inspectAuthoringInputs } from '../lib/control-inspect/authoring-inputs.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { digest } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-reassessment-')), seeds = mkdtempSync(join(tmpdir(), 'agdf-reassessment-seeds-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const { f, service, state, envelope, restore, prepare } = createExpandedSourceRevisionFixture(root, cli, seeds);
  restore('UAT');
  const { input, preview } = prepare('PRD');
  const applied = service('agdf_revise', { ...input, command: { kind: 'source_revision.apply', payload: {
    ...input.command.payload, preview_digest: preview.family_result.preview_digest, confirmation: preview.family_result.confirmation_selector } } });
  assert.equal(applied.outcome, 'accepted', JSON.stringify(applied));
  const reviewPath = f.prefix + 'REASSESSMENT_BFR.md';
  writeFileSync(join(root, reviewPath), '# Brownfield Review\n- ux_intent_definition_required: yes\nRenew the analytical context of this synthetic changed source.\n');
  const routed = service('agdf_record', { ...envelope(), command: { kind: 'step.record', payload: {
    step: 'route', route: 'structured_delivery', reason: 'Reassess the actual analytical owner', source: { path: reviewPath, digest: artefactFileDigest(root, reviewPath) } } } });
  assert.equal(routed.outcome, 'accepted', JSON.stringify(routed));
  const bound = { run_id: f.runId, expected_revision_id: f.revision(), presentation_language: 'en' };
  const report = inspectAuthoringInputs(root, bound);
  assert.equal(report.available, true, JSON.stringify(report));
  assert.equal(report.gate, 'PRD');
  assert.equal(report.next_operation.analysis, 'UX Intent Definition');
  assert.equal(report.authoring_owner, 'UX Intent Definition');
  assert.equal(report.chunk.type, 'UX_INTENT_DEFINITION');
  assert.equal(report.formats.kind, 'step.record');
  assert.equal(report.documents.some(d => d.role === 'template' && d.type === 'PRD'), false);
  if (process.env.AGDF_TEST_ORIGINAL_AUTHORING_ROOT) {
    const old = await import(pathToFileURL(join(process.env.AGDF_TEST_ORIGINAL_AUTHORING_ROOT, 'runtime/core/lib/control-inspect/authoring-inputs.js')).href);
    const original = old.inspectAuthoringInputs(root, bound);
    assert.equal(original.available, true, JSON.stringify(original));
    assert.equal(original.chunk.type, 'PRD', 'the preserved original selects the wrong gate template for the same actual reassessment state');
    console.log('Original wrong-template defect reproduced against preserved runtime; corrected public projection returns UX template.');
  }
  const uxPath = f.prefix + 'REASSESSMENT_UX.md';
  writeFileSync(join(root, uxPath), '# UX Intent Definition\n- decision: ready\nSynthetic analytical owner completed, no preview requirement.\n');
  const ux = service('agdf_record', { ...envelope(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'UX Intent Definition',
    decision: 'ready', source: { path: uxPath, digest: artefactFileDigest(root, uxPath) } } } });
  assert.equal(ux.outcome, 'accepted', JSON.stringify(ux));
  const authoring = inspectAuthoringInputs(root, { ...bound, expected_revision_id: f.revision() });
  assert.equal(authoring.recording.mode, 'renew_invalidated_binding');
  assert.equal(authoring.recording.update_draft, true);
  const content = syntheticPrd() + '\nSynthetic current-source reviewed renewal.\n';
  const material = { material_id: randomUUID(), digest: digest(content) }, command = { ...envelope(), command: { kind: 'artefact.record', payload: {
    gate: 'PRD', material, reviewer: 'Synthetic current-source reviewer', reviewed: true, update_draft: authoring.recording.update_draft } } };
  const grant = { ...material, content, slot: 'PRD', target_id: command.target_id, run_id: f.runId, expected_revision_id: command.expected_revision_id };
  const before = readFileSync(f.state, 'utf8');
  const rejected = createRunCommandService({ materialGrants: [grant] })('agdf_record', {
    ...command, operation_id: randomUUID(), command: { ...command.command, payload: { ...command.command.payload, update_draft: false } } });
  assert.equal(rejected.outcome, 'rejected', 'the existing writer still rejects pretending that historical renewal is first registration');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  const result = createRunCommandService({ materialGrants: [grant] })('agdf_record', command);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.receipt.supersedes, authoring.recording.supersedes);
  assert.equal(state().approvals.get('PRD').status, 'missing', 'historical approval is never transferred');
  console.log('Actual source-revision reassessment and discoverable historical-binding renewal passed (synthetic).');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(seeds, { recursive: true, force: true }); }
