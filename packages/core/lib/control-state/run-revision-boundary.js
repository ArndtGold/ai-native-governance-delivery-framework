import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { SOURCE_GATES } from "./run-source-revisions.js";

// Shared by current revision preparation and historical proof validation. A history
// cannot acquire authority from a boundary that the original Run did not satisfy.
export function sourceRevisionBoundary(state, sourceGate, policyVersion = 2) {
  const current = transitionDecisionForRunState(state);
  if (policyVersion === 2) {
    // Version selection comes from the exact proposal/receipt, never current defaults.
    // Brownfield Analysis follows the approved TP; a design or plan gap it finds must reach its source.
    const phases = { UR: ["PRD", "SD", "TP", "Brownfield Analysis", "CD+Tests", "QA", "UAT"],
      PRD: ["SD", "TP", "Brownfield Analysis", "CD+Tests", "QA", "UAT"], SD: ["TP", "Brownfield Analysis", "CD+Tests", "QA", "UAT"],
      TP: ["Brownfield Analysis", "CD+Tests", "QA", "UAT"] };
    if (state.meta.lifecycle !== "active" || current.status !== "open"
        || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision.decision)
        || state.approvals.get("UAT")?.status === "approved" || state.artefacts.get("OR")?.status === "done"
        || state.approvals.get(sourceGate)?.status !== "approved" || !phases[sourceGate]?.includes(current.current_gate)) return null;
    const sources = SOURCE_GATES.filter(type => state.artefacts.get(type)?.path);
    const approved = sources.filter(type => state.approvals.get(type)?.status === "approved");
    if (!SOURCE_GATES.slice(0, SOURCE_GATES.indexOf(sourceGate) + 1).every(type => approved.includes(type))) return null;
    return { sources, approved, bindings: sources.filter(type => type !== "UR"), initiating_phase: current.current_gate };
  }
  return null;
}

// Existing early PRD-to-SD boundary, shared with its immutable history validator.
export function earlyPrdRevisionBoundary(state) {
  return state.meta?.lifecycle === 'active' && state.approvals.get('PRD')?.status === 'approved'
    && transitionDecisionForRunState(state).current_gate === 'SD' && !['SD', 'TP', 'QA', 'UAT'].some(gate => state.approvals.get(gate)?.status === 'approved' || state.artefacts.get(gate)?.path);
}
