import assert from "node:assert/strict";
import { spawn, spawnSync, execFileSync, fork } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { EventEmitter } from 'node:events';
import { planGlobalUninstall, applyLifecyclePlan } from '../lib/lifecycle/operations.js';
import { mcpPackageConstants, acquireMcpExecutableClaim, mcpRuntimeRetirementState } from "../lib/mcp-lifecycle/package.js";
import { ensurePluginMcpRuntime, inspectPluginMcpDataRoot, launchPluginMcpServer, launcherFailureLine, parseLauncherArguments, supervisePluginMcpFacade } from "../lib/mcp-lifecycle/plugin-runtime.js";
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
  assert.equal(prepared.root, join(realpathSync(mcpRoot), 'generations', prepared.publication_id, version));
  assert.ok(existsSync(join(prepared.packageRoot, "bin", "agdf-mcp.js")), "the shipped server is installed");
  assert.ok(existsSync(join(prepared.dispatcherRoot, 'lib/mcp-lifecycle/facade-entry.js')), 'the supervised facade entry must survive the immutable dispatcher projection');
  assert.equal(JSON.parse(readFileSync(join(prepared.dispatcherRoot, "package.json"), "utf8")).name, "create-agdf");
  // Exercise the assembled plugin package, not a fixture copying all source files.
  const { readSkillRuntimeContracts } = await import(pathToFileURL(join(prepared.dispatcherRoot, "lib/cli/contract-command.js")));
  const contracts = readSkillRuntimeContracts("code-review");
  assert.deepEqual(contracts.map(contract => contract.module), ["quality", "context-graph"]);
  assert.ok(contracts.every(contract => contract.content.length > 0 && contract.sha256.length === 64));

  // The Copilot projection resolves contracts from the plugin root after its dispatcher package is
  // moved into an isolated MCP generation under node_modules.
  const copilotPluginRoot = join(pluginRoot, "..", "copilot", "agdf");
  const copilotPrepared = ensurePluginMcpRuntime({
    pluginRoot: copilotPluginRoot,
    dataRoot: join(root, "copilot-data"),
    exec: offlineNpm,
  });
  const coreContractsUrl = pathToFileURL(
    join(copilotPrepared.dispatcherRoot, "runtime", "core", "lib", "resources", "contracts.js")
  ).href;
  const copilotContracts = spawnSync(process.execPath, ["--input-type=module", "--eval", `
    const { readSkillRuntimeContracts } = await import(${JSON.stringify(coreContractsUrl)});
    console.log(JSON.stringify(readSkillRuntimeContracts("brownfield-analysis").map(({ module }) => module)));
  `], {
    encoding: "utf8",
    env: { ...process.env, AGDF_DISPATCH_PLUGIN_ROOT: copilotPluginRoot },
  });
  assert.equal(copilotContracts.status, 0, copilotContracts.stderr);
  assert.deepEqual(JSON.parse(copilotContracts.stdout), ["gate-transition", "modes", "context-graph", "quality"]);
  const artefactTemplatesUrl = pathToFileURL(
    join(copilotPrepared.dispatcherRoot, "runtime", "core", "lib", "resources", "artefact-templates.js")
  ).href;
  const copilotTemplate = spawnSync(process.execPath, ["--input-type=module", "--eval", `
    const { ARTEFACT_TEMPLATE_IDS, resolveArtefactTemplatePath } = await import(${JSON.stringify(artefactTemplatesUrl)});
    console.log(JSON.stringify(Object.values(ARTEFACT_TEMPLATE_IDS).map((id) => resolveArtefactTemplatePath(id))));
  `], {
    encoding: "utf8",
    env: { ...process.env, AGDF_DISPATCH_PLUGIN_ROOT: copilotPluginRoot },
  });
  assert.equal(copilotTemplate.status, 0, copilotTemplate.stderr);
  assert.deepEqual(JSON.parse(copilotTemplate.stdout), [
    "UR.md", "PRD.md", "SD.md", "TP.md", "UX_INTENT_DEFINITION.md",
    "BROWNFIELD_REVIEW.md", "VERIFIED_CHANGE.md", "QA_REPORT.md", "OR.md",
  ].map((name) => join(copilotPluginRoot, "control", "templates", "artefacts", name)));
  const missingPluginRoot = spawnSync(process.execPath, ["--input-type=module", "--eval", `
    const { resources } = await import(${JSON.stringify(pathToFileURL(
      join(copilotPrepared.dispatcherRoot, "runtime", "core", "lib", "resources", "context.js")
    ).href)});
    const { ARTEFACT_TEMPLATE_IDS, resolveArtefactTemplatePath } = await import(${JSON.stringify(artefactTemplatesUrl)});
    if (resources.templatesRoot !== null) process.exit(10);
    try { resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR); process.exit(11); }
    catch (error) { console.log(error.code); }
  `], {
    encoding: "utf8",
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== "AGDF_DISPATCH_PLUGIN_ROOT")),
  });
  assert.equal(missingPluginRoot.status, 0, missingPluginRoot.stderr);
  assert.equal(missingPluginRoot.stdout.trim(), "AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE");
  // Package-shipped templates are authoritative without any environment: the plugin-bundle
  // dispatcher resolves <plugin>/control/templates from its own location.
  const shippedTemplatesUrl = pathToFileURL(
    join(pluginRoot, "runtime", "create-agdf", "runtime", "core", "lib", "resources", "artefact-templates.js")
  ).href;
  const shippedTemplate = spawnSync(process.execPath, ["--input-type=module", "--eval", `
    const { ARTEFACT_TEMPLATE_IDS, resolveArtefactTemplatePath } = await import(${JSON.stringify(shippedTemplatesUrl)});
    console.log(resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR));
  `], {
    encoding: "utf8",
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== "AGDF_DISPATCH_PLUGIN_ROOT")),
  });
  assert.equal(shippedTemplate.status, 0, shippedTemplate.stderr);
  assert.equal(shippedTemplate.stdout.trim(), join(pluginRoot, "control", "templates", "artefacts", "UR.md"));
  // A plugin root whose runtime manifest does not carry this exact version never overlays resources.
  const stalePluginRoot = join(root, "stale-plugin");
  cpSync(copilotPluginRoot, stalePluginRoot, { recursive: true });
  const staleManifestPath = join(stalePluginRoot, "runtime", "runtime-manifest.json");
  writeFileSync(staleManifestPath, JSON.stringify({ ...JSON.parse(readFileSync(staleManifestPath, "utf8")), version: "0.0.0-stale" }));
  for (const untrusted of [stalePluginRoot, "relative/plugin"]) {
    const ignored = spawnSync(process.execPath, ["--input-type=module", "--eval", `
      const { resources } = await import(${JSON.stringify(pathToFileURL(
        join(copilotPrepared.dispatcherRoot, "runtime", "core", "lib", "resources", "context.js")
      ).href)});
      console.log(JSON.stringify(resources.templatesRoot));
    `], { encoding: "utf8", env: { ...process.env, AGDF_DISPATCH_PLUGIN_ROOT: untrusted } });
    assert.equal(ignored.status, 0, ignored.stderr);
    assert.equal(ignored.stdout.trim(), "null", `untrusted plugin root ${untrusted} must not overlay templates`);
  }

  const again = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec() { throw new Error("a matched runtime must not reinstall"); } });
  assert.equal(again.changed, false);

  // A version label or age cannot prove that executable bytes are unused.
  const retired = join(mcpRoot, "0.0.1");
  cpSync(prepared.root, retired, { recursive: true });
  const foreignSibling = join(mcpRoot, "notes");
  mkdirSync(foreignSibling);
  const staleStage = join(mcpRoot, `.stage-${version}-stale`);
  mkdirSync(staleStage);
  const old = new Date(Date.now() - 60 * 60 * 1000);
  utimesSync(staleStage, old, old);
  ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(existsSync(retired), true, "an unclaimed older runtime is retained");
  assert.equal(existsSync(staleStage), true, "age alone cannot remove an unknown stage");
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

  // A drifted previous immutable root is retained and never selected for replacement.
  writeFileSync(join(prepared.packageRoot, "src", "main.js"), "tampered\n");
  npmCalls.length = 0;
  const rebuilt = ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot, exec: offlineNpm });
  assert.equal(rebuilt.changed, false);
  assert.equal(npmCalls.length, 0);
  assert.equal(existsSync(prepared.root), true);
  assert.equal(JSON.parse(readFileSync(join(rebuilt.root, mcpPackageConstants.marker), "utf8")).owner, mcpPackageConstants.owner);

  // A directory without the AGDF marker at the runtime path is never overwritten.
  const foreignData = join(root, "foreign");
  mkdirSync(join(foreignData, "mcp", version), { recursive: true });
  assert.equal(ensurePluginMcpRuntime({ pluginRoot: updateablePluginRoot, dataRoot: foreignData, exec: offlineNpm }).status, 'matched');
  assert.equal(existsSync(join(foreignData, 'mcp', version)), true, 'The legacy foreign path remains untouched.');
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
assert.deepEqual(parseLauncherArguments(['--surface', 'codex', '--data', absolute, '--cockpit']),
  { surface: 'codex', dataRoot: absolute, cockpitMode: 'plugin', prepareOnly: false });
