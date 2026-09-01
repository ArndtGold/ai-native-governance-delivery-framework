import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { pluginDefinition } from "../cli/runtime-context.js";
import { digestNormalizedPluginSource } from "../runtime/plugin-provenance.js";
import { recoverClaudeCacheTemp } from "./claude-cache-recovery.js";
import { CODEX_REGISTRATION_REVISION, classifyMarketplaceList, inspectLocalMarketplaceProjection, inspectOwnedSharedMarketplaceForCopilotMigration, isCodexLocalInstallVersion, prepareCopilotMarketplace, prepareLocalMarketplace } from "./local-marketplace.js";

export const COPILOT_CLI_NPM_PACKAGE = "@github/copilot@1.0.80";

function historicalEvidenceEntries(transaction) {
  const historical = transaction.historicalEvidence;
  if (!historical) return [];
  return [
    `historical_release:${historical.releaseVersion}`,
    `historical_contract:${historical.contractId}`,
    `historical_contract_digest:${historical.contractDigest}`,
    `historical_entry_digest:${historical.entryDigest}`,
  ];
}

export function installCodexGlobalPlugin({ exec = execFileSync, prepare = prepareLocalMarketplace, dataRoot } = {}) {
  const expectedVersion = pluginDefinition.version;
  const nativeOutput = [];
  const transaction = prepare({ expectedVersion, codexRegistrationRevision: CODEX_REGISTRATION_REVISION, ...(dataRoot ? { dataRoot } : {}) });
  const expectedInstallVersion = transaction.codexInstallVersion ?? expectedVersion;
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false, refreshOwnedLocal: false, removedOwnedLocal: false };
  try {
    const marketplaceOutput = runPluginPhase(exec, "codex", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ surface: "codex", exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration, refreshOwnedLocal: transaction.changed === true });
    nativeOutput.push(runPluginPhase(exec, "codex", ["plugin", "add", "agdf@agdf", "--json"], "plugin_operation", captureOptions()));
    const listOutput = runPluginPhase(exec, "codex", ["plugin", "list"], "verification", captureOptions());
    const installedVersion = pluginVersionFromList(listOutput, "agdf@agdf");
    if (installedVersion !== expectedInstallVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Codex", "agdf@agdf", expectedInstallVersion, installedVersion, "npx --yes @agdf/cli@latest codex"));
    }
    transaction.commit();
    return {
      surface: "codex", operation: migration.state === "owned_local_current" ? "update" : "install", expectedVersion: expectedInstallVersion, canonicalVersion: expectedVersion, installedVersion, verificationStatus: "healthy",
      evidence: [
        "durable_local_marketplace",
        `marketplace:${migration.state}`,
        "codex plugin list",
        ...(transaction.pluginRoot ? [`staged_plugin_root:${transaction.pluginRoot}`, "staged_installation_provenance:matched"] : []),
        ...(transaction.sourceDigest ? [`source_digest:${transaction.sourceDigest}`] : []),
        ...(transaction.digest ? [`plugin_digest:${transaction.digest}`] : []),
        ...(transaction.existingClassification === "owned_pre_provenance_rebuild" ? ["marketplace_recovery:owned_pre_provenance_rebuild", "loaded_session:restart_required"] : []),
        ...(transaction.existingClassification === "owned_supported_historical_rebuild" ? ["marketplace_recovery:owned_supported_historical_rebuild", "loaded_session:fresh_session_required"] : []),
        ...historicalEvidenceEntries(transaction),
        ...(expectedInstallVersion === expectedVersion ? [] : [`canonical_version:${expectedVersion}`, `local_install_version:${expectedInstallVersion}`]),
      ],
      pluginRoot: transaction.pluginRoot ?? null,
      digest: transaction.digest ?? null,
      runtimeDigest: transaction.runtimeDigest ?? null,
      sourceDigest: transaction.sourceDigest ?? null,
      historicalEvidence: transaction.historicalEvidence ?? null,
      nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    recoverMarketplace({ surface: "codex", exec, migration, transaction, error });
    throw error;
  }
}

