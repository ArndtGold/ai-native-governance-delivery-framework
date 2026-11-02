import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { commandFixture } from './support/control-command-fixture.js';
import { createDispatchBinding } from '../packages/core/lib/skill-dispatch/binding.js';
import { runControlMaintenance } from '../packages/core/lib/control-maintenance/service.js';
import { inspectStartupCompatibility, startupMaintenanceInvocation } from '../packages/cli/lib/control-maintenance/startup.js';
const fixture = commandFixture();
try {
  const before = readFileSync(fixture.runPath, 'utf8');
  const input = { validator: fixture.runPath, surface: 'codex', expectedVersion: '0.14.5', requestActivation: { owner: 'request_activation_contract', policy_version: 1, guard_fingerprint: `sha256:${'a'.repeat(64)}` } };
  assert.throws(() => createDispatchBinding(input), /runtime_unavailable/u);
  assert.throws(() => createDispatchBinding(input, { probe() { return { executable: '/untrusted/node', environment: { HOME: '/foreign' } }; } }), /invalid_dispatch_binding/u);
  assert.throws(() => createDispatchBinding(input, { probe() { return { executable: 'relative-node', environment: {} }; } }), /invalid_dispatch_binding/u);
  const binding = createDispatchBinding(input, { probe() { return { executable: process.execPath, environment: {} }; } });
  assert.equal(binding.authorizes, false);
  const report = await runControlMaintenance(fixture.root);
  const startup = { target: fixture.root, executable: process.execPath, validator: fixture.runPath, env: {}, deadline: 100, now: () => 10 };
  const observed = inspectStartupCompatibility({ ...startup, run(executable, argv, options) {
    assert.equal(executable, process.execPath);
    assert.deepEqual(argv, [fixture.runPath, 'control-maintenance', '--dir', fixture.root, '--json']);
    assert.equal(options.timeout, 90);
    return { status: 2, stdout: JSON.stringify(report) };
  } });
  assert.equal(observed.inspection_state, 'complete'); assert.equal(observed.authorizes, false);
  for (const invalid of [{ ...report, authorizes: true }, { ...report, target: '/foreign' }, { ...report, operation: 'guided' }, { ...report, maintenance_outcome: 'applied' }]) {
    assert.equal(inspectStartupCompatibility({ ...startup, run: () => ({ status: 0, stdout: JSON.stringify(invalid) }) }).inspection_state, 'unavailable');
  }
  assert.equal(inspectStartupCompatibility({ ...startup, deadline: 0, run: () => assert.fail('expired startup must not spawn') }).inspection_state, 'unavailable');
  assert.equal(inspectStartupCompatibility({ ...startup, run: () => { throw Error('probe failed'); } }).inspection_state, 'unavailable');
  assert.equal(startupMaintenanceInvocation({ target: fixture.root, status: 'current' }, startup), null);
  assert.deepEqual(startupMaintenanceInvocation({ target: fixture.root, status: 'repair_required' }, { ...startup, language: 'de' }).argv, [fixture.runPath, 'control-maintenance', '--dir', fixture.root, '--language', 'de']);
  console.log('CLI startup provider validates fixed argv/deadline/target, remains read-only and rejects altered authority or maintenance results.');
  assert.equal(readFileSync(fixture.runPath, 'utf8'), before);
  await assert.rejects(runControlMaintenance(fixture.root, { guided: true }), /MIGRATION_UNSUPPORTED/);
  assert.equal(readFileSync(fixture.runPath, 'utf8'), before);
  console.log('Read-only compatibility and fixed provider invocations retain source bytes and grant no migration, recovery reset or approval.');
} finally { fixture.cleanup(); }
