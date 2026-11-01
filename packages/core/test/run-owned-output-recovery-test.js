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

const temporary = mkdtempSync(join(tmpdir(), 'agdf-v3-recovery-')), root = join(temporary, 'project');
const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
try {
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const backlogPath = join(root, '.agdf/control/MASTER_BACKLOG.md'), legacyBacklog = '# Legacy planning\nExisting reference.\n';
  writeFileSync(backlogPath, legacyBacklog);
  const f = createLateSourceRevisionTestRun(root, cli), seed = join(temporary, 'seed');
  const source = { path: f.prefix + 'CD_CANDIDATE.md', digest: null }; writeFileSync(join(root, source.path), '# CD+Tests\n- decision: pass\nSynthetic executed checks.\n'); source.digest = artefactFileDigest(root, source.path);
  const input = { runId: f.runId, revisionId: f.revision(), step: 'internal', internalStep: 'CD+Tests', sourceBinding: source, decision: 'pass' };
  const context = { kind: 'step.record', operation_id: randomUUID(), target_id: resolveControlCommandTarget(root).target_id, request_digest: digest(canonicalJson(input)) };
  cpSync(join(root, '.agdf'), seed, { recursive: true });
  const reset = () => { rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true }); };
  const worker = stage => {
    const code = `import {recordRunStep} from ${JSON.stringify(new URL('../lib/control-state/run-steps.js', import.meta.url).href)};
    import {policyForRunContent} from ${JSON.stringify(new URL('../lib/control-evaluation/run-step-policy.js', import.meta.url).href)};
    const result=recordRunStep(process.argv[1],JSON.parse(process.argv[2]),{policy:policyForRunContent,operationContext:JSON.parse(process.argv[3]),afterWrite(point){if(point===process.argv[4])process.exit(71)}}); console.log(JSON.stringify(result));`;
    return spawnSync(process.execPath, ['--input-type=module', '-e', code, root, JSON.stringify(input), JSON.stringify(context), stage], { encoding: 'utf8' });
  };
  const pending = join(root, `.agdf/control/runs/${f.runId}/RUN_STEP_PENDING.json`), output = join(root, f.prefix + 'CD_TESTS.md');
  const atomicStages = ['temp_opened', 'temp_written', 'after_file_sync', 'before_rename', 'after_rename', 'after_directory_sync'];
  const stages = [...atomicStages.map(stage => 'intent_' + stage), 'intent', ...atomicStages.map(stage => 'output_' + stage), 'output',
    ...atomicStages.map(stage => 'run_' + stage), 'run', 'retired'];
  for (const stage of stages) {
    reset(); const old = readFileSync(f.state, 'utf8'), result = worker(stage); assert.equal(result.status, 71, stage + ': ' + result.stderr + result.stdout);
    const beforeIntent = ['intent_temp_opened', 'intent_temp_written', 'intent_after_file_sync', 'intent_before_rename'].includes(stage);
    if (stage !== 'retired' && !beforeIntent) {
      const journal = readPendingRunStepJournal(root, f.runId);
      assert.equal(journal.schema_version, 3); assert.equal(journal.backlog, null);
    }
    const recovery = recoverPendingRunStep(root, f.runId);
    const beforeCommit = stage.startsWith('intent') || stage.startsWith('output') || ['run_temp_opened', 'run_temp_written', 'run_after_file_sync', 'run_before_rename'].includes(stage);
    assert.equal(recovery.status, stage === 'retired' || beforeIntent ? 'none' : beforeCommit ? 'rolled_back' : 'completed', stage);
    const state = readFileSync(f.state, 'utf8'); assert.equal(runSealState(root, state).status, 'valid', stage);
    if (beforeCommit) { assert.equal(state, old); assert.equal(existsSync(output), false); }
    else {
      const receipt = readRunOperations(state).receipts.find(r => r.operation_id === context.operation_id); assert.ok(receipt, stage);
      assert.equal(recordRunStep(root, input, { policy: policyForRunContent, operationContext: context }).outcome, 'already_applied');
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
  reset(); const negative = recordRunStep(root, { ...input, internalStep: 'CR', decision: 'not_applicable' }, { policy: policyForRunContent, operationContext: context });
  assert.equal(negative.outcome, 'rejected'); assert.equal(existsSync(pending), false);
  console.log('Strict v3 owned-output process interruption, pre-commit rollback, post-commit forward recovery, receipt replay and interference rejection passed (no power-loss claim).');
} finally { rmSync(temporary, { recursive: true, force: true }); }
