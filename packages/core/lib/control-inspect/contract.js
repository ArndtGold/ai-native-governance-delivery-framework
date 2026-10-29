import { isAbsolute } from "node:path";
import { RUN_ID_PATTERN, REVISION_ID_PATTERN } from "../control-state/run-identity.js";
import { RUN_COMMAND_GROUPS } from '../control-state/run-command-schema.js';
import { APPROVAL_GATES } from '../control-state/run-identity.js';
import {
  PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE,
  canonicalizeLanguageTag,
  resolvePresentationLocale,
} from "../interaction-presentation.js";
import { normalizeTaskTargetSource, TASK_TARGET_SOURCES } from "../task-target-resolution.js";
import { SKILL_DISPATCH_MAX_OUTPUT_BYTES, SkillDispatchInputError, emptySkillDispatchTiming } from "../skill-dispatch/contract.js";
import { ARTIFACT_READINESS_GATES, ALL_ACTIVE_OPERATIONS, VARIANT_OPERATION, MODULE_OPERATION, CONTROL_INSPECT_OPERATIONS, GATE_CHECK_VARIANTS, ReadSelectionError, validateReadSelection } from "./selection.js";

export const CONTROL_INSPECT_SCHEMA_VERSION = "1";
export const CONTROL_INSPECT_CONTRACT_VERSION = 1;
// Shared discovery budget across hosts (SDD-005).
export const CONTROL_INSPECT_MAX_DEFINITION_BYTES = 5000;
export const OPERATION_CONTRACT_MODULES = Object.freeze(Object.entries(RUN_COMMAND_GROUPS)
  .flatMap(([group, kinds]) => kinds.map(kind => `${group}/${kind}`)));

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

