import assert from 'node:assert/strict';
import { appendSafeReadContinuation, suppliedReadContinuation, nextActionOutputSchema } from '../src/safe-read-continuation.js';

const call = { tool: 'agdf_inspect', arguments: { operation: 'authoring-inputs', bundle: true,
  primary_target: '/confirmed', target_source: 'explicit_target', run_id: 'run-exact', expected_revision_id: 'original' } };
const accepted = { outcome: 'accepted', operation_id: 'write-original', receipt: { exact: true },
  current: { revision_id: 'original' }, next_calls: [call] };
const inspected = { outcome: 'inspect_result', terminal: false, report: { available: true } };
let reads = 0;
const observed = await appendSafeReadContinuation(accepted, { validate: () => true, execute: async supplied => {
  reads++; assert.deepEqual(supplied, call); return inspected;
} });
assert.equal(reads, 1);
assert.deepEqual(observed.receipt, accepted.receipt);
assert.equal(observed.operation_id, 'write-original');
assert.deepEqual(observed.next_read, { ...call, result: inspected, authorizes: false });
assert.equal(accepted.next_read, undefined);
assert.equal(suppliedReadContinuation({ ...accepted, terminal: true }), null);
assert.equal(suppliedReadContinuation({ ...accepted, outcome: 'rejected' }), null);
assert.equal(suppliedReadContinuation({ ...accepted, outcome: 'effect_unknown' }), null);
assert.equal(suppliedReadContinuation({ ...accepted, outcome: 'inspect_result', operation: 'authoring-inputs',
  report: { available: true, complete: false, next_calls: [call] } }), null,
  'Source pagination stays explicit and cannot hide the first-page form behind a nested page.');
const setupContractCall = { tool: 'agdf_inspect', arguments: { operation: 'operation-contract', module: 'agdf_project/project.initialize',
  primary_target: '/confirmed', target_source: 'explicit_target' } };
assert.equal(suppliedReadContinuation({ outcome: 'inspect_result', operation: 'project-state', terminal: false,
  report: { available: true, next_calls: [setupContractCall] } }), null,
  'Project-state keeps its compact bootstrap contract and exposes setup help as an explicit read.');
assert.equal(suppliedReadContinuation({ ...accepted, binding: { kind: 'project.initialize' }, next_calls: [setupContractCall] }), null,
  'Initialization keeps its compact receipt while the sole normal Run contract remains an explicit read.');
assert.deepEqual(suppliedReadContinuation({ outcome: 'inspect_result', operation: 'gate-check', terminal: false,
  report: { available: true, next_calls: [setupContractCall] } }), setupContractCall,
  'The compact project-state boundary does not disable other exact operation-contract continuations.');
for (const unsafe of [
  { tool: 'agdf_dispatch', arguments: { continue_delivery: true } },
  { tool: 'agdf_prepare', arguments: { command: { kind: 'presentation.deliver' } } },
  { tool: 'agdf_approve', arguments: { response: 'Approval: TP' } },
  { tool: 'agdf_inspect', arguments: { operation: 'presentation-document' } },
  { tool: 'agdf_inspect', arguments: { operation: 'operation-status' } },
]) assert.equal(suppliedReadContinuation({ ...accepted, next_calls: [unsafe] }), null);
assert.equal(suppliedReadContinuation({ ...accepted, next_calls: [call, { ...call, arguments: { ...call.arguments, run_id: 'other' } }] }), null);
assert.deepEqual(suppliedReadContinuation({ ...accepted, continuation: { next_calls: [call] } }), call,
  'Identical aliases are one next action, not an inferred choice.');
