import assert from "node:assert/strict";
import {
  inspectInstallSetup,
  resolveInstallSetupPaths,
  runInstallSetup,
} from "../lib/install-setup/service.js";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { createMcpLifecycleResult } from "../lib/mcp-lifecycle/result.js";

function options(overrides = {}) {
  return {
    target: "codex",
    dir: "/tmp/workspace",
    dirInput: ".",
    dirInputAbsolute: false,
    dirExplicit: false,
    setupRequest: undefined,
    scope: undefined,
    json: false,
    workingDirectory: "/tmp/workspace",
    ...overrides,
  };
}

function pluginReport(overrides = {}) {
  return createLifecycleResult({
    operation: "install",
    result: "success",
    surface: "codex",
    scope: "global",
    version: { expected: "0.14.5", installed: "0.14.5", status: "verified" },
    verification: { status: "healthy", evidence: ["plugin_verified"] },
    restart: { required: true, reason: "host_reload" },
    next_action: { kind: "restart", text: "Restart." },
    ...overrides,
  });
}

function mcpReport({
  action = "status",
  result = "not_configured",
  registration = "absent",
  discovery = "not_checked",
  surface = "codex",
  scope = "project",
  target = "/tmp/workspace",
  effectiveSource = scope,
  registrationPath = null,
} = {}) {
  return createMcpLifecycleResult({
    action,
    result,
    surface,
    scope,
    scopeEffect: scope,
    target,
    capability: "unverified",
    runtime: { package_status: result === "not_configured" ? "absent" : "matched", version: "0.14.5" },
    registration: {
      status: registration,
      selected_status: registration,
      effective_status: registration,
      selected_source: scope,
      effective_source: effectiveSource,
      native_scope: scope,
      path: registrationPath,
      sources: [],
    },
    discovery: { status: discovery, source: discovery === "pending_restart" ? "configuration" : "none", evidence_ref: null },
    diagnostics: result === "failed" ? [{ code: "enable_failed" }] : [],
    nextAction: { code: discovery === "pending_restart" ? "restart_host" : result === "failed" ? "resolve_failure" : "enable_scope" },
  });
}

function ownerAdapters(calls, overrides = {}) {
  return {
    inspectPlugin() {
      calls.push("plugin.status");
      return { status: "healthy", evidence: ["plugin.status"] };
    },
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}`);
      return input.action === "status"
        ? mcpReport()
        : mcpReport({ action: "enable", result: "configured_pending_restart", registration: "matched", discovery: "pending_restart" });
    },
    prepareRuntimeChecks() {
      calls.push("runtime.select");
      return { decision: "manual", state: { requested: "manual", effective: "manual" } };
    },
    installPlugin() {
      calls.push("plugin.install");
      return { report: pluginReport(), installed: { pluginRoot: "/tmp/plugin" } };
    },
    finalizeRuntimeChecks() {
      calls.push("runtime.finalize");
      return { state: { requested: "manual", effective: "manual" }, failure: null };
    },
    ...overrides,
  };
}

{
  const calls = [];
  const result = await runInstallSetup({ options: options(), interactive: false, env: {} }, ownerAdapters(calls));
  assert.deepEqual(calls, ["plugin.status", "runtime.select", "plugin.install", "runtime.finalize"]);
  assert.equal(result.report.setup_request, "plugin_only");
  assert.equal(result.report.effective_state, "plugin_ready_mcp_absent");
  assert.deepEqual(result.report.mcp, { status: "not_checked" });
  assert.equal(result.report.target, null);
}

{
  const calls = [];
  await assert.rejects(() => runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "relative", dirInputAbsolute: false }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls)), /explicit absolute --dir/);
  assert.deepEqual(calls, []);
}

{
  const calls = [];
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "runtime.select", "plugin.install", "runtime.finalize", "mcp.enable"]);
  assert.equal(result.report.effective_state, "configured_pending_restart");
  assert.equal(result.report.result, "success");
  assert.equal(result.report.target_source, "explicit_dir");
  assert.equal(result.report.discovery.status, "pending_restart");
  assert.equal(result.report.authorizes, false);
}

{
  const calls = [];
  const failedPlugin = pluginReport({
    result: "failed",
    verification: { status: "degraded", evidence: ["plugin_failed"] },
    failure: { phase: "plugin_operation", message: "plugin failed" },
  });
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, { installPlugin() { calls.push("plugin.install"); return { report: failedPlugin }; } }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "runtime.select", "plugin.install"]);
  assert.equal(result.report.result, "failed");
  assert.equal(result.report.failure.phase, "plugin_operation");
  assert.deepEqual(result.report.mcp, { status: "not_requested" });
}

{
  const calls = [];
  const degradedPlugin = pluginReport({
    result: "partial",
    verification: { status: "degraded", evidence: ["version_mismatch"] },
  });
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, { installPlugin() { calls.push("plugin.install"); return { report: degradedPlugin }; } }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "runtime.select", "plugin.install"]);
  assert.equal(result.report.failure.phase, "plugin_verification");
  assert.equal(result.report.failure.code, "plugin_verification_failed");
}

{
  const calls = [];
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}`);
      return input.action === "status" ? mcpReport() : mcpReport({ action: "enable", result: "failed", registration: "absent" });
    },
  }));
  assert.equal(result.report.result, "partial");
  assert.equal(result.report.effective_state, "partial");
  assert.equal(result.report.plugin.verification.status, "healthy");
  assert.equal(result.report.next_action.code, "retry_mcp");
}

