import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { runMcpLifecycle } from "../../mcp-lifecycle/service.js";
import { CODEX_PLUGIN_MCP_FILE } from "../../runtime/plugin-provenance.js";

// The AGDF MCP server ships with the Codex runtime plugin (mcp/codex.mcp.json, absolute paths written
// by the installer). These helpers retire the user-scope registration earlier releases wrote into
// ~/.codex/config.toml, which `codex plugin remove` never touches and which would share the server
// name with the plugin, and prewarm the plugin runtime.

const LEGACY_ENTRYPOINT = /[\\/]@agdf[\\/]mcp-server[\\/]bin[\\/]agdf-mcp\.js$/u;

export function migrateLegacyCodexMcpRegistration({ exec, env = process.env, mcpLifecycle = runMcpLifecycle }) {
  let entry;
  try { entry = JSON.parse(String(exec("codex", ["mcp", "get", "agdf", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) ?? "")); } catch { return []; }
  const args = entry?.transport?.args;
  // Only the AGDF-owned server registered by earlier releases is migrated; the plugin's own server
  // starts the plugin-local launcher instead.
  if (!Array.isArray(args) || args.length !== 3 || !LEGACY_ENTRYPOINT.test(String(args[0]))
      || args[1] !== "--surface" || args[2] !== "codex") return [];
  try {
    const report = mcpLifecycle({ action: "disable", surface: "codex", scope: "user", target: homedir(), env, exec });
    return [`legacy_user_mcp_registration:${report.result}`];
  } catch {
    return ["legacy_user_mcp_registration:retained"];
  }
}

export function prepareCodexPluginMcp({ exec, pluginRoot, execPath = process.execPath }) {
  try {
    const args = JSON.parse(readFileSync(join(pluginRoot, CODEX_PLUGIN_MCP_FILE), "utf8")).mcpServers.agdf.args;
    exec(execPath, [...args, "--prepare"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return ["codex_plugin_mcp:prepared"];
  } catch {
    return ["codex_plugin_mcp:deferred_to_first_start"];
  }
}
