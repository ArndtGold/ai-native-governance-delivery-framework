# PRD: Companion core in Core: host-neutral run view, MCP events and figure states

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-11-06
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the host-neutral core of the AGDF companion in Core and migrate the Claude companion onto it, in two increments inside this run.

**Increment 1: shared run view.**
- One Core run view for a project and for each run. It contains:
  - state/mood and reason;
  - gate path and missing approval;
  - localized next step and run list;
  - an explicit diagnosis of unreadable runs and of unsupported control stores (count and reason).
- The MCP status card and the Claude companion both present this view.
- Figure states, their meaning and all companion texts come from Core and the central interaction locale catalog (German and English).
- The Claude companion keeps only drawing, refresh triggers, stored UI choices and sound.

**Increment 2: events and review facts.**
- The AGDF MCP server derives human-relevant events from the outcomes of its own write and dispatch operations: approval requested, approval recorded, write rejected (not dispatched), effect unknown, recovery required, run completed.
- The events are readable by host surfaces without host hooks and reach the companion before its next poll.
- Events about staged or recorded material carry review facts: a bounded preview, size and the digest of what was recorded.
- For recordings that name a run-local source file, the facts also state whether the recorded digest still matches that file; a mismatch is a warning.
- Staged material has no declared source, so no automatic mismatch is claimed; the preview is the owner's check (decision P4).

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: ready analysis `.agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/UX_INTENT_DEFINITION.md` (recorded from evidence/UX_INTENT_DEFINITION-input-01.md, sha256:7dcf1dc3b76e0c8d3301fc2093ce2562d0ae97b77d49beadf920cfcd5c087253)
- primary_user_intent: As a project owner, I see at a glance and truthfully where each AGDF run stands and what the agent has just done through AGDF. I notice immediately when I am needed (approval requested), when something went wrong (effect unknown, recovery required), or when recorded material differs from its source.
- success_signal:
  - Companion and status card never disagree for the same run.
  - Legacy or unreadable runs are never hidden.
  - MCP outcomes show up without waiting for the 30-second poll.
  - What was recorded is visible as preview, size, digest and source match.
- primary_decision_or_action: The owner decides whether to act: answer an approval request in the chat, inspect a warning, or continue. The companion never approves, blocks or writes.

No UI preview was required by the UR or created; the behavior below is specified in text.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 companion pane open (Claude desktop or terminal) | Shared run view of the current project root plus recent events of that project | figure mood, reason, gate path, run list, unreadable/unsupported hint, event notices, review facts, stale marker | canonical RUN_STATE.md and its Run Operations via the single Core run view; transient outcomes via the AGDF MCP server observation | companion pane |
| M2 pane hidden by the person, companion on | Same as M1 | status line text and toasts (per decision P1) | same as M1 | status line and toasts |
| M3 companion switched off | Nothing is read or shown (unchanged) | none | not_applicable | none |
| M4 host-neutral consumer (MCP status card for agents; later surfaces) | Same run view fields as M1 | status card fields | same as M1 | MCP status card text |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation:
  - The existing `/agdf-companion` command switches the companion on and off; stored choices are unchanged.
  - Events appear for AGDF MCP operations of the same project root while the companion is on.
  - Review facts appear on events for staged or recorded material.
- blockers_and_visible_next_actions:
  - Unsupported control store: a hint names the folder and reason, with next action "run AGDF doctor through MCP or decide on the legacy store". Readable runs are still listed.
  - Event channel unavailable: the companion keeps polling run state, shows "events unavailable" and never invents events.
  - Review facts too large: a bounded preview with a truncation note; size and digest stay visible.
- recovery_paths:
  - The existing "read again" action re-reads run state and events, as a visible retry for transient failures.
  - A stale snapshot keeps the last good view with the existing stale marker.
  - Warnings name the concrete next action (inspect operation status, re-stage material) without performing it.
- relevant_state_transitions:
  - **Recorded operation:** Trigger is a recorded AGDF operation, source is the previous run state, target is the new run view. Feedback is updated figure, path and next step. On failure the stale marker is kept.
  - **MCP outcome:** Trigger is an AGDF MCP outcome, the target is an event. Feedback is a toast or a pane entry per P1. Notices clear on acknowledgement or the next main-loop turn.
  - **Run completed:** The figure moves to fertig.
  - **Effect unknown or recovery required:** The warning stays until the run state no longer carries the uncertainty.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: M1, M4
  - source_state: any readable run
  - trigger: companion read and MCP gate-check status card for the same run revision
  - expected_effective_state: one shared run view
  - visible_feedback: identical state, gate path, missing approval and next step in companion and status card
  - failure_behavior: a divergence fails the parity test
  - observable_success: Companion and MCP status card show the same state, path, missing approval and next step for the same run
  - evidence: automated parity test over representative run states (open UR without artefact, ready UR, PRD, structured internal steps, completed quick_task, completed structured run)
