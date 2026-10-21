import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, realpathSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateLegacyCodexMcpRegistration, prepareCodexPluginMcp } from "../lib/host-adapters/codex/plugin-mcp.js";
import { installCodexGlobalPlugin } from '../lib/host-adapters/codex/plugin.js';
import { prepareLocalMarketplace, settleCodexCockpitPublication, inspectCodexOwnedManifestRepair } from "../lib/installers/local-marketplace.js";
import { planGlobalUninstall } from "../lib/lifecycle/operations.js";
import { ensurePluginMcpRuntime, launchPluginMcpServer } from "../lib/mcp-lifecycle/plugin-runtime.js";
import { createCodexCockpitTransition, inspectCodexCockpitAdmission, inspectCodexCockpitPlugin } from "../lib/mcp-lifecycle/adapters/codex.js";
import { createHash } from "node:crypto";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import { resolveControlCommandTarget } from "#agdf-core/control-state/approval-command-contract.js";
import { digestNormalizedPluginSource, normalizeCodexPluginMcpConfig, renderCodexPluginMcpConfig } from "#agdf-core/runtime/plugin-provenance.js";
import { offlineNpm, pluginRoot, version } from "../../../scripts/support/plugin-mcp-fixture.js";

// Codex: the runtime plugin declares the server in portable root mcp.json with installer-written absolute
// paths, because Codex expands no plugin variables and passes no plugin data directory.
assert.equal(JSON.parse(readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8")).mcpServers, "./mcp.json");
assert.equal(readFileSync(join(pluginRoot, "mcp.json"), "utf8"), renderCodexPluginMcpConfig({ cockpit: true }), "the generated file is the template");
assert.equal(JSON.parse(readFileSync(join(pluginRoot, "mcp.json"), "utf8")).mcpServers.agdf.type, "stdio");
assert.equal(existsSync(join(pluginRoot, "mcp", "codex.mcp.json")), false, "portable discovery must have one canonical MCP declaration");
assert.equal(existsSync(join(pluginRoot, ".mcp.json")), false, "Claude Code would load a plugin-root .mcp.json automatically");

// Already installed owned legacy declarations must retain their historical normalized digest.
for (const portable of [false, true]) {
  const projected = renderCodexPluginMcpConfig({ pluginRoot: "/installed/agdf", dataRoot: "/owned/data", portable });
  assert.equal(normalizeCodexPluginMcpConfig(projected), renderCodexPluginMcpConfig({ portable }));
  for (const mutate of [
    (c) => { c.mcpServers.agdf.command = "sh"; },
    (c) => { c.mcpServers.agdf.env = { INJECTED: "1" }; },
    (c) => { c.mcpServers.agdf.args[2] = "claude"; },
    (c) => { c.mcpServers.agdf.type = "sse"; },
    (c) => { c.$schema = "https://invalid/schema"; },
  ]) {
    const value = JSON.parse(projected); mutate(value);
    const changed = JSON.stringify(value);
    assert.equal(normalizeCodexPluginMcpConfig(changed), changed, "tampered fields must remain digest-visible");
  }
}

// `mcp enable --surface codex` no longer writes a config.toml registration next to the plugin's server.
const enable = runMcpLifecycle({
  action: "enable", surface: "codex", scope: "user", target: tmpdir(),
  exec() { throw new Error("Codex enable must not call the host"); },
  prepare() { throw new Error("Codex enable must not prepare a user runtime"); },
});
assert.deepEqual([enable.result, enable.diagnostics[0].code, enable.next_action.code],
  ["not_configured", "codex_plugin_managed", "use_codex_plugin_mcp"]);

const statusTarget = mkdtempSync(join(tmpdir(), 'agdf-plugin-status-'));
try {
  const user = join(statusTarget, 'user'); mkdirSync(user);
  writeFileSync(join(user, 'config.toml'), '[plugins."agdf@agdf"]\nenabled = true\n');
  const status = runMcpLifecycle({ action: 'status', surface: 'codex', target: statusTarget,
    env: { CODEX_HOME: user, AGDF_DATA_DIR: join(statusTarget, 'data'), AGDF_DISPATCH_PLUGIN_ROOT: pluginRoot },
    exec() { return 'codex-cli 0.145.0'; } });
  assert.equal(status.next_action.code, 'use_codex_plugin_mcp');
  assert.equal(status.diagnostics[0].code, 'codex_plugin_managed');
  assert.equal(status.setup.entries.find(entry => entry.role === 'product').started, 'unobserved');
  writeFileSync(join(user, 'config.toml'), '[plugins."agdf@agdf"]\nenabled = false\n');
  const disabled = runMcpLifecycle({ action: 'status', surface: 'codex', target: statusTarget,
    env: { CODEX_HOME: user, AGDF_DATA_DIR: join(statusTarget, 'data'), AGDF_DISPATCH_PLUGIN_ROOT: pluginRoot },
    exec() { return 'codex-cli 0.145.0'; } });
  assert.equal(disabled.next_action.code, 'use_codex_plugin_mcp');
  assert.equal(disabled.setup.entries.find(entry => entry.role === 'product').configured, 'disabled');
} finally { rmSync(statusTarget, { recursive: true, force: true }); }
const root = realpathSync(mkdtempSync(join(tmpdir(), "agdf-codex-plugin-mcp-")));
try {
  // Staging writes the absolute marketplace launcher and an AGDF-owned data root; provenance digests the template.
  const dataRoot = join(root, "data");
  const staged = prepareLocalMarketplace({ dataRoot, builtPluginRoot: pluginRoot, expectedVersion: version });
  staged.commit();
  const args = JSON.parse(readFileSync(join(staged.pluginRoot, "mcp.json"), "utf8")).mcpServers.agdf.args;
  assert.equal(args[0], `${staged.pluginRoot.replaceAll("\\", "/")}/mcp/agdf-mcp-launch.js`, "absolute launcher in the marketplace plugin");
  assert.deepEqual(args.slice(1, 4), ["--surface", "codex", "--data"]);
  assert.equal(args[4], join(dataRoot, "mcp", "codex-plugin").replaceAll("\\", "/"), "absolute AGDF-owned data root");
  assert.equal(digestNormalizedPluginSource(staged.pluginRoot, version), digestNormalizedPluginSource(pluginRoot, version),
    "installed absolute paths must not change the provenance digest");
  writeFileSync(join(staged.pluginRoot, "mcp.json"), renderCodexPluginMcpConfig().replace('"node"', '"sh"'));
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
  const { publicationDeadline, ...ensuredInput } = ensured[0];
  assert.deepEqual(ensuredInput, { pluginRoot, dataRoot: args[4], env: {} });
  assert.ok(Number.isFinite(publicationDeadline) && publicationDeadline > performance.now()
    && publicationDeadline <= performance.now() + 30_000);
  const deadlines = [];
  await launchPluginMcpServer({ pluginRoot, argv: ['--surface', 'codex', '--data', args[4]], env: {},
    stdout: { write() {} }, stderr: { write() {} },
    ensure(input) { deadlines.push(input.publicationDeadline); return { status: 'matched' }; },
    acquireClaim(runtime, input) { deadlines.push(input.publicationDeadline); },
    startFacade(input) { deadlines.push(input.publicationDeadline); return null; } });
  assert.equal(deadlines.length, 3); assert.ok(deadlines.every(value => value === deadlines[0]), 'No phase restarts the shared publication allowance.');

  // The installer prewarm reuses exactly the installed declaration.
  const prewarm = [];
  writeFileSync(join(staged.pluginRoot, "mcp.json"), renderCodexPluginMcpConfig({ pluginRoot: staged.pluginRoot, dataRoot: args[4], cockpit: true }));
  assert.deepEqual(prepareCodexPluginMcp({ pluginRoot: staged.pluginRoot, execPath: "/node", exec(file, argv) { prewarm.push([file, argv]); return ""; } }),
    ["codex_plugin_mcp:prepared"]);
  assert.deepEqual(prewarm, [["/node", [...args, "--prepare"]]]);
  assert.deepEqual(prepareCodexPluginMcp({ pluginRoot: join(root, "missing"), exec() { return ""; } }), ["codex_plugin_mcp:deferred_to_first_start"]);
  const cockpit = JSON.parse(readFileSync(join(staged.pluginRoot, 'mcp.json'), 'utf8')).mcpServers['agdf-cockpit'];
  for (const path of [staged.pluginRoot, staged.pluginRoot.replaceAll('\\', '/')]) {
    assert.equal(inspectCodexCockpitPlugin(path).status, 'matched', 'Native and portable separators identify the same canonical installed plugin');
    assert.equal(inspectCodexCockpitPlugin(path + '/.').status, 'unconfirmed', 'Separator compatibility must not admit noncanonical paths');
  }
  for (const providers of [
    [{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf' }],
    [{ server_id: 'agdf-cockpit', plugin_id: 'foreign@foreign' }],
    [{ server_id: 'agdf-cockpit', plugin_id: null }],
    [{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf' }, { server_id: 'agdf-cockpit', plugin_id: 'foreign@foreign' }],
  ]) {
    let originsRead = 0;
    const admission = inspectCodexCockpitAdmission({ target: root, env: { CODEX_HOME: join(root, 'user') },
      exec(command, argv) {
        if (command === 'codex') return JSON.stringify([{ name: 'agdf-cockpit', enabled: true, transport: cockpit }]);
        assert.ok(argv[0].endsWith('codex-origin-probe.js')); originsRead++;
        return JSON.stringify({ status: 'observed', scope: { cwd: root, ephemeral: true, thread_id: 'fixture-ephemeral' }, providers: providers.map(row => ({ ...row, runtime_status: 'connected' })) });
      } });
    assert.equal(originsRead, 1, 'owned launcher bytes alone cannot prove the connection owner');
    assert.equal(admission.admitted, providers.length === 1 && providers[0].plugin_id === 'agdf@agdf');
  }
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
  assert.deepEqual(plan.mutations.map(({ kind }) => kind), ["command", "remove_tree", "codex_tool_policy"]);
  assert.equal(plan.mutations[1].path, codexData);
  writeFileSync(join(codexData, "user-notes.txt"), "keep\n");
  const kept = planGlobalUninstall("codex", { env: { AGDF_DATA_DIR: uninstallRoot } });
  assert.deepEqual(kept.mutations.map(({ kind }) => kind), ["command", "codex_tool_policy"], "unowned content blocks removal");
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

// A damaged owned manifest is repairable only with an independently verified
// native cache and the exact original full-payload hash. Admission still needs
// native plugin ownership, never an unowned same-key connection.
{
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-manifest-repair-'))), dataRoot = join(work, 'data');
  try {
    const staged = prepareLocalMarketplace({ dataRoot, builtPluginRoot: pluginRoot }); staged.commit();
    const env = { CODEX_HOME: join(work, 'home') };
    const cache = join(env.CODEX_HOME, 'plugins/cache/agdf/agdf', staged.codexInstallVersion);
    cpSync(staged.pluginRoot, cache, { recursive: true });
    assert.equal(inspectCodexOwnedManifestRepair({ dataRoot, env }), null);
    const manifest = join(staged.pluginRoot, 'runtime/runtime-manifest.json');
    const original = readFileSync(manifest), parsed = JSON.parse(original); parsed.digest = '0'.repeat(64);
    writeFileSync(manifest, JSON.stringify(parsed));
    const damaged = readFileSync(manifest), proof = inspectCodexOwnedManifestRepair({ dataRoot, env });
    assert.ok(proof, 'only the known stale manifest is proved against the original owned payload');
    assert.equal(proof.inspect(staged.pluginRoot).repair, true);
    assert.deepEqual(readFileSync(manifest), damaged, 'inspection never repairs or publishes files');
    const cockpit = JSON.parse(readFileSync(join(staged.pluginRoot, 'mcp.json'))).mcpServers['agdf-cockpit'];
    for (const pluginId of ['agdf@agdf', 'foreign@foreign', null]) {
      const exec = command => command === 'codex' ? JSON.stringify([{ name: 'agdf-cockpit', enabled: true, transport: cockpit }])
        : JSON.stringify({ status: 'observed', scope: { cwd: work, ephemeral: true, thread_id: 'native-owned-fixture' },
          providers: [{ server_id: 'agdf-cockpit', plugin_id: pluginId, runtime_status: 'failed' }] });
      assert.equal(inspectCodexCockpitAdmission({ target: work, env, exec }).admitted, false);
      assert.equal(inspectCodexCockpitAdmission({ target: work, env, exec, manifestRepair: proof }).admitted, pluginId === 'agdf@agdf');
    }
    for (const [providers, admitted] of [
      [[{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf', runtime_status: 'connected' }], true],
      [[{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf', runtime_status: 'cancelled' }], false],
      [[{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf', runtime_status: null }], false],
      [[{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf', runtime_status: 'failed' },
        { server_id: 'agdf-cockpit', plugin_id: 'foreign@foreign', runtime_status: 'failed' }], false],
    ]) {
      const exec = command => command === 'codex' ? JSON.stringify([{ name: 'agdf-cockpit', enabled: true, transport: cockpit }])
        : JSON.stringify({ status: 'observed', scope: { cwd: work, ephemeral: true, thread_id: 'native-owned-fixture' }, providers });
      assert.equal(inspectCodexCockpitAdmission({ target: work, env, exec, manifestRepair: proof }).admitted, admitted);
    }
    let prepared = false;
    assert.throws(() => installCodexGlobalPlugin({ target: work, dataRoot, env,
      prepare() { const transaction = prepareLocalMarketplace({ dataRoot, builtPluginRoot: pluginRoot }); prepared = true; return transaction; },
      migrateMcp: () => [], prepareMcp: () => [],
      exec(command, args) {
        if (command === process.execPath) return JSON.stringify({ status: 'observed', scope: { cwd: work, ephemeral: true, thread_id: 'owned-before-repair' },
          providers: [{ server_id: 'agdf-cockpit', plugin_id: 'agdf@agdf', runtime_status: 'failed' }] });
        if (args[0] === 'mcp') return JSON.stringify(prepared ? [] : [{ name: 'agdf-cockpit', enabled: true, transport: cockpit }]);
        if (args.join(' ') === 'plugin marketplace list --json') return JSON.stringify({ marketplaces: [{ name: 'agdf', marketplaceSource: { sourceType: 'local', source: staged.root } }] });
        if (args.join(' ') === 'plugin list') return `agdf@agdf ${staged.codexInstallVersion}\n`;
        return '';
      },
    }), error => error.phase === 'cockpit_repair_unconfirmed', 'provider absence cannot qualify fresh repaired availability');
    assert.deepEqual(readFileSync(manifest), damaged, 'the existing owner restores rollback until an actual fresh connection qualifies');
    const other = join(staged.pluginRoot, '.codex-plugin/plugin.json'), saved = readFileSync(other);
    writeFileSync(other, 'unrelated tampering');
    assert.equal(inspectCodexOwnedManifestRepair({ dataRoot, env }), null);
    assert.throws(() => proof.assertCurrent(), /repair_source_changed/u);
    writeFileSync(other, saved);
    writeFileSync(join(cache, '.codex-plugin/plugin.json'), 'untrusted cache');
    assert.equal(inspectCodexOwnedManifestRepair({ dataRoot, env }), null);
    writeFileSync(manifest, original);
  } finally { rmSync(work, { recursive: true, force: true }); }
}
assert.deepEqual(migrateLegacyCodexMcpRegistration({
  env: {}, exec: () => JSON.stringify(legacy), mcpLifecycle() { throw new Error("AGDF_MCP_REGISTRATION_FOREIGN"); },
}), ["legacy_user_mcp_registration:retained"]);

console.log("Codex plugin MCP tests passed");

// The plugin Cockpit shares launcher/data identity; no repository path is distributed.
for (const portable of [false, true]) {
  const configured = renderCodexPluginMcpConfig({ pluginRoot: '/installed/agdf', dataRoot: '/owned/data', portable, cockpit: true });
  assert.equal(normalizeCodexPluginMcpConfig(configured), renderCodexPluginMcpConfig({ portable, cockpit: true }));
  for (const mutate of [
    c => { c.mcpServers['agdf-cockpit'].args[4] = '/other'; },
    c => { c.mcpServers['agdf-cockpit'].args.pop(); },
    c => { c.mcpServers['agdf-cockpit'].command = 'sh'; },
    c => { c.mcpServers.cockpit = c.mcpServers['agdf-cockpit']; },
  ]) { const value = JSON.parse(configured); mutate(value); const bytes = JSON.stringify(value);
    assert.equal(normalizeCodexPluginMcpConfig(bytes), bytes); }
}


// Exact owned retirement is a reversible enabled-field delta; no runtime is removed.
for (const legacyId of ['agdf-cockpit-local', 'agdf-cockpit']) {
const transitionTarget = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-cockpit-transition-')));
try {
  const env = { CODEX_HOME: join(transitionTarget, 'user'), AGDF_DATA_DIR: join(transitionTarget, 'data') };
  mkdirSync(env.CODEX_HOME);
  const foreignConfig = '[mcp_servers.foreign]\ncommand = "/foreign"\n[mcp_servers.foreign.env]\nSECRET = "PRESERVED_CANARY"\n[mcp_servers.foreign.tools.read]\napproval_mode = "never"\n';
  writeFileSync(join(env.CODEX_HOME, 'config.toml'), foreignConfig);
  const runtime = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(transitionTarget, 'runtime'), exec: offlineNpm });
  const enabled = runMcpLifecycle({ action: 'enable', surface: 'codex', scope: 'project', target: transitionTarget,
    env, role: 'cockpit', serverId: legacyId, preparedRuntime: runtime,
    exec() { return 'codex-cli 0.160.0'; } });
  assert.notEqual(enabled.result, 'failed', JSON.stringify(enabled));
  const path = join(transitionTarget, '.codex/config.toml'), original = readFileSync(path, 'utf8');
  const hash = text => 'sha256:' + createHash('sha256').update(text).digest('hex');
  const evidence = { config_path: path, config_digest: hash(original), section_digest: hash(original),
    target_id: hash('fixture target'), plugin_digest: hash('fixture plugin'),
    inventory: { origins: [{ path, digest: hash(original) }, { path: join(env.CODEX_HOME, 'config.toml'), digest: hash(foreignConfig) }] } };
  const make = (extra = {}) => createCodexCockpitTransition({ target: transitionTarget, env,
    serverId: legacyId, evidence, evidenceDigest: hash('observed evidence'), ...extra });
  const tx = make(); tx.apply();
  assert.ok(readFileSync(path, 'utf8').includes('enabled = false'));
  assert.ok(existsSync(runtime.entrypoint), 'legacy executable retained');
  tx.rollback(); assert.equal(readFileSync(path, 'utf8'), original);
  const stale = make(); writeFileSync(path, original + '# FOREIGN_EDIT\n');
  assert.throws(() => stale.apply(), /SOURCE_CHANGED/);
  assert.equal(readFileSync(path, 'utf8'), original + '# FOREIGN_EDIT\n');
  writeFileSync(path, original);
  make().apply();
  make({ restore: true }).apply();
  assert.equal(readFileSync(path, 'utf8'), original, 'standalone guarded restore reconstructs the original section');
  const blocked = make({ revalidate() { throw Error('evidence_changed'); } });
  assert.throws(() => blocked.apply(), /evidence_changed/);
  assert.equal(readFileSync(path, 'utf8'), original);

  // Windows registrations use native separators, while historic declarations
  // may use portable ones. Both must retain exact ownership and rollback bytes.
  const portableConfig = original.replace(/^args = (.+)$/mu, (_line, raw) => {
    const args = JSON.parse(raw); args[0] = args[0].replaceAll('\\', '/');
    return 'args = ' + JSON.stringify(args);
  });
  writeFileSync(path, portableConfig);
  const portableEvidence = { ...evidence, config_digest: hash(portableConfig), section_digest: hash(portableConfig),
    inventory: { origins: evidence.inventory.origins.map(row => row.path === path ? { ...row, digest: hash(portableConfig) } : row) } };
  const portableTx = createCodexCockpitTransition({ target: transitionTarget, env, serverId: legacyId,
    evidence: portableEvidence, evidenceDigest: hash('portable fixture evidence') });
  portableTx.apply(); assert.ok(readFileSync(path, 'utf8').includes('enabled = false'));
  portableTx.rollback(); assert.equal(readFileSync(path, 'utf8'), portableConfig, 'Portable-path rollback preserves every original byte');
  assert.ok(existsSync(runtime.entrypoint), 'Portable-path retirement retains the verified runtime');
  const aliasedConfig = portableConfig.replace(/^args = (.+)$/mu, (_line, raw) => {
    const args = JSON.parse(raw); args[0] = args[0].replace('/node_modules/', '/node_modules/../node_modules/');
    return 'args = ' + JSON.stringify(args);
  });
  writeFileSync(path, aliasedConfig);
  const aliasedEvidence = { ...portableEvidence, config_digest: hash(aliasedConfig), section_digest: hash(aliasedConfig),
    inventory: { origins: portableEvidence.inventory.origins.map(row => row.path === path ? { ...row, digest: hash(aliasedConfig) } : row) } };
  assert.throws(() => createCodexCockpitTransition({ target: transitionTarget, env, serverId: legacyId,
    evidence: aliasedEvidence, evidenceDigest: hash('noncanonical fixture evidence') }), /REGISTRATION_FOREIGN/,
  'Separator compatibility never admits a noncanonical executable alias');
  assert.equal(readFileSync(path, 'utf8'), aliasedConfig, 'Rejected alias never mutates configuration');
  writeFileSync(path, original);

  // Exercise the real service boundary with explicitly synthetic native observations.
  // This fixture qualifies the guarded transition logic, never a real host session.
  const published = prepareLocalMarketplace({ dataRoot: env.AGDF_DATA_DIR, builtPluginRoot: pluginRoot, expectedVersion: version });
  published.commit();
  const source = join(transitionTarget, 'candidate'); cpSync(pluginRoot, source, { recursive: true });
  writeFileSync(join(source, 'LICENSE'), readFileSync(join(source, 'LICENSE'), 'utf8') + '\n');
  const replacement = prepareLocalMarketplace({ dataRoot: env.AGDF_DATA_DIR, builtPluginRoot: source, expectedVersion: version });
  replacement.commit({ retainCockpitRollbackFor: transitionTarget });
  const dir = join(transitionTarget, '.agdf/control/artefacts/service-fixture'); mkdirSync(dir, { recursive: true });
  const raw = join(dir, 'synthetic-observation.txt'); writeFileSync(raw, 'Synthetic service test; no native host observed.\n');
  const record = { schema_version: 1, kind: 'cockpit_transition', surface: 'codex', result: 'qualified',
    authorizes: false, assurance: 'cooperative_local', target_id: resolveControlCommandTarget(transitionTarget).target_id,
    config_path: path, config_digest: hash(original), section_digest: hash(original),
    plugin_root: replacement.pluginRoot, plugin_digest: 'sha256:' + replacement.sourceDigest,
    previous_plugin_digest: 'sha256:' + published.sourceDigest, previous_plugin_version: version,
    ...(legacyId === 'agdf-cockpit' ? { isolated_qualification: { isolated: true,
      target_id: resolveControlCommandTarget(transitionTarget).target_id,
      plugin_digest: 'sha256:' + replacement.sourceDigest, context_id: 'synthetic-isolated-context' } } : {}),
    runtime_root: runtime.root, version, legacy_id: legacyId,
    server_digest: 'sha256:' + runtime.digest, dispatcher_digest: 'sha256:' + runtime.dispatcherDigest,
    sdk_digest: 'sha256:' + runtime.sdkDigest,
    ui_digest: hash(readFileSync(join(runtime.packageRoot, 'ui/cockpit.html'))),
    host: { name: 'synthetic-fixture', version: 'fixture', session_id: 'fixture', os: process.platform, arch: process.arch },
    observations: ['discovery', 'ui_initialize', 'render', 'interaction', 'provider_attribution', 'teardown'],
    inventory: { complete: true, origins: [...evidence.inventory.origins,
      { path: join(replacement.pluginRoot, 'mcp.json'), digest: hash(readFileSync(join(replacement.pluginRoot, 'mcp.json'))) }] },
    providers: [{ origin: replacement.pluginRoot, server_id: 'agdf-cockpit', connection_id: 'fixture-plugin',
      tools: ['agdf_cockpit', 'agdf_cockpit_read'], exposed_tools: { agdf_cockpit: 'fixture.render', agdf_cockpit_read: 'fixture.read' } }],
    evidence: [{ path: '.agdf/control/artefacts/service-fixture/synthetic-observation.txt', digest: hash(readFileSync(raw)) }] };
  const recordPath = join(dir, 'transition.json'); writeFileSync(recordPath, JSON.stringify(record));
  const invoke = options => runMcpLifecycle({ surface: 'codex', scope: 'project', target: transitionTarget,
    env, cockpitEvidence: recordPath, ...options });
  const foreignSource = join(transitionTarget, 'foreign-source'); cpSync(source, foreignSource, { recursive: true });
  const foreignMain = join(foreignSource, 'mcp/server/src/main.js');
  writeFileSync(foreignMain, readFileSync(foreignMain, 'utf8') + '\n// Different same-version runtime fixture.\n');
  const foreignRuntime = ensurePluginMcpRuntime({ pluginRoot: foreignSource, dataRoot: join(transitionTarget, 'foreign-runtime'), exec: offlineNpm });
  writeFileSync(recordPath, JSON.stringify({ ...record, runtime_root: foreignRuntime.root,
    server_digest: 'sha256:' + foreignRuntime.digest, dispatcher_digest: 'sha256:' + foreignRuntime.dispatcherDigest,
    sdk_digest: 'sha256:' + foreignRuntime.sdkDigest }));
  const rejected = invoke({ action: 'disable', retireCockpit: legacyId });
  assert.equal(rejected.result, 'failed', JSON.stringify(rejected));
  assert.equal(readFileSync(path, 'utf8'), original, 'another valid same-version runtime cannot qualify this plugin');
  writeFileSync(recordPath, JSON.stringify(record));
  const retired = invoke({ action: 'disable', retireCockpit: legacyId });
  assert.equal(retired.result, 'configured_pending_restart', JSON.stringify(retired));
  assert.ok(readFileSync(path, 'utf8').includes('enabled = false'));
  const restored = invoke({ action: 'enable', restoreCockpit: legacyId });
  assert.equal(restored.result, 'configured_pending_restart', JSON.stringify(restored));
  assert.equal(readFileSync(path, 'utf8'), original);
  assert.equal(digestNormalizedPluginSource(published.pluginRoot, version), published.sourceDigest);
  assert.equal(existsSync(replacement.root + '.transaction.json'), false);
  const again = prepareLocalMarketplace({ dataRoot: env.AGDF_DATA_DIR, builtPluginRoot: source, expectedVersion: version });
  again.commit({ retainCockpitRollbackFor: transitionTarget });
  assert.equal(invoke({ action: 'disable', retireCockpit: legacyId }).result, 'configured_pending_restart');
  const finalRecord = { ...record, native_final: true,
    config_digest: hash(readFileSync(path)),
    inventory: { ...record.inventory, origins: record.inventory.origins.map(origin =>
      origin.path === path ? { ...origin, digest: hash(readFileSync(path)) } : origin) },
    observations: [...record.observations, 'normal_context', 'legacy_absent', 'legacy_views_closed', 'legacy_context_clear'] };
  const settle = finalEvidence => settleCodexCockpitPublication({ pluginRoot: again.pluginRoot, target: transitionTarget,
    sourceDigest: again.sourceDigest, action: 'commit', finalEvidence });
  for (const wrong of [{ version: '0.0.0' }, { previous_plugin_digest: hash('wrong prior source') },
    { providers: [...finalRecord.providers, { origin: '/foreign', server_id: legacyId.replaceAll('-', '_'), connection_id: 'foreign',
      tools: [], exposed_tools: {} }] }]) {
    assert.throws(() => settle({ ...finalRecord, ...wrong }), /FINAL_EVIDENCE_REQUIRED/);
    assert.ok(existsSync(again.root + '.backup'));
  }
  assert.equal(settle(finalRecord).status, 'committed');
  assert.equal(existsSync(again.root + '.backup'), false);
  assert.ok(existsSync(runtime.entrypoint), 'final settlement retains the old executable');
  assert.equal(readFileSync(join(env.CODEX_HOME, 'config.toml'), 'utf8'), foreignConfig);
} finally { rmSync(transitionTarget, { recursive: true, force: true }); }


}

// Retain the actual prior plugin publication until native Cockpit cutover is qualified.
const publicationTarget = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-cockpit-publication-')));
try {
  const dataRoot = join(publicationTarget, 'data');
  const first = prepareLocalMarketplace({ dataRoot, builtPluginRoot: pluginRoot, expectedVersion: version });
  first.commit();
  const oldReadme = readFileSync(join(first.pluginRoot, 'LICENSE'), 'utf8');
  const source = join(publicationTarget, 'candidate'); cpSync(pluginRoot, source, { recursive: true });
  writeFileSync(join(source, 'LICENSE'), oldReadme + '\n');
  const next = prepareLocalMarketplace({ dataRoot, builtPluginRoot: source, expectedVersion: version });
  assert.equal(next.changed, true);
  assert.equal(next.commit({ retainCockpitRollbackFor: publicationTarget }).cleanup, 'retained_for_cockpit');
  assert.ok(existsSync(next.root + '.backup'));
  assert.throws(() => prepareLocalMarketplace({ dataRoot, builtPluginRoot: source, expectedVersion: version }), /QUALIFICATION_PENDING/);
  const input = { pluginRoot: next.pluginRoot, target: publicationTarget, sourceDigest: next.sourceDigest,
    previousSourceDigest: first.sourceDigest, action: 'rollback' };
  assert.throws(() => settleCodexCockpitPublication({ ...input, previousSourceDigest: '0'.repeat(64) }), /SETTLEMENT_CONFLICT/);
  assert.throws(() => settleCodexCockpitPublication({ ...input, action: 'commit' }), /FINAL_EVIDENCE_REQUIRED/);
  assert.equal(settleCodexCockpitPublication(input).status, 'restored');
  assert.equal(readFileSync(join(first.pluginRoot, 'LICENSE'), 'utf8'), oldReadme);
  assert.equal(existsSync(next.root + '.backup'), false);
  assert.equal(existsSync(next.root + '.transaction.json'), false);
} finally { rmSync(publicationTarget, { recursive: true, force: true }); }
