#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const supportedSurfaces = new Set(["codex", "claude", "copilot", "opencode"]);

function npmInvocation(args) {
  if (process.platform !== "win32") return { executable: "npm", args };
  return {
    executable: process.execPath,
    args: [join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"), ...args],
  };
}

export async function installLocalPlugin(surface, adapters = {}) {
  if (!supportedSurfaces.has(surface)) throw new Error(`Unsupported AGDF local install surface: ${surface || "missing"}`);
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
  const [{ runCli }, { pluginDefinition }, marketplace, { prepareLocalOpenCodePackage }] = await Promise.all([
    import("../lib/cli/application.js"),
    import("../lib/cli/runtime-context.js"),
    import("../lib/installers/local-marketplace.js"),
    import("../lib/installers/local-development.js"),
  ]);
  const { codexLocalInstallVersion, defaultAgdfDataRoot, digestPluginSource, prepareLocalMarketplace } = marketplace;
  const cli = adapters.runCli ?? runCli;
  const dataRoot = adapters.dataRoot ?? defaultAgdfDataRoot();

  const sourceDigest = digestPluginSource(builtPluginRoot, pluginDefinition.version);
  const codexInstallVersion = codexLocalInstallVersion(pluginDefinition.version, sourceDigest);
  const prepare = (options = {}) => prepareLocalMarketplace({
    ...options,
    dataRoot,
    builtPluginRoot,
    expectedVersion: pluginDefinition.version,
    codexInstallVersion,
  });
  const env = { ...process.env, AGDF_DATA_DIR: dataRoot };

  if (surface !== "opencode") {
    return await cli([surface === "copilot" ? "copilot-plugin" : surface], { env, prepare, exec });
  }

  const openCodePackageSource = prepareLocalOpenCodePackage({
    dataRoot,
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec,
  });
  return await cli([surface], { env, openCodePackageSource });
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await installLocalPlugin(process.argv[2]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
