import { executeApprovalCommand } from "#agdf-core/control-state/approval-command.js";
import { evaluateGateCheck } from "#agdf-core/control-evaluation/gate-check.js";
import { cliGitObservation } from "../control-evaluation/git-observation.js";
import { pluginDefinition } from "./control-context.js";

const evaluateLocalGate = (root, selection) => evaluateGateCheck(root, selection, cliGitObservation);

export function recordGateApprovalCommand(root, command) {
  return executeApprovalCommand(root, command, {
    evaluateGateCheck: evaluateLocalGate, packageVersion: pluginDefinition.version,
  });
}
