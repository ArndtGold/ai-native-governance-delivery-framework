import { isAbsolute } from "node:path";
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from "../control-state/run-identity.js";
import {
  PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE,
  canonicalizeLanguageTag,
  resolvePresentationLocale,
} from "../interaction-presentation.js";
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

export const SKILL_DISPATCH_PRESENTATION_LANGUAGE_DESCRIPTION = "Required presentation language for the latest natural-language user request as one well-formed BCP 47 tag. If the request explicitly asks for a response language, use that tag; otherwise use the dominant request language. Use en when mixed or ambiguous. A valid unsupported tag renders through the complete English pack. Missing or invalid input fails before governance evaluation.";
export const SKILL_DISPATCH_PRESENTATION_LANGUAGE_RECOVERY = "Provide one well-formed BCP 47 presentation_language tag and retry once.";
export const SKILL_DISPATCH_TERMINAL_RESPONSE_DESCRIPTION = "For a result with `terminal: true`, the entire assistant response must consist only of host_action.text, copied verbatim. Add no question, explanation, heading, citation, link or other surrounding text; do not translate or reformat it; invoke no later tool and stop.";
export const SKILL_DISPATCH_INTAKE_DESCRIPTION = "Set true only with skill_id gate-check when the governed delivery intake (catalog delivery.start) is the active route; delivery wins mixed intent, so a gate-check invocation that asks for a change also sets it. Omit it for status, approval or next-step questions. It never grants approval or delivery authority.";
export const SKILL_DISPATCH_INTAKE_CONTINUATION_DESCRIPTION = "For intake_continuation phase resolve_delivery_run, match the request to supplied UR scope evidence; resume one same-scope run with its expected_revision_id, or start a clear new scope. Ask only about genuinely ambiguous work, never for technical Run IDs. Other phases execute continuation.steps in order; presentation_required shows run-present text and waits for a NEW deliberate response. Preparation approves no gate.";
export const SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION = "For a qa-gate skill_continuation, control.candidate_runs is the complete canonical active-run inventory when run selection is unresolved, otherwise an empty array. Use its run_id, objective, normalized current_gate, decision and revision_id fields as data; filter by current_gate: QA and do not rescan run files, invent candidates or omit returned QA candidates.";

