import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { previewFixture } from './fixtures/preview-review.js';
import { createPrdDefinitionTestRun } from '../../cli/scripts/fixtures/prd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { readPresentationPreview, validateRunPresentationRecord } from '../lib/control-state/run-presentation.js';
import { inspectApprovedArtefact } from '../lib/control-state/artefact-binding-proof.js';
import { prepareRunContentState } from '../lib/control-evaluation/run-state.js';
import { earlyPrdConfirmation, readRunOperations } from '../lib/control-state/run-operations.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { validateEarlyPrdHistory } from '../lib/control-state/run-revision-history.js';
import { createDecisionActionService } from '../lib/control-state/decision-action-service.js';
import { digest } from '../lib/control-state/approval-command-contract.js';
import { tryLinkFile } from '../../../scripts/support/symlinks.js';

export function createPreviewPresentationFixture(runId = 'preview-presentation') {
  const root = mkdtempSync(join(tmpdir(), 'agdf-preview-presentation-'));
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createPrdDefinitionTestRun(root, cli, runId, process.env, { typedApprovals: true, previewRequirement: true });
  const source = readFileSync(f.file('UR.md'), 'utf8'), preview = previewFixture(root, runId, source);
  writeFileSync(f.file('PRD.md'), preview.prd()); assert.equal(f.record().value?.outcome, 'recorded');
  const input = { schema_version: '1', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: resolveControlCommandTarget(root).target_id, run_id: runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'presentation.prepare', payload: { gate: 'PRD' } } };
  return { root, f, preview, input, command: createCoreServices().command };
}