export function installClaudeGlobalPlugin({
  exec = execFileSync,
  prepare = prepareLocalMarketplace,
  dataRoot,
  recoverCache = recoverClaudeCacheTemp,
  cacheRecoveryOptions = {},
} = {}) {
  const expectedVersion = pluginDefinition.version;
  const nativeOutput = [];
  const transaction = prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}) });
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false };
  let previousPluginRemoved = false;
  let pluginInstalled = false;
  try {
    const marketplaceOutput = runPluginPhase(exec, "claude", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ surface: "claude", exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration });
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "marketplace", "update", "agdf"], "marketplace", captureOptions()));
    const beforeList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", captureOptions());
    const alreadyInstalled = pluginListHasPlugin(beforeList, "agdf@agdf");
    // `claude plugin update` keeps the cached copy when the version is unchanged, so a
    // same-version local source change never reaches the host; reinstall replaces the content.
    if (alreadyInstalled) {
      nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "uninstall", "agdf@agdf"], "plugin_operation", captureOptions()));
      previousPluginRemoved = true;
    }
    let cacheRecovery = null;
    try {
      nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "install", "agdf@agdf"], "plugin_operation", captureOptions()));
      pluginInstalled = true;
    } catch (installError) {
      cacheRecovery = recoverCache({
        error: installError,
        expectedVersion,
        ...cacheRecoveryOptions,
      });
      if (cacheRecovery.status !== "recovered") {
        installError.evidence = {
          ...(installError.evidence ?? {}),
          claude_cache_recovery: cacheRecovery.reason,
        };
        throw installError;
      }
      try {
        nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "install", "agdf@agdf"], "plugin_operation", captureOptions()));
        pluginInstalled = true;
      } catch (retryError) {
        retryError.evidence = {
          ...(retryError.evidence ?? {}),
          claude_cache_recovery: "claude_cache_temp_retry_exhausted",
        };
        throw retryError;
      }
    }
    const afterList = runPluginPhase(exec, "claude", ["plugin", "list"], "verification", captureOptions());
    const installedVersion = pluginVersionFromList(afterList, "agdf@agdf");
    const historicalRebuild = transaction.existingClassification === "owned_supported_historical_rebuild";
    if ((historicalRebuild && installedVersion !== expectedVersion)
        || (installedVersion && installedVersion !== expectedVersion)) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Claude Code", "agdf@agdf", expectedVersion, installedVersion, "npx --yes @agdf/cli@latest claude"));
    }
    transaction.commit();
    return {
      surface: "claude",
      operation: migration.state === "owned_local_current" ? "update" : "install",
      expectedVersion,
      installedVersion,
      verificationStatus: installedVersion ? "healthy" : "degraded",
      evidence: [
        "durable_local_marketplace",
        `marketplace:${migration.state}`,
        "claude plugin list",
        ...(transaction.pluginRoot ? [`staged_plugin_root:${transaction.pluginRoot}`, "staged_installation_provenance:matched"] : []),
        ...(transaction.sourceDigest ? [`source_digest:${transaction.sourceDigest}`] : []),
        ...(transaction.digest ? [`plugin_digest:${transaction.digest}`] : []),
        ...(transaction.existingClassification === "owned_pre_provenance_rebuild" ? ["marketplace_recovery:owned_pre_provenance_rebuild", "loaded_session:restart_required"] : []),
        ...(transaction.existingClassification === "owned_supported_historical_rebuild" ? ["marketplace_recovery:owned_supported_historical_rebuild", "loaded_session:fresh_session_required"] : []),
        ...historicalEvidenceEntries(transaction),
        ...(cacheRecovery?.status === "recovered" ? ["claude_cache_temp_recovery:bounded_retry"] : []),
        ...(installedVersion ? [] : ["host_did_not_expose_version"]),
      ],
      pluginRoot: transaction.pluginRoot ?? null,
      digest: transaction.digest ?? null,
      runtimeDigest: transaction.runtimeDigest ?? null,
      sourceDigest: transaction.sourceDigest ?? null,
      historicalEvidence: transaction.historicalEvidence ?? null,
      nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    recoverMarketplace({ surface: "claude", exec, migration, transaction, error, previousPluginRemoved, pluginInstalled });
    throw error;
  }
}

