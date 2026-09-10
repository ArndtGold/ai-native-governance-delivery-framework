import assert from "node:assert/strict";
import {
  createInstallSetupPreflight,
  createInstallSetupResult,
  deriveInstallSetupState,
  installSetupContract,
} from "../lib/install-setup/contract.js";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { createMcpLifecycleResult } from "../lib/mcp-lifecycle/result.js";

function pluginResult(overrides = {}) {
  return createLifecycleResult({
    operation: "install",
    result: "success",
    surface: "codex",
    scope: "global",
    version: { expected: "0.14.5", installed: "0.14.5", status: "verified" },
    verification: { status: "healthy", evidence: ["installed"] },
    restart: { required: true, reason: "host_reload" },
    next_action: { kind: "restart", text: "Restart Codex." },
    ...overrides,
  });
}

function mcpResult(result = "configured_pending_restart", overrides = {}) {
  const registrationStatus = result === "not_configured" ? "absent" : "matched";
  const discoveryStatus = result === "configured_pending_restart" ? "pending_restart" : "not_checked";
  return createMcpLifecycleResult({
    action: result === "not_configured" ? "status" : "enable",
    result,
    surface: "codex",
    scope: "project",
    scopeEffect: "project",
    target: "/tmp/project",
    capability: "unverified",
    runtime: { package_status: "matched", version: "0.14.5" },
    registration: {
      status: registrationStatus,
      selected_status: registrationStatus,
      effective_status: registrationStatus,
      selected_source: "project",
      effective_source: "project",
      native_scope: "project",
      sources: [],
    },
    discovery: { status: discoveryStatus, source: discoveryStatus === "pending_restart" ? "configuration" : "none", evidence_ref: null },
    nextAction: { code: discoveryStatus === "pending_restart" ? "restart_host" : "enable_scope" },
    ...overrides,
  });
}

const preflight = createInstallSetupPreflight({
  surface: "codex",
  version: "0.14.5",
  interaction: "required",
  plugin: { status: "observed", evidence: ["plugin list"] },
  mcp_by_scope: {
    project: { status: "not_configured", capability: "unverified", selected_status: "absent", effective_source: "none", registration_path: "/tmp/project/.codex/config.toml", available: true, block_reason: "none", removal_command: "remove project" },
    user: { status: "not_configured", capability: "unverified", selected_status: "absent", effective_source: "none", registration_path: "/tmp/home/.codex/config.toml", available: true, block_reason: "none", removal_command: "remove user" },
  },
  target: "/tmp/project",
  target_source: "interactive_invocation_cwd_proposal",
  invocation_directory_source: "process_cwd",
  requested_scope: null,
  effective_scope: null,
  plugin_configuration: null,
  local_execution: true,
  package_acquisition_required: true,
  removal_overview: "agdf uninstall --surface codex --scope global",
  full_available: true,
  full_block_reason: "none",
  authorizes: false,
});
assert.equal(preflight.authorizes, false);
assert.equal(Object.isFrozen(preflight), true);
assert.equal(Object.isFrozen(preflight.plugin), true);
assert.throws(() => createInstallSetupPreflight({ ...preflight, invented: true }), /AGDF_INSTALL_SETUP_PREFLIGHT_INVALID/);
assert.throws(() => createInstallSetupPreflight({ ...preflight, target: "relative" }), /AGDF_INSTALL_SETUP_PREFLIGHT_INVALID/);
assert.throws(() => createInstallSetupPreflight({ ...preflight, authorizes: true }), /AGDF_INSTALL_SETUP_PREFLIGHT_INVALID/);
assert.throws(() => createInstallSetupPreflight({ ...preflight, full_available: false }), /AGDF_INSTALL_SETUP_PREFLIGHT_INVALID/);

function setupResult(overrides = {}) {
  return createInstallSetupResult({
    setup_request: "full",
    surface: "codex",
    target: "/tmp/project",
    target_source: "explicit_dir",
    invocation_directory_source: "explicit_dir",
    requested_scope: "project",
    effective_scope: "project",
    plugin: pluginResult(),
    runtime_checks: { requested: "manual", effective: "manual" },
    mcp: mcpResult(),
    discovery: { status: "pending_restart" },
    restart: { required: true, reasons: ["plugin_reload", "mcp_discovery"] },
    failure: null,
    next_action: { code: "restart_host", parameters: {}, text: null },
    authorizes: false,
    ...overrides,
  });
}

