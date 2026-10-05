import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { readSkillRuntimeContracts } from "../../cli/lib/cli/contract-command.js";
import { createPrdDefinitionTestRun } from "../../cli/scripts/fixtures/prd-definition.js";
import { createSdDefinitionTestRun } from "../../cli/scripts/fixtures/sd-definition.js";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { withStdioClient } from "./helpers.js";

const definition = JSON.parse(readFileSync(new URL("../../../plugins/agdf/meta/agdf-plugin.definition.json", import.meta.url)));
const fixture = createOwnedRuntimeFixture();
try {
  // This protocol test needs only its existing later-gate seed plus the synthetic
  // authoring runs below. Unrelated live project runs must not govern its intake inventory.
  const copiedRuns = join(fixture.governanceTarget, ".agdf/control/runs");
  for (const entry of readdirSync(copiedRuns)) {
    if (entry !== "agdf-mcp-dispatch-server") rmSync(join(copiedRuns, entry), { recursive: true, force: true });
  }
  rmSync(join(fixture.governanceTarget, ".agdf/control/AGDF_RUN.md"), { force: true });
  const urRun = "ur-definition-mcp-test";
  const prdRun = createPrdDefinitionTestRun(fixture.governanceTarget, join(fixture.dispatcherRoot, "bin/agdf-validator.js"), "prd-definition-mcp-test");
  const sdRun = createSdDefinitionTestRun(fixture.governanceTarget, join(fixture.dispatcherRoot, "bin/agdf-validator.js"), "sd-definition-mcp-test");
  execFileSync(process.execPath, [join(fixture.dispatcherRoot, "bin/agdf-validator.js"), "run-create", "--dir", fixture.governanceTarget, "--run", urRun], { stdio: "pipe" });
  // A real stdio server, with no SessionStart hook or executable binding.
  await withStdioClient(fixture, async client => {
    for (const skill of definition.skillSet.filter(s => s.dispatch.mode === "judgement_required")) {
      const response = await client.callTool({ name: "agdf_dispatch", arguments: {
        skill_id: skill.slug, presentation_language: "de", working_directory: fixture.governanceTarget,
        target_source: "explicit_target", primary_target: fixture.governanceTarget,
        run_id: skill.slug === "ur-definition" ? urRun : skill.slug === "prd-definition" ? prdRun.runId : skill.slug === "sd-definition" ? sdRun.runId : "agdf-mcp-dispatch-server",
      } });
      const result = response.structuredContent;
      assert.equal(result.outcome, "skill_continuation", `${skill.slug}: ${JSON.stringify(result.diagnostics)}`);
      assert.equal(result.authorizes, false);
      assert.equal(result.terminal, false);
      if (["ur-definition", "prd-definition", "sd-definition"].includes(skill.slug)) {
        assert.equal(result.continuation.artifact_language, "en");
        assert.equal(result.continuation.presentation_language, "de");
        assert.equal(result.continuation.approval_summary_required, true);
        assert.equal(result.continuation.approval_summary_heading, "AGDF Approval Summary (de; source=en)");
      }
      if (skill.slug === "ur-definition") {
        assert.equal(result.continuation.phase, "ur_definition");
        assert.equal(result.continuation.artifact_path, `.agdf/control/artefacts/${urRun}/UR.md`);
        assert.equal(result.continuation.draft_registered, false);
      }
      if (skill.slug === "prd-definition") {
        assert.equal(result.continuation.phase, "prd_definition");
        assert.equal(result.continuation.draft_registered, false);
        assert.equal(result.continuation.sources[0].path, prdRun.prefix + "UR.md");
      }
      if (skill.slug === "sd-definition") {
        assert.equal(result.continuation.phase, "sd_definition");
        assert.equal(result.continuation.draft_registered, false);
        assert.equal(result.continuation.sources[0].path, sdRun.prefix + "PRD.md");
      }
      const contracts = result.continuation.runtime_contracts;
      assert.deepEqual(contracts.map(c => c.module), skill.runtimeContractModules);
      const source = readFileSync(new URL(`../../../plugins/agdf/skills/${skill.slug}/SKILL.md`, import.meta.url), "utf8");
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
    const prdArgs = { skill_id: "gate-check", presentation_language: "de", working_directory: fixture.governanceTarget,
      target_source: "explicit_target", primary_target: fixture.governanceTarget, run_id: prdRun.runId,
      intake: true, intake_mode: "resume", expected_revision_id: prdRun.revision(), prd_action: "revise" };
    const prdRevision = (await client.callTool({ name: "agdf_dispatch", arguments: prdArgs })).structuredContent;
    assert.equal(prdRevision.continuation?.phase, "prd_definition", JSON.stringify(prdRevision));
    const invalidPrd = await client.callTool({ name: "agdf_dispatch", arguments: { ...prdArgs, ur_action: "revise" } });
    assert.ok(invalidPrd.isError || invalidPrd.structuredContent?.outcome === "invalid_input");
    const sdArgs = { ...prdArgs, run_id: sdRun.runId, expected_revision_id: sdRun.revision(), sd_action: "revise" };
    delete sdArgs.prd_action;
    assert.equal((await client.callTool({ name: "agdf_dispatch", arguments: sdArgs })).structuredContent.continuation.phase, "sd_definition");
    for (const wrong of [{ prd_action: "revise" }, { ur_action: "revise" }, { continue_delivery: true }, { sd_action: "approve" }]) {
      const invalid = await client.callTool({ name: "agdf_dispatch", arguments: { ...sdArgs, ...wrong } });
      assert.ok(invalid.isError || invalid.structuredContent?.outcome === "invalid_input");
    }
    const sdUnbound = { ...sdArgs, skill_id: "sd-definition" };
    for (const key of ["sd_action", "run_id", "expected_revision_id", "intake", "intake_mode"]) delete sdUnbound[key];
    assert.equal((await client.callTool({ name: "agdf_dispatch", arguments: sdUnbound })).structuredContent.continuation.phase, "resolve_delivery_run");
    const base = { skill_id: "ur-definition", presentation_language: "de", working_directory: fixture.governanceTarget,
      target_source: "explicit_target", primary_target: fixture.governanceTarget };
    const unbound = (await client.callTool({ name: "agdf_dispatch", arguments: base })).structuredContent;
    assert.equal(unbound.continuation.phase, "resolve_delivery_run");
    const protectedRun = (await client.callTool({ name: "agdf_dispatch", arguments: { ...base, run_id: "agdf-mcp-dispatch-server" } })).structuredContent;
    assert.equal(protectedRun.terminal, true, "later gate does not grant a UR writer");
  });
  const badDefinition = modules => ({ ...definition, skillSet: [{ slug: "code-review", runtimeContractModules: modules }] });
  for (const modules of [[], ["../../secret"], ["quality", "quality"]]) {
    assert.throws(() => readSkillRuntimeContracts("code-review", { definition: badDefinition(modules) }), /runtime_contracts_unavailable/);
  }
  assert.throws(() => readSkillRuntimeContracts("unknown"), /runtime_contracts_unavailable/);
  assert.throws(() => readSkillRuntimeContracts("code-review", { packageGeneratedRoot: join(fixture.root, "absent") }), /runtime_contracts_unavailable/);
} finally { fixture.dispose(); }
console.log("All catalog-registered MCP judgement skill continuations supply exact packaged contracts without a hook binding.");