{
  const calls = [];
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    finalizeRuntimeChecks() {
      calls.push("runtime.finalize");
      throw new Error("receipt write failed");
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "runtime.select", "plugin.install", "runtime.finalize", "mcp.enable"]);
  assert.equal(result.report.result, "partial");
  assert.equal(result.report.effective_state, "partial");
  assert.equal(result.report.failure.phase, "runtime_check_permission");
  assert.equal(result.report.next_action.code, "review_runtime_checks");
}

{
  const calls = [];
  const result = await runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    chooseSetup(preflight) {
      calls.push("setup.choose");
      assert.equal(preflight.target, "/tmp/workspace");
      assert.equal(preflight.target_source, "interactive_invocation_cwd_proposal");
      return "full";
    },
    chooseScope() { calls.push("scope.choose"); return "project"; },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "setup.choose", "scope.choose", "runtime.select", "plugin.install", "runtime.finalize", "mcp.enable"]);
  assert.equal(result.report.target_source, "interactive_invocation_cwd_selection");
  assert.equal(result.report.invocation_directory_source, "process_cwd");
}

{
  const calls = [];
  const result = await runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}.${input.scope}`);
      return input.action === "status"
        ? mcpReport({ scope: input.scope })
        : mcpReport({
          action: "enable",
          result: "configured_pending_restart",
          registration: "matched",
          discovery: "pending_restart",
          scope: input.scope,
        });
    },
    chooseSetup() { calls.push("setup.choose"); return "full"; },
    chooseScope(preflight) {
      calls.push("scope.choose");
      assert.equal(preflight.mcp_by_scope.user.available, true);
      return "user";
    },
  }));
  assert.deepEqual(calls, [
    "plugin.status",
    "mcp.status.project",
    "mcp.status.user",
    "setup.choose",
    "scope.choose",
    "runtime.select",
    "plugin.install",
    "runtime.finalize",
    "mcp.enable.user",
  ]);
  assert.equal(result.report.requested_scope, "user");
  assert.equal(result.report.mcp.scope, "user");
}

{
  const calls = [];
  const setupChoices = ["full", "plugin_only"];
  const result = await runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    chooseSetup() { calls.push("setup.choose"); return setupChoices.shift(); },
    chooseScope() { calls.push("scope.choose"); return "back"; },
  }));
  assert.deepEqual(calls, [
    "plugin.status",
    "mcp.status",
    "mcp.status",
    "setup.choose",
    "scope.choose",
    "setup.choose",
    "runtime.select",
    "plugin.install",
    "runtime.finalize",
  ]);
  assert.equal(result.report.setup_request, "plugin_only");
  assert.equal(result.report.target, null);
}

{
  const calls = [];
  await assert.rejects(
    () => runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
      chooseSetup() { calls.push("setup.choose"); return "full"; },
      chooseScope() { calls.push("scope.choose"); return undefined; },
    })),
    /AGDF_INSTALL_SETUP_SCOPE_SELECTION_INVALID/,
  );
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "setup.choose", "scope.choose"],
    "an invalid scope adapter result must fail before consent or mutation");
}

{
  const calls = [];
  const preflight = inspectInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}.${input.scope}`);
      return input.scope === "user"
        ? mcpReport({
          result: "degraded",
          registration: "precedence_conflict",
          scope: "user",
          effectiveSource: "project_override",
          registrationPath: "/tmp/workspace/.codex/config.toml",
        })
        : mcpReport({ scope: "project", registrationPath: "/tmp/workspace/.codex/config.toml" });
    },
  }));
  assert.equal(preflight.full_available, true, "one available scope must keep complete setup selectable");
  assert.equal(preflight.mcp_by_scope.project.available, true);
  assert.equal(preflight.mcp_by_scope.user.available, false);
  assert.equal(preflight.mcp_by_scope.user.block_reason, "mcp_precedence_conflict");
  assert.equal(preflight.mcp_by_scope.user.effective_source, "project_override");
}

