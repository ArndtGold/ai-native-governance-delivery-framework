# TP Review: Companion core in Core (run view, MCP events, figure states)

Decision: revise
Gate: QA
Type: TP Review
Reviewer: Claude (reviewing agent for Arndt Gold)
reviewed_at: 2026-11-06 (second review after the source revision f40ed3bf)
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

Approved TP (approved again at revision 47 after the source revision `f40ed3bf` of 2026-11-06) tasks T-001 to T-013 against the working tree of branch `feat/companion-core-run-view` (base main `53e8e900`) after the CR corrections and the QA follow-up corrections (CD+Tests recorded at revision 49 from `evidence/CD_TESTS-input-03.md`, CR at revision 51). The first TP Review (`evidence/TP_REVIEW-input-01.md`, revision 35) is superseded by this review. The reference is the TP task list, its Verification Traceability (SCN-001 to SCN-022), its Test Plan placement and sufficiency rule, and the approved PRD acceptance criteria AC-001 to AC-011. Inputs: recorded CD+Tests and CR reports, `evidence/CD-contradictions.md` with the owner decisions of 2026-11-06, the T-001 baseline evidence, one fresh execution of every automated TP test route on the final tree, and two evidence probes run for this review (below).

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Fixtures F01 to F13 in `packages/core/test/fixtures/companion-fixtures.js`; golden baseline in `status-card-golden-test.js`; regression cases failed on unchanged code for the intended reason (`evidence/T-001-companion-parity-baseline.md`, recorded 2026-11-05T11:30:10Z) and pass now (SCN-003 route) | none | none |
| T-002 | fully_done | `packages/core/lib/companion/run-view.js`: `readRunView` evaluates every listed active run with the unchanged `evaluateGateCheck` inside `captureControlScope` (one snapshot for the inventory and one per evaluated run, bounded retry on a change during the read), as T-002 requires; SCN-001 parity for F01 to F13 passes; `gate-check.js` byte-identical to `53e8e900`. The first TP Review marked this task done although the reader used the uncaptured read seam; the Clean Implementation Review found it (CIR-01) and it was corrected (TPR-06) | none | none |
| T-003 | fully_done | `run-view` command with `--run`, schema `run-view/1`, exit rules; SCN-002 passes (route 2); malformed `--run` values rejected (CR-C3) | none | none |
| T-004 | fully_done | Store and per-run diagnosis with counts as revised (TP revision 47, SDD-003): F08, F09, F11, F12 (`run_state_invalid`) and missing pass SCN-004/SCN-006; `too_large` reserved with count 0; reasons follow the reader classification (CIR-03) | none | none |
| T-005 | fully_done | `figure-state.js`; six moods reached (SCN-008); companion texts in the `companion` catalog section with validator coverage (SCN-017, routes 5 and 10); C6 English-only check restored in CR | none | none |
| T-006 | fully_done | Companion reads only through `$.process.run` of `run-view`; `core.mjs` and `locales.json` removed; SCN-003, SCN-020, SCN-022 and SCN-016 pass (routes 4, 5, 9); CR-B1 to CR-B10 corrected with targeted tests | Native rendering in the desktop app is T-013 | covered by TPR-01 |
| T-007 | fully_done | `packages/core/lib/companion/events.js`, schema `companion-event/1`; all eight kinds derived once, reads derive none (SCN-012, route 7) | none | none |
| T-008 | fully_done | Journal at the final result projection, once in the executing process, rotation at 256 KiB, write errors swallowed; SCN-010 and SCN-021 through facade legacy, facade modern and plugin generation (route 8); facade-thrown failures journaled (CR-A2); uninstall owns the journal (CR-A1) | none | none |
| T-009 | fully_done | Review facts pass SCN-013 and SCN-015; drift warning for bound run documents and record-time source match as revised (TP revision 47, SDD-008, PRD AC-008/P5) pass SCN-014 | none | none |
| T-010 | fully_done | 2 s journal poll, root normalization, P1 notices, "events unavailable", run view only on fingerprint, event or language change, process-call counts (SCN-011, route 5); rotation reading (CR-B6), sticky warnings (CR-B7), root change (CR-B3) | none | none |
| T-011 | fully_done | Host-neutral harness `packages/core/test/fixtures/host-neutral-harness.js`; SCN-007 to SCN-009 pass (route 6) and the harness parses events from the real tool path (route 8) | none | none |
| T-012 | fully_done | Generated assets and payload rebuilt; payload within the Copilot baseline, contract and ergonomics unchanged, compatibility record re-recorded and checked (SCN-019 routes); full `verify:ci` stage-by-stage run on win32 green after CR (CR verification) | PR CI on GitHub Actions runners is required before merge (TP placement), not yet run because nothing is committed | none at QA; obligation before merge |
| T-013 | not_done | none | Native check in the Claude desktop app on Windows 11 with screenshots and measured refresh time (SCN-005): current project, disposable legacy store, live events during a short run. Needs the owner (TPR-01) | open evidence gap blocks a QA pass unless accepted as a QA deviation |

