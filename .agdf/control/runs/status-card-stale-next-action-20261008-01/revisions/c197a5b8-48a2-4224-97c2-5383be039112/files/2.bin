# PRD: Stale next step after internal step recording

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-08
Owner: Arndt Gold
Run: status-card-stale-next-action-20261008-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

After an internal step such as Brownfield Analysis or CD+Tests is recorded, an active run shows and routes on the next step of its evaluated current gate. A stored next step that belongs to an earlier gate no longer appears on the status card, in the gate-check report or in the cockpit, and no longer stops `continue_delivery`.

Deliberate run-specific next-step text is preserved: on an active run whose gate has not moved, and on completed runs. Recording an internal step through the canonical writer brings the stored gate, next step and control-state rows in line with the evaluated decision. Already affected runs, observed so far only on `agdf-cockpit-claude-host-20261008-01`, behave correctly without hand editing.

## 2. UX Intent And Success

- primary_user_intent: Read a status card whose gate, allowed actions and next step agree, and continue a run with `continue_delivery` without diagnosing stored control text.
- success_signal: For `agdf-cockpit-claude-host-20261008-01`, the status card names the CD+Tests next step, and `continue_delivery` returns the implementation continuation. Runs whose stored text is current or deliberately run-specific show exactly what they show today.
- primary_decision_or_action: Continue delivery, or read status. This change adds no decision and approves no gate.
- deviation_from_ux_input: not_applicable. Brownfield Review classified UI/UX impact as `low` with no UX Intent Definition required.

## 3. Working Modes And Effective State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Recording | An internal step is recorded through the canonical writer (`run-update`) | Recorded run revision with gate, next step and control-state rows | Gate evaluation over the recorded run content | `RUN_STATE.md` header and Current Control State table |
| Status reading, gate moved | Active run whose stored gate differs from the evaluated gate | Status card, gate-check report, cockpit evaluation | Gate evaluation | Status card next-step line, unchanged layout |
| Status reading, same gate | Active run whose stored gate equals the evaluated gate, with deliberate run-specific next-step text | Status card, gate-check report, cockpit evaluation | Stored run-specific text as a refinement of the evaluated gate | Status card next-step line, unchanged layout |
| Completed run reading | Run with `lifecycle: completed` | Status card and reports as today | Stored closeout text | Unchanged |
| Delivery continuation | `continue_delivery` on an active structured run | Continuation phase or terminal status card | Gate evaluation and the existing continuation rules | Dispatcher result |

## 4. Activation, Blockers, Recovery And Transitions

- Activation: no new user action. The behavior applies whenever the status is read, an internal step is recorded or delivery is continued through the updated runtime.
- Transitions: the gate order and transition rules stay unchanged. Brownfield Analysis recorded after approved TP still leads to CD+Tests, and CD+Tests recorded still leads to CR.
- Blockers:
  - A pending human decision, expressed as same-gate run-specific next-step text at CD+Tests, keeps stopping the automatic implementation continuation, exactly as today.
  - Existing blockers (missing approvals, doctor findings, seal problems) take precedence unchanged.
- Recovery: a run that was persisted with a stale next step needs no manual repair. Display and routing are correct immediately with the updated runtime. Its stored fields are refreshed no later than the next canonical write that changes the run.
- Runtime availability: the fixed behavior reaches Claude and Codex hosts only after the repository runtime copies are synchronized and the plugin is reinstalled. Until then, hosts run the previous behavior.

## 5. Acceptance Criteria

### Recording refreshes derived fields when the gate moved

- criterion_id: AC-001
- working_mode: Recording
- source_state: Active structured run with approved TP. Its stored gate and next step belong to Brownfield Analysis. The Brownfield Analysis artefact row is then marked done and recorded through `run-update`.
- action: Record the run revision through the canonical writer.
- expected_effective_state: The recorded run names `current_gate: CD+Tests`, the evaluated CD+Tests next step and matching Current Control State rows. The same holds for CD+Tests recorded as done, which leads to CR.
- visible_feedback: The recorded `RUN_STATE.md` header and control-state table show the CD+Tests values. The writer result reports the new revision.
- blocker_failure_behavior: Unknown, unsealed or approval-changing edits are rejected as today. No approval or seal rule is relaxed.
- recovery_next_action: Correct the rejected edit and record again with the current revision.
- observable_success: The stored and evaluated gate and next step are identical after recording.
- required_evidence: Automated test of the canonical writer with a gate-moving internal-step record.

### Recording preserves run-specific text when the gate did not move

