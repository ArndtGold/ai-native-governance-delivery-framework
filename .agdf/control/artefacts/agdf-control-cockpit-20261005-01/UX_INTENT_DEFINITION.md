# UX Intent Definition: Local read-only AGDF control cockpit

Status: ready
Decision: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-05
Owner: Codex, analytical preparation for Arndt Gold

This is non-authorizing analytical PRD input. It grants no approval or implementation permission. The approved UR bounds this analysis; the future approved PRD is the sole product acceptance authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: A bounded read-only capability connects inventory, run detail and artefact reading, with explicit evaluated state, provenance, freshness and recovery.
- ux_intent_definition_required: yes
- evidence: UR.md approved at run revision 5; BROWNFIELD_REVIEW.md recorded with structured_delivery at revision 6.

## 2. Intent And Success

- primary_user_intent: Find a delivery run and understand its current state, blockers, approvals and supporting documents without searching separate control files or confusing document prose with evaluation authority.
- success_signal: The user can complete overview to selected-run detail to registered document, identify the same run and data version throughout, and understand what evidence is present or unavailable. Time savings are intended, not yet measured.
- primary_decision_or_action: Select a run, inspect its evaluated state, open a registered document and return to the same selection. Human gate decisions continue in the existing AGDF workflow outside this read-only cockpit.

## 3. Working Modes And State

- working_modes: repository inspection; selected-run inspection; registered-document inspection. These are connected reading contexts with one read-only authority boundary.
- effective_state_by_mode: Repository inspection represents the available inventory from the selected local target, including active/completed and invalid/unavailable entries. Selected-run inspection represents the Core evaluation and persisted assertions of one identified run at an identified data version. Document inspection represents the content and availability of a registered allowed resource for that same run/version. Unverified or stale data has no current-authority claim.
- visible_state_types: loading; verified available; genuinely empty inventory; partial/unavailable inventory; malformed control; missing document; unsupported document; changed/stale data; recoverable read error; blocked read. Lifecycle, gate, approval and QA/UAT are separate state dimensions.
- effective_state_authority_by_mode: All three contexts derive run/control meaning from canonical .agdf/control files and existing AGDF Core evaluation. Document prose is evidence of what was written, not an override of the current evaluation. Human approval authority stays with the existing deliberate gate workflow.
- primary_state_presentation_owner_by_mode: The inventory view presents repository identity and inventory quality. The selected-run detail presents evaluated status, blockers, next permitted action, recorded approvals and provenance. The document view presents document identity/content/availability and its relation to the selected run. Each view carries shared target/run/version context; no secondary summary may contradict the primary detail silently.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Deliberately start the local cockpit for one explicitly selected repository, then open its local interface. Reading begins for that target only; selecting a run activates its detail, selecting a registered supported document activates its reading view. Leaving a view ends its active reading context; stopping the local service ends access. No action activates execution or modifies control.
- blockers: Missing/unreadable control prevents a successful inventory claim and shows the selected target plus explanation. Invalid individual runs remain visible as invalid and do not become permissive records. Unavailable, disallowed or unsupported documents show a specific unavailable state. Changed data prevents presenting an older state as current. Every blocker names the affected read and an appropriate next action.
- recovery_paths: Visible retry reloads the affected read after transient service/read errors. Reload after changed data refreshes the selected run and its documents together; selection is retained when it still exists. A removed run returns to the inventory with an explanation. Missing/invalid control directs the user to repair the source through the existing workflow, then retry; the cockpit does not perform that repair. Unsupported documents retain source/path information and an explanation, without arbitrary filesystem browsing. Retained prior content is labeled stale and never silently replaces a failed read.
- relevant_state_transitions: Start -> loading -> available/empty/error inventory; select run -> loading -> verified detail/invalid/removed; open registered document -> loading -> content/missing/unsupported/blocked; source changes -> changed-data notice -> explicit reload -> refreshed context; transient error -> visible retry -> fresh result or persistent error; return from document -> same run detail; return to inventory -> preserved navigation context where available. Every failure preserves safe read-only semantics and reports its concrete affected scope.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Overview exposes target and run identities with truthful active/completed/invalid distinctions; run selection displays canonical evaluated status and explicit persisted/evaluated disagreement; registered supported documents open with run, source and revision/version provenance; errors/empty/missing/unsupported/stale states are distinguishable; recoverable failures have visible retry; changed data requires reload before a current claim; navigation retains run context; reading never edits control or accepts approvals; source access is constrained to explicitly allowed registered resources; browser observations prove the three journeys and their failures.

These proposals elaborate the approved UR's acceptance signals. They become product authority only through PRD incorporation and its deliberate approval. Initial document formats, language and accessibility behavior are PRD choices for review, not assumptions that change the approved UR.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: none preventing drafting. PRD must explicitly state first-format coverage and German-facing interface choices within the existing UR; its approval decides those draft choices.
- affected_outputs: PRD.md and its UX criteria; later SD/TP design and evidence derivation.
- evidence: Approved UR.md; completed BROWNFIELD_REVIEW.md; packages/core/lib/control-state/run-state-reader.js; packages/core/lib/control-evaluation/gate-check.js; packages/core/lib/control-inspect/service.js; packages/core/lib/control-read-boundary.js.
- missing_evidence: Runtime/browser behavior is not implemented or verified yet. This ready result establishes analytical input sufficiency only.
- required_next_step: Draft the bounded PRD through prd-definition, incorporating observable criteria and explicit product decisions, then present it for a new deliberate PRD approval.
