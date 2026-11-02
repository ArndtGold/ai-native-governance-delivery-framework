import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSkillNameCatalog, projectHostSkillNames } from "../lib/skill-dispatch/contract.js";
import { createSkillDispatchService } from "../lib/skill-dispatch/service.js";
import { renderSkillDispatchInputRecovery } from "../lib/interaction-presentation.js";

const definition = JSON.parse(readFileSync(new URL("../../../plugins/agdf/meta/agdf-plugin.definition.json", import.meta.url)));
const locales = JSON.parse(readFileSync(new URL("../../../plugins/agdf/meta/agdf-interaction-locales.json", import.meta.url)));
const base = { presentationLanguage: "de", workingDirectory: "/tmp", expectedVersion: definition.version, interactionLocales: locales };
let targets = 0, gates = 0;
const dispatch = createSkillDispatchService({
  pluginDefinition: definition,
  resolveTaskTarget: () => { targets++; return { resolution_state: "unresolved", next_action: "Name a target", authorizes: false }; },
  renderTaskTargetOrientation: () => ({ markdown: "target", authorizes: false }),
  evaluateGateCheck: () => { gates++; throw new Error("must not evaluate"); }, env: {},
});
for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  const catalog = buildSkillNameCatalog(definition, surface);
  assert.equal(catalog.skills.size, definition.skillSet.length);
  for (const [name, id] of catalog.names) {
    const result = dispatch({ ...base, surface, skillId: name, skillSet: [] });
    const canonical = dispatch({ ...base, surface, skillId: id });
    assert.equal(result.outcome, "target_unresolved", `${surface}:${name}`);
    assert.deepEqual(result.skill, canonical.skill);
    assert.equal(result.skill.skill_id, id);
    assert.equal(result.authorizes, false);
    assert.deepEqual(result.host_action, canonical.host_action);
  }
  for (const name of ["unknown", "agdf-agdf-gate-check", "/gate-check", "AGDF-GATE-CHECK", "gate-check\n", "x".repeat(241),
    ...(surface === "copilot" ? ["agdf:gate-check", "agdf-global-gate-check"] : []),
    ...(surface === "codex" || surface === "claude" ? ["agdf-gate-check", "agdf-global-gate-check"] : [])]) {
    const calls = targets;
    const result = dispatch({ ...base, surface, skillId: name });
    assert.equal(result.outcome, "invalid_input", `${surface}:${name}`);
    assert.equal(targets, calls);
    assert.equal(result.authorizes, false);
    if (name === "unknown") {
      assert.deepEqual(result.diagnostics[0].allowed_values, [...catalog.names.keys()]);
      assert.ok(result.host_action.text.includes("gate-check"));
    }
  }
}
assert.equal(gates, 0);
const changed = structuredClone(definition);
changed.id = "example";
changed.copilot.skillPrefix = "example-";
assert.equal(buildSkillNameCatalog(changed, "codex").names.get("example:gate-check"), "gate-check");
assert.equal(buildSkillNameCatalog(changed, "copilot").names.get("example-gate-check"), "gate-check");
const collision = structuredClone(definition);
collision.skillSet.push({ slug: "agdf-gate-check", dispatch: { mode: "judgement_required", requiresControlSnapshot: true } });
assert.throws(() => buildSkillNameCatalog(collision, "copilot"), /Ambiguous/);
const brokenDispatch = createSkillDispatchService({ pluginDefinition: collision, resolveTaskTarget: () => { throw new Error("must not reach target"); }, env: {} });
assert.equal(brokenDispatch({ ...base, surface: "copilot", skillId: "gate-check" }).outcome, "invalid_input");
for (const mutate of [d => d.skillSet.push(d.skillSet[0]), d => d.copilot.skillPrefix = "../", d => d.opencode.globalSkillPrefix = undefined, d => d.skillSet = [], d => d.id = "../"] ) {
  const invalid = structuredClone(definition); mutate(invalid);
  assert.throws(() => buildSkillNameCatalog(invalid, mutate.toString().includes("opencode") ? "opencode" : "copilot"));
}
for (const locale of Object.keys(locales.locales)) {
  const options = { registry: locales, requestedLocale: locale };
  assert.ok(renderSkillDispatchInputRecovery({ field: "skill_id", allowedValues: ["gate-check", "agdf:gate-check"] }, options));
  assert.equal(renderSkillDispatchInputRecovery({ field: "surface", allowedValues: ["agdf:gate-check"] }, options), null);
  for (const value of ["gate-check\n", "x".repeat(65), "../gate-check", "<gate-check>"]) {
    assert.equal(renderSkillDispatchInputRecovery({ field: "skill_id", allowedValues: [value] }, options), null);
  }
}
const content = "---\nname: gate-check\ndescription: original\n---\n`gate-check` `skill_id: gate-check` `--skill gate-check` `../gate-check/file` `/gate-check`\n";
const projected = projectHostSkillNames(content, definition, "copilot");
assert.ok(projected.includes("name: agdf-gate-check\ndescription: original"));
assert.ok(projected.includes("`gate-check` `skill_id: gate-check` `--skill gate-check` `../gate-check/file` `/agdf-gate-check`"));
console.log("skill names tests passed");

assert.equal(projectHostSkillNames("name: gate-check\n", definition, "copilot"), "name: gate-check\n");