// Shared discovery, selector guards and on-demand help.
export const PRESENTATION_OPERATIONS = Object.freeze(['presentation-document', 'presentation-preview']);
export const BOUND_INSPECT_OPERATIONS = Object.freeze(['artifact-readiness', 'authoring-inputs', 'operation-contract', 'operation-status', 'native-qualification', ...PRESENTATION_OPERATIONS, 'runtime-generations']);
export const PRESENTATION_CATALOG_MODULE = 'agdf_prepare/presentation.prepare';
const uuidSchema = { type: 'string', pattern: REVISION_ID_PATTERN.source };
const cursorSchema = { type: 'string', maxLength: 80, pattern: '^[0-9a-f]{64}:(?:0|[1-9][0-9]{0,6})$' };
const fieldModel = {
  operation: { help: 'Read only; never prepare or approve.', schema: { enum: [...CONTROL_INSPECT_OPERATIONS] }, description: 'Read action.' },
  presentation_language: { help: 'Required BCP47 tag; unsupported valid languages fall back to complete English.', schema: { type: 'string', maxLength: 64, pattern: PRESENTATION_LANGUAGE_TAG_PATTERN_SOURCE }, description: 'Reply BCP47 tag.' },
  working_directory: { help: 'Absolute context; never selects a target.', schema: { type: 'string', minLength: 1, maxLength: 4096 }, description: 'Context; not target authority.' },
  target_source: { help: 'Actual provenance: explicit_target = specified; continued_target = confirmed; current_repository = unambiguous.', schema: { enum: [...TASK_TARGET_SOURCES] }, description: 'Requires primary_target.' },
  primary_target: { help: 'Confirmed absolute root paired with target_source; cwd is not target authority.', schema: { type: 'string', minLength: 1, maxLength: 4096 }, description: 'Pair: target_source.' },
  run_id: { help: 'Named or confirmed Run; never select by recency.', schema: { type: 'string', pattern: RUN_ID_PATTERN.source }, description: 'Confirmed run.' },
  gate: { help: 'Requested document gate or catalog filter, never a selection heuristic. artifact-readiness: UR/PRD/SD/TP only.', schema: { enum: [...APPROVAL_GATES] }, description: 'Document gate. Never with gate-check.', operations: ['artifact-readiness', 'operation-contract', ...PRESENTATION_OPERATIONS] },
  expected_revision_id: { help: 'Bound inspections use current gate-check revision. Document/preview reads preserve the original selected catalog or conversation revision.', schema: { $ref: '#/$defs/i' }, description: 'gate-check revision; original for reads.', operations: BOUND_INSPECT_OPERATIONS },
  presentation_id: { help: 'Exact prepared ID from validated catalog or conversation. Never guess, select by timestamp, or prepare a replacement to read.', schema: { $ref: '#/$defs/i' }, description: 'ID from catalog/conversation.', operations: PRESENTATION_OPERATIONS },
  target_id: { help: 'Copy target hash from operation-contract binding or catalog read_arguments; never grants authority.', schema: { type: 'string', pattern: '^sha256:[0-9a-f]{64}$' }, description: 'Target hash: operation-contract.', operations: PRESENTATION_OPERATIONS },
  cursor: { help: 'Omit initially; copy next_cursor. doctor requires all_active; catalog requires its declared module. Never exchange cursor types.', schema: cursorSchema, description: 'Copy next_cursor.', operations: [...PRESENTATION_OPERATIONS, 'operation-contract', 'authoring-inputs', 'doctor'] },
  variant: { help: 'gate-check view only; never records approval.', schema: { enum: [...GATE_CHECK_VARIANTS] }, description: 'gate-check view.', operations: [VARIANT_OPERATION] },
  module: { help: 'contract: advertised module; operation-contract: group/kind; operation-status: original operation UUID from saved receipt, never a new UUID.', schema: { type: 'string', minLength: 1, maxLength: 64 }, description: 'Contract, group/kind or receipt UUID.', operations: [MODULE_OPERATION, 'operation-contract', 'operation-status'] },
  all_active: { help: 'true: doctor/delivery-map only; false: selected Run.', schema: { type: 'boolean' }, description: 'All runs: doctor/delivery-map.' },
};
const selectorKeys = { gate: 'gate', expected_revision_id: 'expectedRevisionId', presentation_id: 'presentationId', target_id: 'targetId', cursor: 'cursor', variant: 'variant', module: 'contractModule' };
const moduleOperations = [MODULE_OPERATION, 'operation-contract', 'operation-status'];
const inputSchema = {
  type: 'object', additionalProperties: false,
  required: ['operation', 'presentation_language', 'working_directory'],
  $defs: { i: uuidSchema, b: { not: { enum: CONTROL_INSPECT_OPERATIONS.filter(op => !BOUND_INSPECT_OPERATIONS.includes(op)) } }, d: { enum: PRESENTATION_OPERATIONS }, m: { enum: moduleOperations } },
  properties: Object.fromEntries(Object.entries(fieldModel).map(([name, field]) => [name, { ...field.schema, description: field.description }])),
  dependentRequired: { target_source: ['primary_target'], primary_target: ['target_source'] },
  dependentSchemas: Object.fromEntries(Object.entries(fieldModel).filter(([, f]) => f.operations).map(([name, field]) => [name,
    name === 'cursor' ? { anyOf: [ { properties: { operation: { enum: [...PRESENTATION_OPERATIONS, 'authoring-inputs'] } } },
      { properties: { operation: { const: 'doctor' }, all_active: { const: true } }, required: ['all_active'] },
      { properties: { operation: { const: 'operation-contract' }, module: { const: PRESENTATION_CATALOG_MODULE } } } ] }
      : { properties: { operation: field.operations === BOUND_INSPECT_OPERATIONS ? { $ref: '#/$defs/b' }
        : field.operations === PRESENTATION_OPERATIONS ? { $ref: '#/$defs/d' } : name === 'module' ? { $ref: '#/$defs/m' } : { enum: field.operations } } },
  ])),
  allOf: [
    { if: { properties: { operation: { const: 'project-state' } } }, then: { required: ['target_source', 'primary_target'], not: { anyOf: [{ required: ['run_id'] }, { required: ['expected_revision_id'] }] } } },
    { not: { properties: { all_active: { const: true } }, required: ['all_active', 'run_id'] } },
    { anyOf: [{ properties: { all_active: { const: false } } }, { properties: { operation: { enum: [...ALL_ACTIVE_OPERATIONS] } } }] },
    { if: { properties: { operation: { $ref: '#/$defs/m' } } }, then: { required: ['module'] } },
    { if: { properties: { operation: { $ref: '#/$defs/b' } } }, then: { required: ['target_source'], anyOf: [
      { required: ['run_id', 'expected_revision_id'] },
      { not: { anyOf: [{ required: ['run_id'] }, { required: ['expected_revision_id'] }] }, oneOf: [
        { properties: { operation: { const: 'operation-status' } } },
        { properties: { operation: { const: 'operation-contract' }, module: { enum: ['agdf_run/run.create', 'agdf_project/project.initialize'] } }, required: ['module'] },
      ] },
    ] } },
    { if: { properties: { operation: { const: 'artifact-readiness' } } }, then: { required: ['gate'], properties: { gate: { enum: [...ARTIFACT_READINESS_GATES] } } } },
    { if: { properties: { operation: { $ref: '#/$defs/d' } } }, then: { required: ['gate', 'presentation_id', 'target_id'] } },
  ],
};

