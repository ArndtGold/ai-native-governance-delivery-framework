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
import { intentStages, commitStages, beforeRunCommit, beforeIntent } from './fixtures/transaction-checkpoints.js';
import { resolveMcpInput } from '../lib/mcp-input-resolution.js';
import { resources } from '../lib/resources/context.js';
import { commandGroupDefinition } from '../lib/control-state/run-command-schema.js';
import { inspectRunInputResolution } from '../lib/control-state/run-input-resolution.js';
import { withInputResolution } from '../lib/control-state/input-resolution.js';

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
  const { schema_version, assurance, presentation_language, ...shortened } = input;
  const selected = resolveMcpInput(commandGroupDefinition('agdf_approve'), shortened, { defaults: resources.defaults });
  for (const defaulted of [false, true]) for (const point of [...intentStages, ...commitStages]) {
    rmSync(join(root, '.agdf'), { recursive: true }); cpSync(seed, join(root, '.agdf'), { recursive: true });
    const code = `import {executeApprovalCommand} from ${JSON.stringify(new URL('../lib/control-state/approval-command.js', import.meta.url).href)};
      import {evaluateGateCheck} from ${JSON.stringify(new URL('../lib/control-evaluation/gate-check.js', import.meta.url).href)};
      import {runCommandRequestDigest} from ${JSON.stringify(new URL('../lib/control-state/run-command-contract.js', import.meta.url).href)};
      import {withInputResolution} from ${JSON.stringify(new URL('../lib/control-state/input-resolution.js', import.meta.url).href)};
      const input=JSON.parse(process.argv[1]),payload=input.command.payload;
      const result=withInputResolution(JSON.parse(process.argv[3]),()=>executeApprovalCommand(input.primary_target,{schema_version:'1',action:'record_gate_approval',target_id:input.target_id,
        run_id:input.run_id,expected_revision_id:input.expected_revision_id,operation_id:input.operation_id,assurance:input.assurance,...payload},
        {evaluateGateCheck,packageVersion:'0.14.5',commandContext:{request_digest:runCommandRequestDigest(input)},
          afterWrite(stage){if(stage===process.argv[2])process.exit(71)}})); console.log(JSON.stringify(result));`;
    const stopped = spawnSync(process.execPath, ['--input-type=module', '-e', code, JSON.stringify(defaulted ? selected.arguments : input), point,
      JSON.stringify(defaulted ? selected.resolution : null)], { encoding: 'utf8' });
    assert.equal(stopped.status, 71, point + ': ' + stopped.stderr + stopped.stdout);
    const committed = !beforeRunCommit(point);
    if (defaulted && !beforeIntent(point)) writeFileSync(join(root, '.agdf/control/config.json'), '{');
    const restored = defaulted ? resolveMcpInput(commandGroupDefinition('agdf_approve'), shortened, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution }) : null;
    if (defaulted && point === 'run') {
      const path = join(root, `.agdf/control/runs/${f.runId}/RUN_STEP_PENDING.json`), journal = readFileSync(path);
      const altered = JSON.parse(journal); altered.input_resolution.configuration.values.artifact_language = 'fr';
      writeFileSync(path, JSON.stringify(altered));
      const before = readFileSync(f.state), rejected = withInputResolution(restored.resolution, () => service('agdf_approve', restored.arguments), true);
      assert.ok(!['accepted', 'already_applied'].includes(rejected.outcome), 'committed receipt and pending journal must retain the same complete resolution');
      assert.deepEqual(readFileSync(f.state), before);
      assert.equal(JSON.parse(readFileSync(path)).input_resolution.configuration.values.artifact_language, 'fr', 'an uncertain journal is never repaired by guessing');
      writeFileSync(path, journal);
    }
    const retry = restored ? withInputResolution(restored.resolution, () => service('agdf_approve', restored.arguments), restored.original) : service('agdf_approve', input);
    assert.equal(retry.outcome, committed ? 'already_applied' : 'accepted', point + ': ' + JSON.stringify(retry));
    assert.equal(retry.receipt.operation_id, input.operation_id);
    const current = readFileSync(f.state, 'utf8');
    assert.equal(runSealState(root, current).status, 'valid');
    assert.equal(readApprovalOperations(current).receipts.length, initialReceipts + 1);
    assert.equal(existsSync(join(root, `.agdf/control/runs/${f.runId}/RUN_STEP_PENDING.json`)), false);
    if (defaulted) {
      assert.equal(retry.receipt.input_resolution.effective_digest, selected.resolution.effective_digest);
      assert.equal(withInputResolution(restored.resolution, () => service('agdf_approve', restored.arguments), true).outcome, 'already_applied');
      assert.throws(() => resolveMcpInput(commandGroupDefinition('agdf_approve'), { ...shortened, presentation_language: 'de' }, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution }), /operation_payload_conflict/);
    } else {
      assert.equal(service('agdf_approve', input).outcome, 'already_applied');
      assert.equal(service('agdf_approve', { ...input, presentation_language: 'de' }).reason, 'operation_payload_conflict');
    }
    assert.equal(readFileSync(f.state, 'utf8'), current);
  }
  console.log('Approval journal: 22 legacy and 22 defaulted child-process interruptions, original resolution across corrupt config after intent, one receipt and conflicting-envelope rejection passed; no power-loss claim.');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(seed, { recursive: true, force: true }); }
