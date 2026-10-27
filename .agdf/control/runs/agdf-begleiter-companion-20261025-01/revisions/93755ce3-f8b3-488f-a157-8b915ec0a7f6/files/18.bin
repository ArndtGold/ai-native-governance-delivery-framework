# PRD: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-25
Owner: Arndt Gold
Run: agdf-begleiter-companion-20261025-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

The AGDF plugin for Claude Code ships an opt-in companion named `agdf-companion`. Switched on with `/agdf-companion`, it shows a side panel in the Claude desktop app (titled "AGDF-Begleiter" in German, "AGDF Companion" in English) with an animated figure and a compact status of the run the session works on: state, reason, a single-line gate bar, run identity, objective and next step. It updates after each turn, on demand and on a bounded timer. In the terminal the same panel shows a text fallback. The companion is display-only: it reads run state, never writes control state, never requests or records approvals and never continues a run. It is wired in only through the Claude projection of the AGDF plugin; Codex and Copilot installations of AGDF are unaffected, and a companion failure never impairs AGDF control functions.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready — `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/UX_INTENT_DEFINITION.md` (recorded 2026-10-25, revision 7)
- primary_user_intent: While working with AGDF in Claude Code, see at a glance in which state the session's run is, which gate it is at and what the next step is, without asking the agent.
- success_signal: The user who switched the companion on can tell state, current gate and next step of the session's run from the panel alone, and the panel never presents an unrelated run as the session's run.
- primary_decision_or_action: Switch the companion on or off; when no run is assigned automatically, choose which open run to show.

The UX analysis used the prototype the user saw in a Claude desktop test session on 2026-10-25 and the user's screenshot of it (waiting state; gate bar wrapping; hourglass overlapping the ear; English run texts in a German panel; "1 of 56 open runs" showing the newest open run; objective on three lines). No preview is required by the approved UR; the prototype is reference input only.

## 3. Working Modes And Effective State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Off | Companion not shown and not refreshing; default after installation | None beyond the `/agdf-companion` command being available | User choice | Claude command list |
| On, assigned from this session | Shows the run whose run state changed during the current session; the most recently changed run wins | Figure state, label, reason, gate bar, run identity, objective, next step, origin "from this session", last read time | AGDF control (`RUN_STATE.md` via canonical writers); turn activity from the Claude host | Side panel |
| On, selected by the user | Shows the run the user selected for this project; remembered across sessions | Same as above with origin "selected by you" | AGDF control for the run state; user for the selection | Side panel |
| On, no run assigned | No run changed in this session and no remembered selection | Neutral figure, "Kein Run zugeordnet" / "No run assigned", list of open runs to choose from | User selection pending | Side panel |
| On, status unavailable | No AGDF control in the project, unreadable run state, or no open runs | Neutral figure, specific message, retry where useful; last good state kept with a marker during a transient read failure | AGDF control presence and readability | Side panel |
| Terminal surface | Same effective state as the corresponding mode | Text fallback with state, gate bar and next step instead of the figure | As above | Panel text fallback |
| Host incompatible | Companion cannot load on this Claude host | Companion unavailable; AGDF chat, status card, MCP tools and hooks unchanged | Claude host | None for the companion; AGDF status card in chat remains the authoritative status |

The AGDF status card and approval cards in chat remain the authoritative gate presentation; the companion is a secondary, glanceable view.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: After installation the companion is off. `/agdf-companion` switches it on and opens the panel; running it again switches it off and closes the panel. The choice persists across sessions. Closing the panel by its own control hides it for the current session only.
- blockers_and_visible_next_actions:
  - No AGDF control in the project: message that the project has no AGDF control; no run list.
  - Run state unreadable or in an unsupported format: message with the concrete reason and a "Neu lesen" / "Read again" action.
  - No open runs: message that no run is open; completed runs are not shown as current.
  - Incompatible host or changed mod API: the companion stays unavailable; AGDF control functions keep working.
- recovery_paths: "Neu lesen" re-reads immediately; during a recoverable transient read failure the last good state stays visible with a marker until a retry succeeds. Switching off and on reopens the panel. With no run assigned, selecting an open run assigns it and remembers it for the project. A selected run that is no longer open returns the panel to the no-run-assigned state.
- relevant_state_transitions:
  - Off → on via `/agdf-companion`: panel opens and reads the run state; on → off via the same command: panel closes, refresh stops.
  - No run assigned → assigned from this session when a run state changes during the session; a later change of another run reassigns to that run.
  - Selected by the user → assigned from this session when a run state changes; the selection remains the fallback.
  - Any state → läuft while a main-loop turn is active → run-derived state when the turn completes.
  - Any state → status unavailable on read failure → previous state on successful retry.