## Verification Executed For This Review

Every automated TP test route ran once on 2026-11-06 (Windows 11, Node v22.22.3), numbered as referenced above, before the QA follow-up corrections. After those corrections the same routes ran again with the follow-up checks (30 checks in one sequence, the companion re-run and the red checks listed in `evidence/CD_TESTS-input-03.md`), all green; route 14 (the full `packages/mcp-server` suite) is assigned to PR CI before merge, its targeted parts ran directly.

| Route | Scenarios | Command | Result |
|---|---|---|---|
| 1 | SCN-001, SCN-004, SCN-006, SCN-014 | `node --test packages/core/test/companion-run-view-test.js` | pass (9 of 9) |
| 2 | SCN-002 | `node --test packages/cli/scripts/run-view-command-test.js` | pass (2 of 2) |
| 3 | SCN-002 | `git diff --exit-code 53e8e900 -- packages/core/lib/control-evaluation/gate-check.js` | empty diff |
| 4 | SCN-003, SCN-004, SCN-020 | `node --test packages/cli/scripts/claude-companion-parity-test.js` | pass (4 of 4) |
| 5 | SCN-006, SCN-011, SCN-014, SCN-017, SCN-022 | `npm --prefix packages/cli run test:claude-companion` | pass |
| 6 | SCN-007, SCN-008, SCN-009 | `node --test packages/core/test/companion-host-neutral-test.js` | pass (3 of 3) |
| 7 | SCN-012 | `node --test packages/core/test/companion-events-test.js` | pass (7 of 7) |
| 8 | SCN-010, SCN-012, SCN-013, SCN-015, SCN-021 | `node packages/mcp-server/test/companion-journal.test.js` | pass |
| 9 | SCN-016 | `node packages/cli/scripts/claude-companion-integrity-test.js` | pass |
| 10 | SCN-017 | `npm --prefix packages/cli run test:interaction-catalog` | pass |
| 11 | SCN-018 | `node --test packages/core/test/status-card-golden-test.js` | pass |
| 12 | SCN-018 | `npm --prefix packages/cli run test:cli-gates` | pass |
| 13 | SCN-018 | `npm --prefix packages/cli run test:control-inspect` | pass (12 of 12) |
| 14 | SCN-018 | `npm --prefix packages/mcp-server test` | every script up to `test:performance` passes; `test:performance` failed on its cold `tools/list` p95 bound (3014 ms, then 6240 ms on a rerun against 2500 ms; `tools/list` itself 6 to 17 ms, server start 2.7 to 6.3 s with system CPU idle falling from 73 to 31 percent from other applications); `test:package` and `test:sdk-digest` pass when run on their own. The same unchanged code passed the whole suite (`test:mcp-server`, 2264 s) in the CR re-verification earlier the same day, so this is an environment timing result, not a regression; PR CI repeats it before merge |
| 15 | SCN-019 | `npm --prefix packages/mcp-server run test:contract` | pass |
| 16 | SCN-019 | `npm run test:mcp-ergonomics` | pass (61 of 61) |
| 17 | SCN-019 | `npm --prefix packages/cli run test:payload-budget` | pass |
| 18 | SCN-019 | `npm run compatibility:check` | pass (record re-recorded in the CR verification) |

