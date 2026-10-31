import { projectOperationStatusCall } from '#agdf-core/control-inspect/project-operation-call.js';
import { resolveMcpInput } from '#agdf-core/mcp-input-resolution.js';
import { withInputResolution } from '#agdf-core/control-state/input-resolution.js';
import { effectiveConfiguration } from '#agdf-core/resources/configuration.js';
import { resources } from './runtime/control-context.js';
import {
  SKILL_DISPATCH_CONTRACT_VERSION,
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_SCHEMA_VERSION,
  SKILL_DISPATCH_MAX_OUTPUT_BYTES,
  emptySkillDispatchTiming,
  parseSkillDispatchFunctionArguments,
  serializeSkillDispatchResult,
  SkillDispatchInputError,
} from "#agdf-core/skill-dispatch/contract.js";
import { TaskTargetInputError } from '#agdf-core/task-target-resolution.js';
import { ReadSelectionError } from '#agdf-core/control-inspect/selection.js';
import { localePack } from '#agdf-core/interaction-presentation.js';
import { TOOL_ERROR_CONTRACT, TOOL_RESULT_META, describeToolResult, projectToolResult, consumeToolResult, executionFacts, validExecutionFacts, isEphemeralControlCommand } from '#agdf-core/mcp-tool-errors.js';
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { CONTROL_INSPECT_FUNCTION_DEFINITION, parseControlInspectFunctionArguments, serializeControlInspectResult } from "#agdf-core/control-inspect/contract.js";
import { createInspectFailureResult } from "#agdf-core/control-inspect/result.js";
import { interactionLocales, packageRoot, pluginDefinition } from "./cli/runtime-context.js";
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, commandGroupDefinition, validateRunCommand, validateRunCommandResult, runCommandRequestDigest, schemaDiagnostics } from '#agdf-core/control-state/run-command-schema.js';
import { creationRunId } from '#agdf-core/control-state/run-identity.js';
import {
  digestMcpDispatcherPackage,
  inspectOwnedMcpRuntimeRoot, MCP_RUNTIME_OWNER, MCP_RUNTIME_MARKER,
  evaluateDecisionAppQualification, inspectDecisionAppQualification,
} from "#agdf-core/runtime/plugin-provenance.js";


// Compose the canonical structural contract at the existing producing/consuming
// boundary. The descriptor projector stays dependency-free and policy-pure.
function checkCommandResult(name, result) {
  if (Object.hasOwn(RUN_COMMAND_GROUPS, name) && validateRunCommandResult(result).length) {
    throw Object.assign(new Error('tool_result_invalid'), { facts: { code: 'tool_result_invalid', dispatch: 'unknown' } });
  }
}
export function errorSupport(cockpit = false) {
  return {
    isEphemeralControlCommand, toolErrorContract: TOOL_ERROR_CONTRACT, responseLimit: SKILL_DISPATCH_MAX_OUTPUT_BYTES,
    projectToolResult(name, input = {}, result, facts) {
      const pack = localePack(interactionLocales, input.presentation_language ?? (cockpit ? 'de' : 'en'));
      checkCommandResult(name, result);
      const { _meta, ...domain } = result;
      const serialize = name === 'agdf_dispatch' ? serializeSkillDispatchResult : name === 'agdf_inspect' ? serializeControlInspectResult : JSON.stringify;
      const checked = JSON.parse(serialize(domain));
      const projected = projectToolResult(name, input, { ...checked, ...(_meta ? { _meta } : {}) }, pack, facts);
      // Existing serializers can replace oversized output before projection.
      // Their terminal instruction must agree with the same bounded guidance.
      if (checked.outcome === 'evaluator_error' && checked.diagnostics?.some(d => ['dispatch_output_too_large', 'inspect_output_too_large'].includes(d.code))) {
        const message = projected._meta[TOOL_RESULT_META].message;
        return { ...projected, recovery: { action: message }, host_action: { ...projected.host_action, text: message } };
      }
      return projected;
    },
    consumeToolResult(name, result) { checkCommandResult(name, result); return consumeToolResult(name, result); },
    normalizeFailure(error, { phase = 'execute' } = {}) {
      if (validExecutionFacts(error?.facts)) return { ...error.facts, ...(error.diagnostic ? { configuration: error.diagnostic } : {}) };
      if (phase === 'parse' && (error instanceof SkillDispatchInputError || error instanceof TaskTargetInputError || error instanceof ReadSelectionError)) {
        const facts = { code: error instanceof ReadSelectionError ? 'inspect_input_invalid' : 'dispatch_input_invalid', dispatch: 'not_dispatched', ...(error.field ? { field: error.field } : {}) };
        return validExecutionFacts(facts) ? facts : { code: 'dispatch_input_invalid', dispatch: 'not_dispatched' };
      }
      if (phase === 'parse' && ['command_schema_invalid', 'resource_denied', 'decision_schema_invalid'].includes(error?.code ?? error?.message))
        return { code: error.code ?? error.message, dispatch: 'not_dispatched' };
      return executionFacts(error, { phase });
    },
  };
}

