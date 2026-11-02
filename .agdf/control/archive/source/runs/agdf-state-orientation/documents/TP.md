# TP: State Orientation Visibility Implementation (Slice A)

Status: approved
Gate: TP
Gate approval: exact `Approval: TP` provided on 2026-07-15 after same-run, same-gate and revision revalidation
Revision: 1
Based on: `.agdf/control/artefacts/agdf-state-orientation/SD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Task Plan

| task_id | Priority | Task | SD ref | Owner area | Required evidence |
|---|---|---|---|---|---|
| SO-01 | P0 | Add `breadcrumb` derivation in `buildStatusCard()`: derive `[{gate, status}]` array from `mode_slice_decision` + Approvals table; handle all four path types + `undecided` | SD-01 | `create-agdf/bin/create-agdf.js` | BT-01 through BT-04 pass: breadcrumb returns correct entries for `structured_delivery`, `verified_change`, `quick_task` and `block` |
| SO-02 | P0 | Add `buildBreadcrumb()` export in `interaction-presentation.js`: render `✓`/`●`/`○` from breadcrumb array + locale `gateTitles`; single line, ` · ` separator | SD-02 | `create-agdf/lib/interaction-presentation.js` | BT-01 through BT-04 rendering assertions pass; non-applicable gates absent |
| SO-03 | P0 | Add `buildTransitionNarration()` export in `interaction-presentation.js`: consume `postApprovalTransition()` output + locale `narration` templates; emit one line per gate advancement; never receive or emit `Approval:` value | SD-02 | `create-agdf/lib/interaction-presentation.js` | BT-05 through BT-07 pass: narration template correct, non-overlap with Gate Transition Card, no `Approval:` value |
| SO-04 | P0 | Add `collapseInternalState()` export in `interaction-presentation.js`: map `verified_change` sub-states, `context_graph_required_action`, `multi_scope_state` to human labels; `escalated`/`open_gap`/`blocked` stay explicit | SD-02 | `create-agdf/lib/interaction-presentation.js` | BT-08 through BT-11 pass: collapse mapping correct, explicit values remain, null = not shown |
| SO-05 | P1 | Add locale keys to `agdf-interaction-locales.json`: `statusCard.breadcrumb*`, `primary.narration*`, `internalStateLabels*`, `gateTitles` for `Verified Change`/`Quick Task`/`Block`/`OR` in `en` and `de` | SD-03 | `plugin/meta/agdf-interaction-locales.json` | BT-13 passes: `check-runtime-integrity.mjs` confirms key completeness for both locales |
| SO-06 | P1 | Add Runtime Contract subsections: §Breadcrumb (path-derived, four templates), §Post-Acceptance Narration (template, non-overlap rules), §Internal-State Collapse (mapping table, full-projection unchanged) under §Run Status Card | SD-04 | `plugin/meta/agdf-runtime-contract.md` | Contract text reviewed; no second gate model or authority path introduced |
| SO-07 | P1 | Add gate-check skill guidance: breadcrumb rendering after card steps, generalised narration guidance (extend existing TP pattern at line 69 to all gates), collapse rules for human card | SD-05 | `plugin/skills/gate-check/SKILL.md` | Skill text reviewed; existing steps 1-14 unchanged; new guidance is additive |
| SO-08 | P1 | Propagate to generated surfaces via `sync-package-assets.js` without forking content | SD-06 | `create-agdf/scripts/sync-package-assets.js` | Canonical/generated parity passes across supported surfaces |
| SO-09 | P0 | Add regression assertions in `control-state-test.js`: breadcrumb path types, narration non-overlap, collapse mapping, raw-key absence in human card, full-JSON field retention | SD-07 | `create-agdf/scripts/control-state-test.js` | BT-01 through BT-12, BT-14 pass |
| SO-10 | P1 | Add locale-key completeness checks in `check-runtime-integrity.mjs`: fail if `en` or `de` pack missing `breadcrumb`, `narration`, or `internalStateLabels` keys | SD-08 | `plugin/scripts/check-runtime-integrity.mjs` | BT-13 passes |
| SO-11 | P0 | Run the complete verification bundle and record implementation evidence | — | package and repository checks | Runtime integrity, focused unit tests, control-state tests, package smoke tests and `git diff --check` pass |
| SO-12 | P0 | Perform TP Review, Clean Implementation Review and Code Review before QA | — | AGDF review chain | Task-to-diff-to-test coverage, solution-integrity evidence, no unresolved blocking finding |

## 2. Test Evidence Plan

| test_id | Asserts | SD ref | Fixture |
|---|---|---|---|
| BT-01 | `buildBreadcrumb()` with `structured_delivery` and 2 approved gates returns 6 entries with correct `✓`/`●`/`○` | SD-01 | Run state fixture: `structured_delivery`, UR+PRD approved |
| BT-02 | `buildBreadcrumb()` with `verified_change` returns 3 entries: `UR`, `Verified Change`, `OR` | SD-01 | Run state fixture: `verified_change`, UR approved |
| BT-03 | `buildBreadcrumb()` with `quick_task` returns 2 entries: `UR`, `Quick Task` | SD-01 | Run state fixture: `quick_task`, UR approved |
| BT-04 | `buildBreadcrumb()` with `block` returns 2 entries: `UR`, `Block` | SD-01 | Run state fixture: `block`, UR approved |
| BT-05 | `buildTransitionNarration()` for `UR` returns one line with Brownfield Review as agent-next and "no user action" | SD-02 | Gate advancement fixture: UR → Brownfield Review |
| BT-06 | Narration fixture and Gate Transition Card fixture are not in the same message | SD-02 | Envelope fixture: pre-approval card + post-acceptance narration |
| BT-07 | Narration fixture does not contain `Approval:` value | SD-02 | Narration output string assertion |
| BT-08 | `collapseInternalState()` with `verified_change: eligible` returns "Compact change under review" | SD-02 | Sub-state fixture: `verified_change`, `eligible` |
| BT-09 | `collapseInternalState()` with `verified_change: escalated` returns "Escalated to structured delivery" | SD-02 | Sub-state fixture: `verified_change`, `escalated` |
| BT-10 | `collapseInternalState()` with `context_graph: open_gap` returns "Graph gap open" | SD-02 | Sub-state fixture: `context_graph_required_action: open_gap` |
| BT-11 | `collapseInternalState()` with `multi_scope: clear` returns null (not shown) | SD-02 | Sub-state fixture: `multi_scope_state: clear` |
| BT-12 | Full `status_card` JSON retains `mode_slice_decision` as raw value after collapse | SD-02 | JSON comparison: before and after collapse |
| BT-13 | `check-runtime-integrity.mjs` fails if `en` or `de` pack is missing `breadcrumb`, `narration`, or `internalStateLabels` keys | SD-08 | Negative fixture: locale pack with removed keys |
| BT-14 | `doctor --json` and `gate-check --json` remain compatible (no removed or renamed field) | SD-07 | CLI output comparison: before and after changes |

## 3. Acceptance Matrix

| Dimension | Required cases |
|---|---|
| Breadcrumb paths | `structured_delivery`, `structured_slice`, `verified_change`, `quick_task`, `block`, `undecided` |
| Breadcrumb states | `✓` fulfilled, `●` current, `○` open, non-applicable absent |
| Narration gates | `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT` |
| Narration internal steps | Brownfield Review, Brownfield Analysis (no user action) |
| Narration non-overlap | post-acceptance only, separate message, no `Approval:` value, no effect repetition |
| Collapse sub-states | `verified_change` (5 states), `context_graph_required_action` (5 values), `multi_scope_state` (3 values) |
| Collapse explicit | `escalated`, `open_gap`, `blocked` remain visible |
| Full projection | all raw fields unchanged in JSON |
| Locales | `en`, `de`, fallback for incomplete pack |
| Machine contract | no removed/renamed field; `breadcrumb` is additive derived field |

## 4. Scope Constraints

- Preserve all existing approval formulas, JSON field names and gate logic.
- Do not create a second card renderer, breadcrumb evaluator or collapse authority.
- Do not change the Gate Transition Card composition, option ordering or native-attempt boundary (owned by `agdf-human-decision-surface`).
- Do not add a new locale pack beyond `en`/`de` (extend existing structure).
- Do not claim host-visible rendering evidence (presentation-only changes).
- Do not add a new interaction kind or gate.
- Existing unrelated worktree changes remain isolated.
- If `agdf-human-decision-surface` produces further changes to shared files, re-validate non-overlapping sections before CD+Tests.

## 5. Verification Sequence

1. Reconfirm existing owners and exact touched paths in pre-implementation Brownfield Analysis.
2. Add failing test fixtures for BT-01 through BT-14.
3. Implement SO-01 through SO-04 (CLI derivation + presentation functions).
4. Implement SO-05 (locale keys).
5. Implement SO-06 through SO-07 (Runtime Contract + skill guidance).
6. Implement SO-08 (propagation).
7. Implement SO-09 through SO-10 (regression tests + integrity checks).
8. Run focused tests, full control-state/runtime-integrity suite, package smoke and whitespace checks (SO-11).
9. Run TP Review, Clean Implementation Review and Code Review for SO-01 through SO-10 (SO-12).
10. Run QA only after review evidence is complete.

## 6. Completion Criteria

- SO-01 through SO-12 have direct implementation and test evidence.
- Every acceptance-matrix row is covered or explicitly marked blocked with impact.
- Machine JSON remains compatible; `breadcrumb` is the only new field and is additive/derived.
- No duplicate presentation, breadcrumb or collapse owner exists.
- Compact human card shows breadcrumb, stable labels and no raw sub-state keys.
- Post-acceptance narration is one line, separate from the Gate Transition Card.
- QA receives complete review evidence and no hidden unsupported-language claim.

## 7. Next Step

Review this TP and approve it only with:

`Approval: TP`