- criterion_id: AC-002
- working_mode: Recording
- source_state: Active run whose evaluated gate is unchanged by the recorded edit, with deliberate run-specific next-step text.
- action: Record the run revision through the canonical writer.
- expected_effective_state: The stored run-specific next step and gate remain as authored.
- visible_feedback: The `RUN_STATE.md` header and control-state table keep the authored text.
- blocker_failure_behavior: As in AC-001.
- recovery_next_action: As in AC-001.
- observable_success: The stored next step is byte-identical before and after recording.
- required_evidence: Automated test of the canonical writer with a same-gate custom next step.

### Status shows the evaluated next step after the gate moved

- criterion_id: AC-003
- working_mode: Status reading, gate moved
- source_state: Active run whose stored gate and next step belong to an earlier gate than the evaluated one, for example stored Brownfield Analysis versus evaluated CD+Tests.
- action: Read the status card, the gate-check report (text and JSON) and the cockpit evaluation for that run.
- expected_effective_state: Every surface shows the evaluated gate together with its evaluated next step. The status card is identical to the card of an equivalent run whose stored text was never stale.
- visible_feedback: The next-step line ("Ich arbeite weiter" in German) names the CD+Tests work, not the completed analysis.
- blocker_failure_behavior: Doctor and gate blockers take precedence unchanged.
- recovery_next_action: None needed. The next canonical write refreshes the stored fields.
- observable_success: No surface shows a next step belonging to a gate other than the displayed gate.
- required_evidence: Automated status card, gate-check and cockpit tests with a stale stored value.

### Status keeps run-specific text on an unchanged gate

- criterion_id: AC-004
- working_mode: Status reading, same gate
- source_state: Active run whose stored gate equals the evaluated gate and whose stored next step is deliberate run-specific text. Five such active runs exist in this repository (see the Brownfield Review evidence).
- action: Read the status card, the gate-check report and the cockpit evaluation.
- expected_effective_state: The run-specific next step is shown exactly as today.
- visible_feedback: Unchanged status card.
- blocker_failure_behavior: Unchanged.
- recovery_next_action: Unchanged.
- observable_success: The status output for these runs is identical before and after the change.
- required_evidence: Automated test with a same-gate custom text, plus a before/after comparison over the five evidenced active runs.

### Completed runs are unchanged

- criterion_id: AC-005
- working_mode: Completed run reading
- source_state: Run with `lifecycle: completed` and deliberate closeout next-step text, including legacy runs whose evaluated gate differs from OR.
- action: Read the status card and the gate-check report.
- expected_effective_state: The displayed next step is unchanged.
- visible_feedback: Unchanged closeout text.
- blocker_failure_behavior: Unchanged.
- recovery_next_action: Unchanged.
- observable_success: The next step is identical before and after the change for every completed run in this repository.
- required_evidence: Automated test with a completed legacy run, plus a before/after comparison over the repository's completed runs.

### Delivery continues after a recorded Brownfield Analysis

- criterion_id: AC-006
- working_mode: Delivery continuation
- source_state: Active structured run with approved TP and recorded Brownfield Analysis. The stored next step is either the stale Brownfield Analysis text or the evaluated CD+Tests text.
- action: Dispatch `gate-check` with `continue_delivery`.
- expected_effective_state: The dispatcher returns the existing `implementation` continuation for the run.
- visible_feedback: No terminal status card. The implementation continuation names the bound run and revision.
- blocker_failure_behavior: Missing approvals, blockers or a non-structured route keep their existing results.
- recovery_next_action: None needed.
- observable_success: Both stored variants yield the same `implementation` continuation.
- required_evidence: Automated dispatcher tests for both stored variants.

### A pending same-gate decision still stops automatic implementation

- criterion_id: AC-007
- working_mode: Delivery continuation
- source_state: Active structured run at CD+Tests with approved TP whose stored next step is deliberate run-specific text, for example a pending human choice.
- action: Dispatch `gate-check` with `continue_delivery`.
- expected_effective_state: The dispatcher returns the status card with the run-specific next step, exactly as today. It does not return the `implementation` continuation.
- visible_feedback: Status card showing the pending run-specific next step.
- blocker_failure_behavior: Unchanged.
- recovery_next_action: The user resolves the pending decision. A later canonical record restores the automatic continuation.
- observable_success: The dispatcher result for such a run is identical before and after the change.
- required_evidence: Automated dispatcher test with a same-gate custom CD+Tests text.

### The stalled cockpit run proceeds without manual repair

