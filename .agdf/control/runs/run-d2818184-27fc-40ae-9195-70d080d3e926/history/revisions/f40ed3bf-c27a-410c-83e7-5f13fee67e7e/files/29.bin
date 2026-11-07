# TP Review: Companion core in Core (run view, MCP events, figure states)

Decision: revise
Gate: QA
Type: TP Review
Reviewer: Claude (reviewing agent for Arndt Gold)
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

Approved TP (revision 31) tasks T-001 to T-013 against the working tree of branch `feat/companion-core-run-view` (base main `53e8e900`) after the CR corrections (CR recorded pass at revision 34). The reference is the TP task list, its Verification Traceability (SCN-001 to SCN-022), its Test Plan placement and sufficiency rule, and the approved PRD acceptance criteria AC-001 to AC-011. Inputs: recorded CD+Tests and CR reports, `evidence/CD-contradictions.md` with the owner decisions of 2026-11-06, the T-001 baseline evidence, one fresh execution of every automated TP test route on the final tree, and two evidence probes run for this review (below).

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Fixtures F01 to F13 in `packages/core/test/fixtures/companion-fixtures.js`; golden baseline in `status-card-golden-test.js`; regression cases failed on unchanged code for the intended reason (`evidence/T-001-companion-parity-baseline.md`, recorded 2026-11-05T11:30:10Z) and pass now (SCN-003 route) | none | none |
| T-002 | fully_done | `packages/core/lib/companion/run-view.js` (`readRunView`, `projectRunView`); SCN-001 parity for F01 to F13 passes (route 1); `gate-check.js` byte-identical to `53e8e900` (route 3) | none | none |
| T-003 | fully_done | `run-view` command with `--run`, schema `run-view/1`, exit rules; SCN-002 passes (route 2); malformed `--run` values rejected (CR-C3) | none | none |
| T-004 | partially_done | Store and per-run diagnosis with counts; F08, F09, F11 and missing pass (SCN-004, SCN-006); readable runs stay listed | The planned reason `too_large` (SDD-003, T-004) has no Core source and is never produced; F12 (oversized RUN_STATE) reports `run_state_invalid` (C1). Owner accepted the deviation without SD/TP revision; acceptance does not resolve a design gap (TPR-02) | open design gap blocks a QA pass |
| T-005 | fully_done | `figure-state.js`; six moods reached (SCN-008); companion texts in the `companion` catalog section with validator coverage (SCN-017, routes 5 and 10); C6 English-only check restored in CR | none | none |
| T-006 | fully_done | Companion reads only through `$.process.run` of `run-view`; `core.mjs` and `locales.json` removed; SCN-003, SCN-020, SCN-022 and SCN-016 pass (routes 4, 5, 9); CR-B1 to CR-B10 corrected with targeted tests | Native rendering in the desktop app is T-013 | covered by TPR-01 |
| T-007 | fully_done | `packages/core/lib/companion/events.js`, schema `companion-event/1`; all eight kinds derived once, reads derive none (SCN-012, route 7) | none | none |
| T-008 | fully_done | Journal at the final result projection, once in the executing process, rotation at 256 KiB, write errors swallowed; SCN-010 and SCN-021 through facade legacy, facade modern and plugin generation (route 8); facade-thrown failures journaled (CR-A2); uninstall owns the journal (CR-A1) | none | none |
| T-009 | partially_done | Review facts (preview bounds, bytes, digest, source match) pass SCN-013 and SCN-015 (route 8); drift warning for bound documents passes SCN-014 (routes 1 and 5) | A changed declared input file of a recording (for example `evidence/SD-input-05.md` edited after recording) raises no drift warning: Run Operations keep no declared input path (C5), so SDD-008 and SCN-014 are met only for bound documents and the record-time source match. Owner accepted the interim; acceptance does not resolve a design gap (TPR-03) | open design gap blocks a QA pass |
| T-010 | fully_done | 2 s journal poll, root normalization, P1 notices, "events unavailable", run view only on fingerprint, event or language change, process-call counts (SCN-011, route 5); rotation reading (CR-B6), sticky warnings (CR-B7), root change (CR-B3) | none | none |
| T-011 | fully_done | Host-neutral harness `packages/core/test/fixtures/host-neutral-harness.js`; SCN-007 to SCN-009 pass (route 6) and the harness parses events from the real tool path (route 8) | none | none |
| T-012 | fully_done | Generated assets and payload rebuilt; payload within the Copilot baseline, contract and ergonomics unchanged, compatibility record re-recorded and checked (SCN-019 routes); full `verify:ci` stage-by-stage run on win32 green after CR (CR verification) | PR CI on GitHub Actions runners is required before merge (TP placement), not yet run because nothing is committed | none at QA; obligation before merge |
| T-013 | not_done | none | Native check in the Claude desktop app on Windows 11 with screenshots and measured refresh time (SCN-005): current project, disposable legacy store, live events during a short run. Needs the owner (TPR-01) | open evidence gap blocks a QA pass unless accepted as a QA deviation |

