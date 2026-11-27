# UX Intent Definition: Browser-only click tests for the Codex Companion

Status: ready
- decision: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-11-22
Owner: AGDF maintainers

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The operator reads the selected fixture, the effective action state and the origin of the observed result. The browser exercises the existing Companion.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Exercise a real control in the browser and determine whether exactly one request and at most one work grant can be attributed to the selected test Run.
- success_signal: The operator sees the selected fixture, understands what the first request is waiting for and can distinguish the original attempt from a fresh start. A reviewer can locate the browser observation and the simulated receiving outcome separately.
- primary_decision_or_action: Activate “Run fortsetzen” on a ready fixture with a pointer or keyboard. If an attempt is pending, inspect its status.

## 3. Working Modes And State

- working_modes: Ready disposable fixture, stale or ineligible selection, outstanding handoff, claimed fixture action, settled or interrupted fixture turn, and incomplete observation.
- effective_state_by_mode: A current ready fixture can initiate one request. A published attempt remains pending until the fixture provides correlated evidence. A claimed action reads fixture status and returns the case marker. Stale, conflicting or missing observations require inspection. The previous attempt remains authoritative across reopen or a change of candidate.
- visible_state_types: Text identifies the fixture and available action. The pending state describes what is outstanding. Rendered state, simulated fixture events and missing observations remain distinguishable in the case report.
- effective_state_authority_by_mode: Selected Run and canonical eligibility determine readiness. The shared admission store establishes the attempt and its disposition. The local fixture owns simulated receiver events. The browser supplies rendered state and input observations.
- primary_state_presentation_owner_by_mode: The Companion presents state and recovery. The test context identifies the disposable Run. The browser test report attributes the event sources and any missing facts.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Pointer click or keyboard activation in the actual browser. Two browser views may select the same fixture. A simulated ordinary continuation may compete through the existing fixture dispatcher where supported.
- blockers: An unrelated or outdated selection, a published or claimed attempt and missing or mismatched evidence prevent an additional start based on that state.
- recovery_paths: Inspect the original handoff after reopening. Reload a stale selection. Show retry only when the prior request is proven not to have started and a new evaluation is ready. Preserve uncertainty if a simulated interruption, terminal event or candidate change cannot be correlated.
- relevant_state_transitions: Ready to published to claimed to settled on matching evidence. A competing view observes the first attempt. Lost responses leave it pending. Pre-publication cancellation with confirmed readiness can permit a new deliberate request.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Identify the selected disposable fixture. Mouse and keyboard each yield one bound request in independent cases. Two views can observe one attempt without a duplicate send. Reopening and status inspection add no sends. A bounded fixture reply and work grant are independently attributable. The reviewable record labels actual browser, fixture and simulated outcomes, and lists unobservable cases.

## 6. Decision Evidence

- blocking_reason: None for defining the renewed product criteria. The accepted source revision settles the browser-only observation boundary.
- open_product_questions: None before PRD. Exact fixture wiring and controlled scheduling are implementation and test-design decisions.
- affected_outputs: Built Companion browser interaction, disposable test host and the evidence handed to the linked Run.
- evidence: UR.md and BROWNFIELD_REVIEW.md bind this analysis. On aa73dfba, the focused 360-pixel Chromium runs observed pointer and keyboard submission, retained pending state after reopen, and one outgoing request from two simultaneous activations. These were automated browser observations. No independent human feedback is claimed. The project brand source is .agdf/control/BRAND.md, registered in .agdf/control/SOT_REGISTRY.md, owned by the AGDF maintainer, SHA-256 960aeb2f12e3e17fea2fb8309045c76fb7b4c6d037f6cd62d59ecbbcf204d6f9. Decision clarity and Permitted next action guide the ready and pending controls. Calm information hierarchy keeps the immediate action readable. Source visibility and Visible uncertainty govern event attribution and missing evidence.
- missing_evidence: The three prior browser cases do not establish a receiving work grant, a marker reply, ordinary-route contention, interruption or candidate-change outcomes. Those are downstream test obligations. UR requests no additional preview.
- required_next_step: Draft PRD criteria that name each observable result and the evidence source required to accept it.
