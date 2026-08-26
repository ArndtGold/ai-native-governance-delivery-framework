import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, posix, relative, resolve, sep, win32 } from "node:path";
import process from "node:process";
import { generatedRoot, packageRoot, pluginDefinition } from "../cli/runtime-context.js";
import { renameSyncWithRetry } from "../fs-swap.js";
import {
  INSTALLATION_PROVENANCE_FILE,
  LEGACY_LOCAL_INSTALL_FILE,
  digestDirectory,
  digestNormalizedPluginSource,
  inspectInstallationProvenance,
  validateDistributionProfiles,
} from "../runtime/plugin-provenance.js";

const MARKETPLACE_ID = "agdf";
const OWNERSHIP_FILE = ".agdf-owned.json";
const LEGACY_REPOSITORY = "arndtgold/ai-native-governance-delivery-framework";
export const CODEX_REGISTRATION_REVISION = 1;

function pathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

export function digestPluginSource(root, canonicalVersion = pluginDefinition.version) {
  return digestNormalizedPluginSource(root, canonicalVersion);
}

export { digestDirectory };

function semverBase(version) {
  return version.split("+")[0];
}

function isSemanticVersion(version) {
  return typeof version === "string"
    && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version);
}

export function codexLocalInstallVersion(version, sourceDigest) {
  if (!/^[a-f0-9]{64}$/.test(sourceDigest)) throw new Error("AGDF local source digest must be a deterministic SHA-256 value.");
  return `${semverBase(version)}+codex.local-${sourceDigest.slice(0, 12)}`;
}

export function isCodexLocalInstallVersion(version, candidate, sourceDigest = "") {
  if (typeof candidate !== "string") return false;
  if (sourceDigest) return candidate === codexLocalInstallVersion(version, sourceDigest);
  const escaped = semverBase(version).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}\\+codex\\.local-[a-f0-9]{12}$`).test(candidate);
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

function validateBuiltPlugin(pluginRoot, expectedVersion, expectedCodexInstallVersion = expectedVersion, sourceDigest = "", {
  requireInstallationProvenance = false,
  allowLegacyProvenanceForMigration = false,
  allowPreProvenanceShape = false,
} = {}) {
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"), "built plugin definition");
  const runtime = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"), "built runtime manifest");
  const codex = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"), "built Codex plugin manifest");
  const claude = readJson(join(pluginRoot, ".claude-plugin", "plugin.json"), "built Claude plugin manifest");
  for (const required of [
    join(pluginRoot, ".codex-plugin", "plugin.json"),
    join(pluginRoot, ".claude-plugin", "plugin.json"),
    join(pluginRoot, "runtime", "agdf-local.js"),
    join(pluginRoot, "scripts", "check-runtime-integrity.mjs"),
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
    });
  }
  if (profile.status !== "matched" && provenance?.status !== "legacy" && !isPreProvenanceShape) {
    throw new Error("Built plugin distribution profile contract is invalid.");
  }
  if (codex.version !== expectedCodexInstallVersion) {
    throw new Error(`Built Codex plugin version mismatch: expected ${expectedCodexInstallVersion}, observed ${codex.version}`);
  }
  if (claude.version !== expectedVersion) {
    throw new Error(`Built Claude plugin version mismatch: expected ${expectedVersion}, observed ${claude.version}`);
  }
  if (expectedCodexInstallVersion !== expectedVersion) {
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
    });
    if (provenance.status !== "matched"
        && !(allowLegacyProvenanceForMigration && provenance.status === "legacy")) {
      throw new Error(`Invalid AGDF installation provenance (${provenance.reason}): ${pluginRoot}`);
    }
  }
  return definition;
}

function validateMarketplaceRoot(root, definition = pluginDefinition) {
  const codex = readJson(join(root, ".agents", "plugins", "marketplace.json"), "Codex local marketplace manifest");
  const claude = readJson(join(root, ".claude-plugin", "marketplace.json"), "Claude local marketplace manifest");
  const serializedCodex = JSON.stringify(codex);
  const codexShape = serializedCodex === JSON.stringify(codexMarketplace(definition))
    ? "current"
    : serializedCodex === JSON.stringify(legacyCodexMarketplace(definition))
      ? "legacy_full_product_label"
      : "invalid";
  if (codexShape === "invalid") {
    throw new Error(`Codex local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  if (JSON.stringify(claude) !== JSON.stringify(claudeMarketplace(definition))) {
    throw new Error(`Claude local marketplace manifest is not owned by ${MARKETPLACE_ID}: ${root}`);
  }
  return Object.freeze({ codexShape });
}

