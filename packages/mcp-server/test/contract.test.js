import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { SKILL_DISPATCH_FUNCTION_DEFINITION, createMcpDispatchRuntime } from "../../cli/lib/mcp-dispatch-runtime.js";
import { createAgdfWorkerExecutor as workerFactory } from "../src/worker.js";
import { createAgdfWorkerExecutor as serverFactory } from "../src/server.js";
assert.equal(workerFactory, serverFactory, "the public server reexports its one canonical worker factory");
import { buildAgdfServer } from "../src/server.js";
import {
  INVALID_PRESENTATION_LANGUAGE_CASES,
  argumentsForLanguageCase,
} from "../../cli/scripts/fixtures/skill-dispatch-language.js";
import { unresolvedArguments } from "./helpers.js";
import { createTestRuntime } from "./runtime-fixture.js";
import { createMcpTransportRuntime, DECISION_UI_URI } from '../../cli/lib/mcp-protocol-runtime.js';
import { composeMcpDecisionProtocol } from '../../cli/lib/mcp-decision-protocol.js';
import { createMcpDecisionRuntime } from '../../cli/lib/mcp-dispatch-runtime.js';
import { generationManifest } from '../src/generation-protocol.js';

const runtime = createTestRuntime();
const inspected = { expectedVersion: runtime.trustedContext.expectedVersion, skillSet: runtime.trustedContext.skillSet,
  interactionLocales: runtime.trustedContext.interactionLocales, provenanceStatus: 'matched',
  runtimeEvidence: { machine_validation: 'test_fixture', plugin_root: null, runtime_digest: null, provenance_status: 'matched' } };
const thin = createMcpTransportRuntime({ surface: 'codex', inspected });
assert.deepEqual(thin.tools.map(t => t.definition), runtime.tools.map(t => t.definition));
assert.deepEqual(thin.tool('agdf_dispatch').parse(unresolvedArguments), runtime.tool('agdf_dispatch').parse(unresolvedArguments));
assert.throws(() => thin.execute(unresolvedArguments), error => error.code === 'generation_unavailable' && error.dispatch === 'not_dispatched');
for (const code of ['dispatch_busy', 'dispatch_timeout', 'runtime_provenance_invalid'])
  assert.deepEqual(thin.failure(code, 'agdf_inspect', unresolvedArguments, { elapsed_ms: 42 }),
    runtime.failure(code, 'agdf_inspect', unresolvedArguments, { elapsed_ms: 42 }));
const ui = { uri: DECISION_UI_URI, mimeType: 'text/html;profile=mcp-app', limit: 4194304, kind: 'decision', digest: 'structural-fixture' };
const thinDecision = composeMcpDecisionProtocol({ runtime: thin, ui });
const fullDecision = await createMcpDecisionRuntime({ runtime: createMcpDispatchRuntime({ surface: 'codex', inspected, verifyRuntime: () => {} }), ui });
assert.deepEqual(generationManifest(thinDecision, ui.digest, 'sdk-fixture'), generationManifest(fullDecision, ui.digest, 'sdk-fixture'));
assert.equal(thinDecision.delivery, undefined, 'a protocol front does not own decision or material sessions');
await fullDecision.close();
const frontUrl = new URL('../../cli/lib/mcp-protocol-runtime.js', import.meta.url).href;
const frontImport = spawnSync(process.execPath, ['--input-type=module', '--eval', `
  import { register } from 'node:module';
  const loader = "export async function load(url, context, next) { const forbidden = ['/lib/mcp-dispatch-runtime.js', '/control-inspect/decision-session.js', '/control-inspect/doctor-observation.js', '/control-inspect/cockpit-session.js', '/lib/mcp-decision-protocol.js', '/control-state/decision-action-contract.js', '/control-inspect/cockpit-contract.js', '/control-evaluation/doctor.js', '/control-evaluation/gate-check.js', '/control-inspect/artifact-readiness.js', '/control-state/run-command-contract.js']; if (url.endsWith('/lib/index.js') && url.includes('/core/') || forbidden.some(path => url.endsWith(path))) throw Error('duplicate_domain_runtime_import: ' + url); return next(url, context); }";
  register('data:text/javascript,' + encodeURIComponent(loader));
  const front = await import(${JSON.stringify(frontUrl)});
  console.log(front.createMcpTransportRuntime({ surface: 'codex' }).tools.length);
`], { encoding: 'utf8' });
assert.equal(frontImport.status, 0, frontImport.stderr);
assert.equal(frontImport.stdout.trim(), '9', 'thin import starts no Core/decision/diagnostic service composition');
assert.throws(
  () => buildAgdfServer({ runtime: createMcpDispatchRuntime({ surface: "codex" }) }),
  /owned runtime is required/,
);
let calls = 0;
const executor = {
  async execute(argumentsValue, { toolName } = {}) {
    calls += 1;
    const tool = runtime.tool(toolName ?? runtime.definition.name);
    return tool.execute(tool.parse(argumentsValue));
  },
  async close() {},
};
const server = buildAgdfServer({ runtime, executor });
const client = new Client({ name: "contract-test", version: "1.0.0" });
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await server.connect(serverTransport);
await client.connect(clientTransport);

