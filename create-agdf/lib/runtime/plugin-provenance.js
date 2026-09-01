import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";

export const INSTALLATION_PROVENANCE_FILE = ".agdf-installation.json";
export const LEGACY_LOCAL_INSTALL_FILE = ".agdf-local-install.json";
export const COPILOT_PAYLOAD_INVENTORY_FILE = ".agdf-payload-inventory.json";

const EXPECTED_PROFILES = Object.freeze({
  "source-development": Object.freeze({ runtime: "absent", installable: false, machineValidation: "unavailable" }),
  "runtime-plugin": Object.freeze({ runtime: "required", installable: true, machineValidation: "local_exact_version_digest" }),
  "copilot-runtime-plugin": Object.freeze({ runtime: "required", installable: true, machineValidation: "local_exact_version_digest_inventory" }),
  "opencode-config-local": Object.freeze({ runtime: "config_local_package", installable: true, machineValidation: "local_exact_version" }),
  "portable-skills": Object.freeze({ runtime: "absent", installable: true, machineValidation: "unavailable_or_external_required" }),
});

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function digestDirectory(root) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    hash.update(relative(root, path).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function inspectCopilotPayloadInventory(pluginRoot, expectedVersion) {
  const inventoryPath = join(pluginRoot, COPILOT_PAYLOAD_INVENTORY_FILE);
  const inventory = readJson(inventoryPath);
  if (!inventory || inventory.schema_version !== 1 || inventory.profile_id !== "copilot-runtime-plugin"
      || inventory.version !== expectedVersion || !Array.isArray(inventory.entries)) {
    return { status: "invalid", reason: "copilot_payload_inventory_invalid" };
  }
  const destinations = inventory.entries.map((entry) => entry.destination);
  if (new Set(destinations).size !== destinations.length) {
    return { status: "invalid", reason: "copilot_payload_inventory_duplicate" };
  }
  const actual = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) {
        const normalized = relative(pluginRoot, path).replaceAll("\\", "/");
        if (![COPILOT_PAYLOAD_INVENTORY_FILE, INSTALLATION_PROVENANCE_FILE, LEGACY_LOCAL_INSTALL_FILE].includes(normalized)) actual.push(normalized);
      }
    }
  }
  try { visit(pluginRoot); } catch { return { status: "invalid", reason: "copilot_payload_incomplete" }; }
  if (JSON.stringify(actual.sort()) !== JSON.stringify([...destinations].sort())) {
    return { status: "invalid", reason: "copilot_payload_inventory_mismatch" };
  }
  for (const entry of inventory.entries) {
    const path = join(pluginRoot, entry.destination);
    if (!existsSync(path) || digestFile(path) !== entry.digest || statSync(path).size !== entry.bytes) {
      return { status: "invalid", reason: "copilot_payload_digest_mismatch", entry: entry.destination };
    }
  }
  const excluded = actual.some((path) => path.startsWith("skills/") || path.startsWith(".codex-plugin/")
    || path.startsWith(".claude-plugin/") || path.startsWith("submission/")
    || path === "hooks/hooks.json" || path === "hooks/session-start.sh");
  if (excluded) return { status: "invalid", reason: "copilot_payload_excluded_surface" };
  return { status: "matched", inventory, inventoryDigest: digestFile(inventoryPath) };
}

