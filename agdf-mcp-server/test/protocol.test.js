import assert from "node:assert/strict";
import { SKILL_DISPATCH_FUNCTION_DEFINITION } from "create-agdf/mcp-dispatch-runtime";
import { unresolvedArguments, withStdioClient } from "./helpers.js";

for (const modern of [false, true]) {
  await withStdioClient({ modern }, async (client) => {
    assert.equal(client.getNegotiatedProtocolVersion(), modern ? "2026-07-28" : "2025-11-25");
    assert.equal(client.getProtocolEra(), modern ? "modern" : "legacy");
    const { tools } = await client.listTools();
    assert.equal(tools.length, 1);
    assert.equal(tools[0].name, "agdf_dispatch");
    assert.deepEqual(tools[0].inputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema);
    assert.deepEqual(tools[0].outputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.outputSchema);
    const result = await client.callTool({ name: "agdf_dispatch", arguments: unresolvedArguments });
    assert.equal(result.structuredContent.outcome, "target_unresolved");
    assert.equal(result.structuredContent.authorizes, false);
    assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
  });
}

console.log("AGDF MCP 2025-11-25 and 2026-07-28 STDIO protocol tests passed.");
