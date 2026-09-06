import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { SKILL_DISPATCH_FUNCTION_DEFINITION, createMcpDispatchRuntime } from "create-agdf/mcp-dispatch-runtime";
import { buildAgdfServer } from "../src/server.js";
import { unresolvedArguments } from "./helpers.js";
import { createTestRuntime } from "./runtime-fixture.js";

const runtime = createTestRuntime();
assert.throws(
  () => buildAgdfServer({ runtime: createMcpDispatchRuntime({ surface: "codex" }) }),
  /owned runtime is required/,
);
let calls = 0;
const executor = {
  async execute(argumentsValue) {
    calls += 1;
    return runtime.execute(runtime.parse(argumentsValue));
  },
  async close() {},
};
const server = buildAgdfServer({ runtime, executor });
const client = new Client({ name: "contract-test", version: "1.0.0" });
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await server.connect(serverTransport);
await client.connect(clientTransport);

const { tools } = await client.listTools();
assert.equal(tools.length, 1);
assert.equal(tools[0].name, SKILL_DISPATCH_FUNCTION_DEFINITION.name);
assert.equal(tools[0].description, SKILL_DISPATCH_FUNCTION_DEFINITION.description);
assert.deepEqual(tools[0].inputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema);
assert.deepEqual(tools[0].outputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.outputSchema);
assert.deepEqual(tools[0].annotations, SKILL_DISPATCH_FUNCTION_DEFINITION.annotations);

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

await assert.rejects(client.callTool({ name: "unknown_tool", arguments: {} }));
assert.equal(calls, 1, "unknown tools must not reach the dispatcher executor");

await client.close();
await server.closeAgdfRuntime();
await server.close();
console.log("AGDF MCP semantic contract tests passed.");
