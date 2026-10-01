# UX Intent Definition: Recording A Presented Gate Decision

- decision: ready
- blocking_reason: none
- primary_user_intent: Record my deliberate decision against the exact artefact I reviewed and understand its actual effect and evidence limit.
- success_signal: One accepted decision produces one identifiable Run transition; stale, conflicting, repeated and unsupported-authority requests have understandable outcomes and next actions.
- primary_decision_or_action: Approve the current presented gate, request revision or decline; only a new deliberate exact approval reply may record approval.
- working_modes: inspect; decide; submit; retry_or_recover.
- effective_state_by_mode: inspect leaves Run authority unchanged; decide has a prepared current presentation without approval; submit either records one transition or leaves it unchanged; retry_or_recover reports the original effect or a precise conflict without creating another approval.
- visible_state_types: not_ready; awaiting_decision; accepted; already_applied; rejected_stale; rejected_conflict; retryable_failure; recovery_required; independent_human_proof_unavailable.
- effective_state_authority_by_mode: The canonical Run and policy determine effective gate state in every mode. The human owns the deliberate decision. The local host/agent forwards that decision under a cooperative trust assumption and cannot convert it into independent human proof.
- primary_state_presentation_owner_by_mode: The existing canonical AGDF gate presentation communicates the decision and Run status; the current command consumer communicates submission/retry outcomes from that same authoritative result. No new dashboard or independently derived state is introduced.
- activation_paths: Explicit user request for the selected Run; deliberate current-gate reply after its exact prepared presentation. Inspect and waiting never activate a mutation. Cancelling, revising and declining never imply approval.
- blockers: Missing presentation, changed Run/gate/revision/artefact, unavailable prerequisite, competing write or unsupported independent-verification claim; show the precise cause and current permitted next action.
- recovery_paths: Retry a transient failure using the same logical request; when the effect already occurred, show that effect and its resulting revision. A stale or materially changed decision needs fresh presentation and a new reply. Unknown or conflicting interrupted state requires explicit supported recovery rather than guessed success.
- relevant_state_transitions: current presented gate plus new exact reply to recorded approval and current next gate; accepted request replay to original accepted outcome without mutation; stale presentation to rejected input and fresh-presentation path; recoverable interruption to determinable original outcome or explicit recovery-required state.
- proposed_prd_acceptance_criteria: Bind one action/result; preserve query/decision boundaries; make cooperative assurance visible; reject unsupported stronger claims; reject stale binding; serialise competing transitions; recognise an accepted retry; make interruption/recovery actionable; preserve compatibility and measure workflow effort.
- open_product_questions: none; this analysis proposes existing CLI/local-service consumption and retains MCP as a read-only observer in the first slice. PRD approval remains the sole product decision.
- affected_outputs: PRD UX semantics and acceptance; later SD command/result contract and TP consumer/visible-evidence scenarios.
- evidence: Approved UR; completed BROWNFIELD_REVIEW.md; existing run-presentation/render, run-recording and shared writer; intake-continuation-test.js fixtures.
- missing_evidence: No independently verified human channel or new command runtime evidence exists. The supported product guarantee must remain explicitly cooperative; implementation and host proof are later evidence obligations.
- required_next_step: Incorporate these proposed semantics into the current PRD, record its exact revision and present it for deliberate PRD approval.

This analysis is non-authorizing. It defines no technical storage, endpoint or policy owner and grants no gate approval. Its proposed product semantics become authoritative only through the approved PRD.
