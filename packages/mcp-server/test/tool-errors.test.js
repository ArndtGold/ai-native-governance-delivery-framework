import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient, unresolvedArguments } from './helpers.js';
import { createTestRuntime } from './runtime-fixture.js';
import { buildAgdfServer } from '../src/server.js';
import { DispatchExecutionError, createWorkerDispatchExecutor } from '../src/worker.js';

function failed(reply, code) {
  assert.equal(reply.isError, true, JSON.stringify(reply));
  assert.ok(reply.structuredContent, JSON.stringify(reply));
  assert.equal(reply.content.length, 2);
  assert.deepEqual(JSON.parse(reply.content[0].text), reply.structuredContent);
  assert.match(reply.content[1].text, new RegExp(code));
  assert.ok(!JSON.stringify(reply).includes('agdf/tool-result'), 'private descriptor is consumed');
  assert.ok(reply.content[1].text.length <= 1200);
}
for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture();
  try {
    await withStdioClient({ ...fixture, modern }, async client => {
      failed(await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments }), 'no_reliable_target');
      failed(await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'en', working_directory: '/tmp' } }), 'no_reliable_target');
      const invalid = await client.callTool({ name: 'agdf_dispatch', arguments: { ...unresolvedArguments, skill_id: 'not-a-skill' } });
      failed(invalid, 'dispatch_input_invalid');
      assert.equal(invalid.structuredContent.diagnostics[0].field, 'skill_id');
      assert.match(invalid.content[1].text, /skill_id/);
      assert.ok(!/Repair|Reparier/.test(invalid.content[1].text));
      assert.equal(invalid.structuredContent.host_action.text, invalid.structuredContent.recovery.action);
      assert.ok(invalid.content[1].text.endsWith(invalid.structuredContent.recovery.action), 'reuse the owner correction without a conflicting terminal instruction');
      const source = { path: 'artefacts/absent.md', digest: 'sha256:' + 'a'.repeat(64) };
      const commands = {
        agdf_prepare: { kind: 'presentation.prepare', payload: { gate: 'TP' } },
        agdf_record: { kind: 'step.record', payload: { step: 'evidence', source, reason: 'fixture', covers: 'fixture' } },
        agdf_approve: { kind: 'approval.record', payload: { gate: 'TP', presentation_id: randomUUID(), response: 'Approval: TP' } },
        agdf_revise: { kind: 'source_revision.preview', payload: { source_gate: 'TP', proposal: source } },
        agdf_closeout: { kind: 'closeout.record', payload: { or: source, confirmation: 'fixture' } },
      };
      for (const [name, command] of Object.entries(commands)) {
        const reply = await client.callTool({ name, arguments: { schema_version: '1', presentation_language: 'en', working_directory: fixture.governanceTarget,
          primary_target: fixture.governanceTarget, target_source: 'explicit_target', target_id: 'sha256:' + 'b'.repeat(64),
          run_id: 'absent', expected_revision_id: randomUUID(), operation_id: randomUUID(), assurance: 'cooperative_local', command } });
        failed(reply, 'target_binding_mismatch'); assert.equal(reply.structuredContent.outcome, 'rejected');
      }
      const ok = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'en',
        working_directory: fixture.governanceTarget, primary_target: fixture.governanceTarget, target_source: 'explicit_target' } });
      assert.equal(ok.isError, undefined); assert.equal(ok.content.length, 1); assert.equal(ok.structuredContent.outcome, 'inspect_result');
      const schema = await client.callTool({ name: 'agdf_dispatch', arguments: {} });
      assert.equal(schema.isError, true); assert.equal(schema.structuredContent, undefined, 'SDK input errors keep their own contract');
      await assert.rejects(client.callTool({ name: 'unknown_tool', arguments: {} }), /not found|Unknown|unknown/);
      await assert.rejects(client.callTool({ name: 42, arguments: {} }), /invalid|Invalid|required|string/);
    });
    // Actual worker parse phase, bypassing only the SDK input validator.
    const { pathToFileURL } = await import('node:url');
    const { createWorkerDispatchExecutor: ownedExecutor } = await import(pathToFileURL(fixture.serverRoot + '/src/worker.js'));
    const worker = ownedExecutor({ surface: 'codex', expectedVersion: createTestRuntime().trustedContext.expectedVersion });
    try { await assert.rejects(worker.execute({ presentation_language: 'de', working_directory: '/tmp' }, { toolName: 'agdf_dispatch' }),
      error => error.code === 'dispatch_input_invalid' && error.dispatch === 'not_dispatched' && error.facts.field === 'skill_id'); }
    finally { await worker.close(); }
  } finally { fixture.dispose(); }
}

