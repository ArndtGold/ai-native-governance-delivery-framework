# UX Intent Definition: Inspect the proposal before deciding PRD

Status: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-18
Owner: UX analysis, Codex

This is non-authorizing analytical input. Proposed criteria become binding only in an approved PRD. The prototype contains simulated actions and is not evidence of implemented Core enforcement or native-host capability.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: high
- ui_ux_impact_reason: Interactive illustrative content and its missing/changed states must remain distinct from the binding PRD decision across available presentation surfaces.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Judge whether the proposed interaction solves the stated task, then deliberately decide the corresponding PRD requirements.
- success_signal: The reviewer can inspect the named version, exercise the missing-evidence scenario, return to the same decision context and explain what PRD approval means without confusing example actions with actual approval.
- primary_decision_or_action: Approve the proposed product behavior, scope and acceptance criteria through the existing PRD action, or discuss changes in Chat while leaving the decision open.

## 3. Working Modes And State

- working_modes: PRD review; illustrative preview exploration; PRD document reading; missing/changed basis recovery; host-access recovery; deliberate decision.
- effective_state_by_mode: Review remains undecided while reading or exploring. Example actions affect only the prototype. Missing/changed required material makes the old basis unavailable for approval. A new basis needs a new presentation and deliberate reply. Inaccessible content remains explicitly unreviewed until a supported bound access path exists.
- visible_state_types: Review task, product title, PRD version, preview version, criterion relation, open product questions, checked basis versus missing/changed basis, simulation labels, actual decision result or unchanged open state.
- effective_state_authority_by_mode: Existing Core controls current material and approval eligibility; the approved PRD controls product requirements; illustrative preview state controls only the example. Reading and scenario selection have no approval authority.
- primary_state_presentation_owner_by_mode: Existing decision presentation for actual PRD status and decision; preview for simulated interaction; document view for exact PRD content; existing source owner recovery for absent or changed evidence. Chat remains the place for ordinary questions and requested changes.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: A presented PRD shows the concrete review task and exact preview access beside document access. Open preview, inspect normal and important missing-proof cases, return to the same PRD context, then deliberately decide.
- blockers: Required preview or local asset missing; wrong-run or unsafe source; UR source mismatch; changed bytes or replaced applicable version; unresolved before-PRD product decision. Unsupported host access must be visible and cannot be reported as a completed review.
- recovery_paths: Missing/invalid material returns to its current analytical or PRD owner for correction. Changed material needs relevant reassessment and a fresh presentation; never reuse the old reply. A transient read failure offers a visible retry of the same bound access without silently loading another version. Unsupported access uses a supported bound standalone/text-assisted route when available, otherwise the review remains open.
- relevant_state_transitions: Review -> preview/document -> same review, with focus returned to the initiating control and no approval side effect; normal example -> missing-proof example, with explicit unconfirmed policy; current basis -> unavailable/changed, with disabled old approval and concrete recovery; fresh basis -> fresh review; deliberate approve -> matched actual result. The prototype's simulated result is visibly separate from the last transition.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Concrete review task and version/criterion association; inspectable versioned run-local preview; read-only access with preserved decision context; unconfirmed policy stays open; exact file/source checks before presentation and approval; changed material requires new presentation and deliberate response; honest host capability and actionable recovery; one existing approval action with unchanged consent meaning; compatible behavior without required previews; real file/UI tests with explicit qualification limits. Stable IDs belong to the PRD, not this analytical proposal.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none for PRD drafting. Approved UR supplies the integration intent; no inferred answer to the separate example's product policy is required for this integration.
- open_product_questions: Whether the illustrative product may approve despite an important missing proof remains explicitly unanswered and outside this integration's product scope. The PRD reviewer has not yet observed or accepted this new interaction proposal. Binding/read transport and historical compatibility are SD work. Native host capability is unqualified.
- affected_outputs: Existing PRD decision presentation, preview access, exact document access, source recovery and approval validation.
- evidence: Approved UR digest sha256:9e0c79153e17b818574aa127ffa8b7e2e1616b6826870481a50627acfab72e1e; BROWNFIELD_REVIEW.md; source inspection of definition-sources.js, presentation-decision.js, run-presentation.js, decision-session.js and DecisionCard.tsx; retained prototype described below.
- missing_evidence: User observation/feedback on this version; implemented file binding, real approval-path integration and native host qualification. None is claimed from the prototype. The first is supplied through PRD review; implementation evidence remains required by the future TP/QA path.
- required_next_step: Record this analysis, draft verifiable PRD criteria from the approved UR and this proposal, present the prototype and PRD for deliberate agreement; no implementation yet.

### Retained preview

- version: prd-review-v1
- entry: .agdf/control/artefacts/prd-preview-review-integration-20261018-01/previews/prd-review-v1/index.html
- entry_digest: sha256:4c11a7be1385af7315108ad1127c1d519041c99c5f67bc47902a746cc1e01b2c
- source_ur_digest: sha256:9e0c79153e17b818574aa127ffa8b7e2e1616b6826870481a50627acfab72e1e
- local_assets: none; self-contained exported wrapper and fragment. No host-only interaction API is used.
- inline_source: /Users/arndtgold/.codex/visualizations/2026/10/18/01a15024-24f8-7853-be3e-992d21600c5d/prd-vorschau-pruefen.html
- inline_source_digest: sha256:c623732cb6f24f4b6e21ead04a09b0650f4a4ff1d734b9d13a03c4af8f9d5d24
- review_task: Open Version 1, compare complete/missing-proof behavior, return to the same PRD context; inspect missing/changed/unsupported-access recovery without approving.
- inspection: Agent browser interaction, 19 checks passed, zero console errors. Checks covered open/return, explicit unconfirmed policy, local example actions, document access, missing/changed/unsupported access, restored valid basis, simulated decision, Chat discussion and no horizontal overflow at viewport widths 736, 360 and 320px. The wrapper's inner widths were 704, 328 and 288px respectively. Mobile screenshot inspected at .playwright-mcp/prd-preview-review-mobile.png.
- observations: Navigation preserves undecided state; the normal example allows a visibly simulated action; the missing-proof example disables it under a labelled unconfirmed assumption; missing/changed review material disables the old simulated PRD action and identifies recovery. This is implemented prototype behavior, not implemented delivery-runtime behavior.
- untested: Independent reviewer understanding, actual decision session access, real approval persistence, historical record compatibility, keyboard/screen-reader audit and native host opening/teardown. These require later product review and implementation validation.
