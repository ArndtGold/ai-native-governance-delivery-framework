import process from "node:process";
import { defaultOpenCodeConfigDir } from "../installers/opencode.js";
import { inspectGlobalInstallationStatus } from "../lifecycle/status.js";
import { runMcpLifecycle } from "../mcp-lifecycle/service.js";
import { pluginDefinition } from "../cli/runtime-context.js";
import { createInstallSetupPreflight, createInstallSetupResult } from "./contract.js";

const SURFACES = new Set(["codex", "claude", "copilot", "opencode"]);
const SCOPE_DECISIONS = new Set(["project", "user", "back", "cancel"]);
const MCP_CONFLICTS = new Map([
  ["foreign", "mcp_foreign"],
  ["precedence_conflict", "mcp_precedence_conflict"],
  ["invalid", "mcp_invalid"],
]);
const PREFLIGHT_MCP_REPORTS = new WeakMap();

function installationTarget(options, { interactive, cwd }) {
  if (options.setupRequest === "full" && options.dirExplicit) {
    return { target: options.dir, source: "explicit_dir" };
  }
  if (interactive && options.setupRequest !== "plugin_only") {
    return { target: cwd, source: "interactive_invocation_cwd_proposal" };
  }
  return { target: null, source: "none" };
}

export function resolveInstallSetupPaths(options, {
  interactive = false,
  cwd = options.workingDirectory ?? process.cwd(),
  env = process.env,
} = {}) {
  const effectiveInteractive = Boolean(interactive && !options.json);
  const { target, source } = installationTarget(options, { interactive: effectiveInteractive, cwd });
  const invocationDirectorySource = source === "explicit_dir"
    ? "explicit_dir"
    : source === "interactive_invocation_cwd_proposal"
      ? options.workingDirectorySource ?? "process_cwd"
      : "none";
  const pluginConfiguration = options.target === "opencode"
    ? options.setupRequest === "full"
      ? env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir()
      : options.dirExplicit ? options.dir : env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir()
    : null;
  return Object.freeze({
    target,
    target_source: source,
    invocation_directory_source: invocationDirectorySource,
    plugin_configuration: pluginConfiguration,
    interactive: effectiveInteractive,
  });
}

function preflightMcpState(report, { surface, target, scope }) {
  const blockReason = fullBlockReason(report, target);
  return Object.freeze({
    status: report.result,
    capability: report.capability,
    selected_status: report.registration?.selected_status ?? report.registration?.status ?? "invalid",
    effective_source: report.registration?.effective_source ?? "none",
    registration_path: report.registration?.path ?? null,
    available: blockReason === "none",
    block_reason: blockReason,
    removal_command: removalCommand(surface, target, scope),
  });
}

function fullBlockReason(mcp, target) {
  if (!target) return "target_required";
  if (mcp.result === "failed" || mcp.status === "failed") return "mcp_preflight_failed";
  const conflict = MCP_CONFLICTS.get(mcp.registration?.status ?? mcp.registration_status);
  if (conflict) return conflict;
  return "none";
}

function removalCommand(surface, target, scope) {
  const base = `npx --yes @agdf/cli@latest uninstall --surface ${surface} --scope global`;
  if (!target) return base;
  const hasControlCharacter = /[\u0000-\u001f\u007f]/u.test(target);
  let displayedTarget = "ABSOLUTE_TARGET_SHOWN_ABOVE";
  if (!hasControlCharacter && process.platform === "win32"
      && /^(?:[A-Za-z]:[\\/])[A-Za-z0-9 ._\\/:-]+$/u.test(target)) {
    displayedTarget = '"' + target + '"';
  } else if (!hasControlCharacter && process.platform !== "win32") {
    displayedTarget = "'" + target.replaceAll("'", "'\"'\"'") + "'";
  }
  return `${base} --with-mcp --mcp-scope ${scope} --dir ${displayedTarget}`;
}