## 5. Acceptance Criteria

### Opt-in activation

- criterion_id: AC-001
- working_mode: Off / On
- source_state: AGDF installed in Claude Code with the companion off.
- action: Run `/agdf-companion`, then run it again; start a new session.
- expected_effective_state: The first run switches the companion on and opens the panel; the second switches it off and closes the panel; the last choice applies to new sessions.
- visible_feedback: The panel appears titled "AGDF-Begleiter" (de) or "AGDF Companion" (en) and disappears again.
- blocker_failure_behavior: If the panel cannot be placed, the command reports why.
- recovery_next_action: Run the command again or widen the window.
- observable_success: The panel never appears without the user having switched it on.
- required_evidence: Automated test of command behaviour and persistence; live desktop observation.

### Panel content

- criterion_id: AC-002
- working_mode: On, assigned or selected
- source_state: Companion on; a run is assigned or selected.
- action: Open the panel at the default docked width.
- expected_effective_state: The panel shows the figure, state label, one-line reason, a single-line gate bar, run identity, a one-line objective that can be expanded, the next step, the assignment origin and the time of the last read.
- visible_feedback: The gate bar fits on one line; the objective takes one line until expanded.
- blocker_failure_behavior: Overlong texts are shortened within their line without hiding the state label.
- recovery_next_action: Expand the objective to read it fully.
- observable_success: No element of the status wraps or is cut so that state, gate or next step become unreadable.
- required_evidence: Rendering tests with long fixtures; live screenshot at the default width.

### State rules

- criterion_id: AC-003
- working_mode: On, assigned or selected
- source_state: Run states covering each rule, and an active turn.
- action: Show each run; start and finish a turn.
- expected_effective_state: läuft while a main-loop turn is active or the run is in progress without a pending approval; wartet auf Freigabe when the run names a pending gate approval or awaits a decision; blockiert when the run decision is revise, block, blocked or decline; fertig when the lifecycle is completed.
- visible_feedback: Figure pose and colour, label and reason change accordingly.
- blocker_failure_behavior: A run state matching no rule is reported as unreadable, not guessed.
- recovery_next_action: Read again after the run state is corrected by its owner.
- observable_success: Each of the four states is reproducible from fixtures and the turn state switches back after completion.
- required_evidence: Automated rule tests on fixtures written by the canonical writers; live observation of at least one turn.

### Run assignment

- criterion_id: AC-004
- working_mode: On, all assignment modes
- source_state: A project with several open runs.
- action: Change a run's state during the session; select a run while none is assigned; start a new session.
- expected_effective_state: The panel shows the run changed in this session (the most recently changed one wins); otherwise the remembered selection for this project; otherwise "Kein Run zugeordnet" with the open runs. It never guesses a run. The assignment binds no AGDF delivery.
- visible_feedback: The origin reads "from this session", "selected by you" or no run assigned.
- blocker_failure_behavior: A remembered run that is no longer open is dropped and the no-run state is shown.
- recovery_next_action: Select another open run.
- observable_success: With 56 open runs and no change in the session, the panel shows the no-run state instead of the newest run.
- required_evidence: Automated assignment tests including several sessions and a vanished run; live observation.

### Language

- criterion_id: AC-005
- working_mode: All on modes
- source_state: Chat language German or English.
- action: Show the panel.
- expected_effective_state: Labels, states and reasons follow the chat language through the AGDF locale packs; the next step uses the localized status-card value where one exists and the source text otherwise; the objective stays in the artefact language.
- visible_feedback: A German panel shows German labels and, where available, the German next step.
- blocker_failure_behavior: A missing localized value falls back to the source text without breaking the panel.
- recovery_next_action: None required.
- observable_success: No English label appears in a German panel; source-language texts are limited to the objective and unlocalized next steps.
- required_evidence: Automated tests for German and English.

### Blockers and recovery

- criterion_id: AC-006
- working_mode: On, status unavailable
- source_state: A project without AGDF control; an unreadable run state; a project with no open runs; a transient read failure.
- action: Open the panel and use "Neu lesen".
- expected_effective_state: Each condition shows its specific message; a transient failure keeps the last good state with a marker; retry restores the normal state once readable.
- visible_feedback: Neutral figure with message and retry where useful.
- blocker_failure_behavior: No condition shows a stale run as current without the marker.
- recovery_next_action: Retry, or open the intended project.
- observable_success: Each condition is distinguishable and recovers without restarting.
- required_evidence: Automated tests per condition.

### Read-only and no authority

