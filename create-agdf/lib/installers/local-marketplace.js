import { CODEX_REGISTRATION_REVISION, codexLocalInstallVersion, isCodexLocalInstallVersion, marketplaceEntries as codexMarketplaceEntries } from "../host-adapters/codex/identity.js";
import { marketplaceEntries as claudeMarketplaceEntries } from "../host-adapters/claude/marketplace.js";
export { CODEX_REGISTRATION_REVISION, codexLocalInstallVersion, isCodexLocalInstallVersion } from "../host-adapters/codex/identity.js";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";
import process from "node:process";
import { generatedRoot, packageRoot, pluginDefinition } from "../cli/runtime-context.js";
import { renameSyncWithRetry } from "../fs-swap.js";
import { buildCopilotMarketplaceTransport, copilotMarketplaceSpec, COPILOT_TRANSPORT_REVISION, verifyCopilotMarketplaceTransport } from "./copilot-marketplace-transport.js";
import { classifyHistoricalDistributionProfile } from "../runtime/distribution-profile-history.js";
import {
  INSTALLATION_PROVENANCE_FILE,
  LEGACY_LOCAL_INSTALL_FILE,
  digestDirectory,
  inspectCopilotPayloadInventory,
  digestNormalizedPluginSource,
  inspectInstallationProvenance,
  validateDistributionProfiles,
} from "../runtime/plugin-provenance.js";

const MARKETPLACE_ID = "agdf";
const OWNERSHIP_FILE = ".agdf-owned.json";
const LEGACY_REPOSITORY = "arndtgold/ai-native-governance-delivery-framework";

function pathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
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

function recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot) {
  const parent = dirname(stableRoot);
  if (existsSync(backupRoot)) {
    ownership(backupRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
    if (existsSync(stableRoot)) {
      ownership(stableRoot);
      renameSyncWithRetry(stableRoot, failedRoot);
    }
    renameSyncWithRetry(backupRoot, stableRoot);
    if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
  }
  if (existsSync(stageRoot)) removeOwnedRoot(stageRoot, parent, { allowBuilding: true });
  if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
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
  recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot);

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
  if (existing) {
    let classified;
    try {
      classified = classifyExistingMarketplace(stableRoot, existing, { profileId, distributionProfileHistory });
    } catch (error) {
      throw invalidExistingMarketplace(error);
    }
    existingClassification = classified.classification;
    existingMarketplace = classified.marketplace;
    historicalEvidence = classified.historicalEvidence;
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
    sourceStaged();
    validateBuiltPlugin(stagedPluginRoot, expectedVersion, expectedVersion, "", { profileId });
    if (!copilotProfile && codexInstallVersion !== expectedVersion) {
      const codexManifestPath = join(stagedPluginRoot, ".codex-plugin", "plugin.json");
      writeJson(codexManifestPath, { ...readJson(codexManifestPath, "built Codex plugin manifest"), version: codexInstallVersion });
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
        ...(copilotProfile ? { marketplaceSpec: copilotMarketplaceSpec(stableRoot, sourceDigest) } : {}),
        changed: false,
        commit() {},
        rollback() {},
      });
    }

    if (existsSync(stableRoot)) renameSyncWithRetry(stableRoot, backupRoot);
    try {
      renameSyncWithRetry(stageRoot, stableRoot);
    } catch (error) {
      if (existsSync(backupRoot) && !existsSync(stableRoot)) renameSyncWithRetry(backupRoot, stableRoot);
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
      ...(copilotProfile ? { marketplaceSpec: copilotMarketplaceSpec(stableRoot, sourceDigest) } : {}),
      changed: true,
      commit() {
        if (closed) return;
        if (existsSync(backupRoot)) removeOwnedRoot(backupRoot, parent);
        closed = true;
      },
      rollback() {
        if (closed) return;
        if (existsSync(backupRoot)) {
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
          if (existsSync(stableRoot)) renameSyncWithRetry(stableRoot, failedRoot);
          renameSyncWithRetry(backupRoot, stableRoot);
          if (existsSync(failedRoot)) removeOwnedRoot(failedRoot, parent);
        } else if (existsSync(stableRoot)) {
          removeOwnedRoot(stableRoot, parent);
        }
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
