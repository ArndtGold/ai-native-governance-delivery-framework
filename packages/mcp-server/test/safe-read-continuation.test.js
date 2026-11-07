import assert from 'node:assert/strict';
import { appendSafeReadContinuation, suppliedReadContinuation, nextActionOutputSchema } from '../src/safe-read-continuation.js';

const call = { tool: 'agdf_inspect', arguments: { operation: 'authoring-inputs', bundle: true,
  primary_target: '/confirmed', target_source: 'explicit_target', run_id: 'run-exact', expected_revision_id: 'original' } };
const outerRead = { outcome: 'inspect_result', operation: 'gate-check', terminal: false,
  report: { available: true, marker: 'original read result' }, next_calls: [call] };
const accepted = { outcome: 'accepted', operation_id: 'write-original', receipt: { exact: true },
  current: { revision_id: 'original' }, next_calls: [call] };
const inspected = { outcome: 'inspect_result', terminal: false, report: { available: true } };
let reads = 0;
const observed = await appendSafeReadContinuation(outerRead, { validate: () => true, execute: async supplied => {
  reads++; assert.deepEqual(supplied, call); return inspected;
} });
assert.equal(reads, 1);
assert.deepEqual(observed.report, outerRead.report);
assert.deepEqual(observed.next_read, { ...call, result: inspected, authorizes: false });
assert.equal(outerRead.next_read, undefined);
for (const outcome of ['accepted', 'already_applied'])
  assert.equal(suppliedReadContinuation({ ...accepted, outcome }), null,
    'A write receipt returns at once; its next read stays a supplied call.');
assert.equal((await appendSafeReadContinuation(accepted, { validate: () => true, execute: () => { throw Error('never'); } })).next_read, undefined);
assert.equal(suppliedReadContinuation({ ...outerRead, terminal: true }), null);
assert.equal(suppliedReadContinuation({ ...outerRead, outcome: 'rejected' }), null);
assert.equal(suppliedReadContinuation({ ...outerRead, outcome: 'effect_unknown' }), null);
assert.equal(suppliedReadContinuation({ ...outerRead, operation: 'authoring-inputs',
  report: { available: true, complete: false, next_calls: [call] } }), null,
  'Source pagination stays explicit and cannot hide the first-page form behind a nested page.');
const setupContractCall = { tool: 'agdf_inspect', arguments: { operation: 'operation-contract', module: 'agdf_project/project.initialize',
  primary_target: '/confirmed', target_source: 'explicit_target' } };
assert.equal(suppliedReadContinuation({ outcome: 'inspect_result', operation: 'project-state', terminal: false,
  report: { available: true, next_calls: [setupContractCall] } }), null,
  'Project-state keeps its compact bootstrap contract and exposes setup help as an explicit read.');
assert.deepEqual(suppliedReadContinuation({ outcome: 'inspect_result', operation: 'gate-check', terminal: false,
  report: { available: true, next_calls: [setupContractCall] } }), setupContractCall,
  'The compact project-state boundary does not disable other exact operation-contract continuations.');
for (const unsafe of [
  { tool: 'agdf_dispatch', arguments: { continue_delivery: true } },
  { tool: 'agdf_prepare', arguments: { command: { kind: 'presentation.deliver' } } },
  { tool: 'agdf_approve', arguments: { response: 'Approval: TP' } },
  { tool: 'agdf_inspect', arguments: { operation: 'presentation-document' } },
  { tool: 'agdf_inspect', arguments: { operation: 'operation-status' } },
]) assert.equal(suppliedReadContinuation({ ...outerRead, next_calls: [unsafe] }), null);
assert.equal(suppliedReadContinuation({ ...outerRead, next_calls: [call, { ...call, arguments: { ...call.arguments, run_id: 'other' } }] }), null);
assert.deepEqual(suppliedReadContinuation({ ...outerRead, next_calls: undefined, continuation: { next_calls: [call] } }), call,
  'A single supplied continuation read is one next action, not an inferred choice.');
