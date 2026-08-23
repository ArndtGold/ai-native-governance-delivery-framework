import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyMarketplaceList,
  defaultAgdfDataRoot,
  prepareLocalMarketplace,
} from "../lib/installers/local-marketplace.js";
import { installClaudeGlobalPlugin, installCodexGlobalPlugin } from "../lib/installers/plugin-installers.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(packageRoot);
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-local-marketplace-"));

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fakeTransaction(root = join(fixtureRoot, "fake-marketplace")) {
  const state = { committed: 0, rolledBack: 0 };
  return {
    state,
    prepare: () => ({
      root,
      changed: true,
      commit() { state.committed += 1; },
      rollback() { state.rolledBack += 1; },
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
  assert.equal(defaultAgdfDataRoot({ platform: "darwin", home: "/Users/test", env: {} }), "/Users/test/Library/Application Support/agdf");
  assert.equal(defaultAgdfDataRoot({ platform: "linux", home: "/home/test", env: {} }), "/home/test/.local/share/agdf");
  assert.equal(defaultAgdfDataRoot({ platform: "win32", home: "C:\\Users\\test", env: { LOCALAPPDATA: "C:\\Data" } }), "C:\\Data/agdf");

  const dataRoot = join(fixtureRoot, "data");
  const first = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(first.changed, true);
  assert.equal(json(join(first.root, ".agdf-owned.json")).version, pluginDefinition.version);
  assert.equal(json(join(first.root, ".agents", "plugins", "marketplace.json")).name, "agdf");
  assert.equal(json(join(first.root, ".claude-plugin", "marketplace.json")).plugins[0].source, "./plugins/agdf");
  assert.equal(json(join(first.root, "plugins", "agdf", "runtime", "runtime-manifest.json")).version, pluginDefinition.version);
  const localEntrypoint = join(first.root, "plugins", "agdf", "runtime", "agdf-local.js");
  const resolved = spawnSync(process.execPath, [localEntrypoint, "--resolve-only", "--json"], { encoding: "utf8" });
  assert.equal(resolved.status, 0, resolved.stderr);
  assert.equal(JSON.parse(resolved.stdout).registry_access, false);
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

  const current = prepareLocalMarketplace({ dataRoot, builtPluginRoot });
  assert.equal(current.changed, false, "matching marketplace stage must be idempotent");
  current.commit();

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

  writeFileSync(join(update.root, "plugins", "agdf", "LICENSE"), "tampered\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /tampered AGDF marketplace root/);
  rmSync(update.root, { recursive: true, force: true });
  mkdirSync(update.root, { recursive: true });
  writeFileSync(join(update.root, "foreign.txt"), "foreign\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot }), /ownership marker/);

  const corruptBuiltPlugin = join(fixtureRoot, "corrupt-built-plugin");
  cpSync(builtPluginRoot, corruptBuiltPlugin, { recursive: true });
  writeFileSync(join(corruptBuiltPlugin, "runtime", "create-agdf", "NOTICE"), "corrupt\n");
  assert.throws(() => prepareLocalMarketplace({ dataRoot: join(fixtureRoot, "corrupt-data"), builtPluginRoot: corruptBuiltPlugin }), /runtime digest does not match/);

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
    "codex plugin add agdf --marketplace agdf",
  ]);

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
  assert.equal(currentCalls.some((call) => call.includes("marketplace add") || call.includes("marketplace remove")), false);

  const rollbackTx = fakeTransaction(join(fixtureRoot, "rollback-marketplace"));
  const rollbackCalls = [];
  const pluginFailure = Object.assign(new Error("plugin failed"), { stderr: "plugin failed" });
  assert.throws(() => installCodexGlobalPlugin({
    prepare: rollbackTx.prepare,
    exec: scriptedExec({
      "codex plugin marketplace list --json": JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "git", source: "https://github.com/arndtgold/ai-native-governance-delivery-framework.git" } }] }),
      "codex plugin add agdf --marketplace agdf": pluginFailure,
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

  console.log("Local marketplace tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
