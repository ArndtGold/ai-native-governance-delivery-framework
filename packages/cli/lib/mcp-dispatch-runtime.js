import { createCoreServices } from "#agdf-core";
import { resources } from "./runtime/control-context.js";
import {
  SKILL_DISPATCH_CONTRACT_VERSION,
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_SCHEMA_VERSION,
  emptySkillDispatchTiming,
  parseSkillDispatchFunctionArguments,
  serializeSkillDispatchResult,
} from "#agdf-core/skill-dispatch/contract.js";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { CONTROL_INSPECT_FUNCTION_DEFINITION, parseControlInspectFunctionArguments, serializeControlInspectResult } from "#agdf-core/control-inspect/contract.js";
import { createInspectFailureResult } from "#agdf-core/control-inspect/service.js";
import { assertMcpControlReadBoundary } from "#agdf-core/control-read-boundary.js";
import { interactionLocales, packageRoot, pluginDefinition } from "./cli/runtime-context.js";
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, commandGroupDefinition, validateRunCommand, runCommandRequestDigest } from '#agdf-core/control-state/run-command-contract.js';
import {
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
  evaluateDecisionAppQualification, inspectDecisionAppQualification,
} from "#agdf-core/runtime/plugin-provenance.js";

const MCP_RUNTIME_OWNER = "create-agdf:mcp-runtime";

export async function createMcpCockpitRuntime({ surface, cockpitDir, cockpitMode, inspected = inspectMcpDispatcherRuntime() } = {}) {
  const pluginMode = cockpitMode === 'plugin';
  if (cockpitMode !== undefined && !pluginMode || pluginMode && (surface !== 'codex' || cockpitDir !== undefined)
    || !pluginMode && (!['codex', 'claude'].includes(surface) || typeof cockpitDir !== 'string' || !isAbsolute(cockpitDir))) throw new TypeError('AGDF_COCKPIT_TARGET_INVALID');
  let root;
  try { if (!pluginMode) { root = realpathSync(cockpitDir); if (!lstatSync(root).isDirectory()) throw Error(); } }
  catch { throw new TypeError('AGDF_COCKPIT_TARGET_INVALID'); }
  const [{ COCKPIT_RENDER_DEFINITION, COCKPIT_PLUGIN_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS, parseCockpitArguments, parsePluginCockpitArguments },
    { createCockpitSessionService }, { READ_LIMITS }] = await Promise.all([
    import("#agdf-core/control-inspect/cockpit-contract.js"),
    import("#agdf-core/control-inspect/cockpit-session.js"),
    import("#agdf-core/control-read/snapshot.js"),
  ]);
  const session = createCockpitSessionService(root, { pluginMode });
  const renderDefinition = pluginMode ? COCKPIT_PLUGIN_RENDER_DEFINITION : COCKPIT_RENDER_DEFINITION;
  const tools = [
    { name: renderDefinition.name, definition: renderDefinition,
      parse: value => pluginMode ? parsePluginCockpitArguments(value) : parseCockpitArguments(value, true), execute: value => session.render(value) },
    { name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION,
      parse: parseCockpitArguments, execute: (value, signal) => session.read(value, signal) },
  ];
  // Claude Code renders no MCP app UI today; its cockpit stays hidden until a client declares support.
  return Object.freeze({ mode: 'cockpit', definition: renderDefinition, tools,
    uiCapabilityRequired: pluginMode || surface === 'claude', responseLimit: READ_LIMITS.response,
    ...(pluginMode ? { unsupportedUiCode: 'host_ui_unsupported' } : {}),
    ui: Object.freeze({ uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html,
      ...(pluginMode ? { label: 'Cockpit' } : {}) }),
    serialize: value => JSON.stringify(value), failure: code => code === 'host_ui_unsupported'
      ? { ...session.failure(code), retryable: false,
        next_action: 'Use a Codex session that advertises MCP App UI support; configuration or tool discovery alone cannot render Cockpit.' }
      : session.failure(code), close: () => session.close(),
    inspectOwnership: () => session.inspectOwnership(),
    trustedContext: Object.freeze({ surface, expectedVersion: inspected.expectedVersion, provenanceStatus: inspected.provenanceStatus }),
  });
}

