import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fixture } from './control-cockpit-fixtures.js';
import { upsertTableRow, replaceFirstScalar, replaceSectionScalar } from '../lib/control-state/run-state-edits.js';
import { runWorkSummary } from '../lib/control-evaluation/run-work-summary.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { writeRunWithBacklog } from '../lib/control-state/run-backlog-writer.js';
import { recordRunRevision } from '../lib/control-state/run-recording.js';
import { decodeBacklogMarker } from '../lib/control-state/backlog-summary.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';

const f = fixture(), prefix = '.agdf/control/artefacts/fixture-a/', qa = join(f.root, prefix, 'QA_REPORT.md');
const row = (id, gap, target, action = 'Capture the exact current native evidence') => `| ${id} | ${gap} | ${target} | open | Current supported observation missing | ${action} |`;
const report = (decision, rows = []) => `- decision: ${decision}\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
let source = readFileSync(f.runPath, 'utf8');
for (const gate of ['UR', 'PRD', 'SD', 'TP']) {
  writeFileSync(join(f.root, prefix, gate + '.md'), '# ' + gate + '\n');
  source = upsertTableRow(source, 'Approvals', 0, gate, [gate, 'approved', 'isolated test fixture']);
  source = upsertTableRow(source, 'Artefacts', 0, gate, [gate, prefix + gate + '.md', 'approved', '']);
}
for (const step of ['Brownfield Review', 'Brownfield Analysis', 'CD+Tests', 'CR']) {
  const path = prefix + step.replaceAll('+', '').replaceAll(' ', '_') + '.md';
  writeFileSync(join(f.root, path), '# Evidence\n- decision: pass\n');
  source = upsertTableRow(source, 'Artefacts', 0, step, [step, path, 'done', '']);
}
source = replaceSectionScalar(source, 'Mode/Slice Decision', 'decision', 'structured_delivery');
source = replaceSectionScalar(source, 'Mode/Slice Decision', 'scope_reason', 'Isolated summary regression');
source = replaceSectionScalar(source, 'Mode/Slice Decision', 'evidence', 'test fixture');
source = replaceFirstScalar(source, 'current_gate', 'QA');
source = replaceFirstScalar(source, 'next_allowed_action', 'An old custom implementation step');
const candidate = status => upsertTableRow(source, 'Artefacts', 0, 'QA', ['QA', prefix + 'QA_REPORT.md', status, '']);
let checks = 0;
const pass = message => { checks++; console.log('PASS ' + message); };
try {
  for (const [rows, kind] of [
    [[row('F1', 'evidence_gap', 'evidence_obligation')], 'qa_evidence_open'],
    [[row('F1', 'implementation_gap', 'CD+Tests', 'Correct approved implementation')], 'qa_correction_open'],
    [[row('F1', 'design_gap', 'SD', 'Resolve the approved design owner')], 'qa_source_decision'],
    [[row('F1', 'evidence_gap', 'evidence_obligation'), row('F2', 'implementation_gap', 'CD+Tests', 'Repair implementation')], 'qa_correction_open'],
    [[row('F1', 'evidence_gap', 'evidence_obligation'), row('F2', 'design_gap', 'SD', 'Resolve design owner before dependent work')], 'qa_source_decision'],
  ]) {
    writeFileSync(qa, report('revise', rows)); const content = candidate('revise');
    const policy = policyForRunContent(f.root, content, f.runPath), before = JSON.stringify(policy);
    const summary = runWorkSummary(f.root, content, f.runPath);
    assert.equal(summary.kind, kind); assert.equal(summary.open_obligation_count, rows.length);
    assert.ok(summary.display_action.includes(summary.decisive_obligation.action));
    assert.notEqual(summary.display_action, 'An old custom implementation step');
    assert.equal(JSON.stringify(policyForRunContent(f.root, content, f.runPath)), before);
    assert.equal(summary.authorizes, false); assert.equal(summary.sources[0].path, prefix + 'QA_REPORT.md');
    pass('specific ' + kind + ', mixed-route precedence and unchanged permission envelope');
  }
  for (const [body, kind] of [[report('pass'), 'source_unconfirmed'], [report('revise'), 'source_unconfirmed'],
    [report('revise', [row('F1', 'evidence_gap', 'CD+Tests')]), 'source_unconfirmed'],
    [report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]) + '- tp_review: ../../foreign/REVIEW.md\n', 'source_unconfirmed']]) {
    writeFileSync(qa, body); assert.equal(runWorkSummary(f.root, candidate('revise'), f.runPath).kind, kind);
  }
  pass('contradictory/missing/invalid/foreign normalized sources remain unconfirmed');
  writeFileSync(join(f.root, prefix, '%51A_REVIEW.md'), '# Review\n- decision: pass\n');
  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]) + '- tp_review: %51A_REVIEW.md\n');
  assert.equal(runWorkSummary(f.root, candidate('revise'), f.runPath).kind, 'source_unconfirmed');
  assert.equal(runWorkSummary(f.root, upsertTableRow(source, 'Artefacts', 0, 'QA', ['QA', '', 'missing', '']), f.runPath).kind, 'qa_report_pending');
  for (const bytes of [Buffer.from('x'.repeat(262145)), Buffer.concat([Buffer.from(report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')])), Buffer.from([0xff])])]) {
    writeFileSync(qa, bytes); assert.equal(runWorkSummary(f.root, candidate('revise'), f.runPath).kind, 'source_unconfirmed');
  }
  const refs = Array.from({ length: 65 }, (_, i) => `REVIEW_${i}.md`);
  for (const ref of refs) writeFileSync(join(f.root, prefix, ref), '# Registered review\n- decision: pass\n');
  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]) + refs.map(ref => `- tp_review: ${ref}\n`).join(''));
  const bounded = runWorkSummary(f.root, candidate('revise'), f.runPath);
  assert.equal(bounded.kind, 'source_unconfirmed'); assert.equal(bounded.sources.length, 64);
  pass('missing QA registration, invalid UTF-8, oversized report and bounded reference set stay explicit');
  writeFileSync(qa, report('pass'));
  assert.equal(runWorkSummary(f.root, candidate('pass'), f.runPath).kind, 'approval_pending');
  let approvedQa = upsertTableRow(candidate('pass'), 'Approvals', 0, 'QA', ['QA', 'approved', 'isolated fixture']);
  assert.equal(runWorkSummary(f.root, approvedQa, f.runPath).phase, 'UAT');
  approvedQa = upsertTableRow(approvedQa, 'Approvals', 0, 'UAT', ['UAT', 'approved', 'isolated fixture']);
  assert.equal(runWorkSummary(f.root, approvedQa, f.runPath).kind, 'closeout_pending');
  assert.equal(runWorkSummary(f.root, replaceFirstScalar(approvedQa, 'lifecycle', 'completed'), f.runPath).kind, 'completed');
  writeFileSync(qa, report('block', [row('F1', 'evidence_gap', 'evidence_obligation')]));
  assert.equal(runWorkSummary(f.root, candidate('block'), f.runPath).kind, 'qa_blocked');
  pass('pass awaiting approval, approved QA/UAT, closeout and completed are distinct from block');

  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]));
  const backlog = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
  writeFileSync(backlog, readFileSync(backlog, 'utf8').replace('|---:|---|---|---|---|---|---|', '|---:|---|---|---|---|---|---|\n| P1 | fixture-a | Test undertaking | In Progress | | | old |'));
  writeFileSync(f.runPath, sealRunState(f.root, candidate('revise')));
  const oldRun = readFileSync(f.runPath, 'utf8'), revision = parseRunState(oldRun).meta.revision_id;
  const nextRevisionId = randomUUID();
  const committed = writeRunWithBacklog(f.root, f.runPath, oldRun, revision, { nextRevisionId });
  let saved = readFileSync(backlog, 'utf8').split('\n').map(decodeBacklogMarker).find(m => m?.record)?.record;
  assert.equal(saved.revision_id, committed.meta.revision_id); assert.equal(saved.revision_id, nextRevisionId);
  assert.equal(saved.kind, 'qa_evidence_open');
  const bytes = readFileSync(backlog, 'utf8');
  assert.equal(recordRunRevision(f.root, { runId: 'fixture-a', revisionId: nextRevisionId }).outcome, 'unchanged');
  assert.equal(readFileSync(backlog, 'utf8'), bytes);
  const session = createCockpitReader(f.root); const selection = session.snapshot('fixture-a');
  assert.equal(selection.data.run.backlog_comparison.state, 'matching');
  const currentRunBytes = readFileSync(f.runPath, 'utf8');
  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation', 'Capture a newly required visible sequence')]));
  assert.equal(session.snapshot('fixture-a').data.run.backlog_comparison.state, 'unavailable', 'moved registered source invalidates the seal');
  writeFileSync(f.runPath, sealRunState(f.root, currentRunBytes));
  assert.equal(session.snapshot('fixture-a').data.run.backlog_comparison.state, 'different');
  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]));
  writeFileSync(f.runPath, currentRunBytes);
  writeFileSync(backlog, bytes.split('\n').filter(line => !line.startsWith('<!-- agdf-backlog-summary-')).join('\n'));
  assert.equal(session.snapshot('fixture-a').data.run.backlog_comparison.state, 'unavailable');
  writeFileSync(backlog, bytes);
  // A source revision with unchanged visible words is still a different saved observation.
  writeRunWithBacklog(f.root, f.runPath, readFileSync(f.runPath, 'utf8'), nextRevisionId);
  assert.notEqual(readFileSync(backlog, 'utf8'), bytes);
  pass('actual resulting revision, exact repeat timestamp/bytes and selected current comparison');

  const before = readFileSync(f.runPath, 'utf8'), currentRevision = parseRunState(before).meta.revision_id;
  const beforeBacklog = readFileSync(backlog, 'utf8');
  assert.throws(() => writeRunWithBacklog(f.root, f.runPath, before, currentRevision, {
    afterWrite(stage) { if (stage === 'intent') writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation', 'Different evidence action')])); }
  }), /AGDF_STALE_RUN_REVISION/);
  assert.equal(readFileSync(f.runPath, 'utf8'), before); assert.equal(readFileSync(backlog, 'utf8'), beforeBacklog);
  pass('consumed QA source movement before commit cannot mix Run and pointer evidence');

  const review = join(f.root, prefix, 'TP_REVIEW.md');
  writeFileSync(review, '# Referenced review\n- decision: pass\n');
  writeFileSync(qa, report('revise', [row('F1', 'evidence_gap', 'evidence_obligation')]) + '- tp_review: TP_REVIEW.md\n');
  const referencedBefore = sealRunState(f.root, before); writeFileSync(f.runPath, referencedBefore);
  assert.throws(() => writeRunWithBacklog(f.root, f.runPath, referencedBefore, currentRevision, {
    afterWrite(stage) { if (stage === 'intent') writeFileSync(review, '# Changed referenced review\n- decision: pass\n'); }
  }), /AGDF_STALE_RUN_REVISION/);
  assert.equal(readFileSync(f.runPath, 'utf8'), referencedBefore); assert.equal(readFileSync(backlog, 'utf8'), beforeBacklog);
  pass('explicit referenced review movement also prevents a mixed commit');
} finally { f.close(); }
console.log(`${checks} work-summary checks passed`);
