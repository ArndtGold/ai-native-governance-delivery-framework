import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { mcpPackageConstants } from "../lib/mcp-lifecycle/package.js";
import { ensurePluginMcpRuntime, inspectPluginMcpDataRoot, parseLauncherArguments } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { npmCalls, offlineNpm, pluginRoot, version } from "./support/plugin-mcp-fixture.js";

// Shared plugin-local MCP runtime used by every host whose runtime plugin declares the server itself.
const root = mkdtempSync(join(tmpdir(), "agdf-plugin-mcp-runtime-"));
try {
  const updateablePluginRoot = join(root, "plugin");
  cpSync(pluginRoot, updateablePluginRoot, { recursive: true });
  const dataRoot = join(root, "data");
  const mcpRoot = join(dataRoot, "mcp");
  const prepared = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(prepared.status, "matched");
  assert.equal(prepared.changed, true);
  assert.equal(prepared.root, join(mcpRoot, version));
  assert.ok(existsSync(join(prepared.packageRoot, "bin", "agdf-mcp.js")), "the shipped server is installed");
  assert.equal(JSON.parse(readFileSync(join(prepared.dispatcherRoot, "package.json"), "utf8")).name, "create-agdf");
  // Exercise the assembled plugin package, not a fixture copying all source files.
  const { readSkillRuntimeContracts } = await import(pathToFileURL(join(prepared.dispatcherRoot, "lib/cli/contract-command.js")));
  const contracts = readSkillRuntimeContracts("code-review");
  assert.deepEqual(contracts.map(contract => contract.module), ["quality", "context-graph"]);
  assert.ok(contracts.every(contract => contract.content.length > 0 && contract.sha256.length === 64));

  const again = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec() { throw new Error("a matched runtime must not reinstall"); } });
  assert.equal(again.changed, false);

  // Plugin updates keep the data root: owned runtimes of other versions and abandoned stages are retired.
  const retired = join(mcpRoot, "0.0.1");
  cpSync(prepared.root, retired, { recursive: true });
  const foreignSibling = join(mcpRoot, "notes");
  mkdirSync(foreignSibling);
  const staleStage = join(mcpRoot, `.stage-${version}-stale`);
  mkdirSync(staleStage);
  const old = new Date(Date.now() - 60 * 60 * 1000);
  utimesSync(staleStage, old, old);
  ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(existsSync(retired), false, "an owned runtime of another version is retired");
  assert.equal(existsSync(staleStage), false, "an abandoned stage is removed");
  assert.equal(existsSync(foreignSibling), true, "unowned directories are never removed");

  // A plugin cachebuster can change source content while the canonical runtime version remains the same.
  const sourceService = join(updateablePluginRoot, "runtime", "create-agdf", "lib", "skill-dispatch", "service.js");
  writeFileSync(sourceService, `${readFileSync(sourceService, "utf8")}\n// updated plugin source\n`);
  npmCalls.length = 0;
  const pluginUpdated = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(pluginUpdated.status, "matched");
  assert.equal(pluginUpdated.changed, true, "same-version cached MCP runtime is rebuilt when installed plugin source changes");
  assert.notEqual(pluginUpdated.dispatcherDigest, again.dispatcherDigest);
  assert.equal(npmCalls.length, 1);

  // A same-version runtime whose content drifted is owned and therefore rebuilt.
  writeFileSync(join(prepared.packageRoot, "src", "main.js"), "tampered\n");
  npmCalls.length = 0;
  const rebuilt = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(rebuilt.changed, true);
  assert.equal(npmCalls.length, 1);
  assert.equal(JSON.parse(readFileSync(join(rebuilt.root, mcpPackageConstants.marker), "utf8")).owner, mcpPackageConstants.owner);

  // A directory without the AGDF marker at the runtime path is never overwritten.
  const foreignData = join(root, "foreign");
  mkdirSync(join(foreignData, "mcp", version), { recursive: true });
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: foreignData, exec: offlineNpm }), /AGDF_MCP_RUNTIME_UNOWNED/);
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: null, exec: offlineNpm }), /AGDF_MCP_PLUGIN_DATA_MISSING/);

  // Ownership of a whole launcher data root, as uninstall inspects it.
  const ownedData = join(root, "owned");
  assert.equal(inspectPluginMcpDataRoot(ownedData), "absent");
  ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: ownedData, exec: offlineNpm });
  assert.equal(inspectPluginMcpDataRoot(ownedData), "owned");
  writeFileSync(join(ownedData, "user-notes.txt"), "keep\n");
  assert.equal(inspectPluginMcpDataRoot(ownedData), "foreign");
  assert.equal(inspectPluginMcpDataRoot(dataRoot), "foreign", "an unowned sibling under mcp/ blocks removal");
} finally {
  rmSync(root, { recursive: true, force: true });
}

// Launcher arguments: Claude passes its data root in the environment, Codex as absolute arguments.
assert.deepEqual(parseLauncherArguments([], { CLAUDE_PLUGIN_DATA: "/claude/data" }), { surface: "claude", dataRoot: "/claude/data", prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--prepare"], { CLAUDE_PLUGIN_DATA: "/claude/data" }), { surface: "claude", dataRoot: "/claude/data", prepareOnly: true });
const absolute = join(tmpdir(), "codex-data");
assert.deepEqual(parseLauncherArguments(["--surface", "codex", "--data", absolute], {}), { surface: "codex", dataRoot: absolute, prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--surface", "codex", "--data", absolute, "--prepare"], {}), { surface: "codex", dataRoot: absolute, prepareOnly: true });
for (const invalid of [["--surface", "claude"], ["--surface", "codex", "--data", "relative"], ["--surface", "codex"], ["--unknown"]]) {
  assert.equal(parseLauncherArguments(invalid, {}), null, invalid.join(" "));
}

console.log("Plugin MCP runtime tests passed");
