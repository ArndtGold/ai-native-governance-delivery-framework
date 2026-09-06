import { isAbsolute } from "node:path";
import { RUN_ID_PATTERN } from "../control-state/run-identity.js";
import { normalizeTaskTargetSource, TASK_TARGET_SOURCES } from "../task-target-resolution.js";

export const SKILL_DISPATCH_SURFACES = Object.freeze(["codex", "claude", "copilot", "opencode"]);

const TARGET_SOURCE_DESCRIPTIONS = Object.freeze({
  explicit_target: "Use only when the current user request explicitly names primary_target.",
  continued_target: "Use only when the request unambiguously continues the same confirmed target.",
  current_repository: "Use only when the request says this or the current repository and exactly one matching repository context is active.",
});

const targetSourceChoices = Object.freeze(TASK_TARGET_SOURCES.map((value) => Object.freeze({
  const: value, description: TARGET_SOURCE_DESCRIPTIONS[value],
})));

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const SKILL_DISPATCH_FUNCTION_DEFINITION = deepFreeze({
  name: "agdf_dispatch",
  description: "Run the version-matched AGDF preflight for one canonical skill. It resolves target and control state but never grants approval or delivery authority. For a terminal result, transmit host_action.text verbatim and stop. For skill_continuation, use only the returned target and control.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  inputSchema: {
    type: "object", additionalProperties: false,
    required: ["skill_id", "presentation_language", "working_directory"],
    properties: {
      skill_id: { type: "string", minLength: 1, maxLength: 240, description: "Canonical AGDF skill slug from the active route." },
      presentation_language: { type: "string", minLength: 1, maxLength: 64, description: "Host language tag for localized presentation." },
      working_directory: { type: "string", minLength: 1, maxLength: 4096, description: "Absolute execution-context path. It never selects or authorizes a target." },
      target_source: {
        type: "string", oneOf: targetSourceChoices,
        description: "Authority source for primary_target. Supply it only with primary_target and only when exactly one listed meaning applies; otherwise omit both fields.",
      },
      primary_target: { type: "string", minLength: 1, maxLength: 4096, description: "Absolute governance-target path paired with target_source. Never derive it from working_directory alone." },
      run_id: { type: "string", pattern: RUN_ID_PATTERN.source, description: "Canonical run identifier. Supply it only when the request explicitly selects that run." },
    },
    dependentRequired: { target_source: ["primary_target"], primary_target: ["target_source"] },
  },
  outputSchema: {
    type: "object",
    additionalProperties: false,
    required: [
      "schema_version", "contract_version", "outcome", "terminal", "authorizes", "skill",
      "runtime", "target", "control", "presentation", "continuation", "recovery",
      "host_action", "timing", "diagnostics",
    ],
    properties: {
      schema_version: { type: "string", const: "1" },
      contract_version: { type: "integer", const: 1 },
      outcome: {
        type: "string",
        enum: ["invalid_input", "target_unresolved", "control_result", "skill_continuation", "evaluator_error"],
      },
      terminal: { type: "boolean" },
      authorizes: { type: "boolean", const: false },
      skill: { anyOf: [{ type: "object" }, { type: "null" }] },
      runtime: { type: "object" },
      target: { anyOf: [{ type: "object" }, { type: "null" }] },
      control: { anyOf: [{ type: "object" }, { type: "null" }] },
      presentation: { anyOf: [{ type: "object" }, { type: "null" }] },
      continuation: { anyOf: [{ type: "object" }, { type: "null" }] },
      recovery: { anyOf: [{ type: "object" }, { type: "null" }] },
      host_action: { anyOf: [{ type: "object" }, { type: "null" }] },
      timing: {
        type: "object",
        additionalProperties: false,
        required: ["wrapper_ms", "input_ms", "target_ms", "control_ms", "render_ms", "total_ms"],
        properties: {
          wrapper_ms: { type: "number", minimum: 0 },
          input_ms: { type: "number", minimum: 0 },
          target_ms: { type: "number", minimum: 0 },
          control_ms: { type: "number", minimum: 0 },
          render_ms: { type: "number", minimum: 0 },
          total_ms: { type: "number", minimum: 0 },
        },
      },
      diagnostics: { type: "array", items: { type: "object" } },
    },
  },
});

