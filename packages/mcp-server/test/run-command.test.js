import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { EventEmitter } from 'node:events';
import { createMcpDispatchRuntime, configuredMcpCommandGroups } from '../../cli/lib/mcp-dispatch-runtime.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../../core/lib/control-state/run-seal.js';
import { RUN_COMMAND_GROUPS, commandGroupDefinition } from '../../core/lib/control-state/run-command-contract.js';
import { createTestRuntime } from './runtime-fixture.js';
import { withStdioClient } from './helpers.js';
import { OPERATION_CONTRACT_MODULES, CONTROL_INSPECT_FUNCTION_DEFINITION } from '../../core/lib/control-inspect/contract.js';
import { createWorkerDispatchExecutor } from '../src/worker.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';

const groups = ['agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout'];
assert.deepEqual(Object.keys(RUN_COMMAND_GROUPS), groups);
assert.deepEqual(configuredMcpCommandGroups({}), groups);
assert.deepEqual(configuredMcpCommandGroups({ AGDF_MCP_COMMAND_GROUPS: '' }), []);
for (const value of ['agdf_dispatch', 'agdf_approve,agdf_approve', 'agdf_record, agdf_approve']) assert.throws(() => configuredMcpCommandGroups({ AGDF_MCP_COMMAND_GROUPS: value }));
const initialRuntime = createTestRuntime();
const disabled = createMcpDispatchRuntime({ surface: 'codex', commandGroups: [], inspected: {
  expectedVersion: initialRuntime.trustedContext.expectedVersion, skillSet: initialRuntime.trustedContext.skillSet,
  interactionLocales: initialRuntime.trustedContext.interactionLocales, provenanceStatus: 'matched', runtimeEvidence: { provenance_status: 'matched' },
} });
assert.deepEqual(disabled.tools.map(tool => tool.name), ['agdf_dispatch', 'agdf_inspect']);
assert.equal(disabled.tool('agdf_approve'), null);

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture(), root = fixture.governanceTarget;
  try {
    const cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
    const f = createLateSourceRevisionTestRun(root, cli), path = f.prefix + 'MCP_CD_CANDIDATE.md';
    writeFileSync(join(root, path), '# CD+Tests\n- decision: pass\nSynthetic exact approved work checked.\n');
    const input = { schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
      target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'CD+Tests', decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } };
    await withStdioClient({ ...fixture, modern }, async client => {
      const { tools } = await client.listTools();
      assert.deepEqual(tools.map(tool => tool.name), ['agdf_dispatch', 'agdf_inspect', ...groups]);
      assert.equal(tools.find(tool => tool.name === 'agdf_inspect').description, CONTROL_INSPECT_FUNCTION_DEFINITION.description);
      for (const group of groups) {
        const tool = tools.find(tool => tool.name === group), definition = commandGroupDefinition(group);
        assert.deepEqual(tool.inputSchema, definition.inputSchema); assert.deepEqual(tool.annotations, definition.annotations);
      }
      const before = readFileSync(f.state, 'utf8');
      const recoveryGroups = { agdf_record: ['step.record', 'artefact.record', 'presentation_decision.record'], agdf_revise: ['prd_revision.reopen'], agdf_closeout: ['closeout.record'] };
      for (const [group, allowed] of Object.entries(recoveryGroups)) {
        const recovery = tools.find(tool => tool.name === group).inputSchema.properties.command.oneOf.find(row => row.properties.kind.const === 'operation.recover');
        assert.deepEqual(recovery.properties.payload.properties.original_kind.enum, allowed);
        for (const kind of Object.values(recoveryGroups).flat().filter(kind => !allowed.includes(kind))) {
          const denied = await client.callTool({ name: group, arguments: { ...input, command: { kind: 'operation.recover', payload: {
            original_kind: kind, pending_digest: 'sha256:' + 'd'.repeat(64), recovery_revision_id: input.expected_revision_id } } } });
          assert.equal(denied.isError, true, `${group} must not describe or execute ${kind} recovery`);
        }
      }
      const inspectBinding = { presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
        run_id: f.runId, expected_revision_id: f.revision() };
      for (const group of groups) for (const kind of RUN_COMMAND_GROUPS[group]) {
        const description = await client.callTool({ name: 'agdf_inspect', arguments: { ...inspectBinding, operation: 'operation-contract', module: `${group}/${kind}`, ...(kind === 'artefact.record' ? { gate: 'TP' } : {}) } });
        const report = description.structuredContent.report;
        assert.equal(report.available, true, JSON.stringify(description));
        assert.equal(report.authorizes, false); assert.equal(report.binding.target_id, input.target_id);
        assert.equal(report.current.current_gate, 'CD+Tests');
      }
      const staleDescription = await client.callTool({ name: 'agdf_inspect', arguments: { ...inspectBinding, expected_revision_id: randomUUID(), operation: 'operation-contract', module: 'agdf_record/step.record' } });
      assert.equal(staleDescription.structuredContent.report.available, false);
      assert.equal(staleDescription.structuredContent.report.reason, 'operation_binding_stale_or_invalid');
      for (const module of ['prepare/presentation.prepare', 'agdf_record/approval.record', 'agdf_approve/unknown', 'shell/execute']) {
        const invalid = await client.callTool({ name: 'agdf_inspect', arguments: { ...inspectBinding, operation: 'operation-contract', module } });
        assert.equal(invalid.structuredContent.outcome, 'invalid_input', JSON.stringify(invalid));
        assert.equal(invalid.structuredContent.report, null);
        assert.equal(invalid.structuredContent.diagnostics[0].field, 'module');
        assert.deepEqual(invalid.structuredContent.diagnostics[0].allowed_values, [...OPERATION_CONTRACT_MODULES]);
        assert.match(invalid.structuredContent.recovery.action, /agdf_prepare\/presentation\.prepare/);
      }
      for (const group of groups.filter(group => group !== 'agdf_record')) {
        const rejected = await client.callTool({ name: group, arguments: input });
        assert.equal(rejected.isError, true, group);
      }
      for (const fields of [{ confirmed: true }, { origin: 'user_click' }, { shell: 'rm' }, { run_text: before }]) {
        const rejected = await client.callTool({ name: 'agdf_record', arguments: { ...input, ...fields } });
        assert.equal(rejected.isError, true);
      }
      assert.equal(readFileSync(f.state, 'utf8'), before);
      const result = await client.callTool({ name: 'agdf_record', arguments: input });
      assert.equal(result.structuredContent.outcome, 'accepted', JSON.stringify(result));
      assert.equal(result.structuredContent.receipt.operation_id, input.operation_id);
      assert.equal(result.structuredContent.authorizes, false);
      const recorded = readFileSync(f.state, 'utf8');
      assert.equal((await client.callTool({ name: 'agdf_record', arguments: input })).structuredContent.outcome, 'already_applied');
      assert.equal(readFileSync(f.state, 'utf8'), recorded);
      const changed = { ...input, command: { ...input.command, payload: { ...input.command.payload, covers: 'changed intent' } } };
      assert.equal((await client.callTool({ name: 'agdf_record', arguments: changed })).structuredContent.reason, 'operation_payload_conflict');
      const observe = { operation: 'operation-status', module: input.operation_id, presentation_language: 'en', working_directory: root,
        target_source: 'explicit_target', primary_target: root, run_id: f.runId, expected_revision_id: f.revision() };
      const status = await client.callTool({ name: 'agdf_inspect', arguments: observe });
      assert.equal(status.structuredContent.report.status, 'recorded', JSON.stringify(status));
      assert.equal(status.structuredContent.report.operation_id, input.operation_id);
      assert.equal(readFileSync(f.state, 'utf8'), recorded, 'Inspect cannot repair or write.');
      const absent = await client.callTool({ name: 'agdf_inspect', arguments: { ...observe, module: randomUUID() } });
      assert.equal(absent.structuredContent.report.status, 'absent');
      assert.equal(absent.structuredContent.report.reason, 'absence_is_not_proof_of_non_execution');
      const failure = initialRuntime.failure('dispatch_timeout', 'agdf_record', input);
      assert.equal(failure.outcome, 'effect_unknown'); assert.equal(failure.operation_id, input.operation_id);
      assert.equal(initialRuntime.failure('dispatch_busy', 'agdf_record', input, { dispatch: 'not_dispatched' }).outcome, 'rejected');
    });
  } finally { fixture.dispose(); }
}
let captured;
class HeldWorker extends EventEmitter {
  constructor(_url, options) { super(); captured = options.workerData; }
  async terminate() {}
}
const executor = createWorkerDispatchExecutor({ surface: 'codex', expectedVersion: '0.14.5', commandGroups: ['agdf_record'], timeoutMs: 30, WorkerClass: HeldWorker });
const running = executor.execute({}, { toolName: 'agdf_record' });
await assert.rejects(executor.execute({}, { toolName: 'agdf_approve' }), error => error.dispatch === 'not_dispatched' && error.code === 'dispatch_busy');
await assert.rejects(running, error => error.dispatch === 'unknown' && error.code === 'dispatch_timeout');
assert.deepEqual(captured.commandGroups, ['agdf_record'], 'Worker cannot regain a group disabled by the serving owner.');
console.log('Actual legacy/modern STDIO group discovery, strict confinement, canonical recording/replay/status and worker uncertainty passed; native host consent remains unqualified.');
