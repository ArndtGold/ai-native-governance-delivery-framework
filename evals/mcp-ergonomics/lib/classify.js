// Call classification (SDD-005). One rule for protocol and native observations; METRICS.md
// documents it. The SDK texts are pinned by a unit test so an SDK update surfaces visibly.
import { contentText } from "./normalize.js";

export const AGDF_FAILURE_OUTCOMES = Object.freeze(["invalid_input", "evaluator_error", "target_unresolved", "rejected", "effect_unknown"]);
export const SDK_INPUT_VALIDATION_PREFIX = "Input validation error:";
export const CALL_CLASSES = Object.freeze(["ok", "sdk_validation", "tool_error_other", "agdf_failure", "protocol_error"]);

// Core tools report `outcome`; cockpit tools report `state: "blocked"` with a `code`.
function outcomeOf(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (typeof value.outcome === "string") return value.outcome;
  if (value.state === "blocked" && typeof value.code === "string") return `blocked:${value.code}`;
  return null;
}

function structuredOutcome(result) {
  const structured = outcomeOf(result?.structuredContent);
  if (structured) return structured;
  try { return outcomeOf(JSON.parse(contentText(result))); } catch { return null; }
}

const isAgdfFailure = outcome => AGDF_FAILURE_OUTCOMES.includes(outcome) || String(outcome).startsWith("blocked:");

export const isSdkInputValidationText = text => String(text ?? "").startsWith(SDK_INPUT_VALIDATION_PREFIX);

// observation: { protocol_error?: { code, message }, result?: CallToolResult }
export function classifyCall({ protocol_error: protocolError, result } = {}) {
  if (protocolError) return { class: "protocol_error", outcome: null, is_error: null, failure_without_isError: false };
  const isError = result?.isError === true;
  const outcome = structuredOutcome(result);
  if (isError && isSdkInputValidationText(contentText(result))) {
    return { class: "sdk_validation", outcome, is_error: true, failure_without_isError: false };
  }
  if (outcome && isAgdfFailure(outcome)) {
    return { class: "agdf_failure", outcome, is_error: isError, failure_without_isError: !isError };
  }
  if (isError) return { class: "tool_error_other", outcome, is_error: true, failure_without_isError: false };
  return { class: "ok", outcome, is_error: false, failure_without_isError: false };
}

export function countClasses(rows) {
  const counts = Object.fromEntries(CALL_CLASSES.map(name => [name, 0]));
  let failureWithoutIsError = 0;
  for (const row of rows) {
    counts[row.class] = (counts[row.class] ?? 0) + 1;
    if (row.failure_without_isError) failureWithoutIsError += 1;
  }
  return { ...counts, failure_without_isError: failureWithoutIsError, total: rows.length };
}