assert.deepEqual(parseLauncherArguments(['--surface', 'codex', '--data', absolute, '--cockpit', '--prepare']),
  { surface: 'codex', dataRoot: absolute, cockpitMode: 'plugin', prepareOnly: true });
for (const args of [['--surface', 'copilot', '--data', absolute, '--cockpit'],
  ['--surface', 'codex', '--data', absolute, '--cockpit', '--cockpit-dir', absolute]]) assert.equal(parseLauncherArguments(args), null);
{
  let observed;
  await launchPluginMcpServer({ pluginRoot, argv: ['--surface', 'codex', '--data', absolute, '--cockpit'], env: {},
    stderr: { write(text) { throw Error(text); } }, ensure: () => ({ status: 'matched' }), acquireClaim() {},
    startFacade(input) { observed = input; } });
  assert.equal(observed.cockpitMode, 'plugin'); assert.equal(observed.cockpitDir, undefined);
}
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
  // The stable launcher supplies the exact owned publication and cockpit root
  // after retaining its executable bytes, before loading the SDK facade.
  let retained = false;
  const runtime = { status: 'matched', version, root: '/synthetic/runtime', changed: false, sdkVerification: 'verified' };
  for (const [argv, cockpitDir] of [[[], undefined], [['--cockpit-dir', project], project]]) {
    retained = false;
    const result = await launchPluginMcpServer({ pluginRoot, argv, env: { CLAUDE_PLUGIN_DATA: '/synthetic/data' },
      stdout: { write() {} }, stderr: { write(text) { throw Error(text); } }, ensure: () => runtime,
      acquireClaim: value => { assert.equal(value, runtime); retained = true; },
      startFacade: async input => { assert.equal(retained, true); assert.equal(input.runtime, runtime);
        assert.equal(input.pluginRoot, pluginRoot);
        assert.equal(input.surface, 'claude'); assert.equal(input.cockpitDir, cockpitDir); return 'owned-facade'; } });
    assert.equal(result, 'owned-facade');
  }
}

