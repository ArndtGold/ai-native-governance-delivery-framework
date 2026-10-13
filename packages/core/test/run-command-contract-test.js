import assert from 'node:assert/strict';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, commandGroupDefinition, validateRunCommand, operationContract } from '../lib/control-state/run-command-contract.js';
const input = { schema_version: '1', presentation_language: 'de', working_directory: '/tmp/project', target_source: 'explicit_target', primary_target: '/tmp/project',
  target_id: 'sha256:' + 'a'.repeat(64), run_id: 'bounded-run', expected_revision_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', operation_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', assurance: 'cooperative_local',
  command: { kind: 'approval.record', payload: { gate: 'TP', presentation_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', response: 'Approval: TP' } } };
assert.deepEqual(validateRunCommand('agdf_approve', input), []);
const recoveries = { agdf_record: ['step.record', 'artefact.record', 'presentation_decision.record'], agdf_revise: ['prd_revision.reopen'], agdf_closeout: ['closeout.record'] };
for (const [group, allowed] of Object.entries(recoveries)) {
  const definition = commandGroupDefinition(group).inputSchema.properties.command.oneOf.find(row => row.properties.kind.const === 'operation.recover');
  assert.deepEqual(definition.properties.payload.properties.original_kind.enum, allowed);
  assert.deepEqual(operationContract(group, 'operation.recover').payload_schema, definition.properties.payload);
  for (const original of Object.values(recoveries).flat()) {
    const command = { ...input, command: { kind: 'operation.recover', payload: { original_kind: original,
      pending_digest: 'sha256:' + 'd'.repeat(64), recovery_revision_id: input.expected_revision_id } } };
    assert.equal(validateRunCommand(group, command).length === 0, allowed.includes(original));
  }
}
for (const group of Object.keys(RUN_COMMAND_GROUPS).filter(g => g !== 'agdf_approve')) assert.ok(validateRunCommand(group, input).length, group);
for (const extra of ['confirmed', 'origin', 'validator', 'function_name', 'shell', 'run_text']) assert.ok(validateRunCommand('agdf_approve', { ...input, [extra]: true }).length, extra);
assert.ok(validateRunCommand('agdf_approve', { ...input, assurance: 'independent_human_proof' }).length);
assert.ok(validateRunCommand('agdf_approve', { ...input, command: { ...input.command, payload: { ...input.command.payload, approve: true } } }).length);
let accessed = 0;
const getter = { ...input }; Object.defineProperty(getter, 'run_id', { enumerable: true, get() { accessed++; throw Error('must not run'); } });
assert.ok(validateRunCommand('agdf_approve', getter).length); assert.equal(accessed, 0);
const nested = { ...input, command: { ...input.command, payload: { ...input.command.payload } } }; Object.defineProperty(nested.command.payload, 'response', { enumerable: true, get() { accessed++; throw Error('must not run'); } });
assert.ok(validateRunCommand('agdf_approve', nested).length); assert.equal(accessed, 0);
let aggregate = 0;
for (const group of Object.keys(RUN_COMMAND_GROUPS)) {
  const definition = commandGroupDefinition(group); const bytes = Buffer.byteLength(JSON.stringify(definition)); aggregate += bytes;
  assert.ok(bytes <= RUN_COMMAND_LIMITS.definition_bytes); assert.equal(definition.annotations.readOnlyHint, false); assert.equal(definition.annotations.destructiveHint, group !== 'agdf_prepare');
  assert.equal(definition.annotations.idempotentHint, false); assert.equal(definition.annotations.openWorldHint, false);
}
assert.ok(aggregate < RUN_COMMAND_LIMITS.aggregate_definition_bytes);
const nonapproval = { ...input, command: { kind: 'presentation_decision.record', payload: {
  gate: 'TP', presentation_id: input.command.payload.presentation_id, action: 'request_change', comment: 'Approval: TP is a quotation.' } } };
assert.deepEqual(validateRunCommand('agdf_record', nonapproval), []);
assert.ok(validateRunCommand('agdf_approve', nonapproval).length);
assert.ok(validateRunCommand('agdf_record', { ...nonapproval, command: { ...nonapproval.command,
  payload: { ...nonapproval.command.payload, action: 'approve' } } }).length);
assert.equal(operationContract('agdf_record', 'presentation_decision.record').confirmation, 'new_deliberate_bound_human_reply');
assert.equal(operationContract('agdf_record', 'approval.record').available, false);
const prd = operationContract('agdf_record', 'artefact.record', { gate: 'PRD' });
assert.equal(prd.authorizes, false); assert.equal(prd.authoring_format.criteria.examples.length, 2); assert.equal(prd.authoring_format.decisions.section, 'Approval Decisions');
console.log(`Bounded command schema/groups, side-effect annotations, accessor/injection rejection and generated definition budgets passed (${aggregate} bytes; facade not yet included).`);

const tp = operationContract('agdf_record', 'artefact.record', { gate: 'TP' }).authoring_format;
assert.equal(tp.verification.design_decision_id_pattern, '^SDD-[A-Z0-9]+(?:-[A-Z0-9]+)*$');
assert.match(tp.verification.cell_rule, /One design_decision_id.*pairs are unique/);
assert.match(tp.verification.table_rule, /contiguous/);

const replacement = { ...input, command: { kind: 'runtime_generation.replace', payload: {
  candidate: { path: '.agdf/control/artefacts/bounded-run/candidate.json', digest: 'sha256:' + 'd'.repeat(64) },
  confirmation: 'Replace owned runtime: sha256:' + 'd'.repeat(64) } } };
assert.deepEqual(validateRunCommand('agdf_record', replacement), []);
for (const group of Object.keys(RUN_COMMAND_GROUPS).filter(group => group !== 'agdf_record')) assert.ok(validateRunCommand(group, replacement).length);
for (const field of ['pid', 'shell', 'connection_id', 'owner_epoch', 'executable']) assert.ok(validateRunCommand('agdf_record', {
  ...replacement, command: { ...replacement.command, payload: { ...replacement.command.payload, [field]: 'untrusted' } } }).length);
assert.equal(operationContract('agdf_record', 'runtime_generation.replace').confirmation, 'concrete_candidate_digest');
assert.equal(operationContract('agdf_prepare', 'presentation.prepare').presentation_format.owner, 'run-presentation-render');
