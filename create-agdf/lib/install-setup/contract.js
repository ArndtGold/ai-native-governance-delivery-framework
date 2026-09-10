import { isAbsolute } from "node:path";
import { assertLifecycleResult } from "../lifecycle/result.js";
import { mcpCapabilityProfileContract } from "../mcp-lifecycle/profile.js";

const SURFACES = new Set(mcpCapabilityProfileContract.surfaces);
const SETUP_REQUESTS = new Set(["plugin_only", "full", "cancel"]);
const EFFECTIVE_STATES = new Set([
  "cancelled",
  "plugin_ready_mcp_absent",
  "plugin_ready_mcp_unchanged",
  "configured_pending_restart",
  "configured_unverified",
  "discovered_ready",
  "partial",
  "degraded_or_foreign",
  "failed",
]);
const RESULTS = new Set(["success", "partial", "failed", "cancelled"]);
const TARGET_SOURCES = new Set(["explicit_dir", "interactive_invocation_cwd_selection", "none"]);
const PREFLIGHT_TARGET_SOURCES = new Set(["explicit_dir", "interactive_invocation_cwd_proposal", "none"]);
const INVOCATION_DIRECTORY_SOURCES = new Set(["explicit_dir", "npm_init_cwd", "process_cwd", "none"]);
const SCOPES = new Set(["project", "user"]);
const INTERACTIONS = new Set(["required", "not_required"]);
const PLUGIN_PREFLIGHT_STATES = new Set(["observed", "healthy", "degraded", "not_installed", "unavailable", "unknown"]);
const MCP_STATES = new Set([...mcpCapabilityProfileContract.resultStates, "not_requested", "not_checked"]);
const RUNTIME_CHECK_STATES = new Set([
  "not_run",
  "not_checked",
  "cancelled",
  "manual",
  "decision_required",
  "enabled",
  "renewal_required",
  "degraded",
  "failed",
  "unavailable",
  "receipt_missing",
  "receipt_unowned",
  "receipt_invalid",
  "unknown",
]);
const FULL_BLOCK_REASONS = new Set(["none", "target_required", "mcp_foreign", "mcp_precedence_conflict", "mcp_invalid", "mcp_preflight_failed"]);
const MCP_EFFECTIVE_SOURCES = new Set([
  "none", "unknown", "user", "project", "project_override", "local", "shared_project", "inline", "custom",
]);
const FAILURE_PHASES = new Set([
  "input_validation",
  "setup_preflight",
  "setup_selection",
  "runtime_check_permission",
  "plugin_operation",
  "plugin_verification",
  "mcp_preflight",
  "mcp_enable",
  "mcp_disable",
  "plugin_disable",
  "plugin_uninstall",
  "result_validation",
  "presentation",
]);
const FAILURE_CODES = new Set([
  "input_invalid",
  "setup_preflight_failed",
  "setup_selection_blocked",
  "runtime_check_permission_failed",
  "plugin_operation_failed",
  "plugin_verification_failed",
  "mcp_preflight_failed",
  "mcp_enable_failed",
  "mcp_disable_failed",
  "plugin_disable_failed",
  "plugin_uninstall_failed",
  "result_invalid",
  "presentation_failed",
]);
const NEXT_ACTION_CODES = new Set([
  "none",
  "cancelled",
  "restart_host",
  "verify_host_discovery",
  "retry_plugin",
  "retry_mcp",
  "resolve_mcp_registration",
  "review_runtime_checks",
  "choose_plugin_only_or_cancel",
]);
const STATE_ACTIONS = Object.freeze({
  cancelled: new Set(["cancelled"]),
  plugin_ready_mcp_absent: new Set(["restart_host"]),
  plugin_ready_mcp_unchanged: new Set(["restart_host"]),
  configured_pending_restart: new Set(["restart_host"]),
  configured_unverified: new Set(["verify_host_discovery"]),
  discovered_ready: new Set(["none"]),
  partial: new Set(["retry_mcp", "retry_plugin", "review_runtime_checks", "resolve_mcp_registration"]),
  degraded_or_foreign: new Set(["resolve_mcp_registration"]),
  failed: new Set(["retry_plugin", "resolve_mcp_registration", "choose_plugin_only_or_cancel"]),
});

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, allowed, code) {
  if (!plainObject(value) || Object.keys(value).some((key) => !allowed.includes(key))) throw new Error(code);
}

function cloneAndFreeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(cloneAndFreeze));
  if (plainObject(value)) {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneAndFreeze(child)])));
  }
  return value;
}

function stringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function assertCodedAction(action) {
  exactKeys(action, ["code", "parameters", "text"], "AGDF_INSTALL_SETUP_RESULT_INVALID");
  if (!NEXT_ACTION_CODES.has(action.code) || !plainObject(action.parameters)
      || Object.values(action.parameters).some((value) => !["string", "number", "boolean"].includes(typeof value))
      || !(action.text === null || typeof action.text === "string")) {
    throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
  }
}

function assertFailure(failure) {
  if (failure === null) return;
  exactKeys(failure, ["phase", "code", "message", "evidence"], "AGDF_INSTALL_SETUP_RESULT_INVALID");
  if (!FAILURE_PHASES.has(failure.phase) || !FAILURE_CODES.has(failure.code)
      || typeof failure.message !== "string" || !failure.message.trim() || !stringArray(failure.evidence ?? [])) {
    throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
  }
}

function pluginVerified(plugin) {
  if (plugin?.status === "not_run") return false;
  try { assertLifecycleResult(plugin); } catch { return false; }
  return plugin.result !== "failed"
    && ["healthy", "configured", "configured_pending_restart"].includes(plugin.verification?.status);
}

function mcpState(mcp) {
  if (mcp?.status && ["not_requested", "not_checked"].includes(mcp.status)) return mcp.status;
  return mcp?.result;
}

function assertMcpPart(mcp) {
  if (mcp?.status && ["not_requested", "not_checked"].includes(mcp.status)) {
    exactKeys(mcp, ["status"], "AGDF_INSTALL_SETUP_RESULT_INVALID");
    return;
  }
  if (!plainObject(mcp) || mcp.schema_version !== 2 || mcp.contract_version !== 2
      || !MCP_STATES.has(mcp.result) || mcp.authorizes !== false
      || !SURFACES.has(mcp.surface) || !SCOPES.has(mcp.scope)) {
    throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
  }
}

function assertPluginPart(plugin, setupRequest) {
  if (plugin?.status === "not_run") {
    exactKeys(plugin, ["status"], "AGDF_INSTALL_SETUP_RESULT_INVALID");
    return;
  }
  assertLifecycleResult(plugin);
}

function runtimeCheckState(runtimeChecks) {
  return runtimeChecks?.effective ?? runtimeChecks?.status;
}

export function deriveInstallSetupState({ setup_request: setupRequest, plugin, runtime_checks: runtimeChecks, mcp, failure }) {
  if (setupRequest === "cancel") return "cancelled";
  if (plugin?.status === "not_run" && ["cancel", "cancelled"].includes(runtimeCheckState(runtimeChecks))) return "cancelled";
  if (!pluginVerified(plugin)) return "failed";
  if (failure?.phase === "runtime_check_permission") return "partial";
  const state = mcpState(mcp);
  if (setupRequest === "plugin_only") {
    if (["foreign", "owned_mismatch", "precedence_conflict", "invalid"].includes(mcp?.registration?.status)
        || state === "degraded") return "degraded_or_foreign";
    if (["not_requested", "not_checked", "not_configured"].includes(state)) return "plugin_ready_mcp_absent";
    return "plugin_ready_mcp_unchanged";
  }
  if (["failed", "degraded", "not_configured", "disabled"].includes(state)) return "partial";
  if (state === "configured_pending_restart") return "configured_pending_restart";
  if (["configured_unverified", "unchanged"].includes(state)) return "configured_unverified";
  if (state === "discovered_ready") return "discovered_ready";
  throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
}

function resultForState(state) {
  if (state === "cancelled") return "cancelled";
  if (state === "failed") return "failed";
  if (["partial", "degraded_or_foreign"].includes(state)) return "partial";
  return "success";
}

