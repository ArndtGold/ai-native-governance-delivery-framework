import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runMcpLifecycle } from '../lib/mcp-lifecycle/service.js';
import { renderMcpLifecycleText } from '../lib/mcp-lifecycle/presentation.js';
import { join, dirname } from 'node:path';
import { withOwnedFileLock } from '#agdf-core/control-state/run-state-writer.js';
import { tmpdir } from 'node:os';
import { acquireMcpExecutableClaim, createMcpRuntimeRetirementTransaction, mcpRuntimeRetirementState } from '../lib/mcp-lifecycle/package.js';
import { ensurePluginMcpRuntime, inspectPluginMcpDataRoot } from '../lib/mcp-lifecycle/plugin-runtime.js';
import { offlineNpm, pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-immutable-runtime-retention-'));
try {
  const source = join(root, 'source'); cpSync(pluginRoot, source, { recursive: true });
  const dataRoot = join(root, 'data');
  const runtime = ensurePluginMcpRuntime({ pluginRoot: source, dataRoot, exec: offlineNpm });
  const selectedTarget = realpathSync(root), testEnv = { CODEX_HOME: join(root, 'empty-user') };
  const roleInput = { surface: 'codex', scope: 'project', target: selectedTarget, role: 'cockpit', serverId: 'agdf-cockpit',
    preparedRuntime: runtime, env: testEnv, exec: (command, args) => args[0] === '--version' ? 'codex 1.0.0' : '{}' };
  const enabledRole = runMcpLifecycle({ ...roleInput, action: 'enable' });
  assert.equal(enabledRole.result, 'configured_pending_restart');
  assert.equal(runMcpLifecycle({ ...roleInput, action: 'enable' }).result, 'unchanged');
  for (const language of ['en', 'de', 'fr-CA']) {
    const text = renderMcpLifecycleText(enabledRole, { language });
    assert.ok(text.includes('AGDF'));
    assert.equal(text.includes('undefined'), false);
  }
  assert.equal(runMcpLifecycle({ ...roleInput, action: 'disable' }).result, 'disabled');
  assert.equal(runMcpLifecycle({ ...roleInput, action: 'disable' }).result, 'unchanged');
  assert.equal(runMcpLifecycle({ ...roleInput, action: 'enable' }).result, 'configured_pending_restart');
  const nextSource = join(root, 'role-update-source'); cpSync(source, nextSource, { recursive: true });
  writeFileSync(join(nextSource, 'mcp/server/README.md'), readFileSync(join(nextSource, 'mcp/server/README.md'), 'utf8') + '\n// scoped synthetic update\n');
  const nextRoleRuntime = ensurePluginMcpRuntime({ pluginRoot: nextSource, dataRoot, exec: offlineNpm });
  assert.notEqual(nextRoleRuntime.root, runtime.root);
  const updatedRole = { ...roleInput, preparedRuntime: nextRoleRuntime };
  assert.equal(runMcpLifecycle({ ...updatedRole, action: 'enable' }).result, 'configured_pending_restart');
  assert.ok(existsSync(runtime.entrypoint), 'Same-ID update retains the old client executable generation.');
  assert.equal(runMcpLifecycle({ ...updatedRole, action: 'disable' }).result, 'disabled');
  const wrapper = join(selectedTarget, 'owned-probe.mjs'); writeFileSync(wrapper, '// deliberately prepared test entry\n');
  const configPath = join(selectedTarget, '.codex/config.toml');
  const configExisted = existsSync(configPath), configBytes = configExisted ? readFileSync(configPath) : '';
  const descriptor = { owner: 'create-agdf:mcp-runtime', role: 'diagnostic', server_id: 'agdf-test-owned',
    target: selectedTarget, runtime_root: runtime.root, command: process.execPath, args: [wrapper], lifetime: 'completion_or_abort',
    configuration: { path: configPath, scope: 'project', existed: configExisted, digest: 'sha256:' + createHash('sha256').update(configBytes).digest('hex') },
    sources: [{ path: wrapper, digest: 'sha256:' + createHash('sha256').update(readFileSync(wrapper)).digest('hex') }] };
  const diagnostic = { ...roleInput, role: 'diagnostic', serverId: descriptor.server_id, descriptor };
  for (const end of ['completion', 'abort']) {
    assert.equal(runMcpLifecycle({ ...diagnostic, action: 'enable' }).result, 'configured_pending_restart');
    assert.equal(runMcpLifecycle({ ...diagnostic, action: 'enable' }).result, 'unchanged');
    assert.equal(runMcpLifecycle({ ...diagnostic, action: 'disable' }).result, 'disabled', end);
    assert.equal(runMcpLifecycle({ ...diagnostic, action: 'disable' }).result, 'unchanged');
  }
  writeFileSync(wrapper, '// changed foreign wrapper\n');
  assert.throws(() => runMcpLifecycle({ ...diagnostic, action: 'enable' }), /DIAGNOSTIC_OWNERSHIP_INVALID/);
  assert.equal(runtime.immutable, true); assert.match(runtime.publication_id, /^[0-9a-f]{64}$/u);
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible');
  const publication = join(dirname(runtime.root), '.agdf-publication');
  for (const budget of [5_550, 300]) {
    let elapsed = 0;
    withOwnedFileLock(publication, () => {
      assert.throws(() => acquireMcpExecutableClaim(runtime, { clock: () => elapsed, publicationDeadline: budget,
        wait: ms => { elapsed += ms; } }), /AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED/u);
      assert.equal(elapsed, budget, 'Claim wait uses the smaller remaining publication budget.');
    });
  }
  writeFileSync(publication + '.lock', '{');
  assert.throws(() => acquireMcpExecutableClaim(runtime), /AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED/u);
  assert.equal(readFileSync(publication + '.lock', 'utf8'), '{');
  rmSync(publication + '.lock');
  const barrier = join(root, 'claim-barrier');
  const coreWriter = new URL('../../core/lib/control-state/run-state-writer.js', import.meta.url).href;
  const holder = spawn(process.execPath, ['--input-type=module', '--eval',
    `import {withOwnedFileLock} from ${JSON.stringify(coreWriter)}; import {writeFileSync} from 'node:fs';
     withOwnedFileLock(${JSON.stringify(publication)}, () => { writeFileSync(${JSON.stringify(barrier)}, 'held'); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 450); });`], { stdio: 'ignore' });
  const holderEnded = once(holder, 'exit');
  const barrierDeadline = performance.now() + 5000;
  while (!existsSync(barrier) && performance.now() < barrierDeadline) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
  assert.ok(existsSync(barrier), 'Real directly owned publisher acquired the lock.');
  const contended = acquireMcpExecutableClaim(runtime); contended.bindOwnedChild(holder);
  await holderEnded;
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible');
  const first = acquireMcpExecutableClaim(runtime), second = acquireMcpExecutableClaim(runtime);
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'retained');
  assert.equal(inspectPluginMcpDataRoot(dataRoot), 'protected');
  assert.throws(() => createMcpRuntimeRetirementTransaction(runtime).apply(), /AGDF_MCP_RUNTIME_RETAINED/u);
  const child1 = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30)']); first.bindOwnedChild(child1);
  await once(child1, 'exit');
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'retained', 'Another connection still owns its claim.');
  const child2 = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 30)']); second.bindOwnedChild(child2);
  await once(child2, 'exit');
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'eligible', 'Only actual directly owned process exits release both claims.');
  const claimDir = join(runtime.root, '.agdf-executable-claims');
  writeFileSync(join(claimDir, 'uncertain.json'), '{');
  assert.equal(mcpRuntimeRetirementState(runtime.root), 'retained');
  rmSync(join(claimDir, 'uncertain.json'));
  const retirement = createMcpRuntimeRetirementTransaction(runtime);
  retirement.apply(); assert.equal(existsSync(runtime.root), false);
  retirement.rollback(); assert.equal(existsSync(runtime.entrypoint), true);
  const changed = join(source, 'runtime/create-agdf/runtime/core/lib/skill-dispatch/service.js');
  writeFileSync(changed, readFileSync(changed, 'utf8') + '\n// synthetic next immutable source\n');
  const next = ensurePluginMcpRuntime({ pluginRoot: source, dataRoot, exec: offlineNpm });
  assert.notEqual(next.root, runtime.root); assert.equal(existsSync(runtime.entrypoint), true);
  assert.equal(readdirSync(join(runtime.root, '.agdf-executable-claims')).length, 0);
  writeFileSync(join(next.packageRoot, 'src/main.js'), 'tampered');
  assert.throws(() => ensurePluginMcpRuntime({ pluginRoot: source, dataRoot, exec: offlineNpm }), /AGDF_MCP_IMMUTABLE_RUNTIME_MISMATCH/u);
  assert.equal(existsSync(runtime.entrypoint), true); assert.equal(mcpRuntimeRetirementState(next.root), 'retained');
  const retirementFinal = createMcpRuntimeRetirementTransaction(runtime);
  retirementFinal.apply(); retirementFinal.commit();
  assert.equal(existsSync(retirementFinal.retiredRoot), false, 'Verified empty-claim package retires after its owned rename.');
  const legacySource = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(root, 'legacy-source'), exec: offlineNpm });
  const legacy = join(root, 'legacy'); cpSync(legacySource.root, legacy, { recursive: true });
  const marker = join(legacy, '.agdf-mcp-owned.json'), value = JSON.parse(readFileSync(marker, 'utf8'));
  delete value.executable_retention; writeFileSync(marker, JSON.stringify(value));
  assert.equal(mcpRuntimeRetirementState(legacy), 'retained');
  assert.throws(() => createMcpRuntimeRetirementTransaction({ ...runtime, root: legacy }).apply(), /AGDF_MCP_RUNTIME_RETAINED/u);
  console.log('Immutable same-version publication, pre-spawn retention, two actual child exits, uncertain/legacy preservation and tamper refusal passed; source/process proof only.');
} finally { rmSync(root, { recursive: true, force: true }); }
