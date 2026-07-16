import { join } from "node:path";
import process from "node:process";
import {
  createRun,
  migrateLegacy,
  resolveRuns,
  writeLegacyProjection,
} from "../control-state/index.js";
import {
  buildStatusCard,
  evaluateGateCheck,
  postApprovalTransition,
  printGateCheckReport,
} from "../control-evaluation/gate-check.js";
import {
  evaluateDeliveryMap,
  printDeliveryMapReport,
} from "../control-evaluation/delivery-map.js";
import { evaluateDoctor, printDoctorReport } from "../control-evaluation/doctor.js";
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
import { agdfFragmentPath, generatedFilesForTarget, openCodeConfigFragmentPath } from "../scaffold/plan.js";
import { printNextSteps } from "../scaffold/presentation.js";
import { assertGeneratedWritePlan, removeOwnedLegacyOpenCodeAgents, writeGeneratedFile } from "../scaffold/write.js";
import { renderUsage, resolveCommand, validateCommandOptions } from "./command-registry.js";
import { executeDeliveryPathSearch } from "./delivery-path-search-command.js";
import { CliUsageError, parseArgs } from "./parse-args.js";

const deliveryMapDependencies = Object.freeze({
  evaluateDoctor,
  buildStatusCard,
  postApprovalTransition,
});

function createHandlers({ io, env, exec }) {
  const installerAdapters = exec ? { exec, io } : { io };
  const scaffoldHandler = (options) => runScaffold(options, io);
  return new Map([
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
    ["doctor", (options) => {
      const report = evaluateDoctor(options.dir, options);
      printDoctorReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["gate-check", (options) => {
      const report = evaluateGateCheck(options.dir, options);
      printGateCheckReport(report, options.json, options.statusCard, io);
      return report.status === "blocked" ? 2 : 0;
    }],
    ["delivery-map", (options) => {
      const report = evaluateDeliveryMap(options.dir, options, deliveryMapDependencies);
      printDeliveryMapReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["delivery-path-search", async (options) => {
      try {
        const result = await executeDeliveryPathSearch(options, io);
        return result.status === "recommendation" ? 0 : 2;
      } catch (error) {
        io.error(`Delivery Path Search failed: ${error.message}`);
        return 2;
      }
    }],
    ["opencode-status", (options) => {
      const configDir = env.OPENCODE_CONFIG_DIR || defaultOpenCodeConfigDir();
      const report = evaluateOpenCodeStatus(options.dir, configDir);
      printOpenCodeStatus(report, options.json, io);
      return report.status === "configured" ? 0 : 1;
    }],
    ["codex", () => {
      try {
        installCodexGlobalPlugin(installerAdapters);
        io.log("AGDF Codex plugin installed globally.");
        io.log("Run npx --yes @agdf/cli@latest codex-repo in a repository when you want to test AGDF from repository-local plugin files.");
        return 0;
      } catch (error) {
        io.error(error.message);
        return 1;
      }
    }],
    ["claude", () => {
      try {
        installClaudeGlobalPlugin(installerAdapters);
        io.log("AGDF Claude Code plugin installed globally.");
        return 0;
      } catch (error) {
        io.error(error.message);
        return 1;
      }
    }],
    ["opencode", (options) => {
      const configDir = options.dirExplicit ? options.dir : defaultOpenCodeConfigDir();
      try {
        const result = installOpenCodeGlobalPlugin(configDir);
        installOpenCodeGlobalSurface(configDir);
        io.log(`AGDF OpenCode global plugin ${result.added ? "installed" : "already present"}: ${result.configPath}`);
        const report = evaluateOpenCodeStatus(options.dir, configDir, result.transition);
        printOpenCodeStatus(report, false, io);
        io.log("Restart OpenCode so it loads the updated global plugin config.");
        return 0;
      } catch (error) {
        io.error(error.message);
        return 1;
      }
    }],
  ]);
}

function runScaffold(options, io) {
  const files = generatedFilesForTarget(options.target, options.dir, options.force, options.language);
  const wroteAgentsFragment = files.some((file) => file.path === agdfFragmentPath);
  const wroteOpenCodeConfigFragment = files.some((file) => file.path === openCodeConfigFragmentPath);
  let removedOpenCodeAgents = [];

  try {
    assertGeneratedWritePlan(options.dir, files, options.force);
    for (const file of files) {
      writeGeneratedFile(options.dir, file.path, file.content, options.force, file.allowOverwrite);
    }
    if (options.target === "opencode-repo") removedOpenCodeAgents = removeOwnedLegacyOpenCodeAgents(options.dir);
  } catch (error) {
    io.error(error.message);
    return 1;
  }

  printNextSteps(options.target, options.dir, files, wroteAgentsFragment, wroteOpenCodeConfigFragment, removedOpenCodeAgents, io);
  return 0;
}

export async function runCli(argv = process.argv.slice(2), adapters = {}) {
  const io = adapters.io ?? console;
  const env = adapters.env ?? process.env;
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
  const handler = createHandlers({ io, env, exec: adapters.exec }).get(command.handler);
  if (!handler) throw new Error(`No implementation is registered for ${command.name}.`);
  return await handler(options);
}

export const main = runCli;
