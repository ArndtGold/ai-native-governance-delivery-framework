# PRD: Single Core reader for the companion event journal

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one reader of the companion event journal and let both companions consume it.

- **Core reader for a project root.** The Core journal reader returns the companion events of one project root, optionally narrowed to one run. It keeps the existing read rules: a read bound of twice the writer's journal bound, the current file read before the rotation file, an oversized or unreadable rotation file skipped, the unchanged-file cache and the file identity check after opening on Windows. Root matching recognizes another spelling of the same directory (junction, symlink, subst drive, drive-letter case).
- **Events through the run view.** The read-only `run-view` command, which the Claude companion already calls, returns the event history of the project root beside the runs when it is given the companion data root. Without that input it returns exactly what it returns today.
- **Claude companion.** The Claude companion keeps its cheap change detection (journal size and modification time) and its event handling (cursor, toasts, confirmation of durable facts, sticky uncertain events), but takes the events from the run view instead of parsing the journal itself. The journal parser, the root normalization and the read bound of the Claude template are removed where nothing else needs them.
- **Aligned semantics.** The Codex companion card shows `approval_recorded` and `run_completed` only when the run detail confirms them and keeps `effect_unknown` and `recovery_required` visible while they are still uncertain. The Claude pane shows the date for events of an earlier day.
- **Contract test.** One test runs the Core reader on shared journal fixtures and checks both consumers.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics (Brownfield Review: two bounded visible changes adopt rules that already exist in the other companion; no UX Intent Definition required)
- primary_user_intent: As a project owner I see the same AGDF events in the Claude companion and in the Codex companion card, and neither shows an event as final before the run state confirms it.
- success_signal: For the same journal both companions list the same events of the shown project or run (apart from the intended difference of scope and the five-line limit); an approval or completion appears only once the run state shows it; an uncertain outcome does not scroll away while it is still uncertain; an event of an earlier day is recognizable as such.
- primary_decision_or_action: not_applicable. The companions only inform; the owner acts in the chat as before. No new action, button or decision is introduced.

No UI preview was required by the UR or created; the behaviour below is specified in text.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 Claude companion on (pane, status line, toasts) | Run state and recent events of the current project root, read together through one run-view call | event lines in the pane (up to five), event toasts, "events unavailable" hint | canonical run state through the Core run view; events through the Core journal reader | Claude companion pane and toasts |
| M2 Codex Cockpit with the companion card of a selected run | Run detail of the selected run and its recent events | event list in the card (up to five), "events unavailable" message | canonical run detail through the Cockpit read; events through the same Core journal reader | Codex companion card |
| M3 companion off, or no companion data root known | No events are read or shown (unchanged) | none | not_applicable | none |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Unchanged. The Claude companion reads events while it is switched on; the Codex card shows events while a current reading of the selected run is shown. Without a companion data root no events are read (as today).
- blockers_and_visible_next_actions: None are introduced. A journal that cannot be read shows the existing "events unavailable" text in both companions; the run state is still shown.
- recovery_paths: A failed or incomplete run-view read keeps the last good run state marked stale (unchanged) and retries on the next journal change or wake-up; an unreadable journal becomes readable again without user action on the next change; an oversized rotation file is skipped while the current file is still read.
- relevant_state_transitions:
  - Journal changes (new line or rotation) -> Claude companion detects the changed size or time -> one run-view read returns run state and events -> fresh events of this root become pane lines and, for the toast kinds, toasts; durable facts wait for confirmation by that same run state.
  - Journal unchanged -> no run-view read is started for events.
  - Run records a later operation after an uncertain outcome -> the uncertain event is no longer held as uncertain (Claude: leaves the pane; Codex: becomes an ordinary history entry).
  - Run detail confirms an approval or completion -> the matching event becomes visible in the Codex card.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: The journal line format is parsed only by Core. The Claude companion templates contain no journal parser, no root normalization and no journal read bound of their own, and they read no journal file content.
  - required_evidence: Contract test assertion over the shipped template sources and the removed exports; code review of the diff.