export function inspectInstallSetup({ options, interactive = false, env = process.env } = {}, {
  inspectPlugin = inspectGlobalInstallationStatus,
  mcpLifecycle = runMcpLifecycle,
  exec,
} = {}) {
  if (!SURFACES.has(options?.target)) throw new Error("AGDF_INSTALL_SETUP_INPUT_INVALID");
  const paths = resolveInstallSetupPaths(options, { interactive, env });
  const requestedScope = options.setupRequest === "full"
    ? options.scope ?? (paths.interactive ? null : "project")
    : null;
  let plugin;
  try {
    const observation = inspectPlugin({
      surface: options.target,
      configDir: paths.plugin_configuration ?? undefined,
      dataRoot: env.AGDF_DATA_DIR,
    }, { exec });
    plugin = {
      status: observation.status ?? "unknown",
      evidence: [...(observation.evidence ?? [])].map(String),
      observation,
    };
  } catch (error) {
    plugin = { status: "unavailable", evidence: [String(error?.message || error)] };
  }
  const reports = {};
  const mcpByScope = {};
  for (const scope of ["project", "user"]) {
    if (!paths.target) {
      mcpByScope[scope] = {
        status: "not_checked",
        capability: "unverified",
        selected_status: "absent",
        effective_source: "none",
        registration_path: null,
        available: false,
        block_reason: "target_required",
        removal_command: removalCommand(options.target, paths.target, scope),
      };
      continue;
    }
    try {
      const report = mcpLifecycle({ action: "status", surface: options.target, scope, target: paths.target, env, exec });
      reports[scope] = report;
      mcpByScope[scope] = preflightMcpState(report, { surface: options.target, target: paths.target, scope });
    } catch (error) {
      reports[scope] = null;
      mcpByScope[scope] = {
        status: "failed",
        capability: "unverified",
        selected_status: "invalid",
        effective_source: "unknown",
        registration_path: null,
        available: false,
        block_reason: "mcp_preflight_failed",
        removal_command: removalCommand(options.target, paths.target, scope),
      };
    }
  }
  const availableScopes = ["project", "user"].filter((scope) => mcpByScope[scope].available);
  const fullAvailable = requestedScope ? mcpByScope[requestedScope].available : availableScopes.length > 0;
  const blockReason = fullAvailable ? "none"
    : requestedScope ? mcpByScope[requestedScope].block_reason
      : mcpByScope.project.block_reason;
  const packageRequired = ["project", "user"].some((scope) => reports[scope]?.runtime?.package_status !== "matched");
  const preflight = createInstallSetupPreflight({
    surface: options.target,
    version: pluginDefinition.version,
    interaction: paths.interactive && !options.setupRequest ? "required" : "not_required",
    plugin,
    mcp_by_scope: mcpByScope,
    target: paths.target,
    target_source: paths.target_source,
    invocation_directory_source: paths.invocation_directory_source,
    requested_scope: requestedScope,
    effective_scope: requestedScope ? reports[requestedScope]?.effective_scope ?? null : null,
    plugin_configuration: paths.plugin_configuration,
    local_execution: true,
    package_acquisition_required: packageRequired,
    removal_overview: `npx --yes @agdf/cli@latest uninstall --surface ${options.target} --scope global`,
    full_available: fullAvailable,
    full_block_reason: blockReason,
    authorizes: false,
  });
  PREFLIGHT_MCP_REPORTS.set(preflight, Object.freeze({ ...reports }));
  return preflight;
}

function cancelledResult({ surface, selection, preflight, runtimeChecks = { status: "not_run" } }) {
  return createInstallSetupResult({
    setup_request: selection,
    surface,
    target: null,
    target_source: "none",
    invocation_directory_source: "none",
    requested_scope: null,
    effective_scope: null,
    plugin: { status: "not_run" },
    runtime_checks: runtimeChecks,
    mcp: { status: "not_requested" },
    discovery: { status: "not_checked" },
    restart: { required: false, reasons: [] },
    failure: null,
    next_action: { code: "cancelled", parameters: {}, text: null },
    authorizes: false,
  });
}

function failedBeforeMutation({ surface, selection, selectedScope, preflight, message }) {
  const scopeState = selectedScope ? preflight.mcp_by_scope[selectedScope] : null;
  const blockReason = scopeState?.block_reason ?? preflight.full_block_reason;
  const mcpPreflightFailed = blockReason === "mcp_preflight_failed";
  return createInstallSetupResult({
    setup_request: selection,
    surface,
    target: preflight.target,
    target_source: preflight.target_source === "interactive_invocation_cwd_proposal" ? "interactive_invocation_cwd_selection" : preflight.target_source,
    invocation_directory_source: preflight.invocation_directory_source,
    requested_scope: selectedScope,
    effective_scope: null,
    plugin: { status: "not_run" },
    runtime_checks: { status: "not_run" },
    mcp: PREFLIGHT_MCP_REPORTS.get(preflight)?.[selectedScope] ?? { status: "not_checked" },
    discovery: { status: "not_checked" },
    restart: { required: false, reasons: [] },
    failure: {
      phase: mcpPreflightFailed ? "mcp_preflight" : "setup_preflight",
      code: mcpPreflightFailed ? "mcp_preflight_failed" : "setup_selection_blocked",
      message,
      evidence: [blockReason],
    },
    next_action: { code: blockReason === "target_required" ? "choose_plugin_only_or_cancel" : "resolve_mcp_registration", parameters: {}, text: null },
    authorizes: false,
  });
}