export function installCopilotGlobalPlugin({ exec = execFileSync, packagedCopilotExec = execFileSync, prepare = prepareCopilotMarketplace, dataRoot, pluginRoot } = {}) {
  const expectedVersion = pluginDefinition.version;
  const transaction = pluginRoot ? null : prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}) });
  const effectivePluginRoot = pluginRoot ?? transaction?.pluginRoot;
  if (!effectivePluginRoot) throw lifecycleAdapterError("package", "AGDF Copilot plugin root is required.");
  let runtimeManifest;
  try {
    runtimeManifest = JSON.parse(readFileSync(join(effectivePluginRoot, "runtime", "runtime-manifest.json"), "utf8"));
  } catch (error) {
    transaction?.rollback();
    throw lifecycleAdapterError("package", `AGDF Copilot runtime manifest is unavailable: ${error.message}`);
  }
  const sourceDigest = transaction?.sourceDigest || digestNormalizedPluginSource(effectivePluginRoot, expectedVersion);
  let before = "";
  let activeExec = exec;
  const bootstrapEvidence = [];
  try {
    before = activeExec("copilot", ["plugin", "list"], captureOptions());
  } catch (error) {
    if (error?.code !== "ENOENT") {
      transaction?.rollback();
      throw lifecycleAdapterError("verification", commandErrorText(error), { executable: "copilot", args: ["plugin", "list"] });
    }
    const invocation = copilotNpmInvocation();
    activeExec = (_executable, args, options) => packagedCopilotExec(invocation.executable, [...invocation.args, ...args], options);
    try {
      before = activeExec("copilot", ["plugin", "list"], captureOptions());
      bootstrapEvidence.push("copilot_cli_not_found", `copilot_cli_npm_package:${COPILOT_CLI_NPM_PACKAGE}`);
    } catch (bootstrapError) {
      transaction?.commit();
      return {
        surface: "copilot", operation: "install", expectedVersion, installedVersion: null,
        verificationStatus: "unavailable", manualHandoff: true,
        evidence: ["copilot_cli_not_found", `copilot_cli_npm_bootstrap_failed:${commandErrorText(bootstrapError)}`, "durable_local_plugin_stage", `local_plugin_root:${effectivePluginRoot}`, `source_digest:${sourceDigest}`],
        pluginRoot: effectivePluginRoot, runtimeDigest: runtimeManifest.digest, sourceDigest, nativeOutput: [],
      };
    }
  }
  const directInstalled = pluginListHasPlugin(before, "agdf");
  const marketplaceInstalled = pluginListHasPlugin(before, "agdf@agdf");
  let legacySharedProjection = null;
  if (transaction) {
    try { legacySharedProjection = inspectOwnedSharedMarketplaceForCopilotMigration({ ...(dataRoot ? { dataRoot } : {}), expectedVersion }); } catch {}
  }
  let marketplaceAdded = false;
  let legacyMarketplaceRemoved = false;
  let marketplacePluginRemoved = false;
  let directRemoved = false;
  try {
    const nativeOutput = [];
    const marketplaceOutput = runPluginPhase(activeExec, "copilot", ["plugin", "marketplace", "list"], "marketplace", captureOptions());
    const marketplace = classifyCopilotMarketplaceList(
      marketplaceOutput,
      transaction?.root ?? resolve(effectivePluginRoot, "..", ".."),
      { ownedLegacyRoots: legacySharedProjection ? [legacySharedProjection.root] : [] },
    );
    if (marketplace.state === "conflict") {
      throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF Copilot marketplace registration agdf (${marketplace.source || "unknown source"}).`);
    }
    if (marketplace.state === "owned_legacy_shared") {
      if (marketplaceInstalled) {
        nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "uninstall", "agdf@agdf"], "plugin_operation", captureOptions()));
        marketplacePluginRemoved = true;
      }
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "marketplace", "remove", "agdf"], "marketplace", captureOptions()));
      legacyMarketplaceRemoved = true;
    }
    if (["absent", "owned_legacy_shared"].includes(marketplace.state)) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "marketplace", "add", transaction?.root ?? resolve(effectivePluginRoot, "..", "..")], "marketplace", captureOptions()));
      marketplaceAdded = true;
    }
    if (marketplace.state === "owned_local_current" && marketplaceInstalled) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "uninstall", "agdf@agdf"], "plugin_operation", captureOptions()));
      marketplacePluginRemoved = true;
    }
    if (directInstalled) {
      nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "uninstall", "agdf"], "plugin_operation", captureOptions()));
      directRemoved = true;
    }
    nativeOutput.push(runPluginPhase(activeExec, "copilot", ["plugin", "install", "agdf@agdf"], "plugin_operation", captureOptions()));
    const after = runPluginPhase(activeExec, "copilot", ["plugin", "list"], "verification", captureOptions());
    const installed = pluginListHasPlugin(after, "agdf@agdf");
    const installedVersion = installed ? pluginVersionFromList(after, "agdf@agdf") : "";
    if (!installed) throw lifecycleAdapterError("verification", "AGDF was not present in copilot plugin list after installation.");
    if (installedVersion && installedVersion !== expectedVersion) {
      throw lifecycleAdapterError("version", versionMismatchMessage("GitHub Copilot", "agdf", expectedVersion, installedVersion, "npx --yes @agdf/cli@latest copilot"));
    }
    transaction?.commit();
    return {
      surface: "copilot", operation: directInstalled || marketplaceInstalled ? "update" : "install", expectedVersion,
      installedVersion: installedVersion || null, verificationStatus: installedVersion ? "healthy" : "degraded",
      manualHandoff: false,
      evidence: [...bootstrapEvidence, "durable_local_plugin_stage", "copilot plugin marketplace list", ...(marketplaceAdded ? ["copilot plugin marketplace add"] : ["marketplace:owned_local_current"]), ...(legacyMarketplaceRemoved ? ["shared_marketplace_registration_migrated"] : []), ...(directRemoved ? ["direct_install_migrated"] : []), "copilot plugin install agdf@agdf", "copilot plugin list", `local_plugin_root:${effectivePluginRoot}`, `source_digest:${sourceDigest}`, ...(installedVersion ? [] : ["host_did_not_expose_version"])],
      pluginRoot: effectivePluginRoot, runtimeDigest: runtimeManifest.digest, sourceDigest, nativeOutput: nativeOutput.filter(Boolean).map(String),
    };
  } catch (error) {
    transaction?.rollback();
    if (directRemoved) {
      try {
        activeExec("copilot", ["plugin", "install", effectivePluginRoot], captureOptions());
      } catch (recoveryError) {
        error.evidence = { ...(error.evidence ?? {}), direct_install_recovery: commandErrorText(recoveryError) };
      }
    }
    if (marketplaceAdded) {
      try {
        activeExec("copilot", ["plugin", "marketplace", "remove", "agdf"], captureOptions());
      } catch (recoveryError) {
        error.evidence = { ...(error.evidence ?? {}), marketplace_recovery: commandErrorText(recoveryError) };
      }
    }
    if (legacyMarketplaceRemoved && legacySharedProjection) {
      try {
        activeExec("copilot", ["plugin", "marketplace", "add", legacySharedProjection.root], captureOptions());
        if (marketplacePluginRemoved) activeExec("copilot", ["plugin", "install", "agdf@agdf"], captureOptions());
      } catch (recoveryError) {
        error.evidence = { ...(error.evidence ?? {}), legacy_marketplace_recovery: commandErrorText(recoveryError) };
      }
    } else if (marketplacePluginRemoved) {
      try {
        activeExec("copilot", ["plugin", "install", "agdf@agdf"], captureOptions());
      } catch (recoveryError) {
        error.evidence = { ...(error.evidence ?? {}), marketplace_plugin_recovery: commandErrorText(recoveryError) };
      }
    }
    throw error;
  }
}

export function classifyCopilotMarketplaceList(output, expectedRoot, { ownedLegacyRoots = [] } = {}) {
  const line = String(output || "").split(/\r?\n/).find((entry) => /^\s*[◆•]?\s*agdf\s+\(/.test(entry));
  if (!line) return { state: "absent", source: "" };
  const local = line.match(/\(Local:\s*(.+)\)\s*$/);
  if (!local) return { state: "conflict", source: line.trim() };
  if (resolve(local[1]) === resolve(expectedRoot)) return { state: "owned_local_current", source: local[1] };
  if (ownedLegacyRoots.some((root) => resolve(root) === resolve(local[1]))) return { state: "owned_legacy_shared", source: local[1] };
  return { state: "conflict", source: local[1] };
}

export function copilotNpmInvocation({ env = process.env, platform = process.platform, execPath = process.execPath } = {}) {
  const args = ["exec", "--yes", `--package=${COPILOT_CLI_NPM_PACKAGE}`, "--", "copilot"];
  if (env.npm_execpath) return { executable: execPath, args: [env.npm_execpath, ...args] };
  return { executable: platform === "win32" ? "npm.cmd" : "npm", args };
}

export function setCopilotPluginEnabled({ enabled, exec = execFileSync } = {}) {
  if (typeof enabled !== "boolean") throw lifecycleAdapterError("plugin_operation", "Copilot plugin enabled state must be boolean.");
  const operation = enabled ? "enable" : "disable";
  try {
    const nativeOutput = runPluginPhase(exec, "copilot", ["plugin", operation, "agdf"], "plugin_operation", captureOptions());
    const listOutput = runPluginPhase(exec, "copilot", ["plugin", "list"], "verification", captureOptions());
    if (!pluginListHasPlugin(listOutput, "agdf") && !pluginListHasPlugin(listOutput, "agdf@agdf")) {
      throw lifecycleAdapterError("verification", "AGDF was not present in copilot plugin list after the state change.");
    }
    return {
      surface: "copilot",
      requestedState: enabled ? "enabled" : "disabled",
      status: "command_accepted_host_state_unverified",
      evidence: [`copilot plugin ${operation} agdf`, "copilot plugin list", "fresh_session_required"],
      nativeOutput: String(nativeOutput || ""),
    };
  } catch (error) {
    if (/\bmanaged\b/i.test(commandErrorText(error))) {
      return {
        surface: "copilot", requestedState: enabled ? "enabled" : "disabled", status: "managed",
        evidence: ["managed_policy_precedence", commandErrorText(error)], nativeOutput: "",
      };
    }
    throw error;
  }
}

function migrateMarketplace({ surface, exec, output, root, nativeOutput, migration, refreshOwnedLocal = false }) {
  const classification = classifyMarketplaceList(surface, output, root);
  Object.assign(migration, classification);
  if (["conflict", "unknown"].includes(classification.state)) {
    throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF marketplace registration agdf (${classification.reason || classification.state}).`, classification);
  }
  const executable = surface === "claude" ? "claude" : "codex";
  if (surface === "codex" && classification.state === "owned_local_current" && refreshOwnedLocal) {
    migration.refreshOwnedLocal = true;
    nativeOutput.push(runPluginPhase(exec, executable, ["plugin", "marketplace", "remove", "agdf", "--json"], "marketplace", captureOptions()));
    migration.removedOwnedLocal = true;
    nativeOutput.push(runPluginPhase(exec, executable, ["plugin", "marketplace", "add", root, "--json"], "marketplace", captureOptions()));
    migration.addedLocal = true;
    return;
  }
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

