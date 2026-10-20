# TP Review: Four AGDF approval-chain defects

Gate: TP Review
Type: Task Plan Review
Decision: pass
Date: 2026-10-19
Reviewer: Claude Code (agent), cooperative assurance

## Scope

Fulfilment of the renewed approved TP (after TP source revision 16da48f8) tasks T-001 to T-010 and scenarios SCN-001 to SCN-015 against PRD AC-001 to AC-009 and SD SDD-001 to SDD-009.

## Task Fulfilment

| task_id | status | evidence |
|---|---|---|
| T-001 | done | `report-decision.js` localized branch skips unknown and qualified labelled lines and accepts any well-formed source tag; `approval-chain-defects-test.js` reader matrix (SCN-001, SCN-003) |
| T-002 | done | `localizedDecisionFields` in `decision-content-readiness.js`; `requiredLocalizedSummary`, `evaluateApprovalSummaryReadiness`, `renderApprovalSummaryIssue`, `ur-readiness.js`, `delivery-intake.js`; SCN-002, SCN-004, SCN-005 |
| T-003 | done | `statusFromReviewArtefact` maps canonical `done` to pass; SCN-006 |
| T-004 | done | diagnostics-channel announcements and `releaseAbandonedOwnedLock` in `run-state-writer.js`, re-exported by `mcp-dispatch-runtime.js`; `run-lock-test.js` (SCN-007, SCN-009) |
| T-005 | done | `worker.js` token tracking and release after actual exit, shared `ownedLockForwarder`, injection in `main.js` and `generation-entry.js`; `worker-lock-release.test.js` including a real terminated thread and a wiring check (SCN-008, SCN-009) |
| T-006 | done | gate-policy review requirement and QA rerun branch, `STRUCTURED_REQUIRED_REVIEWS`, alias-aware `reviewArtefactType`, en/de locale entries; SCN-011 and the normal-flow block |
| T-007 | done | receipt-proven late eligibility, single association allowance in `evidenceApplicability`, approval-material exception; SCN-012, SCN-013, SCN-014 |
| T-008 | done | fixtures updated without weakening assertions: `control-state-test.js` ready-gate fixture gains both reviews; `backlog-work-summary-test.js` now asserts both `work_pending` and `approval_pending`; `run-lock-test.js` failure-path expectation; `runtime-check-consent-test.js` normalizes the JSON-escaped checkout path (the 320-byte budget is unchanged); the late-gate fixture in `build-contract-checks.js` records both reviews and gains the case `qa-reviews-missing` |
| T-009 | done | prepare profile, mcp-server dependencies, full smoke chain, mcp-server suite, `test:verification`, deterministic skill evals (ur-definition fingerprint re-pinned) and the refreshed host-compatibility evidence; results in CD+Tests |
| T-010 | done | `plugins/agdf/meta/copilot-payload-baseline.json` re-pinned with `scripts/payload-budget.js --accept` to the exact final measurement 260 files / 2273618 bytes, zero headroom; `sync-package-assets` passes |

## Scenario Coverage

All scenarios SCN-001 to SCN-015 map to passing tests or command results recorded in CD+Tests. Each SD decision has at least one scenario per mapped criterion, as the TP traceability check requires.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | emergent_risk | TP | resolved | The independent code review added scenarios beyond the TP wording (QA rerun normal flow, late review at UAT, alias, fail-closed receipts, generation-child wiring). earliest-owner assessment: they refine SCN-011 to SCN-014 and SCN-008 within the approved tasks T-005 to T-007 and need no TP change. | none |
