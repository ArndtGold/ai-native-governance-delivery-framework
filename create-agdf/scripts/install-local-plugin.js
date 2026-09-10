#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const supportedSurfaces = new Set(["codex", "claude", "copilot", "opencode"]);

function npmInvocation(args) {
  if (process.platform !== "win32") return { executable: "npm", args };
  return {
    executable: process.execPath,
    args: [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args],
  };
}

export function resolveLocalInvocationDirectory({ env = process.env, cwd = process.cwd() } = {}) {
  const hasInitCwd = Object.hasOwn(env, "INIT_CWD");
  const candidate = hasInitCwd ? env.INIT_CWD : cwd;
  try {
    if (typeof candidate !== "string" || !candidate.trim() || !isAbsolute(candidate)) throw new Error("not_absolute");
    const directory = realpathSync(candidate);
    if (!statSync(directory).isDirectory()) throw new Error("not_directory");
    return Object.freeze({ directory, source: hasInitCwd ? "npm_init_cwd" : "process_cwd" });
  } catch (error) {
    const failure = new Error("AGDF_LOCAL_INVOCATION_DIRECTORY_INVALID", { cause: error });
    failure.code = "AGDF_LOCAL_INVOCATION_DIRECTORY_INVALID";
    throw failure;
  }
}

export async function installLocalPlugin(surface, forwardedArgsOrAdapters = [], suppliedAdapters = {}) {
  if (!supportedSurfaces.has(surface)) throw new Error(`Unsupported AGDF local install surface: ${surface || "missing"}`);
  const forwardedArgs = Array.isArray(forwardedArgsOrAdapters) ? [...forwardedArgsOrAdapters] : [];
  const adapters = Array.isArray(forwardedArgsOrAdapters) ? suppliedAdapters : forwardedArgsOrAdapters;
  const runtimeEnv = adapters.env ?? process.env;
  const invocation = resolveLocalInvocationDirectory({ env: runtimeEnv, cwd: adapters.cwd ?? process.cwd() });
  const exec = adapters.exec ?? execFileSync;
  const preparation = npmInvocation(["--prefix", packageRoot, "run", "release:prepare"]);
  try {
    exec(preparation.executable, preparation.args, { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    const output = [error?.stdout, error?.stderr].map((value) => String(value || "").trim()).filter(Boolean).join("\n");
    if (!output) throw error;
    throw new Error(`AGDF local release preparation failed.\n${output}`, { cause: error });
  }

  // The lib modules read generated plugin metadata at import time, so they are
  // loadable only after release:prepare has produced generated/ on a fresh checkout.
  const [
    { runCli },
    { pluginDefinition },
    marketplace,
    { prepareLocalOpenCodePackage, prepareLocalMcpPackageSources },
    { runMcpLifecycle },
    { prepareMcpServerPackage },
  ] = await Promise.all([
    import("../lib/cli/application.js"),
    import("../lib/cli/runtime-context.js"),
    import("../lib/installers/local-marketplace.js"),
    import("../lib/installers/local-development.js"),
    import("../lib/mcp-lifecycle/service.js"),
    import("../lib/mcp-lifecycle/package.js"),
  ]);
  const { defaultAgdfDataRoot, prepareCopilotMarketplace, prepareLocalMarketplace } = marketplace;
  const cli = adapters.runCli ?? runCli;
  const dataRoot = adapters.dataRoot ?? defaultAgdfDataRoot();

  const builtPluginRoot = surface === "copilot"
    ? join(packageRoot, "generated", "plugins", "copilot", "agdf")
    : join(packageRoot, "generated", "plugins", "agdf");
  const prepareOwner = surface === "copilot" ? prepareCopilotMarketplace : prepareLocalMarketplace;
  const prepare = (options = {}) => prepareOwner({
    ...options,
    dataRoot,
    builtPluginRoot,
    expectedVersion: pluginDefinition.version,
    snapshotSource: true,
    ...(adapters.snapshotAdapters ? { snapshotAdapters: adapters.snapshotAdapters } : {}),
  });
  const env = { ...runtimeEnv, AGDF_DATA_DIR: dataRoot };
  let localMcpPackages = null;
  const lifecycleOwner = adapters.runMcpLifecycle ?? runMcpLifecycle;
  const packageOwner = adapters.prepareMcpServerPackage ?? prepareMcpServerPackage;
  const localPackageOwner = adapters.prepareLocalMcpPackageSources ?? prepareLocalMcpPackageSources;
  const mcpLifecycle = adapters.mcpLifecycle ?? ((options) => lifecycleOwner({
    ...options,
    prepare(prepareOptions) {
      localMcpPackages ??= localPackageOwner({
        dataRoot,
        dispatcherPackageRoot: packageRoot,
        mcpServerPackageRoot: resolve(packageRoot, "..", "agdf-mcp-server"),
        expectedVersion: pluginDefinition.version,
        exec,
      });
      return packageOwner({
        ...prepareOptions,
        packageSpec: localMcpPackages.packageSpec,
        dispatcherPackageSpec: localMcpPackages.dispatcherPackageSpec,
      });
    },
  }));
  const interactionAdapters = {
    ...(Object.hasOwn(adapters, "interactive") ? { interactive: adapters.interactive } : {}),
    ...(adapters.askInstallSetupDecision ? { askInstallSetupDecision: adapters.askInstallSetupDecision } : {}),
    ...(adapters.askInstallSetupScope ? { askInstallSetupScope: adapters.askInstallSetupScope } : {}),
    ...(adapters.askRuntimeCheckDecision ? { askRuntimeCheckDecision: adapters.askRuntimeCheckDecision } : {}),
    ...(adapters.inspectPluginInstallation ? { inspectPluginInstallation: adapters.inspectPluginInstallation } : {}),
    mcpLifecycle,
    parser: { ...(adapters.parser ?? {}), cwd: invocation.directory, cwdSource: invocation.source },
  };

  try {
    if (surface !== "opencode") {
      return await cli([surface, ...forwardedArgs], { env, prepare, exec, ...interactionAdapters });
    }

    const openCodePackageSource = prepareLocalOpenCodePackage({
      dataRoot,
      packageRoot,
      expectedVersion: pluginDefinition.version,
      exec,
    });
    return await cli([surface, ...forwardedArgs], { env, openCodePackageSource, exec, ...interactionAdapters });
  } finally {
    localMcpPackages?.cleanup();
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await installLocalPlugin(process.argv[2], process.argv.slice(3));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
