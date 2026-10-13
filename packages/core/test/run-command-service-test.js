import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { inspectRunOperation } from '../lib/control-state/run-operation-status.js';

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
} finally { rmSync(root, { recursive: true, force: true }); }
