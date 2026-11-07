# Clean Implementation Review: Companion core in Core (run view, MCP events, figure states)

Decision: pass
Gate: QA
Type: Clean Implementation Review
Reviewer: Claude (reviewing agent for Arndt Gold); first pass with an independent read-only scan, follow-up delta reviewed by a further independent agent
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

Re-review of the uncommitted change on branch `feat/companion-core-run-view` against main `53e8e900` after the QA follow-up corrections. The first review (`evidence/CLEAN_IMPLEMENTATION_REVIEW-input-01.md`, revision 36, `revise`) raised CIR-01 to CIR-06; Arndt Gold asked for their correction on 2026-11-06. The corrections, the regressions an independent review of that delta found (RV-01 to RV-07 in `evidence/CODE_REVIEW-input-02.md`) and their corrections are assessed here against the approved SD (SDD-001 to SDD-010, section 2 ownership, section 4 integration points), the TP and the Brownfield Analysis reuse path. Owner-decided items C1 to C5 are not repeated; C1 and C5 are open as TP Review design gaps TPR-02 and TPR-03, which this review does not decide.

## Clean Implementation Review

- decision: pass
- primary_solution: The run view is projected from the unchanged `evaluateGateCheck` report, now read inside `captureControlScope` as T-002 requires: one bounded, revalidated snapshot for the run inventory and one for each evaluated run with its drift. The companion obtains it only through the read-only `run-view` command and imports no Core module. Events are derived by one pure function and journaled once by the executing process; review facts and drift reuse the node digest owner; companion texts live in the central catalog.
- evidence: `packages/core/lib/companion/run-view.js`, `figure-state.js`, `events.js`; `packages/core/lib/control-state/run-inventory-reader.js` (`observe` option), `run-identity.js` (`RUN_STEP_SLOTS`), `run-steps.js`; `packages/core/lib/mcp-tool-errors.js` (`COMMAND_TOOL_NAMES`); `packages/core/lib/control-inspect/run-classification.js` (`BOUNDED_READ_CODES`, configuration codes); `packages/cli/lib/cli/project-read-command.js`; `plugins/agdf/host-templates/claude/companion/events.mjs`, `run-state.mjs`, `register.mjs`, `view.mjs`; tests and red checks listed under Normalized Findings; verification below.
- fallbacks_retained: Journal write errors are swallowed (SDD-006, notification channel). The companion keeps the last good view marked stale on a failed read, on a transient store reason (`source_changed`, `timeout`) and on a view in which a run was read during a change, exit condition: the next successful read (SDD-010, RV-01). A captured read that changed underneath is repeated at most three times before `source_changed` is reported (`CAPTURE_ATTEMPTS`), exit condition: an unchanged read or the bound. A durable event that no fresh view can confirm yet waits, at most `PANE_EVENTS` entries, until the next fresh view confirms or drops it. `run-view` without `--language` leaves the language to Core when the configuration cannot be resolved, so the store diagnosis of PRD AC-002 is never lost; an invalid configuration shows as `control_invalid` per run (CIR-05, RV-04). Each fallback has its rationale in the code and a covering test.
- workaround_or_shim_risk: The journal data root reaches Core as the environment variable `AGDF_COMPANION_DATA_ROOT` (accepted in the first review: it reaches forked generations, the launcher sets it in the facade environment only, and tests pin the name). `captured` takes the capture function as an optional third argument, a test seam whose default is `captureControlScope`. The timeout of a failed process call is told by elapsed host time, not by message text (CIR-06).
- parallel_structure_risk: Resolved. Run-view entries carry only the status card fields, the figure and the run facts (CIR-02); the inventory's attention counts are no longer part of the view. Owner values are imported in Core (`COMMAND_TOOL_NAMES`, `RUN_STEP_SLOTS`, `RUN_MODES`, `BOUNDED_READ_CODES`), and each companion mirror, which SDD-010 allows because the mod imports no Core, is pinned to its owner by a test (CIR-04). The unreadable reason follows the reader's classification (CIR-03).
- brownfield_fit: The reader uses `captureControlScope` like the cockpit and `artifact-readiness` (snapshot root via the view), the run inventory owner through an explicit option instead of a copy of its discovery, `boundedCode` as the single reason owner and the `project-state` command pattern.
- missing_evidence: none for solution integrity; native desktop behavior is T-013 (TP Review TPR-01).
- required_next_step: QA through `qa-gate` once the open TP Review findings (TPR-01 to TPR-03) are resolved.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-01 | implementation_gap | CD+Tests | resolved | `readRunView` now reads inside `captureControlScope` (T-002, SD section 4), one snapshot for the inventory and one per evaluated run (`captured`, retry on `source_changed`, RV-01/RV-02), via the resolved root (RV-03). Tests `companion-run-view-test.js` "CIR-01/RV-2", "RV-3/RV-5", "RV-1"; red on the uncaptured version (outside document evaluated) and on the single-snapshot version (whole store unavailable, linked root refused) | none |
| CIR-02 | implementation_gap | CD+Tests | resolved | `attention` and `assessment` removed from run-view entries and the inventory `counts` from the view; test "CIR-02", red on the previous code; no consumer in the companion, harness or tests | none |
| CIR-03 | implementation_gap | CD+Tests | resolved | `diagnosisReason` uses the reader findings' `classification` like `run-state-resolver.js` and the reader's missing-state codes; `AGDF_RUN_STATE_MISSING` removed; test "CIR-03", red on the previous code | none |
| CIR-04 | implementation_gap | CD+Tests | resolved | Core imports the owner values (`events.js` from `mcp-tool-errors.js` and `run-identity.js`, which `run-steps.js` now also uses; `figure-state.js` from `run-identity.js`); companion mirrors pinned in `claude-companion-test.js` (journal names, read limit, build gates, structured routes, ended lifecycles, catalog reasons, root comparison including UNC and drive roots); the figure's approval rule equals the inventory's. Red checks: UNC and drive roots, figure rule, two mutated pins | none |
| CIR-05 | implementation_gap | CD+Tests | resolved | Assessed as a necessary fallback: removing it made `run-view` without `--language` exit 1 on an unsupported layout and lose the AC-002 diagnosis (`run-view-command-test.js` SCN-002 failed). Kept with the rationale in the code, aligned with `executeProjectRead`; an invalid configuration now shows `control_invalid` per run (RV-04). Test "CIR-05" | none |
| CIR-06 | implementation_gap | CD+Tests | resolved | `readSnapshot` classifies a rejected call as `timeout` only after `RUN_VIEW_TIMEOUT_MS` of host-clock time; `view.mjs` shows the failure reason from `READ_FAILURE_REASONS` with catalog texts; tests in `claude-companion-test.js` (message with "runtime", timeout text before the budget, every reason shown, unknown text never raw); red on the previous classification and display | none |

## Verification

| Check | Result |
|---|---|
| Targeted tests and red checks of CIR-01 to CIR-06 and RV-01 to RV-07 | pass, 2026-11-06: as listed in `evidence/CD_TESTS-input-02.md` (30 targeted checks, companion re-run, red checks) and the RV-1 probe `evidence/CD_TESTS-probe-rv1-01.md` |

## Required Next Step

QA through `qa-gate` once the open TP Review findings (TPR-01 to TPR-03) are resolved.
