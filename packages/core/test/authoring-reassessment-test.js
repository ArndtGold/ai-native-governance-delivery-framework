import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createExpandedSourceRevisionFixture } from '../../cli/scripts/fixtures/expanded-source-revision.js';
import { createPrdDefinitionTestRun, syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { treeBytes } from './control-cockpit-fixtures.js';
import { inspectAuthoringInputs } from '../lib/control-inspect/authoring-inputs.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { digest } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-reassessment-')), seeds = mkdtempSync(join(tmpdir(), 'agdf-reassessment-seeds-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  const initialRoot = mkdtempSync(join(tmpdir(), 'agdf-initial-ux-'));
  try {
    execFileSync('git', ['init', '-q', initialRoot]);
    execFileSync(process.execPath, [cli, 'init', '--dir', initialRoot, '--language', 'en']);
    const initial = createPrdDefinitionTestRun(initialRoot, cli, 'initial-ux', process.env,
      { typedApprovals: true, typedRoute: true, uxRequired: true });
    const services = createCoreServices();
    const inspect = () => {
      const before = treeBytes(initialRoot);
      const report = inspectAuthoringInputs(initialRoot, { run_id: initial.runId,
        expected_revision_id: initial.revision(), presentation_language: 'en' });
      assert.equal(report.available, true, JSON.stringify(report));
      assert.equal(report.gate, 'PRD');
      assert.deepEqual(treeBytes(initialRoot), before, 'authoring-inputs preserves every control file');
      return report;
    };
    const dispatch = () => services.dispatch({ skillId: 'gate-check', runId: initial.runId,
      continueDelivery: true, surface: 'codex', presentationLanguage: 'en', workingDirectory: initialRoot,
      primaryTarget: initialRoot, targetSource: 'explicit_target',
      expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
    const assertUxInput = () => {
      assert.equal(dispatch().continuation?.skill_id, 'ux-intent-definition');
      const report = inspect();
      assert.equal(report.authoring_owner, 'UX Intent Definition');
      assert.equal(report.chunk.type, 'UX_INTENT_DEFINITION');
      assert.equal(report.chunk.source, 'version_matched_plugin');
      assert.equal(report.formats.kind, 'step.record');
      assert.equal(report.documents.some(row => row.role === 'template' && row.type === 'PRD'), false);
    };
    assertUxInput(); // The first post-UR analysis is missing; no source revision exists.
    writeFileSync(initial.file('UX_INTENT_DEFINITION.md'), '# UX intent\nDecision: ready\n');
    assertUxInput(); // Malformed declaration is the existing owner's correction path.
    writeFileSync(initial.file('UX_INTENT_DEFINITION.md'), '# UX intent\n- decision: blocked\n');
    assert.equal(dispatch().terminal, true, 'a blocked decision must not grant analytical correction intent');
    assert.equal(inspect().authoring_owner, 'PRD', 'non-repairable source decisions retain the existing gate observation');
    writeFileSync(initial.file('UX_INTENT_DEFINITION.md'), '# UX intent\n- decision: ready\n');
    assertUxInput(); // Ready bytes still need canonical registration.
    const recorded = services.command('agdf_record', { schema_version: '1', presentation_language: 'en',
      working_directory: initialRoot, primary_target: initialRoot, target_source: 'explicit_target',
      target_id: resolveControlCommandTarget(initialRoot).target_id, run_id: initial.runId,
      expected_revision_id: initial.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'UX Intent Definition',
        decision: 'ready', source: { path: initial.prefix + 'UX_INTENT_DEFINITION.md',
          digest: artefactFileDigest(initialRoot, initial.prefix + 'UX_INTENT_DEFINITION.md') } } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
    assert.equal(dispatch().continuation?.skill_id, 'prd-definition');
    assert.equal(inspect().chunk.type, 'PRD', 'the completed prerequisite returns authoring to PRD');
    console.log('Initial required UX authoring: missing, malformed, unrecorded, blocked and completed inputs match dispatch without writes.');
  } finally { rmSync(initialRoot, { recursive: true, force: true }); }
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
