# PRD: Canonical Scope Classification Card

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: UR (approved 2026-07-21), UX Intent Definition (`ready`, 2026-07-21)
Date: 2026-07-21
Owner: agent

## 1. Product Scope

Deliver one canonical, deterministic, localized, non-authorizing **Scope Classification Card** for fresh scopes that `gate-check` classifies as ungated (Quick Task or Trivial Change Boundary). The card makes the classification, its grounds, the current permission boundary, the escalation triggers and the user challenge path visible exactly once before work proceeds.

Decisions for the routed product questions from the UX Intent Definition:

1. **Reach**: The card renders on every fresh-scope ungated classification — with or without existing `.agdf/control/` state. Rationale: the classification gap is most harmful precisely where no governance state exists yet.
2. **Format**: Chat-only Markdown card in this slice. No machine-readable JSON twin, no persistence. Rationale: UR non-goal (no state store); keeps the slice minimal; a later run may add a projection if automation requires it.
3. **Depth**: Compact summary — classification, grounds, one "currently allowed" line, one "remains forbidden" line, escalation triggers, challenge path. No full allowed/forbidden inventories; those belong to the gated Run Status Card and must not be duplicated.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: `.agdf/control/artefacts/agdf-scope-classification-card/UX_INTENT_DEFINITION.md` — decision `ready` (2026-07-21)
- primary_user_intent: The user sees and can trust *why* a fresh request was classified as ungated — grounds, mode, boundary, current permission boundary and escalation triggers — without asking.
- success_signal: Exactly one compact, deterministic, localized card appears before work proceeds; identical scope state and locale produce an identical card; the user can challenge on visible grounds.
- primary_decision_or_action: Optional implicit decision: accept (continue) or challenge (override toward the UR gate). The card never asks a question and never renders approval controls.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `ungated-trivial` | Classification outcome (no UR trigger, Quick Task, trivial boundary satisfied) as transient non-persisted projection | one compact localized Markdown card, `authorizes: false` | gate-check evaluation against the Runtime Contract; card never decides | code-owned renderer consumed verbatim by `gate-check`; copy from the locale registry |
| `ungated-quick-task` | Classification outcome (no UR trigger, Quick Task outside trivial boundary) as transient non-persisted projection | one compact localized Markdown card, `authorizes: false` | gate-check evaluation against the Runtime Contract; card never decides | code-owned renderer consumed verbatim by `gate-check`; copy from the locale registry |
| `gated-or-ambiguous` | No classification state; UR gate flow or fail-closed ceremony owns effective state | existing UR path (minimal UR draft, two-card approval envelope when ready) | UR gate and exact approval | existing `status_presentation` / `approval_presentation` owners, unchanged |

Product/system authority decides what is effectively true. Presentation ownership identifies the
primary surface that communicates state and next action. Technical storage, derivation and component
ownership remain Solution Design concerns.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Rendered once per fresh-scope ungated classification, before work proceeds; also on explicit user request ("why is this ungated?"). Never for gated scopes, never for internal steps of a selected run, never as a substitute for the two-card approval envelope.
- blockers_and_visible_next_actions: Ambiguous boundary or mode → no card, fail closed to the existing ceremony or clarification; incomplete locale pack → deterministic English fallback as one unit; missing or stale renderer output → fail closed, never model-reconstructed Markdown.
- recovery_paths: User challenge → re-evaluate against the contract; scope proves gated → minimal UR draft and `Approval: UR` path; boundary proves ambiguous → full existing ceremony; new evidence → re-render from a fresh evaluation (visible retry, never a patched card).
- relevant_state_transitions: `ungated → gated` on discovered product semantics (feedback: UR gate path opens; next action: minimal UR draft); `ungated → ambiguous` on conflicting evidence (feedback: classification declined; next action: full ceremony); `ungated → executed` closes with the existing compact Quick Task output (feedback unchanged).

## 5. Acceptance Criteria

