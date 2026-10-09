# UX intent: synthetic saved-filter fixture

- decision: blocked
- blocking_reason: The prepared fixture does not specify working-mode, activation, replacement or recovery semantics, and its Brownfield Review supplies no observable existing behavior. A ready analysis would invent material product choices.
- primary_user_intent: Save and restore one named personal filter instead of recreating it.
- success_signal: Restore the filter previously saved by the same operator; detailed visible-state success remains unspecified.
- primary_decision_or_action: Save or restore the one user-owned filter.
- working_modes: Missing evidence for editing, saved and restored modes.
- effective_state_by_mode: Missing evidence concerning when edited or restored values become effective.
- visible_state_types: Missing evidence for unsaved, saved, restored and failed states.
- effective_state_authority_by_mode: The filter belongs to its saving user; authority between current edits and a saved filter is unspecified.
- primary_state_presentation_owner_by_mode: Missing observable Brownfield evidence.
- activation_paths: Save and restore are in scope; their activation conditions are unspecified.
- blockers: Missing product choices and Brownfield behavior; no sharing or permissions change is permitted.
- recovery_paths: Missing semantics for unavailable saved state or failed restore; no retry behavior is assumed.
- relevant_state_transitions: Save and restore are named; overwrite and restore-over-current-edits behavior is unspecified.
- proposed_prd_acceptance_criteria: One personal named filter can be saved and restored without sharing; detailed criteria require the missing facts.
- open_product_questions: When do restored values become effective? What happens to current edits on restore and to the previous saved state on save? What visible recovery exists on failure?
- affected_outputs: Required UX analytical input and dependent PRD draft/readiness.
- evidence: UR.md problem/goal/scope/non-goals; BROWNFIELD_REVIEW.md consists only of an asserted synthetic owner and required flag; no existing product implementation is present in this fixture.
- missing_evidence: Fixture-owned product scenario describing state, activation, recovery and existing observable behavior, consistent with the approved synthetic UR.
- required_next_step: The native-test preparation owner must prepare a complete synthetic scenario through the existing fixture setup before rerunning the positive qualification; no production product clarification or source approval is requested.

This is an actual analytical result from the installed desktop MCP continuation. Synthetic setup receipts are test data and grant no authority over the production run. No PRD, code, approved UR or approval record was changed.
