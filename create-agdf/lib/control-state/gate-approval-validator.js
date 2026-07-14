export function validateGateApprovalResponse({
  response,
  responseOrigin,
  expectedApproval,
  expectedRunId,
  currentRunId,
  expectedGate,
  currentGate,
  expectedRevisionId,
  currentRevisionId,
  durableArtefactReady,
}) {
  const checks = [
    [responseOrigin === "deliberate_user_input", "non_deliberate_response"],
    [typeof response === "string" && response.length > 0, "empty_response"],
    [expectedApproval === `Approval: ${expectedGate}`, "approval_formula_mismatch"],
    [response === expectedApproval, "wrong_or_non_approval_response"],
    [Boolean(expectedRunId) && expectedRunId === currentRunId, "changed_or_wrong_run"],
    [Boolean(expectedGate) && expectedGate === currentGate, "changed_or_wrong_gate"],
    [Boolean(expectedRevisionId) && expectedRevisionId === currentRevisionId, "stale_revision"],
    [durableArtefactReady === true, "durable_artefact_not_ready"],
  ];

  const failed = checks.find(([accepted]) => !accepted);
  return failed
    ? { accepted: false, reason: failed[1] }
    : { accepted: true, reason: "accepted" };
}
