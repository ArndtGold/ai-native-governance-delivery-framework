import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { readWorkInventory, readPlannedInventory } from '../lib/control-state/planned-inventory.js';
import { readRunInventory } from '../lib/control-state/run-inventory-reader.js';
import { treeBytes } from './control-cockpit-fixtures.js';
for (const version of ['2', '3', '99']) test(`current parser refuses unsupported Run ${version} without changing original bytes`, t => {
  const f = currentFixture(t), run = currentRun(f), old = run.content().replace('control_state_version: 4', 'control_state_version: ' + version);
  writeFileSync(run.path, old); const before = treeBytes(f.root), parsed = parseRunState(old, run.id);
  assert.equal(parsed.valid, false); assert(parsed.findings.some(row => row.code === 'AGDF_RUN_VERSION_UNSUPPORTED'));
  const inventory = readWorkInventory(f.root); assert.equal(inventory.state, 'partial');
  assert(inventory.findings.some(row => row.code === 'AGDF_RUN_VERSION_UNSUPPORTED'));
  assert.deepEqual(treeBytes(f.root), before);
});
for (const layout of ['master-backlog-v1', 'planned-urs-v1']) test(`unsupported layout ${layout} never becomes an empty successful inventory`, t => {
  const f = currentFixture(t), path = join(f.root, '.agdf/control/config.json');
  writeFileSync(path, JSON.stringify({ control_layout: layout })); const before = treeBytes(f.root), inventory = readWorkInventory(f.root);
  assert.equal(inventory.state, 'unavailable'); assert(inventory.findings.some(row => row.code === 'AGDF_CONTROL_LAYOUT_UNSUPPORTED'));
  assert.deepEqual(treeBytes(f.root), before);
});
for (const name of ['runs', 'planned']) test(`missing current ${name} container stays unavailable/incomplete and is never re-created by reading`, t => {
  const f = currentFixture(t), path = join(f.root, '.agdf/control', name), held = path + '-held';
  renameSync(path, held); const before = treeBytes(f.root);
  if (name === 'runs') {
    const runs = readRunInventory(f.root); assert.equal(runs.state, 'incomplete'); assert.equal(runs.findings[0].code, 'AGDF_RUN_STORE_MISSING');
    assert.equal(readWorkInventory(f.root).state, 'partial');
  } else {
    const planned = readPlannedInventory(f.root); assert.equal(planned.state, 'unavailable'); assert.equal(planned.findings[0].code, 'AGDF_PLANNED_STORE_MISSING');
    assert.equal(readWorkInventory(f.root).state, 'unavailable');
  }
  assert.equal(existsSync(path), false); assert.deepEqual(treeBytes(f.root), before); renameSync(held, path);
  assert.equal(readWorkInventory(f.root).state, 'complete');
});
