# Brownfield Review: Human-readable AGDF Master Backlog

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: master-backlog-human-readable
- related_ur: .agdf/control/artefacts/master-backlog-human-readable/UR.md
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-09

## Objective

Size and route the approved readability and link-normalization change without creating a second backlog model.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `.agdf/control/artefacts/master-backlog-human-readable/UR.md` | Approved scope and acceptance signals | medium |
| Source of truth | `plugin/control/templates/MASTER_BACKLOG.md` | Canonical generated backlog template | high |
| Runtime path | `create-agdf/bin/create-agdf.js` | `readBacklogPointers` parses fixed cells and currently returns raw Markdown values | high |
| Skill behavior | `plugin/skills/gate-check/SKILL.md`; `plugin/skills/release-or/SKILL.md` | Skills maintain and report control state | medium |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Copies canonical control assets to supported surfaces | medium |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/smoke-test.js` | Existing cross-surface and CLI regression checks | high |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The canonical backlog template already owns the Markdown shape | `plugin/control/templates/MASTER_BACKLOG.md` | block if duplicated | Change the canonical template and regenerate derived assets |
| The CLI currently exposes table cells without Markdown-link normalization | `readBacklogPointers` | revise | Normalize link targets at the parser boundary while accepting legacy raw paths |
| Human and machine status vocabularies could drift | Current `uat_pending` row and CLI JSON | revise | Define one mapping and keep JSON values stable |
| A compact table can hide artefact-chain detail | Existing UR/Brownfield/PRD/SD/TP/QA/OR columns | warn | Preserve links in one compact Artefacts cell and keep Current Spec explicit |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: The change is bounded but alters a durable control format, CLI parsing contract, skill instructions and generated surfaces.
- evidence: Existing owners and tests are clear; compatibility and visible status semantics need explicit acceptance criteria before implementation.
- transparency_note: A small PRD is required to freeze the human table shape, status mapping and compatibility behavior. Separate SD depth is likely unnecessary if the PRD selects the existing parser and sync path.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which compact columns are mandatory for Active and Planned work? | PRD | revise |
| Which human labels map to stable machine statuses? | PRD | revise |
| How are multiple artefact links represented and normalized? | PRD | revise |
| Must legacy wide rows remain supported indefinitely? | PRD | block |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: The change refines the existing durable-control presentation without introducing a new governance concept.

## Next Permissible Step

- next_allowed_action: Draft the smallest PRD that defines the compact table, status mapping, Markdown-link normalization and compatibility boundary.
- forbidden_until_then: Solution Design, Task Plan, implementation, QA and release claims.

## Quality Outlook

- quality_outlook: Keep one canonical backlog model and normalize presentation only at explicit Markdown and parser boundaries.
