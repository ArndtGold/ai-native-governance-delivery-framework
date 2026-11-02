# Code Review: Detect invalid review finding rows at recording and correct them at OR

Gate: CR
Type: Code Review
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent) with an independent read-only review agent (two rounds); cooperative assurance

## Scope

The D5 delta on branch `fix/agdf-core-approval-defects-20261017` (on top of the uncommitted D1 to D4 change): `normalized-gaps.js`, `qa-follow-up.js`, `run-steps.js`, `run-operation-proof.js`, `presentation-decision.js`, `evidence-bindings.js`, `artefact-binding-proof.js`, `control-evaluation/run-state.js`, the new test `review-findings-correction-test.js`, the adjusted D4 test, the `test:run-command-flow` wiring and the Copilot payload baseline. Governance artefacts under `.agdf/control/` are out of review scope.

## Method

1. Self-review while implementing T-001 to T-008.
2. Independent review round 1 by a separate read-only agent with probe scripts: integrity of the correction path and its receipt-derived proof, consistency between recording and closeout, inspectQaReports regressions, import cycles, error handling and test coverage.
3. Every block, revise and warn finding was fixed and covered by a test, then re-reviewed in round 2 on the fix delta; round 2 confirmed all round 1 fixes and raised one revise, two warn and one info finding, all fixed and covered by tests.
4. A read-only check on real data: the recorded reviews of both stuck runs pass the correction rules once only their `none` cells are replaced.

## Decision

Decision: pass

