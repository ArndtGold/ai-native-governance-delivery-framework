# Brownfield Review: Canonical Scope Classification Card

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: agdf-scope-classification-card
- related_ur: `.agdf/control/artefacts/agdf-scope-classification-card/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-21

## Objective

Size and route the approved UR scope: a canonical, deterministic, localized, non-authorizing
scope-classification presentation for fresh ungated scopes, owned by the existing presentation owner.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The card introduces a new user-facing visible state presentation (a new card type) in the framework's chat surface for fresh ungated scopes. Intent is unambiguous (make the classification visible), but presentation semantics — fields, placement, interaction with the read-only orientation line — materially define a new visible state type and must be pinned before PRD readiness.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready` (`.agdf/control/artefacts/agdf-scope-classification-card/UX_INTENT_DEFINITION.md`, 2026-07-21)

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/contracts/interaction.md` (presentation ownership, `authorizes: false`, read-only orientation), `plugin/meta/contracts/modes.md` (Quick Task output, Trivial Change Boundary) | Contract modules read on 2026-07-21 | `medium` |
| Source of truth | `create-agdf/lib/interaction-presentation.js` — single presentation owner (670 lines: locale resolution, `renderOperationalStatusCard`, `buildApprovalOrientationSnapshot`, `gateOptions`, `normalizeInteractionOutcome`) | Export inventory inspected 2026-07-21 | `low` |
| Runtime path | `create-agdf/bin/create-agdf.js` gate-check CLI; renderer functions are pure over (registry, locale, state) | CLI validated during UR gate on 2026-07-21 | `low` |
| UI / UX | Chat-surface cards; locale registry `plugin/meta/agdf-interaction-locales.json` with `primary.*` sections and parity validation via `validateLocaleRegistry` | Registry structure inspected 2026-07-21 | `medium` |
| Persistence / data | None — classification is transient, non-authorizing; UR non-goal forbids a state store | UR §4 | `none` |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs` (ownership/duplication assertions), `evals/` corpus (36 cases, extended 2026-07-21), `create-agdf` smoke chain | Both run green on 2026-07-21 | `low` |
| Release / operations | Generated surfaces via `create-agdf/scripts/sync-package-assets.js`; Pages derives eval counts at build time | CI workflow inspected | `none` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Presentation rendering must extend `interaction-presentation.js`, not a new module | Single-owner contract in `interaction.md`; export inventory | `warn` | SD places the renderer as an additive export in the existing owner |
| Overlap with `primary.readOnlyOrientationDescription` (single sentence for read-only requests) | Locale registry inspection 2026-07-21 | `warn` | SD must keep one orientation owner: read-only orientation (no run decision) vs. scope classification (ungated run decision) — distinct semantic blocks |
| Skill-local classification template could re-emerge in `gate-check` | gate-check output section is agent-authored today | `revise` | Skill consumes projection verbatim; Runtime Integrity assertion forbids a second template |
| Deterministic evaluation for run-less fresh scopes has no CLI path today | gate-check CLI evaluates selected runs only | `revise` | PRD/SD decide: agent-evaluated classification with code-owned rendering (small slice) vs. new run-less CLI evaluation (bigger slice) |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: New user-facing presentation semantics across several canonical owners (presentation lib, interaction contract, gate-check skill, locale registry, Runtime Integrity, eval corpus) rule out `quick_task` and `verified_change`; the change is bounded to one additive projection plus consumption and assertions — no gate, transition, schema-persistence or architecture change — so full `structured_delivery` is disproportionate.
- evidence: Existing-System View above; UR §3 scope list; single-owner contract in `interaction.md`; eval and integrity infrastructure already green.
- transparency_note: Later artefacts stay intentionally small and scoped to this slice: PRD pins presentation semantics and the evaluation-location decision; SD places the renderer in the existing owner; TP maps the six scope items; no broad ceremony.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Where does the deterministic classification evaluation live for run-less fresh scopes (agent-evaluated + code-rendered vs. new CLI path)? | `PRD` | `revise` |
| Does the projection get a machine-readable JSON twin (like `status_card`) or stay chat-only? | `SD` | `warn` |
| Exact field set and ordering of the card (UR-trigger, mode, boundary, allowed/forbidden, escalation triggers) and its interaction with the read-only orientation line? | `PRD` | `revise` |
| UX intent definition result (required for `medium` impact) must be `ready` before PRD readiness | `PRD` | `block` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: none
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `link after UAT`
- context_graph_gate_effect: `none`
- context_graph_evidence: Candidate node for the invariant "ungated scope classification is code-owned and non-authorizing"; curated at closeout, not during the slice.

## Next Permissible Step

- next_allowed_action: Run `ux-intent-definition` (required for `medium` UI/UX impact) and then draft the PRD at the smallest justified depth.
- forbidden_until_then: SD, TP, Brownfield Analysis, implementation, QA, release — and any presentation-owner edit.

## Quality Outlook

- quality_outlook: Keep the presentation owner singular and the card cheaper than today's ad-hoc classification; proportionality inversion is the primary design risk.
