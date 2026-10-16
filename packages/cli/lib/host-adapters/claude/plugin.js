import process from "node:process";
import { inspectPluginList } from "../../installers/plugin-command.js";
import { execHostFileSync } from "../../host-command.js";
import { pluginDefinition } from "../../cli/runtime-context.js";
import { historicalEvidenceEntries, rollbackMarketplaceFilesystem, captureOptions, runPluginPhase, lifecycleAdapterError, pluginListHasPlugin, pluginVersionFromList, versionMismatchMessage, recoveryAttempt } from "../../installers/plugin-command.js";
import { classifyMarketplaceList, prepareLocalMarketplace } from "../../installers/local-marketplace.js";
import { recoverClaudeCacheTemp } from "../../installers/claude-cache-recovery.js";
import { packagedAppCopiesHealthy, packagedAppCopyEvidence, reconcilePackagedAppMarketplaceCopies } from "../../installers/packaged-app-marketplace.js";
import { compareInstallationProvenance, detectPackagedAppProcess, readClaudeInstallationRecord, readInstallationDigests, removeClaudeInstallationRecord, writeClaudeInstallationRecord } from "#agdf-core/runtime/host-installation.js";
import { prepareClaudePluginMcp, migrateLegacyClaudeMcpRegistration } from "./plugin-mcp.js";
import { loadedClaudeSessions, loadedSessionEvidence, loadedSessionLockHint } from "./loaded-sessions.js";

const PLUGIN_ID = "agdf@agdf";

export function packagedAppRefusal(packageName) {
  return `AGDF install refused: this process runs inside the packaged app ${packageName}, whose %LOCALAPPDATA% writes stay private to that app. Run the installation from a terminal outside ${packageName}.`;
}

// Runs before any marketplace, data-root or host-registration change: an install from inside a packaged
// app would only update that app's private copy and stay invisible to every other process.
export function preflightClaudeInstall({ env = process.env, platform = process.platform, detect = detectPackagedAppProcess } = {}) {
  const verdict = detect({ env, platform });
  if (verdict.status === "inside_package") {
    throw lifecycleAdapterError("packaged_app", packagedAppRefusal(verdict.package), { packaged_app: verdict.package });
  }
  return [`packaged_app_preflight:${verdict.status}${verdict.reason ? `:${verdict.reason}` : ""}`];
}

// Claude Code lists plugins as JSON; hosts without --json keep the text listing. The user-scope entry
// is the one this installer manages; `enabled` is unknown (null) when only text is available.
export function readClaudePluginState(exec) {
  try {
    const parsed = JSON.parse(String(exec("claude", ["plugin", "list", "--json"], captureOptions()) ?? ""));
    if (!Array.isArray(parsed)) throw new Error("plugin list JSON is not an array");
    const entries = parsed.filter((item) => item?.id === PLUGIN_ID);
    // Entries of other scopes belong to single projects; only a user-scope entry serves every session.
    const entry = entries.some((item) => typeof item.scope === "string")
      ? entries.find((item) => item.scope === "user")
      : entries[0];
    return Object.freeze({
      source: "json",
      installed: Boolean(entry),
      version: typeof entry?.version === "string" ? entry.version : "",
      enabled: entry ? entry.enabled !== false : null,
      installPath: typeof entry?.installPath === "string" ? entry.installPath : null,
    });
  } catch {
    const output = String(runPluginPhase(exec, "claude", ["plugin", "list"], "verification", captureOptions()) ?? "");
    const installed = pluginListHasPlugin(output, PLUGIN_ID);
    return Object.freeze({
      source: "text_fallback",
      installed,
      version: installed ? pluginVersionFromList(output, PLUGIN_ID) : "",
      enabled: null,
      installPath: null,
    });
  }
}

// Compares the committed provenance with what Claude Code can load: the marketplace plugin root it
// serves in place, the installation record every process can read and, whenever Claude Code lists it,
// the cached copy a copying host serves.
export function verifyClaudeInstallation({ transaction, pluginState, env = process.env, readRecord = readClaudeInstallationRecord }) {
  const expected = { source_digest: transaction.sourceDigest, runtime_digest: transaction.runtimeDigest };
  const observations = [
    ["marketplace", transaction.pluginRoot ? readInstallationDigests(transaction.pluginRoot) : null],
    ["record", readRecord({ env })],
    ...(pluginState?.installPath ? [["cache", readInstallationDigests(pluginState.installPath)]] : []),
  ].map(([name, observed]) => ({ name, observed, status: compareInstallationProvenance(expected, observed) }));
  const status = observations.some((item) => item.status === "mismatch") ? "mismatch"
    : observations.every((item) => item.status === "matched") ? "matched" : "unknown";
  return Object.freeze({
    status,
    evidence: [
      `installation_verification:${status}`,
      ...observations.filter((item) => item.status !== "matched").map(({ name, observed, status: itemStatus }) =>
        `installation_verification:${name}:${itemStatus}:expected=${expected.source_digest}/${expected.runtime_digest}:observed=${observed ? `${observed.source_digest}/${observed.runtime_digest}` : "none"}`),
    ],
  });
}

