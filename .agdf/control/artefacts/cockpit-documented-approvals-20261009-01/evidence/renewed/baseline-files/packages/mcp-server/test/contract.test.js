import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { SKILL_DISPATCH_FUNCTION_DEFINITION, createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";
import { buildAgdfServer } from "../src/server.js";
import {
  INVALID_PRESENTATION_LANGUAGE_CASES,
  argumentsForLanguageCase,
} from "../../cli/scripts/fixtures/skill-dispatch-language.js";
import { unresolvedArguments } from "./helpers.js";
import { createTestRuntime } from "./runtime-fixture.js";

const runtime = createTestRuntime();
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
assert.equal(tools.length, 2);
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
  assert.equal(accepted.isError, undefined, JSON.stringify(selection));
  assert.equal(accepted.structuredContent.authorizes, false);
  assert.equal(accepted.structuredContent.terminal, true, "unresolved targets stop");
  assert.equal(accepted.structuredContent.host_action.mode, "transmit_presentation_verbatim_and_stop");
  assert.equal(calls, before + 1);
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
