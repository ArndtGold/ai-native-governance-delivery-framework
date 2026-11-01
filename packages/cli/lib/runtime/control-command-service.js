import { executeApprovalCommand } from '#agdf-core/control-state/approval-command.js';
import { validateApprovalCommand, resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { createCoreServices } from '#agdf-core';
import { evaluateGateCheck } from '#agdf-core/control-evaluation/gate-check.js';
import { cliGitObservation } from '../control-evaluation/git-observation.js';
import { pluginDefinition, resources } from './control-context.js';

const evaluateLocalGate = (root, selection) => evaluateGateCheck(root, selection, cliGitObservation);
const invalidResult = (root, command) => executeApprovalCommand(root, command, {
  evaluateGateCheck: evaluateLocalGate, packageVersion: pluginDefinition.version,
});

export function recordGateApprovalCommand(root, command) {
  // Preserve the public action's strict descriptor validation before copying
  // any field. Valid calls share CLI/MCP normalization and original UUID proof.
  if (validateApprovalCommand(command)) return invalidResult(root, command);
  let target;
  try { target = resolveControlCommandTarget(root); } catch { return invalidResult(root, command); }
  const input = { working_directory: process.cwd(), primary_target: target.root, target_source: 'explicit_target',
    target_id: command.target_id, run_id: command.run_id, expected_revision_id: command.expected_revision_id,
    operation_id: command.operation_id, assurance: command.assurance,
    command: { kind: 'approval.record', payload: { gate: command.gate, presentation_id: command.presentation_id, response: command.response } } };
  const result = createCoreServices({ resources, observers: { gitObservation: cliGitObservation } }).command('agdf_approve', input);
  // The action facade keeps its existing result observations. The canonical
  // command owner supplies its current receipt and replay, never a second writer.
  return result.family_result?.operation_id === command.operation_id ? result.family_result : result;
}