export function installClaudeGlobalPlugin({
  exec = execHostFileSync,
  prepare = prepareLocalMarketplace,
  dataRoot,
  recoverCache = recoverClaudeCacheTemp,
  cacheRecoveryOptions = {},
  env = process.env,
  migrateMcp = migrateLegacyClaudeMcpRegistration,
  prepareMcp = prepareClaudePluginMcp,
  loadedSessions = loadedClaudeSessions,
  reconcilePackagedCopies = reconcilePackagedAppMarketplaceCopies,
  preflight = preflightClaudeInstall,
  recordInstallation = writeClaudeInstallationRecord,
  removeInstallationRecord = removeClaudeInstallationRecord,
  verifyInstallation = verifyClaudeInstallation,
} = {}) {
  const expectedVersion = pluginDefinition.version;
  const preflightEvidence = preflight({ env });
  const nativeOutput = [];
  const sessions = loadedSessions({ env });
  let transaction;
  try {
    transaction = prepare({ expectedVersion, ...(dataRoot ? { dataRoot } : {}) });
  } catch (error) {
    throw loadedSessionLockHint(error, sessions);
  }
  const migration = { state: "unknown", source: "", addedLocal: false, removedLegacy: false };
  let previousPluginRemoved = false;
  let pluginInstalled = false;
  let pluginOperation = "unchanged";
  let cacheRecovery = null;
  let after;
  let installedVersion;
  let commitResult;
  const installPlugin = () => {
    try {
      nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "install", PLUGIN_ID], "plugin_operation", captureOptions()));
      pluginInstalled = true;
    } catch (installError) {
      cacheRecovery = recoverCache({ error: installError, expectedVersion, ...cacheRecoveryOptions });
      if (cacheRecovery.status !== "recovered") {
        installError.evidence = { ...(installError.evidence ?? {}), claude_cache_recovery: cacheRecovery.reason };
        throw installError;
      }
      try {
        nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "install", PLUGIN_ID], "plugin_operation", captureOptions()));
        pluginInstalled = true;
      } catch (retryError) {
        retryError.evidence = { ...(retryError.evidence ?? {}), claude_cache_recovery: "claude_cache_temp_retry_exhausted" };
        throw retryError;
      }
    }
  };
  try {
    const marketplaceOutput = runPluginPhase(exec, "claude", ["plugin", "marketplace", "list", "--json"], "marketplace", captureOptions());
    migrateMarketplace({ exec, output: marketplaceOutput, root: transaction.root, nativeOutput, migration });
    nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "marketplace", "update", "agdf"], "marketplace", captureOptions()));
    const before = readClaudePluginState(exec);
    // Claude Code loads the owned directory marketplace in place, but a host that serves its cached copy
    // sees new content only after a reinstall. Reinstall exactly when that copy does not carry the
    // committed content or cannot be inspected; an unchanged install then opens no window without plugin.
    const committed = { source_digest: transaction.sourceDigest, runtime_digest: transaction.runtimeDigest };
    const cacheCurrent = Boolean(before.installPath)
      && compareInstallationProvenance(committed, readInstallationDigests(before.installPath)) === "matched";
    if (!before.installed) {
      installPlugin();
      pluginOperation = "installed";
    } else if (before.version !== expectedVersion || !cacheCurrent) {
      nativeOutput.push(runPluginPhase(exec, "claude", ["plugin", "uninstall", PLUGIN_ID, "--keep-data"], "plugin_operation", captureOptions()));
      previousPluginRemoved = true;
      installPlugin();
      pluginOperation = "reinstalled";
    }
    after = readClaudePluginState(exec);
    installedVersion = after.version;
    const historicalRebuild = transaction.existingClassification === "owned_supported_historical_rebuild";
    if ((historicalRebuild && installedVersion !== expectedVersion)
        || (installedVersion && installedVersion !== expectedVersion)) {
      throw lifecycleAdapterError("version", versionMismatchMessage("Claude Code", PLUGIN_ID, expectedVersion, installedVersion, "npx --yes @agdf/cli@latest claude"));
    }
    commitResult = transaction.commit({ tolerateCleanupFailure: true }) ?? { cleanup: "none" };
  } catch (error) {
    recoverMarketplace({ exec, migration, transaction, error, previousPluginRemoved, pluginInstalled });
    throw error;
  }

  // From the commit on the new state is what Claude Code serves; every later step reports, none rolls back.
  const guarded = (operation, fallback) => {
    try { return operation(); } catch (error) { return fallback(error); }
  };
  const recordStatus = transaction.pluginRoot
    ? guarded(() => {
      recordInstallation({
        pluginRoot: transaction.pluginRoot,
        marketplaceRoot: transaction.root,
        sourceDigest: transaction.sourceDigest,
        runtimeDigest: transaction.runtimeDigest,
        env,
      });
      return "written";
    }, (error) => {
      // A previous record would now describe another install and make every session report drift.
      const stale = guarded(() => { removeInstallationRecord({ env }); return "stale_removed"; }, () => "stale_kept");
      return `failed:${error?.code || "write_failed"}:${stale}`;
    })
    : "not_applicable";
  // Claude Code loads this plugin in place from the marketplace, so a packaged host's private copy of
  // it would keep serving the previous state to its sessions. Also checked when nothing changed here.
  const packagedCopies = guarded(
    () => reconcilePackagedCopies({ root: transaction.root, sourceDigest: transaction.sourceDigest, pluginDigest: transaction.digest, env }),
    () => null,
  );
  const packagedCopiesHealthy = Boolean(packagedCopies) && packagedAppCopiesHealthy(packagedCopies);
  const verification = guarded(
    () => verifyInstallation({ transaction, pluginState: after, env }),
    (error) => ({ status: "unknown", evidence: [`installation_verification:unknown:${error?.code || "check_failed"}`] }),
  );
  // Both steps are best effort: the plugin already works, and the launcher installs the MCP runtime
  // on first start when the prewarm could not run.
  const mcpEvidence = guarded(() => [
    ...migrateMcp({ exec, env }),
    ...(transaction.pluginRoot ? prepareMcp({ exec, env, pluginRoot: transaction.pluginRoot }) : []),
  ], () => ["claude_plugin_mcp:deferred_to_first_start"]);
  const cleanupPending = commitResult.cleanup === "pending";
  // A disabled plugin loads nothing in any session, whatever its files contain.
  const disabled = after.enabled === false;
  const healthy = Boolean(installedVersion) && packagedCopiesHealthy && verification.status === "matched"
    && recordStatus === "written" && !cleanupPending && !disabled;
  return {
    surface: "claude",
    operation: migration.state === "owned_local_current" ? "update" : "install",
    expectedVersion,
    installedVersion,
    verificationStatus: healthy ? "healthy" : "degraded",
    evidence: [
      "durable_local_marketplace",
      `marketplace:${migration.state}`,
      "claude plugin list",
      ...preflightEvidence,
      `plugin_list:${after.source}`,
      `plugin_operation:${pluginOperation}`,
      ...(disabled ? ["plugin_enabled:false", "plugin_enable_command:claude plugin enable agdf@agdf"] : []),
      ...(transaction.pluginRoot ? [`staged_plugin_root:${transaction.pluginRoot}`, "staged_installation_provenance:matched"] : []),
      ...(transaction.sourceDigest ? [`source_digest:${transaction.sourceDigest}`] : []),
      ...(transaction.digest ? [`plugin_digest:${transaction.digest}`] : []),
      ...(transaction.existingClassification === "owned_pre_provenance_rebuild" ? ["marketplace_recovery:owned_pre_provenance_rebuild", "loaded_session:restart_required"] : []),
      ...(transaction.existingClassification === "owned_supported_historical_rebuild" ? ["marketplace_recovery:owned_supported_historical_rebuild", "loaded_session:fresh_session_required"] : []),
      ...(transaction.existingClassification === "owned_damaged_rebuild" ? ["marketplace_recovery:owned_damaged_rebuild", "loaded_session:restart_required"] : []),
      ...historicalEvidenceEntries(transaction),
      ...loadedSessionEvidence(sessions),
      ...(cacheRecovery?.status === "recovered" ? ["claude_cache_temp_recovery:bounded_retry"] : []),
      ...(installedVersion ? [] : ["host_did_not_expose_version"]),
      `installation_record:${recordStatus}`,
      ...verification.evidence,
      ...(cleanupPending ? [`marketplace_cleanup:pending:${commitResult.reason}`] : []),
      ...(packagedCopies ? packagedAppCopyEvidence(packagedCopies) : ["packaged_app_copy:check_failed"]),
      ...mcpEvidence,
    ],
    packagedAppCopies: packagedCopies,
    pluginRoot: transaction.pluginRoot ?? null,
    digest: transaction.digest ?? null,
    runtimeDigest: transaction.runtimeDigest ?? null,
    sourceDigest: transaction.sourceDigest ?? null,
    historicalEvidence: transaction.historicalEvidence ?? null,
    nativeOutput: nativeOutput.filter(Boolean).map(String),
  };
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
  if (pluginInstalled) attempt(["plugin", "uninstall", PLUGIN_ID, "--keep-data"]);
  const filesystemRestored = rollbackMarketplaceFilesystem(transaction, recovery);
  if (previousPluginRemoved && filesystemRestored) attempt(["plugin", "install", PLUGIN_ID]);
  error.evidence = { ...(error.evidence ?? {}), rollback: recovery };
}

export function inspectClaudePlugin(exec = execHostFileSync) {
  return inspectPluginList({ surface: "claude", exec, executable: "claude", args: ["plugin", "list"], expectedVersion: pluginDefinition.version,
    selectPlugin: () => PLUGIN_ID,
  });
}

export const uninstallCommand = () => ({ executable: "claude", args: ["plugin", "uninstall", PLUGIN_ID, "--scope", "user"] });

export const bootstrapCommands = () => ({ install: "npx --yes @agdf/cli@latest claude", repository: "npx --yes @agdf/cli@latest claude-repo" });