assert.equal((await appendSafeReadContinuation(accepted, { validate: () => false, execute: () => { throw Error('never'); } })).next_read, undefined);
assert.equal((await appendSafeReadContinuation(accepted, { allowed: false, validate: () => true, execute: () => { throw Error('never'); } })).next_read, undefined);
const failed = await appendSafeReadContinuation(accepted, { validate: () => true, execute: async () => { throw Error('read failed'); } });
assert.equal(failed.outcome, 'accepted');
assert.equal(failed.next_read.result, null);
assert.equal(failed.next_read.failure.original_effect_unchanged, true);
assert.equal(failed.operation_id, accepted.operation_id);
const invalidRead = await appendSafeReadContinuation(accepted, { validate: () => { throw Error('validator failed'); },
  execute: () => { throw Error('must not execute'); } });
assert.equal(invalidRead.outcome, 'accepted');
assert.deepEqual(invalidRead.receipt, accepted.receipt);
assert.equal(invalidRead.next_read.failure.phase, 'validation');
assert.equal(invalidRead.next_read.failure.original_effect_unchanged, true);
const outer = await appendSafeReadContinuation(accepted, { validate: () => true, execute: async () => ({ ...inspected, report: { next_calls: [call] } }) });
assert.equal(outer.next_read.result.next_read, undefined, 'One automatic inspect step, never recursive execution.');
const closed = { type: 'object', additionalProperties: false, properties: { outcome: { type: 'string' } } };
assert.equal(nextActionOutputSchema('agdf_record', closed), closed);
assert.equal(nextActionOutputSchema('agdf_dispatch', closed).additionalProperties, false);
assert.equal(closed.properties.next_action, undefined);
console.log('Exact safe inspect continuation, no automatic dispatch/write/approval, original-effect preservation and bounded execution passed.');

// Exercise the actual SDK/server response boundary with an injected committed
// result. These are isolated boundary fixtures, not installed-host evidence.
const [{ Client }, { InMemoryTransport }, { buildAgdfServer }, { createTestRuntime }, { COOPERATIVE_ASSURANCE }] = await Promise.all([
  import('@modelcontextprotocol/client'), import('@modelcontextprotocol/server'), import('../src/server.js'),
  import('./runtime-fixture.js'), import('../../core/lib/control-state/approval-command-contract.js'),
]);
const actualRuntime = createTestRuntime();
const request = { schema_version: '1', assurance: 'cooperative_local', presentation_language: 'en',
  working_directory: '/tmp/wire-budget-fixture', primary_target: '/tmp/wire-budget-fixture', target_source: 'explicit_target',
  target_id: 'sha256:' + 'a'.repeat(64), run_id: 'wire-budget-fixture',
  expected_revision_id: '00000000-0000-4000-8000-000000000001', operation_id: '00000000-0000-4000-8000-000000000002',
  command: { kind: 'step.record', payload: { step: 'evidence', source: { path: 'evidence.txt', digest: 'sha256:' + 'b'.repeat(64) },
    reason: 'Synthetic committed write for response-boundary test', covers: 'wire-budget' } } };
const readCall = { tool: 'agdf_inspect', arguments: { operation: 'gate-check', presentation_language: 'en',
  working_directory: request.working_directory, primary_target: request.primary_target, target_source: request.target_source, run_id: request.run_id } };
const receipt = { operation_id: request.operation_id, marker: 'Exact committed receipt before optional read' };
const acceptedWrite = { schema_version: '1', outcome: 'accepted', reason: null, authorizes: false,
  operation_id: request.operation_id, request_digest: 'sha256:' + 'c'.repeat(64), receipt,
  binding: { target_id: request.target_id, run_id: request.run_id, expected_revision_id: request.expected_revision_id, kind: 'step.record' },
  effect: { committed: true }, current: { available: true, revision_id: '00000000-0000-4000-8000-000000000003' },
  assurance: COOPERATIVE_ASSURANCE, historical_effect: false, recovery: null, family_result: {}, next_calls: [readCall] };
