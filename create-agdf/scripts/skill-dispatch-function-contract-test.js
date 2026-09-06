import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCommand, skillDispatchArgumentGrammar as registryArgumentGrammar } from "../lib/cli/command-registry.js";
import {
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_SURFACES,
  parseSkillDispatchFunctionArguments,
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

assert.deepEqual(Object.keys(definition), ["name", "description", "annotations", "inputSchema", "outputSchema"]);
assert.equal(definition.name, "agdf_dispatch");
assert.deepEqual(definition.annotations, {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});
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
assert.equal(definition.outputSchema.additionalProperties, false);
assert.deepEqual(definition.outputSchema.required, [
  "schema_version", "contract_version", "outcome", "terminal", "authorizes", "skill",
  "runtime", "target", "control", "presentation", "continuation", "recovery",
  "host_action", "timing", "diagnostics",
]);
assert.equal(definition.outputSchema.properties.authorizes.const, false);
assert.deepEqual(definition.outputSchema.properties.outcome.enum, [
  "invalid_input", "target_unresolved", "control_result", "skill_continuation", "evaluator_error",
]);
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

const parsed = parseSkillDispatchFunctionArguments({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: "/tmp/agdf",
  target_source: "continued_target",
  primary_target: "/tmp/agdf",
  run_id: "delivery-run",
}, {
  surface: "codex",
  expectedVersion: pluginDefinition.version,
  skillSet: pluginDefinition.skillSet,
  interactionLocales: {},
});
assert.deepEqual(parsed, {
  skillId: "gate-check",
  presentationLanguage: "de",
  workingDirectory: "/tmp/agdf",
  targetSource: "continued_target",
  primaryTarget: "/tmp/agdf",
  runId: "delivery-run",
  surface: "codex",
  expectedVersion: pluginDefinition.version,
  skillSet: pluginDefinition.skillSet,
  interactionLocales: {},
});
assert.equal(Object.isFrozen(parsed), true);
const semanticInvalid = parseSkillDispatchFunctionArguments({
  skill_id: "not-a-real-agdf-skill",
  presentation_language: "de",
  working_directory: "/tmp/agdf",
}, {
  surface: "codex",
  expectedVersion: pluginDefinition.version,
  skillSet: pluginDefinition.skillSet,
  interactionLocales: {},
});
assert.equal(semanticInvalid.skillId, "not-a-real-agdf-skill", "wire parsing leaves semantic validation to the dispatcher service");
assert.throws(
  () => parseSkillDispatchFunctionArguments({
    skill_id: "gate-check",
    presentation_language: "de",
    working_directory: "/tmp/agdf",
    executable: "/bin/sh",
  }, {
    surface: "codex",
    expectedVersion: pluginDefinition.version,
    skillSet: pluginDefinition.skillSet,
    interactionLocales: {},
  }),
  (error) => error.field === "executable",
);
assert.throws(
  () => parseSkillDispatchFunctionArguments({
    skill_id: "gate-check",
    presentation_language: "de",
  }, {
    surface: "codex",
    expectedVersion: pluginDefinition.version,
    skillSet: pluginDefinition.skillSet,
    interactionLocales: {},
  }),
  (error) => error.field === "working_directory",
);
assert.throws(
  () => parseSkillDispatchFunctionArguments({
    skill_id: "gate-check",
    presentation_language: "de",
    working_directory: "/tmp/agdf",
    target_source: "explicit_target",
  }, {
    surface: "codex",
    expectedVersion: pluginDefinition.version,
    skillSet: pluginDefinition.skillSet,
    interactionLocales: {},
  }),
  (error) => error.field === "primary_target",
);

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
