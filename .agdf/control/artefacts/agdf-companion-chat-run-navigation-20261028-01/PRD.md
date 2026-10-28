# PRD: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-28
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

The opt-in AGDF Companion for Claude Code (command `/agdf-companion`) gains, while switched on:

- recognition of the run the chat works on from the text of main-loop turns (the user's prompt and Claude's answer), beside the existing signal "changed in this session";
- following that chat run, browsing other runs from it, an automatic return at the next main-loop turn and a control "Zurück zum Chat-Run" / "Back to chat run";
- "waiting for approval" and "waiting for a decision" ahead of the turn overlay, so panel and status line agree while Claude asks the user;
- a footer that sits at the panel's bottom edge without an extra empty row.

The run also adopts, as delivered baseline with its evidence, the panel changes of commits `3444befe` and `2f54fbcc` on pull request #40: a framed footer with the AGDF icon, the app's picker as menu and the read time; an About entry with purpose, plugin version and a link to agdf.iself.eu; a run list sized to the panel with "+ N more"; and the condensed gate bar beside each listed run where the panel is wide enough.

The companion stays display-only: it reads run state and the turn texts it already receives, never writes control state, never requests or records approvals and never continues a run. It stays wired only through the Claude projection, without a new hook.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready — `.agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/UX_INTENT_DEFINITION.md` (recorded 2026-10-28, revision 7)
- primary_user_intent: See the run the chat is working on without doing anything; look at other runs when wanted and find the way back at once; see at a glance when that run waits for me.
- success_signal: After browsing, the next chat message or one click on "Zurück zum Chat-Run" brings the panel back to the chat run; while an approval question is open, the panel reads "wartet auf Freigabe" like the status line; the footer menu sits at the panel's bottom edge.
- primary_decision_or_action: Keep working in the chat (the panel follows); optionally browse with "Vorheriger Run" / "Nächster Run" or the run list and return with "Zurück zum Chat-Run".

No preview is required by the approved UR. The UX analysis is agent inspection of the delivered companion, the owner's findings and the live screenshots of 2026-10-28; the navigation behavior below is proposed product behavior, not yet observed.

## 3. Working Modes And Effective State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| On, following the chat | The chat run is shown | Run state as today; origin "Im Chat genannt" / "Named in the chat" or "In dieser Sitzung geändert" / "Changed in this session"; stepping buttons available | The chat's latest mention or change in this session; the run's `RUN_STATE.md` for its state | Side panel |
| On, browsing | The browsed run is shown until the next main-loop turn or the return control | Run state as today; origin "Von dir ausgewählt" / "Selected by you"; "Zurück zum Chat-Run" below the stepping buttons and in the footer menu | The user's browsing; the run's `RUN_STATE.md` | Side panel |
| On, no chat run | Today's rule: remembered selection or the run list | As today; no return control | Remembered selection | Side panel |
| On, during a main-loop turn | Overlay "läuft · Claude arbeitet gerade an diesem Turn" unless the shown run waits (approval or decision) or builds | Waiting runs keep "wartet auf Freigabe" / "wartet auf Entscheidung" | The run's `RUN_STATE.md` | Side panel |
| Status line and toasts | Follow the chat run while the user browses; without a chat run, the shown run | `AGDF · {gate} · {state}` and toasts as today | The chat run's or shown run's `RUN_STATE.md` | Status line; toast |
| Off | No pane, no status line, no toast | `/agdf-companion` available | User choice | Claude command list |

The AGDF status card and approval cards in chat remain the authoritative gate presentation; the companion is a secondary, glanceable view.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: `/agdf-companion` switches the companion on and off as today. A run becomes the chat run when a main-loop prompt or answer names its id as a whole token, or when its `RUN_STATE.md` changes during the session; the more recent signal wins. Within one text the last id named counts, and an answer counts after its prompt. Subagent turns never set the chat run. The chat run lives for the session only.
- blockers_and_visible_next_actions:
  - A text without the id of an open run changes nothing.
  - An id that appears only inside a longer id does not count.
  - A completed, superseded or abandoned run never becomes the chat run by a mention.
  - Without a chat run there is no return control and nothing returns at a turn start.