| criterion_id | working_mode | source_state | Trigger | Expected effective state | Visible feedback | Blocker / failure behavior | Recovery / next action | Observable success | Required evidence |
|---|---|---|---|---|---|---|---|---|---|
| SCC-1 | ungated-trivial / ungated-quick-task | classified scope state | classification rendered | deterministic projection | identical bytes for identical state+locale | none | none | byte-identical card across two invocations | renderer output comparison test |
| SCC-2 | ungated-trivial / ungated-quick-task | any | card rendered | non-authorizing projection | no approval options or decision controls visible | a rendered approval control is a defect | remove and re-render | no approval control in card output | renderer output assertion |
| SCC-3 | ungated-trivial / ungated-quick-task | fresh scope | classification completed | card shown once before work | exactly one card | duplicate rendering is a defect | re-evaluate and render once | one card per classification | eval observation |
| SCC-4 | gated-or-ambiguous | ambiguous boundary/mode | classification attempted | no ungated classification state | no card; ceremony or clarification instead | rendering an ungated card is a defect | fail closed to existing ceremony | no card for ambiguous scopes | eval adversarial case |
| SCC-5 | ungated-trivial / ungated-quick-task | any | card rendered | challenge path visible | override instruction toward UR gate present | missing challenge path is a defect | add and re-render | challenge path visible in card | renderer output assertion |
| SCC-6 | all | locale resolution | card rendered in `en`/`de` | localized copy, canonical values untranslated | complete pack; incomplete pack fails to English as a unit | mixed-language card is a defect | resolve locale as one unit | parity validation passes; fallback observed | locale registry validation + fallback test |
| SCC-7 | ungated-trivial / ungated-quick-task | any | skill output produced | verbatim consumption | no skill-local card template in `gate-check` | second template is a defect | remove duplicate, consume projection | Runtime Integrity passes | `check-runtime-integrity.mjs` |
| SCC-8 | gated-or-ambiguous | gated scope or selected-run internal step | any | no classification state | no card | card on gated/internal step is a defect | suppress and follow gate flow | no card observed in gated flow | eval boundary case |

## 6. Non-Goals

- No new user gate, approval value or change to gate order / Gate Transition Model.
- No machine-readable JSON twin, no persistence, no state store for classifications.
- No full allowed/forbidden inventories in the card (owned by the gated Run Status Card).
- No change to `status_presentation` / `approval_presentation` schemas or to the Quick Task output shape.
- No live host UI claims; no commit, push, PR, release or reinstall.
- Not retroactive for historical runs.

## 7. Users And Roles

- Affected: users of AGDF-governed agent sessions on all supported surfaces (Codex, Claude Code, OpenCode, Copilot, fallback), who today may never see an ungated classification.
- Decides: the user approves this PRD (`Approval: PRD`); gate classification authority stays with `gate-check` against the Runtime Contract; the card never decides.

## 8. Constraints

- Proportionality: the card must not add a user decision step or make Quick Tasks heavier than today's ad-hoc classification.
- Single owner: rendering lives in the canonical presentation owner; locale copy in the canonical registry; no parallel renderer, no skill-local template.
- Fail-closed: ambiguous boundary/mode, incomplete locale pack or missing/stale renderer output never produce an ungated card.
- Compatibility: no schema change to existing presentations; no new gate vocabulary beyond the two working-mode labels.

## 9. Evidence Requirements

- Renderer output tests proving SCC-1, SCC-2, SCC-5 (deterministic bytes, no approval controls, visible challenge path).
- Locale validation proving SCC-6 (parity + unit fallback).
- Runtime Integrity assertion proving SCC-7.
- Eval cases proving SCC-3, SCC-4, SCC-8 (once-only, no card when ambiguous/gated).
- QA must see: test outputs, integrity run, eval report and one reviewed example card per locale.

## 10. Risks And Open Questions

- Where the deterministic renderer input boundary lies (agent-evaluated classification fields passed to the code-owned renderer vs. CLI-side evaluation for run-less scopes) — SD decision; the UR flags the CLI path as the larger alternative.
- Exact field set, ordering and copy budgets of the card — SD detail within the compact-depth decision.
- Whether generated surfaces (Copilot instructions, OpenCode skills) need propagation — SD/TP via canonical sync owner.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
