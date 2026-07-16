# UAT Report: Consistent Gate Recovery and Approval Eligibility

Status: passed
Gate: UAT
Date: 2026-07-16
Run: `gate-check-recovery-command`

## Acceptance Scope

Confirm that the corrected approval path remains actionable without presenting or accepting a decorated
AGDF approval value, and that command recovery no longer recommends an option rejected by `gate-check`.

## Live Evidence

| Scenario | Evidence | Result |
|---|---|---|
| QA approval presentation in the current Codex session | The agent exposed `unavailable_before_invocation`, named `decorated_label_only`, did not invoke the native adapter and requested exact `Approval: QA` in text. | pass |
| Deliberate QA response | The user returned exact `Approval: QA`; the same run, QA gate and revision 16 were revalidated immediately before persistence. | pass |
| Decorated value exclusion | No `Approval: QA (Recommended)` option or response was presented or accepted. | pass |
| Selected control state | Pre-persistence gate-check reported `open`, QA, exact missing approval, `gate_approval`, native false and doctor pass. | pass |
| Automated regression | Six ready gates, ambiguous recovery, illegal option, decorated-only zero-call, Runtime Integrity and full package smoke pass. | pass |

## User Acceptance Decision

- decision: pass
- approval: Exact `Approval: UAT` provided on 2026-07-16 after same-run, same-gate and revision-17 revalidation.
- missing_approval: none
- acceptance_effect: Accept the current implementation and evidence for delivery closeout preparation.
- non_effect: Does not commit, push, open a pull request or release automatically.

## Residual Risk

The repository worktree contains the corrected canonical instructions and generated package assets, while
the currently installed AGDF skill cache still identifies version 0.8.6. A fresh installed-plugin UAT after
delivery remains useful release evidence, but the current live interaction already verifies the intended
fail-closed exact-text behavior.