function ownedInspection(inspection) {
  const root = resolve(packageRoot, '..', '..'), markerPath = join(root, MCP_RUNTIME_MARKER);
  if (!inspection || inspection.status !== 'matched'
    || inspection.root !== root || inspection.dispatcherRoot !== resolve(packageRoot)
    || inspection.packageRoot !== join(root, 'node_modules', '@agdf', 'mcp-server')
    || inspection.markerPath !== markerPath || inspection.version !== pluginDefinition.version) return null;
  try {
    const marker = JSON.parse(readFileSync(markerPath, 'utf8'));
    if (![1, 2].includes(marker.schema_version) || marker.owner !== MCP_RUNTIME_OWNER || marker.version !== pluginDefinition.version
      || marker.server_digest !== inspection.digest || marker.dispatcher_digest !== inspection.dispatcherDigest
      || marker.sdk_digest !== inspection.sdkDigest) return null;
    return Object.freeze({ root, markerPath, serverDigest: inspection.digest, dispatcherDigest: inspection.dispatcherDigest,
      sdkDigest: inspection.sdkDigest, decisionQualification: marker.decision_app_qualification });
  } catch { return null; }
}

export {
  CONTROL_INSPECT_FUNCTION_DEFINITION,
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  parseControlInspectFunctionArguments,
  parseSkillDispatchFunctionArguments,
  serializeSkillDispatchResult,
};
export { DECISION_UI_URI } from '#agdf-core/mcp-resource-contract.js';
// The worker executor releases locks of a thread it has seen exit (packages/mcp-server).
export { OWNED_LOCK_CHANNEL, releaseAbandonedOwnedLock } from '#agdf-core/owned-file-lock.js';

const FAILURE_ACTIONS = Object.freeze({
  dispatch_busy: "Wait for the active AGDF dispatch to finish and retry once.",
  dispatch_cancelled: "Retry the AGDF dispatch if it is still required.",
  dispatch_timeout: "Inspect the original operation status before replaying the identical UUID and request; a timeout does not prove rollback.",
  dispatch_worker_termination_unconfirmed: "Inspect the original operation status and retained executor; its termination is unconfirmed. Do not start a replacement mutation.",
  dispatch_worker_failed: "Repair the installed AGDF MCP runtime and retry once.",
  runtime_version_mismatch: "Install matching AGDF MCP server and dispatcher versions, then retry once.",
  runtime_provenance_invalid: "Repair the owned AGDF MCP runtime and retry once.",
});

function createFailureResult(code, runtimeEvidence) {
  const action = FAILURE_ACTIONS[code] ?? FAILURE_ACTIONS.dispatch_worker_failed;
  return {
    schema_version: SKILL_DISPATCH_SCHEMA_VERSION,
    contract_version: SKILL_DISPATCH_CONTRACT_VERSION,
    outcome: "evaluator_error",
    terminal: true,
    authorizes: false,
    skill: null,
    runtime: runtimeEvidence,
    target: null,
    control: null,
    presentation: null,
    continuation: null,
    recovery: { action },
    host_action: {
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: action,
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    },
    timing: emptySkillDispatchTiming(),
    diagnostics: [{ code }],
  };
}