export function createInstallSetupPreflight(input = {}) {
  exactKeys(input, [
    "surface", "version", "interaction", "plugin", "mcp_by_scope", "target", "target_source",
    "invocation_directory_source", "requested_scope", "effective_scope", "plugin_configuration", "local_execution",
    "package_acquisition_required", "removal_overview", "full_available", "full_block_reason", "authorizes",
  ], "AGDF_INSTALL_SETUP_PREFLIGHT_INVALID");
  const target = input.target ?? null;
  const requestedScope = input.requested_scope ?? null;
  const effectiveScope = input.effective_scope ?? null;
  const pluginConfiguration = input.plugin_configuration ?? null;
  const invocationDirectorySource = input.invocation_directory_source ?? "none";
  const fullBlockReason = input.full_block_reason ?? "none";
  const scopeStateValid = (state) => plainObject(state)
    && Object.keys(state).every((key) => [
      "status", "capability", "selected_status", "effective_source", "registration_path",
      "available", "block_reason", "removal_command",
    ].includes(key))
    && MCP_STATES.has(state.status)
    && typeof state.capability === "string" && state.capability.trim()
    && mcpCapabilityProfileContract.registrationStates.includes(state.selected_status)
    && MCP_EFFECTIVE_SOURCES.has(state.effective_source)
    && (state.registration_path === null || (typeof state.registration_path === "string" && state.registration_path.trim()))
    && typeof state.available === "boolean" && FULL_BLOCK_REASONS.has(state.block_reason)
    && ((state.available && state.block_reason === "none") || (!state.available && state.block_reason !== "none"))
    && typeof state.removal_command === "string" && state.removal_command.trim();
  if (!SURFACES.has(input.surface) || typeof input.version !== "string" || !input.version.trim()
      || !INTERACTIONS.has(input.interaction) || !plainObject(input.plugin)
      || !PLUGIN_PREFLIGHT_STATES.has(input.plugin.status) || !stringArray(input.plugin.evidence ?? [])
      || !plainObject(input.mcp_by_scope) || Object.keys(input.mcp_by_scope).length !== 2
      || !scopeStateValid(input.mcp_by_scope.project) || !scopeStateValid(input.mcp_by_scope.user)
      || !(target === null || (typeof target === "string" && isAbsolute(target)))
      || !PREFLIGHT_TARGET_SOURCES.has(input.target_source)
      || !INVOCATION_DIRECTORY_SOURCES.has(invocationDirectorySource)
      || !(requestedScope === null || SCOPES.has(requestedScope))
      || !(effectiveScope === null || SCOPES.has(effectiveScope))
      || !(pluginConfiguration === null || (typeof pluginConfiguration === "string" && isAbsolute(pluginConfiguration)))
      || typeof input.local_execution !== "boolean" || typeof input.package_acquisition_required !== "boolean"
      || typeof input.removal_overview !== "string" || !input.removal_overview.trim()
      || typeof input.full_available !== "boolean" || !FULL_BLOCK_REASONS.has(fullBlockReason)
      || input.authorizes !== false
      || (input.full_available && fullBlockReason !== "none")
      || (!input.full_available && fullBlockReason === "none")
      || ((input.target_source === "none") !== (target === null))
      || (input.target_source === "explicit_dir" && invocationDirectorySource !== "explicit_dir")
      || (input.target_source === "interactive_invocation_cwd_proposal"
        && !["npm_init_cwd", "process_cwd"].includes(invocationDirectorySource))
      || (input.target_source === "none" && invocationDirectorySource !== "none")) {
    throw new Error("AGDF_INSTALL_SETUP_PREFLIGHT_INVALID");
  }
  return cloneAndFreeze({
    schema_version: 1,
    surface: input.surface,
    version: input.version,
    interaction: input.interaction,
    plugin: input.plugin,
    mcp_by_scope: input.mcp_by_scope,
    target,
    target_source: input.target_source,
    invocation_directory_source: invocationDirectorySource,
    requested_scope: requestedScope,
    effective_scope: effectiveScope,
    plugin_configuration: pluginConfiguration,
    local_execution: input.local_execution,
    package_acquisition_required: input.package_acquisition_required,
    removal_overview: input.removal_overview,
    full_available: input.full_available,
    full_block_reason: fullBlockReason,
    authorizes: false,
  });
}

