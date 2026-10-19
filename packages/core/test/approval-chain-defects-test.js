// Regression tests for run core-approval-lock-defects-20261017-01 (D1, D2, D4).
// D3 lock release is covered in run-lock-test.js and the mcp-server worker tests.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readAuthoredContent } from '../lib/control-evaluation/report-decision.js';
import { localizedDecisionFields, observeDecisionContent } from '../lib/control-evaluation/decision-content-readiness.js';
import { evaluateApprovalSummaryReadiness, renderApprovalSummaryIssue } from '../lib/control-state/run-presentation-render.js';
import { evaluateUrReadiness } from '../lib/control-evaluation/ur-readiness.js';
import { qualityReadinessForRunState, evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { createCoreServices } from '../lib/index.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
import { closeoutConfirmation, evaluateCloseoutReadiness, STRUCTURED_REQUIRED_REVIEWS, reviewArtefactType } from '../lib/control-evaluation/closeout-readiness.js';
import { approvedMaterialFindings, approvalMaterialTypes, decisionMaterial } from '../lib/control-state/presentation-decision.js';
import { bindingSourceAssociation } from '../lib/control-state/evidence-bindings.js';
import { internalStepEligibility } from '../lib/control-state/run-operation-proof.js';
import { withSyntheticQaContent } from './fixtures/decision-content.js';

const heading = 'AGDF Approval Summary (de; source=en)';
const languages = { approval_summary_required: true, presentation_language: 'de', artifact_language: 'en', approval_summary_heading: heading };
const summary = lines => `# UR: Synthetic\n\n## 2. Goal\n\nA concrete synthetic goal.\n\n## ${heading}\n\n${lines.join('\n')}\n`;
const goal = '- Ziel: Ein konkretes, prüfbares Ergebnis für die Abnahme liegt vor.';

// D1 / SCN-001: the exact observed failing shape from run mcp-ergonomics-baseline-20261016-01.
const observed = summary([
  '- Problem: Ein lesendes Review der AGDF-MCP-Schnittstellen hat zwölf Abweichungen ergeben.',
  '- Problem (Messlücke): AGDF hat keine Messung, wie gut Agenten die AGDF-MCP-Tools selbst nutzen.',
  '- Ziel: Es gibt eine wiederholbare MCP-Ergonomie-Messung und einen committeten Ausgangswert.',
  '- Nicht-Ziele: Keine Änderung an MCP-Schnittstellen.',
  '- Abnahmesignale: Die Kennzahlen sind mit genauen Rechenregeln definiert.',
  '- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben.',
]);
const read = text => readAuthoredContent(text, 'localized', { locale: 'de', sourceLanguage: 'en' });
assert.equal(read(observed)?.ziel, 'Es gibt eine wiederholbare MCP-Ergonomie-Messung und einen committeten Ausgangswert.',
  'A qualified or unknown label before Ziel no longer hides it.');
assert.equal(read(observed)?.problem, 'Ein lesendes Review der AGDF-MCP-Schnittstellen hat zwölf Abweichungen ergeben.', 'The qualified label never overwrites the plain field.');
assert.equal(evaluateApprovalSummaryReadiness('UR', observed, languages).ready, true);

// D1 / SCN-003: reader matrix.
assert.equal(read(summary(['- Umfang (Teil 1): Erster Teil.', goal]))?.ziel, 'Ein konkretes, prüfbares Ergebnis für die Abnahme liegt vor.');
assert.equal(read(summary([goal, '- Ziel: Ein zweites Ziel.'])), null, 'A duplicate recognised field still invalidates the summary.');
assert.equal(read(summary(['- Problem: Erstes Problem.', 'Fortsetzungszeile ohne Feldschema.', goal]))?.ziel, undefined, 'A prose line still closes the block.');
assert.equal(read(summary(['- Problem: Erstes Problem.', '## Danach', goal]))?.ziel, undefined, 'A heading still closes the block.');
assert.equal(read(summary(['- Problem: Erstes Problem.', '~~~', goal, '~~~']))?.ziel, undefined, 'A fence still closes the block.');
assert.equal(readAuthoredContent('## TP Coverage\n\n- note (x): y\n- delivered_result: Concrete result.\n', 'result'), null,
  'Non-localized profiles keep closing on an unknown line.');

// D1 / SCN-002: unreadable, empty or placeholder Ziel is refused before approval, naming the field.
for (const [name, text] of [
  ['missing Ziel', summary(['- Problem: Ein Problem.'])],
  ['prose before Ziel', summary(['- Problem: Ein Problem.', 'Dieser Satz beendet das Lesen.', goal])],
  ['placeholder Ziel', summary(['- Ziel: TODO'])],
  ['empty Ziel', summary(['- Ziel:'])],
]) {
  const ready = evaluateApprovalSummaryReadiness('UR', text, languages);
  assert.equal(ready.ready, false, name);
  assert.equal(ready.reason, 'approval_summary_field_unreadable', name);
  assert.deepEqual(ready.diagnostics, [{ field: 'ziel', expected: '- Ziel:' }], name);
  const issue = renderApprovalSummaryIssue(ready, { path: 'UR.md', presentationLanguage: 'de' });
  assert.ok(issue.includes('`approval_summary_field_unreadable`') && issue.includes('`- Ziel:`') && issue.includes(heading), issue);
}
const english = { ...languages, presentation_language: 'en', approval_summary_heading: 'AGDF Approval Summary (en; source=de)', artifact_language: 'de' };
const englishText = '# UR: Synthetic\n\n## AGDF Approval Summary (en; source=de)\n\n- Problem: A problem.\n';
assert.deepEqual(evaluateApprovalSummaryReadiness('UR', englishText, english).diagnostics, [{ field: 'goal', expected: '- Goal:' }]);
assert.ok(renderApprovalSummaryIssue(evaluateApprovalSummaryReadiness('UR', englishText, english), { path: 'UR.md', presentationLanguage: 'en' }).includes('`- Goal:`'));
assert.equal(evaluateApprovalSummaryReadiness('UR', summary(['- Problem: Ein Problem.']), { ...languages, approval_summary_required: false }).ready, true,
  'Same-language gates keep their current behaviour.');
const french = '# UR: Synthetic\n\n## AGDF Approval Summary (de; source=fr)\n\n' + goal + '\n';
assert.equal(readAuthoredContent(french, 'localized', { locale: 'de', sourceLanguage: 'fr' })?.ziel, 'Ein konkretes, prüfbares Ergebnis für die Abnahme liegt vor.',
  'Any well-formed artefact language tag is readable; fields are keyed by the display locale.');
assert.equal(evaluateApprovalSummaryReadiness('UR', french, { ...languages, artifact_language: 'fr', approval_summary_heading: 'AGDF Approval Summary (de; source=fr)' }).ready, true);

// UR readiness and the dispatcher continuation name the field.
const temporary = mkdtempSync(join(tmpdir(), 'agdf-approval-chain-'));
try {
  const fixture = join(temporary, 'ur');
  mkdirSync(join(fixture, '.agdf/control/artefacts/r'), { recursive: true });
  writeFileSync(join(fixture, '.agdf/control/config.json'), JSON.stringify({ artifact_language: 'en', chat_language: 'de', runtime_language: 'en' }));
  const urText = ['# UR: Synthetic', '', 'Requirements clarification: complete', '',
    ...['Problem', 'Goal', 'Affected Users', 'Scope', 'Non-Goals', 'Acceptance Signals', 'Existing Source Of Truth', 'Risks And Unknowns', 'Next Step']
      .flatMap(section => [`## ${section}`, '', `Concrete synthetic ${section.toLowerCase()} content.`, '']),
    `## ${heading}`, '', '- Problem: Ein Problem.', 'Freier Satz ohne Feld.', goal, ''].join('\n');
  writeFileSync(join(fixture, '.agdf/control/artefacts/r/UR.md'), urText);
  const urState = { artefacts: new Map([['UR', { path: '.agdf/control/artefacts/r/UR.md' }]]) };
  const urReadiness = evaluateUrReadiness(fixture, urState, { presentationLanguage: 'de' });
  assert.equal(urReadiness.ready, false);
  assert.ok(urReadiness.open_items.includes(heading));
  assert.ok(urReadiness.open_items.some(item => item.includes('`approval_summary_field_unreadable`') && item.includes('`- Ziel:`')), JSON.stringify(urReadiness));

  // D1 / SCN-004: presentation readiness and UAT observation agree, through actual files.
  const qaText = withSyntheticQaContent('# QA: Synthetic\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n');
  mkdirSync(join(fixture, '.agdf/control/runs/r'), { recursive: true });
  for (const [name, lines] of [['observed', null], ['missing', ['- Problem: Ein Problem.']], ['prose', ['- Problem: Ein Problem.', 'Satz.', goal]],
    ['qualified', ['- Ziel (Kurzform): Kurz.', goal]], ['only qualified', ['- Ziel (Kurzform): Kurz.']], ['duplicate', [goal, goal]]]) {
    const text = lines ? urText.slice(0, urText.indexOf(`## ${heading}`)) + `## ${heading}\n\n${lines.join('\n')}\n` : observed;
    writeFileSync(join(fixture, '.agdf/control/artefacts/r/UR.md'), text);
    writeFileSync(join(fixture, '.agdf/control/artefacts/r/QA_REPORT.md'), qaText);
    const state = { run_id: 'r', meta: { lifecycle: 'active' }, mode_slice_decision: { decision: 'structured_slice' },
      content: '# Run\n\n## Objective\n\nA concrete synthetic objective.\n',
      artefacts: new Map([['UR', { path: '.agdf/control/artefacts/r/UR.md' }], ['QA', { path: '.agdf/control/artefacts/r/QA_REPORT.md' }]]) };
    const uat = observeDecisionContent(fixture, state, { gate: 'UAT', locale: 'de', sourceLanguage: 'en' });
    const goalGap = uat.gaps.some(gap => gap.field === 'ziel');
    assert.equal(evaluateApprovalSummaryReadiness('UR', text, languages).ready, !goalGap, name);
  }

  // D1 / SCN-005: QA presentation refuses an unreadable Grenzen line.
  const qaMissing = qaText.replace(/^- Grenzen:.*$/mu, '');
  const qaReady = evaluateApprovalSummaryReadiness('QA', qaMissing, languages, { path: '.agdf/control/artefacts/r/QA_REPORT.md' });
  assert.equal(qaReady.reason, 'approval_summary_field_unreadable');
  assert.deepEqual(qaReady.diagnostics, [{ field: 'grenzen', expected: '- Grenzen:' }]);
  assert.equal(evaluateApprovalSummaryReadiness('QA', qaText, languages, { path: '.agdf/control/artefacts/r/QA_REPORT.md' }).ready, true);
  assert.deepEqual(localizedDecisionFields('QA', qaText, { locale: 'de', sourceLanguage: 'en', path: 'x/QA_REPORT.md' }).gaps, []);
  const qaTwoMissing = qaMissing.replace(/^- Risiken:.*$/mu, '');
  const twoMissing = evaluateApprovalSummaryReadiness('QA', qaTwoMissing, languages, { path: '.agdf/control/artefacts/r/QA_REPORT.md' });
  assert.deepEqual(twoMissing.diagnostics.map(row => row.field), ['grenzen', 'risiken']);
  const twoIssue = renderApprovalSummaryIssue(twoMissing, { path: 'QA_REPORT.md', presentationLanguage: 'de' });
  assert.ok(twoIssue.includes('- Grenzen:') && twoIssue.includes('- Risiken:'), 'The recovery names every unreadable field: ' + twoIssue);
} finally { rmSync(temporary, { recursive: true, force: true }); }

// D2 / SCN-006: recorded review rows map to their decision.
const rows = status => ({ status, notes: 'Recorded exact internal result; operation 5adb5b35-ae5a-4a21-9c93-3e0b2f57269b', path: 'x.md' });
const readiness = statuses => qualityReadinessForRunState({ artefacts: new Map(Object.entries(statuses).filter(([, s]) => s).map(([type, s]) => [type, rows(s)])) }, '');
const passed = readiness({ 'TP Review': 'done', 'Clean Implementation Review': 'done', CR: 'done', QA: 'pass' });
assert.deepEqual(passed.rows.map(row => row.status), ['pass', 'pass', 'pass', 'pass']);
assert.equal(passed.status, 'pass');
assert.deepEqual(readiness({ 'TP Review': 'revise', 'Clean Implementation Review': 'block', CR: 'done', QA: undefined }).rows.map(row => row.status),
  ['revise', 'block', 'pass', 'unknown']);
assert.equal(readiness({ 'TP Review': undefined, 'Clean Implementation Review': undefined, CR: 'done', QA: undefined }).rows[0].status, 'unknown',
  'An absent review still shows missing evidence.');

// D4 units: the Clean Review alias and fail-closed approval material.
assert.equal(reviewArtefactType({ artefacts: new Map([['Clean Review', { path: 'x/CLEAN.md', status: 'done' }]]) }, 'Clean Implementation Review'), 'Clean Review');
assert.equal(reviewArtefactType({ artefacts: new Map() }, 'Clean Implementation Review'), 'Clean Implementation Review');
assert.equal(approvalMaterialTypes({ approvals: new Map([['QA', { status: 'approved', evidence: 'Approval: QA' }]]),
  content: '## Approval Operations\n\n- schema_version: 1\n\n| operation_id | request_digest | receipt |\n|---|---|---|\n| x | y | not-a-receipt |\n' }, 'QA').status, 'invalid',
  'Unreadable approval receipts fail closed.');
assert.equal(approvalMaterialTypes({ approvals: new Map([['QA', { status: 'approved', evidence: 'Approval: QA' }]]), content: '' }, 'QA').status, 'unrecorded');
{
  // Without a material receipt nothing proves the QA approval never saw the review: refuse.
  const legacy = { meta: { lifecycle: 'active' }, mode_slice_decision: { decision: 'structured_slice' }, content: '',
    approvals: new Map([['TP', { status: 'approved' }], ['QA', { status: 'approved', evidence: 'Approval: QA' }]]),
    artefacts: new Map([['CD+Tests', { path: 'x/CD_TESTS.md', status: 'done' }], ['TP Review', { path: '', status: 'missing' }]]) };
  assert.equal(internalStepEligibility(legacy, { current_gate: 'OR' }, { internalStep: 'TP Review' }, '.'), false);
}

// D4 / SCN-011 to SCN-014: review requirement and the closeout dead end.
const legacyCore = async () => {
  // Emulates a runtime from before this fix: the same Core without the QA review branch,
  // so a run can be approved past QA without TP Review and Clean Implementation Review.
  const base = mkdtempSync(join(tmpdir(), 'agdf-pre-fix-core-')), core = resolve(import.meta.dirname, '..');
  for (const part of ['lib', 'generated', 'package.json']) cpSync(join(core, part), join(base, 'packages/core', part), { recursive: true });
  cpSync(resolve(core, '../../plugins/agdf/control/templates'), join(base, 'plugins/agdf/control/templates'), { recursive: true });
  const policy = join(base, 'packages/core/lib/control-evaluation/gate-policy.js'), source = readFileSync(policy, 'utf8');
  const start = source.indexOf('  // The qa-gate forbids a QA pass without review evidence'), end = source.indexOf('  if (gateApprovalStatus(runState, "QA") === "approved" && !isGateSatisfied(runState, "QA"))');
  assert.ok(start > 0 && end > start, 'The emulated pre-fix runtime removes exactly the new QA review branch.');
  writeFileSync(policy, source.slice(0, start) + source.slice(end));
  const proof = join(base, 'packages/core/lib/control-state/run-operation-proof.js'), late = '  if (lateRequiredReviewEligible(state, before, input) || reviewCorrectionCandidate(state, before, input)) return true;\n';
  assert.ok(readFileSync(proof, 'utf8').includes(late), 'The emulated pre-fix runtime removes exactly the late review and OR correction eligibility.');
  writeFileSync(proof, readFileSync(proof, 'utf8').replace(late, ''));
  return { base, services: (await import(pathToFileURL(join(base, 'packages/core/lib/index.js')).href)).createCoreServices() };
};

const root = mkdtempSync(join(tmpdir(), 'agdf-review-dead-end-'));
// A non-pass review states its normalized finding; the writer refuses one without (D5).
const syntheticFindings = decision => decision === 'pass' ? '' : '\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n'
  + '| F-01 | implementation_gap | CD+Tests | open | Synthetic assertion fails in the disposable fixture | Correct the synthetic implementation and rerun its test |\n';
const legacy = await legacyCore();
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const f = createLateSourceRevisionTestRun(root, cli, 'review-dead-end', process.env, { route: 'structured_slice', prepare: false });
  const service = createCoreServices().command, target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const internal = (step, decision = 'pass', run = service) => {
    const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_SOURCE.md';
    writeFileSync(join(root, path), `# ${step}\nStatus: ${decision}\n- decision: ${decision}\nSynthetic exact current result.\n${syntheticFindings(decision)}`);
    return run('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision, source: { path, digest: artefactFileDigest(root, path) } } } });
  };
  for (const step of ['Brownfield Analysis', 'CD+Tests', 'CR']) assert.equal(internal(step).outcome, 'accepted', step);
  const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
  writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: Synthetic dead end\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests recorded.\n\n## Risks\nNo applicable open required finding.\n'));
  const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
    relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = command;
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  const qa = service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));

  // SCN-011: without both reviews the QA approval request is withheld and names the reviews.
  const withheld = evaluateGateCheck(root, { runId: f.runId });
  assert.equal(withheld.current_gate, 'QA'); assert.equal(withheld.missing_approval, 'none');
  assert.equal(withheld.next_allowed_action, 'Record TP Review and Clean Implementation Review before requesting Approval: QA.');
  assert.equal(service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } }).outcome, 'rejected');
  const german = evaluateGateCheck(root, { runId: f.runId, presentationLanguage: 'de' });
  assert.ok(german.status_presentation?.markdown.includes('TP Review und Clean Implementation Review erfassen'), 'The new next step is localized.');

  // Emulate approvals given before this fix: QA and UAT approved without either review.
  for (const gate of ['QA', 'UAT']) {
    const prepared = legacy.services.command('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } });
    assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
    const approved = legacy.services.command('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepared.family_result.presentation_id, response: `Approval: ${gate}` } } });
    assert.equal(approved.outcome, 'accepted', JSON.stringify(approved));
  }
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, 'OR');
  // The observed rejection: the pre-fix runtime refuses both reviews at OR.
  assert.equal(internal('TP Review', 'pass', legacy.services.command).reason, 'internal_step_not_ready');

  // SCN-012: eligibility after QA approval is limited to absent required reviews.
  assert.equal(internal('CD+Tests').reason, 'internal_step_not_ready', 'Other internal steps stay refused after QA approval.');
  // SCN-013: the observed state now accepts both recordings.
  assert.equal(internal('TP Review').outcome, 'accepted');
  assert.equal(internal('TP Review').reason, 'internal_step_not_ready', 'A recorded review is never replaced through the late path.');
  assert.equal(internal('Clean Implementation Review').outcome, 'accepted');

  // SCN-014: no approved-material block; closeout readiness passes and closeout records.
  const check = evaluateGateCheck(root, { runId: f.runId });
  assert.notEqual(check.blocking_reason, 'approved_material_sources_changed', JSON.stringify(check.blocking_reason));
  assert.equal(check.current_gate, 'OR');
  const state = readRunState(root, { runId: f.runId });
  const gateRows = ['UR', 'Brownfield Review', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'].map(type =>
    `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type).status} | ${state.artefacts.get(type)?.path || state.approvals.get(type).evidence} |`).join('\n');
  const orPath = f.prefix + 'OR_CANDIDATE.md';
  const report = `# OR: Synthetic dead end closed\nReport mode: OR-full\nStatus: done\n## Run\n- run_id: ${f.runId}\n- related_ur: ${f.prefix}UR.md\n- related_prd: ${f.prefix}PRD.md\n- related_sd: ${f.prefix}SD.md\n- related_tp: ${f.prefix}TP.md\n- related_qa_report: ${qaPath}\n- mode_slice_decision: structured_slice\n- current_gate: OR\n- decision: pass\n## Gate State\n| Gate or step | Status | Evidence |\n|---|---|---|\n${gateRows}\n## Delivered\nSynthetic exact approved fixture task complete.\n## Not Delivered / Intentionally Deferred\nnone\n## Evidence\nTP Review and Clean Implementation Review were recorded after the QA and UAT approvals.\n## Missing Evidence\nnone\n## Risks And Open Items\nnone\n## Context Graph Impact\n- context_graph_impact: none\n- context_graph_refs: none\n- context_graph_reconciliation: not_applicable\n- context_graph_required_action: none\n- context_graph_gate_effect: none\n- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.\n## Knowledge Persistence Decision\n- memory_target: none\n- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.\n- memory_refs: none\n## Next Permissible Step\n- next_allowed_action: Optional explicitly requested VCS handoff.\n- required_approval: none\n- forbidden_until_then: Automatic Git or release action.\n`;
  writeFileSync(join(root, orPath), report);
  const readReport = path => readFileSync(join(root, path), 'utf8');
  assert.deepEqual(evaluateCloseoutReadiness(state, report, readReport, { prepared: true }).findings, []);

  // Negative: any other change to a source the approvals saw still invalidates. (Editing
  // the sealed bytes on disk would hit the run seal first, so the checks are fed directly.)
  const decisions = new Map(['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].map(gate => [gate, decisionMaterial(root, state, gate)]));
  assert.deepEqual(approvedMaterialFindings(state, decisions), [], 'Late unseen reviews alone keep both approvals valid.');
  const changed = new Map([...decisions].map(([gate, material]) => [gate, { ...material,
    ...(['QA', 'UAT'].includes(gate) ? { sources: material.sources.map(row => row.type === 'CR' ? { ...row, digest: `sha256:${'0'.repeat(64)}` } : row), material_version: `sha256:${'1'.repeat(64)}` } : {}) }]));
  assert.deepEqual(approvedMaterialFindings(state, changed).map(row => [row.gate, row.reason]),
    [['QA', 'approved_material_sources_changed'], ['UAT', 'approved_material_sources_changed']]);
  const qaBinding = state.evidence_applicability.by_step.get('QA');
  assert.equal(qaBinding.applicability, 'current'); assert.equal(qaBinding.reason, 'current_with_late_unseen_reviews', 'QA recorded both reviews as missing; the QA approval never saw them.');
  assert.equal(bindingSourceAssociation(qaBinding, state, readReport, { lateTypes: STRUCTURED_REQUIRED_REVIEWS }).group, 'current');
  assert.equal(bindingSourceAssociation(qaBinding, state, path => path.endsWith('CR_SOURCE.md') || path.endsWith('CODE_REVIEW.md') ? 'changed' : readReport(path),
    { lateTypes: STRUCTURED_REQUIRED_REVIEWS }).group, 'superseded', 'A changed source QA saw is never excused.');
  assert.equal(bindingSourceAssociation(qaBinding, state, readReport).group, 'applicability_unknown', 'Without the late-review allowance QA stays stale.');

  const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: { path: orPath, digest: artefactFileDigest(root, orPath) }, confirmation: '' } } };
  input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
  const closed = service('agdf_closeout', input);
  assert.equal(closed.outcome, 'accepted', JSON.stringify(closed));
} finally {
  rmSync(root, { recursive: true, force: true });
  rmSync(legacy.base, { recursive: true, force: true });
}

