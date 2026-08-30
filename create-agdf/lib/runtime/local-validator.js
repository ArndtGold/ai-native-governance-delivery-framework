import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import {
  INSTALLATION_PROVENANCE_FILE,
  digestDirectory,
  inspectCopilotPayloadInventory,
  inspectGeneratedRepositoryMarketplace,
  inspectInstallationProvenance,
  validateDistributionProfiles,
} from "./plugin-provenance.js";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function canonicalPath(path) {
  try { return realpathSync(path); } catch { return resolve(path); }
}

export { digestDirectory };

function envelope(machineValidation, options, evidence = {}) {
  return {
    schema_version: "1",
    machine_validation: machineValidation,
    surface: options.surface,
    expected_version: options.expectedVersion,
    observed_version: evidence.observedVersion ?? null,
    source: evidence.source ?? null,
    registry_access: false,
    distribution_profile: evidence.distributionProfile ?? null,
    evidence_plane: evidence.evidencePlane ?? null,
    canonical_version: evidence.canonicalVersion ?? options.expectedVersion ?? null,
    plugin_version: evidence.pluginVersion ?? null,
    runtime_digest: evidence.runtimeDigest ?? null,
    source_digest: evidence.sourceDigest ?? null,
    plugin_root: evidence.pluginRoot ?? null,
    provenance_status: evidence.provenanceStatus ?? null,
    ...(evidence.reason ? { reason: evidence.reason } : {}),
  };
}

