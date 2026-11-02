import { createInputResolution, withInputResolution } from './input-resolution.js';
import { inspectRunInputResolution } from './run-input-resolution.js';
import { resolveConfiguration } from '../resources/configuration.js';
import { resources } from '../resources/context.js';
import { withLiveControlReads } from '../control-read/fs.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { executeApprovalCommand } from './approval-command.js';
import { recordRunPresentationDecision } from './run-steps.js';
import { inspectRunOperation } from './run-operation-status.js';
import { resolveControlCommandTarget, COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { validateDecisionAction, enabledDecisionActions, decisionActionRequestDigest } from './decision-action-contract.js';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS } from './run-command-contract.js';
import { observeCurrentRunCommand } from './run-command-service.js';

// Private serving composition. Binding is held by the decision-session owner, never
// accepted as model/App input. Qualification is package/host evidence, not a gesture credential.
export function createDecisionActionService({ enabledGroups = Object.keys(RUN_COMMAND_GROUPS), appOnlyMediationQualified = false,
  packageVersion = '0.14.5', checkpoint = () => {} } = {}) {
  const actions = enabledDecisionActions(enabledGroups);
  return (root, binding, input) => withLiveControlReads(() => {
    const diagnostics = validateDecisionAction(input);
    const result = (outcome, reason, family = {}) => {
      let observed;
      try { observed = inspectRunOperation(root, { runId: binding.run_id, operationId: input.operation_id, targetId: binding.target_id }); } catch {}
      const receipt = family.receipt ?? observed?.receipt ?? null;
      const response = { schema_version: '1', outcome, reason: reason ?? null, operation_id: input.operation_id ?? null,
        receipt, historical_effect: Boolean(family.historical_effect || outcome === 'already_applied'),
        current: observeCurrentRunCommand(root, { ...binding, presentation_language: binding.presentation_language }),
        assurance: COOPERATIVE_ASSURANCE, input_route: 'app_only_cooperative', authorizes: false,
        recovery: outcome === 'effect_unknown' ? 'Inspect operation-status using the original UUID. Preserve the exact original submission; do not create another decision.' : null };
      return Buffer.byteLength(JSON.stringify(response)) <= RUN_COMMAND_LIMITS.result_bytes ? response
        : { schema_version: '1', outcome: 'effect_unknown', reason: 'command_result_budget_exceeded', operation_id: input.operation_id, authorizes: false };
    };
    // Invalid input never reaches a filesystem owner or an observation based on that input.
    if (diagnostics.length) return { schema_version: '1', outcome: 'rejected', reason: 'decision_schema_invalid', diagnostics, authorizes: false };
    if (!actions.includes(input.action)) return result('rejected', 'command_group_disabled');
    if (!appOnlyMediationQualified) return result('rejected', 'app_only_mediation_not_qualified');
    const target = resolveControlCommandTarget(root);
    if (input.presentation_id !== binding.presentation_id || input.expected_revision_id !== binding.expected_revision_id
      || target.target_id !== binding.target_id) return result('rejected', 'decision_binding_invalid');
    root = target.root;
    const requestDigest = decisionActionRequestDigest(binding, input);
    let dispatched = false;
    try {
      const publicInput = { schema_version: '1', assurance: 'cooperative_local', working_directory: root, primary_target: root,
        target_source: 'explicit_target', target_id: binding.target_id, run_id: binding.run_id,
        expected_revision_id: binding.expected_revision_id, operation_id: input.operation_id,
        ...(binding.presentation_language ? { presentation_language: binding.presentation_language } : {}),
        command: { kind: input.action === 'approve' ? 'approval.record' : 'presentation_decision.record', payload: {} } };
      const original = inspectRunInputResolution(root, publicInput);
      if (original?.known && (!original.resolution || original.resolution.logical_digest !== requestDigest)) return result('rejected', 'operation_payload_conflict');
      const configuration = original?.resolution?.configuration ?? resolveConfiguration(root, resources.defaults,
        binding.presentation_language ? { chat_language: binding.presentation_language } : {});
      // The private App facade already owns a request digest over the held binding
      // and complete gesture, including its inert comment. Retain that identity;
      // the common current resolution codec binds the same project preferences.
      const resolution = original?.resolution ?? { ...createInputResolution(publicInput,
        { ...publicInput, presentation_language: configuration.values.chat_language }, configuration),
        logical_digest: requestDigest, effective_digest: requestDigest };
      checkpoint('before_dispatch'); dispatched = true;
      const family = withInputResolution(resolution, () => input.action === 'approve'
        ? executeApprovalCommand(root, { schema_version: '1', action: 'record_gate_approval', target_id: binding.target_id, run_id: binding.run_id,
          expected_revision_id: binding.expected_revision_id, operation_id: input.operation_id, assurance: 'cooperative_local', gate: binding.gate,
          presentation_id: binding.presentation_id, response: `Approval: ${binding.gate}` }, { evaluateGateCheck, packageVersion, checkpoint,
          commandContext: { kind: 'approval.record', operation_id: input.operation_id, target_id: binding.target_id, request_digest: requestDigest } })
        : recordRunPresentationDecision(root, { runId: binding.run_id, gate: binding.gate, revisionId: binding.expected_revision_id,
          operationId: input.operation_id, presentationId: binding.presentation_id, action: input.action, comment: input.comment ?? '', requestDigest },
        { evaluateGateCheck, packageVersion, afterWrite: checkpoint }), original?.known === true);
      checkpoint('before_result');
      return result(['accepted', 'recorded'].includes(family.outcome) ? 'accepted' : family.outcome === 'already_applied' ? 'already_applied'
        : ['retryable_failure', 'recovery_required'].includes(family.outcome) ? 'effect_unknown' : 'rejected', family.reason, family);
    } catch (error) {
      return result(dispatched ? 'effect_unknown' : 'rejected', error.message);
    }
  });
}
