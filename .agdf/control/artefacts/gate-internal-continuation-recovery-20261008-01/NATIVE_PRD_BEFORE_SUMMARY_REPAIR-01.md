# PRD: Synthetic personal saved filter

Status: draft
Gate: PRD
Gate approval: open
Owner: Synthetic test product owner
Traceability contract: criteria-chain-v1

## Product Scope
Save and deliberately restore one named personal filter. Reuse the filter-editor product context defined by the isolated test scenario. No sharing or permissions change. TEST_SCENARIO-02.json is explicitly supplied synthetic input, not a production requirement.

## UX Intent And Success
The operator avoids recreating a filter. After deliberate restore, the effective editor values equal that operator's saved values. Current editor values remain the effective filter until a deliberate successful restore replaces them.

## Working Modes And Effective State
Editing current values, personal slot absent/saved, deliberate save/restore, and failed operation with retry. The current editor values are effective in every mode; the editor presents the state. A saved slot is available input and has no automatic authority over current values.

## Activation, Blockers, Recovery And Transitions
Save requires current values and a nonempty name. Restore requires an existing personal slot. Successful save replaces that slot and leaves current values unchanged. Successful deliberate restore replaces current values immediately. Failed save preserves the previous slot and current values; failed restore preserves current values. Show the operation error and visible retry. Closing ends the active view; reopening exposes the same personal slot without applying it.

## Acceptance Criteria

- criterion_id: AC-001
- requirement: In saved-slot mode, deliberate restore replaces current effective values with the same operator's saved values. The editor shows Restored <name>; with no slot, restore is unavailable. Failed restore preserves current values and offers visible retry.
- observable_success: Current values equal previously saved values after successful restore.
- required_evidence: Save/modify/restore observation, state comparison and failure/retry observation.

- criterion_id: AC-002
- requirement: In editing mode, successful named save creates or replaces the one personal slot and shows Saved <name> without changing current values. Failed save preserves the previous slot and current values and offers visible retry.
- observable_success: A later restore uses the most recently successfully saved values; current values do not change on save.
- required_evidence: Two-save replacement observation and current/saved state comparisons, including failed save.

- criterion_id: AC-003
- requirement: The editor makes save unavailable without current values and a nonempty name, and restore unavailable without a personal slot. Correcting the missing input or successfully saving makes the respective action available.
- observable_success: Availability matches the declared conditions with visible reason and next action.
- required_evidence: Empty/nonempty-name, absent/present-values and absent/present-slot observations.

- criterion_id: AC-004
- requirement: In each operation failure mode, preserve the applicable state described above, show the operation error and expose a visible retry of the same operation. A successful retry returns to the corresponding saved/restored state.
- observable_success: Error, preserved state, retry action and successful transition are observable for save and restore.
- required_evidence: Failure injection, before/after state comparisons and actual retry observations for both operations.

- criterion_id: AC-005
- requirement: The existing editor presents distinguishable absent-slot, Saved <name>, Restored <name>, save-failed and restore-failed states while current values remain the effective-state authority. Failure states expose the recovery action.
- observable_success: Each action/state has the specified visible feedback without implying that an unapplied saved slot is effective.
- required_evidence: Visible state and effective-value observations for all five states.

- criterion_id: AC-006
- requirement: Closing and reopening exposes the same operator's personal slot without applying it. Current values remain effective until deliberate restore; if the slot is absent, restore remains unavailable with its next action.
- observable_success: Reopening retains access to the named slot without changing current values through automatic restore.
- required_evidence: Close/reopen and before/after effective-value comparisons.

## Non-Goals
Shared filters, permissions changes, multiple slots, automatic restore, technical architecture, implementation or release decisions.

## Users And Roles
One operator saving and restoring their own filter. No additional roles or administrative decisions.

## Constraints
Approved synthetic UR remains the primary source. Analytical inputs are subordinate. These fixture facts authorize no production requirement or gate.

## Evidence Requirements
Each criterion requires its named observable evidence. Source/unit tests cannot substitute for visible product observations. No actual product implementation or visible behavior is claimed by this draft.

## Risks And Open Questions
No material choice remains within the explicit synthetic test specification. Production applicability is not asserted; downstream technical design and executable verification remain later work.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Synthetic personal state and recovery semantics | before_prd | resolved | Explicit TEST_SCENARIO-02.json: one personal slot, current editor values effective, deliberate restore, state-preserving failure and retry | Synthetic test preparation owner |

## Next Step
Record this unapproved draft through the existing PRD-derived-from-UR writer and stop the isolated native test at the pending genuine PRD decision. Never fabricate a user reply or carry test approval into production.

## AGDF Approval Summary (de; source=en)
- Ziel und Umfang: Einen benannten persönlichen Filter speichern und bewusst wiederherstellen; keine Freigabe, Mehrfachablage oder Rechteänderung. Dies ist ein isoliertes Testartefakt.
- AC-001: Bewusstes Wiederherstellen setzt die gespeicherten Werte desselben Nutzers wirksam und zeigt den Erfolg; fehlender Eintrag sperrt die Aktion, Fehler erhält die aktuellen Werte und bietet Wiederholung.
- AC-002: Speichern ersetzt den einen persönlichen Eintrag, zeigt den Namen und lässt aktuelle Werte unverändert; ein Fehler erhält den bisherigen Eintrag.
- AC-003: Name und aktuelle Werte sind Voraussetzung zum Speichern, ein gespeicherter Eintrag zum Wiederherstellen; Grund und nächster Schritt sind sichtbar.
- AC-004: Fehler erhalten den jeweiligen Zustand, zeigen die Ursache und bieten die Wiederholung derselben Aktion; eine erfolgreiche Wiederholung zeigt den Folgezustand.
- AC-005: Editor zeigt fehlenden, gespeicherten, wiederhergestellten und beide Fehlerzustände eindeutig; aktuelle Werte bleiben wirksam, bis bewusst wiederhergestellt wird.
- AC-006: Erneutes Öffnen macht den persönlichen Eintrag zugänglich und löst keine automatische Wiederherstellung aus.
- Entscheidungskontext: Zustände und Fehlerbehandlung stammen aus expliziten synthetischen Testdaten. Keine echte Nutzerfreigabe, Implementierung oder Produktionsanforderung wird behauptet.
