# UX Intent Definition: Understand the actual outcome before UAT

Status: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-10-14
Owner: Coding agent, existing UX analytical owner

This is non-authorizing analytical input, not a user gate or parallel product source. Proposed criteria become authoritative only in the approved PRD. Component, storage and derivation design belongs to SD.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Decision information and missing-content feedback change within existing Run/UAT approval behavior.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Understand whether this exact scoped delivery satisfies the intended outcome and what limits remain before accepting it.
- success_signal: The user sees concrete intended and delivered outcomes, current acceptance/QA disposition, material limits and approval effect; can inspect exact supporting sources; and is never asked to approve a placeholder or source-list-only result brief.
- primary_decision_or_action: Deliberately approve the exact eligible UAT version or discuss/request correction; an incomplete draft is corrected by its permitted authoring owner before an approval is requested.

## 3. Working Modes And State

- working_modes: incomplete Run draft; current decision preparation with missing required content; ready current UAT review; changed/stale material; historical accepted document; recoverable transient failure.
- effective_state_by_mode: Draft remains authorable with no claim of readiness. Missing required content withholds the approval request while preserving source/status inspection. Ready UAT is eligible only under all existing gate and exact-source checks. Stale material needs refreshed preparation; prior replies do not apply. Historical material preserves its accepted bytes/decision and cannot authorize current work. A transient failure remains failed or uncertain until existing status/receipt recovery proves its outcome.
- visible_state_types: draft/incomplete; concrete content gap with next owner/action; ready outcome brief; stale/unavailable source; historical accepted version; retryable or uncertain preparation/recording failure.
- effective_state_authority_by_mode: Existing canonical Run/readiness and deliberate approval authority determine current state. Registered source artefacts determine product/QA/implementation statements. Exact historical records determine historical decisions. Reading, rendering and agent summaries confer no authority.
- primary_state_presentation_owner_by_mode: Existing Run/gate/presentation output communicates draft/gap/readiness; the current UAT decision view communicates outcome/limits and the exact document; the existing historical document view communicates old accepted material. These are visible-role definitions, not component design.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Existing authorized Run authoring and eligible UAT preparation; no new activation or approval interaction is introduced. Ordinary status/document reading stays read-only.
- blockers: Missing/placeholder stage-required outcome; unavailable or unusable required authoritative sources; stale material; unmet existing QA/UAT prerequisites. A technical evidence list alone cannot count as a delivered-result explanation.
- recovery_paths: Show the exact missing content/source and the existing permitted authoring or revision owner. An agent may correct an unapproved draft within scope; approved sources need their existing revision route. Reprepare changed material. For transient failures, show existing status/recovery and a retry of preparation when safe; do not retry a human decision as a new approval or claim unconfirmed persistence.
- relevant_state_transitions: draft -> concrete current content -> ready decision; missing content -> permitted correction -> fresh readiness; current -> changed/stale -> fresh preparation; deliberate current approval -> existing post-UAT closeout; historical accepted remains historical; failed/uncertain -> verified outcome or explicit retry/recovery.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: Stage-appropriate draft preservation and placeholder rejection; a complete source-attributable UAT result brief visible in decision and exact document; honest partial/deviation/unobserved qualification treatment; precise gaps with existing correction/retry routes; fresh binding after source changes; protected history, deliberate approval and read-only inspection; all registered language rendering and actual installed positive/negative/refusal-state qualification.

## 6. Decision Evidence

- decision: ready
- blocking_reason: none
- open_product_questions: none requiring additional user intent; PRD defines the exact minimum fields and source/compatibility rules within the approved scope, while SD determines their technical owner.
- affected_outputs: Run/current-gate content diagnostics, UAT decision brief, exact UAT reading document and existing correction/status guidance.
- evidence: Approved UR.md; recorded BROWNFIELD_REVIEW.md; prior immutable UAT document and doctor pass in report-decision-field-hardening-20261014-01; current run-presentation-render.js evidence-only UAT branch and existing exact decisionMaterial/run-presentation bindings.
- missing_evidence: No new implementation, rendered behavior or installed candidate is yet qualified. Those observations follow approved design/plan and are not required to finish this analytical intent definition.
- required_next_step: Incorporate these observable semantics into the bounded PRD and present it through existing readiness/approval owners.
