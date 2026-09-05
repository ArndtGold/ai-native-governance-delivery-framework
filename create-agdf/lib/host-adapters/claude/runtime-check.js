import process from "node:process";
import { claudePermissionRule } from "./permission-rules.js";
import { configureClaudeExactRuntimeRule, defaultClaudeSettingsPath, revokeClaudeRuntimeRule } from "../../runtime-check-consent/claude-settings.js";

export function configureClaudeRuntimeCheck({ command, platform = process.platform, claudeSettingsPath }) {
  return configureClaudeExactRuntimeRule({ path: claudeSettingsPath ?? defaultClaudeSettingsPath(), rule: claudePermissionRule({ platform, command }) });
}
export function revokeClaudeRuntimeCheck({ command, platform = process.platform, claudeSettingsPath }) {
  return revokeClaudeRuntimeRule({ path: claudeSettingsPath ?? defaultClaudeSettingsPath(), rule: claudePermissionRule({ platform, command }) });
}
