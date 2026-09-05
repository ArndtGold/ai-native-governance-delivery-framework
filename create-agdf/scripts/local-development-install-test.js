import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import {
  captureLocalPluginSnapshot,
  codexLocalInstallVersion,
  digestPluginSource,
  isCodexLocalInstallVersion,
  prepareCopilotMarketplace,
  prepareLocalMarketplace,
} from "../lib/installers/local-marketplace.js";
import {
  prepareLocalOpenCodePackage,
  localNpmExecutable,
  validateLocalOpenCodePackageSource,
} from "../lib/installers/local-development.js";
import { COPILOT_CLI_NPM_PACKAGE, copilotNpmInvocation, inspectPluginSurface, installClaudeGlobalPlugin, installCodexGlobalPlugin, installCopilotGlobalPlugin as installCopilot, setCopilotPluginEnabled } from "../lib/installers/plugin-installers.js";
import { resolveOpenCodeInstallPackageSource } from "../lib/installers/opencode.js";
import { diagnoseCopilotSkillPrecedence } from "../lib/installers/copilot-precedence.js";
import { configureCopilotDeclarativePlugin, readCopilotSettings, revokeCopilotDeclarativePlugin } from "../lib/installers/copilot-settings.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";
import { installLocalPlugin } from "./install-local-plugin.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(packageRoot);
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const builtCopilotPluginRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-local-development-install-"));

const copilotTestDataRoot = join(fixtureRoot, "copilot-standard");
const copilotTestRoot = join(copilotTestDataRoot, "marketplaces", "agdf-copilot");
function discoveredCopilotSkills(root = builtCopilotPluginRoot) {
  return JSON.stringify(pluginDefinition.skillSet.map(({ slug }) => ({
    name: `agdf-${slug}`, source: "plugin", enabled: true,
    path: join(root, "copilot-skills", `agdf-${slug}`),
  })));
}
function installCopilotGlobalPlugin(options) {
  const settingsPath = join(mkdtempSync(join(fixtureRoot, "copilot-settings-")), "settings.json");
  const wrap = (exec) => exec && ((executable, args, config) => args.slice(-3).join(" ") === "skill list --json"
    ? discoveredCopilotSkills() : exec(executable, args, config));
  return { ...installCopilot({ ...options, dataRoot: options.dataRoot ?? copilotTestDataRoot,
    copilotSettingsPath: settingsPath, exec: wrap(options.exec), packagedCopilotExec: wrap(options.packagedCopilotExec) }), testSettingsPath: settingsPath };
}

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function packExec(content = "local package\n", calls = [], result = {}) {
  return (executable, args, options = {}) => {
    calls.push({ executable, args: [...args], options });
    const destinationIndex = args.indexOf("--pack-destination");
    if (destinationIndex < 0) return "";
    const destination = args[destinationIndex + 1];
    const filename = result.filename ?? `create-agdf-${pluginDefinition.version}.tgz`;
    writeFileSync(join(destination, filename), content);
    return `${JSON.stringify([{ filename, files: result.files ?? [{ path: "package.json", mode: 420 }] }])}\n`;
  };
}