export function digestNormalizedPluginSource(root, canonicalVersion) {
  const files = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (stats.isFile()) files.push(path);
    }
  }
  visit(root);
  const hash = createHash("sha256");
  for (const path of files) {
    const normalizedPath = relative(root, path).replaceAll("\\", "/");
    if ([INSTALLATION_PROVENANCE_FILE, LEGACY_LOCAL_INSTALL_FILE].includes(normalizedPath)) continue;
    let content = readFileSync(path);
    if (normalizedPath === ".codex-plugin/plugin.json") {
      const manifest = readJson(path);
      if (!manifest) throw new Error(`Invalid Codex plugin manifest: ${path}`);
      content = `${JSON.stringify({ ...manifest, version: canonicalVersion }, null, 2)}\n`;
    }
    hash.update(normalizedPath);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function validateDistributionProfiles(definition) {
  const contract = definition?.distributionProfiles;
  if (contract?.schemaVersion !== 1) return { status: "invalid", reason: "profile_invalid" };
  if (contract.marketplaceIdentities?.durable !== "agdf"
      || contract.marketplaceIdentities?.generatedRepository !== "agdf-repo") {
    return { status: "invalid", reason: "profile_invalid" };
  }
  for (const [profileId, expected] of Object.entries(EXPECTED_PROFILES)) {
    const observed = contract.profiles?.[profileId];
    if (!observed
        || Object.keys(observed).length !== Object.keys(expected).length
        || Object.keys(expected).some((key) => observed[key] !== expected[key])) {
      return { status: "invalid", reason: "profile_invalid" };
    }
  }
  if (Object.keys(contract.profiles ?? {}).length !== Object.keys(EXPECTED_PROFILES).length) {
    return { status: "invalid", reason: "profile_invalid" };
  }
  return { status: "matched", contract };
}

function classifyInstalledHistoricalProfile(catalogue, definition, classifyHistoricalProfile) {
  if (typeof classifyHistoricalProfile !== "function") {
    return { status: "invalid", reason: "profile_history_invalid" };
  }
  const result = classifyHistoricalProfile({
    catalogue,
    version: definition?.version,
    distributionProfiles: definition?.distributionProfiles,
  });
  if (result.status !== "matched") return result;
  return {
    ...result,
    contract: catalogue.contracts[result.contract_id].distribution_profiles,
  };
}

export function inspectGeneratedRepositoryMarketplace(targetDir) {
  const marketplacePath = join(targetDir, ".agents", "plugins", "marketplace.json");
  if (!existsSync(marketplacePath)) return { status: "absent", marketplacePath };
  const marketplace = readJson(marketplacePath);
  const plugin = marketplace?.plugins?.length === 1 ? marketplace.plugins[0] : null;
  const pluginPath = plugin?.source?.source === "local" ? plugin.source.path : null;
  if (marketplace?.name !== "agdf-repo" || plugin?.name !== "agdf" || pluginPath !== "./plugins/agdf") {
    return { status: "invalid", reason: "repository_marketplace_invalid", marketplacePath };
  }
  const pluginRoot = resolve(targetDir, pluginPath);
  const rel = relative(resolve(targetDir), pluginRoot);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    return { status: "invalid", reason: "repository_marketplace_path_escape", marketplacePath };
  }
  const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"));
  const runtimeManifest = readJson(join(pluginRoot, "runtime", "runtime-manifest.json"));
  const codexManifest = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"));
  const claudeManifest = readJson(join(pluginRoot, ".claude-plugin", "plugin.json"));
  const runtimeRoot = join(pluginRoot, "runtime");
  const runtimePackageRoot = join(pluginRoot, "runtime", "create-agdf");
  const runtimeEntrypoint = resolve(runtimeRoot, runtimeManifest?.entrypoint ?? "");
  const runtimeEntrypointRel = relative(runtimeRoot, runtimeEntrypoint);
  if (validateDistributionProfiles(definition).status !== "matched"
      || definition?.version !== runtimeManifest?.version
      || codexManifest?.version !== definition?.version
      || claudeManifest?.version !== definition?.version
      || !/^[a-f0-9]{64}$/.test(runtimeManifest?.digest ?? "")
      || !existsSync(join(runtimeRoot, "agdf-local.js"))
      || !runtimeManifest?.entrypoint
      || runtimeEntrypointRel === ".."
      || runtimeEntrypointRel.startsWith(`..${sep}`)
      || isAbsolute(runtimeEntrypointRel)
      || !existsSync(runtimeEntrypoint)
      || !existsSync(runtimePackageRoot)) {
    return { status: "invalid", reason: "repository_runtime_incomplete", marketplacePath, pluginRoot };
  }
  let runtimeDigest;
  try { runtimeDigest = digestDirectory(runtimePackageRoot); } catch {
    return { status: "invalid", reason: "repository_runtime_incomplete", marketplacePath, pluginRoot };
  }
  if (runtimeDigest !== runtimeManifest.digest) {
    return { status: "invalid", reason: "runtime_digest_mismatch", marketplacePath, pluginRoot };
  }
  return {
    status: "matched",
    marketplacePath,
    pluginRoot,
    selector: `${plugin.name}@${marketplace.name}`,
    runtimeDigest,
  };
}

