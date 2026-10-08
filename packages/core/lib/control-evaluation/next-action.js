import { localePack } from "../interaction-presentation.js";
import { interactionLocales } from "../resources/context.js";
import { isPlaceholderValue } from "./shared.js";
import { extractField } from "./verified-change.js";

// Canonical order of the gates the transition policy reports; alternative compact paths sit
// between routing and PRD.
const GATE_ORDER = ["UR", "Brownfield Review", "Mode/Slice Decision", "Quick Task Execution", "Verified Change Execution",
  "PRD", "SD", "TP", "Brownfield Analysis", "CD+Tests", "CR", "QA", "UAT", "OR"];
const gateIndex = (value) => GATE_ORDER.indexOf(String(value ?? "").replace(/`/gu, "").trim());
// Every system-generated next step is a registered operational value; hand-authored text is not.
const CANONICAL_TEXTS = new Set(Object.values(localePack(interactionLocales, "en").operationalValues ?? {}).map((value) => String(value).trim()));

// True when an active run still stores a generated next step of an earlier gate, for example after
// an internal step was recorded without refreshing the derived control fields. Backward moves,
// unknown gates and hand-authored text keep the stored next step (fail closed).
export function storedNextActionStale(runState, decision) {
  if (extractField(runState.content ?? "", "lifecycle") !== "active") return false;
  const stored = gateIndex(runState.current_gate), evaluated = gateIndex(decision.current_gate);
  if (stored < 0 || evaluated <= stored) return false;
  const text = String(runState.next_allowed_action ?? "").trim();
  return CANONICAL_TEXTS.has(text) && text !== decision.next_allowed_action;
}

// A stored next step refines the evaluated gate unless it is a stale generated step.
export function storedNextActionApplies(runState, decision) {
  return !isPlaceholderValue(runState.next_allowed_action) && !storedNextActionStale(runState, decision);
}

export function effectiveNextAllowedAction(runState, decision) {
  return storedNextActionApplies(runState, decision) ? runState.next_allowed_action : decision.next_allowed_action;
}
