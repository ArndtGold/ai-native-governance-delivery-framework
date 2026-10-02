import Ajv2020 from "ajv/dist/2020.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCommand, skillDispatchArgumentGrammar as registryArgumentGrammar } from "../lib/cli/command-registry.js";
import {
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_INTAKE_CONTINUATION_DESCRIPTION,
  SKILL_DISPATCH_INTAKE_DESCRIPTION,
  SKILL_DISPATCH_PRESENTATION_LANGUAGE_DESCRIPTION,
  SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION,
  SKILL_DISPATCH_SURFACES,
  SKILL_DISPATCH_TERMINAL_RESPONSE_DESCRIPTION,
  parseSkillDispatchFunctionArguments,
  normalizeSkillDispatchInput,
  buildSkillDispatchRegistry,
  renderSkillDispatchLanguageProjection,
  renderSkillDispatchQaCandidatesProjection,
  renderSkillDispatchSemanticProjection,
  renderSkillDispatchTerminalProjection,
  skillDispatchArgumentGrammar,
  skillDispatchCommandGrammar,
} from "#agdf-core/skill-dispatch/contract.js";
import { TASK_TARGET_SOURCES } from "#agdf-core/task-target-resolution.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const pluginDefinition = JSON.parse(readFileSync(join(repoRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json"), "utf8"));
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
  "entire assistant response must consist only of host_action.text",
  "Add no question, explanation, heading, citation, link or other surrounding text",
  "follow its continuation instruction using only the returned target and control",
  "For intake_continuation phase resolve_delivery_run",
]) assert.match(definition.description, new RegExp(requiredMeaning.replaceAll(".", "\\."), "u"));
assert.equal(renderSkillDispatchTerminalProjection(), SKILL_DISPATCH_TERMINAL_RESPONSE_DESCRIPTION);
assert.equal(definition.outputSchema.properties.control.description, SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION);
assert.equal(renderSkillDispatchQaCandidatesProjection(), SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION);

