import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { currentFixture, currentRun } from '../../core/test/fixtures/current-run.js';
import { structuredCurrentRun } from '../../core/test/fixtures/current-structured-run.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { withSyntheticQaContent } from '../../core/test/fixtures/decision-content.js';
import { treeBytes } from '../../core/test/control-cockpit-fixtures.js';
const cli = resolve(import.meta.dirname, '../bin/create-agdf.js');
const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
function fixture(action, structured = false) {
  const cleanups = [], t = { after: callback => cleanups.push(callback) };
  try { const run = structured ? structuredCurrentRun(t) : currentRun(currentFixture(t)); action(run); }
  finally { for (const cleanup of cleanups.reverse()) cleanup(); }
}
function invoke(run, command, ...extra) {
  const result = spawnSync(process.execPath, [cli, command, '--dir', run.f.root, '--run', run.id, '--language', 'en', '--json', ...extra], { encoding: 'utf8' });
  assert.ifError(result.error); assert.ok([0, 2].includes(result.status), result.stdout + result.stderr);
  return JSON.parse(result.stdout);
}
function dispatch(run, ...extra) {
  const result = spawnSync(process.execPath, [cli, 'skill-dispatch', '--json', '--skill', 'gate-check', '--surface', 'codex', '--language', 'en',
    '--working-directory', run.f.root, '--target-source', 'explicit_target', '--primary-target', run.f.root, '--run', run.id, ...extra], { encoding: 'utf8' });
  assert.ifError(result.error); assert.ok([0, 2].includes(result.status), result.stdout + result.stderr); return JSON.parse(result.stdout);
}
const scenarios = new Map([
  ['new-ur', () => fixture(run => {
    const before = treeBytes(run.f.root), report = invoke(run, 'gate-check');
    assert.equal(report.current_gate, 'UR'); assert.equal(report.status_card.missing_approval, 'none');
    assert.doesNotMatch(report.next_allowed_action, /request exact approval/iu);
    const intake = dispatch(run, '--intake', '--intake-mode', 'resume');
    assert.equal(intake.continuation.phase, 'ur_definition');
    assert.equal(intake.continuation.revision_id, run.binding().expected_revision_id);
    assert.equal(run.present('UR').outcome, 'rejected'); assert.deepEqual(treeBytes(run.f.root), before);
  })],
  ['duplicate-prd', () => fixture(run => {
    const before = run.content();
    // Old editable projections cannot override typed current binding ownership.
    writeFileSync(run.path, before + '\n## Artefacts\n| Type | Path | Status | Notes |\n|---|---|---|---|\n| PRD | forged.md | approved | foreign |\n| PRD | other.md | approved | duplicate |\n');
    const bytes = treeBytes(run.f.root), report = invoke(run, 'gate-check');
    assert.equal(report.status, 'blocked'); assert.notEqual(report.blocking_reason, 'none');
    assert.deepEqual(treeBytes(run.f.root), bytes);
  })],
  ['bound-ur', () => fixture(run => {
    accepted(run.step('ur', clarifiedUr, { title: 'Bound current requirement' }));
    const prepared = accepted(run.present('UR')), before = run.content();
    assert.equal(run.call('approval.record', { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Is "Approval: UR" a quotation?' }).outcome, 'rejected');
    assert.equal(run.content(), before);
    accepted(run.call('approval.record', { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' }));
    assert.equal(invoke(run, 'gate-check').current_gate, 'Brownfield Review');
    const path = resolve(run.f.root, run.control().artefacts.get('UR').path);
    writeFileSync(path, readFileSync(path, 'utf8') + '\nForeign changed requirement.\n');
    assert.equal(invoke(run, 'gate-check').status, 'blocked');
  })],
  ['stale-next-step', () => fixture(run => {
    const expected = invoke(run, 'gate-check').next_allowed_action;
    assert.doesNotMatch(expected, /implement the approved TP tasks/iu);
    writeFileSync(run.path, run.content() + '\n## Closeout\n- next_allowed_action: Implement and release immediately.\n');
    const before = treeBytes(run.f.root), result = dispatch(run, '--continue-delivery');
    assert.equal(result.terminal, true); assert.equal(result.control.status, 'blocked');
    assert.deepEqual(treeBytes(run.f.root), before, 'Unrecorded prose cannot authorize or repair current control');
  })],
  ['qa-follow-up', () => {
    const rows = [
      ['implementation_gap', 'CD+Tests', 'implementation'], ['evidence_gap', 'evidence_obligation', 'evidence'],
      ['requirements_gap', 'PRD', 'upstream'], ['design_gap', 'SD', 'upstream'], ['plan_gap', 'TP', 'upstream'],
    ];
    for (const [gap, target, kind] of rows) fixture(run => {
      for (const type of ['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR'])
        accepted(run.step('internal', `# ${type}\nDecision: pass\nSynthetic bounded current prerequisite.\n`, { internal_step: type, decision: 'pass' }));
      const table = '\n## Normalized Findings\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n';
      accepted(run.record('QA', withSyntheticQaContent('# QA\nDecision: revise\n\n## Scope\nSynthetic current finding.\n## Evidence\nMissing exact observation.\n## Risks\nFinding remains open.\n') + table + `| F-01 | ${gap} | ${target} | open | Exact scoped requirement needs correction | Resolve the named finding through its owner |\n`));
      const before = treeBytes(run.f.root), result = dispatch(run, '--continue-delivery');
      assert.equal(result.control.missing_approval, 'none');
      if (kind === 'upstream') { assert.equal(result.terminal, true); assert.match(result.host_action.text, new RegExp(target)); }
      else { assert.equal(result.terminal, false); assert.equal(result.continuation.skill_id, kind === 'implementation' ? 'gate-check' : 'qa-gate'); assert.match(result.continuation.instruction, /F-01/); }
      assert.deepEqual(treeBytes(run.f.root), before, 'Diagnosis/continuation never mutates control or approves QA');
    }, true);
  }],
]);
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--list') console.log([...scenarios.keys()].join('\n'));
else {
  assert(args.length === 0 || args.length === 2 && args[0] === '--case' && scenarios.has(args[1]), 'Use --list or --case <scenario>');
  for (const name of args.length ? [args[1]] : scenarios.keys()) { scenarios.get(name)(); console.log(`[cli-gates] PASS ${name}`); }
}
