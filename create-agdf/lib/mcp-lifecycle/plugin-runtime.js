import { execFileSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { MCP_DISPATCHER_RUNTIME_ENTRIES } from "../runtime/plugin-provenance.js";
import { inspectMcpServerPackage, mcpPackageConstants, prepareMcpServerPackage } from "./package.js";

// Claude Code starts the AGDF MCP server from the plugin manifest and deletes ${CLAUDE_PLUGIN_DATA}
// on uninstall, so the runtime lives there instead of in a user-scope `claude mcp add` registration.
// The plugin ships the server and dispatcher; only the pinned MCP SDK is installed from npm, once.
const SDK_PACKAGE_SPEC = "@modelcontextprotocol/server@2.0.0";
const STALE_STAGE_MS = 10 * 60 * 1000;

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function ownedRoot(root) {
  return readJson(join(root, mcpPackageConstants.marker))?.owner === mcpPackageConstants.owner;
}

export function claudePluginMcpVersion(pluginRoot) {
  const version = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"))?.version;
  if (typeof version !== "string" || !version) throw new Error("AGDF_MCP_PLUGIN_RUNTIME_INVALID");
  return version;
}

function copyPluginPackages({ pluginRoot, stage, version }) {
  const serverSource = join(pluginRoot, "mcp", "server");
  const runtimePackage = join(pluginRoot, "runtime", "create-agdf");
  if (!existsSync(join(serverSource, "package.json")) || !existsSync(runtimePackage)) {
    throw new Error("AGDF_MCP_PLUGIN_RUNTIME_INVALID");
  }
  cpSync(serverSource, join(stage, "node_modules", "@agdf", "mcp-server"), { recursive: true });
  const dispatcherRoot = join(stage, "node_modules", "create-agdf");
  for (const entry of MCP_DISPATCHER_RUNTIME_ENTRIES.filter((item) => item !== "package.json")) {
    cpSync(join(runtimePackage, entry), join(dispatcherRoot, entry), { recursive: true });
  }
  writeFileSync(join(dispatcherRoot, "package.json"), `${JSON.stringify({
    name: "create-agdf",
    version,
    private: true,
    type: "module",
    exports: { "./mcp-dispatch-runtime": "./lib/mcp-dispatch-runtime.js" },
  }, null, 2)}\n`, "utf8");
}

function pruneMcpDataRoot(mcpDataRoot, version, now) {
  for (const name of readdirSync(mcpDataRoot)) {
    const path = join(mcpDataRoot, name);
    let stats;
    try { stats = lstatSync(path); } catch { continue; }
    if (!stats.isDirectory() || stats.isSymbolicLink() || name === version) continue;
    // Plugin updates keep ${CLAUDE_PLUGIN_DATA}; retire owned runtimes of other versions and
    // stages abandoned by a launcher the host stopped mid-install.
    const staleStage = name.startsWith(".stage-") && now - statSync(path).mtimeMs > STALE_STAGE_MS;
    if (staleStage || (!name.startsWith(".") && ownedRoot(path))) rmSync(path, { recursive: true, force: true });
  }
}

export function ensureClaudePluginMcpRuntime({
  pluginRoot,
  dataRoot,
  execPath = process.execPath,
  exec = execFileSync,
  npmOptions = {},
  now = Date.now(),
} = {}) {
  if (!pluginRoot || !dataRoot) throw new Error("AGDF_MCP_PLUGIN_DATA_MISSING");
  const version = claudePluginMcpVersion(pluginRoot);
  const mcpDataRoot = join(resolve(dataRoot), "mcp");
  mkdirSync(mcpDataRoot, { recursive: true });
  pruneMcpDataRoot(mcpDataRoot, version, now);
  let current = inspectMcpServerPackage({ dataRoot: mcpDataRoot, expectedVersion: version });
  if (current.status === "matched") return Object.freeze({ ...current, changed: false });
  if (current.status === "mismatch" && ownedRoot(current.root)) {
    rmSync(current.root, { recursive: true, force: true });
  } else if (current.status !== "absent") {
    throw new Error("AGDF_MCP_RUNTIME_UNOWNED");
  }
  try {
    const prepared = prepareMcpServerPackage({
      dataRoot: mcpDataRoot,
      expectedVersion: version,
      execPath,
      exec,
      npmOptions,
      acquire({ stage, install }) {
        install([SDK_PACKAGE_SPEC]);
        copyPluginPackages({ pluginRoot, stage, version });
      },
    });
    prepared.commit();
    return prepared;
  } catch (error) {
    // A concurrent session may have installed the same runtime first.
    current = inspectMcpServerPackage({ dataRoot: mcpDataRoot, expectedVersion: version });
    if (current.status === "matched") return Object.freeze({ ...current, changed: false });
    throw error;
  }
}

export async function launchClaudePluginMcpServer({
  pluginRoot,
  argv = process.argv.slice(2),
  env = process.env,
  stdout = process.stdout,
  stderr = process.stderr,
  ensure = ensureClaudePluginMcpRuntime,
} = {}) {
  const prepareOnly = argv.length === 1 && argv[0] === "--prepare";
  if (argv.length && !prepareOnly) {
    stderr.write("AGDF_MCP_ARGUMENTS_INVALID\n");
    process.exitCode = 1;
    return null;
  }
  let runtime;
  try {
    runtime = ensure({ pluginRoot, dataRoot: env.CLAUDE_PLUGIN_DATA });
  } catch (error) {
    stderr.write(`${/^AGDF_[A-Z_]+/.exec(error?.message ?? "")?.[0] ?? "AGDF_MCP_PLUGIN_RUNTIME_FAILED"}\n`);
    process.exitCode = 1;
    return null;
  }
  if (prepareOnly) {
    stdout.write(`${JSON.stringify({ status: runtime.status, version: runtime.version, root: runtime.root, changed: runtime.changed })}\n`);
    return runtime;
  }
  const { runMcpServer } = await import(pathToFileURL(join(runtime.packageRoot, "src", "main.js")).href);
  return runMcpServer({ surface: "claude" });
}

export function claudePluginDataRoot({ claudeConfigDir, pluginId = "agdf@agdf" }) {
  // Claude Code names the directory after the plugin id with every character outside [A-Za-z0-9_-]
  // replaced by "-" (agdf@agdf -> agdf-agdf).
  return join(resolve(claudeConfigDir), "plugins", "data", pluginId.replace(/[^A-Za-z0-9_-]/g, "-"));
}

export const claudePluginMcpConstants = Object.freeze({ sdkPackageSpec: SDK_PACKAGE_SPEC, launcher: "mcp/agdf-mcp-launch.js" });