export function skillDispatchArgumentGrammar() {
  const targetSources = SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema.properties.target_source.oneOf
    .map((choice) => choice.const).join("|");
  return `--skill <skill-id> --language <tag> --working-directory <absolute-path> [--target-source <${targetSources}> --primary-target <absolute-path>] [--run <run_id>]`;
}

export function skillDispatchCommandGrammar() {
  return `--json ${skillDispatchArgumentGrammar()
    .replace("--skill <skill-id>", "--skill <skill-id> --surface <surface>")}`;
}

export function renderSkillDispatchSemanticProjection() {
  return "`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.";
}

export const SKILL_DISPATCH_SCHEMA_VERSION = "1";
export const SKILL_DISPATCH_CONTRACT_VERSION = 1;
export const SKILL_DISPATCH_MAX_OUTPUT_BYTES = 1024 * 1024;

const DISPATCH_MODES = new Set(["deterministic_control", "judgement_required"]);
const SURFACES = new Set(SKILL_DISPATCH_SURFACES);

export class SkillDispatchInputError extends Error {
  constructor(field, message, { allowedValues = [] } = {}) {
    super(message);
    this.name = "SkillDispatchInputError";
    this.field = field;
    this.allowedValues = Object.freeze([...allowedValues]);
  }
}

function requireText(value, field, maximum = 240) {
  if (typeof value !== "string" || !value.trim()) throw new SkillDispatchInputError(field, `${field} is required`);
  if (value.length > maximum || /[\r\n\0]/u.test(value)) throw new SkillDispatchInputError(field, `${field} is invalid`);
  return value;
}

export function buildSkillDispatchRegistry(skillSet) {
  if (!Array.isArray(skillSet) || skillSet.length === 0) throw new Error("AGDF skillSet must be a non-empty array");
  const entries = skillSet.map((skill) => {
    const skillId = requireText(skill?.slug, "skill_id");
    const dispatch = skill?.dispatch;
    if (!dispatch || !DISPATCH_MODES.has(dispatch.mode)) throw new Error(`AGDF skill ${skillId} has invalid dispatch metadata`);
    const deterministicCommand = dispatch.deterministicCommand ?? null;
    if (typeof dispatch.requiresControlSnapshot !== "boolean") throw new Error(`AGDF skill ${skillId} must declare requiresControlSnapshot`);
    if (dispatch.mode === "deterministic_control"
        && (skillId !== "gate-check" || deterministicCommand !== "gate-check")) {
      throw new Error(`AGDF deterministic skill ${skillId} must map to gate-check`);
    }
    if (dispatch.mode === "judgement_required" && deterministicCommand) throw new Error(`AGDF judgement skill ${skillId} must not declare deterministicCommand`);
    return [skillId, Object.freeze({
      skill_id: skillId,
      dispatch_mode: dispatch.mode,
      deterministic_command: deterministicCommand,
      requires_control_snapshot: dispatch.requiresControlSnapshot === true,
      contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    })];
  });
  const registry = new Map(entries);
  if (registry.size !== entries.length) throw new Error("AGDF skillSet contains duplicate slugs");
  return registry;
}