export function inspectInstallationProvenance(pluginRoot, {
  definition,
  runtimeManifest,
  pluginVersion,
  allowLegacy = false,
  profileId = "runtime-plugin",
  inventoryDigest = null,
  allowHistoricalProfilesForMigration = false,
  distributionProfileHistory = null,
  classifyHistoricalProfile = null,
} = {}) {
  const markerPath = join(pluginRoot, INSTALLATION_PROVENANCE_FILE);
  const legacyPath = join(pluginRoot, LEGACY_LOCAL_INSTALL_FILE);
  if (!existsSync(markerPath)) {
    if (allowLegacy && existsSync(legacyPath)) {
      const currentProfile = validateDistributionProfiles(definition);
      if (Object.hasOwn(definition ?? {}, "distributionProfiles")
          && currentProfile.status !== "matched") {
        return allowHistoricalProfilesForMigration
          ? classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile).status === "matched"
            ? { status: "invalid", reason: "installation_provenance_invalid" }
            : classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile)
          : currentProfile;
      }
      const marker = readJson(legacyPath);
      if (!marker
          || marker.schema_version !== 1
          || marker.owner !== "create-agdf"
          || marker.kind !== "codex_local_development_projection"
          || marker.canonical_version !== definition.version
          || marker.codex_install_version !== pluginVersion
          || !/^[a-f0-9]{64}$/.test(marker.source_digest ?? "")) {
        return { status: "invalid", reason: "installation_provenance_invalid", marker };
      }
      let observedSourceDigest;
      try { observedSourceDigest = digestNormalizedPluginSource(pluginRoot, definition.version); } catch {
        return { status: "invalid", reason: "source_digest_mismatch", marker };
      }
      return observedSourceDigest === marker.source_digest
        ? { status: "legacy", marker, observedSourceDigest, reason: "legacy_installation_provenance" }
        : { status: "invalid", reason: "source_digest_mismatch", marker, observedSourceDigest };
    }
    const profile = validateDistributionProfiles(definition);
    if (profile.status !== "matched") return profile;
    return { status: "missing", reason: "installation_provenance_missing" };
  }
  const currentProfile = validateDistributionProfiles(definition);
  const historicalProfile = currentProfile.status !== "matched" && allowHistoricalProfilesForMigration
    ? classifyInstalledHistoricalProfile(distributionProfileHistory, definition, classifyHistoricalProfile)
    : null;
  if (currentProfile.status !== "matched" && historicalProfile?.status !== "matched") {
    return historicalProfile ?? currentProfile;
  }
  const profile = currentProfile.status === "matched" ? currentProfile : historicalProfile;
  const marker = readJson(markerPath);
  if (!marker
      || marker.schema_version !== 1
      || marker.owner !== "create-agdf"
      || marker.profile_id !== profileId
      || marker.marketplace_id !== profile.contract.marketplaceIdentities.durable
      || marker.canonical_version !== definition.version
      || marker.codex_install_version !== pluginVersion
      || marker.runtime_digest !== runtimeManifest?.digest
      || (profileId === "copilot-runtime-plugin" && marker.inventory_digest !== inventoryDigest)
      || !/^[a-f0-9]{64}$/.test(marker.source_digest ?? "")) {
    return { status: "invalid", reason: "installation_provenance_invalid", marker };
  }
  let observedSourceDigest;
  try {
    observedSourceDigest = digestNormalizedPluginSource(pluginRoot, definition.version);
  } catch {
    return { status: "invalid", reason: "source_digest_mismatch", marker };
  }
  if (observedSourceDigest !== marker.source_digest) {
    return { status: "invalid", reason: "source_digest_mismatch", marker, observedSourceDigest };
  }
  return {
    status: "matched",
    marker,
    observedSourceDigest,
    profileClassification: historicalProfile ? "supported_historical" : "current",
    historicalReleaseVersion: historicalProfile?.release_version ?? null,
    historicalContractId: historicalProfile?.contract_id ?? null,
    historicalContractDigest: historicalProfile?.contract_digest ?? null,
    historicalEntryDigest: historicalProfile?.entry_digest ?? null,
  };
}

export const distributionProfileContract = Object.freeze({
  expectedProfiles: EXPECTED_PROFILES,
});
