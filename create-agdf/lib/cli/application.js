import { isAbsolute, join } from "node:path";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import process from "node:process";
import {
  createRun,
  migrateLegacy,
  resolveRuns,
  writeLegacyProjection,
} from "../control-state/index.js";
import {
  defaultOpenCodeConfigDir,
  evaluateOpenCodeGlobalStatus,
  evaluateOpenCodeStatus,
  installOpenCodeGlobalPlugin,
  installOpenCodeGlobalSurface,
  printOpenCodeStatus,
} from "../installers/opencode.js";
import {
  installClaudeGlobalPlugin,
  installCopilotGlobalPlugin,
  installCodexGlobalPlugin,
} from "../installers/plugin-installers.js";
import { defaultCopilotSettingsPath } from "../installers/copilot-settings.js";
import {
  applyLifecyclePlan,
  planGlobalUninstall,
  planRepositoryDisable,
  verifyGlobalUninstall,
  verifyRepositoryDisabled,
} from "../lifecycle/operations.js";
import { printGeneralStatus, printLifecycleResult } from "../lifecycle/presentation.js";
import { createLifecycleResult, createOperationStatus, globalInstallRestartAction, lifecycleFailure } from "../lifecycle/result.js";
import { prepareInstallConsent, persistInstallConsent, retainCurrentInstallConsent, runtimeCheckStatus, setRuntimeChecksManual } from "../runtime-check-consent/service.js";
import { observeCodexHooks } from "../runtime-check-consent/codex-hooks.js";
import { projectCodexHookObservation } from "../runtime-check-consent/adapters.js";
import { evaluateStatusOverview, inspectGlobalInstallationStatus } from "../lifecycle/status.js";
import { generatedFilesForTarget } from "../scaffold/plan.js";
import { initializeCanonicalControl } from "../scaffold/canonical-init.js";
import { printNextSteps } from "../scaffold/presentation.js";
import { assertGeneratedWritePlan, writeGeneratedFile } from "../scaffold/write.js";
import { renderUsage, resolveCommand, validateCommandOptions } from "./command-registry.js";
import { CliUsageError, parseArgs } from "./parse-args.js";
import { pluginDefinition } from "./runtime-context.js";
import { createValidationHandlers } from "./validation-handlers.js";
import { printMcpLifecycleResult, runMcpLifecycle } from "../mcp-lifecycle/service.js";
import { promptInstallScope, promptInstallSetup } from "../install-setup/interaction.js";
import {
  printInstallSetupResult,
  renderInstallProgress,
  renderRuntimeCheckConsentDetails,
  renderRuntimeCheckConsentDisclosure,
  runtimeCheckInteractionCopy,
} from "../install-setup/presentation.js";
import { runInstallSetup } from "../install-setup/service.js";

