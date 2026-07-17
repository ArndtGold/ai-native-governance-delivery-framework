import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../cli/runtime-context.js";

export function installCodexGlobalPlugin({ exec = execFileSync, io = console } = {}) {
  const expectedVersion = pluginDefinition.version;
  runPluginPhase(exec, "codex", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], "marketplace", { stdio: "inherit" });
  runPluginPhase(exec, "codex", ["plugin", "marketplace", "upgrade", "agdf"], "marketplace", { stdio: "inherit" });
  runPluginPhase(exec, "codex", ["plugin", "add", "agdf", "--marketplace", "agdf"], "plugin_operation", { stdio: "inherit" });
  const listOutput = runPluginPhase(exec, "codex", ["plugin", "list"], "verification", { encoding: "utf8", stdio: "pipe" });
  const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
  if (installedVersion !== expectedVersion) {
    throw lifecycleAdapterError("version", versionMismatchMessage("Codex", "agdf@agdf", expectedVersion, installedVersion, "codex plugin marketplace upgrade agdf && codex plugin add agdf --marketplace agdf"));
  }
  return { surface: "codex", expectedVersion, installedVersion, verificationStatus: "healthy", evidence: ["codex plugin list"] };
}

export function installClaudeGlobalPlugin({ exec = execFileSync, io = console } = {}) {
  const expectedVersion = pluginDefinition.version;
  runPluginPhase(exec, "claude", ["plugin", "marketplace", "add", "arndtgold/ai-native-governance-delivery-framework"], "marketplace", { stdio: "inherit" });
  runPluginPhase(exec, "claude", ["plugin", "marketplace", "update", "agdf"], "marketplace", { stdio: "inherit" });
  const beforeList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", { encoding: "utf8", stdio: "pipe" });
  const alreadyInstalled = pluginListHasPlugin(beforeList, "agdf@agdf");
  runPluginPhase(exec, "claude", ["plugin", alreadyInstalled ? "update" : "install", "agdf@agdf"], "plugin_operation", { stdio: "inherit" });
  const afterList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", { encoding: "utf8", stdio: "pipe" });
  const installedVersion = pluginVersionFromList(afterList, "agdf@agdf");
  if (installedVersion && installedVersion !== expectedVersion) {
    throw lifecycleAdapterError("version", versionMismatchMessage("Claude Code", "agdf@agdf", expectedVersion, installedVersion, "claude plugin marketplace update agdf && claude plugin update agdf@agdf"));
  }
  return {
    surface: "claude",
    expectedVersion,
    installedVersion,
    verificationStatus: installedVersion ? "healthy" : "degraded",
    evidence: ["claude plugin list", ...(installedVersion ? [] : ["host_did_not_expose_version"])],
  };
}

export function inspectPluginSurface(surface, exec = execFileSync) {
  const executable = surface === "claude" ? "claude" : "codex";
  const pluginId = "agdf@agdf";
  try {
    const output = exec(executable, ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installed = pluginListHasPlugin(output, pluginId);
    const version = installed ? pluginVersionFromList(output, pluginId) : "";
    return {
      status: !installed ? "not_installed" : version === pluginDefinition.version ? "healthy" : "degraded",
      surface,
      version: version || null,
      expected_version: pluginDefinition.version,
      evidence: [`${executable} plugin list`, ...(installed && !version ? ["host_did_not_expose_version"] : [])],
    };
  } catch (error) {
    return { status: "unknown", surface, version: null, expected_version: pluginDefinition.version, evidence: [commandErrorText(error)] };
  }
}

function runPluginPhase(exec, executable, args, phase, options) {
  try {
    return exec(executable, args, options);
  } catch (error) {
    const effectivePhase = error?.code === "ENOENT" ? "executable" : phase;
    throw lifecycleAdapterError(effectivePhase, commandErrorText(error) || `${executable} ${args.join(" ")} failed`, {
      executable,
      args,
    });
  }
}

function lifecycleAdapterError(phase, message, evidence = {}) {
  const error = new Error(message);
  error.name = "LifecycleAdapterError";
  error.phase = phase;
  error.evidence = evidence;
  return error;
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
