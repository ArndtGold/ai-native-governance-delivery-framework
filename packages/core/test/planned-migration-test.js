import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { channel } from 'node:diagnostics_channel';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { sealRunState, runSealState, approvalSeal } from '../lib/control-state/run-seal.js';
import { readRunOperations } from '../lib/control-state/run-operations.js';
import { readControlLayout, withControlMutation, inspectLayoutMaintenance } from '../lib/control-state/control-layout.js';
import { previewPlannedLayout, applyPlannedLayout, recoverPlannedLayout, inspectPlannedLayoutOperation } from '../lib/control-maintenance/planned-layout.js';
import { readPlannedInventory } from '../lib/control-state/planned-inventory.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';

const BACKLOG = '.agdf/control/MASTER_BACKLOG.md';
function fixture(t) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-layout-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  initializeCanonicalControl(root, canonicalInitPlan('en', undefined, { layout: 'master-backlog-v1' }));
  createRun(root, 'first'); createRun(root, 'ended');
  const path = join(root, '.agdf/control/runs/ended/RUN_STATE.md');
  writeFileSync(path, sealRunState(root, readFileSync(path, 'utf8').replace('- lifecycle: active', '- lifecycle: completed')));
  writeFileSync(join(root, BACKLOG), '# Backlog\r\n\r\nProse and history: ä.\r\n\r\n## Active Backlog\r\n\r\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\r\n|---|---|---|---|---|---|---|\r\n| 1 | same-title | Active first | working | [Run](runs/first/RUN_STATE.md) | preserve | do |\r\n| 2 | same-title | Need a plan | unknown | [old](artefacts/missing/UR.md) | retain | clarify |\r\n| urgent! | key | Raw custom priority | unknown | [external](../../elsewhere) | retain | clarify |\r\n\r\n## Custom table\r\n\r\n| Any | Other |\r\n|---|---|\r\n| unknown | must survive |\r\n\r\nMore prose.\r\n');
  return root;
}
function request(root) {
  const preview = previewPlannedLayout(root);
  assert.deepEqual(preview.blockers, []);
  return { preview, input: { operation_id: randomUUID(), preview_digest: preview.preview_digest, confirmation: preview.confirmation } };
}
test('SCN-020: read-only complete preview and lossless explicit migration; active v2 audited, ended v2 unchanged', t => {
  const root = fixture(t), original = readFileSync(join(root, BACKLOG), 'utf8');
  const runPath = '.agdf/control/runs/first/RUN_STATE.md', oldRun = readFileSync(join(root, runPath), 'utf8');
  const endedPath = '.agdf/control/runs/ended/RUN_STATE.md', ended = readFileSync(join(root, endedPath), 'utf8');
  const beforeNames = readdirSync(join(root, '.agdf/control'));
  const { preview, input } = request(root);
  assert.deepEqual(readdirSync(join(root, '.agdf/control')), beforeNames);
  assert.equal(preview.rows.length, 4); assert.equal(preview.rows[0].run_id, 'first');
  assert.equal(preview.entries.length, 2); assert.equal(preview.rows[2].priority_mapping, 'unresolved_normal_placeholder');
  assert.equal(preview.rows[3].action, 'retain_unresolved');
  assert.equal(preview.rows.length + preview.unparsed_spans.reduce((count, span) => count + span.last_line - span.first_line + 1, 0), original.split('\n').length);
  const result = applyPlannedLayout(root, input);
  assert.equal(result.outcome, 'applied'); assert.equal(readControlLayout(root).layout, 'planned-urs-v1');
  assert.equal(existsSync(join(root, BACKLOG)), false);
  const manifest = JSON.parse(readFileSync(join(root, preview.snapshot_root, 'SOURCE_MANIFEST.json'), 'utf8'));
  const source = manifest.sources.find(row => row.path === BACKLOG);
  assert.equal(readFileSync(join(root, preview.snapshot_root, source.snapshot_name), 'utf8'), original);
  const migrated = readFileSync(join(root, runPath), 'utf8');
  assert.equal(parseRunState(migrated).meta.control_state_version, '3');
  assert.equal(runSealState(root, migrated).status, 'valid'); assert.equal(approvalSeal(migrated), approvalSeal(oldRun));
  const receipt = readRunOperations(migrated).receipts.at(-1);
  assert.equal(receipt.kind, 'control_layout.migrate'); assert.equal(readFileSync(join(root, receipt.effect.record.archive.path), 'utf8'), oldRun);
  assert.equal(readFileSync(join(root, endedPath), 'utf8'), ended);
  assert.equal(readPlannedInventory(root).entries.length, 2);
  assert.equal(applyPlannedLayout(root, input).outcome, 'already_applied');
  assert.equal(inspectLayoutMaintenance(root).state, 'none');
});
for (const checkpoint of ['maintenance_frozen', 'migration_intent', 'migration_archived', 'migration_run_published', 'migration_entries_published', 'migration_backlog_retired', 'migration_config_committed', 'migration_receipt', 'migration_retired']) {
  test(`SCN-021: ${checkpoint} interruption recovers exact owned precommit rollback or postcommit completion`, t => {
    const root = fixture(t), { input } = request(root), old = readFileSync(join(root, BACKLOG), 'utf8');
    const runPath = join(root, '.agdf/control/runs/first/RUN_STATE.md'), runOld = readFileSync(runPath, 'utf8');
    assert.throws(() => applyPlannedLayout(root, input, { checkpoint: point => { if (point === checkpoint) throw Error('interrupt'); } }), /interrupt/u);
    assert.throws(() => withControlMutation(root, { resource: 'test' }, () => {}), /MAINTENANCE/u);
    const status = inspectPlannedLayoutOperation(root, input.operation_id);
    const recovered = recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest });
    const committed = ['migration_config_committed', 'migration_receipt', 'migration_retired'].includes(checkpoint);
    assert.equal(recovered.outcome, committed ? 'applied' : 'rolled_back');
    assert.equal(inspectLayoutMaintenance(root).state, 'none');
    if (!committed) { assert.equal(readFileSync(join(root, BACKLOG), 'utf8'), old); assert.equal(readFileSync(runPath, 'utf8'), runOld); }
    else assert.equal(runSealState(root, readFileSync(runPath, 'utf8')).status, 'valid');
  });
}
test('SCN-022: stale preview, legacy pending journal, and foreign bytes are refused without destructive guessing', t => {
  const root = fixture(t), { input } = request(root);
  writeFileSync(join(root, BACKLOG), readFileSync(join(root, BACKLOG), 'utf8') + '\nChanged.\n');
  assert.throws(() => applyPlannedLayout(root, input), /PREVIEW_STALE/u);
  const fresh = request(root);
  assert.throws(() => applyPlannedLayout(root, fresh.input, { checkpoint: point => { if (point === 'migration_entries_published') throw Error('interrupt'); } }), /interrupt/u);
  const path = join(root, fresh.preview.entries[0].path); writeFileSync(path, 'foreign');
  const status = inspectPlannedLayoutOperation(root, fresh.input.operation_id);
  assert.throws(() => recoverPlannedLayout(root, { operation_id: fresh.input.operation_id, pending_digest: status.pending_digest }), /FOREIGN/u);
  assert.equal(readFileSync(path, 'utf8'), 'foreign'); assert.equal(inspectLayoutMaintenance(root).state, 'pending');
});

