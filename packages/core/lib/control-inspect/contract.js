import { isAbsolute } from "node:path";
import { RUN_ID_PATTERN } from "../control-state/run-identity.js";
import {
  PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE,
  canonicalizeLanguageTag,
  resolvePresentationLocale,
} from "../interaction-presentation.js";
import { normalizeTaskTargetSource, TASK_TARGET_SOURCES } from "../task-target-resolution.js";
import { SKILL_DISPATCH_MAX_OUTPUT_BYTES, SkillDispatchInputError, emptySkillDispatchTiming } from "../skill-dispatch/contract.js";
import { ALL_ACTIVE_OPERATIONS, VARIANT_OPERATION, MODULE_OPERATION, CONTROL_INSPECT_OPERATIONS, GATE_CHECK_VARIANTS, ReadSelectionError, validateReadSelection } from "./selection.js";

export const CONTROL_INSPECT_SCHEMA_VERSION = "1";
export const CONTROL_INSPECT_CONTRACT_VERSION = 1;
// Every byte of this definition is loaded into every session on every host (SDD-005).
export const CONTROL_INSPECT_MAX_DEFINITION_BYTES = 5000;

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export const CONTROL_INSPECT_FUNCTION_DEFINITION = deepFreeze({
  name: "agdf_inspect",
  description: "Run lists: doctor, all_active:true. 'This project': verified primary_target + target_source:current_repository; cwd alone is not target. Read-only doctor/delivery-map, gate-check status, contract. Never writes, selects a run or grants approval; verified_change git observation is unavailable. report = CLI --json; canonical Markdown.",
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: {
    type: "object", additionalProperties: false,
    required: ["operation", "presentation_language", "working_directory"],
    properties: {
      operation: { enum: [...CONTROL_INSPECT_OPERATIONS] },
      presentation_language: { type: "string", minLength: 1, maxLength: 64, pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE },
      working_directory: { type: "string", minLength: 1, maxLength: 4096 },
      target_source: { enum: [...TASK_TARGET_SOURCES] },
      primary_target: { type: "string", minLength: 1, maxLength: 4096 },
      run_id: { type: "string", pattern: RUN_ID_PATTERN.source },
      variant: { enum: [...GATE_CHECK_VARIANTS], description: "gate-check only." },
      module: { type: "string", minLength: 1, maxLength: 64, description: "Required for contract only." },
      all_active: { type: "boolean", description: "True: doctor/delivery-map only." },
    },
    dependentRequired: { target_source: ["primary_target"], primary_target: ["target_source"] },
    dependentSchemas: {
      variant: { properties: { operation: { const: VARIANT_OPERATION } } },
      module: { properties: { operation: { const: MODULE_OPERATION } } },
    },
    allOf: [
      { anyOf: [{ properties: { all_active: { const: false } } }, { properties: { operation: { enum: [...ALL_ACTIVE_OPERATIONS] } } }] },
      { if: { properties: { operation: { const: MODULE_OPERATION } } }, then: { required: ["module"] } },
    ],
  },
  outputSchema: {
    type: "object",
    required: ["outcome", "terminal", "authorizes", "operation", "report", "presentation", "host_action", "target", "recovery"],
    properties: {
      schema_version: { const: "1" }, contract_version: { const: 1 },
      outcome: { enum: ["inspect_result", "target_unresolved", "invalid_input", "evaluator_error"] },
      terminal: { type: "boolean" }, authorizes: { const: false },
      operation: { type: ["string", "null"] },
      runtime: { type: "object" }, target: { type: ["object", "null"] },
      report: { type: ["object", "null"] },
      presentation: { type: ["object", "null"], required: ["markdown"], properties: { markdown: { type: "string" } } },
      recovery: { type: ["object", "null"], required: ["action"], properties: { action: { type: "string", minLength: 1 } } },
      host_action: {
        type: "object",
        required: ["mode", "source", "allow_surrounding_text", "may_request_run_or_evidence"],
        properties: {
          mode: { enum: ["consume_report_and_continue", "transmit_presentation_verbatim_and_stop", "transmit_recovery_verbatim_and_stop"] },
          source: { enum: ["report", "presentation.markdown", "recovery.action"] },
          text: { type: "string", minLength: 1 }, allow_surrounding_text: { type: "boolean" }, may_request_run_or_evidence: { const: false },
        },
        allOf: [{ if: { properties: { mode: { enum: ["transmit_presentation_verbatim_and_stop", "transmit_recovery_verbatim_and_stop"] } } }, then: { required: ["text"], properties: { allow_surrounding_text: { const: false } } } }],
      },
      timing: { type: "object" }, diagnostics: { type: "array", items: { type: "object" } },
    },
    oneOf: [
      {
        properties: {
          outcome: { const: "inspect_result" }, terminal: { const: false },
          operation: { enum: [...CONTROL_INSPECT_OPERATIONS] },
          report: { type: "object" }, target: { type: "object", required: ["resolution_state"], properties: { resolution_state: { const: "resolved" } } }, recovery: { type: "null" },
          host_action: { properties: { mode: { const: "consume_report_and_continue" }, source: { enum: ["report", "presentation.markdown"] }, allow_surrounding_text: { const: true } } },
        },
        if: { properties: { host_action: { properties: { source: { const: "presentation.markdown" } } } } },
        then: { properties: { presentation: { type: "object", properties: { markdown: { minLength: 1 } } }, host_action: { required: ["text"] } } },
        else: { properties: { presentation: { anyOf: [{ type: "null" }, { type: "object", properties: { markdown: { const: "" } } }] }, host_action: { not: { required: ["text"] } } } },
      },
      {
        properties: {
          outcome: { const: "target_unresolved" }, terminal: { const: true }, report: { type: "null" },
          target: { type: "object", required: ["resolution_state"], properties: { resolution_state: { const: "unresolved" } } }, recovery: { type: "object" },
          presentation: { type: "object", properties: { markdown: { minLength: 1 } } },
          host_action: { properties: { mode: { const: "transmit_presentation_verbatim_and_stop" }, source: { const: "presentation.markdown" } } },
        },
      },
      {
        properties: {
          outcome: { enum: ["invalid_input", "evaluator_error"] }, terminal: { const: true },
          report: { type: "null" }, presentation: { type: "null" }, recovery: { type: "object" },
          host_action: { properties: { mode: { const: "transmit_recovery_verbatim_and_stop" }, source: { const: "recovery.action" } } },
        },
      },
    ],
  },
});

