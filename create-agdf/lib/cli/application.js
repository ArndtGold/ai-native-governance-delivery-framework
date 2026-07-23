import { join } from "node:path";
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
import { evaluateGeneralStatus } from "../lifecycle/status.js";
import { agdfFragmentPath, generatedFilesForTarget } from "../scaffold/plan.js";
import { printNextSteps } from "../scaffold/presentation.js";
import { assertGeneratedWritePlan, writeGeneratedFile } from "../scaffold/write.js";
import { renderUsage, resolveCommand, validateCommandOptions } from "./command-registry.js";
import { CliUsageError, parseArgs } from "./parse-args.js";
import { pluginDefinition } from "./runtime-context.js";
import { createValidationHandlers } from "./validation-handlers.js";

function createHandlers({ io, env, exec, prepare }) {
  const installerAdapters = {
    ...(exec ? { exec } : {}),
    ...(prepare ? { prepare } : {}),
    ...(env.AGDF_DATA_DIR ? { dataRoot: env.AGDF_DATA_DIR } : {}),
  };
  const scaffoldHandler = (options) => runScaffold(options, io);
  return new Map([
    ...createValidationHandlers(io),
    ["codex-repo", scaffoldHandler],
    ["copilot", scaffoldHandler],
    ["opencode-repo", scaffoldHandler],
    ["both", scaffoldHandler],
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
      }, { exec });
      printGeneralStatus(report, { json: options.json, io });
      return report.installation.status === "healthy" ? 0 : 1;
    }],
    ["disable", (options) => runDisable(options, { io, exec })],
    ["uninstall", (options) => runUninstall(options, { io, env, exec })],
    ["codex", (options) => {
      try {
        const installed = installCodexGlobalPlugin(installerAdapters);
        printLifecycleResult(installResult(installed, {
          restartRequired: true,
          nextAction: globalInstallRestartAction(options.target).text,
        }), { json: options.json, io });
        printVerboseHostOutput(installed, options, io);
        return 0;
      } catch (error) {
        printInstallFailure(options.target, error, options, io);
        return 1;
      }
    }],
    ["claude", (options) => {
      try {
        const installed = installClaudeGlobalPlugin(installerAdapters);
        printLifecycleResult(installResult(installed, {
          restartRequired: true,
          nextAction: globalInstallRestartAction(options.target).text,
        }), { json: options.json, io });
        printVerboseHostOutput(installed, options, io);
        return 0;
      } catch (error) {
        printInstallFailure(options.target, error, options, io);
        return 1;
      }
    }],
    ["opencode", (options) => {
      const configDir = options.dirExplicit ? options.dir : defaultOpenCodeConfigDir();
      try {
        const result = runLifecyclePhase("plugin_operation", () => installOpenCodeGlobalPlugin(configDir));
        runLifecyclePhase("global_surface", () => installOpenCodeGlobalSurface(configDir));
        const report = runLifecyclePhase("verification", () => evaluateOpenCodeStatus(options.dir, configDir, result.transition));
        const verificationHealthy = report.status === "configured"
          && report.package.version_status === "current"
          && report.global_native_surface.complete
          && report.experimental_hooks.aggregate === "declared_supported";
        printLifecycleResult(createLifecycleResult({
          operation: result.transition.status === "updated" ? "update" : "install",
          result: verificationHealthy ? "success" : "partial",
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
            ],
          },
          restart: { required: true, reason: "host_reload" },
          next_action: globalInstallRestartAction(options.target),
        }), { json: options.json, io });
        if (!options.json) {
          io.log(`OpenCode host / plugin SDK: ${report.host.installed_version || "unknown"} / ${report.plugin_sdk.installed_version || "unknown"} (${report.host_sdk_version.status}; ${report.host_sdk_version.policy})`);
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

function installResult(installed, { restartRequired, nextAction }) {
  return createLifecycleResult({
    operation: installed.operation ?? "install",
    result: "success",
    surface: installed.surface,
    scope: "global",
    version: { expected: installed.expectedVersion, installed: installed.installedVersion, status: installed.installedVersion ? "verified" : "unknown" },
    verification: { status: installed.verificationStatus, evidence: installed.evidence },
    installation: { status: installed.verificationStatus },
    activation: { status: restartRequired ? "pending_restart" : "active" },
    delivery: { status: "not_evaluated" },
    restart: { required: restartRequired, reason: restartRequired ? "host_reload" : "none" },
    next_action: { kind: restartRequired ? "restart" : "prompt", text: nextAction },
  });
}

function printVerboseHostOutput(installed, options, io) {
  if (!options.verbose || options.json || !installed.nativeOutput?.length) return;
  io.log("Host command output:");
  for (const output of installed.nativeOutput) io.log(output);
}

function printInstallFailure(surface, error, options, io) {
  const report = lifecycleFailure({
    operation: "install",
    surface,
    scope: "global",
    phase: error.phase || "plugin_operation",
    message: error.message,
    evidence: [error.evidence ?? {}],
    nextAction: `Resolve the ${error.phase || "plugin operation"} failure and rerun npx --yes @agdf/cli@latest ${surface}.`,
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
  const wroteAgentsFragment = files.some((file) => file.path === agdfFragmentPath);
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

  printNextSteps(options.target, options.dir, files, wroteAgentsFragment, removedOpenCodeAgents, { verbose: options.verbose, json: options.json, io });
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
  const handler = createHandlers({ io, env, exec: adapters.exec, prepare: adapters.prepare }).get(command.handler);
  if (!handler) throw new Error(`No implementation is registered for ${command.name}.`);
  return await handler(options);
}

export const main = runCli;