- criterion_id: AC-008
- working_mode: Status reading, gate moved
- source_state: `agdf-cockpit-claude-host-20261008-01` as persisted at revision 13, with the updated runtime active through synchronized runtime copies and reinstalled plugin, or through the repository CLI.
- action: Read its status card and dispatch `gate-check` with `continue_delivery`.
- expected_effective_state: The status card shows the CD+Tests next step, and the dispatcher returns the `implementation` continuation.
- visible_feedback: Consistent status card. The run's approvals and artefacts are unchanged.
- blocker_failure_behavior: If the updated runtime is not active, the old behavior persists. This is a verification precondition, not a product failure.
- recovery_next_action: Synchronize and reinstall, then repeat.
- observable_success: Observed status card and continuation result recorded as evidence, with no edit to that run's `RUN_STATE.md`.
- required_evidence: Dated observation of the status card and dispatcher result for that run, plus its unchanged approval rows.

### Existing behavior and health stay intact

- criterion_id: AC-009
- working_mode: Recording
- source_state: Repository with all existing runs and test suites.
- action: Run the existing core and CLI test suites and `doctor` for the repository's runs.
- expected_effective_state: All suites pass, and `doctor` reports `pass` for runs that pass today.
- visible_feedback: Test and doctor output.
- blocker_failure_behavior: Any regression blocks QA.
- recovery_next_action: Fix the regression within the approved scope.
- observable_success: No new failure or finding compared with the baseline.
- required_evidence: Test and doctor output before and after the change.

## 6. Non-Goals

- No change to gate order, gate policy semantics, approval recording, approval validation or seal rules beyond consistent derived fields.
- No change to approvals, artefacts or evidence of existing runs, and no bulk migration of stored run files.
- No new user-visible gate, approval step, doctor finding or status card layout.
- No change to the evaluated next-step texts themselves.
- No fix of the MCP launcher startup race and no change to cockpit UI capability gating.
- No handling of completed legacy runs whose evaluated gate differs from OR beyond keeping their display unchanged.
- No plugin release, npm publication, Git commit or push.

## 7. Users And Roles

The AGDF maintainer who drives runs in Claude Code or Codex and approves gates (product owner: Arndt Gold), and the agent that follows dispatcher continuations.

## 8. Constraints

- Gate evaluation in `gate-policy.js` stays the single gate authority. No second evaluator.
- Reuse the existing writer refresh pattern and evaluation helpers. No parallel writer.
- Stored run-specific next-step text on an unchanged gate and on completed runs keeps its current role.
- Generated runtime copies follow through the repository's existing sync scripts.

## 9. Evidence Requirements

- Automated tests for the canonical writer (gate moved, same gate), the read surfaces (status card, gate-check text and JSON, cockpit) and the dispatcher (stale, current and same-gate custom CD+Tests).
- A before/after comparison of the displayed next step over all runs in this repository: only gate-moved active runs change.
- Existing core and CLI suites and `doctor`.
- A dated observation of `agdf-cockpit-claude-host-20261008-01` with the updated runtime.

## 10. Risks And Open Questions

- Routing currently relies on exact next-step text. Replacing that check must preserve AC-007 and the behavior for current runs. SD decides the mechanism.
- Refreshing derived fields inside `run-update` touches sealed content, so seal and approval-seal rules must hold. SD decides whether `run-update` refreshes or a dedicated internal-step record is added.
- Whether the master backlog row follows the refreshed next step on the same write is an SD check.
- The installed plugin keeps the old behavior until reinstall, so AC-008 depends on the TP's verification path.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Which next step is shown when stored and evaluated differ | before_prd | resolved | Evaluated next step when the stored gate differs from the evaluated gate on an active run. Stored text otherwise, for the same gate or a completed run. Derived from the approved UR goal and the Brownfield Review scan. | Arndt Gold, PRD Owner |
| Pending same-gate decision at CD+Tests | before_prd | resolved | Keeps stopping the automatic implementation continuation as today. Derived from the UR non-goal "no change to gate semantics". | Arndt Gold, PRD Owner |
| Repair of already stale runs | before_prd | resolved | Correct display and routing immediately with the updated runtime. Stored fields are refreshed at the next canonical write. No migration, no hand edit. Derived from UR scope and non-goals. | Arndt Gold, PRD Owner |
| Doctor treatment of stale stored text | before_prd | resolved | No new doctor finding. Derived from UR acceptance signal 5. | Arndt Gold, PRD Owner |
| Precedence helper, `run-update` refresh versus internal-step record, exact-text check replacement, backlog follow-up | later_sd | open | Decide within the approved behavior, reusing existing helpers | SD author through sd-definition |
| Verification path for the cockpit run (sync, reinstall or repository CLI) and before/after comparison harness | later_tp | open | Map every criterion and SD decision to tests and evidence | TP author through gate-check |

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

