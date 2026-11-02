# PRD: AGDF Companion Follow-up: Build Phase, Mode Paths, Notifications and Status Line

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-27
Owner: Arndt Gold
Run: agdf-companion-followup-20261027-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

The opt-in AGDF Companion for Claude Code (command `/agdf-companion`, delivered by run `agdf-begleiter-companion-20261025-01`) gains, while switched on:

- a `CD+Tests` mark in the gate bar of structured runs and a build state "baut" / "building" with its own figure variant during Brownfield Analysis, CD+Tests and CR;
- a gate bar that follows the status card's path for the run's mode (structured, verified change, quick task, block, undecided);
- a short toast when the shown run switches to "waiting for approval" or "blocked", optionally with a soft sound, both switchable in the panel;
- a compact entry in Claude's status line, also with the pane closed and in the terminal;
- one brand name, "AGDF Companion", in every language;
- no objective line for template placeholder objectives, and a language fallback to Claude's own language setting in folders without `.agdf/control`.

The companion stays display-only: it reads run state, never writes control state, never requests or records approvals and never continues a run. Toast and status line carry no action. It stays wired only through the Claude projection, and a companion failure never impairs AGDF control functions.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready — `.agdf/control/artefacts/agdf-companion-followup-20261027-01/UX_INTENT_DEFINITION.md` (recorded 2026-10-27, revision 5)
- primary_user_intent: While AGDF delivery runs in Claude Code, know without asking and without watching the panel that the session's run is being built, waits for an approval or is blocked, and see where it stands on the path its mode actually has.
- success_signal: With the companion switched on, the user notices a switch of the shown run to "waiting for approval" or "blocked" within one refresh through a single toast, reads gate and state from the status line with the pane closed, sees the build phase during Brownfield Analysis, CD+Tests and CR, and never sees gates a run's mode does not have.
- primary_decision_or_action: Switch the companion on or off with `/agdf-companion`; switch toasts and their sound on or off in the panel. Run decisions stay with the presented version in chat.

No preview is required by the approved UR. The UX analysis is agent inspection of the delivered companion, its approved UX intent and the live recheck of 2026-10-26/27; the behaviour below is proposed product behaviour, not yet observed.

## 3. Working Modes And Effective State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Off | No pane, no toast, no status line; default after installation | `/agdf-companion` available | User choice | Claude command list |
| On, pane shown | Run-derived state of the shown run: fertig, blockiert, wartet auf Freigabe, baut (structured run at Brownfield Analysis, CD+Tests or CR, neither blocked nor waiting), läuft; during an active turn läuft, or baut in a build phase | Figure incl. build variant, state label, reason, per-mode gate bar incl. CD+Tests mark, run identity, origin, objective (hidden when a placeholder), next step, read time, switches for motion, toast and sound, retry | AGDF control (`RUN_STATE.md` via canonical writers; mode from the Mode/Slice Decision as the status card reads it); turn activity from the Claude host; switches from the user | Side panel |
| On, pane closed by the person | Same run-derived state; pane hidden for this session | Toast on transitions; status-line entry | As above | Status line; toast |
| On, terminal surface | Same effective state | Text fallback with the build face `(o_o) ⚒` in build phases; status line under the prompt; toast on the notification line | As above | Pane text fallback; status line |
| On, no run assigned or no control | Neutral; no toast | Existing neutral panel; status line `AGDF · bereit` / `AGDF · idle` | User selection pending or AGDF control absent | Side panel; status line |
| On, status unreadable | Neutral with reason; last good state kept on transient failure; no toast | Existing unreadable panel with retry; status line `AGDF · nicht lesbar` / `AGDF · unreadable` | AGDF control readability | Side panel; status line |
| Host draws no toast, status line or sound | Companion otherwise unchanged | Nothing for the missing channel; no error | Claude host | Side panel |

The AGDF status card and approval cards in chat remain the authoritative gate presentation; panel, status line and toast are secondary, glanceable views.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: `/agdf-companion` switches the companion on (pane, status line, toasts) and off (all three, status line cleared). A person's close of the pane hides only the pane for the session; status line and toasts continue while the companion is on. Toasts are on and sound off by default; the panel switches "Meldung aus/an" and "Ton an/aus" (en "Notices off/on", "Sound on/off") change them, and both choices persist across sessions. The sound plays only together with a toast.
- blockers_and_visible_next_actions:
  - No AGDF control in the project: existing message; neutral status line; no toast.
  - Run state unreadable: existing message with "Neu lesen" / "Read again"; status line reads unreadable; no toast.
  - Host without toast, status line or audio player: the missing channel stays silent; panel and other channels are unchanged.
  - Incompatible host or changed mod API: the companion stays unavailable; AGDF control functions keep working.
