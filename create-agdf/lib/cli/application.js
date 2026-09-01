import { join } from "node:path";
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
import {
  applyLifecyclePlan,
  planGlobalUninstall,
  planRepositoryDisable,
  verifyGlobalUninstall,
  verifyRepositoryDisabled,
} from "../lifecycle/operations.js";
import { printGeneralStatus, printLifecycleResult } from "../lifecycle/presentation.js";
import { createLifecycleResult, globalInstallRestartAction, lifecycleFailure } from "../lifecycle/result.js";
import { prepareInstallConsent, persistInstallConsent, retainCurrentInstallConsent, runtimeCheckStatus, setRuntimeChecksManual } from "../runtime-check-consent/service.js";
import { evaluateGeneralStatus } from "../lifecycle/status.js";
import { generatedFilesForTarget } from "../scaffold/plan.js";
import { printNextSteps } from "../scaffold/presentation.js";
import { assertGeneratedWritePlan, writeGeneratedFile } from "../scaffold/write.js";
import { renderUsage, resolveCommand, validateCommandOptions } from "./command-registry.js";
import { CliUsageError, parseArgs } from "./parse-args.js";
import { pluginDefinition } from "./runtime-context.js";
import { createValidationHandlers } from "./validation-handlers.js";

function createHandlers({ io, env, exec, packagedCopilotExec, prepare, openCodePackageSource, copilotSettingsPath, askRuntimeCheckDecision, interactive }) {
  const installerAdapters = {
    ...(exec ? { exec } : {}),
    ...(packagedCopilotExec ? { packagedCopilotExec } : {}),
    ...(prepare ? { prepare } : {}),
    ...(copilotSettingsPath ? { copilotSettingsPath } : {}),
    ...(env.AGDF_DATA_DIR ? { dataRoot: env.AGDF_DATA_DIR } : {}),
  };
  const scaffoldHandler = (options) => runScaffold(options, io);
  return new Map([
    ...createValidationHandlers(io),
    ["codex-repo", scaffoldHandler],
    ["opencode-repo", scaffoldHandler],
    ["init", scaffoldHandler],
    ["config", scaffoldHandler],
    ["run-create", (options) => {
      io.log(createRun(options.dir, options.runId));
      return 0;
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
      const report = evaluateOpenCodeStatus(options.dir, configDir);
      printOpenCodeStatus(report, options.json, io);
      return report.status === "configured" ? 0 : 1;
    }],
    ["status", (options) => {
      const report = evaluateGeneralStatus(options.dir, {
        ...options,
        configDir: env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir(),
        dataRoot: env.AGDF_DATA_DIR,
      }, { exec });
      printGeneralStatus(report, { json: options.json, io });
      return report.installation.status === "healthy" ? 0 : 1;
    }],
    ["runtime-checks", (options) => {
      const report = options.runtimeChecksAction === "manual"
        ? setRuntimeChecksManual({ dataRoot: env.AGDF_DATA_DIR, surface: options.surface })
        : runtimeCheckStatus(env.AGDF_DATA_DIR, options.surface);
      if (options.runtimeChecksAction === "enable") {
        report.next_action = `Rerun npx --yes @agdf/cli@latest ${options.surface} --runtime-checks ${options.runtimeChecksAction}; installation ownership and capability identity are revalidated before consent is persisted.`;
      }
      io.log(options.json ? JSON.stringify(report, null, 2) : [
        "AGDF automatic runtime checks",
        `Requested: ${report.requested}`,
        `Effective: ${report.effective}`,
        `Reason: ${report.reason}`,
        ...(report.next_action ? [`Next action: ${report.next_action}`] : []),
      ].join("\n"));
      return report.effective === "enabled" || report.effective === "manual" ? 0 : 1;
    }],
    ["disable", (options) => runDisable(options, { io, exec })],
    ["uninstall", (options) => runUninstall(options, { io, env, exec })],
    ["codex", async (options) => {
      try {
        const consent = await installConsentDecision("codex", options, { io, askRuntimeCheckDecision, interactive, dataRoot: installerAdapters.dataRoot });
        if (consent.decision === "cancel") return printCancelledConsent("codex", options, io);
        printInstallProgress("codex", options, io, interactive);
        const installed = installCodexGlobalPlugin(installerAdapters);
        const finalizedConsent = finalizeInstallConsent(consent, { surface: "codex", installed, dataRoot: installerAdapters.dataRoot });
        printLifecycleResult(installResult(installed, {
          restartRequired: true,
          nextAction: installNextAction("codex", finalizedConsent.state, globalInstallRestartAction(options.target).text),
          runtimeChecks: finalizedConsent.state,
          consentFailure: finalizedConsent.failure,
        }), { json: options.json, compact: !options.verbose, io });
        printVerboseHostOutput(installed, options, io);
        return 0;
      } catch (error) {
        printInstallFailure(options.target, error, options, io);
        return 1;
      }
    }],
    ["claude", async (options) => {
      try {
        const consent = await installConsentDecision("claude", options, { io, askRuntimeCheckDecision, interactive, dataRoot: installerAdapters.dataRoot });
        if (consent.decision === "cancel") return printCancelledConsent("claude", options, io);
        printInstallProgress("claude", options, io, interactive);
        const installed = installClaudeGlobalPlugin(installerAdapters);
        const finalizedConsent = finalizeInstallConsent(consent, { surface: "claude", installed, dataRoot: installerAdapters.dataRoot });
        printLifecycleResult(installResult(installed, {
          restartRequired: true,
          nextAction: globalInstallRestartAction(options.target).text,
          runtimeChecks: finalizedConsent.state,
          consentFailure: finalizedConsent.failure,
        }), { json: options.json, compact: !options.verbose, io });
        printVerboseHostOutput(installed, options, io);
        return 0;
      } catch (error) {
        printInstallFailure(options.target, error, options, io);
        return 1;
      }
    }],
    ["copilot", async (options) => {
      const surface = "copilot";
      try {
        const consent = await installConsentDecision(surface, options, { io, askRuntimeCheckDecision, interactive, dataRoot: installerAdapters.dataRoot });
        if (consent.decision === "cancel") return printCancelledConsent(surface, options, io);
        printInstallProgress(surface, options, io, interactive);
        const installed = installCopilotGlobalPlugin({
          ...installerAdapters,
        });
        const finalizedConsent = finalizeInstallConsent(consent, { surface, installed, dataRoot: installerAdapters.dataRoot });
        if (installed.declarativeConfigured) {
          printLifecycleResult(createLifecycleResult({
            operation: "install", result: "partial", surface, scope: "global",
            version: { expected: installed.expectedVersion, installed: null, status: "unknown" },
            verification: { status: "configured_pending_restart", evidence: installed.evidence },
            installation: { status: "configured_pending_restart" },
            activation: { status: "pending_restart" },
            runtime_checks: finalizedConsent.state,
            restart: { required: true, reason: "host_reload" },
            next_action: { kind: "restart", text: "Restart GitHub Copilot. Then verify AGDF in Plugins and the agdf- skills in a fresh session." },
          }), { json: options.json, compact: !options.verbose, io });
          return 0;
        }
        if (installed.manualHandoff) {
          printLifecycleResult(createLifecycleResult({
            operation: "install", result: "partial", surface, scope: "global",
            version: { expected: installed.expectedVersion, installed: null, status: "unknown" },
            verification: { status: "unavailable", evidence: installed.evidence },
            installation: { status: "not_verified" },
            activation: { status: "not_verified" },
            runtime_checks: finalizedConsent.state,
            restart: { required: false, reason: "none" },
            next_action: { kind: "manual_install", text: `In GitHub Copilot, run /plugins install ${installed.pluginRoot}. Then run /restart and verify /plugins list and /skills list.` },
            failure: { phase: "executable", message: "Copilot CLI was not available; no plugin installation was performed." },
          }), { json: options.json, compact: !options.verbose, io });
          return 1;
        }
        printLifecycleResult(installResult(installed, {
          restartRequired: true,
          nextAction: installNextAction(surface, finalizedConsent.state, globalInstallRestartAction(surface).text),
          runtimeChecks: finalizedConsent.state,
          consentFailure: finalizedConsent.failure,
        }), { json: options.json, compact: !options.verbose, io });
        printVerboseHostOutput(installed, options, io);
        return installed.verificationStatus === "healthy" ? 0 : 1;
      } catch (error) {
        printInstallFailure(surface, error, options, io, "copilot");
        return 1;
      }
    }],
    ["opencode", async (options) => {
      const configDir = options.dirExplicit ? options.dir : defaultOpenCodeConfigDir();
      try {
        const consent = await installConsentDecision("opencode", options, { io, askRuntimeCheckDecision, interactive, dataRoot: installerAdapters.dataRoot });
        if (consent.decision === "cancel") return printCancelledConsent("opencode", options, io);
        printInstallProgress("opencode", options, io, interactive);
        const result = runLifecyclePhase("plugin_operation", () => installOpenCodeGlobalPlugin(configDir, { packageSource: openCodePackageSource }));
        runLifecyclePhase("global_surface", () => installOpenCodeGlobalSurface(configDir));
        const report = runLifecyclePhase("verification", () => evaluateOpenCodeStatus(options.dir, configDir, result.transition));
        const alignmentHealthy = ["already_matching", "aligned"].includes(result.sdk_alignment.status);
        const verificationHealthy = report.status === "configured"
          && report.package.version_status === "current"
          && report.global_native_surface.complete
          && report.experimental_hooks.aggregate === "declared_supported"
          && report.host_sdk_version.status === "matching"
          && alignmentHealthy;
        const nextAction = verificationHealthy
          ? globalInstallRestartAction(options.target)
          : {
              kind: "recovery",
              text: `Retry the OpenCode installation to align @opencode-ai/plugin to ${result.sdk_alignment.target_version || "the exact host version"}; observed SDK: ${result.sdk_alignment.installed_version || "unknown"}.`,
            };
        const finalizedConsent = finalizeInstallConsent(consent, {
              surface: "opencode",
              installed: {
                pluginRoot: result.installed_package.root,
                digest: result.installed_package.digest,
                sourceDigest: result.package_source.digest || result.installed_package.digest,
              },
              dataRoot: installerAdapters.dataRoot,
            });
        printLifecycleResult(createLifecycleResult({
          operation: result.transition.status === "updated" ? "update" : "install",
          result: verificationHealthy && !finalizedConsent.failure ? "success" : "partial",
          surface: options.target,
          scope: "global",
          version: {
            expected: report.package.expected_version,
            installed: report.package.installed_version,
            previous: result.transition.previous_version,
            status: report.package.version_status === "current" ? "verified" : "unknown",
            transition: result.transition.status,
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
              `sdk_alignment=${result.sdk_alignment.status};target=${result.sdk_alignment.target_version || "unknown"};installed=${result.sdk_alignment.installed_version || "unknown"}`,
              `package_source=${result.package_source.kind}${result.package_source.digest ? `;digest=${result.package_source.digest}` : ""}`,
            ],
          },
          restart: { required: true, reason: "host_reload" },
          runtime_checks: finalizedConsent.state,
          next_action: nextAction,
          failure: finalizedConsent.failure,
        }), { json: options.json, compact: !options.verbose, io });
        if (options.verbose && !options.json) {
          io.log(`OpenCode host / plugin SDK: ${report.host.installed_version || "unknown"} / ${report.plugin_sdk.installed_version || "unknown"} (${report.host_sdk_version.status}; ${report.host_sdk_version.policy})`);
          io.log(`Plugin SDK alignment: ${result.sdk_alignment.status} (target ${result.sdk_alignment.target_version || "unknown"}; installed ${result.sdk_alignment.installed_version || "unknown"})`);
          io.log(`Experimental hook declarations: ${report.experimental_hooks.aggregate} (SDK declaration evidence; live invocation not observed)`);
        }
        return verificationHealthy ? 0 : 1;
      } catch (error) {
        printInstallFailure(options.target, error, options, io);
        return 1;
      }
    }],
  ]);
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

