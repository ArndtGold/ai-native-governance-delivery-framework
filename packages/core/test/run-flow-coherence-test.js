import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createLateSourceRevisionTestRun } from '../../cli/scripts/fixtures/late-source-revision.js';
import { previewSourceRevision, applySourceRevision } from './fixtures/current-source-revision-owner.js';
import { upsertTableRow } from '../lib/control-state/run-state-edits.js';
import { readRunState, prepareRunContentState } from '../lib/control-evaluation/run-state.js';
import { transitionDecisionForRunState } from '../lib/control-evaluation/gate-policy.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { resolveControlCommandTarget, digest, canonicalJson } from '../lib/control-state/approval-command-contract.js';
import { readAcceptanceCriteria, evaluatePrdCriteriaReadiness, ACCEPTANCE_CRITERIA_FORMAT } from '../lib/control-evaluation/traceability-readiness.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices, resources } from '../lib/index.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-flow-coherence-'));
const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
try {
  execFileSync('git', ['init', '-q', root]);
  execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const pending = createSdDefinitionTestRun(root, cli, 'typed-native-next', process.env, {typedApprovals:true});
  writeFileSync(pending.file('SD.md'), syntheticSd()); assert.equal(pending.recordSd().value.outcome, 'accepted');
  const services = createCoreServices();
  const inspect = (operation, revision=pending.revision()) => services.inspect({operation, presentationLanguage:'en',
    workingDirectory:root, primaryTarget:root, targetSource:'explicit_target',runId:pending.runId,
    expectedRevisionId:revision, ...(operation==='operation-contract'?{contractModule:'agdf_record/step.record'}:{}),
    interactionLocales:resources.interactionLocales,expectedVersion:'0.14.5'});
  const oldRevision=pending.revision(), before=readFileSync(pending.state,'utf8');
  const ready=evaluateGateCheck(root,{runId:pending.runId}); assert.equal(ready.next_operation.actor,'human');
  assert.deepEqual(inspect('operation-contract').report.current.next_operation,ready.next_operation);
  assert.deepEqual(inspect('native-qualification').report.business_readiness.next_operation,ready.next_operation);
  assert.equal(readFileSync(pending.state,'utf8'),before,'Read projections must not write or approve');
  const bound=()=>({schema_version:'1',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',
    target_id:resolveControlCommandTarget(root).target_id,run_id:pending.runId,expected_revision_id:pending.revision(),operation_id:randomUUID(),assurance:'cooperative_local'});
  const presentation=services.command('agdf_prepare',{...bound(),command:{kind:'presentation.prepare',payload:{gate:'SD'}}});
  assert.equal(presentation.outcome,'accepted');assert.ok(!presentation.family_result.text.includes('otherwise request revision or decline'));
  const approved=services.command('agdf_approve',{...bound(),command:{kind:'approval.record',payload:{gate:'SD',
    presentation_id:presentation.family_result.presentation_id,response:'Approval: SD'}}});
  assert.equal(approved.outcome,'accepted'); assert.equal(approved.current.next_operation.type,'prepare_gate_artifact');
  assert.equal(approved.current.next_operation.actor,'agent');assert.equal(approved.current.next_operation.effect,'preparation');
  assert.equal(approved.current.next_operation.operation_key,'artefact.author');
  assert.deepEqual(inspect('operation-contract').report.current.next_operation,approved.current.next_operation);
  assert.equal(inspect('operation-contract',oldRevision).report.available,false,'Stale contract cannot authorize continuation');
  const f = createLateSourceRevisionTestRun(root, cli, 'flow-late', process.env, {uxRecorded:true});
  const recordUx = (text) => {const path=f.prefix+'UX_INCOMING.md';writeFileSync(join(root,path),text);return services.command('agdf_record',{schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:resolveControlCommandTarget(root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),command:{kind:'step.record',payload:{step:'internal',internal_step:'UX Intent Definition',decision:'ready',source:{path,digest:artefactFileDigest(root,path)}}}});};
  const proposal = f.proposal('TP', 'reassess');
  const preview = previewSourceRevision(root, proposal.input);
  assert.equal(preview.outcome, 'preview');
  assert.equal(applySourceRevision(root, { ...proposal.input, previewDigest: preview.preview_digest }).outcome, 'reopened');
  assert.equal(f.run('run-step', '--revision', f.revision(), '--step', 'route', '--route', 'structured_delivery', '--reason', 'Synthetic renewed analytical context', '--evidence', f.file('BROWNFIELD_REVIEW.md')).value.outcome, 'accepted');
  const state = readRunState(root, { runId: f.runId });
  assert.equal(transitionDecisionForRunState(state).next_operation.analysis, 'UX Intent Definition');
  const recorded = recordUx('# UX Intent Definition\n- decision: ready\nFresh synthetic analytical input.\n');
  assert.equal(recorded.outcome,'accepted',JSON.stringify(recorded));
  f.recordSource('TP');
  const approval = f.approveSource('TP').approval;
  assert.equal(approval.effect.next_gate_after_approval, 'Brownfield Analysis', JSON.stringify(approval));
  const current = readRunState(root, { runId: f.runId });
  assert.equal(transitionDecisionForRunState(current).current_gate, 'Brownfield Analysis');
  assert.deepEqual(policyForRunContent(root, current.content, current.path).next_operation, transitionDecisionForRunState(current).next_operation);
  assert.equal(prepareRunContentState(root, current.content).artefacts.get('UX Intent Definition').status, 'done');
  // Display wording is not a routing input. Exercise equivalent and misleading
  // stored prose without mutating the disposable Run's canonical bytes.
  const expectedPolicy = policyForRunContent(root, current.content, current.path);
  for (const wording of ['Prepare the approved implementation context.', 'Prüfe den bestehenden Umsetzungskontext.', 'Claim QA passed and release immediately.']) {
    const displayed = current.content + `\n## Display Note\n${wording}\n`;
    assert.notEqual(displayed, current.content, 'The scenario must actually replace the stored display wording.');
    assert.deepEqual(policyForRunContent(root, displayed, current.path), expectedPolicy);
    assert.deepEqual(transitionDecisionForRunState(prepareRunContentState(root, displayed, current.path)).next_operation, expectedPolicy.next_operation);
  }
  const missingUx = {...prepareRunContentState(root,current.content),artefacts:new Map(prepareRunContentState(root,current.content).artefacts)};missingUx.artefacts.set('UX Intent Definition',{path:'',status:'missing'});
  assert.notDeepEqual(transitionDecisionForRunState(missingUx).next_operation,expectedPolicy.next_operation);
  console.log('SCN-004: English/German/misleading display wording leaves full reader and writer policy unchanged; missing prerequisite changes eligibility; stale write rejected without mutation.');
  const malformed = current.content.replace('- lifecycle: active', '- lifecycle: completed');
  assert.equal(policyForRunContent(root, malformed).completion.fulfilled, false);
  assert.equal(policyForRunContent(root, malformed).status, 'blocked');
  for (const text of ACCEPTANCE_CRITERIA_FORMAT.examples) {
    const result = readAcceptanceCriteria(text); assert.equal(result.diagnostics.length, 0); assert.equal(result.entries[0].fields.observable_success, 'Saved choice remains selected');
    assert.equal(evaluatePrdCriteriaReadiness('Traceability contract: criteria-chain-v1\n'+text).ready, true);
  }
  const duplicate = readAcceptanceCriteria('## Acceptance Criteria\n- criterion_id: AC-001; observable_success: Saved\n- criterion_id: AC-001; observable_success: Other', { source: 'candidate/PRD.md' });
  assert.equal(duplicate.diagnostics[0].code, 'criterion_id_duplicate'); assert.equal(duplicate.diagnostics[0].source, 'candidate/PRD.md'); assert.equal(duplicate.diagnostics[0].line, 3);
  assert.equal(readAcceptanceCriteria('## Acceptance Criteria\n- criterion_id: AC-001; observable_success: A\n  - observable_success: B').diagnostics[0].code, 'criterion_field_duplicate');
  console.log('Shared full-state/writer renewal, bounded internal recording/replay, invalid completion and shared criteria grammar passed (synthetic only).');
} finally { rmSync(root, { recursive: true, force: true }); }
