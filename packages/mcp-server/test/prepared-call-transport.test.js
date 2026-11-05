import assert from 'node:assert/strict';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/server/validators/ajv';
import { commandGroupDefinition, RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS } from '../../core/lib/control-state/run-command-schema.js';
import { decisionActionDefinition, DECISION_VIEW_DEFINITION } from '../../core/lib/control-state/decision-action-contract.js';
import { preparedTransportSchema, createPreparedCallTransport } from '../src/prepared-call-transport.js';
let time = 0;
const registry = createPreparedCallTransport({ now: () => time, maxEntries: 2, lifetimeMs: 10 });
const call = { tool: 'agdf_record', arguments: { target_id: 'immutable', run_id: 'run-fixed', expected_revision_id: 'revision-fixed', operation_id: 'original', command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR' }] } } } };
const original = { material_call: { call, required_inputs: ['/command/payload/files/0/content'] } };
const decorated = registry.decorate(original), form = decorated.material_call;
assert.equal(original.material_call.submit, undefined);
assert.match(form.instruction, /copy of submit\.arguments/u);
assert.match(form.instruction, /submit\.arguments\.prepared_call_id/u);
assert.match(form.instruction, /host-supported serialization/u);
assert.match(form.instruction, /Check the tool result for failure/u);
assert.ok(!form.instruction.includes('undefined'));
const filled = { ...form.submit.arguments, inputs: { '/command/payload/files/0/content': 'Exact authored 😀 bytes' } };
const actual = registry.resolve('agdf_record', filled);
assert.equal(actual.command.payload.files[0].content, 'Exact authored 😀 bytes');
assert.equal(actual.target_id, call.arguments.target_id);
assert.deepEqual(registry.resolve('agdf_record', filled), actual, 'Identical retries reconstruct the identical original command/UUID.');
assert.throws(() => registry.resolve('agdf_approve', filled), /command_schema_invalid/);
for (const inputs of [{}, { '/target_id': 'changed' }, { ...filled.inputs, '/command/payload/files/0/slot': 'TP' }])
  assert.throws(() => registry.resolve('agdf_record', { ...filled, inputs }), /command_schema_invalid/);
assert.throws(() => registry.resolve('agdf_record', { ...filled, run_id: 'another' }), /command_schema_invalid/);
assert.equal(registry.decorate(original).material_call.submit.arguments.prepared_call_id, form.submit.arguments.prepared_call_id);
assert.equal(registry.decorate({ material_call: { ...original.material_call, required_inputs: ['/command/payload/__proto__/bad'] } }).material_call.submit, undefined);
time = 10;
assert.throws(() => registry.resolve('agdf_record', filled), /session_expired/);
const next = registry.decorate(original).material_call.submit;
assert.notEqual(next.arguments.prepared_call_id, form.submit.arguments.prepared_call_id);
registry.close();assert.throws(() => registry.resolve('agdf_record', next.arguments), /session_expired/);
console.log('Prepared transport immutable binding, exact replay, group/input isolation, expiry and close passed.');

const groups = Object.keys(RUN_COMMAND_GROUPS);
const publishedBytes = groups.reduce((sum, name) => {
  const definition = commandGroupDefinition(name);
  const bytes = Buffer.byteLength(JSON.stringify({ ...definition, inputSchema: preparedTransportSchema(name, definition.inputSchema) }));
  assert.ok(bytes <= (RUN_COMMAND_LIMITS.definition_bytes_by_group[name] ?? RUN_COMMAND_LIMITS.definition_bytes));
  return sum + bytes;
}, 0) + [decisionActionDefinition(groups), DECISION_VIEW_DEFINITION].reduce((sum, value) => sum + Buffer.byteLength(JSON.stringify(value)), 0);
assert.ok(publishedBytes <= RUN_COMMAND_LIMITS.aggregate_definition_bytes, String(publishedBytes));

const originalReadSchema={type:'object',properties:{operation:{type:'string'}}};
for(const name of ['agdf_inspect','agdf_dispatch'])assert.equal(preparedTransportSchema(name,originalReadSchema),originalReadSchema);
assert.equal(createPreparedCallTransport().decorate({next_calls:[{tool:'agdf_inspect',arguments:{operation:'gate-check'}}]}).next_calls[0].submit,undefined);
const hints=createPreparedCallTransport();const f=hints.decorate(original).material_call;
assert.match(hints.validationHint('agdf_record',{...f.submit.arguments,target_id:'immutable'}),/Choose raw OR prepared mode/u);
assert.match(hints.validationHint('agdf_record',{...f.submit.arguments,target_id:'another'}),/fixed fields conflict/u);
assert.match(hints.validationHint('agdf_approve',f.submit.arguments),/cannot cross permission groups/u);
assert.equal(hints.validationHint('agdf_inspect',f.submit.arguments),'');

// Native authoring mistakes must remain rejected by the real published schema,
// while the hint identifies the exact copy/fill boundary without inventing IDs.
const rawArguments = {
  target_source: 'current_repository', primary_target: '/tmp/native-prepared-test', target_id: 'sha256:' + '0'.repeat(64),
  operation_id: '00000000-0000-4000-8000-000000000001', run_id: 'run-fixed', expected_revision_id: '00000000-0000-4000-8000-000000000002',
  command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR' }] } },
};
const canonical = createPreparedCallTransport();
const offered = canonical.decorate({ material_call: { call: { tool: 'agdf_record', arguments: rawArguments },
  required_inputs: ['/command/payload/files/0/content'] } }).material_call;
const inputs = { '/command/payload/files/0/content': 'Exact Markdown `done <id>` and 😀 text' };
const validate = new AjvJsonSchemaValidator().getValidator(preparedTransportSchema('agdf_record', commandGroupDefinition('agdf_record').inputSchema));
const missingReference = JSON.parse(JSON.stringify({ prepared_call_id: offered.submit.prepared_call_id, inputs }));
assert.deepEqual(missingReference, { inputs }, 'The observed wrong-path extraction serializes to inputs only.');
for (const [label, malformed] of [
  ['raw plus inputs', { ...rawArguments, inputs }],
  ['inputs without reference', missingReference],
  ['prepared plus duplicated raw fields', { ...rawArguments, ...offered.submit.arguments, inputs }],
]) {
  assert.equal(validate(malformed).valid, false, label);
  const hint = canonical.validationHint('agdf_record', malformed);
  assert.match(hint, /Choose raw OR prepared mode/u, label);
  assert.ok(hint.length <= 768, label);
  if (!Object.hasOwn(malformed, 'prepared_call_id')) {
    assert.match(hint, /submit\.arguments/u, label);
    assert.match(hint, /No operation was dispatched/u, label);
    assert.ok(!hint.includes(offered.submit.arguments.prepared_call_id), 'Missing references are never guessed from the registry.');
  }
}
const preparedArguments = { ...offered.submit.arguments, inputs };
assert.equal(validate(preparedArguments).valid, true);
const reconstructed = canonical.resolve('agdf_record', preparedArguments);
assert.equal(validate(reconstructed).valid, true, 'The exact bound raw command still satisfies the original published schema.');
assert.deepEqual(reconstructed, { ...rawArguments, command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR', content: inputs['/command/payload/files/0/content'] }] } } });
assert.deepEqual(canonical.resolve('agdf_record', reconstructed), reconstructed, 'Raw fallback retains its original binding and UUID.');
assert.equal(canonical.validationHint('agdf_record', rawArguments), '', 'Ordinary raw diagnostics remain owned by the command contract.');
assert.equal(canonical.validationHint('agdf_dispatch', missingReference), '', 'Read-only groups never gain a prepared submission path.');
console.log('Native malformed authoring calls remain rejected; copy/fill hints preserve exact text, binding, UUID and raw fallback.');
