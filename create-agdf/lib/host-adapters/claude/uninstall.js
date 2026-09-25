import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { execHostFileSync } from "../../host-command.js";
import { captureOptions, commandErrorText } from "../../installers/plugin-command.js";
import { classifyMarketplaceList, defaultAgdfDataRoot, localMarketplaceRoot } from "../../installers/local-marketplace.js";
import { defaultClaudeSettingsPath, readClaudeSettings } from "../../runtime-check-consent/claude-settings.js";
import { readRuntimeCheckReceipt } from "../../runtime-check-consent/state.js";
import { inspectClaudePlugin, uninstallCommand } from "./plugin.js";
import { ownedRuntimeCheckRules } from "./permission-rules.js";

export { ownedRuntimeCheckRules };

const MARKETPLACE_LIST = ["plugin", "marketplace", "list", "--json"];
const MARKETPLACE_REMOVE = ["plugin", "marketplace", "remove", "agdf", "--scope", "user"];

function inspectMarketplace(exec, marketplaceRoot) {
  try {
    return classifyMarketplaceList("claude", exec("claude", MARKETPLACE_LIST, captureOptions()), marketplaceRoot);
  } catch (error) {
    return { state: "unknown", source: "", reason: commandErrorText(error) || "marketplace_list_failed" };
  }
}

// Removes every Claude-only AGDF trace that is present and provably AGDF-owned. The marketplace
// directory is shared with other hosts and the plugin cache belongs to Claude Code, so both are
// reported as retained instead of deleted; a registration without its directory is what breaks hosts.
export function planClaudeGlobalUninstall({
  exec = execHostFileSync, env = process.env, platform = process.platform,
  claudeSettingsPath = defaultClaudeSettingsPath({ env }),
} = {}) {
  const mutations = [];
  const retained = ["repository AGDF files", ".agdf/control"];
  if (inspectClaudePlugin(exec).status !== "not_installed") {
    const command = uninstallCommand();
    mutations.push({ kind: "command", executable: command.executable, args: command.args });
  }
  const marketplaceRoot = localMarketplaceRoot({ env, platform });
  const marketplace = inspectMarketplace(exec, marketplaceRoot);
  if (marketplace.state === "owned_local_current") {
    mutations.push({ kind: "command", executable: "claude", args: MARKETPLACE_REMOVE });
  } else if (marketplace.state !== "absent") {
    retained.push(`Claude marketplace registration agdf (${marketplace.reason || marketplace.state})`);
  }
  const rules = ownedRuntimeCheckRules(readClaudeSettings(claudeSettingsPath).settings);
  if (rules.length) mutations.push({ kind: "claude_permission_rules", path: claudeSettingsPath, rules });
  const receipt = readRuntimeCheckReceipt(defaultAgdfDataRoot({ env, platform }), "claude");
  if (receipt.status === "valid") mutations.push({ kind: "remove", path: receipt.path });
  if (existsSync(marketplaceRoot)) retained.push(`shared AGDF marketplace directory (may still serve Codex): ${marketplaceRoot}`);
  const cacheRoot = join(dirname(claudeSettingsPath), "plugins", "cache", "agdf");
  if (existsSync(cacheRoot)) retained.push(`Claude Code plugin cache (host-owned): ${cacheRoot}`);
  return Object.freeze({
    operation: "uninstall",
    surface: "claude",
    scope: "global",
    mutations: Object.freeze(mutations),
    retained: Object.freeze(retained),
    expected: Object.freeze({ installation_status: "not_installed" }),
    claude: Object.freeze({ marketplaceRoot, claudeSettingsPath, marketplaceRemoval: marketplace.state === "owned_local_current" }),
  });
}

export function verifyClaudeGlobalUninstall(plan, { exec = execHostFileSync, inspect = (_surface, run) => inspectClaudePlugin(run) } = {}) {
  const evidence = [];
  const plugin = inspect("claude", exec);
  evidence.push(...(plugin.evidence ?? []));
  if (plugin.status !== "not_installed") evidence.push(`observed:${plugin.status}`);
  const marketplace = plan.claude?.marketplaceRemoval ? inspectMarketplace(exec, plan.claude.marketplaceRoot) : { state: "absent" };
  if (marketplace.state === "owned_local_current") evidence.push("observed:marketplace_registered");
  const rules = plan.claude ? ownedRuntimeCheckRules(readClaudeSettings(plan.claude.claudeSettingsPath).settings) : [];
  if (rules.length) evidence.push(`observed:runtime_check_rules:${rules.length}`);
  const healthy = plugin.status === "not_installed" && marketplace.state !== "owned_local_current" && rules.length === 0;
  return { status: healthy ? "healthy" : "failed", evidence };
}
