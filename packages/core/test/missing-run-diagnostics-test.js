import assert from 'node:assert/strict';
import test from 'node:test';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { inspectRunOperation } from '../lib/control-state/run-operation-status.js';
import { inspectRunInputResolution } from '../lib/control-state/run-input-resolution.js';
import { resolveMcpInput } from '../lib/mcp-input-resolution.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION } from '../lib/control-inspect/contract.js';
import { resources } from '../lib/resources/context.js';

test('deleted Run is a missing source, not stale revision or runtime waiting', t => {
  const f = currentFixture(t), run = currentRun(f), binding = run.binding();
  const operation_id = run.created.operation_id;
  rmSync(join(f.root, '.agdf/control/runs', run.id), { recursive: true });
  const observed = inspectRunOperation(f.root, { runId: run.id, operationId: operation_id, targetId: f.base.target_id });
  assert.equal(observed.reason, 'run_missing'); assert.equal(observed.available, false);
  assert.equal(observed.source_path, `.agdf/control/runs/${run.id}/RUN_STATE.md`);
  const read = { operation: 'operation-status', module: operation_id, run_id: run.id, expected_revision_id: binding.expected_revision_id,
    target_source: 'explicit_target', primary_target: f.root, working_directory: f.root, presentation_language: 'en' };
  assert.doesNotThrow(() => resolveMcpInput(CONTROL_INSPECT_FUNCTION_DEFINITION, read, {
    defaults: resources.defaults, lookupOriginal: inspectRunInputResolution }));
  const material = f.store.stage(f.request('material.stage', { action: 'begin', files: [{ slot: 'EVIDENCE', bytes: 1 }] }, binding));
  assert.equal(material.reason, 'run_missing');
  assert(!existsSync(join(f.root, '.agdf/control/runs', run.id)));
});
test('missing document retains uncertainty about a previously recorded operation', t => {
  const f = currentFixture(t), run = currentRun(f);
  const r = run.step('ur', '# UR\n\nGoal: A bounded synthetic requirement.\n', { title: 'Synthetic requirement' });
  assert.equal(r.outcome, 'accepted');
  rmSync(join(f.root, '.agdf/control/runs', run.id, 'documents/UR.md'));
  const observed = inspectRunOperation(f.root, { runId: run.id, operationId: r.operation_id, targetId: f.base.target_id });
  assert.equal(observed.reason, 'document_missing'); assert.equal(observed.available, false);
  assert.match(observed.source_path, /documents\/UR\.md$/);
  assert.notEqual(observed.historical_effect, false);
});