- criterion_id: AC-002
  - working_mode: M1, M2
  - source_state: project whose runs are all unreadable or whose control store is unsupported (for example legacy v2)
  - trigger: companion read
  - expected_effective_state: diagnosis with count and reason
  - visible_feedback: hint with folder, number of unreadable runs and reason instead of "No open runs"
  - failure_behavior: none hidden; read failure keeps the stale marker
  - recovery: next action names AGDF doctor via MCP or the owner's legacy-store decision
  - observable_success: The companion names the number and reason of unreadable runs instead of "No open runs"
  - evidence: companion logic test with legacy v2 fixture; live check against a real legacy project
- criterion_id: AC-003
  - working_mode: M1
  - source_state: project with readable and unreadable runs
  - trigger: companion read
  - expected_effective_state: readable runs listed, unreadable counted
  - visible_feedback: run list plus unreadable-runs hint
  - observable_success: Readable runs are listed and the unreadable-runs hint is still shown
  - evidence: companion logic test with mixed fixture
- criterion_id: AC-004
  - working_mode: M4
  - observable_success: A host-neutral consumer that is not the Claude mod renders the same run view, events and figure state from Core outputs alone
  - evidence: test harness consuming only Core exports, compared with the companion rendering
- criterion_id: AC-005
  - working_mode: M1, M2
  - source_state: companion on, AGDF MCP server active for the same project root
  - trigger: an AGDF MCP write or dispatch outcome
  - expected_effective_state: the corresponding event is available
  - visible_feedback: notice per P1 before the next 30-second poll
  - failure_behavior: when the event channel is unavailable, the companion shows "events unavailable" and continues polling
  - recovery: read again
  - observable_success: The event reaches the companion before its next 30-second poll
  - evidence: event test through the real MCP tool path (facade and plugin generation) with timing assertion
- criterion_id: AC-006
  - working_mode: M1, M2, M4
  - trigger: real MCP outcomes of approval request (presentation delivery), approval record, non-dispatched rejection, effect unknown, recovery required, closeout
  - expected_effective_state: one event per outcome with type, run, gate and time
  - visible_feedback: approval requested, effect unknown, recovery required and run completed as toast; approval recorded and write rejected in the pane only (P1)
  - observable_success: Events exist for approval requested, approval recorded, write rejected, effect unknown, recovery required and run completed, derived from real MCP outcomes
  - evidence: MCP tool-path tests per event type
- criterion_id: AC-007
  - working_mode: M1
  - source_state: material staged or recorded through agdf_record
  - trigger: seal or recording outcome
  - expected_effective_state: review facts attached to the event
  - visible_feedback: preview of at most 40 lines or 4 KiB with truncation note, size, recorded digest and source-match status (P2)
  - failure_behavior: facts unavailable are shown as unavailable, never guessed
  - observable_success: The owner sees a bounded preview, size and recorded digest, and, for a declared run-local source file, whether it matches that file
  - evidence: MCP tool-path test recording a UR and a large document
- criterion_id: AC-008
  - working_mode: M1, M2
  - source_state: a run document the run state binds with a recorded digest (the recorded artefact or evidence report) whose current canonical digest differs from that digest, or staged material without a declared source; a path recording reports at record time whether its named run-local source file matches
  - trigger: recording outcome or a later read of the run view
  - expected_effective_state: drift warning for a changed bound run document and the record-time source match of a path recording in its event; for staged material the source match is "not determinable" and no mismatch is claimed
  - visible_feedback: toast and pane warning naming the document, both digests and the next action (re-record from the current file or restore it); for staged material the pane shows the preview with the note that the owner checks it
  - failure_behavior: no warning is ever derived from a guessed intended source
  - recovery: owner decides through the agent; the companion performs nothing
  - observable_success: A recorded run document that no longer matches its recorded digest is shown as a warning, a path recording shows whether its source file matched when it was recorded, and staged material is shown with its preview and the note that no automatic comparison is possible; a source file changed only after recording is not compared (follow-up decision)
  - evidence: test with a bound run document changed after recording (warning), the record-time source match of a path recording, and a reproduced 2026-11-05 base64 corruption pattern (preview shown, no mismatch claimed)
- criterion_id: AC-009
  - observable_success: The companion never writes under .agdf/control, never gates or blocks an MCP call and never records an approval
  - evidence: integrity test of the companion module set and its host hooks; control-folder digest unchanged across companion activity
- criterion_id: AC-010
  - working_mode: M1, M2
  - observable_success: Figure states and all companion texts come from the central catalog in German and English
  - evidence: locale completeness test for the companion keys in agdf-interaction-locales.json
