import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrateLegacyClaudeMcpRegistration, prepareClaudePluginMcp } from "../lib/host-adapters/claude/plugin-mcp.js";
import { mcpPackageConstants } from "../lib/mcp-lifecycle/package.js";
import { claudePluginDataRoot, ensureClaudePluginMcpRuntime } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const pluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const sdkSource = join(packageRoot, "..", "agdf-mcp-server", "node_modules");
const version = pluginDefinition.version;
assert.ok(existsSync(join(pluginRoot, "mcp", "agdf-mcp-launch.js")), "run sync-package-assets before this test");

// Offline stand-in for `npm install @modelcontextprotocol/server@2.0.0`: copies the pinned SDK closure.
const npmCalls = [];
const offlineNpm = (_executable, args, options) => {
  npmCalls.push(args.at(-1));
  assert.equal(args.at(-1), "@modelcontextprotocol/server@2.0.0", "only the pinned SDK is acquired from npm");
  for (const entry of ["@modelcontextprotocol/server", "@modelcontextprotocol/core", "zod"]) {
    cpSync(join(sdkSource, entry), join(options.cwd, "node_modules", entry), { recursive: true });
  }
  return "";
};

assert.equal(claudePluginDataRoot({ claudeConfigDir: "/home/user/.claude" }), resolve("/home/user/.claude/plugins/data/agdf-agdf"));

const root = mkdtempSync(join(tmpdir(), "agdf-claude-plugin-mcp-"));
try {
  const dataRoot = join(root, "data");
  const mcpRoot = join(dataRoot, "mcp");
  const prepared = ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(prepared.status, "matched");
  assert.equal(prepared.changed, true);
  assert.equal(prepared.root, join(mcpRoot, version));
  assert.ok(existsSync(join(prepared.packageRoot, "bin", "agdf-mcp.js")), "the shipped server is installed");
  assert.equal(JSON.parse(readFileSync(join(prepared.dispatcherRoot, "package.json"), "utf8")).name, "create-agdf");

  const again = ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot, exec() { throw new Error("a matched runtime must not reinstall"); } });
  assert.equal(again.changed, false);

  // Plugin updates keep ${CLAUDE_PLUGIN_DATA}: owned runtimes of other versions and abandoned stages are retired.
  const retired = join(mcpRoot, "0.0.1");
  cpSync(prepared.root, retired, { recursive: true });
  const foreignSibling = join(mcpRoot, "notes");
  mkdirSync(foreignSibling);
  const staleStage = join(mcpRoot, `.stage-${version}-stale`);
  mkdirSync(staleStage);
  const old = new Date(Date.now() - 60 * 60 * 1000);
  utimesSync(staleStage, old, old);
  ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(existsSync(retired), false, "an owned runtime of another version is retired");
  assert.equal(existsSync(staleStage), false, "an abandoned stage is removed");
  assert.equal(existsSync(foreignSibling), true, "unowned directories are never removed");

  // A same-version runtime whose content drifted is owned and therefore rebuilt.
  writeFileSync(join(prepared.packageRoot, "src", "main.js"), "tampered\n");
  npmCalls.length = 0;
  const rebuilt = ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(rebuilt.changed, true);
  assert.equal(npmCalls.length, 1);

  // A directory without the AGDF marker at the runtime path is never overwritten.
  const foreignData = join(root, "foreign");
  mkdirSync(join(foreignData, "mcp", version), { recursive: true });
  assert.throws(() => ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot: foreignData, exec: offlineNpm }), /AGDF_MCP_RUNTIME_UNOWNED/);
  assert.throws(() => ensureClaudePluginMcpRuntime({ pluginRoot, dataRoot: null, exec: offlineNpm }), /AGDF_MCP_PLUGIN_DATA_MISSING/);
  assert.equal(JSON.parse(readFileSync(join(rebuilt.root, mcpPackageConstants.marker), "utf8")).owner, mcpPackageConstants.owner);

  // The generated launcher verifies the prepared runtime without network and fails closed without data.
  const launcher = join(pluginRoot, "mcp", "agdf-mcp-launch.js");
  const prepareRun = spawnSync(process.execPath, [launcher, "--prepare"], { encoding: "utf8", env: { ...process.env, CLAUDE_PLUGIN_DATA: dataRoot } });
  assert.equal(prepareRun.status, 0, prepareRun.stderr);
  assert.deepEqual(JSON.parse(prepareRun.stdout), { status: "matched", version, root: rebuilt.root, changed: false });
  const env = { ...process.env };
  delete env.CLAUDE_PLUGIN_DATA;
  const missingData = spawnSync(process.execPath, [launcher], { encoding: "utf8", env });
  assert.equal(missingData.status, 1);
  assert.equal(missingData.stderr.trim(), "AGDF_MCP_PLUGIN_DATA_MISSING");
  const extraArgument = spawnSync(process.execPath, [launcher, "--surface", "claude"], { encoding: "utf8", env: { ...process.env, CLAUDE_PLUGIN_DATA: dataRoot } });
  assert.equal(extraArgument.stderr.trim(), "AGDF_MCP_ARGUMENTS_INVALID");

  // The installer prewarms into Claude's plugin data directory and never fails the plugin install.
  const prewarmCalls = [];
  const claudeHome = join(root, "claude-home");
  assert.deepEqual(prepareClaudePluginMcp({
    pluginRoot: "/plugin",
    env: { CLAUDE_CONFIG_DIR: claudeHome },
    execPath: "/node",
    exec(executable, args, options) { prewarmCalls.push({ executable, args, data: options.env.CLAUDE_PLUGIN_DATA }); return ""; },
  }), ["claude_plugin_mcp:prepared"]);
  assert.deepEqual(prewarmCalls, [{ executable: "/node", args: [join("/plugin", "mcp", "agdf-mcp-launch.js"), "--prepare"], data: join(claudeHome, "plugins", "data", "agdf-agdf") }]);
  assert.deepEqual(prepareClaudePluginMcp({ pluginRoot: "/plugin", env: {}, exec() { throw new Error("offline"); } }), ["claude_plugin_mcp:deferred_to_first_start"]);
} finally {
  rmSync(root, { recursive: true, force: true });
}

