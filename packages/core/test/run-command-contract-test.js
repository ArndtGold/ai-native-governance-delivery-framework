import assert from 'node:assert/strict';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, commandGroupDefinition, commandGroupSchema, validateRunCommand, operationContract } from '../lib/control-state/run-command-contract.js';
const input = { schema_version: '1', presentation_language: 'de', working_directory: '/tmp/project', target_source: 'explicit_target', primary_target: '/tmp/project',
  target_id: 'sha256:' + 'a'.repeat(64), run_id: 'bounded-run', expected_revision_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', operation_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', assurance: 'cooperative_local',
  command: { kind: 'approval.record', payload: { gate: 'TP', presentation_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', response: 'Approval: TP' } } };
assert.deepEqual(validateRunCommand('agdf_approve', input), []);
const recoveries = { agdf_record: ['step.record', 'artefact.record', 'presentation_decision.record'], agdf_revise: ['prd_revision.reopen'], agdf_closeout: ['closeout.record', 'lifecycle_close.record'] };
for (const [group, allowed] of Object.entries(recoveries)) {
  const definition = commandGroupSchema(group).properties.command.oneOf.find(row => row.properties.kind.const === 'operation.recover');
  assert.deepEqual(definition.properties.payload.properties.original_kind.enum, allowed);
  assert.deepEqual(operationContract(group, 'operation.recover').schema.properties.command.properties.payload, definition.properties.payload);
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
// Run closure: two target-scoped kinds of agdf_closeout; every per-run kind keeps its Run binding.
const { run_id: _run, expected_revision_id: _revision, ...targetEnvelope } = input;
const preview = { ...targetEnvelope, command: { kind: 'closure.preview', payload: { entries: [{ run_id: 'old-run', outcome: 'superseded', reason: 'Replaced', successor_run: 'new-run' },
  { run_id: 'dropped-run', outcome: 'abandoned', reason: 'Not continued' }, { run_id: 'moved-run', outcome: 'superseded', reason: 'Moved', successor_reference: 'PR #41' }] } } };
assert.deepEqual(validateRunCommand('agdf_closeout', preview), []);
assert.deepEqual(validateRunCommand('agdf_closeout', { ...targetEnvelope, command: { kind: 'closure.apply', payload: { preview_id: '0a1b2c3d', confirmation: 'Close runs: 0a1b2c3d' } } }), []);
assert.deepEqual(validateRunCommand('agdf_closeout', { ...preview, run_id: input.run_id }), [{ path: '$.run_id', code: 'field_forbidden' }]);
assert.deepEqual(validateRunCommand('agdf_closeout', { ...preview, expected_revision_id: input.expected_revision_id }), [{ path: '$.expected_revision_id', code: 'field_forbidden' }]);
const closeoutRecord = { ...input, command: { kind: 'closeout.record', payload: { or: { path: '.agdf/control/artefacts/bounded-run/OR.md', digest: 'sha256:' + 'e'.repeat(64) }, confirmation: 'x' } } };
assert.deepEqual(validateRunCommand('agdf_closeout', closeoutRecord), []);
assert.deepEqual(validateRunCommand('agdf_closeout', { ...closeoutRecord, run_id: undefined, expected_revision_id: undefined }).length > 0, true);
const { run_id: _r, expected_revision_id: _e, ...unboundCloseout } = closeoutRecord;
assert.deepEqual(validateRunCommand('agdf_closeout', unboundCloseout), [{ path: '$.run_id', code: 'field_required' }, { path: '$.expected_revision_id', code: 'field_required' }]);
const recoveryWithoutRun = { ...targetEnvelope, command: { kind: 'operation.recover', payload: { original_kind: 'lifecycle_close.record', pending_digest: 'sha256:' + 'd'.repeat(64), recovery_revision_id: input.expected_revision_id } } };
assert.equal(validateRunCommand('agdf_closeout', recoveryWithoutRun).length, 2, 'operation.recover keeps the Run binding');
for (const group of Object.keys(RUN_COMMAND_GROUPS).filter(group => group !== 'agdf_closeout')) assert.ok(commandGroupSchema(group).required.includes('run_id'), group);
assert.ok(!commandGroupSchema('agdf_closeout').required.includes('run_id'));
for (const entries of [[], Array.from({ length: 65 }, (_, i) => ({ run_id: `run-${i}`, outcome: 'abandoned', reason: 'x' })),
  [{ run_id: 'a', outcome: 'completed', reason: 'x' }], [{ run_id: 'a', outcome: 'abandoned' }], [{ run_id: 'a', outcome: 'abandoned', reason: 'x', approve: true }]])
  assert.ok(validateRunCommand('agdf_closeout', { ...preview, command: { kind: 'closure.preview', payload: { entries } } }).length, JSON.stringify(entries).slice(0, 80));
for (const payload of [{ preview_id: 'ABCDEFGH', confirmation: 'x' }, { preview_id: '0a1b2c3d' }, { preview_id: '0a1b2c3d', confirmation: 'x', run_id: 'a' }])
  assert.ok(validateRunCommand('agdf_closeout', { ...targetEnvelope, command: { kind: 'closure.apply', payload } }).length);
for (const kind of ['closure.preview', 'closure.apply']) {
  const contract = operationContract('agdf_closeout', kind);
  assert.equal(contract.available, true); assert.equal(contract.authorizes, false);
  assert.ok(!Object.hasOwn(contract.schema.properties, 'run_id') && !contract.schema.required.includes('expected_revision_id'));
  assert.equal(operationContract('agdf_record', kind).available, false);
}
assert.ok(operationContract('agdf_closeout', 'closeout.record').schema.required.includes('run_id'));
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

// SDK validates the compact discovery projection; Core keeps its expanded
// own-data model. Cover every kind, not just a hand-written happy path.
const { fromJsonSchema } = await import('../../mcp-server/node_modules/@modelcontextprotocol/server/dist/index.mjs');
const { schemaDiagnostics, validateRunCommandResult, commandResultSchema } = await import('../lib/control-state/run-command-contract.js');
const sample = (schema) => {
  if (schema.oneOf) return sample(schema.oneOf[0]);
  if (Object.hasOwn(schema, 'const')) return schema.const;
  if (schema.enum) return schema.enum[0];
  if (schema.type === 'object') return Object.fromEntries(schema.required.map(key => [key, sample(schema.properties[key])]));
  if (schema.pattern?.includes('sha256')) return 'sha256:' + 'c'.repeat(64);
  if (schema.pattern?.includes('[0-9a-f]{8}')) return 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  return 'fixture';
};
let parityCases = 0;
for (const [group, kinds] of Object.entries(RUN_COMMAND_GROUPS)) {
  const expanded = commandGroupSchema(group), definition = commandGroupDefinition(group);
  assert.ok(definition.outputSchema);
  for (const field of Object.values(definition.inputSchema.properties)) assert.ok(field.description?.length > 10);
  const sdk = fromJsonSchema(definition.inputSchema)['~standard'];
  for (const kind of kinds) {
    const payload = sample(operationContract(group, kind).payload_schema);
    const valid = { ...input, command: { kind, payload } };
    for (const value of [valid, { ...valid, injected: 'effect' }, { ...valid, operation_id: 'not-a-uuid' },
      { ...valid, assurance: 'permission' }, { ...valid, command: { ...valid.command, payload: { ...payload, injected: true } } }]) {
      const actual = sdk.validate(value);
      assert.equal(Boolean(actual.issues?.length), schemaDiagnostics(value, expanded).length > 0, `${group}/${kind}`);
      parityCases++;
    }
  }
}
const success = { schema_version: '1', outcome: 'accepted', authorizes: false, reason: null,
  operation_id: input.operation_id, request_digest: 'sha256:' + 'a'.repeat(64),
  binding: { target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id, kind: input.command.kind },
  receipt: null, effect: null, current: { available: true }, assurance: { lane: 'cooperative_local', reply_provenance: 'caller_forwarded_deliberate_reply', independent_human_proof: 'unavailable' }, historical_effect: false, recovery: null, family_result: {} };
const output = fromJsonSchema(commandResultSchema())['~standard'];
for (const value of [success, { ...success, outcome: 'already_applied', receipt: {} },
  { schema_version: '1', outcome: 'rejected', reason: 'command_schema_invalid', diagnostics: [], authorizes: false },
  { schema_version: '1', outcome: 'effect_unknown', reason: 'resource_limit', operation_id: null, binding: null, authorizes: false, recovery: 'Inspect original operation.' }]) {
  assert.deepEqual(validateRunCommandResult(value), []);
  assert.equal(output.validate(value).issues, undefined);
}
for (const delta of [{ operation_id: null }, { binding: null }, { receipt: [] }, { authorizes: true }, { outcome: 'success' },
  { current: null }, { historical_effect: 'false' }, { assurance: 'caller' }, { assurance: {} }, { current: [] }, { current: { available: 'yes' } }, { current: { available: true, revision: 1.5 } }, { presentation_delivery: { text: 'unbound' } }]) {
  assert.ok(validateRunCommandResult({ ...success, ...delta }).length, JSON.stringify(delta));
}
assert.ok(validateRunCommandResult({ schema_version: '1', outcome: 'rejected', authorizes: false }).length);
assert.ok(validateRunCommandResult({ ...success, outcome: 'effect_unknown', reason: null }).length);
console.log(`Expanded/compact SDK parity (${parityCases} cases), direct field help, five output schemas and legitimate/malformed result variants passed.`);

assert.ok(validateRunCommandResult({ schema_version: '1', outcome: 'effect_unknown', reason: 'dispatch_worker_failed', authorizes: false }).length, 'uncertainty retains original-operation field and recovery guidance');