- recovery_paths: "Neu lesen" re-reads at once and updates panel and status line. A transient read failure keeps the last good state and raises no toast. `/agdf-companion` brings a hidden pane back. Switching off and on starts a fresh baseline without a toast for the state found.
- relevant_state_transitions:
  - Toast: the shown run's run-derived state enters wartet auf Freigabe or blockiert from another state, or stays in one of them while its gate or decision changes.
  - No toast: first successful read after switching on or session start (baseline); change of the shown run by assignment or stepping (new baseline); repeated equal reads; turn overlay; transient read failure; companion off.
  - Gate bar: TP done and CD+Tests current when a structured run enters Brownfield Analysis; CD+Tests done when it reaches QA.
  - Status line: updated on every applied read and on switching on or off; never by the turn overlay.

## 5. Acceptance Criteria

### CD+Tests mark in the gate bar

- criterion_id: AC-001
- working_mode: On, pane shown / terminal surface
- source_state: A structured run (`structured_delivery` or `structured_slice`) at Brownfield Analysis, CD+Tests or CR; another at QA or later; another completed.
- action: Show each run in the companion at the default panel width and below it.
- expected_effective_state: The bar reads `UR PRD SD TP CD+Tests QA UAT OR`; CD+Tests is current in the three build phases and done from QA on and for completed runs.
- visible_feedback: For example `✓UR ✓PRD ✓SD ✓TP ●CD+Tests ○QA ○UAT ○OR` (39 columns); below the full width the condensed form keeps every mark and names the current one.
- blocker_failure_behavior: An unknown current gate leaves no mark current rather than guessing.
- recovery_next_action: none; the bar follows the next read.
- observable_success: The full structured bar fits 40 columns and the build phases are visible on it.
- required_evidence: Automated rendering tests per phase and width; live screenshot of a run in a build phase.

### Build state

- criterion_id: AC-002
- working_mode: On, pane shown / terminal surface
- source_state: A structured run at Brownfield Analysis, CD+Tests or CR that is neither blocked nor waiting for an approval or decision; with and without an active main-loop turn.
- action: Show the run; switch motion off; show it in the terminal.
- expected_effective_state: The state is baut / building, also during an active turn; blockiert and wartet keep precedence; outside the build phases läuft is unchanged.
- visible_feedback: Label "baut" / "building", reason "In Arbeit: {gate title}" / "In progress: {gate title}" with the localized gate title (for example "Implementierung und Tests"), a figure with hammer and stacking bricks inside the accessory region, a still pose without any animation element and the terminal face `(o_o) ⚒`.
- blocker_failure_behavior: An unreadable run shows the existing unreadable state, never the build figure.
- recovery_next_action: "Neu lesen" as today.
- observable_success: The build drawing never leaves the accessory region and never covers the figure.
- required_evidence: Accessory-bounds tests, still-pose test, terminal-text test, state-rule tests incl. precedence and turn overlay; live screenshot.

### Gate bar per mode

- criterion_id: AC-003
- working_mode: On, pane shown / terminal surface
- source_state: Runs with Mode/Slice Decision verified change, quick task, block and undecided, active and completed, plus legacy runs with `not_applicable` or `missing` approvals for skipped gates.
- action: Show each run in the companion.
- expected_effective_state: The bar shows exactly the status card's path for the mode (`UR Verified Change OR`, `UR Compact Delivery`, `UR Block`, `UR`) with the status card's done, current and open marks.
- visible_feedback: For example `✓UR ●Compact Delivery` during a quick task and `✓UR ✓Compact Delivery` after it.
- blocker_failure_behavior: A Mode/Slice Decision the status card treats as undecided shows `UR` only.
- recovery_next_action: none; the bar follows the next read.
- observable_success: No quick-task, verified-change or block run shows PRD, SD or TP; marks equal the status card for fixtures of every mode.
- required_evidence: Parity test against the core status-card path for fixtures of every mode; live screenshot of a quick-task run.

### Toast on waiting or blocked

