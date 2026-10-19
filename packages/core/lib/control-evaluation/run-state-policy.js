// Policy over prepared Run facts; no filesystem reads or state preparation.
import { filled, isPlaceholderValue } from "./shared.js";

export const userGateOrder = ["UR", "PRD", "SD", "TP", "QA", "UAT"];
export const durableGateArtefacts = new Set(["UR", "PRD", "SD", "TP", "QA"]);
export const internalStepArtefacts = new Set(["Brownfield Review", "UX Intent Definition", "Verified Change", "Brownfield Analysis", "CD+Tests", "TP Review", "Clean Implementation Review", "Clean Review", "CR", "Code Review"]);
export const closeoutArtefacts = new Set(["OR"]);

export function gateApprovalStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return "not_applicable";
  return runState.approvals.get(gate)?.status ?? "";
}

export function gateArtefactStatus(runState, gate) {
  if (!userGateOrder.includes(gate)) return { status: "not_applicable", path: "" };
  return runState.artefacts.get(gate) ?? { status: "", path: "" };
}

export function isDurableGateArtefactSatisfied(runState, gate) {
  if (!durableGateArtefacts.has(gate)) return true;
  const artefact = gateArtefactStatus(runState, gate);
  if (!artefact.path || isPlaceholderValue(artefact.path)) return false;
  if (gate === "QA") return artefact.status === "pass" || artefact.status === "passed" || runState.qa_acceptance?.accepted === true;
  return artefact.status === "approved";
}

export function expectedDurableArtefactStatuses(gate) {
  return gate === "QA" ? ["pass", "passed"] : ["approved"];
}

export function describeDurableArtefactStatuses(gate) {
  return expectedDurableArtefactStatuses(gate).map((status) => `\`${status}\``).join(" or ");
}

export function isInternalStepSatisfied(runState, step) {
  const artefact = runState.artefacts.get(step);
  if (!artefact) return false;
  const associated = runState.evidence_applicability?.by_step.get(step);
  if (associated && associated.applicability !== 'current') return false;
  if (artefact.status === "done") return true;
  return artefact.status === "not_applicable"
    && (step === "Brownfield Review" || step === "Brownfield Analysis");
}

export function modeSliceDecision(runState) {
  const decision = runState.mode_slice_decision?.decision ?? "";
  const scopeReason = runState.mode_slice_decision?.scope_reason ?? "";
  const evidence = runState.mode_slice_decision?.evidence ?? "";
  if (!decision || isPlaceholderValue(decision) || !filled(scopeReason) || !filled(evidence)) return "undecided";
  return decision;
}
