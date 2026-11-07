# TP Review: Companion core in Core (run view, MCP events, figure states)

Decision: pass
Gate: QA
Type: TP Review
Reviewer: Claude (reviewing agent for Arndt Gold)
reviewed_at: 2026-11-07 (third review after the TP source revision fbfbe051)
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

Approved TP (approved again at revision 60 after the TP source revision `fbfbe051` of 2026-11-07 from UAT, which added T-014, T-015, SCN-023, SCN-024 and the run-folder count of T-004/SCN-004 after the native check) tasks T-001 to T-015 against the working tree of branch `feat/companion-core-run-view` (base main `53e8e900`). Inputs: Brownfield Analysis (revision 61, `evidence/BROWNFIELD_ANALYSIS-input-05.md`), CD+Tests (revision 62, `evidence/CD_TESTS-input-04.md`), CR (revision 63, `evidence/CODE_REVIEW-input-05.md`, with an independent delta review), Clean Implementation Review (revision 64, `evidence/CLEAN_IMPLEMENTATION_REVIEW-input-04.md`), the native check evidence (revision 65, `evidence/T-013-NATIVE_CHECK-02.md` with `evidence/T-013-native-check/`), the earlier probes `evidence/TP_REVIEW-probes-01.md` and the test routes run on the final tree. The second TP Review (`evidence/TP_REVIEW-input-02.md`) is superseded; its findings are carried forward below.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Fixtures F01 to F13, golden baseline, regression cases red on the unchanged code (`evidence/T-001-companion-parity-baseline.md`) and green now (route 4) | none | none |
| T-002 | fully_done | `readRunView` evaluates inside `captureControlScope` with per-read snapshots and bounded retry; SCN-001 parity (route 1); `gate-check.js` byte-identical to `53e8e900` (route 3, re-run 2026-11-07) | none | none |
| T-003 | fully_done | `run-view` command with `--run`, schema `run-view/1`, exit rules; SCN-002 (route 2, 3 of 3) | none | none |
| T-004 | fully_done | Store and per-run diagnosis with counts; for an unsupported layout `store.run_folders` counted with the discovery rule `runFolderEntries` (TP revision 60); SCN-004 core case (three folders, dot entries excluded, linked runs folder refused, supported store without count) and the F09 parity case through the spawned command (route 4); red without the count | none | none |
| T-005 | fully_done | Figure moods and catalog texts (SCN-008, SCN-017; routes 1, 5, 10) | none | none |
| T-006 | fully_done | Companion reads only the run view through `$.process.run` (via `processes($)` since T-014); SCN-003, SCN-016, SCN-020, SCN-022 (routes 4, 5); native rendering in the desktop app (T-013) | none | none |
| T-007 | fully_done | Event model, eight kinds derived once (SCN-012, route 7) | none | none |
| T-008 | fully_done | Journal at the final result projection through facade and generation (SCN-010, SCN-021, route 8); natively the journal lines appeared for every MCP call of C1 to C6 | none | none |
| T-009 | fully_done | Review facts and drift for bound documents (SCN-013 to SCN-015); natively the drift warning appeared 4.7 to 6.8 s after a plain file edit (C5) | none | none |
| T-010 | fully_done | 2 s journal poll, P1 notices, "events unavailable", run view only on change (SCN-011, route 5); natively events appeared 0.6 to 5.1 s after their journal entry | none | none |
| T-011 | fully_done | Host-neutral harness (SCN-007 to SCN-009, route 6) | none | none |
| T-012 | fully_done | Generated assets rebuilt, payload, package contents, contract, ergonomics and compatibility (SCN-019); compatibility record re-recorded and checked on 2026-11-07 after the follow-up | PR CI on GitHub Actions before merge (TP placement); nothing is committed yet | none at QA; obligation before merge |
| T-013 | fully_done | `evidence/T-013-NATIVE_CHECK-02.md` (recorded at revision 65): current project, disposable legacy store, live events of a short run, toasts in the main window, measured refresh time (journal to display) and run-view time (phase D); SCN-005 re-check after the F2 correction shows "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt" (screenshot 15) | none | none |
| T-014 | fully_done | Call-site wrapper `processes($)`; parser-based checks `hostSpellingViolations` and `processCalls` (`packages/cli/scripts/companion-host-spelling.js`) prove themselves on refused and accepted forms and report exactly `$.process` against the old line; `claude plugin validate` passed on the generated and the installed plugin (SCN-023) | none | none |
| T-015 | fully_done | Event lines and toasts without the shown run id, other runs by objective or short id, notice toasts without run (SCN-024, route 5); natively the toasts "agdf: Wartet auf Freigabe: Nutzeranforderungen" and "agdf: Freigabe angefragt für Nutzeranforderungen" appeared (C6) | none | none |