{
  const calls = [];
  const foreign = mcpReport({ result: "degraded", registration: "foreign" });
  const result = await runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    mcpLifecycle(input) { calls.push(`mcp.${input.action}`); return foreign; },
    chooseSetup(preflight) {
      calls.push("setup.choose");
      assert.equal(preflight.full_available, false);
      assert.equal(preflight.full_block_reason, "mcp_foreign");
      return "plugin_only";
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "setup.choose", "runtime.select", "plugin.install", "runtime.finalize"]);
  assert.equal(result.report.effective_state, "degraded_or_foreign");
  assert.equal(result.report.next_action.code, "resolve_mcp_registration");
  assert.deepEqual(result.report.mcp, foreign);
}

{
  const calls = [];
  const foreign = mcpReport({ result: "degraded", registration: "foreign" });
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    mcpLifecycle(input) { calls.push(`mcp.${input.action}`); return foreign; },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status"]);
  assert.equal(result.report.result, "failed");
  assert.equal(result.report.failure.phase, "setup_preflight");
  assert.deepEqual(result.report.plugin, { status: "not_run" });
}

{
  const calls = [];
  const ownedMismatch = mcpReport({ result: "degraded", registration: "owned_mismatch" });
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}`);
      return input.action === "status"
        ? ownedMismatch
        : mcpReport({ action: "enable", result: "configured_pending_restart", registration: "matched", discovery: "pending_restart" });
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "runtime.select", "plugin.install", "runtime.finalize", "mcp.enable"]);
  assert.equal(result.preflight.full_available, true);
  assert.equal(result.report.result, "success");
}

{
  const calls = [];
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    mcpLifecycle() {
      calls.push("mcp.status");
      throw new Error("status unavailable");
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status"]);
  assert.equal(result.preflight.full_block_reason, "mcp_preflight_failed");
  assert.equal(result.report.failure.phase, "mcp_preflight");
  assert.equal(result.report.failure.code, "mcp_preflight_failed");
  assert.deepEqual(result.report.plugin, { status: "not_run" });
}

{
  const calls = [];
  const result = await runInstallSetup({ options: options(), interactive: true, env: {} }, ownerAdapters(calls, {
    chooseSetup() { calls.push("setup.choose"); return "cancel"; },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "setup.choose"]);
  assert.equal(result.report.result, "cancelled");
}

{
  const legacy = resolveInstallSetupPaths(options({ target: "opencode", dir: "/tmp/opencode-config", dirExplicit: true }), {
    interactive: false,
    cwd: "/tmp/project",
    env: { OPENCODE_CONFIG_DIR: "/tmp/env-config" },
  });
  assert.equal(legacy.plugin_configuration, "/tmp/opencode-config");
  assert.equal(legacy.target, null);
  const full = resolveInstallSetupPaths(options({
    target: "opencode",
    dir: "/tmp/project",
    dirExplicit: true,
    dirInput: "/tmp/project",
    dirInputAbsolute: true,
    setupRequest: "full",
  }), { interactive: false, cwd: "/tmp/workspace", env: { OPENCODE_CONFIG_DIR: "/tmp/env-config" } });
  assert.equal(full.plugin_configuration, "/tmp/env-config");
  assert.equal(full.target, "/tmp/project");
}

{
  let writes = 0;
  const observed = inspectInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, {
    inspectPlugin() { return { status: "healthy", evidence: [] }; },
    mcpLifecycle({ action }) {
      assert.equal(action, "status");
      return mcpReport();
    },
    exec() { writes += 1; throw new Error("preflight must not execute a mutation"); },
  });
  assert.equal(observed.authorizes, false);
  assert.equal(writes, 0);
}

{
  const calls = [];
  const result = await runInstallSetup({
    options: options({ setupRequest: "full", dirExplicit: true, dirInput: "/tmp/workspace", dirInputAbsolute: true }),
    interactive: false,
    env: {},
  }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}`);
      throw new Error("status unavailable");
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status"]);
  assert.equal(result.preflight.full_block_reason, "mcp_preflight_failed");
  assert.equal(result.report.failure.phase, "mcp_preflight");
  assert.equal(result.report.failure.code, "mcp_preflight_failed");
}