inputSchema.dependentSchemas.operation = { allOf: inputSchema.allOf };
delete inputSchema.allOf;
const conciseHelp = { operation: 'Read operation.', presentation_language: 'Reply language.', working_directory: 'Context directory.',
  target_source: 'Target provenance.', primary_target: 'Confirmed target.', run_id: 'Confirmed Run.', gate: 'Gate selector.',
  expected_revision_id: 'Bound revision.', presentation_id: 'Presentation ID.', target_id: 'Target identity.', cursor: 'Next page cursor.',
  variant: 'Status variant.', module: 'Contract or UUID.', all_active: 'Inventory scope.' };
for (const [key, description] of Object.entries(conciseHelp)) inputSchema.properties[key].description = description;

const inspectContract = {
  name: "agdf_inspect",
  description: "Read-only. Follow navigation.next_calls sequentially; read all pages. operation-contract: help.",
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema,
  outputSchema: {
    type: 'object', required: ['outcome', 'terminal', 'authorizes', 'operation', 'report', 'presentation', 'host_action', 'target', 'recovery'],
    properties: {
      schema_version: { const: '1' }, contract_version: { const: 1 }, authorizes: { const: false },
      operation: { type: ['string', 'null'] }, runtime: { type: 'object' }, target: { type: ['object', 'null'] },
      report: { type: ['object', 'null'] }, recovery: { type: ['object', 'null'], required: ['action'], properties: { action: { type: 'string', minLength: 1 } } },
      presentation: { type: ['object', 'null'], required: ['markdown'], properties: { markdown: { type: 'string' } } },
      timing: { type: 'object' }, diagnostics: { type: 'array', items: { type: 'object' } },
      host_action: { type: 'object', required: ['mode', 'source', 'allow_surrounding_text', 'may_request_run_or_evidence'],
        properties: { text: { type: 'string', minLength: 1 }, may_request_run_or_evidence: { const: false } } },
    },
    oneOf: [
      { properties: { outcome: { const: 'inspect_result' }, terminal: { const: false }, operation: { enum: [...CONTROL_INSPECT_OPERATIONS] },
        report: { type: 'object' }, recovery: { type: 'null' }, target: { type: 'object', required: ['resolution_state'], properties: { resolution_state: { const: 'resolved' } } },
        host_action: { properties: { mode: { const: 'consume_report_and_continue' }, source: { enum: ['report', 'presentation.markdown'] }, allow_surrounding_text: { const: true } } } },
        if: { properties: { host_action: { properties: { source: { const: 'presentation.markdown' } } } } },
        then: { properties: { presentation: { type: 'object', properties: { markdown: { minLength: 1 } } }, host_action: { required: ['text'] } } },
        else: { properties: { presentation: { anyOf: [{ type: 'null' }, { properties: { markdown: { const: '' } } }] }, host_action: { not: { required: ['text'] } } } },
      },
      { properties: { outcome: { const: 'target_unresolved' }, terminal: { const: true }, report: { type: 'null' }, recovery: { type: 'object' },
        target: { type: 'object', required: ['resolution_state'], properties: { resolution_state: { const: 'unresolved' } } },
        presentation: { type: 'object', properties: { markdown: { minLength: 1 } } },
        host_action: { required: ['text'], properties: { mode: { const: 'transmit_presentation_verbatim_and_stop' }, source: { const: 'presentation.markdown' }, allow_surrounding_text: { const: false } } } } },
      { properties: { outcome: { enum: ['invalid_input', 'evaluator_error'] }, terminal: { const: true }, report: { type: 'null' }, recovery: { type: 'object' }, presentation: { type: 'null' },
        host_action: { required: ['text'], properties: { mode: { const: 'transmit_recovery_verbatim_and_stop' }, source: { const: 'recovery.action' }, allow_surrounding_text: { const: false } } } } },
    ],
  },
};

