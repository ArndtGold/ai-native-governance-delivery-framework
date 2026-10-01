import { parseControlState } from "../control-state/run-state-parser.js";
import { transitionDecisionForRunState } from "./gate-policy.js";
import { closeoutArtefacts, internalStepArtefacts, modeSliceDecision, userGateOrder } from "./run-state.js";
import { evaluateVerifiedChange } from "./verified-change.js";

// Evaluates the gate policy for unsaved run-state text, so run-step can store the deterministic
// current gate, next action and forbidden list together with the step it records.
export function policyForRunContent(targetDir, content, runPath = "") {
  const runState = {
    path: runPath,
    content,
    ...parseControlState(content, {
      userGates: userGateOrder,
      internalSteps: [...internalStepArtefacts],
      closeoutArtefacts: [...closeoutArtefacts],
    }),
  };
  const verifiedChange = modeSliceDecision(runState) === "verified_change" ? evaluateVerifiedChange(targetDir, runState, {}) : null;
  const decision = transitionDecisionForRunState(runState, verifiedChange);
  return Object.freeze({
    status: decision.status,
    current_gate: decision.current_gate,
    missing_approval: decision.missing_approval,
    next_allowed_action: decision.next_allowed_action,
    forbidden: Object.freeze([...decision.forbidden]),
  });
}
