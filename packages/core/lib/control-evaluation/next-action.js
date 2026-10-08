import { isPlaceholderValue } from "./shared.js";
import { extractField } from "./verified-change.js";

// Canonical order of the gates the transition policy reports; alternative compact paths sit
// between routing and PRD.
const GATE_ORDER = ["UR", "Brownfield Review", "Mode/Slice Decision", "Quick Task Execution", "Verified Change Execution",
  "PRD", "SD", "TP", "Brownfield Analysis", "CD+Tests", "CR", "QA", "UAT", "OR"];
const gateIndex = (value) => GATE_ORDER.indexOf(String(value ?? "").replace(/`/gu, "").trim());

// True when an active run's evaluated gate moved forward past its stored gate, for example after an
// internal step was recorded without refreshing the derived control fields. A backward move (evidence
// retracted) or an unknown stored gate keeps the stored text and fails closed.
export function storedGateMoved(runState, decision) {
  if (extractField(runState.content ?? "", "lifecycle") !== "active") return false;
  const stored = gateIndex(runState.current_gate), evaluated = gateIndex(decision.current_gate);
  return stored >= 0 && evaluated > stored;
}

// A stored next step refines the evaluated gate only while it still belongs to that gate.
// Completed runs keep their authored closeout text.
export function storedNextActionApplies(runState, decision) {
  return !isPlaceholderValue(runState.next_allowed_action) && !storedGateMoved(runState, decision);
}

export function effectiveNextAllowedAction(runState, decision) {
  return storedNextActionApplies(runState, decision) ? runState.next_allowed_action : decision.next_allowed_action;
}