- criterion_id: AC-004
- working_mode: On, pane shown or closed / terminal surface
- source_state: Companion on with toasts on; a shown run whose run-derived state changes between reads.
- action: Let the run enter wartet auf Freigabe or blockiert, change its pending gate or decision, repeat equal reads, run turns, switch runs and switch the companion on.
- expected_effective_state: Exactly one toast per transition into wartet or blockiert or change of its gate or decision; none for the baseline read, run switching, equal reads, turns or transient read failures.
- visible_feedback: A short toast naming the run, the state and the gate, for example "agdf-companion-followup-20261027-01 wartet auf Freigabe: Produktanforderungen" or "… blockiert: Code-Review – Überarbeitung nötig".
- blocker_failure_behavior: A host that draws no toast shows nothing and the companion continues unchanged.
- recovery_next_action: none; the panel and status line still show the state.
- observable_success: The user notices the switch without watching the panel and is never flooded with repeated toasts.
- required_evidence: Transition-detector tests with noisy sequences; live screenshot of a toast on the Windows desktop.

### Toast and sound switches

- criterion_id: AC-005
- working_mode: On, pane shown / terminal surface
- source_state: Companion on after installation or after an upgrade from the delivered companion.
- action: Inspect the defaults; press "Meldung aus/an" and "Ton an/aus"; start a new session; trigger a transition.
- expected_effective_state: Toasts on and sound off by default; each switch changes only its own choice; both choices persist across sessions; the sound plays only together with a toast.
- visible_feedback: Two buttons in a second row below the existing ones, labelled with the action they perform; neither row wraps at the default width.
- blocker_failure_behavior: Where the host cannot play the clip, the toast still appears and no error is shown.
- recovery_next_action: Press the switch again.
- observable_success: A user who wants silence or sound gets it with one press, and the choice survives a restart.
- required_evidence: Persistence and default tests incl. a state file of the delivered companion; live screenshot of the button rows; sound playback reported as observed, including "not audible".

### Status line

- criterion_id: AC-006
- working_mode: On, pane shown or closed / terminal surface; Off
- source_state: Companion on with a shown run in each state; pane closed by the person; companion switched off.
- action: Read the status line on the desktop and in the terminal; close the pane; run turns; switch the companion off.
- expected_effective_state: `AGDF · {gate} · {short state}` for a shown run (for example `AGDF · QA · wartet`, `AGDF · CR · baut`), `AGDF · fertig` for a completed run, `AGDF · bereit` / `AGDF · idle` without a run, `AGDF · nicht lesbar` / `AGDF · unreadable` for an unreadable state; it stays with the pane closed, does not change during turns and is cleared when switched off.
- visible_feedback: One localized line in Claude's status line.
- blocker_failure_behavior: A host that draws no plugin status line shows nothing; panel and toasts are unchanged.
- recovery_next_action: none; it follows the next read.
- observable_success: The user reads the run's gate and state without opening the pane.
- required_evidence: Status-text tests per state and locale; live screenshots with the pane closed on the desktop and, where available, in the terminal.

### Observation only

- criterion_id: AC-007
- working_mode: All modes
- source_state: Companion on with toasts, sound and status line on.
- action: Use every panel control, wait for toasts and status-line updates over a test window.
- expected_effective_state: No element approves, declines, continues or selects a delivery run; the only write remains the companion's own state file.
- visible_feedback: Toast and status line carry text only, no buttons.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: Run state files stay byte-identical over the test window.
- required_evidence: Automated write-surface test; byte-identity check in the live test.

### One brand name

- criterion_id: AC-008
- working_mode: All modes
- source_state: German and English chat language.
- action: Open the panel, run `/agdf-companion` on and off, read error lines and `INSTALL.md`.
- expected_effective_state: The companion is called "AGDF Companion" in every language; the command stays `/agdf-companion`.
- visible_feedback: Pane title, command replies (for example "AGDF Companion eingeschaltet."), toasts and documentation use the name.
- blocker_failure_behavior: none
- recovery_next_action: none
- observable_success: No "AGDF-Begleiter" remains in user-visible companion texts or its documentation.
- required_evidence: Localization tests per locale; documentation diff; live screenshot.

### Placeholder objective hidden

- criterion_id: AC-009
- working_mode: On, pane shown / terminal surface
- source_state: A fresh run whose objective is the RUN_STATE template text "Describe the trustworthy outcome." or another value the core treats as a decision-content placeholder.
- action: Show the run.
- expected_effective_state: No objective line; a real objective shows as today.
- visible_feedback: The panel and terminal text omit the objective row.
- blocker_failure_behavior: none
- recovery_next_action: none; the objective appears once the run state carries a real one.
- observable_success: The panel never presents template text as the run's goal.
- required_evidence: Parity test with the core placeholder rule; rendering test.