export function inspectMcpDispatcherRuntime() {
  return dispatcherInspection(inspectOwnedMcpRuntimeRoot(resolve(packageRoot, '..', '..'), pluginDefinition.version));
}

function dispatcherInspection(observation) {
  const runtimeDigest = observation?.dispatcherDigest ?? digestMcpDispatcherPackage(packageRoot);
  const owned = ownedInspection(observation);
  return Object.freeze({
    expectedVersion: pluginDefinition.version,
    packageRoot,
    skillSet: pluginDefinition.skillSet,
    interactionLocales,
    provenanceStatus: owned ? "matched" : "unowned",
    generationIdentity: owned ? { server_digest: owned.serverDigest, dispatcher_digest: owned.dispatcherDigest, sdk_digest: owned.sdkDigest } : null,
    runtimeEvidence: Object.freeze({
      machine_validation: owned ? "local_exact_version_digest" : "unavailable",
      plugin_root: packageRoot,
      runtime_digest: runtimeDigest,
      provenance_status: owned ? "matched" : "unowned",
    }),
    decisionQualificationReport: owned ? (client, resourceDigest) => inspectDecisionAppQualification(owned.root, owned.decisionQualification, {
      client, server_digest: owned.serverDigest, dispatcher_digest: owned.dispatcherDigest, sdk_digest: owned.sdkDigest, resource_digest: resourceDigest,
    }) : () => ({ qualified: false, reason: 'runtime_provenance_unavailable', authorizes: false }),
    decisionQualification: owned ? (client, resourceDigest) => evaluateDecisionAppQualification(owned.root, owned.decisionQualification, {
      client, server_digest: owned.serverDigest, dispatcher_digest: owned.dispatcherDigest,
      sdk_digest: owned.sdkDigest, resource_digest: resourceDigest,
    }) : () => false,
  });
}

export function configuredMcpCommandGroups(env = process.env) {
  if (env.AGDF_MCP_COMMAND_GROUPS === undefined) return Object.keys(RUN_COMMAND_GROUPS);
  const values = env.AGDF_MCP_COMMAND_GROUPS === '' ? [] : env.AGDF_MCP_COMMAND_GROUPS.split(',');
  if (new Set(values).size !== values.length || values.some(group => !Object.hasOwn(RUN_COMMAND_GROUPS, group))) throw Error('AGDF_MCP_COMMAND_GROUPS_INVALID');
  return values;
}

const unwrapped = () => { throw Object.assign(Error('generation_unavailable'), { code: 'generation_unavailable', dispatch: 'not_dispatched' }); };