function classifyExistingMarketplace(stableRoot, marker) {
  const existingPluginRoot = join(stableRoot, "plugins", MARKETPLACE_ID);
  const existingCodexInstallVersion = marker.codex_install_version ?? marker.version;
  if (!isSemanticVersion(marker.version)
      || !/^[a-f0-9]{64}$/.test(marker.plugin_digest ?? "")) {
    throw new Error(`Refusing invalid AGDF marketplace ownership evidence: ${stableRoot}`);
  }
  const definition = readJson(
    join(existingPluginRoot, "meta", "agdf-plugin.definition.json"),
    "built plugin definition",
  );
  const hasCurrentProvenance = existsSync(join(existingPluginRoot, INSTALLATION_PROVENANCE_FILE));
  const hasLegacyProvenance = existsSync(join(existingPluginRoot, LEGACY_LOCAL_INSTALL_FILE));
  const preProvenanceCandidate = !hasCurrentProvenance
    && !hasLegacyProvenance
    && !Object.hasOwn(definition, "distributionProfiles");
  const existingDefinition = validateBuiltPlugin(
    existingPluginRoot,
    marker.version,
    existingCodexInstallVersion,
    marker.source_digest ?? "",
    preProvenanceCandidate
      ? { allowPreProvenanceShape: true }
      : { requireInstallationProvenance: true, allowLegacyProvenanceForMigration: true },
  );
  const marketplace = validateMarketplaceRoot(stableRoot, existingDefinition);
  if (digestDirectory(existingPluginRoot) !== marker.plugin_digest) {
    throw new Error(`Refusing tampered AGDF marketplace root: ${stableRoot}`);
  }
  return Object.freeze({
    classification: preProvenanceCandidate
      ? "owned_pre_provenance_rebuild"
      : "current_or_marker_migration",
    definition: existingDefinition,
    marketplace,
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

export function prepareLocalMarketplace({
  dataRoot = defaultAgdfDataRoot(),
  builtPluginRoot = join(generatedRoot, "plugins", "agdf"),
  expectedVersion = pluginDefinition.version,
  codexInstallVersion = expectedVersion,
  codexRegistrationRevision = null,
} = {}) {
  dataRoot = resolve(dataRoot);
  builtPluginRoot = resolve(builtPluginRoot);
  const stableRoot = join(dataRoot, "marketplaces", MARKETPLACE_ID);
  const parent = dirname(stableRoot);
  const stageRoot = `${stableRoot}.stage`;
  const backupRoot = `${stableRoot}.backup`;
  const failedRoot = `${stableRoot}.failed`;
  if (!pathInside(dataRoot, stableRoot) || dirname(stableRoot) !== parent) throw new Error(`Unsafe AGDF marketplace root: ${stableRoot}`);
  const sourceDigest = digestPluginSource(builtPluginRoot, expectedVersion);
  if (codexInstallVersion !== expectedVersion
      && !isCodexLocalInstallVersion(expectedVersion, codexInstallVersion, sourceDigest)) {
    throw new Error(`Invalid AGDF Codex local install version: ${codexInstallVersion}`);
  }
  const targetDefinition = validateBuiltPlugin(builtPluginRoot, expectedVersion);
  mkdirSync(parent, { recursive: true });
  recoverInterruptedTransaction(stableRoot, stageRoot, backupRoot, failedRoot);

  let existing = null;
  if (existsSync(stableRoot)) {
    try {
      existing = ownership(stableRoot);
    } catch (error) {
      throw invalidExistingMarketplace(error);
    }
  }
  const targetCodexRegistrationRevision = codexRegistrationRevision
    ?? existing?.codex_registration_revision
    ?? 0;
  let existingMarketplace = null;
  let existingClassification = "none";
  if (existing) {
    let classified;
    try {
      classified = classifyExistingMarketplace(stableRoot, existing);
    } catch (error) {
      throw invalidExistingMarketplace(error);
    }
    existingClassification = classified.classification;
    existingMarketplace = classified.marketplace;
  }
  mkdirSync(stageRoot, { recursive: false });
  try {
    writeJson(join(stageRoot, OWNERSHIP_FILE), {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
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
    validateBuiltPlugin(stagedPluginRoot, expectedVersion);
    if (codexInstallVersion !== expectedVersion) {
      const codexManifestPath = join(stagedPluginRoot, ".codex-plugin", "plugin.json");
      writeJson(codexManifestPath, { ...readJson(codexManifestPath, "built Codex plugin manifest"), version: codexInstallVersion });
    }
    const runtimeManifest = readJson(join(stagedPluginRoot, "runtime", "runtime-manifest.json"), "built runtime manifest");
    writeJson(join(stagedPluginRoot, INSTALLATION_PROVENANCE_FILE), {
      schema_version: 1,
      owner: "create-agdf",
      profile_id: "runtime-plugin",
      marketplace_id: MARKETPLACE_ID,
      canonical_version: expectedVersion,
      codex_install_version: codexInstallVersion,
      source_digest: sourceDigest,
      runtime_digest: runtimeManifest.digest,
    });
    if (existsSync(join(stagedPluginRoot, LEGACY_LOCAL_INSTALL_FILE))) {
      rmSync(join(stagedPluginRoot, LEGACY_LOCAL_INSTALL_FILE));
    }
    validateBuiltPlugin(stagedPluginRoot, expectedVersion, codexInstallVersion, sourceDigest, { requireInstallationProvenance: true });
    writeJson(join(stageRoot, ".agents", "plugins", "marketplace.json"), codexMarketplace(targetDefinition));
    writeJson(join(stageRoot, ".claude-plugin", "marketplace.json"), claudeMarketplace(targetDefinition));
    validateMarketplaceRoot(stageRoot, targetDefinition);
    const pluginDigest = digestDirectory(stagedPluginRoot);
    const marker = {
      schema_version: 1,
      owner: "create-agdf",
      marketplace_id: MARKETPLACE_ID,
      codex_registration_revision: targetCodexRegistrationRevision,
      version: expectedVersion,
      codex_install_version: codexInstallVersion,
      source_digest: sourceDigest,
      plugin_digest: pluginDigest,
      source_package_version: readJson(join(packageRoot, "package.json"), "create-agdf package manifest").version,
      staging_state: "ready",
    };
    writeJson(join(stageRoot, OWNERSHIP_FILE), marker);

    if (existing?.version === expectedVersion
        && existing?.plugin_digest === pluginDigest
        && existing?.codex_registration_revision === targetCodexRegistrationRevision
        && existingMarketplace?.codexShape === "current") {
      removeOwnedRoot(stageRoot, parent);
      return Object.freeze({
        root: stableRoot,
        pluginRoot: join(stableRoot, "plugins", MARKETPLACE_ID),
        version: expectedVersion,
        codexInstallVersion,
        sourceDigest,
        digest: pluginDigest,
        existingClassification,
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
      existingClassification,
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
  );
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
  const entries = surface === "codex" ? parsed?.marketplaces : parsed;
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