for (const mutation of ['operation', 'request', 'preview', 'run_path']) {
  test(`SCN-022: ${mutation} journal substitution is refused before archive or foreign lock publication`, t => {
    const root = fixture(t), { input, preview } = request(root);
    assert.throws(() => applyPlannedLayout(root, input, { checkpoint: point => { if (point === 'migration_intent') throw Error('interrupt'); } }), /interrupt/u);
    const pending = join(root, '.agdf/control/maintenance/PLANNED_LAYOUT_TRANSACTION.json');
    const marker = join(root, '.agdf/control/maintenance/PLANNED_LAYOUT_PENDING.json');
    const original = readFileSync(pending, 'utf8'), originalMarker = readFileSync(marker, 'utf8');
    const intent = JSON.parse(original), epoch = JSON.parse(originalMarker);
    if (mutation === 'operation') intent.operation_id = randomUUID();
    if (mutation === 'request') intent.request_digest = digest('foreign request');
    if (mutation === 'preview') intent.report.rows.pop();
    if (mutation === 'run_path') {
      mkdirSync(join(root, 'foreign-control'));
      intent.report.runs.push({ run_id: '../../../foreign-control', path: '.agdf/control/runs/../../../foreign-control/RUN_STATE.md', action: 'retain_v2' });
    }
    if (['preview', 'run_path'].includes(mutation)) {
      const { preview_digest, ...report } = intent.report;
      intent.report.preview_digest = digest(canonicalJson({ ...report, confirmation: null }));
      intent.report.confirmation = `Migrate planned layout: ${intent.report.preview_digest}`;
      // Even a self-consistent replacement epoch may not expand the closed write set.
      if (mutation === 'run_path') { epoch.preview_digest = intent.report.preview_digest; writeFileSync(marker, JSON.stringify(epoch) + '\n'); }
    }
    const tampered = JSON.stringify(intent) + '\n'; writeFileSync(pending, tampered);
    const observed = inspectPlannedLayoutOperation(root, input.operation_id), locks = [];
    const diagnostics = channel('agdf:owned-file-lock'), listener = value => locks.push(value.lock_path);
    diagnostics.subscribe(listener);
    try {
      assert.throws(() => recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: observed.pending_digest }), /JOURNAL_(?:BINDING_)?INVALID/u);
    } finally { diagnostics.unsubscribe(listener); }
    assert.equal(locks.some(path => path.startsWith(join(root, 'foreign-control'))), false);
    assert.equal(existsSync(join(root, preview.snapshot_root)), false);
    assert.equal(readFileSync(pending, 'utf8'), tampered);
    assert.equal(inspectLayoutMaintenance(root).state, 'pending');
    writeFileSync(pending, original); writeFileSync(marker, originalMarker);
    const restored = inspectPlannedLayoutOperation(root, input.operation_id);
    assert.equal(recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: restored.pending_digest }).outcome, 'rolled_back');
  });
}

