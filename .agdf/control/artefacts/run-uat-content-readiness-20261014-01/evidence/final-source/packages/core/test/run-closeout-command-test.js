import { withSyntheticQaContent } from './fixtures/decision-content.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createCoreServices } from '../lib/index.js';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { resolveControlCommandTarget, canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../lib/control-state/run-seal.js';
import { readRunState, prepareRunContentState } from '../lib/control-evaluation/run-state.js';
import { closeoutConfirmation, evaluateCloseoutReadiness } from '../lib/control-evaluation/closeout-readiness.js';
import { appendTableRow } from '../lib/control-state/run-state-edits.js';
import { readPendingRunStepJournal } from '../lib/control-state/run-step-transaction.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { intentStages, outputStages, commitStages, beforeIntent, beforeRunCommit } from './fixtures/transaction-checkpoints.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-closeout-command-')), seed = mkdtempSync(join(tmpdir(), 'agdf-closeout-seed-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const route = process.env.AGDF_TEST_STRUCTURED_ROUTE ?? 'structured_delivery';
  assert.ok(['structured_slice', 'structured_delivery'].includes(route));
  const f = createLateSourceRevisionTestRun(root, cli, 'structured-closeout-command', process.env, { route, prepare: false }), service = createCoreServices().command, target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const prePreparation = join(seed, 'pre-preparation'); cpSync(join(root, '.agdf'), prePreparation, { recursive: true });
  const preparationPath = f.prefix + 'BROWNFIELD_CANDIDATE.md';
  const preparation = (text, decision = 'pass', reason) => {
    writeFileSync(join(root, preparationPath), text);
    return service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: {
      step: 'internal', internal_step: 'Brownfield Analysis', decision, ...(reason ? { reason } : {}),
      source: { path: preparationPath, digest: artefactFileDigest(root, preparationPath) } } } });
  };
  for (const text of ['~~~\nDecision: pass\n~~~\n', '> Example:\nDecision: pass\n', '## Examples\nDecision: pass\n']) {
    const before = readFileSync(f.state, 'utf8');
    assert.equal(preparation(text).outcome, 'rejected', 'Actual internal registrar excludes example-only result');
    assert.equal(readFileSync(f.state, 'utf8'), before);
  }
  const beforeNotApplicable = readFileSync(f.state, 'utf8');
  assert.equal(preparation('Decision: not_applicable\n', 'not_applicable').outcome, 'rejected', 'Internal not_applicable still requires a reason');
  assert.equal(readFileSync(f.state, 'utf8'), beforeNotApplicable);
  assert.equal(preparation('Decision: not_applicable\n', 'not_applicable', 'Synthetic bounded preparation applicability observation').outcome, 'accepted');
  assert.equal(evaluateGateCheck(root, { runId: f.runId }).current_gate, 'CD+Tests');
  rmSync(join(root, '.agdf'), { recursive: true }); cpSync(prePreparation, join(root, '.agdf'), { recursive: true });
  assert.equal(preparation('# Brownfield Analysis\n- decision: pass\n\n## Examples\nDecision: block\n').outcome, 'accepted');
  for (const step of ['CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
    const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_CANDIDATE.md';
    for (const text of ['~~~\nDecision: pass\n~~~\n', '> Example:\nDecision: pass\n', '## Examples\nDecision: pass\n']) {
      writeFileSync(join(root, path), text);
      const before = readFileSync(f.state, 'utf8');
      const denied = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step,
        decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
      assert.equal(denied.outcome, 'rejected'); assert.equal(readFileSync(f.state, 'utf8'), before);
    }
    writeFileSync(join(root, path), 'Decision: not_applicable\n');
    const before = readFileSync(f.state, 'utf8');
    assert.equal(service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step,
      decision: 'not_applicable', reason: 'Synthetic attempted mandatory-step bypass', source: { path, digest: artefactFileDigest(root, path) } } } }).outcome, 'rejected');
    assert.equal(readFileSync(f.state, 'utf8'), before);
    writeFileSync(join(root, path), '# ' + step + '\nStatus: pass\n- decision: pass\nSynthetic exact current result.\n\n## Examples\nDecision: block\n');
    const recorded = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  }
  const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
  writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: Synthetic closeout\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Examples\n~~~text\nDecision: block\n~~~\n> Example:\nDecision: unknown\n\n## Risks\nNo applicable open required finding.\n'));
  const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
    relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = command;
  const preQa = join(seed, 'pre-qa'); cpSync(join(root, '.agdf'), preQa, { recursive: true });
  const passReport = readFileSync(join(root, qaPath), 'utf8');
  for (const [gap, targetName, allowed] of [['implementation_gap', 'CD+Tests', true], ['evidence_gap', 'evidence_obligation', false]]) {
    const report = `# QA: Synthetic corrective work\n- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| CORRECTION-001 | ${gap} | ${targetName} | open | Actual synthetic missing obligation | Resolve the registered obligation |\n`;
    writeFileSync(join(root, qaPath), report);
    const reviewed = { ...command, destination: { ...destination, digest: artefactFileDigest(root, qaPath), status: 'revise' },
      expected_revision_id: f.revision() };
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination: reviewed.destination, source, relationship, reviewer: reviewed.review.reviewer, reviewed: true }));
    reviewed.review = { ...reviewed.review, digest: artefactFileDigest(root, proof) }; writeFileSync(join(root, request), JSON.stringify(reviewed));
    const registered = service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
    assert.equal(registered.outcome, 'accepted', JSON.stringify(registered));
    const cdPath = f.prefix + 'CORRECTIVE_CD.md'; writeFileSync(join(root, cdPath), '# CD+Tests\n- decision: pass\nSynthetic registered corrective implementation completed.\n');
    const before = readFileSync(f.state, 'utf8');
    const corrected = service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: 'CD+Tests', decision: 'pass', source: { path: cdPath, digest: artefactFileDigest(root, cdPath) } } } });
    assert.equal(corrected.outcome, allowed ? 'accepted' : 'rejected', JSON.stringify(corrected));
    if (allowed) {
      const current = readRunState(root, { runId: f.runId });
      assert.equal(current.evidence_applicability.by_step.get('CR').applicability, 'superseded', 'Changed implementation cannot retain the old review as current.');
      assert.equal(current.approvals.get('QA').status, 'missing');
    } else assert.equal(readFileSync(f.state, 'utf8'), before, 'An evidence-only gap grants no implementation effect.');
    rmSync(join(root, '.agdf'), { recursive: true }); cpSync(preQa, join(root, '.agdf'), { recursive: true });
  }
  for (const text of ['# QA\nStatus: pass\nDecision: revise\n', '# QA\nStatus: pass\nDecision: unknown\n', '# QA\nStatus: draft\n',
    '# QA\n~~~\nDecision: pass\n~~~\n', '# QA\n> Example:\nDecision: pass\n', '# QA\n## Examples\nDecision: pass\n']) {
    writeFileSync(join(root, qaPath), text);
    const candidate = { ...command, expected_revision_id: f.revision(), destination: { ...destination, digest: artefactFileDigest(root, qaPath) } };
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination: candidate.destination, source, relationship, reviewer: candidate.review.reviewer, reviewed: true }));
    candidate.review = { ...candidate.review, digest: artefactFileDigest(root, proof) };
    writeFileSync(join(root, request), JSON.stringify(candidate));
    const before = readFileSync(f.state, 'utf8');
    const denied = service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
    assert.equal(denied.outcome, 'rejected', 'Conflicting/unknown/missing results are refused by the actual QA registrar before approval.');
    assert.equal(readFileSync(f.state, 'utf8'), before);
  }
  writeFileSync(join(root, qaPath), passReport);
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  // Current technical pass alone is registerable evidence, never a complete
  // decision brief. Exercise actual prepare/inspection after canonical recording.
  for (const report of [passReport.replace(/^- delivered_result:.*$/mu, '- delivered_result: pass'),
    passReport.replace(/^- delivered_result:.*$/mu, '> Example:\n- delivered_result: invented'),
    passReport.replace(/^- qualification_limits:.*$/mu, ''),
    passReport.replace(/^- delivered_result:.*$/mu, '- delivered_result: <Concrete result>')]) {
    rmSync(join(root, '.agdf'), { recursive: true, force: true }); cpSync(preQa, join(root, '.agdf'), { recursive: true });
    writeFileSync(join(root, qaPath), report);
    const candidate = { ...command, expected_revision_id: f.revision(), destination: { ...destination, digest: artefactFileDigest(root, qaPath) } };
    writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination: candidate.destination, source, relationship, reviewer: candidate.review.reviewer, reviewed: true }));
    candidate.review = { ...candidate.review, digest: artefactFileDigest(root, proof) }; writeFileSync(join(root, request), JSON.stringify(candidate));
    assert.equal(service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } }).outcome, 'accepted');
    const before = readFileSync(f.state, 'utf8'), backlog = readFileSync(join(root,'.agdf/control/MASTER_BACKLOG.md'),'utf8');
    const check = evaluateGateCheck(root,{runId:f.runId});
    assert.equal(check.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE');
    assert.notEqual(check.next_operation.type,'human_gate_decision');assert.equal(check.approval_presentation,null);
    assert.ok(check.status_presentation?.markdown, 'A truthful gap retains visible read-only status.');
    const denied = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate: 'QA' } } });
    assert.equal(denied.outcome,'rejected',JSON.stringify(denied));
    assert.equal(readFileSync(f.state,'utf8'),before);assert.equal(readFileSync(join(root,'.agdf/control/MASTER_BACKLOG.md'),'utf8'),backlog);
    assert.equal(readFileSync(join(root,qaPath),'utf8'),report,'No approved or unapproved content is silently repaired by inspection/preparation.');
  }
  rmSync(join(root, '.agdf'), { recursive: true, force: true }); cpSync(preQa, join(root, '.agdf'), { recursive: true });
  writeFileSync(join(root,qaPath),passReport);
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  const qa = service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));
  for (const gate of ['QA', 'UAT']) {
    const prepare = service('agdf_prepare', { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } });
    assert.equal(prepare.outcome, 'accepted', JSON.stringify(prepare));
    if (gate === 'UAT') {
      const exact = readFileSync(join(root,`.agdf/control/runs/${f.runId}/presentations/${prepare.family_result.presentation_id}.document`),'utf8');
      for(const value of ['Intended outcome:', 'Delivered result:', 'Technical QA: pass', 'Qualification limits:', 'Risks and open issues:', 'Approval effect:']) assert.ok(exact.includes(value),value);
      assert.ok(exact.includes('The isolated fixture implements its declared scoped behavior'));
      assert.ok(exact.includes('native host qualification is unobserved'));
    }
    const approval = service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepare.family_result.presentation_id, response: `Approval: ${gate}` } } });
    assert.equal(approval.outcome, 'accepted', JSON.stringify(approval));
  }
  const state = readRunState(root, { runId: f.runId });
  const rows = ['UR', 'Brownfield Review', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'].map(type => `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type).status} | ${state.artefacts.get(type)?.path || state.approvals.get(type).evidence} |`).join('\n');
  const orPath = f.prefix + 'OR_CANDIDATE.md';
  const report = `# OR: Synthetic closeout
Report mode: OR-full
Status: done
## Run
- run_id: ${f.runId}
- related_ur: ${f.prefix}UR.md
- related_prd: ${f.prefix}PRD.md
- related_sd: ${f.prefix}SD.md
- related_tp: ${f.prefix}TP.md
- related_qa_report: ${qaPath}
- mode_slice_decision: ${route}
- current_gate: OR
- decision: pass
## Gate State
| Gate or step | Status | Evidence |
|---|---|---|
${rows}
## Delivered
Synthetic exact approved fixture task and checks complete.
## Not Delivered / Intentionally Deferred
none
## Evidence
Actual fixture QA and all mandatory reviews are registered and approved.
## Missing Evidence
none
## Risks And Open Items
none
## Context Graph Impact
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.
## Knowledge Persistence Decision
- memory_target: none
- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.
- memory_refs: none
## Next Permissible Step
- next_allowed_action: Optional explicitly requested VCS handoff.
- required_approval: none
- forbidden_until_then: Automatic Git or release action.
`;
  writeFileSync(join(root, orPath), report);
  cpSync(join(root, '.agdf'), join(seed, 'control'), { recursive: true });
  const reset = () => { rmSync(join(root, '.agdf'), { recursive: true }); cpSync(join(seed, 'control'), join(root, '.agdf'), { recursive: true }); };
  const prepare = () => { const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: { path: orPath, digest: artefactFileDigest(root, orPath) }, confirmation: '' } } };
    input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest); return input; };
  const input = prepare(), original = readFileSync(f.state, 'utf8');
  const withParent = appendTableRow(original, 'Artefact Chain', ['OR', 'reconciles_with', 'parent_run:unavailable-parent', 'Synthetic explicit handoff']);
  const observedParent = prepareRunContentState(root, withParent);
  assert.equal(observedParent.reconciliation_state.parent_reconciliation.outcome, 'open');
  const readReport = path => readFileSync(join(root, path), 'utf8');
  assert.equal(evaluateCloseoutReadiness(state, report, readReport, { prepared: true }).ready, true,
    'An actually registered and QA/UAT-approved report with agreeing Status/Decision closes without rewriting its bytes.');
  for (const qaContent of ['Status: pass\nDecision: revise\n', 'Status: block\nDecision: pass\n',
    'Status: draft\nDecision: unknown\n', 'No technical decision\n', '~~~\nDecision: pass\n~~~\n', '> Example:\nDecision: pass\n']) {
    const observed = evaluateCloseoutReadiness(state, report,
      path => path === qaPath ? qaContent : readReport(path), { prepared: true });
    assert.ok(observed.findings.includes('closeout_qa_pass_unconfirmed'), 'Conflicting or absent supported QA result cannot close.');
  }
  const approvalBytes = readFileSync(join(root, qaPath));
  writeFileSync(join(root, qaPath), passReport + '\nDecision: pass\n');
  const changedApproved = service('agdf_closeout', prepare());
  assert.equal(changedApproved.outcome, 'rejected', 'Consistent result deduplication never permits altered approved bytes.');
  assert.equal(readFileSync(f.state, 'utf8'), original);
  writeFileSync(join(root, qaPath), approvalBytes);
  assert.ok(evaluateCloseoutReadiness(observedParent, report, readReport, { prepared: true }).findings.includes('parent_reconciliation_required'));
  const acceptedParent = prepareRunContentState(root, withParent + '\n\n## Parent Reconciliation Handoff\n\n- parent_reconciliation_disposition: accepted_open\n- parent_reconciliation_next_action: Reconcile the explicit handoff through the parent owner later.\n');
  assert.equal(acceptedParent.reconciliation_state.parent_reconciliation.disposition, 'accepted_open');
  assert.equal(evaluateCloseoutReadiness(acceptedParent, report, readReport, { prepared: true }).ready, true);
  assert.equal(readFileSync(f.state, 'utf8'), original, 'Reconciliation observations never close or rewrite another Run.');
  for (const altered of [report.replace(`- run_id: ${f.runId}`, '- run_id: foreign-run'),
    report.replace('Status: done', 'Status: done\nStatus: block'), report.replace('Report mode: OR-full', 'Report mode: OR-full\n- report_mode: OR-lite'),
    report.replace('- decision: pass', '- decision: pass\n- decision: block'),
    report.replace(`- related_tp: ${f.prefix}TP.md`, '- related_tp: .agdf/control/artefacts/foreign/TP.md'),
    report.replace(`| CR | done | ${state.artefacts.get('CR').path} |`, '| CR | done | Fictional unregistered result |'),
    report.replace('- context_graph_impact: none', '- context_graph_impact: new_node_required'),
    report.replace('- memory_target: none', '- memory_target: context_graph'),
    report.replace('- context_graph_reconciliation: not_applicable', '- context_graph_reconciliation: open_gap'),
    report.replace('## Risks And Open Items\nnone', '## Risks And Open Items\n| Actual obligation | block | Still required |')]) {
    writeFileSync(join(root, orPath), altered);
    const rejected = service('agdf_closeout', prepare());
    assert.equal(rejected.outcome, 'rejected', JSON.stringify(rejected));
    assert.equal(rejected.reason, 'closeout_obligations_unfulfilled', JSON.stringify(rejected));
    assert.equal(readFileSync(f.state, 'utf8'), original, 'An OR assertion cannot establish missing actual authority.');
  }
  writeFileSync(join(root, orPath), report);
  const unconfirmed = service('agdf_closeout', { ...input, command: { ...input.command, payload: { ...input.command.payload, confirmation: 'Tool allowed' } } });
  assert.equal(unconfirmed.reason, 'closeout_confirmation_required', JSON.stringify(unconfirmed));
  assert.equal(readFileSync(f.state, 'utf8'), original);
  const closed = service('agdf_closeout', input); assert.equal(closed.outcome, 'accepted', JSON.stringify(closed));
  assert.equal(closed.current.lifecycle, 'completed'); assert.equal(closed.current.completion.fulfilled, true); assert.equal(closed.current.next_operation, null);
  assert.equal(readFileSync(f.file('OR.md'), 'utf8'), report);
  assert.equal(service('agdf_closeout', input).outcome, 'already_applied');
  assert.equal(service('agdf_closeout', { ...input, presentation_language: 'de' }).reason, 'operation_payload_conflict');
  assert.equal(service('agdf_closeout', prepare()).reason, 'closeout_not_ready');
  for (const stage of [...intentStages, ...outputStages, ...commitStages]) {
    reset(); const request = prepare();
    const program = `import {createRunCommandService} from ${JSON.stringify(new URL('../lib/control-state/run-command-service.js', import.meta.url).href)};
      createRunCommandService({checkpoint(point){if(point===process.argv[2])process.exit(71)}})('agdf_closeout',JSON.parse(process.argv[1]));`;
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', program, JSON.stringify(request), stage]);
    assert.equal(child.status, 71, child.stderr.toString());
    if (!beforeIntent(stage) && stage !== 'retired') {
      const pending = readPendingRunStepJournal(root, f.runId);
      const recovered = service('agdf_closeout', { ...request, expected_revision_id: f.revision(), command: { kind: 'operation.recover', payload: { original_kind: 'closeout.record', pending_digest: digest(canonicalJson(pending)), recovery_revision_id: f.revision() } } });
      assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
    }
    assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
    if (beforeRunCommit(stage)) assert.equal(readFileSync(f.state, 'utf8'), original, stage);
    const retry = service('agdf_closeout', request); assert.equal(retry.outcome, beforeRunCommit(stage) ? 'accepted' : 'already_applied', stage + ': ' + JSON.stringify(retry));
    assert.equal(evaluateGateCheck(root, { runId: f.runId }).completion.fulfilled, true);
  }
  console.log('Structured prepared OR, actual reviews/QA/UAT, exact confirmation, completed semantics and process interruption/recovery passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); rmSync(seed, { recursive: true, force: true }); }
