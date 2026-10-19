// Regression tests for run review-findings-correction-20261019-01 (D5): normalized review
// finding rows are validated when a review or QA report is recorded, and a run stuck at OR
// because of invalid recorded rows corrects them without renewed approvals.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizedGapProblems, readNormalizedFindings, reviewFindingDiagnostics, declaredRoutes } from '../lib/control-evaluation/normalized-gaps.js';
import { inspectQaReports } from '../lib/control-evaluation/qa-follow-up.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
import { closeoutConfirmation } from '../lib/control-evaluation/closeout-readiness.js';
import { approvedMaterialFindings, decisionMaterial, reviewCorrections } from '../lib/control-state/presentation-decision.js';
import { bindingSourceAssociation } from '../lib/control-state/evidence-bindings.js';
import { internalStepEligibility, reviewCorrectionRefusal, reviewCorrectionAvailable } from '../lib/control-state/run-operation-proof.js';
import { reviewRecordingChain } from '../lib/control-state/presentation-decision.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { createCoreServices } from '../lib/index.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { withSyntheticQaContent } from './fixtures/decision-content.js';

const HEADER = '| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n';
const table = rows => HEADER + rows.map(row => `| ${row.join(' | ')} |`).join('\n') + '\n';
const fixed = 'Synthetic defect fixed and tested in the disposable fixture';
const invalidRows = [['F-01', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'none']];
const validRows = [['F-01', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'No further action; resolved in CD+Tests']];
// MCP results carry refusal details in their family result.
const detail = (result, key) => result.family_result?.[key] ?? result[key];
const reviewText = (title, decision, rows) => `# ${title}\nStatus: ${decision}\n- decision: ${decision}\nSynthetic review.\n\n${rows ? table(rows) : ''}`;

// SCN-001: field-level rules of the quality contract.
{
  const routes = declaredRoutes();
  const fields = row => normalizedGapProblems(row, routes).map(problem => problem.field);
  assert.deepEqual(fields(validRows[0]), [], 'A complete resolved finding is valid.');
  assert.deepEqual(fields(invalidRows[0]), ['required_next_step'], '`none` is no executable next step, also when resolved.');
  assert.deepEqual(fields(['F-01', 'implementation_gap', 'CD+Tests', 'resolved', 'none', 'Rerun the tests']), ['evidence']);
  assert.deepEqual(fields(['F-01', 'quality_gap', 'CD+Tests', 'open', fixed, 'Rerun the tests']), ['gap_type']);
  assert.deepEqual(fields(['F-01', 'implementation_gap', 'PRD', 'open', fixed, 'Rerun the tests']), ['routing_target']);
  assert.deepEqual(fields(['F-01', 'implementation_gap', 'CD+Tests', 'closed', fixed, 'Rerun the tests']), ['gap_status']);
  assert.deepEqual(fields(['F-01', 'emergent_risk', 'CD+Tests', 'resolved', 'A rare race remains', 'Monitor it']), ['evidence']);
  assert.deepEqual(fields(['F-01', 'requirements_gap', 'UR', 'open', 'Criterion AC-001 is unclear', 'Clarify it']), ['evidence']);
  assert.deepEqual(fields(['F-01', 'implementation_gap', 'CD+Tests']), ['row']);
  assert.deepEqual(readNormalizedFindings('| finding_id | gap_type | evidence |\n|---|---|---|\n').entries.map(entry => entry.kind), ['malformed_header']);
  assert.deepEqual(readNormalizedFindings(HEADER + '| F-01 | implementation_gap |\n').entries.map(entry => entry.kind), ['malformed_row']);
  const duplicate = reviewFindingDiagnostics('CR', table([...validRows, ...validRows]), { decision: 'pass' });
  assert.deepEqual(duplicate.map(row => [row.finding_id, row.field]), [['F-01', 'finding_id']]);
  assert.deepEqual(reviewFindingDiagnostics('CR', '- decision: revise\n', { decision: 'revise' }).map(row => row.field), ['table'],
    'A revise or block review needs its findings.');
  assert.deepEqual(reviewFindingDiagnostics('CR', '- decision: pass\n', { decision: 'pass' }), [], 'A pass review without findings is valid.');
  assert.deepEqual(reviewFindingDiagnostics('TP Review', table(invalidRows), { decision: 'pass' })[0],
    { review: 'TP Review', finding_id: 'F-01', field: 'required_next_step', expected: 'exactly one executable action, not none, tbd, todo or a placeholder, also for a resolved finding', rule: 'required_next_step' });
}

