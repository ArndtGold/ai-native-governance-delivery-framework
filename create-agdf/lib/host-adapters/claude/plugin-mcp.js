import { homedir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { claudePluginDataRoot } from "../../mcp-lifecycle/plugin-runtime.js";
import { runMcpLifecycle } from "../../mcp-lifecycle/service.js";

// The AGDF MCP server ships with the Claude plugin (see mcp/claude.mcp.json). These helpers only
// prewarm its runtime in ${CLAUDE_PLUGIN_DATA} and retire what earlier releases registered outside
// the plugin, which `claude plugin uninstall` would otherwise leave behind.

export function claudeConfigDir(env = process.env) {
  return resolve(env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"));
}

export function prepareClaudePluginMcp({ exec, env = process.env, pluginRoot, execPath = process.execPath }) {
  const dataRoot = claudePluginDataRoot({ claudeConfigDir: claudeConfigDir(env) });
  try {
    exec(execPath, [join(pluginRoot, "mcp", "agdf-mcp-launch.js"), "--prepare"], {
      env: { ...env, CLAUDE_PLUGIN_DATA: dataRoot },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return ["claude_plugin_mcp:prepared"];
  } catch {
    return ["claude_plugin_mcp:deferred_to_first_start"];
  }
}

export function migrateLegacyClaudeMcpRegistration({ exec, env = process.env, mcpLifecycle = runMcpLifecycle }) {
  let output;
  try { output = String(exec("claude", ["mcp", "get", "agdf"], { encoding: "utf8", stdio: "pipe" }) ?? ""); } catch { return []; }
  // Only a user-scope registration of the AGDF-owned server is migrated; everything else is left alone.
  if (!/^\s*Scope:\s*User config/mu.test(output) || !/agdf-mcp\.js --surface claude\s*$/mu.test(output)) return [];
  try {
    const report = mcpLifecycle({ action: "disable", surface: "claude", scope: "user", target: homedir(), env, exec });
    return [`legacy_user_mcp_registration:${report.result}`];
  } catch {
    return ["legacy_user_mcp_registration:retained"];
  }
}