const largeRead = { ...actualRuntime.failure('dispatch_busy', 'agdf_inspect', readCall.arguments),
  outcome: 'inspect_result', operation: 'gate-check', terminal: false, recovery: null, presentation: null,
  target: { resolution_state: 'resolved' }, report: { available: true, padding: 'x'.repeat(20000) }, diagnostics: [],
  timing: { wrapper_ms: 0, input_ms: 0, target_ms: 0, control_ms: 0, render_ms: 0, total_ms: 0 },
  host_action: { mode: 'consume_report_and_continue', source: 'report', allow_surrounding_text: true, may_request_run_or_evidence: false } };
async function boundaryReply({ autoRead, limit }) {
  let writes = 0, reads = 0;
  const runtime = { ...actualRuntime, responseLimit: limit, prepareInput: undefined, prepareDispatch: undefined, postprocessToolResult: undefined,
    tools: actualRuntime.tools.map(tool => tool.name === 'agdf_inspect' ? { ...tool, definition: { ...tool.definition,
      annotations: { ...tool.definition.annotations, readOnlyHint: autoRead } } } : tool) };
  const executor = { async execute(input, { toolName }) {
    if (toolName === 'agdf_record') { writes++; return structuredClone(acceptedWrite); }
    assert.equal(toolName, 'agdf_inspect'); assert.deepEqual(input, readCall.arguments);
    reads++; return structuredClone(largeRead);
  }, async close() {} };
  const server = buildAgdfServer({ runtime, executor }), client = new Client({ name: 'wire-budget-boundary-fixture', version: '1' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(b); await client.connect(a);
    const reply = await client.callTool({ name: 'agdf_record', arguments: request });
    return { reply, writes, reads };
  } finally { await client.close(); await server.closeAgdfRuntime(); await server.close(); }
}
const baseline = await boundaryReply({ autoRead: false, limit: 1024 * 1024 });
assert.equal(baseline.reply.isError, undefined); assert.equal(baseline.writes, 1); assert.equal(baseline.reads, 0);
const wireLimit = Buffer.byteLength(JSON.stringify(baseline.reply)) + 5000;
const limited = await boundaryReply({ autoRead: true, limit: wireLimit });
assert.equal(limited.writes, 1, 'Wire fallback never repeats the original accepted write.');
assert.equal(limited.reads, 1, 'Wire fallback never executes the read again to obtain a smaller result.');
assert.equal(limited.reply.isError, undefined, JSON.stringify(limited.reply));
assert.equal(limited.reply.structuredContent.outcome, 'accepted');
assert.deepEqual(limited.reply.structuredContent.receipt, receipt);
assert.equal(limited.reply.structuredContent.operation_id, request.operation_id);
assert.equal(limited.reply.structuredContent.next_read.result, null);
assert.equal(limited.reply.structuredContent.next_read.failure.phase, 'wire_budget');
assert.equal(limited.reply.structuredContent.next_read.failure.original_effect_unchanged, true);
assert.equal(limited.reply.structuredContent.next_action.state, 'read_required');
assert.deepEqual(limited.reply.structuredContent.next_action.call, readCall);
assert.ok(Buffer.byteLength(JSON.stringify(limited.reply)) <= wireLimit);
const exactLimit = Buffer.byteLength(JSON.stringify(baseline.reply));
const noDiagnosticRoom = await boundaryReply({ autoRead: true, limit: exactLimit });
assert.equal(noDiagnosticRoom.writes, 1); assert.equal(noDiagnosticRoom.reads, 1);
assert.equal(noDiagnosticRoom.reply.isError, undefined);
assert.equal(noDiagnosticRoom.reply.structuredContent.outcome, 'accepted');
assert.deepEqual(noDiagnosticRoom.reply.structuredContent.receipt, receipt);
assert.equal(noDiagnosticRoom.reply.structuredContent.next_read, undefined,
  'When no additive failure framing fits, preserve the original result before reporting any whole-result budget failure.');
assert.ok(Buffer.byteLength(JSON.stringify(noDiagnosticRoom.reply)) <= exactLimit);
console.log('Actual SDK wire-budget fallback preserves the accepted receipt and executes each write/read only once.');
