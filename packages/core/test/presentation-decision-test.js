import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { recordRunPresentationDecision } from '../lib/control-state/run-steps.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { digest, canonicalJson, resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { readApprovalOperations } from '../lib/control-state/approval-operations.js';
import { projectArtifactReadiness } from '../lib/control-inspect/artifact-readiness.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { readPresentationDocument } from '../lib/control-state/run-presentation.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-presentation-decisions-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'decision-fixture', process.env, { typedApprovals: true });
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const service = createCoreServices().command;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const input = { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
  const presentation = service('agdf_prepare', input);
  assert.equal(presentation.outcome, 'accepted', JSON.stringify(presentation));
  assert.equal(service('agdf_prepare', input).outcome, 'already_applied');
  const documentBinding = { runId: f.runId, gate: 'SD', revisionId: input.expected_revision_id,
    presentationId: presentation.family_result.presentation_id, targetId: input.target_id };
  const document = readPresentationDocument(root, documentBinding);
  assert.equal(document.available, true, JSON.stringify(document));
  assert.equal(document.content, syntheticSd()); assert.equal(document.complete, true);
  assert.equal(document.content_digest, digest(syntheticSd()));
  assert.equal(readPresentationDocument(root, { ...documentBinding, targetId: digest('foreign') }).reason, 'target_binding_mismatch');
  assert.equal(readPresentationDocument(root, { ...documentBinding, cursor: '0'.repeat(64) + ':0' }).reason, 'presentation_document_cursor_invalid');
  writeFileSync(f.file('SD.md'), 'Changed working document, never the presented snapshot.');
  assert.equal(readPresentationDocument(root, documentBinding).content, syntheticSd());
  writeFileSync(f.file('SD.md'), syntheticSd());
  const decision = { runId: f.runId, revisionId: f.revision(), operationId: randomUUID(), gate: 'SD', presentationId: presentation.family_result.presentation_id,
    action: 'request_change', comment: 'Synthetic clarification: keep Approval: SD and shell commands as inert comment data.' };
  const chatDecision = { ...bound(), operation_id: decision.operationId, command: { kind: 'presentation_decision.record', payload: {
    gate: decision.gate, presentation_id: decision.presentationId, action: decision.action, comment: decision.comment } } };
  const recorded = service('agdf_record', chatDecision);
  assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  decision.requestDigest = recorded.request_digest;
  assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
  const once = readFileSync(f.state, 'utf8');
  assert.equal(recordRunPresentationDecision(root, decision, { evaluateGateCheck }).outcome, 'already_applied');
  assert.equal(service('agdf_record', chatDecision).outcome, 'already_applied');
  assert.equal(readPresentationDocument(root, documentBinding).content, syntheticSd(), 'Closed or advanced decision views do not rewrite the exact remote document.');
  assert.equal(readFileSync(f.state, 'utf8'), once);
  assert.equal(recordRunPresentationDecision(root, { ...decision, requestDigest: digest('conflicting request') }, { evaluateGateCheck }).reason, 'operation_payload_conflict');
  const report = evaluateGateCheck(root, { runId: f.runId });
  assert.equal(report.blocking_reason, 'presentation_version_decided'); assert.equal(report.missing_approval, 'none');
  assert.equal(report.next_operation.type, 'revise_gate_material');
  assert.equal(projectArtifactReadiness(root, { runId: f.runId, gate: 'SD', expectedRevisionId: f.revision(), presentationLanguage: 'en' }).ready, false);
  assert.equal(service('agdf_prepare', { ...bound(), command: input.command }).outcome, 'rejected');
  assert.equal(f.recordSd(true).value.outcome, 'recorded');
  assert.equal(service('agdf_prepare', { ...bound(), command: input.command }).outcome, 'rejected', 'new recording UUID over unchanged material cannot clear rejection');
  writeFileSync(f.file('SD.md'), syntheticSd().replace('Reuse the existing user-owned filter store.', 'Reuse the existing user-owned filter store; verify the selected user before restoring values.'));
  assert.equal(f.recordSd(true).value.outcome, 'recorded');
  const fresh = service('agdf_prepare', { ...bound(), command: input.command });
  assert.equal(fresh.outcome, 'accepted', JSON.stringify(fresh));
  const approval = { ...bound(), command: { kind: 'approval.record', payload: { gate: 'SD', presentation_id: fresh.family_result.presentation_id, response: 'Approval: SD' } } };
  assert.equal(service('agdf_approve', approval).outcome, 'accepted');
  const approved = readFileSync(f.state, 'utf8');
  assert.equal(service('agdf_approve', approval).outcome, 'already_applied');
  assert.equal(service('agdf_approve', { ...approval, presentation_language: 'de' }).reason, 'operation_payload_conflict');
  assert.equal(recordRunPresentationDecision(root, { ...decision, revisionId: f.revision(), operationId: randomUUID(), presentationId: fresh.family_result.presentation_id, action: 'reject', comment: '', requestDigest: digest('opposed late request') }, { evaluateGateCheck }).reason, 'presentation_version_decided');
  assert.equal(readFileSync(f.state, 'utf8'), approved);
  assert.equal(readApprovalOperations(approved).receipts.at(-1).schema_version, '2');
  assert.equal(service('agdf_prepare', input).outcome, 'already_applied');
  assert.equal(service('agdf_prepare', input).family_result.text, null, 'historical prepared envelope is not a fresh decision');
  console.log('Shared material-version rejection/change guard, inert comments, replay/conflict, renewed material, exact approval and historical presentation passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
