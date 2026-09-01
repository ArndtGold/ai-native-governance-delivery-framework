import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyMarketplaceList,
  defaultAgdfDataRoot,
  digestDirectory,
  digestPluginSource,
  localMarketplaceRoot,
  prepareCopilotMarketplace,
  prepareLocalMarketplace,
} from "../lib/installers/local-marketplace.js";
import { installClaudeGlobalPlugin, installCodexGlobalPlugin, pluginVersionFromList } from "../lib/installers/plugin-installers.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { renameSyncWithRetry } from "../lib/fs-swap.js";
import { validateDistributionProfiles } from "../lib/runtime/plugin-provenance.js";
import { classifyHistoricalDistributionProfile } from "../lib/runtime/distribution-profile-history.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(packageRoot);
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const builtCopilotPluginRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-local-marketplace-"));

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function captureError(action, pattern) {
  let caught;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught, "expected action to throw");
  assert.match(caught.message, pattern);
  return caught;
}

function fakeTransaction(root = join(fixtureRoot, "fake-marketplace"), { changed = true, events } = {}) {
  const state = { committed: 0, rolledBack: 0 };
  return {
    state,
    prepare: () => ({
      root,
      changed,
      commit() { state.committed += 1; },
      rollback() {
        state.rolledBack += 1;
        events?.push("filesystem rollback");
      },
    }),
  };
}

function commandKey(executable, args) {
  return `${executable} ${args.join(" ")}`;
}

function scriptedExec(script, calls) {
  return (executable, args) => {
    const key = commandKey(executable, args);
    calls.push(key);
    const value = script[key];
    if (value instanceof Error) throw value;
    if (typeof value === "function") return value();
    return value ?? "{}\n";
  };
}

