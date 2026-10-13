import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { createSdDefinitionTestRun } from '../../cli/scripts/fixtures/sd-definition.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../lib/control-state/run-seal.js';
import { readRunOperations, earlyPrdConfirmation } from '../lib/control-state/run-operations.js';
import { validateEarlyPrdHistory } from '../lib/control-state/run-revision-history.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { revisionHistoryPrefix } from '../lib/control-state/run-source-revisions.js';
import { intentStages, archiveStages, commitStages, beforeIntent, beforeRunCommit } from './fixtures/transaction-checkpoints.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-early-prd-command-')), seed = mkdtempSync(join(tmpdir(), 'agdf-early-prd-seed-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'early-prd-command', process.env, { typedApprovals: true });
  cpSync(join(root, '.agdf'), join(seed, 'control'), { recursive: true });
  const reset = () => { rmSync(join(root, '.agdf'), { recursive: true }); cpSync(join(seed, 'control'), join(root, '.agdf'), { recursive: true }); };
  const service = createCoreServices().command, target = resolveControlCommandTarget(root).target_id;
  const prepare = () => {
    const input = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
      target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'prd_revision.reopen', payload: { prd: { path: f.prefix + 'PRD.md', digest: artefactFileDigest(root, f.prefix + 'PRD.md') }, confirmation: '' } } };
    input.command.payload.confirmation = earlyPrdConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.prd.digest);
    return input;
  };
  const input = prepare(), original = readFileSync(f.state, 'utf8'), prd = readFileSync(f.file('PRD.md'));
  assert.equal(service('agdf_revise', { ...input, command: { ...input.command, payload: { ...input.command.payload, confirmation: 'The host allowed the tool.' } } }).reason, 'revision_confirmation_required');
  assert.equal(readFileSync(f.state, 'utf8'), original);
  const result = service('agdf_revise', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  const receipt = readRunOperations(readFileSync(f.state, 'utf8')).receipts[0];
  assert.equal(receipt.kind, 'prd_revision.reopen'); assert.equal(validateEarlyPrdHistory(root, receipt), true);
  assert.equal(readRunState(root, { runId: f.runId }).approvals.get('UR').status, 'approved');
  assert.equal(readRunState(root, { runId: f.runId }).approvals.get('PRD').status, 'missing');
  assert.deepEqual(readFileSync(f.file('PRD.md')), prd);
  assert.equal(service('agdf_revise', input).outcome, 'already_applied');
  assert.equal(service('agdf_revise', { ...input, presentation_language: 'de' }).reason, 'operation_payload_conflict');
  assert.equal(service('agdf_revise', prepare()).reason, 'prd_revision_boundary_invalid');
  for (const stage of [...intentStages, ...archiveStages, ...commitStages]) {
    reset(); const request = prepare();
    const program = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
      createRunCommandService({checkpoint(point){if(point===process.argv[2])process.exit(71)}})('agdf_revise',JSON.parse(process.argv[1]));`;
    const killed = spawnSync(process.execPath, ['--input-type=module', '-e', program, JSON.stringify(request), stage]);
    assert.equal(killed.status, 71, killed.stderr.toString());
    if (!beforeIntent(stage) && stage !== 'retired') {
      const pending = readPendingRunStepJournal(root, f.runId);
      assert.equal(pending.schema_version, 3); assert.equal(pending.kind, 'prd_revision.reopen');
      const recover = { ...request, expected_revision_id: f.revision(), command: { kind: 'operation.recover', payload: { original_kind: 'prd_revision.reopen', pending_digest: digest(canonicalJson(pending)), recovery_revision_id: f.revision() } } };
      if (stage === 'archive_temp_written') {
        const temp = join(root, revisionHistoryPrefix(f.runId, request.operation_id).slice(0, -1) + '.pending', 'files', pending.archive.files[0] + '.tmp-' + request.operation_id);
        const captured = readFileSync(temp), rawRun = readFileSync(f.state, 'utf8');
        writeFileSync(temp, 'Foreign replacement bytes');
        assert.notEqual(service('agdf_revise', recover).outcome, 'accepted');
        assert.equal(readFileSync(temp, 'utf8'), 'Foreign replacement bytes'); assert.equal(readFileSync(f.state, 'utf8'), rawRun);
        assert.deepEqual(readPendingRunStepJournal(root, f.runId), pending, 'Interference cannot be deleted or silently repaired.');
        writeFileSync(temp, captured);
      }
      const recovery = service('agdf_revise', recover); assert.equal(recovery.outcome, 'accepted', stage + ': ' + JSON.stringify(recovery));
    }
    assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
    assert.equal(existsSync(join(root, `.agdf/control/runs/${f.runId}/RUN_STEP_PENDING.json`)), false);
    if (beforeRunCommit(stage)) assert.equal(readFileSync(f.state, 'utf8'), original, stage);
    const replay = service('agdf_revise', request); assert.equal(replay.outcome, beforeRunCommit(stage) ? 'accepted' : 'already_applied', stage + ': ' + JSON.stringify(replay));
  }
  console.log('Existing early PRD boundary, concrete confirmation, immutable exact archive, replay/conflict and v3 pre/post-commit process recovery passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(seed, { recursive: true, force: true }); }
