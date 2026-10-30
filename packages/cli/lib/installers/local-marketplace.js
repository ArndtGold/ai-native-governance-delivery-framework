import { ownerPlacement, assertOwnerPlacement } from '#agdf-core/owner-placement.js';
import { fsyncDirectory } from '#agdf-core/owned-file-lock.js';
import { randomUUID } from 'node:crypto';
import { CODEX_REGISTRATION_REVISION, codexLocalInstallVersion, isCodexLocalInstallVersion, marketplaceEntries as codexMarketplaceEntries } from "../host-adapters/codex/identity.js";
import { marketplaceEntries as claudeMarketplaceEntries } from "../host-adapters/claude/marketplace.js";
export { CODEX_REGISTRATION_REVISION, codexLocalInstallVersion, isCodexLocalInstallVersion } from "../host-adapters/codex/identity.js";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";
import process from "node:process";
import { generatedRoot, packageRoot, pluginDefinition } from "../cli/runtime-context.js";
import { renameSyncWithRetry } from "#agdf-core/fs-swap.js";
import { atomicWrite, withOwnedFileLock } from "#agdf-core/control-state/run-state-writer.js";
import { validateCockpitTransitionEvidence } from "../mcp-lifecycle/evidence.js";
import { inspectMcpExecutableRoot } from '../mcp-lifecycle/package.js';
import { pluginMcpRuntimeIdentity } from '../mcp-lifecycle/plugin-runtime.js';
import { createHash } from "node:crypto";
import { resolveControlCommandTarget } from "#agdf-core/control-state/approval-command-contract.js";
import { buildCopilotMarketplaceTransport, copilotMarketplaceSpec, COPILOT_TRANSPORT_REVISION, verifyCopilotMarketplaceTransport } from "./copilot-marketplace-transport.js";
import { classifyHistoricalDistributionProfile } from "#agdf-core/runtime/distribution-profile-history.js";
import {
  CODEX_PLUGIN_MCP_FILE,
  INSTALLATION_PROVENANCE_FILE,
  LEGACY_LOCAL_INSTALL_FILE,
  digestDirectory,
  renderCodexPluginMcpConfig,
  inspectCopilotPayloadInventory,
  digestNormalizedPluginSource,
  inspectInstallationProvenance,
  validateDistributionProfiles,
} from "#agdf-core/runtime/plugin-provenance.js";

const MARKETPLACE_ID = "agdf";
const OWNERSHIP_FILE = ".agdf-owned.json";
const LEGACY_REPOSITORY = "arndtgold/ai-native-governance-delivery-framework";

function pathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

function rootIdentity(path) {
  if (!existsSync(path)) return null;
  const type = lstatSync(path);
  if (type.isSymbolicLink() || !type.isDirectory()) throw new Error(`Unsafe AGDF marketplace root: ${path}`);
  return `${type.dev}:${type.ino}`;
}

function assertTransactionBackupIdentity(path, transaction) {
  if (transaction.schema_version === 2) {
    const stable = path.endsWith('.backup') ? path.slice(0, -7) : path;
    try { assertOwnerPlacement(transaction.previous_root_identity, path, 'marketplace-publication', stable); }
    catch (cause) { throw new Error(`AGDF marketplace backup identity changed: ${path}`, { cause }); }
    if (digestDirectory(path) !== transaction.previous_root_digest) throw Error('AGDF_MARKETPLACE_PRIOR_BYTES_CHANGED');
  } else if (rootIdentity(path) !== transaction.previous_root_identity || !transaction.previous_root_identity) {
    throw new Error(`AGDF marketplace backup identity changed: ${path}`);
  }
}

function assertTransactionStablePayload(path, transaction) {
  const stable = ownership(path);
  if (stable.plugin_digest !== transaction.plugin_digest || stable.version !== transaction.version
      || stable.profile_id !== transaction.profile_id
      || digestDirectory(join(path, "plugins", MARKETPLACE_ID)) !== stable.plugin_digest) {
    throw new Error(`AGDF marketplace stable payload changed: ${path}`);
  }
}

function readOptionalJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function digestPluginSource(root, canonicalVersion = pluginDefinition.version) {
  return digestNormalizedPluginSource(root, canonicalVersion);
}

export { digestDirectory };

function isSemanticVersion(version) {
  return typeof version === "string"
    && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version);
}

function localInstallSourceUnstable(detail) {
  const error = new Error(`AGDF local plugin source changed during snapshot capture: ${detail}`);
  error.code = "local_install_source_unstable";
  return error;
}

