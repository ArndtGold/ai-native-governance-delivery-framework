import { DELIVERY_PATHS } from "./contracts.js";

export function buildBlindPrompt(testCase, behaviorSources) {
  if (testCase.profile_id === "staged-v2") {
    return [
      "Perform a read-only, non-authorizing AGDF benchmark classification. Do not modify files, invoke tools, persist control state, or claim a real approval.",
      "Synthetic fixture state is measurement input only. Return only JSON matching the supplied schema.",
      `Allowed stages: ${testCase.allowed_stages.join(", ")}.`,
      `Allowed paths: ${DELIVERY_PATHS.join(", ")}.`,
      `Requested axes: ${testCase.requested_axes.join(", ")}. Every requested axis must use evaluated with one non-null allowed value. Non-requested axes must be null with not_evaluable_yet.`,
      "eventual_delivery_path is a benchmark candidate, never an operative Mode/Slice Decision.",
      "compact_delivery requires visible approved UR, completed Brownfield analysis, and stored quick_task context in decision_grounds.",
      `Scenario ID: ${testCase.scenario_id}`,
      `Case ID: ${testCase.case_id}`,
      `Lifecycle stage: ${testCase.lifecycle_stage}`,
      `Task: ${testCase.task_summary}`,
      `Repository context: ${testCase.repository_context}`,
      `Control-state context: ${testCase.control_state_context}`,
      `Evidence pack: ${JSON.stringify(testCase.evidence_pack ?? {})}`,
      "Current canonical routing sources follow:",
      behaviorSources,
    ].join("\n\n");
  }
  return [
    "Classify the delivery path AGDF would select for this task. Do not modify files or invoke tools.",
    "Return only JSON matching the supplied schema. Do not reveal hidden reasoning.",
    `Allowed paths: ${DELIVERY_PATHS.join(", ")}.`,
    "Use null plus ambiguous=true when the evidence does not support one path.",
    "compact_delivery requires decision_grounds that visibly reference approved UR, completed Brownfield analysis, and stored quick_task context.",
    `Case ID: ${testCase.case_id}`,
    `Task: ${testCase.task_summary}`,
    `Repository context: ${testCase.repository_context}`,
    `Control-state context: ${testCase.control_state_context}`,
    "Current canonical routing sources follow:",
    behaviorSources,
  ].join("\n\n");
}