export const SKILL_DISPATCH_FUNCTION_DEFINITION = deepFreeze({
  name: "agdf_dispatch",
  description: `Run the version-matched AGDF preflight for one canonical skill. It resolves target and control state but never grants approval or delivery authority. ${SKILL_DISPATCH_TERMINAL_RESPONSE_DESCRIPTION} For skill_continuation, follow its continuation instruction using only the returned target and control. ${SKILL_DISPATCH_INTAKE_CONTINUATION_DESCRIPTION}`,
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
      skill_id: { type: "string", minLength: 1, maxLength: 240, description: "Canonical AGDF skill slug or exact catalog-registered skill name for the calling host; normalized internally to the stable canonical ID." },
      presentation_language: {
        type: "string", minLength: 1, maxLength: 64,
        pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE,
        description: SKILL_DISPATCH_PRESENTATION_LANGUAGE_DESCRIPTION,
      },
      working_directory: { type: "string", minLength: 1, maxLength: 4096, description: "Absolute execution-context path. It never selects or authorizes a target." },
      target_source: {
        type: "string", oneOf: targetSourceChoices,
        description: "Authority source for primary_target. Supply it only with primary_target and only when exactly one listed meaning applies; otherwise omit both fields.",
      },
      primary_target: { type: "string", minLength: 1, maxLength: 4096, description: "Absolute governance-target path paired with target_source. Never derive it from working_directory alone." },
      run_id: { type: "string", pattern: RUN_ID_PATTERN.source, description: "Canonical run identifier. Select an existing run from an explicit request, confirmed continuation or unequivocal same-scope assignment after resolve_delivery_run. Scope assignment must use expected_revision_id. For intake_mode new, choose an unused id for the authorized change; never reuse an existing run." },
      expected_revision_id: { type: "string", pattern: REVISION_ID_PATTERN.source, description: "Revision from the resolve_delivery_run candidate used for scope matching. Requires intake true, intake_mode resume and run_id. Changed or unavailable binding returns fresh assignment evidence before gate evaluation; it never adopts another run automatically." },
      intake: { type: "boolean", description: SKILL_DISPATCH_INTAKE_DESCRIPTION },
      intake_mode: { type: "string", enum: ["new", "resume"], description: "With intake true: new prepares the explicitly authorized new scope at an unused run_id; resume continues the bound run. Requires run_id. Never infer new from ambiguous continuation." },
      continue_delivery: { type: "boolean", description: "Set only with skill_id gate-check for an authorized bound delivery continuation, including after a valid UR, PRD, SD, TP or UAT approval. Requires run_id; incompatible with intake. Never set on a returned judgement skill or for status or advice. Allows canonical Brownfield Review / Mode-Slice recovery, implementation-preparation Brownfield Analysis after TP approval, missing PRD/SD/TP preparation before approval cards, and OR closeout after UAT approval." },
    },
    dependentRequired: { target_source: ["primary_target"], primary_target: ["target_source"] },
    dependentSchemas: {
      intake_mode: { required: ["intake", "run_id"], properties: { intake: { const: true } } },
      expected_revision_id: { required: ["intake", "intake_mode", "run_id"], properties: { intake: { const: true }, intake_mode: { const: "resume" } } },
    },
    allOf: [{
      if: { required: ["continue_delivery"], properties: { continue_delivery: { const: true } } },
      then: { required: ["run_id"], properties: { intake: { const: false } }, not: { required: ["intake_mode"] } },
    }],
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
        enum: ["invalid_input", "target_unresolved", "control_result", "skill_continuation", "intake_continuation", "evaluator_error"],
      },
      terminal: { type: "boolean" },
      authorizes: { type: "boolean", const: false },
      skill: { anyOf: [{ type: "object" }, { type: "null" }] },
      runtime: { type: "object" },
      target: { anyOf: [{ type: "object" }, { type: "null" }] },
      control: {
        anyOf: [{ type: "object" }, { type: "null" }],
        description: SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION,
      },
      presentation: {
        anyOf: [{ type: "object" }, { type: "null" }],
        description: "Canonical Markdown for terminal results. For presentation_required it is the read-only approval_preview of the current gate (same digests as run-present); it binds nothing, so still run the supplied run-present step and ask the gate question only after its presentation_id exists.",
      },
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
  return `--skill <skill-id> --language <language-tag> --working-directory <absolute-path> [--target-source <${targetSources}> --primary-target <absolute-path>] [--run <run_id>] [--intake [--intake-mode <new|resume>] [--revision <uuid>]] [--continue-delivery]`;
}

export function skillDispatchCommandGrammar() {
  return `--json ${skillDispatchArgumentGrammar()
    .replace("--skill <skill-id>", "--skill <skill-id> --surface <surface>")}`;
}

export function renderSkillDispatchSemanticProjection() {
  return "`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.";
}

export function renderSkillDispatchLanguageProjection() {
  const description = SKILL_DISPATCH_FUNCTION_DEFINITION.inputSchema.properties.presentation_language.description;
  return `For \`--language\`: ${description}`;
}

export function renderSkillDispatchTerminalProjection() {
  return SKILL_DISPATCH_TERMINAL_RESPONSE_DESCRIPTION;
}