function recoverMarketplace({
  surface,
  exec,
  migration,
  transaction,
  error,
  previousPluginRemoved = false,
  pluginInstalled = false,
}) {
  const executable = surface === "claude" ? "claude" : "codex";
  const recovery = [];
  const attempt = (args) => {
    try {
      exec(executable, args, captureOptions());
      recovery.push({ args, status: "restored" });
      return true;
    } catch (rollbackError) {
      recovery.push({ args, status: "failed", message: commandErrorText(rollbackError) });
      return false;
    }
  };
  if (migration?.refreshOwnedLocal) {
    if (surface === "claude" && pluginInstalled) {
      attempt(["plugin", "uninstall", "agdf@agdf"]);
    }
    const refreshedRegistrationRemoved = migration.addedLocal
      ? attempt(["plugin", "marketplace", "remove", "agdf", "--json"])
      : true;
    const filesystemRestored = rollbackMarketplaceFilesystem(transaction, recovery);
    if (migration.removedOwnedLocal && refreshedRegistrationRemoved) {
      attempt(["plugin", "marketplace", "add", migration.source || transaction.root, "--json"]);
    }
    if (surface === "claude" && previousPluginRemoved && filesystemRestored) {
      attempt(["plugin", "install", "agdf@agdf"]);
    }
    error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
    return;
  }
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
  if (surface === "claude" && pluginInstalled) {
    attempt(["plugin", "uninstall", "agdf@agdf"]);
  }
  const filesystemRestored = rollbackMarketplaceFilesystem(transaction, recovery);
  if (surface === "claude" && previousPluginRemoved && filesystemRestored) {
    attempt(["plugin", "install", "agdf@agdf"]);
  }
  error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
}