## Verification Executed For This Review

Routes re-run on 2026-11-07 on the final tree (Windows 11, Node v22.22.3), after the last code change:

| Route | Scenarios | Command | Result |
|---|---|---|---|
| 1 | SCN-001, SCN-004, SCN-006, SCN-008, SCN-014 | `node --test packages/core/test/companion-run-view-test.js` | pass (16 of 16) |
| 2 | SCN-002 | `node --test packages/cli/scripts/run-view-command-test.js` | pass (3 of 3) |
| 3 | SCN-002 | `git diff --exit-code 53e8e900 -- packages/core/lib/control-evaluation/gate-check.js` | empty diff |
| 4 | SCN-003, SCN-004, SCN-020 | `node --test packages/cli/scripts/claude-companion-parity-test.js` (inside `test:claude-companion`) | pass (5 of 5) |
| 5 | SCN-006, SCN-011, SCN-014, SCN-016, SCN-017, SCN-022, SCN-023, SCN-024 | `npm --prefix packages/cli run test:claude-companion` | pass (all four stages) |
| 6, 7 | SCN-007 to SCN-009, SCN-012 | `node --test packages/core/test/companion-host-neutral-test.js packages/core/test/companion-events-test.js` | pass |
| 10 | SCN-017 | `npm --prefix packages/cli run test:interaction-catalog` | pass |
| 11 to 13 | SCN-018 | `status-card-golden-test.js`, `test:cli-gates`, `test:control-inspect`, `run-inventory-test.js` | pass |
| 17, 18 | SCN-019 | `test:payload-budget`, `compatibility:record` and `compatibility:check` | pass (0 failed) |
| SCN-019 additions | SCN-019 | `test:package-contents`, `test:cli-modularization`, `test:host-compatibility` | pass |
| SCN-023 | SCN-023 | `claude plugin validate packages/cli/generated/plugins/agdf` | "Validation passed" |
| SCN-005 | SCN-005 | native re-check in the Claude desktop app | count and reason shown (screenshot 15) |

Not re-run on 2026-11-07, because no file on their path changed since their last green run on 2026-11-06: route 8 (`companion-journal.test.js`), routes 15 and 16 (`test:contract`, `test:mcp-ergonomics`). Route 14 (the full `packages/mcp-server` suite) stays assigned to PR CI before merge, as decided for this run.

## UX Intent Fidelity