assert.equal(Object.isFrozen(definition), true);
assert.equal(Object.isFrozen(schema), true);
assert.deepEqual(schema.required, ["skill_id", "presentation_language", "working_directory"]);
assert.deepEqual(Object.keys(schema.properties), [
  "skill_id", "presentation_language", "working_directory", "target_source", "primary_target", "run_id", "expected_revision_id", "intake", "intake_mode", "continue_delivery",
]);
assert.equal(schema.properties.intake.type, "boolean");
assert.equal(schema.properties.intake.description, SKILL_DISPATCH_INTAKE_DESCRIPTION);
assert.match(SKILL_DISPATCH_INTAKE_DESCRIPTION, /governed delivery intake \(catalog delivery\.start\) is the active route/u);
assert.match(SKILL_DISPATCH_INTAKE_DESCRIPTION, /delivery wins mixed intent/u);
assert.match(SKILL_DISPATCH_INTAKE_DESCRIPTION, /Omit it for status, approval or next-step questions/u);
assert.match(SKILL_DISPATCH_INTAKE_DESCRIPTION, /never grants approval or delivery authority/u);
assert.ok(definition.description.endsWith(` ${SKILL_DISPATCH_INTAKE_CONTINUATION_DESCRIPTION}`));
assert.equal(schema.additionalProperties, false);
assert.equal(definition.outputSchema.additionalProperties, false);
assert.deepEqual(definition.outputSchema.required, [
  "schema_version", "contract_version", "outcome", "terminal", "authorizes", "skill",
  "runtime", "target", "control", "presentation", "continuation", "recovery",
  "host_action", "timing", "diagnostics",
]);
assert.equal(definition.outputSchema.properties.authorizes.const, false);
assert.deepEqual(definition.outputSchema.properties.outcome.enum, [
  "invalid_input", "target_unresolved", "control_result", "skill_continuation", "intake_continuation", "evaluator_error",
]);
assert.deepEqual(schema.dependentRequired, {
  target_source: ["primary_target"],
  primary_target: ["target_source"],
});
assert.match(schema.properties.working_directory.description, /never selects or authorizes a target/u);
assert.equal(schema.properties.presentation_language.description, SKILL_DISPATCH_PRESENTATION_LANGUAGE_DESCRIPTION);
assert.equal(schema.properties.presentation_language.pattern, "^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$");
assert.match(schema.properties.presentation_language.description, /latest natural-language user request/u);
assert.match(schema.properties.presentation_language.description, /explicitly asks for a response language/u);
assert.match(schema.properties.presentation_language.description, /dominant request language/u);
assert.match(schema.properties.presentation_language.description, /mixed or ambiguous/u);
assert.match(schema.properties.presentation_language.description, /valid unsupported tag/u);
assert.match(schema.properties.presentation_language.description, /Missing or invalid input fails before governance evaluation/u);
assert.match(schema.properties.primary_target.description, /Never derive it from working_directory alone/u);
assert.match(schema.properties.run_id.description, /unequivocal same-scope assignment/u);
assert.match(schema.properties.expected_revision_id.description, /resolve_delivery_run/u);
assert.match(schema.properties.continue_delivery.description, /implementation-preparation Brownfield Analysis after TP approval/u);
assert.match(schema.properties.continue_delivery.description, /OR closeout after UAT approval/u);
assert.match(schema.properties.continue_delivery.description, /only with skill_id gate-check/u);

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
assert.equal(parseSkillDispatchFunctionArguments({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: "/tmp/agdf",
  intake: true,
}, {
  surface: "codex",
  expectedVersion: pluginDefinition.version,
  skillSet: pluginDefinition.skillSet,
  interactionLocales: {},
}).intake, true);
const transportContext = { surface: "codex", expectedVersion: pluginDefinition.version, skillSet: pluginDefinition.skillSet, interactionLocales: JSON.parse(readFileSync(join(repoRoot, "plugins/agdf/meta/agdf-interaction-locales.json"), "utf8")) };
const deliveryInput = { skill_id: "gate-check", presentation_language: "de", working_directory: "/tmp/agdf", run_id: "bound-run" };
const registry = buildSkillDispatchRegistry(pluginDefinition.skillSet);
const expectedRevision = "12345678-1234-4123-8123-123456789abc";
const validateDispatch = new Ajv2020({ strict: false }).compile(schema);
for (const intake of [undefined, false, true]) for (const mode of [undefined, "new", "resume"])
for (const continuation of [undefined, false, true]) for (const run of [undefined, "bound-run"])
for (const revision of [undefined, expectedRevision]) {
  const args = { skill_id: "gate-check", presentation_language: "de", working_directory: "/tmp/agdf",
    ...(intake !== undefined ? { intake } : {}), ...(mode !== undefined ? { intake_mode: mode } : {}),
    ...(continuation !== undefined ? { continue_delivery: continuation } : {}),
    ...(run !== undefined ? { run_id: run } : {}), ...(revision !== undefined ? { expected_revision_id: revision } : {}) };
  let accepted = true;
  try { normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments(args, transportContext), registry); } catch { accepted = false; }
  assert.equal(validateDispatch(args), accepted, JSON.stringify(args));
}

assert.equal(normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments({ ...deliveryInput,
  intake: true, intake_mode: "resume", expected_revision_id: expectedRevision }, transportContext), registry).expected_revision_id, expectedRevision);
for (const fields of [
  { expected_revision_id: expectedRevision },
  { intake: true, intake_mode: "new", expected_revision_id: expectedRevision },
  { intake: true, intake_mode: "resume", expected_revision_id: "malformed" },
]) assert.throws(() => normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments({ ...deliveryInput, ...fields }, transportContext), registry));
for (const fields of [{ intake: true, intake_mode: "new" }, { intake: true, intake_mode: "resume" }, { continue_delivery: true }]) {
  const normalized = normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments({ ...deliveryInput, ...fields }, transportContext), registry);
  for (const [key, value] of Object.entries(fields)) assert.equal(normalized[key], value);
}
for (const fields of [{ intake_mode: "new" }, { intake: true, intake_mode: "invalid" }, { intake: true, continue_delivery: true }, { continue_delivery: "true" }]) {
  assert.throws(() => normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments({ ...deliveryInput, ...fields }, transportContext), registry));
}
assert.throws(() => normalizeSkillDispatchInput(parseSkillDispatchFunctionArguments({ ...deliveryInput,
  skill_id: "brownfield-analysis", continue_delivery: true }, transportContext), registry),
  /continue_delivery requires skill_id gate-check/u);
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
assert.match(skillDispatchArgumentGrammar(), /--language <language-tag>/u);
assert.ok(skillDispatchArgumentGrammar().endsWith(" [--run <run_id>] [--intake [--intake-mode <new|resume>] [--revision <uuid>]] [--continue-delivery]"));
assert.match(skillDispatchArgumentGrammar(), new RegExp(`<${TASK_TARGET_SOURCES.join("\\|")}>`, "u"));

