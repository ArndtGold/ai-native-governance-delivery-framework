import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { treeBytes } from './control-cockpit-fixtures.js';
import { inspectControlCompatibility, assertControlCompatibility } from '../lib/control-maintenance/compatibility.js';
import { runControlMaintenance } from '../lib/control-maintenance/service.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
for (const layout of [null, 'master-backlog-v1', 'planned-urs-v1', 'future-layout']) test(`compatibility: unsupported layout ${layout} is read-only and has no migration result`, async t => {
  const f = currentFixture(t), path = join(f.root, '.agdf/control/config.json'), config = JSON.parse(readFileSync(path, 'utf8'));
  if (layout === null) delete config.control_layout; else config.control_layout = layout;
  writeFileSync(path, JSON.stringify(config)); const before = treeBytes(f.root);
  const report = assertControlCompatibility(inspectControlCompatibility(f.root));
  assert.equal(report.status, 'unsupported'); assert.deepEqual(report.supported_control_state_versions, [4]); assert.deepEqual(report.changes, []); assert.equal(report.authorizes, false);
  const maintenance = await runControlMaintenance(f.root); assert.equal(maintenance.operation, 'inspect'); assert.equal(maintenance.maintenance_outcome, 'not_started');
  assert.equal(maintenance.compatibility.status, 'unsupported'); assert.deepEqual(treeBytes(f.root), before);
  await assert.rejects(runControlMaintenance(f.root, { guided: true }), /MIGRATION_UNSUPPORTED/); assert.deepEqual(treeBytes(f.root), before);
});
for (const version of [2, 3, 5]) test(`compatibility: unsupported Run ${version} remains distinct from corrupt current state`, t => {
  const f = currentFixture(t), run = currentRun(f); writeFileSync(run.path, run.content().replace('control_state_version: 4', 'control_state_version: ' + version));
  const before = treeBytes(f.root), report = inspectControlCompatibility(f.root);
  assert.equal(report.status, 'unsupported'); assert.equal(report.runs[0].status, 'unsupported'); assert.deepEqual(treeBytes(f.root), before);
});
test('compatibility: current, historical and corrupt observations preserve every source', t => {
  const f = currentFixture(t), run = currentRun(f); assert.equal(inspectControlCompatibility(f.root).status, 'current');
  writeFileSync(run.path, sealRunState(f.root, run.content().replace('lifecycle: active', 'lifecycle: abandoned')));
  const ended = treeBytes(f.root), historical = inspectControlCompatibility(f.root); assert.equal(historical.status, 'current'); assert.equal(historical.runs[0].status, 'historical'); assert.deepEqual(treeBytes(f.root), ended);
  writeFileSync(run.path, run.content().replace(/^- owner:.*$/mu, '- owner: Foreign edited owner'));
  const before = treeBytes(f.root), corrupt = inspectControlCompatibility(f.root); assert.equal(corrupt.status, 'repair_required'); assert.equal(corrupt.runs[0].status, 'repair_required'); assert.deepEqual(treeBytes(f.root), before);
});
test('compatibility: uninitialized and foreign partial targets stay absent or unconfirmed without fill', t => {
  const f = currentFixture(t, { initialize: false }); assert.equal(inspectControlCompatibility(f.root).status, 'absent');
  mkdirSync(join(f.root, '.agdf/control'), { recursive: true }); writeFileSync(join(f.root, '.agdf/control/README.md'), 'Foreign original bytes.\n');
  const before = treeBytes(f.root); assert.equal(inspectControlCompatibility(f.root).status, 'repair_required'); assert.deepEqual(treeBytes(f.root), before);
});
