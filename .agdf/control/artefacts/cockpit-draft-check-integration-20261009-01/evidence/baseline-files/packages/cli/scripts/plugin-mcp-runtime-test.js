import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { mcpPackageConstants } from "../lib/mcp-lifecycle/package.js";
import { ensurePluginMcpRuntime, inspectPluginMcpDataRoot, launchPluginMcpServer, launcherFailureLine, parseLauncherArguments } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { npmCalls, offlineNpm, pluginRoot, version } from "../../../scripts/support/plugin-mcp-fixture.js";

// Shared plugin-local MCP runtime used by every host whose runtime plugin declares the server itself.
const root = mkdtempSync(join(tmpdir(), "agdf-plugin-mcp-runtime-"));
try {
  const updateablePluginRoot = join(root, "plugin");
  cpSync(pluginRoot, updateablePluginRoot, { recursive: true });
  const dataRoot = join(root, "data");
  const mcpRoot = join(dataRoot, "mcp");
  const prepared = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(prepared.status, "matched");
  assert.equal(prepared.changed, true);
  assert.equal(prepared.root, join(mcpRoot, version));
  assert.ok(existsSync(join(prepared.packageRoot, "bin", "agdf-mcp.js")), "the shipped server is installed");
  assert.equal(JSON.parse(readFileSync(join(prepared.dispatcherRoot, "package.json"), "utf8")).name, "create-agdf");
  // Exercise the assembled plugin package, not a fixture copying all source files.
  const { readSkillRuntimeContracts } = await import(pathToFileURL(join(prepared.dispatcherRoot, "lib/cli/contract-command.js")));
  const contracts = readSkillRuntimeContracts("code-review");
  assert.deepEqual(contracts.map(contract => contract.module), ["quality", "context-graph"]);
  assert.ok(contracts.every(contract => contract.content.length > 0 && contract.sha256.length === 64));

  const again = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec() { throw new Error("a matched runtime must not reinstall"); } });
  assert.equal(again.changed, false);

  // Plugin updates keep the data root: owned runtimes of other versions and abandoned stages are retired.
  const retired = join(mcpRoot, "0.0.1");
  cpSync(prepared.root, retired, { recursive: true });
  const foreignSibling = join(mcpRoot, "notes");
  mkdirSync(foreignSibling);
  const staleStage = join(mcpRoot, `.stage-${version}-stale`);
  mkdirSync(staleStage);
  const old = new Date(Date.now() - 60 * 60 * 1000);
  utimesSync(staleStage, old, old);
  ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(existsSync(retired), false, "an owned runtime of another version is retired");
  assert.equal(existsSync(staleStage), false, "an abandoned stage is removed");
  assert.equal(existsSync(foreignSibling), true, "unowned directories are never removed");

  // A plugin cachebuster can change source content while the canonical runtime version remains the same.
  const sourceService = join(updateablePluginRoot, "runtime", "create-agdf", "runtime", "core", "lib", "skill-dispatch", "service.js");
  writeFileSync(sourceService, `${readFileSync(sourceService, "utf8")}\n// updated plugin source\n`);
  npmCalls.length = 0;
  const pluginUpdated = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(pluginUpdated.status, "matched");
  assert.equal(pluginUpdated.changed, true, "same-version cached MCP runtime is rebuilt when installed plugin source changes");
  assert.notEqual(pluginUpdated.dispatcherDigest, again.dispatcherDigest);
  assert.equal(npmCalls.length, 1);

  // A same-version runtime whose content drifted is owned and therefore rebuilt.
  writeFileSync(join(prepared.packageRoot, "src", "main.js"), "tampered\n");
  npmCalls.length = 0;
  const rebuilt = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(rebuilt.changed, true);
  assert.equal(npmCalls.length, 1);
  assert.equal(JSON.parse(readFileSync(join(rebuilt.root, mcpPackageConstants.marker), "utf8")).owner, mcpPackageConstants.owner);

  // A directory without the AGDF marker at the runtime path is never overwritten.
  const foreignData = join(root, "foreign");
  mkdirSync(join(foreignData, "mcp", version), { recursive: true });
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: foreignData, exec: offlineNpm }), /AGDF_MCP_RUNTIME_UNOWNED/);
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: null, exec: offlineNpm }), /AGDF_MCP_PLUGIN_DATA_MISSING/);

  // Ownership of a whole launcher data root, as uninstall inspects it.
  const ownedData = join(root, "owned");
  assert.equal(inspectPluginMcpDataRoot(ownedData), "absent");
  ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: ownedData, exec: offlineNpm });
  assert.equal(inspectPluginMcpDataRoot(ownedData), "owned");
  writeFileSync(join(ownedData, "user-notes.txt"), "keep\n");
  assert.equal(inspectPluginMcpDataRoot(ownedData), "foreign");
  assert.equal(inspectPluginMcpDataRoot(dataRoot), "foreign", "an unowned sibling under mcp/ blocks removal");
} finally {
  rmSync(root, { recursive: true, force: true });
}