// Only a user-scope registration of the AGDF server that earlier releases wrote is migrated.
const legacyUser = [
  "agdf:",
  "  Scope: User config (available in all your projects)",
  "  Type: stdio",
  "  Command: C:\\node\\node.exe",
  "  Args: C:\\Users\\me\\AppData\\Local\\agdf\\mcp\\user\\0.14.5\\node_modules\\@agdf\\mcp-server\\bin\\agdf-mcp.js --surface claude",
].join("\n");
for (const [output, expectedDisable] of [
  [legacyUser, true],
  [legacyUser.replace("User config", "Local config"), false],
  [legacyUser.replace("agdf-mcp.js --surface claude", "other-server.js"), false],
  ["", false],
]) {
  const lifecycleCalls = [];
  const evidence = migrateLegacyClaudeMcpRegistration({
    env: {},
    exec(executable, args) { assert.deepEqual([executable, ...args], ["claude", "mcp", "get", "agdf"]); return output; },
    mcpLifecycle(input) { lifecycleCalls.push(input); return { result: "disabled" }; },
  });
  assert.equal(lifecycleCalls.length, expectedDisable ? 1 : 0);
  if (expectedDisable) {
    assert.deepEqual([lifecycleCalls[0].action, lifecycleCalls[0].surface, lifecycleCalls[0].scope], ["disable", "claude", "user"]);
    assert.deepEqual(evidence, ["legacy_user_mcp_registration:disabled"]);
  } else {
    assert.deepEqual(evidence, []);
  }
}
assert.deepEqual(migrateLegacyClaudeMcpRegistration({ env: {}, exec() { throw new Error("no claude"); } }), []);
assert.deepEqual(migrateLegacyClaudeMcpRegistration({
  env: {}, exec: () => legacyUser, mcpLifecycle() { throw new Error("AGDF_MCP_REGISTRATION_FOREIGN"); },
}), ["legacy_user_mcp_registration:retained"]);

// `mcp enable --surface claude` no longer writes a registration next to the plugin's own server.
const enable = runMcpLifecycle({
  action: "enable", surface: "claude", scope: "user", target: tmpdir(),
  exec() { throw new Error("Claude enable must not call the host"); },
  prepare() { throw new Error("Claude enable must not prepare a user runtime"); },
});
assert.equal(enable.result, "not_configured");
assert.deepEqual(enable.diagnostics.map(({ code }) => code), ["claude_plugin_managed"]);
assert.equal(enable.next_action.code, "use_claude_plugin_mcp");

console.log("Claude plugin MCP tests passed");