const configured = setupResult();
assert.equal(configured.result, "success");
assert.equal(configured.effective_state, "configured_pending_restart");
assert.equal(configured.operation, "install_setup");
assert.equal(Object.isFrozen(configured.mcp.registration), true);
assert.equal(deriveInstallSetupState(configured), "configured_pending_restart");

const pluginOnlyAbsent = setupResult({
  setup_request: "plugin_only",
  target: null,
  target_source: "none",
  invocation_directory_source: "none",
  requested_scope: null,
  effective_scope: null,
  mcp: { status: "not_checked" },
  discovery: { status: "not_checked" },
  restart: { required: true, reasons: ["plugin_reload"] },
  next_action: { code: "restart_host", parameters: {}, text: null },
});
assert.equal(pluginOnlyAbsent.effective_state, "plugin_ready_mcp_absent");

const pluginOnlyExisting = setupResult({
  setup_request: "plugin_only",
  target: null,
  target_source: "none",
  invocation_directory_source: "none",
  requested_scope: null,
  effective_scope: null,
  mcp: mcpResult("configured_unverified"),
  discovery: { status: "not_checked" },
  next_action: { code: "restart_host", parameters: {}, text: null },
});
assert.equal(pluginOnlyExisting.effective_state, "plugin_ready_mcp_unchanged");

const cancelled = createInstallSetupResult({
  setup_request: "cancel",
  surface: "claude",
  target: null,
  target_source: "none",
  requested_scope: null,
  effective_scope: null,
  plugin: { status: "not_run" },
  runtime_checks: { status: "not_run" },
  mcp: { status: "not_requested" },
  discovery: { status: "not_checked" },
  restart: { required: false, reasons: [] },
  failure: null,
  next_action: { code: "cancelled", parameters: {}, text: null },
  authorizes: false,
});
assert.equal(cancelled.result, "cancelled");
assert.equal(cancelled.effective_state, "cancelled");
const cancelledInput = structuredClone(cancelled);
for (const derivedKey of ["schema_version", "contract_version", "operation", "result", "effective_state"]) {
  delete cancelledInput[derivedKey];
}

const failedPlugin = pluginResult({
  result: "failed",
  verification: { status: "degraded", evidence: ["failed"] },
  failure: { phase: "plugin_operation", message: "failed" },
});
const failed = setupResult({
  plugin: failedPlugin,
  mcp: { status: "not_requested" },
  discovery: { status: "not_checked" },
  effective_scope: null,
  failure: { phase: "plugin_operation", code: "plugin_operation_failed", message: "Plugin failed.", evidence: ["failed"] },
  next_action: { code: "retry_plugin", parameters: {}, text: null },
});
assert.equal(failed.result, "failed");
assert.equal(failed.effective_state, "failed");

const mcpFailed = setupResult({
  mcp: mcpResult("failed", {
    discovery: { status: "not_checked", source: "none", evidence_ref: null },
    diagnostics: [{ code: "enable_failed" }],
    nextAction: { code: "resolve_failure" },
  }),
  effective_scope: null,
  discovery: { status: "not_checked" },
  failure: { phase: "mcp_enable", code: "mcp_enable_failed", message: "MCP failed.", evidence: ["enable_failed"] },
  next_action: { code: "retry_mcp", parameters: {}, text: null },
});
assert.equal(mcpFailed.result, "partial");
assert.equal(mcpFailed.effective_state, "partial");

const runtimeCheckFailed = setupResult({
  runtime_checks: { requested: "manual", effective: "failed", reason: "configuration_invalid" },
  failure: { phase: "runtime_check_permission", code: "runtime_check_permission_failed", message: "Receipt write failed.", evidence: ["runtime_check_permission"] },
  next_action: { code: "review_runtime_checks", parameters: {}, text: null },
});
assert.equal(runtimeCheckFailed.result, "partial");
assert.equal(runtimeCheckFailed.effective_state, "partial");

assert.throws(() => setupResult({ authorizes: true }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ setup_request: "plugin_only" }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => createInstallSetupResult({ ...cancelledInput, plugin: pluginResult() }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ runtime_checks: { effective: "invented" } }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ next_action: [] }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ next_action: { code: "invented", parameters: {}, text: null } }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ next_action: { code: "retry_mcp", parameters: {}, text: null } }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ effective_state: "discovered_ready" }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.throws(() => setupResult({ invented: true }), /AGDF_INSTALL_SETUP_RESULT_INVALID/);
assert.deepEqual(installSetupContract.setupRequests, ["plugin_only", "full", "cancel"]);

console.log("install setup contract tests passed");