### Language without control folder

- criterion_id: AC-010
- working_mode: On, no control
- source_state: A folder without `.agdf/control`; Claude's `language` setting is a supported language tag (`de`), a language name (`German`, `Deutsch`), unsupported or absent.
- action: Switch the companion on in that folder.
- expected_effective_state: With control present the AGDF chat language applies as today; without it the companion uses the supported locale named by Claude's `language` setting, else English.
- visible_feedback: Pane, status line and toasts in that language.
- blocker_failure_behavior: An unreadable setting falls back to English.
- recovery_next_action: none
- observable_success: On the owner's machine the panel speaks German in a folder without AGDF control.
- required_evidence: Fallback-order and mapping tests; live screenshot in a folder without control.

### Failure isolation of the new channels

- criterion_id: AC-011
- working_mode: All modes
- source_state: Toast, status-line, audio or settings calls fail or are missing on the host.
- action: Run the companion against a host double whose new calls throw or are absent.
- expected_effective_state: The panel keeps working, the failed channel stays silent, and AGDF dispatch, MCP tools and the SessionStart hook are unaffected as before.
- visible_feedback: No error dialog or broken pane.
- blocker_failure_behavior: Every hook keeps passing its event on.
- recovery_next_action: none
- observable_success: A failing channel never breaks the companion or AGDF.
- required_evidence: Adapter tests with failing host calls.

### Verification, documentation and live evidence

