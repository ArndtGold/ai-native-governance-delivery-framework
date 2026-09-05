import { inspectPluginList } from "../../installers/plugin-command.js";
import { execFileSync } from "node:child_process";
import { pluginDefinition } from "../../cli/runtime-context.js";
import { historicalEvidenceEntries, rollbackMarketplaceFilesystem, captureOptions, runPluginPhase, lifecycleAdapterError, pluginListHasPlugin, pluginVersionFromList, versionMismatchMessage, recoveryAttempt } from "../../installers/plugin-command.js";
import { classifyMarketplaceList, prepareLocalMarketplace } from "../../installers/local-marketplace.js";
import { recoverClaudeCacheTemp } from "../../installers/claude-cache-recovery.js";

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
    migrateMarketplace({ exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration });
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
    recoverMarketplace({ exec, migration, transaction, error, previousPluginRemoved, pluginInstalled });
    throw error;
  }
}

function migrateMarketplace({ exec, output, root, nativeOutput, migration }) {
  const classification = classifyMarketplaceList("claude", output, root);
  Object.assign(migration, classification);
  if (["conflict", "unknown"].includes(classification.state)) {
    throw lifecycleAdapterError("marketplace", `Refusing to replace non-AGDF marketplace registration agdf (${classification.reason || classification.state}).`, classification);
  }
  if (classification.state === "legacy_github") {
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "marketplace", "remove", "agdf", "--scope", "user"], "marketplace", captureOptions()));
    migration.removedLegacy = true;
  }
  if (["absent", "legacy_github"].includes(classification.state)) {
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "marketplace", "add", root, "--scope", "user"], "marketplace", captureOptions()));
    migration.addedLocal = true;
  }
}

function recoverMarketplace({ exec, migration, transaction, error, previousPluginRemoved = false, pluginInstalled = false }) {
  const recovery = [];
  const attempt = recoveryAttempt(exec, "claude", recovery);
  if (migration?.addedLocal) attempt(["plugin", "marketplace", "remove", "agdf", "--scope", "user"]);
  if (migration?.removedLegacy && migration.source) attempt(["plugin", "marketplace", "add", migration.source, "--scope", "user"]);
  if (pluginInstalled) attempt(["plugin", "uninstall", "agdf@agdf"]);
  const filesystemRestored = rollbackMarketplaceFilesystem(transaction, recovery);
  if (previousPluginRemoved && filesystemRestored) attempt(["plugin", "install", "agdf@agdf"]);
  error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
}

export function inspectClaudePlugin(exec = execFileSync) {
  return inspectPluginList({ surface: "claude", exec, executable: "claude", args: ["plugin", "list"], expectedVersion: pluginDefinition.version,
    selectPlugin: () => "agdf@agdf",
  });
}

export const uninstallCommand = () => ({ executable: "claude", args: ["plugin", "uninstall", "agdf@agdf", "--scope", "user"] });

export const bootstrapCommands = () => ({ install: "npx --yes @agdf/cli@latest claude", repository: "npx --yes @agdf/cli@latest claude-repo" });
