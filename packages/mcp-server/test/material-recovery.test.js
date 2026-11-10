// Real serving-generation loss and dropped STDIO acknowledgement in owned fixtures.
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { readRunOperations } from '../../core/lib/control-state/run-operations.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
  try {
    let original, firstReference;
    const content = '# UR: Exact staged intent\n## Problem\nA bounded result is unavailable.\n## Goal\nDeliver that bounded result.\n## Scope\nOnly this fixture.\n';
    await withStdioClient({ ...fixture, modern }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic exact staged intent');
      firstReference = await h.stage('UR', content);
      original = { ...h.bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Synthetic exact staged intent', source: firstReference } } };
    }); // No canonical record call: this serving generation and its buffers are gone.
    const entry = join(fixture.root, 'drop-one-ack.mjs');
    writeFileSync(entry, `import {runMcpServer} from ${JSON.stringify(pathToFileURL(join(fixture.serverRoot, 'src/main.js')).href)};
const originalWrite=process.stdout.write.bind(process.stdout);let dropped=false;
process.stdout.write=function(chunk,...args){let packet;try{packet=JSON.parse(String(chunk))}catch{}
if(!dropped&&packet?.result?.structuredContent?.operation_id===${JSON.stringify(original.operation_id)}&&packet.result.structuredContent.outcome==='accepted'&&packet.result.structuredContent.binding?.kind==='step.record'){
dropped=true;const callback=args.find(a=>typeof a==='function');callback?.();return true;}
return originalWrite(chunk,...args)};
await runMcpServer({surface:'codex'});`);
    await withStdioClient({ ...fixture, modern, args: [entry] }, async client => {
      const call = async payload => {
        const result = (await client.callTool({ name: 'agdf_record', arguments: { ...original, operation_id: randomUUID(), command: { kind: 'material.stage', payload } } })).structuredContent;
        assert.equal(result.outcome, 'accepted', JSON.stringify(result)); return result.family_result;
      };
      const bytes = Buffer.from(content), start = await call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
      await call({ action: 'append', transfer_id: start.transfer_id, file: 0, offset: 0, data: bytes.toString('base64') });
      const reference = (await call({ action: 'seal', transfer_id: start.transfer_id })).files[0].reference;
      assert.notEqual(reference.material_id, firstReference.material_id); assert.equal(reference.digest, firstReference.digest);
      original.command.payload.source = reference;
      await assert.rejects(client.callTool({ name: 'agdf_record', arguments: original }, { timeout: 3000 }), /timed out|timeout/i);
      const observed = (await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'operation-status', module: original.operation_id,
        presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target',
        run_id: original.run_id, expected_revision_id: original.expected_revision_id } })).structuredContent.report;
      assert.equal(observed.status, 'recorded', JSON.stringify(observed)); assert.equal(observed.receipt.operation_id, original.operation_id);
      const replay = (await client.callTool({ name: 'agdf_record', arguments: original })).structuredContent;
      assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay)); assert.deepEqual(replay.receipt, observed.receipt);
    });
    await withStdioClient({ ...fixture, modern }, async client => {
      const replay = (await client.callTool({ name: 'agdf_record', arguments: original })).structuredContent;
      assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay));
      const state = readFileSync(join(root, '.agdf/control/runs', original.run_id, 'RUN_STATE.md'), 'utf8');
      assert.equal(readRunOperations(state).receipts.filter(r => r.operation_id === original.operation_id).length, 1);
      assert.equal(readFileSync(join(root, '.agdf/control/runs', original.run_id, 'documents', 'UR.md'), 'utf8'), content);
    });
    console.log(`Actual generation loss/restaging, dropped acknowledgement, original receipt and one canonical UR effect passed (${modern ? 'modern' : 'legacy'}).`);
  } finally { fixture.dispose(); }
}

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
  try {
    await withStdioClient({ ...fixture, modern }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic prepared-call need');
      const { operation_id: _operation, schema_version: _schema, assurance: _assurance, ...inspectContext } = h.bound();
      const page = await h.call('agdf_inspect', { ...inspectContext, operation: 'authoring-inputs', bundle: true });
      const upload = page.next_action;
      assert.equal(upload.state, 'form');
      assert.deepEqual(upload.required_inputs, ['content']);
      assert.deepEqual(upload.call.arguments.inputs, {});
      assert.deepEqual(upload.input_fields, [{ name: 'content', required: true }]);
      assert.deepEqual(upload.recovery_only.input_fields, [{ name: 'content', pointer: '/command/payload/files/0/content' }]);
      assert.equal(upload.operation.run_id, inspectContext.run_id);
      assert.equal(upload.operation.expected_revision_id, inspectContext.expected_revision_id);
      assert.equal(upload.recovery_only.original_call.arguments.command.kind, 'material.stage');
      assert.equal(upload.recovery_only.original_call.arguments.operation_id, upload.operation.operation_id);
      upload.call.arguments.inputs = { content: clarifiedUr };
      const before = readFileSync(h.state, 'utf8');
      const staged = await h.call(upload.call.tool, upload.call.arguments);
      assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
      assert.equal(staged.family_result.files[0].sealed, true);
      const replay = await h.call(upload.call.tool, upload.call.arguments);
      assert.deepEqual(replay.family_result.files, staged.family_result.files);
      assert.equal(readFileSync(h.state, 'utf8'), before);
      const record = staged.next_action;
      assert.equal(record.state, 'form');
      assert.deepEqual(record.required_inputs, ['title']);
      assert.equal(record.operation.kind, 'step.record');
      assert.notEqual(record.operation.operation_id, upload.operation.operation_id);
      assert.equal(record.recovery_only.original_call.arguments.operation_id, record.operation.operation_id);
      assert.equal(record.operation.run_id, upload.operation.run_id);
      assert.equal(record.operation.expected_revision_id, upload.operation.expected_revision_id);
      assert.deepEqual(record.call.arguments.inputs, {});
      record.call.arguments.inputs = { title: 'Synthetic prepared-call need' };
      const written = await h.call(record.call.tool, record.call.arguments);
      assert.equal(written.outcome, 'accepted', JSON.stringify(written));
      const next = written.next_action.call;
      assert.equal(next.arguments.continue_delivery, true);
      assert.equal(next.arguments.expected_revision_id, undefined);
      assert.equal(next.arguments.intake, undefined);
      const routed = await h.call(next.tool, next.arguments);
      assert.equal(routed.continuation.phase, 'presentation_required', JSON.stringify(routed));
      const prepareCall = routed.next_action.call;
      assert.equal(prepareCall.tool, 'agdf_prepare');
      assert.equal(routed.next_action.operation.kind, 'presentation.prepare');
      assert.equal(routed.next_action.recovery_only.original_call.arguments.operation_id, routed.next_action.operation.operation_id);
      const prepared = await h.call(prepareCall.tool, prepareCall.arguments);
      assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
      const deliverCall = prepared.next_action.call;
      assert.equal(prepared.next_action.operation.kind, 'presentation.deliver');
      assert.notEqual(prepared.next_action.operation.operation_id, routed.next_action.operation.operation_id);
      assert.equal(prepared.next_action.recovery_only.original_call.arguments.command.kind, 'presentation.deliver');
      assert.equal(prepared.next_action.operation.presentation_id, prepared.family_result.presentation_id);
      const delivered = await h.call(deliverCall.tool, deliverCall.arguments);
      assert.equal(delivered.presentation_delivery.mode, 'full_markdown');
      assert.equal(delivered.presentation_delivery.text, prepared.family_result.text);
      assert.deepEqual(delivered.next_calls, []);
      const approval = delivered.next_action;
      assert.equal(approval.state, 'requires_new_reply');
      assert.deepEqual(approval.required_inputs, ['response']);
      assert.deepEqual(approval.call.arguments.inputs, {}, 'The adapter never prepopulates an approval reply.');
      assert.equal(approval.recovery_only.original_call.arguments.command.payload.response, undefined);
      assert.equal(approval.operation.presentation_id, prepared.family_result.presentation_id);
      assert.equal(approval.recovery_only.original_call.arguments.command.payload.presentation_id, prepared.family_result.presentation_id);
      approval.call.arguments.inputs = { response: 'Approval: UR' }; // Synthetic fixture decision only.
      const approved = await h.call(approval.call.tool, approval.call.arguments);
      assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
      const after = approved.next_action.call;
      const control = await h.call(after.tool, after.arguments);
      assert.equal(control.control.current_gate, 'Brownfield Review');
      const statePath = h.state;
      const afterApproval = readFileSync(statePath, 'utf8');
      const historical = await h.call(prepareCall.tool, prepareCall.arguments);
      assert.ok((historical.next_calls ?? []).every(call => call.tool === 'agdf_inspect'),
        'An old presentation may offer historical reads, never a fresh delivery action.');
      assert.equal(readFileSync(statePath, 'utf8'), afterApproval);
      const old = await h.call(record.call.tool, record.call.arguments);
      assert.equal(old.outcome, 'already_applied');
      assert.equal(old.next_calls, undefined);
    });
    console.log(`Prepared UTF-8 transport/record/dispatch/presentation chain, withheld approval and original replay passed (${modern ? 'modern' : 'legacy'}).`);
  } finally { fixture.dispose(); }
}
