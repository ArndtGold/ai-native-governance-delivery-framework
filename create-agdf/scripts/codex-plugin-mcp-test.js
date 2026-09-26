import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateLegacyCodexMcpRegistration, prepareCodexPluginMcp } from "../lib/host-adapters/codex/plugin-mcp.js";
import { prepareLocalMarketplace } from "../lib/installers/local-marketplace.js";
import { planGlobalUninstall } from "../lib/lifecycle/operations.js";
import { ensurePluginMcpRuntime, launchPluginMcpServer } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import { digestNormalizedPluginSource, renderCodexPluginMcpConfig } from "../lib/runtime/plugin-provenance.js";
import { offlineNpm, pluginRoot, version } from "./support/plugin-mcp-fixture.js";

// Codex: the runtime plugin declares the server in mcp/codex.mcp.json with installer-written absolute
// paths, because Codex expands no plugin variables and passes no plugin data directory.
assert.equal(JSON.parse(readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8")).mcpServers, "./mcp/codex.mcp.json");
assert.equal(readFileSync(join(pluginRoot, "mcp", "codex.mcp.json"), "utf8"), renderCodexPluginMcpConfig(), "the generated file is the template");
assert.equal(existsSync(join(pluginRoot, ".mcp.json")), false, "Claude Code would load a plugin-root .mcp.json automatically");

// `mcp enable --surface codex` no longer writes a config.toml registration next to the plugin's server.
const enable = runMcpLifecycle({
  action: "enable", surface: "codex", scope: "user", target: tmpdir(),
  exec() { throw new Error("Codex enable must not call the host"); },
  prepare() { throw new Error("Codex enable must not prepare a user runtime"); },
});
assert.deepEqual([enable.result, enable.diagnostics[0].code, enable.next_action.code],
  ["not_configured", "codex_plugin_managed", "use_codex_plugin_mcp"]);

const root = mkdtempSync(join(tmpdir(), "agdf-codex-plugin-mcp-"));
try {
  // Staging writes the absolute marketplace launcher and an AGDF-owned data root; provenance digests the template.
  const dataRoot = join(root, "data");
  const staged = prepareLocalMarketplace({ dataRoot, builtPluginRoot: pluginRoot, expectedVersion: version });
  staged.commit();
  const args = JSON.parse(readFileSync(join(staged.pluginRoot, "mcp", "codex.mcp.json"), "utf8")).mcpServers.agdf.args;
  assert.equal(args[0], `${staged.pluginRoot.replaceAll("\\", "/")}/mcp/agdf-mcp-launch.js`, "absolute launcher in the marketplace plugin");
  assert.deepEqual(args.slice(1, 4), ["--surface", "codex", "--data"]);
  assert.equal(args[4], join(dataRoot, "mcp", "codex-plugin").replaceAll("\\", "/"), "absolute AGDF-owned data root");
  assert.equal(digestNormalizedPluginSource(staged.pluginRoot, version), digestNormalizedPluginSource(pluginRoot, version),
    "installed absolute paths must not change the provenance digest");
  writeFileSync(join(staged.pluginRoot, "mcp", "codex.mcp.json"), renderCodexPluginMcpConfig().replace('"node"', '"sh"'));
  assert.notEqual(digestNormalizedPluginSource(staged.pluginRoot, version), digestNormalizedPluginSource(pluginRoot, version),
    "any other declaration must change the provenance digest");

  // The launcher takes the Codex surface and data root from its arguments.
  const ensured = [];
  const prepared = await launchPluginMcpServer({
    pluginRoot, argv: ["--surface", "codex", "--data", args[4], "--prepare"], env: {},
    stdout: { write() {} }, stderr: { write() {} },
    ensure(input) { ensured.push(input); return { status: "matched", version, root: "/r", changed: false }; },
  });
  assert.equal(prepared.status, "matched");
  assert.deepEqual(ensured, [{ pluginRoot, dataRoot: args[4] }]);

  // The installer prewarm reuses exactly the installed declaration.
  const prewarm = [];
  writeFileSync(join(staged.pluginRoot, "mcp", "codex.mcp.json"), renderCodexPluginMcpConfig({ pluginRoot: staged.pluginRoot, dataRoot: args[4] }));
  assert.deepEqual(prepareCodexPluginMcp({ pluginRoot: staged.pluginRoot, execPath: "/node", exec(file, argv) { prewarm.push([file, argv]); return ""; } }),
    ["codex_plugin_mcp:prepared"]);
  assert.deepEqual(prewarm, [["/node", [...args, "--prepare"]]]);
  assert.deepEqual(prepareCodexPluginMcp({ pluginRoot: join(root, "missing"), exec() { return ""; } }), ["codex_plugin_mcp:deferred_to_first_start"]);
} finally {
  rmSync(root, { recursive: true, force: true });
}

// `agdf uninstall --surface codex` removes the owned runtime, which lives in the AGDF data root because
// `codex plugin remove` cannot reach it, and keeps anything it does not own.
const uninstallRoot = mkdtempSync(join(tmpdir(), "agdf-codex-uninstall-"));
try {
  const codexData = join(uninstallRoot, "mcp", "codex-plugin");
  ensurePluginMcpRuntime({ pluginRoot, dataRoot: codexData, exec: offlineNpm });
  const plan = planGlobalUninstall("codex", { env: { AGDF_DATA_DIR: uninstallRoot } });
  assert.deepEqual(plan.mutations.map(({ kind }) => kind), ["command", "remove_tree"]);
  assert.equal(plan.mutations[1].path, codexData);
  writeFileSync(join(codexData, "user-notes.txt"), "keep\n");
  const kept = planGlobalUninstall("codex", { env: { AGDF_DATA_DIR: uninstallRoot } });
  assert.deepEqual(kept.mutations.map(({ kind }) => kind), ["command"], "unowned content blocks removal");
  assert.ok(kept.retained.some((entry) => entry.includes(codexData)));
} finally {
  rmSync(uninstallRoot, { recursive: true, force: true });
}

// Only the AGDF-owned user registration of earlier releases is retired; it shares the plugin server name.
const legacy = { name: "agdf", transport: { type: "stdio", command: "/node", args: ["/home/me/.local/share/agdf/mcp/user/0.14.5/node_modules/@agdf/mcp-server/bin/agdf-mcp.js", "--surface", "codex"] } };
for (const [entry, expectedDisable] of [
  [legacy, true],
  [{ ...legacy, transport: { ...legacy.transport, args: ["/p/mcp/agdf-mcp-launch.js", "--surface", "codex", "--data", "/d"] } }, false],
  [{ ...legacy, transport: { ...legacy.transport, args: ["/other/server.js", "--surface", "codex"] } }, false],
]) {
  const calls = [];
  const evidence = migrateLegacyCodexMcpRegistration({
    env: {}, exec: () => JSON.stringify(entry), mcpLifecycle(input) { calls.push(input); return { result: "disabled" }; },
  });
  assert.equal(calls.length, expectedDisable ? 1 : 0);
  if (expectedDisable) assert.deepEqual([calls[0].action, calls[0].surface, calls[0].scope, evidence], ["disable", "codex", "user", ["legacy_user_mcp_registration:disabled"]]);
}
assert.deepEqual(migrateLegacyCodexMcpRegistration({ env: {}, exec() { throw new Error("no codex"); } }), []);
assert.deepEqual(migrateLegacyCodexMcpRegistration({
  env: {}, exec: () => JSON.stringify(legacy), mcpLifecycle() { throw new Error("AGDF_MCP_REGISTRATION_FOREIGN"); },
}), ["legacy_user_mcp_registration:retained"]);

console.log("Codex plugin MCP tests passed");
