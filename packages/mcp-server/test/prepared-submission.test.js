import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [] }), root = fixture.governanceTarget;
  try { await withStdioClient({ ...fixture, modern }, async client => {
    const h = await createMcpDeliveryHarness(client, root);
    const { operation_id, schema_version, assurance, ...context } = h.bound();
    const page = await h.call('agdf_inspect', { ...context, operation: 'authoring-inputs', bundle: true });
    assert.equal(page.report.format, 'document_bundle_v2');assert.ok(page.report.documents.length);
    const localized=await h.call('agdf_inspect',{...context,presentation_language:'de',operation:'operation-contract',module:'agdf_run/run.create',run_id:undefined,expected_revision_id:undefined});
    assert.equal(localized.report.prepared_call.call.arguments.presentation_language,'de');
    const german=localized.report.prepared_call.submit;german.arguments.inputs={'/command/payload/title':'Synthetic German request'};
    const germanRun=await h.call(german.tool,german.arguments);assert.equal(germanRun.outcome,'accepted');assert.equal(germanRun.receipt.input_resolution.configuration.values.chat_language,'de');assert.equal(germanRun.receipt.input_resolution.configuration.sources.chat_language.kind,'explicit');
    const upload = page.report.material_call.submit;
    const large = page.report.material_call.content_contract;
    assert.equal(large.max_utf8_bytes_per_file, 49152);
    assert.equal(large.larger_source_call.arguments.run_id, context.run_id);
    const multipartHelp = await h.call(large.larger_source_call.tool, large.larger_source_call.arguments);
    assert.equal(multipartHelp.report.kind, 'material.stage');
    const tooLarge = await client.callTool({ name: 'agdf_record', arguments: {
      ...page.report.material_call.call.arguments, command: { kind: 'material.stage', payload: {
        action: 'put', files: [{ slot: 'UR', content: 'x'.repeat(49153) }] } } } });
    assert.equal(tooLarge.isError, true);
    assert.match(JSON.stringify(tooLarge), /49153 UTF-8 bytes; maximum 49152/u);
    const longText = 'x'.repeat(17816);
    const longUpload = { ...page.report.material_call.call.arguments, operation_id: randomUUID(), command: { kind: 'material.stage', payload: {
      action: 'put', files: [{ slot: 'UR', content: longText }] } } };
    const longBefore = readFileSync(h.state, 'utf8');
    const longStaged = await h.call('agdf_record', longUpload);
    assert.equal(longStaged.outcome, 'accepted');
    assert.equal(longStaged.family_result.files[0].bytes, 17816);
    assert.equal(longStaged.family_result.files[0].sealed, true);
    assert.equal(readFileSync(h.state, 'utf8'), longBefore, 'A longer direct upload remains private, not a canonical write.');
    assert.deepEqual((await h.call('agdf_record', longUpload)).family_result.files, longStaged.family_result.files);
    upload.arguments.inputs = { '/command/payload/files/0/content': clarifiedUr };
    const staged = await h.call(upload.tool, upload.arguments);
    assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
    const recording = staged.recording_calls[0].submit;
    const before = readFileSync(h.state, 'utf8');
    const wrongGroup = await client.callTool({ name: 'agdf_approve', arguments: recording.arguments });
    assert.equal(wrongGroup.isError, true);assert.equal(readFileSync(h.state, 'utf8'), before);
    const hybrid=await client.callTool({name:recording.tool,arguments:{...recording.arguments,target_id:h.target}});
    assert.equal(hybrid.isError,true);assert.match(JSON.stringify(hybrid),/Choose raw OR prepared mode/u);assert.match(JSON.stringify(hybrid),/command\/payload\/title/u);
    assert.equal(readFileSync(h.state,'utf8'),before);
    recording.arguments.inputs = { '/command/payload/title': 'Synthetic clarified need' };
    const recorded = await h.call(recording.tool, recording.arguments);assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
    const germanPreparationHelp=await h.call('agdf_inspect',{...context,presentation_language:'de',operation:'operation-contract',module:'agdf_prepare/presentation.prepare',expected_revision_id:recorded.current.revision_id});
    assert.equal(germanPreparationHelp.report.prepared_call.call.arguments.presentation_language,'de');
    assert.equal(germanPreparationHelp.report.current.status,'blocked');assert.equal(germanPreparationHelp.report.current.next_operation.type,'resolve_control_blocker');
    const replay = await h.call(recording.tool, recording.arguments);assert.equal(replay.outcome, 'already_applied');
    const next = recorded.next_calls[0].submit ?? recorded.next_calls[0];
    const routed = await h.call(next.tool, next.arguments);
    assert.equal(routed.continuation.phase, 'presentation_required', JSON.stringify(routed));
    const prep = routed.continuation.next_calls[0].submit ?? routed.continuation.next_calls[0];
    assert.deepEqual(routed.continuation.next_calls[0].required_inputs, []);
    assert.match(routed.continuation.next_calls[0].submission_instruction, /already stored/u);
    const beforePrepare = readFileSync(h.state, 'utf8');
    const inventedId = await client.callTool({ name: prep.tool, arguments: { ...prep.arguments, inputs: { operation_id: 'invented' } } });
    assert.equal(inventedId.structuredContent.dispatch, 'not_dispatched');
    assert.match(inventedId.structuredContent.prepared_call_help, /Exact ready call/u);
    assert.equal(readFileSync(h.state, 'utf8'), beforePrepare);
    const prepared = await h.call(prep.tool, prep.arguments);
    const deliver = prepared.next_calls[0].submit;
    const delivered = await h.call(deliver.tool, deliver.arguments);
    const form = delivered.approval_call;
    const beforeHelp = readFileSync(h.state, 'utf8');
    const approvalHelp = await h.call(form.contract_call.tool, form.contract_call.arguments);
    assert.equal(approvalHelp.report.available, true);
    assert.equal(approvalHelp.report.binding.expected_revision_id, form.call.arguments.expected_revision_id);
    assert.equal(readFileSync(h.state, 'utf8'), beforeHelp, 'Supplied approval schema help remains read-only.');
    assert.equal(form.call.arguments.command.payload.response, undefined);
    assert.equal(form.response_contract.approval_value, 'Approval: UR');
    const approval = form.submit;
    approval.arguments.inputs = { '/command/payload/response': 'Approval: UR' }; // synthetic new reply
    const approved = await h.call(approval.tool, approval.arguments);assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
    assert.equal(approved.current.gate, 'Brownfield Review');
    const staleUpload = await client.callTool({name:upload.tool,arguments:{...upload.arguments,inputs:{'/command/payload/files/0/content':'changed'}}});
    assert.equal(staleUpload.isError,true,'Prepared submissions never bypass original operation or revision checks.');
  });console.log(`Prepared submission full guarded chain passed (${modern?'modern':'legacy'}).`); } finally { fixture.dispose(); }
}
