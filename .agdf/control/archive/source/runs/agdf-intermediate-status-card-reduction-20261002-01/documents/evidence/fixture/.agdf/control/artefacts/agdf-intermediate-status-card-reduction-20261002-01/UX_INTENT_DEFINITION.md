# UX Intent Definition: Fewer intermediate status cards

Date: 2026-10-02
Run: agdf-intermediate-status-card-reduction-20261002-01
Analytical input only; product authority remains the approved UR and subsequently approved PRD.

- decision: ready
- blocking_reason: none
- primary_user_intent: Follow useful progress and recognize the next real decision without repeatedly reading unchanged process status.
- success_signal: A recorded redundant-card workflow becomes visibly shorter while every meaningful event and required control/evidence remains observable.
- primary_decision_or_action: Review a significant result, answer a required clarification, resolve a blocker or deliberately approve the currently presented gate.
- working_modes: permitted_internal_work; decision_or_significant_result; blocked_or_material_change; explicit_status; interrupted_or_resumed_work.
- effective_state_by_mode: Internal work stays within its current permission; a ready decision waits for the user; a blocker stops prohibited continuation; explicit status is read-only; resumption revalidates current binding before further work.
- visible_state_types: Brief progress; consolidated result; canonical decision presentation; canonical blocker/recovery; explicitly requested canonical status; changed-binding orientation.
- effective_state_authority_by_mode: Existing evaluated target/run/gate/revision and deliberate human approval decide effective state in every mode. Narration and card omission confer no authority.
- primary_state_presentation_owner_by_mode: Existing canonical AGDF interaction surface communicates decisions/status/blockers; ordinary agent narration communicates permitted progress. Host tool blocks retain host ownership.
- activation_paths: Existing request activation and selected-run continuation. No new activation setting, inferred consent or persistent visibility mode.
- blockers: Missing/foreign/stale authority, unresolved target/run, new risk requiring a decision and unavailable required presentation remain visible promptly with their permitted next action.
- recovery_paths: Use existing clarification, revision, reselection or retry instructions. A recoverable transient failure retains a visible actionable retry; omission never silently retries prohibited work or reuses an obsolete approval.
- relevant_state_transitions: Unchanged internal state → continued internal work uses brief progress if useful; internal work → significant result/decision shows the result/decision; any state → blocker or changed binding shows that event immediately; explicit status always returns fresh status; resumption revalidates and shows material change, otherwise resumes without duplicating unchanged cards.
- proposed_prd_acceptance_criteria: Retain UR AC-001–AC-007 with measurable card/length comparison, protected-event cases, repeated-state and explicit-status cases, approval negatives, control/evidence parity, localized rendering and owner reuse. Include interruption/resumption within these criteria.
- open_product_questions: none; thresholds, scope and protected events derive from the approved UR. Concrete scenario fixtures and minimal implementation are later planning/design decisions.
- affected_outputs: Internal progress and consolidated results in governed agent workflows; canonical decisions, blockers, explicit status and changed bindings remain available.
- evidence: Approved UR sections 2–5; completed BROWNFIELD_REVIEW.md; interaction.md mandatory ready-gate sequence/target orientation; quality.md compaction and host visibility boundary; service.js terminal and nonterminal continuation paths.
- missing_evidence: Before/after execution and fresh host observations are future validation evidence, not established product results.
- required_next_step: Incorporate this input into the current PRD and request only its bound approval after readiness validation.

## PRD Revision 2 Analytical Addendum

Date: 2026-10-02. decision: ready. The user requested PRD sharpening to prevent and correct the evidenced relationship-bookkeeping omission. This remains internal evidence maintenance in the approved intent; no generic repair or new effective-state authority is added.

Successful exact-evidence clerical correction keeps the same permitted actions and approvals, creates an audited current revision, and is mentioned in the next concise result without an extra decision/card. Explicit status shows that fresh revision. Ineligible correction remains a visible blocker with its concrete evidence/state conflict and existing recovery. Canonical orchestration must decide and validate correction before terminal output; already emitted terminal output retains stop semantics. No retry loop, approval transfer, creation of missing artefacts or semantic reconstruction is allowed. Proposed PRD criteria AC-008 and AC-009 make prevention, bounded correction and observable failures testable; they become product authority only with renewed PRD approval. Technical operation/evidence shape remains SD work. No open product question is inferred from this addendum.
