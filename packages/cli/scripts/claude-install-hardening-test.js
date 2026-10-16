import assert from "node:assert/strict";
import * as fs from "node:fs";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import process from "node:process";
import { generatedRoot, pluginDefinition } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";
import {
  compareInstallationProvenance,
  detectPackagedAppProcess,
  inspectClaudeHostInstallationDrift,
  packagedAppCopies,
  readClaudeInstallationRecord,
  writeClaudeInstallationRecord,
} from "#agdf-core/runtime/host-installation.js";
import { installClaudeGlobalPlugin, preflightClaudeInstall } from "../lib/installers/plugin-installers.js";
import { packagedAppRefusal, readClaudePluginState, verifyClaudeInstallation } from "../lib/host-adapters/claude/plugin.js";
import { localMarketplaceRoot, prepareLocalMarketplace } from "../lib/installers/local-marketplace.js";
import { runtimeCheckStatus } from "../lib/runtime-check-consent/service.js";
import { packagedAppCopyEvidence } from "../lib/installers/packaged-app-marketplace.js";
import { planClaudeGlobalUninstall } from "../lib/host-adapters/claude/uninstall.js";

const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-claude-install-hardening-"));
const digest = (char) => char.repeat(64);
const PLUGIN_ID = "agdf@agdf";
const version = pluginDefinition.version;
const passedPreflight = () => ["packaged_app_preflight:passed"];

function writeJson(path, value) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function provenance(root, sourceDigest, runtimeDigest = digest("e")) {
  writeJson(join(root, ".agdf-installation.json"), { schema_version: 1, owner: "create-agdf", source_digest: sourceDigest, runtime_digest: runtimeDigest });
}

// A packaged app redirects %LOCALAPPDATA% writes of its processes into Packages/<family>/LocalCache/Local.
function packagedFs(localAppData, family) {
  const redirect = (path) => {
    const location = relative(localAppData, resolve(path));
    return location.startsWith("Packages") ? path : join(localAppData, "Packages", family, "LocalCache", "Local", location);
  };
  return {
    writeFileSync: (path, ...rest) => {
      mkdirSync(join(redirect(path), ".."), { recursive: true });
      return writeFileSync(redirect(path), ...rest);
    },
    rmSync: (path, options) => rmSync(redirect(path), options),
    readdirSync,
    existsSync,
  };
}

function claudeTransaction(name, { sourceDigest = digest("a"), runtimeDigest = digest("e"), commitResult } = {}) {
  const root = join(fixtureRoot, name);
  const pluginRoot = join(root, "plugins", "agdf");
  provenance(pluginRoot, sourceDigest, runtimeDigest);
  const state = { committed: 0, rolledBack: 0, commitOptions: null };
  return {
    state,
    root,
    pluginRoot,
    prepare: () => ({
      root, pluginRoot, sourceDigest, runtimeDigest, digest: digest("b"), changed: true,
      commit(options) { state.committed += 1; state.commitOptions = options; return commitResult ?? { cleanup: "done" }; },
      rollback() { state.rolledBack += 1; },
    }),
  };
}

function hostExec(script, calls = []) {
  return (executable, args) => {
    const key = [executable, ...args].join(" ");
    calls.push(key);
    const value = script[key];
    if (value instanceof Error) throw value;
    if (typeof value === "function") return value();
    return value ?? "";
  };
}

const listJson = (entries) => JSON.stringify(entries.map(([id, entryVersion, installPath, enabled = true, scope = "user"]) =>
  ({ id, version: entryVersion, enabled, scope, ...(installPath ? { installPath } : {}) })));
const sequence = (...values) => { let index = 0; return () => values[Math.min(index++, values.length - 1)]; };

