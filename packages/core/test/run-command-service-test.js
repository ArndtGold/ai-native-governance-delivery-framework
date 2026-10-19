import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { inspectRunOperation } from '../lib/control-state/run-operation-status.js';
import { withSyntheticQaContent } from './fixtures/decision-content.js';
import { createDecisionActionService } from '../lib/control-state/decision-action-service.js';
import { executeApprovalCommand } from '../lib/control-state/approval-command.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-command-service-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createLateSourceRevisionTestRun(root, cli), service = createCoreServices().command;
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root,
    target_source: 'explicit_target', primary_target: root, target_id: target, run_id: f.runId,
    expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const path = f.prefix+'CD_CANDIDATE.md';
  writeFileSync(join(root, path), '# CD+Tests\n- decision: pass\nSynthetic approved fixture work verified.\n');
  const input = { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'CD+Tests', decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } };
  const initial = readFileSync(f.state, 'utf8');
  const candidatePath = f.prefix + 'RUNTIME_CANDIDATE.json'; writeFileSync(join(root, candidatePath), '{"schema_version":"1"}\n');
  const candidateDigest = artefactFileDigest(root, candidatePath);
  const runtimeCommand = { ...bound(), command: { kind: 'runtime_generation.replace', payload: {
    candidate: { path: candidatePath, digest: candidateDigest }, confirmation: `Replace owned runtime: ${candidateDigest}` } } };
  assert.equal(service('agdf_record', runtimeCommand).reason, 'connection_control_unavailable');
  assert.equal(service('agdf_record', { ...runtimeCommand, command: { ...runtimeCommand.command,
    payload: { ...runtimeCommand.command.payload, confirmation: 'Approval: TP' } } }).reason, 'confirmation_required');
  assert.equal(service('agdf_record', { ...runtimeCommand, expected_revision_id: randomUUID() }).reason, 'stale_revision');
  assert.equal(readFileSync(f.state, 'utf8'), initial, 'No owned connection, stale context and quoted gate permission have no runtime or business effect.');

  assert.equal(service('agdf_approve', input).reason, 'command_schema_invalid');
  assert.equal(createRunCommandService({ enabledGroups: [] })('agdf_record', input).reason, 'command_group_disabled');
  assert.equal(service('agdf_record', { ...input, target_id: 'sha256:'+'a'.repeat(64) }).reason, 'target_binding_mismatch');
  assert.equal(readFileSync(f.state, 'utf8'), initial);
  const result = service('agdf_record', input);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.receipt.operation_id, input.operation_id);
  assert.equal(result.current.available, true);
  const recorded = readFileSync(f.state, 'utf8');
  const inputFile = join(root, 'bounded-command.json'); writeFileSync(inputFile, JSON.stringify(input));
  const cliReplay = JSON.parse(execFileSync(process.execPath, [cli, 'agdf-record', '--command-file', inputFile], { encoding: 'utf8' }));
  assert.equal(cliReplay.outcome, 'already_applied'); assert.equal(cliReplay.receipt.operation_id, input.operation_id);
  assert.equal(readFileSync(f.state, 'utf8'), recorded, 'CLI and Core replay the same original receipt.');
  assert.equal(spawnSync(process.execPath, [cli, 'agdf-approve', '--command-file', inputFile]).status, 2);
  assert.equal(spawnSync(process.execPath, [cli, 'agdf-record', '--command-file', inputFile, '--force']).status, 1);
  writeFileSync(join(root, path), '# Mutated proposal after historical effect\n');
  assert.equal(service('agdf_record', input).outcome, 'already_applied');
  assert.equal(readFileSync(f.state, 'utf8'), recorded);
  assert.equal(service('agdf_record', { ...input, command: { kind: 'step.record', payload: { ...input.command.payload, covers: 'changed' } } }).reason, 'operation_payload_conflict');
  const cross = { ...input, command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } };
  assert.equal(service('agdf_prepare', cross).reason, 'operation_payload_conflict');
  const observed = inspectRunOperation(root, { runId: f.runId, operationId: input.operation_id, targetId: target });
  assert.equal(observed.status, 'recorded'); assert.equal(observed.authorizes, false);
  const lost = { ...bound(), command: { kind: 'step.record', payload: { step: 'evidence', reason: 'Synthetic additional evidence', covers: 'test', source: { path, digest: artefactFileDigest(root, path) } } } };
  const interrupted = createRunCommandService({ checkpoint: stage => { if (stage === 'before_result') throw Error('synthetic result loss'); } })('agdf_record', lost);
  assert.equal(interrupted.outcome, 'effect_unknown'); assert.equal(interrupted.receipt.operation_id, lost.operation_id);
  assert.equal(service('agdf_record', lost).outcome, 'already_applied');
  console.log('Shared service target/group confinement, source recording, historical replay/conflict and post-dispatch lost-result acknowledgement passed (synthetic only).');
  for (const step of ['TP Review', 'Clean Implementation Review', 'CR']) {
    const path = f.prefix + step.replaceAll(' ', '_') + '_RESULT.md';
    writeFileSync(join(root, path), '# ' + step + '\n- decision: pass\nSynthetic scoped review.\n');
    const result = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: {
      step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
    assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  }
  // Explicitly choosing English must work even when German content is unavailable.
  // These sources are authored before approval and remain byte-identical thereafter.
  const qaPath = f.prefix + 'QA_REPORT.md', proofPath = f.prefix + 'QA_LOCALE_MAPPING.json', requestPath = f.prefix + 'QA_LOCALE_RECORD.json';
  writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: English-only fixture\n- decision: pass\n').split('\n## AGDF Approval Summary')[0]);
  const destination = { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' };
  const source = { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') };
  const relationship = { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, reviewer = 'Synthetic locale regression reviewer';
  writeFileSync(join(root, proofPath), JSON.stringify({ schema_version: '1', target_id: target, run_id: f.runId, destination, source, relationship, reviewer, reviewed: true }));
  writeFileSync(join(root, requestPath), JSON.stringify({ schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination, source, relationship, review: { reviewer, path: proofPath, digest: artefactFileDigest(root, proofPath) }, update_draft: false }));
  assert.equal(service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: {
    gate: 'QA', reviewed_request: { path: requestPath, digest: artefactFileDigest(root, requestPath) } } } }).outcome, 'accepted');
  const qaPresentation = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } });
  assert.equal(qaPresentation.outcome, 'accepted');
  assert.equal(service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: {
    gate: 'QA', presentation_id: qaPresentation.family_result.presentation_id, response: 'Approval: QA' } } }).outcome, 'accepted');
  const configPath = join(root, '.agdf/control/config.json'), config = JSON.parse(readFileSync(configPath, 'utf8'));
  writeFileSync(configPath, JSON.stringify({ ...config, chat_language: 'de' }));
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).blocking_reason, 'AGDF_DECISION_CONTENT_INCOMPLETE');
  assert.equal(evaluateGateCheck(root, { runId: f.runId, presentationLanguage: 'en' }).status, 'open');
  const prepared = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'UAT' } } });
  assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
  const presentationId = prepared.family_result.presentation_id, revision = f.revision();
  const approval = { ...bound(), command: { kind: 'approval.record', payload: { gate: 'UAT', presentation_id: presentationId, response: 'Approval: UAT' } } };
  const before = readFileSync(f.state), protectedUr = readFileSync(f.file('UR.md')), protectedQa = readFileSync(join(root, qaPath));
  for (const patch of [{ presentation_id: randomUUID() }, { gate: 'QA' }, { response: 'Approval: QA' }]) {
    const denied = service('agdf_approve', { ...approval, operation_id: randomUUID(), command: { ...approval.command, payload: { ...approval.command.payload, ...patch } } });
    assert.equal(denied.outcome, 'rejected'); assert.equal(denied.receipt, null); assert.deepEqual(readFileSync(f.state), before);
  }
  const rejectedReply = executeApprovalCommand(root, { schema_version: '1', action: 'record_gate_approval', target_id: target, run_id: f.runId,
    expected_revision_id: revision, operation_id: randomUUID(), assurance: 'cooperative_local', gate: 'UAT', presentation_id: presentationId, response: 'Approval: QA' },
    { evaluateGateCheck, packageVersion: '0.14.5' });
  assert.equal(rejectedReply.outcome, 'rejected');
  assert.equal(rejectedReply.current.status, 'open', 'A rejected reply observes readiness in the immutable presentation locale');
  const seed = mkdtempSync(join(tmpdir(), 'agdf-approval-locale-seed-'));
  try {
    cpSync(join(root, '.agdf'), join(seed, 'control'), { recursive: true });
    for (const route of ['text', 'native']) {
      const action = { session_id: randomUUID(), operation_id: randomUUID(), presentation_id: presentationId, expected_revision_id: revision, action: 'approve' };
      const binding = { target_id: target, run_id: f.runId, gate: 'UAT', expected_revision_id: revision, presentation_id: presentationId, presentation_language: 'en' };
      const native = createDecisionActionService({ appOnlyMediationQualified: true });
      const submit = () => route === 'text' ? service('agdf_approve', { ...approval, presentation_language: 'de' }) : native(root, binding, action);
      const result = submit();
      assert.equal(result.outcome, 'accepted', route + ': ' + JSON.stringify(result));
      assert.equal(result.receipt.effect.gate, 'UAT'); assert.equal(result.current.gate, 'OR');
      const once = readFileSync(f.state); assert.equal(submit().outcome, 'already_applied'); assert.deepEqual(readFileSync(f.state), once);
      assert.deepEqual(readFileSync(f.file('UR.md')), protectedUr); assert.deepEqual(readFileSync(join(root, qaPath)), protectedQa);
      rmSync(join(root, '.agdf'), { recursive: true }); cpSync(join(seed, 'control'), join(root, '.agdf'), { recursive: true });
    }
  } finally { rmSync(seed, { recursive: true, force: true }); }
  console.log('Actual English UAT over German defaults: bound locale for text/native approval, replay and rejection observation; protected sources unchanged.');
} finally { rmSync(root, { recursive: true, force: true }); }
