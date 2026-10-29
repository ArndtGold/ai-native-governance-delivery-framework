import { realpathSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inspectCanonicalProject, inspectCanonicalInitializationPlan } from '../control-state/canonical-initialization.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';

import { projectOperationStatusCall } from './project-operation-call.js';
export { projectOperationStatusCall };

export function assertProjectGitRoot(root, gitObservation) {
  const gitRoot = gitObservation?.gitValue(root, ['rev-parse', '--show-toplevel']);
  if (!gitRoot) throw Error('confirmed_git_project_required');
  const confirmedRoot = realpathSync(root), reportedRoot = realpathSync(gitRoot);
  const rootStat = lstatSync(confirmedRoot, { bigint: true }), reportedStat = lstatSync(reportedRoot, { bigint: true });
  // Windows realpath preserves spelling/case. Prove the same directory object,
  // without case folding or rounding its filesystem identity through Number.
  if (!rootStat.isDirectory() || !reportedStat.isDirectory() || rootStat.ino <= 0n
    || rootStat.dev !== reportedStat.dev || rootStat.ino !== reportedStat.ino) throw Error('confirmed_git_project_required');
  const path = join(root, '.git'), stat = lstatSync(path, { bigint: true });
  if (stat.isSymbolicLink() || !stat.isDirectory() && !stat.isFile() || stat.isFile() && stat.size > 4096n)
    throw Error('confirmed_git_project_required');
  return { root: confirmedRoot, root_dev: String(rootStat.dev), root_ino: String(rootStat.ino), git: realpathSync(path), dev: String(stat.dev), ino: String(stat.ino),
    content: stat.isFile() ? readFileSync(path, 'utf8') : null };
}

export function inspectProjectState(root, input, gitObservation) {
  try {
    const repository = assertProjectGitRoot(root, gitObservation);
    const target_id = resolveControlCommandTarget(root).target_id;
    const state = inspectCanonicalProject(root, { operationId: input.operation_id });
    const common = { presentation_language: input.presentation_language, working_directory: input.working_directory,
      primary_target: root, target_source: input.target_source };
    const next = state.status === 'initialized' ? { tool: 'agdf_inspect', arguments: { ...common, operation: 'operation-contract', module: 'agdf_run/run.create' } }
      : state.status === 'absent' ? { tool: 'agdf_inspect', arguments: { ...common, operation: 'operation-contract', module: 'agdf_project/project.initialize' } }
      : state.operation && input.operation !== 'operation-status' ? projectOperationStatusCall({ ...input, operation_id: state.operation.operation_id }) : null;
    const report = { available: true, target_id, repository, plan: inspectCanonicalInitializationPlan(), ...state,
      setup: { tool: 'agdf_project', kind: 'project.initialize', binding: { schema_version: '1', assurance: 'cooperative_local', ...common, target_id },
        required_agent_fields: ['operation_id'], requires_explicit_intent: true }, next_calls: next ? [next] : [],
      ...(input.operation === 'operation-status' ? { operation_id: input.operation_id, status: state.operation_status, current_setup: state.status } : {}),
      ...(state.status === 'pending' ? { recovery: { action: 'replay_original', operation_id: state.operation.operation_id,
        request_digest: state.operation.request_digest, instruction: 'Replay only the saved original project.initialize UUID/payload. Owned stage, target, plan and producer are revalidated before any effect.', authorizes: false } } : {}),
      limits: { result_bytes: 16384, source_bytes: 131072, plan_bytes: 524288, receipt_bytes: 16384 }, authorizes: false };
    if (Buffer.byteLength(JSON.stringify(report)) > 16384) throw Error('project_result_budget_exceeded');
    return report;
  } catch (error) { return { available: false, status: 'blocked', reason: error.code ?? error.message, authorizes: false }; }
}
