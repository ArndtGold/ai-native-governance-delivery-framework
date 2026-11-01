import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { plannedFixture, clarifiedUr } from './planned-fixtures.js';
import { mutatePlannedUr, plannedTextDigest } from '../lib/control-state/planned-entry.js';
import { createRunFromPlanned } from '../lib/control-state/planned-handoff.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { projectCockpitList } from '../lib/control-inspect/cockpit-list.js';
import { treeBytes } from './control-cockpit-fixtures.js';

const create = (root, title, priority) => mutatePlannedUr(root, { kind: 'planned_ur.create', operation_id: randomUUID(),
  expected_digest: null, content: clarifiedUr.replace('Independent work', title), priority }).entry;
test('SCN-010/011/026: genuine new-layout cockpit derives counts/order/per-entry sources without a backlog; selected planned UR is read-only and snapshot-bound', t => {
  const root = plannedFixture(t), beta = create(root, 'Beta', 'high'), alpha = create(root, 'Alpha', 'high');
  const before = treeBytes(root), reader = createCockpitReader(root), overview = reader.snapshot();
  assert.equal(overview.state, 'available', JSON.stringify(overview)); assert.equal(overview.data.layout, 'planned-urs-v1');
  assert.equal(overview.data.counts['Planned / Parking Lot'], 2); assert.equal(overview.data.counts['Active Backlog'], 1);
  const list = projectCockpitList(overview.data, { section: 'Planned / Parking Lot' });
  assert.deepEqual(list.rows.map(row => row.entry.key), [alpha.plan_id, beta.plan_id]);
  assert.equal(list.rows[0].provenance.path, alpha.path); assert.equal(list.rows[0].provenance.digest, alpha.digest);
  assert.throws(() => reader.planned(randomUUID(), overview.snapshot_id), /resource_denied/u);
  const selected = reader.planned(list.rows[0].entry.row_id, overview.snapshot_id);
  assert.equal(selected.data.kind, 'planned'); assert.equal(selected.data.entry.content, alpha.content);
  assert.equal(selected.data.entry.authorizes, false); assert.deepEqual(treeBytes(root), before);
  writeFileSync(join(root, beta.path), beta.content + '\nChanged source.\n');
  assert.throws(() => reader.planned(list.rows[0].entry.row_id, overview.snapshot_id), /source_changed/u);
  assert.equal(existsSync(join(root, '.agdf/control/MASTER_BACKLOG.md')), false);
});
test('SCN-026: production MCP cockpit session restricts planned selectors to the current overview; handoff becomes one Run reference', async t => {
  const root = plannedFixture(t, []), entry = create(root, 'Selected need', 'normal');
  const service = createCockpitSessionService(root); t.after(() => service.close());
  const session_id = (await service.render())._meta.agdf_cockpit.session_id;
  const call = input => service.read({ session_id, ...input });
  const overview = await call({ operation: 'snapshot' }), row = overview.data.entries[0];
  const document = await call({ operation: 'planned', snapshot_id: overview.snapshot_id, row_id: row.row_id });
  assert.equal(document.data.entry.plan_id, entry.plan_id, JSON.stringify(document));
  assert.equal((await call({ operation: 'planned', snapshot_id: overview.snapshot_id, row_id: randomUUID() })).code, 'resource_denied');
  const result = createRunFromPlanned(root, { plan_id: entry.plan_id, expected_digest: entry.digest,
    target_id: resolveControlCommandTarget(root).target_id, operation_id: randomUUID(), request_digest: plannedTextDigest('deliberate handoff') });
  const fresh = await call({ operation: 'snapshot' });
  assert.equal(fresh.data.entries.length, 1); assert.equal(fresh.data.entries[0].kind, 'run');
  assert.equal(fresh.data.entries[0].key, result.run_id); assert.equal(fresh.data.planning_references.length, 1);
  assert.equal((await call({ operation: 'planned', snapshot_id: fresh.snapshot_id, row_id: row.row_id })).code, 'resource_denied');
});