// The SDK is installed only as the locked tree shipped with the plugin and must match its expected digest.
{
  const work = mkdtempSync(join(tmpdir(), 'agdf-facade-owner-'));
  const savedExit = process.exitCode;
  try {
    const runtime = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(work, 'data'), exec: offlineNpm });
    const synthetic = join(work, 'synthetic'); mkdirSync(join(synthetic, 'lib/mcp-lifecycle'), { recursive: true });
    writeFileSync(join(synthetic, 'lib/mcp-lifecycle/facade-entry.js'), `
      const {token}=JSON.parse(process.argv[2]); const mode=process.env.AGDF_TEST_FACADE_MODE;
      const end=()=>{process.exitCode=mode==='nonzero'?1:0;process.disconnect();};
      if(mode==='missing')end();else process.send({kind:'facade_closed',token:mode==='wrong'?'wrong':token,confirmed:true},end);
    `);
    for (const mode of ['confirmed', 'contended', 'unknown-lock', 'wrong', 'missing', 'nonzero']) {
      const claim = acquireMcpExecutableClaim(runtime), signals = new EventEmitter();
      let lockOwner;
      if (mode === 'contended') {
        const writer = new URL('../../core/lib/control-state/run-state-writer.js', import.meta.url).href;
        lockOwner = spawn(process.execPath, ['--input-type=module', '--eval', `
          const {withOwnedFileLock}=await import(${JSON.stringify(writer)});
          withOwnedFileLock(${JSON.stringify(join(runtime.root, '..', '.agdf-publication'))},()=>{
            process.send({ready:true}); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,750);
          }); process.disconnect();
        `], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
        await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error('lock_fixture_not_ready')), 3000);
          lockOwner.once('message', () => { clearTimeout(timer); resolve(); }); lockOwner.once('error', reject); });
      }
      const unknownLock = join(runtime.root, '..', '.agdf-publication.lock');
      if (mode === 'unknown-lock') writeFileSync(unknownLock, 'unknown owner fixture');
      const call = supervisePluginMcpFacade({ runtime: { ...runtime, dispatcherRoot: synthetic }, pluginRoot, surface: 'codex',
        env: { ...process.env, AGDF_TEST_FACADE_MODE: mode }, claim, signals });
      if (mode === 'confirmed' || mode === 'contended') {
        assert.equal((await call).confirmed_exit, true);
        assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible');
      } else if (mode === 'unknown-lock') {
        assert.equal((await call).confirmed_exit, true);
        assert.equal(mcpRuntimeRetirementState(runtime.root), 'retained');
        assert.equal(readFileSync(unknownLock, 'utf8'), 'unknown owner fixture', 'unconfirmed publication ownership is never removed');
        rmSync(unknownLock);
      } else {
        await assert.rejects(call, /FACADE_CLOSE_UNCONFIRMED/u);
        assert.equal(mcpRuntimeRetirementState(runtime.root), 'retained', 'an exit without matching acknowledged cleanup never releases executable bytes');
      }
      assert.equal(signals.listenerCount('SIGTERM'), 0); assert.equal(signals.listenerCount('SIGINT'), 0);
      process.exitCode = savedExit;
    }
  } finally { process.exitCode = savedExit; rmSync(work, { recursive: true, force: true }); }
}