try {
  const sourceDigest = digestPluginSource(builtPluginRoot, pluginDefinition.version);
  const localVersion = codexLocalInstallVersion(pluginDefinition.version, sourceDigest);
  assert.match(localVersion, /^\d+\.\d+\.\d+\+codex\.local-[a-f0-9]{12}$/);
  assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, localVersion, sourceDigest), true);
  assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, `${pluginDefinition.version}+codex.local-000000000000`, sourceDigest), false);
  assert.equal(codexLocalInstallVersion(pluginDefinition.version, sourceDigest), localVersion, "same content must keep one Codex install identity");
  assert.notEqual(codexLocalInstallVersion(pluginDefinition.version, "f".repeat(64)), localVersion, "changed content must receive a new Codex install identity");
  for (const invalidVersion of [
    `${pluginDefinition.version}+codex.local-short`,
    `${pluginDefinition.version}+codex.local-zzzzzzzzzzzz`,
    `9.9.9+codex.local-${sourceDigest.slice(0, 12)}`,
    `${pluginDefinition.version}+arbitrary-${sourceDigest.slice(0, 12)}`,
  ]) {
    assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, invalidVersion, sourceDigest), false);
  }

  const stableSnapshotRoot = join(fixtureRoot, "stable-source-snapshot");
  const stableSnapshot = captureLocalPluginSnapshot({
    builtPluginRoot,
    expectedVersion: pluginDefinition.version,
    adapters: {
      createRoot() {
        mkdirSync(stableSnapshotRoot, { recursive: false });
        return stableSnapshotRoot;
      },
    },
  });
  assert.equal(stableSnapshot.sourceDigest, sourceDigest);
  assert.equal(stableSnapshot.codexInstallVersion, localVersion);
  assert.equal(digestPluginSource(stableSnapshot.pluginRoot, pluginDefinition.version), sourceDigest);
  stableSnapshot.cleanup();
  assert.equal(existsSync(stableSnapshotRoot), false, "successful snapshot capture must clean only its owned root");

  const unstableSnapshotRoot = join(fixtureRoot, "unstable-source-snapshot");
  const digestSequence = [sourceDigest, sourceDigest, "f".repeat(64)];
  assert.throws(() => captureLocalPluginSnapshot({
    builtPluginRoot,
    expectedVersion: pluginDefinition.version,
    adapters: {
      createRoot() {
        mkdirSync(unstableSnapshotRoot, { recursive: false });
        return unstableSnapshotRoot;
      },
      digest() { return digestSequence.shift(); },
    },
  }), (error) => error?.code === "local_install_source_unstable");
  assert.equal(existsSync(unstableSnapshotRoot), false, "unstable snapshot capture must clean its owned root");

  assert.throws(() => prepareLocalMarketplace({
    dataRoot: join(fixtureRoot, "snapshot-identity-conflict-data"),
    builtPluginRoot,
    snapshotSource: true,
    codexInstallVersion: localVersion,
  }), /owns the Codex local install version/);

  const cleanupFailureDataRoot = join(fixtureRoot, "cleanup-failure-data");
  const cleanupFailureSnapshotRoot = join(fixtureRoot, "cleanup-failure-snapshot");
  let cleanupAttempts = 0;
  assert.throws(() => prepareLocalMarketplace({
    dataRoot: cleanupFailureDataRoot,
    builtPluginRoot,
    snapshotSource: true,
    snapshotAdapters: {
      createRoot() {
        mkdirSync(cleanupFailureSnapshotRoot, { recursive: false });
        return cleanupFailureSnapshotRoot;
      },
      remove(root) {
        cleanupAttempts += 1;
        if (cleanupAttempts === 1) throw new Error("injected snapshot cleanup failure");
        rmSync(root, { recursive: true, force: true });
      },
    },
  }), /injected snapshot cleanup failure/);
  assert.equal(cleanupAttempts, 2, "failed pre-swap cleanup must be retried by the snapshot owner");
  assert.equal(existsSync(cleanupFailureSnapshotRoot), false);
  assert.equal(existsSync(join(cleanupFailureDataRoot, "marketplaces", "agdf")), false, "cleanup failure must not swap the stable marketplace");
  assert.equal(existsSync(join(cleanupFailureDataRoot, "marketplaces", "agdf.stage")), false, "cleanup failure must remove the marketplace stage");

  const marketplaceDataRoot = join(fixtureRoot, "marketplace-data");
  const projected = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot,
    codexInstallVersion: localVersion,
  });
  assert.equal(projected.codexInstallVersion, localVersion);
  assert.equal(json(join(projected.pluginRoot, ".codex-plugin", "plugin.json")).version, localVersion);
  assert.equal(json(join(projected.pluginRoot, ".claude-plugin", "plugin.json")).version, pluginDefinition.version);
  assert.equal(json(join(projected.pluginRoot, ".agdf-installation.json")).source_digest, sourceDigest);
  assert.equal(json(join(projected.pluginRoot, ".agdf-installation.json")).profile_id, "runtime-plugin");
  assert.equal(json(join(projected.root, ".agdf-owned.json")).codex_install_version, localVersion);
  projected.commit();

  const sameProjection = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot,
    codexInstallVersion: localVersion,
  });
  assert.equal(sameProjection.changed, false, "same prepared content must keep one marketplace projection");
  sameProjection.commit();

  const installedIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], {
    encoding: "utf8",
  });
  assert.equal(installedIntegrity.status, 0, `${installedIntegrity.stdout}\n${installedIntegrity.stderr}`);
  assert.match(installedIntegrity.stdout, /mode=installed/);

  const localMarkerPath = join(projected.pluginRoot, ".agdf-installation.json");
  const localCodexManifestPath = join(projected.pluginRoot, ".codex-plugin", "plugin.json");
  const localMarker = readFileSync(localMarkerPath, "utf8");
  const localCodexManifest = readFileSync(localCodexManifestPath, "utf8");
  writeFileSync(localMarkerPath, "{}\n");
  const missingEvidenceIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], {
    encoding: "utf8",
  });
  assert.notEqual(missingEvidenceIntegrity.status, 0, "a Codex local version without its exact marker must fail integrity");
  writeFileSync(localMarkerPath, localMarker);

  const falseDigest = "f".repeat(64);
  writeFileSync(localMarkerPath, `${JSON.stringify({
    ...JSON.parse(localMarker),
    source_digest: falseDigest,
    codex_install_version: codexLocalInstallVersion(pluginDefinition.version, falseDigest),
  }, null, 2)}\n`);
  writeFileSync(localCodexManifestPath, `${JSON.stringify({
    ...JSON.parse(localCodexManifest),
    version: codexLocalInstallVersion(pluginDefinition.version, falseDigest),
  }, null, 2)}\n`);
  const falseDigestIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], { encoding: "utf8" });
  assert.notEqual(falseDigestIntegrity.status, 0, "a self-consistent but false source digest must fail integrity");
  writeFileSync(localMarkerPath, localMarker);
  writeFileSync(localCodexManifestPath, localCodexManifest);

  writeFileSync(localCodexManifestPath, `${JSON.stringify({
    ...JSON.parse(localCodexManifest),
    version: `${pluginDefinition.version}+arbitrary-local`,
  }, null, 2)}\n`);
  const arbitrarySuffixIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], { encoding: "utf8" });
  assert.notEqual(arbitrarySuffixIntegrity.status, 0, "an arbitrary local suffix must fail integrity");
  writeFileSync(localCodexManifestPath, localCodexManifest);

  const codexCalls = [];
  const installed = installCodexGlobalPlugin({
    prepare: (options) => prepareLocalMarketplace({
      ...options,
      dataRoot: marketplaceDataRoot,
      builtPluginRoot,
      codexInstallVersion: localVersion,
    }),
    exec(executable, args) {
      codexCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "local", source: projected.root } }] });
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${localVersion}\n`;
      return "";
    },
  });
  assert.equal(installed.expectedVersion, localVersion);
  assert.equal(installed.canonicalVersion, pluginDefinition.version);
  assert.equal(installed.installedVersion, localVersion);
  assert.equal(installed.evidence.some((item) => item.startsWith("staged_plugin_root:")), true);
  assert.equal(installed.evidence.includes("staged_installation_provenance:matched"), true);
  assert.equal(installed.evidence.some((item) => item.startsWith("installed_plugin_root:")), false, "installer must not claim the host-loaded root from staged evidence");
  assert.equal(codexCalls.includes("codex plugin add agdf@agdf --json"), true);
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${localVersion}\n`, { dataRoot: marketplaceDataRoot }).status, "healthy");
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${localVersion}\n`, { dataRoot: join(fixtureRoot, "missing-marketplace") }).status, "degraded");
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${pluginDefinition.version}+codex.local-ffffffffffff\n`, { dataRoot: marketplaceDataRoot }).status, "degraded");

  let claudeListCalls = 0;
  const claudeInstalled = installClaudeGlobalPlugin({
    prepare: (options) => prepareLocalMarketplace({
      ...options,
      dataRoot: marketplaceDataRoot,
      builtPluginRoot,
      codexInstallVersion: localVersion,
    }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify([{ name: "agdf", source: "directory", path: projected.root, installLocation: projected.root }]);
      }
      if (args.join(" ") === "plugin list") {
        claudeListCalls += 1;
        return `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "";
    },
  });
  assert.equal(claudeInstalled.installedVersion, pluginDefinition.version);
  assert.equal(claudeListCalls, 2);
  assert.equal(claudeInstalled.evidence.includes("staged_installation_provenance:matched"), true);
  assert.equal(json(join(projected.pluginRoot, ".codex-plugin", "plugin.json")).version, localVersion, "Claude must not replace the shared Codex projection");

  const legacyCopilotCalls = [];
  let legacyCopilotListCalls = 0;
  const migratedCopilot = installCopilotGlobalPlugin({
    dataRoot: marketplaceDataRoot,
    exec(executable, args) {
      legacyCopilotCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin list") {
        legacyCopilotListCalls += 1;
        return `agdf@agdf ${pluginDefinition.version}\n`;
      }
      if (args.join(" ") === "plugin marketplace list") return `  • agdf (Local: ${projected.root})\n`;
      return "accepted\n";
    },
  });
  const isolatedCopilotMarketplaceRoot = join(marketplaceDataRoot, "marketplaces", "agdf-copilot");
  assert.equal(legacyCopilotListCalls, 2);
  assert.equal(migratedCopilot.evidence.includes("shared_marketplace_registration_migrated"), true);
  assert.equal(legacyCopilotCalls.includes("copilot plugin uninstall agdf@agdf"), true);
  assert.equal(legacyCopilotCalls.includes("copilot plugin marketplace remove agdf"), true);
  assert.equal(json(migratedCopilot.testSettingsPath).extraKnownMarketplaces.agdf.source.url, pathToFileURL(isolatedCopilotMarketplaceRoot).href);
  assert.equal(legacyCopilotCalls.includes("copilot plugin install agdf@agdf"), true);
  assert.equal(json(join(projected.pluginRoot, ".agdf-installation.json")).profile_id, "runtime-plugin", "Copilot migration must retain shared staging");

  const refreshCopilotCalls = [];
  const refreshedCopilot = installCopilotGlobalPlugin({
    dataRoot: marketplaceDataRoot,
    exec(executable, args) {
      refreshCopilotCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin list") return `agdf@agdf ${pluginDefinition.version}\n`;
      if (args.join(" ") === "plugin marketplace list") return `  • agdf (Local: ${isolatedCopilotMarketplaceRoot})\n`;
      return "accepted\n";
    },
  });
  assert.equal(refreshedCopilot.operation, "update");
  assert.equal(refreshCopilotCalls.includes("copilot plugin uninstall agdf@agdf"), true, "same-version Copilot refresh must replace the installed cache");
  assert.equal(refreshCopilotCalls.includes("copilot plugin install agdf@agdf"), true);

  const recoveryDataRoot = join(fixtureRoot, "copilot-migration-recovery");
  const recoveryShared = prepareLocalMarketplace({ dataRoot: recoveryDataRoot, builtPluginRoot, codexInstallVersion: localVersion });
  recoveryShared.commit();
  const recoveryCalls = [];
  let recoveryInstallCalls = 0;
  assert.throws(() => installCopilotGlobalPlugin({
    dataRoot: recoveryDataRoot,
    exec(executable, args) {
      recoveryCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin list") return `agdf@agdf ${pluginDefinition.version}\n`;
      if (args.join(" ") === "plugin marketplace list") return `  • agdf (Local: ${recoveryShared.root})\n`;
      if (args.join(" ") === "plugin install agdf@agdf") {
        recoveryInstallCalls += 1;
        if (recoveryInstallCalls === 1) throw Object.assign(new Error("migration install failed"), { stderr: "migration install failed" });
      }
      return "accepted\n";
    },
  }), /migration install failed/);
  assert.equal(recoveryCalls.includes(`copilot plugin marketplace add ${recoveryShared.root}`), true, "failed migration must restore the shared registration");
  assert.equal(recoveryInstallCalls, 2, "failed migration must reinstall the prior marketplace plugin");
  assert.equal(existsSync(join(recoveryDataRoot, "marketplaces", "agdf-copilot")), false, "failed migration must roll back isolated staging");

  const copilotCalls = [];
  let copilotListCalls = 0;
  const copilotInstalled = installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec(executable, args) {
      copilotCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin list") {
        copilotListCalls += 1;
        return copilotListCalls === 1 ? `agdf ${pluginDefinition.version}\n` : `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "";
    },
  });
  assert.equal(copilotInstalled.installedVersion, pluginDefinition.version);
  assert.equal(json(copilotInstalled.testSettingsPath).extraKnownMarketplaces.agdf.source.url, pathToFileURL(copilotTestRoot).href);
  assert.equal(copilotCalls.includes("copilot plugin uninstall agdf"), true);
  assert.equal(copilotCalls.includes("copilot plugin install agdf@agdf"), true);
  assert.equal(inspectPluginSurface("copilot", () => `  • agdf (v${pluginDefinition.version})\n`).status, "healthy");
  assert.equal(inspectPluginSurface("copilot", () => `agdf ${pluginDefinition.version}\n`).status, "healthy");
  const packagedCalls = [];
  let packagedListCalls = 0;
  const copilotPackaged = installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec() {
      const error = new Error("spawn copilot ENOENT");
      error.code = "ENOENT";
      throw error;
    },
    packagedCopilotExec(executable, args) {
      packagedCalls.push({ executable, args });
      if (args.at(-2) === "plugin" && args.at(-1) === "list") {
        packagedListCalls += 1;
        return packagedListCalls === 1 ? "" : `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "installed\n";
    },
  });
  assert.equal(copilotPackaged.verificationStatus, "healthy");
  assert.equal(copilotPackaged.evidence.includes(`copilot_cli_npm_package:${COPILOT_CLI_NPM_PACKAGE}`), true);
  assert.equal(packagedCalls.some(({ args }) => args.includes(`--package=${COPILOT_CLI_NPM_PACKAGE}`) && args.at(-2) === "plugin" && args.at(-1) === "list"), true);
  let launcherFallbackListCalls = 0;
  const copilotLauncherFallback = installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec() {
      const error = new Error("Copilot launcher could not resolve its binary");
      error.stderr = "Cannot find GitHub Copilot CLI (https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)";
      throw error;
    },
    packagedCopilotExec(_executable, args) {
      if (args.slice(-3).join(" ") === "skill list --json") return discoveredCopilotSkills();
      if (args.at(-2) === "plugin" && args.at(-1) === "list") {
        launcherFallbackListCalls += 1;
        return launcherFallbackListCalls === 1 ? "" : `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "installed\n";
    },
  });
  assert.equal(copilotLauncherFallback.verificationStatus, "healthy");
  assert.equal(copilotLauncherFallback.evidence.includes("copilot_cli_launcher_unavailable"), true);
  assert.equal(copilotLauncherFallback.evidence.includes(`copilot_cli_npm_package:${COPILOT_CLI_NPM_PACKAGE}`), true);
  assert.deepEqual(copilotNpmInvocation({ env: { npm_execpath: "/npm/cli.js" }, platform: "linux", execPath: "/node" }), {
    executable: "/node",
    args: ["/npm/cli.js", "exec", "--yes", `--package=${COPILOT_CLI_NPM_PACKAGE}`, "--", "copilot"],
  });
  const copilotManual = installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec() {
      const error = new Error("spawn copilot ENOENT");
      error.code = "ENOENT";
      throw error;
    },
    packagedCopilotExec() {
      throw new Error("npm registry unavailable");
    },
  });
  assert.equal(copilotManual.manualHandoff, true);
  assert.equal(copilotManual.installedVersion, null);
  assert.throws(() => installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec(_executable, args) {
      if (args.join(" ") === "plugin list") return "";
      if (args.join(" ") === "plugin marketplace list") return "  • agdf (Local: /foreign/agdf)\n";
      return "";
    },
  }), /Refusing to replace non-AGDF Copilot marketplace/);
  assert.throws(() => installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec(executable, args) {
      if (args.join(" ") === "plugin list") return "agdf@agdf 9.9.9\n";
      if (args.join(" ") === "plugin marketplace list") return `Registered marketplaces:\n  • agdf (Local: ${copilotTestRoot} )\n`.replace(" )", ")");
      return "";
    },
  }), /version mismatch/);
  let malformedListCalls = 0;
  assert.throws(() => installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec(executable, args) {
      if (args.join(" ") === "plugin list") {
        malformedListCalls += 1;
        return malformedListCalls === 1 ? "" : "unparseable host output\n";
      }
      return "";
    },
  }), /not present/);
  assert.throws(() => installCopilotGlobalPlugin({
    pluginRoot: builtCopilotPluginRoot,
    exec(executable, args) {
      if (args.join(" ") === "plugin list") return "";
      if (args.join(" ") === "plugin marketplace list") return `  • agdf (Local: ${copilotTestRoot} )\n`.replace(" )", ")");
      if (args.join(" ") === "plugin marketplace remove agdf") return "";
      const error = new Error("install rejected");
      error.stderr = "install rejected";
      throw error;
    },
  }), (error) => error.phase === "plugin_operation" && /install rejected/.test(error.message));
  for (const enabled of [true, false]) {
    const stateCalls = [];
    const state = setCopilotPluginEnabled({
      enabled,
      exec(executable, args) {
        stateCalls.push(`${executable} ${args.join(" ")}`);
        return args.join(" ") === "plugin list" ? `agdf ${pluginDefinition.version}\n` : "accepted\n";
      },
    });
    assert.equal(state.requestedState, enabled ? "enabled" : "disabled");
    assert.equal(state.status, "command_accepted_host_state_unverified");
    assert.equal(stateCalls[0], `copilot plugin ${enabled ? "enable" : "disable"} agdf`);
  }
  const managedState = setCopilotPluginEnabled({
    enabled: false,
    exec() {
      const error = new Error("Plugin is Managed by organization policy");
      error.stderr = "Plugin is Managed by organization policy";
      throw error;
    },
  });
  assert.equal(managedState.status, "managed");
  assert.throws(() => setCopilotPluginEnabled({ enabled: "yes" }), /must be boolean/);
  assert.deepEqual(diagnoseCopilotSkillPrecedence({
    declaredPluginSkills: ["agdf-gate-check", "agdf-qa-gate"],
    projectSkills: ["agdf-gate-check"],
    personalSkills: ["agdf-gate-check", "agdf-qa-gate"],
  }).skills, [
    { name: "agdf-gate-check", effective_source: "project", plugin_loaded: false, collisions: ["project", "personal"], mutation: "none" },
    { name: "agdf-qa-gate", effective_source: "personal", plugin_loaded: false, collisions: ["personal"], mutation: "none" },
  ]);
  assert.equal(diagnoseCopilotSkillPrecedence({ declaredPluginSkills: ["agdf-gate-check"] }).skills[0].effective_source, "plugin");
  assert.throws(() => diagnoseCopilotSkillPrecedence({ declaredPluginSkills: ["agdf-gate-check", "agdf-gate-check"] }), /DUPLICATE/);
  const copilotSettingsPath = join(fixtureRoot, "copilot-home", "settings.json");
  mkdirSync(dirname(copilotSettingsPath), { recursive: true });
  writeFileSync(copilotSettingsPath, `${JSON.stringify({ model: "auto", enabledPlugins: { existing: true } }, null, 2)}\n`);
  const declarative = configureCopilotDeclarativePlugin({ path: copilotSettingsPath, pluginRoot: builtCopilotPluginRoot });
  assert.equal(declarative.status, "configured_pending_restart");
  assert.equal(readCopilotSettings(copilotSettingsPath).settings.model, "auto");
  assert.equal(readCopilotSettings(copilotSettingsPath).settings.enabledPlugins.existing, true);
  assert.equal(readCopilotSettings(copilotSettingsPath).settings.enabledPlugins[builtCopilotPluginRoot], true);
  assert.equal(revokeCopilotDeclarativePlugin({ path: copilotSettingsPath, pluginRoot: builtCopilotPluginRoot }).status, "removed");
  assert.equal(readCopilotSettings(copilotSettingsPath).settings.enabledPlugins.existing, true);

  const codexLifecycleOutput = [];
  assert.equal(await runCli(["codex", "--json"], {
    io: { log(value) { codexLifecycleOutput.push(value); }, error(value) { codexLifecycleOutput.push(value); } },
    prepare: (options) => prepareLocalMarketplace({ ...options, dataRoot: marketplaceDataRoot, builtPluginRoot, codexInstallVersion: localVersion }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "local", source: projected.root } }] });
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${localVersion}\n`;
      return "";
    },
  }), 0);
  const codexLifecycle = JSON.parse(codexLifecycleOutput.at(-1));
  assert.equal(codexLifecycle.version.expected, localVersion);
  assert.equal(codexLifecycle.restart.required, true);
  assert.match(codexLifecycle.verification.evidence.join("\n"), new RegExp(`canonical_version:${pluginDefinition.version}`));

  const claudeLifecycleOutput = [];
  assert.equal(await runCli(["claude", "--json"], {
    io: { log(value) { claudeLifecycleOutput.push(value); }, error(value) { claudeLifecycleOutput.push(value); } },
    prepare: (options) => prepareLocalMarketplace({ ...options, dataRoot: marketplaceDataRoot, builtPluginRoot, codexInstallVersion: localVersion }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify([{ name: "agdf", source: "directory", path: projected.root, installLocation: projected.root }]);
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${pluginDefinition.version}\n`;
      return "";
    },
  }), 0);
  const claudeLifecycle = JSON.parse(claudeLifecycleOutput.at(-1));
  assert.equal(claudeLifecycle.version.expected, pluginDefinition.version);
  assert.equal(claudeLifecycle.restart.required, true);

  const copilotLifecycleOutput = [];
  let lifecyclePackagedListCalls = 0;
  assert.equal(await runCli(["copilot", "--json"], {
    copilotSettingsPath: join(fixtureRoot, "copilot-lifecycle-settings.json"),
    io: { log(value) { copilotLifecycleOutput.push(value); }, error(value) { copilotLifecycleOutput.push(value); } },
    prepare: (options) => prepareCopilotMarketplace({ ...options, dataRoot: join(fixtureRoot, "copilot-manual-handoff"), builtPluginRoot: builtCopilotPluginRoot }),
    exec() {
      const error = new Error("spawn copilot ENOENT");
      error.code = "ENOENT";
      throw error;
    },
    packagedCopilotExec(_executable, args) {
      if (args.slice(-3).join(" ") === "skill list --json") return discoveredCopilotSkills();
      if (args.at(-2) === "plugin" && args.at(-1) === "list") {
        lifecyclePackagedListCalls += 1;
        return lifecyclePackagedListCalls === 1 ? "" : `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "installed\n";
    },
  }), 0);
  const copilotLifecycle = JSON.parse(copilotLifecycleOutput.at(-1));
  assert.equal(copilotLifecycle.result, "success");
  assert.equal(copilotLifecycle.installation.status, "healthy");
  assert.equal(copilotLifecycle.version.installed, pluginDefinition.version);
  assert.match(copilotLifecycle.verification.evidence.join("\n"), /copilot_cli_npm_package/);

  const modifiedPluginRoot = join(fixtureRoot, "modified-plugin");
  cpSync(builtPluginRoot, modifiedPluginRoot, { recursive: true });
  writeFileSync(join(modifiedPluginRoot, "LICENSE"), `${readFileSync(join(modifiedPluginRoot, "LICENSE"), "utf8")}\nlocal fixture\n`);
  const modifiedSourceDigest = digestPluginSource(modifiedPluginRoot, pluginDefinition.version);
  const changedProjection = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot: modifiedPluginRoot,
    codexInstallVersion: codexLocalInstallVersion(pluginDefinition.version, modifiedSourceDigest),
  });
  assert.equal(changedProjection.changed, true);
  assert.equal(json(join(changedProjection.pluginRoot, ".claude-plugin", "plugin.json")).version, pluginDefinition.version);
  changedProjection.rollback();

  const packageCalls = [];
  const localPackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("same package\n", packageCalls),
  });
  assert.equal(localPackage.kind, "local_checkout");
  assert.equal(localPackage.version, pluginDefinition.version);
  assert.match(localPackage.digest, /^[a-f0-9]{64}$/);
  assert.match(localPackage.archiveDigest, /^[a-f0-9]{64}$/);
  assert.equal(validateLocalOpenCodePackageSource(localPackage).specifier, localPackage.specifier);
  assert.throws(() => validateLocalOpenCodePackageSource({ ...localPackage, root: dirname(localPackage.root) }), /outside its owned data root/);
  assert.equal(resolveOpenCodeInstallPackageSource(localPackage).specifier, localPackage.specifier);
  assert.equal(resolveOpenCodeInstallPackageSource().specifier, `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`);

  const samePackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("same package\n"),
  });
  assert.equal(samePackage.root, localPackage.root, "same packed content must reuse one durable path");

  const changingPackageRoot = join(fixtureRoot, "changing-package");
  mkdirSync(changingPackageRoot);
  writeFileSync(join(changingPackageRoot, "package.json"), "{\"name\":\"fixture-a\"}\n");
  const changingDataRoot = join(fixtureRoot, "changing-package-data");
  const firstContentPackage = prepareLocalOpenCodePackage({
    dataRoot: changingDataRoot,
    packageRoot: changingPackageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("archive a\n"),
  });
  writeFileSync(join(changingPackageRoot, "package.json"), "{\"name\":\"fixture-b\"}\n");
  const secondContentPackage = prepareLocalOpenCodePackage({
    dataRoot: changingDataRoot,
    packageRoot: changingPackageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("archive b\n"),
  });
  assert.notEqual(firstContentPackage.root, secondContentPackage.root, "changed packed content must receive a new durable path");

  assert.throws(() => prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "unsafe-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("unsafe\n", [], { filename: "../unsafe.tgz" }),
  }), /unsafe tarball name/);
  assert.throws(() => prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "failed-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec() { throw new Error("pack failed"); },
  }), /pack failed/);

  const realPackedPackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "real-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
  });
  assert.equal(validateLocalOpenCodePackageSource(realPackedPackage).digest, realPackedPackage.digest);

  const packageMarkerPath = localPackage.markerPath;
  const packageMarker = readFileSync(packageMarkerPath, "utf8");
  writeFileSync(packageMarkerPath, "{}\n");
  assert.throws(() => validateLocalOpenCodePackageSource(localPackage), /unowned/);
  writeFileSync(packageMarkerPath, packageMarker);

  writeFileSync(localPackage.tarball, "tampered\n");
  assert.throws(() => validateLocalOpenCodePackageSource(localPackage), /missing or tampered/);

  assert.deepEqual(localNpmExecutable("linux", "/usr/bin/node"), { executable: "npm", prefix: [] });
  assert.deepEqual(localNpmExecutable("win32", "C:\\Node\\node.exe"), {
    executable: "C:\\Node\\node.exe",
    prefix: ["C:\\Node\\node_modules\\npm\\bin\\npm-cli.js"],
  });

  let cliCalls = 0;
  const orchestrationCalls = [];
  let preparationOptions;
  const orchestrationCode = await installLocalPlugin("codex", {
    dataRoot: join(fixtureRoot, "orchestration-data"),
    exec(executable, args, options) {
      orchestrationCalls.push(`${executable} ${args.join(" ")}`);
      preparationOptions = options;
      return "";
    },
    async runCli(args, adapters) {
      cliCalls += 1;
      assert.deepEqual(args, ["codex"]);
      const transaction = adapters.prepare();
      assert.equal(transaction.codexInstallVersion, localVersion);
      transaction.rollback();
      return 0;
    },
  });
  assert.equal(orchestrationCode, 0);
  assert.equal(cliCalls, 1);
  assert.match(orchestrationCalls[0], /run release:prepare$/);
  assert.equal(preparationOptions.stdio, "pipe", "successful local release preparation must stay out of the consent UI");

  const claudeCode = await installLocalPlugin("claude", {
    dataRoot: join(fixtureRoot, "claude-orchestration-data"),
    exec() { return ""; },
    async runCli(args, adapters) {
      assert.deepEqual(args, ["claude"]);
      const transaction = adapters.prepare();
      assert.equal(transaction.codexInstallVersion, localVersion, "Claude must preserve the shared Codex projection");
      transaction.rollback();
      return 4;
    },
  });
  assert.equal(claudeCode, 4, "the lifecycle exit code must be preserved");

  const copilotCode = await installLocalPlugin("copilot", {
    dataRoot: join(fixtureRoot, "copilot-orchestration-data"),
    exec() { return ""; },
    async runCli(args, adapters) {
      assert.deepEqual(args, ["copilot"]);
      const transaction = adapters.prepare();
      assert.equal(transaction.codexInstallVersion, pluginDefinition.version, "Copilot must retain the canonical version");
      transaction.rollback();
      return 3;
    },
  });
  assert.equal(copilotCode, 3, "the Copilot plugin lifecycle exit code must be preserved");

  const unstableOrchestrationSnapshotRoot = join(fixtureRoot, "unstable-orchestration-snapshot");
  const unstableOrchestrationDigests = [sourceDigest, sourceDigest, "e".repeat(64)];
  let hostCallsAfterUnstableSource = 0;
  await assert.rejects(() => installLocalPlugin("codex", {
    dataRoot: join(fixtureRoot, "unstable-orchestration-data"),
    exec() { return ""; },
    snapshotAdapters: {
      createRoot() {
        mkdirSync(unstableOrchestrationSnapshotRoot, { recursive: false });
        return unstableOrchestrationSnapshotRoot;
      },
      digest() { return unstableOrchestrationDigests.shift(); },
    },
    async runCli(_args, adapters) {
      adapters.prepare();
      hostCallsAfterUnstableSource += 1;
      return 0;
    },
  }), (error) => error?.code === "local_install_source_unstable");
  assert.equal(hostCallsAfterUnstableSource, 0, "unstable source must fail before a host call");
  assert.equal(existsSync(unstableOrchestrationSnapshotRoot), false, "orchestration failure must clean its snapshot");

  const openCodeDataRoot = join(fixtureRoot, "opencode orchestration data");
  const openCodeCode = await installLocalPlugin("opencode", {
    dataRoot: openCodeDataRoot,
    exec(executable, args, options) {
      if (args.includes("pack")) return packExec("opencode package\n")(executable, args, options);
      return "";
    },
    async runCli(args, adapters) {
      assert.deepEqual(args, ["opencode"]);
      assert.equal(adapters.openCodePackageSource.dataRoot, openCodeDataRoot);
      assert.equal(isAbsolute(adapters.openCodePackageSource.specifier), true);
      assert.match(adapters.openCodePackageSource.specifier, /opencode orchestration data/);
      return 0;
    },
  });
  assert.equal(openCodeCode, 0);

  let forbiddenCliCalls = 0;
  await assert.rejects(() => installLocalPlugin("claude", {
    exec() { throw new Error("preparation failed"); },
    async runCli() { forbiddenCliCalls += 1; return 0; },
  }), /preparation failed/);
  assert.equal(forbiddenCliCalls, 0, "failed preparation must prevent host lifecycle calls");

  let invalidExecCalls = 0;
  await assert.rejects(() => installLocalPlugin("all", {
    exec() { invalidExecCalls += 1; },
  }), /Unsupported AGDF local install surface/);
  assert.equal(invalidExecCalls, 0, "invalid surfaces must fail before preparation");

  const freshCheckoutRoot = join(fixtureRoot, "fresh-checkout", "create-agdf");
  mkdirSync(join(freshCheckoutRoot, "scripts"), { recursive: true });
  cpSync(join(packageRoot, "package.json"), join(freshCheckoutRoot, "package.json"));
  cpSync(join(packageRoot, "scripts", "install-local-plugin.js"), join(freshCheckoutRoot, "scripts", "install-local-plugin.js"));
  cpSync(join(packageRoot, "lib"), join(freshCheckoutRoot, "lib"), { recursive: true });
  const loadProbe = (modulePath) => spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    `await import(${JSON.stringify(pathToFileURL(modulePath).href)});`,
  ], { encoding: "utf8" });
  const freshInstallerLoad = loadProbe(join(freshCheckoutRoot, "scripts", "install-local-plugin.js"));
  assert.equal(freshInstallerLoad.status, 0, `installer must load on a checkout without generated/: ${freshInstallerLoad.stderr}`);
  const freshRuntimeContextLoad = loadProbe(join(freshCheckoutRoot, "lib", "cli", "runtime-context.js"));
  assert.notEqual(freshRuntimeContextLoad.status, 0, "fixture must actually lack generated plugin metadata");

  const rootManifest = json(join(repoRoot, "package.json"));
  const packageManifest = json(join(packageRoot, "package.json"));
  for (const surface of ["codex", "claude", "copilot", "opencode"]) {
    assert.equal(rootManifest.scripts[`install:${surface}`], `npm --prefix create-agdf run install:${surface}`);
    assert.equal(packageManifest.scripts[`install:${surface}`], `node ./scripts/install-local-plugin.js ${surface}`);
  }
  assert.deepEqual(Object.keys(rootManifest.scripts).filter((name) => name.startsWith("install:")).sort(), ["install:claude", "install:codex", "install:copilot", "install:opencode"]);
  assert.deepEqual(Object.keys(packageManifest.scripts).filter((name) => name.startsWith("install:")).sort(), ["install:claude", "install:codex", "install:copilot", "install:opencode"]);
  const contributing = readFileSync(join(repoRoot, "CONTRIBUTING.md"), "utf8");
  for (const command of ["npm run install:codex", "npm run install:claude", "npm run install:copilot", "npm run install:opencode"]) {
    assert.match(contributing, new RegExp(command.replaceAll(":", "\\:")));
  }
  assert.match(contributing, /fresh task/i);
  assert.match(contributing, /Node\.js 18 or later/);
  assert.match(contributing, /restart the selected host/i);
  assert.match(contributing, /does not prove restarted-host loading, repository activation or\s+UAT/i);

  console.log("Local development install tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