try {
  assert.equal(defaultAgdfDataRoot({ platform: "darwin", home: "/Users/test", env: {} }), posix.join("/Users/test", "Library", "Application Support", "agdf"));
  assert.equal(defaultAgdfDataRoot({ platform: "linux", home: "/home/test", env: {} }), posix.join("/home/test", ".local", "share", "agdf"));
  assert.equal(defaultAgdfDataRoot({ platform: "win32", home: "C:\\Users\\test", env: { LOCALAPPDATA: "C:\\Data" } }), win32.join("C:\\Data", "agdf"));
  assert.equal(defaultAgdfDataRoot({ platform: "win32", home: "C:\\Users\\test", env: { AGDF_DATA_DIR: "D:\\AGDF Data" } }), win32.resolve("D:\\AGDF Data"));
  assert.equal(defaultAgdfDataRoot({ platform: "linux", home: "/home/test", env: { AGDF_DATA_DIR: "/srv/agdf data" } }), posix.resolve("/srv/agdf data"));
  assert.equal(localMarketplaceRoot({ platform: "win32", home: "C:\\Users\\test", env: { LOCALAPPDATA: "C:\\Data" } }), win32.join("C:\\Data", "agdf", "marketplaces", "agdf"));
  assert.equal(localMarketplaceRoot({ platform: "linux", home: "/home/test", env: {} }), posix.join("/home/test", ".local", "share", "agdf", "marketplaces", "agdf"));

  const dataRoot = join(fixtureRoot, "data");
  const first = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(first.changed, true);
  assert.equal(json(join(first.root, ".agdf-owned.json")).version, pluginDefinition.version);
  assert.equal(json(join(first.root, ".agdf-owned.json")).codex_registration_revision, 0);
  const firstCodexMarketplace = json(join(first.root, ".agents", "plugins", "marketplace.json"));
  assert.equal(firstCodexMarketplace.name, "agdf");
  assert.equal(firstCodexMarketplace.interface.displayName, "AGDF");
  assert.equal(firstCodexMarketplace.plugins[0].name, "agdf");
  assert.equal(json(join(first.root, "plugins", "agdf", ".codex-plugin", "plugin.json")).interface.displayName, "AI Governance & Delivery Framework");
  assert.equal(json(join(first.root, ".claude-plugin", "marketplace.json")).plugins[0].source, "./plugins/agdf");
  assert.equal(json(join(first.root, "plugins", "agdf", "runtime", "runtime-manifest.json")).version, pluginDefinition.version);
  const installationProvenance = json(join(first.root, "plugins", "agdf", ".agdf-installation.json"));
  assert.equal(installationProvenance.owner, "create-agdf");
  assert.equal(installationProvenance.profile_id, "runtime-plugin");
  assert.equal(installationProvenance.marketplace_id, "agdf");
  assert.equal(installationProvenance.canonical_version, pluginDefinition.version);
  assert.equal(installationProvenance.runtime_digest, json(join(first.root, "plugins", "agdf", "runtime", "runtime-manifest.json")).digest);
  const localEntrypoint = join(first.root, "plugins", "agdf", "runtime", "agdf-local.js");
  const resolved = spawnSync(process.execPath, [localEntrypoint, "--resolve-only", "--json"], { encoding: "utf8" });
  assert.equal(resolved.status, 0, resolved.stderr);
  const resolution = JSON.parse(resolved.stdout);
  assert.equal(resolution.registry_access, false);
  assert.equal(resolution.distribution_profile, "runtime-plugin");
  assert.equal(resolution.provenance_status, "matched");
  assert.equal(resolution.evidence_plane, "installed_plugin_root");

  const sharedDigestBeforeCopilot = digestDirectory(first.pluginRoot);
  const copilotProjection = prepareCopilotMarketplace({ dataRoot, builtPluginRoot: builtCopilotPluginRoot });
  assert.equal(copilotProjection.root, join(dataRoot, "marketplaces", "agdf-copilot"));
  assert.equal(json(join(copilotProjection.root, ".agdf-owned.json")).profile_id, "copilot-runtime-plugin");
  assert.equal(json(join(copilotProjection.pluginRoot, ".agdf-installation.json")).profile_id, "copilot-runtime-plugin");
  assert.match(json(join(copilotProjection.pluginRoot, ".agdf-installation.json")).inventory_digest, /^[a-f0-9]{64}$/);
  assert.equal(existsSync(join(copilotProjection.root, ".claude-plugin")), false);
  assert.equal(existsSync(join(copilotProjection.root, ".agents")), false);
  assert.equal(json(join(copilotProjection.root, ".github", "plugin", "marketplace.json")).plugins[0].version, pluginDefinition.version);
  assert.equal(existsSync(join(copilotProjection.pluginRoot, "skills")), false);
  assert.equal(existsSync(join(copilotProjection.pluginRoot, ".codex-plugin")), false);
  assert.equal(existsSync(join(copilotProjection.pluginRoot, "copilot-skills", "agdf-gate-check", "SKILL.md")), true);
  assert.equal(digestDirectory(first.pluginRoot), sharedDigestBeforeCopilot, "Copilot staging must not mutate the shared Codex and Claude profile");
  const copilotResolution = spawnSync(process.execPath, [join(copilotProjection.pluginRoot, "runtime", "agdf-local.js"), "--resolve-only", "--json"], { encoding: "utf8" });
  assert.equal(copilotResolution.status, 0, copilotResolution.stderr);
  assert.equal(JSON.parse(copilotResolution.stdout).distribution_profile, "copilot-runtime-plugin");
  const copilotProvenancePath = join(copilotProjection.pluginRoot, ".agdf-installation.json");
  const copilotProvenanceText = readFileSync(copilotProvenancePath, "utf8");
  const resolveCopilot = () => JSON.parse(spawnSync(
    process.execPath,
    [join(copilotProjection.pluginRoot, "runtime", "agdf-local.js"), "--resolve-only", "--json"],
    { encoding: "utf8" },
  ).stdout);
  writeFileSync(copilotProvenancePath, `${JSON.stringify({ ...JSON.parse(copilotProvenanceText), profile_id: "runtime-plugin" }, null, 2)}\n`);
  assert.equal(resolveCopilot().reason, "installation_provenance_invalid", "wrong installed profile must fail closed");
  writeFileSync(copilotProvenancePath, `${JSON.stringify({ ...JSON.parse(copilotProvenanceText), inventory_digest: "0".repeat(64) }, null, 2)}\n`);
  assert.equal(resolveCopilot().reason, "installation_provenance_invalid", "wrong installed inventory digest must fail closed");
  writeFileSync(copilotProvenancePath, copilotProvenanceText);
  const copilotManifestPath = join(copilotProjection.pluginRoot, "plugin.json");
  const copilotManifestText = readFileSync(copilotManifestPath, "utf8");
  writeFileSync(copilotManifestPath, "{}\n");
  assert.equal(resolveCopilot().reason, "manifest_invalid", "tampered Copilot payload must fail closed before execution");
  writeFileSync(copilotManifestPath, copilotManifestText);
  copilotProjection.commit();
  const sameCopilotProjection = prepareCopilotMarketplace({ dataRoot, builtPluginRoot: builtCopilotPluginRoot });
  assert.equal(sameCopilotProjection.changed, false);
  sameCopilotProjection.commit();

  const reverseDataRoot = join(fixtureRoot, "reverse-order-data");
  const copilotFirst = prepareCopilotMarketplace({ dataRoot: reverseDataRoot, builtPluginRoot: builtCopilotPluginRoot });
  copilotFirst.commit();
  const copilotDigestBeforeShared = digestDirectory(copilotFirst.pluginRoot);
  const sharedSecond = prepareLocalMarketplace({ dataRoot: reverseDataRoot, builtPluginRoot });
  sharedSecond.commit();
  assert.equal(digestDirectory(copilotFirst.pluginRoot), copilotDigestBeforeShared, "shared staging must not mutate the Copilot profile");

  const rollbackDataRoot = join(fixtureRoot, "copilot-rollback-data");
  const rollbackShared = prepareLocalMarketplace({ dataRoot: rollbackDataRoot, builtPluginRoot });
  rollbackShared.commit();
  const rollbackSharedDigest = digestDirectory(rollbackShared.pluginRoot);
  const rolledBackCopilot = prepareCopilotMarketplace({ dataRoot: rollbackDataRoot, builtPluginRoot: builtCopilotPluginRoot });
  assert.equal(rolledBackCopilot.changed, true);
  rolledBackCopilot.rollback();
  assert.equal(existsSync(rolledBackCopilot.root), false, "rolling back a first Copilot stage must remove only its isolated marketplace root");
  assert.equal(digestDirectory(rollbackShared.pluginRoot), rollbackSharedDigest, "Copilot rollback must retain the shared profile byte-for-byte");
  for (const args of [
    ["doctor", "--dir", repoRoot, "--all-active", "--json"],
    ["gate-check", "--dir", repoRoot, "--run", "automatic-version-asset-sync", "--json"],
    ["delivery-map", "--dir", repoRoot, "--run", "automatic-version-asset-sync", "--json"],
  ]) {
    const command = spawnSync(process.execPath, [localEntrypoint, ...args], { encoding: "utf8", env: { ...process.env, PATH: join(fixtureRoot, "no-tools") } });
    assert.doesNotMatch(command.stderr, /npm|npx|registry/i, `${args[0]} must not require registry tooling`);
    assert.doesNotThrow(() => JSON.parse(command.stdout), `${args[0]} must return machine-readable installed-runtime evidence`);
  }
  first.commit();

  assert.equal(validateDistributionProfiles(pluginDefinition).status, "matched");
  const profileHistory = json(join(builtPluginRoot, "meta", "distribution-profile-history.json"));
  const fourProfileContract = profileHistory.contracts["four-profile-v1"].distribution_profiles;
  for (const version of ["0.13.6", "0.13.7", "0.13.8", "0.14.1"]) {
    const historicalDefinitionFixture = {
      ...structuredClone(pluginDefinition),
      version,
      distributionProfiles: structuredClone(fourProfileContract),
    };
    assert.equal(validateDistributionProfiles(historicalDefinitionFixture).status, "invalid", "ordinary callers must remain current-only");
    assert.equal(classifyHistoricalDistributionProfile({
      catalogue: profileHistory,
      version,
      distributionProfiles: historicalDefinitionFixture.distributionProfiles,
    }).status, "matched");

    const historicalDataRoot = join(fixtureRoot, `historical-profile-${version}`);
    const historicalInitial = prepareLocalMarketplace({ dataRoot: historicalDataRoot, builtPluginRoot });
    historicalInitial.commit();
    const historicalPluginRoot = historicalInitial.pluginRoot;
    writeFileSync(
      join(historicalPluginRoot, "meta", "agdf-plugin.definition.json"),
      `${JSON.stringify(historicalDefinitionFixture, null, 2)}\n`,
    );
    for (const manifestPath of [
      join(historicalPluginRoot, "runtime", "runtime-manifest.json"),
      join(historicalPluginRoot, ".codex-plugin", "plugin.json"),
      join(historicalPluginRoot, ".claude-plugin", "plugin.json"),
    ]) {
      writeFileSync(manifestPath, `${JSON.stringify({ ...json(manifestPath), version }, null, 2)}\n`);
    }
    rmSync(join(historicalPluginRoot, "meta", "distribution-profile-history.json"));
    writeFileSync(join(historicalPluginRoot, "historical-only.txt"), "rollback-only\n");
    const historicalSourceDigest = digestPluginSource(historicalPluginRoot, version);
    const historicalProvenancePath = join(historicalPluginRoot, ".agdf-installation.json");
    writeFileSync(historicalProvenancePath, `${JSON.stringify({
      ...json(historicalProvenancePath),
      canonical_version: version,
      codex_install_version: version,
      source_digest: historicalSourceDigest,
    }, null, 2)}\n`);
    const historicalMarkerPath = join(historicalInitial.root, ".agdf-owned.json");
    writeFileSync(historicalMarkerPath, `${JSON.stringify({
      ...json(historicalMarkerPath),
      version,
      codex_install_version: version,
      source_digest: historicalSourceDigest,
      plugin_digest: digestDirectory(historicalPluginRoot),
    }, null, 2)}\n`);
    const historicalRootDigest = digestDirectory(historicalInitial.root);
    const historicalMarker = json(historicalMarkerPath);
    writeFileSync(historicalMarkerPath, `${JSON.stringify({
      ...historicalMarker,
      source_digest: "0".repeat(64),
    }, null, 2)}\n`);
    captureError(
      () => prepareLocalMarketplace({ dataRoot: historicalDataRoot, builtPluginRoot }),
      /ownership source digest mismatch/,
    );
    writeFileSync(historicalMarkerPath, `${JSON.stringify(historicalMarker, null, 2)}\n`);
    assert.equal(digestDirectory(historicalInitial.root), historicalRootDigest, "ownership source digest mismatch must block before marketplace mutation");
    if (version === "0.13.8") {
      const invalidHistoryPlugin = join(fixtureRoot, "invalid-history-built-plugin");
      cpSync(builtPluginRoot, invalidHistoryPlugin, { recursive: true });
      writeFileSync(join(invalidHistoryPlugin, "meta", "distribution-profile-history.json"), "{}\n");
      captureError(
        () => prepareLocalMarketplace({ dataRoot: historicalDataRoot, builtPluginRoot: invalidHistoryPlugin }),
        /profile_history_invalid/,
      );
      assert.equal(digestDirectory(historicalInitial.root), historicalRootDigest, "invalid history must block before marketplace mutation");
    }
    const historicalUpgrade = prepareLocalMarketplace({ dataRoot: historicalDataRoot, builtPluginRoot });
    assert.equal(historicalUpgrade.existingClassification, "owned_supported_historical_rebuild");
    assert.equal(historicalUpgrade.historicalEvidence.releaseVersion, version);
    assert.equal(historicalUpgrade.historicalEvidence.contractId, "four-profile-v1");
    assert.match(historicalUpgrade.historicalEvidence.contractDigest, /^[a-f0-9]{64}$/);
    assert.match(historicalUpgrade.historicalEvidence.entryDigest, /^[a-f0-9]{64}$/);
    assert.equal(existsSync(join(historicalUpgrade.pluginRoot, "historical-only.txt")), false);
    assert.equal(json(join(historicalUpgrade.pluginRoot, ".agdf-installation.json")).canonical_version, pluginDefinition.version);
    historicalUpgrade.rollback();
    assert.equal(digestDirectory(historicalInitial.root), historicalRootDigest, `${version} rollback must be byte-identical`);
    const historicalCommit = prepareLocalMarketplace({ dataRoot: historicalDataRoot, builtPluginRoot });
    assert.equal(historicalCommit.existingClassification, "owned_supported_historical_rebuild");
    historicalCommit.commit();
  }

  for (const version of ["0.14.2", "0.14.3"]) {
    const currentShape = structuredClone(pluginDefinition);
    currentShape.version = version;
    assert.equal(validateDistributionProfiles(currentShape).status, "matched");
    assert.equal(classifyHistoricalDistributionProfile({
      catalogue: profileHistory,
      version,
      distributionProfiles: currentShape.distributionProfiles,
    }).status, "matched");

    const currentShapeDataRoot = join(fixtureRoot, `current-shape-${version}`);
    const currentShapeInitial = prepareLocalMarketplace({ dataRoot: currentShapeDataRoot, builtPluginRoot });
    currentShapeInitial.commit();
    writeFileSync(
      join(currentShapeInitial.pluginRoot, "meta", "agdf-plugin.definition.json"),
      `${JSON.stringify(currentShape, null, 2)}\n`,
    );
    for (const manifestPath of [
      join(currentShapeInitial.pluginRoot, "runtime", "runtime-manifest.json"),
      join(currentShapeInitial.pluginRoot, ".codex-plugin", "plugin.json"),
      join(currentShapeInitial.pluginRoot, ".claude-plugin", "plugin.json"),
    ]) {
      writeFileSync(manifestPath, `${JSON.stringify({ ...json(manifestPath), version }, null, 2)}\n`);
    }
    rmSync(join(currentShapeInitial.pluginRoot, "meta", "distribution-profile-history.json"));
    const currentShapeSourceDigest = digestPluginSource(currentShapeInitial.pluginRoot, version);
    const currentShapeProvenance = join(currentShapeInitial.pluginRoot, ".agdf-installation.json");
    writeFileSync(currentShapeProvenance, `${JSON.stringify({
      ...json(currentShapeProvenance),
      canonical_version: version,
      codex_install_version: version,
      source_digest: currentShapeSourceDigest,
    }, null, 2)}\n`);
    const currentShapeMarker = join(currentShapeInitial.root, ".agdf-owned.json");
    writeFileSync(currentShapeMarker, `${JSON.stringify({
      ...json(currentShapeMarker),
      version,
      codex_install_version: version,
      source_digest: currentShapeSourceDigest,
      plugin_digest: digestDirectory(currentShapeInitial.pluginRoot),
    }, null, 2)}\n`);
    const currentShapeUpgrade = prepareLocalMarketplace({ dataRoot: currentShapeDataRoot, builtPluginRoot });
    assert.equal(currentShapeUpgrade.existingClassification, "current_or_marker_migration");
    assert.equal(currentShapeUpgrade.historicalEvidence, null);
    currentShapeUpgrade.commit();
  }

  const firstPluginRoot = join(first.root, "plugins", "agdf");
  const canonicalProvenancePath = join(firstPluginRoot, ".agdf-installation.json");
  const canonicalProvenance = json(canonicalProvenancePath);
  rmSync(canonicalProvenancePath);
  const legacyInstalledDefinitionPath = join(firstPluginRoot, "meta", "agdf-plugin.definition.json");
  const { distributionProfiles: _removedProfiles, ...legacyInstalledDefinition } = json(legacyInstalledDefinitionPath);
  writeFileSync(legacyInstalledDefinitionPath, `${JSON.stringify(legacyInstalledDefinition, null, 2)}\n`);
  const legacySourceDigest = digestPluginSource(firstPluginRoot, canonicalProvenance.canonical_version);
  writeFileSync(join(firstPluginRoot, ".agdf-local-install.json"), `${JSON.stringify({
    schema_version: 1,
    owner: "create-agdf",
    kind: "codex_local_development_projection",
    canonical_version: canonicalProvenance.canonical_version,
    codex_install_version: canonicalProvenance.codex_install_version,
    source_digest: legacySourceDigest,
  }, null, 2)}\n`);
  const ownedMarkerPath = join(first.root, ".agdf-owned.json");
  writeFileSync(ownedMarkerPath, `${JSON.stringify({
    ...json(ownedMarkerPath),
    source_digest: legacySourceDigest,
    plugin_digest: digestDirectory(firstPluginRoot),
  }, null, 2)}\n`);
  const migratedProvenance = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(migratedProvenance.changed, true, "explicit reinstall must migrate exact owned legacy provenance");
  assert.equal(existsSync(join(migratedProvenance.pluginRoot, ".agdf-installation.json")), true);
  assert.equal(existsSync(join(migratedProvenance.pluginRoot, ".agdf-local-install.json")), false);
  migratedProvenance.commit();

  const current = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(current.changed, false, "matching marketplace stage must be idempotent");
  current.commit();

  const invalidLegacyDataRoot = join(fixtureRoot, "invalid-legacy-data");
  const invalidLegacyInitial = prepareLocalMarketplace({ dataRoot: invalidLegacyDataRoot, builtPluginRoot });
  invalidLegacyInitial.commit();
  const invalidLegacyPluginRoot = invalidLegacyInitial.pluginRoot;
  rmSync(join(invalidLegacyPluginRoot, ".agdf-installation.json"));
  writeFileSync(join(invalidLegacyPluginRoot, ".agdf-local-install.json"), "{}\n");
  const invalidLegacyOwnedPath = join(invalidLegacyInitial.root, ".agdf-owned.json");
  writeFileSync(invalidLegacyOwnedPath, `${JSON.stringify({
    ...json(invalidLegacyOwnedPath),
    plugin_digest: digestDirectory(invalidLegacyPluginRoot),
  }, null, 2)}\n`);
  assert.throws(
    () => prepareLocalMarketplace({ dataRoot: invalidLegacyDataRoot, builtPluginRoot }),
    /installation_provenance_invalid/,
    "arbitrary legacy marker must not become migration authority",
  );

  const missingProvenanceDataRoot = join(fixtureRoot, "missing-provenance-data");
  const missingProvenanceInitial = prepareLocalMarketplace({ dataRoot: missingProvenanceDataRoot, builtPluginRoot });
  missingProvenanceInitial.commit();
  rmSync(join(missingProvenanceInitial.pluginRoot, ".agdf-installation.json"));
  const missingProvenanceOwnedPath = join(missingProvenanceInitial.root, ".agdf-owned.json");
  writeFileSync(missingProvenanceOwnedPath, `${JSON.stringify({
    ...json(missingProvenanceOwnedPath),
    plugin_digest: digestDirectory(missingProvenanceInitial.pluginRoot),
  }, null, 2)}\n`);
  assert.throws(
    () => prepareLocalMarketplace({ dataRoot: missingProvenanceDataRoot, builtPluginRoot }),
    /installation_provenance_missing/,
    "missing provenance must not become migration authority",
  );

  const preProvenanceDataRoot = join(fixtureRoot, "pre-provenance-data");
  const preProvenanceInitial = prepareLocalMarketplace({ dataRoot: preProvenanceDataRoot, builtPluginRoot });
  preProvenanceInitial.commit();
  const preProvenancePluginRoot = preProvenanceInitial.pluginRoot;
  rmSync(join(preProvenancePluginRoot, ".agdf-installation.json"));
  const preProvenanceDefinitionPath = join(preProvenancePluginRoot, "meta", "agdf-plugin.definition.json");
  const { distributionProfiles: _preProvenanceProfiles, ...preProvenanceDefinition } = json(preProvenanceDefinitionPath);
  writeFileSync(preProvenanceDefinitionPath, `${JSON.stringify(preProvenanceDefinition, null, 2)}\n`);
  writeFileSync(join(preProvenancePluginRoot, "historical-only.txt"), "must not enter rebuilt stage\n");
  const preProvenanceOwnedPath = join(preProvenanceInitial.root, ".agdf-owned.json");
  const { source_digest: _preProvenanceSourceDigest, ...preProvenanceOwnership } = json(preProvenanceOwnedPath);
  writeFileSync(preProvenanceOwnedPath, `${JSON.stringify({
    ...preProvenanceOwnership,
    plugin_digest: digestDirectory(preProvenancePluginRoot),
  }, null, 2)}\n`);
  const historicalDigest = digestDirectory(preProvenanceInitial.root);
  const rebuilt = prepareLocalMarketplace({ dataRoot: preProvenanceDataRoot, builtPluginRoot });
  assert.equal(rebuilt.changed, true);
  assert.equal(rebuilt.existingClassification, "owned_pre_provenance_rebuild");
  assert.equal(existsSync(join(rebuilt.pluginRoot, "historical-only.txt")), false, "rebuild stage must contain canonical target content only");
  assert.equal(existsSync(join(rebuilt.pluginRoot, ".agdf-installation.json")), true);
  rebuilt.rollback();
  assert.equal(digestDirectory(preProvenanceInitial.root), historicalDigest, "rollback must restore the historical owned root exactly");
  assert.equal(existsSync(join(preProvenancePluginRoot, "historical-only.txt")), true);
  const hostFailureCalls = [];
  const hostFailure = Object.assign(new Error("simulated plugin install failure"), { stderr: "simulated plugin install failure" });
  assert.throws(() => installCodexGlobalPlugin({
    prepare: () => prepareLocalMarketplace({ dataRoot: preProvenanceDataRoot, builtPluginRoot }),
    exec: scriptedExec({
      "codex plugin marketplace list --json": '{"marketplaces":[]}',
      "codex plugin add agdf@agdf --json": hostFailure,
    }, hostFailureCalls),
  }), /simulated plugin install failure/);
  assert.equal(digestDirectory(preProvenanceInitial.root), historicalDigest, "host failure must restore the historical owned root exactly");
  assert.ok(hostFailureCalls.includes("codex plugin marketplace remove agdf --json"), "host failure must recover the temporary registration");
  const rebuiltForCommit = prepareLocalMarketplace({ dataRoot: preProvenanceDataRoot, builtPluginRoot });
  assert.equal(rebuiltForCommit.existingClassification, "owned_pre_provenance_rebuild");
  rebuiltForCommit.commit();
  assert.equal(existsSync(`${rebuiltForCommit.root}.backup`), false, "commit must remove the owned backup");
  const rebuiltCurrent = prepareLocalMarketplace({ dataRoot: preProvenanceDataRoot, builtPluginRoot });
  assert.equal(rebuiltCurrent.changed, false);
  assert.equal(rebuiltCurrent.existingClassification, "current_or_marker_migration");
  rebuiltCurrent.commit();

  const tamperedPreProvenanceDataRoot = join(fixtureRoot, "tampered-pre-provenance-data");
  const tamperedPreProvenanceInitial = prepareLocalMarketplace({ dataRoot: tamperedPreProvenanceDataRoot, builtPluginRoot });
  tamperedPreProvenanceInitial.commit();
  rmSync(join(tamperedPreProvenanceInitial.pluginRoot, ".agdf-installation.json"));
  const tamperedDefinitionPath = join(tamperedPreProvenanceInitial.pluginRoot, "meta", "agdf-plugin.definition.json");
  const { distributionProfiles: _tamperedProfiles, ...tamperedDefinition } = json(tamperedDefinitionPath);
  writeFileSync(tamperedDefinitionPath, `${JSON.stringify(tamperedDefinition, null, 2)}\n`);
  const tamperedPreProvenanceError = captureError(
    () => prepareLocalMarketplace({ dataRoot: tamperedPreProvenanceDataRoot, builtPluginRoot }),
    /tampered AGDF marketplace root/,
  );
  assert.equal(tamperedPreProvenanceError.existingClassification, "invalid_or_unowned");

  const incompletePreProvenanceDataRoot = join(fixtureRoot, "incomplete-pre-provenance-data");
  const incompletePreProvenanceInitial = prepareLocalMarketplace({ dataRoot: incompletePreProvenanceDataRoot, builtPluginRoot });
  incompletePreProvenanceInitial.commit();
  rmSync(join(incompletePreProvenanceInitial.pluginRoot, ".agdf-installation.json"));
  const incompleteDefinitionPath = join(incompletePreProvenanceInitial.pluginRoot, "meta", "agdf-plugin.definition.json");
  const { distributionProfiles: _incompleteProfiles, ...incompleteDefinition } = json(incompleteDefinitionPath);
  writeFileSync(incompleteDefinitionPath, `${JSON.stringify(incompleteDefinition, null, 2)}\n`);
  rmSync(join(incompletePreProvenanceInitial.pluginRoot, "runtime", "agdf-local.js"));
  const incompleteOwnedPath = join(incompletePreProvenanceInitial.root, ".agdf-owned.json");
  writeFileSync(incompleteOwnedPath, `${JSON.stringify({
    ...json(incompleteOwnedPath),
    plugin_digest: digestDirectory(incompletePreProvenanceInitial.pluginRoot),
  }, null, 2)}\n`);
  const incompleteError = captureError(
    () => prepareLocalMarketplace({ dataRoot: incompletePreProvenanceDataRoot, builtPluginRoot }),
    /Built plugin is incomplete/,
  );
  assert.equal(incompleteError.existingClassification, "invalid_or_unowned");

  const malformedCurrentDataRoot = join(fixtureRoot, "malformed-current-data");
  const malformedCurrentInitial = prepareLocalMarketplace({ dataRoot: malformedCurrentDataRoot, builtPluginRoot });
  malformedCurrentInitial.commit();
  const malformedCurrentMarkerPath = join(malformedCurrentInitial.pluginRoot, ".agdf-installation.json");
  writeFileSync(malformedCurrentMarkerPath, "{}\n");
  const malformedCurrentOwnedPath = join(malformedCurrentInitial.root, ".agdf-owned.json");
  writeFileSync(malformedCurrentOwnedPath, `${JSON.stringify({
    ...json(malformedCurrentOwnedPath),
    plugin_digest: digestDirectory(malformedCurrentInitial.pluginRoot),
  }, null, 2)}\n`);
  const malformedCurrentError = captureError(
    () => prepareLocalMarketplace({ dataRoot: malformedCurrentDataRoot, builtPluginRoot }),
    /installation_provenance_invalid/,
  );
  assert.equal(malformedCurrentError.existingClassification, "invalid_or_unowned");

  const codexMarketplacePath = join(current.root, ".agents", "plugins", "marketplace.json");
  const previousCodexMarketplace = json(codexMarketplacePath);
  writeFileSync(codexMarketplacePath, `${JSON.stringify({
    ...previousCodexMarketplace,
    interface: { displayName: pluginDefinition.displayName },
  }, null, 2)}\n`);
  const migratedLabel = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(migratedLabel.changed, true, "the exact previous full-product Marketplace label must migrate");
  assert.equal(json(codexMarketplacePath).interface.displayName, "AGDF");
  migratedLabel.commit();
  const migratedCurrent = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(migratedCurrent.changed, false, "the migrated Marketplace label must be idempotent");
  migratedCurrent.commit();

  const ownershipPath = join(migratedCurrent.root, ".agdf-owned.json");
  const registrationMigration = prepareLocalMarketplace({ dataRoot, builtPluginRoot, codexRegistrationRevision: 1 });
  assert.equal(registrationMigration.changed, true, "a projection without the Codex registration revision must refresh once");
  assert.equal(json(ownershipPath).codex_registration_revision, 1);
  registrationMigration.commit();
  const registeredCurrent = prepareLocalMarketplace({ dataRoot, builtPluginRoot, codexRegistrationRevision: 1 });
  assert.equal(registeredCurrent.changed, false, "the current Codex registration revision must be idempotent");
  registeredCurrent.commit();
  const crossSurfaceCurrent = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(crossSurfaceCurrent.changed, false, "a non-Codex preparation must preserve the existing Codex registration revision");
  assert.equal(json(ownershipPath).codex_registration_revision, 1);
  crossSurfaceCurrent.commit();

  const legacyDataRoot = join(fixtureRoot, "legacy-data");
  const legacyPlugin = join(fixtureRoot, "legacy-plugin");
  cpSync(builtPluginRoot, legacyPlugin, { recursive: true });
  const legacyVersion = "0.12.0";
  const legacyDefinitionPath = join(legacyPlugin, "meta", "agdf-plugin.definition.json");
  const legacyDefinition = json(legacyDefinitionPath);
  writeFileSync(legacyDefinitionPath, `${JSON.stringify({
    ...legacyDefinition,
    version: legacyVersion,
    description: "Previous AGDF description.",
    claudeDescription: "Previous Claude-specific AGDF description.",
    longDescription: "Previous AGDF long description.",
  }, null, 2)}\n`);
  const legacyRuntimePath = join(legacyPlugin, "runtime", "runtime-manifest.json");
  writeFileSync(legacyRuntimePath, `${JSON.stringify({ ...json(legacyRuntimePath), version: legacyVersion }, null, 2)}\n`);
  for (const manifestPath of [
    join(legacyPlugin, ".codex-plugin", "plugin.json"),
    join(legacyPlugin, ".claude-plugin", "plugin.json"),
  ]) {
    writeFileSync(manifestPath, `${JSON.stringify({ ...json(manifestPath), version: legacyVersion }, null, 2)}\n`);
  }
  const legacy = prepareLocalMarketplace({ dataRoot: legacyDataRoot, builtPluginRoot: legacyPlugin, expectedVersion: legacyVersion });
  assert.equal(legacy.changed, true);
  assert.equal(json(join(legacy.root, ".agdf-owned.json")).version, legacyVersion);
  assert.equal(json(join(legacy.root, ".claude-plugin", "marketplace.json")).metadata.description, "Previous AGDF description.");
  assert.equal(json(join(legacy.root, ".claude-plugin", "marketplace.json")).plugins[0].description, "Previous Claude-specific AGDF description.");
  legacy.commit();
  const upgraded = prepareLocalMarketplace({ dataRoot: legacyDataRoot, builtPluginRoot });
  assert.equal(upgraded.changed, true, "an owned prior-version marketplace must upgrade when descriptive metadata changed");
  assert.equal(json(join(upgraded.root, ".agdf-owned.json")).version, pluginDefinition.version);
  assert.equal(json(join(upgraded.root, ".claude-plugin", "marketplace.json")).metadata.description, pluginDefinition.description);
  upgraded.commit();

  const modifiedPlugin = join(fixtureRoot, "modified-plugin");
  cpSync(builtPluginRoot, modifiedPlugin, { recursive: true });
  writeFileSync(join(modifiedPlugin, "distribution-test.txt"), "new build\n");
  const interruptedSwap = prepareLocalMarketplace({ dataRoot, builtPluginRoot: modifiedPlugin });
  assert.equal(interruptedSwap.changed, true);
  const recoveredSwap = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(recoveredSwap.changed, false, "an uncommitted swapped root must restore its backup on the next run");
  assert.throws(() => readFileSync(join(recoveredSwap.root, "plugins", "agdf", "distribution-test.txt")), /ENOENT/);

  const update = prepareLocalMarketplace({ dataRoot, builtPluginRoot: modifiedPlugin });
  assert.equal(update.changed, true);
  assert.equal(readFileSync(join(update.root, "plugins", "agdf", "distribution-test.txt"), "utf8"), "new build\n");
  update.rollback();
  assert.throws(() => readFileSync(join(update.root, "plugins", "agdf", "distribution-test.txt")), /ENOENT/);

  const claudeManifestPath = join(update.root, ".claude-plugin", "marketplace.json");
  const claudeManifest = readFileSync(claudeManifestPath, "utf8");
  const tamperedClaudeManifest = JSON.parse(claudeManifest);
  tamperedClaudeManifest.metadata.description = "Foreign description.";
  writeFileSync(claudeManifestPath, `${JSON.stringify(tamperedClaudeManifest, null, 2)}\n`);
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /Claude local marketplace manifest is not owned/);
  writeFileSync(claudeManifestPath, claudeManifest);
  writeFileSync(claudeManifestPath, claudeManifest.replace("./plugins/agdf", "./plugins/foreign"));
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /Claude local marketplace manifest is not owned/);
  writeFileSync(claudeManifestPath, claudeManifest);

  const codexManifestPath = join(update.root, ".agents", "plugins", "marketplace.json");
  const codexManifest = readFileSync(codexManifestPath, "utf8");
  const tamperedCodexManifest = JSON.parse(codexManifest);
  tamperedCodexManifest.interface.displayName = "Foreign AGDF";
  writeFileSync(codexManifestPath, `${JSON.stringify(tamperedCodexManifest, null, 2)}\n`);
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /Codex local marketplace manifest is not owned/);
  writeFileSync(codexManifestPath, codexManifest);

  writeFileSync(join(update.root, "plugins", "agdf", "LICENSE"), "tampered\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /source_digest_mismatch|tampered AGDF marketplace root/);
  rmSync(update.root, { recursive: true, force: true });
  mkdirSync(update.root, { recursive: true });
  writeFileSync(join(update.root, "foreign.txt"), "foreign\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /ownership marker/);

  const corruptBuiltPlugin = join(fixtureRoot, "corrupt-built-plugin");
  cpSync(builtPluginRoot, corruptBuiltPlugin, { recursive: true });
  writeFileSync(join(corruptBuiltPlugin, "runtime", "create-agdf", "NOTICE"), "corrupt\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot: join(fixtureRoot, "corrupt-data"), builtPluginRoot: corruptBuiltPlugin }), /runtime digest does not match/);

  const wrongClaudeVersionPlugin = join(fixtureRoot, "wrong-claude-version-plugin");
  cpSync(builtPluginRoot, wrongClaudeVersionPlugin, { recursive: true });
  const wrongClaudeManifestPath = join(wrongClaudeVersionPlugin, ".claude-plugin", "plugin.json");
  writeFileSync(wrongClaudeManifestPath, `${JSON.stringify({ ...json(wrongClaudeManifestPath), version: "9.9.9" }, null, 2)}\n`);
  assert.throws(
    () => prepareLocalMarketplace({ dataRoot: join(fixtureRoot, "wrong-claude-data"), builtPluginRoot: wrongClaudeVersionPlugin }),
    /Built Claude plugin version mismatch/,
  );

  const recoveryDataRoot = join(fixtureRoot, "recovery-data");
  const recoveryInitial = prepareLocalMarketplace({ dataRoot: recoveryDataRoot, builtPluginRoot });
  recoveryInitial.commit();
  renameSync(recoveryInitial.root, `${recoveryInitial.root}.backup`);
  mkdirSync(`${recoveryInitial.root}.stage`, { recursive: true });
  writeFileSync(join(`${recoveryInitial.root}.stage`, ".agdf-owned.json"), `${JSON.stringify({
    schema_version: 1,
    owner: "create-agdf",
    marketplace_id: "agdf",
    version: pluginDefinition.version,
    staging_state: "building",
  })}\n`);
  writeFileSync(join(`${recoveryInitial.root}.stage`, "partial"), "partial\n");
  const recovered = prepareLocalMarketplace({ dataRoot: recoveryDataRoot, builtPluginRoot });
  assert.equal(recovered.changed, false, "interrupted backup must be restored before idempotent comparison");

  const stableRoot = "/durable/agdf";
  assert.equal(classifyMarketplaceList("codex", '{"marketplaces":[]}', stableRoot).state, "absent");
  assert.equal(classifyMarketplaceList("claude", "[]", stableRoot).state, "absent");
  assert.equal(classifyMarketplaceList("codex", JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "local", source: stableRoot } }] }), stableRoot).state, "owned_local_current");
  assert.equal(classifyMarketplaceList("claude", JSON.stringify([{ name: "agdf", source: "directory", path: stableRoot, installLocation: stableRoot }]), stableRoot).state, "owned_local_current");
  assert.equal(classifyMarketplaceList("codex", JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "git", source: "https://github.com/arndtgold/ai-native-governance-delivery-framework.git" } }] }), stableRoot).state, "legacy_github");
  assert.equal(classifyMarketplaceList("claude", JSON.stringify([{ name: "agdf", source: "github", repo: "arndtgold/ai-native-governance-delivery-framework" }]), stableRoot).state, "legacy_github");
  assert.equal(classifyMarketplaceList("claude", JSON.stringify([{ name: "agdf", source: "someone/else" }]), stableRoot).state, "conflict");
  assert.equal(classifyMarketplaceList("codex", "not-json", stableRoot).state, "unknown");

  const codexTx = fakeTransaction();
  const codexCalls = [];
  const codex = installCodexGlobalPlugin({
    prepare: codexTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": '{"marketplaces":[]}',
      "codex plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, codexCalls),
  });
  assert.equal(codex.installedVersion, pluginDefinition.version);
  assert.equal(codexTx.state.committed, 1);
  assert.deepEqual(codexCalls.slice(0, 3), [
    "codex plugin marketplace list --json",
    `codex plugin marketplace add ${join(fixtureRoot, "fake-marketplace")} --json`,
    "codex plugin add agdf@agdf --json",
  ]);

  const recoveryEvidenceTx = fakeTransaction(join(fixtureRoot, "recovery-evidence-marketplace"));
  const recoveryPrepare = () => ({
    ...recoveryEvidenceTx.prepare(),
    existingClassification: "owned_pre_provenance_rebuild",
  });
  const recoveryEvidenceCalls = [];
  const recoveryEvidence = installCodexGlobalPlugin({
    prepare: recoveryPrepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": '{"marketplaces":[]}',
      "codex plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, recoveryEvidenceCalls),
  });
  assert.ok(recoveryEvidence.evidence.includes("marketplace_recovery:owned_pre_provenance_rebuild"));
  assert.ok(recoveryEvidence.evidence.includes("loaded_session:restart_required"));
  assert.equal(recoveryEvidence.evidence.some((value) => value.includes("loaded_session:matched")), false);

  for (const version of ["0.13.6", "0.13.7", "0.13.8", "0.14.1"]) {
    const exactHistoricalEvidence = {
      releaseVersion: version,
      contractId: "four-profile-v1",
      contractDigest: "1".repeat(64),
      entryDigest: "2".repeat(64),
    };
    for (const [surface, install] of [
      ["codex", installCodexGlobalPlugin],
      ["claude", installClaudeGlobalPlugin],
    ]) {
      const historicalRecoveryEvidence = install({
        prepare: () => ({
          ...fakeTransaction(join(fixtureRoot, `${surface}-${version}-historical-recovery-evidence-marketplace`)).prepare(),
          existingClassification: "owned_supported_historical_rebuild",
          historicalEvidence: exactHistoricalEvidence,
        }),
        exec: scriptedExec({
          [`${surface} plugin marketplace list --json`]: surface === "codex" ? '{"marketplaces":[]}' : "[]",
          ...(surface === "claude" ? {
            "claude plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
          } : {
            "codex plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
          }),
        }, []),
      });
      assert.ok(historicalRecoveryEvidence.evidence.includes("marketplace_recovery:owned_supported_historical_rebuild"));
      assert.ok(historicalRecoveryEvidence.evidence.includes("loaded_session:fresh_session_required"));
      assert.deepEqual(historicalRecoveryEvidence.historicalEvidence, exactHistoricalEvidence);
      assert.ok(historicalRecoveryEvidence.evidence.includes(`historical_release:${version}`));
      assert.ok(historicalRecoveryEvidence.evidence.includes("historical_contract:four-profile-v1"));
      assert.ok(historicalRecoveryEvidence.evidence.includes(`historical_contract_digest:${"1".repeat(64)}`));
      assert.ok(historicalRecoveryEvidence.evidence.includes(`historical_entry_digest:${"2".repeat(64)}`));
    }
  }
  const unverifiedHistoricalClaudeTx = fakeTransaction(join(fixtureRoot, "claude-unverified-historical-marketplace"));
  const unverifiedHistoricalClaudeCalls = [];
  assert.throws(() => installClaudeGlobalPlugin({
    prepare: () => ({
      ...unverifiedHistoricalClaudeTx.prepare(),
      existingClassification: "owned_supported_historical_rebuild",
      historicalEvidence: {
        releaseVersion: "0.13.8",
        contractId: "four-profile-v1",
        contractDigest: "1".repeat(64),
        entryDigest: "2".repeat(64),
      },
    }),
    exec: scriptedExec({
      "claude plugin marketplace list --json": "[]",
      "claude plugin list": "",
    }, unverifiedHistoricalClaudeCalls),
  }), /version/);
  assert.equal(unverifiedHistoricalClaudeTx.state.committed, 0);
  assert.equal(unverifiedHistoricalClaudeTx.state.rolledBack, 1);
  assert.ok(unverifiedHistoricalClaudeCalls.includes("claude plugin uninstall agdf@agdf"));
  assert.ok(
    unverifiedHistoricalClaudeCalls.indexOf("claude plugin install agdf@agdf")
      < unverifiedHistoricalClaudeCalls.lastIndexOf("claude plugin uninstall agdf@agdf"),
  );

  const claudeTx = fakeTransaction(join(fixtureRoot, "claude-marketplace"));
  const claudeCalls = [];
  const claude = installClaudeGlobalPlugin({
    prepare: claudeTx.prepare,
    exec: scriptedExec({
      "claude plugin marketplace list --json": "[]",
      "claude plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, claudeCalls),
  });
  assert.equal(claude.installedVersion, pluginDefinition.version);
  assert.equal(claudeTx.state.committed, 1);
  assert.ok(claudeCalls.includes(`claude plugin marketplace add ${join(fixtureRoot, "claude-marketplace")} --scope user`));
  assert.ok(claudeCalls.includes("claude plugin marketplace update agdf"));
  assert.ok(claudeCalls.includes("claude plugin uninstall agdf@agdf"), "installed plugin must be reinstalled, not updated");
  assert.ok(claudeCalls.includes("claude plugin install agdf@agdf"));
  assert.ok(claudeCalls.indexOf("claude plugin uninstall agdf@agdf") < claudeCalls.indexOf("claude plugin install agdf@agdf"));
  assert.equal(claudeCalls.includes("claude plugin update agdf@agdf"), false, "same-version update must no longer be used");

  const claudeRetryTx = fakeTransaction(join(fixtureRoot, "claude-retry-marketplace"));
  const claudeRetryCalls = [];
  let claudeInstallAttempts = 0;
  const claudeRetry = installClaudeGlobalPlugin({
    prepare: claudeRetryTx.prepare,
    recoverCache: () => ({ status: "recovered", reason: "claude_cache_temp_recovery_bounded_retry" }),
    exec: scriptedExec({
      "claude plugin marketplace list --json": "[]",
      "claude plugin install agdf@agdf": () => {
        claudeInstallAttempts += 1;
        if (claudeInstallAttempts === 1) throw Object.assign(new Error("EPERM rename"), { stderr: "EPERM rename" });
        return "";
      },
      "claude plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, claudeRetryCalls),
  });
  assert.equal(claudeInstallAttempts, 2);
  assert.ok(claudeRetry.evidence.includes("claude_cache_temp_recovery:bounded_retry"));
  assert.equal(claudeRetryTx.state.committed, 1);

  const claudeRetryFailureTx = fakeTransaction(join(fixtureRoot, "claude-retry-failure-marketplace"));
  let retryFailureAttempts = 0;
  let retryFailureListCalls = 0;
  const retryFailure = captureError(() => installClaudeGlobalPlugin({
    prepare: claudeRetryFailureTx.prepare,
    recoverCache: () => ({ status: "recovered", reason: "claude_cache_temp_recovery_bounded_retry" }),
    exec: scriptedExec({
      "claude plugin marketplace list --json": "[]",
      "claude plugin list": () => {
        retryFailureListCalls += 1;
        return retryFailureListCalls === 1 ? `agdf@agdf ${pluginDefinition.version}\n` : "";
      },
      "claude plugin install agdf@agdf": () => {
        retryFailureAttempts += 1;
        if (retryFailureAttempts <= 2) {
          throw Object.assign(new Error(`install failure ${retryFailureAttempts}`), { stderr: `install failure ${retryFailureAttempts}` });
        }
        return "";
      },
    }, []),
  }), /install failure 2/);
  assert.equal(retryFailureAttempts, 3, "two current install attempts and one previous-plugin restoration are expected");
  assert.equal(retryFailure.evidence.claude_cache_recovery, "claude_cache_temp_retry_exhausted");
  assert.equal(claudeRetryFailureTx.state.rolledBack, 1);
  assert.ok(retryFailure.evidence.rollback.some((entry) =>
    entry.status === "restored" && entry.args?.join(" ") === "plugin install agdf@agdf"));

  const claudeFreshTx = fakeTransaction(join(fixtureRoot, "claude-fresh-marketplace"));
  const claudeFreshCalls = [];
  const multiLineList = `Installed plugins:\n\n  ❯ agdf@agdf\n    Version: ${pluginDefinition.version}\n    Scope: user\n    Status: ✔ enabled\n`;
  const claudeFresh = installClaudeGlobalPlugin({
    prepare: claudeFreshTx.prepare,
    exec: scriptedExec({
      "claude plugin marketplace list --json": "[]",
      "claude plugin list": (() => {
        let listCalls = 0;
        return () => {
          listCalls += 1;
          return listCalls === 1 ? "Installed plugins:\n\n(none)\n" : multiLineList;
        };
      })(),
    }, claudeFreshCalls),
  });
  assert.equal(claudeFresh.installedVersion, pluginDefinition.version, "multi-line list output must yield the real version");
  assert.equal(claudeFresh.verificationStatus, "healthy");
  assert.equal(claudeFreshCalls.includes("claude plugin uninstall agdf@agdf"), false, "a fresh install must not uninstall first");

  const currentTx = fakeTransaction(join(fixtureRoot, "current-marketplace"));
  const currentCalls = [];
  const currentInstall = installCodexGlobalPlugin({
    prepare: currentTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{
        name: "agdf",
        marketplaceSource: { sourceType: "local", source: join(fixtureRoot, "current-marketplace") },
      }] }),
      "codex plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, currentCalls),
  });
  assert.equal(currentInstall.operation, "update");
  assert.deepEqual(currentCalls.slice(0, 4), [
    "codex plugin marketplace list --json",
    "codex plugin marketplace remove agdf --json",
    `codex plugin marketplace add ${join(fixtureRoot, "current-marketplace")} --json`,
    "codex plugin add agdf@agdf --json",
  ]);

  const unchangedTx = fakeTransaction(join(fixtureRoot, "unchanged-marketplace"), { changed: false });
  const unchangedCalls = [];
  installCodexGlobalPlugin({
    prepare: unchangedTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{
        name: "agdf",
        marketplaceSource: { sourceType: "local", source: join(fixtureRoot, "unchanged-marketplace") },
      }] }),
      "codex plugin list": `agdf@agdf ${pluginDefinition.version}\n`,
    }, unchangedCalls),
  });
  assert.equal(unchangedCalls.some((call) => call.includes("marketplace add") || call.includes("marketplace remove")), false);

  const refreshRemoveEvents = [];
  const refreshRemoveTx = fakeTransaction(join(fixtureRoot, "refresh-remove-marketplace"), { events: refreshRemoveEvents });
  const refreshRemoveFailure = Object.assign(new Error("remove failed"), { stderr: "remove failed" });
  assert.throws(() => installCodexGlobalPlugin({
    prepare: refreshRemoveTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{
        name: "agdf",
        marketplaceSource: { sourceType: "local", source: join(fixtureRoot, "refresh-remove-marketplace") },
      }] }),
      "codex plugin marketplace remove agdf --json": refreshRemoveFailure,
    }, refreshRemoveEvents),
  }), /remove failed/);
  assert.equal(refreshRemoveTx.state.rolledBack, 1);
  assert.deepEqual(refreshRemoveEvents.slice(-2), ["codex plugin marketplace remove agdf --json", "filesystem rollback"]);

  const refreshAddEvents = [];
  const refreshAddRoot = join(fixtureRoot, "refresh-add-marketplace");
  const refreshAddTx = fakeTransaction(refreshAddRoot, { events: refreshAddEvents });
  let refreshAddAttempts = 0;
  assert.throws(() => installCodexGlobalPlugin({
    prepare: refreshAddTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{
        name: "agdf",
        marketplaceSource: { sourceType: "local", source: refreshAddRoot },
      }] }),
      [`codex plugin marketplace add ${refreshAddRoot} --json`]: () => {
        refreshAddAttempts += 1;
        if (refreshAddAttempts === 1) throw Object.assign(new Error("add failed"), { stderr: "add failed" });
        return "{}\n";
      },
    }, refreshAddEvents),
  }), /add failed/);
  assert.equal(refreshAddTx.state.rolledBack, 1);
  assert.deepEqual(refreshAddEvents.slice(-2), ["filesystem rollback", `codex plugin marketplace add ${refreshAddRoot} --json`]);

  const refreshPluginEvents = [];
  const refreshPluginRoot = join(fixtureRoot, "refresh-plugin-marketplace");
  const refreshPluginTx = fakeTransaction(refreshPluginRoot, { events: refreshPluginEvents });
  const refreshPluginFailure = Object.assign(new Error("refresh plugin failed"), { stderr: "refresh plugin failed" });
  assert.throws(() => installCodexGlobalPlugin({
    prepare: refreshPluginTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{
        name: "agdf",
        marketplaceSource: { sourceType: "local", source: refreshPluginRoot },
      }] }),
      "codex plugin add agdf@agdf --json": refreshPluginFailure,
    }, refreshPluginEvents),
  }), /refresh plugin failed/);
  assert.equal(refreshPluginTx.state.rolledBack, 1);
  assert.deepEqual(refreshPluginEvents.slice(-3), [
    "codex plugin marketplace remove agdf --json",
    "filesystem rollback",
    `codex plugin marketplace add ${refreshPluginRoot} --json`,
  ]);

  const rollbackTx = fakeTransaction(join(fixtureRoot, "rollback-marketplace"));
  const rollbackCalls = [];
  const pluginFailure = Object.assign(new Error("plugin failed"), { stderr: "plugin failed" });
  assert.throws(() => installCodexGlobalPlugin({
    prepare: rollbackTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "git", source: "https://github.com/arndtgold/ai-native-governance-delivery-framework.git" } }] }),
      "codex plugin add agdf@agdf --json": pluginFailure,
    }, rollbackCalls),
  }), /plugin failed/);
  assert.equal(rollbackTx.state.rolledBack, 1);
  assert.ok(rollbackCalls.includes(`codex plugin marketplace add ${join(fixtureRoot, "rollback-marketplace")} --json`));
  assert.ok(rollbackCalls.includes("codex plugin marketplace remove agdf --json"));
  assert.ok(rollbackCalls.includes("codex plugin marketplace add https://github.com/arndtgold/ai-native-governance-delivery-framework.git --json"));

  const conflictTx = fakeTransaction(join(fixtureRoot, "conflict-marketplace"));
  const conflictCalls = [];
  assert.throws(() => installClaudeGlobalPlugin({
    prepare: conflictTx.prepare,
    exec: scriptedExec({ "claude plugin marketplace list --json": '[{"name":"agdf","source":"foreign/repository"}]' }, conflictCalls),
  }), /Refusing to replace/);
  assert.deepEqual(conflictCalls, ["claude plugin marketplace list --json"]);
  assert.equal(conflictTx.state.rolledBack, 1);

  const epermError = () => Object.assign(new Error("locked"), { code: "EPERM" });
  const retrySleeps = [];
  renameSyncWithRetry("stage", "stable", {
    platform: "win32",
    sleep: (ms) => retrySleeps.push(ms),
    rename: () => { if (retrySleeps.length < 2) throw epermError(); },
  });
  assert.deepEqual(retrySleeps, [50, 100], "transient EPERM renames must retry with backoff on win32");

  let persistentAttempts = 0;
  assert.throws(() => renameSyncWithRetry("stage", "stable", {
    platform: "win32",
    sleep: () => {},
    rename: () => { persistentAttempts += 1; throw epermError(); },
  }), /locked/, "persistent EPERM must surface after bounded attempts");
  assert.equal(persistentAttempts, 5, "retry must stay bounded");

  let posixAttempts = 0;
  assert.throws(() => renameSyncWithRetry("stage", "stable", {
    platform: "linux",
    sleep: () => { throw new Error("must not sleep"); },
    rename: () => { posixAttempts += 1; throw epermError(); },
  }), /locked/);
  assert.equal(posixAttempts, 1, "non-Windows EPERM must not retry");

  let enoentAttempts = 0;
  assert.throws(() => renameSyncWithRetry("stage", "stable", {
    platform: "win32",
    sleep: () => { throw new Error("must not sleep"); },
    rename: () => { enoentAttempts += 1; throw Object.assign(new Error("missing"), { code: "ENOENT" }); },
  }), /missing/);
  assert.equal(enoentAttempts, 1, "non-EPERM errors must not retry");

  assert.equal(pluginVersionFromList(`agdf@agdf ${pluginDefinition.version}\n`, "agdf@agdf"), pluginDefinition.version, "single-line format must keep working");
  assert.equal(
    pluginVersionFromList(`Installed plugins:\n\n  ❯ agdf@agdf\n    Version: ${pluginDefinition.version}\n    Scope: user\n`, "agdf@agdf"),
    pluginDefinition.version,
    "multi-line format must yield the version from the entry block",
  );
  assert.equal(
    pluginVersionFromList("Installed plugins:\n\n  ❯ other@market\n    Version: 9.9.9\n  ❯ agdf@agdf\n    Scope: user\n", "agdf@agdf"),
    "",
    "a version from another entry block must not be attributed",
  );
  assert.equal(pluginVersionFromList("Installed plugins:\n\n(none)\n", "agdf@agdf"), "", "absent plugin must yield an empty version");

  console.log("Local marketplace tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