export function normalizeSkillDispatchInput(input, registry) {
  const skillId = requireText(input.skillId, "skill_id");
  const skill = registry.get(skillId);
  if (!skill) throw new SkillDispatchInputError("skill_id", `Unknown AGDF skill: ${skillId}`);
  const surface = requireText(input.surface, "surface");
  if (!SURFACES.has(surface)) throw new SkillDispatchInputError("surface", `Unsupported surface: ${surface}`);
  const presentationLanguage = requireText(input.presentationLanguage, "presentation_language", 64);
  const workingDirectory = requireText(input.workingDirectory, "working_directory", 4096);
  if (!isAbsolute(workingDirectory)) throw new SkillDispatchInputError("working_directory", "working_directory must be absolute");
  const rawTargetSource = input.targetSource || null;
  const primaryTarget = input.primaryTarget || null;
  if (Boolean(rawTargetSource) !== Boolean(primaryTarget)) throw new SkillDispatchInputError("primary_target", "target_source and primary_target must be supplied together");
  if (primaryTarget && (!isAbsolute(primaryTarget) || primaryTarget.length > 4096)) throw new SkillDispatchInputError("primary_target", "primary_target must be an absolute bounded path");
  const targetSource = rawTargetSource ? normalizeTaskTargetSource(rawTargetSource, { allowEmpty: false }) : null;
  const runId = input.runId || null;
  if (runId && !RUN_ID_PATTERN.test(runId)) throw new SkillDispatchInputError("run_id", "run_id is invalid");
  return Object.freeze({
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    skill_id: skillId,
    surface,
    presentation_language: presentationLanguage,
    working_directory: workingDirectory,
    target_source: targetSource,
    primary_target: primaryTarget,
    run_id: runId,
    expected_version: requireText(input.expectedVersion, "expected_version", 64),
    skill,
  });
}

export function parseSkillDispatchFunctionArguments(argumentsValue, trustedContext) {
  if (!argumentsValue || typeof argumentsValue !== "object" || Array.isArray(argumentsValue)) {
    throw new SkillDispatchInputError("arguments", "arguments must be an object");
  }
  const schema = SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema;
  const allowed = new Set(Object.keys(schema.properties));
  const unknown = Object.keys(argumentsValue).find((key) => !allowed.has(key));
  if (unknown) throw new SkillDispatchInputError(unknown, "unsupported argument");
  const missing = schema.required.find((key) => !Object.hasOwn(argumentsValue, key));
  if (missing) throw new SkillDispatchInputError(missing, "required argument is missing");
  if (!trustedContext || typeof trustedContext !== "object") {
    throw new SkillDispatchInputError("trusted_context", "trusted context is required");
  }
  if (Boolean(argumentsValue.target_source) !== Boolean(argumentsValue.primary_target)) {
    throw new SkillDispatchInputError("primary_target", "target_source and primary_target must be supplied together");
  }
  const rawInput = {
    skillId: argumentsValue.skill_id,
    presentationLanguage: argumentsValue.presentation_language,
    workingDirectory: argumentsValue.working_directory,
    targetSource: argumentsValue.target_source,
    primaryTarget: argumentsValue.primary_target,
    runId: argumentsValue.run_id,
    surface: trustedContext.surface,
    expectedVersion: trustedContext.expectedVersion,
    skillSet: trustedContext.skillSet,
    interactionLocales: trustedContext.interactionLocales,
  };
  return deepFreeze(rawInput);
}

export function emptySkillDispatchTiming() {
  return { wrapper_ms: 0, input_ms: 0, target_ms: 0, control_ms: 0, render_ms: 0, total_ms: 0 };
}

export function serializeSkillDispatchResult(result, { outputTooLargeRecovery = "Repair the installed locale registry and retry once." } = {}) {
  const output = JSON.stringify(result, null, 2);
  if (Buffer.byteLength(output, "utf8") <= SKILL_DISPATCH_MAX_OUTPUT_BYTES) return output;
  const recoveryAction = typeof outputTooLargeRecovery === "string"
    && outputTooLargeRecovery.trim()
    && !/[\r\n\0]/u.test(outputTooLargeRecovery)
    && outputTooLargeRecovery.length <= 240
    ? outputTooLargeRecovery
    : "Repair the installed locale registry and retry once.";
  return JSON.stringify({
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    outcome: "evaluator_error",
    terminal: true,
    authorizes: false,
    skill: result.skill ?? null,
    runtime: result.runtime ?? {},
    target: null,
    control: null,
    presentation: null,
    continuation: null,
    recovery: { action: recoveryAction },
    host_action: {
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: recoveryAction,
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    },
    timing: result.timing ?? emptySkillDispatchTiming(),
    diagnostics: [{ code: "dispatch_output_too_large" }],
  }, null, 2);
}
