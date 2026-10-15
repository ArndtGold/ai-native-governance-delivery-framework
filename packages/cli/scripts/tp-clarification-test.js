import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { withTpFixture, syntheticTp } from './fixtures/tp-definition.js';
import { createCoreServices } from '../../core/lib/index.js';
import { artefactFileDigest } from '../../core/lib/control-state/run-seal.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';

withTpFixture(f => {
  const digest = artefactFileDigest(f.root, f.prefix + 'PRD.md');
  const questions = `
## Clarification Requests
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-1 | requirements_gap | PRD | open | AC-001 owner is known but restored visibility is unclear | Ask product owner for visibility decision |
## Clarification Details
| finding_id | planning_decision | question | blocking_reason | required_answer | owner | source_ref | resolution_evidence |
|---|---|---|---|---|---|---|---|
| F-1 | Fixture execution | Which user may restore this filter? | Required access checks depend on the answer | Confirm same-user restoration or revise source intent | Product owner | PRD: AC-001 @ ${digest} | pending |
`;
  const open = syntheticTp().replace('| resolved |', '| open |');
  writeFileSync(f.file('TP.md'), open + questions); assert.equal(f.recordTp().value.outcome, 'recorded');
  const check = f.bound('--continue-delivery');
  assert.equal(check.continuation?.phase, 'tp_clarification', JSON.stringify(check));
  assert.equal(check.continuation.questions[0].skill_id, 'prd-definition');
  for (const key of ['question', 'blocking_reason', 'required_answer', 'owner', 'source_ref']) assert.ok(check.continuation.questions[0][key]);
  assert.equal(f.present('TP', 'de').value.outcome, 'rejected');
  assert.equal(f.run('run-approve', '--revision', f.revision(), '--gate', 'TP', '--response', 'Approval: TP').value.outcome, 'rejected');
  const before = f.bytes(), status = f.bound(); assert.notEqual(status.continuation?.phase, 'tp_clarification'); assert.equal(f.bytes(), before);
  assert.equal(f.bound('--continue-delivery').control.revision_id, check.control.revision_id, 'repeated observation does not mutate or repair');
  const revision = f.revise();
  assert.equal(revision.continuation?.phase, 'tp_definition',
    'explicit revision of an open question must reach the bound author so a current answer can be incorporated');
  assert.equal(revision.control.blocking_reason, 'AGDF_TP_TRACEABILITY_INCOMPLETE', 'authoring never clears the finding');
  const wrongAction = f.dispatch('gate-check', '--run', f.runId, '--intake', '--intake-mode', 'resume', '--revision', f.revision(), '--ur-action', 'revise');
  assert.equal(wrongAction.terminal, true, 'a foreign source action stays rejected instead of becoming TP clarification');
  assert.notEqual(wrongAction.continuation?.phase, 'tp_clarification');
  for (const [gap, gate, owner, evidence] of [
    ['requirements_gap', 'UR', 'ur-definition', 'changed user intent: source scope is uncertain'],
    ['design_gap', 'SD', 'sd-definition', 'Store owner boundary is not decided'],
    ['plan_gap', 'TP', 'tp-definition', 'AC-001 lacks an executable access check'],
    ['evidence_gap', 'evidence_obligation', 'gate-check', 'Execution environment is unavailable'],
  ]) {
    const variant = questions.replace('requirements_gap | PRD', gap + ' | ' + gate).replace('AC-001 owner is known but restored visibility is unclear', evidence);
    writeFileSync(f.file('TP.md'), open + variant); assert.equal(f.recordTp(true).value.outcome, 'recorded');
    assert.equal(f.bound('--continue-delivery').continuation.questions[0].skill_id, owner);
  }
  const malformed = questions.replace('Which user may restore this filter?', '');
  writeFileSync(f.file('TP.md'), open + malformed); assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.equal(f.bound('--continue-delivery').continuation.phase, 'tp_definition', 'unassigned malformed question stays with bound clarification preparation');
  assert.equal(f.present('TP', 'de').value.outcome, 'rejected');
  // A row/status or unregistered answer is insufficient to resolve a material question.
  const resolvedQuestions = questions.replace('| open | AC-001', '| resolved | AC-001');
  writeFileSync(f.file('TP.md'), syntheticTp() + resolvedQuestions); assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.equal(f.present('TP', 'de').value.outcome, 'rejected');
  writeFileSync(f.file('answer.md'), 'F-1: Synthetic fixture answer confirms same-user restoration only. Approved AC-001 stays unchanged.');
  const answerPath = f.prefix + 'answer.md', answerDigest = artefactFileDigest(f.root, answerPath);
  const result = createCoreServices().command('agdf_record', { schema_version: '1', presentation_language: 'en', working_directory: f.root,
    primary_target: f.root, target_source: 'explicit_target', target_id: resolveControlCommandTarget(f.root).target_id,
    run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'step.record', payload: { step: 'evidence', source: { path: answerPath, digest: answerDigest }, reason: 'Synthetic unchanged-source answer F-1', covers: 'F-1 clarification' } } });
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  writeFileSync(f.file('TP.md'), syntheticTp() + resolvedQuestions.replace('| pending |', `| ${answerPath} @ ${answerDigest} |`));
  assert.equal(f.recordTp(true).value.outcome, 'recorded');
  assert.equal(f.bound('--continue-delivery').continuation.phase, 'presentation_required', 'only current recorded source-bound answer closes the material question');
  const bytes = readFileSync(f.file('PRD.md')); writeFileSync(f.file('PRD.md'), bytes + '\nStale source.');
  { const blocked = f.bound('--continue-delivery'); assert.equal(blocked.terminal, true, JSON.stringify(blocked)); } writeFileSync(f.file('PRD.md'), bytes);
  assert.equal(f.present('TP', 'de').value.outcome, 'prepared');
});
console.log('TP production clarification routing, blocked approval, no-write status and source-bound answer resumption passed.');