const { tools } = await client.listTools();
assert.equal(tools.length, 9);
assert.equal(tools[1].name, "agdf_inspect");
assert.equal(tools[1].annotations.readOnlyHint, true);
assert.equal(tools[0].name, SKILL_DISPATCH_FUNCTION_DEFINITION.name);
assert.equal(tools[0].description, SKILL_DISPATCH_FUNCTION_DEFINITION.description);
assert.deepEqual(tools[0].inputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema);
assert.deepEqual(tools[0].outputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.outputSchema);
assert.deepEqual(tools[0].annotations, SKILL_DISPATCH_FUNCTION_DEFINITION.annotations);
assert.equal(tools[0].annotations.readOnlyHint, false);

const result = await client.callTool({ name: "agdf_dispatch", arguments: unresolvedArguments });
assert.equal(result.structuredContent.outcome, "target_unresolved");
assert.equal(result.structuredContent.authorizes, false);
assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
assert.equal(calls, 1);

const invalid = await client.callTool({
  name: "agdf_dispatch",
  arguments: { ...unresolvedArguments, executable: "/bin/sh" },
});
assert.equal(invalid.isError, true);
assert.equal(calls, 1, "schema-invalid arguments must not reach the dispatcher executor");

for (const row of INVALID_PRESENTATION_LANGUAGE_CASES) {
  const languageInvalid = await client.callTool({
    name: "agdf_dispatch",
    arguments: argumentsForLanguageCase(unresolvedArguments, row),
  });
  assert.equal(languageInvalid.isError, true, row.id);
}
assert.equal(calls, 1, "invalid presentation language must not reach the dispatcher executor");


for (const fields of [
  { intake: true, continue_delivery: true, run_id: "bound-run" },
  { intake_mode: "resume", run_id: "bound-run" },
  { expected_revision_id: "12345678-1234-4123-8123-123456789abc" },
  { continue_delivery: true },
]) {
  const rejected = await client.callTool({ name: "agdf_dispatch", arguments: { ...unresolvedArguments, ...fields } });
  assert.equal(rejected.isError, true, JSON.stringify(fields));
  assert.equal(calls, 1, "invalid dispatch dependencies must not reach executor");
}

