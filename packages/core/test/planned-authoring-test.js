import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { plannedFixture, clarifiedUr, commandBinding } from './planned-fixtures.js';
import { planningId } from '../lib/control-state/planned-entry.js';
import { createRunMaterialStore, grantedMaterial } from '../lib/control-state/run-material.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { validateRunCommand, validateRunCommandResult } from '../lib/control-state/run-command-contract.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { inspectAuthoringInputs } from '../lib/control-inspect/authoring-inputs.js';
import { parseControlInspectFunctionArguments, normalizeControlInspectInput, CONTROL_INSPECT_FUNCTION_DEFINITION, CONTROL_INSPECT_MAX_DEFINITION_BYTES } from '../lib/control-inspect/contract.js';
import { createControlInspectService } from '../lib/control-inspect/service.js';
import { interactionLocales } from '../lib/resources/context.js';
import { createCoreServices } from '../lib/index.js';
import { mcpControlContinuation } from '../lib/skill-dispatch/mcp-continuation.js';

function envelope(root, operation_id = randomUUID(), expected_digest = null, plan_id = planningId(operation_id)) {
  return { schema_version: '1', presentation_language: 'en', working_directory: root, primary_target: root,
    target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id, operation_id,
    assurance: 'cooperative_local', planning: { plan_id, expected_digest } };
}
function transfer(store, bound, text) {
  const call = payload => store.stage({ ...bound, operation_id: randomUUID(), command: { kind: 'planned_material.stage', payload } });
  const bytes = Buffer.from(text), start = call({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
  assert.equal(start.outcome, 'accepted', JSON.stringify(start));
  const transfer_id = start.family_result.transfer_id;
  for (let offset = 0; offset < bytes.length; offset += 16384) assert.equal(call({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') }).outcome, 'accepted');
  return call({ action: 'seal', transfer_id }).family_result.files[0].reference;
}

test('SCN-004/007/009: pre-Run typed material/create/replace use explicit planning scope and replay after buffer retirement', t => {
  const root = plannedFixture(t, []), bound = envelope(root), store = createRunMaterialStore(); t.after(() => store.close());
  const source = transfer(store, bound, clarifiedUr);
  const input = { ...bound, command: { kind: 'planned_ur.create', payload: { source, priority: 'high' } } };
  assert.deepEqual(validateRunCommand('agdf_record', input), []);
  const first = createRunCommandService({ materialGrants: store.grants(input) })('agdf_record', input);
  assert.equal(first.outcome, 'accepted', JSON.stringify(first));
  assert.deepEqual(validateRunCommandResult(first), []);
  assert.equal(first.family_result.entry.priority, 'high');
  store.settle(input, first);
  assert.equal(store.inspectOwnership().sets, 0);
  const replay = createRunCommandService()('agdf_record', input);
  assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay));
  assert.deepEqual(validateRunCommandResult(replay), []);
  const revised = envelope(root, randomUUID(), first.family_result.entry.digest, bound.planning.plan_id);
  const content = first.family_result.entry.content.replace('Planning priority: high', 'Planning priority: low');
  const replacement = { ...revised, command: { kind: 'planned_ur.replace', payload: { source: transfer(store, revised, content) } } };
  const result = createRunCommandService({ materialGrants: store.grants(replacement) })('agdf_record', replacement);
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.family_result.entry.priority, 'low');
  assert.deepEqual(validateRunCommandResult(result), []);
  const handoff = createRunCommandService()('agdf_run', { ...revised, planning: { ...revised.planning, expected_digest: result.family_result.entry.digest },
    operation_id: randomUUID(), command: { kind: 'run.create_from_planned', payload: { title: result.family_result.entry.title } } });
  assert.equal(handoff.outcome, 'accepted', JSON.stringify(handoff));
  assert.equal(handoff.current.gate, 'UR');
  assert.deepEqual(validateRunCommandResult(handoff), []);
});

test('SCN-008/009: planning cannot relax Run envelopes, cross private grants or stage another artefact type', t => {
  const root = plannedFixture(t, []), bound = envelope(root), store = createRunMaterialStore(); t.after(() => store.close());
  const stage = { ...bound, command: { kind: 'planned_material.stage', payload: { action: 'begin', files: [{ slot: 'PRD', bytes: 0 }] } } };
  assert.equal(store.stage(stage).outcome, 'rejected');
  assert.ok(validateRunCommand('agdf_record', { ...stage, command: { kind: 'material.stage', payload: stage.command.payload } }).length);
  const ref = transfer(store, bound, clarifiedUr), input = { ...bound, command: { kind: 'planned_ur.create', payload: { source: ref } } };
  assert.ok(validateRunCommand('agdf_record', { ...input, run_id: 'invented', expected_revision_id: randomUUID() }).length);
  assert.ok(validateRunCommand('agdf_record', { ...input, planning: undefined }).length);
  createRun(root, 'real-run');
  const run = commandBinding(root, 'real-run');
  const grant = store.grants(input)[0];
  assert.throws(() => grantedMaterial(run, ref, [grant]), /binding_invalid/);
  assert.throws(() => grantedMaterial({ ...bound, planning: { ...bound.planning, plan_id: 'other' } }, ref, [grant]), /binding_invalid/);
  assert.throws(() => store.grants({ ...input, planning: { ...bound.planning, plan_id: 'other' } }), /binding_mismatch/);
  const runWrite = { ...run, command: { kind: 'step.record', payload: { step: 'ur', title: 'No bypass', source: ref } } };
  for (const key of ['run_id', 'expected_revision_id']) { const missing = { ...runWrite }; delete missing[key]; assert.ok(validateRunCommand('agdf_record', missing).length); }
});

test('SCN-009: planning authoring pages reuse the versioned UR template and strict read scopes without a Run', t => {
  const root = plannedFixture(t, []), bound = envelope(root);
  const initial = inspectAuthoringInputs(root, bound);
  assert.equal(initial.available, true, JSON.stringify(initial));
  assert.equal(initial.mode, 'planning'); assert.equal(initial.gate, null);
  assert.equal(initial.canonical_skill, 'ur-definition');
  assert.equal(initial.material_transport.kind, 'planned_material.stage');
  assert.equal(initial.documents[0].source, 'version_matched_plugin');
  assert.equal(initial.documents[0].type, 'UR');
  assert.equal(initial.formats.kind, 'planned_ur.create');
  assert.ok(initial.chunk.content.includes('Requirements clarification: open'));
  const inspect = createControlInspectService(), trusted = { surface: 'codex', expectedVersion: '0.20.2', interactionLocales };
  for (const operation of ['planned-inventory', 'planned-entry', 'authoring-inputs']) {
    const args = { operation, presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target',
      ...(operation !== 'planned-inventory' ? { planning: bound.planning } : {}) };
    const parsed = parseControlInspectFunctionArguments(args, trusted);
    assert.equal(normalizeControlInspectInput(parsed).operation, operation);
    assert.throws(() => normalizeControlInspectInput({ ...parsed, runId: 'invented', expectedRevisionId: randomUUID() }));
    if (operation !== 'planned-entry') assert.equal(inspect(parsed).outcome, 'inspect_result');
  }
  const help = inspect({ operation: 'operation-contract', contractModule: 'agdf_record/planned_ur.create', presentationLanguage: 'en',
    workingDirectory: root, targetSource: 'explicit_target', primaryTarget: root, ...trusted });
  assert.equal(help.report.available, true, JSON.stringify(help));
  assert.equal(help.report.planning_capability.owner, 'ur-definition');
  assert.ok(Buffer.byteLength(JSON.stringify(CONTROL_INSPECT_FUNCTION_DEFINITION)) <= CONTROL_INSPECT_MAX_DEFINITION_BYTES);
});

test('SCN-004/009: the existing UR dispatcher owns pre-Run planning without assigning a delivery Run', t => {
  const root = plannedFixture(t, []), bound = envelope(root);
  const services = createCoreServices({ observers: { readDeliveryRunInventory: () => assert.fail('planning must not enter delivery assignment') } });
  t.after(() => services.material.close());
  const input = { skillId: 'ur-definition', presentationLanguage: 'en', workingDirectory: root, primaryTarget: root,
    targetSource: 'explicit_target', surface: 'codex', expectedVersion: '0.20.2', interactionLocales, planning: bound.planning };
  const result = services.dispatch(input);
  assert.equal(result.terminal, false, JSON.stringify(result));
  assert.equal(result.continuation.phase, 'planned_ur_definition');
  assert.equal(result.control.current_gate, null);
  assert.equal(result.control.scope, 'planning');
  assert.equal(result.continuation.artifact_language, 'en');
  assert.equal(mcpControlContinuation(input, result, ['agdf_record']).continuation.control_transport, 'typed_mcp');
  const missing = mcpControlContinuation(input, result, []);
  assert.equal(missing.continuation.control_transport, 'unavailable');
  for (const altered of [{ ...input, runId: 'invented' }, { ...input, continueDelivery: true }, { ...input, skillId: 'prd-definition' }])
    assert.equal(services.dispatch(altered).outcome, 'invalid_input');
});