// Importing a fixture must not execute a test or create a Run.
if (process.argv[1] === import.meta.filename) {
  const { root, f, preview, input, command } = createPreviewPresentationFixture();
  try {
    const before = readFileSync(f.state, 'utf8');
    const asset = join(root, preview.descriptor.files.find(file => file.path.endsWith('main.js')).path), original = readFileSync(asset);
    rmSync(asset); assert.equal(command('agdf_prepare', input).outcome, 'rejected'); assert.equal(readFileSync(f.state, 'utf8'), before);
    writeFileSync(asset, original);
    const interruptedInput = { ...input, operation_id: randomUUID() };
    const interrupted = createRunCommandService({ checkpoint: point => { if (point === 'presentation_preview_file_published') throw Error('synthetic_interrupt'); } });
    assert.notEqual(interrupted('agdf_prepare', interruptedInput).outcome, 'accepted');
    const partial=join(root,`.agdf/control/runs/${f.runId}/presentations/${interruptedInput.operation_id}.preview-file-0`),partialBytes=readFileSync(partial);
    writeFileSync(partial,'changed partial bytes');assert.equal(command('agdf_prepare',interruptedInput).outcome,'rejected');assert.equal(readFileSync(partial,'utf8'),'changed partial bytes');
    rmSync(partial);const outside=join(root,'foreign-partial');writeFileSync(outside,partialBytes);
    if(tryLinkFile(outside,partial,'preview-publication')){assert.equal(command('agdf_prepare',interruptedInput).outcome,'rejected');rmSync(partial);}
    writeFileSync(partial,partialBytes);
    const resumed = command('agdf_prepare', interruptedInput); assert.equal(resumed.outcome, 'accepted', JSON.stringify(resumed));
    assert.equal(command('agdf_prepare', interruptedInput).outcome, 'already_applied');
    const prepared = command('agdf_prepare', input); assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
    const selectors = { runId: f.runId, gate: 'PRD', revisionId: f.revision(), presentationId: prepared.family_result.presentation_id, targetId: input.target_id };
    const envelope = validateRunPresentationRecord(root, selectors); assert.equal(envelope.record.schema_version, 6);
    assert.ok(prepared.family_result.text.includes('.preview.html'));
    const page = readPresentationPreview(root, selectors); assert.equal(page.available, true, JSON.stringify(page));
    assert.equal(page.content_digest, envelope.record.preview_review.rendered_digest); assert.equal(page.authorizes, false);
    assert.ok(page.content.includes('sandbox="allow-scripts"')); assert.equal(page.format, 'isolated_html');
    assert.equal(readPresentationPreview(root, { ...selectors, cursor: 'wrong' }).available, false);
    assert.equal(readPresentationPreview(root, { ...selectors, targetId: 'sha256:' + '0'.repeat(64) }).available, false);
    const approve = { ...input, operation_id: randomUUID(), command: { kind: 'approval.record', payload: { gate: 'PRD', presentation_id: selectors.presentationId, response: 'Approval: PRD' } } };
    const envelopePath=join(root,`.agdf/control/runs/${f.runId}/presentations/${selectors.presentationId}.json`),envelopeBytes=readFileSync(envelopePath);
    const legacy=structuredClone(envelope.record);legacy.schema_version=3;delete legacy.preview_review;
    writeFileSync(envelopePath,JSON.stringify({record:legacy,digest:digest(JSON.stringify(legacy))}));
    assert.equal(command('agdf_approve',{...approve,operation_id:randomUUID()}).outcome,'rejected','Required preview cannot use an older envelope without its binding');
    assert.equal(readFileSync(f.state,'utf8'),before);writeFileSync(envelopePath,envelopeBytes);
    writeFileSync(asset, 'different bytes'); assert.equal(command('agdf_approve', approve).outcome, 'rejected'); assert.equal(readFileSync(f.state, 'utf8'), before);
    assert.equal(readPresentationPreview(root,selectors).applicability,'stale','Immutable access must not label changed live source current');
    writeFileSync(asset, original);
    const checkpointCommand = createRunCommandService({ checkpoint: point => { if (point === 'before_final_validation') writeFileSync(asset, 'race at precommit'); } });
    const raced = checkpointCommand('agdf_approve', { ...approve, operation_id: randomUUID() });
    assert.equal(raced.outcome, 'rejected', JSON.stringify(raced)); assert.equal(readFileSync(f.state, 'utf8'), before);
    writeFileSync(asset, original);
    const snapshotPath = join(root, envelope.record.preview_review.chunks[0].snapshot), snapshot = readFileSync(snapshotPath);
    writeFileSync(snapshotPath, 'tampered chunk'); assert.equal(command('agdf_approve', { ...approve, operation_id: randomUUID() }).outcome, 'rejected');
    writeFileSync(snapshotPath, snapshot);
    const rawPath=join(root,envelope.record.preview_review.files[0].snapshot),rawBytes=readFileSync(rawPath);
    writeFileSync(rawPath,'tampered raw snapshot');assert.equal(command('agdf_approve',{...approve,operation_id:randomUUID()}).outcome,'rejected');writeFileSync(rawPath,rawBytes);
    const result = command('agdf_approve', { ...approve, operation_id: randomUUID() }); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
    assert.equal(result.receipt.schema_version, '2');
    let state = prepareRunContentState(root, readFileSync(f.state, 'utf8'), f.state);
    assert.equal(inspectApprovedArtefact(root, state, 'PRD').confirmed, true);
    writeFileSync(asset, 'changed after approval');
    state = prepareRunContentState(root, readFileSync(f.state, 'utf8'), f.state);
    assert.equal(inspectApprovedArtefact(root, state, 'PRD').confirmed, false);
    writeFileSync(asset, original);
    const reopen = { ...input, operation_id: randomUUID(), expected_revision_id: f.revision(), command: { kind: 'prd_revision.reopen', payload: {
      prd: { path: f.prefix+'PRD.md', digest: artefactFileDigest(root,f.prefix+'PRD.md') }, confirmation: '' } } };
    reopen.command.payload.confirmation=earlyPrdConfirmation(f.runId,reopen.expected_revision_id,reopen.operation_id,reopen.command.payload.prd.digest);
    const reopened=command('agdf_revise',reopen);assert.equal(reopened.outcome,'accepted',JSON.stringify(reopened));
    const receipt=readRunOperations(readFileSync(f.state,'utf8')).receipts.find(row=>row.kind==='prd_revision.reopen');
    assert.equal(validateEarlyPrdHistory(root,receipt),true);
    const archive=JSON.parse(readFileSync(join(root,receipt.effect.record.archive.path),'utf8'));
    for(const file of [...envelope.record.preview_review.files,...envelope.record.preview_review.chunks]) {
      assert.ok(archive.files.some(row=>row.path===file.snapshot));
      if(file.path)assert.ok(archive.files.some(row=>row.path===file.path));
    }
    writeFileSync(asset,'changed live after archive');assert.equal(validateEarlyPrdHistory(root,receipt),true,'History uses archived raw bytes');
    assert.equal(readPresentationPreview(root,selectors).applicability,'historical');
    writeFileSync(asset,original);
    const next=structuredClone(preview.descriptor);next.version='review-v2';
    cpSync(join(root,f.prefix+'previews/review-v1'),join(root,f.prefix+'previews/review-v2'),{recursive:true});
    next.entry=next.entry.replace('/review-v1/','/review-v2/');next.files.forEach(file=>file.path=file.path.replace('/review-v1/','/review-v2/'));
    const nextAsset=next.files.find(file=>file.path.endsWith('main.js')),nextBytes=Buffer.from(original+'\n// Revised illustrative interaction\n');
    writeFileSync(join(root,nextAsset.path),nextBytes);nextAsset.bytes=nextBytes.length;nextAsset.digest=digest(nextBytes);
    writeFileSync(f.file('PRD.md'),preview.prd(next));assert.equal(f.record(true).value.outcome,'recorded');
    assert.equal(command('agdf_approve',{...approve,operation_id:randomUUID()}).outcome,'rejected','Old reply cannot approve revised material');
    const nextInput={...input,operation_id:randomUUID(),expected_revision_id:f.revision()},nextPrepared=command('agdf_prepare',nextInput);
    assert.equal(nextPrepared.outcome,'accepted',JSON.stringify(nextPrepared));
    const native=createDecisionActionService({appOnlyMediationQualified:true});
    const binding={target_id:input.target_id,run_id:f.runId,gate:'PRD',expected_revision_id:f.revision(),presentation_id:nextPrepared.family_result.presentation_id,presentation_language:'en'};
    const nativeInput={session_id:randomUUID(),operation_id:randomUUID(),presentation_id:binding.presentation_id,expected_revision_id:binding.expected_revision_id,action:'approve'};
    const beforeNative=readFileSync(f.state,'utf8');writeFileSync(join(root,nextAsset.path),'tamper native');
    assert.equal(native(root,binding,nativeInput).outcome,'rejected');assert.equal(readFileSync(f.state,'utf8'),beforeNative);writeFileSync(join(root,nextAsset.path),nextBytes);
    assert.equal(native(root,binding,nativeInput).outcome,'accepted');assert.equal(native(root,binding,nativeInput).outcome,'already_applied');
    assert.equal(validateEarlyPrdHistory(root,receipt),true);
    console.log('SCN-012/027: actual early PRD revision archives v5 files/chunks, ignores later live history changes, renews presentation and rejects old replies; native facade approval/replay passed.');
    console.log('SCN-009/010/011/015/018/021/025/030: exact preview preparation, interruption, actual approval denial/race, receipt and current proof passed (synthetic runs).');
  } finally { rmSync(root, { recursive: true, force: true }); }
}
