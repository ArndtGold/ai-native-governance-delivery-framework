import { transitionDecisionForRunState } from "../control-evaluation/gate-policy.js";
import { SOURCE_GATES } from "./run-source-revisions.js";

// Shared by current revision preparation and historical proof validation. A history
// cannot acquire authority from a boundary that the original Run did not satisfy.
export function sourceRevisionBoundary(state, sourceGate, policyVersion = 1) {
  const current = transitionDecisionForRunState(state);
  if (policyVersion === 2) {
    // Version selection comes from the exact proposal/receipt, never current defaults.
    const phases = { UR: ["PRD", "SD", "TP", "CD+Tests", "QA", "UAT"],
      PRD: ["SD", "TP", "CD+Tests", "QA", "UAT"], SD: ["TP", "CD+Tests", "QA", "UAT"], TP: ["CD+Tests", "QA", "UAT"] };
    if (state.meta.lifecycle !== "active" || current.status !== "open"
        || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision.decision)
        || state.approvals.get("UAT")?.status === "approved" || state.artefacts.get("OR")?.status === "done"
        || state.approvals.get(sourceGate)?.status !== "approved" || !phases[sourceGate]?.includes(current.current_gate)) return null;
    const sources = SOURCE_GATES.filter(type => state.artefacts.get(type)?.path);
    const approved = sources.filter(type => state.approvals.get(type)?.status === "approved");
    if (!SOURCE_GATES.slice(0, SOURCE_GATES.indexOf(sourceGate) + 1).every(type => approved.includes(type))) return null;
    return { sources, approved, bindings: sources.filter(type => type !== "UR"), initiating_phase: current.current_gate };
  }
  if (policyVersion !== 1) return null;
  if (state.meta.lifecycle !== "active"
      || !["structured_delivery", "structured_slice"].includes(state.mode_slice_decision.decision)
      || current.status !== "open"
      || ["QA", "UAT"].some(gate => state.approvals.get(gate)?.status === "approved")
      || state.artefacts.get("OR")?.status === "done") return null;
  if (current.current_gate === "CD+Tests") {
    return { sources: SOURCE_GATES, approved: SOURCE_GATES, bindings: ["PRD", "SD", "TP"] };
  }
  if (sourceGate !== "UR" || current.current_gate !== "SD"
      || !["UR", "PRD"].every(gate => state.approvals.get(gate)?.status === "approved")
      || ["SD", "TP"].some(gate => state.approvals.get(gate)?.status === "approved")
      || state.artefacts.get("SD")?.status !== "draft" || !state.artefacts.get("SD")?.path
      || ["TP", "Brownfield Analysis", "CD+Tests", "CR", "Code Review", "TP Review", "Clean Review",
        "Clean Implementation Review", "QA", "QA_REPORT", "UAT", "OR"]
        .some(type => state.artefacts.get(type)?.path || state.artefacts.get(type)?.status === "done")) return null;
  return { sources: ["UR", "PRD", "SD"], approved: ["UR", "PRD"], bindings: ["PRD", "SD"] };
}

// Existing early PRD-to-SD boundary, shared with its immutable history validator.
export function earlyPrdRevisionBoundary(state) {
  return state.meta?.lifecycle === 'active' && state.approvals.get('PRD')?.status === 'approved'
    && state.meta.current_gate === 'SD' && !['SD', 'TP', 'QA', 'UAT'].some(gate => state.approvals.get(gate)?.status === 'approved' || state.artefacts.get(gate)?.path);
}