// Recovery probes a damaged installed manifest before replacing it. Refuse that
// source before creating a facade or claim, even when a matching SDK is cached.
{
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-stale-facade-start-')));
  const plugin = join(work, 'plugin'), dataRoot = join(work, 'data');
  try {
    cpSync(pluginRoot, plugin, { recursive: true });
    const runtime = ensurePluginMcpRuntime({ pluginRoot: plugin, dataRoot, exec: offlineNpm });
    const manifestPath = join(plugin, 'runtime/runtime-manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    writeFileSync(manifestPath, JSON.stringify({ ...manifest, digest: '0'.repeat(64) }));
    for (const suffix of [[], ['--prepare']]) {
      const result = spawnSync(process.execPath, [join(plugin, 'mcp/agdf-mcp-launch.js'), '--surface', 'codex', '--data', dataRoot, ...suffix],
        { input: '', encoding: 'utf8', timeout: 10000 });
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stderr, /^AGDF_MCP_PLUGIN_RUNTIME_INVALID:/u);
      assert.equal(result.stdout, '');
      assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible', 'failed source admission must create no executable claim');
      assert.equal(existsSync(join(runtime.root, '.agdf-executable-claims')), false);
    }
  } finally { rmSync(work, { recursive: true, force: true }); }
}