function readOwnedRuntimeMarker(dispatcherDigest) {
  const root = resolve(packageRoot, "..", "..");
  const markerPath = join(root, ".agdf-mcp-owned.json");
  const serverRoot = join(root, "node_modules", "@agdf", "mcp-server");
  const sdkServerRoot = join(root, "node_modules", "@modelcontextprotocol", "server");
  const sdkCoreRoot = join(root, "node_modules", "@modelcontextprotocol", "core");
  const sdkClientRoot = join(root, "node_modules", "@modelcontextprotocol", "client");
  const sdkV1Root = join(root, "node_modules", "@modelcontextprotocol", "sdk");
  try {
    if (lstatSync(packageRoot).isSymbolicLink() || !existsSync(markerPath)
        || !existsSync(serverRoot) || !existsSync(sdkServerRoot) || !existsSync(sdkCoreRoot)
        || existsSync(sdkClientRoot) || existsSync(sdkV1Root)) return null;
    if ([serverRoot, sdkServerRoot, sdkCoreRoot].some((path) => {
      const stats = lstatSync(path);
      return !stats.isDirectory() || stats.isSymbolicLink();
    })) return null;
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    const serverManifest = JSON.parse(readFileSync(join(serverRoot, "package.json"), "utf8"));
    const sdkServerManifest = JSON.parse(readFileSync(join(sdkServerRoot, "package.json"), "utf8"));
    const sdkCoreManifest = JSON.parse(readFileSync(join(sdkCoreRoot, "package.json"), "utf8"));
    const serverDigest = digestDirectory(serverRoot);
    const sdkDigest = digestMcpSdkRuntime(root);
    if (![1, 2].includes(marker.schema_version)
        || marker.owner !== MCP_RUNTIME_OWNER
        || marker.version !== pluginDefinition.version
        || serverManifest.name !== "@agdf/mcp-server"
        || serverManifest.version !== pluginDefinition.version
        || serverManifest.dependencies?.["create-agdf"] !== pluginDefinition.version
        || serverManifest.dependencies?.["@modelcontextprotocol/server"] !== "2.0.0"
        || sdkServerManifest.name !== "@modelcontextprotocol/server"
        || sdkServerManifest.version !== "2.0.0"
        || sdkCoreManifest.name !== "@modelcontextprotocol/core"
        || sdkCoreManifest.version !== "2.0.0"
        || marker.dispatcher_digest !== dispatcherDigest
        || marker.server_digest !== serverDigest
        || marker.sdk_digest !== sdkDigest) return null;
    return Object.freeze({ markerPath, root, dispatcherDigest, serverDigest, sdkDigest, decisionQualification: marker.decision_app_qualification });
  } catch {
    return null;
  }
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
export { OWNED_LOCK_CHANNEL, releaseAbandonedOwnedLock } from '#agdf-core/control-state/run-state-writer.js';

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
  const runtimeDigest = digestMcpDispatcherPackage(packageRoot);
  const owned = readOwnedRuntimeMarker(runtimeDigest);
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

export function createMcpDispatchRuntime({ surface, inspected = inspectMcpDispatcherRuntime(), commandGroups = configuredMcpCommandGroups(), runtimeControl } = {}) {
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
  const services = createCoreServices({ resources, observers: {
    runtimeEvidence: inspected.runtimeEvidence,
    validateControlReadBoundary: assertMcpControlReadBoundary,
    commandGroups, runtimeControl,
  } });
  const execute = services.dispatch;
  const executeInspect = services.inspect;
  const parse = (argumentsValue) => parseSkillDispatchFunctionArguments(argumentsValue, trustedContext);
  const failureEvidence = { ...inspected.runtimeEvidence, expected_version: inspected.expectedVersion };
  const tools = Object.freeze([
    Object.freeze({ name: SKILL_DISPATCH_FUNCTION_DEFINITION.name, definition: SKILL_DISPATCH_FUNCTION_DEFINITION, parse, execute, serialize: serializeSkillDispatchResult }),
    Object.freeze({
      name: CONTROL_INSPECT_FUNCTION_DEFINITION.name,
      definition: CONTROL_INSPECT_FUNCTION_DEFINITION,
      parse: (argumentsValue) => parseControlInspectFunctionArguments(argumentsValue, trustedContext),
      execute: executeInspect,
      serialize: serializeControlInspectResult,
    }),
    ...commandGroups.map(group => Object.freeze({ name: group, definition: commandGroupDefinition(group),
      parse: argumentsValue => {
        const errors = validateRunCommand(group, argumentsValue);
        if (errors.length) throw Error('command_schema_invalid');
        return argumentsValue;
      }, execute: input => services.command(group, input), serialize: value => JSON.stringify(value) })),
  ]);
  if (tools.filter(tool => Object.hasOwn(RUN_COMMAND_GROUPS, tool.name)).reduce((bytes, tool) => bytes + Buffer.byteLength(JSON.stringify(tool.definition)), 0) > RUN_COMMAND_LIMITS.aggregate_definition_bytes) throw Error('command_aggregate_definition_budget_exceeded');
  return Object.freeze({
    definition: SKILL_DISPATCH_FUNCTION_DEFINITION,
    parse,
    execute,
    tools,
    tool(name) {
      return tools.find((entry) => entry.name === name) ?? null;
    },
    serialize: serializeSkillDispatchResult,
    failure(code, toolName = SKILL_DISPATCH_FUNCTION_DEFINITION.name, argumentsValue, { dispatch = 'unknown' } = {}) {
      if (Object.hasOwn(RUN_COMMAND_GROUPS, toolName)) {
        const valid = argumentsValue && validateRunCommand(toolName, argumentsValue).length === 0;
        return { schema_version: '1', outcome: dispatch === 'not_dispatched' ? 'rejected' : 'effect_unknown', reason: code,
          operation_id: valid ? argumentsValue.operation_id : null, request_digest: valid ? runCommandRequestDigest(argumentsValue) : null,
          binding: valid ? { target_id: argumentsValue.target_id, run_id: argumentsValue.run_id, expected_revision_id: argumentsValue.expected_revision_id, kind: argumentsValue.command.kind } : null,
          dispatch, authorizes: false, recovery: dispatch === 'not_dispatched' ? 'No command was dispatched by this attempt.'
            : 'Inspect operation-status with the original UUID and preserve the exact original payload. Do not infer non-execution or create another decision.' };
      }
      if (toolName === CONTROL_INSPECT_FUNCTION_DEFINITION.name) {
        const action = FAILURE_ACTIONS[code] ?? FAILURE_ACTIONS.dispatch_worker_failed;
        return createInspectFailureResult(code, failureEvidence, action);
      }
      return createFailureResult(code, failureEvidence);
    },
    trustedContext,
  });
}

// Only the App-capable adapter loads ephemeral view owners; Copilot/default Core
// projections do not acquire a hidden dependency on the private cockpit reader.
export async function createMcpDecisionRuntime({ runtime, ui, appOnlyMediationQualified = false } = {}) {
  if (!runtime || runtime.trustedContext.surface !== 'codex') throw Error('decision_runtime_surface_invalid');
  const [{ createDecisionSessionService }, { decisionActionDefinition, validateDecisionAction },
    { COCKPIT_READ_DEFINITION, parseCockpitArguments }] = await Promise.all([
    import('#agdf-core/control-inspect/decision-session.js'), import('#agdf-core/control-state/decision-action-contract.js'),
    import('#agdf-core/control-inspect/cockpit-contract.js'),
  ]);
  const groups = runtime.trustedContext.commandGroups, session = createDecisionSessionService({ groups, appOnlyMediationQualified,
    qualification: ({ client }) => appOnlyMediationQualified === true
      || runtime.trustedContext.decisionQualification(client, ui.digest) === true });
  const facade = decisionActionDefinition(groups);
  const tools = runtime.tools.map(tool => tool.name === 'agdf_prepare' ? { ...tool,
    definition: { ...tool.definition, _meta: { ui: { resourceUri: ui.uri, visibility: ['model', 'app'] } } } } : tool);
  tools.push({ name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION, requiresUi: true, parentOwned: true,
    parse: parseCockpitArguments, execute: (input, signal) => session.read(input, signal), serialize: value => JSON.stringify(value) });
  if (facade) tools.push({ name: facade.name, definition: facade, requiresUi: true, parentOwned: true,
    parse: input => { if (validateDecisionAction(input, facade.inputSchema.properties.action.enum).length) throw Error('decision_schema_invalid'); return input; },
    execute: (input, signal, host) => session.action(input, host), serialize: value => JSON.stringify(value) });
  const bytes = tools.filter(tool => Object.hasOwn(RUN_COMMAND_GROUPS, tool.name) || tool.name === facade?.name)
    .reduce((sum, tool) => sum + Buffer.byteLength(JSON.stringify(tool.definition)), 0);
  if (bytes > RUN_COMMAND_LIMITS.aggregate_definition_bytes) { await session.close(); throw Error('command_aggregate_definition_budget_exceeded'); }
  return Object.freeze({ ...runtime, tools: Object.freeze(tools), ui, mode: 'decision',
    tool: name => tools.find(tool => tool.name === name) ?? null,
    async postprocessToolResult(name, input, result, { uiSupported, client } = {}) {
      if (name === 'agdf_inspect' && input.operation === 'native-qualification' && result.report?.available) {
        return { ...result, report: { ...result.report, ui_rendering_support: uiSupported ? 'supported' : 'unsupported',
          action_qualification: runtime.trustedContext.decisionQualificationReport(client, ui.digest),
          enabled_command_groups: [...groups], authorizes: false } };
      }
      if (name !== 'agdf_prepare' || input.command?.kind !== 'presentation.prepare') return result;
      const delivered = uiSupported ? await session.open(input, result, { client })
        : { ...result, app_capability: 'unavailable', app_reason: 'host_ui_unsupported' };
      const prepared = result.family_result;
      if (typeof prepared?.text !== 'string') return delivered;
      // Capability advertisement and an emitted resource do not prove that this
      // request surface displays it (in particular a remote/iPad Chat). Until an
      // actual display observation exists, send the complete decision once.
      const displayed = delivered.app_capability === 'available' && delivered.app_display === 'confirmed';
      const text = displayed && typeof prepared.companion_text === 'string'
        ? prepared.companion_text : prepared.text;
      return { ...delivered, presentation_delivery: { mode: displayed ? 'native_plus_chat' : 'full_chat', display: displayed ? 'confirmed' : 'unconfirmed',
        text, presentation_id: prepared.presentation_id, revision_id: prepared.revision_id,
        document_digest: prepared.document_digest ?? prepared.artefact_digest, document_language: prepared.document_language ?? null,
        ...(prepared.preview_review ? { preview_review: { operation: 'presentation-preview', version: prepared.preview_review.descriptor.version,
          content_digest: prepared.preview_review.rendered_digest, access_state: displayed ? 'native_bound' : 'not_observed',
          target_id: input.target_id, run_id: input.run_id, gate: 'PRD', expected_revision_id: input.expected_revision_id, presentation_id: prepared.presentation_id } } : {}),
        instruction: 'Forward this exact Chat text once. Do not append a second decision request. On a human request to read the document, use presentation-document with this exact binding and every returned cursor; deliver all ordered chunks in the same Chat before requesting a decision. A local file link is not remote access proof.'
          + (prepared.preview_review ? ' The required preview uses presentation-preview with the supplied exact selectors and every cursor. Offer only supported isolated rendering of those exact bytes. If this surface cannot show it, state that access is unavailable and the review remains open; never call raw HTML, a local link or an unopened resource a viewed preview.' : ''),
        authorizes: false } };
    },
    failure(code, name, input, dispatch) {
      return name === 'agdf_decision_action' ? { schema_version: '1', outcome: dispatch?.dispatch === 'not_dispatched' ? 'rejected' : 'effect_unknown',
        reason: code, operation_id: input?.operation_id ?? null, authorizes: false, recovery: 'Inspect the original UUID; do not infer non-execution or submit another decision.' }
        : name === 'agdf_cockpit_read' ? { schema_version: '1', outcome: 'rejected', reason: code, authorizes: false } : runtime.failure(code, name, input, dispatch);
    },
    close: () => session.close(), inspectOwnership: () => session.inspectOwnership(),
  });
}

