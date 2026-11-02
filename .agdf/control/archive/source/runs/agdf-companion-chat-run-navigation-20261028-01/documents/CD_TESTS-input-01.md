# CD+Tests: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Decision: pass
Status: `pass`

## Decision

- decision: pass
- scope: approved TP tasks T-001 to T-009 and scenarios SCN-001 to SCN-023 (TP revision 13), realizing SDD-01 to SDD-12 (SD revision 11) for AC-001 to AC-012 (PRD revision 9)
- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- recorded: 2026-10-28
- branch: `claude/festive-mcnulty-c824c7` (pull request #40), on top of commits `3444befe` and `2f54fbcc`

## Task Status

| task_id | Status | Evidence |
|---|---|---|
| T-001 | done | `T-001_HOST_PROBE.md`: the desktop hands the prompt to `turn.start` and the final answer to `turn.complete` as strings; fractional body reserves are honored and none of 0, 0.25, 0.5 and 1 row shows a scrollbar in the narrow, widened and taller pane, so the reserve is 0; probe removed |
| T-002 | done | `assignment.mjs` `namedRun` (whole token, a dot ends a token unless an id character follows, last occurrence, last 65,536 characters); `register.mjs` `noteMention` in the main-loop `turn.start` and `turn.complete` hooks, inside their catch paths, without awaiting |
| T-003 | done | `assignRun` with `mention`, `isBrowsing` and `chatRunId`; origin `named`; `session.isBrowsing` set by steps and picks while a chat run is known and cleared at a main-loop `turn.start`; stepping row for every shown run; `view.mjs` passes the inputs and returns `chatRunId` |
| T-004 | done | plain button `chat-return` below the stepping row and first menu entry `chat`, only while another run than the chat's run is shown; `origin.named` and `actions.backToChat` in English and German |
| T-005 | done | `announce` and `observedRun` observe the run shown without browsing (`mention` passed, browsing not); `displayState` keeps `wartet` and `baut` during a turn |
| T-006 | done | `BODY_RESERVE = 0` in the root `minHeight` and in `listCapacity` |
| T-007 | done | logic suite: `namedRun` and `assignRun` blocks and the turn rule for every mood; adapter suite: navigation block (prompt, answer, subagent, non-string answer, stepping, return button and menu entry, status line and toasts while browsing, automatic return, German texts) and sizing; native test: a new case for a named run, browsing, return and the next turn; five mutations caught |
| T-008 | done | `npm run build:prepare` passed; compatibility record and check 56 evaluated, 0 failed (fingerprint `7c0d25567454e89de31fa278cd4964140f512f87f8bf412f26043d7b187c552d`); `claude plugin validate` passed; `claude plugin test` 6 of 6; screenshots of 2026-10-28 in `live/00` to `live/09`; `INSTALL.md` updated |
| T-009 | done | `T-009_EVIDENCE.md`: live screenshots `live/10` to `live/16`, installed branch build byte-identical, 150 run states byte-identical |

## Scenario Results

| scenario_id | Result | Evidence |
|---|---|---|
| SCN-001 | pass | logic suite: whole tokens, shared prefixes, lists, sentence-final dot, dot inside a file name, underscores and dots in ids, non-string and empty texts, long texts read from the end |
| SCN-002 | pass | adapter suite: subagent turn names nothing; prompt names `extra-05`; answer names `extra-07` then `extra-12`, the later counts; the answer passes through unchanged |
| SCN-003 | pass | `live/06-t001-answer-text.png`: a 328-character string at `turn.complete` |
| SCN-004 | pass | logic suite: later mention wins, later change wins, a tie goes to the mention, a completed run is never named, browsing shows the selection, browsing without a valid selection keeps the chat's run, no mention keeps today's rule |
| SCN-005 | pass | adapter suite: "Named in the chat" / "Im Chat genannt", "Back to chat run" / "Zurück zum Chat-Run" |
| SCN-006 | pass | adapter suite: stepping row under the chat's run; a step shows "Selected by you" and stores `fixture-a` as the selection |
| SCN-007 | pass | adapter suite: a subagent turn keeps the browsed run; a main-loop turn returns to the chat's run |
| SCN-008 | pass | `live/14-t009-auto-return.png` |
| SCN-009 | pass | adapter suite: no return control while the chat's run is shown; button below the stepping buttons and first menu entry while browsing; both return |
| SCN-010 | pass | `live/12-t009-browsing-return-button.png`, `live/13-t009-menu-return-entry.png` |
| SCN-011 | pass | adapter suite: while browsing to a waiting run the status line stays `AGDF · UR · blocked` for the chat's blocked run and no toast is raised |
| SCN-012 | pass | logic suite: wartet (approval and decision) and baut stay during a turn; blockiert, laeuft and fertig show the overlay |
| SCN-013 | pass | `live/11-t009-named-waiting-during-turn.png`, `live/16-t009-after-question-same-turn.png`: "wartet auf Freigabe" during running turns |
| SCN-014 | pass | `live/07` to `live/09`: no scrollbar for any reserve in three pane sizes; reserve 0 chosen |
| SCN-015 | pass | adapter suite: root `minHeight` equals `bodyRows` (30); `listCapacity` uses the same rows; native test asserts `bodyRows` |
| SCN-016 | pass | `live/10-t009-list-footer-narrow.png`, `live/15-t009-footer-wide.png` |
| SCN-017 | pass | adapter suite: footer, menu, About, sized list and gate-bar tests unchanged and passing |
| SCN-018 | pass | `live/00-baseline-footer-sized-list.png` to `live/04-baseline-ids-narrow.png` |
| SCN-019 | pass | adapter suite: one write site; a non-string answer leaves the chat's run; the hook returns the answer unchanged |
| SCN-020 | pass | `live/t009-hashes-before.txt` equals `live/t009-hashes-after.txt` (150 files) |
| SCN-021 | pass | suites, `build:prepare`, compatibility 56/0, `claude plugin validate`, `claude plugin test` 6 of 6 |
| SCN-022 | pass | `live/11-t009-named-waiting-during-turn.png`: "Im Chat genannt" |
| SCN-023 | pass | `INSTALL.md`: chat run, browsing, return, waiting rule, live evidence of 2026-10-28 |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| none | none | none | resolved | No gap against the approved TP; T-001 settled both host facts in favour of the design | none |

## Verification Commands

- `npm run test:claude-companion` (in `packages/cli`): logic, adapter and integrity tests passed on the final tree.
- Mutation script (session scratchpad `nav-mutations.mjs`): five mutations caught, files restored byte-identically.
- `npm run build:prepare`: passed.
- `npm run compatibility:record` and `npm run compatibility:check`: 56 evaluated, 0 failed.
- `claude plugin validate packages/cli/generated/plugins/agdf` and `claude plugin test` on a scratch copy: passed, 6 of 6.