// The SDK is installed only as the locked tree shipped with the plugin and must match its expected digest.
for (const mode of ['orderly', 'killed', 'startup-stop', 'startup-killed']) {
  const killed = mode === 'killed' || mode === 'startup-killed';
  // Windows forcibly terminates a child sent SIGTERM; its owner must still
  // close the SDK through the disconnected private channel and prove exit.
  const expectedSignal = killed ? 'SIGKILL' : mode === 'startup-stop' && process.platform === 'win32' ? 'SIGTERM' : null;
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-real-facade-exit-')));
  const dataRoot = join(work, 'data/mcp/codex-plugin');
  let child;
  try {
    const prepared = ensurePluginMcpRuntime({ pluginRoot, dataRoot, exec: offlineNpm });
    await new Promise((resolve, reject) => {
      let pending = '', stderr = '', ready = false;
      const timer = setTimeout(() => { child?.stdin.end(); child?.kill(); reject(Error('facade_test_deadline:' + stderr)); }, 10000);
      child = spawn(process.execPath, [join(pluginRoot, 'mcp/agdf-mcp-launch.js'), '--surface', 'codex', '--data', dataRoot],
        { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
      child.stderr.on('data', bytes => { stderr += bytes; }); child.stdin.on('error', () => {});
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('exit', (code, signal) => { clearTimeout(timer);
        if (!ready || (expectedSignal ? signal !== expectedSignal : code !== 0)) reject(Error('facade_exit:' + stderr));
        else resolve();
      });
      const send = message => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');
      child.stdout.on('data', bytes => { pending += bytes; let at;
        while ((at = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, at); pending = pending.slice(at + 1); let reply;
          try { reply = JSON.parse(line); } catch { continue; }
          if (reply.id === 1 && reply.result) { send({ method: 'notifications/initialized' }); send({ id: 2, method: 'tools/list', params: {} }); }
          if (reply.id === 2 && reply.result?.tools?.some(tool => tool.name === 'agdf_dispatch')) {
            ready = true; if (mode === 'killed') child.kill('SIGKILL'); child.stdin.end();
          }
        }
      });
      if (mode.startsWith('startup-')) {
        // Cancel as soon as the owner acquired its claim, before SDK initialize.
        // An OS signal forwarded to the bootstrapping facade would lose both
        // its cleanup proof and the child's claim; the private message queues.
        void (async () => {
          const claims = join(prepared.root, '.agdf-executable-claims');
          const deadline = performance.now() + 9000;
          while ((!existsSync(claims) || !readdirSync(claims).length) && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10));
          if (!existsSync(claims) || !readdirSync(claims).length) throw Error('startup_claim_not_observed');
          ready = true; child.kill(killed ? 'SIGKILL' : 'SIGTERM'); child.stdin.end();
        })().catch(reject);
      } else send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'owned-exit-regression', version: '1' } } });
    });
    const deadline = performance.now() + 10000;
    while (inspectPluginMcpDataRoot(dataRoot) === 'protected' && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal(inspectPluginMcpDataRoot(dataRoot), 'owned', 'the direct owner must acknowledge and observe facade exit even after its host launcher is killed');
    const plan = planGlobalUninstall('codex', { env: { AGDF_DATA_DIR: join(work, 'data') } });
    assert.equal(applyLifecyclePlan(plan, { exec() {} }).status, 'success');
    assert.equal(existsSync(dataRoot), false, 'the production cleanup owner removes only the now-retirable runtime');
  } finally {
    child?.stdin.end();
    if (!existsSync(dataRoot) || inspectPluginMcpDataRoot(dataRoot) === 'owned') rmSync(work, { recursive: true, force: true });
  }
}

// The SDK is installed only as the locked tree shipped with the plugin and must match its expected digest.
{
  const work = mkdtempSync(join(tmpdir(), 'agdf-owner-deadline-'));
  try {
    const runtime = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(work, 'data'), exec: offlineNpm });
    const input = { runtime, pluginRoot, surface: 'codex', token: 'deadline-fixture', deadline_ns: (process.hrtime.bigint() - 1n).toString() };
    const result = await new Promise((resolve, reject) => {
      const child = fork(join(pluginRoot, 'runtime/create-agdf/lib/mcp-lifecycle/facade-owner-entry.js'), [JSON.stringify(input)],
        { stdio: ['ignore', 'ignore', 'pipe', 'ipc'], execArgv: [] });
      let message; const timer = setTimeout(() => { child.kill(); reject(Error('owner_deadline_fixture_timeout')); }, 10000);
      child.on('message', value => { message = value; }); child.once('error', reject);
      child.once('exit', code => { clearTimeout(timer); resolve({ message, code }); });
    });
    assert.equal(result.code, 1); assert.equal(result.message?.code, 'AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED');
    assert.equal(result.message?.token, input.token);
    assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible', 'a child process never restarts an expired publication allowance or acquires executable claims');
  } finally { rmSync(work, { recursive: true, force: true }); }
}

