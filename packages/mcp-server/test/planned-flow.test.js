import { prepareRunContentState } from '../../core/lib/control-evaluation/run-state.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { withStdioClient } from './helpers.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { plannedFixture, clarifiedUr } from '../../core/test/planned-fixtures.js';
import { planningId } from '../../core/lib/control-state/planned-entry.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';

for (const modern of [false, true]) test(`SCN-025/027: actual ${modern ? '2026-07-28' : 'legacy-negotiated'} STDIO uses shared pre-Run authoring/material/CAS/handoff and original replay/status`, async t => {
  const runtime = createOwnedRuntimeFixture({ controlRuns: [] }); t.after(() => runtime.dispose());
  const root = plannedFixture(t, []), target_id = resolveControlCommandTarget(root).target_id;
  const target = { working_directory: root, primary_target: root, target_source: 'explicit_target', presentation_language: 'en' };
  const operation_id = randomUUID(), plan_id = planningId(operation_id), planning = { plan_id, expected_digest: null };
  const bound = { ...target, target_id, schema_version: '1', operation_id, assurance: 'cooperative_local', planning };
  await withStdioClient({ ...runtime, modern }, async client => {
    const call = async (name, args, accepted = true) => {
      const result = await client.callTool({ name, arguments: args });
      if (accepted) assert.notEqual(result.isError, true, JSON.stringify(result));
      return result.structuredContent;
    };
    const tools = (await client.listTools()).tools.map(tool => tool.name);
    assert.deepEqual(tools, ['agdf_dispatch', 'agdf_inspect', 'agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout']);
    const index = await call('agdf_inspect', { ...target, operation: 'contract' });
    assert.ok(index.report.modules.includes('ur-definition'));
    assert.ok(index.report.operation_modules.includes('agdf_record/planned_material.stage'));
    const badScope = await client.callTool({ name: 'agdf_inspect', arguments: { ...target,
      operation: 'inventory', run_id: 'private-fixture', expected_revision_id: randomUUID() } });
    assert.equal(badScope.isError, true);
    assert.match(badScope.content[0].text, /Remove expected_revision_id for inventory/);
    assert.match(badScope.content[0].text, /Remove run_id for inventory/);
    const help = await call('agdf_inspect', { ...target, operation: 'operation-contract', module: 'agdf_record/planned_ur.create' });
    assert.equal(help.report.planning_capability.owner, 'ur-definition');
    assert.equal(help.report.planning_capture.plan_id, 'plan-<planned_ur.create operation_id>');
    const parallel = await Promise.all(Array.from({ length: 4 }, () => call('agdf_inspect', { ...target, target_id,
      operation: 'operation-contract', module: 'agdf_record/planned_material.stage' })));
    assert.ok(parallel.every(result => result.report.available && result.report.planning_capture.expected_digest === null));
    const wrongTarget = await call('agdf_inspect', { ...target, target_id: `sha256:${'0'.repeat(64)}`,
      operation: 'project-state' }, false);
    assert.equal(wrongTarget.outcome, 'invalid_input');
    assert.equal(wrongTarget.diagnostics[0].code, 'target_binding_mismatch');
    const missing = await client.callTool({ name: 'agdf_inspect', arguments: { ...target, operation: 'planned-entry', planning } });
    assert.equal(missing.isError, true); assert.equal(missing.structuredContent.outcome, 'inspect_result');
    assert.equal(missing.structuredContent.terminal, false);
    assert.equal(missing.structuredContent.report.reason, 'planned_entry_missing');
    assert.ok(missing.content.some(part => part.type === 'text' && part.text.includes('planned_entry_missing')));
    assert.ok(!missing.content.some(part => part.type === 'text' && part.text.includes('unclassified_tool_failure')));
    const authoring = await call('agdf_inspect', missing.structuredContent.report.next_calls[0].arguments);
    assert.equal(authoring.report.available, true); assert.equal(authoring.report.mode, 'planning');

    const dispatch = await call('agdf_dispatch', { ...target, skill_id: 'ur-definition', planning });
    assert.equal(dispatch.outcome, 'skill_continuation'); assert.equal(dispatch.terminal, false); assert.equal(dispatch.authorizes, false);
    let template = '', read = { tool: 'agdf_inspect', arguments: { ...target, operation: 'authoring-inputs', planning } };
    do {
      const input = await call(read.tool, read.arguments);
      assert.equal(input.report.available, true, JSON.stringify(input));
      const chunk = input.report.chunk;
      if (chunk) template += JSON.stringify(chunk);
      read = input.report.complete ? null : input.report.next_calls[0];
      if (read) {
        assert.equal(read.operation.operation, 'authoring-inputs');
        assert.equal(read.operation.cursor, input.report.next_cursor);
        assert.deepEqual(Object.keys(read.arguments).sort(), ['inputs', 'prepared_call_id']);
        assert.deepEqual(read.arguments.inputs, {});
      }
    } while (read);
    assert.match(template, /UR/u);
    const stage = async (scope, content) => {
      const bytes = Buffer.from(content);
      const part = payload => call('agdf_record', { ...bound, planning: scope, operation_id: randomUUID(), command: { kind: 'planned_material.stage', payload } });
      const started = await part({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] }), transfer_id = started.family_result.transfer_id;
      for (let offset = 0; offset < bytes.length; offset += 16384) await part({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
      return (await part({ action: 'seal', transfer_id })).family_result.files[0].reference;
    };
    const invalidSource = await stage(planning, clarifiedUr.replace('\n', `\nPlanning schema: planned-ur-v1\nPlanning id: ${plan_id}\nPlanning priority: normal\n`));
    const invalid = await client.callTool({ name: 'agdf_record', arguments: { ...bound,
      command: { kind: 'planned_ur.create', payload: { source: invalidSource } } } });
    assert.equal(invalid.isError, true);
    assert.equal(invalid.structuredContent.reason, 'AGDF_PLANNED_METADATA_INVALID');
    assert.equal(invalid.structuredContent.dispatch, 'not_dispatched');
    assert.match(invalid.structuredContent.recovery, /without Planning schema/);
    assert.ok(!invalid.content.some(part => part.type === 'text' && part.text.includes('unclassified_tool_failure')));
    const source = await stage(planning, clarifiedUr), create = { ...bound, command: { kind: 'planned_ur.create', payload: { source, priority: 'high' } } };
    const saved = await call('agdf_record', create); assert.equal(saved.outcome, 'accepted');
    const listed = await call('agdf_inspect', { ...target, operation: 'planned-inventory' });
    assert.equal(listed.report.available, true); assert.equal(listed.report.entries[0].plan_id, plan_id);
    const entry = saved.family_result.entry, configPath = join(root, '.agdf/control/config.json'), originalConfig = readFileSync(configPath, 'utf8');
    writeFileSync(configPath, '{broken current configuration');
    const replay = await call('agdf_record', create); assert.equal(replay.outcome, 'already_applied');
    const status = await call('agdf_inspect', { ...target, operation: 'operation-status', planning,
      module: `planned_ur.create/${operation_id}` }); assert.equal(status.report.status, 'recorded');
    writeFileSync(configPath, originalConfig);
    const scope = { plan_id, expected_digest: entry.digest }, revised = entry.content.replace('Planning priority: high', 'Planning priority: low');
    const replacement = await stage(scope, revised);
    const replaced = await call('agdf_record', { ...bound, operation_id: randomUUID(), planning: scope,
      command: { kind: 'planned_ur.replace', payload: { source: replacement } } });
    assert.equal(replaced.family_result.entry.priority, 'low');
    const selected = { plan_id, expected_digest: replaced.family_result.entry.digest };
    const inspected = await call('agdf_inspect', { ...target, operation: 'planned-entry', planning: selected });
    assert.equal(inspected.report.available, true); assert.equal(inspected.report.digest, selected.expected_digest);
    assert.equal(inspected.report.priority, 'low');
    const stale = await client.callTool({ name: 'agdf_inspect', arguments: { ...target, operation: 'planned-entry', planning: scope } });
    assert.equal(stale.isError, true); assert.equal(stale.structuredContent.report.available, false);
    assert.equal(stale.structuredContent.report.reason, 'planning_source_stale');
    const handoff = { ...bound, operation_id: randomUUID(), planning: { plan_id, expected_digest: replaced.family_result.entry.digest },
      command: { kind: 'run.create_from_planned', payload: { title: replaced.family_result.entry.title } } };
    const started = await call('agdf_run', handoff), repeated = await call('agdf_run', handoff);
    assert.equal(started.outcome, 'accepted'); assert.equal(repeated.outcome, 'already_applied'); assert.equal(started.family_result.run_id, repeated.family_result.run_id);
    assert.equal(started.next_calls.length, 1);
    assert.equal(started.next_calls[0].tool, 'agdf_dispatch');
    assert.equal(started.next_calls[0].arguments.continue_delivery, true);
    assert.equal(started.next_calls[0].arguments.expected_revision_id, undefined);
    for (const next of started.next_calls) await call(next.tool, next.arguments);
    const prepared = await call('agdf_prepare', { ...target, target_id, run_id: started.family_result.run_id,
      expected_revision_id: started.current.revision_id, operation_id: randomUUID(),
      command: { kind: 'presentation.prepare', payload: { gate: 'UR' } } });
    assert.equal(prepared.next_calls.length, 1);
    assert.equal(prepared.next_action.state, 'ready');
    assert.equal(prepared.next_action.operation.kind, 'presentation.deliver');
    assert.equal(prepared.next_action.operation.run_id, started.family_result.run_id);
    assert.equal(prepared.next_action.operation.expected_revision_id, started.current.revision_id);
    assert.equal(prepared.next_action.operation.presentation_id, prepared.family_result.presentation_id);
    assert.equal(prepared.next_action.recovery_only.original_call.arguments.command.kind, 'presentation.deliver');
    assert.deepEqual(prepared.next_action.call.arguments, prepared.next_calls[0].arguments);
    assert.deepEqual(Object.keys(prepared.next_action.call.arguments).sort(), ['inputs', 'prepared_call_id']);
    const delivered = await call(prepared.next_action.call.tool, prepared.next_action.call.arguments);
    assert.equal(delivered.presentation_delivery.text, prepared.family_result.text);
    assert.deepEqual(delivered.next_calls, []);
    assert.equal(delivered.next_action.state, 'requires_new_reply');
    assert.deepEqual(delivered.next_action.call.arguments.inputs, {}, 'No gate reply is populated by delivery.');
    assert.deepEqual(delivered.next_action.required_inputs, ['response']);
    assert.equal(delivered.next_action.recovery_only.original_call.arguments.command.payload.response, undefined);
    assert.equal(delivered.next_action.operation.presentation_id, prepared.family_result.presentation_id);
    const document = await call('agdf_inspect', { ...target, target_id, run_id: started.family_result.run_id,
      expected_revision_id: started.current.revision_id, operation: 'presentation-document', gate: 'UR',
      presentation_id: prepared.family_result.presentation_id });
    assert.equal(document.report.complete, true);
    assert.equal(document.report.byte_end, document.report.total_bytes);
    const inventory = await call('agdf_inspect', { ...target, operation: 'inventory' });
    assert.equal(inventory.report.entries.length, 1); assert.equal(inventory.report.planning_references.length, 1);
    const direct = await call('agdf_run', { ...target, target_id, schema_version: '1', operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind: 'run.create', payload: { title: 'Direct fixture Run' } } });
    assert.equal(direct.outcome, 'accepted'); assert.equal(readdirSync(join(root, '.agdf/control/runs')).filter(name => name !== '.gitkeep').length, 2);
    for (const id of readdirSync(join(root, '.agdf/control/runs')).filter(name => name !== '.gitkeep')) assert.equal(prepareRunContentState(root,readFileSync(join(root, `.agdf/control/runs/${id}/RUN_STATE.md`),'utf8')).approvals.get('UR').status,'missing');
    const plannedRoot = join(root, '.agdf/control/planned'), backup = plannedRoot + '.fixture-backup';
    const sourceBefore = readFileSync(join(plannedRoot, plan_id, 'UR.md'));
    renameSync(plannedRoot, backup); writeFileSync(plannedRoot, 'Unavailable fixture directory');
    try {
      const unavailable = await client.callTool({ name: 'agdf_inspect', arguments: { ...target, operation: 'planned-inventory' } });
      assert.equal(unavailable.isError, true); assert.equal(unavailable.structuredContent.report.available, false);
      assert.equal(unavailable.structuredContent.report.state, 'unavailable');
    } finally { unlinkSync(plannedRoot); renameSync(backup, plannedRoot); }
    assert.deepEqual(readFileSync(join(plannedRoot, plan_id, 'UR.md')), sourceBefore);
    const rejected = await client.callTool({ name: 'agdf_record', arguments: { ...create, run_id: started.family_result.run_id, expected_revision_id: randomUUID() } });
    assert.equal(rejected.isError, true);
  });
});
