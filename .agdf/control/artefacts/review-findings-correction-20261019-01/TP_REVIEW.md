# TP Review: Detect invalid review finding rows at recording and correct them at OR

Gate: TP Review
Type: Task Plan Review
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent), cooperative assurance

## Scope

Fulfilment of the approved TP tasks T-001 to T-008 and scenarios SCN-001 to SCN-017 against PRD AC-001 to AC-009 and SD SDD-001 to SDD-007.

## Task Fulfilment

| task_id | status | evidence |
|---|---|---|
| T-001 | done | `normalizedGapProblems`, `readNormalizedFindings`, `reviewFindingDiagnostics` and `maskFindingCells` in `normalized-gaps.js`; `inspectQaReports` delegates without changing results for valid input; SCN-001, SCN-003 |
| T-002 | done | Recording checks before any write for internal TP Review, Clean Implementation Review and CR, the `review` step and the QA report including its references; `review_findings_invalid` with at most 64 diagnostics; SCN-002, SCN-004, SCN-008 |
| T-003 | done | `reviewCorrectionCandidate` and `reviewCorrectionRefusal` in `run-operation-proof.js`, applied by `run-steps.js`; SCN-005, SCN-009, SCN-011, SCN-014 |
| T-004 | done | `reviewRecordingChains` and `reviewCorrections` in `presentation-decision.js`; substitution in `approvedMaterialFindings`, `bindingSourceAssociation`, `evidenceApplicability` and `inspectApprovedArtefact`; wiring in `run-state.js`; SCN-006, SCN-007, SCN-012, SCN-013, SCN-015, SCN-016 |
| T-005 | done | `closeoutQualityDetail` in `run-steps.js`; SCN-010 |
| T-006 | done | `packages/core/test/review-findings-correction-test.js` (cases A, B and C plus unit cases), wired into `test:run-command-flow`; D4 test fixtures adjusted without weakening assertions |
| T-007 | done | Rebuild, every CI stage, every mcp-server suite, `test:verification`, eval fingerprints unchanged, host-compatibility evidence re-recorded; results in CD+Tests |
| T-008 | done | Copilot payload baseline re-pinned to the exact final measurement 260 files / 2288614 bytes with a rationale naming both runs; `sync-package-assets` passes |

## Scenario Coverage

All scenarios SCN-001 to SCN-017 map to passing assertions in `review-findings-correction-test.js` or to command results recorded in CD+Tests. Each SD decision has at least one scenario per mapped criterion, as the TP traceability check requires.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | emergent_risk | TP | resolved | The independent code review added scenarios beyond the TP wording: uncorrectable recorded tables, text outside the invalid cells, a CR recorded through the review step, a UAT approval without a material receipt, QA references and the diagnostics bound. earliest-owner assessment: they refine SCN-009 and SCN-011 to SCN-016 within tasks T-002 to T-004 and need no TP change | No further action; covered by the added test cases |
| TPR-02 | emergent_risk | TP | resolved | T-004 also extends `inspectApprovedArtefact` in `artefact-binding-proof.js`, which the TP Brownfield scope did not list. earliest-owner assessment: it is an approval-material check of SDD-005 inside task T-004 and needs no TP change | No further action; recorded in CD+Tests and CODE_REVIEW CR-08 |