- recovery_paths: "Zurück zum Chat-Run" in the panel and in the footer menu; the next main-loop turn start; "Neu lesen" as today.
- relevant_state_transitions:
  - Following to browsing: a step with "Vorheriger Run" / "Nächster Run" or a pick from the run list while a chat run is known. The pick is stored as today's remembered selection.
  - Browsing to following: the start of the next main-loop turn, or "Zurück zum Chat-Run".
  - Following to following with another run: a newer mention or change.
  - During a main-loop turn: a waiting run keeps its waiting state; a building run keeps "baut"; any other run shows the overlay.

## 5. Acceptance Criteria

### Recognition of the chat run

- criterion_id: AC-001
- working_mode: On, any surface
- source_state: Open runs A and B and a run whose id starts with A's id; completed run C.
- action: Send a main-loop prompt or receive an answer that names A, then one that names A and later B; one that names only the longer id; one that names C; one that names no run; a subagent turn that names B.
- expected_effective_state: A becomes the chat run; with A and later B named, B; the longer id never counts as A; C, a text without an open run and the subagent turn change nothing.
- visible_feedback: The panel follows the chat run (AC-002).
- blocker_failure_behavior: A missing or unreadable answer text leaves the chat run as it is.
- recovery_next_action: none; the next mention or change applies.
- observable_success: The chat run equals the last open run named as a whole token in the latest main-loop text, or the latest run changed in the session, whichever came later.
- required_evidence: Automated tests for whole-token matching, lists of several runs, shared prefixes, completed runs, subagent turns and ordering against changes; a live check that the desktop hands the answer text to the hook.

### Following the chat run

- criterion_id: AC-002
- working_mode: On, following the chat
- source_state: A known chat run; another remembered selection.
- action: Show the panel.
- expected_effective_state: The chat run is shown instead of the remembered selection.
- visible_feedback: Origin "Im Chat genannt" / "Named in the chat" after a mention, "In dieser Sitzung geändert" / "Changed in this session" after a change.
- blocker_failure_behavior: An unreadable chat run shows the existing unreadable state with retry.
- recovery_next_action: "Neu lesen" as today.
- observable_success: Panel and origin name the chat run and the latest signal.
- required_evidence: Assignment tests for every combination of mention, change and selection; adapter tests of the origin texts.

### Browsing from the chat run

- criterion_id: AC-003
- working_mode: On, following the chat, then browsing
- source_state: A known chat run that is shown; at least two open runs.
- action: Press "Vorheriger Run" or "Nächster Run", or pick a run from the run list.
- expected_effective_state: The browsed run is shown with origin "Von dir ausgewählt" / "Selected by you" and stays shown until the next main-loop turn or the return control; the pick is stored as the remembered selection as today.
- visible_feedback: The stepping buttons are available while the chat run is shown; the browsed run's position line as today.
- blocker_failure_behavior: With a single open run the stepping buttons behave as today.
- recovery_next_action: AC-004 and AC-005.
- observable_success: A user can look at other runs while the chat run is known.
- required_evidence: Adapter tests for stepping from the chat run and for the stored selection.

### Automatic return at the next main-loop turn

- criterion_id: AC-004
- working_mode: On, browsing
- source_state: A known chat run; another run is shown after browsing.
- action: Start a main-loop turn; separately, start a subagent turn; separately, browse without a known chat run and start a main-loop turn.
- expected_effective_state: The main-loop turn start shows the chat run again; the subagent turn changes nothing; without a chat run the browsed run stays.
- visible_feedback: The chat run with its origin; during the turn the state per AC-007.
- blocker_failure_behavior: none.
- recovery_next_action: none.
- observable_success: Continuing in the chat brings the panel back without any click.
- required_evidence: Adapter tests for main-loop and subagent turns; live check.

