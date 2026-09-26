// Canonical machine vocabulary. Copy lives only in the locale registry.
// Consumers derive allowed values from this owner; CI checks every locale against it.
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export const INSTALL_SETUP_STATES = freeze({
  cancelled: { result: "cancelled", actions: ["cancelled"] },
  plugin_ready_mcp_absent: { result: "success", actions: ["restart_host"] },
  plugin_ready_mcp_in_plugin: { result: "success", actions: ["restart_host"] },
  mcp_ready_hook_review_required: { result: "partial", actions: ["review_codex_hook"] },
  mcp_ready_hook_verification_pending: { result: "partial", actions: ["enable_codex_hook", "verify_codex_hook", "inspect_codex_hook"] },
  plugin_ready_mcp_unchanged: { result: "success", actions: ["restart_host"] },
  configured_pending_restart: { result: "success", actions: ["restart_host"] },
  configured_unverified: { result: "success", actions: ["verify_host_discovery"] },
  discovered_ready: { result: "success", actions: ["none"] },
  partial: { result: "partial", actions: ["retry_mcp", "retry_plugin", "review_runtime_checks", "resolve_mcp_registration"] },
  degraded_or_foreign: { result: "partial", actions: ["resolve_mcp_registration"] },
  failed: { result: "failed", actions: ["retry_plugin", "resolve_mcp_registration", "choose_plugin_only_or_cancel"] },
});
export const INSTALL_FAILURE_PHASES = freeze([
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
export const INSTALL_FAILURE_CODES = freeze([
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
export const INSTALL_ACTIONS = freeze([...new Set(Object.values(INSTALL_SETUP_STATES).flatMap(row => row.actions))]);

export const DISPATCH_RECOVERY_CODES = freeze([
  "target_evaluation_failed", "target_presentation_failed", "control_evaluation_failed",
  "control_presentation_failed", "runtime_contracts_unavailable", "runtime_evidence_invalid",
  "internal_failure", "output_too_large",
]);
export const DISPATCH_RECOVERY = freeze(Object.fromEntries(DISPATCH_RECOVERY_CODES.map(code => [code, code])));

export const CODEX_HOOK_STATES = freeze({
  hook_review_required: { state: "mcp_ready_hook_review_required", action: "review_codex_hook" },
  hook_disabled: { state: "mcp_ready_hook_verification_pending", action: "enable_codex_hook" },
  host_unverified: { state: "mcp_ready_hook_verification_pending", action: "inspect_codex_hook" },
  hook_trusted_session_unverified: { state: "mcp_ready_hook_verification_pending", action: "verify_codex_hook" },
});
export function codexHookState(verification) {
  return Object.hasOwn(CODEX_HOOK_STATES, verification) ? CODEX_HOOK_STATES[verification] : CODEX_HOOK_STATES.host_unverified;
}