- criterion_id: AC-012
- working_mode: Repository verification and live host
- source_state: The changed companion in the repository and installed from this branch.
- action: Run the companion suites, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` and the verification lanes covering the companion; update `INSTALL.md`; perform the live test in the Claude desktop app on Windows.
- expected_effective_state: All pass; regenerated evidence is reviewed; documentation describes the new behaviour, switches and limits.
- visible_feedback: Documentation separates live, native and automated evidence.
- blocker_failure_behavior: A failing check blocks QA readiness.
- recovery_next_action: Fix and rerun.
- observable_success: Screenshots show the CD+Tests mark, the build figure, a quick-task bar, a toast, the status line with the pane closed, the brand name and the language fallback.
- required_evidence: Verification output; compatibility records; documentation diff; dated live screenshots.

## 6. Non-Goals

- No change to the core status card; a CD+Tests mark there is a separate core change for all hosts.
- No change to AGDF control behaviour: contracts, dispatcher, MCP server, SessionStart hook and the `RUN_STATE.md` format keep their behaviour.
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion, its toast or its status line.
- No native operating-system notification (`$.ui.notify`) and no spoken output.
- No build variant for compact execution phases (Compact Delivery, Verified Change); their mark shows the phase.
- No companion, toast or status line for Codex, Copilot or OpenCode.
- Later candidates, not in this run: run timeline, recognition of long checks such as `verify:ci`, cleanup hint for long-untouched runs, completion animation at OR.
- No public plugin directory submission, npm publication or release; delivery ends with a pull request from this run's feature branch, without merge.

## 7. Users And Roles

The AGDF maintainer working in Claude Code on Windows, mainly in the Code tab of the Claude desktop app and secondarily in the terminal; product owner and human approver of gates. Other Claude users of the AGDF plugin who switched the companion on receive the new behaviour with toasts on and sound off; users who never switched it on see no change. Codex and Copilot users are affected only in that their behaviour must remain unchanged.

## 8. Constraints

- The Claude Code mod API is early access (Claude Code 2.1.308 at analysis time); `$.audio.play` is declared silent in Linux and Windows terminals.
- The companion stays wired only through its existing Claude descriptor; manifest, shared definition, shared hooks and the Copilot payload stay unchanged.
- The companion cannot import core code; any mirrored rule (mode path, mode reader, placeholder rule) needs a parity test against the core.
- Changes to the plugin payload trigger regeneration and review of compatibility records, and of payload budgets and evaluation fingerprints where they change.
- The desktop draws a Button's label while `claude plugin test` draws its children; layout is accepted only from live evidence.
- Refresh while the pane is hidden must stay bounded (today 30 s and after each turn).

## 9. Evidence Requirements

- Automated tests for build state, CD+Tests mark and widths, per-mode paths with core parity, transition detector, switches and persistence incl. upgrade from the delivered state file, status-line texts, brand name, placeholder rule with core parity, language fallback, failing host channels and the write surface.
- Native evidence where Claude Code is available: `claude plugin validate` and `claude plugin test`.
- Regenerated plugin and compatibility records, reviewed.
- One dated live observation in the Claude desktop Code tab on Windows with screenshots of: a build-phase run with the CD+Tests mark and build figure, a quick-task bar, a toast, the status line with the pane closed, the brand name, a folder without control in German, and the sound result as observed.
- Documentation diff of `INSTALL.md` separating live, native and automated evidence.

## 10. Risks And Open Questions

- Toast, status line and sound are not yet observed on the Windows desktop; the TP probes them early and AC-004 to AC-006 accept a missing channel only as observed and documented.
- Mirroring the status-card path and the mode reader risks drift; the SD binds both by parity tests.
- Notification noise depends on the transition detector; the SD defines it on the run-derived state.
- Continuing the refresh while the pane is hidden costs reads; the SD keeps the cadence bounded.
- The early-access mod API may change; failure isolation (AC-011) keeps AGDF untouched.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Brand name | before_prd | resolved | "AGDF Companion" in every language; command `/agdf-companion` unchanged; "Compagnon" rejected (owner decision 2026-10-27) | Arndt Gold, PRD Owner |
| Toast and sound defaults | before_prd | resolved | Toasts on, sound off; both switchable in the panel and persisted (owner decision 2026-10-27) | Arndt Gold, PRD Owner |
| Observation only | before_prd | resolved | No approval button or action in toast, status line or panel (owner decision 2026-10-27) | Arndt Gold, PRD Owner |
| Build state | before_prd | resolved | Fifth state label baut / building in the structured build phases, below blockiert and wartet and above the turn overlay; derived from UR scope item 2 and the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Status line and toast basis | before_prd | resolved | Both follow the run-derived state, never the turn overlay, and continue while the pane is closed by the person; derived from UR scope items 4 and 5 and the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Sound coupling and switch placement | before_prd | resolved | Sound only together with a toast; switches in a second button row; derived from the UX intent, adopted with this PRD | Arndt Gold, PRD Owner |
| Language fallback | before_prd | resolved | AGDF chat language where control exists, else Claude's `language` setting when it names a supported locale, else English; derived from UR scope item 7, adopted with this PRD | Arndt Gold, PRD Owner |
| Mode reader, per-mode path and placeholder rule with core parity | later_sd | open | Mirror the core rules with parity tests; no second interpretation | SD author through sd-definition |
| Transition detector, hidden-pane refresh and state-file extension | later_sd | open | Within the approved behaviour; additive state-file fields with defaults | SD author through sd-definition |
| Sound source and payload effect | later_sd | open | Smallest payload effect; silent where no player exists | SD author through sd-definition |
| Early host probe and test scenarios | later_tp | open | Probe toast, status line and sound on the Windows desktop early; map every criterion and SD decision to evidence | TP author through gate-check |

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

- Ziel: Während AGDF in Claude Code läuft, ohne Nachfragen und ohne Blick ins Panel merken, dass der Run der Session gebaut wird, auf eine Freigabe wartet oder blockiert ist, und sehen, wo er auf dem Pfad seines Modus steht.
- Umfang: Der eingeschaltete AGDF Companion zeigt in strukturierten Runs eine Marke `CD+Tests` und während Brownfield Analysis, CD+Tests und CR den Zustand „baut“ mit Hammer-und-Ziegel-Figur; die Gate-Leiste folgt dem Pfad der Statuskarte je Modus; beim Wechsel des gezeigten Runs auf „wartet auf Freigabe“ oder „blockiert“ erscheint eine kurze Meldung, optional mit leisem Ton, beides im Panel schaltbar; die Claude-Statuszeile zeigt einen knappen Eintrag auch bei geschlossenem Panel und im Terminal; überall gilt der Name „AGDF Companion“; Vorlagenziele werden ausgeblendet, und ohne `.agdf/control` gilt Claudes Spracheinstellung. Der Begleiter bleibt rein lesend, ohne Aktion in Meldung oder Statuszeile, nur für Claude und fehlerisoliert.
- AC-001: Ein strukturierter Run bei Brownfield Analysis, CD+Tests oder CR zeigt `✓TP ●CD+Tests ○QA`, ab QA und nach Abschluss `✓CD+Tests`; die volle Leiste passt in 40 Spalten (39 im Beispiel), darunter gilt die Kurzform.
- AC-002: In diesen Phasen heißt der Zustand „baut“ mit Begründung „In Arbeit: {Gate-Titel}“, die Figur zeigt Hammer und Ziegel nur im Zubehörbereich, das Standbild hat keine Animation, das Terminal zeigt `(o_o) ⚒`; auch während eines Turns bleibt es „baut“, „blockiert“ und „wartet“ haben Vorrang.
- AC-003: Verified-Change-, Quick-Task-, Block- und unentschiedene Runs zeigen genau den Pfad und die Marken der Statuskarte, etwa `✓UR ●Compact Delivery`; kein solcher Run zeigt PRD, SD oder TP; ein Paritätstest gegen den Kern belegt das je Modus.
- AC-004: Ein Wechsel des gezeigten Runs auf „wartet“ oder „blockiert“ oder ein Wechsel von dessen Gate oder Entscheidung löst genau eine Meldung mit Run, Zustand und Gate aus; erstes Lesen, Run-Wechsel, gleiche Lesungen, Turns und kurzzeitige Lesefehler lösen keine aus.
- AC-005: Meldung an und Ton aus sind Voreinstellung; „Meldung aus/an“ und „Ton an/aus“ in einer zweiten Knopfreihe schalten sie, beides bleibt über Sessions erhalten, der Ton spielt nur mit einer Meldung, und keine Reihe bricht bei Standardbreite um; die Tonwiedergabe wird berichtet, wie beobachtet.
- AC-006: Eingeschaltet zeigt die Statuszeile `AGDF · {Gate} · {Kurzzustand}` wie `AGDF · QA · wartet` oder `AGDF · CR · baut`, sonst `AGDF · fertig`, `AGDF · bereit` oder `AGDF · nicht lesbar`; sie bleibt bei geschlossenem Panel, ändert sich nicht durch Turns und verschwindet beim Ausschalten.
- AC-007: Kein Element gibt frei, lehnt ab, setzt fort oder wählt einen Lieferrun; Meldung und Statuszeile sind reiner Text; die Run-Dateien bleiben im Testfenster byteidentisch.
- AC-008: Alle Sprachen zeigen „AGDF Companion“ in Titel, Befehlsantworten, Meldungen und `INSTALL.md`; der Befehl bleibt `/agdf-companion`.
- AC-009: Ein Ziel, das der Kern als Vorlagen-Platzhalter wertet, etwa „Describe the trustworthy outcome.“, erscheint nicht; echte Ziele erscheinen wie bisher.
- AC-010: Ohne `.agdf/control` spricht der Begleiter die unterstützte Sprache aus Claudes Einstellung `language` (Tag wie `de` oder Name wie `German` oder `Deutsch`), sonst Englisch; mit Kontrollordner gilt weiter die AGDF-Chat-Sprache.
- AC-011: Scheitern oder fehlen Meldung, Statuszeile, Ton oder Einstellungslesen, arbeitet das Panel weiter, der betroffene Kanal bleibt stumm, und AGDF-Dispatch, MCP-Werkzeuge und SessionStart-Hook bleiben unberührt.
- AC-012: Begleiter-Suiten, `claude plugin validate`, `claude plugin test`, `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` und die Verifikations-Lanes bestehen; `INSTALL.md` beschreibt Verhalten, Schalter und Grenzen; ein Live-Test in der Desktop-App unter Windows belegt alles mit datierten Screenshots.
- Entscheidungen: Nach deinen Entscheidungen vom 2026-10-27 heißt der Begleiter überall „AGDF Companion“, Meldung an und Ton aus sind Voreinstellung, und es gibt keinen Freigabe-Button. Aus UR und UX-Intent übernommen und mit dieser Freigabe festgelegt: „baut“ als fünfter Zustand unter „blockiert“ und „wartet“, Meldung und Statuszeile folgen dem Run-Zustand ohne Turn-Overlay und laufen bei geschlossenem Panel weiter, der Ton spielt nur mit einer Meldung, die Schalter stehen in einer zweiten Knopfreihe, und ohne Kontrollordner gilt Claudes Spracheinstellung vor Englisch. Spiegelung der Kernregeln mit Paritätstests, Übergangserkennung, Neulesen bei verborgenem Panel, Zustandsdatei und Tonquelle entscheidet die SD; die frühe Host-Probe für Meldung, Statuszeile und Ton legt der TP fest.