No open finding remains.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | Round 1 block: `findingClasses` in `run-operation-proof.js` used `readNormalizedFindings`, which stops at the first malformed header or row, so a correction could drop findings after a malformed row or a whole table under a malformed header. Fixed: `reviewCorrectionRefusal` returns `recorded_review_uncorrectable` unless every recorded diagnostic is an `evidence` or `required_next_step` problem of a readable finding row; unit cases cover a malformed row and a malformed header | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-02 | implementation_gap | CD+Tests | resolved | Round 1 revise: the correction compared only decision, status and finding classes, so prose, risks and valid rows could change after the approvals. Fixed: `maskFindingCells` in `normalized-gaps.js` blanks only the next-step cell of the rows that had diagnostics (narrowed in round 2, CR-11); any other difference is refused as `content_changed`, within the approved PRD | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-03 | implementation_gap | CD+Tests | resolved | Round 1 revise: eligibility allowed corrections that `reviewCorrections` could not prove (CR recorded through the `review` step, a UAT approval without a material receipt, no step receipt before UAT, a non-canonical path), which would have marked the approvals as changed. Fixed: one owner `reviewRecordingChains` in `presentation-decision.js` (CR includes `review` receipts, fail closed without a schema 2 or 3 UAT receipt or valid ledgers); `reviewCorrectionCandidate` requires that chain at the canonical path with the seen status; case C and a legacy-receipt unit case cover it | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-04 | implementation_gap | CD+Tests | resolved | Round 1 warn: the missing-findings rule at recording ignored `extractField(content, 'decision')`, which closeout uses, so a report could pass recording and fail closeout. Fixed: `reviewFindingDiagnostics` applies the same rule; unit case | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-05 | implementation_gap | CD+Tests | resolved | Round 1 warn: the QA check at recording did not follow QA report references and let an unreadable QA report pass, while closeout validates both. Fixed: `qaReportReferences` is extracted in `qa-follow-up.js` and used by `inspectQaReports` and by `qaReportDiagnostics` in `run-steps.js`; unreadable reports and references are refused; reads use the 256 KiB bound of `inspectQaReports`; case A covers a referenced invalid review | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-06 | implementation_gap | CD+Tests | resolved | Round 1 warn: unbounded diagnostics could exceed the 1 MiB result budget and turn a refusal into `effect_unknown`. Fixed: `findingsRefusal` returns at most 64 diagnostics with `diagnostics_truncated`; case A covers 70 invalid rows | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-07 | emergent_risk | CD+Tests | resolved | Round 1 info: the check at recording also applies to the quick-task `review` step and to structured runs with accepted QA deviations, whose closeout does not inspect findings, so these recordings are stricter than their closeout. earliest-owner assessment: approved SDD-002 deliberately checks every review and QA recording; a valid row is cheap to write and the refusal names the field | No further action; behaviour decided by SDD-002 |
| CR-08 | implementation_gap | CD+Tests | resolved | Self-review: `inspectApprovedArtefact` in `artefact-binding-proof.js` compares the QA approval receipt material with the current files at closeout, which the SD did not name. A correction refused closeout with `approved_source_proof_invalid`. Fixed: the same proven-correction exception applies there; cases A, B and C close | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-09 | emergent_risk | CD+Tests | resolved | Round 1 info: `reviewCorrections` lives in `presentation-decision.js`, not in `evidence-bindings.js` as the SD named. earliest-owner assessment: evidence-bindings importing the receipt ledgers would join the existing import cycle through `approval-operations.js`; `presentation-decision.js` already owns both ledgers and the approval material, and evidence-bindings receives the proof as data | No further action; location recorded in CD+Tests |
| CR-10 | implementation_gap | CD+Tests | resolved | Verification: the D4 test emulates a pre-fix runtime by removing the eligibility line, which now also carries the correction branch, and its non-pass synthetic reviews had no finding rows that the earlier check now requires. Fixed: the anchor names both branches and non-pass synthetic reviews carry one valid open finding; no assertion was weakened | No further action; `approval-chain-defects-test.js` passes |
| CR-11 | implementation_gap | CD+Tests | resolved | Round 2 revise: every `evidence` problem counted as correctable, including a placeholder evidence and the two content rules (`requirements_gap` to UR without changed intent, `emergent_risk` without earliest-owner assessment), so a correction could add a justification or proof of resolution the approvals never saw. Fixed: problems carry a stable rule id; only `required_next_step` problems are correctable and the evidence cell stays as recorded; unit cases cover all three | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-12 | implementation_gap | CD+Tests | resolved | Round 2 warn: the closeout refusal offered the correction path for any correctable review type, also where the correction would be refused. Fixed: `reviewCorrectionAvailable` in `run-operation-proof.js` requires correctable problems and the candidate preconditions; otherwise the detail says that no correction is available | No further action; fixed and covered by `review-findings-correction-test.js` |
| CR-13 | implementation_gap | CD+Tests | resolved | Round 2 warn: the QA check at recording did not mirror two closeout rules, reference paths with `%`, `?` or `#` and the limit of 64 inspected reports. Fixed: `qaReportDiagnostics` refuses such references and more than 64 distinct reports | No further action; fixed in `run-steps.js` |
| CR-14 | implementation_gap | CD+Tests | resolved | Round 2 info: the missing-findings message named the recorded decision instead of the stated decision that triggered it. Fixed: it names the triggering decision | No further action; fixed in `normalized-gaps.js` |
| CR-15 | implementation_gap | CD+Tests | resolved | Real-data check: a correction source without the final newline of the recorded file counted as `content_changed`. Fixed: the mask ignores invisible trailing whitespace of lines and of the file; a unit case covers it | No further action; fixed and covered by `review-findings-correction-test.js` |

## Verified Safety Properties

- A correction is possible only at OR after the UAT approval, for a review the approvals saw through a material receipt, at its canonical path, and it may change only the `required_next_step` cells of rows with an invalid next step; decision, status, classification, evidence and all other text stay equal.
- The approval-material, QA-association and closeout proofs accept exactly the receipt-proven corrected version; any other digest, path or status still invalidates them (tests).
- A valid recorded review is never replaced; no other internal step becomes recordable after the QA approval.
- Every review and QA recording applies the closeout quality rules, including references and the decision-field rule.
