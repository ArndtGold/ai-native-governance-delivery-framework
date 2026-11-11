import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fixture } from './control-cockpit-fixtures.js';
import { projectCockpitWork } from '../lib/control-inspect/cockpit-work.js';
import { projectCockpitList } from '../lib/control-inspect/cockpit-list.js';

test('inventory provides the UR title, objective, activity and verified seal without rewriting the run', t => {
  const f = fixture(); t.after(() => f.close());
  const before = readFileSync(f.runPath, 'utf8');
  const inventory = projectCockpitWork(f.root).data;
  const row = inventory.entries.find(entry => entry.key === 'fixture-a');
  assert.equal(row.title, 'Fixture document');
  assert.equal(row.title_source, 'ur');
  assert.equal(typeof row.objective, 'string');
  assert.equal(row.seal, 'valid');
  assert.equal(row.lifecycle, 'active');
  assert.ok(['decision_required', 'clarification_required', 'blocked', 'in_progress', 'unclear', 'none'].includes(row.attention_code));
  assert.ok(row.last_activity.at);
  assert.equal(projectCockpitList(inventory, { query: 'Fixture document' }).rows.length, 1);
  assert.equal(readFileSync(f.runPath, 'utf8'), before);
  const ur = join(f.root, f.documentPath);
  writeFileSync(ur, readFileSync(ur, 'utf8') + '\nChanged outside the recorded operation.\n');
  const changed = projectCockpitWork(f.root).data.entries.find(entry => entry.key === 'fixture-a');
  assert.equal(changed.seal, 'invalid');
  unlinkSync(ur);
  const missing = projectCockpitWork(f.root).data.entries.find(entry => entry.key === 'fixture-a');
  assert.equal(missing.title, 'fixture-a');
  assert.equal(missing.title_source, 'run_id');
  assert.notEqual(missing.seal, 'valid');
});

test('runs combine active and completed sections without hiding a partial source', t => {
  const f = fixture(); t.after(() => f.close());
  const inventory = projectCockpitWork(f.root).data;
  const runs = projectCockpitList(inventory, { section: 'runs' });
  assert.deepEqual(new Set(runs.rows.map(row => row.entry.key)), new Set(['fixture-a', 'fixture-completed']));
  inventory.diagnostics.push({ code: 'work_section_unavailable', section: 'active' });
  const partial = projectCockpitList(inventory, { section: 'runs' });
  assert.equal(partial.coverage, 'partial');
  assert.deepEqual(partial.rows.map(row => row.entry.key), ['fixture-completed']);
});

test('overview uses the same evaluated situation as selected detail', async t => {
  const { createCockpitReader } = await import('../lib/control-inspect/cockpit.js');
  const { projectWorkSituation } = await import('../lib/control-inspect/work-situation.js');
  const f = fixture(); t.after(() => f.close());
  const before = readFileSync(f.runPath, 'utf8');
  const row = projectCockpitWork(f.root).data.entries.find(entry => entry.key === 'fixture-a');
  const detail = createCockpitReader(f.root).snapshot('fixture-a').data.run;
  const e = detail.evaluation;
  const situation = projectWorkSituation({ assessment: e.control_assessment.state, gate: e.current_gate,
    blockingReason: e.blocking_reason, missingApproval: e.missing_approval, closureOutcome: detail.closure?.outcome });
  assert.equal(row.stored_status, situation.de);
  assert.equal(row.attention_code, situation.code);
  assert.equal(readFileSync(f.runPath, 'utf8'), before);
});

test('one situation projection handles work, approval, revision and uncertain sources', async () => {
  const { projectWorkSituation } = await import('../lib/control-inspect/work-situation.js');
  const cases = [
    [{ assessment: 'open', gate: 'CD+Tests' }, 'In Umsetzung', 'in_progress'],
    [{ assessment: 'open', gate: 'TP' }, 'Weiterarbeit offen', 'in_progress'],
    [{ assessment: 'blocked', gate: 'TP', blockingReason: 'none', missingApproval: 'Approval: TP' }, 'Freigabe erforderlich', 'decision_required'],
    [{ assessment: 'blocked', gate: 'UR', blockingReason: 'AGDF_UR_REQUIREMENTS_INCOMPLETE' }, 'Klärung erforderlich', 'clarification_required'],
    [{ assessment: 'blocked', gate: 'PRD', blockingReason: 'presentation_version_decided' }, 'Überarbeitung nötig', 'clarification_required'],
    [{ assessment: 'blocked', gate: 'QA', blockingReason: 'other' }, 'Blockiert', 'blocked'],
    [{ assessment: 'unconfirmed', gate: 'CD+Tests' }, 'Aktuelle Voraussetzungen nicht bestätigt', 'unclear'],
    [{ assessment: 'open', gate: 'CD+Tests', persistedGate: 'TP', persistedNext: 'x', nextAllowedAction: 'x' }, 'Aktuelle Voraussetzungen nicht bestätigt', 'unclear'],
    [{ assessment: 'open', gate: 'CD+Tests', persistedGate: 'CD+Tests', persistedNext: 'x', nextAllowedAction: 'y' }, 'Aktuelle Voraussetzungen nicht bestätigt', 'unclear'],
  ];
  for (const [input, label, code] of cases) {
    const situation = projectWorkSituation(input);
    assert.equal(situation.de, label); assert.equal(situation.code, code);
  }
});