export function composeMcpProtocolRuntime({ surface, inspected = inspectMcpDispatcherRuntime(), commandGroups = configuredMcpCommandGroups(), execute = unwrapped, executeInspect = unwrapped, executeCommand = unwrapped, lookupOriginal, executionContext, inputContext } = {}) {
  const trustedContext = Object.freeze({
    surface,
    expectedVersion: inspected.expectedVersion,
    skillSet: inspected.skillSet,
    interactionLocales: inspected.interactionLocales,
    provenanceStatus: inspected.provenanceStatus ?? "unowned",
    commandGroups: Object.freeze([...commandGroups]),
    decisionQualification: inspected.decisionQualification ?? (() => false),
    decisionQualificationReport: inspected.decisionQualificationReport ?? (() => ({ qualified: false, reason: 'host_context_unavailable', authorizes: false })),
  });
  const parse = (argumentsValue) => parseSkillDispatchFunctionArguments(argumentsValue, trustedContext);
  const failureEvidence = { ...inspected.runtimeEvidence, expected_version: inspected.expectedVersion };
  const rawTools = [
    Object.freeze({ name: SKILL_DISPATCH_FUNCTION_DEFINITION.name, definition: SKILL_DISPATCH_FUNCTION_DEFINITION, parse, execute, serialize: serializeSkillDispatchResult }),
    Object.freeze({
      name: CONTROL_INSPECT_FUNCTION_DEFINITION.name,
      definition: CONTROL_INSPECT_FUNCTION_DEFINITION,
      parentOwned: value => value?.operation === 'doctor',
      parse: (argumentsValue) => parseControlInspectFunctionArguments(argumentsValue, trustedContext),
      execute: (input, signal) => executeInspect(input, { signal }),
      serialize: serializeControlInspectResult,
    }),
    ...commandGroups.map(group => Object.freeze({ name: group, definition: commandGroupDefinition(group),
      parentOwned: input => group === 'agdf_record' && input?.command?.kind === 'material.stage'
        || group === 'agdf_prepare' && input?.command?.kind === 'presentation.deliver',
      parse: argumentsValue => {
        const errors = validateRunCommand(group, argumentsValue);
        if (errors.length) throw Error('command_schema_invalid');
        return argumentsValue;
      }, execute: (input, signal, host) => executeCommand(group, input, signal, host), serialize: value => JSON.stringify(value) })),
  ];
  const contexts = new WeakMap();
  const normalize = (name, args) => {
    if (contexts.has(args)) return contexts.get(args);
    if (inputContext) return { ...inputContext, arguments: args };
    const definition = rawTools.find(tool => tool.name === name)?.definition;
    if (!definition) throw Error('command_group_unsupported');
    return resolveMcpInput(definition, args, { defaults: resources.defaults, lookupOriginal, executionContext,
      runtimeRoots: [resources.packageRoot, resources.generatedRoot, dirname(dirname(resources.contractsRoot)), ...(resources.templatesRoot ? [dirname(dirname(resources.templatesRoot))] : [])] });
  };
  const tools = Object.freeze(rawTools.map(tool => Object.freeze({ ...tool,
    parse(args) {
      const selected = normalize(tool.name, args), parsed = tool.parse(selected.arguments);
      contexts.set(parsed, selected); return parsed;
    },
    execute(input, signal, host) {
      const selected = contexts.get(input) ?? inputContext;
      return withInputResolution(selected?.resolution, () => tool.execute(input, signal, host), selected?.original === true);
    },
  })));
  if (tools.filter(tool => Object.hasOwn(RUN_COMMAND_GROUPS, tool.name)).reduce((bytes, tool) => bytes + Buffer.byteLength(JSON.stringify(tool.definition)), 0) > RUN_COMMAND_LIMITS.aggregate_definition_bytes) throw Error('command_aggregate_definition_budget_exceeded');
  return Object.freeze({
    ...errorSupport(),
    definition: SKILL_DISPATCH_FUNCTION_DEFINITION,
    parse,
    execute,
    tools,
    prepareInput(name, args) {
      if (!rawTools.some(tool => tool.name === name)) return args;
      const selected = normalize(name, args); contexts.set(selected.arguments, selected); return selected.arguments;
    },
    inputContextFor(input) {
      const selected = contexts.get(input);
      return selected ? { resolution: selected.resolution, original: selected.original } : undefined;
    },
    validatePublicInput(name, args) {
      const definition = tools.find(tool => tool.name === name)?.definition;
      if (!definition) return false;
      if (schemaDiagnostics(args, definition.inputSchema).length) throw Object.assign(Error('command_schema_invalid'), { facts: { code: 'command_schema_invalid', dispatch: 'not_dispatched' } });
      return true;
    },
    configurationProjection(input) {
      const selected = contexts.get(input) ?? inputContext;
      return selected?.resolution ? effectiveConfiguration(selected.resolution.configuration, selected.original ? 'original_operation' : 'current') : null;
    },
    producerIdentity: inspected.generationIdentity ?? null,
    tool: name => tools.find(tool => tool.name === name) ?? null,
    serialize: serializeSkillDispatchResult,
    failure(code, toolName = SKILL_DISPATCH_FUNCTION_DEFINITION.name, argumentsValue, { dispatch = 'unknown', field, cause_code, worker_phase, elapsed_ms, configuration } = {}) {
      const facts = { code, dispatch, ...(field ? { field } : {}),
        ...(cause_code ? { cause_code } : {}), ...(worker_phase ? { worker_phase } : {}) };
      const finish = value => {
        if (configuration) value = { ...value, diagnostics: [...(value.diagnostics ?? []), configuration] };
        if (validExecutionFacts(facts)) {
          const { code: _code, dispatch: _dispatch, ...details } = facts;
          if (value.diagnostics?.length) value = { ...value, diagnostics: value.diagnostics.map((d, i) => i === 0 ? { ...d, ...details } : d) };
          else if (facts.cause_code || facts.worker_phase) value = { ...value, diagnostics: [{ code, ...details }] };
        }
        const message = describeToolResult(toolName, argumentsValue ?? {}, value,
          localePack(interactionLocales, argumentsValue?.presentation_language ?? 'en'), facts).message;
        return value.terminal ? { ...value, recovery: { action: message }, host_action: { ...value.host_action, text: message } } : value;
      };
      if (Object.hasOwn(RUN_COMMAND_GROUPS, toolName)) {
        const valid = argumentsValue && validateRunCommand(toolName, argumentsValue).length === 0;
        if (valid && ['presentation.deliver', 'material.stage'].includes(argumentsValue.command.kind)) return finish({ schema_version: '1', outcome: 'rejected',
          reason: argumentsValue.command.kind === 'material.stage' ? 'material_state_unavailable' : 'delivery_state_unavailable',
          operation_id: argumentsValue.operation_id, request_digest: runCommandRequestDigest(argumentsValue), authorizes: false,
          recovery: argumentsValue.command.kind === 'material.stage'
            ? 'Read material.stage/status for the original transfer in this generation. After generation loss restage identical semantic bytes, preserving the original future canonical write UUID. No gate or Run mutation was attempted.'
            : 'Observe this same prepared presentation/delivery. No gate or Run mutation was attempted; do not create another question. Read its exact document if delivery access is unconfirmed.' });
        return finish({ schema_version: '1', outcome: dispatch === 'not_dispatched' ? 'rejected' : 'effect_unknown', reason: code,
          operation_id: valid ? argumentsValue.operation_id : null, request_digest: valid ? runCommandRequestDigest(argumentsValue) : null,
          binding: valid ? argumentsValue.command.kind === 'project.initialize' ? { target_id: argumentsValue.target_id, kind: 'project.initialize' } : { target_id: argumentsValue.target_id, run_id: argumentsValue.command.kind === 'run.create' ? creationRunId(argumentsValue.operation_id) : argumentsValue.run_id,
            expected_revision_id: argumentsValue.command.kind === 'run.create' ? null : argumentsValue.expected_revision_id, kind: argumentsValue.command.kind } : null,
          ...(valid && argumentsValue.command.kind === 'project.initialize' && dispatch !== 'not_dispatched' ? { next_calls: [projectOperationStatusCall(argumentsValue)] } : {}),
          dispatch, authorizes: false, recovery: dispatch === 'not_dispatched' ? 'No command was dispatched by this attempt.'
            : valid && argumentsValue.command.kind === 'project.initialize' ? 'Use the supplied project.initialize/original-UUID operation-status call, without Run/revision; retain the exact original setup request.'
            : 'Inspect operation-status with the original UUID and preserve the exact original payload. Do not infer non-execution or create another decision.' });
      }
      if (toolName === CONTROL_INSPECT_FUNCTION_DEFINITION.name) {
        const action = FAILURE_ACTIONS[code] ?? FAILURE_ACTIONS.dispatch_worker_failed;
        return finish(createInspectFailureResult(code, failureEvidence, action, { elapsedMs: elapsed_ms }));
      }
      return finish(createFailureResult(code, failureEvidence));
    },
    trustedContext,
  });
}

export function createMcpTransportRuntime(options = {}) {
  return composeMcpProtocolRuntime(options);
}

export async function createMcpDecisionTransportRuntime({ runtime, ui } = {}) {
  const { composeMcpDecisionProtocol } = await import('./mcp-decision-protocol.js');
  return composeMcpDecisionProtocol({ runtime, ui });
}