function installNextAction(surface, runtimeChecks, fallback) {
  if (surface === "codex" && runtimeChecks.requested === "enabled" && runtimeChecks.effective === "decision_required") {
    return `${fallback} Approve the AGDF session hook when the fresh Codex session asks.`;
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

async function installConsentDecision(surface, options, { io, askRuntimeCheckDecision, interactive, dataRoot }) {
  if (options.runtimeChecksDecision !== undefined) return prepareInstallConsent(surface, options);
  if (!interactive || options.json || typeof askRuntimeCheckDecision !== "function") {
    return prepareInstallConsent(surface, options);
  }
  const retained = retainCurrentInstallConsent(surface, dataRoot);
  const disclosure = prepareInstallConsent(surface, { ...options, runtimeChecksDecision: "manual" }).disclosure;
  printInstallConsentDisclosure(disclosure, retained, io);
  const answer = await askRuntimeCheckDecision(disclosure);
  return prepareInstallConsent(surface, { ...options, runtimeChecksDecision: answer });
}

function printInstallConsentDisclosure(disclosure, retained, io) {
  const host = installSurfaceLabel(disclosure.surface);
  io.log("");
  io.log(`AGDF ${pluginDefinition.version} for ${host}`);
  io.log(`Applies to this ${host} installation for your user account.`);
  io.log("");
  io.log(`Let AGDF check your project status automatically ${disclosure.when}?`);
  if (retained) {
    io.log(retained.decision === "enable"
      ? "Your previous choice: automatic checks requested"
      : "Your previous choice: manual checks");
    if (retained.decision === "enable") io.log(`${host} permission: checked after installation`);
  }
  io.log("");
  io.log("Safe by design");
  io.log("  Reads only AGDF runtime information and .agdf/control in this project");
  io.log("  Changes no project files and uses no network");
  io.log("  Never approves AGDF work");
  io.log("");
  io.log(`AGDF saves your choice. ${host} remains in control of permission.`);
  io.log("You choose again for every install or update and whenever the check changes.");
  io.log(`Turn it off anytime: ${disclosure.revocation}`);
  io.log("");
  io.log("Choose");
  io.log("  [1] Yes, check automatically");
  io.log("  [2] No automatic checks");
  io.log("      AGDF still works. Checks run when you request them.");
  io.log("  [D] Show technical details");
  io.log("  [Esc] Cancel installation");
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
  io.log(`Setting up AGDF ${pluginDefinition.version} for ${installSurfaceLabel(surface)}...`);
}

function installConsentTechnicalDetails(disclosure) {
  return [
    "",
    "Technical details",
    `  Applies to: ${disclosure.installation_scope}`,
    `  Runs: ${disclosure.runs} ${disclosure.when}`,
    `  Reads: ${disclosure.reads}`,
    `  Saves: ${disclosure.writes}`,
    `  Permission control: ${disclosure.permission_owner}`,
    `  Command: ${disclosure.executable}`,
    `  Renewal: ${disclosure.renewal}`,
    "",
  ];
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

function runDisable(options, { io, exec }) {
  try {
    const plan = planRepositoryDisable(options.dir, options.surface);
    const applied = applyLifecyclePlan(plan, exec ? { exec } : {});
    const verified = applied.status === "success" ? verifyRepositoryDisabled(options.dir) : { status: "failed", evidence: [] };
    const result = applied.status === "success" && verified.status !== "healthy" ? "failed" : applied.status;
    const report = createLifecycleResult({
      operation: "disable",
      result,
      surface: options.surface,
      scope: "repository",
      verification: { status: verified.status === "healthy" ? "healthy" : "degraded", evidence: [...applied.completed.map((item) => item.path || item.executable), ...verified.evidence] },
      restart: { required: result === "success", reason: result === "success" ? "host_reload" : "none" },
      next_action: result === "success"
        ? { kind: "restart", text: "Restart the host in this repository; global AGDF availability and .agdf/control are retained." }
        : { kind: "verify", text: "Inspect the reported repository configuration failure before retrying disable." },
      changes: applied.completed,
      retained: applied.retained,
      failure: applied.error
        ? { phase: "repository_configuration", message: applied.error.message }
        : result === "failed" ? { phase: "verification", message: "Repository disable postcondition was not observed." } : null,
    });
    printLifecycleResult(report, { json: options.json, io });
    return result === "success" ? 0 : 1;
  } catch (error) {
    io.error(error.message);
    return 1;
  }
}

function runUninstall(options, { io, env, exec }) {
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
      printLifecycleResult(preview, { json: options.json, io });
      return 0;
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
    printLifecycleResult(report, { json: options.json, io });
    return result === "success" ? 0 : 1;
  } catch (error) {
    io.error(error.message);
    return 1;
  }
}

function runScaffold(options, io) {
  const files = generatedFilesForTarget(options.target, options.dir, options.force, options.language);
  let removedOpenCodeAgents = [];

  try {
    assertGeneratedWritePlan(options.dir, files, options.force);
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force, file.allowOverwrite);
    }
    // Legacy OpenCode assets are intentionally preserved. A future explicit migration command
    // may remove only ownership-proven files after its precedence behavior is verified.
  } catch (error) {
    io.error(error.message);
    return 1;
  }

  printNextSteps(options.target, options.dir, files, removedOpenCodeAgents, { verbose: options.verbose, json: options.json, io });
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
    interactive: adapters.interactive ?? (Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY)),
  }).get(command.handler);
  if (!handler) throw new Error(`No implementation is registered for ${command.name}.`);
  return await handler(options);
}