function pluginHealthy(report) {
  return report?.result !== "failed"
    && ["healthy", "configured", "configured_pending_restart"].includes(report?.verification?.status);
}

function pluginFailureReport(createPluginFailure, error) {
  if (typeof createPluginFailure !== "function") throw error;
  return createPluginFailure(error);
}

function failureEvidence(value) {
  if (Array.isArray(value?.diagnostics) && value.diagnostics.length) return value.diagnostics.map((item) => item.code);
  return value?.failure?.message ? [value.failure.message] : [];
}

function pluginFailurePhase(report) {
  if (report?.failure?.phase === "verification") return "plugin_verification";
  if (!report?.failure && !["healthy", "configured", "configured_pending_restart"].includes(report?.verification?.status)) {
    return "plugin_verification";
  }
  return "plugin_operation";
}

function completedResult({ selection, selectedScope, preflight, pluginReport, runtimeChecks, mcpReport }) {
  const full = selection === "full";
  const reports = PREFLIGHT_MCP_REPORTS.get(preflight) ?? {};
  const mcp = full ? mcpReport ?? { status: "not_requested" } : reports.project ?? { status: "not_checked" };
  let failure = null;
  let nextAction = "restart_host";
  if (!pluginHealthy(pluginReport)) {
    const phase = pluginFailurePhase(pluginReport);
    failure = {
      phase,
      code: phase === "plugin_verification" ? "plugin_verification_failed" : "plugin_operation_failed",
      message: pluginReport?.failure?.message || "The plugin operation was not verified.",
      evidence: [...(pluginReport?.verification?.evidence ?? [])].map(String),
    };
    nextAction = "retry_plugin";
  } else if (runtimeChecks?.failure) {
    failure = {
      phase: "runtime_check_permission",
      code: "runtime_check_permission_failed",
      message: runtimeChecks.failure.message || "The automatic-check choice could not be finalized.",
      evidence: [runtimeChecks.failure.phase || "runtime_check_permission"],
    };
    nextAction = "review_runtime_checks";
  } else if (full && ["failed", "degraded", "not_configured", "disabled"].includes(mcpReport?.result)) {
    failure = {
      phase: "mcp_enable",
      code: "mcp_enable_failed",
      message: "The plugin is installed, but MCP enable did not reach a configured state.",
      evidence: failureEvidence(mcpReport),
    };
    nextAction = "retry_mcp";
  } else if (!full && ["degraded", "failed"].includes(mcp?.result)) {
    nextAction = "resolve_mcp_registration";
  } else if (full && ["configured_unverified", "unchanged"].includes(mcpReport?.result)) {
    nextAction = "verify_host_discovery";
  }
  const target = full ? preflight.target : null;
  const targetSource = full
    ? preflight.target_source === "interactive_invocation_cwd_proposal" ? "interactive_invocation_cwd_selection" : preflight.target_source
    : "none";
  const mcpDiscovery = full && mcpReport?.discovery?.status === "pending_restart" ? "pending_restart" : "not_checked";
  const reasons = ["plugin_reload", ...(full && ["configured_pending_restart", "configured_unverified", "unchanged"].includes(mcpReport?.result)
    ? ["mcp_discovery"] : [])];
  return createInstallSetupResult({
    setup_request: selection,
    surface: preflight.surface,
    target,
    target_source: targetSource,
    invocation_directory_source: full ? preflight.invocation_directory_source : "none",
    requested_scope: full ? selectedScope : null,
    effective_scope: full ? mcpReport?.effective_scope ?? null : null,
    plugin: pluginReport,
    runtime_checks: runtimeChecks?.state ?? runtimeChecks ?? { status: "not_checked" },
    mcp,
    discovery: { status: mcpDiscovery },
    restart: { required: pluginHealthy(pluginReport), reasons: pluginHealthy(pluginReport) ? reasons : [] },
    failure,
    next_action: { code: nextAction, parameters: {}, text: null },
    authorizes: false,
  });
}

