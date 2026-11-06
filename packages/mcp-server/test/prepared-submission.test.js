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
    assert.equal(localized.report.prepared_call.recovery_only.original_call.arguments.presentation_language,'de');
    const german=localized.next_action.call;german.arguments.inputs={'title':'Synthetic German request'};
    const germanRun=await h.call(german.tool,german.arguments);assert.equal(germanRun.outcome,'accepted');assert.equal(germanRun.receipt.input_resolution.configuration.values.chat_language,'de');assert.equal(germanRun.receipt.input_resolution.configuration.sources.chat_language.kind,'explicit');
    const upload = page.next_action.call;
    const beforeMalformed = readFileSync(h.state, 'utf8');
    const authorInputs = { content: clarifiedUr };
    for (const [label, argumentsValue, diagnosis] of [
      ['raw mixed with inputs', { ...page.report.material_call.recovery_only.original_call.arguments, inputs: authorInputs }, /A full raw call cannot contain inputs/u],
      ['inputs only', { inputs: authorInputs }, /The prepared reference is missing/u],
      ['reference read from the wrong level', JSON.parse(JSON.stringify({ prepared_call_id: upload.prepared_call_id, inputs: authorInputs })), /The prepared reference is missing/u],
    ]) {
      const malformed = await client.callTool({ name: upload.tool, arguments: argumentsValue });
      const message = malformed.content.map(block => block.text ?? '').join('\n');
      assert.equal(malformed.isError, true, label);
      assert.match(message, diagnosis, label);
      assert.match(message, /call\.arguments/u, label);
      assert.match(message, /No operation was dispatched/u, label);
      assert.doesNotMatch(message, /Schema:/u, 'Transport correction must not dump unrelated command-union failures.');
      assert.ok(Buffer.byteLength(message) < 1024, 'The actionable pre-dispatch error stays bounded.');
      assert.equal(readFileSync(h.state, 'utf8'), beforeMalformed, label);
    }
    const large = page.report.material_call.content_contract;
    assert.equal(large.max_utf8_bytes_per_file, 49152);
    assert.equal(large.larger_source_call.operation.kind, 'inspect.read');
    assert.equal(large.larger_source_call.operation.run_id, context.run_id);
    assert.equal(large.larger_source_call.recovery_only.original_call.arguments.run_id, context.run_id);
    assert.deepEqual(Object.keys(large.larger_source_call.arguments).sort(), ['inputs', 'prepared_call_id']);
    assert.deepEqual(large.larger_source_call.arguments.inputs, {});
    const multipartHelp = await h.call(large.larger_source_call.tool, large.larger_source_call.arguments);
    assert.equal(multipartHelp.report.kind, 'material.stage');
    const tooLarge = await client.callTool({ name: 'agdf_record', arguments: {
      ...page.report.material_call.recovery_only.original_call.arguments, command: { kind: 'material.stage', payload: {
        action: 'put', files: [{ slot: 'UR', content: 'x'.repeat(49153) }] } } } });
    assert.equal(tooLarge.isError, true);
    assert.match(JSON.stringify(tooLarge), /49153 UTF-8 bytes; maximum 49152/u);
    const longText = 'x'.repeat(17816);
    const longUpload = { ...page.report.material_call.recovery_only.original_call.arguments, operation_id: randomUUID(), command: { kind: 'material.stage', payload: {
      action: 'put', files: [{ slot: 'UR', content: longText }] } } };
    const longBefore = readFileSync(h.state, 'utf8');
    const longStaged = await h.call('agdf_record', longUpload);
    assert.equal(longStaged.outcome, 'accepted');
    assert.equal(longStaged.family_result.files[0].bytes, 17816);
    assert.equal(longStaged.family_result.files[0].sealed, true);
    assert.equal(readFileSync(h.state, 'utf8'), longBefore, 'A longer direct upload remains private, not a canonical write.');
    assert.deepEqual((await h.call('agdf_record', longUpload)).family_result.files, longStaged.family_result.files);
    upload.arguments.inputs = { content: clarifiedUr };
    const staged = await h.call(upload.tool, upload.arguments);
    assert.equal(staged.outcome, 'accepted', JSON.stringify(staged));
    const recording = staged.next_action.call;
    const before = readFileSync(h.state, 'utf8');
    const wrongGroup = await client.callTool({ name: 'agdf_approve', arguments: recording.arguments });
    assert.equal(wrongGroup.isError, true);assert.equal(readFileSync(h.state, 'utf8'), before);
    const hybrid=await client.callTool({name:recording.tool,arguments:{...recording.arguments,target_id:h.target}});
    assert.equal(hybrid.isError,true);assert.match(JSON.stringify(hybrid),/Normal call arguments/u);assert.match(JSON.stringify(hybrid),/title/u);
    assert.equal(readFileSync(h.state,'utf8'),before);
    recording.arguments.inputs = { title: 'Synthetic clarified need' };
    const recorded = await h.call(recording.tool, recording.arguments);assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
    const germanPreparationHelp=await h.call('agdf_inspect',{...context,presentation_language:'de',operation:'operation-contract',module:'agdf_prepare/presentation.prepare',expected_revision_id:recorded.current.revision_id});
    assert.equal(germanPreparationHelp.report.prepared_call.recovery_only.original_call.arguments.presentation_language,'de');
    assert.equal(germanPreparationHelp.report.current.status,'blocked');assert.equal(germanPreparationHelp.report.current.next_operation.type,'resolve_control_blocker');
    const replay = await h.call(recording.tool, recording.arguments);assert.equal(replay.outcome, 'already_applied');
    const next = recorded.next_action.call;
    const routed = await h.call(next.tool, next.arguments);
    assert.equal(routed.continuation.phase, 'presentation_required', JSON.stringify(routed));
    const prep = routed.next_action.call;
    assert.deepEqual(routed.continuation.next_calls[0].required_inputs, []);
    assert.match(routed.continuation.next_calls[0].submission_instruction, /unchanged/u);
    const beforePrepare = readFileSync(h.state, 'utf8');
    const inventedId = await client.callTool({ name: prep.tool, arguments: { ...prep.arguments, inputs: { operation_id: 'invented' } } });
    assert.equal(inventedId.structuredContent.dispatch, 'not_dispatched');
    assert.match(inventedId.structuredContent.prepared_call_help, /Exact ready call/u);
    assert.equal(readFileSync(h.state, 'utf8'), beforePrepare);
    const prepared = await h.call(prep.tool, prep.arguments);
    const deliver = prepared.next_action.call;
    const delivered = await h.call(deliver.tool, deliver.arguments);
    const form = delivered.next_action;
    assert.equal(form.state, 'requires_new_reply');
    assert.deepEqual(form.call.arguments.inputs, {}, 'The adapter never prepopulates a gate reply.');
    const beforeHelp = readFileSync(h.state, 'utf8');
    const approvalHelp = await h.call(form.contract_call.tool, form.contract_call.arguments);
    assert.equal(approvalHelp.report.available, true);
    assert.equal(approvalHelp.report.binding.expected_revision_id, form.operation.expected_revision_id);
    assert.equal(readFileSync(h.state, 'utf8'), beforeHelp, 'Supplied approval schema help remains read-only.');
    assert.equal(form.recovery_only.original_call.arguments.command.payload.response, undefined);
    assert.equal(form.response_contract.approval_value, 'Approval: UR');
    const approval = form.call;
    approval.arguments.inputs = { response: 'Approval: UR' }; // synthetic new reply
    const approved = await h.call(approval.tool, approval.arguments);assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
    assert.equal(approved.current.gate, 'Brownfield Review');
    const staleUpload = await client.callTool({name:upload.tool,arguments:{...upload.arguments,inputs:{content:'changed'}}});
    assert.equal(staleUpload.isError,true,'Prepared submissions never bypass original operation or revision checks.');
  });console.log(`Prepared submission full guarded chain passed (${modern?'modern':'legacy'}).`); } finally { fixture.dispose(); }
}