- criterion_id: AC-007
- working_mode: All on modes
- source_state: Companion on during a test window with turns and run changes made by AGDF.
- action: Use all panel actions.
- expected_effective_state: The companion writes nothing under `.agdf/control`, offers no approval, rejection or continuation action and selects no AGDF delivery run.
- visible_feedback: The panel contains only display, selection, still-pose and retry controls.
- blocker_failure_behavior: Not applicable; no write path exists.
- recovery_next_action: Not applicable.
- observable_success: Run state files written by others are byte-identical before and after the companion's reads.
- required_evidence: Byte-identity check over the live test window; static check that no write capability is used.

### Failure isolation

- criterion_id: AC-008
- working_mode: Host incompatible / companion failure
- source_state: The companion fails to load or throws at run time.
- action: Use AGDF dispatch, MCP tools and start a session.
- expected_effective_state: AGDF dispatch, MCP tools, the SessionStart hook and skills work as without the companion.
- visible_feedback: The companion is unavailable; AGDF chat behaviour is unchanged.
- blocker_failure_behavior: No AGDF operation fails because of the companion.
- recovery_next_action: Update Claude Code or keep using AGDF without the companion.
- observable_success: An automated check with a deliberately failing companion shows unchanged AGDF behaviour.
- required_evidence: Automated failure-injection check plus native host observation.

### Claude-only projection and clean removal

- criterion_id: AC-009
- working_mode: Installation and removal
- source_state: AGDF built for Claude, Codex and Copilot.
- action: Inspect the generated manifests and payloads; install and uninstall AGDF in Claude.
- expected_effective_state: Only the Claude manifest references the companion; the Codex manifest, the Copilot payload and the shared `hooks/hooks.json` do not; Codex hook trust state is unchanged; uninstalling AGDF in Claude leaves no companion data or settings.
- visible_feedback: Not user-visible; verified by checks.
- blocker_failure_behavior: Integrity checks fail the build if the companion appears outside the Claude projection.
- recovery_next_action: Fix the projection before release.
- observable_success: Codex and Copilot payload checks pass with their reviewed baselines; uninstall leaves nothing behind.
- required_evidence: Integrity and payload checks; isolated install/uninstall test.

### Motion, overlap and terminal fallback

- criterion_id: AC-010
- working_mode: All on modes, terminal surface
- source_state: Companion on in the desktop app and in the terminal.
- action: Switch the still pose on and off; show each state; open the panel in the terminal.
- expected_effective_state: The still pose stops all motion and persists; no accessory overlaps the figure in any state; the terminal shows a text fallback with state, gate bar and next step.
- visible_feedback: Static figure in still pose; clear figure outline; readable text fallback.
- blocker_failure_behavior: Not applicable.
- recovery_next_action: Switch motion back on.
- observable_success: Each state renders without overlap; the terminal fallback carries the same information.
- required_evidence: Rendering tests per state and surface; live screenshot of the four states at default width.

### Verification, payload and documentation

- criterion_id: AC-011
- working_mode: Delivery
- source_state: Companion implemented in the repository.
- action: Run the repository verification and review the generated baselines; read the documentation.
- expected_effective_state: Companion logic tests run in the existing Node verification; Claude plugin validation and tests run where Claude Code is available and are labelled as native evidence; payload budgets, fingerprints and compatibility records are regenerated, reviewed and their growth recorded; documentation explains switching on and off, supported surfaces and limits.
- visible_feedback: Documentation separates live, native and automated evidence.
- blocker_failure_behavior: Unreviewed payload growth fails the verification.
- recovery_next_action: Review and record the budget change with a reason.
- observable_success: All existing checks pass and the documentation states the evidenced status only.
- required_evidence: Verification run output; budget review record; documentation diff.

## 6. Non-Goals

- No change to AGDF control behaviour: contracts, dispatcher, MCP server, SessionStart hook and the `RUN_STATE.md` format keep their behaviour; no session-to-run binding in the AGDF core.
- No companion or status line for Codex, Copilot or OpenCode, no Codex Pets integration and no Stop-hook status line.
- No separate companion plugin and no additional marketplace entry.
- No approvals, gate actions, run continuation or writes to `.agdf/control` from the companion.
- No overview of all runs or the master backlog beyond stepping through open runs.
- No public plugin directory submission, npm publication or release; delivery ends with a pull request from `feat/agdf-begleiter`, without merge.
- No transfer of approvals or evidence from other runs.

## 7. Users And Roles

The AGDF maintainer working in Claude Code on Windows, mainly in the Code tab of the Claude desktop app and secondarily in the terminal. They are the product owner and the human approver of gates. Other Claude users of the AGDF plugin receive the companion switched off. Codex and Copilot users are affected only in that their behaviour must remain unchanged.

