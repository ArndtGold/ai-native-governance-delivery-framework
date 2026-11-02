# PRD: Synthetic saved filter

Status: draft
Gate: PRD
Gate approval: open
Owner: Test product owner
Traceability contract: criteria-chain-v1

## Product Scope
Save and restore one named user-owned filter. No sharing or permissions change.

## Acceptance Criteria
- criterion_id: AC-001
- requirement: Saving and restoring reproduces the selected filter values for the same user.
- observable_success: The restored filter values equal the saved values.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Saved-filter ownership | before_prd | resolved | Only the saving user owns the filter | Test product owner |

## AGDF Approval Summary (de; source=en)
- Ziel und Umfang: Einen persönlichen Filter speichern und wiederherstellen.
- Umfang: Ein benannter Filter ohne Freigabe für andere Nutzer.
- AC-001: Wiederherstellung reproduziert die gespeicherten Filterwerte desselben Nutzers.
- Entscheidungskontext: Persönliche Eigentümerschaft ist geklärt.