// The SDK is installed only as the locked tree shipped with the plugin and must match its expected digest.
const sdkRoot = mkdtempSync(join(tmpdir(), "agdf-plugin-mcp-sdk-"));
try {
  const markerOf = (runtime) => JSON.parse(readFileSync(join(runtime.root, mcpPackageConstants.marker), "utf8"));
  const runtimeAt = dataRoot => {
    const generations = join(dataRoot, 'mcp', 'generations');
    return join(generations, readdirSync(generations)[0], version);
  };
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

  // A matching runtime is reused offline; a tampered immutable SDK is refused and retained.
  const reusedRoot = join(sdkRoot, "fresh");
  assert.equal(ensurePluginMcpRuntime({ pluginRoot, dataRoot: reusedRoot, exec() { throw new Error("no npm for a verified runtime"); }, env: {} }).changed, false);
  const zodPackage = join(runtimeAt(reusedRoot), "node_modules", "zod", "package.json");
  writeFileSync(zodPackage, `${readFileSync(zodPackage, "utf8")}\n`);
  npmCalls.length = 0;
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot, dataRoot: reusedRoot, exec: offlineNpm, env: {} }), /AGDF_MCP_IMMUTABLE_RUNTIME_MISMATCH/);
  assert.deepEqual(npmCalls, []);

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
  assert.doesNotMatch(launcherFailureLine('AGDF_PRIVATE_SECRET_CANARY', 'private payload'), /PRIVATE|SECRET|CANARY|payload/);
  assert.match(launcherFailureLine('AGDF_PRIVATE_SECRET_CANARY'), /preparation phase/);
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
    const holdingMarker = join(updateRoot, 'publication-held');
    const launch = (marker) => new Promise((resolveRun, reject) => {
      const child = spawn(process.execPath, [worker, updatedPlugin, dataRoot, ...(marker ? [marker] : [])], { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.once("error", reject);
      child.once("exit", () => resolveRun(JSON.parse(stdout)));
    });
    const owner = launch(holdingMarker);
    const deadline = performance.now() + 30_000;
    while (!existsSync(holdingMarker) && performance.now() < deadline)
      await new Promise(resolve => setTimeout(resolve, 25));
    if (!existsSync(holdingMarker)) {
      await owner;
      assert.fail('publication owner must reach the SDK acquisition barrier');
    }
    // Five contenders start only after the owner holds the lock, and must wait
    // through a preparation longer than the former retry window on every OS.
    const results = await Promise.all([owner, ...Array.from({ length: 5 }, () => launch())]);
    assert.deepEqual(results.filter((row) => row.error), [], JSON.stringify(results));
    assert.equal(ensurePluginMcpRuntime({ pluginRoot: updatedPlugin, dataRoot, exec() { throw new Error("must reuse"); } }).changed, false);
    assert.deepEqual(readdirSync(join(dataRoot, "mcp")).filter((name) => name.startsWith(".")), [], "no retired or staged leftovers");
  } finally { rmSync(updateRoot, { recursive: true, force: true }); }
}

{
  const limitedRoot = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-publication-budget-')));
  let observedTimeout;
  try {
    const started = performance.now();
    assert.throws(() => ensurePluginMcpRuntime({ pluginRoot, dataRoot: limitedRoot,
      // Leave room for real full source proof before this child-focused probe.
      // The production allowance stays 30000ms; short claim arithmetic is separate.
      publicationDeadline: started + 3000, env: {},
      exec(_command, _args, options) {
        observedTimeout = options.timeout;
        assert.ok(observedTimeout > 0 && observedTimeout <= 3000);
        assert.equal(options.killSignal, 'SIGKILL');
        execFileSync(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], options);
      } }), /AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED/);
    assert.ok(observedTimeout > 0, 'The directly owned acquisition child was actually started.');
    assert.ok(performance.now() - started < 5000, 'Real child timeout and confirmed exit remain bounded.');
    for (const generation of readdirSync(join(limitedRoot, 'mcp/generations'))) {
      const entries = readdirSync(join(limitedRoot, 'mcp/generations', generation));
      assert.deepEqual(entries, [], 'No stable, staged or locked package survives failed acquisition.');
    }
  } finally { rmSync(limitedRoot, { recursive: true, force: true }); }
}
console.log("Plugin MCP runtime tests passed");

{
  for (const code of ['AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED', 'AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED', 'AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED']) {
    const stderr = [], sentinel = 'PRIVATE_STACK_CANARY';
    const refused = await launchPluginMcpServer({ pluginRoot, argv: ['--surface', 'codex', '--data', '/owned/data'],
      env: {}, stdout: { write() {} }, stderr: { write(value) { stderr.push(value); } },
      ensure() { return { status: 'matched' }; }, acquireClaim() { throw Error(code + sentinel); } });
    // Unknown exception strings cannot escape the allowlist, including appended private detail.
    assert.equal(refused, null); assert.equal(stderr.length, 1); assert.equal(stderr[0].includes(sentinel), false);
    const exact = [];
    await launchPluginMcpServer({ pluginRoot, argv: ['--surface', 'codex', '--data', '/owned/data'], env: {},
      stdout: { write() {} }, stderr: { write(value) { exact.push(value); } },
      ensure() { return { status: 'matched' }; }, acquireClaim() { throw Error(code); } });
    assert.ok(exact[0].startsWith(code + ': ')); assert.equal(exact[0].includes('Reinstall'), false);
    process.exitCode = 0;
  }
}