// Launcher arguments: Claude passes its data root in the environment, Codex as absolute arguments.
assert.deepEqual(parseLauncherArguments([], { CLAUDE_PLUGIN_DATA: "/claude/data" }), { surface: "claude", dataRoot: "/claude/data", prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--prepare"], { CLAUDE_PLUGIN_DATA: "/claude/data" }), { surface: "claude", dataRoot: "/claude/data", prepareOnly: true });
const absolute = join(tmpdir(), "codex-data");
assert.deepEqual(parseLauncherArguments(["--surface", "codex", "--data", absolute], {}), { surface: "codex", dataRoot: absolute, prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--surface", "codex", "--data", absolute, "--prepare"], {}), { surface: "codex", dataRoot: absolute, prepareOnly: true });
assert.deepEqual(parseLauncherArguments(["--surface", "copilot", "--data", absolute], {}), { surface: "copilot", dataRoot: absolute, prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--surface", "copilot", "--data", absolute, "--prepare"], {}), { surface: "copilot", dataRoot: absolute, prepareOnly: true });
for (const invalid of [["--surface", "claude"], ["--surface", "codex", "--data", "relative"], ["--surface", "copilot", "--data", "relative"], ["--surface", "codex"], ["--unknown"]]) {
  assert.equal(parseLauncherArguments(invalid, {}), null, invalid.join(" "));
}
// Claude cockpit entry: the project root Claude substitutes for ${CLAUDE_PROJECT_DIR}, never cwd.
const project = join(tmpdir(), "agdf project with spaces");
assert.deepEqual(parseLauncherArguments(["--cockpit-dir", project], { CLAUDE_PLUGIN_DATA: "/claude/data" }),
  { surface: "claude", dataRoot: "/claude/data", cockpitDir: project, prepareOnly: false });
assert.deepEqual(parseLauncherArguments(["--cockpit-dir", project, "--prepare"], { CLAUDE_PLUGIN_DATA: "/claude/data" }),
  { surface: "claude", dataRoot: "/claude/data", cockpitDir: project, prepareOnly: true });
for (const invalid of [["--cockpit-dir"], ["--cockpit-dir", "relative/project"], ["--cockpit-dir", "${CLAUDE_PROJECT_DIR}"],
  ["--cockpit-dir", join(tmpdir(), "${CLAUDE_PROJECT_DIR}")], ["--cockpit-dir", ""], ["--cockpit-dir", project, "--surface", "claude"]]) {
  assert.equal(parseLauncherArguments(invalid, { CLAUDE_PLUGIN_DATA: "/claude/data" }), null, invalid.join(" "));
}
{
  // The launcher passes the cockpit root as one argv element to the verified server.
  const spawnRoot = mkdtempSync(join(tmpdir(), "agdf-launcher-argv-"));
  try {
    const entrypoint = join(spawnRoot, "record-argv.mjs"), recorded = join(spawnRoot, "argv.json");
    writeFileSync(entrypoint, `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(recorded)}, JSON.stringify(process.argv.slice(2)));\n`);
    const runtime = { status: "matched", version, root: spawnRoot, entrypoint, changed: false, sdkVerification: "verified" };
    for (const [argv, expected] of [[[], ["--surface", "claude"]], [["--cockpit-dir", project], ["--surface", "claude", "--cockpit-dir", project]]]) {
      await launchPluginMcpServer({ pluginRoot, argv, env: { CLAUDE_PLUGIN_DATA: join(spawnRoot, "data") },
        stdout: { write() {} }, stderr: { write(text) { throw new Error(text); } }, ensure: () => runtime });
      assert.deepEqual(JSON.parse(readFileSync(recorded, "utf8")), expected);
    }
  } finally { rmSync(spawnRoot, { recursive: true, force: true }); }
}

// The SDK is installed only as the locked tree shipped with the plugin and must match its expected digest.
const sdkRoot = mkdtempSync(join(tmpdir(), "agdf-plugin-mcp-sdk-"));
try {
  const markerOf = (runtime) => JSON.parse(readFileSync(join(runtime.root, mcpPackageConstants.marker), "utf8"));
  const runtimeAt = (dataRoot) => join(dataRoot, "mcp", version);
  const variant = (mutate) => (executable, args, options) => {
    const result = offlineNpm(executable, args, options);
    mutate(join(options.cwd, "node_modules"));
    return result;
  };

  // SCN-001: a fresh preparation runs `npm ci` against the shipped lock and records a verified runtime.
  npmCalls.length = 0;
  const fresh = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(sdkRoot, "fresh"), exec: offlineNpm, env: {} });
  assert.deepEqual(npmCalls, ["ci"]);
  assert.equal(markerOf(fresh).sdk_verification, "verified");
  assert.equal(fresh.sdkDigest, JSON.parse(readFileSync(join(pluginRoot, "mcp", "sdk", "expected-sdk.json"), "utf8")).sdk_digest);

  // SCN-002 to SCN-004: an extra or missing package, or changed content, is refused and nothing is committed.
  for (const [name, mutate, code] of [
    ["extra", (modules) => cpSync(join(modules, "zod"), join(modules, "left-pad"), { recursive: true }), /AGDF_MCP_SDK_PACKAGE_SET_MISMATCH/],
    ["missing", (modules) => rmSync(join(modules, "zod"), { recursive: true, force: true }), /AGDF_MCP_SDK_PACKAGE_SET_MISMATCH/],
    ["changed", (modules) => writeFileSync(join(modules, "zod", "package.json"), `${readFileSync(join(modules, "zod", "package.json"), "utf8")}\n`), /AGDF_MCP_SDK_DIGEST_MISMATCH/],
  ]) {
    const dataRoot = join(sdkRoot, name);
    assert.throws(() => ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: variant(mutate), env: {} }), code, name);
    assert.equal(existsSync(runtimeAt(dataRoot)), false, `${name}: no runtime is committed`);
  }

  // SCN-005: an npm integrity or network failure leaves no committed runtime.
  const failed = join(sdkRoot, "integrity");
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot, dataRoot: failed, exec() { throw new Error("EINTEGRITY"); }, env: {} }), /AGDF_MCP_PACKAGE_ACQUISITION_FAILED/);
  assert.equal(existsSync(runtimeAt(failed)), false);

  // SCN-006 and SCN-007: a matching runtime is reused offline; a tampered SDK file forces one locked reinstall.
  const reusedRoot = join(sdkRoot, "fresh");
  assert.equal(ensurePluginMcpRuntime({ pluginRoot, dataRoot: reusedRoot, exec() { throw new Error("no npm for a verified runtime"); }, env: {} }).changed, false);
  const zodPackage = join(runtimeAt(reusedRoot), "node_modules", "zod", "package.json");
  writeFileSync(zodPackage, `${readFileSync(zodPackage, "utf8")}\n`);
  npmCalls.length = 0;
  const replaced = ensurePluginMcpRuntime({ pluginRoot, dataRoot: reusedRoot, exec: offlineNpm, env: {} });
  assert.equal(replaced.changed, true);
  assert.deepEqual(npmCalls, ["ci"]);

  // SCN-008: the explicit override installs without verification, is recorded and announced on stderr.
  const overrideRoot = join(sdkRoot, "override");
  const overrideEnv = { AGDF_MCP_ALLOW_UNVERIFIED_SDK: "1", CLAUDE_PLUGIN_DATA: overrideRoot };
  npmCalls.length = 0;
  const unverified = ensurePluginMcpRuntime({ pluginRoot, dataRoot: overrideRoot, exec: variant(() => {}), env: overrideEnv });
  assert.deepEqual(npmCalls, ["@modelcontextprotocol/server@2.0.0"]);
  assert.equal(markerOf(unverified).sdk_verification, "unverified_override");
  const warnings = [];
  await launchPluginMcpServer({
    pluginRoot, argv: ["--prepare"], env: overrideEnv, stdout: { write() {} }, stderr: { write(text) { warnings.push(text); } },
    ensure: (input) => ensurePluginMcpRuntime({ ...input, exec: offlineNpm }),
  });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /^AGDF_MCP_SDK_UNVERIFIED_OVERRIDE: AGDF_MCP_ALLOW_UNVERIFIED_SDK=1 is set/u);
  // The warning also appears when a verified runtime is merely reused under the override.
  const reuseWarnings = [];
  await launchPluginMcpServer({
    pluginRoot, argv: ["--prepare"], env: overrideEnv, stdout: { write() {} }, stderr: { write(text) { reuseWarnings.push(text); } },
    ensure: () => ({ status: "matched", version, root: "/r", changed: false, sdkVerification: "verified" }),
  });
  assert.equal(reuseWarnings.length, 1);

  // SCN-009: without the override the unverified runtime is replaced by a verified one.
  npmCalls.length = 0;
  const reverified = ensurePluginMcpRuntime({ pluginRoot, dataRoot: overrideRoot, exec: offlineNpm, env: {} });
  assert.deepEqual(npmCalls, ["ci"]);
  assert.equal(markerOf(reverified).sdk_verification, "verified");

  // SCN-012: a refused start prints one line with stable code, cause and one recovery action.
  const failures = [];
  const refused = await launchPluginMcpServer({
    pluginRoot, argv: [], env: { CLAUDE_PLUGIN_DATA: join(sdkRoot, "refused") }, stdout: { write() {} },
    stderr: { write(text) { failures.push(text); } },
    ensure() { throw new Error("AGDF_MCP_SDK_DIGEST_MISMATCH"); },
  });
  process.exitCode = 0;
  assert.equal(refused, null);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /^AGDF_MCP_SDK_DIGEST_MISMATCH: .+\. Check your npm registry or mirror and restart; to accept an unverified SDK deliberately, set AGDF_MCP_ALLOW_UNVERIFIED_SDK=1\.\n$/u);
  assert.match(launcherFailureLine("AGDF_MCP_RUNTIME_UNOWNED"), /^AGDF_MCP_RUNTIME_UNOWNED: .+\. Move the directory away and restart\.$/u);
} finally {
  rmSync(sdkRoot, { recursive: true, force: true });
}