Evidence probes run for this review (scripts and output in `evidence/TP_REVIEW-probes-01.md`):

- Probe A, `run_completed` through the real tool path: the existing Verified Change mini-closeout steps were driven through facade legacy, facade modern and plugin generation with a companion data root. Each accepted `closeout.record` produced exactly one `run_completed` line for the run at gate OR with the closeout operation id; the replay (`already_applied`) produced none.
- Probe B, the TP's documented alternative for `recovery_required` and a returned `effect_unknown`: result objects satisfying the published RUN_COMMAND result schema (`operationContract(...).result_schema`, validated with ajv) project to the events `recovery_required` (OR) and `effect_unknown` (EVIDENCE). The objects used for these two kinds in `companion-events-test.js` do not satisfy that schema (missing `operation_id`/`recovery`), so the repository test alone did not meet the TP's stated alternative.

## UX Intent Fidelity

Visible evidence below means companion pane or terminal output rendered by the real companion modules through the test host, as approved for these criteria in PRD section 9 and the TP. Native desktop rendering is T-013.

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | M1, M4: any readable run | T-002, T-003, T-006 | `claude-companion-parity-test.js` renders missing approval and next step equal to the status card for F01 to F13, including the F13 doctor block (SCN-003, SCN-020) | fulfilled | none |
| AC-002 | M1, M2: legacy-only or unsupported store | T-004, T-006, T-013 | Parity F08 cases and companion rendering name count and reason instead of "No open runs" (SCN-004); the PRD also requires a live check against a real legacy project (SCN-005), which is missing | partial | evidence_gap |
| AC-003 | M1: readable and unreadable runs | T-004, T-006 | `claude-companion-test.js` mixed rendering shows the run list and the unreadable hint (SCN-006) | fulfilled | none |
| AC-004 | M4: host-neutral consumer | T-011 | `companion-host-neutral-test.js` renders run view, figure state and events from Core exports only, equal to the companion fields (SCN-007 to SCN-009) | fulfilled | none |
| AC-005 | M1, M2: MCP outcome with companion on | T-008, T-010 | Adapter test shows the notice within one 2 s tick with injected clock; journal line exists when the tool result returns (12 to 20 ms in CD+Tests); "events unavailable" rendered (SCN-010, SCN-011) | fulfilled | none |
| AC-006 | M1, M2, M4: approval, rejection, uncertainty, completion | T-007, T-008, T-010 | Toasts for approval requested, effect unknown, recovery required, run completed and pane-only entries for approval recorded and write rejected (adapter test); kinds from the real tool path (route 8, Probe A) and, for `recovery_required`, the TP's documented schema-valid alternative (Probe B) | fulfilled | none |
| AC-007 | M1: staged or recorded material | T-009, T-010 | Pane and terminal show bounded preview with truncation note, size, digest and source match (SCN-013, CR-B10) | fulfilled | none |
| AC-008 | M1, M2: bound run document changed after recording | T-009, T-010 | Drift toast and pane warning for a changed bound document (SCN-014); record-time source match in the event preview (SCN-013); staged material shows the preview with "not determinable" and no mismatch (SCN-015); revised AC-008 (decision P5) | fulfilled | none |
| AC-010 | M1, M2: all companion texts | T-005 | German and English catalog texts rendered; German views carry no English-only copy (SCN-017, C6) | fulfilled | none |

