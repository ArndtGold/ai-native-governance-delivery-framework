# QA Report: Detect invalid review finding rows at recording and correct them at OR

Status: draft
Gate: QA
Gate approval: open
Based on: TP, CD+Tests, Brownfield Analysis, Code Review, TP Review, Clean Implementation Review
Date: 2026-10-19
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: D5 is fixed on branch `fix/agdf-core-approval-defects-20261017` (uncommitted, on top of D1 to D4). Recording a TP Review, Clean Implementation Review, Code Review or QA report now refuses invalid normalized finding rows, including `none` as next step, with the finding, field and expected value, using the same rules as closeout (also the decision-field rule, QA references and report limits). At gate OR after Approval: UAT, a recorded review whose only defect is an invalid `required_next_step` can be recorded again through the existing `step.record` command, changing exactly those cells; the QA and UAT approvals, the QA association and the closeout approved-source proof recognise this correction from the existing receipts, without a schema change and without renewed approvals. A closeout refused for an invalid row names the correction path where it is available.

All eight TP tasks are done:

| task_id | Status | Evidence |
|---|---|---|
| T-001 to T-005 | done | `CD_TESTS.md` Delivered Implementation; `CODE_REVIEW.md` |
| T-006 | done | `review-findings-correction-test.js` (cases A, B, C and unit cases); D4 test fixtures adjusted without weakening assertions |
| T-007 | done | rebuild, every CI stage, all 73 smoke steps, mcp-server suites, `test:verification`, refreshed host-compatibility evidence (`CD_TESTS.md`) |
| T-008 | done | Copilot payload baseline re-pinned to 260 files / 2290219 bytes |

PRD acceptance AC-001 to AC-009 is covered through the TP traceability (TP section 2); every scenario SCN-001 to SCN-017 maps to a passing assertion or command result (`TP_REVIEW.md`).

## 3. Evidence

- End-to-end tests through the real writers: case A (three reviews with `none` recorded before QA, QA and UAT approved) corrects all three at OR and closes; case B (invalid CR seen by the approvals, TP Review and Clean Implementation Review never recorded) corrects the CR, late-records both reviews and closes; case C (CR recorded through the review step) corrects and closes. Every refusal case writes nothing.
- Real data, read-only: the recorded reviews of both stuck runs are accepted as corrections once only their `none` cells are replaced.
- Solution integrity and code quality: `CODE_REVIEW.md` pass after two independent review rounds, findings CR-01 to CR-15 resolved; `CLEAN_IMPLEMENTATION_REVIEW.md` pass; `TP_REVIEW.md` pass.
- Brownfield fit: `BROWNFIELD_ANALYSIS.md` pass; every change extends an existing owner; receipt, approval and binding formats are unchanged.
- Governance: this run's own reviews use valid rows and were recorded before this report.
- Context Graph: `context_graph_impact: link_only`; `context_graph_refs`: CG-RUN-SCOPED-CONTROL-STATE; `context_graph_required_action: link` at closeout; `context_graph_reconciliation: open_gap` until OR; `context_graph_gate_effect: none` for QA.

## 4. Missing Evidence

- qualification_limits: All results come from Windows 11 with Node v22.22.3 in the worktree; GitHub CI has not run because nothing is committed. The installed runtime 0.14.5 governing this run contains neither D4 nor D5, so the two stuck runs are not recovered here; their recovery is proven on fixtures shaped like them and by a read-only check of their recorded reviews. The correction is narrower than the PRD allowed: only `required_next_step` cells may change, evidence cells stay as the approvals saw them. Reviews are agent reviews without a human code review.

## 5. Risks

- delivery_risks: A correction changes a recorded review after human approvals; it is limited to the next-step cells and proven by receipts, but an older runtime reading a corrected run reports the approvals as changed. The earlier check refuses review and QA sources that used to record without error. The `test:performance` budget stays machine-dependent (F09). The change is uncommitted in the worktree.

## 6. Required Next Step

Request `Approval: QA` for this report; after approval, UAT.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Ungültige normalisierte Befundzeilen fallen beim Erfassen eines Reviews oder QA-Berichts auf, und ein Run, der deshalb am OR-Gate feststeckt, kann ohne erneute Freigaben abschließen.
- Ergebnis: Das Erfassen von TP Review, Clean Implementation Review, Code Review und QA-Bericht lehnt ungültige Befundzeilen, etwa `none` als nächsten Schritt, mit Befund, Feld und erwartetem Wert ab, nach denselben Regeln wie der Closeout. Am OR-Gate nach Approval: UAT kann ein Review, dessen einziger Fehler ein ungültiger nächster Schritt ist, über das bestehende step.record neu erfasst werden, wobei sich genau diese Zellen ändern; QA- und UAT-Freigabe, QA-Zuordnung und Closeout-Nachweis erkennen die Korrektur an den vorhandenen Receipts. Alle acht TP-Aufgaben erledigt; drei End-to-End-Fälle, darunter die Formen beider festsitzender Runs, schließen ab; Code Review mit 15 behobenen Befunden aus zwei unabhängigen Runden bestanden; alle CI-Stufen, alle Smoke-Schritte und test:verification grün, bis auf den bekannten Performance-Test F09.
- Grenzen: Nur Windows und Node 22 im Worktree geprüft; GitHub-CI nicht gelaufen, weil nichts committet ist; die beiden festsitzenden Runs werden erst mit der neuen Laufzeit repariert, hier nur an nachgebildeten Fällen und lesend an ihren echten Reviews belegt; korrigierbar ist bewusst nur der nächste Schritt, nicht die Evidenz; Reviews durch Agenten ohne menschliches Code Review.
- Risiken: Eine Korrektur ändert ein erfasstes Review nach menschlichen Freigaben, begrenzt auf die Zellen des nächsten Schritts und durch Receipts belegt; ältere Laufzeiten melden einen korrigierten Run als geändertes Material; die frühe Prüfung lehnt Quellen ab, die früher ohne Fehler erfasst wurden; Performance-Test F09 bleibt maschinenabhängig; die Änderung ist uncommittet.