// SCN-003: inspectQaReports keeps its results and messages; an invalid row also carries its diagnostics.
{
  const prefix = '.agdf/control/artefacts/scn-003/';
  const files = { [prefix + 'QA_REPORT.md']: '# QA\nDecision: pass\n', [prefix + 'CODE_REVIEW.md']: reviewText('Code Review', 'pass', validRows) };
  const state = { artefacts: new Map([['QA', { path: prefix + 'QA_REPORT.md', status: 'pass' }], ['CR', { path: prefix + 'CODE_REVIEW.md', status: 'done' }]]) };
  const inspect = () => inspectQaReports('.', state, 'scn-003', 'pass', 64, true, { readArtefact: path => files[path] });
  assert.equal(inspect().kind, 'none');
  files[prefix + 'CODE_REVIEW.md'] = reviewText('Code Review', 'pass', invalidRows);
  const blocked = inspect();
  assert.equal(blocked.reason, 'Invalid or contradictory normalized finding: CR/F-01.');
  assert.deepEqual(blocked.invalid.problems.map(problem => problem.field), ['required_next_step']);
  files[prefix + 'CODE_REVIEW.md'] = reviewText('Code Review', 'pass', [...validRows, ...validRows]);
  assert.equal(inspect().reason, 'Invalid or contradictory normalized finding: CR/F-01.', 'Duplicates keep the existing message.');
}

// SCN-009 (alias): a run that recorded the Clean Review alias is not corrected through this path.
{
  const approved = new Map(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].map(gate => [gate, { status: 'approved' }]));
  const state = { meta: { lifecycle: 'active' }, mode_slice_decision: { decision: 'structured_slice' }, approvals: approved, content: '',
    artefacts: new Map([['CD+Tests', { status: 'done', path: 'CD_TESTS.md' }], ['Clean Review', { status: 'done', path: 'CLEAN_REVIEW.md' }]]) };
  assert.equal(internalStepEligibility(state, { current_gate: 'OR' }, { internalStep: 'Clean Implementation Review' }, '.'), false);
  // Without a UAT material receipt and step receipts the proof cannot hold, so nothing is eligible.
  const legacyUat = { ...state, run_id: 'scn-009', approvals: new Map([...approved, ['UAT', { status: 'approved', evidence: '`Approval: UAT` · 2026-01-01' }]]),
    artefacts: new Map([['CR', { status: 'done', path: '.agdf/control/artefacts/scn-009/CODE_REVIEW.md' }]]) };
  assert.equal(reviewRecordingChain(legacyUat, 'CR'), null);
  assert.equal(internalStepEligibility(legacyUat, { current_gate: 'OR' }, { internalStep: 'CR' }, '.'), false);
  assert.equal(reviewCorrectionAvailable(legacyUat, 'CR', [{ rule: 'required_next_step' }]), false, 'Closeout offers no correction the proof cannot hold.');
  assert.equal(reviewCorrectionAvailable(legacyUat, 'CR', [{ rule: 'gap_type' }]), false);
}

