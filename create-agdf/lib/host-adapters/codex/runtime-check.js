export function codexRuntimeCheckEvidence({ capabilityIdentity, observedIdentity, hookEnabled, reviewRequired = false }) {
  if (reviewRequired) return { status: "decision_required", reason: "host_review_required" };
  if (hookEnabled && observedIdentity === capabilityIdentity) return { status: "enabled", capability_identity: capabilityIdentity, reason: "none" };
  if (observedIdentity && observedIdentity !== capabilityIdentity) return { status: "renewal_required", reason: "capability_identity_changed" };
  return { status: "decision_required", reason: "host_permission_unverified" };
}

export function projectCodexHookObservation(state, observation) {
  if (state.requested !== "enabled" || state.effective !== "decision_required") return state;
  const hook = observation?.status === "observed" ? observation.hook : null;
  if (!hook || !["managed", "trusted", "modified", "untrusted"].includes(hook.trust_status)
      || typeof hook.enabled !== "boolean") return { ...state, verification: "host_unverified",
    next_action: "Inspect the AGDF session hook in Codex /hooks, then retry runtime-checks status --surface codex." };
  if (["modified", "untrusted"].includes(hook.trust_status)) {
    const evidence = codexRuntimeCheckEvidence({ reviewRequired: true });
    return { ...state, effective: evidence.status, reason: evidence.reason,
      verification: "hook_review_required",
      next_action: "Open /hooks in Codex, review and trust the current AGDF session hook, then start a fresh session." };
  }
  if (!hook.enabled) return { ...state, effective: "decision_required",
    reason: "host_permission_unverified", verification: "hook_disabled",
    next_action: "Enable the AGDF session hook in Codex /hooks, then start a fresh session." };
  // hooks/list proves trust, not a successful execution in a fresh host session.
  return { ...state, effective: "decision_required", reason: "host_permission_unverified",
    verification: "hook_trusted_session_unverified",
    next_action: "Verify the already trusted AGDF session hook in the fresh Codex session." };
}
