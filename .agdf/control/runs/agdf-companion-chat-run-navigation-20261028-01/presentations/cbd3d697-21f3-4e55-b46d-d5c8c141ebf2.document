# TP: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-28
Owner: Arndt Gold
Run: agdf-companion-chat-run-navigation-20261028-01
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Early host probe before adapter work: a copy of the working-tree companion in this session's dev-mods folder (own pane, command and state file, outside the repository) shows the type and length of the `text` that `next(e)` returns at a main-loop `turn.complete`, and draws the body with reserves of 0, 0.25 and 0.5 rows; capture the session's window in the narrow and the widened pane and record which reserve shows no scrollbar | Claude Code implementing agent; Arndt Gold keeps the session on screen | Brownfield Analysis |
| T-002 | Recognition and chat signal: `namedRun` in `assignment.mjs` (whole-token match, last occurrence, active runs, last 65,536 characters); `session.chatMention` set in the main-loop `turn.start` and `turn.complete` hooks inside their catch paths, subagent turns ignored | Claude Code implementing agent | T-001 |
| T-003 | Assignment, browsing and automatic return: `assignRun` with `mention`, `isBrowsing` and `chatRunId`; origin `named`; `session.isBrowsing` set by steps and picks while a chat run is known and cleared at a main-loop `turn.start`; stepping row for every shown run | Claude Code implementing agent | T-002 |
| T-004 | Return control and texts: plain button `chat-return` below the stepping row and first footer-menu entry `chat`, only while another run than the chat run is shown; `origin.named` and `actions.backToChat` in English and German | Claude Code implementing agent | T-003 |
| T-005 | Status line, toasts and waiting rule: `announce` observes the run shown without browsing; `displayState` keeps `wartet` and `baut` during a turn | Claude Code implementing agent | T-003 |
| T-006 | Body sizing: root `minHeight` and `listCapacity` use the reserve chosen in T-001, whole-row fallback | Claude Code implementing agent | T-001 |
| T-007 | Tests: extend the logic and adapter suites per the Test Plan, keep the delivered panel tests, extend the native test with a prompt that names a run | Claude Code implementing agent | T-002 to T-006 |
| T-008 | Evidence and documentation: `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check`, the companion suites, `claude plugin validate` and `claude plugin test`; move the live screenshots of 2026-10-28 into this run's `live/` folder; update the companion section of `INSTALL.md` | Claude Code implementing agent | T-007 |
| T-009 | Final live check: install this branch's build, run the companion copy of the final tree in this session's dev-mods folder, and capture recognition from a named run, browsing with the return control, the automatic return at the next turn, "wartet auf Freigabe" during an open approval question and the footer in the narrow and widened pane; hash the run states read before and after | Claude Code implementing agent; Arndt Gold keeps the session on screen and answers one approval question | T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-01 | T-002 | SCN-001 | `namedRun` returns the last whole-token active id; an id inside a longer id, a completed or unknown id, a non-string or empty text return null; a text longer than 65,536 characters is scanned from its end | Node test output (logic suite) |
| AC-001 | SDD-02 | T-002 | SCN-002 | A main-loop prompt or answer naming an open run sets the chat run; the answer counts after the prompt; a subagent turn changes nothing; the later of mention and change wins | Node test output (adapter suite) |
| AC-001 | SDD-02 | T-001 | SCN-003 | On the Windows desktop a main-loop `turn.complete` hook receives the answer as a non-empty string | Dated probe screenshot and note |
| AC-002 | SDD-03 | T-003 | SCN-004 | `assignRun` shows the chat run with origin `named` or `session` for every combination of mention, change and selection, the selection while browsing or without a chat run, and returns `chatRunId` | Node test output (logic suite) |
| AC-002 | SDD-09 | T-004 | SCN-005 | The panel shows "Im Chat genannt" / "Named in the chat" and "In dieser Sitzung geändert" / "Changed in this session" per origin | Node test output (adapter suite) |
| AC-003 | SDD-04 | T-003 | SCN-006 | While the chat run is shown the stepping buttons exist; a step or pick shows the run with "Von dir ausgewählt" and stores the selection | Node test output (adapter suite) |
| AC-004 | SDD-04 | T-003 | SCN-007 | After browsing, a main-loop `turn.start` shows the chat run again; a subagent turn does not; without a chat run the browsed run stays | Node test output (adapter suite) |
| AC-004 | SDD-04 | T-009 | SCN-008 | Live: after browsing, the next chat message brings the panel back to the chat run | Dated live screenshots |
| AC-005 | SDD-05 | T-004 | SCN-009 | The return button and the first menu entry appear only while another run than the chat run is shown and return to it; neither appears while the chat run is shown or without one | Node test output (adapter suite) |
| AC-005 | SDD-09 | T-009 | SCN-010 | Live: "Zurück zum Chat-Run" is visible below the stepping buttons and in the menu while browsing | Dated live screenshot |
| AC-006 | SDD-06 | T-005 | SCN-011 | While browsing, the status line keeps the chat run's state and no toast is raised for the browsed run; without a chat run both follow the shown run | Node test output (adapter suite) |
| AC-007 | SDD-07 | T-005 | SCN-012 | During a turn `wartet` (approval and decision) and `baut` stay, `blockiert`, `laeuft` and `fertig` show the overlay | Node test output (logic suite) |
| AC-007 | SDD-07 | T-009 | SCN-013 | Live: during an open approval question the panel shows "wartet auf Freigabe" like the status line | Dated live screenshot |
| AC-008 | SDD-08 | T-001 | SCN-014 | The probe identifies the smallest reserve of 0, 0.25 and 0.5 rows without a scrollbar in both panes, or shows that only whole rows count | Dated probe screenshots |
| AC-008 | SDD-08 | T-006 | SCN-015 | The root `minHeight` equals `bodyRows` less the chosen reserve; `listCapacity` uses the same reserve | Node test output (adapter suite) |
| AC-008 | SDD-08 | T-009 | SCN-016 | Live: the footer's lower edge meets the pane margin without an extra row or scrollbar in the narrow and widened pane | Dated live screenshots |
| AC-009 | SDD-10 | T-007 | SCN-017 | The delivered footer, menu, About, sized list and gate-bar tests pass unchanged | Node test output (adapter suite) |
| AC-009 | SDD-10 | T-008 | SCN-018 | The live screenshots of 2026-10-28 for footer, menu, About and gate bars are in this run's `live/` folder and listed in the evidence | Evidence listing |
| AC-010 | SDD-11 | T-007 | SCN-019 | The adapter source keeps one write site; a recognition failure or a non-string answer leaves the chat run and passes the event on | Node test output (adapter suite) |
| AC-010 | SDD-11 | T-009 | SCN-020 | The run states read during the live check are byte-identical before and after | Hash listing |
| AC-011 | SDD-12 | T-008 | SCN-021 | Suites, `build:prepare`, compatibility record and check, `claude plugin validate` and `claude plugin test` pass on the final tree | Command results |
| AC-011 | SDD-12 | T-009 | SCN-022 | Live: a run named in the chat is shown with "Im Chat genannt" | Dated live screenshot |
| AC-012 | SDD-12 | T-008 | SCN-023 | `INSTALL.md` describes the chat run, browsing, return, the waiting rule and the panel of 2026-10-28 with separated evidence | Documentation diff |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/cli/scripts/claude-companion-test.js` | Local Node 22 on Windows and CI | none | Claude Code implementing agent | Passing logic tests | Fix before T-008 |
| AC-001 | SCN-002 | `node packages/cli/scripts/claude-companion-adapter-test.js` | Local Node 22 and CI | none | Claude Code implementing agent | Passing adapter tests | Fix before T-008 |
| AC-001 | SCN-003 | Dev-mod probe in this session, window capture | Claude desktop Code tab on Windows | Mods enabled for this session; session on screen | Claude Code implementing agent | Screenshot and note | Record prompt-only recognition as the observed limit; QA judges AC-001 against it |
| AC-002 | SCN-004 | Logic suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-002 | SCN-005 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-003 | SCN-006 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-004 | SCN-007 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-004 | SCN-008 | Live check with the dev-mod copy of the final tree | Claude desktop Code tab on Windows | Session on screen; mods enabled | Claude Code implementing agent | Screenshots before and after a chat message | Record the gap; QA stays revise |
| AC-005 | SCN-009 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-005 | SCN-010 | Live check | Claude desktop Code tab on Windows | Session on screen | Claude Code implementing agent | Screenshot | Record the gap; QA stays revise |
| AC-006 | SCN-011 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-007 | SCN-012 | Logic suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-007 | SCN-013 | Live check during an approval question | Claude desktop Code tab on Windows | Session on screen; Arndt Gold leaves one approval question open while it is captured | Claude Code implementing agent | Screenshot | Record the gap; QA stays revise |
| AC-008 | SCN-014 | Dev-mod probe, window capture | Claude desktop Code tab on Windows | Session on screen; pane widened through its own control | Claude Code implementing agent | Screenshots per reserve | Keep the whole-row reserve and record the limit |
| AC-008 | SCN-015 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-008 | SCN-016 | Live check | Claude desktop Code tab on Windows | Session on screen | Claude Code implementing agent | Screenshots narrow and widened | Record the gap; QA stays revise |
| AC-009 | SCN-017 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-009 | SCN-018 | Copy the screenshots of 2026-10-28 from the session scratchpad into `live/` | Local | none | Claude Code implementing agent | Files listed with dates | Reference the scratchpad copies and record the gap |
| AC-010 | SCN-019 | Adapter suite | Local Node 22 and CI | none | Claude Code implementing agent | Passing tests | Fix before T-008 |
| AC-010 | SCN-020 | SHA-256 of the run states read, before and after the live check | Local | none | Claude Code implementing agent | Hash listing | Record the gap; QA stays revise |
| AC-011 | SCN-021 | `npm run test:claude-companion`, `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check`, `claude plugin validate`, `claude plugin test` | Local Node 22 on Windows; Claude Code CLI | Claude Code installed | Claude Code implementing agent | Command results | Fix and rerun; native checks absent are recorded as a gap |
| AC-011 | SCN-022 | Live check | Claude desktop Code tab on Windows | Session on screen | Claude Code implementing agent | Screenshot | Record the gap; QA stays revise |
| AC-012 | SCN-023 | Review of the `INSTALL.md` diff in Code Review | Local | none | Code reviewer | Reviewed diff | Fix before QA |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Probe order and scenario mapping | SD: Probe order and scenario mapping | resolved | T-001 runs first after Brownfield Analysis and probes the answer text and the body reserve with a dev-mod copy of the companion in this session; every criterion and SDD maps to tasks and scenarios in section 2 | Claude Code implementing agent, TP author |
| Live-check vehicle | TP | resolved | Probe and final live check use a dev-mod copy of the working tree in this session, captured from its window, because installed plugin modules load only in a new session; the branch build is also installed so a new session runs the same code | Claude Code implementing agent, TP author |
| Full verification run | TP | resolved | The full `npm run verify:ci` is not required by the PRD; T-008 runs the targeted suites, regeneration and native checks, and the pull-request CI runs the full lanes | Claude Code implementing agent, TP author |

## 4. Brownfield Scope

Inspect before implementation: the companion modules under `plugins/agdf/host-templates/claude/companion/` (`assignment.mjs`, `register.mjs`, `state.mjs`, `view.mjs`, `notice.mjs`, `locales.json`), the three companion suites, `packages/core/test/control-cockpit-fixtures.js` and the native test generator in the session scratchpad.

## 5. Out Of Scope

- Changes to the core, contracts, dispatcher, MCP server, SessionStart hook or the `RUN_STATE.md` format.
- Changes to the Claude manifest, the companion descriptor, the shared plugin definition, shared hooks or the Copilot inventory.
- A new hook, `tool.call` observation or detection of open questions in the chat.
- A marker of the chat run in the position line or the run list.
- Publication, npm release or merge.

## 6. Risks And Blockers

- Warn: T-001 may show that the desktop hands no answer text to `turn.complete`; recognition then works from prompts and changes, and QA judges AC-001 against the observation.
- Warn: T-001 may show that only whole rows count for the body; the whole-row reserve stays and QA judges AC-008 against the observation.
- Revise: any live scenario (SCN-008, SCN-010, SCN-013, SCN-016, SCN-020, SCN-022) without evidence keeps QA at revise unless the observation documents a host limit.
- Warn: live captures need this session on screen; the owner brings it to the front when asked.
- Warn: the mod API is early access; a Claude Code update during the run may require re-running native checks.

## 7. Next Step

Review this task and test plan and approve only with `Approval: TP`. Valid approval permits the implementation-preparation Brownfield Analysis, then implementation of the approved tasks.

## AGDF Approval Summary (de; source=en)

Der Plan setzt das freigegebene Lösungsdesign in neun Aufgaben um und ordnet alle zwölf Kriterien und alle zwölf Designentscheidungen 23 prüfbaren Szenarien zu. Er ist vorbereitet, aber noch nicht umgesetzt.

- Reihenfolge: Zuerst kommt eine Host-Probe (T-001): Eine Kopie des Begleiters im Mod-Ordner dieser Session zeigt, ob der Desktop den Antworttext an `turn.complete` übergibt, und zeichnet den Inhalt mit Reserven von 0, 0,25 und 0,5 Zeilen; die Fenster-Aufnahmen schmal und verbreitert entscheiden, welche Reserve ohne Scrollleiste auskommt.
- Umsetzung: Erkennung und Chat-Signal mit `namedRun` und den Turn-Hooks (T-002), Zuordnung, Blättern und automatischer Rücksprung in `assignRun` und `register.mjs` (T-003), Rücksprung-Button, Menüeintrag und Texte (T-004), Statuszeile und Meldungen ohne Blättern sowie „wartet“ vor „läuft“ (T-005), Höhenbemessung nach der Probe (T-006).
- Tests und Nachweise: Logik- und Adapter-Suite werden um alle Szenarien erweitert, die Tests des gelieferten Panels bleiben, der native Test bekommt einen Prompt mit Run-Nennung (T-007); `build:prepare`, Kompatibilität, Suiten, `claude plugin validate` und `claude plugin test`, die Screenshots vom 2026-10-28 im Ordner `live/` und `INSTALL.md` (T-008); ein vollständiges `verify:ci` übernimmt die PR-CI.
- Live-Prüfung (T-009): Installation des Branch-Builds und die Kopie des fertigen Stands in dieser Session; Aufnahmen von Erkennung, Blättern mit Rücksprung-Button, automatischem Rücksprung, „wartet auf Freigabe“ während einer offenen Freigabefrage und der Fußzeile schmal und verbreitert; die gelesenen Run-Dateien bleiben byteidentisch. Dafür brauche ich diese Session auf dem Bildschirm und eine offene Freigabefrage von dir.
- Risiken: Übergibt der Desktop keinen Antworttext, erkennt der Begleiter nur Prompts und Änderungen; zählen nur ganze Zeilen, bleibt die Reserve von einer Zeile; beides wird dokumentiert und von QA beurteilt. Fehlen Live-Nachweise ohne dokumentierte Host-Grenze, bleibt QA auf revise.