const languageProjection = renderSkillDispatchLanguageProjection();
const projection = renderSkillDispatchSemanticProjection();
const terminalProjection = renderSkillDispatchTerminalProjection();
const qaCandidatesProjection = renderSkillDispatchQaCandidatesProjection();
for (const source of TASK_TARGET_SOURCES) assert.ok(projection.includes(`\`${source}\``));
for (const skill of pluginDefinition.skillSet) {
  const skillPath = join(repoRoot, "plugins", "agdf", "skills", skill.slug, "SKILL.md");
  const content = readFileSync(skillPath, "utf8");
  const languageStart = content.indexOf(languageProjection);
  assert.ok(languageStart >= 0, `${skill.slug} must contain the canonical presentation-language projection`);
  assert.equal(content.split(languageProjection).length - 1, 1);
  assert.ok(languageStart > content.indexOf("## Executable Dispatch"));
  const start = content.indexOf(projection);
  assert.ok(start >= 0, `${skill.slug} must contain the canonical semantic projection`);
  assert.equal(content.split(projection).length - 1, 1);
  assert.ok(start > content.indexOf("## Executable Dispatch"));
  const terminalStart = content.indexOf(terminalProjection);
  assert.ok(terminalStart >= 0, `${skill.slug} must contain the canonical terminal-response projection`);
  assert.equal(content.split(terminalProjection).length - 1, 1);
  assert.ok(terminalStart > content.indexOf("## Executable Dispatch"));
  assert.equal(content.split(qaCandidatesProjection).length - 1, skill.slug === "qa-gate" ? 1 : 0);
}

console.log("Skill dispatch semantic function contract tests passed");

// agdf_inspect: one read tool with an operation enum, capped definition size, non-authorizing output.
const { CONTROL_INSPECT_FUNCTION_DEFINITION, CONTROL_INSPECT_MAX_DEFINITION_BYTES, controlInspectDefinitionBytes } = await import("#agdf-core/control-inspect/contract.js");
assert.deepEqual(Object.keys(CONTROL_INSPECT_FUNCTION_DEFINITION), ["name", "description", "annotations", "inputSchema", "outputSchema"]);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.name, "agdf_inspect");
assert.deepEqual(CONTROL_INSPECT_FUNCTION_DEFINITION.annotations, definition.annotations);
assert.deepEqual(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.required, ["operation", "presentation_language", "working_directory"]);
assert.deepEqual(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties.operation.enum, ["doctor", "gate-check", "delivery-map", "contract"]);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.additionalProperties, false);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties.presentation_language.pattern, schema.properties.presentation_language.pattern);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.outputSchema.properties.authorizes.const, false);
assert.equal(CONTROL_INSPECT_FUNCTION_DEFINITION.outputSchema.properties.terminal.type, "boolean");
assert.ok(controlInspectDefinitionBytes() <= CONTROL_INSPECT_MAX_DEFINITION_BYTES, `agdf_inspect definition exceeds ${CONTROL_INSPECT_MAX_DEFINITION_BYTES} bytes`);
assert.match(CONTROL_INSPECT_FUNCTION_DEFINITION.description, /Never writes, selects a run or grants approval/u);
assert.match(CONTROL_INSPECT_FUNCTION_DEFINITION.description, /verified_change git observation is unavailable/u);
assert.match(definition.outputSchema.properties.presentation.description, /approval_preview/u);
assert.match(definition.outputSchema.properties.presentation.description, /only after its presentation_id exists/u);
console.log("agdf_inspect function contract pins passed.");
