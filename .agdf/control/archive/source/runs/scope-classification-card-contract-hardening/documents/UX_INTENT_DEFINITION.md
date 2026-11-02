# UX Intent Definition: Scope Classification Card Contract Hardening

Status: ready
Decision: ready
Based on: approved UR and post-UR Brownfield routing evidence
Date: 2026-08-19
Owner: agent

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The correction changes card activation for the Verified Change mode and visible recovery for unsupported locale, incomplete registry and invalid dynamic input.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Understand why a fresh request is safely ungated without seeing a misleading, malformed or authorization-like classification card.
- success_signal: A valid fresh Quick Task produces one compact localized non-authorizing card; every gated, Verified Change, ambiguous or invalid state uses the existing authoritative flow without a scope card.
- primary_decision_or_action: Continue with the shown Quick Task boundary or challenge the classification toward the UR gate.

## 3. Working Modes And State

- working_modes: valid fresh Quick Task; unsupported requested locale with complete fallback; invalid/incomplete registry or invalid dynamic input; Verified Change/gated/ambiguous/selected-run flow.
- effective_state_by_mode: Valid Quick Task remains ungated and visible; unsupported locale remains ungated and renders in English; invalid registry/input has no visible classification state and fails closed; all non-Quick-Task flows retain their existing run/gate state without a scope card.
- visible_state_types: localized Scope Classification Card for valid Quick Task only; existing ceremony, Run Status Card or gate presentation for every suppressed classification state.
- effective_state_authority_by_mode: `gate-check` evaluation against the Runtime Contract decides classification; exact gates and durable run state remain authoritative for Verified Change and structured flows; the card never decides.
- primary_state_presentation_owner_by_mode: `renderScopeClassificationCard` for valid Quick Task; existing interaction presentation owners for target clarification, run status and gate decisions.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Fresh resolved target, no UR trigger, mode `quick_task`, valid trivial-boundary value, valid bounded plain-text fields, non-empty bounded escalation triggers and a complete supported or English fallback locale pack.
- blockers: Verified Change or gated outcome, ambiguous classification, incomplete/invalid registry, Markdown-bearing/multiline/over-length dynamic field, invalid trigger collection or missing required field suppresses the card.
- recovery_paths: Unsupported requested locale automatically renders the complete English pack; invalid registry or input visibly returns to the existing fail-closed ceremony or clarification path; a user challenge re-evaluates scope toward the UR gate.
- relevant_state_transitions: valid fresh input → visible non-authorizing Quick Task card; unsupported locale → same effective classification with English presentation; invalid input/registry → no card and existing ceremony; discovered product semantics → UR gate; approved UR/Brownfield selection → no fresh-scope card.

## 5. Proposed PRD Acceptance Criteria

- Valid Quick Task input produces deterministic localized output with `authorizes: false`.
- `verified_change`, gated, ambiguous and unknown modes never produce the card.
- Unsupported locale tags use the complete English pack; incomplete/invalid registry state renders no card.
- Every dynamic field is non-empty, single-line, plain text and within a canonical bound; escalation triggers have canonical count and per-item bounds.
- Invalid input fails closed without mixed-language or partially sanitized output.
- Existing Run Status Card, gate presentation and exact approval behavior are unchanged.
- Generated surfaces consume the same contract and renderer without local templates.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions: Exact numerical field and trigger bounds are a PRD decision; the SD will place their canonical technical representation.
- affected_outputs: Scope Classification Card Markdown, fail-closed suppression behavior, locale fallback, focused tests, eval expectations and generated runtime bundle.
- evidence: approved UR; Brownfield Review; parent PRD/SD; current interaction contract, renderer, locale registry and focused probes.
- missing_evidence: none blocking for PRD drafting; implementation and live-host evidence remain later obligations.
- required_next_step: Draft the bounded PRD and request exact `Approval: PRD`.