assert.equal((await appendSafeReadContinuation(outerRead, { validate: () => false, execute: () => { throw Error('never'); } })).next_read, undefined);
assert.equal((await appendSafeReadContinuation(outerRead, { allowed: false, validate: () => true, execute: () => { throw Error('never'); } })).next_read, undefined);
const failed = await appendSafeReadContinuation(outerRead, { validate: () => true, execute: async () => { throw Error('read failed'); } });
assert.deepEqual(failed.report, outerRead.report);
assert.equal(failed.next_read.result, null);
assert.equal(failed.next_read.failure.original_effect_unchanged, true);
const invalidRead = await appendSafeReadContinuation(outerRead, { validate: () => { throw Error('validator failed'); },
  execute: () => { throw Error('must not execute'); } });
assert.deepEqual(invalidRead.report, outerRead.report);
assert.equal(invalidRead.next_read.failure.phase, 'validation');
const outer = await appendSafeReadContinuation(outerRead, { validate: () => true, execute: async () => ({ ...inspected, report: { next_calls: [call] } }) });
assert.equal(outer.next_read.result.next_read, undefined, 'One automatic inspect step, never recursive execution.');
const closed = { type: 'object', additionalProperties: false, properties: { outcome: { type: 'string' } } };
assert.equal(nextActionOutputSchema('agdf_record', closed), closed);
assert.equal(nextActionOutputSchema('agdf_dispatch', closed).additionalProperties, false);
assert.equal(closed.properties.next_action, undefined);
console.log('Exact safe inspect continuation for reads only, no automatic dispatch/write/approval and bounded execution passed.');

// Exercise the actual SDK/server response boundary with injected results.
// These are isolated boundary fixtures, not installed-host evidence.
const [{ Client }, { InMemoryTransport }, { buildAgdfServer }, { createTestRuntime }, { COOPERATIVE_ASSURANCE }] = await Promise.all([
  import('@modelcontextprotocol/client'), import('@modelcontextprotocol/server'), import('../src/server.js'),
  import('./runtime-fixture.js'), import('../../core/lib/control-state/approval-command-contract.js'),
]);
const actualRuntime = createTestRuntime();
const base = { presentation_language: 'en', working_directory: '/tmp/wire-budget-fixture', primary_target: '/tmp/wire-budget-fixture',
  target_source: 'explicit_target', run_id: 'wire-budget-fixture' };
const revision = '00000000-0000-4000-8000-000000000003';
const outerRequest = { ...base, operation: 'gate-check' };
const followCall = { tool: 'agdf_inspect', arguments: { ...base, operation: 'operation-contract', module: 'agdf_record/step.record', expected_revision_id: revision } };
const readEnvelope = (operation, report, args) => ({ ...actualRuntime.failure('dispatch_busy', 'agdf_inspect', args),
  outcome: 'inspect_result', operation, terminal: false, recovery: null, presentation: null,
  target: { resolution_state: 'resolved' }, report, diagnostics: [],
  timing: { wrapper_ms: 0, input_ms: 0, target_ms: 0, control_ms: 0, render_ms: 0, total_ms: 0 },
  host_action: { mode: 'consume_report_and_continue', source: 'report', allow_surrounding_text: true, may_request_run_or_evidence: false } });
const outerResult = readEnvelope('gate-check', { available: true, marker: 'Exact original read result', next_calls: [followCall] }, outerRequest);
const followWrite = { tool: 'agdf_record', arguments: { schema_version: '1', assurance: 'cooperative_local', ...base,
  target_id: 'sha256:' + 'a'.repeat(64), expected_revision_id: revision, operation_id: '00000000-0000-4000-8000-000000000004',
  command: { kind: 'step.record', payload: { step: 'evidence', source: { path: 'evidence.txt', digest: 'sha256:' + 'b'.repeat(64) },
    reason: 'Synthetic follow-up form', covers: 'wire-budget' } } } };
const followResult = ({ padding = 0, preparedCall = false } = {}) => readEnvelope('operation-contract', { available: true,
  ...(padding ? { padding: 'x'.repeat(padding) } : {}),
  ...(preparedCall ? { group: 'agdf_record', kind: 'step.record', prepared_call: { state: 'ready', call: followWrite, required_inputs: [], authorizes: false } } : {}) },
  followCall.arguments);