{
  // After a plugin update, several launchers (Claude's version probe plus respawn, both servers, every
  // reconnecting session) replace the outdated runtime at once. None may observe a half-deleted runtime.
  const updateRoot = mkdtempSync(join(tmpdir(), "agdf-plugin-mcp-update-"));
  try {
    const updatedPlugin = join(updateRoot, "plugin"), dataRoot = join(updateRoot, "data");
    cpSync(pluginRoot, updatedPlugin, { recursive: true });
    ensurePluginMcpRuntime({ pluginRoot: updatedPlugin, dataRoot, exec: offlineNpm });
    writeFileSync(join(updatedPlugin, "mcp", "server", "README.md"), `${readFileSync(join(updatedPlugin, "mcp", "server", "README.md"), "utf8")}\nUpdated plugin build.\n`);
    const worker = join(import.meta.dirname, "fixtures", "plugin-mcp-ensure-worker.js");
    const results = await Promise.all(Array.from({ length: 6 }, () => new Promise((resolveRun, reject) => {
      const child = spawn(process.execPath, [worker, updatedPlugin, dataRoot], { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.once("error", reject);
      child.once("exit", () => resolveRun(JSON.parse(stdout)));
    })));
    assert.deepEqual(results.filter((row) => row.error), [], JSON.stringify(results));
    assert.equal(ensurePluginMcpRuntime({ pluginRoot: updatedPlugin, dataRoot, exec() { throw new Error("must reuse"); } }).changed, false);
    assert.deepEqual(readdirSync(join(dataRoot, "mcp")).filter((name) => name.startsWith(".")), [], "no retired or staged leftovers");
  } finally { rmSync(updateRoot, { recursive: true, force: true }); }
}

console.log("Plugin MCP runtime tests passed");
