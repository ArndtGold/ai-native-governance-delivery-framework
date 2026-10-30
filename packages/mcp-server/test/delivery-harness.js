// Synthetic protocol intents in disposable targets; never native or human approval.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { syntheticTp } from '../../cli/scripts/fixtures/late-source-revision.js';

export async function createMcpDeliveryHarness(client, root, title = 'Synthetic saved filter') {
  let revision, run, target;
  const recoveredOperations = new Set();
  const context = { presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  const call = async (name, args) => {
    const reply = await client.callTool({ name, arguments: args }); assert.ok(reply.structuredContent, JSON.stringify(reply));
    let result = reply.structuredContent;
    if(result.outcome==='effect_unknown') {
      let observation;
      try { observation=await client.callTool({name:'agdf_inspect',arguments:{...context,operation:'operation-status',module:args.operation_id,
        ...(args.run_id?{run_id:args.run_id,expected_revision_id:args.expected_revision_id}:{})}}); }
      catch(error){observation={error:{code:error.code??null,message:error.message}};}
      console.error(JSON.stringify({evidence_class:'unexpected_write_uncertainty',operation_id:args.operation_id,kind:args.command?.kind,
        observation,native_qualified:false,authorizes:false}));
      const recorded=observation?.structuredContent?.report, receipt=recorded?.receipt;
      if(recorded?.status==='recorded' && receipt?.operation_id===args.operation_id
        && receipt.request_digest===result.request_digest && receipt.target_id===args.target_id
        && (!args.run_id || receipt.run_id===args.run_id) && receipt.expected_revision_id===(args.expected_revision_id??null)) {
        // A matched canonical receipt resolves the uncertainty. Replaying these
        // identical bytes retrieves that known effect; no unknown write is retried.
        const replay=await client.callTool({name,arguments:args});
        assert.equal(replay.structuredContent?.outcome,'already_applied',JSON.stringify(replay));
        assert.equal(replay.structuredContent.receipt.operation_id,args.operation_id);
        result=replay.structuredContent; recoveredOperations.add(args.operation_id);
      }
    }
    if (result.current?.available && result.current.revision_id) revision = result.current.revision_id;
    return result;
  };
  const contract = await call('agdf_inspect', { ...context, operation: 'operation-contract', module: 'agdf_run/run.create' });
  target = contract.report.binding.target_id;
  const created = await call('agdf_run', { ...context, schema_version: '1', target_id: target, operation_id: randomUUID(),
    assurance: 'cooperative_local', command: { kind: 'run.create', payload: { title } } });
  assert.equal(created.outcome, 'accepted', JSON.stringify(created)); run = created.binding.run_id;
  const bound = () => ({ ...context, schema_version: '1', target_id: target, run_id: run, expected_revision_id: revision,
    operation_id: randomUUID(), assurance: 'cooperative_local' });
  const invoke = async (group, kind, payload) => {
    const result = await call(group, { ...bound(), command: { kind, payload } });
    assert.ok(result.outcome==='accepted' || result.outcome==='already_applied' && recoveredOperations.has(result.operation_id),JSON.stringify(result)); return result;
  };
  const stage = async (slot, text) => {
    const bytes = Buffer.from(text), start = await invoke('agdf_record', 'material.stage', { action: 'begin', files: [{ slot, bytes: bytes.length }] });
    const id = start.family_result.transfer_id;
    for (let offset = 0; offset < bytes.length; offset += 16384) await invoke('agdf_record', 'material.stage', {
      action: 'append', transfer_id: id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
    return (await invoke('agdf_record', 'material.stage', { action: 'seal', transfer_id: id })).family_result.files[0].reference;
  };
  const inputs = async () => {
    let cursor, pages = [];
    do {
      const result = await call('agdf_inspect', { ...context, operation: 'authoring-inputs', run_id: run,
        expected_revision_id: revision, ...(cursor ? { cursor } : {}) });
      assert.equal(result.report.available, true, JSON.stringify(result)); pages.push(result.report); cursor = result.report.next_cursor;
      assert.ok(pages.length <= 128);
    } while (cursor);
    return pages;
  };
  const approve = async gate => {
    const prepared = await invoke('agdf_prepare', 'presentation.prepare', { gate });
    const delivered = await invoke('agdf_prepare', 'presentation.deliver', { gate, presentation_id: prepared.family_result.presentation_id, route: 'markdown' });
    assert.equal(delivered.presentation_delivery.text, prepared.family_result.text);
    assert.equal(delivered.presentation_delivery.mode, 'full_markdown');
    return invoke('agdf_approve', 'approval.record', { gate, presentation_id: prepared.family_result.presentation_id, response: `Approval: ${gate}` });
  };
  const formal = async (gate, content) => {
    await inputs(); const material = await stage(gate, content);
    return invoke('agdf_record', 'artefact.record', { gate, material, reviewer: 'Synthetic protocol reviewed-source fixture', reviewed: true, update_draft: false });
  };
  const startStructured = async route => {
    const ur = '# UR: Synthetic saved-filter need\n\n## Problem\nOperators repeatedly recreate the same filter.\n## Goal\nAn operator can save and restore one named filter.\n## Scope\nOne user-owned saved filter, no sharing.\n## Non-Goals\nNo shared filters or permissions change.\n';
    await inputs(); await invoke('agdf_record', 'step.record', { step: 'ur', title, source: await stage('UR', ur) });
    await invoke('agdf_revise', 'ur_draft.replace', { title, source: await stage('UR', ur + '\nClarification: the saving user retains ownership.\n') });
    await approve('UR');
    await invoke('agdf_record', 'step.record', { step: 'route', route, reason: 'Synthetic current writer-owned analytical proof',
      source: await stage('Brownfield Review', '# Brownfield Review\nSynthetic existing filter owner.\n- ux_intent_definition_required: no\n') });
    for (const [gate, text] of [['PRD', syntheticPrd()], ['SD', syntheticSd()], ['TP', syntheticTp()]]) { await formal(gate, text); await approve(gate); }
    const preparation = await inputs();
    assert.equal(preparation[0].gate, 'Brownfield Analysis');
    assert.ok(preparation[0].documents.some(row => row.role === 'template' && row.type === 'BROWNFIELD_REVIEW'));
    await invoke('agdf_record', 'step.record', { step: 'internal', internal_step: 'Brownfield Analysis', decision: 'pass',
      source: await stage('Brownfield Analysis', '# Brownfield Analysis\n- mode: pre_implementation_analysis\n- decision: pass\nSynthetic current source preparation complete.\n') });
  };
  const prefix = `.agdf/control/artefacts/${run}/`;
  return { runId: run, target, bound, call, invoke, stage, inputs, approve, formal, startStructured, recoveredOperations,
    revision: () => revision, state: join(root, `.agdf/control/runs/${run}/RUN_STATE.md`), prefix, file: name => join(root, prefix, name) };
}