export const main = runCli;

async function defaultAskRuntimeCheckDecision(disclosure) {
  if (process.stdin.isTTY && typeof process.stdin.setRawMode === "function") {
    return askRuntimeCheckDecisionByKey(process.stdin, process.stdout, disclosure);
  }
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    while (true) {
      const answer = (await prompt.question("Choice (1/2/D/cancel): ")).trim().toLowerCase();
      if (["1", "e", "enable"].includes(answer)) return "enable";
      if (["2", "m", "manual"].includes(answer)) return "manual";
      if (["d", "details"].includes(answer)) {
        for (const line of installConsentTechnicalDetails(disclosure)) process.stdout.write(`${line}\n`);
        continue;
      }
      if (["c", "cancel"].includes(answer)) return "cancel";
      process.stdout.write("Press 1, 2 or D, or type cancel.\n");
    }
  } finally {
    prompt.close();
  }
}

export async function askRuntimeCheckDecisionByKey(input, output, disclosure) {
  const wasRaw = Boolean(input.isRaw);
  emitKeypressEvents(input);
  output.write("Choice: ");
  if (!wasRaw) input.setRawMode(true);
  input.resume();

  return await new Promise((resolve) => {
    const finish = (decision) => {
      input.off("keypress", onKeypress);
      if (!wasRaw) input.setRawMode(false);
      input.pause();
      output.write(`${decision}\n`);
      resolve(decision);
    };
    const onKeypress = (character, key = {}) => {
      if (key.name === "escape" || (key.ctrl && key.name === "c")) return finish("cancel");
      const choice = String(character || "").toLowerCase();
      if (["1", "e"].includes(choice)) return finish("enable");
      if (["2", "m"].includes(choice)) return finish("manual");
      if (choice === "c") return finish("cancel");
      if (choice === "d" && disclosure) {
        output.write(`details\n${installConsentTechnicalDetails(disclosure).join("\n")}Choice: `);
        return;
      }
      output.write("\nPress 1, 2, D or Esc.\nChoice: ");
    };
    input.on("keypress", onKeypress);
  });
}
