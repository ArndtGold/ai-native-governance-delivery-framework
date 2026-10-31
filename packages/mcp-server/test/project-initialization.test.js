import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
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
      const state = await call('agdf_inspect', { ...common, operation: 'project-state' });
      assert.equal(state.report.status, 'absent', JSON.stringify(state));
      assert.equal(state.report.repository.root, root); assert.equal(state.report.plan.version, '0.20.2');
      assert.equal(state.report.plan.file_count, 14); assert.match(state.report.plan.plan_digest, /^sha256:[a-f0-9]{64}$/);
      assert.equal(Buffer.byteLength(JSON.stringify(state)) <= 16384, true);
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
      assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
      assert.equal(Buffer.byteLength(JSON.stringify(initialized)) <= 16384, true);
      const observed = await call('agdf_inspect', { ...common, operation: 'operation-status', module: `project.initialize/${original.operation_id}` });
      assert.equal(observed.report.status, 'recorded', JSON.stringify(observed));
      const replay = await call('agdf_project', original);
      assert.equal(replay.outcome, 'already_applied'); assert.deepEqual(replay.receipt, initialized.receipt);
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
