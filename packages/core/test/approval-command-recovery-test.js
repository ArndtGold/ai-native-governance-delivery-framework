import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { readApprovalOperations } from '../lib/control-state/approval-operations.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { intentStages, commitStages, beforeRunCommit } from './fixtures/transaction-checkpoints.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-approval-recovery-')), seed = root + '-seed';
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createSdDefinitionTestRun(root, cli, 'approval-recovery', process.env, { typedApprovals: true });
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const service = createCoreServices().command;
  const envelope = { schema_version: '1', presentation_language: 'en', working_directory: root,
    target_source: 'explicit_target', primary_target: root, target_id: resolveControlCommandTarget(root).target_id,
    run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' };
  const prepared = service('agdf_prepare', { ...envelope, command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } });
  assert.equal(prepared.outcome, 'accepted');
  const input = { ...envelope, expected_revision_id: f.revision(), operation_id: randomUUID(), command: { kind: 'approval.record',
    payload: { gate: 'SD', presentation_id: prepared.family_result.presentation_id, response: 'Approval: SD' } } };
  cpSync(join(root, '.agdf'), seed, { recursive: true });
  const original = readFileSync(f.state, 'utf8'), initialReceipts = readApprovalOperations(original).receipts.length;
  for (const point of [...intentStages, ...commitStages]) {
    rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true });
    const code = `import {executeApprovalCommand} from ${JSON.stringify(new URL('../lib/control-state/approval-command.js', import.meta.url).href)};
      import {evaluateGateCheck} from ${JSON.stringify(new URL('../lib/control-evaluation/gate-check.js', import.meta.url).href)};
      import {runCommandRequestDigest} from ${JSON.stringify(new URL('../lib/control-state/run-command-contract.js', import.meta.url).href)};
      const input=JSON.parse(process.argv[1]),payload=input.command.payload;
      const result=executeApprovalCommand(input.primary_target,{schema_version:'1',action:'record_gate_approval',target_id:input.target_id,
        run_id:input.run_id,expected_revision_id:input.expected_revision_id,operation_id:input.operation_id,assurance:input.assurance,...payload},
        {evaluateGateCheck,packageVersion:'0.14.5',commandContext:{request_digest:runCommandRequestDigest(input)},
          afterWrite(stage){if(stage===process.argv[2])process.exit(71)}}); console.log(JSON.stringify(result));`;
    const stopped = spawnSync(process.execPath, ['--input-type=module', '-e', code, JSON.stringify(input), point], { encoding: 'utf8' });
    assert.equal(stopped.status, 71, point + ': ' + stopped.stderr + stopped.stdout);
    const committed = !beforeRunCommit(point);
    const retry = service('agdf_approve', input);
    assert.equal(retry.outcome, committed ? 'already_applied' : 'accepted', point + ': ' + JSON.stringify(retry));
    assert.equal(retry.receipt.operation_id, input.operation_id);
    const current = readFileSync(f.state, 'utf8');
    assert.equal(runSealState(root, current).status, 'valid');
    assert.equal(readApprovalOperations(current).receipts.length, initialReceipts + 1);
    assert.equal(existsSync(join(root, `.agdf/control/runs/${f.runId}/RUN_STEP_PENDING.json`)), false);
    assert.equal(service('agdf_approve', input).outcome, 'already_applied'); assert.equal(readFileSync(f.state, 'utf8'), current);
    assert.equal(service('agdf_approve', { ...input, presentation_language: 'de' }).reason, 'operation_payload_conflict');
    assert.equal(readFileSync(f.state, 'utf8'), current);
  }
  console.log('Approval v3 journal: 22 actual child-process interruption points, identical original-command recovery/replay, one receipt and changed-envelope rejection passed; no power-loss claim.');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(seed, { recursive: true, force: true }); }