// Core retains full result validation; discovery advertises the bounded envelope.
export const CONTROL_INSPECT_OUTPUT_SCHEMA = deepFreeze(inspectContract.outputSchema);
export const CONTROL_INSPECT_FUNCTION_DEFINITION = deepFreeze({
  ...inspectContract,
  outputSchema: { type: 'object', required: inspectContract.outputSchema.required,
    properties: { authorizes: { const: false },
      outcome: { enum: ['inspect_result', 'target_unresolved', 'invalid_input', 'evaluator_error'] },
    },
    if: { properties: { outcome: { const: 'inspect_result' } } },
    then: { properties: { terminal: { const: false }, report: { type: 'object' }, recovery: { type: 'null' } } },
    else: { properties: { terminal: { const: true }, report: { type: 'null' }, recovery: { type: 'object' } } },
  },
});

export function inspectContractHelp() {
  const base = { presentation_language: 'de', working_directory: '/workspace/project', target_source: 'explicit_target', primary_target: '/workspace/project', run_id: 'demo-run-01' };
  const revision = '00000000-0000-4000-8000-000000000001';
  return deepFreeze({ schema_version: '1', authorizes: false,
    parameters: Object.fromEntries(Object.entries(fieldModel).map(([key, field]) => [key, { description: field.help ?? field.description, operations: field.operations ?? [...CONTROL_INSPECT_OPERATIONS] }])),
    operations: Object.fromEntries(CONTROL_INSPECT_OPERATIONS.map(operation => [operation, {
      required: [...inputSchema.required, ...(BOUND_INSPECT_OPERATIONS.includes(operation) ? ['run_id', 'expected_revision_id', 'target_source', 'primary_target'] : []),
        ...(['contract', 'operation-contract', 'operation-status'].includes(operation) ? ['module'] : []),
        ...(operation === 'artifact-readiness' ? ['gate'] : PRESENTATION_OPERATIONS.includes(operation) ? ['gate', 'presentation_id', 'target_id'] : [])],
      ...(['operation-contract', 'operation-status'].includes(operation) ? { unbound: {
        module: operation === 'operation-contract' ? 'agdf_run/run.create' : 'original run.create operation UUID',
        required: [...inputSchema.required, 'target_source', 'primary_target', 'module'],
        omit: ['run_id', 'expected_revision_id'],
      } } : {}),
    }])),
    examples_are_illustrative: true,
    examples: [ { ...base, operation: 'gate-check' },
      { ...base, operation: 'operation-contract', module: PRESENTATION_CATALOG_MODULE, expected_revision_id: revision, gate: 'UR' },
      { ...base, operation: 'presentation-document', expected_revision_id: revision, gate: 'UR', presentation_id: '00000000-0000-4000-8000-000000000002', target_id: `sha256:${'0'.repeat(64)}` } ],
    provenance: 'Preserve exact conversation bindings; otherwise require unique complete catalog discovery or explicit selection. Reads keep original revisions. Prepared proves neither viewing nor approval. Catalog cursors require the catalog module.',
    catalog_limits: { page_candidates: 16, record_files: 256, record_bytes: 1048576, directory_entries: 1024 },
  });
}

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
    ...Object.fromEntries(Object.entries(selectorKeys).filter(([field]) => argumentsValue[field] !== undefined).map(([field, key]) => [key, argumentsValue[field]])),
    ...(argumentsValue.all_active !== undefined ? { allActive: argumentsValue.all_active } : {}),
    surface: trustedContext.surface,
    expectedVersion: trustedContext.expectedVersion,
    interactionLocales: trustedContext.interactionLocales,
  });
}