function rollbackMarketplaceFilesystem(transaction, recovery) {
  try {
    transaction.rollback();
    recovery.push({ filesystem: transaction.root, status: "restored" });
    return true;
  } catch (rollbackError) {
    recovery.push({ filesystem: transaction.root, status: "failed", message: rollbackError.message });
    return false;
  }
}

function captureOptions() {
  return { encoding: "utf8", stdio: "pipe" };
}

export function inspectPluginSurface(surface, exec = execFileSync, options = {}) {
  const executable = surface === "claude" ? "claude" : surface === "copilot" ? "copilot" : "codex";
  try {
    const output = exec(executable, ["plugin", "list"], { encoding: "utf8", stdio: "pipe" });
    const pluginId = surface === "copilot" && !pluginListHasPlugin(output, "agdf@agdf") ? "agdf" : "agdf@agdf";
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
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return output
    .split(/\r?\n/)
    .some((line) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(line));
}

const VERSION_PATTERN = "v?(\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)?)";

export function pluginVersionFromList(output, pluginId) {
  const escapedPluginId = pluginId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lines = output.split(/\r?\n/);
  const entryIndex = lines.findIndex((entry) => new RegExp(`(^|\\s)${escapedPluginId}(\\s|$)`).test(entry));
  if (entryIndex < 0) return "";
  const sameLine = lines[entryIndex].match(new RegExp(`\\b${VERSION_PATTERN}\\b`));
  if (sameLine) return sameLine[1];
  // Current `claude plugin list` prints the plugin id and its `Version:` on separate
  // lines; scan the entry's block until the next plugin id line.
  for (let index = entryIndex + 1; index < lines.length; index += 1) {
    if (/\S+@\S+/.test(lines[index])) break;
    const blockMatch = lines[index].match(new RegExp(`\\bVersion:?\\s*${VERSION_PATTERN}\\b`, "i"));
    if (blockMatch) return blockMatch[1];
  }
  return "";
}

function versionMismatchMessage(surface, pluginId, expectedVersion, installedVersion, correctiveCommand) {
  return `AGDF ${surface} plugin version mismatch for ${pluginId}: expected ${expectedVersion}, observed ${installedVersion || "unknown"}. Refresh with: ${correctiveCommand}`;
}
