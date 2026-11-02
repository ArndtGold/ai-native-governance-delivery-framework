import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createSkillDispatchService } from '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-2459f4dd156c/runtime/create-agdf/runtime/core/lib/skill-dispatch/service.js';
import { transitionDecisionForRunState } from '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-2459f4dd156c/runtime/create-agdf/runtime/core/lib/control-evaluation/gate-policy.js';

const pluginRoot = '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-2459f4dd156c';
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const pluginDefinition = readJson(`${pluginRoot}/meta/agdf-plugin.definition.json`);
const interactionLocales = readJson(`${pluginRoot}/meta/agdf-interaction-locales.json`);
const installation = readJson(`${pluginRoot}/.agdf-installation.json`);
const target = { schema_version: '1', resolution_state: 'resolved', reason_code: 'explicit_target',
  primary_target: '/private/tmp/agdf-compact-repro-disposable', governance_target: '/private/tmp/agdf-compact-repro-disposable',
  working_directory: '/private/tmp', target_changed: false, next_action: '', authorizes: false };
const observations = [];
for (const mode of ['quick_task', 'verified_change', 'structured_delivery']) {
  const state = { content: '- lifecycle: active\n- revision_id: 8a2d9929-2081-4efb-8b6b-151b6e78a7a2\n',
    current_gate: mode === 'quick_task' ? 'Quick Task Execution' : 'Verified Change Execution',
    approvals: new Map([['UR', { status: 'approved' }]]),
    artefacts: new Map([['UR', { status: 'approved', path: 'UR.md' }], ['Brownfield Review', { status: 'done', path: 'BROWNFIELD_REVIEW.md' }]]),
    mode_slice_decision: { decision: mode, scope_reason: 'Disposable compact continuation baseline.', evidence: 'Synthetic evaluated control seam.' } };
  const decision = mode === 'structured_delivery'
    ? { status: 'open', current_gate: 'CD+Tests', blocking_reason: 'none', missing_approval: 'none',
        next_allowed_action: 'Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.',
        next_operation: { type: 'implement_approved_plan', skill_id: 'gate-check', operation_key: 'implementation.execute', actor: 'agent', effect: 'implementation', gate: 'CD+Tests' } }
    : transitionDecisionForRunState(state, mode === 'verified_change' ? { status: 'eligible' } : null);
  const report = { ...decision, doctor_status: 'pass', approval_presentation: null,
    status_presentation: { markdown: 'Synthetic current status; no real run or permission.', authorizes: false },
    status_card: { run_id: 'compact-repro', runState: state, mode_slice_decision: mode,
      next_skill: mode === 'quick_task' ? 'none' : 'gate-check', breadcrumb: mode === 'structured_delivery' ? [{ gate: 'TP', status: 'fulfilled' }] : [] } };
  const dispatch = createSkillDispatchService({ pluginDefinition, env: {}, resolveTaskTarget: () => target,
    renderTaskTargetOrientation: () => ({ markdown: 'Synthetic disposable target.', authorizes: false }),
    evaluateGateCheck: () => report });
  const result = dispatch({ skillSet: pluginDefinition.skillSet, interactionLocales, surface: 'codex', expectedVersion: '0.14.5',
    presentationLanguage: 'de', workingDirectory: '/private/tmp', skillId: 'gate-check',
    targetSource: 'explicit_target', primaryTarget: target.primary_target, runId: 'compact-repro', continueDelivery: true });
  assert.equal(result.outcome, mode === 'structured_delivery' ? 'skill_continuation' : 'control_result');
  assert.equal(result.terminal, mode !== 'structured_delivery');
  observations.push({ mode, policy_gate: decision.current_gate, policy_next_operation: decision.next_operation,
    outcome: result.outcome, terminal: result.terminal, phase: result.continuation?.phase ?? null, host_action: result.host_action.mode });
}
console.log(JSON.stringify({ evidence_class: 'installed_code_unit_seam_reproduction', observed_at: new Date().toISOString(),
  installed_build: installation.codex_install_version, source_digest: installation.source_digest,
  inspected_dispatcher_sha256: createHash('sha256').update(readFileSync(`${pluginRoot}/runtime/create-agdf/runtime/core/lib/skill-dispatch/service.js`)).digest('hex'),
  substitutions: ['disposable target resolution', 'evaluated control facts at dispatcher seam', 'synthetic status text'],
  limits: 'No live repository eligibility, native host execution, implementation or approval is exercised.', observations }, null, 2));
