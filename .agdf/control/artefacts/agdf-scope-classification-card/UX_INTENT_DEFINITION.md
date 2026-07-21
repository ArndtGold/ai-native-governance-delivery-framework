# UX Intent Definition: Canonical Scope Classification Card

Status: ready
Decision: ready
Based on: approved UR and post-UR routing evidence
Date: 2026-07-21
Owner: agent

This is non-authorizing analytical input. It is not a user-gate artefact, carries no approval and
grants no implementation permission. After PRD approval, the PRD is the sole product authority.

## 1. Routing Evidence

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: New user-facing visible state presentation (new card type) in the framework's chat surface; intent unambiguous, but presentation semantics define a new visible state type (recorded in `BROWNFIELD_REVIEW.md`).
- ux_intent_definition_required: yes

## 2. Intent And Success

- primary_user_intent: A user of an AGDF-governed agent session wants to see and trust *why* a fresh request was classified as ungated (Quick Task / Trivial Change Boundary) — the classification, its grounds (no UR trigger, selected mode, boundary result), what is currently allowed and forbidden, and what would escalate — without having to ask or challenge blindly.
- success_signal: For every fresh ungated scope, exactly one compact, deterministic, localized classification card is visible before work proceeds; identical scope state and locale produce an identical card; the user can challenge the classification on visible grounds.
- primary_decision_or_action: The user's decision is optional and implicit: accept the classification (continue) or challenge it (override toward the UR gate). The card itself never asks a question and never carries approval controls.

## 3. Working Modes And State

- working_modes: (a) `ungated-trivial`: fresh scope fully inside the Trivial Change Boundary; (b) `ungated-quick-task`: fresh scope classified Quick Task outside the trivial boundary; (c) `gated-or-ambiguous`: scope requires a UR or its boundary is ambiguous — the classification card must not appear; the existing gate flow owns the surface.
- effective_state_by_mode: (a)/(b) the classification outcome (UR-trigger evaluation, selected mode, boundary result, allowed/forbidden summary, escalation triggers) as a transient, non-persisted projection of the agent's gate-check evaluation; (c) no classification state — the UR gate flow owns effective state.
- visible_state_types: one compact localized Markdown card with deterministic field order and `authorizes: false`; never a table dashboard, never an approval control, never a second status card.
- effective_state_authority_by_mode: (a)/(b) classification authority remains the gate-check evaluation against the Runtime Contract; the card projects, it never decides; escalation authority is the user challenge or agent reclassification on new evidence; (c) the UR gate and its exact approval remain the sole authority.
- primary_state_presentation_owner_by_mode: (a)/(b) the code-owned renderer in `create-agdf/lib/interaction-presentation.js`, consumed verbatim by `gate-check`, with copy from the canonical locale registry — not agent free prose; (c) the existing `status_presentation`/`approval_presentation` owners, unchanged.

## 4. Activation, Blockers, Recovery And Transitions

- activation_paths: Rendered when `gate-check` classifies a fresh scope as ungated, once per classification, before work proceeds; also on explicit user request ("why is this ungated?"). Never for gated scopes, never for internal steps of a selected run, never as a substitute for the two-card approval envelope.
- blockers: Boundary or mode cannot be determined unambiguously → no card, fail closed to the existing ceremony or clarification; locale pack incomplete → deterministic `en` fallback as one unit; renderer output missing or stale → fail closed, never model-reconstructed Markdown.
- recovery_paths: User challenges the classification → re-evaluate against the contract; scope proves gated → minimal UR draft and `Approval: UR` path; boundary proves ambiguous → full existing ceremony; after new evidence, re-render the card from a fresh evaluation (visible retry, never a patched card).
- relevant_state_transitions: `ungated → gated` on discovered product semantics (routes to UR); `ungated → ambiguous` on conflicting evidence (routes to fail-closed ceremony); `ungated → executed` closes with the existing compact Quick Task output shape, unchanged.

## 5. Proposed PRD Acceptance Criteria

- proposed_prd_acceptance_criteria:
  1. Identical scope state and locale produce a byte-identical classification card across invocations.
  2. The card carries `authorizes: false` and never renders approval options or decision controls.
  3. The card appears exactly once per fresh-scope classification, before work proceeds.
  4. An ambiguous boundary or mode renders no ungated card and fails closed to the existing ceremony.
  5. The card makes the challenge path visible (how the user overrides toward the UR gate).
  6. `en`/`de` packs are complete and parity-validated; an incomplete pack fails to English as a unit.
  7. `gate-check/SKILL.md` holds no second classification card template; Runtime Integrity fails on drift.
  8. The card never appears for gated scopes or internal steps of a selected run.

## 6. Decision Evidence

- blocking_reason: none
- open_product_questions:
  1. Does the card render also for run-less chats without `.agdf/control/`, or only in governed repositories? (PRD decision)
  2. Does the projection get a machine-readable JSON twin for automation, or stay chat-only? (PRD visibility decision, SD technical placement)
  3. Does the card show explicit allowed/forbidden inventories or only classification, boundary and escalation triggers? (PRD depth decision)
- affected_outputs: `gate-check` chat output for fresh ungated scopes; `interaction.md` contract (one new presentation block); locale registry (`en`/`de`); eval corpus.
- evidence: approved UR (2026-07-21); `BROWNFIELD_REVIEW.md` (2026-07-21); `interaction-presentation.js` export inventory; locale registry structure; session observation of the ad-hoc classification.
- missing_evidence: none blocking — remaining decisions are explicitly routed product questions, not ambiguities in intent, modes, authority, activation, blockers, recovery or transitions.
- required_next_step: Draft the PRD at the smallest justified depth, incorporate criteria 1–8, decide the three open product questions, then request `Approval: PRD`.