## 8. Constraints

- The Claude Code mod API is early access (Claude Code 2.1.308 at analysis time); supported versions must be stated.
- The companion is wired only through the Claude projection; the shared `hooks/hooks.json` stays byte-identical so Codex hook trust is not invalidated.
- Changes to the plugin payload trigger regeneration and review of payload budgets, provenance digests, evaluation fingerprints and compatibility records.
- The repository's CI has no Claude Code; companion logic must be testable in the existing Node verification.
- The working directory alone is not AGDF target authority; the companion's display of a project's runs grants no delivery authority.
- Reading many runs must stay fast enough for a refresh after each turn (prototype: 144 run states in about 240 ms).

## 9. Evidence Requirements

- Automated tests for state rules, assignment, language, blockers, rendering per surface, opt-in and failure isolation, using fixtures written by the canonical writers.
- Integrity and payload checks proving the Claude-only projection and unchanged Codex and Copilot payloads.
- Isolated install and uninstall test in Claude without residue.
- Native evidence where Claude Code is available: plugin validation and tests.
- One dated live observation in the Claude desktop Code tab on Windows: the four states, still pose, single-line gate bar, no-run state, a turn transition and the byte-identical control-state check.
- Documentation diff separating live, native and automated evidence.

## 10. Risks And Open Questions

- The early-access mod API may change; an incompatible host must leave AGDF untouched (AC-008).
- Loading a hooks module from a file referenced only by the Claude manifest is not yet observed; the SD decides the wiring and the TP probes it early.
- A second reader of the run state format risks drift; the SD decides the canonical status source and its parity tests.
- SMIL animation does not follow the operating system's reduced-motion setting; the still pose is the accessible fallback.
- Several sessions on one repository may change runs concurrently; the panel follows changes seen by its own session only.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Activation mechanism | before_prd | resolved | Slash command `/agdf-companion` only; the choice persists; off after installation (user decision 2026-10-25) | Arndt Gold, PRD Owner |
| Language policy | before_prd | resolved | Labels and states in the chat language through the AGDF locale packs; next step from localized status-card values where available; objective in the artefact language (user decision 2026-10-25) | Arndt Gold, PRD Owner |
| Empty assignment state | before_prd | resolved | Show "Kein Run zugeordnet" with the open runs instead of guessing (user decision 2026-10-25) | Arndt Gold, PRD Owner |
| Name | before_prd | resolved | Technical name and command `agdf-companion`; titles "AGDF-Begleiter" (de) and "AGDF Companion" (en) (user decision 2026-10-25) | Arndt Gold, PRD Owner |
| Several runs changed in one session | before_prd | resolved | The most recently changed run wins, derived from the approved UR rule "follows the run whose run state changes during the session" | Arndt Gold, PRD Owner |
| Acceptance surfaces | before_prd | resolved | Live acceptance in the Claude desktop Code tab on Windows; the terminal fallback is evidenced by automated rendering tests, derived from UR acceptance signals 2 and 8 | Arndt Gold, PRD Owner |
| Distribution boundary | before_prd | resolved | Inside the AGDF plugin, Claude projection only; no publication or release; pull request from `feat/agdf-begleiter` without merge (approved UR) | Arndt Gold, PRD Owner |
| Canonical status source and parity with the core readers | later_sd | open | Choose a canonical projection or a contract-tested reader; no undocumented second format interpretation | SD author through sd-definition |
| Claude-only wiring, failure isolation and persistence of choice and selection | later_sd | open | Within the approved behaviour; shared `hooks/hooks.json` unchanged | SD author through sd-definition |
| Payload placement, provenance, budgets and compatibility evidence | later_sd | open | Bounded payload; Copilot inventory unchanged | SD author through sd-definition |
| Early host probe and test scenarios | later_tp | open | Probe module loading and failure isolation early; map every criterion and SD decision to evidence | TP author through gate-check |

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