export function controlInspectDefinitionBytes(definition = CONTROL_INSPECT_FUNCTION_DEFINITION) {
  return Buffer.byteLength(JSON.stringify(definition), "utf8");
}

function requireText(value, field, maximum = 240) {
  if (typeof value !== "string" || !value.trim()) throw new SkillDispatchInputError(field, `${field} is required`);
  if (value.length > maximum || /[\r\n\0]/u.test(value)) throw new SkillDispatchInputError(field, `${field} is invalid`);
  return value;
}

export function parseControlInspectFunctionArguments(argumentsValue, trustedContext) {
  if (!argumentsValue || typeof argumentsValue !== "object" || Array.isArray(argumentsValue)) {
    throw new SkillDispatchInputError("arguments", "arguments must be an object");
  }
  const schema = CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema;
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
  return deepFreeze({
    operation: argumentsValue.operation,
    presentationLanguage: argumentsValue.presentation_language,
    workingDirectory: argumentsValue.working_directory,
    targetSource: argumentsValue.target_source,
    primaryTarget: argumentsValue.primary_target,
    runId: argumentsValue.run_id,
    ...(argumentsValue.variant !== undefined ? { variant: argumentsValue.variant } : {}),
    ...(argumentsValue.module !== undefined ? { contractModule: argumentsValue.module } : {}),
    ...(argumentsValue.all_active !== undefined ? { allActive: argumentsValue.all_active } : {}),
    surface: trustedContext.surface,
    expectedVersion: trustedContext.expectedVersion,
    interactionLocales: trustedContext.interactionLocales,
  });
}