// Late recording at UAT (QA approved, UAT pending); a late non-pass TP Review keeps closeout refused and names the review.
{
  const root2 = mkdtempSync(join(tmpdir(), 'agdf-review-dead-end-revise-'));
  const legacy2 = await legacyCore();
  try {
    const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
    execFileSync('git', ['init', '-q', root2]); execFileSync(process.execPath, [cli, 'init', '--dir', root2, '--language', 'en']);
    const f = createLateSourceRevisionTestRun(root2, cli, 'review-dead-end-revise', process.env, { route: 'structured_slice', prepare: false });
    const service = createCoreServices().command, target = resolveControlCommandTarget(root2).target_id;
    const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root2, target_source: 'explicit_target', primary_target: root2,
      target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
    const internal = (step, decision = 'pass') => {
      const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_SOURCE.md';
      writeFileSync(join(root2, path), `# ${step}\nStatus: ${decision}\n- decision: ${decision}\nSynthetic exact current result.\n${syntheticFindings(decision)}`);
      return service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision, source: { path, digest: artefactFileDigest(root2, path) } } } });
    };
    for (const step of ['Brownfield Analysis', 'CD+Tests', 'CR']) assert.equal(internal(step).outcome, 'accepted', step);
    const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
    writeFileSync(join(root2, qaPath), withSyntheticQaContent('# QA: Synthetic\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n'));
    const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
      destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root2, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root2, f.prefix + 'TP.md') },
      relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
    const { schema_version, target_id, run_id, destination, source, relationship } = command;
    writeFileSync(join(root2, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
    command.review.digest = artefactFileDigest(root2, proof); writeFileSync(join(root2, request), JSON.stringify(command));
    assert.equal(service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root2, request) } } } }).outcome, 'accepted');
    const prepared = legacy2.services.command('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } });
    assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
    assert.equal(legacy2.services.command('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate: 'QA', presentation_id: prepared.family_result.presentation_id, response: 'Approval: QA' } } }).outcome, 'accepted');
    assert.equal(evaluateGateCheck(root2, { runId: f.runId }).current_gate, 'UAT');
    assert.equal(internal('TP Review', 'revise').outcome, 'accepted', 'A late review is recordable at UAT and records the decision its report states.');
    assert.equal(internal('Clean Implementation Review').outcome, 'accepted');
    const state = readRunState(root2, { runId: f.runId });
    const findings = evaluateCloseoutReadiness(state, '', path => readFileSync(join(root2, path), 'utf8'), { prepared: true }).findings;
    assert.ok(findings.some(finding => finding === 'closeout_review_unfulfilled:TP Review' || finding === 'closeout_review_result_unconfirmed:TP Review'), JSON.stringify(findings));
  } finally {
    rmSync(root2, { recursive: true, force: true });
    rmSync(legacy2.base, { recursive: true, force: true });
  }
}

// Normal flow after the fix: reviews recorded after the QA report require a QA rerun, then
// QA and UAT approve with both reviews seen and closeout needs no late-review allowance.
{
  const root3 = mkdtempSync(join(tmpdir(), 'agdf-review-normal-flow-'));
  try {
    const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
    execFileSync('git', ['init', '-q', root3]); execFileSync(process.execPath, [cli, 'init', '--dir', root3, '--language', 'en']);
    const f = createLateSourceRevisionTestRun(root3, cli, 'review-normal-flow', process.env, { route: 'structured_slice', prepare: false });
    const service = createCoreServices().command, target = resolveControlCommandTarget(root3).target_id;
    const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root3, target_source: 'explicit_target', primary_target: root3,
      target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
    const internal = (step, decision = 'pass') => {
      const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_SOURCE.md';
      writeFileSync(join(root3, path), `# ${step}\nStatus: ${decision}\n- decision: ${decision}\nSynthetic exact current result.\n${syntheticFindings(decision)}`);
      return service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision, source: { path, digest: artefactFileDigest(root3, path) } } } });
    };
    for (const step of ['Brownfield Analysis', 'CD+Tests', 'CR']) assert.equal(internal(step).outcome, 'accepted', step);
    const qaPath = f.prefix + 'QA_REPORT.md';
    writeFileSync(join(root3, qaPath), withSyntheticQaContent('# QA: Synthetic normal flow\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n'));
    const recordQa = suffix => {
      const proof = f.prefix + `QA_MAPPING-${suffix}.json`, request = f.prefix + `QA_RECORD-${suffix}.json`;
      const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
        destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root3, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root3, f.prefix + 'TP.md') },
        relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
      const { schema_version, target_id, run_id, destination, source, relationship } = command;
      writeFileSync(join(root3, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
      command.review.digest = artefactFileDigest(root3, proof); writeFileSync(join(root3, request), JSON.stringify(command));
      return service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root3, request) } } } });
    };
    assert.equal(recordQa('01').outcome, 'accepted');
    assert.equal(evaluateGateCheck(root3, { runId: f.runId }).next_allowed_action, 'Record TP Review and Clean Implementation Review before requesting Approval: QA.');
    assert.equal(internal('TP Review').outcome, 'accepted', 'Reviews stay recordable at the QA gate.');
    assert.equal(internal('Clean Implementation Review').outcome, 'accepted');
    const stale = evaluateGateCheck(root3, { runId: f.runId });
    assert.equal(stale.missing_approval, 'none', 'A QA report older than the reviews is not presented for approval.');
    assert.equal(stale.next_allowed_action, 'Rerun QA against the current evidence before requesting Approval: QA.');
    const rerun = recordQa('02');
    assert.equal(rerun.outcome, 'accepted', 'QA can be rerun against the current evidence: ' + JSON.stringify(rerun));
    assert.equal(evaluateGateCheck(root3, { runId: f.runId }).missing_approval, 'Approval: QA');
    for (const gate of ['QA', 'UAT']) {
      const prepared = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } });
      assert.equal(prepared.outcome, 'accepted', JSON.stringify(prepared));
      assert.equal(service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepared.family_result.presentation_id, response: `Approval: ${gate}` } } }).outcome, 'accepted');
    }
    const state = readRunState(root3, { runId: f.runId });
    assert.equal(state.evidence_applicability.by_step.get('QA').reason, 'current_exact_association', 'Seen reviews need no late-review allowance.');
    assert.equal(internal('TP Review').reason, 'internal_step_not_ready', 'Reviews the QA approval saw are never re-recorded after approval.');
    const findings = evaluateCloseoutReadiness(state, '', path => readFileSync(join(root3, path), 'utf8'), { prepared: true }).findings;
    assert.equal(findings.some(finding => /review|qa_association|approval_missing/u.test(finding)), false, JSON.stringify(findings));
  } finally { rmSync(root3, { recursive: true, force: true }); }
}

console.log('Approval-chain defects D1, D2 and D4 regressions passed.');
