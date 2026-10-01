import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readSkillRuntimeContracts } from "../../create-agdf/lib/cli/contract-command.js";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient } from "./helpers.js";

const definition = JSON.parse(readFileSync(new URL("../../plugins/agdf/meta/agdf-plugin.definition.json", import.meta.url)));
const fixture = createOwnedRuntimeFixture();
try {
  // A real stdio server, with no SessionStart hook or executable binding.
  await withStdioClient(fixture, async client => {
    for (const skill of definition.skillSet.filter(s => s.dispatch.mode === "judgement_required")) {
      const response = await client.callTool({ name: "agdf_dispatch", arguments: {
        skill_id: skill.slug, presentation_language: "de", working_directory: fixture.governanceTarget,
        target_source: "explicit_target", primary_target: fixture.governanceTarget,
        run_id: "agdf-mcp-dispatch-server",
      } });
      const result = response.structuredContent;
      assert.equal(result.outcome, "skill_continuation", `${skill.slug}: ${JSON.stringify(result.diagnostics)}`);
      assert.equal(result.authorizes, false);
      assert.equal(result.terminal, false);
      const contracts = result.continuation.runtime_contracts;
      assert.deepEqual(contracts.map(c => c.module), skill.runtimeContractModules);
      const source = readFileSync(new URL(`../../plugins/agdf/skills/${skill.slug}/SKILL.md`, import.meta.url), "utf8");
      const section = source.split("## Runtime Contract\n")[1].split("`instruction_only`")[0];
      assert.ok(section.includes("`continuation.runtime_contracts`"), `${skill.slug}: MCP-first contract consumption`);
      assert.ok(!section.includes("not from the file system"), `${skill.slug}: stale hook-only contract instruction`);
      const referenced = [...section.matchAll(/\.\.\/\.\.\/meta\/contracts\/([a-z-]+)\.md/g)].map(m => m[1]);
      assert.deepEqual(referenced, skill.runtimeContractModules, `${skill.slug}: contract inventory drift`);
      for (const contract of contracts) {
        const content = readFileSync(join(fixture.dispatcherRoot, "generated/plugins/agdf/meta/contracts", `${contract.module}.md`), "utf8");
        assert.equal(contract.content, content);
        assert.equal(contract.sha256, createHash("sha256").update(content).digest("hex"));
      }
      assert.deepEqual(JSON.parse(response.content[0].text), result);
    }
  });
  const badDefinition = modules => ({ ...definition, skillSet: [{ slug: "code-review", runtimeContractModules: modules }] });
  for (const modules of [[], ["../../secret"], ["quality", "quality"]]) {
    assert.throws(() => readSkillRuntimeContracts("code-review", { definition: badDefinition(modules) }), /runtime_contracts_unavailable/);
  }
  assert.throws(() => readSkillRuntimeContracts("unknown"), /runtime_contracts_unavailable/);
  assert.throws(() => readSkillRuntimeContracts("code-review", { packageGeneratedRoot: join(fixture.root, "absent") }), /runtime_contracts_unavailable/);
} finally { fixture.dispose(); }
console.log("All nine MCP skill continuations supply exact packaged contracts without a hook binding.");