// SCN-009 (content): only the invalid evidence and next-step cells of readable rows may change.
{
  const recorded = (rows, status = 'done', decision = 'pass', extra = '') => ({ status, content: reviewText('Code Review', decision, rows) + extra });
  const malformed = reviewText('Code Review', 'pass', validRows) + '| F-02 | implementation_gap | CD+Tests | resolved | a | b | c |\n';
  assert.equal(reviewCorrectionRefusal('CR', { status: 'done', content: malformed }, 'pass', reviewText('Code Review', 'pass', validRows)), 'recorded_review_uncorrectable',
    'A malformed table cannot be corrected away.');
  const badHeader = '- decision: pass\n\n| finding_id | gap_type | routing_target | status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F-01 | implementation_gap | CD+Tests | open | a | none |\n';
  assert.equal(reviewCorrectionRefusal('CR', { status: 'done', content: badHeader }, 'pass', '- decision: pass\n'), 'recorded_review_uncorrectable');
  assert.equal(reviewCorrectionRefusal('CR', recorded(invalidRows, 'done', 'pass', '\n## Risks\nInjection not verified.\n'), 'pass',
    reviewText('Code Review', 'pass', validRows) + '\n## Risks\nNone.\n'), 'content_changed', 'Text outside the invalid cells stays as the approvals saw it.');
  const mixed = [...invalidRows, ['F-02', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'Keep the regression test']];
  assert.equal(reviewCorrectionRefusal('CR', recorded(mixed), 'pass', reviewText('Code Review', 'pass',
    [validRows[0], ['F-02', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'Changed wording']])), 'content_changed', 'Valid rows are not reworded.');
  assert.equal(reviewCorrectionRefusal('CR', recorded(mixed), 'pass', reviewText('Code Review', 'pass', [validRows[0], mixed[1]])), null);
  assert.equal(reviewCorrectionRefusal('CR', recorded(mixed), 'pass', reviewText('Code Review', 'pass', [validRows[0], mixed[1]]).trimEnd()), null,
    'Trailing whitespace at the end of the file is not content.');
  const reviseInvalid = [['F-01', 'implementation_gap', 'CD+Tests', 'open', fixed, 'none']];
  const reviseValid = [['F-01', 'implementation_gap', 'CD+Tests', 'open', fixed, 'Correct the synthetic implementation']];
  assert.equal(reviewCorrectionRefusal('TP Review', recorded(reviseInvalid, 'revise', 'revise'), 'revise', reviewText('Code Review', 'revise', reviseValid)), null, 'A revise review keeps its decision.');
  assert.equal(reviewCorrectionRefusal('TP Review', recorded(reviseInvalid, 'revise', 'revise'), 'pass', reviewText('Code Review', 'pass', reviseValid)), 'decision_changed');
  assert.equal(reviewCorrectionRefusal('CR', { status: 'done' }, 'pass', '- decision: pass\n'), 'recorded_review_unavailable');
  // Evidence the approvals saw is never replaced: neither a placeholder nor a missing content-rule justification.
  assert.equal(reviewCorrectionRefusal('CR', recorded([['F-01', 'implementation_gap', 'CD+Tests', 'resolved', 'none', 'Rerun the tests']]), 'pass',
    reviewText('Code Review', 'pass', [['F-01', 'implementation_gap', 'CD+Tests', 'resolved', 'All tests pass in CI run 123', 'Rerun the tests']])), 'recorded_review_uncorrectable');
  assert.equal(reviewCorrectionRefusal('CR', recorded([['F-01', 'requirements_gap', 'UR', 'resolved', 'AC-1 unclear', 'Clarify AC-1']]), 'pass',
    reviewText('Code Review', 'pass', [['F-01', 'requirements_gap', 'UR', 'resolved', 'Changed user intent confirmed by owner', 'Clarify AC-1']])), 'recorded_review_uncorrectable');
  assert.equal(reviewCorrectionRefusal('CR', recorded(invalidRows), 'pass', reviewText('Code Review', 'pass', [['F-01', 'implementation_gap', 'CD+Tests', 'resolved', 'Other evidence', 'No further action']])),
    'content_changed', 'The evidence cell stays as the approvals saw it.');
  // Closeout's missing-findings rule also reads a later `- decision:` line; recording applies the same rule.
  assert.deepEqual(reviewFindingDiagnostics('CR', 'Decision: pass\n## History\n- decision: revise\n', { decision: 'pass' }).map(row => row.field), ['table']);
}

