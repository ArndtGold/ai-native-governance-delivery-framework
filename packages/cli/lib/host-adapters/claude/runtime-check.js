import { existsSync, rmSync } from "node:fs";
import { ownedRuntimeCheckRules } from "./permission-rules.js";
import { defaultClaudeSettingsPath, readClaudeSettings, revokeClaudeRuntimeRule } from "../../runtime-check-consent/claude-settings.js";
import { readRuntimeCheckReceipt } from "../../runtime-check-consent/state.js";

// Claude Code runs plugin hooks whenever the plugin is enabled and needs no permission rule for them,
// so enabling the AGDF plugin is the runtime-check consent. Nothing is written outside the plugin,
// which lets `claude plugin uninstall` remove the capability completely.
export const CLAUDE_PLUGIN_DISABLE_COMMAND = "claude plugin disable agdf@agdf";

export function claudeRuntimeCheckState(requested = "enabled") {
  return {
    requested,
    effective: "enabled",
    reason: "host_plugin_enablement",
    capability_identity: null,
    verification: "host_managed",
  };
}

// Earlier releases wrote an exact permission rule and an AGDF receipt; both are removed wherever the
// CLI touches Claude runtime checks so updates converge on the plugin-only state.
export function removeLegacyClaudeRuntimeCheckState({ claudeSettingsPath = defaultClaudeSettingsPath(), dataRoot } = {}) {
  const removed = [];
  let settings = null;
  try { settings = readClaudeSettings(claudeSettingsPath).settings; } catch {}
  for (const rule of ownedRuntimeCheckRules(settings)) {
    revokeClaudeRuntimeRule({ path: claudeSettingsPath, rule });
    removed.push("permission_rule");
  }
  if (dataRoot) {
    const receipt = readRuntimeCheckReceipt(dataRoot, "claude");
    if (receipt.status === "valid" && existsSync(receipt.path)) {
      rmSync(receipt.path);
      removed.push("receipt");
    }
  }
  return removed;
}
