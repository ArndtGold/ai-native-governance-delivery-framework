import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../cli/runtime-context.js";

export function installCodexGlobalPlugin({ exec = execFileSync, io = console } = {}) {
  const expectedVersion = pluginDefinition.version;

  try {
    exec("codex", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], { stdio: "inherit" });
    exec("codex", ["plugin", "marketplace", "upgrade", "agdf"], { stdio: "inherit" });
    exec("codex", ["plugin", "add", "agdf", "--marketplace", "agdf"], { stdio: "inherit" });
    const listOutput = exec("codex", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
    if (installedVersion !== expectedVersion) {
      throw new Error(versionMismatchMessage("Codex", "agdf@agdf", expectedVersion, installedVersion, "codex plugin marketplace upgrade agdf && codex plugin add agdf --marketplace agdf"));
    }
    io.log(`AGDF Codex plugin version verified: ${installedVersion}.`);
  } catch (error) {
    if (error.message?.startsWith("AGDF Codex plugin version mismatch")) throw error;
    throw new Error(`Failed to install the AGDF Codex plugin. Make sure the Codex CLI is installed and available on PATH, then rerun this command. ${commandErrorText(error)}`.trim());
  }
}

export function installClaudeGlobalPlugin({ exec = execFileSync, io = console } = {}) {
  const expectedVersion = pluginDefinition.version;

  try {
    exec("claude", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], { stdio: "inherit" });
    exec("claude", ["plugin", "marketplace", "update", "agdf"], { stdio: "inherit" });
    const beforeList = exec("claude", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const alreadyInstalled = pluginListHasPlugin(beforeList, "agdf@agdf");
    exec("claude", ["plugin", alreadyInstalled ? "update" : "install", "agdf@agdf"], { stdio: "inherit" });
    const afterList = exec("claude", ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installedVersion = pluginVersionFromList(afterList, "agdf@agdf");
    if (installedVersion) {
      if (installedVersion !== expectedVersion) {
        throw new Error(versionMismatchMessage("Claude Code", "agdf@agdf", expectedVersion, installedVersion, "claude plugin marketplace update agdf && claude plugin update agdf@agdf"));
      }
      io.log(`AGDF Claude Code plugin version verified: ${installedVersion}.`);
    } else {
      io.log("AGDF Claude Code plugin installed or updated. Claude Code did not expose a plugin version in `claude plugin list`; verify with `claude plugin list` after restart if needed.");
    }
  } catch (error) {
    if (error.message?.startsWith("AGDF Claude Code plugin version mismatch")) throw error;
    throw new Error(`Failed to install the AGDF Claude Code plugin. Make sure the Claude Code CLI is installed and available on PATH, then rerun this command. ${commandErrorText(error)}`.trim());
  }
}

function commandErrorText(error) {
  return (error.stderr || error.stdout || error.message || "").toString().trim();
}

export function pluginListHasPlugin(output, pluginId) {
  return output
    .split(/\r?\n/)
    .some((line) => line.includes(pluginId));
}

export function pluginVersionFromList(output, pluginId) {
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const line = output
    .split(/\r?\n/)
    .find((entry) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(entry));
  if (!line) return "";
  const versionMatch = line.match(/\b(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)\b/);
  return versionMatch?.[1] ?? "";
}

function versionMismatchMessage(surface, pluginId, expectedVersion, installedVersion, correctiveCommand) {
  return `AGDF ${surface} plugin version mismatch for ${pluginId}: expected ${expectedVersion}, observed ${installedVersion || "unknown"}. Refresh with: ${correctiveCommand}`;
}