AC-009 (observation-only companion) and AC-011 (unchanged behavior) have no visible state of their own; they are covered by T-006 (SCN-016) and T-012 (SCN-018, SCN-019) above.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | TP T-013 and SCN-005, PRD AC-002 evidence ("live check against a real legacy project") and PRD section 9 ("Native Claude desktop check ... with screenshots"): no screenshot, observation note or measured refresh time exists; the owner's desktop access is required | Arndt Gold runs T-013 in the Claude desktop app with the locally built plugin (current project, disposable copy of `.agdf/control/archive/source`, live events during a short run) and the screenshots, observation note and measured refresh time are stored as run evidence |
| TPR-02 | design_gap | SD | resolved | SDD-003 and T-004 listed a `too_large` reason without a Core source (C1). The source revision `f40ed3bf` of 2026-11-06 (approved PRD revision 43, SD revision 45, TP revision 47) reserves it with count 0 and names `run_state_invalid` for an oversized run state; `companion-run-view-test.js` SCN-004 asserts it | none |
| TPR-03 | design_gap | SD | resolved | SDD-008 relied on declared input paths that Run Operations do not keep (C5). The source revision `f40ed3bf` narrowed PRD AC-008 (decision P5), SDD-008, T-009 and SCN-014 to bound run documents plus the record-time source match; SCN-014 and SCN-013 assert the delivered behavior | none |
| TPR-04 | evidence_gap | evidence_obligation | resolved | SCN-012 and AC-006 require `run_completed` from a real MCP outcome; the repository tests derive it from a synthetic accepted result only, and the TP's documented limit names only `recovery_required` and `effect_unknown`. Probe A (`evidence/TP_REVIEW-probes-01.md`) observed exactly one `run_completed` line per accepted closeout through facade legacy, facade modern and plugin generation, and none for the replay | none; a permanent tool-path regression case is recommended for the next change of the journal path |
| TPR-05 | evidence_gap | evidence_obligation | resolved | The TP's documented alternative for `recovery_required` and a returned `effect_unknown` requires result objects validated against the published result schema; the objects in `companion-events-test.js` fail that schema. Probe B (`evidence/TP_REVIEW-probes-01.md`) derived both kinds from schema-valid objects | none; aligning the repository test objects with the schema is recommended for the next change of `companion-events-test.js` |
| TPR-06 | implementation_gap | CD+Tests | resolved | T-002 requires the reader to evaluate inside `captureControlScope`; the first TP Review marked T-002 fully_done although `readRunView` used the uncaptured read seam. Found by the Clean Implementation Review (CIR-01), corrected with per-read snapshots, a bounded retry and per-run isolation; tests "CIR-01/RV-2", "RV-1", "RV-3/RV-5" in `companion-run-view-test.js`, red on the previous code (`evidence/CD_TESTS-input-03.md`) | none |

## Summary

- fully_done: T-001 to T-012 (12 of 13)
- partially_done: none
- not_done: T-013 (TPR-01)
- out_of_scope_changes: none found; changed files stay within the TP Brownfield Scope (Core companion modules, runtime CLI command, MCP result projection and launcher data root, companion modules, catalog, generated assets and compatibility evidence). The uninstall change in `plugin-runtime.js` (CR-A1) implements SDD-006's removal rule.
- risks: C2 refresh cost of 1.3 to 1.4 s per run-view call on this repository's store (owner accepted); `recovery_required` is evidenced through the documented alternative, not a real tool-path fault; PR CI on Linux runners is still outstanding before merge; the two probes are review evidence, not permanent regression tests; `test:performance` is sensitive to machine load on this workstation (route 14); in the plugin generation the Verified Change execution call exceeded the 10 s worker budget under load (Probe A, outside this run's changed paths).
- required_next_step: Arndt Gold runs T-013 (TPR-01) before QA, or QA presents TPR-01 as an evidence-only deviation for acceptance with T-013 as UAT input.

## Missing Evidence

- T-013 native desktop check (TPR-01).
- PR CI (`npm run verify:ci` on GitHub Actions) before merge; the local win32 stage-by-stage run is the current substitute and does not cover Linux runners.

## Required Next Step

Arndt Gold runs T-013 (TPR-01), or QA presents TPR-01 as an evidence-only deviation for acceptance with T-013 as UAT input; the full `packages/mcp-server` suite runs in PR CI before merge.
