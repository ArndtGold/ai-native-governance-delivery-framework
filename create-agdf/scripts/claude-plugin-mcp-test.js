import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadedClaudeSessions, loadedSessionEvidence, loadedSessionLockHint } from "../lib/host-adapters/claude/loaded-sessions.js";
import { migrateLegacyClaudeMcpRegistration, prepareClaudePluginMcp } from "../lib/host-adapters/claude/plugin-mcp.js";
import { claudePluginDataRoot, ensurePluginMcpRuntime } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import { offlineNpm, pluginRoot, version } from "./support/plugin-mcp-fixture.js";

// Claude Code: the runtime plugin declares the server in mcp/claude.mcp.json; Claude expands
// ${CLAUDE_PLUGIN_ROOT} and passes ${CLAUDE_PLUGIN_DATA}, which it deletes on uninstall.
const manifest = JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"));
assert.equal(manifest.mcpServers, "./mcp/claude.mcp.json");
assert.deepEqual(JSON.parse(readFileSync(join(pluginRoot, "mcp", "claude.mcp.json"), "utf8")),
  { mcpServers: { agdf: { type: "stdio", command: "node", args: ["${CLAUDE_PLUGIN_ROOT}/mcp/agdf-mcp-launch.js"] } } });
assert.equal(existsSync(join(pluginRoot, ".mcp.json")), false, "Claude Code would load a plugin-root .mcp.json automatically");
assert.equal(claudePluginDataRoot({ claudeConfigDir: "/home/user/.claude" }), resolve("/home/user/.claude/plugins/data/agdf-agdf"));

const root = mkdtempSync(join(tmpdir(), "agdf-claude-plugin-mcp-"));
try {
  // The generated launcher takes the data root from ${CLAUDE_PLUGIN_DATA}, verifies the prepared
  // runtime without network and fails closed without data or with Codex-only arguments.
  const dataRoot = join(root, "data");
  const prepared = ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
  const launcher = join(pluginRoot, "mcp", "agdf-mcp-launch.js");
  const prepareRun = spawnSync(process.execPath, [launcher, "--prepare"], { encoding: "utf8", env: { ...process.env, CLAUDE_PLUGIN_DATA: dataRoot } });
  assert.equal(prepareRun.status, 0, prepareRun.stderr);
  assert.deepEqual(JSON.parse(prepareRun.stdout), { status: "matched", version, root: prepared.root, changed: false });
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
assert.deepEqual([enable.result, enable.diagnostics[0].code, enable.next_action.code],
  ["not_configured", "claude_plugin_managed", "use_claude_plugin_mcp"]);

// Running Claude sessions that loaded AGDF are found through the host's own .in_use/<pid> markers.
const sessionHome = mkdtempSync(join(tmpdir(), "agdf-claude-sessions-"));
try {
  const sessionEnv = { CLAUDE_CONFIG_DIR: sessionHome };
  assert.deepEqual(loadedClaudeSessions({ env: sessionEnv }), [], "no plugin cache means no loaded session");
  const inUse = join(sessionHome, "plugins", "cache", "agdf", "agdf", "0.14.5", ".in_use");
  mkdirSync(inUse, { recursive: true });
  for (const pid of ["111", "222", String(process.pid), "not-a-pid"]) writeFileSync(join(inUse, pid), "{}");
  const sessions = loadedClaudeSessions({ env: sessionEnv, isAlive: (pid) => pid === 111 || pid === process.pid });
  assert.deepEqual(sessions, [{ pid: 111, version: "0.14.5" }], "only live foreign pids count; the installer itself is skipped");
  assert.deepEqual(loadedSessionEvidence(sessions), ["claude_sessions_with_agdf:111"]);
  assert.deepEqual(loadedSessionEvidence([]), []);
  const locked = loadedSessionLockHint(Object.assign(new Error("rename failed."), { code: "EPERM" }), sessions);
  assert.match(locked.message, /rename failed\. Claude Code sessions with AGDF loaded are still running \(pid 111\)/);
  assert.equal(locked.evidence.claude_sessions_with_agdf, "111");
  const other = new Error("digest mismatch");
  assert.equal(loadedSessionLockHint(other, sessions).message, "digest mismatch", "only lock errors get the session hint");
} finally {
  rmSync(sessionHome, { recursive: true, force: true });
}

console.log("Claude plugin MCP tests passed");