- criterion_id: AC-011
  - observable_success: Existing companion behavior, its tests and all MCP tool results stay unchanged apart from the corrected next step and the new hints and events
  - evidence: existing companion suites, MCP server suites and CLI gate-check/status-card tests green; byte comparison of status card output for unchanged inputs

## 6. Non-Goals

- No Codex user interface: no Cockpit or Decision View change and no Codex pet. A separate run follows a native capability check on macOS.
- No approval through the companion (neither click nor delegated or rule-based approval).
- No gating or blocking of MCP calls, and no companion writes under `.agdf/control`.
- No change to MCP write semantics, gate rules, approval formulas, result schemas or error codes.
- No migration of legacy v2 control stores; they are only diagnosed.

## 7. Users And Roles

- Project owner (Arndt Gold): follows runs in the companion and decides on approvals in the chat; accountable PRD owner.
- Agents and hosts reading AGDF status through MCP.
- Maintainers of host adapters adding surfaces on top of the Core outputs.

## 8. Constraints

- The Claude companion may only import pure modules and uses host-injected file access (`$.fs`); Core code it consumes must stay free of Node built-ins.
- Events must not create a second source of truth next to RUN_STATE.md and its Run Operations.
- The Copilot runtime payload stays within `plugins/agdf/meta/copilot-payload-baseline.json` unless a reviewed budget change is recorded; the compatibility record is re-recorded with existing tooling.
- Status card output for unchanged inputs must stay stable for CLI, MCP and existing tests.
- Previews are shown only locally to the owner and bounded per P2.

## 9. Evidence Requirements

- Parity test companion vs. status card (AC-001).
- Companion logic tests with legacy, unreadable and mixed fixtures, plus a live check on a real legacy project (AC-002, AC-003).
- Host-neutral consumer harness (AC-004).
- MCP tool-path tests for every event type, facade and plugin generation, including timing (AC-005, AC-006).
- Review-fact tests including truncation, a bound run document changed after recording, the record-time source match, and a reproduced staged corruption shown through the preview without a mismatch claim (AC-007, AC-008).
- Integrity and control-digest checks (AC-009); locale completeness (AC-010).
- Existing suites and status card byte comparison (AC-011).
- Native Claude desktop check of the companion after installation, with screenshots, as UAT input.

## 10. Risks And Open Questions

- Splitting `evaluateGateCheck` into capture and a pure projection is a central refactor (SD, Brownfield Analysis).
- Event delivery to a mod without host hooks depends on what the mod sandbox can read (SD probe).
- Codex consumption is not verified natively here; this run does not depend on it.
- Payload growth from Core modules and event code may approach the Copilot budget.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| P1 which events interrupt as toast | before_prd | resolved | Toast for approval requested, effect unknown, recovery required, run completed and digest mismatch; approval recorded and write rejected appear in the pane only (owner choice 2026-11-05) | Arndt Gold |
| P2 bound of the material preview | before_prd | resolved | At most 40 lines or 4 KiB, whichever is smaller, with truncation note, plus size, digest and source match; no redaction because display is local (owner choice 2026-11-05) | Arndt Gold |
| P4 detection of corrupted material transfers | before_prd | resolved | No MCP schema change; automatic mismatch only for recordings with a declared run-local source file, staged material is checked by the owner through the preview (owner choice 2026-11-05, PRD reopened for this) | Arndt Gold |
| P5 drift scope after recording (source revision 2026-11-06) | before_prd | resolved | The drift warning covers the run documents the run state binds with a recorded digest, and a path recording reports at record time whether its named source file matches; a source file changed only after recording is not compared, because Run Operations keep no declared input path and persisting it would change the recording write path this PRD excludes (contradiction C5, owner decision 2026-11-06; a later run may add it) | Arndt Gold |
| P3 delivery increments | before_prd | resolved | Two increments in this run: 1 shared run view, diagnostics, figure states and texts; 2 events and review facts (owner choice 2026-11-05) | Arndt Gold |
| Event channel, lifetime and SoT boundary | later_sd | deferred | Decided in SD: transient vs. durable, reuse of Run Operations for accepted operations, no second source of truth | SD author for Arndt Gold |
| Host-readable MCP surface for run view and events | later_sd | deferred | Decided in SD: operation or result field, size limits, compatibility with existing tools | SD author for Arndt Gold |
| Split of evaluateGateCheck into capture and pure projection | later_sd | deferred | Decided in SD with byte-stable status card output | SD author for Arndt Gold |

## 11. Next Step

Present this PRD again after the source revision of 2026-11-06, which narrowed AC-008 and its evidence requirement (decision P5); every before_prd row is resolved and the PRD owner is named. Review and approve only with:

`Approval: PRD`

The approval confirms the specified behavior, scope and criteria and permits the SD step.

## AGDF Approval Summary (de; source=en)

- Problem: Die Konzepte des Begleiters stecken nur im Claude-Mod. Er rechnet anders als die MCP-Statuskarte, verschweigt unlesbare Runs und sieht nicht, was der Agent über MCP tut.
- Ziel: Der Begleiter zeigt auf einen Blick und wahrheitsgetreu, wo jeder Run steht und was der Agent über AGDF getan hat. Er meldet sofort, wenn du gebraucht wirst oder etwas schiefging.
- Umfang: Schritt 1 bringt eine gemeinsame Run-Ansicht in Core mit Diagnose unlesbarer Runs sowie Figurzustände und Texte im zentralen Katalog; Statuskarte und Claude-Begleiter nutzen sie. Schritt 2 bringt Ereignisse, die der AGDF-MCP-Server aus seinen eigenen Ergebnissen ableitet, mit Review-Fakten zum erfassten Material.
- Entscheidungen: P1 Toasts für Freigabe angefragt, Wirkung unbekannt, Wiederherstellung nötig, Run abgeschlossen und Digest-Abweichung, der Rest nur im Bereich. P2 Vorschau höchstens 40 Zeilen oder 4 KiB, keine Schwärzung. P3 zwei Schritte im selben Run. P4 keine Schemaänderung: automatischer Abgleich nur bei angegebener Quelldatei, sonst prüfst du die Vorschau. P5 (Revision vom 6. November): Die Abweichungswarnung gilt für die im Run gebundenen Dokumente; eine Pfad-Erfassung zeigt beim Erfassen, ob ihre Quelldatei passt; eine erst danach geänderte Quelldatei wird nicht verglichen, weil der Run keinen Eingabepfad speichert. Ereigniskanal, MCP-Schnittstelle und Aufteilung des Gate-Check-Bewerters entscheidet das SD.
- AC-001: Begleiter und Statuskarte zeigen für denselben Run denselben Zustand, Pfad, dieselbe fehlende Freigabe und denselben nächsten Schritt.
- AC-002: Bei nur unlesbaren Runs oder nicht unterstütztem Bestand nennt der Begleiter Anzahl und Grund statt „Keine offenen Runs“.
- AC-003: Im gemischten Projekt werden lesbare Runs gelistet und der Hinweis auf unlesbare Runs bleibt sichtbar.
- AC-004: Ein hostneutraler Verbraucher ohne Claude-Mod stellt Run-Ansicht, Ereignisse und Figurzustand allein aus Core-Ausgaben dar.
- AC-005: Ein Ereignis erreicht den Begleiter vor seiner nächsten 30-Sekunden-Abfrage.
- AC-006: Es gibt Ereignisse für Freigabe angefragt, Freigabe erfasst, Aufruf abgelehnt, Wirkung unbekannt, Wiederherstellung nötig und Run abgeschlossen, jeweils aus echten MCP-Ergebnissen.
- AC-007: Zum erfassten Material siehst du eine begrenzte Vorschau, Größe und den erfassten Digest, bei angegebener Quelldatei auch, ob er zu ihr passt.
- AC-008: Weicht ein im Run gebundenes Dokument von seinem erfassten Digest ab, erscheint eine Warnung; eine Pfad-Erfassung zeigt beim Erfassen, ob ihre Quelldatei passt; Material ohne Quelldatei prüfst du über die Vorschau, ein automatischer Vergleich wird nicht behauptet. Eine erst nach der Erfassung geänderte Quelldatei wird nicht verglichen.
- AC-009: Der Begleiter schreibt nie unter .agdf/control, hält keinen MCP-Aufruf an und erfasst keine Freigabe.
- AC-010: Figurzustände und alle Begleitertexte kommen aus dem zentralen Katalog, auf Deutsch und Englisch.
- AC-011: Bestehendes Verhalten, Tests und MCP-Ergebnisse bleiben unverändert, abgesehen vom korrigierten nächsten Schritt und den neuen Hinweisen und Ereignissen.
- Nicht im Umfang: keine Codex-Oberfläche, keine Freigabe über den Begleiter, kein Anhalten von Aufrufen, keine Schreibzugriffe des Begleiters, keine Migration alter Bestände.
- Risiken: Die Aufteilung des zentralen Gate-Check-Bewerters ist ein größerer Umbau. Die Zustellung der Ereignisse hängt davon ab, was der Mod lesen darf. Die Copilot-Nutzlast kann knapp werden.
- Nächster Schritt: Das nach der Quellrevision vom 6. November geänderte PRD prüfen und nur mit `Approval: PRD` freigeben; danach folgen SD und TP erneut zur Freigabe.
