import { initializeCurrentControl } from './fixtures/current-init.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { recoverPendingRunStep, readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { artefactFileDigest, runSealState } from '../lib/control-state/run-seal.js';
import { readRunOperations } from '../lib/control-state/run-operations.js';
import { resolveControlCommandTarget, digest, canonicalJson } from '../lib/control-state/approval-command-contract.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { initializeCanonicalControl } from '../lib/control-state/canonical-initialization.js';

for (const layout of ['run-folders-v1']) {
const temporary = mkdtempSync(join(tmpdir(), 'agdf-v3-recovery-')), root = join(temporary, 'project');
const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
try {
  initializeCurrentControl(root);
  const backlogPath = join(root, '.agdf/control/MASTER_BACKLOG.md'), legacyBacklog = '# Legacy planning\nExisting reference.\n';
  writeFileSync(backlogPath, legacyBacklog);

  const f = createLateSourceRevisionTestRun(root, cli), seed = join(temporary, 'seed');
  const source = { path: f.prefix + 'CD_CANDIDATE.md', digest: null }; writeFileSync(join(root, source.path), '# CD+Tests\n- decision: pass\nSynthetic executed checks.\n'); source.digest = artefactFileDigest(root, source.path);
  const input = {schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:resolveControlCommandTarget(root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),command:{kind:'step.record',payload:{step:'internal',internal_step:'CD+Tests',source,decision:'pass'}}};
  const context={operation_id:input.operation_id};
  cpSync(join(root, '.agdf'), seed, { recursive: true });
  const reset = () => { rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true }); };
  const worker = stage => {
    const code = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
    const result=createRunCommandService({checkpoint(point){if(point===process.argv[2])process.exit(71)}})('agdf_record',JSON.parse(process.argv[1]));console.log(JSON.stringify(result));`;
    return spawnSync(process.execPath, ['--input-type=module', '-e', code, JSON.stringify(input), stage], { encoding:'utf8' });
  };
  const pending = join(root, `.agdf/control/runs/${f.runId}/control/RUN_STEP_PENDING.json`), output = join(root, f.prefix + 'CD_TESTS.md');
  const atomicStages = ['temp_opened', 'temp_written', 'after_file_sync', 'before_rename', 'after_rename', 'after_directory_sync'];
  const stages = [...atomicStages.map(stage => 'intent_' + stage), 'intent', ...atomicStages.map(stage => 'output_' + stage), 'output',
    ...atomicStages.map(stage => 'run_' + stage), 'run', 'retired'];
  for (const stage of stages) {
    reset(); const old = readFileSync(f.state, 'utf8'), result = worker(stage); assert.equal(result.status, 71, stage + ': ' + result.stderr + result.stdout);
    const beforeIntent = ['intent_temp_opened', 'intent_temp_written', 'intent_after_file_sync', 'intent_before_rename'].includes(stage);
    if (stage !== 'retired' && !beforeIntent) assert.equal(readPendingRunStepJournal(root, f.runId).input_resolution.record_version, 7);
    const recovery = recoverPendingRunStep(root, f.runId);
    const beforeCommit = stage.startsWith('intent') || stage.startsWith('output') || ['run_temp_opened', 'run_temp_written', 'run_after_file_sync', 'run_before_rename'].includes(stage);
    assert.equal(recovery.status, stage === 'retired' || beforeIntent ? 'none' : beforeCommit ? 'rolled_back' : 'completed', stage);
    const state = readFileSync(f.state, 'utf8'); assert.equal(runSealState(root, state).status, 'valid', stage);
    if (beforeCommit) { assert.equal(state, old); assert.equal(existsSync(output), false); }
    else {
      const receipt = readRunOperations(state).receipts.find(r => r.operation_id === context.operation_id); assert.ok(receipt, stage);
      assert.equal(createRunCommandService()('agdf_record', input).outcome, 'already_applied');
      assert.equal(readFileSync(f.state, 'utf8'), state); assert.equal(existsSync(output), true);
    }
    assert.equal(existsSync(pending), false, stage);
    assert.equal(readFileSync(backlogPath, 'utf8'), legacyBacklog, stage);
  }
  reset(); assert.equal(worker('output_after_rename').status, 71); writeFileSync(output, '# Foreign interference\n');
  const oldRun = readFileSync(f.state, 'utf8'), oldPending = readFileSync(pending, 'utf8');
  assert.throws(() => recoverPendingRunStep(root, f.runId), /AGDF_RUN_STEP_RECOVERY_REQUIRED/);
  assert.equal(readFileSync(f.state, 'utf8'), oldRun); assert.equal(readFileSync(output, 'utf8'), '# Foreign interference\n'); assert.equal(readFileSync(pending, 'utf8'), oldPending);
  reset(); assert.equal(worker('intent').status, 71); const invalid = JSON.parse(readFileSync(pending, 'utf8')); invalid.unknown_output_authority = true; writeFileSync(pending, JSON.stringify(invalid));
  assert.throws(() => recoverPendingRunStep(root, f.runId), /AGDF_RUN_STEP_RECOVERY_REQUIRED/); assert.equal(existsSync(output), false);
  reset(); const negative = createRunCommandService()('agdf_record', { ...input,command:{kind:'step.record',payload:{...input.command.payload,internal_step:'CR',decision:'not_applicable'}} });
  assert.equal(negative.outcome, 'rejected'); assert.equal(existsSync(pending), false);
  console.log('Strict current owned-output process interruption, pre-commit rollback, post-commit forward recovery, receipt replay and interference rejection passed (no power-loss claim).');
} finally { rmSync(temporary, { recursive: true, force: true }); }
}
