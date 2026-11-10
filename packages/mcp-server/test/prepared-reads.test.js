// Actual SDK/STDIO regressions for the failed native read envelopes. Synthetic
// disposable inputs only; this does not claim host loading or human acceptance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';

for (const modern of [false, true]) {
 const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
 try { await withStdioClient({ ...fixture, modern }, async client => {
  const h = await createMcpDeliveryHarness(client, root);
  const { operation_id, schema_version, assurance, ...context } = h.bound();
  const request = { ...context, operation: 'authoring-inputs', bundle: true };
  const page = await h.call('agdf_inspect', request);
  const help = page.report.material_call.content_contract.larger_source_call;
  assert.equal(help.operation.kind, 'inspect.read');
  assert.equal(help.operation.read_only, true);
  assert.deepEqual(Object.keys(help.arguments).sort(), ['inputs', 'prepared_call_id']);
  assert.deepEqual(help.arguments.inputs, {});
  const originalHelp = help.recovery_only.original_call;
  assert.equal(originalHelp.arguments.primary_target, root);
  assert.equal(originalHelp.arguments.target_source, 'explicit_target');
  assert.equal(originalHelp.arguments.run_id, h.runId);
  assert.equal(originalHelp.arguments.expected_revision_id, context.expected_revision_id);
  assert.equal((await h.call(help.tool, help.arguments)).report.kind, 'material.stage');

  const malformed = { ...request }; delete malformed.primary_target; delete malformed.target_source;
  const before = readFileSync(h.state, 'utf8');
  for (let attempt = 0; attempt < 2; attempt++) {
   const rejected = await client.callTool({ name: 'agdf_inspect', arguments: malformed });
   assert.equal(rejected.isError, true, 'Repeated malformed Raw reads remain rejected; no target is inferred.');
   assert.equal(rejected.structuredContent, undefined);
   assert.match(JSON.stringify(rejected), /primary_target/u);
   assert.match(JSON.stringify(rejected), /target_source/u);
   assert.equal(readFileSync(h.state, 'utf8'), before);
  }

  const put = page.next_action.call; put.arguments.inputs = { content: clarifiedUr };
  const staged = await h.call(put.tool, put.arguments);
  const record = staged.next_action.call; record.arguments.inputs = { title: 'Bound read regression' };
  const recorded = await h.call(record.tool, record.arguments);
  assert.equal(recorded.outcome, 'accepted');
  const status = recorded.operation_status_call;
  assert.equal(status.operation.operation, 'operation-status');
  assert.equal(status.operation.module, recorded.operation_id);
  assert.deepEqual(status.arguments.inputs, {});
  const saved = status.recovery_only.original_call.arguments;
  assert.equal(saved.primary_target, root); assert.equal(saved.target_source, 'explicit_target');
  assert.equal(saved.run_id, h.runId); assert.equal(saved.expected_revision_id, context.expected_revision_id);
  const canonical = readFileSync(h.state, 'utf8');
  const observed = await h.call(status.tool, status.arguments);
  assert.equal(observed.report.status, 'recorded', JSON.stringify(observed));
  assert.equal(observed.report.operation_id, recorded.operation_id);
  assert.equal(readFileSync(h.state, 'utf8'), canonical);

  for (const args of [
   { ...status.arguments, run_id: 'wrong-run' },
   { ...status.arguments, inputs: { run_id: 'wrong-run' } },
   { ...saved, expected_revision_id: undefined },
  ]) {
   const rejected = await client.callTool({ name: 'agdf_inspect', arguments: args });
   assert.equal(rejected.isError, true);
   assert.equal(readFileSync(h.state, 'utf8'), canonical, 'No failed read repairs, revises or writes state.');
  }
  const wrongGroup = await client.callTool({ name: 'agdf_record', arguments: status.arguments });
  assert.equal(wrongGroup.isError, true); assert.equal(readFileSync(h.state, 'utf8'), canonical);
  // A genuinely unbound creation-status lookup remains supported. The offered
  // bound reference prevents accidentally turning this Run lookup into one.
  const { run_id, expected_revision_id, ...unbound } = saved;
  const creationLookup = await client.callTool({ name: 'agdf_inspect', arguments: unbound });
  assert.equal(creationLookup.structuredContent.report.available, false);
  assert.equal(creationLookup.structuredContent.report.reason, 'run_missing');
  assert.equal(readFileSync(h.state, 'utf8'), canonical);
 }); console.log(`Bound source/status reads preserve exact selectors and reject malformed envelopes (${modern ? 'modern' : 'legacy'}).`);
 } finally { fixture.dispose(); }
}