const inspectBase = { operation: "doctor", presentation_language: "de", working_directory: "/tmp" };
for (const selection of [
  { operation: "gate-check", variant: "status-card", all_active: true },
  { operation: "doctor", variant: "status-card" },
  { operation: "doctor", module: "quality" },
  { operation: "contract" },
]) {
  const before = calls;
  const rejected = await client.callTool({ name: "agdf_inspect", arguments: { ...inspectBase, ...selection } });
  assert.equal(rejected.isError, true, JSON.stringify(selection));
  assert.equal(calls, before, "invalid operation dependencies must not reach executor");
}
for (const selection of [
  { operation: "doctor", all_active: true },
  { operation: "delivery-map", all_active: true },
  { operation: "gate-check", variant: "status-card", all_active: false },
  { operation: "contract", module: "quality", all_active: false },
]) {
  const before = calls;
  const accepted = await client.callTool({ name: "agdf_inspect", arguments: { ...inspectBase, ...selection } });
  assert.equal(accepted.isError, true, JSON.stringify(selection));
  assert.equal(accepted.structuredContent.authorizes, false);
  assert.equal(accepted.structuredContent.terminal, true, "unresolved targets stop");
  assert.equal(accepted.structuredContent.host_action.mode, "transmit_presentation_verbatim_and_stop");
  assert.equal(calls, before + (selection.operation === 'doctor' ? 0 : 1), 'diagnostic observations use the isolated parent read owner');
}
const inspectRepository = mkdtempSync(join(tmpdir(), "agdf-inspect-result-contract-"));
try {
  execFileSync("git", ["init", "--quiet", inspectRepository]);
  const success = await client.callTool({ name: "agdf_inspect", arguments: {
    ...inspectBase, working_directory: inspectRepository,
    target_source: "explicit_target", primary_target: inspectRepository,
  } });
  assert.equal(success.isError, undefined);
  assert.equal(success.structuredContent.outcome, "inspect_result");
  assert.equal(success.structuredContent.terminal, false);
  assert.equal(success.structuredContent.host_action.mode, "consume_report_and_continue");
  assert.equal(success.structuredContent.host_action.source, "report");
  assert.equal(success.structuredContent.host_action.allow_surrounding_text, true);
  assert.equal(success.structuredContent.recovery, null);
  assert.equal(typeof success.structuredContent.report, "object");
} finally {
  rmSync(inspectRepository, { recursive: true, force: true });
}
const completedCalls = calls;

const draft = artifactReadinessFixture();
try {
  writeFileSync(draft.path, readyPrd);
  const args = { operation: 'artifact-readiness', presentation_language: 'de', working_directory: draft.root,
    target_source: 'explicit_target', primary_target: draft.root, run_id: draft.runId, gate: 'PRD', expected_revision_id: draft.revision };
  const stateBefore = readFileSync(draft.runPath, 'utf8');
  const continuing = { skill_id: 'gate-check', presentation_language: 'de', working_directory: draft.root,
    target_source: 'explicit_target', primary_target: draft.root, run_id: draft.runId, continue_delivery: true };
  const disabled = createTestRuntime('codex', { commandGroups: [] });
  try {
    const fallback = disabled.execute(disabled.parse(continuing));
    const typed = runtime.execute(runtime.parse(continuing));
    assert.equal(fallback.continuation?.control_transport, 'cli_fallback', JSON.stringify(fallback));
    assert.equal(fallback.continuation.transport_reason, 'required_mcp_group_unavailable');
    assert.ok(fallback.continuation.missing_mcp_groups.every(group => !disabled.tools.some(tool => tool.name === group)));
    assert.equal(fallback.continuation.next_calls, undefined, 'disabled writers cannot be advertised as callable MCP operations');
    assert.equal(typed.continuation?.control_transport, 'typed_mcp', JSON.stringify(typed));
    assert.ok(typed.continuation.next_calls.length > 0);
    for (const call of typed.continuation.next_calls) {
      const next = await client.callTool({name:call.tool,arguments:call.arguments});
      assert.equal(next.isError,undefined,JSON.stringify(next));
      assert.equal(next.structuredContent.report.authorizes,false);
    }
    assert.equal(readFileSync(draft.runPath, 'utf8'), stateBefore);
  } finally { await disabled.close(); }
  const checked = await client.callTool({ name: 'agdf_inspect', arguments: args });
  assert.equal(checked.isError, undefined, JSON.stringify(checked));
  assert.equal(checked.structuredContent.outcome, 'inspect_result', JSON.stringify(checked));
  assert.equal(checked.structuredContent.report.ready, true);
  assert.equal(checked.structuredContent.report.authorizes, false);
  assert.equal(readFileSync(draft.runPath, 'utf8'), stateBefore, 'MCP must not register or approve the draft.');
  const stale = await client.callTool({ name: 'agdf_inspect', arguments: { ...args, expected_revision_id: '00000000-0000-4000-8000-000000000000' } });
  assert.equal(stale.structuredContent.report.ready, false);
  assert.equal(stale.structuredContent.report.diagnostics[0].code, 'artifact_revision_stale');
  writeFileSync(draft.path, readyPrd.replace('- AC-001: Die gewählte Quelle bleibt lesbar.\n', ''));
  const unready = await client.callTool({ name: 'agdf_inspect', arguments: args });
  assert.equal(unready.structuredContent.report.ready, false);
  assert.ok(unready.structuredContent.report.diagnostics.some(row => row.code.startsWith('approval_summary_')));
  for (const field of ['run_id', 'gate', 'expected_revision_id', 'primary_target', 'target_source']) {
    const incomplete = { ...args }; delete incomplete[field];
    const before = calls;
    const rejected = await client.callTool({ name: 'agdf_inspect', arguments: incomplete });
    assert.equal(rejected.isError, true, field);
    assert.equal(calls, before, 'Incomplete binding must not reach the executor.');
  }
} finally { rmSync(draft.root, { recursive: true, force: true }); }