function createHandlers({
  io,
  env,
  exec,
  packagedCopilotExec,
  prepare,
  openCodePackageSource,
  copilotSettingsPath,
  askInstallSetupDecision,
  askInstallSetupScope,
  askRuntimeCheckDecision,
  inspectPluginInstallation,
  interactive,
  observeCodexHookTrust = observeCodexHooks,
  evaluateStatus = evaluateStatusOverview,
  evaluateOpenCodeGlobal = evaluateOpenCodeGlobalStatus,
  evaluateOpenCodeRepository = evaluateOpenCodeStatus,
  installOpenCodePackage = installOpenCodeGlobalPlugin,
  installOpenCodeSurface = installOpenCodeGlobalSurface,
  mcpLifecycle = runMcpLifecycle,
}) {
  const installerAdapters = {
    ...(exec ? { exec } : {}),
    ...(packagedCopilotExec ? { packagedCopilotExec } : {}),
    ...(prepare ? { prepare } : {}),
    copilotSettingsPath: copilotSettingsPath ?? defaultCopilotSettingsPath({ env }),
    ...(env.AGDF_DATA_DIR ? { dataRoot: env.AGDF_DATA_DIR } : {}),
  };
  const scaffoldHandler = (options) => runScaffold(options, io);
  const observeRuntimeChecks = async (surface, state, cwd) => {
    if (surface !== "codex" || state.requested !== "enabled" || state.effective !== "decision_required") return state;
    const observation = await observeCodexHookTrust({ cwd, env });
    return projectCodexHookObservation(state, observation);
  };
  const guidedInstall = (options) => runGuidedInstall(options, {
    io,
    env,
    interactive,
    installerAdapters,
    openCodePackageSource,
    askInstallSetupDecision,
    askInstallSetupScope,
    askRuntimeCheckDecision,
    observeRuntimeChecks,
    evaluateOpenCodeGlobal,
    installOpenCodePackage,
    installOpenCodeSurface,
    mcpLifecycle,
    exec,
    inspectPluginInstallation,
  });
  return new Map([
    ...createValidationHandlers(io),
    ["codex-repo", scaffoldHandler],
    ["opencode-repo", scaffoldHandler],
    ["init", scaffoldHandler],
    ["config", scaffoldHandler],
    ["run-create", (options) => {
      try {
        io.log(createRun(options.dir, options.runId));
        return 0;
      } catch (error) {
        io.error(error instanceof Error ? error.message : String(error));
        return 1;
      }
    }],
    ["run-migrate", (options) => {
      io.log(JSON.stringify(migrateLegacy(options.dir, options.runId), null, 2));
      return 0;
    }],
    ["run-render-legacy", (options) => {
      const selected = resolveRuns(options.dir, { runIdArg: options.runId });
      const output = join(options.dir, ".agdf", "control", "AGDF_RUN.md");
      writeLegacyProjection(output, selected.run.path);
      io.log(output);
      return 0;
    }],
    ["opencode-status", (options) => {
      const configDir = env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir();
      const rawReport = options.dirExplicit
        ? evaluateOpenCodeRepository(options.dir, configDir)
        : evaluateOpenCodeGlobal(configDir);
      const installationEnvelope = installationEnvelopeForOpenCode(rawReport, configDir);
      const report = options.dirExplicit
        ? {
            ...withOpenCodeRepositoryStatusEnvelope(rawReport, options.dir),
            installation_status: installationEnvelope.installation_status,
          }
        : {
            ...rawReport,
            ...installationEnvelope,
          };
      printOpenCodeStatus(report, options.json, io);
      return report.installation_status === "healthy" ? 0 : 1;
    }],
    ["status", async (options) => {
      let report = evaluateStatus({
        ...options,
        targetDir: options.dirExplicit ? options.dir : null,
        configDir: env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir(),
        dataRoot: env.AGDF_DATA_DIR,
      }, { exec });
      const runtimeChecks = await observeRuntimeChecks(report.installation.surface, report.runtime_checks, options.dir);
      let mcp = { status: "not_checked", authorizes: false };
      if (options.dirExplicit && ["codex", "claude", "copilot", "opencode"].includes(options.surface)) {
        mcp = mcpLifecycle({
          action: "status",
          surface: options.surface,
          scope: options.scope ?? "project",
          target: options.dir,
          env,
          exec,
        });
      }
      report = { ...report, runtime_checks: runtimeChecks, mcp };
      printGeneralStatus(report, { json: options.json, io });
      return report.installation.status === "healthy" ? 0 : 1;
    }],
    ["runtime-checks", async (options) => {
      let runtimeState = options.runtimeChecksAction === "manual"
        ? setRuntimeChecksManual({ dataRoot: env.AGDF_DATA_DIR, surface: options.surface })
        : runtimeCheckStatus(env.AGDF_DATA_DIR, options.surface);
      runtimeState = await observeRuntimeChecks(options.surface, runtimeState, options.dir);
      const nextActionText = options.runtimeChecksAction === "enable"
        ? `Rerun npx --yes @agdf/cli@latest ${options.surface} --runtime-checks ${options.runtimeChecksAction}; installation ownership and capability identity are revalidated before consent is persisted.`
        : runtimeState.next_action || (runtimeState.effective === "manual" || runtimeState.effective === "enabled"
          ? "No further runtime-check action is required."
          : `Review the runtime-check state, then rerun runtime-checks for ${options.surface}.`);
      const report = {
        schema_version: 1,
        ...runtimeState,
        operation_status: createOperationStatus({
          operationId: "runtime.checks",
          outcome: options.runtimeChecksAction === "manual" ? "succeeded" : "reported",
          targetScope: "global",
          plannedEffect: options.runtimeChecksAction === "manual" ? "set_runtime_checks_manual" : "read_only_status",
          excludedAuthority: ["target_inference", "run_creation", "gate_approval", "delivery_mutation"],
        }),
        next_action: { kind: "runtime_checks", text: nextActionText },
      };
      io.log(options.json ? JSON.stringify(report, null, 2) : [
        "AGDF automatic runtime checks",
        `Operation: ${report.operation_status.operation_id}`,
        `Outcome: ${report.operation_status.outcome}`,
        `Requested: ${report.requested}`,
        `Effective: ${report.effective}`,
        `Reason: ${report.reason}`,
        `Next action: ${report.next_action.text}`,
      ].join("\n"));
      return report.effective === "enabled" || report.effective === "manual" ? 0 : 1;
    }],
    ["mcp", (options) => {
      const report = mcpLifecycle({
        action: options.mcpAction,
        surface: options.surface,
        scope: options.scope ?? "project",
        target: options.dir,
        env,
        exec,
      });
      printMcpLifecycleResult(report, { json: options.json, io, language: options.language?.chat_language ?? "en" });
      return ["failed", "degraded"].includes(report.result)
        || ["manual_compatible", "unavailable", "unsupported"].includes(report.capability) ? 1 : 0;
    }],
    ["disable", (options) => options.setupRequest === "full"
      ? runCoupledDisable(options, { io, env, exec, mcpLifecycle })
      : runDisable(options, { io, exec })],
    ["uninstall", (options) => options.setupRequest === "full"
      ? runCoupledUninstall(options, { io, env, exec, mcpLifecycle })
      : runUninstall(options, { io, env, exec })],
    ["codex", guidedInstall],
    ["claude", guidedInstall],
    ["copilot", guidedInstall],
    ["opencode", guidedInstall],
  ]);
}

function pluginInstallFailure(surface, error) {
  return lifecycleFailure({
    operation: "install",
    surface,
    scope: "global",
    phase: error.phase || "plugin_operation",
    message: error.message,
    evidence: [error.evidence ?? {}],
    nextAction: `Resolve the ${error.phase || "plugin operation"} failure and retry the same installation command.`,
  });
}

