import { normalizeInteractionOutcome } from "../interaction-presentation.js";

export function validateGateApprovalResponse({
  response,
  responseOutcome,
  responseOrigin,
  expectedApproval,
  expectedRunId,
  currentRunId,
  expectedGate,
  currentGate,
  expectedRevisionId,
  currentRevisionId,
  durableArtefactReady,
  timedOut = false,
  noResponse = false,
}) {
  const checks = [
    [responseOrigin === "deliberate_user_input", "non_deliberate_response"],
    [expectedApproval === `Approval: ${expectedGate}`, "approval_formula_mismatch"],
    [Boolean(expectedRunId) && expectedRunId === currentRunId, "changed_or_wrong_run"],
    [Boolean(expectedGate) && expectedGate === currentGate, "changed_or_wrong_gate"],
    [Boolean(expectedRevisionId) && expectedRevisionId === currentRevisionId, "stale_revision"],
    [durableArtefactReady === true, "durable_artefact_not_ready"],
  ];

  const failed = checks.find(([accepted]) => !accepted);
  if (failed) return { accepted: false, reason: failed[1] };

  const outcomeCandidate = responseOutcome && responseOutcome !== "approve" ? responseOutcome : response;
  const outcome = normalizeInteractionOutcome(outcomeCandidate, {
    expectedApproval,
    timedOut,
    noResponse,
  });
  const rejectionReasons = {
    revise: "revision_requested",
    decline: "declined",
    cancel: "cancelled",
    no_response: "no_response",
    timeout: "timed_out",
    empty: "empty_response",
    invalid: "wrong_or_non_approval_response",
    stale: "stale_response",
  };
  return outcome === "approve"
    ? { accepted: true, reason: "accepted" }
    : { accepted: false, reason: rejectionReasons[outcome] ?? "wrong_or_non_approval_response" };
}
