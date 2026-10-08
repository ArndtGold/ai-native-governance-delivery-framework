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
import {
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "#agdf-core/runtime/plugin-provenance.js";

const MCP_RUNTIME_OWNER = "create-agdf:mcp-runtime";

export async function createMcpCockpitRuntime({ surface, cockpitDir, inspected = inspectMcpDispatcherRuntime() } = {}) {
  if (!['codex', 'claude'].includes(surface) || typeof cockpitDir !== 'string' || !isAbsolute(cockpitDir)) throw new TypeError('AGDF_COCKPIT_TARGET_INVALID');
  let root;
  try { root = realpathSync(cockpitDir); if (!lstatSync(root).isDirectory()) throw Error(); }
  catch { throw new TypeError('AGDF_COCKPIT_TARGET_INVALID'); }
  const [{ COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION, COCKPIT_UI_URI, COCKPIT_MIME, COCKPIT_LIMITS, parseCockpitArguments },
    { createCockpitSessionService }, { READ_LIMITS }] = await Promise.all([
    import("#agdf-core/control-inspect/cockpit-contract.js"),
    import("#agdf-core/control-inspect/cockpit-session.js"),
    import("#agdf-core/control-read/snapshot.js"),
  ]);
  const session = createCockpitSessionService(root);
  const tools = [
    { name: COCKPIT_RENDER_DEFINITION.name, definition: COCKPIT_RENDER_DEFINITION,
      parse: value => parseCockpitArguments(value, true), execute: value => session.render(value) },
    { name: COCKPIT_READ_DEFINITION.name, definition: COCKPIT_READ_DEFINITION,
      parse: parseCockpitArguments, execute: (value, signal) => session.read(value, signal) },
  ];
  // Claude Code renders no MCP app UI today; its cockpit stays hidden until a client declares support.
  return Object.freeze({ mode: 'cockpit', definition: COCKPIT_RENDER_DEFINITION, tools,
    uiCapabilityRequired: surface === 'claude', responseLimit: READ_LIMITS.response,
    ui: Object.freeze({ uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html }),
    serialize: value => JSON.stringify(value), failure: code => session.failure(code), close: () => session.close(),
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
    return Object.freeze({ markerPath, dispatcherDigest, serverDigest, sdkDigest });
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

const FAILURE_ACTIONS = Object.freeze({
  dispatch_busy: "Wait for the active AGDF dispatch to finish and retry once.",
  dispatch_cancelled: "Retry the AGDF dispatch if it is still required.",
  dispatch_timeout: "Inspect the target and AGDF runtime, then retry once.",
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
    runtimeEvidence: Object.freeze({
      machine_validation: owned ? "local_exact_version_digest" : "unavailable",
      plugin_root: packageRoot,
      runtime_digest: runtimeDigest,
      provenance_status: owned ? "matched" : "unowned",
    }),
  });
}

export function createMcpDispatchRuntime({ surface, inspected = inspectMcpDispatcherRuntime() } = {}) {
  const trustedContext = Object.freeze({
    surface,
    expectedVersion: inspected.expectedVersion,
    skillSet: inspected.skillSet,
    interactionLocales: inspected.interactionLocales,
    provenanceStatus: inspected.provenanceStatus ?? "unowned",
  });
  const services = createCoreServices({ resources, observers: {
    runtimeEvidence: inspected.runtimeEvidence,
    validateControlReadBoundary: assertMcpControlReadBoundary,
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
  ]);
  return Object.freeze({
    definition: SKILL_DISPATCH_FUNCTION_DEFINITION,
    parse,
    execute,
    tools,
    tool(name) {
      return tools.find((entry) => entry.name === name) ?? null;
    },
    serialize: serializeSkillDispatchResult,
    failure(code, toolName = SKILL_DISPATCH_FUNCTION_DEFINITION.name) {
      if (toolName === CONTROL_INSPECT_FUNCTION_DEFINITION.name) {
        const action = FAILURE_ACTIONS[code] ?? FAILURE_ACTIONS.dispatch_worker_failed;
        return createInspectFailureResult(code, failureEvidence, action);
      }
      return createFailureResult(code, failureEvidence);
    },
    trustedContext,
  });
}