function copilotInstallReport(installed, runtimeChecks) {
  if (installed.declarativeConfigured) {
    return createLifecycleResult({
      operation: "install", result: "partial", surface: "copilot", scope: "global",
      version: { expected: installed.expectedVersion, installed: null, status: "unknown" },
      verification: { status: "configured_pending_restart", evidence: installed.evidence },
      installation: { status: "configured_pending_restart" },
      activation: { status: "pending_restart" },
      runtime_checks: runtimeChecks,
      restart: { required: true, reason: "host_reload" },
      next_action: { kind: "restart", text: "Restart GitHub Copilot. Then verify AGDF in Plugins and the agdf- skills in a fresh session." },
    });
  }
  if (installed.manualHandoff) {
    return createLifecycleResult({
      operation: "install", result: "partial", surface: "copilot", scope: "global",
      version: { expected: installed.expectedVersion, installed: null, status: "unknown" },
      verification: { status: "unavailable", evidence: installed.evidence },
      installation: { status: "not_verified" },
      activation: { status: "not_verified" },
      runtime_checks: runtimeChecks,
      restart: { required: false, reason: "none" },
      next_action: { kind: "manual_install", text: "Install the Copilot CLI, then retry the AGDF Copilot installer. The prepared package is retained." },
      failure: { phase: "executable", message: "Copilot CLI was not available; no plugin installation was performed." },
    });
  }
  return installResult(installed, {
    restartRequired: true,
    nextAction: globalInstallRestartAction("copilot").text,
    runtimeChecks,
    consentFailure: null,
  });
}

function installOpenCodePluginPayload(configDir, consent, {
  openCodePackageSource,
  installOpenCodePackage,
  installOpenCodeSurface,
  evaluateOpenCodeGlobal,
}) {
  const installedPackage = runLifecyclePhase("plugin_operation", () => installOpenCodePackage(configDir, { packageSource: openCodePackageSource }));
  runLifecyclePhase("global_surface", () => installOpenCodeSurface(configDir));
  const globalReport = runLifecyclePhase("verification", () => evaluateOpenCodeGlobal(configDir));
  const report = {
    ...globalReport,
    package: { ...globalReport.package, transition: installedPackage.transition },
  };
  const alignmentHealthy = ["already_matching", "aligned"].includes(installedPackage.sdk_alignment.status);
  const verificationHealthy = report.status === "configured"
    && report.package.version_status === "current"
    && report.global_native_surface.complete
    && report.experimental_hooks.aggregate === "declared_supported"
    && report.host_sdk_version.status === "matching"
    && alignmentHealthy;
  const nextAction = verificationHealthy
    ? globalInstallRestartAction("opencode")
    : {
        kind: "recovery",
        text: `Retry the OpenCode installation to align @opencode-ai/plugin to ${installedPackage.sdk_alignment.target_version || "the exact host version"}; observed SDK: ${installedPackage.sdk_alignment.installed_version || "unknown"}.`,
      };
  const lifecycleReport = createLifecycleResult({
    operation: installedPackage.transition.status === "updated" ? "update" : "install",
    result: verificationHealthy ? "success" : "partial",
    surface: "opencode",
    scope: "global",
    version: {
      expected: report.package.expected_version,
      installed: report.package.installed_version,
      previous: installedPackage.transition.previous_version,
      status: report.package.version_status === "current" ? "verified" : "unknown",
      transition: installedPackage.transition.status,
    },
    verification: {
      status: verificationHealthy ? "healthy" : "degraded",
      evidence: [
        report.global_config.path,
        report.global_native_surface.path,
        `opencode_host=${report.host.installed_version || "unknown"}`,
        `plugin_sdk=${report.plugin_sdk.installed_version || "unknown"}`,
        `experimental_hooks=${report.experimental_hooks.aggregate}`,
        `host_sdk_version=${report.host_sdk_version.status};policy=${report.host_sdk_version.policy}`,
        `sdk_alignment=${installedPackage.sdk_alignment.status};target=${installedPackage.sdk_alignment.target_version || "unknown"};installed=${installedPackage.sdk_alignment.installed_version || "unknown"}`,
        `package_source=${installedPackage.package_source.kind}${installedPackage.package_source.digest ? `;digest=${installedPackage.package_source.digest}` : ""}`,
      ],
    },
    restart: { required: true, reason: "host_reload" },
    runtime_checks: consent.state,
    next_action: nextAction,
  });
  return {
    report: lifecycleReport,
    installed: {
      pluginRoot: installedPackage.installed_package.root,
      digest: installedPackage.installed_package.digest,
      sourceDigest: installedPackage.package_source.digest || installedPackage.installed_package.digest,
    },
    native: installedPackage,
    openCodeReport: report,
  };
}

function installPluginPayload(surface, options, consent, pluginConfiguration, dependencies) {
  printInstallProgress(surface, options, dependencies.io, dependencies.interactive);
  if (surface === "opencode") {
    return installOpenCodePluginPayload(pluginConfiguration, consent, dependencies);
  }
  const installed = surface === "codex"
    ? installCodexGlobalPlugin(dependencies.installerAdapters)
    : surface === "claude"
      ? installClaudeGlobalPlugin(dependencies.installerAdapters)
      : installCopilotGlobalPlugin(dependencies.installerAdapters);
  const report = surface === "copilot"
    ? copilotInstallReport(installed, consent.state)
    : installResult(installed, {
        restartRequired: true,
        nextAction: globalInstallRestartAction(surface).text,
        runtimeChecks: consent.state,
        consentFailure: null,
      });
  return { report, installed };
}

