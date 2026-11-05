// Failures while a write tool prepares its dispatch (material grants) are reported as not
// dispatched with their typed reason, through the real owned MCP tool paths, and change nothing.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';
import { pendingRunStepPath } from '../../core/lib/control-state/run-step-pending.js';
import { preDispatchFailure } from '../../cli/lib/mcp-dispatch-runtime.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';

// The pure mapping: classified reasons pass, Core aliases use existing codes, anything else is
// an unclassified but still non-dispatched failure; owner-typed facts keep their details.
const facts = error => preDispatchFailure(error).facts;
assert.deepEqual(facts(Error('material_transfer_expired')), { code: 'material_transfer_expired', dispatch: 'not_dispatched' });
assert.deepEqual(facts(Error('run_step_recovery_required')), { code: 'recovery_required', dispatch: 'not_dispatched' });
assert.deepEqual(facts(Error('AGDF_PLANNED_RECOVERY_REQUIRED')), { code: 'recovery_required', dispatch: 'not_dispatched' });
assert.deepEqual(facts(Error('AGDF_PLANNED_SOURCE_STALE')), { code: 'planning_source_stale', dispatch: 'not_dispatched' });
assert.deepEqual(facts(Error('run_state_invalid')), { code: 'invalid_run', dispatch: 'not_dispatched' });
assert.deepEqual(facts(Error('AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED')), { code: 'control_layout_unsupported', dispatch: 'not_dispatched' });
assert.deepEqual(facts(new TypeError("Cannot read properties of undefined (reading 'x')")), { code: 'dispatch_worker_failed', dispatch: 'not_dispatched' });
const typed = Object.assign(Error('configuration_invalid'), { facts: { code: 'configuration_invalid', dispatch: 'unknown', field: 'working_directory' }, diagnostic: { kind: 'project' } });
const passed = preDispatchFailure(typed);
assert.equal(passed, typed);
assert.deepEqual(passed.facts, { code: 'configuration_invalid', dispatch: 'not_dispatched', field: 'working_directory' });
assert.deepEqual(passed.diagnostic, { kind: 'project' });

function controlDigest(root) {
  const hash = createHash('sha256');
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      hash.update(`${entry.isDirectory() ? 'd' : 'f'}:${relative(root, path)}\0`);
      if (entry.isDirectory()) walk(path); else hash.update(readFileSync(path)).update('\0');
    }
  };
  walk(join(root, '.agdf', 'control'));
  return hash.digest('hex');
}

function notDispatched(reply, reason) {
  assert.equal(reply.isError, true, JSON.stringify(reply));
  const result = reply.structuredContent;
  assert.equal(result.outcome, 'rejected', JSON.stringify(result));
  assert.equal(result.reason, reason, JSON.stringify(result));
  // A not_dispatched result never enters the generation's unknown-operation set.
  assert.equal(result.dispatch, 'not_dispatched', JSON.stringify(result));
  assert.equal(result.recovery, 'No command was dispatched by this attempt.');
  assert.match(reply.content[1].text, new RegExp(reason));
}

const variants = [
  { label: 'facade legacy', modern: false, options: {} },
  { label: 'facade modern', modern: true, options: {} },
  { label: 'plugin generation', modern: true, options: { pluginSourceRoot: process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT ?? pluginRoot } },
];
for (const { label, modern, options } of variants) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [], ...options }), root = fixture.governanceTarget;
  try {
    await withStdioClient({ ...fixture, modern }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic consumed material');
      const content = '# UR: Consumed material\n## Problem\nA bounded result is unavailable.\n## Goal\nDeliver that bounded result.\n## Scope\nOnly this fixture.\n';
      const reference = await h.stage('UR', content);
      const unused = await h.stage('UR', `${content}\n## Non-Goals\nNothing else.\n`);
      const staged = h.bound();
      const payload = { step: 'ur', title: 'Synthetic consumed material', source: reference };
      await h.invoke('agdf_record', 'step.record', payload);
      const recorded = controlDigest(root);

      // The consumed reference with the current revision: the material store no longer grants it.
      notDispatched(await client.callTool({ name: 'agdf_record', arguments: { ...h.bound(), command: { kind: 'step.record', payload } } }),
        'material_transfer_expired');
      // The same reference with the revision it was staged under: the binding is stale.
      notDispatched(await client.callTool({ name: 'agdf_record', arguments: { ...staged, operation_id: randomUUID(), command: { kind: 'step.record', payload } } }),
        'stale_revision');
      // The same failure on another granted write group.
      notDispatched(await client.callTool({ name: 'agdf_revise', arguments: { ...h.bound(),
        command: { kind: 'source_revision.preview', payload: { source_gate: 'UR', proposal: reference } } } }), 'material_transfer_expired');
      assert.equal(controlDigest(root), recorded, 'rejected preparations leave the control folder byte-identical');

      // Material staged for this Run is not granted to another Run of the same target.
      const other = await client.callTool({ name: 'agdf_run', arguments: { presentation_language: 'en', working_directory: root, primary_target: root,
        target_source: 'explicit_target', schema_version: '1', target_id: h.target, operation_id: randomUUID(), assurance: 'cooperative_local',
        command: { kind: 'run.create', payload: { title: 'Synthetic second run' } } } });
      assert.equal(other.structuredContent.outcome, 'accepted', JSON.stringify(other));
      const second = { ...h.bound(), run_id: other.structuredContent.binding.run_id, expected_revision_id: other.structuredContent.current.revision_id };
      const beforeMismatch = controlDigest(root);
      notDispatched(await client.callTool({ name: 'agdf_record', arguments: { ...second,
        command: { kind: 'step.record', payload: { ...payload, source: unused } } } }), 'material_binding_mismatch');
      assert.equal(controlDigest(root), beforeMismatch);

      // A pending run step is already refused by input resolution, before dispatch preparation;
      // it stays non-dispatched too (the recovery alias of preparation is asserted directly above).
      const pending = pendingRunStepPath(root, h.runId);
      mkdirSync(dirname(pending), { recursive: true }); writeFileSync(pending, '{}\n');
      const beforeRecovery = controlDigest(root);
      notDispatched(await client.callTool({ name: 'agdf_record', arguments: { ...h.bound(),
        command: { kind: 'step.record', payload: { ...payload, source: unused } } } }), 'original_operation_unconfirmed');
      assert.equal(controlDigest(root), beforeRecovery);
      rmSync(pending);

      // An accepted write with material staged under the current binding is unaffected by the guard.
      const fresh = await h.stage('UR', `${content}\n## Non-Goals\nNothing else at all.\n`);
      const replaced = await h.invoke('agdf_revise', 'ur_draft.replace', { title: 'Synthetic consumed material', source: fresh });
      assert.equal(replaced.outcome, 'accepted', JSON.stringify(replaced));
    });
    console.log(`Pre-dispatch failures are rejected and not dispatched (${label}).`);
  } finally { fixture.dispose(); }
}
