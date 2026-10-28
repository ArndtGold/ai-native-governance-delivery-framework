# TP Review: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-companion-followup-20261027-01`
- reviewed_at: 2026-10-28
- reviewer: Claude Code implementing agent
- basis:
  - approved TP (T-001 to T-009, SCN-001 to SCN-026), SD and PRD;
  - `CD_TESTS.md` (CD+Tests pass, revision 13);
  - Code Review pass with corrections CR-F01 to CR-F05 and the documented SDD-07 deviation (`CODE_REVIEW-input-01.md`, `CODE_REVIEW_VERIFICATION.md`);
  - task evidence `T-001_HOST_PROBE.md`, `T-002_T-006_EVIDENCE.md`, `T-007_T-008_EVIDENCE.md`, `T-009_EVIDENCE.md` and `live/`.
- summary: all nine tasks are fully done; every scenario has its planned evidence; the live findings LT-F01 and LT-F03 and the Code Review findings are resolved; LT-O01 is an open observation for the owner at UAT, not a gap against the plan.

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | `T-001_HOST_PROBE.md`: toast, status line without a pane, language setting `de`, audio resolved but not audible; probe mod removed | none | none |
| T-002 | fully_done | `T-002_T-006_EVIDENCE.md`: route reader and per-mode path with core parity for six routes and five format variants; CR-F04 backticked approvals | none | none |
| T-003 | fully_done | build mood and figure; bounds over the whole swing; live `04-build-phase-baut-cd-tests.png` | none | none |
| T-004 | fully_done | `notice.mjs` detector, texts and chime; 14-step detector sequence | none | none |
| T-005 | fully_done | adapter, persistence, localization, texts, integrity list; live-finding fix LT-F01; Code Review corrections CR-F01 to CR-F03 | none | none |
| T-006 | fully_done | three suites extended; seven mutation checks caught (three in CD+Tests, four in Code Review) | none | none |
| T-007 | fully_done | `T-007_T-008_EVIDENCE.md` and `CODE_REVIEW_VERIFICATION.md`: `build:prepare`, compatibility 56/0, Windows lanes with the companion suites on the final tree, Copilot budget and eval fingerprints unchanged | none | none |
| T-008 | fully_done | `INSTALL.md` companion section incl. live evidence of 2026-10-27 | none | none |
| T-009 | fully_done | native validate and test 5 of 5 on the final tree; installed branch build; live screenshots `00` to `10`; byte identity | none | none |

## Scenario Coverage

All 26 scenarios pass as recorded in `CD_TESTS.md`. SCN-006 compares completed canonical fixtures by path; completed-run marks follow SDD-02's deliberate simplification (documented in `CODE_REVIEW-input-01.md`). SCN-012 reports the sound as observed (not audible on Windows), as AC-005 requires.

## Planning Decisions

The four planning decisions (host probe order, fixture strategy per mode, live-test script, no full `verify:ci`) were followed. The live-test script was adapted when the owner asked the agent to drive the remaining live steps itself: the agent started a session in the folder without control and closed its panel through UI Automation.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | evidence_gap | evidence_obligation | resolved | SCN-015 terminal surface: the native test draws the terminal tree with the status-relevant text; a live terminal session was not run, which the TP allowed ("in the terminal where available") | none |
