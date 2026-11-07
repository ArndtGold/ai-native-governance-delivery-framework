import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { createCoreServices } from '../lib/index.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { sourceRevisionQualityFacts, readSourceRevisions } from '../lib/control-state/run-source-revisions.js';
import { readPendingSourceRevisionJournal } from '../lib/control-state/run-step-transaction.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
import { presentationVersionComparison } from '../lib/control-state/run-presentation-render.js';
import { intentStages, archiveStages, commitStages, beforeIntent, beforeRunCommit } from './fixtures/transaction-checkpoints.js';
import { readValidatedRevisionArchive } from '../lib/control-state/run-revision-history.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { initializeCurrentControl } from './fixtures/current-init.js';
import { resolutionRecord } from '../lib/control-state/input-resolution.js';

for (const layout of ['run-folders-v1']) {
const root = mkdtempSync(join(tmpdir(), 'agdf-command-revision-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); initializeCurrentControl(root, 'en');
  const f = createLateSourceRevisionTestRun(root, cli), p = f.proposal('TP');

  const envelope = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: p.input.operationId, assurance: 'cooperative_local' };
  const payload = { source_gate: 'TP', proposal: { path: p.input.evidence, digest: artefactFileDigest(root, p.input.evidence) } };
  const service = createCoreServices().command, before = readFileSync(f.state, 'utf8');
  const preview = service('agdf_revise', { ...envelope, command: { kind: 'source_revision.preview', payload } });
  assert.equal(preview.outcome, 'accepted', JSON.stringify(preview));
  assert.equal(readFileSync(f.state, 'utf8'), before);
  const input = { ...envelope, command: { kind: 'source_revision.apply', payload: { ...payload, preview_digest: preview.family_result.preview_digest, confirmation: 'Host tool allowed; no exact human confirmation' } } };
  assert.equal(service('agdf_revise', input).reason, 'confirmation_required'); assert.equal(readFileSync(f.state, 'utf8'), before);
  input.command.payload.confirmation = preview.family_result.confirmation_selector;
  const seed = root + '-seed'; cpSync(join(root, '.agdf'), seed, { recursive: true });
  try {
    const content = JSON.stringify(p.value), reference = { material_id: randomUUID(), digest: digest(content) };
    const grant = { ...reference, content, slot: 'EVIDENCE', target_id: envelope.target_id, run_id: envelope.run_id, expected_revision_id: envelope.expected_revision_id };
    const staged = createCoreServices({ observers: { materialGrants: [grant] } }).command;
    const stagedPreviewInput = { ...envelope, command: { kind: 'source_revision.preview', payload: { source_gate: 'TP', proposal: reference } } };
    const misplaced = createCoreServices({ observers: { materialGrants: [{ ...grant, slot: 'QA' }] } }).command('agdf_revise', stagedPreviewInput);
    assert.deepEqual([misplaced.outcome, misplaced.reason, misplaced.dispatch], ['rejected', 'material_binding_invalid', 'not_dispatched'],
      'A proposal staged in another slot is an input error before dispatch, never an unknown effect.');
    assert.ok(misplaced.recovery.includes('slot EVIDENCE, not QA'), 'The rejection names the required slot.');
    const stagedPreview = staged('agdf_revise', stagedPreviewInput);
    assert.equal(stagedPreview.outcome, 'accepted', JSON.stringify(stagedPreview));
    const stagedApply = { ...envelope, command: { kind: 'source_revision.apply', payload: { ...stagedPreviewInput.command.payload,
      preview_digest: stagedPreview.family_result.preview_digest, confirmation: stagedPreview.family_result.confirmation_selector } } };
    // The preview supplies the apply form with its own UUID; only proposal and confirmation remain.
    const applyForm = stagedPreview.recording_calls[0];
    assert.deepEqual(applyForm.required_inputs, ['/command/payload/proposal', '/command/payload/confirmation']);
    assert.equal(applyForm.confirmation_contract.confirmation_value, stagedPreview.family_result.confirmation_selector);
    const filled = structuredClone(applyForm.call.arguments);
    Object.assign(filled.command.payload, { proposal: reference, confirmation: stagedPreview.family_result.confirmation_selector });
    assert.deepEqual(filled.command, stagedApply.command);
    assert.equal(filled.operation_id, stagedApply.operation_id, 'Apply keeps the UUID that the proposal binds.');
    const stagedResult = staged('agdf_revise', stagedApply);
    assert.equal(stagedResult.outcome, 'accepted', JSON.stringify(stagedResult));
    assert.ok(readValidatedRevisionArchive(root, stagedResult.receipt).manifest, JSON.stringify(stagedResult));
    assert.equal(service('agdf_revise', stagedApply).outcome, 'already_applied', 'semantic material replay survives transfer loss');
    rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true });
    for (const stage of ['archive_intent', 'archive_file', 'run_after_rename']) {
      const program = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
        createRunCommandService({materialGrants:JSON.parse(process.argv[3]),checkpoint(point){if(point===process.argv[2])process.exit(71)}})('agdf_revise',JSON.parse(process.argv[1]));`;
      const interrupted = spawnSync(process.execPath, ['--input-type=module', '-e', program, JSON.stringify(stagedApply), stage, JSON.stringify([grant])]);
      assert.equal(interrupted.status, 71, layout + '/' + stage + ': ' + interrupted.stderr + interrupted.stdout);
      let pending = readPendingSourceRevisionJournal(root, f.runId); assert.equal(resolutionRecord(pending).schema_version, 7);

      const recovery = { ...envelope, expected_revision_id: f.revision(), command: { kind: 'source_revision.recover', payload: {
        source_gate: 'TP', proposal: reference, recovery_revision_id: f.revision(), pending_digest: digest(canonicalJson(pending)) } } };
      const recovered = staged('agdf_revise', recovery);
      assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));

      assert.equal(staged('agdf_revise', stagedApply).outcome, stage === 'run_after_rename' ? 'already_applied' : 'accepted');
      rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true });
    }
    for (const stage of [...intentStages, ...archiveStages, ...commitStages]) {
      const program = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
        const result = createRunCommandService({checkpoint(point){if(point===process.argv[2])process.exit(71)}})('agdf_revise',JSON.parse(process.argv[1])); console.log(JSON.stringify(result));`;
      const interrupted = spawnSync(process.execPath, ['--input-type=module', '-e', program, JSON.stringify(input), stage]);
      assert.equal(interrupted.status, 71, layout + '/' + stage + ': ' + interrupted.stderr + interrupted.stdout);
      if (!beforeIntent(stage) && stage !== 'retired') {
        const pending = readPendingSourceRevisionJournal(root, f.runId);

        const recovery = { ...input, expected_revision_id: f.revision(), command: { kind: 'source_revision.recover', payload: {
          ...payload, recovery_revision_id: f.revision(), pending_digest: digest(canonicalJson(pending)),
        } } };
        assert.equal(service('agdf_revise', recovery).outcome, 'accepted', stage);

      }
      if (beforeRunCommit(stage)) assert.equal(readFileSync(f.state, 'utf8'), before, stage);
      assert.equal(service('agdf_revise', input).outcome, beforeRunCommit(stage) ? 'accepted' : 'already_applied', stage);
      rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true });
    }
    const code = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
      createRunCommandService({checkpoint(stage){if(stage==='run_after_rename')process.exit(71)}})('agdf_revise', JSON.parse(process.argv[1]));`;
    const interrupted = spawnSync(process.execPath, ['--input-type=module', '-e', code, JSON.stringify(input)]);
    assert.equal(interrupted.status, 71, interrupted.stderr.toString());
    const pending = readPendingSourceRevisionJournal(root, f.runId);
    writeFileSync(join(root, p.input.evidence), '{"proposal_changed_after_commit":true}');
    const recovery = { ...input, expected_revision_id: f.revision(), command: { kind: 'source_revision.recover', payload: {
      ...payload, recovery_revision_id: f.revision(), pending_digest: digest(canonicalJson(pending)),
    } } };
    const recovered = service('agdf_revise', recovery);
    assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
    assert.equal(recovered.family_result.status, 'completed');
    assert.equal(service('agdf_revise', input).outcome, 'already_applied');
  } finally {
    rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true }); rmSync(seed, { recursive: true });
  }
  const result = service('agdf_revise', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(resolutionRecord(result.receipt).schema_version, '4'); assert.equal(result.receipt.command_digest, result.request_digest);
  const after = readFileSync(f.state, 'utf8');
  writeFileSync(join(root, p.input.evidence), '{"changed_after_historical_effect":true}');
  assert.equal(service('agdf_revise', input).outcome, 'already_applied', 'historical replay does not reinterpret mutable proposal bytes');
  assert.equal(readFileSync(f.state, 'utf8'), after);
  assert.equal(service('agdf_revise', { ...input, command: { kind: input.command.kind, payload: { ...input.command.payload, confirmation: input.command.payload.confirmation+' changed' } } }).reason, 'operation_payload_conflict');
  assert.equal(readSourceRevisions(after).receipts.length, 1);
  const comparison = presentationVersionComparison(root, readRunState(root, { runId: f.runId }), 'TP', artefactFileDigest(root, f.prefix + 'TP.md'));
  assert.equal(comparison.state, 'available'); assert.equal(comparison.unchanged, true);
  assert.equal(comparison.previous_text, readFileSync(f.file('TP.md'), 'utf8'));
  const receipt = readSourceRevisions(after).receipts[0], archive = readValidatedRevisionArchive(root, receipt);
  const captured = archive.manifest.files.find(row => row.path === f.prefix + 'TP.md');
  writeFileSync(join(root, captured.snapshot), 'Damaged previous version');
  assert.equal(presentationVersionComparison(root, readRunState(root, { runId: f.runId }), 'TP', comparison.current_digest).state, 'unavailable');
  console.log('Shared revision preview, exact confirmation boundary, original receipt/archive and immutable historical request replay passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
}
