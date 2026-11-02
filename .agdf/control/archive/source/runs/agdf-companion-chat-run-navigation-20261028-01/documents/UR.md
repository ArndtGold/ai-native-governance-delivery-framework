# UR: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Preview requirement: none
Date: 2026-10-28
Owner: Arndt Gold
Run: agdf-companion-chat-run-navigation-20261028-01
Language: en

## 1. Problem

The AGDF Companion (the opt-in Claude side panel, delivered by runs `agdf-begleiter-companion-20261025-01` and `agdf-companion-followup-20261027-01`) loses track of the run the user works on in the chat:

1. **No way back after browsing.** "Previous run" and "Next run" overwrite the stored selection. Once the user has stepped through a few runs, nothing tells them which run they came from or which run the chat is working on.
2. **The companion does not know the chat's run early enough.** It follows a run only after that run's `RUN_STATE.md` changed during the session. While the chat discusses a run, waits for an approval or only reads it, the companion cannot tell which run that is.
3. **Continuing in the chat does not bring the panel back.** A new chat message shows the active-turn overlay on whatever run is shown; it never returns to the chat's run.
4. **Browsing is hidden while the chat's run is shown.** When a run changed in the session, the stepping buttons disappear, so the user cannot look at another run and come back.
5. **"Working" hides "waiting for approval".** During a turn the panel lays "läuft · Claude arbeitet gerade an diesem Turn" over the run's state. A turn that presents an approval question stays open until the user answers, so exactly when the user should decide, the panel says the chat is working, while Claude's status line already says `AGDF · UR · wartet`. Observed live on 2026-10-28 for this run at UR.
6. **Empty space below the footer menu.** On the desktop the footer sits about two rows above the panel's bottom edge (live check of 2026-10-28), because the body is sized one row less than the pane's body rows to avoid a scrollbar.