export function resolveLocalValidator(options) {
  if (options.ownedPackageRoot) {
    const packageManifest = readJson(join(options.ownedPackageRoot, "package.json"));
    const observedVersion = packageManifest?.version ?? null;
    if (!packageManifest) {
      return { envelope: envelope("unavailable", options, { source: "config_local_package", evidencePlane: "opencode_config_local", distributionProfile: "opencode-config-local", reason: "package_missing" }) };
    }
    if (observedVersion !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "config_local_package", evidencePlane: "opencode_config_local", distributionProfile: "opencode-config-local" }) };
    }
    const entrypoint = join(options.ownedPackageRoot, "bin", "create-agdf.js");
    if (!existsSync(entrypoint)) {
      return { envelope: envelope("unavailable", options, { observedVersion, source: "config_local_package", evidencePlane: "opencode_config_local", distributionProfile: "opencode-config-local", reason: "entrypoint_missing" }) };
    }
    return {
      envelope: envelope("owned_version_matched", options, { observedVersion, source: "config_local_package", evidencePlane: "opencode_config_local", distributionProfile: "opencode-config-local", provenanceStatus: "matched" }),
      executable: process.execPath,
      prefixArgs: [entrypoint],
    };
  }
  const manifestPath = join(options.runtimeRoot, "runtime-manifest.json");
  const manifestExists = existsSync(manifestPath);
  const manifest = manifestExists ? readJson(manifestPath) : null;
  if (manifestExists && !manifest) {
    return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", reason: "manifest_invalid" }) };
  }
  if (manifest) {
    const pluginRoot = canonicalPath(options.pluginRoot ?? join(options.runtimeRoot, ".."));
    if (options.expectedPluginRoot && canonicalPath(options.expectedPluginRoot) !== pluginRoot) {
      return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", pluginRoot, evidencePlane: "loaded_session", distributionProfile: "runtime-plugin", provenanceStatus: "mismatch", reason: "plugin_root_mismatch" }) };
    }
    const definition = readJson(join(pluginRoot, "meta", "agdf-plugin.definition.json"));
    const profile = validateDistributionProfiles(definition);
    if (profile.status !== "matched") {
      return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", pluginRoot, distributionProfile: "runtime-plugin", provenanceStatus: "invalid", reason: "profile_invalid" }) };
    }
    const codexManifest = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"));
    const claudeManifest = readJson(join(pluginRoot, ".claude-plugin", "plugin.json"));
    const copilotManifest = readJson(join(pluginRoot, "plugin.json"));
    const copilotProfile = Boolean(copilotManifest && !codexManifest && !claudeManifest);
    const distributionProfile = copilotProfile ? "copilot-runtime-plugin" : "runtime-plugin";
    const pluginVersion = copilotProfile ? copilotManifest?.version ?? null : codexManifest?.version ?? null;
    if (copilotProfile
      ? copilotManifest.version !== definition.version
      : (!codexManifest || !claudeManifest || claudeManifest.version !== definition.version)) {
      return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, distributionProfile, provenanceStatus: "invalid", reason: "manifest_invalid" }) };
    }
    const copilotInventory = copilotProfile ? inspectCopilotPayloadInventory(pluginRoot, definition.version) : null;
    if (copilotProfile && copilotInventory.status !== "matched") {
      return { envelope: envelope("version_mismatch", options, { source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, distributionProfile, provenanceStatus: "invalid", reason: copilotInventory.reason }) };
    }
    const packageRoot = join(options.runtimeRoot, "create-agdf");
    if (!existsSync(packageRoot)) {
      return { envelope: envelope("unavailable", options, { source: "plugin_bundle", pluginRoot, pluginVersion, distributionProfile, reason: "runtime_missing" }) };
    }
    const packageManifest = readJson(join(packageRoot, "package.json"));
    const observedVersion = packageManifest?.version ?? manifest.version ?? null;
    if (observedVersion !== options.expectedVersion || manifest.version !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, distributionProfile }) };
    }
    let observedDigest = null;
    try { observedDigest = digestDirectory(packageRoot); } catch {}
    if (!observedDigest || manifest.digest !== observedDigest) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, runtimeDigest: observedDigest, distributionProfile, reason: "runtime_digest_mismatch" }) };
    }
    const entrypoint = resolve(options.runtimeRoot, manifest.entrypoint ?? "");
    const entrypointRelative = relative(options.runtimeRoot, entrypoint);
    if (!manifest.entrypoint || entrypointRelative === ".." || entrypointRelative.startsWith(`..${sep}`) || isAbsolute(entrypointRelative)) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, runtimeDigest: observedDigest, distributionProfile, reason: "invalid_entrypoint" }) };
    }
    if (!existsSync(entrypoint)) {
      return { envelope: envelope("unavailable", options, { observedVersion, source: "plugin_bundle", pluginRoot, pluginVersion, canonicalVersion: definition.version, runtimeDigest: observedDigest, distributionProfile, reason: "entrypoint_missing" }) };
    }
    const installed = existsSync(join(pluginRoot, INSTALLATION_PROVENANCE_FILE));
    let provenanceStatus = "not_applicable";
    let sourceDigest = null;
    let evidencePlane = options.expectedPluginRoot ? "loaded_session" : "installed_plugin_root";
    if (installed) {
      const provenance = inspectInstallationProvenance(pluginRoot, {
        definition,
        runtimeManifest: manifest,
        pluginVersion,
        profileId: distributionProfile,
        inventoryDigest: copilotInventory?.inventoryDigest ?? null,
      });
      provenanceStatus = provenance.status;
      sourceDigest = provenance.marker?.source_digest ?? null;
      if (provenance.status !== "matched") {
        return { envelope: envelope("version_mismatch", options, {
          observedVersion,
          source: "plugin_bundle",
          pluginRoot,
          pluginVersion,
          canonicalVersion: definition.version,
          runtimeDigest: observedDigest,
          sourceDigest,
          distributionProfile,
          evidencePlane,
          provenanceStatus,
          reason: provenance.reason,
        }) };
      }
    } else if (existsSync(join(pluginRoot, ".agdf-local-install.json"))) {
      return { envelope: envelope("unavailable", options, {
        observedVersion,
        source: "plugin_bundle",
        pluginRoot,
        pluginVersion,
        canonicalVersion: definition.version,
        runtimeDigest: observedDigest,
        distributionProfile,
        evidencePlane: "loaded_session",
        provenanceStatus: "missing",
        reason: "installation_provenance_missing",
      }) };
    } else {
      const generatedRepository = copilotProfile ? null : inspectGeneratedRepositoryMarketplace(resolve(pluginRoot, "..", ".."));
      if (pluginVersion !== definition.version
          || (!copilotProfile && (generatedRepository.status !== "matched"
            || canonicalPath(generatedRepository.pluginRoot) !== pluginRoot))) {
        return { envelope: envelope("unavailable", options, {
          observedVersion,
          source: "plugin_bundle",
          pluginRoot,
          pluginVersion,
          canonicalVersion: definition.version,
          runtimeDigest: observedDigest,
          distributionProfile,
          evidencePlane: "installed_plugin_root",
          provenanceStatus: "missing",
          reason: "installation_provenance_missing",
        }) };
      }
      evidencePlane = "generated_bundle";
    }
    return {
      envelope: envelope("owned_version_matched", options, {
        observedVersion,
        source: "plugin_bundle",
        pluginRoot,
        pluginVersion,
        canonicalVersion: definition.version,
        runtimeDigest: observedDigest,
        sourceDigest,
        distributionProfile,
        evidencePlane,
        provenanceStatus,
      }),
      executable: process.execPath,
      prefixArgs: [entrypoint],
    };
  }

  const configuredPath = options.configuredPath ?? process.env.AGDF_VALIDATOR_PATH ?? "";
  if (configuredPath) {
    if (!isAbsolute(configuredPath) || !existsSync(configuredPath)) {
      return { envelope: envelope("unavailable", options, { source: "configured_path", reason: "invalid_absolute_path" }) };
    }
    const versionProbe = spawnSync(configuredPath, ["--version", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    let observedVersion = null;
    try { observedVersion = JSON.parse(versionProbe.stdout)?.version ?? null; } catch {}
    if (versionProbe.status !== 0 || observedVersion !== options.expectedVersion) {
      return { envelope: envelope("version_mismatch", options, { observedVersion, source: "configured_path" }) };
    }
    return {
      envelope: envelope("configured_version_matched", options, { observedVersion, source: "configured_path" }),
      executable: configuredPath,
      prefixArgs: [],
    };
  }

  return { envelope: envelope(options.externalRequired ? "external_required" : "unavailable", options) };
}

export function runLocalValidator(options, args, io = console) {
  const resolved = resolveLocalValidator(options);
  if (args[0] === "--resolve-only") {
    io.log(JSON.stringify(resolved.envelope, null, args.includes("--json") ? 2 : 0));
    return resolved.executable ? 0 : 2;
  }
  if (!resolved.executable) {
    io.error(JSON.stringify(resolved.envelope));
    return 2;
  }
  const child = spawnSync(resolved.executable, [...resolved.prefixArgs, ...args], {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, AGDF_MACHINE_VALIDATION: resolved.envelope.machine_validation },
    stdio: "inherit",
  });
  return child.status ?? 2;
}
