import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCommand, skillDispatchArgumentGrammar as registryArgumentGrammar } from "../lib/cli/command-registry.js";
import {
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_SURFACES,
  renderSkillDispatchSemanticProjection,
  skillDispatchArgumentGrammar,
  skillDispatchCommandGrammar,
} from "../lib/skill-dispatch/contract.js";
import { TASK_TARGET_SOURCES } from "../lib/task-target-resolution.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const pluginDefinition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const definition = SKILL_DISPATCH_FUNCTION_DEFINITION;
const schema = definition.inputSchema;

assert.deepEqual(Object.keys(definition), ["name", "description", "inputSchema"]);
assert.equal(definition.name, "agdf_dispatch");
for (const requiredMeaning of [
  "version-matched AGDF preflight",
  "never grants approval or delivery authority",
  "transmit host_action.text verbatim and stop",
  "use only the returned target and control",
]) assert.match(definition.description, new RegExp(requiredMeaning.replaceAll(".", "\\."), "u"));

assert.equal(Object.isFrozen(definition), true);
assert.equal(Object.isFrozen(schema), true);
assert.deepEqual(schema.required, ["skill_id", "presentation_language", "working_directory"]);
assert.deepEqual(Object.keys(schema.properties), [
  "skill_id", "presentation_language", "working_directory", "target_source", "primary_target", "run_id",
]);
assert.equal(schema.additionalProperties, false);
assert.deepEqual(schema.dependentRequired, {
  target_source: ["primary_target"],
  primary_target: ["target_source"],
});
assert.match(schema.properties.working_directory.description, /never selects or authorizes a target/u);
assert.match(schema.properties.primary_target.description, /Never derive it from working_directory alone/u);
assert.match(schema.properties.run_id.description, /only when the request explicitly selects that run/u);

const targetChoices = schema.properties.target_source.oneOf;
assert.deepEqual(targetChoices.map((choice) => choice.const), TASK_TARGET_SOURCES);
const meanings = Object.fromEntries(targetChoices.map((choice) => [choice.const, choice.description]));
assert.match(meanings.explicit_target, /current user request explicitly names primary_target/u);
assert.match(meanings.continued_target, /same confirmed target/u);
assert.match(meanings.current_repository, /exactly one matching repository context is active/u);
assert.equal(new Set(Object.values(meanings)).size, TASK_TARGET_SOURCES.length);
assert.deepEqual(SKILL_DISPATCH_SURFACES, ["codex", "claude", "copilot", "opencode"]);

assert.equal(registryArgumentGrammar(), skillDispatchArgumentGrammar());
assert.equal(resolveCommand("skill-dispatch").usages.local[0], ` ${skillDispatchCommandGrammar()}`);
assert.match(skillDispatchArgumentGrammar(), new RegExp(`<${TASK_TARGET_SOURCES.join("\\|")}>`, "u"));

const projection = renderSkillDispatchSemanticProjection();
for (const source of TASK_TARGET_SOURCES) assert.ok(projection.includes(`\`${source}\``));
for (const skill of pluginDefinition.skillSet) {
  const skillPath = join(repoRoot, "plugin", "skills", skill.slug, "SKILL.md");
  const content = readFileSync(skillPath, "utf8");
  const start = content.indexOf(projection);
  assert.ok(start >= 0, `${skill.slug} must contain the canonical semantic projection`);
  assert.equal(content.split(projection).length - 1, 1);
  assert.ok(start > content.indexOf("## Executable Dispatch"));
}

console.log("Skill dispatch semantic function contract tests passed");
