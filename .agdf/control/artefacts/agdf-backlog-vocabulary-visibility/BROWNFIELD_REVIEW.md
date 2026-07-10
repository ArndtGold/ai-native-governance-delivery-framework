# Brownfield Review: Make Canonical Backlog Status/Artefact Vocabulary Visible And Verified At Write Time

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: agdf-backlog-vocabulary-visibility
- related_ur: .agdf/control/artefacts/agdf-backlog-vocabulary-visibility/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Confirm exact owners and the safest wording approach (reference CLI source vs. duplicate a static
list) before making the edit, and confirm the sync pipeline propagates it without extra work.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | Documentation-only change; no new allowed values, no behavior change | none |
| Source of truth | `create-agdf/bin/create-agdf.js`: `backlogStatusLabels`, `backlogArtefactLabels`, `normalizeBacklogStatus` | Remains sole authority for actual allowed values; docs must reference it, not duplicate it as an independent list | high |
| Runtime path | `plugin/control/templates/MASTER_BACKLOG.md` Rules section (11 existing rules); `plugin/skills/release-or/SKILL.md` rules 11-12; `plugin/skills/gate-check/SKILL.md` rule 18 | Exact insertion points identified | high |
| UI / UX | none | | none |
| Persistence / data | `create-agdf/scripts/sync-package-assets.js`: `syncDirectory(sourceControlRoot, generatedControlRoot)` copies `plugin/control/` → generated `.agdf/control/`; `syncPluginDirectory(sourcePluginRoot, ...)` copies `plugin/` (including `skills/`) into the generated Codex plugin root | Confirms both edited files propagate through the existing sync pipeline automatically; no separate generated-output edits needed | medium |
| Tests / QA | none directly test SKILL.md/template prose content | No existing test regresses from a wording change | none |
| Release / operations | none | | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| A static duplicated list would drift from the CLI source over time | The UR itself flagged this risk | warn | Phrase the template rule to name `create-agdf/bin/create-agdf.js`'s `backlogStatusLabels`/`backlogArtefactLabels` as the authoritative source, with the enumerated values shown as a current mirror, not an independent spec |
| Sync pipeline already propagates both target files | Confirmed via `sync-package-assets.js` reading `sourceControlRoot`/`sourcePluginRoot` | none | No extra generated-output work needed; the UR's flagged unknown is resolved |
| gate-check/SKILL.md rule 18 already gestures at "canonical ... readable status labels" without naming them | `plugin/skills/gate-check/SKILL.md:73` | none | Add a one-line cross-reference to the template instead of restating the vocabulary a third time (avoiding duplication across three files) |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Pure documentation addition across three already-identified files, no new architecture, no code/behavior change, no new allowed values.
- evidence: Owners and exact insertion points fully identified; sync propagation confirmed; only remaining judgment call (reference vs. duplicate) resolved in favor of "reference the CLI source, mirror current values for readability."
- transparency_note: Quick Task Execution may now edit `plugin/control/templates/MASTER_BACKLOG.md`, `plugin/skills/release-or/SKILL.md`, and `plugin/skills/gate-check/SKILL.md`.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Documentation-only fix; no new durable cross-run knowledge claim.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — implement the three documentation edits, verify with `check-runtime-integrity.mjs` and package smoke tests, and confirm the generated output picks up the change via `sync-package-assets`.
- forbidden_until_then: Any change to the actual allowed status/artefact values or `doctor`'s validation logic.

## Quality Outlook

- quality_outlook: Closes the documentation gap that caused this session's own two backlog label mistakes; future agents (and future sessions) will see the vocabulary at the point of editing instead of discovering it only via a `doctor` finding or a user question.