export function renderSkillDispatchQaCandidatesProjection() {
  return SKILL_DISPATCH_QA_CANDIDATES_DESCRIPTION;
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

export function normalizeSkillDispatchInput(input, registry, pluginDefinition) {
  const requestedSkill = requireText(input.skillId, "skill_id");
  const surface = requireText(input.surface, "surface");
  if (!SURFACES.has(surface)) throw new SkillDispatchInputError("surface", `Unsupported surface: ${surface}`);
  const names = pluginDefinition ? buildSkillNameCatalog(pluginDefinition, surface).names : new Map([...registry.keys()].map(id => [id, id]));
  const skillId = names.get(requestedSkill);
  const skill = registry.get(skillId);
  if (!skill) throw new SkillDispatchInputError("skill_id", `Unknown AGDF skill: ${requestedSkill}`, { allowedValues: [...names.keys()] });
  let requestedPresentationLanguage;
  try {
    requestedPresentationLanguage = requireText(input.presentationLanguage, "presentation_language", 64);
  } catch {
    throw new SkillDispatchInputError("presentation_language", "presentation_language is required");
  }
  const canonicalPresentationLanguage = canonicalizeLanguageTag(requestedPresentationLanguage);
  if (!canonicalPresentationLanguage) {
    throw new SkillDispatchInputError("presentation_language", "presentation_language is invalid");
  }
  const presentationLanguage = resolvePresentationLocale(input.interactionLocales, canonicalPresentationLanguage);
  const workingDirectory = requireText(input.workingDirectory, "working_directory", 4096);
  if (!isAbsolute(workingDirectory)) throw new SkillDispatchInputError("working_directory", "working_directory must be absolute");
  const rawTargetSource = input.targetSource || null;
  const primaryTarget = input.primaryTarget || null;
  if (Boolean(rawTargetSource) !== Boolean(primaryTarget)) throw new SkillDispatchInputError("primary_target", "target_source and primary_target must be supplied together");
  if (primaryTarget && (!isAbsolute(primaryTarget) || primaryTarget.length > 4096)) throw new SkillDispatchInputError("primary_target", "primary_target must be an absolute bounded path");
  const targetSource = rawTargetSource ? normalizeTaskTargetSource(rawTargetSource, { allowEmpty: false }) : null;
  const runId = input.runId || null;
  if (runId && !RUN_ID_PATTERN.test(runId)) throw new SkillDispatchInputError("run_id", "run_id is invalid");
  if (input.intake !== undefined && (typeof input.intake !== "boolean" || (input.intake && skill.dispatch_mode !== "deterministic_control"))) {
    throw new SkillDispatchInputError("intake", "intake is invalid");
  }
  if (input.intakeMode !== undefined && (!input.intake || !runId || !["new", "resume"].includes(input.intakeMode))) {
    throw new SkillDispatchInputError("intake_mode", "intake_mode requires intake and run_id");
  }
  if (input.expectedRevisionId !== undefined && (typeof input.expectedRevisionId !== "string" || !REVISION_ID_PATTERN.test(input.expectedRevisionId)
      || !input.intake || input.intakeMode !== "resume" || !runId)) {
    throw new SkillDispatchInputError("expected_revision_id", "expected_revision_id requires intake_mode resume and run_id");
  }
  if (input.continueDelivery !== undefined && (typeof input.continueDelivery !== "boolean"
      || (input.continueDelivery && (skill.dispatch_mode !== "deterministic_control" || !runId || input.intake || input.intakeMode)))) {
    throw new SkillDispatchInputError("continue_delivery", "continue_delivery requires skill_id gate-check and a bound run; it excludes intake");
  }
  return Object.freeze({
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    skill_id: skillId,
    surface,
    presentation_language: presentationLanguage,
    working_directory: workingDirectory,
    target_source: targetSource,
    primary_target: primaryTarget,
    run_id: runId,
    intake: input.intake === true,
    intake_mode: input.intakeMode,
    expected_revision_id: input.expectedRevisionId,
    continue_delivery: input.continueDelivery === true,
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
    ...(argumentsValue.intake !== undefined ? { intake: argumentsValue.intake } : {}),
    ...(argumentsValue.intake_mode !== undefined ? { intakeMode: argumentsValue.intake_mode } : {}),
    ...(argumentsValue.expected_revision_id !== undefined ? { expectedRevisionId: argumentsValue.expected_revision_id } : {}),
    ...(argumentsValue.continue_delivery !== undefined ? { continueDelivery: argumentsValue.continue_delivery } : {}),
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

// Derived host names only; the plugin definition remains the sole skill inventory.
const SLUG = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
export const SKILL_NAME_PATTERN = /^[a-z][a-z0-9-]*(?::[a-z][a-z0-9-]*)?$/u;

function slug(value) {
  if (typeof value !== "string" || value.length > 64 || !SLUG.test(value)) throw new Error("Invalid skill name definition");
  return value;
}

export function buildSkillNameCatalog(definition, surface) {
  if (!SURFACES.has(surface) || !definition || !Array.isArray(definition.skillSet) || !definition.skillSet.length) throw new Error("Invalid skill name catalog");
  const id = slug(definition.id);
  const profile = definition[surface];
  if (!profile || typeof profile.skillPrefix !== "string" || (profile.skillPrefix && !/^[a-z][a-z0-9-]*-$/u.test(profile.skillPrefix))) throw new Error("Invalid host skill prefix");
  if (surface === "opencode" && (typeof profile.globalSkillPrefix !== "string" || !/^[a-z][a-z0-9-]*-$/u.test(profile.globalSkillPrefix))) throw new Error("Invalid global skill prefix");
  const names = new Map();
  const skills = new Map();
  const add = (name, canonicalId) => {
    if (name.length > 64 || !SKILL_NAME_PATTERN.test(name)) throw new Error("Invalid projected skill name");
    if (names.has(name) && names.get(name) !== canonicalId) throw new Error(`Ambiguous host skill name: ${name}`);
    names.set(name, canonicalId);
  };
  for (const skill of definition.skillSet) {
    const canonicalId = slug(skill?.slug);
    if (skills.has(canonicalId)) throw new Error(`Duplicate skill slug: ${canonicalId}`);
    const localName = `${profile.skillPrefix}${canonicalId}`;
    const globalName = surface === "opencode" ? `${profile.globalSkillPrefix}${canonicalId}` : localName;
    add(canonicalId, canonicalId);
    add(localName, canonicalId);
    add(globalName, canonicalId);
    if (surface === "codex" || surface === "claude") add(`${id}:${localName}`, canonicalId);
    skills.set(canonicalId, Object.freeze({ canonicalId, localName, globalName }));
  }
  return { names, skills };
}

export function hostSkillName(definition, surface, canonicalId, { global = false } = {}) {
  const entry = buildSkillNameCatalog(definition, surface).skills.get(canonicalId);
  if (!entry) throw new Error(`Unknown canonical skill: ${canonicalId}`);
  return global ? entry.globalName : entry.localName;
}

// Only identity, explicit slash invocations and already projected host references.
// Bare canonical IDs in backticks, CLI arguments and filesystem paths are untouched.
export function projectHostSkillNames(content, definition, surface, { global = false } = {}) {
  const { skills } = buildSkillNameCatalog(definition, surface);
  let next = content.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n|$)/u, header => header.replace(/^name: ([a-z][a-z0-9-]*)[ \t]*$/gmu, (line, name) => {
    const entry = [...skills.values()].find(item => item.canonicalId === name || item.localName === name);
    return entry ? `name: ${global ? entry.globalName : entry.localName}` : line;
  }));
  for (const entry of skills.values()) {
    const target = global ? entry.globalName : entry.localName;
    next = next.replaceAll(`\`/${entry.canonicalId}\``, `\`/${target}\``);
    if (global && entry.localName !== entry.canonicalId) {
      next = next.replaceAll(`\`${entry.localName}\``, `\`${target}\``)
        .replaceAll(`\`/${entry.localName}\``, `\`/${target}\``);
    }
  }
  return next;
}
