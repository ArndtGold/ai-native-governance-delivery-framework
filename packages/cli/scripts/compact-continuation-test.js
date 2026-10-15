import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { transitionDecisionForRunState } from '#agdf-core/control-evaluation/gate-policy.js';
import { createSkillDispatchService } from '#agdf-core/skill-dispatch/service.js';
import { interactionLocales, pluginDefinition } from '../lib/cli/runtime-context.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-compact-dispatch-'));
const id = 'compact', revision = '10000000-0000-4000-8000-000000000001';
const prefix = `.agdf/control/artefacts/${id}/`;
const path = name => `${prefix}${name}.md`;
const write = (name, content) => writeFileSync(join(root, path(name)), content);
const state = mode => ({ content: `- run_id: ${id}\n- revision_id: ${revision}\n- lifecycle: active\n`,
  approvals: new Map([['UR', { status: 'approved' }]]),
  artefacts: new Map([['UR', { path: path('UR'), status: 'approved' }], ['Brownfield Review', { path: path('BROWNFIELD_REVIEW'), status: 'done' }]]),
  mode_slice_decision: { decision: mode, scope_reason: 'bounded fixture', evidence: path('BROWNFIELD_REVIEW') } });
const target = { resolution_state: 'resolved', governance_target: root, primary_target: root, working_directory: root };
const input = { skillSet: pluginDefinition.skillSet, interactionLocales, surface: 'codex', expectedVersion: pluginDefinition.version, presentationLanguage: 'de', workingDirectory: root,
  targetSource: 'continued_target', primaryTarget: root, runId: id, skillId: 'gate-check', continueDelivery: true };
const report = (s, verified) => ({ ...transitionDecisionForRunState(s, verified), doctor_status: 'pass', verified_change: verified,
  status_card: { run_id: id, mode_slice_decision: s.mode_slice_decision.decision, runState: s }, status_presentation: { markdown: 'status' } });
const dispatch = r => createSkillDispatchService({ resolveTaskTarget: () => target, renderTaskTargetOrientation: () => ({ markdown: 'target' }), evaluateGateCheck: () => r,
  pluginDefinition, readSkillRuntimeContracts: () => [], env: {} });
try {
  mkdirSync(join(root, prefix), { recursive: true });
  write('UR', '# Approved scope\n'); write('BROWNFIELD_REVIEW', '# Bounded route\n'); write('CR', '- decision: pass\n');
  const quick = state('quick_task');
  let r = report(quick);
  assert.equal(r.next_operation.type, 'implement_compact_scope');
  let actual = dispatch(r)(input);
  assert.equal(actual.terminal, false); assert.equal(actual.continuation.phase, 'compact_implementation');
  assert.equal(actual.continuation.run_id, id); assert.equal(actual.continuation.revision_id, revision);
  assert.equal(actual.continuation.source_artifacts[0].path, path('UR'));
  assert.match(actual.continuation.source_artifacts[0].digest, /^sha256:[a-f0-9]{64}$/);
  assert.match(actual.continuation.instruction, /only unfinished work/);
  assert.equal(dispatch(r)({ ...input, continueDelivery: false }).terminal, true);
  assert.equal(dispatch(r)({ ...input, runId: undefined }).terminal, true);
  for (const patch of [{ status: 'blocked' }, { blocking_reason: 'seal_invalid' }, { missing_approval: 'Approval: UR' },
    { next_operation: { ...r.next_operation, effect: 'none' } }, { current_gate: 'UR' }]) {
    assert.notEqual(dispatch({ ...r, ...patch })(input).continuation?.phase, 'compact_implementation');
  }
  for (const changed of [`- lifecycle: completed`, `- lifecycle: closed`]) {
    const altered = { ...quick, content: quick.content.replace('- lifecycle: active', changed) };
    assert.notEqual(dispatch({ ...r, status_card: { ...r.status_card, runState: altered } })(input).continuation?.phase, 'compact_implementation');
  }
  assert.equal(dispatch({ ...r, status_card: { ...r.status_card, run_id: 'foreign' } })(input).outcome, 'evaluator_error');
  rmSync(join(root, path('UR')));
  assert.equal(dispatch(r)(input).outcome, 'evaluator_error');
  symlinkSync(join(root, path('CR')), join(root, path('UR')));
  assert.equal(dispatch(r)(input).outcome, 'evaluator_error');
  rmSync(join(root, path('UR'))); write('UR', '# Approved scope\n');
  quick.artefacts.set('CR', { path: path('CR'), status: 'done' });
  actual = dispatch(report(quick))(input);
  assert.equal(actual.continuation.phase, 'compact_closeout'); assert.equal(actual.skill.skill_id, 'release-or');
  for (const applicability of ['superseded', 'unknown']) {
    quick.evidence_applicability = { by_step: new Map([['CR', { applicability }]]) };
    assert.equal(report(quick).next_operation.type, 'implement_compact_scope');
  }
  quick.evidence_applicability = { by_step: new Map([['CR', { applicability: 'current' }]]) };
  assert.equal(report(quick).next_operation.type, 'record_closeout');
  quick.artefacts.get('CR').status = 'revise';
  assert.equal(report(quick).next_operation.type, 'implement_compact_scope');
  const verified = state('verified_change');
  const content = '- status: eligible\n- canonical_owner: README.md\n- allowed_source_paths: README.md\n- allowed_derived_paths: none\n- validation_commands: node check.mjs\n';
  write('VERIFIED_CHANGE', content);
  verified.artefacts.set('Verified Change', { path: path('VERIFIED_CHANGE'), status: 'eligible' });
  const evaluated = { status: 'eligible', findings: [], record: { path: path('VERIFIED_CHANGE'), content }, escalation_target: 'structured_slice' };
  r = report(verified, evaluated); actual = dispatch(r)(input);
  assert.equal(actual.continuation.phase, 'compact_implementation');
  assert.deepEqual(actual.continuation.verified_change.allowed_source_paths, ['README.md']);
  assert.equal(actual.continuation.verified_change.validation_commands, 'node check.mjs');
  assert.equal(dispatch({ ...r, verified_change: { ...evaluated, status: 'invalid' } })(input).outcome, 'evaluator_error');
  write('VERIFIED_CHANGE', `${content}changed\n`);
  assert.equal(dispatch(r)(input).outcome, 'evaluator_error');
  write('VERIFIED_CHANGE', content);
  for (const status of ['missing', 'draft', 'invalid', 'escalated']) {
    assert.notEqual(report(verified, { ...evaluated, status }).next_operation.type, 'implement_compact_scope');
  }
  const executed = { ...evaluated, status: 'executed' };
  actual = dispatch(report(verified, executed))(input);
  assert.equal(actual.continuation.phase, 'compact_closeout');
  assert.match(actual.continuation.instruction, /run-update/);
  verified.content = verified.content.replace('active', 'completed');
  verified.artefacts.set('OR', { path: path('VERIFIED_CHANGE'), status: 'done' });
  r = report(verified, executed);
  assert.equal(r.next_operation, null); assert.equal(r.completion.fulfilled, true);
  assert.equal(dispatch(r)(input).terminal, true);
  console.log('Compact continuation policy and dispatcher boundaries passed');
} finally { rmSync(root, { recursive: true, force: true }); }
