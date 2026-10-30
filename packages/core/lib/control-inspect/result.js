import { CONTROL_INSPECT_SCHEMA_VERSION, CONTROL_INSPECT_CONTRACT_VERSION } from "./contract.js";
import { emptySkillDispatchTiming } from "../skill-dispatch/contract.js";

export function baseResult({ outcome, operation, runtime, timing }) {
  return {
    schema_version: CONTROL_INSPECT_SCHEMA_VERSION,
    contract_version: CONTROL_INSPECT_CONTRACT_VERSION,
    outcome,
    terminal: outcome !== "inspect_result",
    authorizes: false,
    operation: operation ?? null,
    runtime,
    target: null,
    report: null,
    presentation: null,
    recovery: null,
    host_action: null,
    timing,
    diagnostics: [],
  };
}

export function bindHostAction(result) {
  if (result.outcome === "inspect_result") {
    result.host_action = Object.freeze({
      mode: "consume_report_and_continue",
      source: result.presentation?.markdown ? "presentation.markdown" : "report",
      ...(result.presentation?.markdown ? { text: result.presentation.markdown } : {}),
      allow_surrounding_text: true,
      may_request_run_or_evidence: false,
    });
  } else if (result.presentation?.markdown) {
    result.host_action = Object.freeze({
      mode: "transmit_presentation_verbatim_and_stop",
      source: "presentation.markdown",
      text: result.presentation.markdown,
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    });
  } else {
    result.host_action = Object.freeze({
      mode: "transmit_recovery_verbatim_and_stop",
      source: "recovery.action",
      text: result.recovery?.action ?? "",
      allow_surrounding_text: false,
      may_request_run_or_evidence: false,
    });
  }
  return Object.freeze(result);
}

export function createInspectFailureResult(code, runtime, action, { elapsedMs } = {}) {
  const timing = Object.fromEntries(Object.keys(emptySkillDispatchTiming()).map(key => [key, null]));
  timing.total_ms = Number.isFinite(elapsedMs) && elapsedMs >= 0 ? elapsedMs : null;
  timing.measurement_state = 'unavailable'; timing.unavailable_reason = 'operation_did_not_complete';
  const result = baseResult({ outcome: "evaluator_error", runtime, timing });
  result.recovery = { action };
  result.diagnostics = [{ code }];
  return bindHostAction(result);
}

