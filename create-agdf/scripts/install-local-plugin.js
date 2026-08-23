#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { runCli } from "../lib/cli/application.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import {
  codexLocalInstallVersion,
  defaultAgdfDataRoot,
  digestPluginSource,
  prepareLocalMarketplace,
} from "../lib/installers/local-marketplace.js";
import { prepareLocalOpenCodePackage } from "../lib/installers/local-development.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const supportedSurfaces = new Set(["codex", "claude", "opencode"]);

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
  const cli = adapters.runCli ?? runCli;
  const dataRoot = adapters.dataRoot ?? defaultAgdfDataRoot();
  const preparation = npmInvocation(["--prefix", packageRoot, "run", "release:prepare"]);
  exec(preparation.executable, preparation.args, { encoding: "utf8", stdio: "inherit" });

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
    return await cli([surface], { env, prepare });
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
