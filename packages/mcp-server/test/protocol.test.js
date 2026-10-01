import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTROL_INSPECT_FUNCTION_DEFINITION, SKILL_DISPATCH_FUNCTION_DEFINITION } from "create-agdf/mcp-dispatch-runtime";
import {
  INVALID_PRESENTATION_LANGUAGE_CASES,
  VALID_PRESENTATION_LANGUAGE_CASES,
  argumentsForLanguageCase,
} from "../../cli/scripts/fixtures/skill-dispatch-language.js";
import { unresolvedArguments, withStdioClient } from "./helpers.js";

for (const modern of [false, true]) {
  await withStdioClient({ modern }, async (client) => {
    const protocol = modern ? "2026-07-28" : "2025-11-25";
    assert.equal(client.getNegotiatedProtocolVersion(), protocol);
    assert.equal(client.getProtocolEra(), modern ? "modern" : "legacy");
    const { tools } = await client.listTools();
    assert.equal(tools.length, 2);
    assert.deepEqual(tools.map((tool) => tool.name), ["agdf_dispatch", "agdf_inspect"]);
    for (const [label, path] of [
      ["repository README", "../../../README.md"],
      ["installation guide", "../../../INSTALL.md"],
      ["architecture guide", "../../../docs/architecture/README.md"],
      ["create-agdf README", "../../cli/README.md"],
      ["MCP README", "../README.md"],
    ]) {
      const document = readFileSync(new URL(path, import.meta.url), "utf8");
      const declared = document.match(/^(?:MCP-Werkzeuge|MCP tools): ([^\n]+)$/m);
      assert.ok(declared, `${label}: missing MCP tool inventory`);
      assert.deepEqual([...declared[1].matchAll(/`(agdf_[a-z]+)`/g)].map((match) => match[1]), tools.map((tool) => tool.name), `${label}: MCP tool inventory differs from tools/list`);
    }
    assert.equal(tools[1].description, CONTROL_INSPECT_FUNCTION_DEFINITION.description);
    assert.deepEqual(tools[1].inputSchema, CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema);
    const inspectUnresolved = await client.callTool({ name: "agdf_inspect", arguments: { operation: "doctor", presentation_language: "de", working_directory: "/tmp" } });
    assert.equal(inspectUnresolved.isError, undefined, `${protocol}:inspect`);
    assert.equal(inspectUnresolved.structuredContent.outcome, "target_unresolved");
    assert.equal(inspectUnresolved.structuredContent.authorizes, false);
    assert.equal(inspectUnresolved.structuredContent.report, null);
    const inspectRejected = await client.callTool({ name: "agdf_inspect", arguments: { operation: "run-approve", presentation_language: "de", working_directory: "/tmp" } });
    assert.equal(inspectRejected.isError, true, `${protocol}:inspect schema rejects write-shaped operations`);
    assert.equal(inspectRejected.structuredContent, undefined);
    assert.equal(tools[0].name, "agdf_dispatch");
    assert.equal(tools[0].description, SKILL_DISPATCH_FUNCTION_DEFINITION.description);
    assert.deepEqual(tools[0].inputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema);
    assert.deepEqual(tools[0].outputSchema, SKILL_DISPATCH_FUNCTION_DEFINITION.outputSchema);

    for (const row of INVALID_PRESENTATION_LANGUAGE_CASES) {
      const result = await client.callTool({
        name: "agdf_dispatch",
        arguments: argumentsForLanguageCase(unresolvedArguments, row),
      });
      assert.equal(result.isError, true, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent, undefined, `${protocol}:${row.id}:schema errors have no governance result`);
    }

    const validResults = new Map();
    for (const row of VALID_PRESENTATION_LANGUAGE_CASES) {
      const result = await client.callTool({
        name: "agdf_dispatch",
        arguments: argumentsForLanguageCase(unresolvedArguments, row),
      });
      assert.equal(result.isError, undefined, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.outcome, "target_unresolved", `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.authorizes, false, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.presentation.presentation_language, row.expectedLocale, `${protocol}:${row.id}`);
      assert.equal(result.structuredContent.host_action.text, result.structuredContent.presentation.markdown, `${protocol}:${row.id}`);
      assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent, `${protocol}:${row.id}`);
      validResults.set(row.id, result.structuredContent.presentation);
    }
    assert.deepEqual(validResults.get("unsupported_fr"), validResults.get("supported_en"), `${protocol}:unsupported fr uses one complete English pack`);
    assert.deepEqual(validResults.get("unsupported_es"), validResults.get("supported_en"), `${protocol}:unsupported es uses one complete English pack`);
  });
}

console.log("AGDF MCP 2025-11-25 and 2026-07-28 separate language-matrix protocol tests passed.");
