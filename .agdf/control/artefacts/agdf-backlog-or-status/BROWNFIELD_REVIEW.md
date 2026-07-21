# Brownfield Review: Backlog OR Status Label

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: agdf-backlog-or-status
- related_ur: `.agdf/control/artefacts/agdf-backlog-or-status/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-21

## Objective

Size and route the approved UR scope: add `awaiting_or` to the backlog status vocabulary.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: A new label appears in the human-facing backlog Markdown; no gate, mode, effective state, activation or recovery behavior changes; intent is unambiguous (fill the post-UAT/pre-OR gap).
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `create-agdf/lib/control-evaluation/shared.js` — `backlogStatusLabels` map (lines 46-62) is the authoritative parser vocabulary | Read 2026-07-21 | `low` |
| Source of truth | Same file; template `plugin/control/templates/MASTER_BACKLOG.md` rule 12 mirrors the list for readability | Read 2026-07-21 | `low` |
| Runtime path | `normalizeBacklogStatus` in `shared.js` (lines 118-121); called from backlog parsing (lines 270, 278) only | Grep 2026-07-21 | `none` |
| UI / UX | Backlog Markdown only; Run Status Card and delivery-map derive status from gate state, not backlog labels | Grep 2026-07-21 | `low` |
| Persistence / data | None — vocabulary is a static map | Map structure | `none` |
| Tests / QA | `create-agdf/scripts/control-state-test.js` exercises control-state evaluation | Existing test file | `low` |
| Release / operations | Generated surfaces via `sync-package-assets.js` if template propagates | Sync script | `none` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Vocabulary must extend the existing map, not a parallel list | Single-owner map in `shared.js` | `none` | Add one map entry |
| Template mirror must stay a mirror, not a second authority | Rule 12 states parser is authoritative | `none` | Add label to mirror list only |
| No other consumer uses backlog status vocabulary | Grep across `create-agdf/lib/` shows only `normalizeBacklogStatus` callers | `none` | None |

## Mode / Slice Decision

- decision: `verified_change`
- required_next_gate: `none`
- scope_reason: Single canonical owner (`shared.js` map), bounded paths (shared.js + template mirror + regression test), no gate/permission/security/persistence/architecture/CLI/release impact, deterministic validation (control-state test + integrity + doctor), explicit escalation target `structured_slice` if hidden consumers emerge.
- evidence: Existing-System View above; `backlogStatusLabels` consumed only by `normalizeBacklogStatus`; baseline clean for candidate paths.
- transparency_note: Verified Change skips PRD/SD/TP/QA/UAT when eligibility is proven; escalates to `structured_slice` if the record becomes `escalated`.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| None — scope is a bounded vocabulary addition | `none` | `none` |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: none

## Next Permissible Step

- next_allowed_action: Create the Verified Change record, capture baseline, prove eligibility, execute the change.
- forbidden_until_then: Any edit to candidate paths before the record is eligible.

## Quality Outlook

- quality_outlook: Keep the change to exactly three files (shared.js, template, test); verify no hidden consumer before execution.
