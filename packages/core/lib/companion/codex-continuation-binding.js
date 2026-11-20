import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { projectCockpitAssessment } from '../control-inspect/run-classification.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';

// A stale display, approval selector or activity hint is not start eligibility.
export function continuationBinding(targetId, run) {
  const evaluation = run?.evaluation, operation = evaluation?.next_operation;
  const assessment = evaluation?.control_assessment?.state;
  const waiting = operation?.actor === 'human' && operation.operation_key === 'approval.record'
    && evaluation.status === 'open' && evaluation.blocking_reason === 'none'
    && evaluation.missing_approval === `Approval: ${evaluation.current_gate}`;
  if (run?.lifecycle !== 'active' || !run.revision_id || !operation?.operation_key
    || run.persisted?.current_gate !== run.evaluation.current_gate
    || run.persisted?.next_allowed_action !== run.evaluation.next_allowed_action
    || !(waiting || operation.actor === 'agent' && assessment === 'open'))
    return null;
  return { target_id: targetId, run_id: run.run_id, revision_id: run.revision_id,
    operation_key: operation.operation_key, actor: operation.actor };
}

export function isCurrentContinuation(root, expected) {
  const report = evaluateGateCheck(root, { runId: expected.run_id, ignoreRunIdEnv: true });
  const run = report.status_card?.runState;
  if (!run) return false;
  const fresh = continuationBinding(resolveControlCommandTarget(root).target_id, {
    run_id: run.run_id, revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle, persisted: run,
    evaluation: { ...report, control_assessment: projectCockpitAssessment(report, run.meta.lifecycle) },
  });
  return fresh?.target_id === expected.target_id && fresh.run_id === expected.run_id
    && fresh.revision_id === expected.revision_id && fresh.operation_key === expected.operation_key && fresh.actor === expected.actor;
}