// Emulates a runtime from before D4 and D5: no review requirement before QA, no late or OR
// correction eligibility, and no early check of normalized finding rows at recording.
const legacyCore = async () => {
  // The copy lives below the repository's node_modules, so its package imports resolve like the original's.
  const core = resolve(import.meta.dirname, '..'), base = mkdtempSync(join(core, '../../node_modules', '.agdf-pre-d5-core-'));
  for (const part of ['lib', 'generated', 'package.json']) cpSync(join(core, part), join(base, 'packages/core', part), { recursive: true });
  cpSync(resolve(core, '../../plugins/agdf/control/templates'), join(base, 'plugins/agdf/control/templates'), { recursive: true });
  const strip = (relative, from, to, expected = 1) => {
    const path = join(base, relative), source = readFileSync(path, 'utf8');
    if (to) {
      const start = source.indexOf(from), end = source.indexOf(to);
      assert.ok(start > 0 && end > start, `The emulated runtime removes exactly one block from ${relative}.`);
      writeFileSync(path, source.slice(0, start) + source.slice(end));
    } else {
      assert.equal(source.split(from).length - 1, expected, `The emulated runtime removes exactly ${expected} line(s) from ${relative}.`);
      writeFileSync(path, source.split(from).join(''));
    }
  };
  strip('packages/core/lib/control-evaluation/gate-policy.js', '  // The qa-gate forbids a QA pass without review evidence', '  if (gateApprovalStatus(runState, "QA") === "approved" && !isGateSatisfied(runState, "QA"))');
  strip('packages/core/lib/control-state/run-operation-proof.js', '  if (lateRequiredReviewEligible(state, before, input) || reviewCorrectionCandidate(state, before, input)) return true;\n');
  strip('packages/core/lib/control-state/run-steps.js', "      if (diagnostics.length) return findingsRefusal(runId, diagnostics);\n", null, 3);
  return { base, services: (await import(pathToFileURL(join(base, 'packages/core/lib/index.js')).href)).createCoreServices() };
};

const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
const service = createCoreServices().command;
const legacy = await legacyCore();
const roots = [];

// One disposable structured run at gate Brownfield Analysis with UR to TP approved.
function createRun(name) {
  const root = mkdtempSync(join(tmpdir(), `agdf-${name}-`)); roots.push(root);
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createLateSourceRevisionTestRun(root, cli, name, process.env, { route: 'structured_slice', prepare: false });
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  let counter = 0;
  const source = (step, text) => {
    const path = `${f.prefix}${step.replaceAll(' ', '_').replaceAll('+', '_')}_SOURCE-${String(++counter).padStart(2, '0')}.md`;
    writeFileSync(join(root, path), text);
    return { path, digest: artefactFileDigest(root, path) };
  };
  const internal = (step, decision = 'pass', rows = null, run = service) => run('agdf_record', { ...bound(), command: { kind: 'step.record',
    payload: { step: 'internal', internal_step: step, decision, source: source(step, reviewText(step, decision, rows)) } } });
  const reviewStep = (decision, rows, run = service) => run('agdf_record', { ...bound(), command: { kind: 'step.record',
    payload: { step: 'review', decision, source: source('Review', reviewText('CR', decision, rows)) } } });
  const recordQa = (rows = null, run = service, extra = '') => {
    const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + `QA_MAPPING-${++counter}.json`, request = f.prefix + `QA_RECORD-${counter}.json`;
    writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: Synthetic correction\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests recorded.\n\n## Risks\nNo applicable open required finding.\n') + extra + (rows ? '\n' + table(rows) : ''));
    const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
      destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
      relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
    const { schema_version, target_id, run_id, destination, source: tp, relationship } = command;
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source: tp, relationship, reviewer: command.review.reviewer, reviewed: true }));
    command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
    return run('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  };
  const approve = (gate, run = service) => {
    const prepared = run('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } });
    assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
    const approved = run('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepared.family_result.presentation_id, response: `Approval: ${gate}` } } });
    assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
  };
  const closeout = () => {
    const state = readRunState(root, { runId: f.runId });
    const gateRows = ['UR', 'Brownfield Review', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'].map(type =>
      `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type).status} | ${state.artefacts.get(type)?.path || state.approvals.get(type).evidence} |`).join('\n');
    const orPath = f.prefix + `OR_CANDIDATE-${++counter}.md`;
    writeFileSync(join(root, orPath), `# OR: Synthetic correction closed\nReport mode: OR-full\nStatus: done\n## Run\n- run_id: ${f.runId}\n- related_ur: ${f.prefix}UR.md\n- related_prd: ${f.prefix}PRD.md\n- related_sd: ${f.prefix}SD.md\n- related_tp: ${f.prefix}TP.md\n- related_qa_report: ${f.prefix}QA_REPORT.md\n- mode_slice_decision: structured_slice\n- current_gate: OR\n- decision: pass\n## Gate State\n| Gate or step | Status | Evidence |\n|---|---|---|\n${gateRows}\n## Delivered\nSynthetic exact approved fixture task complete.\n## Not Delivered / Intentionally Deferred\nnone\n## Evidence\nReviews corrected at OR with unchanged decisions and classifications.\n## Missing Evidence\nnone\n## Risks And Open Items\nnone\n## Context Graph Impact\n- context_graph_impact: none\n- context_graph_refs: none\n- context_graph_reconciliation: not_applicable\n- context_graph_required_action: none\n- context_graph_gate_effect: none\n- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.\n## Knowledge Persistence Decision\n- memory_target: none\n- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.\n- memory_refs: none\n## Next Permissible Step\n- next_allowed_action: Optional explicitly requested VCS handoff.\n- required_approval: none\n- forbidden_until_then: Automatic Git or release action.\n`);
    const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: { path: orPath, digest: artefactFileDigest(root, orPath) }, confirmation: '' } } };
    input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
    return service('agdf_closeout', input);
  };
  const state = () => readRunState(root, { runId: f.runId });
  return { root, f, internal, reviewStep, recordQa, approve, closeout, state };
}