// Checked delivery under injected boundary faults; actual owned stdio above is
// the production seam. No fake result can bypass validation on isError paths.
async function injected(runtime, executor, check) {
  const server = buildAgdfServer({ runtime, executor }), client = new Client({ name: 'error-boundary-fixture', version: '1' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try { await server.connect(b); await client.connect(a); await check(client); }
  finally { await client.close(); await server.closeAgdfRuntime(); await server.close(); }
}
const runtime = createTestRuntime();
// Deferred compilation must preserve the SDK boundary on the first call too.
// A successful domain result still cannot bypass its registered output schema.
for (const modern of [false, true]) {
  const requiredOutput = { type: 'object', required: ['sdk_checked'], properties: { sdk_checked: { type: 'boolean' } } };
  const directory = mkdtempSync(join(tmpdir(), 'agdf-first-validation-'));
  const entry = join(directory, 'entry.mjs'), executed = join(directory, 'executions.log');
  writeFileSync(executed, '');
  // serveStdio owns modern discovery/negotiation. A hand-connected in-memory
  // SDK instance deliberately does not offer that era.
  writeFileSync(entry, `import { appendFileSync } from 'node:fs';
import { runMcpServer } from ${JSON.stringify(new URL('../src/main.js', import.meta.url).href)};
import { createTestRuntime } from ${JSON.stringify(new URL('./runtime-fixture.js', import.meta.url).href)};
const base = createTestRuntime();
const runtime = { ...base, tools: base.tools.map(tool => tool.name === 'agdf_dispatch'
  ? { ...tool, definition: { ...tool.definition, outputSchema: ${JSON.stringify(requiredOutput)} } } : tool) };
const executor = { execute: async () => { appendFileSync(${JSON.stringify(executed)}, 'executed\\n');
  return { ...base.failure('dispatch_busy'), outcome: 'control_result', terminal: false, recovery: null,
    host_action: { mode: 'continue_named_skill', source: 'continuation', bound_to_target: true } }; }, close: async () => {} };
await runMcpServer({ surface: 'codex', runtime, executor });
`);
  try { await withStdioClient({ args: [entry], modern }, async client => {
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.find(tool => tool.name === 'agdf_dispatch').outputSchema, requiredOutput);
    const invalid = await client.callTool({ name: 'agdf_dispatch', arguments: {} });
    assert.equal(invalid.isError, true); assert.equal(invalid.structuredContent, undefined);
    assert.equal(readFileSync(executed, 'utf8'), '', 'first invalid input cannot execute a tool');
    const invalidOutput = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments });
    assert.equal(invalidOutput.isError, true); assert.equal(invalidOutput.structuredContent, undefined);
    assert.equal(readFileSync(executed, 'utf8'), 'executed\n', 'the SDK rejects invalid successful output after one execution');
    const repeated = await client.callTool({ name: 'agdf_dispatch', arguments: {} });
    assert.equal(repeated.isError, true);
    assert.equal(readFileSync(executed, 'utf8'), 'executed\n', 'the retained validator still rejects invalid input');
  }); } finally { rmSync(directory, { recursive: true, force: true }); }
}
for (const raw of [
  { schema_version: '1', outcome: 'rejected', authorizes: false },
  { ...runtime.failure('dispatch_busy'), _meta: { 'agdf/tool-result': { failed: false } } },
]) await injected(runtime, { execute: async () => raw, close: async () => {} }, async client => {
  const reply = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments }); failed(reply, 'tool_result_invalid');
});
const malformedInspect = runtime.failure('dispatch_busy', 'agdf_inspect'); delete malformedInspect.operation;
await injected(runtime, { execute: async () => malformedInspect, close: async () => {} }, async client => {
  failed(await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'en', working_directory: '/tmp' } }), 'tool_result_invalid');
});
await injected(runtime, { execute: async () => { throw Error('/private/SECRET'); }, close: async () => {} }, async client => {
  const reply = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments });
  failed(reply, 'dispatch_worker_failed'); assert.ok(!JSON.stringify(reply).includes('SECRET'));
});
await injected({ ...runtime, requiresProjectedResult: true }, { execute: async () => runtime.failure('dispatch_busy'), close: async () => {} }, async client => {
  failed(await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments }), 'tool_result_invalid');
});
const huge = { ...runtime.failure('dispatch_busy'), padding: 'x'.repeat(5000) };
await injected({ ...runtime, responseLimit: 4000 }, { execute: async () => huge, close: async () => {} }, async client => {
  const reply = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments }); failed(reply, 'resource_limit');
  assert.ok(Buffer.byteLength(JSON.stringify(reply)) <= 4000);
});
const oversized = { ...runtime.failure('dispatch_busy'), control: { padding: 'x'.repeat(1024 * 1024) } };
await injected(runtime, { execute: async () => oversized, close: async () => {} }, async client => {
  const reply = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments }); failed(reply, 'dispatch_output_too_large');
  assert.equal(reply.structuredContent.recovery.action, reply.content[1].text);
  assert.equal(reply.structuredContent.host_action.text, reply.content[1].text);
  assert.ok(!/Repair|Reparier/.test(reply.content[1].text));
});
// Construction is known non-dispatch; handoff/exit is uncertain.
class CannotConstruct { constructor() { throw Error('PRIVATE'); } }
const setup = createWorkerDispatchExecutor({ WorkerClass: CannotConstruct });
await assert.rejects(setup.execute({}), error => error instanceof DispatchExecutionError && error.dispatch === 'not_dispatched');
console.log('MCP error contract: both protocol eras, seven actual owned stdio tool families, typed worker parse, independent error validation, safe faults and bounded fallback passed.');