// Normalizes a raw inspect input with the dispatcher's language and target rules and the shared
// read-selection rules. Throws SkillDispatchInputError or ReadSelectionError; both carry `field`.
export function normalizeControlInspectInput(input) {
  const operation = requireText(input.operation, "operation", 64);
  if (!CONTROL_INSPECT_OPERATIONS.includes(operation)) throw new SkillDispatchInputError("operation", `Unsupported inspect operation: ${operation}`);
  let requestedPresentationLanguage;
  try {
    requestedPresentationLanguage = requireText(input.presentationLanguage, "presentation_language", 64);
  } catch {
    throw new SkillDispatchInputError("presentation_language", "presentation_language is required");
  }
  const canonical = canonicalizeLanguageTag(requestedPresentationLanguage);
  if (!canonical) throw new SkillDispatchInputError("presentation_language", "presentation_language is invalid");
  const presentationLanguage = resolvePresentationLocale(input.interactionLocales, canonical);
  const workingDirectory = requireText(input.workingDirectory, "working_directory", 4096);
  if (!isAbsolute(workingDirectory)) throw new SkillDispatchInputError("working_directory", "working_directory must be absolute");
  const rawTargetSource = input.targetSource || null;
  const primaryTarget = input.primaryTarget || null;
  if (Boolean(rawTargetSource) !== Boolean(primaryTarget)) throw new SkillDispatchInputError("primary_target", "target_source and primary_target must be supplied together");
  if (primaryTarget && (!isAbsolute(primaryTarget) || primaryTarget.length > 4096)) throw new SkillDispatchInputError("primary_target", "primary_target must be an absolute bounded path");
  const targetSource = rawTargetSource ? normalizeTaskTargetSource(rawTargetSource, { allowEmpty: false }) : null;
  const runId = input.runId || null;
  if (runId && !RUN_ID_PATTERN.test(runId)) throw new SkillDispatchInputError("run_id", "run_id is invalid");
  if (input.allActive !== undefined && typeof input.allActive !== "boolean") throw new SkillDispatchInputError("all_active", "all_active is invalid");
  if (input.contractModule !== undefined) requireText(input.contractModule, "module", 64);
  if (input.variant !== undefined) requireText(input.variant, "variant", 32);
  validateReadSelection({
    operation,
    allActive: input.allActive === true,
    contractModule: input.contractModule,
    variant: input.variant,
  });
  return Object.freeze({
    schema_version: CONTROL_INSPECT_SCHEMA_VERSION,
    operation,
    surface: input.surface ?? null,
    presentation_language: presentationLanguage,
    working_directory: workingDirectory,
    target_source: targetSource,
    primary_target: primaryTarget,
    run_id: runId,
    variant: input.variant,
    contract_module: input.contractModule,
    all_active: input.allActive === true,
    expected_version: requireText(input.expectedVersion, "expected_version", 64),
  });
}

export { ReadSelectionError };

export const CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY = "The inspect result exceeds the 1 MiB MCP output limit. Narrow the selection (one run_id instead of all_active) or use the CLI with --json.";

// Same 1 MiB ceiling as the dispatcher, but the fallback keeps the inspect result shape so the host
// receives a schema-valid recovery instead of a schema error.
export function serializeControlInspectResult(result) {
  const output = JSON.stringify(result, null, 2);
  if (Buffer.byteLength(output, "utf8") <= SKILL_DISPATCH_MAX_OUTPUT_BYTES) return output;
  return JSON.stringify({
    schema_version: CONTROL_INSPECT_SCHEMA_VERSION,
    contract_version: CONTROL_INSPECT_CONTRACT_VERSION,
    outcome: "evaluator_error",
    terminal: true,
    authorizes: false,
    operation: result?.operation ?? null,
    runtime: result?.runtime ?? {},
    target: result?.target ?? null,
    report: null,
    presentation: null,
    recovery: { action: CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY },
    host_action: {
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY,
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    },
    timing: result?.timing ?? emptySkillDispatchTiming(),
    diagnostics: [{ code: "inspect_output_too_large" }],
  }, null, 2);
}
