import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createSdDefinitionTestRun } from '../../cli/scripts/fixtures/sd-definition.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { createEarlyUrRevisionTestRun } from '../../cli/scripts/fixtures/early-ur-revision.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../../core/lib/control-state/run-seal.js';
import { earlyPrdConfirmation, readRunOperations } from '../../core/lib/control-state/run-operations.js';
import { readSourceRevisions } from '../../core/lib/control-state/run-source-revisions.js';
import { readValidatedRevisionArchive } from '../../core/lib/control-state/run-revision-history.js';
import { readApprovalOperations } from '../../core/lib/control-state/approval-operations.js';

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget, cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
  try {
    const early = createSdDefinitionTestRun(root, cli, 'mcp-early-prd', process.env, { typedApprovals: true });
    const late = createLateSourceRevisionTestRun(root, cli, 'mcp-late-source');
    const earlyUr = createEarlyUrRevisionTestRun(root, cli, 'mcp-early-ur');
    const bound = f => ({ working_directory: root, target_source: 'explicit_target',
      primary_target: root, target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId,
      expected_revision_id: f.revision(), operation_id: randomUUID() });
    await withStdioClient({ ...fixture, modern }, async client => {
      const call = async input => { const result = await client.callTool({ name: 'agdf_revise', arguments: input });
        assert.ok(result.structuredContent, JSON.stringify(result)); return result.structuredContent; };
      const reopen = { ...bound(early), command: { kind: 'prd_revision.reopen', payload: {
        prd: { path: early.prefix + 'PRD.md', digest: artefactFileDigest(root, early.prefix + 'PRD.md') }, confirmation: 'No deliberate exact confirmation' } } };
      const before = readFileSync(early.state, 'utf8');
      assert.equal((await call(reopen)).reason, 'revision_confirmation_required'); assert.equal(readFileSync(early.state, 'utf8'), before);
      reopen.command.payload.confirmation = earlyPrdConfirmation(early.runId, reopen.expected_revision_id, reopen.operation_id, reopen.command.payload.prd.digest);
      assert.equal((await call(reopen)).outcome, 'accepted');
      assert.equal((await call(reopen)).outcome, 'already_applied');
      assert.equal(readRunOperations(readFileSync(early.state, 'utf8')).receipts.length, 1);
      assert.equal(runSealState(root, readFileSync(early.state, 'utf8')).status, 'valid');
      const proposal = late.proposal('TP'), envelope = { ...bound(late), operation_id: proposal.input.operationId };
      const payload = { source_gate: 'TP', proposal: { path: proposal.input.evidence, digest: artefactFileDigest(root, proposal.input.evidence) } };
      const old = readFileSync(late.state, 'utf8');
      const preview = await call({ ...envelope, command: { kind: 'source_revision.preview', payload } });
      assert.equal(preview.outcome, 'accepted', JSON.stringify(preview)); assert.equal(readFileSync(late.state, 'utf8'), old);
      const apply = { ...envelope, command: { kind: 'source_revision.apply', payload: { ...payload,
        preview_digest: preview.family_result.preview_digest, confirmation: 'Technical permission only' } } };
      assert.equal((await call(apply)).reason, 'confirmation_required'); assert.equal(readFileSync(late.state, 'utf8'), old);
      apply.command.payload.confirmation = preview.family_result.confirmation_selector;
      assert.equal((await call(apply)).outcome, 'accepted');
      const configPath = join(root, '.agdf/control/config.json'), configBefore = readFileSync(configPath); writeFileSync(configPath, '{');
      assert.equal((await call(apply)).outcome, 'already_applied');
      assert.equal(readFileSync(configPath, 'utf8'), '{'); writeFileSync(configPath, configBefore);
      assert.equal(readSourceRevisions(readFileSync(late.state, 'utf8')).receipts.length, 1);
      assert.equal(runSealState(root, readFileSync(late.state, 'utf8')).status, 'valid');
      assert.equal((await call({ ...apply, presentation_language: 'de' })).reason, 'operation_payload_conflict');
      // Exercise the already-supported UR-at-SD boundary through the generated
      // command group, rather than treating earlier CLI/source proof as MCP proof.
      const urProposal = earlyUr.proposal(), urBefore = readFileSync(earlyUr.state, 'utf8');
      const oldApprovals = readApprovalOperations(urBefore).receipts;
      const oldPresentations = readdirSync(join(root, `.agdf/control/runs/${earlyUr.runId}/presentations`));
      const urEnvelope = { ...bound(earlyUr), operation_id: urProposal.input.operationId };
      const urPayload = { source_gate: 'UR', proposal: { path: urProposal.input.evidence,
        digest: artefactFileDigest(root, urProposal.input.evidence) } };
      const urPreview = await call({ ...urEnvelope, command: { kind: 'source_revision.preview', payload: urPayload } });
      assert.equal(urPreview.outcome, 'accepted', JSON.stringify(urPreview));
      assert.equal(readFileSync(earlyUr.state, 'utf8'), urBefore, 'Preview is read-only.');
      const urApply = { ...urEnvelope, command: { kind: 'source_revision.apply', payload: { ...urPayload,
        preview_digest: urPreview.family_result.preview_digest, confirmation: 'Tool permission is not material confirmation.' } } };
      assert.equal((await call(urApply)).reason, 'confirmation_required');
      assert.equal(readFileSync(earlyUr.state, 'utf8'), urBefore);
      urApply.command.payload.confirmation = urPreview.family_result.confirmation_selector;
      const urResult = await call(urApply);
      assert.equal(urResult.outcome, 'accepted', JSON.stringify(urResult));
      assert.equal(urResult.current.gate, 'UR');
      const urAfter = readFileSync(earlyUr.state, 'utf8');
      const urReceipts = readSourceRevisions(urAfter).receipts;
      assert.equal(urReceipts.length, 1);
      const archive = readValidatedRevisionArchive(root, urReceipts[0]);
      assert.ok(archive, 'Exact archive remains validated.');
      assert.deepEqual(readApprovalOperations(urAfter).receipts, oldApprovals, 'Historical decision receipts are preserved.');
      for (const gate of ['UR', 'PRD', 'SD', 'TP']) assert.equal(earlyUr.control().approvals.get(gate).status, 'missing');
      assert.equal(earlyUr.control().mode_slice_decision.decision, 'undecided');
      assert.equal(earlyUr.control().artefacts.get('Brownfield Review').status, 'missing');
      for (const name of oldPresentations) {
        const row = archive.manifest.files.find(row => row.path.endsWith(`/presentations/${name}`));
        assert.ok(row, `${name} remains archived with its exact prepared bytes.`);
        assert.deepEqual(readFileSync(join(root, row.snapshot)),
          readFileSync(join(root, `.agdf/control/runs/${earlyUr.runId}/presentations/${name}`)));
      }
      for (const type of ['UR', 'PRD', 'SD']) {
        const archived = archive.manifest.files.find(row => row.path === earlyUr.prefix + type + '.md');
        assert.deepEqual(readFileSync(join(root, archived.snapshot)), readFileSync(earlyUr.file(type + '.md')));
      }
      assert.equal(runSealState(root, urAfter).status, 'valid');
      const urReplay = await call(urApply);
      assert.equal(urReplay.outcome, 'already_applied');
      assert.equal(urReplay.current.gate, 'UR');
      assert.equal((await call({ ...urApply, presentation_language: 'de' })).reason, 'operation_payload_conflict');
      const oldApproval = oldApprovals.find(row => row.binding.gate === 'UR');
      const staleApproval = await client.callTool({ name: 'agdf_approve', arguments: {
        ...urEnvelope, operation_id: randomUUID(), expected_revision_id: oldApproval.binding.expected_revision_id,
        command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: oldApproval.binding.presentation_id, response: 'Approval: UR' } },
      } });
      assert.equal(staleApproval.structuredContent.outcome, 'rejected');
      assert.equal(readFileSync(earlyUr.state, 'utf8'), urAfter, 'Replay/conflict and old approval cannot produce another effect.');
      if (process.env.AGDF_TEST_EVIDENCE_DIR) writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, `early-ur-${modern ? 'modern' : 'legacy'}.json`), JSON.stringify({
        evidence_class: 'actual_generated_stdio_synthetic_disposable_ur_revision', modern,
        target_id: urEnvelope.target_id, run_id: earlyUr.runId, operation_id: urEnvelope.operation_id,
        expected_revision_id: urEnvelope.expected_revision_id, preview: urPreview, applied: urResult, replay: urReplay,
        source_revision_receipt: urReceipts[0], archive_digest: urReceipts[0].archive.digest,
        archived_presentations: oldPresentations, stale_approval: staleApproval.structuredContent,
        native_qualified: false, authorizes: false,
      }, null, 2));
      console.log('SCN-020/021: actual generated STDIO UR-at-SD preview/apply, explicit confirmation, exact archive, invalidated approvals/analysis, stale approval denial and single replay passed; synthetic decisions only.');
      console.log('Actual default-entrypoint STDIO early PRD reopening and source preview/apply, explicit confirmation, preserved old state on denial and single historical replay passed; synthetic only.');
    });
  } finally { fixture.dispose(); }
}