## Verification Executed For This Review

Every automated TP test route ran once on the final tree on 2026-11-06 (Windows 11, Node v22.22.3), numbered as referenced above.

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
| AC-008 | M1, M2: recording no longer matching its declared source | T-009, T-010 | Drift toast and pane warning for a changed bound document (SCN-014); staged material shows the preview with "not determinable" and no mismatch (SCN-015). A changed declared input file after recording shows no warning (C5) | partial | design_gap |
| AC-010 | M1, M2: all companion texts | T-005 | German and English catalog texts rendered; German views carry no English-only copy (SCN-017, C6) | fulfilled | none |

AC-009 (observation-only companion) and AC-011 (unchanged behavior) have no visible state of their own; they are covered by T-006 (SCN-016) and T-012 (SCN-018, SCN-019) above.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | TP T-013 and SCN-005, PRD AC-002 evidence ("live check against a real legacy project") and PRD section 9 ("Native Claude desktop check ... with screenshots"): no screenshot, observation note or measured refresh time exists; the owner's desktop access is required | Arndt Gold runs T-013 in the Claude desktop app with the locally built plugin (current project, disposable copy of `.agdf/control/archive/source`, live events during a short run) and the screenshots, observation note and measured refresh time are stored as run evidence |
| TPR-02 | design_gap | SD | open | SD SDD-003 and TP T-004 list the per-run reason `too_large`; Core has no per-run size rule in the read path, so `run-view.js` (`diagnosisReason`) keeps it with count 0 and F12 shows `run_state_invalid` (`companion-run-view-test.js`; `evidence/CD-contradictions.md` C1). The owner accepted this on 2026-11-06 without SD revision | Revise SD SDD-003 through a source revision from QA to drop `too_large` from the produced reasons (or to define the Core size rule that produces it), and re-review T-004 against the revised SD |
| TPR-03 | design_gap | SD | open | SD SDD-008 compares "declared sources from Run Operations", but Run Operations keep no declared input path (0 of 38 receipts on this run, C5); `readRunDrift` therefore covers bound documents only, and PRD AC-008 / TP SCN-014 ("after the declared source file of a recording is changed") is unmet for input files changed after recording. The owner accepted the interim on 2026-11-06 | Revise SD SDD-008 through a source revision from QA to decide the owner of a recording's declared input source (persist it with the recording, or narrow AC-008 through PRD revision to bound documents plus the record-time source match), then re-review T-009 |
| TPR-04 | evidence_gap | evidence_obligation | resolved | SCN-012 and AC-006 require `run_completed` from a real MCP outcome; the repository tests derive it from a synthetic accepted result only, and the TP's documented limit names only `recovery_required` and `effect_unknown`. Probe A (`evidence/TP_REVIEW-probes-01.md`) observed exactly one `run_completed` line per accepted closeout through facade legacy, facade modern and plugin generation, and none for the replay | none; a permanent tool-path regression case is recommended for the next change of the journal path |
| TPR-05 | evidence_gap | evidence_obligation | resolved | The TP's documented alternative for `recovery_required` and a returned `effect_unknown` requires result objects validated against the published result schema; the objects in `companion-events-test.js` fail that schema. Probe B (`evidence/TP_REVIEW-probes-01.md`) derived both kinds from schema-valid objects | none; aligning the repository test objects with the schema is recommended for the next change of `companion-events-test.js` |

## Summary

- fully_done: T-001, T-002, T-003, T-005, T-006, T-007, T-008, T-010, T-011, T-012 (10 of 13)
- partially_done: T-004 (TPR-02), T-009 (TPR-03)
- not_done: T-013 (TPR-01)
- out_of_scope_changes: none found; changed files stay within the TP Brownfield Scope (Core companion modules, runtime CLI command, MCP result projection and launcher data root, companion modules, catalog, generated assets and compatibility evidence). The uninstall change in `plugin-runtime.js` (CR-A1) implements SDD-006's removal rule.
- risks: C2 refresh cost of 1.3 to 1.4 s per run-view call on this repository's store (owner accepted); `recovery_required` is evidenced through the documented alternative, not a real tool-path fault; PR CI on Linux runners is still outstanding before merge; the two probes are review evidence, not permanent regression tests; `test:performance` is sensitive to machine load on this workstation (route 14); in the plugin generation the Verified Change execution call exceeded the 10 s worker budget under load (Probe A, outside this run's changed paths).
- required_next_step: Owner decision on TPR-02 and TPR-03 (SD source revision from QA) and owner execution of T-013 (TPR-01); then re-review the affected tasks and re-record this TP Review.

## Missing Evidence

- T-013 native desktop check (TPR-01).
- PR CI (`npm run verify:ci` on GitHub Actions) before merge; the local win32 stage-by-stage run is the current substitute and does not cover Linux runners.

## Required Next Step

Owner decision on TPR-02 and TPR-03 and execution of T-013; then re-review T-004, T-009 and T-013 and re-record the TP Review before QA.
