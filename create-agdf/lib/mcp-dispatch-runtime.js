import {
  SKILL_DISPATCH_CONTRACT_VERSION,
  SKILL_DISPATCH_FUNCTION_DEFINITION,
  SKILL_DISPATCH_SCHEMA_VERSION,
  emptySkillDispatchTiming,
  parseSkillDispatchFunctionArguments,
  serializeSkillDispatchResult,
} from "./skill-dispatch/contract.js";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createSkillDispatchService } from "./skill-dispatch/service.js";
import { assertMcpControlReadBoundary } from "./control-read-boundary.js";
import { interactionLocales, packageRoot, pluginDefinition } from "./cli/runtime-context.js";
import {
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "./runtime/plugin-provenance.js";

const MCP_RUNTIME_OWNER = "create-agdf:mcp-runtime";

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
    if (marker.schema_version !== 1
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
  SKILL_DISPATCH_FUNCTION_DEFINITION,
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
  const execute = createSkillDispatchService({
    runtimeEvidence: inspected.runtimeEvidence,
    validateControlReadBoundary: assertMcpControlReadBoundary,
  });
  return Object.freeze({
    definition: SKILL_DISPATCH_FUNCTION_DEFINITION,
    parse(argumentsValue) {
      return parseSkillDispatchFunctionArguments(argumentsValue, trustedContext);
    },
    execute,
    serialize: serializeSkillDispatchResult,
    failure(code) {
      return createFailureResult(code, {
        ...inspected.runtimeEvidence,
        expected_version: inspected.expectedVersion,
      });
    },
    trustedContext,
  });
}
