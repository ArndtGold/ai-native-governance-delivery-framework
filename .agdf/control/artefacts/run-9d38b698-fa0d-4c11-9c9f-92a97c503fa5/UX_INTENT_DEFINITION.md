# UX Intent Definition: Find Runs without a central backlog

Status: ready
- decision: ready
Based on: approved UR and completed Brownfield Review for run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
Date: 2026-10-31
Owner: Codex, analytical input for Arndt Gold's PRD decision

This analysis grants no approval or implementation permission. Proposed behavior becomes authoritative only through the approved PRD.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Overview membership, grouping and provenance change from saved backlog rows to stored Run records. Users must distinguish actual Run history, incomplete sources and preserved legacy planning information.
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: Find an undertaking in the selected project's Run records, understand its stored orientation and deliberately open that exact Run for current evaluation and evidence.
- success_signal: A newly created Run is findable without a backlog row; the same query and observation identify the same Run in compact and expanded views. Users can tell whether information is stored, currently evaluated, stale, incomplete or legacy-only. Independent Runs require no recurring shared-backlog edit.
- primary_decision_or_action: Deliberately select and open a named Run. Selection, reading, filtering and refresh never approve, continue or modify delivery work.

## 3. Working Modes And State

- working_modes: active Run overview; Run history; selected Run/document reading; optional legacy backlog reading; documented worktree preparation by an agent/maintainer.
- effective_state_by_mode: The overview is one bounded observation of stored Run records in the selected checkout, with an explicit non-live basis. Active includes lifecycle active and invalid entries as diagnostic observations; history includes completed, superseded and abandoned. Selected Run reading evaluates current canonical sources through existing Core rules. Legacy mode displays retained planning/historical pointers as old source information, separate from Run membership. Worktree preparation defines where a newly chosen isolation checkout belongs, not which Run is authorized.
- visible_state_types: available; empty valid inventory; no search matches; incomplete with accounted invalid/unreadable entries; unavailable; loading; stale previous observation; refresh failed while previous data remains labeled; session expired; selected Run missing/invalid; legacy source absent or unreadable. A saved completed lifecycle and a presently valid seal are different claims.
- effective_state_authority_by_mode: Stored membership and attention derive from the existing Run inventory and its source records, never the legacy backlog. Actual current readiness, allowed action and integrity belong to existing selected-Run Core evaluation. Legacy content has authority only as historical/planning source information. The human chooses a delivery scope and grants approvals; the worktree location conveys neither.
- primary_state_presentation_owner_by_mode: Both overview surfaces communicate the same Run observation and source basis. The selected-Run view communicates current checks and source limits. A separate optional legacy view communicates only preserved legacy facts. Existing canonical guidance/handbook communicates worktree placement and its exceptions. Technical component/DTO/storage decisions remain SD-owned.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Opening the general Cockpit starts in active Runs for the explicitly bound project/checkout; history and any present legacy information are deliberate reading choices. An already established specific Run still opens directly. Search and selection affect only the current reading view. Agents reuse an already assigned worktree; choosing a new worktree follows the project-local convention without automatic creation or host reconfiguration.
- blockers: Invalid Run identity cannot select a different Run; unreadable sources retain a diagnostic and an explicit inspection action. A missing/invalid legacy file cannot block the canonical Run list. An empty valid Run store is different from unavailable/incomplete reading. Expired sessions require reconnecting, not silently reusing expired selectors. No worktree choice may infer branch/Run authority or touch the concurrent CI fix.
- recovery_paths: Recoverable refresh failures visibly offer retry and retain the labeled previous observation when available. Changed observations require deliberate refresh and renewed selection identities. Missing/invalid selected Runs retain the requested identity and a return-to-overview action; no nearest-row substitution. A legacy defect points to that source while Run reading remains available. Ambiguous project ownership for a new worktree is resolved explicitly before any creation; existing worktree locations remain supported.
- relevant_state_transitions: New stored Run then successful refresh adds a discoverable row; active to completed/superseded/abandoned moves it to history from lifecycle, not backlog placement. Source change marks the previous reading stale; successful retry supplies a new observation. Selecting a row opens that exact Run for current checks; returning restores the same area/query and safe focus without retaining invalid selectors. Opening legacy content does not create a Run or alter active/history counts. Existing assigned worktree to continued work reuses that checkout; new isolation uses .agdf/worktrees/INITIATIVE/ beneath the owning project.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria: AC-001 Run-derived membership and identical compact/expanded meaning; AC-002 deterministic existing inventory attention/activity order and search coverage; AC-003 explicit stored versus currently checked basis and safe exact selection; AC-004 partial/error/stale/session recovery with visible retry; AC-005 separate information-preserving legacy access without automatic migration; AC-006 normal Run operations cease mandatory shared-backlog writes; AC-007 historical recovery/approvals remain valid; AC-008 project-local worktree rule, ignore and assigned-checkout reuse; AC-009 compatibility, tests and documentation preserve the concurrent CI repair. PRD owns final stable criteria and their detailed evidence obligations.

## 6. Decision Evidence

- blocking_reason: none for drafting the PRD; no delivered UI is asserted.
- open_product_questions: No unresolved user-intent conflict. Proposed defaults are active/history Run reading, optional separate legacy reading, source-only list observations followed by current selected-Run evaluation, and the existing inventory's attention/activity order. PRD must expressly adopt these before approval; representation and transition mechanics remain design questions.
- affected_outputs: compact and expanded Cockpit overview, selected-Run return/freshness feedback, optional legacy reading and canonical worktree guidance; no added approval surface or worktree-management feature.
- evidence: Approved UR digest sha256:9feb814f5f61037cf69c014ca051783b2846e169fac975db612a8a943b32d3d8 and recorded Brownfield Review digest sha256:ed8763727d79872310204bd645d9e3dfd44fdcf8db100f7c16cf0051a9890d09; existing run-inventory.js semantics, cockpit scoped-reader/selection and shared list code inspected during Brownfield Review. Analytical scenario walkthrough: an illustrative new Run absent from the backlog appears in active Runs after refresh; an illustrative completed Run appears in history; a legacy parking-lot idea remains separately readable without inventing a Run. These are reasoning examples, not user observation or implemented UI evidence. The source UR requests no preview; none was built or reviewed.
- missing_evidence: Product implementation, visible browser/host behavior, migration and fault tests are future TP/QA obligations. None is required to claim this analytical input ready for PRD drafting. No native-host qualification is inferred.
- required_next_step: Canonically record this ready analysis, draft PRD from the approved UR and these explicit proposals, resolve before-PRD choices there, then present the exact PRD for a deliberate human decision.
