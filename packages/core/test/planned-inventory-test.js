import { boundMutatePlannedUr as mutatePlannedUr, boundCreateRunFromPlanned as createRunFromPlanned } from './planned-fixtures.js';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import { symlinkOrSkip } from './control-cockpit-fixtures.js';
import { join } from 'node:path';
import { plannedFixture, clarifiedUr } from './planned-fixtures.js';
import { plannedTextDigest } from '../lib/control-state/planned-entry.js';
import { readPlannedInventory, readWorkInventory } from '../lib/control-state/planned-inventory.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';

function planned(root, title, priority = 'normal') {
  return mutatePlannedUr(root, { kind: 'planned_ur.create', operation_id: randomUUID(), expected_digest: null, priority,
    content: clarifiedUr.replace('# UR: Independent work', `# UR: ${title}`) }).entry;
}
test('SCN-010/011: priority/title/id ordering and combined Run references are derived, read-only and nonduplicating', t => {
  const root = plannedFixture(t, ['existing']), low = planned(root, 'First by title', 'low'), b = planned(root, 'Beta', 'high'), a = planned(root, 'Alpha', 'high');
  const before = readdirSync(join(root, '.agdf/control/planned')).sort();
  const inventory = readPlannedInventory(root);
  assert.equal(inventory.state, 'complete', JSON.stringify(inventory));
  assert.deepEqual(inventory.entries.map(row => row.plan_id), [a.plan_id, b.plan_id, low.plan_id]);
  const handed = createRunFromPlanned(root, { plan_id: a.plan_id, expected_digest: a.digest, operation_id: randomUUID(),
    target_id: resolveControlCommandTarget(root).target_id, request_digest: plannedTextDigest('selected source') });
  const combined = readWorkInventory(root);
  assert.equal(combined.state, 'complete', JSON.stringify(combined));
  assert.equal(combined.entries.filter(row => row.kind === 'planned').length, 2);
  assert.equal(combined.entries.filter(row => row.kind === 'run').length, 2);
  assert.equal(combined.planning_references.length, 1);
  assert.equal(combined.planning_references[0].run_id, handed.run_id);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/planned')).sort(), before);
  assert.equal(combined.authorizes, false);
});
test('SCN-011: malformed or denied entry is partial; valid entries and Runs remain visible', t => {
  const root = plannedFixture(t, ['existing']), good = planned(root, 'Valid need');
  mkdirSync(join(root, '.agdf/control/planned/broken')); writeFileSync(join(root, '.agdf/control/planned/broken/UR.md'), '# Incomplete metadata\n');
  const linked = symlinkOrSkip(root, join(root, '.agdf/control/planned/foreign'), undefined, process.platform === 'win32' ? 'junction' : 'dir');
  const inventory = readWorkInventory(root);
  assert.equal(inventory.state, 'partial', JSON.stringify(inventory));
  assert.ok(inventory.entries.some(row => row.plan_id === good.plan_id && row.coverage === 'ready'));
  assert.equal(inventory.entries.filter(row => row.coverage === 'unavailable').length, linked ? 2 : 1);
  assert.ok(inventory.entries.some(row => row.run_id === 'existing'));
});
test('SCN-011: an empty planned store is distinct from an unreadable store', t => {
  const root = plannedFixture(t, []);
  assert.equal(readPlannedInventory(root).state, 'complete');
  rmSync(join(root, '.agdf/control/planned'), { recursive: true });
  writeFileSync(join(root, '.agdf/control/planned'), 'not a directory');
  assert.equal(readPlannedInventory(root).state, 'unavailable');
});