export async function runInstallSetup({ options, interactive = false, env = process.env } = {}, {
  inspectPlugin,
  mcpLifecycle = runMcpLifecycle,
  exec,
  chooseSetup,
  chooseScope,
  prepareRuntimeChecks,
  installPlugin,
  createPluginFailure,
  finalizeRuntimeChecks,
} = {}) {
  if (!SURFACES.has(options?.target) || typeof installPlugin !== "function") {
    throw new Error("AGDF_INSTALL_SETUP_INPUT_INVALID");
  }
  const effectiveInteractive = Boolean(interactive && !options.json);
  if (options.setupRequest === "full" && !effectiveInteractive
      && (!options.dirExplicit || !options.dirInputAbsolute)) {
    throw new Error("Non-interactive --with-mcp requires an explicit absolute --dir target.");
  }
  const preflight = inspectInstallSetup({ options, interactive: effectiveInteractive, env }, { inspectPlugin, mcpLifecycle, exec });
  let selection = options.setupRequest;
  let selectedScope = preflight.requested_scope;
  while (!selection || (selection === "full" && !selectedScope)) {
    if (!selection) {
      selection = effectiveInteractive && typeof chooseSetup === "function" ? await chooseSetup(preflight) : "plugin_only";
    }
    if (selection === "full" && !selectedScope) {
      const scopeDecision = effectiveInteractive && typeof chooseScope === "function"
        ? await chooseScope(preflight)
        : "cancel";
      if (!SCOPE_DECISIONS.has(scopeDecision)) throw new Error("AGDF_INSTALL_SETUP_SCOPE_SELECTION_INVALID");
      if (scopeDecision === "back") { selection = null; continue; }
      if (scopeDecision === "cancel") selection = "cancel";
      else selectedScope = scopeDecision;
    }
  }
  if (!new Set(["full", "plugin_only", "cancel"]).has(selection)) throw new Error("AGDF_INSTALL_SETUP_SELECTION_INVALID");
  if (selection === "cancel") return Object.freeze({ report: cancelledResult({ surface: options.target, selection, preflight }), preflight, plugin_payload: null });
  if (selection === "full" && !preflight.mcp_by_scope[selectedScope]?.available) {
    return Object.freeze({
      report: failedBeforeMutation({ surface: options.target, selection, selectedScope, preflight,
        message: `Complete setup is unavailable: ${preflight.mcp_by_scope[selectedScope]?.block_reason ?? preflight.full_block_reason}` }),
      preflight,
      plugin_payload: null,
    });
  }
  const consent = typeof prepareRuntimeChecks === "function"
    ? await prepareRuntimeChecks(options.target, options)
    : { decision: "manual", state: { requested: "manual", effective: "manual" } };
  if (consent?.decision === "cancel") {
    return Object.freeze({
      report: cancelledResult({
        surface: options.target,
        selection,
        preflight,
        runtimeChecks: { ...(consent.state ?? {}), effective: "cancelled" },
      }),
      preflight,
      plugin_payload: null,
    });
  }
  let pluginPayload;
  let pluginReport;
  try {
    pluginPayload = await installPlugin({
      surface: options.target,
      options,
      plugin_configuration: preflight.plugin_configuration,
      consent,
    });
    pluginReport = pluginPayload?.report ?? pluginPayload;
  } catch (error) {
    pluginReport = pluginFailureReport(createPluginFailure, error);
  }
  let runtimeChecks = { state: consent?.state ?? { requested: "manual", effective: "manual" }, failure: null };
  if (pluginHealthy(pluginReport) && typeof finalizeRuntimeChecks === "function") {
    try {
      runtimeChecks = await finalizeRuntimeChecks(consent, pluginPayload);
    } catch (error) {
      runtimeChecks = {
        state: consent?.state ?? { requested: consent?.decision ?? "manual", effective: "unknown" },
        failure: { phase: "runtime_check_permission", message: String(error?.message || error) },
      };
    }
  }
  let mcpReport = null;
  if (selection === "full" && pluginHealthy(pluginReport)) {
    mcpReport = mcpLifecycle({
      action: "enable",
      surface: options.target,
      scope: selectedScope,
      target: preflight.target,
      env,
      exec,
    });
  }
  const report = completedResult({ selection, selectedScope, preflight, pluginReport, runtimeChecks, mcpReport });
  return Object.freeze({ report, preflight, plugin_payload: pluginPayload ?? null });
}
