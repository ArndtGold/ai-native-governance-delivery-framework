# Task Plan Review: Cross-Host Plugin Runtime Integrity

Status: revise; revision 4
Decision: revise
Date: 2026-08-26
Based on: approved TP revision 3 and CD+Tests revision 3

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CRI-01 through CRI-12 | fully_done | Historical revision-2 implementation and evidence remain unchanged; QA revision 3 reopened only the two explicit reliability gaps | none for the historical slice | none |
| CRI-13 | fully_done | Revision-3 baseline and changed-path inspection show only approved control, installer and corresponding test owners | none | none |
| CRI-14 | fully_done | Positive rebuild and negative current-markerless, malformed-marker, digest-tamper and incomplete-root fixtures exercise all three classifications; existing marketplace, version and runtime validators are reused | none | none |
| CRI-15 | fully_done | Canonical-only stage, direct transaction rollback, simulated host-failure rollback, exact old-root digest restoration, commit cleanup and installer evidence assertions pass | none | none |
| CRI-16 | partially_done | Target-platform POSIX and Windows path matrices pass with the complete local-marketplace suite on macOS | Direct native-Windows CRI-H05 execution | QA must remain revise |
| CRI-17 | partially_done | All declared focused repository checks, release preparation, independent Runtime Integrity, full smoke and the public exact-version 0.13.6 bootstrap pass | Direct native-Windows suite and rebuild transaction evidence | QA must remain revise |
| CRI-18 | partially_done | CD+Tests, Context Graph, TP Review, Clean Review and Code Review revision 3 are refreshed | QA rerun and direct Windows evidence remain | proceed to QA as revise |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| PRD-RI-03, PRD-RI-05, PRD-RI-08 | owned historical reinstall and failure recovery | CRI-14, CRI-15 | Temporary-root rebuild, malformed and tamper blocks, canonical-only target, host-failure rollback | fulfilled | none |
| PRD-RI-06, PRD-RI-09 | installer versus loaded-session evidence | CRI-15 | Installer result names rebuild and restart required and does not claim loaded-session match | fulfilled | none |
| PRD-RI-08, PRD-RI-10 | native-Windows supported path | CRI-16, CRI-17 | Target-path fixtures pass, but no direct native-Windows execution exists after the change | not_verifiable | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CRI-TPR-02 | evidence_gap | evidence_obligation | open | CRI-H05 requires native-Windows execution; only macOS execution with target-platform path semantics is currently available | run the complete local-marketplace suite and owned pre-provenance rebuild and rollback probe on native Windows |

## Summary

- fully_done: 15/18 tasks.
- partially_done: 3/18 tasks.
- not_done: 0.
- out_of_scope_changes: none.
- risks: repository evidence cannot prove native-Windows filesystem behavior.
- required_next_step: consume this revise result in QA and keep CRI-H05 open until direct Windows evidence is supplied.
