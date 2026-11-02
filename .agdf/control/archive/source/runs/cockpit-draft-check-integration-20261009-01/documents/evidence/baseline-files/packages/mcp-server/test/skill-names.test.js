import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildSkillNameCatalog } from "../../core/lib/skill-dispatch/contract.js";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient, unresolvedArguments } from "./helpers.js";

const definition = JSON.parse(readFileSync(new URL("../../../plugins/agdf/meta/agdf-plugin.definition.json", import.meta.url)));
const fixture = createOwnedRuntimeFixture();
try {
  for (const surface of ["codex", "claude", "copilot", "opencode"]) {
    await withStdioClient({ ...fixture, args: [fixture.args[0], "--surface", surface] }, async client => {
      const catalog = buildSkillNameCatalog(definition, surface);
      for (const [name, id] of catalog.names) {
        const result = (await client.callTool({ name: "agdf_dispatch", arguments: { ...unresolvedArguments, skill_id: name } })).structuredContent;
        assert.equal(result.outcome, "target_unresolved", `${surface}:${name}`);
        assert.equal(result.skill.skill_id, id);
        assert.equal(result.authorizes, false);
      }
      const invalid = (await client.callTool({ name: "agdf_dispatch", arguments: { ...unresolvedArguments, skill_id: "agdf-unknown" } })).structuredContent;
      assert.equal(invalid.outcome, "invalid_input");
      assert.deepEqual(invalid.diagnostics[0].allowed_values, [...catalog.names.keys()]);
      assert.ok(invalid.host_action.text.includes("gate-check"));
      const rejected = await client.callTool({ name: "agdf_dispatch", arguments: { ...unresolvedArguments, surface: "other" } });
      assert.equal(rejected.isError, true, "model cannot replace the trusted host context");
      const name = [...catalog.names].find(([name, id]) => name !== id)[0];
      const cli = spawnSync(process.execPath, [fileURLToPath(new URL("../../cli/bin/create-agdf.js", import.meta.url)), "skill-dispatch", "--json", "--surface", surface, "--skill", name, "--language", "de", "--working-directory", "/tmp"], { encoding: "utf8" });
      assert.equal(cli.status, 2, "unresolved target keeps CLI exit code 2: " + cli.stderr);
      const result = JSON.parse(cli.stdout);
      assert.equal(result.outcome, "target_unresolved");
      assert.equal(result.skill.skill_id, "delivery-path-search");
      assert.equal(result.authorizes, false);
      const continued = (await client.callTool({ name: "agdf_dispatch", arguments: {
        ...unresolvedArguments, skill_id: name, working_directory: fixture.governanceTarget,
        target_source: "explicit_target", primary_target: fixture.governanceTarget, run_id: "agdf-mcp-dispatch-server",
      } })).structuredContent;
      assert.equal(continued.outcome, "skill_continuation");
      assert.equal(continued.continuation.skill_id, "delivery-path-search");
      assert.equal(continued.authorizes, false);
    });
  }
} finally { fixture.dispose(); }
console.log("CLI/MCP host skill name parity passed");
