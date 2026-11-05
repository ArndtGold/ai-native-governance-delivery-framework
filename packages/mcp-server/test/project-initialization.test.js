import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createOwnedRuntimeFixture, MCP_PACKAGE_VERSION } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { validateRunCommandResult } from '../../core/lib/control-state/run-command-contract.js';

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] });
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-stdio-project-')));
  try {
    execFileSync('git', ['init', '-q', root]);
    await withStdioClient({ ...fixture, modern }, async client => {
      const common = { presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
      const call = async (name, argumentsValue) => {
        const result = await client.callTool({ name, arguments: argumentsValue });
        assert.equal(result.structuredContent !== undefined, true, JSON.stringify(result));
        return result.structuredContent;
      };
      const setup = await call('agdf_dispatch', { ...common, skill_id: 'gate-check', intake: true, intake_mode: 'new', run_id: randomUUID() });
      assert.equal(setup.terminal, true);
      assert.equal(setup.control.blocking_reason, 'AGDF_CONTROL_FILE_MISSING');
      assert.equal(setup.host_action.allow_surrounding_text, false);
      assert.ok(setup.host_action.text);
      const setupRead = setup.recovery.next_calls[0];
      assert.equal(setupRead.tool, 'agdf_inspect');
      assert.equal(setupRead.arguments.module, 'agdf_project/project.initialize');
      assert.equal(setupRead.arguments.run_id, undefined);
      assert.equal(setupRead.arguments.expected_revision_id, undefined);
      assert.equal(setupRead.arguments.primary_target, root);
      const setupHelp = await call(setupRead.tool, setupRead.arguments);
      assert.equal(setupHelp.report.available, true);
      assert.equal(setupHelp.report.prepared_call.call.tool, 'agdf_project');
      assert.equal(existsSync(join(root, '.agdf')), false, 'setup card and supplied help remain read-only');
      const state = await call('agdf_inspect', { ...common, operation: 'project-state' });
      assert.equal(state.report.status, 'absent', JSON.stringify(state));
      assert.equal(state.report.repository.root, root); assert.equal(state.report.plan.version, MCP_PACKAGE_VERSION);
      assert.equal(state.report.plan.file_count, 16); assert.match(state.report.plan.plan_digest, /^sha256:[a-f0-9]{64}$/);
      assert.equal(Buffer.byteLength(JSON.stringify(state)) <= 16384, true);
      assert.equal(state.next_read, undefined, 'Bootstrap state does not embed the full setup command contract.');
      assert.equal(state.next_action.state, 'ready');
      assert.deepEqual(state.next_action.call, state.report.next_calls[0], 'The exact setup contract remains the explicit next action.');
      assert.equal(existsSync(join(root, '.agdf')), false, 'inspection cannot initialize');
      const help = await call('agdf_inspect', state.report.next_calls[0].arguments);
      assert.equal(help.report.group, 'agdf_project'); assert.equal(help.report.kind, 'project.initialize');
      assert.equal(state.report.setup.binding.target_id, help.report.binding.target_id);
      const original = { ...state.report.setup.binding, operation_id: randomUUID(),
        command: { kind: state.report.setup.kind, payload: { language: 'en' } } };
      const initialized = await call('agdf_project', original);
      assert.deepEqual(validateRunCommandResult(initialized), []);
      assert.equal(initialized.outcome, 'accepted', JSON.stringify(initialized));
      assert.equal(initialized.receipt.operation.operation_id, original.operation_id);
      assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false, 'fresh MCP setup does not create a legacy backlog');
      assert.equal(existsSync(join(root, '.agdf/control/SOT_REGISTRY.md')), true);
      assert.equal(existsSync(join(root, '.agdf/control/CONTEXT_GRAPH.md')), true);
      assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), ['.gitkeep']);
      assert.equal(Buffer.byteLength(JSON.stringify(initialized)) <= 16384, true);
      assert.equal(initialized.family_result.next_calls.length, 1, 'Run creation is the sole normal initialized-project continuation.');
      assert.equal(initialized.next_read, undefined, 'The full Run command contract stays outside the compact initialization receipt.');
      assert.equal(initialized.next_action.state, 'ready');
      assert.deepEqual(initialized.next_action.call, initialized.family_result.next_calls[0]);
      assert.equal(initialized.next_action.call.arguments.module, 'agdf_run/run.create');
      const originalStatus = initialized.family_result.recovery_only.status_call;
      assert.equal(initialized.family_result.recovery_only.authorizes, false);
      assert.equal(originalStatus.tool, 'agdf_inspect');
      assert.equal(originalStatus.arguments.operation, 'operation-status');
      assert.equal(originalStatus.arguments.module, `project.initialize/${original.operation_id}`);
      assert.equal(originalStatus.arguments.run_id, undefined); assert.equal(originalStatus.arguments.expected_revision_id, undefined);
      const observed = await call(originalStatus.tool, originalStatus.arguments);
      assert.equal(observed.report.status, 'recorded', JSON.stringify(observed));
      const replay = await call('agdf_project', original);
      assert.equal(replay.outcome, 'already_applied'); assert.deepEqual(replay.receipt, initialized.receipt);
      assert.deepEqual(replay.family_result.next_calls, initialized.family_result.next_calls);
      assert.deepEqual(replay.family_result.recovery_only, initialized.family_result.recovery_only);
      assert.deepEqual(replay.next_action.call, initialized.next_action.call);
      const creationHelp = await call('agdf_inspect', initialized.family_result.next_calls[0].arguments);
      assert.equal(creationHelp.report.kind, 'run.create');
      const created = await call('agdf_run', { ...common, schema_version: '1', assurance: 'cooperative_local',
        operation_id: randomUUID(), target_id: creationHelp.report.binding.target_id,
        command: { kind: 'run.create', payload: { title: 'Synthetic MCP setup followed by an unapproved Run' } } });
      assert.equal(created.outcome, 'accepted', JSON.stringify(created));
      assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false, 'Run creation does not recreate the legacy backlog');
      assert.equal(readdirSync(join(root, '.agdf/control/runs')).filter(p => p.startsWith('run-')).length, 1);
      assert.equal(readFileSync(join(root, '.agdf/control/runs', created.binding.run_id, 'RUN_STATE.md'), 'utf8').includes('Approval: UR; presentation'), false);
    });
  } finally { fixture.dispose(); rmSync(root, { recursive: true, force: true }); }
}
console.log('Project initialization: actual legacy/modern STDIO discovery, setup, original status/replay and Run creation passed (synthetic, not native).');
