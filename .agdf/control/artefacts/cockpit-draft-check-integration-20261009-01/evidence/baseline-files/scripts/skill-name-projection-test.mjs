import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSkillNameCatalog, projectHostSkillNames } from "../packages/core/lib/skill-dispatch/contract.js";
import { toGlobalOpenCodeInstructionsBootstrap } from "../packages/cli/lib/installers/opencode.js";
import { toOpenCodeInstructionsBootstrap } from "./sync-package-assets.js";

const definition = JSON.parse(readFileSync(new URL("../plugins/agdf/meta/agdf-plugin.definition.json", import.meta.url)));
for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  for (const [id, entry] of buildSkillNameCatalog(definition, surface).skills) {
    const source = readFileSync(new URL(`../plugins/agdf/skills/${id}/SKILL.md`, import.meta.url), "utf8");
    const projected = projectHostSkillNames(source, definition, surface);
    assert.ok(projected.includes(`name: ${entry.localName}\n`));
    for (const technical of source.matchAll(/`(?:skill_id[^`]*|--skill[^`]*|\.\.\/\.\.\/meta\/contracts\/[^`]+)`/gu)) assert.ok(projected.includes(technical[0]), `${surface}:${id}: technical ${technical[0]}`);
    assert.ok(projected.includes(id === "gate-check" ? "skill_id: gate-check" : `\`skill_id\` \`${id}\``));
    assert.equal(projectHostSkillNames(projected, definition, surface), projected);
    if (surface === "opencode") {
      const global = projectHostSkillNames(projected, definition, surface, { global: true });
      assert.ok(global.includes(`name: ${entry.globalName}\n`));
      assert.ok(global.includes(id === "gate-check" ? "skill_id: gate-check" : `\`skill_id\` \`${id}\``));
    }
  }
}
const fixture = "---\nname: gate-check\n---\n`gate-check` `/gate-check` `../gate-check/file` --skill gate-check\n";
const local = projectHostSkillNames(fixture, definition, "opencode");
const global = projectHostSkillNames(local + "load `agdf-gate-check`\n`../agdf-gate-check/file`", definition, "opencode", { global: true });
assert.ok(global.includes("name: agdf-global-gate-check\n"));
assert.ok(global.includes("load `agdf-global-gate-check`"));
assert.ok(global.includes("`../agdf-gate-check/file`"));
assert.ok(global.includes("`gate-check` `/agdf-global-gate-check` `../gate-check/file` --skill gate-check"));
assert.ok(toGlobalOpenCodeInstructionsBootstrap(toOpenCodeInstructionsBootstrap()).includes("agdf-global-gate-check"));
console.log("skill name projections passed");