export function createInstallSetupResult(input = {}) {
  exactKeys(input, [
    "result", "setup_request", "effective_state", "surface", "target", "target_source",
    "invocation_directory_source", "requested_scope", "effective_scope", "plugin", "runtime_checks", "mcp", "discovery",
    "restart", "failure", "next_action", "authorizes",
  ], "AGDF_INSTALL_SETUP_RESULT_INVALID");
  const target = input.target ?? null;
  const requestedScope = input.requested_scope ?? null;
  const effectiveScope = input.effective_scope ?? null;
  const invocationDirectorySource = input.invocation_directory_source ?? "none";
  if (!SETUP_REQUESTS.has(input.setup_request) || !SURFACES.has(input.surface)
      || !(target === null || (typeof target === "string" && isAbsolute(target)))
      || !TARGET_SOURCES.has(input.target_source)
      || !INVOCATION_DIRECTORY_SOURCES.has(invocationDirectorySource)
      || !(requestedScope === null || SCOPES.has(requestedScope))
      || !(effectiveScope === null || SCOPES.has(effectiveScope))
      || !plainObject(input.runtime_checks) || !RUNTIME_CHECK_STATES.has(runtimeCheckState(input.runtime_checks))
      || !plainObject(input.discovery)
      || !["not_checked", "pending_restart", "discovered"].includes(input.discovery.status)
      || !plainObject(input.restart) || typeof input.restart.required !== "boolean"
      || !stringArray(input.restart.reasons) || input.authorizes !== false
      || ((input.target_source === "none") !== (target === null))
      || (input.target_source === "explicit_dir" && invocationDirectorySource !== "explicit_dir")
      || (input.target_source === "interactive_invocation_cwd_selection"
        && !["npm_init_cwd", "process_cwd"].includes(invocationDirectorySource))
      || (input.target_source === "none" && invocationDirectorySource !== "none")) {
    throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
  }
  assertPluginPart(input.plugin, input.setup_request);
  assertMcpPart(input.mcp);
  assertFailure(input.failure ?? null);
  assertCodedAction(input.next_action);
  const effectiveState = deriveInstallSetupState(input);
  const result = resultForState(effectiveState);
  const cancelledShapeInvalid = effectiveState === "cancelled"
    && (target !== null || input.target_source !== "none" || requestedScope !== null || effectiveScope !== null
      || input.plugin?.status !== "not_run" || mcpState(input.mcp) !== "not_requested"
      || input.discovery.status !== "not_checked" || input.restart.required || input.failure !== null);
  const fullBindingInvalid = effectiveState !== "cancelled" && input.setup_request === "full"
    && (target === null || input.target_source === "none" || requestedScope === null);
  const pluginOnlyBindingInvalid = effectiveState !== "cancelled" && input.setup_request === "plugin_only"
    && (target !== null || input.target_source !== "none" || requestedScope !== null || effectiveScope !== null);
  if ((input.effective_state && input.effective_state !== effectiveState)
      || (input.result && input.result !== result) || !EFFECTIVE_STATES.has(effectiveState) || !RESULTS.has(result)
      || cancelledShapeInvalid || fullBindingInvalid || pluginOnlyBindingInvalid
      || !STATE_ACTIONS[effectiveState]?.has(input.next_action.code)
      || (effectiveState === "discovered_ready" && input.discovery.status !== "discovered")
      || (result === "failed" && !input.failure)
      || (result !== "failed" && input.failure && effectiveState !== "partial")) {
    throw new Error("AGDF_INSTALL_SETUP_RESULT_INVALID");
  }
  return cloneAndFreeze({
    schema_version: 1,
    contract_version: 1,
    operation: "install_setup",
    result,
    setup_request: input.setup_request,
    effective_state: effectiveState,
    surface: input.surface,
    target,
    target_source: input.target_source,
    invocation_directory_source: invocationDirectorySource,
    requested_scope: requestedScope,
    effective_scope: effectiveScope,
    plugin: input.plugin,
    runtime_checks: input.runtime_checks,
    mcp: input.mcp,
    discovery: input.discovery,
    restart: input.restart,
    failure: input.failure ?? null,
    next_action: input.next_action,
    authorizes: false,
  });
}

export const installSetupContract = Object.freeze({
  surfaces: Object.freeze([...SURFACES]),
  setupRequests: Object.freeze([...SETUP_REQUESTS]),
  effectiveStates: Object.freeze([...EFFECTIVE_STATES]),
  resultStates: Object.freeze([...RESULTS]),
  targetSources: Object.freeze([...TARGET_SOURCES]),
  preflightTargetSources: Object.freeze([...PREFLIGHT_TARGET_SOURCES]),
  invocationDirectorySources: Object.freeze([...INVOCATION_DIRECTORY_SOURCES]),
  failurePhases: Object.freeze([...FAILURE_PHASES]),
  failureCodes: Object.freeze([...FAILURE_CODES]),
  nextActionCodes: Object.freeze([...NEXT_ACTION_CODES]),
  runtimeCheckStates: Object.freeze([...RUNTIME_CHECK_STATES]),
});
