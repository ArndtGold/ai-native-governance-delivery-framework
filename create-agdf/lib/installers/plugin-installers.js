// Existing import entry points; native mechanisms have one host owner.
import { execFileSync } from "node:child_process";
import { inspectCodexPlugin, bootstrapCommands as codexCommands } from "../host-adapters/codex/plugin.js";
import { inspectClaudePlugin, bootstrapCommands as claudeCommands } from "../host-adapters/claude/plugin.js";
import { inspectCopilotPlugin, bootstrapCommands as copilotCommands } from "../host-adapters/copilot/plugin.js";
export { installCodexGlobalPlugin } from "../host-adapters/codex/plugin.js";
export { installClaudeGlobalPlugin } from "../host-adapters/claude/plugin.js";
export { COPILOT_CLI_NPM_PACKAGE, installCopilotGlobalPlugin, classifyCopilotMarketplaceList, copilotNpmInvocation, setCopilotPluginEnabled } from "../host-adapters/copilot/plugin.js";
export { pluginListHasPlugin, pluginVersionFromList } from "./plugin-command.js";

export function inspectPluginSurface(surface, exec = execFileSync, options = {}) {
  if (surface === "claude") return inspectClaudePlugin(exec, options);
  if (surface === "copilot") return inspectCopilotPlugin(exec, options);
  return inspectCodexPlugin(exec, options, surface);
}

export function pluginBootstrapCommands(surface) {
  if (surface === "codex") return codexCommands();
  if (surface === "claude") return claudeCommands();
  if (surface === "copilot") return copilotCommands();
  return null;
}
