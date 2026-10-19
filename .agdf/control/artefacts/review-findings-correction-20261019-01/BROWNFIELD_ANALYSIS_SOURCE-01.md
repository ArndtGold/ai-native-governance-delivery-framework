# Brownfield Analysis: Detect invalid review finding rows at recording and correct them at OR

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent), cooperative local analysis

## Scope

Approved TP tasks T-001 to T-008 for D5, against the existing system on branch `fix/agdf-core-approval-defects-20261017`, including the uncommitted D1 to D4 change of run `core-approval-lock-defects-20261017-01`.

## Existing Owners And Reuse Path

| Task | Existing owner | Current coverage | Reuse strategy | Evidence |
|---|---|---|---|---|
| T-001 | `packages/core/lib/control-evaluation/normalized-gaps.js` (`validNormalizedGap`, `declaredRoutes`); table scan inside `qa-follow-up.js` `inspectQaReports` | partially_done: boolean validator, scan not reusable | extend `normalized-gaps.js` with field-level problems and the extracted scan; `inspectQaReports` delegates | `normalized-gaps.js` lines 18-25; `qa-follow-up.js` lines 58-79 |
| T-002 | `run-steps.js` `recordRunStepLocked` (internal branch lines 218-240, `review` branch lines 205-215); `run-artefact-recording.js` `prepareArtefactRecording` (QA decision check lines 45-48) | not_done: recording checks only the decision | call the shared diagnostics before any write; QA check in `run-steps.js` after `prepareArtefactRecording`, because thrown recording errors map to reasons without details (`run-state-edits.js` error table) | Code references in this row |
| T-003 | `run-operation-proof.js` `internalStepEligibility` with the D4 `lateRequiredReviewEligible` branch | not_done: every re-recording after QA approval is refused | add one candidate branch next to the D4 branch; content conditions in `run-steps.js` after the source is read | `run-operation-proof.js` lines 41-65 |
| T-004 | `presentation-decision.js` `approvedMaterialFindings` (D4 unseen-review normalisation); `evidence-bindings.js` `bindingSourceAssociation`, `evidenceApplicability`; `control-evaluation/run-state.js` (D4 `lateReviewTypes`); receipts in `run-operations.js` and `approval-operations.js` | partially_done: D4 exception only | add `reviewCorrections` to `evidence-bindings.js`; extend the same normalisation and recheck points | `presentation-decision.js` lines 86-103; `evidence-bindings.js` lines 74-110; `run-state.js` lines 71-73 |
| T-005 | `run-steps.js` closeout quality check (`inspectQaReports(..., 'pass')`, lines 323-326) | partially_done: refusal names only the row | extend the refusal detail when the cause is an invalid normalized row | `run-steps.js` lines 305-345 |
| T-006 | Core tests; `approval-chain-defects-test.js` provides a fixture with QA and UAT approvals | partially_done | new file `review-findings-correction-test.js` reusing the D4 fixture approach; update only fixtures the earlier check rejects | Fixtures authoring rows: `backlog-work-summary-test.js`, `control-read-provider-test.js`, `qa-deviation-acceptance-test.js`, `run-closeout-command-test.js`, `tp-readiness-test.js`, CLI `cli-gate-scenarios-test.js`, `tp-clarification-test.js`; all inspected rows are valid |
| T-007 | `scripts/verify-ci.mjs`, `packages/cli/package.json` `smoke-test`, `packages/mcp-server/package.json` `test`, `evals` fingerprint re-pin, `npm run compatibility:record` | done (tooling exists) | reuse | D1 to D4 run CD+Tests |
| T-008 | `scripts/payload-budget.js --accept`, `plugins/agdf/meta/copilot-payload-baseline.json` | done (tooling exists) | reuse | D1 to D4 run T-010 |

## Interfaces And Data

- No persisted schema change: Run Operations receipts, Approval Operations, Evidence Bindings, artefact bindings and the owned-output seal keep their formats.
- New additive Core exports: `normalizedGapProblems`, `readNormalizedFindings`, `reviewFindingDiagnostics`, `reviewCorrections`. New additive rejection reason `review_findings_invalid` with `diagnostics`; refused corrections reuse `internal_step_not_ready` with a `correction` detail.
- Step receipts and evidence bindings both use the CRLF- and BOM-normalised sha256 of the source content (`artefactFileDigest`, `canonicalEvidenceDigest`), so the digests in receipts, approval material and the QA binding are comparable.
- The Approval Operations receipt of the UAT approval carries its resulting revision; step receipts carry theirs, which orders recordings against the approval.

## Regression Risks And Test Impact

- Earlier check: any test that records a review or QA report with an invalid row now fails; inspected fixtures use valid rows, so fallout is expected to be small.
- `inspectQaReports` refactor: `qa-deviation-acceptance-test.js`, `run-closeout-command-test.js`, `cli-gate-scenarios-test.js` and the QA follow-up paths must keep their exact results and messages.
- Integrity exception: `presentation-decision` and evidence-binding behaviour must keep refusing every change that is not a proven correction; the D4 tests in `approval-chain-defects-test.js` must stay green.
- Operational localization: the new refusal and detail texts are diagnostic results, not next-action strings of the locale registry; `test:operational-localization` confirms this.
- Copilot payload and host-compatibility evidence grow or change with the runtime and are refreshed through their tools.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE
- context_graph_required_action: link

## Minimal Clean Implementation Path

T-001 (inspector), then T-002 (recording checks), T-003 (correction eligibility), T-004 (proof and integrity), T-005 (closeout detail), T-006 (tests and fixture fallout), T-008 (payload re-pin), T-007 (rebuild, suites, evidence). No parallel parser, validator, receipt field or command is introduced.

## Decision

Decision: pass
