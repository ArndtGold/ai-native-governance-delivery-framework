import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { packageRoot, pluginDefinition } from "../lib/cli/runtime-context.js";
import { inspectClaudeHostInstallationDrift, packagedAppCopies, sameFileSystemEntry } from "#agdf-core/runtime/host-installation.js";
import { packagedAppCopiesHealthy, packagedAppCopyEvidence, reconcilePackagedAppMarketplaceCopies } from "../lib/installers/packaged-app-marketplace.js";
import { installClaudeGlobalPlugin } from "../lib/installers/plugin-installers.js";
import { syncPluginRuntime } from "../../../scripts/sync-plugin-runtime.js";

const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-packaged-app-copy-"));
const digest = (char) => char.repeat(64);

function writeJson(path, value) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ownedMarketplace(root, { sourceDigest, pluginDigest, owner = "create-agdf" }) {
  writeJson(join(root, ".agdf-owned.json"), {
    schema_version: 1,
    owner,
    marketplace_id: "agdf",
    profile_id: "runtime-plugin",
    version: pluginDefinition.version,
    source_digest: sourceDigest,
    plugin_digest: pluginDigest,
    staging_state: "ready",
  });
  writeJson(join(root, "plugins", "agdf", ".agdf-installation.json"), {
    schema_version: 1,
    owner: "create-agdf",
    source_digest: sourceDigest,
    runtime_digest: digest("e"),
  });
}

function installedPlugin(root, sourceDigest, runtimeDigest = digest("e")) {
  writeJson(join(root, ".agdf-installation.json"), {
    schema_version: 1,
    owner: "create-agdf",
    profile_id: "runtime-plugin",
    marketplace_id: "agdf",
    canonical_version: pluginDefinition.version,
    source_digest: sourceDigest,
    runtime_digest: runtimeDigest,
  });
}

function linkDirectory(target, path) {
  mkdirSync(join(path, ".."), { recursive: true });
  symlinkSync(target, path, process.platform === "win32" ? "junction" : "dir");
}