// `script` may depend on the transaction, e.g. to list the committed plugin root as Claude's copy.
function install(name, { script, configDir = join(fixtureRoot, `${name}-claude-home`), ...options } = {}) {
  const transaction = options.transaction ?? claudeTransaction(name);
  const calls = [];
  const commands = typeof script === "function" ? script(transaction) : script;
  const result = installClaudeGlobalPlugin({
    preflight: passedPreflight,
    prepare: transaction.prepare,
    exec: hostExec({ "claude plugin marketplace list --json": "[]", ...commands }, calls),
    env: { CLAUDE_CONFIG_DIR: configDir },
    loadedSessions: () => [],
    migrateMcp: () => [],
    prepareMcp: () => [],
    reconcilePackagedCopies: () => [],
    ...options,
  });
  return { result, calls, transaction, configDir };
}

try {
  const localAppData = join(fixtureRoot, "Local");
  mkdirSync(join(localAppData, "Packages", "Unrelated_1"), { recursive: true });
  mkdirSync(join(localAppData, "Packages", "Claude_test"), { recursive: true });

  // SCN-001: a process inside a package is refused before any change.
  const inside = detectPackagedAppProcess({ env: { LOCALAPPDATA: localAppData }, platform: "win32", fs: packagedFs(localAppData, "Claude_test") });
  assert.deepEqual(inside, { status: "inside_package", package: "Claude_test" });
  assert.equal(readdirSync(join(localAppData, "Packages", "Claude_test", "LocalCache", "Local")).length, 0, "the probe is removed again");
  let prepared = 0;
  const refusedCalls = [];
  assert.throws(() => installClaudeGlobalPlugin({
    preflight: (input) => preflightClaudeInstall({ ...input, detect: () => inside }),
    prepare: () => { prepared += 1; return claudeTransaction("refused").prepare(); },
    exec: hostExec({}, refusedCalls),
    env: { CLAUDE_CONFIG_DIR: join(fixtureRoot, "refused-home") },
    loadedSessions: () => [],
  }), (error) => {
    assert.equal(error.phase, "packaged_app");
    assert.equal(error.message, packagedAppRefusal("Claude_test"));
    assert.match(error.message, /inside the packaged app Claude_test.*Run the installation from a terminal outside Claude_test\./);
    return true;
  });
  assert.equal(prepared, 0, "no marketplace preparation after a refusal");
  assert.deepEqual(refusedCalls, [], "no host command after a refusal");
  assert.equal(existsSync(join(fixtureRoot, "refused-home")), false, "no Claude data after a refusal");

  // The CLI checks before setup, consent, control or marketplace work.
  const cliErrors = [];
  const cliCalls = [];
  const exitCode = await runCli(["claude", "--json"], {
    io: { log() {}, error: (message) => cliErrors.push(String(message)) },
    exec: hostExec({}, cliCalls),
    prepare: () => { prepared += 1; return claudeTransaction("cli-refused").prepare(); },
    preflightClaudeInstall: () => { throw Object.assign(new Error(packagedAppRefusal("Claude_test")), { phase: "packaged_app" }); },
  });
  assert.equal(exitCode, 1);
  assert.deepEqual(cliCalls, []);
  assert.equal(prepared, 0);
  assert.ok(cliErrors.some((message) => message.includes("AGDF install refused")));

  // SCN-019: the probe and the reconciliation name the same package from the same core module.
  const marketplaceInPackage = join(localAppData, "Packages", "Claude_test", "LocalCache", "Local", "agdf", "marketplaces", "agdf");
  mkdirSync(marketplaceInPackage, { recursive: true });
  const copies = packagedAppCopies(join(localAppData, "agdf", "marketplaces", "agdf"), { env: { LOCALAPPDATA: localAppData }, platform: "win32" });
  assert.deepEqual(copies.map((copy) => copy.package), [inside.package]);

  // SCN-003: outside a package the probe passes and leaves nothing behind; elsewhere it does not apply.
  const outside = detectPackagedAppProcess({ env: { LOCALAPPDATA: localAppData }, platform: "win32" });
  assert.deepEqual(outside, { status: "passed" });
  assert.equal(readdirSync(localAppData).some((name) => name.startsWith(".agdf-package-probe-")), false);
  assert.deepEqual(preflightClaudeInstall({ env: { LOCALAPPDATA: localAppData }, platform: "win32" }), ["packaged_app_preflight:passed"]);
  assert.deepEqual(preflightClaudeInstall({ env: {}, platform: "linux" }), ["packaged_app_preflight:not_applicable"]);
  const unwritable = detectPackagedAppProcess({ env: { LOCALAPPDATA: localAppData }, platform: "win32",
    fs: { ...fs, writeFileSync() { throw Object.assign(new Error("denied"), { code: "EACCES" }); } } });
  assert.deepEqual(unwritable, { status: "unavailable", reason: "EACCES" });

  // SCN-020, SCN-021, SCN-006, SCN-022: an unchanged install is verified, recorded and not reinstalled.
  // Claude's listed copy already carries the committed content, as after an earlier install.
  const current = (tx) => ({ "claude plugin list --json": listJson([[PLUGIN_ID, version, tx.pluginRoot]]) });
  const unchanged = install("unchanged", { script: current, recordInstallation: writeClaudeInstallationRecord });
  assert.equal(unchanged.result.verificationStatus, "healthy", JSON.stringify(unchanged.result.evidence));
  assert.equal(unchanged.calls.some((call) => / plugin (install|uninstall) /.test(`${call} `)), false);
  for (const entry of ["packaged_app_preflight:passed", "plugin_list:json", "plugin_operation:unchanged", "installation_record:written", "installation_verification:matched"]) {
    assert.ok(unchanged.result.evidence.includes(entry), entry);
  }
  assert.deepEqual(unchanged.transaction.state.commitOptions, { tolerateCleanupFailure: true });
  const record = readClaudeInstallationRecord({ env: { CLAUDE_CONFIG_DIR: unchanged.configDir } });
  assert.equal(record.plugin_root, unchanged.transaction.pluginRoot);
  assert.equal(record.marketplace_root, unchanged.transaction.root);
  assert.equal(record.source_digest, digest("a"));
  assert.equal(record.runtime_digest, digest("e"));

  // SCN-007: a missing plugin is installed, a version change goes through uninstall and install.
  const fresh = install("fresh", { script: (tx) => ({ "claude plugin list --json": sequence(listJson([]), listJson([[PLUGIN_ID, version, tx.pluginRoot]])) }) });
  assert.ok(fresh.calls.includes("claude plugin install agdf@agdf"));
  assert.equal(fresh.calls.includes("claude plugin uninstall agdf@agdf --keep-data"), false);
  assert.ok(fresh.result.evidence.includes("plugin_operation:installed"));
  assert.equal(fresh.result.verificationStatus, "healthy", JSON.stringify(fresh.result.evidence));
  const upgraded = install("upgraded", { script: (tx) => ({ "claude plugin list --json": sequence(listJson([[PLUGIN_ID, "0.0.1"]]), listJson([[PLUGIN_ID, version, tx.pluginRoot]])) }) });
  assert.ok(upgraded.calls.indexOf("claude plugin uninstall agdf@agdf --keep-data") < upgraded.calls.indexOf("claude plugin install agdf@agdf"));
  assert.ok(upgraded.result.evidence.includes("plugin_operation:reinstalled"));
  // A host that serves its cached copy only sees same-version changes after a reinstall (CR-001).
  const staleCache = join(fixtureRoot, "stale-cache", "agdf");
  provenance(staleCache, digest("9"));
  const copiedHost = install("copied-host", { script: (tx) => ({ "claude plugin list --json": sequence(listJson([[PLUGIN_ID, version, staleCache]]), listJson([[PLUGIN_ID, version, tx.pluginRoot]])) }) });
  assert.ok(copiedHost.calls.indexOf("claude plugin uninstall agdf@agdf --keep-data") < copiedHost.calls.indexOf("claude plugin install agdf@agdf"),
    "a stale cached copy is refreshed even at the same version");
  assert.ok(copiedHost.result.evidence.includes("plugin_operation:reinstalled"));
  assert.equal(copiedHost.result.verificationStatus, "healthy", JSON.stringify(copiedHost.result.evidence));
  // After a (re)install Claude Code copied the plugin into its cache, which must carry the same content.
  const copiedMismatch = install("copied-mismatch", { script: { "claude plugin list --json": sequence(listJson([]), listJson([[PLUGIN_ID, version, staleCache]])) } });
  assert.equal(copiedMismatch.result.verificationStatus, "degraded");
  assert.ok(copiedMismatch.result.evidence.includes("installation_verification:mismatch"));
  assert.ok(copiedMismatch.result.evidence.some((entry) => entry.startsWith(`installation_verification:cache:mismatch:expected=${digest("a")}/${digest("e")}:observed=${digest("9")}/${digest("e")}`)));

  // SCN-009, SCN-023: a mismatching record degrades; installer and session inspection agree.
  const mismatched = install("mismatched", {
    script: current,
    recordInstallation: (input) => writeClaudeInstallationRecord({ ...input, sourceDigest: digest("c") }),
  });
  assert.equal(mismatched.result.verificationStatus, "degraded");
  assert.ok(mismatched.result.evidence.some((entry) => entry.startsWith(`installation_verification:record:mismatch:expected=${digest("a")}`)));
  assert.ok(mismatched.result.evidence.some((entry) => entry.includes(`observed=${digest("c")}/${digest("e")}`)));
  const marketplaceLocation = mismatched.transaction.root;
  writeJson(join(marketplaceLocation, ".claude-plugin", "marketplace.json"), { name: "agdf", plugins: [{ name: "agdf", source: "./plugins/agdf" }] });
  writeJson(join(mismatched.configDir, "plugins", "known_marketplaces.json"), {
    agdf: { source: { source: "directory", path: marketplaceLocation }, installLocation: marketplaceLocation },
  });
  const sessionVerdict = inspectClaudeHostInstallationDrift({ pluginRoot: mismatched.transaction.pluginRoot, env: { CLAUDE_CONFIG_DIR: mismatched.configDir } });
  const installerVerdict = verifyClaudeInstallation({ transaction: mismatched.transaction.prepare(), env: { CLAUDE_CONFIG_DIR: mismatched.configDir } });
  assert.equal(sessionVerdict.status, "drift");
  assert.equal(installerVerdict.status, "mismatch");
  assert.equal(compareInstallationProvenance({ source_digest: digest("a"), runtime_digest: digest("e") }, { source_digest: digest("a"), runtime_digest: digest("e") }), "matched");
  assert.equal(compareInstallationProvenance({ source_digest: digest("a"), runtime_digest: digest("e") }, null), "unknown");
  // CR-004: a failed record write removes the previous record, so sessions report unknown, not drift.
  const recordFailureHome = join(fixtureRoot, "record-failure-claude-home");
  writeClaudeInstallationRecord({ pluginRoot: join(fixtureRoot, "earlier", "agdf"), marketplaceRoot: join(fixtureRoot, "earlier"),
    sourceDigest: digest("1"), runtimeDigest: digest("2"), env: { CLAUDE_CONFIG_DIR: recordFailureHome } });
  const recordFailure = install("record-failure", {
    configDir: recordFailureHome,
    script: current,
    recordInstallation: () => { throw Object.assign(new Error("denied"), { code: "EACCES" }); },
  });
  assert.equal(recordFailure.result.verificationStatus, "degraded", "a failed record never yields healthy");
  assert.ok(recordFailure.result.evidence.includes("installation_record:failed:EACCES:stale_removed"));
  assert.equal(readClaudeInstallationRecord({ env: { CLAUDE_CONFIG_DIR: recordFailureHome } }), null);

  // SCN-010: JSON listing first, text fallback with evidence, and no healthy result without a version.
  // A text-only host cannot show its cached copy, so the installer refreshes it as before.
  const textFallback = install("text-fallback", { script: { "claude plugin list --json": "error: unknown option '--json'", "claude plugin list": `agdf@agdf ${version}\n` } });
  assert.ok(textFallback.result.evidence.includes("plugin_list:text_fallback"));
  assert.ok(textFallback.result.evidence.includes("plugin_operation:reinstalled"));
  assert.equal(textFallback.result.verificationStatus, "healthy", JSON.stringify(textFallback.result.evidence));
  const noVersion = install("no-version", { script: { "claude plugin list --json": "{}", "claude plugin list": "agdf@agdf\n" } });
  assert.equal(noVersion.result.verificationStatus, "degraded");
  assert.ok(noVersion.result.evidence.includes("host_did_not_expose_version"));
  assert.deepEqual(readClaudePluginState(hostExec({ "claude plugin list --json": listJson([[PLUGIN_ID, version, "/cache/agdf"]]) })),
    { source: "json", installed: true, version, enabled: true, installPath: "/cache/agdf" });
  // CR-005: recorded Claude Code output; the user-scope entry wins over another scope's entry.
  const recorded = JSON.parse(readFileSync(new URL("./fixtures/claude-plugin-list-json.json", import.meta.url), "utf8"));
  assert.match(recorded.captured_with, /^claude \d+\.\d+\.\d+ plugin list --json$/);
  const recordedState = readClaudePluginState(hostExec({ "claude plugin list --json": JSON.stringify(recorded.output) }));
  assert.equal(recordedState.source, "json");
  assert.equal(recordedState.installed, true);
  assert.equal(recordedState.version, recorded.output.find((entry) => entry.id === PLUGIN_ID).version);
  assert.equal(recordedState.enabled, true);
  assert.match(recordedState.installPath, /[\\/]plugins[\\/]cache[\\/]agdf[\\/]agdf[\\/]/);
  const scoped = [{ ...recorded.output.find((entry) => entry.id === PLUGIN_ID), scope: "local", version: "0.0.1", installPath: "/project/agdf" },
    ...recorded.output];
  assert.equal(readClaudePluginState(hostExec({ "claude plugin list --json": JSON.stringify(scoped) })).installPath, recordedState.installPath);
  // A plugin listed only for one project is not installed for the user: the installer installs it.
  const projectOnly = install("project-only", { script: (tx) => ({ "claude plugin list --json": sequence(
    listJson([[PLUGIN_ID, version, tx.pluginRoot, true, "local"]]),
    listJson([[PLUGIN_ID, version, tx.pluginRoot, true, "local"], [PLUGIN_ID, version, tx.pluginRoot, true, "user"]])) }) });
  assert.ok(projectOnly.calls.includes("claude plugin install agdf@agdf"));
  assert.ok(projectOnly.result.evidence.includes("plugin_operation:installed"));
  assert.equal(projectOnly.result.verificationStatus, "healthy", JSON.stringify(projectOnly.result.evidence));

  // CR-003: a disabled plugin is reported and never healthy, and the installer does not re-enable it.
  const disabled = install("disabled", { script: (tx) => ({ "claude plugin list --json": listJson([[PLUGIN_ID, version, tx.pluginRoot, false]]) }) });
  assert.equal(disabled.result.verificationStatus, "degraded");
  assert.ok(disabled.result.evidence.includes("plugin_enabled:false"));
  assert.ok(disabled.result.evidence.includes("plugin_enable_command:claude plugin enable agdf@agdf"));
  assert.equal(disabled.calls.some((call) => / plugin (enable|install|uninstall) /.test(`${call} `)), false);

  // CR-007: a retired copy whose removal failed stays visible in the evidence.
  assert.deepEqual(packagedAppCopyEvidence([{ package: "Claude_x", path: "p", state: "retired", cleanup: "p.retired-42" }]),
    ["packaged_app_copy:Claude_x:retired:cleanup_pending=p.retired-42"]);

  // SCN-011: Claude's runtime-check status reflects plugin enablement without a receipt.
  const consentRoot = join(fixtureRoot, "consent-data");
  assert.equal(runtimeCheckStatus(consentRoot, "claude").effective, "enabled");
  assert.equal(existsSync(join(consentRoot, "runtime-checks", "claude.json")), false);

  // SCN-013: a cleanup failure after the commit is reported, never rolled back.
  const pendingTransaction = claudeTransaction("cleanup-pending", { commitResult: { cleanup: "pending", reason: "EBUSY" } });
  const pending = install("cleanup-pending", { transaction: pendingTransaction, script: current });
  assert.equal(pending.result.verificationStatus, "degraded");
  assert.ok(pending.result.evidence.includes("marketplace_cleanup:pending:EBUSY"));
  assert.equal(pendingTransaction.state.rolledBack, 0);
  assert.equal(pending.calls.some((call) => / plugin (install|uninstall) |marketplace remove/.test(`${call} `)), false);
  assert.equal(JSON.stringify(pending.result).includes("restored"), false, "no restoration is claimed");
  const throwingMcp = install("mcp-failure", {
    script: current,
    migrateMcp: () => { throw new Error("mcp failed"); },
  });
  assert.ok(throwingMcp.result.evidence.includes("claude_plugin_mcp:deferred_to_first_start"), "post-commit steps report instead of throwing");

  // The real transaction leaves the committed marker for the next run, which completes the cleanup.
  const dataRoot = join(fixtureRoot, "transaction-data");
  const builtOne = join(fixtureRoot, "built-one", "agdf");
  const builtTwo = join(fixtureRoot, "built-two", "agdf");
  cpSync(join(generatedRoot, "plugins", "agdf"), builtOne, { recursive: true });
  cpSync(builtOne, builtTwo, { recursive: true });
  writeFileSync(join(builtTwo, "assets", "hardening-marker.txt"), "changed content\n");
  prepareLocalMarketplace({ dataRoot, builtPluginRoot: builtOne, expectedVersion: version }).commit();
  const stableRoot = join(dataRoot, "marketplaces", "agdf");
  const busy = () => { throw Object.assign(new Error("busy"), { code: "EBUSY" }); };
  const tolerated = prepareLocalMarketplace({ dataRoot, builtPluginRoot: builtTwo, expectedVersion: version, cleanupBackup: busy })
    .commit({ tolerateCleanupFailure: true });
  assert.deepEqual(tolerated, { cleanup: "pending", reason: "EBUSY" });
  assert.ok(existsSync(`${stableRoot}.backup`) && existsSync(`${stableRoot}.transaction.json`));
  assert.equal(JSON.parse(readFileSync(`${stableRoot}.transaction.json`, "utf8")).phase, "committed");
  const recovered = prepareLocalMarketplace({ dataRoot, builtPluginRoot: builtTwo, expectedVersion: version });
  assert.equal(recovered.changed, false, "the committed content stays in place");
  assert.equal(existsSync(`${stableRoot}.backup`) || existsSync(`${stableRoot}.transaction.json`), false, "the next run completes the cleanup");
  // SCN-017: without the option the shared commit still fails as before.
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot: builtOne, expectedVersion: version, cleanupBackup: busy }).commit(), /busy/);

  // SCN-016: the marketplace keeps its location.
  assert.equal(localMarketplaceRoot({ env: { LOCALAPPDATA: "C:\\Users\\u\\AppData\\Local" }, platform: "win32" }),
    "C:\\Users\\u\\AppData\\Local\\agdf\\marketplaces\\agdf");

  // T-003: the uninstall plan reports the installation record.
  const uninstallPlan = planClaudeGlobalUninstall({
    exec: () => "",
    env: { CLAUDE_CONFIG_DIR: unchanged.configDir, LOCALAPPDATA: localAppData },
    platform: "win32",
  });
  assert.ok(uninstallPlan.retained.some((entry) => entry.startsWith("AGDF installation record in the Claude plugin data")));
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Claude install hardening tests passed.");