- criterion_id: AC-002
  - observable_success: For a project root the Core reader returns the valid events of that root in journal order, each event once. With a run id it returns only that run's events. It skips cut, malformed and foreign lines and events of other roots, matches another spelling of the same root (junction or symlink alias, drive-letter case), returns "unavailable" for a current file above the read bound, skips an oversized or unreadable rotation file while still returning the current file's events, and reads the rotation file's older events before the current file's.
  - required_evidence: Contract test on shared journal fixtures covering each case named here.

- criterion_id: AC-003
  - observable_success: `run-view` given the companion data root returns the bounded event history of the project root beside the runs, with the state "available" (also for a missing journal, then empty) or "unavailable". `run-view` without that input returns the same output as before this change.
  - required_evidence: run-view command test with and without the data root; existing run-view and parity tests unchanged.

- criterion_id: AC-004
  - working_mode: M1
  - source_state: Claude companion on, previous journal stamp known
  - trigger: A line is appended to the journal or the journal rotates
  - expected_effective_state: Exactly one run-view read supplies run state and events; the cursor advances to the newest event read
  - visible_feedback: Fresh events of this root appear as pane lines and, for approval requested, effect unknown, recovery required and run completed, as toasts, as they do today; approval recorded and run completed only once the same run state confirms them
  - failure_behavior: An unavailable event history shows "events unavailable"; a failed run-view read keeps the last good state marked stale
  - recovery: The next journal change or wake-up reads again
  - observable_success: The Claude companion shows the same toasts and pane lines as before for the same journal changes, including the first read as a baseline without toasts and a rotation between two reads; an unchanged journal starts no run-view read for events
  - required_evidence: Claude companion adapter tests on the journal poll flow driven through a run view that carries the events.

- criterion_id: AC-005
  - working_mode: M1
  - source_state: Claude pane shows events
  - trigger: An event from an earlier calendar day is among the pane lines
  - expected_effective_state: unchanged event list
  - visible_feedback: The line shows the date and time of the event; an event of today shows the time only
  - failure_behavior: An event without a readable time shows no time, as today
  - recovery: not_applicable
  - observable_success: German pane: "26.11. 14:05" for an earlier day of this year and "26.11.2025 14:05" for an earlier year, the same text the Codex card shows; English pane: "2026-11-26 14:05"; today's events: "14:05"
  - required_evidence: Unit test of the shared time text in both languages and a pane view test.

- criterion_id: AC-006
  - working_mode: M2
  - source_state: Codex card shows the selected run with its event history
  - trigger: The history contains approval recorded or run completed
  - expected_effective_state: The event is shown only when the run detail confirms it: approval recorded when the run's gate path shows that gate fulfilled, run completed when the run's lifecycle is completed
  - visible_feedback: Unconfirmed events of these two kinds are not listed
  - failure_behavior: A run detail without a gate path confirms no approval
  - recovery: The next freshness read with a confirming detail lists the event
  - observable_success: The card lists a recorded approval or completion only when the same rule as in the Claude companion confirms it
  - required_evidence: control-ui test with confirming and non-confirming run details.

- criterion_id: AC-007
  - working_mode: M2
  - source_state: Codex card shows the selected run with its event history
  - trigger: The history contains effect unknown or recovery required, and newer events follow
  - expected_effective_state: While the run recorded no later operation than the uncertain event, the event stays in the card's list even when five newer events exist; afterwards it is an ordinary history entry
  - visible_feedback: The uncertain event remains visible with its time
  - failure_behavior: A run detail without a last-operation time keeps the event as uncertain
  - recovery: not_applicable
  - observable_success: The card keeps a still-uncertain outcome visible by the same rule as the Claude companion's sticky kinds
  - required_evidence: control-ui test with more than five newer events before and after a later recorded operation.