### Return control

- criterion_id: AC-005
- working_mode: On, browsing
- source_state: A known chat run; another run is shown; separately, the chat run is shown; separately, no chat run is known.
- action: Look at the panel and the footer menu; press "Zurück zum Chat-Run".
- expected_effective_state: The control appears only while another run than the known chat run is shown; pressing it shows the chat run.
- visible_feedback: A plain button "Zurück zum Chat-Run" / "Back to chat run" below the stepping buttons and the same entry in the footer menu; neither appears while the chat run is shown or without a chat run.
- blocker_failure_behavior: A failed press leaves the last drawing, as other controls do.
- recovery_next_action: AC-004.
- observable_success: One click returns to the chat run.
- required_evidence: Adapter tests for presence and absence of the control in panel and menu and for its effect; live screenshot.

### Status line and toasts follow the chat run

- criterion_id: AC-006
- working_mode: On, browsing
- source_state: A known chat run that waits for an approval; the user browses to a run that is working.
- action: Browse; let a read apply.
- expected_effective_state: The status line keeps the chat run's state (for example `AGDF · UR · wartet`); toasts keep observing the chat run; without a chat run both follow the shown run as today.
- visible_feedback: Status line unchanged by browsing.
- blocker_failure_behavior: As today; a missing channel stays silent.
- recovery_next_action: none.
- observable_success: Browsing never changes the status line or raises a toast for the browsed run.
- required_evidence: Adapter tests for status line and toasts while browsing.

### Waiting ahead of the turn overlay

- criterion_id: AC-007
- working_mode: On, during a main-loop turn
- source_state: The shown run waits for an approval; another shown run waits for a decision; another builds; another is blocked; another is working.
- action: Start a main-loop turn and show each run.
- expected_effective_state: Waiting runs show "wartet auf Freigabe" / "waiting for approval" and "wartet auf Entscheidung" / "waiting for a decision" with their reason; a building run shows "baut"; blocked and working runs show the overlay "läuft · Claude arbeitet gerade an diesem Turn".
- visible_feedback: Panel state and status line name the same state for a waiting run.
- blocker_failure_behavior: none.
- recovery_next_action: none.
- observable_success: While Claude asks for an approval, the panel says the run waits.
- required_evidence: State-rule tests for every mood during a turn; live screenshot during an open approval question.

### Footer at the bottom edge

- criterion_id: AC-008
- working_mode: On, pane shown on the desktop
- source_state: A run with little content and the run list with many runs; the narrow and the widened pane.
- action: Show the panel.
- expected_effective_state: The footer's lower edge meets the pane's own bottom margin with no extra empty row, and no scrollbar appears while the content fits.
- visible_feedback: Footer with icon, menu and read time at the bottom edge.
- blocker_failure_behavior: Content taller than the pane scrolls with the footer last, as today.
- recovery_next_action: none.
- observable_success: No visible gap of a row or more below the footer.
- required_evidence: Adapter tests of the body sizing; live screenshots in the narrow and widened pane.

### Delivered panel baseline

- criterion_id: AC-009
- working_mode: On, all surfaces
- source_state: The companion as committed in `3444befe` and `2f54fbcc`.
- action: Show the panel, open the menu, pick About, show the run list in a tall and a wide pane.
- expected_effective_state: Framed footer with the AGDF icon, the menu "AGDF Companion" as the app's picker (a plain button with entries above the footer on mobile) and the read time; About with purpose, plugin version and the link to agdf.iself.eu; the run list fills the panel and ends with "+ N more"; where the panel is wide enough each listed run shows its condensed gate bar, ids shortened in the middle.
- visible_feedback: As listed.
- blocker_failure_behavior: A narrower pane lists ids alone; the terminal keeps six runs.
- recovery_next_action: none.
- observable_success: The delivered panel matches its documentation and screenshots.
- required_evidence: The companion suites at those commits and after this run; live screenshots of 2026-10-28.