try {
  // Case A, shaped like core-approval-lock-defects-20261017-01: all three reviews recorded with
  // `none` before the QA report, then QA and UAT approved with them in their material.
  const a = createRun('review-correction-a');
  for (const step of ['Brownfield Analysis', 'CD+Tests']) assert.equal(a.internal(step).outcome, 'accepted', step);

  // SCN-002: every recording path refuses an invalid row and writes nothing.
  const before = a.f.revision();
  for (const step of ['CR', 'TP Review', 'Clean Implementation Review']) {
    const refused = a.internal(step, 'pass', invalidRows);
    assert.equal(refused.reason, 'review_findings_invalid', JSON.stringify(refused));
    assert.deepEqual(detail(refused, 'diagnostics'), [{ review: step, finding_id: 'F-01', field: 'required_next_step',
      expected: 'exactly one executable action, not none, tbd, todo or a placeholder, also for a resolved finding', rule: 'required_next_step' }]);
  }
  const reviewRefused = a.reviewStep('pass', invalidRows);
  assert.equal(reviewRefused.reason, 'review_findings_invalid', 'The quick-task review step applies the same check.');
  assert.equal(a.f.revision(), before, 'Refused recordings leave the Run unchanged.');
  assert.ok(!existsSync(join(a.root, a.f.prefix + 'CODE_REVIEW.md')), 'No owned output is written for a refused review.');

  // The pre-D5 runtime recorded these reviews without error.
  for (const step of ['CR', 'TP Review', 'Clean Implementation Review']) assert.equal(a.internal(step, 'pass', invalidRows, legacy.services.command).outcome, 'accepted', step);
  const qaRefused = a.recordQa(invalidRows);
  assert.equal(qaRefused.reason, 'review_findings_invalid', 'The QA report is checked when it is recorded.');
  assert.equal(detail(qaRefused, 'diagnostics')[0].review, 'QA');
  writeFileSync(join(a.root, a.f.prefix + 'EXTRA_REVIEW.md'), reviewText('Extra Review', 'pass', invalidRows));
  const referenced = a.recordQa(null, service, '\n- code_review: EXTRA_REVIEW.md\n');
  assert.deepEqual(detail(referenced, 'diagnostics').map(row => row.review), ['QA reference: code_review'], 'Referenced reviews are checked like closeout does.');
  const many = a.internal('CR', 'pass', Array.from({ length: 70 }, (_, index) => [`F-${index}`, 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'none']));
  assert.equal(detail(many, 'diagnostics').length, 64); assert.equal(detail(many, 'diagnostics_truncated'), true);
  // SCN-004: a valid QA report records as before.
  assert.equal(a.recordQa(validRows).outcome, 'accepted');
  a.approve('QA');
  // SCN-009 (gate): the correction path exists only at OR.
  const atUat = a.internal('CR', 'pass', validRows);
  assert.equal(atUat.reason, 'internal_step_not_ready', 'At gate UAT a recorded review stays immutable.');
  assert.equal(detail(atUat, 'correction'), undefined);
  a.approve('UAT');
  assert.equal(evaluateGateCheck(a.root, { runId: a.f.runId }).current_gate, 'OR');

  // SCN-010: closeout refuses and names finding, field and the correction path.
  const refusedCloseout = a.closeout();
  assert.equal(refusedCloseout.reason, 'closeout_quality_unconfirmed');
  const closeoutDetail = detail(refusedCloseout, 'reason_detail');
  assert.ok(closeoutDetail.startsWith('Invalid or contradictory normalized finding: TP Review/F-01. required_next_step: expected exactly one executable action'), closeoutDetail);
  assert.ok(closeoutDetail.endsWith('Record TP Review again at gate OR from a corrected source that changes only the required_next_step cells, then record closeout.'), closeoutDetail);

  // SCN-008: a correction whose new rows are still invalid is refused by the recording check.
  assert.equal(a.internal('CR', 'pass', [['F-01', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'todo']]).reason, 'review_findings_invalid');
  // SCN-009: changed decision and changed classification are refused with their correction detail.
  const revise = [['F-01', 'implementation_gap', 'CD+Tests', 'open', fixed, 'Correct the synthetic implementation']];
  assert.equal(detail(a.internal('CR', 'revise', revise), 'correction'), 'decision_changed');
  assert.equal(detail(a.internal('CR', 'pass', [['F-01', 'evidence_gap', 'evidence_obligation', 'resolved', fixed, 'No further action; evidence recorded']]), 'correction'), 'classification_changed');
  assert.equal(detail(a.internal('CR', 'pass', [...validRows, ['F-02', 'implementation_gap', 'CD+Tests', 'resolved', fixed, 'No further action']]), 'correction'), 'classification_changed');
  assert.equal(a.internal('CD+Tests').reason, 'internal_step_not_ready', 'Other internal steps stay refused at OR.');

  // SCN-005: the corrected CR is recorded; the gate stays OR and no approval changes.
  const seen = a.state().artefacts.get('CR');
  const seenDigest = artefactFileDigest(a.root, seen.path);
  const corrected = a.internal('CR', 'pass', validRows);
  assert.equal(corrected.outcome, 'accepted', JSON.stringify(corrected));
  assert.equal(evaluateGateCheck(a.root, { runId: a.f.runId }).current_gate, 'OR');
  assert.equal(detail(a.internal('CR', 'pass', validRows), 'correction'), 'recorded_review_valid', 'A valid recorded review is never replaced.');

  // SCN-006: the receipts prove the correction.
  let state = a.state();
  assert.deepEqual(reviewCorrections(state).get('CR'), { seen_digest: seenDigest, current_digest: artefactFileDigest(a.root, seen.path) });
  // SCN-007: approvals stay valid and the QA association current; any other change still invalidates.
  const decisions = new Map(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].map(gate => [gate, decisionMaterial(a.root, state, gate)]));
  assert.deepEqual(approvedMaterialFindings(state, decisions), [], 'A proven correction keeps QA and UAT approvals valid.');
  const changed = new Map([...decisions].map(([gate, material]) => [gate, { ...material,
    ...(['QA', 'UAT'].includes(gate) ? { sources: material.sources.map(row => row.type === 'CR' ? { ...row, digest: `sha256:${'0'.repeat(64)}` } : row), material_version: `sha256:${'1'.repeat(64)}` } : {}) }]));
  assert.deepEqual(approvedMaterialFindings(state, changed).map(row => [row.gate, row.reason]),
    [['QA', 'approved_material_sources_changed'], ['UAT', 'approved_material_sources_changed']], 'A digest that is neither version stays a change.');
  const otherStatus = { ...state, artefacts: new Map([...state.artefacts, ['CR', { ...state.artefacts.get('CR'), status: 'revise' }]]) };
  assert.equal(reviewCorrections(otherStatus).has('CR'), false, 'A status other than the one the approvals saw proves no correction.');
  const qaBinding = state.evidence_applicability.by_step.get('QA');
  assert.equal(qaBinding.applicability, 'current'); assert.equal(qaBinding.reason, 'current_with_corrected_reviews');
  const readReport = path => readFileSync(join(a.root, path), 'utf8');
  assert.equal(bindingSourceAssociation(qaBinding, state, readReport).group, 'superseded', 'Without the proof the corrected CR supersedes QA.');
  assert.equal(bindingSourceAssociation(qaBinding, state, path => path.endsWith('CODE_REVIEW.md') ? 'changed' : readReport(path),
    { corrections: reviewCorrections(state) }).group, 'superseded', 'Bytes other than the corrected version are never excused.');

  // SCN-011 to SCN-013: correct the other two reviews and close the run.
  assert.equal(a.internal('TP Review', 'pass', validRows).outcome, 'accepted');
  assert.equal(a.internal('Clean Implementation Review', 'pass', validRows).outcome, 'accepted');
  state = a.state();
  assert.deepEqual([...reviewCorrections(state).keys()].sort(), ['CR', 'Clean Implementation Review', 'TP Review']);
  const closedA = a.closeout();
  assert.equal(closedA.outcome, 'accepted', JSON.stringify(closedA));

  // Case B, shaped like mcp-ergonomics-baseline-20261016-01: CR recorded with `none` and seen by
  // the QA approval, TP Review and Clean Implementation Review never recorded before QA and UAT.
  const b = createRun('review-correction-b');
  for (const step of ['Brownfield Analysis', 'CD+Tests']) assert.equal(b.internal(step).outcome, 'accepted', step);
  assert.equal(b.internal('CR', 'pass', invalidRows, legacy.services.command).outcome, 'accepted');
  assert.equal(b.recordQa(null, legacy.services.command).outcome, 'accepted');
  b.approve('QA', legacy.services.command); b.approve('UAT', legacy.services.command);
  assert.equal(evaluateGateCheck(b.root, { runId: b.f.runId }).current_gate, 'OR');
  // SCN-014: correct the CR and late-record both reviews at OR.
  assert.equal(b.internal('TP Review', 'pass', validRows).outcome, 'accepted');
  assert.equal(b.internal('Clean Implementation Review', 'pass', validRows).outcome, 'accepted');
  const refusedB = b.closeout();
  assert.equal(refusedB.reason, 'closeout_quality_unconfirmed', 'The invalid CR still blocks closeout.');
  assert.ok(detail(refusedB, 'reason_detail').endsWith('Record CR again at gate OR from a corrected source that changes only the required_next_step cells, then record closeout.'));
  assert.equal(b.internal('CR', 'pass', validRows).outcome, 'accepted');
  // SCN-015: the CR correction is proven; both reviews are unseen late recordings, not corrections.
  state = b.state();
  assert.deepEqual([...reviewCorrections(state).keys()], ['CR']);
  // SCN-016: approvals stay valid with both exceptions combined and closeout records.
  const decisionsB = new Map(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].map(gate => [gate, decisionMaterial(b.root, state, gate)]));
  assert.deepEqual(approvedMaterialFindings(state, decisionsB), []);
  assert.equal(state.evidence_applicability.by_step.get('QA').applicability, 'current');
  const closedB = b.closeout();
  assert.equal(closedB.outcome, 'accepted', JSON.stringify(closedB));

  // Case C: the CR was recorded through the review step at gate CR; the correction writes the same owned output.
  const c = createRun('review-correction-c');
  for (const step of ['Brownfield Analysis', 'CD+Tests']) assert.equal(c.internal(step).outcome, 'accepted', step);
  assert.equal(c.reviewStep('pass', invalidRows, legacy.services.command).outcome, 'accepted');
  for (const step of ['TP Review', 'Clean Implementation Review']) assert.equal(c.internal(step, 'pass', validRows, legacy.services.command).outcome, 'accepted', step);
  assert.equal(c.recordQa(null, legacy.services.command).outcome, 'accepted');
  c.approve('QA', legacy.services.command); c.approve('UAT', legacy.services.command);
  const correctedC = c.internal('CR', 'pass', validRows);
  assert.equal(correctedC.outcome, 'accepted', 'A review-step CR is correctable at OR.');
  assert.deepEqual([...reviewCorrections(c.state()).keys()], ['CR']);
  const closedC = c.closeout();
  assert.equal(closedC.outcome, 'accepted', JSON.stringify(closedC));
} finally {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  rmSync(legacy.base, { recursive: true, force: true });
}

console.log('Review finding detection and OR correction (D5) passed.');