test('SCN-023/024: legitimate admitted work may finish during drain; an empty stale epoch aborts with a durable original receipt', t => {
  const root = fixture(t), { input } = request(root);
  withControlMutation(root, { resource: 'fixture-admitted-work', operation_id: randomUUID() }, () => {
    assert.throws(() => applyPlannedLayout(root, input), /MUTATIONS_IN_FLIGHT/u);
    createRun(root, 'already-admitted');
  });
  const status = inspectPlannedLayoutOperation(root, input.operation_id);
  const recovered = recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest });
  assert.equal(recovered.outcome, 'rolled_back'); assert.equal(recovered.source_changed, true);
  assert.equal(inspectPlannedLayoutOperation(root, input.operation_id).status, 'recorded');
  assert.equal(existsSync(join(root, '.agdf/control/runs/already-admitted/RUN_STATE.md')), true);
  assert.equal(readControlLayout(root).layout, 'master-backlog-v1');
  const replay = recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest });
  assert.equal(replay.historical_outcome, 'rolled_back'); assert.equal(inspectLayoutMaintenance(root).state, 'none');
});

test('SCN-020/029: genuine unsealed ended v2 remains exact unverified history; an unsealed active v2 still blocks cutover', t => {
  const root = fixture(t), endedPath = join(root, '.agdf/control/runs/ended/RUN_STATE.md');
  const unsealed = readFileSync(endedPath, 'utf8').replace(/^- (?:content_seal|approval_seal):[^\n]*\n/gmu, '');
  writeFileSync(endedPath, unsealed);
  const { preview, input } = request(root);
  assert.equal(preview.runs.find(run => run.run_id === 'ended').trust, 'unverified_history');
  assert.ok(preview.findings.some(row => row.code === 'legacy_unsealed_history_retained'));
  applyPlannedLayout(root, input); assert.equal(readFileSync(endedPath, 'utf8'), unsealed);
  assert.equal(readPlannedInventory(root).entries.every(row => row.coverage !== 'unconfirmed'), true);
  const other = fixture(t), activePath = join(other, '.agdf/control/runs/first/RUN_STATE.md');
  writeFileSync(activePath, readFileSync(activePath, 'utf8').replace(/^- (?:content_seal|approval_seal):[^\n]*\n/gmu, ''));
  assert.ok(previewPlannedLayout(other).blockers.some(row => row.run_id === 'first' && row.code === 'AGDF_LAYOUT_RUN_UNTRUSTED'));
});