try {
  // Packaged-app store layout of %LOCALAPPDATA%: Packages/<family>/LocalCache/Local/<relative path>.
  const localAppData = join(fixtureRoot, "Local");
  const env = { LOCALAPPDATA: localAppData };
  const root = join(localAppData, "agdf", "marketplaces", "agdf");
  const packagedRoot = (name) => join(localAppData, "Packages", name, "LocalCache", "Local", "agdf", "marketplaces", "agdf");
  ownedMarketplace(root, { sourceDigest: digest("a"), pluginDigest: digest("b") });
  mkdirSync(join(localAppData, "Packages", "Unrelated_1"), { recursive: true });
  ownedMarketplace(packagedRoot("Claude_stale"), { sourceDigest: digest("c"), pluginDigest: digest("d") });
  ownedMarketplace(packagedRoot("Claude_current"), { sourceDigest: digest("a"), pluginDigest: digest("b") });
  mkdirSync(packagedRoot("Foreign_copy"), { recursive: true });
  linkDirectory(root, packagedRoot("Inside_view"));

  assert.deepEqual(packagedAppCopies(root, { env, platform: "linux" }), [], "only Windows packages virtualize %LOCALAPPDATA%");
  assert.deepEqual(packagedAppCopies(join(fixtureRoot, "elsewhere"), { env, platform: "win32" }), []);
  assert.deepEqual(packagedAppCopies(packagedRoot("Claude_stale"), { env, platform: "win32" }), [], "a package store path has no copy of its own");
  assert.deepEqual(packagedAppCopies(root, { env, platform: "win32" }).map((copy) => copy.package),
    ["Claude_current", "Claude_stale", "Foreign_copy", "Inside_view"]);
  assert.equal(sameFileSystemEntry(packagedRoot("Inside_view"), root), true, "a process inside the package sees its copy as the logical path");
  assert.equal(sameFileSystemEntry(packagedRoot("Claude_current"), root), false);

  const failingRename = reconcilePackagedAppMarketplaceCopies({
    root, sourceDigest: digest("a"), pluginDigest: digest("b"), env, platform: "win32",
    fs: { ...fs, renameSync() { throw Object.assign(new Error("busy"), { code: "EBUSY" }); } },
  });
  assert.deepEqual(failingRename.find((copy) => copy.package === "Claude_stale"), {
    package: "Claude_stale", path: packagedRoot("Claude_stale"), state: "stale", reason: "EBUSY",
  });
  assert.ok(existsSync(packagedRoot("Claude_stale")), "a failed retirement leaves the copy in place");
  assert.equal(packagedAppCopiesHealthy(failingRename), false);

  const copies = reconcilePackagedAppMarketplaceCopies({
    root, sourceDigest: digest("a"), pluginDigest: digest("b"), env, platform: "win32", now: () => 42,
  });
  assert.deepEqual(copies.map(({ package: name, state }) => [name, state]), [
    ["Claude_current", "current"],
    ["Claude_stale", "retired"],
    ["Foreign_copy", "foreign"],
    ["Inside_view", "install_view"],
  ]);
  assert.equal(existsSync(packagedRoot("Claude_stale")), false, "the stale copy no longer shadows the committed marketplace");
  assert.deepEqual(readdirSync(join(packagedRoot("Claude_stale"), "..")), [], "the retired copy is removed, not parked");
  assert.ok(existsSync(join(packagedRoot("Claude_current"), ".agdf-owned.json")), "a current copy is kept");
  assert.ok(existsSync(packagedRoot("Foreign_copy")), "a copy without AGDF ownership is never removed");
  assert.ok(existsSync(join(root, ".agdf-owned.json")), "the install's own view is never removed");
  assert.deepEqual(packagedAppCopyEvidence(copies), [
    "packaged_app_copy:Claude_current:current",
    "packaged_app_copy:Claude_stale:retired",
    "packaged_app_copy:Foreign_copy:foreign",
    "packaged_app_copy:Inside_view:install_view",
  ]);
  assert.equal(packagedAppCopiesHealthy(copies), false, "foreign copies and installs inside a package need attention");
  assert.equal(packagedAppCopiesHealthy(copies.filter((copy) => ["current", "retired"].includes(copy.state))), true);

  // The Claude installer reconciles packaged copies after the commit, also for an unchanged marketplace.
  for (const [label, reconciled, status] of [
    ["clean", [], "healthy"],
    ["stale", [{ package: "Claude_x", path: "p", state: "stale", reason: "EBUSY" }], "degraded"],
  ]) {
    const order = [];
    let reconcileInput = null;
    const installed = installClaudeGlobalPlugin({
      prepare: () => ({
        root, pluginRoot: join(root, "plugins", "agdf"), version: pluginDefinition.version,
        sourceDigest: digest("a"), digest: digest("b"), runtimeDigest: digest("e"),
        existingClassification: "current_or_marker_migration", changed: false,
        commit() { order.push("commit"); },
        rollback() { order.push("rollback"); },
      }),
      exec(executable, args) {
        const command = [executable, ...args].join(" ");
        if (command === "claude plugin marketplace list --json") return JSON.stringify([{ name: "agdf", source: "directory", path: root }]);
        if (command === "claude plugin list") return `agdf@agdf ${pluginDefinition.version}\n`;
        return "";
      },
      env: {},
      loadedSessions: () => [],
      migrateMcp: () => [],
      prepareMcp: () => [],
      reconcilePackagedCopies(input) {
        order.push("reconcile");
        reconcileInput = input;
        return reconciled;
      },
    });
    assert.deepEqual(order, ["commit", "reconcile"], `${label}: packaged copies are reconciled only after the commit`);
    assert.deepEqual({ ...reconcileInput, env: undefined }, { root, sourceDigest: digest("a"), pluginDigest: digest("b"), env: undefined });
    assert.equal(installed.verificationStatus, status, label);
    assert.deepEqual(installed.packagedAppCopies, reconciled);
    if (label === "stale") assert.ok(installed.evidence.includes("packaged_app_copy:Claude_x:stale:EBUSY"));
  }

  // Claude Code loads a directory-marketplace plugin in place; its cache copy records what was installed.
  const cacheRoot = join(fixtureRoot, "claude-cache", "agdf", "agdf", pluginDefinition.version);
  installedPlugin(cacheRoot, digest("a"));
  const claudeConfig = (name, marketplaceLocation, pluginSource, { installed = true } = {}) => {
    const configDir = join(fixtureRoot, name);
    writeJson(join(marketplaceLocation, ".claude-plugin", "marketplace.json"), { name: "agdf", plugins: [{ name: "agdf", source: pluginSource }] });
    writeJson(join(configDir, "plugins", "known_marketplaces.json"), {
      agdf: { source: { source: "directory", path: marketplaceLocation }, installLocation: marketplaceLocation },
    });
    if (installed) {
      writeJson(join(configDir, "plugins", "installed_plugins.json"), {
        version: 2,
        plugins: { "agdf@agdf": [{ scope: "user", installPath: cacheRoot, version: pluginDefinition.version }] },
      });
    }
    return { CLAUDE_CONFIG_DIR: configDir, LOCALAPPDATA: localAppData };
  };
  const marketplaceLocation = join(fixtureRoot, "marketplace");
  const loadedRoot = join(marketplaceLocation, "plugins", "agdf");
  installedPlugin(loadedRoot, digest("c"));
  const driftEnv = claudeConfig("claude-config", marketplaceLocation, "./plugins/agdf");
  const drift = inspectClaudeHostInstallationDrift({ pluginRoot: loadedRoot, env: driftEnv, platform: "win32" });
  assert.deepEqual(drift, {
    status: "drift",
    loaded_root: loadedRoot,
    loaded_source_digest: digest("c"),
    loaded_runtime_digest: digest("e"),
    installed_root: cacheRoot,
    installed_source_digest: digest("a"),
    installed_runtime_digest: digest("e"),
  });
  assert.equal(inspectClaudeHostInstallationDrift({ pluginRoot: cacheRoot, env: driftEnv }).status, "not_applicable",
    "only the registered in-place root is compared");
  const copiedRoot = join(fixtureRoot, "copy", "plugins", "agdf");
  installedPlugin(copiedRoot, digest("c"));
  assert.equal(inspectClaudeHostInstallationDrift({ pluginRoot: copiedRoot, env: driftEnv }).status, "not_applicable",
    "a staged copy or development checkout is never compared with the user's installation");
  assert.equal(inspectClaudeHostInstallationDrift({ pluginRoot: join(fixtureRoot, "generated"), env: driftEnv }).status, "not_applicable",
    "a generated bundle without installation provenance is not compared");
  assert.equal(inspectClaudeHostInstallationDrift({
    pluginRoot: loadedRoot,
    env: claudeConfig("claude-config-uninstalled", marketplaceLocation, "./plugins/agdf", { installed: false }),
  }).status, "unknown");
  installedPlugin(loadedRoot, digest("a"));
  assert.equal(inspectClaudeHostInstallationDrift({ pluginRoot: loadedRoot, env: driftEnv }).status, "matched");

  // The same version with a different runtime digest is drift too.
  installedPlugin(loadedRoot, digest("a"), digest("f"));
  assert.equal(inspectClaudeHostInstallationDrift({ pluginRoot: loadedRoot, env: driftEnv }).status, "drift");

  // Loaded from a packaged app's private copy: name the package, since only it sees that copy.
  const shadowStore = join(localAppData, "Packages", "Claude_shadow", "LocalCache", "Local", "agdf-shadow");
  installedPlugin(join(shadowStore, "plugins", "agdf"), digest("c"));
  linkDirectory(shadowStore, join(localAppData, "agdf-shadow"));
  const shadowEnv = claudeConfig("claude-config-shadow", join(localAppData, "agdf-shadow"), "./plugins/agdf");
  assert.equal(inspectClaudeHostInstallationDrift({
    pluginRoot: join(localAppData, "agdf-shadow", "plugins", "agdf"), env: shadowEnv, platform: "win32",
  }).packaged_app_copy, "Claude_shadow");

  // The generated Claude SessionStart check appends the drift after kernel, binding and facts.
  const projectedPluginRoot = join(fixtureRoot, "projection", "agdf");
  cpSync(join(packageRoot, "../..", "plugins", "agdf"), projectedPluginRoot, { recursive: true });
  syncPluginRuntime({ outputRoot: join(projectedPluginRoot, "runtime") });
  const projectionEnv = claudeConfig("claude-config-projection", join(fixtureRoot, "projection"), "./agdf");
  const sessionCheck = (env) => spawnSync(process.execPath, [join(projectedPluginRoot, "runtime", "agdf-session-check.js")], {
    cwd: fixtureRoot,
    encoding: "utf8",
    env: { ...process.env, AGDF_DATA_DIR: join(fixtureRoot, "data"), CLAUDE_PLUGIN_ROOT: projectedPluginRoot, AGDF_SURFACE: "claude", CLAUDE_CONFIG_DIR: projectionEnv.CLAUDE_CONFIG_DIR, ...env },
  });
  installedPlugin(projectedPluginRoot, digest("c"));
  const drifted = sessionCheck({});
  assert.equal(drifted.status, 0, drifted.stderr);
  const lines = drifted.stdout.trimEnd().split("\n");
  assert.match(lines.at(-1), /^AGDF installation drift: \{/);
  assert.ok(lines.findIndex((line) => line.startsWith("AGDF dispatcher binding: ")) < lines.length - 1, "the binding stays in place");
  const notice = JSON.parse(lines.at(-1).slice("AGDF installation drift: ".length));
  assert.equal(notice.status, "drift");
  assert.equal(notice.loaded_source_digest, digest("c"));
  assert.equal(notice.installed_source_digest, digest("a"));
  assert.match(notice.recovery, /^Tell the user before relying on AGDF/);

  installedPlugin(projectedPluginRoot, digest("a"));
  const matched = sessionCheck({});
  assert.equal(matched.status, 0, matched.stderr);
  assert.doesNotMatch(matched.stdout, /AGDF installation drift:/);
  installedPlugin(projectedPluginRoot, digest("c"));
  const codex = sessionCheck({ AGDF_SURFACE: "codex" });
  assert.equal(codex.status, 0, codex.stderr);
  assert.doesNotMatch(codex.stdout, /AGDF installation drift:/, "only Claude records its install in installed_plugins.json");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Claude packaged-app copy reconciliation and installation drift tests passed.");