In addition, the owner asked on 2026-10-28 for panel changes that were made outside any AGDF run and are already on the pull-request branch: commit `3444befe` (a footer at the panel's bottom edge set off by a dim frame, holding the AGDF icon, the app's own picker as menu and the read time; an About entry with the purpose, the plugin version and a link to agdf.iself.eu; a run list that fills the panel's height and ends with "+ N more") and commit `2f54fbcc` (the condensed gate bar beside each listed run where the panel is wide enough). The completed run's artefacts still describe the earlier buttons, so code and evidence disagree.

## 2. Goal

The companion follows the run the chat works on as soon as the chat names it, lets the user browse other runs freely, and brings the user back to the chat's run automatically with the next chat turn or with one click. While the shown run waits for the user, the panel says so, in step with the status line, and the footer menu sits at the panel's bottom edge. The panel changes of 2026-10-28 are recorded with their evidence in an AGDF run, so code, documentation and governance artefacts agree again. The companion stays opt-in, read-only, observation-only, failure-isolated and Claude-only.

## Affected Users

The user working on AGDF delivery in Claude Code with the companion switched on, primarily in the Code tab of the Claude desktop app on Windows and secondarily in the terminal. Users who have not switched the companion on, and Codex and Copilot users of AGDF, notice no change.

## 3. Scope

1. **Chat-run recognition without a new hook.** The companion derives the chat's run from the hooks it already has: the prompt text of a main-loop `turn.start` and the answer text that `turn.complete` receives from `next(e)`. An id of a known open run named in that text (as AGDF status cards always do) marks that run as the chat's run; when several are named, the last one named counts. The existing signal "the run's `RUN_STATE.md` changed during this session" stays. How the two signals rank, whole-token matching of run ids and how long the chat's run is remembered are PRD/SD decisions.
2. **Automatic return with the next turn.** When the user has browsed to another run and a chat run is known, the start of the next main-loop turn shows the chat's run again. Subagent turns do not.
3. **Return button.** While the panel shows a run other than the known chat run, a control "Zurück zum Chat-Run" ("Back to chat run") returns to it with one click; the same entry is in the footer menu.
4. **Browsing from the chat's run.** "Previous run" and "Next run" are available also while the chat's run is shown; browsing then lasts until the next main-loop turn or the return control.
5. **Waiting wins over the turn overlay.** While the shown run waits for an approval or a decision, the panel shows "wartet auf Freigabe" or "wartet auf Entscheidung" also during a turn, so panel and status line agree. The rule uses the run's own state and needs no new hook.
6. **Footer at the bottom edge.** On the desktop the footer with the menu sits at the panel's bottom edge, with no more space below it than the pane's own margin and without a scrollbar, in the narrow and in the widened pane.
7. **Recording the panel changes of 2026-10-28.** The changes of commits `3444befe` and `2f54fbcc` (footer with frame and picker menu, About with link, run list sized to the panel with "+ N more", condensed gate bar beside each listed run when the panel is wide enough, the mobile fallback) become part of this run's delivered scope with their evidence: automated suites, native checks and the live desktop screenshots of 2026-10-28.
8. Automated checks for every item in the companion suites `packages/cli/scripts/claude-companion*-test.js`, native `claude plugin validate` and `claude plugin test` checks, regenerated plugin payload and compatibility records, and a live check in the Claude desktop app with screenshots.
9. Documentation of the navigation and waiting rules in the companion section of `INSTALL.md`.

## 4. Non-Goals

- No new hook: no `tool.call` observation and no reading of tool-call inputs; a run the chat works on silently, without naming it, is recognized only when its `RUN_STATE.md` changes. No detection of an open question in the chat; the waiting rule rests on the run's state alone.
- No guessing: without a named or changed run there is no chat run and nothing jumps.
- No marker of the chat's run in the position line or the run list (a later candidate).
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion.
- No change to AGDF control behavior, the core status card, contracts, dispatcher, MCP server or the `RUN_STATE.md` format.
- No companion for Codex, Copilot or OpenCode.
- No release and no merge: delivery ends on the existing pull-request branch (pull request #40); merging stays with the owner.

## 5. Acceptance Signals

1. A main-loop prompt or answer that names the id of an open run makes it the chat's run; the panel shows it with an origin that says so. Text that names no known open run changes nothing; a run id inside a longer id does not count.
2. After browsing away, the start of the next main-loop turn shows the chat's run again; a subagent turn does not; without a known chat run the shown run stays.
3. "Zurück zum Chat-Run" appears only while another run than the known chat run is shown, in the panel and in the footer menu, and returns to it.
4. Stepping works while the chat's run is shown, and the browsed run stays shown until the next main-loop turn or the return control.
5. During a turn, a shown run that waits for an approval or a decision appears as "wartet auf Freigabe" or "wartet auf Entscheidung", and panel and status line name the same state; a run that does not wait still shows "läuft" during a turn.
6. On the desktop the footer's lower edge meets the pane's own bottom margin with no extra empty row and no scrollbar, in the narrow and in the widened pane (live screenshots).
7. The panel changes of commits `3444befe` and `2f54fbcc` are covered by the companion suites and documented with the live screenshots of 2026-10-28 in this run's evidence.
8. No companion element approves, continues or writes under `.agdf/control`; run state files stay byte-identical over a test window.
9. The companion suites, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record` and `npm run compatibility:check` pass, and a live check in the Claude desktop app on Windows shows recognition, automatic return and the return control with screenshots.

## 6. Existing Source Of Truth

- The owner decisions of 2026-10-28 in this session: the footer with frame, the app's picker as menu after a live comparison, About with the link to agdf.iself.eu, the run list sized to the panel with "+ N more", the condensed gate bar beside listed runs where the panel is wide enough, chat-run recognition without a new hook with automatic return and a return control, and the owner's findings that the panel shows "läuft" while the run waits for approval and that the footer leaves empty space below it.
- The approved artefacts of `agdf-begleiter-companion-20261025-01` (run assignment SDD-06, AC-004: the run changed in this session first, then the remembered selection, never a guess) and of `agdf-companion-followup-20261027-01` (OR completed at revision 22).
- The companion code under `plugins/agdf/host-templates/claude/companion/` (`register.mjs`, `assignment.mjs`, `view.mjs`, `gate-bar.mjs`, `locales.json` and the other modules) and the suites `packages/cli/scripts/claude-companion-test.js`, `claude-companion-adapter-test.js` and `claude-companion-integrity-test.js`.
- Commits `3444befe` and `2f54fbcc` on branch `claude/festive-mcnulty-c824c7` (pull request #40).
- The Claude Code mod API as declared by Claude Code 2.1.308: `turn.start` input `text`, `turn.complete` result `{ text }` from `next(e)`.
- `INSTALL.md` (section "Optional AGDF companion panel") and the Context Graph entry `CG-RUN-STATUS-CARD` in `.agdf/control/CONTEXT_GRAPH.md`.

## 7. Risks And Unknowns

- Whether the desktop host hands the main-loop answer text to `turn.complete` hooks through `next(e)` as declared needs a live check.
- Text recognition can misread: an answer that lists several runs, a run named only in passing, or ids that share a prefix. The rule "last named open run, whole-token match" may need refinement in PRD/SD.
- The ranking of "named in the chat" against "changed in this session" and against the user's explicit selection decides whether the panel feels predictable; it changes the approved assignment rule and needs a clear PRD statement.
- Automatic return can surprise a user who browses during a running turn; the return happens only at the next turn start.
- With "waiting" ahead of the turn overlay, the turn that records the user's approval still shows "wartet" until the run state is written.
- Whether the desktop honors a body size finer than one row (to close the gap below the footer without a scrollbar) needs a live probe; the pane's own margin stays.
- Remembering the chat's run across sessions or only within the session is undecided.
- The panel changes of 2026-10-28 are recorded after they were committed; their evidence comes from the commits' test runs and the live screenshots of 2026-10-28.
- The payload change chain (generated plugin, compatibility records) and the early-access mod API apply as before.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

After `Approval: UR`, Brownfield Review records the Mode/Slice Decision.

## AGDF Approval Summary (de; source=en)

- Problem: Der AGDF Companion verliert den Run aus dem Blick, an dem der Chat arbeitet. „Vorheriger Run“ und „Nächster Run“ überschreiben die gespeicherte Auswahl ohne Weg zurück. Den Chat-Run kennt er erst, wenn dessen `RUN_STATE.md` sich in der Session ändert; eine neue Chat-Nachricht holt das Panel nicht zurück, und beim geänderten Run ist Blättern ausgeblendet. Während eines Turns überdeckt „läuft“ den Run-Zustand; eine Freigabefrage hält den Turn offen, sodass das Panel genau dann „läuft“ zeigt, wenn du entscheiden sollst, während die Statuszeile `AGDF · UR · wartet` zeigt (live am 2026-10-28). Unter dem Fußzeilenmenü bleiben im Desktop etwa zwei Zeilen leer. Dazu kommen die Panel-Änderungen vom 2026-10-28 aus den Commits `3444befe` (Fußzeile mit Rahmen und App-Auswahlmenü, About mit Link auf agdf.iself.eu, Runliste nach Panelhöhe mit „+ N weitere“) und `2f54fbcc` (kompakte Gate-Leiste neben jedem Run bei genug Breite); sie entstanden ohne AGDF-Run, die Artefakte beschreiben noch die alten Buttons.
- Ziel: Der Begleiter folgt dem Run, den der Chat nennt, lässt freies Blättern zu und bringt dich mit dem nächsten Chat-Turn oder per Klick zum Chat-Run zurück. Wartet der gezeigte Run auf dich, sagt das Panel das, im Einklang mit der Statuszeile, und das Fußzeilenmenü sitzt am unteren Rand. Die Panel-Änderungen sind mit Nachweisen in einem AGDF-Run erfasst. Er bleibt Opt-in, rein lesend, beobachtend, fehlerisoliert und nur für Claude.
- Betroffene: Wer AGDF in Claude Code mit eingeschaltetem Begleiter nutzt, vor allem im Code-Tab der Desktop-App unter Windows, nachrangig im Terminal. Für alle anderen, auch Codex und Copilot, ändert sich nichts.
- Umfang: (1) Chat-Run-Erkennung ohne neuen Hook aus dem Prompt bei `turn.start` und der Antwort, die `turn.complete` über `next(e)` erhält; die ID eines bekannten offenen Runs macht ihn zum Chat-Run, bei mehreren zählt der zuletzt genannte; „in dieser Session geändert“ bleibt; Rangfolge, ganzwortige Erkennung und Dauer klären PRD/SD. (2) Automatischer Rücksprung beim nächsten Haupt-Turn, nicht bei Subagenten. (3) Button „Zurück zum Chat-Run“ im Panel und im Fußzeilenmenü, solange ein anderer Run gezeigt wird. (4) Blättern auch vom Chat-Run aus, bis zum nächsten Turn oder Rücksprung. (5) „wartet“ vor „läuft“: wartet der gezeigte Run auf Freigabe oder Entscheidung, zeigt das Panel das auch während eines Turns, aus dem Run-Zustand. (6) Fußzeile am unteren Rand ohne Leerraum über den Panelrand hinaus und ohne Scrollleiste, schmal wie verbreitert. (7) Erfassung der Panel-Änderungen aus `3444befe` und `2f54fbcc` mit Suiten, nativen Prüfungen und Live-Screenshots vom 2026-10-28. (8) Automatische und native Prüfungen, neu erzeugtes Plugin, Kompatibilitätsnachweise und Live-Prüfung mit Screenshots. (9) Navigations- und Warteregeln in `INSTALL.md`.
- Nicht enthalten: kein neuer Hook und kein Mitlesen von Tool-Aufrufen; still bearbeitete, nicht genannte Runs zählen erst nach einer Änderung ihrer `RUN_STATE.md`; keine Erkennung offener Rückfragen im Chat, die Warteregel stützt sich nur auf den Run-Zustand; kein Raten; keine Chat-Run-Markierung in Positionszeile oder Liste (späterer Kandidat); keine Freigaben, Gate-Aktionen oder Schreibzugriffe; keine Änderung an AGDF-Steuerung, Statuskarte, Verträgen, Dispatcher, MCP-Server oder `RUN_STATE.md`-Format; kein Begleiter für Codex, Copilot oder OpenCode; kein Release und kein Merge, Lieferung auf PR #40.
- Abnahmesignale: Ein Prompt oder eine Antwort mit der ID eines offenen Runs macht ihn zum Chat-Run, die Herkunft wird angezeigt, eine ID als Teil einer längeren ID zählt nicht; nach dem Wegblättern zeigt der nächste Haupt-Turn wieder den Chat-Run, ein Subagent-Turn nicht, ohne Chat-Run bleibt alles stehen; „Zurück zum Chat-Run“ erscheint nur bei einem anderen Run und führt zurück; Blättern funktioniert auch vom Chat-Run aus; während eines Turns zeigt ein wartender Run „wartet auf Freigabe“ oder „wartet auf Entscheidung“ und Panel und Statuszeile nennen denselben Zustand, ein nicht wartender Run zeigt weiter „läuft“; die Unterkante der Fußzeile trifft im Desktop den Panelrand ohne zusätzliche Leerzeile und ohne Scrollleiste, schmal wie verbreitert (Live-Screenshots); die Panel-Änderungen sind durch Suiten abgedeckt und mit Live-Screenshots belegt; nichts gibt frei oder schreibt unter `.agdf/control`; Suiten, native Prüfungen, `build:prepare` und Kompatibilität sind grün, und die Live-Prüfung zeigt Erkennung, Rücksprung und Button.
- Quellen: die Owner-Entscheidungen und -Befunde vom 2026-10-28 in dieser Session („läuft“ statt „wartet“ bei offener Freigabe, Leerraum unter der Fußzeile); die freigegebenen Artefakte von `agdf-begleiter-companion-20261025-01` (Zuordnung SDD-06, AC-004) und `agdf-companion-followup-20261027-01`; der Begleiter-Code unter `plugins/agdf/host-templates/claude/companion/` mit seinen Suiten; die Commits `3444befe` und `2f54fbcc` auf PR #40; die Mod-API von Claude Code 2.1.308; `INSTALL.md` und `CG-RUN-STATUS-CARD`.
- Risiken und offene Punkte: ob der Desktop den Antworttext wie deklariert an `turn.complete` übergibt (Live-Prüfung); Fehlerkennung bei mehreren genannten Runs, beiläufigen Nennungen oder gleichen Präfixen; die Rangfolge zwischen „im Chat genannt“, „in der Session geändert“ und deiner Auswahl, die die freigegebene Zuordnungsregel ändert; ein Rücksprung kann beim Blättern während eines Turns überraschen; mit „wartet“ vor „läuft“ zeigt der Turn, der deine Freigabe aufzeichnet, noch „wartet“, bis die Run-Datei geschrieben ist; ob der Desktop eine feinere Höhe als eine Zeile umsetzt, um die Lücke unter der Fußzeile ohne Scrollleiste zu schließen, klärt eine Live-Probe; ob der Chat-Run nur in der Session oder darüber hinaus gilt; die Panel-Änderungen werden nachträglich erfasst; die Payload-Kette und die Early-Access-API wie bisher.
- Nächster Schritt: UR prüfen und nur mit `Approval: UR` freigeben; danach legt die Brownfield Review die Mode/Slice-Entscheidung fest.