for (const interruption of [null, 'migration_entries_published', 'migration_config_committed']) {
  test(`Run-only legacy without Backlog: ${interruption ?? 'apply'} preserves absence and Run history`, t => {
    const root = fixture(t);
    rmSync(join(root, BACKLOG));
    const path = join(root, '.agdf/control/runs/first/RUN_STATE.md'), original = readFileSync(path, 'utf8');
    const { preview, input } = request(root);
    assert.deepEqual(preview.rows, []); assert.deepEqual(preview.entries, []);
    if (interruption) {
      assert.throws(() => applyPlannedLayout(root, input, { checkpoint(point) { if (point === interruption) throw Error('interrupt'); } }), /interrupt/u);
      const status = inspectPlannedLayoutOperation(root, input.operation_id);
      const recovered = recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest });
      assert.equal(recovered.outcome, interruption === 'migration_config_committed' ? 'applied' : 'rolled_back');
      if (recovered.outcome === 'rolled_back') assert.equal(readFileSync(path, 'utf8'), original);
    } else {
      assert.equal(applyPlannedLayout(root, input).outcome, 'applied');
      assert.equal(readControlLayout(root).layout, 'planned-urs-v1');
      const manifest = JSON.parse(readFileSync(join(root, preview.snapshot_root, 'SOURCE_MANIFEST.json'), 'utf8'));
      assert.equal(manifest.sources.some(source => source.path === BACKLOG), false);
      assert.equal(runSealState(root, readFileSync(path, 'utf8')).status, 'valid');
    }
    assert.equal(existsSync(join(root, BACKLOG)), false, 'recovery never invents a missing Backlog');
    assert.equal(inspectLayoutMaintenance(root).state, 'none');
  });
}
test('Run-only migration binds missing Backlog and preserves a later foreign file', t => {
  const root = fixture(t); rmSync(join(root, BACKLOG));
  const { input } = request(root);
  writeFileSync(join(root, BACKLOG), '# Foreign planning\n');
  assert.throws(() => applyPlannedLayout(root, input), /PREVIEW_STALE/u);
  rmSync(join(root, BACKLOG));
  assert.throws(() => applyPlannedLayout(root, input, { checkpoint(point) {
    if (point === 'migration_intent') { writeFileSync(join(root, BACKLOG), '# Foreign planning\n'); throw Error('interrupt'); }
  } }), /interrupt/u);
  const status = inspectPlannedLayoutOperation(root, input.operation_id);
  assert.throws(() => recoverPlannedLayout(root, { operation_id: input.operation_id, pending_digest: status.pending_digest }), /FOREIGN/u);
  assert.equal(readFileSync(join(root, BACKLOG), 'utf8'), '# Foreign planning\n');
  assert.equal(inspectLayoutMaintenance(root).state, 'pending');
});