- criterion_id: AC-008
  - observable_success: For the same journal fixtures the events the Claude companion receives through run-view and the events the Codex Cockpit observation reports for a run are the same events (id, kind, gate, reason, time), apart from the intended difference of scope (all runs of the root versus the selected run) and count.
  - required_evidence: The contract test runs both consumers on the shared fixtures and compares their events.

- criterion_id: AC-009
  - observable_success: `packages/core/test/cockpit-session-test.js`, `packages/cli/scripts/claude-companion-test.js` with the companion adapter suites, the control-ui vitest suite and `npm run compatibility:check` pass; the contract text change chain for `plugins/agdf` is completed.
  - required_evidence: Recorded command output of these suites in the run evidence.

## 6. Non-Goals

- No change to the journal writer, its line format `companion-event/1`, its bound or its rotation.
- No change to push (Claude toasts) versus pull (Codex freshness read), or to the scope of all runs of a root (Claude) versus the selected run (Codex).
- No build-time generated copy of the reader in the host templates.
- No change to gate rules, the status card, the gate-check evaluator or the set of event kinds.
- No new companion action, setting or text catalog entry beyond what the date display needs.
- No merge of PR #84 or PR #85.

## 7. Users And Roles

- Project owner using the Claude companion or the Codex Cockpit: sees the events; decides nothing new.
- Maintainers of Core, the `run-view` command and both companions: own the single reader and its contract test.
- Product owner and decider for this run: Arndt Gold.

## 8. Constraints

- The Claude companion template imports no Core module and runs with the host's `$.fs` and `$.process` only; it reaches Core only through the plugin runtime's read-only commands.
- `run-view` stays read-only and keeps its existing output for callers that do not pass the companion data root.
- The journal stays a notification channel; the run state stays the source of truth for approvals and completion.
- Output stays bounded: the event history in `run-view` and in the Cockpit response has explicit count and byte limits.
- Windows paths (drive letters, junctions, subst drives) must match like the realpath the MCP server resolves.
- Changes under `plugins/agdf` follow the contract text change chain (Copilot payload baseline, eval fingerprints, `npm run build:prepare`, `npm run compatibility:record`).

## 9. Evidence Requirements

- Contract test over shared journal fixtures for the reader and both consumers (AC-001, AC-002, AC-008).
- run-view command test with and without the companion data root (AC-003).
- Claude companion adapter tests for the poll flow, toasts, confirmation, sticky events and the date text (AC-004, AC-005).
- control-ui tests for the Codex card selection rules (AC-006, AC-007).
- Output of the regression suites and `npm run compatibility:check` (AC-009).

## 10. Risks And Open Questions