Visible evidence means rendering by the real companion modules through the test host and, since T-013, the native desktop app.

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | M1, M4: any readable run | T-002, T-003, T-006, T-013 | Parity rendering for F01 to F13 (SCN-003, SCN-020); natively run d2818184 at UAT and run 4ee7b956 at UR with gate bar, missing approval and next step (screenshots 03, 05) | fulfilled | none |
| AC-002 | M1, M2: legacy-only or unsupported store | T-004, T-006, T-013 | Parity F08 and F09 cases render count and reason (SCN-004); natively "189 Runs nicht lesbar: Aufbau des Kontrollordners nicht unterstützt" for the archived legacy store (SCN-005, screenshot 15) | fulfilled | none |
| AC-003 | M1: readable and unreadable runs | T-004, T-006 | Mixed rendering with run list and unreadable hint (SCN-006) | fulfilled | none |
| AC-004 | M4: host-neutral consumer | T-011 | Host-neutral harness from Core exports only (SCN-007 to SCN-009) | fulfilled | none |
| AC-005 | M1, M2: MCP outcome with companion on | T-008, T-010, T-015 | Adapter notice within one tick; natively events 0.6 to 5.1 s after their journal entry and toasts in the main window (C1 to C6) | fulfilled | none |
| AC-006 | M1, M2, M4: approval, rejection, uncertainty, completion | T-007, T-008, T-010, T-015 | Toasts and pane entries in the adapter test; natively "Freigabe angefragt" toast and the pane-only "Aufruf abgelehnt (stale_revision)" (C3, C4, C6); `run_completed` and `recovery_required` from Probe A and B | fulfilled | none |
| AC-007 | M1: staged or recorded material | T-009, T-010 | Preview, size, digest and source match (SCN-013); natively the material facts with preview (C1, screenshot 06) | fulfilled | none |
| AC-008 | M1, M2: bound run document changed after recording | T-009, T-010 | Drift toast and pane warning (SCN-014); natively the warning with both digests and the next step (C5, screenshot 10 and 11) and the state toast after restoring (C6) | fulfilled | none |
| AC-010 | M1, M2: all companion texts | T-005, T-015 | German and English catalog texts (SCN-017, SCN-024); natively German texts throughout | fulfilled | none |

AC-009 and AC-011 have no visible state of their own; they are covered by T-006 and T-014 (SCN-016, SCN-023) and T-012 (SCN-018, SCN-019).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | resolved | TP T-013 and SCN-005 required the native check with screenshots and measured refresh time. Done: `evidence/T-013-NATIVE_CHECK-02.md` (recorded evidence, revision 65) with 15 screenshots, journal-to-display latencies, run-view times and the SCN-005 re-check with count | none |
| TPR-02 | design_gap | SD | resolved | `too_large` reserved with count 0 by the source revision `f40ed3bf`; SCN-004 asserts `run_state_invalid` for the oversized run | none |
| TPR-03 | design_gap | SD | resolved | Drift scope narrowed by the source revision `f40ed3bf` (PRD P5, SDD-008); SCN-013 and SCN-014 assert it | none |
| TPR-04 | evidence_gap | evidence_obligation | resolved | `run_completed` through the real tool path observed in Probe A (`evidence/TP_REVIEW-probes-01.md`) | none; a permanent tool-path case is recommended for the next change of the journal path |
| TPR-05 | evidence_gap | evidence_obligation | resolved | Schema-valid derivation of `recovery_required` and returned `effect_unknown` in Probe B | none; aligning the test objects with the result schema is recommended for the next change of `companion-events-test.js` |
| TPR-06 | implementation_gap | CD+Tests | resolved | T-002 captured read corrected after CIR-01 (`evidence/CD_TESTS-input-03.md`) | none |
| TPR-07 | plan_gap | TP | resolved | The native check found that T-004/SCN-004 asked only for the reason of an unsupported store although PRD AC-002 asks for count and reason, and that no task covered the host load rule or the owner-requested texts. TP source revision `fbfbe051` (TP revision 60) added the count, T-014/SCN-023 and T-015/SCN-024; all are fulfilled as shown above | none |

## Summary

- fully_done: T-001 to T-015 (15 of 15)
- partially_done: none
- not_done: none
- out_of_scope_changes: none found; the follow-up stays within the TP Brownfield Scope (Core run view and run discovery, companion modules, catalog, generated assets, compatibility evidence, companion tests and one test helper in `packages/cli/scripts`).
- risks: refresh cost of 1.3 to 2.8 s per run-view call on large stores (owner accepted, C2); toasts are drawn only in the desktop app's main window; PR CI on Linux runners is outstanding before merge; the wording points F4 of the native check ("Ereignisse nicht verfügbar" before the first journal entry, "– Bytes", the raw reason code `stale_revision`, singular "1 Runs") are a follow-up.
- required_next_step: QA through `qa-gate`.

## Missing Evidence

- PR CI (`npm run verify:ci` on GitHub Actions) before merge; locally the win32 runs listed above are the substitute.

## Required Next Step

QA through `qa-gate`; the full `packages/mcp-server` suite and PR CI run before merge.