function printOpenCodeVerbose(payload, options, io) {
  if (!options.verbose || options.json || !payload?.openCodeReport) return;
  const report = payload.openCodeReport;
  const installed = payload.native;
  io.log(`OpenCode host / plugin SDK: ${report.host.installed_version || "unknown"} / ${report.plugin_sdk.installed_version || "unknown"} (${report.host_sdk_version.status}; ${report.host_sdk_version.policy})`);
  io.log(`Plugin SDK alignment: ${installed.sdk_alignment.status} (target ${installed.sdk_alignment.target_version || "unknown"}; installed ${installed.sdk_alignment.installed_version || "unknown"})`);
  io.log(`Experimental hook declarations: ${report.experimental_hooks.aggregate} (SDK declaration evidence; live invocation not observed)`);
}

async function runGuidedInstall(options, dependencies) {
  const language = options.language?.chat_language ?? "en";
  try {
    const outcome = await runInstallSetup({ options, interactive: dependencies.interactive, env: dependencies.env }, {
      exec: dependencies.exec,
      inspectPlugin: dependencies.inspectPluginInstallation,
      mcpLifecycle: dependencies.mcpLifecycle,
      chooseSetup: dependencies.askInstallSetupDecision
        ? (preflight) => dependencies.askInstallSetupDecision(preflight)
        : (preflight) => promptInstallSetup(preflight, { language }),
      chooseScope: dependencies.askInstallSetupScope
        ? (preflight) => dependencies.askInstallSetupScope(preflight)
        : (preflight) => promptInstallScope(preflight, { language }),
      prepareRuntimeChecks: (surface, currentOptions) => installConsentDecision(surface, currentOptions, {
        io: dependencies.io,
        askRuntimeCheckDecision: dependencies.askRuntimeCheckDecision,
        interactive: dependencies.interactive,
        dataRoot: dependencies.installerAdapters.dataRoot,
        language,
      }),
      installPlugin: ({ surface, options: currentOptions, plugin_configuration: pluginConfiguration, consent }) =>
        installPluginPayload(surface, currentOptions, consent, pluginConfiguration, dependencies),
      createPluginFailure: (error) => pluginInstallFailure(options.target, error),
      finalizeRuntimeChecks: async (consent, payload) => {
        const finalized = finalizeInstallConsent(consent, {
          surface: options.target,
          installed: payload.installed,
          dataRoot: dependencies.installerAdapters.dataRoot,
        });
        if (options.target === "codex") {
          finalized.state = await dependencies.observeRuntimeChecks("codex", finalized.state, options.dir);
        }
        return finalized;
      },
    });
    printInstallSetupResult(outcome.report, { json: options.json, io: dependencies.io, language });
    printVerboseHostOutput(outcome.plugin_payload?.installed ?? {}, options, dependencies.io);
    printOpenCodeVerbose(outcome.plugin_payload, options, dependencies.io);
    return ["failed", "partial"].includes(outcome.report.result) ? 1 : 0;
  } catch (error) {
    dependencies.io.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function runLifecyclePhase(phase, operation) {
  try {
    return operation();
  } catch (error) {
    if (!error.phase) error.phase = phase;
    if (!error.evidence) error.evidence = {};
    throw error;
  }
}

function withOpenCodeRepositoryStatusEnvelope(report, target) {
  return Object.freeze({
    ...report,
    operation_status: createOperationStatus({
      operationId: "status.opencode_repository",
      outcome: "reported",
      targetScope: "repository",
      target,
      plannedEffect: "read_only_status",
      excludedAuthority: ["target_inference", "run_creation", "gate_approval", "mutation"],
    }),
    next_action: {
      kind: "action",
      text: report.next_step || "Review the reported OpenCode status.",
    },
  });
}

function installationEnvelopeForOpenCode(report, configDir) {
  const canonical = inspectGlobalInstallationStatus(
    { surface: "opencode", configDir },
    { evaluateOpenCodeGlobalStatus: () => report },
  );
  return {
    installation_status: canonical.status,
    operation_status: canonical.operation_status,
    next_action: canonical.next_action,
  };
}

function installNextAction(surface, runtimeChecks, fallback) {
  if (surface === "codex" && runtimeChecks.requested === "enabled" && runtimeChecks.effective === "decision_required") {
    return `${fallback} ${runtimeChecks.next_action}`;
  }
  if (surface === "copilot" && runtimeChecks.requested === "enabled" && runtimeChecks.effective === "decision_required") {
    return `${fallback} Review the AGDF session hook when the fresh Copilot session asks.`;
  }
  return fallback;
}

function installResult(installed, { restartRequired, nextAction, runtimeChecks, consentFailure }) {
  return createLifecycleResult({
    operation: installed.operation ?? "install",
    result: consentFailure ? "partial" : "success",
    surface: installed.surface,
    scope: "global",
    version: { expected: installed.expectedVersion, installed: installed.installedVersion, status: installed.installedVersion ? "verified" : "unknown" },
    verification: { status: installed.verificationStatus, evidence: installed.evidence },
    installation: { status: installed.verificationStatus },
    activation: { status: restartRequired ? "pending_restart" : "active" },
    delivery: { status: "not_evaluated" },
    runtime_checks: runtimeChecks,
    restart: { required: restartRequired, reason: restartRequired ? "host_reload" : "none" },
    next_action: { kind: restartRequired ? "restart" : "prompt", text: nextAction },
    failure: consentFailure,
  });
}

function finalizeInstallConsent(consent, input) {
  if (!consent.persist) return {
    state: consent.retained && consent.decision === "enable"
      ? { requested: "enabled", effective: "decision_required", reason: "host_permission_unverified" }
      : { requested: "manual", effective: "manual", reason: "consent_not_provided" },
    failure: null,
  };
  try {
    return { state: persistInstallConsent({ ...input, decision: consent.decision }), failure: null };
  } catch (error) {
    return {
      state: { requested: consent.decision === "enable" ? "enabled" : "manual", effective: "failed", reason: "configuration_invalid" },
      failure: { phase: "runtime_check_permission", message: error.message },
    };
  }
}

async function installConsentDecision(surface, options, { io, askRuntimeCheckDecision, interactive, dataRoot, language = "en" }) {
  if (options.runtimeChecksDecision !== undefined) return prepareInstallConsent(surface, options);
  if (!interactive || options.json || typeof askRuntimeCheckDecision !== "function") {
    return prepareInstallConsent(surface, options);
  }
  const retained = retainCurrentInstallConsent(surface, dataRoot);
  const disclosure = prepareInstallConsent(surface, { ...options, runtimeChecksDecision: "manual" }).disclosure;
  printInstallConsentDisclosure(disclosure, retained, io, language);
  const answer = await askRuntimeCheckDecision(disclosure, { language });
  return prepareInstallConsent(surface, { ...options, runtimeChecksDecision: answer });
}

function printInstallConsentDisclosure(disclosure, retained, io, language = "en") {
  for (const line of renderRuntimeCheckConsentDisclosure(disclosure, {
    retained,
    version: pluginDefinition.version,
    language,
  })) io.log(line);
}

function installSurfaceLabel(surface) {
  if (surface === "claude") return "Claude Code";
  if (surface === "copilot") return "GitHub Copilot";
  if (surface === "opencode") return "OpenCode";
  return "Codex";
}

function printInstallProgress(surface, options, io, interactive) {
  if (!interactive || options.json) return;
  io.log("");
  io.log(renderInstallProgress(surface, pluginDefinition.version, { language: options.language?.chat_language ?? "en" }));
}

function installConsentTechnicalDetails(disclosure, language = "en") {
  return renderRuntimeCheckConsentDetails(disclosure, { language });
}

function printCancelledConsent(surface, options, io) {
  const report = createLifecycleResult({
    operation: "install", result: "preview", surface, scope: "global",
    verification: { status: "unknown", evidence: ["cancelled_before_mutation"] },
    runtime_checks: { requested: "cancelled", effective: "cancelled", reason: "consent_not_provided" },
    restart: { required: false },
    next_action: { kind: "none", text: "Installation was cancelled before any plugin or permission mutation." },
  });
  printLifecycleResult(report, { json: options.json, compact: true, io });
  return 0;
}

function printVerboseHostOutput(installed, options, io) {
  if (!options.verbose || options.json || !installed.nativeOutput?.length) return;
  io.log("Host command output:");
  for (const output of installed.nativeOutput) io.log(output);
}

function printInstallFailure(surface, error, options, io, command = surface) {
  const report = lifecycleFailure({
    operation: "install",
    surface,
    scope: "global",
    phase: error.phase || "plugin_operation",
    message: error.message,
    evidence: [error.evidence ?? {}],
    nextAction: `Resolve the ${error.phase || "plugin operation"} failure and rerun npx --yes @agdf/cli@latest ${command}.`,
  });
  if (options.json) printLifecycleResult(report, { json: true, io });
  else {
    io.error(error.message);
    printLifecycleResult(report, { io });
  }
}

function createCoupledLifecycleResult({ operation, result, surface, target, mcpScope, plugin, mcp, nextAction }) {
  if (!new Set(["coupled_disable", "coupled_uninstall"]).has(operation)
      || !new Set(["success", "partial", "failed", "preview"]).has(result)
      || !["codex", "claude", "copilot", "opencode"].includes(surface)
      || !["project", "user"].includes(mcpScope)
      || typeof target !== "string" || !isAbsolute(target)
      || !plugin || !mcp || typeof nextAction?.code !== "string" || typeof nextAction?.text !== "string") {
    throw new Error("AGDF_COUPLED_LIFECYCLE_RESULT_INVALID");
  }
  return Object.freeze({
    schema_version: 1,
    contract_version: 1,
    operation,
    result,
    surface,
    target,
    plugin_scope: operation === "coupled_disable" ? "repository" : "global",
    mcp_scope: mcpScope,
    plugin,
    mcp,
    next_action: Object.freeze({ code: nextAction.code, text: nextAction.text }),
    authorizes: false,
  });
}

function printCoupledLifecycleResult(report, { json, io }) {
  if (json) {
    io.log(JSON.stringify(report, null, 2));
    return;
  }
  io.log(report.operation === "coupled_disable" ? "AGDF plugin and MCP disable" : "AGDF plugin and MCP uninstall");
  io.log(`Result: ${report.result}`);
  io.log(`Surface: ${report.surface}`);
  io.log(`Target: ${report.target}`);
  io.log(`MCP scope: ${report.mcp_scope}`);
  io.log(`MCP: ${report.mcp.result ?? report.mcp.status}`);
  io.log(`Plugin: ${report.plugin.result ?? report.plugin.status}`);
  io.log(`Authorizes: ${report.authorizes}`);
  io.log(`Next action: ${report.next_action.text}`);
}

function inspectCoupledMcp(options, { env, exec, mcpLifecycle }, scope) {
  return mcpLifecycle({ action: "status", surface: options.surface, scope, target: options.dir, env, exec });
}

function mcpPreflightBlocked(report) {
  return report.result === "failed"
    || ["foreign", "precedence_conflict", "invalid"].includes(report.registration?.status);
}

function mcpDisableSucceeded(report) {
  return ["disabled", "unchanged"].includes(report.result);
}

function coupledPreflightFailure(operation, options, scope, mcp) {
  return createCoupledLifecycleResult({
    operation,
    result: "failed",
    surface: options.surface,
    target: options.dir,
    mcpScope: scope,
    plugin: { status: "not_run" },
    mcp,
    nextAction: {
      code: "resolve_mcp_registration",
      text: "Resolve the reported MCP ownership or precedence conflict before retrying.",
    },
  });
}

function runCoupledDisable(options, dependencies) {
  const scope = "project";
  try {
    const before = inspectCoupledMcp(options, dependencies, scope);
    if (mcpPreflightBlocked(before)) {
      const report = coupledPreflightFailure("coupled_disable", options, scope, before);
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 1;
    }
    const mcp = dependencies.mcpLifecycle({
      action: "disable", surface: options.surface, scope, target: options.dir,
      env: dependencies.env, exec: dependencies.exec,
    });
    if (!mcpDisableSucceeded(mcp)) {
      const report = createCoupledLifecycleResult({
        operation: "coupled_disable", result: "failed", surface: options.surface, target: options.dir,
        mcpScope: scope, plugin: { status: "not_run" }, mcp,
        nextAction: { code: "retry_mcp_disable", text: "Resolve the MCP disable failure before changing the repository plugin state." },
      });
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 1;
    }
    const plugin = executeDisable(options, dependencies);
    const result = plugin.code === 0 ? "success" : "partial";
    const report = createCoupledLifecycleResult({
      operation: "coupled_disable", result, surface: options.surface, target: options.dir,
      mcpScope: scope, plugin: plugin.report, mcp,
      nextAction: result === "success"
        ? { code: "restart_host", text: "Restart the host and verify that the repository plugin and project MCP registration are disabled." }
        : { code: "retry_plugin_disable", text: "MCP is disabled. Resolve the repository plugin disable failure without re-enabling MCP." },
    });
    printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
    return result === "success" ? 0 : 1;
  } catch (error) {
    dependencies.io.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function runCoupledUninstall(options, dependencies) {
  const scope = options.mcpScope;
  try {
    const before = inspectCoupledMcp(options, dependencies, scope);
    if (mcpPreflightBlocked(before)) {
      const report = coupledPreflightFailure("coupled_uninstall", options, scope, before);
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 1;
    }
    if (!options.confirm) {
      const plugin = executeUninstall(options, dependencies);
      const report = createCoupledLifecycleResult({
        operation: "coupled_uninstall", result: "preview", surface: options.surface, target: options.dir,
        mcpScope: scope, plugin: plugin.report, mcp: before,
        nextAction: { code: "confirm", text: "Review both plans, then rerun the same command with --confirm. Both owners revalidate before mutation." },
      });
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 0;
    }
    const revalidated = inspectCoupledMcp(options, dependencies, scope);
    if (mcpPreflightBlocked(revalidated)) {
      const report = coupledPreflightFailure("coupled_uninstall", options, scope, revalidated);
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 1;
    }
    const mcp = dependencies.mcpLifecycle({
      action: "disable", surface: options.surface, scope, target: options.dir,
      env: dependencies.env, exec: dependencies.exec,
    });
    if (!mcpDisableSucceeded(mcp)) {
      const report = createCoupledLifecycleResult({
        operation: "coupled_uninstall", result: "failed", surface: options.surface, target: options.dir,
        mcpScope: scope, plugin: { status: "not_run" }, mcp,
        nextAction: { code: "retry_mcp_disable", text: "Resolve the MCP disable failure before uninstalling the plugin." },
      });
      printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
      return 1;
    }
    const plugin = executeUninstall(options, dependencies);
    const result = plugin.code === 0 ? "success" : "partial";
    const report = createCoupledLifecycleResult({
      operation: "coupled_uninstall", result, surface: options.surface, target: options.dir,
      mcpScope: scope, plugin: plugin.report, mcp,
      nextAction: result === "success"
        ? { code: "restart_host", text: "Restart the host and verify that AGDF plugin and selected MCP registration are absent." }
        : { code: "retry_plugin_uninstall", text: "MCP is disabled. Resolve the plugin uninstall failure without recreating the MCP registration." },
    });
    printCoupledLifecycleResult(report, { json: options.json, io: dependencies.io });
    return result === "success" ? 0 : 1;
  } catch (error) {
    dependencies.io.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function executeDisable(options, { exec }) {
  try {
    const plan = planRepositoryDisable(options.dir, options.surface, { shared: options.shared, exec });
    const applied = applyLifecyclePlan(plan, exec ? { exec } : {});
    const verified = applied.status === "success"
      ? verifyRepositoryDisabled(options.dir, options.surface, { shared: options.shared })
      : { status: "failed", evidence: [] };
    const result = applied.status === "success" && verified.status !== "healthy" ? "failed" : applied.status;
    const report = createLifecycleResult({
      operation: "disable",
      result,
      surface: options.surface,
      scope: "repository",
      target: options.dir,
      verification: { status: verified.status === "healthy" ? "healthy" : "degraded", evidence: [...applied.completed.map((item) => item.path || item.executable), ...verified.evidence] },
      activation: { status: result === "success" ? "pending_restart" : "unknown" },
      restart: { required: result === "success", reason: result === "success" ? "host_reload" : "none" },
      next_action: result === "success"
        ? options.surface === "copilot"
          ? { kind: "restart", text: "Restart GitHub Copilot in this repository, then inspect /plugin list; independent instructions remain separate." }
          : { kind: "restart", text: "Restart the host in this repository; global AGDF availability and .agdf/control are retained." }
        : { kind: "verify", text: "Inspect the reported repository configuration failure before retrying disable." },
      changes: applied.completed,
      retained: applied.retained,
      failure: applied.error
        ? { phase: "repository_configuration", message: applied.error.message }
        : result === "failed" ? { phase: "verification", message: "Repository disable postcondition was not observed." } : null,
    });
    return { report, code: result === "success" ? 0 : 1 };
  } catch (error) {
    const report = lifecycleFailure({
      operation: "disable",
      surface: options.surface,
      scope: "repository",
      target: options.dir,
      phase: "repository_preflight",
      message: error.message,
      evidence: [error.message],
      nextAction: "Resolve the reported repository configuration or ignore precondition, then retry disable without changing unrelated files.",
    });
    return { report, code: 1, error };
  }
}

function runDisable(options, { io, exec }) {
  const outcome = executeDisable(options, { exec });
  if (outcome.error && !options.json) io.error(outcome.error.message);
  printLifecycleResult(outcome.report, { json: options.json, io });
  return outcome.code;
}

function executeUninstall(options, { env, exec }) {
  try {
    const configDir = env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir();
    const plan = planGlobalUninstall(options.surface, { configDir });
    if (!options.confirm) {
      const preview = createLifecycleResult({
        operation: "uninstall", result: "preview", surface: options.surface, scope: "global",
        verification: { status: "unknown", evidence: ["non_mutating_preview"] },
        restart: { required: false },
        next_action: { kind: "confirm", text: `Review this preview, then rerun with --surface ${options.surface} --scope global --confirm; ownership is revalidated before apply.` },
        changes: plan.mutations, retained: plan.retained,
      });
      return { report: preview, code: 0 };
    }
    const applied = applyLifecyclePlan(plan, exec ? { exec } : {});
    const verified = applied.status === "success"
      ? verifyGlobalUninstall(plan, options.dir, { configDir, exec })
      : { status: "failed", evidence: [] };
    const result = applied.status === "success" && verified.status !== "healthy" ? "failed" : applied.status;
    const report = createLifecycleResult({
      operation: "uninstall", result, surface: options.surface, scope: "global",
      verification: { status: verified.status === "healthy" ? "healthy" : "degraded", evidence: [...applied.completed.map((item) => item.path || item.executable), ...verified.evidence] },
      restart: { required: result === "success", reason: result === "success" ? "host_reload" : "none" },
      next_action: result === "success"
        ? { kind: "restart", text: "Restart the host; the uninstall postcondition has already been verified." }
        : { kind: "verify", text: "Inspect the reported uninstall or verification failure before retrying." },
      changes: applied.completed, retained: applied.retained,
      failure: applied.error
        ? { phase: "plugin_operation", message: applied.error.message }
        : result === "failed" ? { phase: "verification", message: "Global uninstall postcondition was not observed." } : null,
    });
    return { report, code: result === "success" ? 0 : 1 };
  } catch (error) {
    const report = lifecycleFailure({
      operation: "uninstall",
      surface: options.surface,
      scope: "global",
      phase: error.phase || "uninstall_preflight",
      message: error.message,
      evidence: [error.evidence ?? error.message],
      nextAction: "Resolve the reported global uninstall precondition, then rerun the uninstall preview before applying changes.",
    });
    return { report, code: 1, error };
  }
}

function runUninstall(options, { io, env, exec }) {
  const outcome = executeUninstall(options, { env, exec });
  if (outcome.error && !options.json) io.error(outcome.error.message);
  printLifecycleResult(outcome.report, { json: options.json, io });
  return outcome.code;
}

function runScaffold(options, io) {
  let files = [];
  let removedOpenCodeAgents = [];
  let initialization = null;

  try {
    files = generatedFilesForTarget(options.target, options.dir, options.force, options.language);
    if (options.target === "init") {
      initialization = initializeCanonicalControl(options.dir, files, { force: options.force });
      files = [...initialization.files];
    } else {
      assertGeneratedWritePlan(options.dir, files, options.force);
      for (const file of files) {
        writeGeneratedFile(options.dir, file.path, file.content, options.force, file.allowOverwrite);
      }
    }
    // Legacy OpenCode assets are intentionally preserved. A future explicit migration command
    // may remove only ownership-proven files after its precedence behavior is verified.
  } catch (error) {
    const repositorySurface = { "codex-repo": "codex", "opencode-repo": "opencode" }[options.target];
    if (options.target === "init" || repositorySurface) {
      const report = lifecycleFailure({
        operation: options.target === "init" ? "control_init" : "repository_setup",
        surface: repositorySurface ?? "generic",
        scope: "repository",
        target: options.dir,
        phase: options.target === "init" ? "canonical_control_setup" : "repository_setup",
        message: error.message,
        evidence: [error.message],
        nextAction: "Resolve the reported repository setup conflict, then retry with the same explicit target.",
      });
      if (options.json) printLifecycleResult(report, { json: true, io });
      else {
        io.error(error.message);
        printLifecycleResult(report, { io });
      }
    } else {
      io.error(error.message);
    }
    return 1;
  }

  printNextSteps(options.target, options.dir, files, removedOpenCodeAgents, {
    verbose: options.verbose,
    json: options.json,
    io,
    initialization,
  });
  return 0;
}

export async function runCli(argv = process.argv.slice(2), adapters = {}) {
  const io = adapters.io ?? console;
  const env = adapters.env ?? process.env;
  if (argv.includes("--version")) {
    const output = { name: "create-agdf", version: pluginDefinition.version };
    io.log(argv.includes("--json") ? JSON.stringify(output) : output.version);
    return 0;
  }
  let parsed;
  try {
    parsed = parseArgs(argv, adapters.parser);
  } catch (error) {
    if (!(error instanceof CliUsageError)) throw error;
    io.error(error.message);
    if (error.showUsage) io.log(renderUsage());
    return error.exitCode;
  }

  if (parsed.kind === "help") {
    io.log(renderUsage());
    return 0;
  }

  let options;
  try {
    options = validateCommandOptions(parsed.options);
  } catch (error) {
    io.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  const command = resolveCommand(options.target);
  if (!command) throw new Error(`No handler is registered for ${options.target}.`);
  const handler = createHandlers({
    io,
    env,
    exec: adapters.exec,
    packagedCopilotExec: adapters.packagedCopilotExec,
    prepare: adapters.prepare,
    openCodePackageSource: adapters.openCodePackageSource,
    copilotSettingsPath: adapters.copilotSettingsPath,
    askRuntimeCheckDecision: adapters.askRuntimeCheckDecision ?? defaultAskRuntimeCheckDecision,
    askInstallSetupDecision: adapters.askInstallSetupDecision,
    askInstallSetupScope: adapters.askInstallSetupScope,
    inspectPluginInstallation: adapters.inspectPluginInstallation,
    interactive: adapters.interactive ?? (Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)),
    observeCodexHookTrust: adapters.observeCodexHookTrust,
    evaluateStatus: adapters.evaluateStatusOverview,
    evaluateOpenCodeGlobal: adapters.evaluateOpenCodeGlobalStatus,
    evaluateOpenCodeRepository: adapters.evaluateOpenCodeStatus,
    installOpenCodePackage: adapters.installOpenCodeGlobalPlugin,
    installOpenCodeSurface: adapters.installOpenCodeGlobalSurface,
    mcpLifecycle: adapters.mcpLifecycle,
  }).get(command.handler);
  if (!handler) throw new Error(`No implementation is registered for ${command.name}.`);
  return await handler(options);
}

export const main = runCli;

async function defaultAskRuntimeCheckDecision(disclosure, { language = "en" } = {}) {
  if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
    return askRuntimeCheckDecisionByKey(process.stdin, process.stdout, disclosure, { language });
  }
  const copy = runtimeCheckInteractionCopy({ language });
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = (await prompt.question(copy.linePrompt)).trim().toLowerCase();
      if (["1", "e", "enable"].includes(answer)) return "enable";
      if (["2", "m", "manual"].includes(answer)) return "manual";
      if (["d", "details"].includes(answer)) {
        for (const line of installConsentTechnicalDetails(disclosure, language)) process.stdout.write(`${line}\n`);
        continue;
      }
      if (["c", "cancel", "abbrechen"].includes(answer)) return "cancel";
      process.stdout.write(`${copy.lineInvalid}\n`);
    }
  } finally {
    prompt.close();
  }
}

export async function askRuntimeCheckDecisionByKey(input, output, disclosure, { language = "en" } = {}) {
  const copy = runtimeCheckInteractionCopy({ language });
  const wasRaw = Boolean(input.isRaw);
  emitKeypressEvents(input);
  output.write(copy.keyPrompt);
  if (!wasRaw) input.setRawMode(true);
  input.resume();

  return await new Promise((resolve) => {
    const finish = (decision) => {
      input.off("keypress", onKeypress);
      if (!wasRaw) input.setRawMode(false);
      input.pause();
      output.write(`${copy.decisionEcho[decision]}\n`);
      resolve(decision);
    };
    const onKeypress = (character, key = {}) => {
      if (key.name === "escape" || (key.ctrl && key.name === "c")) return finish("cancel");
      const choice = String(character || "").toLowerCase();
      if (["1", "e"].includes(choice)) return finish("enable");
      if (["2", "m"].includes(choice)) return finish("manual");
      if (choice === "c") return finish("cancel");
      if (choice === "d" && disclosure) {
        output.write(`${copy.detailsEcho}\n${installConsentTechnicalDetails(disclosure, language).join("\n")}${copy.keyPrompt}`);
        return;
      }
      output.write(`\n${copy.keyInvalid}\n${copy.keyPrompt}`);
    };
    input.on("keypress", onKeypress);
  });
}