- Each journal change, also from another project root, now starts one run-view read in the Claude companion (about 1.6 s on this repository, in the background); accepted by the owner on 2026-11-27.
- A project root that no longer exists matches only by its exact spelling; acceptable because such a root has no companion session.
- Review facts carry previews of up to 4 KiB; the SD bounds what the history carries.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Route for the Claude companion to obtain events from Core | before_prd | resolved | Through the existing read-only `run-view` command; no build-time generated module and no separate journal command (owner decision 2026-11-27) | Arndt Gold |
| Codex card rule for uncertain outcomes | before_prd | resolved | A still-uncertain effect unknown or recovery required event stays listed beyond the five newest until the run records a later operation, then it is an ordinary history entry (UR scope item 4) | Arndt Gold |
| Date text for events of an earlier day | before_prd | resolved | German: day and month as in the Codex card ("26.11. 14:05", with the year for an earlier year); English: ISO date ("2026-11-26 14:05"); today's events keep the time only | Arndt Gold |
| How `run-view` receives the companion data root, the event count and byte limits, and whether the additive field keeps `run-view/1` | later_sd | deferred | Decided in the SD within the constraints of section 8 | SD author (sd-definition) |
| Which run-detail field gives the Codex card the time of the run's last operation | later_sd | deferred | Decided in the SD | SD author (sd-definition) |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and
the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`

The approval confirms the specified behavior, scope and criteria and permits the existing SD step.

## AGDF Approval Summary (de; source=en)

- Ziel: Das Companion-Ereignisjournal wird nur noch vom Core-Leser gelesen; der Claude-Begleiter bekommt die Ereignisse seines Projekt-Roots über `run-view`, und beide Begleiter zeigen für dasselbe Journal dieselben Ereignisse.
- Umfang: Core-Leser für einen Projekt-Root (optional einen Run) mit den bisherigen Leseregeln und Alias-/Laufwerksbuchstaben-Erkennung; `run-view` liefert mit der Companion-Datenwurzel die Ereignishistorie des Roots, ohne sie unverändert; der Claude-Begleiter behält Änderungserkennung, Cursor, Toasts, Bestätigung und haftende Ereignisse, parst das Journal aber nicht mehr selbst; die Codex-Karte zeigt erfasste Freigaben und Abschlüsse nur bestätigt und hält unsichere Ergebnisse sichtbar; die Claude-Pane datiert Ereignisse früherer Tage; ein Contract-Test prüft Leser und beide Verbraucher auf gemeinsamen Fixtures.
- AC-001: Nur Core parst das Journalformat; die Claude-Templates enthalten keinen eigenen Parser, keine Root-Normalisierung und keine eigene Lesegrenze.
- AC-002: Der Core-Leser liefert die gültigen Ereignisse eines Roots (optional eines Runs) einmalig in Journalreihenfolge, überspringt kaputte, fremde und fremd-rootige Zeilen, erkennt Alias-Schreibweisen und Laufwerksbuchstaben-Groß-/Kleinschreibung, meldet eine zu große aktuelle Datei als nicht verfügbar und überspringt eine zu große oder unlesbare Rotationsdatei.
- AC-003: `run-view` mit Companion-Datenwurzel liefert die begrenzte Ereignishistorie des Roots als verfügbar oder nicht verfügbar; ohne Datenwurzel bleibt die Ausgabe wie bisher.
- AC-004: Bei einer Journaländerung liefert genau ein `run-view`-Lesevorgang Run-Zustand und Ereignisse; Toasts und Pane-Zeilen bleiben wie bisher (Baseline ohne Toast, Rotation, Bestätigung dauerhafter Fakten); ohne Journaländerung startet kein `run-view` für Ereignisse.
- AC-005: Die Claude-Pane zeigt bei Ereignissen früherer Tage Datum und Uhrzeit (Deutsch „26.11. 14:05“, mit Jahr bei früherem Jahr; Englisch „2026-11-26 14:05“), bei heutigen nur die Uhrzeit.
- AC-006: Die Codex-Karte zeigt „Freigabe erfasst“ nur bei erfülltem Gate im Gate-Pfad und „Run abgeschlossen“ nur bei abgeschlossenem Lebenszyklus.
- AC-007: Die Codex-Karte hält „Wirkung unbekannt“ und „Wiederherstellung nötig“ über die fünf neuesten Ereignisse hinaus sichtbar, bis der Run eine spätere Operation erfasst hat.
- AC-008: Für dieselben Fixtures erhalten Claude-Begleiter (über `run-view`) und Codex-Cockpit dieselben Ereignisse, abgesehen von Umfang (alle Runs vs. ausgewählter Run) und Anzahl.
- AC-009: `cockpit-session-test.js`, `claude-companion-test.js` samt Adapter-Suiten, control-ui-vitest und `npm run compatibility:check` laufen durch; die Änderungskette für `plugins/agdf` ist abgeschlossen.
- Entscheidungen: Route über `run-view` (Owner-Entscheid 2026-11-27); unsichere Ergebnisse bleiben in der Codex-Karte sichtbar, bis der Run eine spätere Operation erfasst, danach normale Historie; Datumsformat Deutsch wie Codex-Karte, Englisch ISO; Eingabeform der Datenwurzel, Grenzen, Schema-Version und das Zeitfeld der letzten Operation in der Codex-Run-Ansicht entscheidet das SD.