- Ziel: Beim Arbeiten mit AGDF in Claude Code auf einen Blick sehen, in welchem Zustand der Run der Session ist, an welchem Gate er steht und was der nächste Schritt ist, ohne den Agenten zu fragen.
- Umfang: Das AGDF-Plugin für Claude bringt den Begleiter `agdf-companion` mit, standardmäßig aus. `/agdf-companion` schaltet ihn ein und öffnet ein Seitenpanel „AGDF-Begleiter“ mit animierter Figur, Zustand, Begründung, einzeiliger Gate-Leiste, Run-Kennung, Ziel und nächstem Schritt, aktualisiert nach jedem Turn. Im Terminal erscheint eine Textfassung. Der Begleiter liest nur, schreibt nichts, gibt nichts frei und setzt keinen Run fort. Eingebunden wird er nur über die Claude-Projektion; Codex und Copilot bleiben unverändert, und ein Fehler des Begleiters beeinträchtigt AGDF nicht.
- AC-001: Nach der Installation ist der Begleiter aus. `/agdf-companion` schaltet ihn ein und öffnet das Panel, ein zweiter Aufruf schaltet ihn aus; die Wahl gilt auch für neue Sessions. Das Panel erscheint nie ungefragt.
- AC-002: Bei Standardbreite zeigt das Panel Figur, Zustand, einzeilige Begründung, einzeilige Gate-Leiste, Run-Kennung, einzeiliges aufklappbares Ziel, nächsten Schritt, Herkunft der Zuordnung und Lesezeitpunkt, ohne dass Zustand, Gate oder nächster Schritt unlesbar umbrechen.
- AC-003: „läuft“ während eines Turns oder bei Run in Arbeit ohne offene Freigabe, „wartet auf Freigabe“ bei offener Gate-Freigabe oder ausstehender Entscheidung, „blockiert“ bei Entscheidung revise, block, blocked oder decline, „fertig“ bei abgeschlossenem Run. Nicht zuordenbare Zustände werden als unlesbar gemeldet, nicht geraten.
- AC-004: Das Panel zeigt den in dieser Session geänderten Run (der zuletzt geänderte gewinnt), sonst die gemerkte Auswahl des Projekts, sonst „Kein Run zugeordnet“ mit den offenen Runs. Es rät nie, zeigt die Herkunft an und bindet keine AGDF-Lieferung.
- AC-005: Beschriftungen und Zustände folgen der Chat-Sprache über die AGDF-Sprachpakete; der nächste Schritt kommt aus den lokalisierten Statuskarten-Werten, wo vorhanden; das Ziel bleibt in Artefaktsprache. Fehlende Übersetzungen fallen auf den Quelltext zurück.
- AC-006: Fehlende AGDF-Steuerung, unlesbarer Zustand und keine offenen Runs haben je eine eigene Meldung; bei kurzzeitigem Lesefehler bleibt der letzte gute Stand markiert sichtbar, „Neu lesen“ stellt den Normalzustand wieder her.
- AC-007: Der Begleiter schreibt nichts unter `.agdf/control`, bietet keine Freigabe-, Ablehnungs- oder Fortsetzungsaktion und wählt keinen Lieferrun; die Run-Dateien bleiben im Testfenster byteidentisch.
- AC-008: Lädt der Begleiter nicht oder scheitert er zur Laufzeit, arbeiten AGDF-Dispatch, MCP-Werkzeuge, SessionStart-Hook und Skills unverändert; ein automatischer Test mit absichtlich fehlerhaftem Begleiter belegt das.
- AC-009: Nur das Claude-Manifest verweist auf den Begleiter; Codex-Manifest, Copilot-Payload und die gemeinsame `hooks/hooks.json` nicht, der Codex-Hook-Vertrauensstatus bleibt; die Deinstallation in Claude hinterlässt keine Daten oder Einstellungen des Begleiters.
- AC-010: Das Standbild stoppt jede Bewegung und bleibt erhalten; kein Zubehör überdeckt die Figur; das Terminal zeigt Zustand, Gate-Leiste und nächsten Schritt als Text.
- AC-011: Die Logik-Tests laufen in der bestehenden Node-Verifikation, Claude-Plugin-Prüfungen gelten als native Nachweise; Payload-Budgets, Fingerprints und Kompatibilitätsnachweise sind neu erzeugt, geprüft und ihr Zuwachs festgehalten; die Dokumentation erklärt Ein- und Ausschalten, Oberflächen und Grenzen.
- Entscheidungen: Laut deinen Entscheidungen vom 2026-10-25 wird der Begleiter nur per Slash-Befehl ein- und ausgeschaltet, die Sprache ist lokalisiert, wo möglich, ohne Zuordnung erscheint „Kein Run zugeordnet“ statt eines geratenen Runs, und der Name ist `agdf-companion`. Abgeleitet aus der UR: Bei mehreren geänderten Runs gewinnt der zuletzt geänderte, live abgenommen wird im Code-Tab der Desktop-App unter Windows, das Terminal über automatische Tests, und die Lieferung endet mit einem Pull Request ohne Merge. Statusquelle, Einbindung nur für Claude, Fehlerisolation, Speicherung der Wahl sowie Payload und Budgets entscheidet die SD; die frühe Host-Probe legt der TP fest.