export function captureLocalPluginSnapshot({
  builtPluginRoot,
  expectedVersion = pluginDefinition.version,
  profileId = "runtime-plugin",
  adapters = {},
} = {}) {
  if (!builtPluginRoot) throw new Error("AGDF local plugin source root is required.");
  const sourceRoot = resolve(builtPluginRoot);
  const digest = adapters.digest ?? digestPluginSource;
  const createRoot = adapters.createRoot ?? (() => mkdtempSync(join(tmpdir(), "agdf-local-plugin-")));
  const copy = adapters.copy ?? ((source, target) => cpSync(source, target, { recursive: true }));
  const remove = adapters.remove ?? ((root) => rmSync(root, { recursive: true, force: true }));
  const beforeDigest = digest(sourceRoot, expectedVersion);
  let snapshotRoot = null;
  try {
    snapshotRoot = resolve(createRoot());
    const pluginRoot = join(snapshotRoot, "agdf");
    copy(sourceRoot, pluginRoot);
    const snapshotDigest = digest(pluginRoot, expectedVersion);
    const afterDigest = digest(sourceRoot, expectedVersion);
    if (beforeDigest !== snapshotDigest || snapshotDigest !== afterDigest) {
      throw localInstallSourceUnstable(
        `before=${beforeDigest}, snapshot=${snapshotDigest}, after=${afterDigest}`,
      );
    }
    const copilotProfile = profileId === "copilot-runtime-plugin";
    return Object.freeze({
      canonicalVersion: expectedVersion,
      profileId,
      pluginRoot,
      sourceDigest: snapshotDigest,
      codexInstallVersion: copilotProfile
        ? expectedVersion
        : codexLocalInstallVersion(expectedVersion, snapshotDigest),
      cleanup() {
        if (!snapshotRoot) return;
        const ownedRoot = snapshotRoot;
        remove(ownedRoot);
        snapshotRoot = null;
      },
    });
  } catch (error) {
    if (snapshotRoot) remove(snapshotRoot);
    throw error;
  }
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is invalid: ${error.message}`);
  }
}

function pathForPlatform(platform = process.platform) {
  return platform === "win32" ? win32 : posix;
}

export function defaultAgdfDataRoot({ env = process.env, platform = process.platform, home = homedir() } = {}) {
  const targetPath = pathForPlatform(platform);
  if (env.AGDF_DATA_DIR) return targetPath.resolve(env.AGDF_DATA_DIR);
  if (platform === "darwin") return targetPath.join(home, "Library", "Application Support", "agdf");
  if (platform === "win32") return targetPath.join(env.LOCALAPPDATA || env.APPDATA || targetPath.join(home, "AppData", "Local"), "agdf");
  return targetPath.join(env.XDG_DATA_HOME || targetPath.join(home, ".local", "share"), "agdf");
}

export function localMarketplaceRoot(options = {}) {
  return pathForPlatform(options.platform).join(defaultAgdfDataRoot(options), "marketplaces", MARKETPLACE_ID);
}

function ownership(root, { allowBuilding = false } = {}) {
  rootIdentity(root);
  if (!existsSync(join(root, OWNERSHIP_FILE))) {
    throw new Error(`Refusing marketplace path without AGDF ownership marker: ${root}`);
  }
  const marker = readJson(join(root, OWNERSHIP_FILE), "AGDF marketplace ownership marker");
  if (marker.schema_version !== 1 || marker.owner !== "create-agdf" || marker.marketplace_id !== MARKETPLACE_ID) {
    throw new Error(`Refusing marketplace path with invalid AGDF ownership marker: ${root}`);
  }
  if (marker.staging_state !== "ready" && !(allowBuilding && marker.staging_state === "building")) {
    throw new Error(`Refusing marketplace path with invalid AGDF staging state: ${root}`);
  }
  return marker;
}

function removeOwnedRoot(root, parent, options = {}) {
  if (!existsSync(root)) return;
  if (!pathInside(parent, root) || dirname(root) !== parent) throw new Error(`Refusing unsafe marketplace cleanup path: ${root}`);
  ownership(root, options);
  rmSync(root, { recursive: true, force: true });
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function codexMarketplace(definition = pluginDefinition) {
  return {
    name: MARKETPLACE_ID,
    interface: { displayName: definition.publicDistribution.publicDisplayName },
    plugins: [{
      name: definition.id,
      source: { source: "local", path: "./plugins/agdf" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: definition.category,
    }],
  };
}

function legacyCodexMarketplace(definition = pluginDefinition) {
  return {
    ...codexMarketplace(definition),
    interface: { displayName: definition.displayName },
  };
}

function claudeMarketplace(definition = pluginDefinition) {
  return {
    name: MARKETPLACE_ID,
    owner: { name: definition.displayName, email: "" },
    metadata: { description: definition.description },
    plugins: [{
      name: definition.id,
      source: "./plugins/agdf",
      description: definition.claudeDescription || definition.longDescription,
      category: definition.category,
    }],
  };
}

function copilotMarketplace(definition = pluginDefinition) {
  return {
    name: MARKETPLACE_ID,
    owner: { name: definition.displayName, email: "" },
    metadata: { description: definition.description, version: definition.version },
    plugins: [{
      name: definition.id,
      description: definition.copilotDescription || definition.longDescription,
      version: definition.version,
      source: "./plugins/agdf",
    }],
  };
}

function validateBuiltPlugin(pluginRoot, expectedVersion, expectedCodexInstallVersion = expectedVersion, sourceDigest = "", {
  requireInstallationProvenance = false,
  allowLegacyProvenanceForMigration = false,
  allowPreProvenanceShape = false,
  allowHistoricalProfilesForMigration = false,
  distributionProfileHistory = null,
  classifyHistoricalProfile = classifyHistoricalDistributionProfile,
  profileId = "runtime-plugin",
} = {}) {
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"), "built plugin definition");
  const runtime = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"), "built runtime manifest");
  const copilotProfile = profileId === "copilot-runtime-plugin";
  const codex = copilotProfile ? null : readJson(join(pluginRoot, ".codex-plugin", "plugin.json"), "built Codex plugin manifest");
  const claude = copilotProfile ? null : readJson(join(pluginRoot, ".claude-plugin", "plugin.json"), "built Claude plugin manifest");
  const copilot = copilotProfile ? readJson(join(pluginRoot, "plugin.json"), "built Copilot plugin manifest") : null;
  const portablePath = join(pluginRoot, "plugin.json");
  const portable = !copilotProfile && existsSync(portablePath) ? readJson(portablePath, "built portable plugin manifest") : null;
  for (const required of [
    ...(copilotProfile ? [join(pluginRoot, "plugin.json"), join(pluginRoot, ".agdf-payload-inventory.json")] : [
      join(pluginRoot, ".codex-plugin", "plugin.json"),
      join(pluginRoot, ".claude-plugin", "plugin.json"),
      join(pluginRoot, "scripts", "check-runtime-integrity.mjs"),
    ]),
    join(pluginRoot, "runtime", "agdf-local.js"),
  ]) {
    if (!existsSync(required)) throw new Error(`Built plugin is incomplete: ${required}`);
  }
  if (definition.version !== expectedVersion || runtime.version !== expectedVersion) {
    throw new Error(`Built plugin version mismatch: expected ${expectedVersion}, definition ${definition.version}, runtime ${runtime.version}`);
  }
  const profile = validateDistributionProfiles(definition);
  const isPreProvenanceShape = allowPreProvenanceShape
    && !Object.hasOwn(definition, "distributionProfiles");
  let provenance = null;
  if (profile.status !== "matched"
      && requireInstallationProvenance
      && allowLegacyProvenanceForMigration) {
    provenance = inspectInstallationProvenance(pluginRoot, {
      definition,
      runtimeManifest: runtime,
      pluginVersion: expectedCodexInstallVersion,
      allowLegacy: true,
      allowHistoricalProfilesForMigration,
      distributionProfileHistory,
      classifyHistoricalProfile,
    });
  }
  const supportedHistoricalProfile = provenance?.status === "matched"
    && provenance.profileClassification === "supported_historical";
  if (profile.status !== "matched"
      && provenance?.status !== "legacy"
      && !supportedHistoricalProfile
      && !isPreProvenanceShape) {
    throw new Error(`Built plugin distribution profile contract is invalid (${provenance?.reason ?? profile.reason}).`);
  }
  if (!copilotProfile && codex.version !== expectedCodexInstallVersion) {
    throw new Error(`Built Codex plugin version mismatch: expected ${expectedCodexInstallVersion}, observed ${codex.version}`);
  }
  if (portable && portable.version !== expectedCodexInstallVersion) {
    throw new Error(`Built portable plugin version mismatch: expected ${expectedCodexInstallVersion}, observed ${portable.version}`);
  }
  if (!copilotProfile && claude.version !== expectedVersion) {
    throw new Error(`Built Claude plugin version mismatch: expected ${expectedVersion}, observed ${claude.version}`);
  }
  if (copilotProfile && copilot.version !== expectedVersion) {
    throw new Error(`Built Copilot plugin version mismatch: expected ${expectedVersion}, observed ${copilot.version}`);
  }
  const copilotInventory = copilotProfile ? inspectCopilotPayloadInventory(pluginRoot, expectedVersion) : null;
  if (copilotProfile && copilotInventory.status !== "matched") {
    throw new Error(`Built Copilot plugin inventory is invalid: ${copilotInventory.reason}`);
  }
  if (!copilotProfile && expectedCodexInstallVersion !== expectedVersion) {
    if (!isCodexLocalInstallVersion(expectedVersion, expectedCodexInstallVersion, sourceDigest)) {
      throw new Error(`Invalid AGDF Codex local install version: ${expectedCodexInstallVersion}`);
    }
  }
  if (!/^[a-f0-9]{64}$/.test(runtime.digest ?? "")) throw new Error("Built plugin runtime digest is invalid.");
  if (digestDirectory(join(pluginRoot, "runtime", "create-agdf")) !== runtime.digest) {
    throw new Error("Built plugin runtime digest does not match its payload.");
  }
  if (requireInstallationProvenance) {
    provenance ??= inspectInstallationProvenance(pluginRoot, {
      definition,
      runtimeManifest: runtime,
      pluginVersion: expectedCodexInstallVersion,
      allowLegacy: allowLegacyProvenanceForMigration,
      allowHistoricalProfilesForMigration,
      distributionProfileHistory,
      classifyHistoricalProfile,
      profileId,
      inventoryDigest: copilotInventory?.inventoryDigest ?? null,
    });
    if (provenance.status !== "matched"
        && !(allowLegacyProvenanceForMigration && provenance.status === "legacy")) {
      throw new Error(`Invalid AGDF installation provenance (${provenance.reason}): ${pluginRoot}`);
    }
  }
  return {
    definition,
    provenance,
    profileClassification: provenance?.profileClassification ?? "current",
  };
}

function validateMarketplaceRoot(root, definition = pluginDefinition, { profileId = "runtime-plugin" } = {}) {
  const copilotProfile = profileId === "copilot-runtime-plugin";
  const codex = copilotProfile ? null : readJson(join(root, ".agents", "plugins", "marketplace.json"), "Codex local marketplace manifest");
  const copilot = copilotProfile ? readJson(join(root, ".github", "plugin", "marketplace.json"), "Copilot local marketplace manifest") : null;
  const claude = copilotProfile ? null : readJson(join(root, ".claude-plugin", "marketplace.json"), "Claude local marketplace manifest");
  const serializedCodex = JSON.stringify(codex);
  const codexShape = copilotProfile
    ? "current"
    : serializedCodex === JSON.stringify(codexMarketplace(definition))
    ? "current"
    : serializedCodex === JSON.stringify(legacyCodexMarketplace(definition))
      ? "legacy_full_product_label"
      : "invalid";
  if (codexShape === "invalid") {
    throw new Error(`Codex local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  if (!copilotProfile && JSON.stringify(claude) !== JSON.stringify(claudeMarketplace(definition))) {
    throw new Error(`Claude local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  if (copilotProfile && JSON.stringify(copilot) !== JSON.stringify(copilotMarketplace(definition))) {
    throw new Error(`Copilot local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  return Object.freeze({ codexShape });
}

function classifyExistingMarketplace(stableRoot, marker, {
  profileId = "runtime-plugin",
  distributionProfileHistory = null,
} = {}) {
  const existingPluginRoot = join(stableRoot, "plugins", MARKETPLACE_ID);
  const copilotProfile = profileId === "copilot-runtime-plugin";
  const existingCodexInstallVersion = copilotProfile ? marker.version : marker.codex_install_version ?? marker.version;
  if (!isSemanticVersion(marker.version)
      || !/^[a-f0-9]{64}$/.test(marker.plugin_digest ?? "")) {
    throw new Error(`Refusing invalid AGDF marketplace ownership evidence: ${stableRoot}`);
  }
  const definition = readJson(
    join(existingPluginRoot, "meta", "agdf-plugin.definition.json"),
    "built plugin definition",
  );
  const hasCurrentProvenance = existsSync(join(existingPluginRoot, INSTALLATION_PROVENANCE_FILE));
  const hasLegacyProvenance = !copilotProfile && existsSync(join(existingPluginRoot, LEGACY_LOCAL_INSTALL_FILE));
  const preProvenanceCandidate = !hasCurrentProvenance
    && !hasLegacyProvenance
    && !Object.hasOwn(definition, "distributionProfiles");
  const existingValidation = validateBuiltPlugin(
    existingPluginRoot,
    marker.version,
    existingCodexInstallVersion,
    marker.source_digest ?? "",
    preProvenanceCandidate
      ? { allowPreProvenanceShape: true }
      : {
          requireInstallationProvenance: true,
          allowLegacyProvenanceForMigration: true,
          allowHistoricalProfilesForMigration: !copilotProfile,
          distributionProfileHistory,
          profileId,
        },
  );
  if (!preProvenanceCandidate) {
    if (!/^[a-f0-9]{64}$/.test(marker.source_digest ?? "")) {
      throw new Error(`Refusing invalid AGDF marketplace ownership source digest: ${stableRoot}`);
    }
    const observedSourceDigest = existingValidation.provenance?.observedSourceDigest
      ?? digestPluginSource(existingPluginRoot, marker.version);
    if (marker.source_digest !== observedSourceDigest) {
      throw new Error(`Refusing AGDF marketplace ownership source digest mismatch: ${stableRoot}`);
    }
  }
  const existingDefinition = existingValidation.definition;
  const marketplace = validateMarketplaceRoot(stableRoot, existingDefinition, { profileId });
  if (digestDirectory(existingPluginRoot) !== marker.plugin_digest) {
    throw new Error(`Refusing tampered AGDF marketplace root: ${stableRoot}`);
  }
  return Object.freeze({
    classification: preProvenanceCandidate
      ? "owned_pre_provenance_rebuild"
      : existingValidation.profileClassification === "supported_historical"
        ? "owned_supported_historical_rebuild"
        : "current_or_marker_migration",
    definition: existingDefinition,
    marketplace,
    historicalEvidence: existingValidation.profileClassification === "supported_historical"
      ? {
          releaseVersion: existingValidation.provenance.historicalReleaseVersion,
          contractId: existingValidation.provenance.historicalContractId,
          contractDigest: existingValidation.provenance.historicalContractDigest,
          entryDigest: existingValidation.provenance.historicalEntryDigest,
        }
      : null,
  });
}

function invalidExistingMarketplace(error) {
  error.existingClassification = "invalid_or_unowned";
  return error;
}

function recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot, transactionPath) {
  const parent = dirname(stableRoot);
  const transaction = existsSync(transactionPath)
    ? readOptionalJson(transactionPath) : null;
  if (transaction?.phase === 'legacy_settlement') {
    if (transaction.legacy_settlement?.step !== 'completed') throw Error('AGDF_LEGACY_SETTLEMENT_RECOVERY_REQUIRED');
    validateLegacySettlement(transaction, stableRoot, failedRoot);
    if (existsSync(failedRoot) || existsSync(backupRoot) || existsSync(stageRoot)) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
    rmSync(transactionPath); fsyncDirectory(parent);
    return;
  }
  if (existsSync(transactionPath) && (![1, 2].includes(transaction?.schema_version)
      || transaction.owner !== "create-agdf" || !["prepared", "committed", "cockpit_qualification_pending"].includes(transaction.phase)
      || typeof transaction.plugin_digest !== "string" || typeof transaction.version !== "string"
      || typeof transaction.profile_id !== "string"
      || (transaction.schema_version === 1 && transaction.previous_root_identity !== null && typeof transaction.previous_root_identity !== "string")
      || (transaction.schema_version === 2 && transaction.previous_root_identity !== null
        && (!transaction.previous_root_identity || transaction.previous_root_identity.role !== 'marketplace-publication'
          || !/^[a-f0-9]{64}$/.test(transaction.previous_root_digest))))) {
    throw new Error(`Invalid AGDF marketplace transaction marker: ${transactionPath}`);
  }
  if (transaction?.phase === 'cockpit_qualification_pending') {
    assertTransactionStablePayload(stableRoot, transaction);
    if (transaction.previous_root_identity !== null) assertTransactionBackupIdentity(backupRoot, transaction);
    throw new Error('AGDF_COCKPIT_QUALIFICATION_PENDING: finish or roll back the recorded Cockpit transition before another installation.');
  }
  if (transaction?.phase === "committed") {
    assertTransactionStablePayload(stableRoot, transaction);
    if (existsSync(backupRoot)) {
      assertTransactionBackupIdentity(backupRoot, transaction);
      removeOwnedRoot(backupRoot, parent);
    }
    if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
    rmSync(transactionPath);
    return;
  }
  if (existsSync(backupRoot)) {
    if (!transaction && existsSync(stableRoot)) {
      throw new Error(`Ambiguous AGDF marketplace backup without transaction marker: ${backupRoot}`);
    }
    if (transaction) assertTransactionBackupIdentity(backupRoot, transaction);
    ownership(backupRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
    if (existsSync(stableRoot)) {
      assertTransactionStablePayload(stableRoot, transaction);
      renameSyncWithRetry(stableRoot, failedRoot);
    }
    renameSyncWithRetry(backupRoot, stableRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
  } else if (transaction?.phase === "prepared" && existsSync(stableRoot)) {
    const isPrevious = transaction.schema_version === 2 && transaction.previous_root_identity !== null
      ? (() => { try { assertTransactionBackupIdentity(stableRoot, transaction); return true; } catch { return false; } })()
      : rootIdentity(stableRoot) === transaction.previous_root_identity;
    if (!isPrevious) {
      if (transaction.previous_root_identity !== null) {
        throw new Error(`AGDF marketplace prior backup missing: ${backupRoot}`);
      }
      assertTransactionStablePayload(stableRoot, transaction);
      removeOwnedRoot(stableRoot, parent);
    }
  } else if (transaction?.phase === "prepared" && transaction.previous_root_identity !== null) {
    throw new Error(`AGDF marketplace prior backup missing: ${backupRoot}`);
  }
  if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
  if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
  if (transaction) rmSync(transactionPath);
}

function prepareLocalMarketplaceFromSource({
  dataRoot = defaultAgdfDataRoot(),
  builtPluginRoot,
  expectedVersion = pluginDefinition.version,
  codexInstallVersion = expectedVersion,
  codexRegistrationRevision = null,
  profileId = "runtime-plugin",
  knownSourceDigest = "",
  sourceStaged = () => {},
  transportAdapters = {},
  cleanupBackup = removeOwnedRoot,
} = {}) {
  dataRoot = resolve(dataRoot);
  const copilotProfile = profileId === "copilot-runtime-plugin";
  if (!builtPluginRoot) builtPluginRoot = copilotProfile
    ? join(generatedRoot, "plugins", "copilot", "agdf")
    : join(generatedRoot, "plugins", "agdf");
  builtPluginRoot = resolve(builtPluginRoot);
  const stableRoot = join(dataRoot, "marketplaces", copilotProfile ? "agdf-copilot" : MARKETPLACE_ID);
  const parent = dirname(stableRoot);
  const stageRoot = `${stableRoot}.stage`;
  const backupRoot = `${stableRoot}.backup`;
  const failedRoot = `${stableRoot}.failed`;
  const transactionPath = `${stableRoot}.transaction.json`;
  if (!pathInside(dataRoot, stableRoot) || dirname(stableRoot) !== parent) throw new Error(`Unsafe AGDF marketplace root: ${stableRoot}`);
  const sourceDigest = knownSourceDigest || digestPluginSource(builtPluginRoot, expectedVersion);
  if (!copilotProfile && codexInstallVersion !== expectedVersion
      && !isCodexLocalInstallVersion(expectedVersion, codexInstallVersion, sourceDigest)) {
    throw new Error(`Invalid AGDF Codex local install version: ${codexInstallVersion}`);
  }
  const targetDefinition = validateBuiltPlugin(builtPluginRoot, expectedVersion, expectedVersion, "", { profileId }).definition;
  const distributionProfileHistory = readOptionalJson(
    join(builtPluginRoot, "meta", "distribution-profile-history.json"),
  );
  mkdirSync(parent, { recursive: true });
  recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot, transactionPath);

  let existing = null;
  if (existsSync(stableRoot)) {
    try {
      existing = ownership(stableRoot);
      if ((existing.profile_id ?? "runtime-plugin") !== profileId) throw new Error(`AGDF marketplace profile mismatch: ${stableRoot}`);
    } catch (error) {
      throw invalidExistingMarketplace(error);
    }
  }
  const targetCodexRegistrationRevision = codexRegistrationRevision
    ?? existing?.codex_registration_revision
    ?? 0;
  let existingMarketplace = null;
  let existingClassification = "none";
  let historicalEvidence = null;
  let damagedReason = null;
  if (existing) {
    try {
      const classified = classifyExistingMarketplace(stableRoot, existing, { profileId, distributionProfileHistory });
      existingClassification = classified.classification;
      existingMarketplace = classified.marketplace;
      historicalEvidence = classified.historicalEvidence;
    } catch (error) {
      // An invalid profile history belongs to the incoming build, not to the existing root.
      if (/profile_history_invalid/.test(error.message)) throw invalidExistingMarketplace(error);
      // The ownership marker proves AGDF created this root, but its payload no longer validates
      // (for example a half-replaced update). Nothing from it is reused: it becomes the transaction
      // backup, is restored on rollback and removed only after the fresh build committed.
      existingClassification = "owned_damaged_rebuild";
      damagedReason = error.message;
    }
  }
  mkdirSync(stageRoot, { recursive: false });
  try {
    writeJson(join(stageRoot, OWNERSHIP_FILE), {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
      profile_id: profileId,
      codex_registration_revision: targetCodexRegistrationRevision,
      version: expectedVersion,
      codex_install_version: codexInstallVersion,
      source_digest: sourceDigest,
      plugin_digest: null,
      source_package_version: readJson(join(packageRoot, "package.json"), "create-agdf package manifest").version,
      staging_state: "building",
    });
    const stagedPluginRoot = join(stageRoot, "plugins", MARKETPLACE_ID);
    cpSync(builtPluginRoot, stagedPluginRoot, { recursive: true });
    // Codex starts plugin MCP servers only from absolute paths and passes no plugin data directory,
    // so the installed declaration names the final marketplace plugin root and an AGDF-owned data root.
    const codexMcpPath = join(stagedPluginRoot, CODEX_PLUGIN_MCP_FILE);
    if (!copilotProfile && existsSync(codexMcpPath)) {
      writeFileSync(codexMcpPath, renderCodexPluginMcpConfig({
        pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
        dataRoot: join(dataRoot, "mcp", "codex-plugin"),
        cockpit: Object.hasOwn(readJson(codexMcpPath, 'built MCP declaration').mcpServers, 'agdf-cockpit'),
      }), "utf8");
    }
    sourceStaged();
    validateBuiltPlugin(stagedPluginRoot, expectedVersion, expectedVersion, "", { profileId });
    if (!copilotProfile && codexInstallVersion !== expectedVersion) {
      const codexManifestPath = join(stagedPluginRoot, ".codex-plugin", "plugin.json");
      writeJson(codexManifestPath, { ...readJson(codexManifestPath, "built Codex plugin manifest"), version: codexInstallVersion });
      const portableManifestPath = join(stagedPluginRoot, "plugin.json");
      if (existsSync(portableManifestPath)) {
        writeJson(portableManifestPath, { ...readJson(portableManifestPath, "built portable plugin manifest"), version: codexInstallVersion });
      }
    }
    const runtimeManifest = readJson(join(stagedPluginRoot, "runtime", "runtime-manifest.json"), "built runtime manifest");
    writeJson(join(stagedPluginRoot, INSTALLATION_PROVENANCE_FILE), {
      schema_version: 1,
      owner: "create-agdf",
      profile_id: profileId,
      marketplace_id: MARKETPLACE_ID,
      canonical_version: expectedVersion,
      codex_install_version: codexInstallVersion,
      source_digest: sourceDigest,
      runtime_digest: runtimeManifest.digest,
      ...(copilotProfile ? { inventory_digest: inspectCopilotPayloadInventory(stagedPluginRoot, expectedVersion).inventoryDigest } : {}),
    });
    if (existsSync(join(stagedPluginRoot, LEGACY_LOCAL_INSTALL_FILE))) {
      rmSync(join(stagedPluginRoot, LEGACY_LOCAL_INSTALL_FILE));
    }
    validateBuiltPlugin(stagedPluginRoot, expectedVersion, copilotProfile ? expectedVersion : codexInstallVersion, sourceDigest, { requireInstallationProvenance: true, profileId });
    if (copilotProfile) {
      writeJson(join(stageRoot, ".github", "plugin", "marketplace.json"), copilotMarketplace(targetDefinition));
    } else {
      writeJson(join(stageRoot, ".agents", "plugins", "marketplace.json"), codexMarketplace(targetDefinition));
      writeJson(join(stageRoot, ".claude-plugin", "marketplace.json"), claudeMarketplace(targetDefinition));
    }
    validateMarketplaceRoot(stageRoot, targetDefinition, { profileId });
    const pluginDigest = digestDirectory(stagedPluginRoot);
    const marker = {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
      profile_id: profileId,
      codex_registration_revision: targetCodexRegistrationRevision,
      version: expectedVersion,
      codex_install_version: codexInstallVersion,
      source_digest: sourceDigest,
      plugin_digest: pluginDigest,
      source_package_version: readJson(join(packageRoot, "package.json"), "create-agdf package manifest").version,
      staging_state: "ready",
      ...(copilotProfile ? { copilot_transport_revision: COPILOT_TRANSPORT_REVISION } : {}),
    };
    writeJson(join(stageRoot, OWNERSHIP_FILE), marker);

    if (copilotProfile) buildCopilotMarketplaceTransport(stageRoot, sourceDigest, transportAdapters);

    if (existing?.version === expectedVersion
        && existing?.plugin_digest === pluginDigest
        && existing?.codex_registration_revision === targetCodexRegistrationRevision
        && existingMarketplace?.codexShape === "current"
        && (!copilotProfile || existing.copilot_transport_revision === COPILOT_TRANSPORT_REVISION)) {
      if (copilotProfile) verifyCopilotMarketplaceTransport(stableRoot, sourceDigest, transportAdapters);
      removeOwnedRoot(stageRoot, parent);
      return Object.freeze({
        root: stableRoot,
        pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
        version: expectedVersion,
        codexInstallVersion,
        sourceDigest,
        digest: pluginDigest,
        runtimeDigest: runtimeManifest.digest,
        existingClassification,
        historicalEvidence,
        damagedReason,
        ...(copilotProfile ? { marketplaceSpec: copilotMarketplaceSpec(stableRoot, sourceDigest) } : {}),
        changed: false,
        commit() {},
        rollback() {},
      });
    }

    const transaction = {
      schema_version: 2,
      owner: "create-agdf",
      phase: "prepared",
      profile_id: profileId,
      version: expectedVersion,
      plugin_digest: pluginDigest,
      previous_root_identity: existsSync(stableRoot) ? ownerPlacement(stableRoot, 'marketplace-publication') : null,
      previous_root_digest: existsSync(stableRoot) ? digestDirectory(stableRoot) : null,
    };
    atomicWrite(transactionPath, `${JSON.stringify(transaction)}\n`);
    if (existsSync(stableRoot)) renameSyncWithRetry(stableRoot, backupRoot);
    try {
      renameSyncWithRetry(stageRoot, stableRoot);
    } catch (error) {
      if (existsSync(backupRoot) && !existsSync(stableRoot)) {
        assertTransactionBackupIdentity(backupRoot, transaction);
        renameSyncWithRetry(backupRoot, stableRoot);
      }
      if (existsSync(transactionPath)) rmSync(transactionPath);
      throw error;
    }
    let closed = false;
    return Object.freeze({
      root: stableRoot,
      pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
      version: expectedVersion,
      codexInstallVersion,
      sourceDigest,
      digest: pluginDigest,
      runtimeDigest: runtimeManifest.digest,
      existingClassification,
      historicalEvidence,
      damagedReason,
      ...(copilotProfile ? { marketplaceSpec: copilotMarketplaceSpec(stableRoot, sourceDigest) } : {}),
      changed: true,
      // The committed marker is the commit point. A host that already serves the new root may opt in to
      // report a failed backup cleanup instead of throwing; the marker stays for the next run's recovery.
      commit({ tolerateCleanupFailure = false, retainCockpitRollbackFor } = {}) {
        if (closed) return Object.freeze({ cleanup: "none" });
        if (retainCockpitRollbackFor !== undefined) {
          if (profileId !== 'runtime-plugin' || !isAbsolute(retainCockpitRollbackFor)
            || realpathSync(retainCockpitRollbackFor) !== retainCockpitRollbackFor) throw Error('AGDF_COCKPIT_ROLLBACK_TARGET_INVALID');
          atomicWrite(transactionPath, `${JSON.stringify({ ...transaction, phase: 'cockpit_qualification_pending',
            cockpit_target: retainCockpitRollbackFor, source_digest: sourceDigest,
            previous_source_digest: existing?.source_digest ?? null, previous_version: existing?.version ?? null })}\n`);
          closed = true;
          return Object.freeze({ cleanup: 'retained_for_cockpit', transactionPath });
        }
        atomicWrite(transactionPath, `${JSON.stringify({ ...transaction, phase: "committed" })}\n`);
        closed = true;
        try {
          if (existsSync(backupRoot)) {
            assertTransactionBackupIdentity(backupRoot, transaction);
            cleanupBackup(backupRoot, parent);
          }
          rmSync(transactionPath);
        } catch (error) {
          if (!tolerateCleanupFailure) throw error;
          return Object.freeze({ cleanup: "pending", reason: error?.code || "cleanup_failed" });
        }
        return Object.freeze({ cleanup: "done" });
      },
      rollback() {
        if (closed) return "already_closed";
        if (existsSync(backupRoot)) assertTransactionBackupIdentity(backupRoot, transaction);
        if (existsSync(backupRoot)) {
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
          if (existsSync(stableRoot)) {
            assertTransactionStablePayload(stableRoot, transaction);
            renameSyncWithRetry(stableRoot, failedRoot);
          }
          renameSyncWithRetry(backupRoot, stableRoot);
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
        } else if (existsSync(stableRoot)) {
          if (transaction.previous_root_identity !== null) {
            throw new Error(`AGDF marketplace prior backup missing: ${backupRoot}`);
          }
          assertTransactionStablePayload(stableRoot, transaction);
          removeOwnedRoot(stableRoot, parent);
        }
        if (existsSync(transactionPath)) rmSync(transactionPath);
        closed = true;
      },
    });
  } catch (error) {
    if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
    throw error;
  }
}

export function prepareLocalMarketplace(options = {}) {
  if (!options.snapshotSource) return prepareLocalMarketplaceFromSource(options);
  if (Object.hasOwn(options, "codexInstallVersion")) {
    throw new Error("AGDF snapshot preparation owns the Codex local install version.");
  }
  const snapshot = captureLocalPluginSnapshot({
    builtPluginRoot: options.builtPluginRoot,
    expectedVersion: options.expectedVersion,
    profileId: options.profileId,
    adapters: options.snapshotAdapters,
  });
  try {
    const { snapshotSource: _snapshotSource, snapshotAdapters: _snapshotAdapters, ...stableOptions } = options;
    return prepareLocalMarketplaceFromSource({
      ...stableOptions,
      builtPluginRoot: snapshot.pluginRoot,
      expectedVersion: snapshot.canonicalVersion,
      profileId: snapshot.profileId,
      codexInstallVersion: snapshot.codexInstallVersion,
      knownSourceDigest: snapshot.sourceDigest,
      sourceStaged: snapshot.cleanup,
    });
  } finally {
    snapshot.cleanup();
  }
}

export function prepareCopilotMarketplace(options = {}) {
  const { codexInstallVersion, ...copilotOptions } = options;
  return prepareLocalMarketplace({
    ...copilotOptions,
    profileId: "copilot-runtime-plugin",
    ...(!options.snapshotSource
      ? { codexInstallVersion: codexInstallVersion ?? options.expectedVersion ?? pluginDefinition.version }
      : {}),
  });
}

export function inspectLocalMarketplaceProjection({
  dataRoot = defaultAgdfDataRoot(),
  expectedVersion = pluginDefinition.version,
} = {}) {
  const root = join(resolve(dataRoot), "marketplaces", MARKETPLACE_ID);
  if (!existsSync(root)) return null;
  const marker = ownership(root);
  const codexInstallVersion = marker.codex_install_version ?? marker.version;
  const pluginRoot = join(root, "plugins", MARKETPLACE_ID);
  const definition = validateBuiltPlugin(
    pluginRoot,
    marker.version,
    codexInstallVersion,
    marker.source_digest ?? "",
    { requireInstallationProvenance: true },
  ).definition;
  validateMarketplaceRoot(root, definition);
  if (marker.version !== expectedVersion || digestDirectory(pluginRoot) !== marker.plugin_digest) {
    throw new Error(`Refusing stale or tampered AGDF marketplace projection: ${root}`);
  }
  return Object.freeze({
    root,
    pluginRoot,
    version: marker.version,
    codexInstallVersion,
    sourceDigest: marker.source_digest ?? "",
    digest: marker.plugin_digest,
  });
}

// Repair admission is narrower than normal provenance: exactly the runtime
// manifest may be stale, and restoring a fully verified native cache copy must
// reproduce the pre-existing owner's complete payload hash. Nothing is reused
// or written back here; the existing transaction still publishes a fresh build.
export function inspectCodexOwnedManifestRepair({ dataRoot = defaultAgdfDataRoot(), env = process.env,
  expectedVersion = pluginDefinition.version } = {}) {
  try {
    const root = join(resolve(dataRoot), 'marketplaces', MARKETPLACE_ID), marker = ownership(root);
    if (marker.version !== expectedVersion || (marker.profile_id ?? 'runtime-plugin') !== 'runtime-plugin'
      || !/^[a-f0-9]{64}$/u.test(marker.source_digest ?? '') || !/^[a-f0-9]{64}$/u.test(marker.plugin_digest ?? '')) return null;
    const installVersion = marker.codex_install_version ?? marker.version;
    if (installVersion !== marker.version && !isCodexLocalInstallVersion(marker.version, installVersion, marker.source_digest)) return null;
    const pluginRoot = join(root, 'plugins', MARKETPLACE_ID);
    const cache = join(env.CODEX_HOME || join(homedir(), '.codex'), 'plugins/cache/agdf/agdf', marker.codex_install_version ?? marker.version);
    if (realpathSync(cache) !== resolve(cache) || realpathSync(pluginRoot) !== resolve(pluginRoot)) return null;
    const noLinks = base => { let count = 0, bytes = 0;
      const visit = path => { const stat = lstatSync(path); if (stat.isSymbolicLink()) throw Error('repair_symlink');
        if (++count > 10000 || (bytes += stat.size) > 32 * 1024 * 1024) throw Error('repair_bounds');
        if (stat.isDirectory()) for (const name of readdirSync(path)) visit(join(path, name));
      }; visit(base);
    };
    noLinks(pluginRoot); noLinks(cache);
    validateBuiltPlugin(cache, marker.version, marker.codex_install_version ?? marker.version, marker.source_digest,
      { requireInstallationProvenance: true });
    const manifest = join('runtime', 'runtime-manifest.json'), original = readFileSync(join(cache, manifest));
    if (readFileSync(join(pluginRoot, manifest)).equals(original)) return null;
    const observed = digestDirectory(pluginRoot), markerBytes = readFileSync(join(root, OWNERSHIP_FILE));
    const temporary = mkdtempSync(join(tmpdir(), 'agdf-owned-repair-'));
    let declaration;
    try {
      cpSync(pluginRoot, join(temporary, 'plugin'), { recursive: true, filter: path => {
        if (lstatSync(path).isSymbolicLink()) throw Error('repair_symlink'); return true;
      } });
      writeFileSync(join(temporary, 'plugin', manifest), original);
      if (digestDirectory(join(temporary, 'plugin')) !== marker.plugin_digest) return null;
      validateBuiltPlugin(join(temporary, 'plugin'), marker.version, marker.codex_install_version ?? marker.version,
        marker.source_digest, { requireInstallationProvenance: true });
      declaration = readJson(join(temporary, 'plugin/mcp.json'), 'verified repair declaration');
    } finally { rmSync(temporary, { recursive: true, force: true }); }
    const assertCurrent = () => {
      ownership(root); noLinks(pluginRoot); noLinks(cache);
      if (!readFileSync(join(root, OWNERSHIP_FILE)).equals(markerBytes) || digestDirectory(pluginRoot) !== observed
        || !readFileSync(join(cache, manifest)).equals(original)) throw Error('repair_source_changed');
    };
    return Object.freeze({ assertCurrent, inspect(candidateRoot) {
      assertCurrent();
      if (resolve(candidateRoot) !== pluginRoot || realpathSync(candidateRoot) !== pluginRoot) return { status: 'unconfirmed' };
      return { status: 'matched', repair: true, version: marker.version, digest: 'sha256:' + marker.source_digest, declaration };
    } });
  } catch { return null; }
}

export function inspectOwnedSharedMarketplaceForCopilotMigration({
  dataRoot = defaultAgdfDataRoot(),
  expectedVersion = pluginDefinition.version,
} = {}) {
  const root = join(resolve(dataRoot), "marketplaces", MARKETPLACE_ID);
  if (!existsSync(root)) return null;
  const marker = ownership(root);
  if ((marker.profile_id ?? "runtime-plugin") !== "runtime-plugin"
      || marker.version !== expectedVersion
      || !/^[a-f0-9]{64}$/.test(marker.plugin_digest ?? "")) {
    throw new Error(`Refusing incompatible AGDF shared marketplace migration source: ${root}`);
  }
  const pluginRoot = join(root, "plugins", MARKETPLACE_ID);
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"), "shared plugin definition");
  const runtime = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"), "shared runtime manifest");
  const codex = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"), "shared Codex manifest");
  const claude = readJson(join(pluginRoot, ".claude-plugin", "plugin.json"), "shared Claude manifest");
  if (definition.id !== MARKETPLACE_ID
      || definition.version !== expectedVersion
      || runtime.version !== expectedVersion
      || claude.version !== expectedVersion
      || (codex.version !== expectedVersion && !isCodexLocalInstallVersion(expectedVersion, codex.version))
      || digestDirectory(pluginRoot) !== marker.plugin_digest) {
    throw new Error(`Refusing stale or tampered AGDF shared marketplace migration source: ${root}`);
  }
  return Object.freeze({ root, pluginRoot, version: marker.version, digest: marker.plugin_digest });
}

function normalizedLegacySource(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase()
    .replace(/^git\+/, "")
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/^github:/, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
}

function sourceForEntry(entry) {
  const source = entry?.marketplaceSource?.source
    ?? entry?.source?.source
    ?? (entry?.source === "directory" ? entry?.path : undefined)
    ?? (entry?.source === "github" ? entry?.repo : undefined)
    ?? entry?.repo
    ?? entry?.path
    ?? entry?.source
    ?? entry?.url
    ?? "";
  return typeof source === "string" ? source : "";
}

export function classifyMarketplaceList(surface, output, stableRoot) {
  let parsed;
  try {
    parsed = typeof output === "string" ? JSON.parse(output) : output;
  } catch {
    return { state: "unknown", source: "", reason: "invalid_json" };
  }
  const entries = surface === "codex" ? codexMarketplaceEntries(parsed) : claudeMarketplaceEntries(parsed);
  if (!Array.isArray(entries)) return { state: "unknown", source: "", reason: "invalid_shape" };
  const matches = entries.filter((entry) => entry?.name === MARKETPLACE_ID);
  if (matches.length === 0) return { state: "absent", source: "" };
  if (matches.length !== 1) return { state: "unknown", source: "", reason: "duplicate_name" };
  const entry = matches[0];
  const source = sourceForEntry(entry);
  const sourceType = entry?.marketplaceSource?.sourceType ?? entry?.source?.sourceType ?? "";
  if ((sourceType === "local" || isAbsolute(source)) && resolve(source) === resolve(stableRoot)) {
    return { state: "owned_local_current", source };
  }
  if (normalizedLegacySource(source) === LEGACY_REPOSITORY) return { state: "legacy_github", source };
  return { state: "conflict", source, reason: source ? "foreign_source" : "source_missing" };
}

export const localMarketplaceConstants = Object.freeze({
  id: MARKETPLACE_ID,
  ownershipFile: OWNERSHIP_FILE,
  installationProvenanceFile: INSTALLATION_PROVENANCE_FILE,
  legacyLocalInstallFile: LEGACY_LOCAL_INSTALL_FILE,
  legacyRepository: LEGACY_REPOSITORY,
});

// Existing marketplace journal/backup remains the single publication owner. Native observers
// call this only after qualification or to compensate a failed Cockpit cutover.
export function settleCodexCockpitPublication({ pluginRoot, target, sourceDigest, previousSourceDigest, action, finalEvidence } = {}) {
  if (!['commit', 'rollback'].includes(action) || !isAbsolute(pluginRoot ?? '') || !isAbsolute(target ?? ''))
    throw Error('AGDF_COCKPIT_SETTLEMENT_INPUT_INVALID');
  const stableRoot = dirname(dirname(pluginRoot)), parent = dirname(stableRoot);
  if (join(stableRoot, 'plugins', MARKETPLACE_ID) !== pluginRoot || realpathSync(target) !== target)
    throw Error('AGDF_COCKPIT_SETTLEMENT_INPUT_INVALID');
  const transactionPath = `${stableRoot}.transaction.json`, backupRoot = `${stableRoot}.backup`, failedRoot = `${stableRoot}.failed`;
  return withOwnedFileLock(`${stableRoot}.cockpit-settle`, () => {
  const transaction = readOptionalJson(transactionPath);
  if (![1, 2].includes(transaction?.schema_version) || transaction.owner !== 'create-agdf' || transaction.profile_id !== 'runtime-plugin'
    || transaction.phase !== 'cockpit_qualification_pending' || transaction.cockpit_target !== target
    || transaction.source_digest !== sourceDigest) throw Error('AGDF_COCKPIT_SETTLEMENT_CONFLICT');
  if (action === 'rollback' && transaction.previous_source_digest !== previousSourceDigest
    || transaction.previous_root_identity === null && existsSync(backupRoot)) throw Error('AGDF_COCKPIT_SETTLEMENT_CONFLICT');
  assertTransactionStablePayload(stableRoot, transaction);
  if (transaction.previous_root_identity !== null) {
    assertTransactionBackupIdentity(backupRoot, transaction);
    const previous = ownership(backupRoot);
    if (previous.source_digest !== transaction.previous_source_digest
      || digestDirectory(join(backupRoot, 'plugins', MARKETPLACE_ID)) !== previous.plugin_digest)
      throw Error('AGDF_COCKPIT_SETTLEMENT_CONFLICT');
  }
  if (action === 'commit') {
    const checked = validateCockpitTransitionEvidence(finalEvidence, { expected: { plugin_root: pluginRoot,
      target_id: resolveControlCommandTarget(target).target_id, version: transaction.version,
      previous_plugin_digest: transaction.previous_source_digest ? `sha256:${transaction.previous_source_digest}` : null,
      previous_plugin_version: transaction.previous_version } });
    const digest = path => {
      if (realpathSync(path) !== path || !lstatSync(path).isFile() || lstatSync(path).size > 4 * 1024 ** 2)
        throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
      return 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex');
    };
    if (!checked.valid || finalEvidence.config_path !== join(target, '.codex/config.toml')
      || digest(finalEvidence.config_path) !== finalEvidence.config_digest) throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    for (const origin of finalEvidence.inventory.origins) {
      if (!isAbsolute(origin.path) || (existsSync(origin.path) ? digest(origin.path)
        : 'sha256:' + createHash('sha256').update('').digest('hex')) !== origin.digest)
        throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    }
    if (![finalEvidence.config_path, join(pluginRoot, 'mcp.json')]
      .every(path => finalEvidence.inventory.origins.some(origin => origin.path === path)))
      throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    for (const ref of finalEvidence.evidence) {
      const path = resolve(target, ref.path);
      if (!pathInside(join(target, '.agdf/control/artefacts'), path) || digest(path) !== ref.digest)
        throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    }
    const runtime = inspectMcpExecutableRoot({ root: finalEvidence.runtime_root, expectedVersion: transaction.version });
    const shipped = pluginMcpRuntimeIdentity(pluginRoot);
    if (runtime.status !== 'matched' || `sha256:${runtime.digest}` !== finalEvidence.server_digest
      || `sha256:${runtime.dispatcherDigest}` !== finalEvidence.dispatcher_digest
      || `sha256:${runtime.sdkDigest}` !== finalEvidence.sdk_digest
      || digest(join(runtime.packageRoot, 'ui/cockpit.html')) !== finalEvidence.ui_digest
      || runtime.version !== shipped.version || runtime.digest !== shipped.digest
      || runtime.dispatcherDigest !== shipped.dispatcherDigest || runtime.sdkDigest !== shipped.sdkDigest
      || finalEvidence.host.os !== process.platform || finalEvidence.host.arch !== process.arch
      || finalEvidence.providers.some(provider => provider.origin !== pluginRoot
        && [finalEvidence.legacy_id, 'agdf-cockpit'].some(id => id.replaceAll('-', '_').toLowerCase()
          === provider.server_id.replaceAll('-', '_').toLowerCase())))
      throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    if (finalEvidence?.authorizes !== false || finalEvidence?.kind !== 'cockpit_transition'
      || finalEvidence.plugin_digest !== `sha256:${sourceDigest}`
      || finalEvidence.result !== 'qualified' || finalEvidence.native_final !== true
      || !['normal_context', 'legacy_absent', 'render', 'interaction', 'legacy_views_closed', 'legacy_context_clear']
        .every(key => finalEvidence.observations?.includes(key)))
      throw Error('AGDF_COCKPIT_FINAL_EVIDENCE_REQUIRED');
    atomicWrite(transactionPath, `${JSON.stringify({ ...transaction, phase: 'committed' })}\n`);
    recoverInterruptedTransaction(stableRoot, `${stableRoot}.stage`, backupRoot, failedRoot, transactionPath);
    return { status: 'committed', source_digest: sourceDigest };
  }
  if (existsSync(failedRoot)) throw Error('AGDF_COCKPIT_SETTLEMENT_CONFLICT');
  // Persist explicit rollback intent before filesystem changes; the existing recovery owner
  // can resume every interrupted rename/cleanup without inventing another journal.
  atomicWrite(transactionPath, `${JSON.stringify({ ...transaction, phase: 'prepared' })}\n`);
  recoverInterruptedTransaction(stableRoot, `${stableRoot}.stage`, backupRoot, failedRoot, transactionPath);
  return { status: 'restored', source_digest: transaction.previous_source_digest };
  });
}

// Explicit compatibility recovery for an original schema-1 publication whose
// mount-session device number changed. Automatic schema-1 predicates stay exact.
const settlementHash = value => createHash('sha256').update(value).digest('hex');
function settlementFile(path, limit = 65536) {
  let stat;
  try { stat = lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || stat.size > limit || realpathSync(path) !== resolve(path))
    throw Error('AGDF_LEGACY_SETTLEMENT_UNSAFE');
  return readFileSync(path);
}
function settlementPaths({ pluginRoot, target, hostHome = homedir() }) {
  if (!isAbsolute(pluginRoot ?? '') || !isAbsolute(target ?? '') || realpathSync(target) !== target || !isAbsolute(hostHome))
    throw Error('AGDF_LEGACY_SETTLEMENT_INPUT_INVALID');
  const stable = dirname(dirname(pluginRoot));
  if (join(stable, 'plugins', MARKETPLACE_ID) !== pluginRoot) throw Error('AGDF_LEGACY_SETTLEMENT_INPUT_INVALID');
  return { stable, backup: stable + '.backup', failed: stable + '.failed', stage: stable + '.stage',
    journal: stable + '.transaction.json', configurations: [...new Set([join(target, '.codex/config.toml'), join(hostHome, '.codex/config.toml')])] };
}
function configurationSnapshot(paths) {
  return paths.map(path => { const bytes = settlementFile(path, 4 * 1024 ** 2); return { path, digest: bytes === null ? null : settlementHash(bytes) }; });
}
function settlementWitness(reference, target) {
  if (!reference || !isAbsolute(reference.path ?? '') || !/^sha256:[a-f0-9]{64}$/.test(reference.digest ?? '')
    || ![join(target, 'probe-results'), join(target, '.agdf/control/artefacts')].some(root => pathInside(root, reference.path)))
    throw Error('AGDF_LEGACY_SETTLEMENT_WITNESS_REQUIRED');
  const bytes = settlementFile(reference.path);
  if (!bytes || 'sha256:' + settlementHash(bytes) !== reference.digest) throw Error('AGDF_LEGACY_SETTLEMENT_WITNESS_CHANGED');
  const value = JSON.parse(bytes);
  if (value.kind !== 'isolated_update_prerequisite_preview' || value.live_mutation !== false
    || !['stable', 'backup', 'transaction'].every(k => /^[a-f0-9]{64}$/.test(value.before?.[k] ?? '') && value.before[k] === value.after?.[k]))
    throw Error('AGDF_LEGACY_SETTLEMENT_WITNESS_REQUIRED');
  return value;
}
export function inspectLegacyCodexCockpitSettlement(options = {}) {
  const paths = settlementPaths(options), bytes = settlementFile(paths.journal), transaction = bytes && JSON.parse(bytes);
  if (transaction?.schema_version !== 1 || transaction.owner !== 'create-agdf' || transaction.profile_id !== 'runtime-plugin'
    || transaction.phase !== 'cockpit_qualification_pending' || transaction.cockpit_target !== options.target
    || transaction.source_digest !== options.sourceDigest || transaction.previous_source_digest !== options.previousSourceDigest
    || !/^[1-9][0-9]*:[1-9][0-9]*$/.test(transaction.previous_root_identity ?? '')
    || existsSync(paths.failed) || existsSync(paths.stage)) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  const witness = settlementWitness(options.witness, options.target);
  if (JSON.stringify(witness.live_transition) !== JSON.stringify(transaction)
    || witness.before.transaction !== settlementHash(bytes) || witness.before.stable !== digestDirectory(paths.stable)
    || witness.before.backup !== digestDirectory(paths.backup)) throw Error('AGDF_LEGACY_SETTLEMENT_WITNESS_CHANGED');
  assertTransactionStablePayload(paths.stable, transaction);
  const prior = ownership(paths.backup);
  if (prior.source_digest !== transaction.previous_source_digest || digestDirectory(join(paths.backup, 'plugins', MARKETPLACE_ID)) !== prior.plugin_digest)
    throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  const binding = ownerPlacement(paths.backup, 'marketplace-publication', paths.stable);
  if (binding.directory_ino !== transaction.previous_root_identity.split(':')[1]) throw Error('AGDF_LEGACY_SETTLEMENT_PRIOR_REPLACED');
  const body = { schema_version: 1, kind: 'legacy_publication_settlement_preview', action: 'rollback', target: options.target,
    paths, source_digest: transaction.source_digest, previous_source_digest: transaction.previous_source_digest,
    original_journal_digest: settlementHash(bytes), original_identity: transaction.previous_root_identity,
    current_identity: rootIdentity(paths.backup), previous_binding: binding,
    current_binding: ownerPlacement(paths.stable, 'marketplace-publication'),
    previous_digest: witness.before.backup, current_digest: witness.before.stable,
    witness: options.witness, configurations: configurationSnapshot(paths.configurations),
    configuration_effect: 'preserve exact current configuration; rollback changes only the owned marketplace publication', authorizes: false };
  const preview_digest = 'sha256:' + settlementHash(JSON.stringify(body));
  return { ...body, preview_digest, required_confirmation: `Restore previous AGDF publication: ${preview_digest}` };
}
function validateLegacySettlement(transaction, stable, failed) {
  const recovery = transaction?.legacy_settlement;
  if (transaction?.schema_version !== 1 || transaction.phase !== 'legacy_settlement' || !recovery || recovery.schema_version !== 1
    || !['confirmed', 'restoring', 'cleanup', 'completed'].includes(recovery.step)) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  const { digest: seal, ...body } = recovery;
  const originalBytes = Buffer.from(recovery.original_bytes ?? '', 'base64');
  if (seal !== settlementHash(JSON.stringify(body)) || settlementHash(originalBytes) !== recovery.preview.original_journal_digest
    || recovery.confirmation_digest !== settlementHash(`Restore previous AGDF publication: ${recovery.preview.preview_digest}`)
    || recovery.preview.paths.stable !== stable || recovery.preview.paths.failed !== failed
    || transaction.source_digest !== recovery.preview.source_digest || transaction.previous_source_digest !== recovery.preview.previous_source_digest)
    throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  const original = JSON.parse(originalBytes), witness = settlementWitness(recovery.preview.witness, recovery.preview.target);
  const { phase: _phase, legacy_settlement: _recovery, ...retained } = transaction;
  const { phase: _originalPhase, ...originalFields } = original;
  const { preview_digest, required_confirmation: _confirmation, ...previewBody } = recovery.preview;
  if (JSON.stringify(retained) !== JSON.stringify(originalFields)
    || preview_digest !== 'sha256:' + settlementHash(JSON.stringify(previewBody))
    || original.cockpit_target !== recovery.preview.target || original.previous_root_identity.split(':')[1] !== recovery.preview.previous_binding.directory_ino)
    throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  if (JSON.stringify(witness.live_transition) !== JSON.stringify(original) || original.phase !== 'cockpit_qualification_pending'
    || witness.before.transaction !== recovery.preview.original_journal_digest || witness.before.backup !== recovery.preview.previous_digest
    || witness.before.stable !== recovery.preview.current_digest
    || JSON.stringify(configurationSnapshot(recovery.preview.paths.configurations)) !== JSON.stringify(recovery.preview.configurations))
    throw Error('AGDF_LEGACY_SETTLEMENT_WITNESS_CHANGED');
  if (recovery.step === 'completed') {
    assertOwnerPlacement(recovery.preview.previous_binding, stable, 'marketplace-publication', stable);
    if (digestDirectory(stable) !== recovery.preview.previous_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
  }
  return recovery;
}
export function settleLegacyCodexCockpitPublication(options = {}) {
  const paths = settlementPaths(options), checkpoint = options.checkpoint ?? (() => {});
  return withOwnedFileLock(paths.stable + '.cockpit-settle', () => {
    let transaction = JSON.parse(settlementFile(paths.journal)), recovery;
    const resumed = transaction.phase === 'legacy_settlement';
    const historicalEffect = resumed && transaction.legacy_settlement?.step === 'completed';
    const save = step => {
      const { digest: _old, ...previous } = recovery;
      const body = { ...previous, step }; recovery = { ...body, digest: settlementHash(JSON.stringify(body)) };
      transaction = { ...transaction, phase: 'legacy_settlement', legacy_settlement: recovery };
      atomicWrite(paths.journal, JSON.stringify(transaction) + '\n'); fsyncDirectory(dirname(paths.journal));
    };
    if (transaction.phase === 'legacy_settlement') {
      recovery = validateLegacySettlement(transaction, paths.stable, paths.failed);
      if (options.previewDigest !== recovery.preview.preview_digest || options.confirmation !== `Restore previous AGDF publication: ${options.previewDigest}`)
        throw Error('AGDF_LEGACY_SETTLEMENT_CONFIRMATION_REQUIRED');
      if (options.target !== recovery.preview.target || options.sourceDigest !== recovery.preview.source_digest
        || options.previousSourceDigest !== recovery.preview.previous_source_digest
        || JSON.stringify(options.witness) !== JSON.stringify(recovery.preview.witness)
        || JSON.stringify(paths) !== JSON.stringify(recovery.preview.paths)) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
    } else {
      const preview = inspectLegacyCodexCockpitSettlement(options);
      if (options.previewDigest !== preview.preview_digest || options.confirmation !== preview.required_confirmation)
        throw Error('AGDF_LEGACY_SETTLEMENT_CONFIRMATION_REQUIRED');
      recovery = { schema_version: 1, operation_id: randomUUID(), step: 'confirmed', preview,
        original_bytes: settlementFile(paths.journal).toString('base64'), confirmation_digest: settlementHash(options.confirmation) };
      save('confirmed'); checkpoint('confirmed');
    }
    const preview = recovery.preview;
    if (recovery.step !== 'completed') {
      // The same fixed objects may be at their declared before/after rename roles.
      if (existsSync(paths.backup)) {
        assertOwnerPlacement(preview.previous_binding, paths.backup, 'marketplace-publication', paths.stable);
        if (digestDirectory(paths.backup) !== preview.previous_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
        if (existsSync(paths.stable)) {
          if (existsSync(paths.failed)) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
          assertOwnerPlacement(preview.current_binding, paths.stable, 'marketplace-publication');
          if (digestDirectory(paths.stable) !== preview.current_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
          save('restoring'); renameSyncWithRetry(paths.stable, paths.failed); fsyncDirectory(dirname(paths.stable)); checkpoint('current_moved');
        }
        assertOwnerPlacement(preview.current_binding, paths.failed, 'marketplace-publication', paths.stable);
        if (digestDirectory(paths.failed) !== preview.current_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
        renameSyncWithRetry(paths.backup, paths.stable); fsyncDirectory(dirname(paths.stable)); checkpoint('previous_restored');
      }
      assertOwnerPlacement(preview.previous_binding, paths.stable, 'marketplace-publication');
      if (digestDirectory(paths.stable) !== preview.previous_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
      if (!existsSync(paths.failed) && recovery.step !== 'cleanup') throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
      if (existsSync(paths.failed)) {
        assertOwnerPlacement(preview.current_binding, paths.failed, 'marketplace-publication', paths.stable);
        if (digestDirectory(paths.failed) !== preview.current_digest) throw Error('AGDF_LEGACY_SETTLEMENT_CONFLICT');
        save('cleanup'); checkpoint('before_cleanup'); removeOwnedRoot(paths.failed, dirname(paths.stable)); checkpoint('after_cleanup');
      }
      save('completed'); checkpoint('completed');
    }
    validateLegacySettlement(transaction, paths.stable, paths.failed);
    return { status: 'restored', source_digest: preview.previous_source_digest, operation_id: recovery.operation_id,
      preview_digest: preview.preview_digest, original_journal_digest: preview.original_journal_digest,
      original_journal_base64: recovery.original_bytes, journal: paths.journal, witness: preview.witness,
      configurations: preview.configurations, recovery_retained: true, historical_effect: historicalEffect, recovered: resumed, authorizes: false };
  });
}
