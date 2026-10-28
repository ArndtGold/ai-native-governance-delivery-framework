# TP Review: AGDF Companion Chat-Run Navigation and Panel Changes

Decision: pass
Status: `pass`

## Decision

- decision: pass
- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- reviewed_at: 2026-10-28
- reviewer: Claude Code implementing agent
- basis:
  - approved TP rev 13 (T-001 to T-009, SCN-001 to SCN-023), SD rev 11 and PRD rev 9;
  - `CD_TESTS.md` (CD+Tests pass);
  - Code Review pass with corrections CR-F01 to CR-F10 (`CODE_REVIEW-input-01.md`, `CODE_REVIEW_VERIFICATION.md`);
  - task evidence `T-001_HOST_PROBE.md`, `T-009_EVIDENCE.md` and `live/`.
- summary:
  - All nine tasks are fully done, and every scenario has its planned evidence.
  - Every PRD criterion is fulfilled with visible evidence.
  - The Code Review corrections are verified on the final tree by the suites, 12 mutation checks, the native host test and the byte-identical installed build.
  - The live captures of T-009 were taken before those corrections (TPR-F01).

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | `T-001_HOST_PROBE.md`: prompt and final answer arrive as strings; no scrollbar for any reserve in three pane sizes, so the reserve is 0; probe mod removed | none | none |
| T-002 | fully_done | `assignment.mjs` `namedRun` and `register.mjs` `noteMention` in the main-loop turn hooks, inside their catch paths; Code Review corrections CR-F02, CR-F05, CR-F06, CR-F08, CR-F09 | none | none |
| T-003 | fully_done | `assignRun` with `mention`, `isBrowsing` and `chatRunId`; browsing cleared at a main-loop `turn.start`; Code Review corrections CR-F01, CR-F03, CR-F07 | none | none |
| T-004 | fully_done | plain button `chat-return` and first menu entry `chat`, shown only while browsing; English and German texts | none | none |
| T-005 | fully_done | `announce`/`observedRun` follow the run shown without browsing; `displayState` keeps `wartet` and `baut` during a turn | none | none |
| T-006 | fully_done | `BODY_RESERVE = 0` in root `minHeight` and `listCapacity` | none | none |
| T-007 | fully_done | logic and adapter suites extended; native test case for a named run; 12 mutation checks caught on the final tree (five in CD+Tests, seven after the corrections) | none | none |
| T-008 | fully_done | `CD_TESTS.md` and `CODE_REVIEW_VERIFICATION.md`: `build:prepare`, compatibility 56/0, `claude plugin validate`, `claude plugin test` 6 of 6 on the final tree; screenshots `live/00` to `live/09`; `INSTALL.md` | none | none |
| T-009 | fully_done | `T-009_EVIDENCE.md`: live screenshots `live/10` to `live/16`, 150 run states byte-identical; corrected build reinstalled (`probe-results/f9j`), 13 companion files byte-identical | live captures predate the Code Review corrections (TPR-F01) | none |

## Scenario Coverage

All 23 scenarios pass as recorded in `CD_TESTS.md`. After the Code Review corrections:

- The automated scenarios SCN-001, SCN-002, SCN-004 to SCN-007, SCN-009, SCN-011, SCN-012, SCN-015, SCN-017, SCN-019 and SCN-021 were rerun on the final tree and pass.
- SCN-023 covers the corrected `INSTALL.md` wording (CR-F10).
- The live scenarios SCN-008, SCN-010, SCN-013, SCN-016, SCN-020 and SCN-022 keep their T-009 captures (TPR-F01).

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | on, main-loop prompt or answer names an open run | T-001, T-002, T-009 | `live/06-t001-answer-text.png`: final answer arrives as a string. `live/11-t009-named-waiting-during-turn.png`: the run named in the final answer is shown. Whole-token rules in the logic suite; the run created during a turn is in the adapter suite (CR-F05). | fulfilled | none |
| AC-002 | on, chat run known | T-003, T-004, T-009 | `live/11` and `live/14`: "Im Chat genannt" instead of the stored selection; "In dieser Sitzung geändert" per origin in the adapter suite | fulfilled | none |
| AC-003 | on, browsing from the chat run | T-003, T-009 | `live/12-t009-browsing-return-button.png`: "Nächster Run" shows another run with "Von dir ausgewählt". Stored selection in the adapter suite; a step back onto the chat run is no browsing (CR-F07). | fulfilled | none |
| AC-004 | on, next main-loop turn | T-003, T-009 | `live/14-t009-auto-return.png`: the chat run is back. Subagent turn and the case without a chat run are in the adapter suite. | fulfilled | none |
| AC-005 | on, browsing | T-004, T-009 | `live/12` (button below the stepping row) and `live/13-t009-menu-return-entry.png` (first menu entry). Absent while the chat run is shown, without one, and after a new conversation; present for an unknown-state run (CR-F01, CR-F03). | fulfilled | none |
| AC-006 | on, browsing | T-005 | adapter suite: the status line keeps the chat run's state and no toast is raised for the browsed run, even when its state changes (CR-F04); a repeated mention is announced (CR-F02) | fulfilled | none |
| AC-007 | on, waiting run during a turn | T-005, T-009 | `live/11` and `live/16-t009-after-question-same-turn.png`: "wartet auf Freigabe" during running turns; turn rule for every mood in the logic suite | fulfilled | none |
| AC-008 | on, desktop narrow and widened | T-001, T-006, T-009 | `live/10-t009-list-footer-narrow.png` and `live/15-t009-footer-wide.png`: the footer meets the bottom margin with no scrollbar; `minHeight` equals `bodyRows` in the adapter suite | fulfilled | none |
| AC-009 | on, delivered panel | T-007, T-008 | `live/00` to `live/04` baseline screenshots; footer, menu, About, sized list and gate-bar tests unchanged and passing | fulfilled | none |
| AC-010 | all modes, read-only | T-007, T-009 | one write site in the adapter suite; `live/t009-hashes-before.txt` equals `live/t009-hashes-after.txt` (150 files); no approval, continuation or run-selection control | fulfilled | none |
| AC-011 | repository verification and live host | T-008, T-009 | `CODE_REVIEW_VERIFICATION.md` on the final tree; `T-009_EVIDENCE.md` live check | fulfilled | none |
| AC-012 | documentation | T-008 | `INSTALL.md` chat run, browsing, return, conversation-only lifetime, waiting rule and the panel of 2026-10-28, split into automatic, native and live evidence | fulfilled | none |

## Planning Decisions

All three planning decisions were followed: probe order and scenario mapping, the dev-mod live-check vehicle, and no full `verify:ci`. The pull-request CI runs the full lanes.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | evidence_gap | evidence_obligation | resolved | The T-009 live captures ran on the tree before CR-F01 to CR-F10. No visible element they show changed: the corrections affect unknown-state runs, repeated mentions, `/clear`, matching order and the answer source. The corrected hooks run on the host's own engine in `claude plugin test` (6 of 6). The corrected build is installed byte-identically (`probe-results/f9j`). | none |