### Observation only

- criterion_id: AC-010
- working_mode: All modes
- source_state: Any run state.
- action: Use every companion control.
- expected_effective_state: No element approves, rejects, continues or selects a delivery run; the return control changes only what the panel shows.
- visible_feedback: Text only outside the panel.
- blocker_failure_behavior: none.
- recovery_next_action: none.
- observable_success: Run state files stay byte-identical over a test window.
- required_evidence: Byte-identity check in the live test; adapter test of the single write site.

### Verification and live evidence

- criterion_id: AC-011
- working_mode: Repository verification and live host
- source_state: The final tree of this run.
- action: Run the suites, native checks, regeneration, compatibility records and a live check.
- expected_effective_state: Companion suites, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record` and `npm run compatibility:check` pass; the live check in the Claude desktop app on Windows shows recognition, automatic return, the return control, waiting during a turn and the footer at the bottom edge.
- visible_feedback: Screenshots and recorded results.
- blocker_failure_behavior: A host that does not hand the answer text to the hook is reported with the prompt-only behavior.
- recovery_next_action: none.
- observable_success: All checks green and live evidence recorded.
- required_evidence: Command results; screenshots.

### Documentation

- criterion_id: AC-012
- working_mode: Documentation
- source_state: The companion section of `INSTALL.md`.
- action: Read it.
- expected_effective_state: It describes which run the companion shows (chat run, browsing, return, remembered selection), the waiting rule and the panel of 2026-10-28, separating automated, native and live evidence.
- visible_feedback: Documentation diff.
- blocker_failure_behavior: none.
- recovery_next_action: none.
- observable_success: A reader can predict which run the panel shows.
- required_evidence: Documentation diff reviewed in Code Review.

## 6. Non-Goals

- No new hook: no `tool.call` observation and no reading of tool-call inputs; a run the chat works on silently is recognized only when its `RUN_STATE.md` changes.
- No detection of an open question in the chat; the waiting rule rests on the run's state alone.
- No marker of the chat run in the position line or the run list (a later candidate).
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion.
- No change to AGDF control behavior, the core status card, contracts, dispatcher, MCP server or the `RUN_STATE.md` format.
- No companion for Codex, Copilot or OpenCode.
- No release and no merge: delivery ends on pull request #40; merging stays with the owner.

## 7. Users And Roles

The AGDF maintainer working in Claude Code on Windows, mainly in the Code tab of the Claude desktop app and secondarily in the terminal; product owner and human approver of gates. Other Claude users of the AGDF plugin who switch the companion on get the same behavior; users who do not switch it on, and Codex and Copilot users, notice no change.

## 8. Constraints

- The Claude Code mod API is early access (Claude Code 2.1.308 at analysis time); the answer text reaches a `turn.complete` hook through `next(e)` as declared, not yet observed live.
- No new hook; the companion uses only `turn.start`, `turn.complete` and its existing hooks.
- One owner decides which run is shown (`assignment.mjs`); no second assignment rule.
- The desktop sizes a pane body in rows; a percentage is not honored (live probe of 2026-10-28).
- Changes to the plugin payload trigger regeneration and review of compatibility records.

## 9. Evidence Requirements

- Automated tests for recognition, assignment combinations, browsing, automatic return, the return control, status line and toasts while browsing, the waiting rule during a turn, the body sizing and the delivered panel.
- Native evidence where Claude Code is available: `claude plugin validate` and `claude plugin test`.
- Regenerated plugin and compatibility records, reviewed.
- One dated live check in the Claude desktop Code tab on Windows with screenshots of: the chat run named in the chat, browsing and the return control, the automatic return at the next turn, "wartet auf Freigabe" during an open approval question, and the footer at the bottom edge in the narrow and widened pane; byte identity of the run states read.
- The live screenshots of 2026-10-28 for the delivered panel baseline.

## 10. Risks And Open Questions

- The answer text at `turn.complete` on the desktop is declared, not observed; the TP probes it first, and AC-011 accepts a prompt-only recognition only as observed and documented.
- Mentions in passing or lists of runs can pick an unexpected chat run; "last named wins" and whole-token matching keep it predictable, and browsing plus the next mention correct it.
- Automatic return can surprise a user who browses during a running turn; it happens only at the next turn start.
- With waiting ahead of the overlay, the turn that records an approval shows "wartet" until the run state is written.
- Sub-row sizing of the desktop body is unknown; the SD chooses the sizing and the live check confirms it.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Ranking of signals | before_prd | resolved | The more recent of "named in the chat" and "changed in this session" sets the chat run; browsing overrides it until the next main-loop turn or the return control; without a chat run the remembered selection applies as today; derived from UR scope items 1 to 4 and the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Chat run lifetime | before_prd | resolved | Session only; a new session starts without a chat run; browsing still stores the remembered selection; from the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Status line and toasts while browsing | before_prd | resolved | Follow the chat run, so browsing never changes them; without a chat run they follow the shown run; from the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Overlay precedence | before_prd | resolved | Only waiting (approval or decision) and building win over the turn overlay; blocked keeps the overlay because the chat usually resolves it; from UR scope item 5 and the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Return control wording and place | before_prd | resolved | "Zurück zum Chat-Run" / "Back to chat run" as a plain button below the stepping buttons and as a footer-menu entry, only while another run than the chat run is shown; from UR scope item 3, adopted with this PRD | Arndt Gold, PRD Owner |
| Recognition rule and assignment extension | later_sd | open | Whole-token match against the snapshot's open ids; one assignment owner with tests | SD author through sd-definition |
| Body sizing without the extra row | later_sd | open | Smallest reserve without a scrollbar, confirmed live | SD author through sd-definition |
| Host probe and test scenarios | later_tp | open | Probe the answer text at `turn.complete` early; map every criterion and SD decision to evidence | TP author through gate-check |

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

- Ziel: Ohne etwas zu tun den Run sehen, an dem der Chat arbeitet, bei Bedarf andere Runs ansehen und sofort zurückfinden, und auf einen Blick sehen, wann dieser Run auf dich wartet.
- Umfang: Der eingeschaltete AGDF Companion erkennt den Chat-Run aus Prompt und Antwort der Haupt-Turns, neben „in dieser Sitzung geändert“; er folgt ihm, erlaubt Blättern auch von ihm aus, springt beim nächsten Haupt-Turn automatisch zurück und bietet „Zurück zum Chat-Run“ im Panel und im Fußzeilenmenü; „wartet auf Freigabe“ und „wartet auf Entscheidung“ gehen der Turn-Anzeige vor, sodass Panel und Statuszeile übereinstimmen; die Fußzeile sitzt ohne Leerzeile am unteren Rand. Als gelieferte Grundlage mit Nachweisen übernimmt der Run die Panel-Änderungen aus `3444befe` und `2f54fbcc` (umrandete Fußzeile mit Icon, App-Auswahlmenü und Lesestand, About mit Link auf agdf.iself.eu, Runliste nach Panelhöhe mit „+ N weitere“, Gate-Leiste neben jedem Run bei genug Breite). Er bleibt rein lesend, ohne neuen Hook und nur für Claude.
- AC-001: Nennt ein Haupt-Turn in Prompt oder Antwort die ID eines offenen Runs als ganzes Wort, wird er Chat-Run; bei mehreren zählt der zuletzt genannte, die Antwort nach dem Prompt; eine ID innerhalb einer längeren ID, ein abgeschlossener Run, ein Text ohne offenen Run und ein Subagent-Turn ändern nichts; der jüngere Hinweis von Nennung und Änderung gewinnt.
- AC-002: Ist ein Chat-Run bekannt, zeigt das Panel ihn statt der gespeicherten Auswahl, mit Herkunft „Im Chat genannt“ oder „In dieser Sitzung geändert“.
- AC-003: Auch beim Chat-Run gibt es „Vorheriger Run“ und „Nächster Run“; ein geblätterter oder aus der Liste gewählter Run erscheint mit „Von dir ausgewählt“, bleibt bis zum nächsten Haupt-Turn oder Rücksprung und wird wie heute als Auswahl gespeichert.
- AC-004: Der Start des nächsten Haupt-Turns zeigt wieder den Chat-Run; ein Subagent-Turn ändert nichts; ohne Chat-Run bleibt der geblätterte Run.
- AC-005: „Zurück zum Chat-Run“ erscheint als schlichter Button unter den Blätter-Buttons und als Eintrag im Fußzeilenmenü, nur solange ein anderer Run als der bekannte Chat-Run gezeigt wird, und führt mit einem Klick zurück.
- AC-006: Beim Blättern bleiben Statuszeile und Meldungen beim Chat-Run, etwa `AGDF · UR · wartet`; ohne Chat-Run folgen sie wie heute dem gezeigten Run.
- AC-007: Während eines Haupt-Turns zeigen wartende Runs „wartet auf Freigabe“ oder „wartet auf Entscheidung“, ein bauender Run „baut“, blockierte und laufende Runs die Anzeige „läuft · Claude arbeitet gerade an diesem Turn“; Panel und Statuszeile nennen für wartende Runs denselben Zustand.
- AC-008: Im Desktop trifft die Unterkante der Fußzeile den Panelrand ohne zusätzliche Leerzeile und ohne Scrollleiste, schmal wie verbreitert; längerer Inhalt scrollt mit der Fußzeile am Ende.
- AC-009: Die Panel-Änderungen aus `3444befe` und `2f54fbcc` gelten als gelieferte Grundlage: umrandete Fußzeile mit Icon, Auswahlmenü „AGDF Companion“ (auf Mobile Button mit Einträgen) und Lesestand, About mit Zweck, Plugin-Version und Link, Runliste nach Panelhöhe mit „+ N weitere“, Gate-Leiste neben jedem Run bei genug Breite; belegt durch die Suiten und die Live-Screenshots vom 2026-10-28.
- AC-010: Kein Element gibt frei, lehnt ab, setzt fort oder wählt einen Lieferrun; der Rücksprung ändert nur die Anzeige; die Run-Dateien bleiben im Testfenster byteidentisch.
- AC-011: Begleiter-Suiten, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record` und `npm run compatibility:check` bestehen; ein Live-Test in der Desktop-App unter Windows zeigt Erkennung, automatischen Rücksprung, Rücksprung-Button, „wartet“ während eines Turns und die Fußzeile am Rand.
- AC-012: `INSTALL.md` beschreibt, welchen Run der Begleiter zeigt (Chat-Run, Blättern, Rücksprung, gespeicherte Auswahl), die Warteregel und das Panel vom 2026-10-28, getrennt nach automatischen, nativen und Live-Nachweisen.
- Entscheidungen: Aus UR und UX-Intent übernommen und mit dieser Freigabe festgelegt: Der jüngere Hinweis von Nennung und Änderung bestimmt den Chat-Run, Blättern gilt bis zum nächsten Haupt-Turn oder Rücksprung, ohne Chat-Run gilt die gespeicherte Auswahl; der Chat-Run gilt nur für die Session; Statuszeile und Meldungen folgen beim Blättern dem Chat-Run; nur „wartet“ und „baut“ gehen der Turn-Anzeige vor, „blockiert“ nicht; der Rücksprung heißt „Zurück zum Chat-Run“ und steht unter den Blätter-Buttons und im Fußzeilenmenü. Offen für das SD bleiben Erkennungsregel, Erweiterung der Zuordnung und Höhenbemessung, für den TP die frühe Host-Probe des Antworttexts.