Ziel: Nach dem Eintragen eines internen Schritts wie Brownfield-Analyse oder CD+Tests zeigt ein aktiver Run den nächsten Schritt seines ausgewerteten Gates an und leitet danach weiter. Ein gespeicherter nächster Schritt aus einem früheren Gate erscheint weder auf der Statuskarte noch im Gate-Check-Bericht oder im Cockpit, und er hält `continue_delivery` nicht mehr an. Bewusst run-spezifischer Text bleibt erhalten, bei unverändertem Gate und bei abgeschlossenen Runs. Bereits betroffene Runs, bisher nur `agdf-cockpit-claude-host-20261008-01`, funktionieren ohne Handbearbeitung.

Umfang: neun Kriterien.

- AC-001: Wird ein interner Schritt über `run-update` eingetragen und das Gate bewegt sich dadurch, werden Gate, nächster Schritt und Kontrolltabelle auf die frische Auswertung gesetzt. Das gilt für Brownfield-Analyse nach CD+Tests und für CD+Tests nach CR.
- AC-002: Bleibt das Gate beim Eintragen gleich, bleibt der run-spezifische nächste Schritt byte-gleich erhalten.
- AC-003: Ist das gespeicherte Gate eines aktiven Runs älter als das ausgewertete, zeigen Statuskarte, Gate-Check-Bericht (Text und JSON) und Cockpit den ausgewerteten nächsten Schritt. Die Karte gleicht der eines Runs, dessen Text nie veraltet war.
- AC-004: Aktive Runs mit gleichem Gate und eigenem Text zeigen genau das, was sie heute zeigen. Fünf solche Runs sind belegt.
- AC-005: Bei abgeschlossenen Runs, auch bei Altbeständen, bleibt der angezeigte nächste Schritt unverändert.
- AC-006: `continue_delivery` liefert nach eingetragener Brownfield-Analyse und freigegebenem TP die Implementierungs-Fortsetzung, egal ob der gespeicherte Text veraltet oder aktuell ist.
- AC-007: Ein eigener Text bei CD+Tests, etwa eine offene menschliche Entscheidung, stoppt die automatische Implementierung weiterhin wie heute.
- AC-008: Mit aktivem aktualisiertem Laufzeitstand zeigt der Cockpit-Run den CD+Tests-Schritt, und `continue_delivery` leitet zur Implementierung weiter. Seine `RUN_STATE.md` wird dafür nicht bearbeitet, und seine Freigaben bleiben unverändert.
- AC-009: Die bestehenden Core- und CLI-Suiten laufen durch, und `doctor` bleibt für heute bestandene Runs auf `pass`.

**Nicht enthalten:**

- keine Änderung an Gate-Reihenfolge, Gate-Regeln, Freigaben, Siegelregeln oder den ausgewerteten Texten selbst;
- keine Migration bestehender Run-Dateien;
- kein neuer Doctor-Befund und kein neues Kartenlayout;
- keine Arbeit am MCP-Launcher-Race oder an der Cockpit-UI-Sperre;
- kein Release, kein Commit und kein Push.

Entscheidungen: Vier Produktentscheidungen sind aus UR und Brownfield Review abgeleitet und aufgelöst:

1. Der ausgewertete Text gilt nur, wenn sich das Gate eines aktiven Runs bewegt hat; sonst gilt der gespeicherte Text.
2. Eine offene Entscheidung bei CD+Tests stoppt weiterhin.
3. Veraltete Runs werden sofort richtig angezeigt und weitergeleitet. Ihre gespeicherten Felder werden beim nächsten kanonischen Schreiben aufgefrischt.
4. Es gibt keinen neuen Doctor-Befund.

Offen für das SD bleiben: der gemeinsame Vorrang-Helfer, Auffrischen in `run-update` oder ein eigener Eintrag für interne Schritte, der Ersatz der exakten Textvergleiche und die Nachführung im Backlog. Offen für den TP bleiben der Prüfweg für den Cockpit-Run und der Vorher-Nachher-Vergleich über alle Runs.

**Risiken.** Der Ersatz der exakten Textvergleiche muss das Stoppverhalten bei offenen Entscheidungen erhalten. Das Auffrischen in `run-update` muss die Siegelregeln einhalten. Installierte Hosts zeigen das neue Verhalten erst nach Synchronisierung und Neuinstallation.
