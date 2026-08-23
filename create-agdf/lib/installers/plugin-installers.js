import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../cli/runtime-context.js";
import { classifyMarketplaceList, inspectLocalMarketplaceProjection, isCodexLocalInstallVersion, prepareLocalMarketplace } from "./local-marketplace.js";

export function installCodexGlobalPlugin({ exec = execFileSync, prepare = prepareLocalMarketplace, dataRoot } = {}) {
  const expectedVersion = pluginDefinition.version;
  const nativeOutput = [];
  const transaction = prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}) });
  const expectedInstallVersion = transaction.codexInstallVersion ?? expectedVersion;
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false };
  try {
    const marketplaceOutput = runPluginPhase(exec, "codex", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ surface: "codex", exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration });
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "add", "agdf", "--marketplace", "agdf"], "plugin_operation", captureOptions()));
    const listOutput = runPluginPhase(exec, "codex", ["plugin", "list"], "verification", captureOptions());
    const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
    if (installedVersion !== expectedInstallVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Codex", "agdf@agdf", expectedInstallVersion, installedVersion, "npx --yes @agdf/cli@latest codex"));
    }
    transaction.commit();
    return {
      surface: "codex", operation: migration.state === "owned_local_current" ? "update" : "install", expectedVersion: expectedInstallVersion, canonicalVersion: expectedVersion, installedVersion, verificationStatus: "healthy",
      evidence: ["durable_local_marketplace", `marketplace:${migration.state}`, "codex plugin list", ...(expectedInstallVersion === expectedVersion ? [] : [`canonical_version:${expectedVersion}`, `local_install_version:${expectedInstallVersion}`])],
      nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    recoverMarketplace({ surface: "codex", exec, migration, transaction, error });
    throw error;
  }
}

export function installClaudeGlobalPlugin({ exec = execFileSync, prepare = prepareLocalMarketplace, dataRoot } = {}) {
  const expectedVersion = pluginDefinition.version;
  const nativeOutput = [];
  const transaction = prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}) });
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false };
  try {
    const marketplaceOutput = runPluginPhase(exec, "claude", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ surface: "claude", exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration });
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "marketplace", "update", "agdf"], "marketplace", captureOptions()));
    const beforeList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", captureOptions());
    const alreadyInstalled = pluginListHasPlugin(beforeList, "agdf@agdf");
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", alreadyInstalled ? "update" : "install", "agdf@agdf"], "plugin_operation", captureOptions()));
    const afterList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", captureOptions());
    const installedVersion = pluginVersionFromList(afterList, "agdf@agdf");
    if (installedVersion && installedVersion !== expectedVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Claude Code", "agdf@agdf", expectedVersion, installedVersion, "npx --yes @agdf/cli@latest claude"));
    }
    transaction.commit();
    return {
      surface: "claude",
      operation: migration.state === "owned_local_current" ? "update" : "install",
      expectedVersion,
      installedVersion,
      verificationStatus: installedVersion ? "healthy" : "degraded",
      evidence: ["durable_local_marketplace", `marketplace:${migration.state}`, "claude plugin list", ...(installedVersion ? [] : ["host_did_not_expose_version"])],
      nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    recoverMarketplace({ surface: "claude", exec, migration, transaction, error });
    throw error;
  }
}

function migrateMarketplace({ surface, exec, output, root, nativeOutput, migration }) {
  const classification = classifyMarketplaceList(surface, output, root);
  Object.assign(migration, classification);
  if (["conflict", "unknown"].includes(classification.state)) {
    throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF marketplace registration agdf (${classification.reason || classification.state}).`, classification);
  }
  const executable = surface === "claude" ? "claude" : "codex";
  if (classification.state === "legacy_github") {
    const args = surface === "claude"
      ? ["plugin", "marketplace", "remove", "agdf", "--scope", "user"]
      : ["plugin", "marketplace", "remove", "agdf", "--json"];
    nativeOutput.push(runPluginPhase(exec, executable, args, "marketplace", captureOptions()));
    migration.removedLegacy = true;
  }
  if (["absent", "legacy_github"].includes(classification.state)) {
    const args = surface === "claude"
      ? ["plugin", "marketplace", "add", root, "--scope", "user"]
      : ["plugin", "marketplace", "add", root, "--json"];
    nativeOutput.push(runPluginPhase(exec, executable, args, "marketplace", captureOptions()));
    migration.addedLocal = true;
  }
}

function recoverMarketplace({ surface, exec, migration, transaction, error }) {
  const executable = surface === "claude" ? "claude" : "codex";
  const recovery = [];
  const attempt = (args) => {
    try {
      exec(executable, args, captureOptions());
      recovery.push({ args, status: "restored" });
    } catch (rollbackError) {
      recovery.push({ args, status: "failed", message: commandErrorText(rollbackError) });
    }
  };
  if (migration?.addedLocal) {
    attempt(surface === "claude"
      ? ["plugin", "marketplace", "remove", "agdf", "--scope", "user"]
      : ["plugin", "marketplace", "remove", "agdf", "--json"]);
  }
  if (migration?.removedLegacy && migration.source) {
    attempt(surface === "claude"
      ? ["plugin", "marketplace", "add", migration.source, "--scope", "user"]
      : ["plugin", "marketplace", "add", migration.source, "--json"]);
  }
  try {
    transaction.rollback();
    recovery.push({ filesystem: transaction.root, status: "restored" });
  } catch (rollbackError) {
    recovery.push({ filesystem: transaction.root, status: "failed", message: rollbackError.message });
  }
  error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
}

function captureOptions() {
  return { encoding: "utf8", stdio: "pipe" };
}

export function inspectPluginSurface(surface, exec = execFileSync, options = {}) {
  const executable = surface === "claude" ? "claude" : "codex";
  const pluginId = "agdf@agdf";
  try {
    const output = exec(executable, ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const installed = pluginListHasPlugin(output, pluginId);
    const version = installed ? pluginVersionFromList(output, pluginId) : "";
    let localDevelopmentVersion = false;
    if (surface === "codex" && isCodexLocalInstallVersion(pluginDefinition.version, version)) {
      try {
        localDevelopmentVersion = inspectLocalMarketplaceProjection(options)?.codexInstallVersion === version;
      } catch {
        localDevelopmentVersion = false;
      }
    }
    return {
      status: !installed ? "not_installed" : version === pluginDefinition.version || localDevelopmentVersion ? "healthy" : "degraded",
      surface,
      version: version || null,
      expected_version: pluginDefinition.version,
      evidence: [`${executable} plugin list`, ...(localDevelopmentVersion ? [`canonical_version:${pluginDefinition.version}`, `local_install_version:${version}`] : []), ...(installed && !version ? ["host_did_not_expose_version"] : [])],
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
