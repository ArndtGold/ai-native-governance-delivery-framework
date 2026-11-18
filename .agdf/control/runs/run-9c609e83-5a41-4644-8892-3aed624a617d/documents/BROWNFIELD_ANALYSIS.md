# Brownfield Analysis: Companion shows planned URs instead of an empty state

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- approved_tp: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/TP.md (sha256:6254af66bc0d28ccac7c827da33d71fdb8d33323f71a584ac5a4617e657a2198)
- approved_sd: sha256:27057a365c4c75fb6e030fb83863e6679fadab18b4909a32b8677d1c296eabcd
- reviewer: Claude (agent)
- reviewed_at: 2026-11-16

## Scope

Implementation preparation for T-001 to T-009. The uncommitted candidate on branch `feat/companion-planned-ur` (base `13c10af7`, 15 changed files from `git diff --stat`) is compared with SDD-001 to SDD-007 per the TP planning decision.

## Existing Owners And Reuse Path

| Area | Existing owner | Reuse strategy | Evidence |
|---|---|---|---|
| Planned-UR facts | `packages/core/lib/control-state/planned-inventory.js` `projectPlannedInventory` | reuse unchanged | candidate `readPlannedView` calls it with `{ language }` and filters `coverage !== 'transferred'` |
| UR heading and goal | `run-view.js` `readRunNaming` | refactor into shared `readUrFacts` (extend) | candidate moves the existing safety checks (`isSafeControlRelativePath`, `.agdf/control/` prefix, `hasSymlinkComponent`, `containedRegularFile`, `UR_READ_LIMIT`, `source_changed` rethrow) unchanged into `readUrFacts`; adds `authoredGoal` from `decision-content-readiness.js` |
| Run view output | `projectRunView`, `readRunView` | extend | candidate adds `planned = []` parameter and reads it via `captured(readRoot, ...)` only when `store.status === 'ok'`, catch yields `[]` |
| Snapshot | `run-state.mjs` `snapshotFromRunView` | extend | `companionPlan` maps `plan_id, title, coverage, goal, last_change`; non-array or entries without string `plan_id` are dropped |
| Selection | `assignment.mjs` | extend with `pickPlan` | sorts newest first, condition `changedAt >= sessionStartedAt || !hasOpenRuns`, returns `{ plan, count }` |
| View model | `view.mjs` `buildPanelView` no-run branch | extend | planned branch placed after the unreadable-selection check and before the existing idle/empty branches; existing branches untouched |
| Pane | `register.mjs` | extend | `shownId = view.runId ?? view.planId` for figure scope and reference line; `view.note` line |
| Status line | `notice.mjs` `observedRun`, `statusText` | extend | new kind `planned` only in the no-run path |
| Fingerprint | `register.mjs` `fingerprint` | extend | folder names of `.agdf/control/planned` plus file listings of known planned folders |
| Figure | `figure.mjs` | reuse unchanged | planned view passes `workGate: 'UR'` and `resting`, which the existing UR clipboard rule handles |
| Catalog | `agdf-interaction-locales.json`, `interaction-catalog-validation.js` | extend | `companion.planned` block and `statusStates.planned` in de/en; validation key set gains `planned` |

## Comparison With The Approved SD

| SDD | Candidate status | Finding |
|---|---|---|
| SDD-001 | matches | field shape `{plan_id, title, coverage, goal, last_change}`, transferred excluded, schema id unchanged |
| SDD-002 | matches | separate captured read, gated on run store ok, `[]` on failure |
| SDD-003 | matches | one shared reader; Run naming now calls it with the registered UR path |
| SDD-004 | matches | selection rule and count as designed; only consulted in the no-run branch of view and notice |
| SDD-005 | matches | mood `laeuft`, figure reason gate UR, `workGate` UR (suppressed when stale), `resting = !(draft && turn)`, coverage-specific texts, note from completed Runs and further planned URs, plan id; terminal prints note and plan id |
| SDD-006 | matches | listing-based fingerprint, no extra process |
| SDD-007 | matches | observed kind and status text; validation key set extended |

No deviation from the SD was found. Generated artefacts in the candidate (`copilot-payload-baseline.json`, `docs/compatibility/**`, the new observation file) are not trusted and are regenerated in T-008.

## Regression Risk And Test Impact

- Run naming refactor (SDD-003): covered by existing `companion-run-view-test.js` naming cases and `run-view-command-test.js` (SCN-012).
- No-run branch ordering: an unreadable selected run still wins; when `pickPlan` returns null the existing idle/empty branches run unchanged (SCN-013).
- Catalog exact key sets: Core reads the generated catalog copy, so `sync-package-assets.js` must run before tests (T-008 order).
- Candidate tests exist for SCN-001 to SCN-011 in `companion-run-view-test.js`, `claude-companion-test.js` and `claude-companion-adapter-test.js`; they are run fresh in CD+Tests, not assumed passing.
- Host limit: symlink tests fail with EPERM on this Windows host and are outside the TP check list.

## Architecture And Parallel-Structure Risk

- architecture_relevance: architecture-not-applicable; the candidate keeps the host template on its own modules plus the single read-only `run-view` process and adds no new owner.
- No parallel goal parser, no planning-file parsing in the host template beyond directory listings for change detection.

## Context Graph Impact

- context_graph_impact: none

## Minimal Clean Implementation Path

Keep the candidate source changes for T-001 to T-007 as they match the SD; run T-008 in the fixed order (build:mcp, sync-package-assets, exact payload baseline, compatibility record), then the full TP check list, then T-009 renders. Correct any failing scenario in place before CR.

## Next Permissible Step

- next_allowed_action: CD+Tests for T-001 to T-009.
- forbidden_until_then: CR, QA, UAT, commit, push, PR.

## Decision

- decision: pass