// Shared language, target and read-selection rules; errors carry the invalid field.
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
  if (runId && input.allActive === true) throw new SkillDispatchInputError('all_active', 'All-active and selected Run scopes cannot be combined');
  if (operation === 'project-state') {
    if (!primaryTarget || runId || input.expectedRevisionId !== undefined || input.gate !== undefined) throw new SkillDispatchInputError('binding', 'Project state requires only the confirmed target, no Run/revision');
  } else if (operation === "artifact-readiness") {
    if (!runId) throw new SkillDispatchInputError("run_id", "artifact-readiness requires an explicit run_id");
    if (!primaryTarget) throw new SkillDispatchInputError("primary_target", "artifact-readiness requires an explicit target binding");
    if (!ARTIFACT_READINESS_GATES.includes(input.gate)) throw new SkillDispatchInputError("gate", "Unsupported draft gate");
    if (!REVISION_ID_PATTERN.test(input.expectedRevisionId ?? "")) throw new SkillDispatchInputError("expected_revision_id", "A valid expected revision is required");
  } else if (BOUND_INSPECT_OPERATIONS.includes(operation)) {
    const creation = !runId && input.expectedRevisionId === undefined && (operation === 'operation-status'
      || operation === 'operation-contract' && ['agdf_run/run.create', 'agdf_project/project.initialize'].includes(input.contractModule));
    if (!primaryTarget || !creation && (!runId || !REVISION_ID_PATTERN.test(input.expectedRevisionId ?? ''))) throw new SkillDispatchInputError('binding', 'An exact target, Run and expected revision binding is required; creation lookup uses target/original UUID');
    if (operation === 'operation-contract' && !OPERATION_CONTRACT_MODULES.includes(input.contractModule)) {
      throw new SkillDispatchInputError('module', 'Unsupported command group/operation module', { allowedValues: OPERATION_CONTRACT_MODULES });
    }
    if (operation === 'operation-status' && !(REVISION_ID_PATTERN.test(input.contractModule ?? '') || !runId && /^project\.initialize\/[0-9a-f-]{36}$/.test(input.contractModule ?? '') && REVISION_ID_PATTERN.test(input.contractModule.split('/')[1]))) throw new SkillDispatchInputError('operation_id', 'An original operation UUID is required');
    if (input.gate !== undefined && (!['operation-contract', 'presentation-document', 'presentation-preview'].includes(operation) || !APPROVAL_GATES.includes(input.gate))) throw new SkillDispatchInputError('gate', 'Unsupported operation gate');
  } else if (input.gate !== undefined || input.expectedRevisionId !== undefined) {
    throw new SkillDispatchInputError("gate", "Draft binding fields are supported only by artifact-readiness");
  }
  if (['presentation-document', 'presentation-preview'].includes(operation)) {
    if (!APPROVAL_GATES.includes(input.gate) || !REVISION_ID_PATTERN.test(input.presentationId ?? '')
      || !/^sha256:[0-9a-f]{64}$/u.test(input.targetId ?? '')
      || input.cursor !== undefined && !/^[0-9a-f]{64}:(?:0|[1-9][0-9]{0,6})$/u.test(input.cursor)) throw new SkillDispatchInputError('presentation', 'An exact presentation binding and bounded cursor are required');
  } else if (input.presentationId !== undefined || input.targetId !== undefined || input.cursor !== undefined && !((operation === 'authoring-inputs' || operation === 'doctor' && input.allActive === true || operation === 'operation-contract' && input.contractModule === PRESENTATION_CATALOG_MODULE) && new RegExp(cursorSchema.pattern, 'u').test(input.cursor) && typeof input.cursor === 'string' && input.cursor.length <= cursorSchema.maxLength)) {
    throw new SkillDispatchInputError('presentation', 'Document selectors require presentation-document');
  }
  if (input.allActive !== undefined && typeof input.allActive !== "boolean") throw new SkillDispatchInputError("all_active", "all_active is invalid");
  if (input.contractModule !== undefined) requireText(input.contractModule, "module", 64);
  if (input.variant !== undefined) requireText(input.variant, "variant", 32);
  validateReadSelection({
    operation,
    allActive: input.allActive === true,
    contractModule: input.contractModule,
    variant: input.variant,
  });
  for (const [field, key] of Object.entries(selectorKeys)) {
    if (input[key] !== undefined && !fieldModel[field].operations.includes(operation)) throw new SkillDispatchInputError(field, `Unsupported selector for ${operation}`);
  }
  return Object.freeze({
    schema_version: CONTROL_INSPECT_SCHEMA_VERSION,
    operation,
    surface: input.surface ?? null,
    presentation_language: presentationLanguage,
    working_directory: workingDirectory,
    target_source: targetSource,
    primary_target: primaryTarget,
    run_id: runId,
    gate: input.gate,
    expected_revision_id: input.expectedRevisionId,
    presentation_id: input.presentationId, target_id: input.targetId, cursor: input.cursor,
    group: operation === 'operation-contract' ? input.contractModule.split('/')[0] : undefined,
    kind: operation === 'operation-contract' ? input.contractModule.split('/')[1] : undefined, operation_id: operation === 'operation-status' ? input.contractModule.split('/').at(-1) : undefined,
    variant: input.variant,
    contract_module: input.contractModule,
    all_active: input.allActive === true,
    expected_version: requireText(input.expectedVersion, "expected_version", 64),
  });
}

export { ReadSelectionError };

export const CONTROL_INSPECT_OUTPUT_TOO_LARGE_RECOVERY = "The inspect result exceeds the 1 MiB MCP output limit. Narrow the selection (one run_id instead of all_active) or use the CLI with --json.";

// Preserve the result envelope when enforcing the shared 1 MiB output ceiling.
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
