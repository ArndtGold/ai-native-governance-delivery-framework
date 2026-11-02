# PRD: Personal saved filter — clarified evidence

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Owner: Test product owner
Traceability contract: criteria-chain-v1

## 1. Product Scope
An operator saves the current filter under one personal name and later restores the saved values. This implements the approved personal-filter need. No team sharing or permission change is promised. An existing duplicate name is rejected with an explanation; its saved values are preserved, as confirmed in the scenario context.

## 2. UX Intent And Success
- ui_ux_impact: low
- ux_intent_definition: directly defined bounded personal-filter semantics from approved UR and the synthetic completed review; no separate analysis required by that review
- primary_user_intent: Avoid recreating the same filter.
- success_signal: Restore the exact previously saved filter values for that operator.
- primary_decision_or_action: Save or restore a named personal filter.

## 3. Working Modes And Effective State
| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Save | Current selected filter remains active; a successful save makes its values available by name | Save result or unresolved failure | Existing filter capability | Existing filter surface |
| Restore | The saved values become the selected filter values after successful restoration | Restored values and result | Existing filter capability | Existing filter surface |

## 4. Activation, Blockers, Recovery And Transitions
- activation_and_deactivation: An explicit save/restore action; no background change is required.
- blockers_and_visible_next_actions: A duplicate name explains the collision and asks for a different name; existing saved values remain intact.
- recovery_paths: An unsuccessful save/restore leaves the current useful values intact and permits a visible retry; technical mechanics remain SD-owned.
- relevant_state_transitions: Save snapshots the selected values under the name; restore selects the saved values and shows the result. No shared ownership transition.

## 5. Acceptance Criteria
- criterion_id: AC-001
- requirement: Successful save and restore reproduce that operator's saved filter values.
- working_mode: Save and Restore
- source_state: Operator has selected filter values, then a saved personal filter.
- trigger_action: Explicit save followed by restore.
- expected_effective_state: Selected values equal the saved values.
- visible_feedback: The resulting values and save/restore outcome are visible.
- blocker_failure_behavior: Failed save/restore does not silently replace the useful selected values.
- recovery_next_action: Resolve the visible failure and retry.
- observable_success: Compare the operator's original saved values with the restored values.
- required_evidence: A concrete save/restore case with visible before/after values. Record the actual original, saved and restored values together; a successful status label alone is insufficient.

## 6. Non-Goals
Shared/team filters, changed permissions and additional filter catalogs are outside the approved need.

## 7. Users And Roles
Operator saves/restores the personal filter. Test product owner resolves product decisions in this isolated scenario; no real user approval is implied.

## 8. Constraints
Preserve the approved personal ownership and existing permission boundaries. Storage and component choices remain SD decisions. Do not overwrite an existing name in this confirmed scenario.

## 9. Evidence Requirements
Trace the draft to the exact approved UR and supplied review; later delivery must demonstrate actual restored values and visible failures rather than code existence alone.

## 10. Risks And Open Questions
Collision policy is confirmed; existing filter persistence and failure mechanics need downstream design evidence without expanding product scope.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Personal ownership | before_prd | resolved | One operator-owned filter; no sharing or permission change, from approved UR | Test product owner |
| Duplicate name | before_prd | resolved | Reject and explain; retain saved values and request another name, from confirmed scenario answer | Test product owner |
| Storage mechanism | later_sd | deferred | Choose existing owned storage during design | Existing filter design owner |
| Executable evidence | later_tp | deferred | Map actual save/restore and visible-failure evidence during planning | Delivery planning owner |

## 11. Next Step
Return to fresh canonical readiness and prepare a decision only when permitted. No implementation or SD is authorized.

## AGDF Approval Summary (de; source=en)
- Ziel: Einen persönlichen Filter speichern und mit denselben Werten wiederherstellen.
- Umfang: Ein benannter persönlicher Filter ohne gemeinsame Nutzung oder geänderte Berechtigungen.
- AC-001: Ein konkreter Speicher-/Wiederherstellungsfall zeigt die gespeicherten und wiederhergestellten Werte sowie sichtbare Ergebnisse. Die tatsächlichen ursprünglichen, gespeicherten und wiederhergestellten Werte werden gemeinsam dokumentiert.
- Entscheidungen: Persönliche Eigentümerschaft ist geklärt; Namenskollisionen sind mit Ablehnung, Hinweis und anderem Namen geklärt. Speicherung gehört zum Design, ausführbare Nachweise zum Taskplan.