for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  const calls = [];
  const observed = inspectInstallSetup({
    options: options({
      target: surface,
      setupRequest: "full",
      dirExplicit: true,
      dirInput: "/tmp/workspace",
      dirInputAbsolute: true,
      scope: "user",
    }),
    interactive: false,
    env: { OPENCODE_CONFIG_DIR: "/tmp/opencode-config" },
  }, {
    inspectPlugin(input) {
      calls.push(["plugin.status", surface, input.configDir ?? null]);
      return { status: "healthy", evidence: [surface] };
    },
    mcpLifecycle(input) {
      calls.push(["mcp.status", input.surface, input.scope, input.target]);
      return createMcpLifecycleResult({
        action: "status",
        result: "not_configured",
        surface,
        scope: input.scope,
        scopeEffect: input.scope,
        target: "/tmp/workspace",
        capability: "unverified",
        runtime: { package_status: "absent", version: "0.14.5" },
        registration: {
          status: "absent",
          selected_status: "absent",
          effective_status: "absent",
          selected_source: input.scope,
          effective_source: input.scope,
          native_scope: input.scope,
          sources: [],
        },
        discovery: { status: "not_checked", source: "none", evidence_ref: null },
        nextAction: { code: "enable_scope" },
      });
    },
  });
  assert.equal(observed.surface, surface);
  assert.equal(observed.requested_scope, "user");
  assert.equal(observed.target, "/tmp/workspace");
  assert.equal(observed.plugin_configuration, surface === "opencode" ? "/tmp/opencode-config" : null);
  assert.equal(observed.mcp_by_scope.user.removal_command.includes("--dir /tmp/workspace"), false,
    "the displayed removal command must not interpolate an unquoted target");
  assert.deepEqual(calls.slice(1), [
    ["mcp.status", surface, "project", "/tmp/workspace"],
    ["mcp.status", surface, "user", "/tmp/workspace"],
  ]);
}

for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  const calls = [];
  const observedMcp = mcpReport({ result: "degraded", registration: "owned_mismatch", surface });
  const before = JSON.stringify(observedMcp);
  const result = await runInstallSetup({
    options: options({ target: surface }),
    interactive: true,
    env: { OPENCODE_CONFIG_DIR: "/tmp/opencode-config" },
  }, ownerAdapters(calls, {
    mcpLifecycle(input) {
      calls.push(`mcp.${input.action}`);
      assert.equal(input.action, "status", "plugin-only must not call a mutating MCP action");
      return observedMcp;
    },
    chooseSetup() { calls.push("setup.choose"); return "plugin_only"; },
    installPlugin() {
      calls.push("plugin.install");
      return { report: pluginReport({ surface }), installed: { pluginRoot: "/tmp/plugin" } };
    },
  }));
  assert.deepEqual(calls, ["plugin.status", "mcp.status", "mcp.status", "setup.choose", "runtime.select", "plugin.install", "runtime.finalize"]);
  assert.equal(JSON.stringify(observedMcp), before);
  assert.deepEqual(result.report.mcp, observedMcp);
  assert.equal(result.report.effective_state, "degraded_or_foreign");
}

console.log("install setup service tests passed");
