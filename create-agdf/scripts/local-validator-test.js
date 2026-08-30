import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { digestDirectory, resolveLocalValidator, runLocalValidator } from "../lib/runtime/local-validator.js";
import { digestNormalizedPluginSource } from "../lib/runtime/plugin-provenance.js";
import { syncPluginRuntime } from "./sync-plugin-runtime.js";

const root = mkdtempSync(join(tmpdir(), "agdf-local-validator-"));
try {
  assert.throws(() => syncPluginRuntime(), /requires an explicit outputRoot/);
  assert.throws(() => syncPluginRuntime({ outputRoot: "relative-runtime" }), /must be absolute/);
  assert.throws(() => syncPluginRuntime({ outputRoot: join(fileURLToPath(new URL("../..", import.meta.url)), "plugin", "runtime") }), /must not write into the source plugin/);

  const repositoryRoot = join(root, "generated-repository");
  const pluginRoot = join(repositoryRoot, "plugins", "agdf");
  const runtimeRoot = join(pluginRoot, "runtime");
  const packageRoot = join(runtimeRoot, "create-agdf");
  const profileContract = {
    schemaVersion: 1,
    marketplaceIdentities: { durable: "agdf", generatedRepository: "agdf-repo" },
    profiles: {
      "source-development": { runtime: "absent", installable: false, machineValidation: "unavailable" },
      "runtime-plugin": { runtime: "required", installable: true, machineValidation: "local_exact_version_digest" },
      "copilot-runtime-plugin": { runtime: "required", installable: true, machineValidation: "local_exact_version_digest_inventory" },
      "opencode-config-local": { runtime: "config_local_package", installable: true, machineValidation: "local_exact_version" },
      "portable-skills": { runtime: "absent", installable: true, machineValidation: "unavailable_or_external_required" },
    },
  };
  mkdirSync(join(packageRoot, "bin"), { recursive: true });
  mkdirSync(join(pluginRoot, "meta"), { recursive: true });
  mkdirSync(join(pluginRoot, ".codex-plugin"), { recursive: true });
  mkdirSync(join(pluginRoot, ".claude-plugin"), { recursive: true });
  mkdirSync(join(repositoryRoot, ".agents", "plugins"), { recursive: true });
  writeFileSync(join(pluginRoot, "meta", "agdf-plugin.definition.json"), `${JSON.stringify({ version: "1.2.3", distributionProfiles: profileContract })}\n`);
  writeFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), '{"version":"1.2.3"}\n');
  const claudeManifestPath = join(pluginRoot, ".claude-plugin", "plugin.json");
  writeFileSync(claudeManifestPath, '{"version":"1.2.3"}\n');
  const repositoryMarketplacePath = join(repositoryRoot, ".agents", "plugins", "marketplace.json");
  writeFileSync(repositoryMarketplacePath, `${JSON.stringify({
    name: "agdf-repo",
    plugins: [{ name: "agdf", source: { source: "local", path: "./plugins/agdf" } }],
  })}\n`);
  writeFileSync(join(packageRoot, "package.json"), '{"name":"create-agdf","version":"1.2.3","type":"module"}\n');
  writeFileSync(join(packageRoot, "bin", "create-agdf.js"), "#!/usr/bin/env node\n");
  writeFileSync(join(runtimeRoot, "agdf-local.js"), "#!/usr/bin/env node\n");
  writeFileSync(join(runtimeRoot, "runtime-manifest.json"), `${JSON.stringify({
    version: "1.2.3",
    entrypoint: "create-agdf/bin/create-agdf.js",
    digest: digestDirectory(packageRoot),
  })}\n`);

  const matched = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(matched.envelope.machine_validation, "owned_version_matched");
  assert.equal(matched.envelope.registry_access, false);
  assert.equal(matched.envelope.distribution_profile, "runtime-plugin");
  assert.equal(matched.envelope.evidence_plane, "generated_bundle");
  assert.equal(matched.envelope.provenance_status, "not_applicable");

  rmSync(repositoryMarketplacePath);
  const missingProvenance = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(missingProvenance.envelope.machine_validation, "unavailable");
  assert.equal(missingProvenance.envelope.reason, "installation_provenance_missing");
  writeFileSync(repositoryMarketplacePath, `${JSON.stringify({
    name: "agdf-repo",
    plugins: [{ name: "agdf", source: { source: "local", path: "./plugins/agdf" } }],
  })}\n`);

  const rootMismatch = resolveLocalValidator({ runtimeRoot, expectedPluginRoot: join(root, "wrong-root"), expectedVersion: "1.2.3", surface: "claude" });
  assert.equal(rootMismatch.envelope.reason, "plugin_root_mismatch");

  writeFileSync(claudeManifestPath, '{"version":"9.9.9"}\n');
  const claudeManifestMismatch = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "claude" });
  assert.equal(claudeManifestMismatch.envelope.reason, "manifest_invalid");
  writeFileSync(claudeManifestPath, '{"version":"1.2.3"}\n');

  const definitionPath = join(pluginRoot, "meta", "agdf-plugin.definition.json");
  const validDefinition = readFileSync(definitionPath, "utf8");
  writeFileSync(definitionPath, `${JSON.stringify({ version: "1.2.3", distributionProfiles: { ...profileContract, schemaVersion: 2 } })}\n`);
  const invalidProfile = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(invalidProfile.envelope.reason, "profile_invalid");
  writeFileSync(definitionPath, validDefinition);

  const runtimeManifest = JSON.parse(readFileSync(join(runtimeRoot, "runtime-manifest.json"), "utf8"));
  const provenancePath = join(pluginRoot, ".agdf-installation.json");
  const validProvenance = {
    schema_version: 1,
    owner: "create-agdf",
    profile_id: "runtime-plugin",
    marketplace_id: "agdf",
    canonical_version: "1.2.3",
    codex_install_version: "1.2.3",
    source_digest: digestNormalizedPluginSource(pluginRoot, "1.2.3"),
    runtime_digest: runtimeManifest.digest,
  };
  writeFileSync(provenancePath, `${JSON.stringify(validProvenance)}\n`);
  const installedMatch = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(installedMatch.envelope.machine_validation, "owned_version_matched");
  assert.equal(installedMatch.envelope.evidence_plane, "installed_plugin_root");
  const loadedMatch = resolveLocalValidator({ runtimeRoot, pluginRoot, expectedPluginRoot: pluginRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(loadedMatch.envelope.evidence_plane, "loaded_session");
  assert.equal(installedMatch.envelope.provenance_status, "matched");

  writeFileSync(provenancePath, `${JSON.stringify({ ...validProvenance, owner: "foreign" })}\n`);
  const invalidProvenance = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(invalidProvenance.envelope.reason, "installation_provenance_invalid");
  writeFileSync(provenancePath, `${JSON.stringify({ ...validProvenance, source_digest: "f".repeat(64) })}\n`);
  const sourceDigestMismatch = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(sourceDigestMismatch.envelope.reason, "source_digest_mismatch");
  rmSync(provenancePath);

  const missingPackageRoot = `${packageRoot}.missing`;
  renameSync(packageRoot, missingPackageRoot);
  const runtimeMissing = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(runtimeMissing.envelope.reason, "runtime_missing");
  renameSync(missingPackageRoot, packageRoot);

  const mismatch = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.4", surface: "claude" });
  assert.equal(mismatch.envelope.machine_validation, "version_mismatch");
  assert.equal(mismatch.executable, undefined);

  writeFileSync(join(packageRoot, "bin", "create-agdf.js"), "tampered\n");
  const corrupt = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex" });
  assert.equal(corrupt.envelope.machine_validation, "version_mismatch");
  assert.equal(corrupt.envelope.reason, "runtime_digest_mismatch");

  const missing = resolveLocalValidator({ runtimeRoot: join(root, "missing"), expectedVersion: "1.2.3", surface: "generic" });
  assert.equal(missing.envelope.machine_validation, "unavailable");
  const external = resolveLocalValidator({ runtimeRoot: join(root, "missing"), expectedVersion: "1.2.3", surface: "copilot", externalRequired: true });
  assert.equal(external.envelope.machine_validation, "external_required");
  const missingOwnedPackage = resolveLocalValidator({ ownedPackageRoot: join(root, "missing-package"), expectedVersion: "1.2.3", surface: "opencode" });
  assert.equal(missingOwnedPackage.envelope.machine_validation, "unavailable");
  assert.equal(missingOwnedPackage.envelope.reason, "package_missing");

  const configured = join(root, "agdf-test");
  writeFileSync(configured, `#!/usr/bin/env node\nif (process.argv.includes("--version")) console.log(JSON.stringify({version:"1.2.3"}));\n`);
  chmodSync(configured, 0o755);
  const configuredMatch = resolveLocalValidator({ runtimeRoot: join(root, "missing"), expectedVersion: "1.2.3", surface: "generic", configuredPath: configured });
  assert.equal(configuredMatch.envelope.machine_validation, "configured_version_matched");

  const invalidManifestRoot = join(root, "invalid-manifest");
  mkdirSync(invalidManifestRoot, { recursive: true });
  writeFileSync(join(invalidManifestRoot, "runtime-manifest.json"), "{\n");
  const invalidManifest = resolveLocalValidator({ runtimeRoot: invalidManifestRoot, expectedVersion: "1.2.3", surface: "codex", configuredPath: configured });
  assert.equal(invalidManifest.envelope.machine_validation, "version_mismatch");
  assert.equal(invalidManifest.envelope.reason, "manifest_invalid");

  writeFileSync(join(runtimeRoot, "runtime-manifest.json"), `${JSON.stringify({
    version: "1.2.3",
    entrypoint: "../../agdf-test",
    digest: digestDirectory(packageRoot),
  })}\n`);
  const escapedEntrypoint = resolveLocalValidator({ runtimeRoot, expectedVersion: "1.2.3", surface: "codex", configuredPath: configured });
  assert.equal(escapedEntrypoint.envelope.machine_validation, "version_mismatch");
  assert.equal(escapedEntrypoint.envelope.reason, "invalid_entrypoint");

  const relative = resolveLocalValidator({ runtimeRoot: join(root, "missing"), expectedVersion: "1.2.3", surface: "generic", configuredPath: "./agdf" });
  assert.equal(relative.envelope.machine_validation, "unavailable");
  assert.equal(relative.envelope.reason, "invalid_absolute_path");

  const ownedPackageRoot = join(root, "owned", "create-agdf");
  mkdirSync(join(ownedPackageRoot, "bin"), { recursive: true });
  writeFileSync(join(ownedPackageRoot, "package.json"), '{"name":"create-agdf","version":"1.2.3","type":"module"}\n');
  writeFileSync(join(ownedPackageRoot, "bin", "create-agdf.js"), '#!/usr/bin/env node\nconst args = process.argv.slice(2);\nconst safe = ["doctor", "gate-check", "delivery-map"].includes(args[0]) && (!args[1] || args[1] === "$(false); value with spaces");\nprocess.exitCode = safe ? 0 : 3;\n');
  for (const command of ["doctor", "gate-check", "delivery-map"]) {
    assert.equal(runLocalValidator({ ownedPackageRoot, expectedVersion: "1.2.3", surface: "opencode" }, [command]), 0);
  }
  assert.equal(runLocalValidator({ ownedPackageRoot, expectedVersion: "1.2.3", surface: "opencode" }, ["doctor", "$(false); value with spaces"]), 0);

  const generatedRuntime = join(root, "generated-runtime");
  syncPluginRuntime({ outputRoot: generatedRuntime });
  const firstManifest = readFileSync(join(generatedRuntime, "runtime-manifest.json"), "utf8");
  const firstTreeDigest = digestDirectory(generatedRuntime);
  syncPluginRuntime({ outputRoot: generatedRuntime });
  assert.equal(readFileSync(join(generatedRuntime, "runtime-manifest.json"), "utf8"), firstManifest);
  assert.equal(digestDirectory(generatedRuntime), firstTreeDigest, "runtime generation must be byte-reproducible");

  console.log("Local validator tests passed");
} finally {
  rmSync(root, { recursive: true, force: true });
}
