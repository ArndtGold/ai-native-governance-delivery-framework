# TP: Detect invalid review finding rows at recording and correct them at OR

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Shared inspector in `packages/core/lib/control-evaluation/normalized-gaps.js`: `normalizedGapProblems`, `readNormalizedFindings`, `reviewFindingDiagnostics`; `validNormalizedGap` and `inspectQaReports` (`qa-follow-up.js`) use them without changing results for valid input | Implementing agent (Claude Code) | none |
| T-002 | Early check before any write in `run-steps.js` (internal TP Review, Clean Implementation Review, CR and the quick-task `review` step) and `run-artefact-recording.js` (QA report), refusing with `review_findings_invalid` and diagnostics | Implementing agent (Claude Code) | T-001 |
| T-003 | Correction at OR: `reviewCorrectionCandidate` in `internalStepEligibility` (`run-operation-proof.js`) and the content conditions in `run-steps.js`, refusing with `internal_step_not_ready` and a `correction` detail | Implementing agent (Claude Code) | T-001, T-002 |
| T-004 | Correction proof and integrity: `reviewCorrections` in `evidence-bindings.js`; substitution in `approvedMaterialFindings` (`presentation-decision.js`), `bindingSourceAssociation` and `evidenceApplicability`; wiring in `control-evaluation/run-state.js` | Implementing agent (Claude Code) | T-003 |
| T-005 | Closeout refusal detail for invalid rows in `run-steps.js` naming review, finding, field, expected value and the correction path | Implementing agent (Claude Code) | T-001 |
| T-006 | New Core test `packages/core/test/review-findings-correction-test.js`, wired into `packages/cli` `test:run-command-flow`; existing fixtures with invalid rows corrected without weakening assertions | Implementing agent (Claude Code) | T-001 to T-005 |
| T-007 | Regenerate runtime copies through the existing build stages, run the named suites, re-pin stale eval fingerprints and re-record host-compatibility evidence with the existing tools, and record CD+Tests evidence | Implementing agent (Claude Code) | T-001 to T-006, T-008 |
| T-008 | After all code tasks, re-pin `plugins/agdf/meta/copilot-payload-baseline.json` with `node scripts/payload-budget.js --accept --files N --bytes M --reason ...` to the exact measured final payload with a rationale naming this run, then rerun `node scripts/sync-package-assets.js` | Implementing agent (Claude Code) | T-001 to T-006 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | `normalizedGapProblems` reports the field and expected value for `none` in `required_next_step` and `evidence`, an unknown gap type, a route not allowed for the gap type, an invalid status, `emergent_risk` without earliest-owner assessment and `requirements_gap` to UR without changed intent; `readNormalizedFindings` reports malformed header, malformed row and duplicate id | `packages/core/test/review-findings-correction-test.js` output |
| AC-001 | SDD-002 | T-002 | SCN-002 | Recording TP Review, Clean Implementation Review and CR as internal steps, the quick-task review step and the QA report with a `none` row is refused with `review_findings_invalid` and diagnostics naming review, finding, field and expected value; RUN_STATE, owned outputs and receipts are unchanged | `packages/core/test/review-findings-correction-test.js` output |
| AC-002 | SDD-001 | T-001 | SCN-003 | `inspectQaReports` returns the same results as before for valid reports and for reports without a finding table | `packages/core/test/review-findings-correction-test.js` output |
| AC-002 | SDD-002 | T-002 | SCN-004 | Valid sources and a pass report without a finding table record as before, and the closeout quality inspection of the recorded reports returns no finding | `packages/core/test/review-findings-correction-test.js` output |
| AC-003 | SDD-003 | T-003 | SCN-005 | On a structured run at OR with UR to UAT approved and an invalid recorded CR, recording a corrected CR with the same decision and classification is accepted, the gate stays OR and no approval changes | `packages/core/test/review-findings-correction-test.js` output |
| AC-004 | SDD-004 | T-004 | SCN-006 | After the correction `reviewCorrections` proves the CR correction from the receipts recorded after the UAT approval | `packages/core/test/review-findings-correction-test.js` output |
| AC-004 | SDD-005 | T-004 | SCN-007 | QA and UAT approvals stay approved and the QA association is current after the correction, while a change that is not a proven correction (a correction receipt with a different status, or a digest matching neither version) still yields `approved_material_sources_changed` and a superseded QA association | `packages/core/test/review-findings-correction-test.js` output |
| AC-005 | SDD-002 | T-002 | SCN-008 | A correction whose new source still has an invalid row is refused with `review_findings_invalid`; nothing is written | `packages/core/test/review-findings-correction-test.js` output |
| AC-005 | SDD-003 | T-003 | SCN-009 | Corrections with a changed decision, a changed classification, a valid recorded review, at gate UAT, and for a `Clean Review` alias row are refused with `internal_step_not_ready` and a correction detail; nothing is written | `packages/core/test/review-findings-correction-test.js` output |
| AC-006 | SDD-006 | T-005 | SCN-010 | Closeout with an invalid recorded review is refused with `closeout_quality_unconfirmed` and a detail naming review, finding, field and the correction path | `packages/core/test/review-findings-correction-test.js` output |
| AC-007 | SDD-003 | T-003 | SCN-011 | A run shaped like `core-approval-lock-defects-20261017-01` (three invalid reviews recorded before the QA report, QA and UAT approved) records corrected TP Review, Clean Implementation Review and CR at OR | `packages/core/test/review-findings-correction-test.js` output |
| AC-007 | SDD-004 | T-004 | SCN-012 | In the same run shape, `reviewCorrections` proves all three corrections | `packages/core/test/review-findings-correction-test.js` output |
| AC-007 | SDD-005 | T-004 | SCN-013 | In the same run shape, approvals stay valid, the QA association stays current and closeout is recorded | `packages/core/test/review-findings-correction-test.js` output |
| AC-008 | SDD-003 | T-003 | SCN-014 | A run shaped like `mcp-ergonomics-baseline-20261016-01` (invalid CR seen by the QA approval, TP Review and Clean Implementation Review absent and unseen) records the corrected CR and late-records both reviews at OR | `packages/core/test/review-findings-correction-test.js` output |
| AC-008 | SDD-004 | T-004 | SCN-015 | In the same run shape, the CR correction is proven while both reviews count as unseen late recordings | `packages/core/test/review-findings-correction-test.js` output |
| AC-008 | SDD-005 | T-004 | SCN-016 | In the same run shape, approvals stay valid with both exceptions combined and closeout is recorded | `packages/core/test/review-findings-correction-test.js` output |
| AC-009 | SDD-007 | T-007 | SCN-017 | `npm run test:verification`, the CLI smoke chain and the mcp-server suite pass apart from the known machine-dependent `test:performance` budget (F09) | CD+Tests command results |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-001 | SCN-002 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-002 | SCN-003 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-002 | SCN-004 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-003 | SCN-005 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-004 | SCN-006 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-004 | SCN-007 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-005 | SCN-008 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-005 | SCN-009 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-006 | SCN-010 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-007 | SCN-011 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-007 | SCN-012 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-007 | SCN-013 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-008 | SCN-014 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-008 | SCN-015 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-008 | SCN-016 | `node packages/core/test/review-findings-correction-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing assertions for this scenario | Stop and report the failing assertion |
| AC-009 | SCN-017 | `npm run build:prepare`; `npm --prefix packages/cli run smoke-test` steps; `npm --prefix packages/mcp-server test`; `npm run test:verification`; `node scripts/verify-ci.mjs --stage <id>` for the other CI stages | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | MCP dependencies installed after the build | Implementing agent | Logs recorded in CD+Tests | Record the failing step and fix or route it |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Test file placement and fixture updates | SD: Test file placement and fixture updates | resolved | New Core file `packages/core/test/review-findings-correction-test.js`, added to `packages/cli` `test:run-command-flow`; fixtures with `none` or other invalid rows get valid rows with the same meaning; no assertion is weakened | Implementing agent (Claude Code) |
| Copilot payload budget re-pin | TP | resolved | The runtime grows with this change against a zero-headroom baseline; T-008 re-pins it to the exact final measurement with the existing tool and a rationale naming this run, as for T-010 of the D1 to D4 run | Arndt Gold, TP owner |
| Rebuild order for MCP tests | TP | resolved | After Core changes run `npm run build:prepare`, then `npm ci --ignore-scripts` in `packages/mcp-server`, before mcp-server tests | Implementing agent (Claude Code) |

## 4. Brownfield Scope

Before implementation inspect: `normalized-gaps.js`, `qa-follow-up.js`, `run-steps.js`, `run-artefact-recording.js`, `run-operation-proof.js`, `run-operations.js`, `approval-operations.js`, `presentation-decision.js`, `evidence-bindings.js`, `control-evaluation/run-state.js`, `closeout-readiness.js`, the D4 test harness in `approval-chain-defects-test.js`, and every test fixture that authors normalized finding rows.

## 5. Out Of Scope

Relaxing the quality contract; changing receipt, approval or binding schemas; new commands; correction at gates other than OR; recovering the two stuck runs; any write to run `mcp-ergonomics-baseline-20261016-01` or the main checkout; commit, push, pull request, release or reinstall.

## 6. Risks And Blockers

- Fixture fallout from the earlier check; a fixture change that weakens an assertion blocks QA.
- The correction proof must not accept a change the approvals did not see as a correction; SCN-007 is mandatory.
- The installed runtime 0.14.5 governing this run contains neither D4 nor D5; this run's own reviews use valid rows and are recorded before the QA report.

## 7. Next Step

Review this task and test plan and approve only with `Approval: TP`.

## AGDF Approval Summary (de; source=en)

- Ziel: Alle neun Abnahmekriterien und alle sieben Designentscheidungen sind konkreten Aufgaben und Testszenarien zugeordnet, die mit den bestehenden Suites laufen.
- Aufgaben: T-001 gemeinsamer Prüfer mit Felddiagnosen. T-002 Prüfung beim Erfassen von Reviews und QA-Bericht. T-003 Korrektur am OR-Gate mit den Inhaltsbedingungen. T-004 Korrekturnachweis aus den Receipts und Ausnahme für Freigabematerial und QA-Zuordnung. T-005 Closeout-Ablehnung mit Korrekturweg. T-006 neue Core-Testdatei und korrigierte Fixtures ohne geschwächte Prüfungen. T-007 Neuaufbau, Suites, Eval-Fingerprints und Kompatibilitätsevidenz. T-008 Payload-Grenze exakt auf den Endstand neu setzen.
- Tests: SCN-001 bis SCN-017 decken jede Prüfregel, jeden Erfassungsweg, gültige Quellen, die Korrektur am OR, gültig bleibende Freigaben, den Negativfall für andere Änderungen, alle abgelehnten Korrekturen, die Closeout-Meldung und beide Abnahmefälle geformt wie die festsitzenden Runs ab.
- Nachweise: `npm run test:verification`, die CLI-Smoke-Kette, die mcp-server-Suite und die übrigen CI-Stufen mit Ergebnissen in CD+Tests.
- Risiken: Fixtures mit ungültigen Zeilen müssen angepasst werden; der Negativfall SCN-007 ist Pflicht; die installierte Laufzeit enthält den Fix nicht.
- Nächster Schritt: Diesen TP prüfen und nur mit `Approval: TP` freigeben; danach folgt die Brownfield-Analyse vor der Implementierung.
