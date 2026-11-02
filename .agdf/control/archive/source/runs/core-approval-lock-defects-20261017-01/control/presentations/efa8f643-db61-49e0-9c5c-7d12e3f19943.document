# QA Report: Four AGDF approval-chain defects

Status: draft
Gate: QA
Gate approval: open
Based on: TP, CD+Tests, Brownfield Analysis, Code Review, TP Review, Clean Implementation Review
Date: 2026-10-19
Owner: Arndt Gold

## 1. QA Decision

Decision: `pass`

## 2. TP Coverage

- delivered_result: Four AGDF Core defects from the MCP ergonomics run are fixed on branch `fix/agdf-core-approval-defects-20261017` (uncommitted). D1: the localized approval-summary reader skips unknown and qualified labelled lines instead of ending the block, and UR and QA presentation and readiness reject an unreadable required field before approval, naming the expected line; UAT uses the same reader. D2: Quality Readiness shows a review recorded `done` as pass. D3: the MCP worker executor releases an abandoned owned run write lock after the worker has actually exited, only for its exact own token. D4: Approval: QA is withheld until TP Review and Clean Implementation Review are recorded (and QA reruns if they changed its evidence); a run already approved through QA or UAT without them can record them late, but only when the QA approval receipt proves they were unseen, and then close out.

All ten TP tasks are done:

| task_id | Status | Evidence |
|---|---|---|
| T-001 to T-007 | done | `CD_TESTS.md` Delivered Implementation; `CODE_REVIEW.md` |
| T-008 | done | fixture updates without weakened assertions (`CD_TESTS.md`, CR-17, CR-18) |
| T-009 | done | build, full smoke chain, every CI stage, mcp-server suites, `test:verification`, eval re-pin, refreshed host-compatibility evidence (`CD_TESTS.md`) |
| T-010 | done | Copilot payload baseline re-pinned to 260 files / 2273618 bytes |

PRD acceptance AC-001 to AC-009 is covered through the TP traceability (TP section 2); every scenario SCN-001 to SCN-015 maps to a passing test or command result (`TP_REVIEW.md`).

## 3. Evidence

- Regression tests with the exact observed shapes: `approval-chain-defects-test.js` reads `Problem (Messlücke):` followed by `Ziel`, rejects an unreadable UR goal and QA fields before approval with every expected line, agrees with the UAT observation, maps `done` to pass, and reproduces the D4 dead end on an emulated pre-fix Core and its recovery through closeout, plus the negative cases (non-pass late review, changed material, legacy receipts, the `Clean Review` alias). `worker-lock-release.test.js` covers fake and real terminated workers, a foreign lock and the wiring of both executor entrypoints; `run-lock-test.js` covers every release outcome.
- Suites on the final code: the 73-step CLI smoke chain, every `verify-ci` stage (including build contracts, evals 106/106, compatibility freshness, package archives and consumers, wrapper smoke and pages), the mcp-server suites and `test:verification` pass.
- `test:performance` fails its warm-dispatch budget on this machine with and without the change; an interleaved A/B against `main` `16d08888` shows no slowdown (warm median 765 ms against 792 ms; the change passed 3 of 3 runs, `main` 1 of 3), so it is the pre-existing F09.
- Solution integrity and code quality: `CODE_REVIEW.md` pass after self-review and two independent review rounds, findings CR-01 to CR-19 resolved; `CLEAN_IMPLEMENTATION_REVIEW.md` pass (one owner per rule, existing guards and registries reused, package boundaries kept); `TP_REVIEW.md` pass.
- Brownfield fit: `BROWNFIELD_ANALYSIS.md` pass; every change extends the existing owner in place; record formats, receipts and the summary heading are unchanged.
- Governance: this run itself followed the corrected order; TP Review and Clean Implementation Review were recorded before this report.
- Context Graph: `context_graph_impact: link_only`; `context_graph_refs`: CG-RUN-SCOPED-CONTROL-STATE, CG-MCP-DISPATCH-ADAPTER, CG-RUN-STATUS-CARD; `context_graph_required_action: link` at closeout, as decided in the Brownfield Analysis; `context_graph_reconciliation: open_gap` until OR; `context_graph_gate_effect: none` for QA.

## 4. Missing Evidence

- qualification_limits: All results come from Windows 11 with Node v22.22.3 in the worktree; GitHub CI on Linux has not run because nothing is committed. The installed AGDF runtime that governed this run is the pre-fix 0.14.5, so the fix is not yet installed or exercised in a host session, and the recovery of run `mcp-ergonomics-baseline-20261016-01` was not performed (no writes to that run were allowed); the dead end and its recovery are proven on an emulated pre-fix Core in tests. The real-thread lock release ran on Windows only. Reviews are agent reviews under cooperative assurance, without a human code review.

## 5. Risks

- delivery_risks: A late-recorded review is evidence produced after a human QA or UAT decision (decided by PRD AC-009); the OR must disclose it, and a late non-pass review keeps closeout refused with no recovery after Approval: UAT. A terminated worker leaks its lock file descriptor once per abandoned dispatch (CR-12). The D1 skip rule skips any colon-labelled prose line, readability being enforced before approval (CR-13). The `test:performance` budget stays machine-dependent (F09). The change is uncommitted in the worktree.

## 6. Required Next Step

Request `Approval: QA` for this report; after approval, UAT.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`

## AGDF Approval Summary (de; source=en)

- Ziel: Jeder der vier Kernfehler wird an der frühesten sinnvollen Stelle erkannt oder tritt nicht mehr auf, ohne Freigaben, Belege oder die Sperrsicherheit abzuschwächen.
- Ergebnis: D1: Unbekannte und qualifizierte Schlüssel beenden die lokalisierte Zusammenfassung nicht mehr; UR und QA lehnen unlesbare Pflichtfelder vor der Freigabe mit der erwarteten Zeile ab. D2: Ein mit done erfasstes Review gilt als bestanden. D3: Der MCP-Worker gibt eine verwaiste eigene Schreibsperre nach dem tatsächlichen Worker-Ende frei. D4: Approval: QA erst nach TP Review und Clean Implementation Review; bereits freigegebene Runs können fehlende Reviews nachtragen und abschließen. Alle zehn TP-Aufgaben erledigt; Code Review mit 19 behobenen Befunden, TP Review und Clean Implementation Review bestanden; alle Suiten grün bis auf den bekannten, maschinenabhängigen Performance-Test F09, der laut A/B-Vergleich keine Regression ist.
- Grenzen: Nur Windows und Node 22 im Worktree geprüft; GitHub-CI nicht gelaufen, weil nichts committet ist; der Fix ist noch nicht installiert, der Run mcp-ergonomics-baseline-20261016-01 wurde nicht repariert; die Sackgasse ist nur mit einem nachgebildeten alten Core im Test nachgestellt; Reviews durch Agenten ohne menschliches Code Review.
- Risiken: Nachgetragene Reviews entstehen nach einer menschlichen Entscheidung und müssen im OR offengelegt werden; ein nachgetragenes nicht bestandenes Review hält den Abschluss dauerhaft an; ein abgebrochener Worker hinterlässt pro Fall einen offenen Datei-Handle; Performance-Test F09 bleibt maschinenabhängig; die Änderung ist uncommittet.