assert.ok(calls > completedCalls, 'The real artifact inspections reached the executor.');
const beforeUnknown = calls;
await assert.rejects(client.callTool({ name: "unknown_tool", arguments: {} }));
assert.equal(calls, beforeUnknown, 'Unknown tools must not reach the executor.');

await client.close();
await server.closeAgdfRuntime();
await server.close();
console.log("AGDF MCP semantic contract tests passed.");

// The public Transport seam preserves context, send options and optional APIs;
// denied calls settle via the original channel and never enter SDK dispatch.
const { capabilityTransport } = await import('../src/ui-capability.js');
const sent = [], forwarded = [], failures = [], lifecycle = [];
const transport = { sessionId: 'first', hasPerRequestStream: true,
  async start() { lifecycle.push('start'); }, async close() { lifecycle.push('close'); this.onclose?.(); },
  async send(message, options) { if (message.id === 3) throw Error('send_failed'); sent.push({ message, options }); },
  setProtocolVersion(version) { lifecycle.push(version); }, setSupportedProtocolVersions(versions) { lifecycle.push(versions); } };
const decorated = capabilityTransport(transport, message => message.method === 'protected' ? { code: -32021, message: 'missing', data: { requiredCapabilities: {} } } : null);
decorated.onmessage = (message, extra) => forwarded.push({ message, extra });
decorated.onerror = error => failures.push(error.message);
decorated.onclose = () => lifecycle.push('closed');
await decorated.start(); decorated.sessionId = 'second';
assert.equal(transport.sessionId, 'second'); assert.equal(decorated.hasPerRequestStream, true);
decorated.setProtocolVersion('modern'); decorated.setSupportedProtocolVersions(['modern']);
const extra = { opaque: 'retained' }, ordinary = { method: 'notifications/cancelled', params: { requestId: 1 } };
transport.onmessage(ordinary, extra); assert.equal(forwarded[0].message, ordinary); assert.equal(forwarded[0].extra, extra);
const options = { relatedRequestId: 4 }; await decorated.send({ id: 4, result: {} }, options); assert.equal(sent[0].options, options);
transport.onmessage({ jsonrpc: '2.0', id: 2, method: 'protected' }, extra);
transport.onmessage({ jsonrpc: '2.0', id: 3, method: 'protected' }, extra);
await new Promise(resolve => setImmediate(resolve));
assert.equal(forwarded.length, 1); assert.equal(sent[1].message.id, 2); assert.equal(sent[1].message.error.code, -32021);
assert.deepEqual(failures, ['send_failed']);
await decorated.close(); assert.deepEqual(lifecycle, ['start', 'modern', ['modern'], 'close', 'closed']);
console.log('Public capability Transport callback/context/options/session/close/send-failure forwarding passed.');