async function readReply({ limit = 1024 * 1024, padding = 20000, storeFailure } = {}) {
  let outerReads = 0, followReads = 0, registrations = 0;
  const runtime = { ...actualRuntime, responseLimit: limit, prepareInput: undefined, prepareDispatch: undefined, postprocessToolResult: undefined };
  const executor = { async execute(input, { toolName }) {
    assert.equal(toolName, 'agdf_inspect');
    if (input.operation === 'gate-check') { outerReads++; assert.deepEqual(input, outerRequest); return structuredClone(outerResult); }
    followReads++; assert.deepEqual(input, followCall.arguments);
    return structuredClone(followResult({ padding: storeFailure ? 0 : padding, preparedCall: !!storeFailure }));
  }, async close() {} };
  const preparedCallStore = storeFailure ? {
    load() { return { state: 'reference_unknown' }; },
    register() { registrations++; throw Error(storeFailure); },
  } : undefined;
  return withServer({ runtime, executor, preparedCallStore }, async client => ({
    reply: await client.callTool({ name: 'agdf_inspect', arguments: outerRequest }), outerReads, followReads, registrations }));
}
async function withServer(options, use) {
  const server = buildAgdfServer(options), client = new Client({ name: 'wire-budget-boundary-fixture', version: '1' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try { await server.connect(b); await client.connect(a); return await use(client); }
  finally { await client.close(); await server.closeAgdfRuntime(); await server.close(); }
}
const size = reply => Buffer.byteLength(JSON.stringify(reply));
const assertOriginal = reply => {
  assert.equal(reply.isError, undefined, JSON.stringify(reply).slice(0, 2000));
  assert.equal(reply.structuredContent.outcome, 'inspect_result');
  assert.equal(reply.structuredContent.report.marker, outerResult.report.marker);
};

const full = await readReply();
assertOriginal(full.reply);
assert.equal(full.outerReads, 1); assert.equal(full.followReads, 1);
assert.equal(full.reply.structuredContent.next_read.result.outcome, 'inspect_result');

const oversized = await readReply({ padding: 60 * 1024 });
assertOriginal(oversized.reply);
assert.equal(oversized.followReads, 1, 'An oversized follow-up is never executed again to obtain a smaller result.');
assert.equal(oversized.reply.structuredContent.next_read.result, null,
  'A follow-up beyond the inline budget stays a separate read instead of pushing the response into host file offloading.');
assert.equal(oversized.reply.structuredContent.next_read.failure.phase, 'wire_budget');
assert.equal(oversized.reply.structuredContent.next_action.state, 'read_required');
assert.deepEqual(oversized.reply.structuredContent.next_action.call, oversized.reply.structuredContent.next_read.call);

const limited = await readReply({ limit: size(full.reply) - 1 });
assertOriginal(limited.reply);
assert.equal(limited.outerReads, 1); assert.equal(limited.followReads, 1);
assert.equal(limited.reply.structuredContent.next_read.result, null);
assert.equal(limited.reply.structuredContent.next_read.failure.original_effect_unchanged, true);
assert.deepEqual(limited.reply.structuredContent.next_read.recovery_only.original_call, followCall);
assert.deepEqual(limited.reply.structuredContent.next_read.arguments, followCall.arguments,
  'The executed read remains a Raw observation; its normal retry is a separate retained call.');
assert.ok(size(limited.reply) < size(full.reply));

const plain = await readReply({ limit: size(limited.reply) - 1 });
assertOriginal(plain.reply);
assert.equal(plain.reply.structuredContent.next_read, undefined,
  'When no additive failure framing fits, the original result is preserved before any whole-result budget failure.');
assert.ok(size(plain.reply) < size(limited.reply));
console.log('Actual SDK read boundary: inline budget, wire fallback and single execution of each read passed.');

for (const [failure, reason] of [['EIO', 'prepared_call_store_unavailable'], ['runtime_provenance_invalid', 'runtime_provenance_invalid']]) {
  const failedStorage = await readReply({ storeFailure: failure });
  const result = failedStorage.reply.structuredContent;
  assertOriginal(failedStorage.reply);
  assert.ok(failedStorage.registrations > 0);
  assert.equal(failedStorage.followReads, 1, 'Failed continuation registration never repeats its completed read.');
  assert.equal(result.next_read.result.outcome, 'inspect_result');
  assert.deepEqual(result.next_read.arguments, followCall.arguments, 'The actual executed read remains observable.');
  assert.equal(result.next_read.call, null);
  assert.equal(result.next_read.transport_reason, reason);
  assert.deepEqual(result.next_read.recovery_only.original_call, followCall);
  const unavailable = result.next_read.result.report.prepared_call;
  assert.equal(unavailable.state, 'transport_unavailable');
  assert.equal(unavailable.call, null);
  assert.equal(unavailable.transport_reason, reason);
  assert.deepEqual(unavailable.recovery_only.original_call, followWrite);
  assert.equal(unavailable.authorizes, false);
  assert.equal(result.next_action.state, 'requires_source');
  assert.equal(result.next_action.call, null, 'No reconstructed Raw write becomes the normal path.');
}
console.log('Actual SDK storage-failure boundary preserves the original read, exact recovery and single read execution.');

// A committed write returns its receipt at once. When the transport decoration
// (recovery copies of large forms) exceeds the limit, the undecorated canonical
// result is returned instead of turning the committed write into resource_limit.
const writeRequest = { schema_version: '1', assurance: 'cooperative_local', ...base, target_id: 'sha256:' + 'a'.repeat(64),
  expected_revision_id: '00000000-0000-4000-8000-000000000001', operation_id: '00000000-0000-4000-8000-000000000002',
  command: { kind: 'step.record', payload: { step: 'evidence', source: { path: 'evidence.txt', digest: 'sha256:' + 'b'.repeat(64) },
    reason: 'Synthetic committed write for response-boundary test', covers: 'wire-budget' } } };
const receipt = { operation_id: writeRequest.operation_id, marker: 'Exact committed receipt' };
const largeForm = { slot: 'CR', state: 'requires_author_input', authorizes: false, required_inputs: ['/command/payload/decision'],
  call: { tool: 'agdf_record', arguments: { ...followWrite.arguments, command: { kind: 'step.record',
    payload: { step: 'review', source: { material_id: '00000000-0000-4000-8000-000000000005', digest: 'sha256:' + 'c'.repeat(64) },
      note: 'y'.repeat(30000) } } } } };
const acceptedWrite = { schema_version: '1', outcome: 'accepted', reason: null, authorizes: false,
  operation_id: writeRequest.operation_id, request_digest: 'sha256:' + 'c'.repeat(64), receipt,
  binding: { target_id: writeRequest.target_id, run_id: writeRequest.run_id, expected_revision_id: writeRequest.expected_revision_id, kind: 'step.record' },
  effect: { committed: true }, current: { available: true, revision_id: revision },
  assurance: COOPERATIVE_ASSURANCE, historical_effect: false, recovery: null, family_result: {},
  next_calls: [followCall], recording_calls: [largeForm] };
async function writeReply(limit) {
  let writes = 0, reads = 0;
  const runtime = { ...actualRuntime, responseLimit: limit, prepareInput: undefined, prepareDispatch: undefined, postprocessToolResult: undefined };
  const executor = { async execute(input, { toolName }) {
    if (toolName === 'agdf_record') { writes++; assert.deepEqual(input, writeRequest); return structuredClone(acceptedWrite); }
    reads++; return structuredClone(followResult());
  }, async close() {} };
  return withServer({ runtime, executor }, async client => ({ reply: await client.callTool({ name: 'agdf_record', arguments: writeRequest }), writes, reads }));
}
const decorated = await writeReply(1024 * 1024);
assert.equal(decorated.writes, 1); assert.equal(decorated.reads, 0, 'A write never executes a follow-up read.');
assert.equal(decorated.reply.structuredContent.next_read, undefined);
assert.ok(decorated.reply.structuredContent.recording_calls[0].recovery_only, 'The normal response carries the transport form.');
const undecorated = await writeReply(size(decorated.reply) - 1);
assert.equal(undecorated.writes, 1);
assert.equal(undecorated.reply.isError, undefined, JSON.stringify(undecorated.reply).slice(0, 2000));
assert.equal(undecorated.reply.structuredContent.outcome, 'accepted', 'Decoration never turns a committed write into resource_limit.');
assert.deepEqual(undecorated.reply.structuredContent.receipt, receipt);
assert.deepEqual(undecorated.reply.structuredContent.recording_calls[0].call, largeForm.call);
assert.ok(size(undecorated.reply) < size(decorated.reply));
console.log('Actual SDK write boundary: immediate receipt without follow-up read and decoration fallback before resource_limit passed.');
