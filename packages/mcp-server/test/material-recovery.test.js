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
      const page = await h.call('agdf_inspect', { ...inspectContext, operation: 'authoring-inputs' });
      const upload = page.report.material_call;
      assert.equal(upload.state, 'requires_author_input');
      assert.deepEqual(upload.required_inputs, ['/command/payload/files/0/content']);
      upload.call.arguments.command.payload.files[0].content = clarifiedUr;
      const before = readFileSync(join(root, '.agdf/control/runs', upload.call.arguments.run_id, 'RUN_STATE.md'), 'utf8');
      const staged = await h.call(upload.call.tool, upload.call.arguments);
      assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
      assert.equal(staged.family_result.files[0].sealed, true);
      const replay = await h.call(upload.call.tool, upload.call.arguments);
      assert.deepEqual(replay.family_result.files, staged.family_result.files);
      assert.equal(readFileSync(join(root, '.agdf/control/runs', upload.call.arguments.run_id, 'RUN_STATE.md'), 'utf8'), before);
      const record = staged.recording_calls[0];
      assert.equal(record.state, 'requires_author_input');
      assert.deepEqual(record.required_inputs, ['/command/payload/title']);
      assert.notEqual(record.call.arguments.operation_id, upload.call.arguments.operation_id);
      record.call.arguments.command.payload.title = 'Synthetic prepared-call need';
      const written = await h.call(record.call.tool, record.call.arguments);
      assert.equal(written.outcome, 'accepted', JSON.stringify(written));
      const next = written.next_calls[0];
      assert.equal(next.arguments.continue_delivery, true);
      assert.equal(next.arguments.expected_revision_id, undefined);
      assert.equal(next.arguments.intake, undefined);
      const routed = await h.call(next.tool, next.arguments);
      assert.equal(routed.continuation.phase, 'presentation_required', JSON.stringify(routed));
      const prepareCall = routed.continuation.next_calls[0];
      assert.equal(prepareCall.tool, 'agdf_prepare');
      const prepared = await h.call(prepareCall.tool, prepareCall.arguments);
      assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
      const deliverCall = prepared.next_calls[0];
      assert.equal(deliverCall.arguments.command.kind, 'presentation.deliver');
      assert.notEqual(deliverCall.arguments.operation_id, prepareCall.arguments.operation_id);
      const delivered = await h.call(deliverCall.tool, deliverCall.arguments);
      assert.equal(delivered.presentation_delivery.mode, 'full_markdown');
      assert.equal(delivered.presentation_delivery.text, prepared.family_result.text);
      assert.deepEqual(delivered.next_calls, []);
      const approval = delivered.approval_call;
      assert.equal(approval.state, 'requires_author_input');
      assert.deepEqual(approval.required_inputs, ['/command/payload/response']);
      assert.equal(approval.call.arguments.command.payload.response, undefined);
      assert.equal(approval.call.arguments.command.payload.presentation_id, prepared.family_result.presentation_id);
      approval.call.arguments.command.payload.response = 'Approval: UR'; // Synthetic fixture decision only.
      const approved = await h.call(approval.call.tool, approval.call.arguments);
      assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
      const after = approved.next_calls[0];
      const control = await h.call(after.tool, after.arguments);
      assert.equal(control.control.current_gate, 'Brownfield Review');
      const statePath = join(root, '.agdf/control/runs', upload.call.arguments.run_id, 'RUN_STATE.md');
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
