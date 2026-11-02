import assert from 'node:assert/strict';
import test from 'node:test';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { structuredCurrentRun } from './fixtures/current-structured-run.js';
import { withSyntheticQaContent } from './fixtures/decision-content.js';
import { runWorkSummary } from '../lib/control-evaluation/run-work-summary.js';
import { treeBytes } from './control-cockpit-fixtures.js';
const accepted = value => { assert.equal(value.outcome, 'accepted', JSON.stringify(value)); return value; };
const report = rows => withSyntheticQaContent('# QA\n\nDecision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n' + rows.map(([id, gap, target, action]) => `| ${id} | ${gap} | ${target} | open | Current exact observation missing | ${action} |`).join('\n') + '\n');
const evidence = ['F1', 'evidence_gap', 'evidence_obligation', 'Capture exact native observation'];
const correction = ['F2', 'implementation_gap', 'CD+Tests', 'Correct the approved implementation'];
const source = ['F3', 'design_gap', 'SD', 'Resolve the exact design source'];
function quality(t, rows) {
  const run = structuredCurrentRun(t);
  for (const type of ['Brownfield Analysis', 'CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR'])
    accepted(run.step('internal', `# ${type}\n\nDecision: pass\n\nSynthetic scoped fixture result.\n`, { internal_step: type, decision: 'pass' }));
  accepted(run.record('QA', report(rows))); return run;
}
for (const [rows, kind] of [[[evidence], 'qa_evidence_open'], [[correction], 'qa_correction_open'], [[source], 'qa_source_decision'],
  [[evidence, correction], 'qa_correction_open'], [[evidence, source], 'qa_source_decision']]) {
  test(`derived work summary retains ${kind} and mixed-route precedence`, t => {
    const run = quality(t, rows), before = treeBytes(run.f.root);
    const summary = runWorkSummary(run.f.root, run.content(), run.path);
    assert.equal(summary.kind, kind); assert.equal(summary.open_obligation_count, rows.length);
    assert(summary.display_action.includes(summary.decisive_obligation.action));
    assert.equal(summary.authorizes, false);
    assert(summary.sources.some(row => row.path === run.control().artefacts.get('QA').path));
    assert.deepEqual(treeBytes(run.f.root), before);
  });
}
test('changed report bytes cannot remain a confirmed summary or become a repaired source', t => {
  const run = quality(t, [evidence]), path = join(run.f.root, run.control().artefacts.get('QA').path);
  writeFileSync(path, '# Foreign changed report\nDecision: pass\n');
  const before = treeBytes(run.f.root), summary = runWorkSummary(run.f.root, run.content(), run.path);
  assert.equal(summary.kind, 'source_unconfirmed'); assert.equal(summary.authorizes, false);
  assert.deepEqual(treeBytes(run.f.root), before);
});
