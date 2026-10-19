# OR: Detect invalid review finding rows at recording and correct them at OR

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: review-findings-correction-20261019-01
- related_ur: .agdf/control/artefacts/review-findings-correction-20261019-01/UR.md
- related_prd: .agdf/control/artefacts/review-findings-correction-20261019-01/PRD.md
- related_sd: .agdf/control/artefacts/review-findings-correction-20261019-01/SD.md
- related_tp: .agdf/control/artefacts/review-findings-correction-20261019-01/TP.md
- related_qa_report: .agdf/control/artefacts/review-findings-correction-20261019-01/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/review-findings-correction-20261019-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/review-findings-correction-20261019-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/artefacts/review-findings-correction-20261019-01/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/review-findings-correction-20261019-01/PRD.md |
| SD | approved | .agdf/control/artefacts/review-findings-correction-20261019-01/SD.md |
| TP | approved | .agdf/control/artefacts/review-findings-correction-20261019-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/review-findings-correction-20261019-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/review-findings-correction-20261019-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/review-findings-correction-20261019-01/CODE_REVIEW.md |
| TP Review | done | .agdf/control/artefacts/review-findings-correction-20261019-01/TP_REVIEW.md |
| Clean Implementation Review | done | .agdf/control/artefacts/review-findings-correction-20261019-01/CLEAN_IMPLEMENTATION_REVIEW.md |
| QA | approved | .agdf/control/artefacts/review-findings-correction-20261019-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-19 · revision 20 · presentation d2bae115-febb-4eca-92ec-c0257994502d sha256:dacc2297ede7ee503941ba51b031bb7db6ce673150293097598cf28fd29e34ce |

All user gates are approved for their exact current material. TP Review and Clean Implementation Review were recorded with valid normalized rows before the QA report, so the QA and UAT approvals saw them. OR records completion; it grants no VCS, installation or publication authority.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Approved bounded delivery complete; this report is published by the canonical closeout transaction |
| Current gate | OR |
| Allowed now | Record exact OR and prepare the operational handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | The owner commits D1 to D5 on `fix/agdf-core-approval-defects-20261017` and opens a pull request |
| Quality outlook | After merge and reinstall, both stuck runs can be corrected at OR and closed with the released runtime |

## Delivered

| Item | Evidence |
|---|---|
| Recording of TP Review, Clean Implementation Review, Code Review and QA report refuses invalid normalized rows with finding, field, expected value and rule, by the closeout rules | CD_TESTS.md T-001, T-002; `review-findings-correction-test.js` |
| Correction at OR after Approval: UAT of a recorded review whose only defect is an invalid next step, changing exactly those cells | CD_TESTS.md T-003; cases A, B, C |
| Receipt-derived proof keeps QA and UAT approvals, the QA association and the closeout approved-source proof valid for exactly that correction | CD_TESTS.md T-004 |
| Closeout refusal names the correction path where it is available | CD_TESTS.md T-005 |
| Copilot payload baseline, host-compatibility evidence and context graph entry | CD_TESTS.md T-007, T-008; CONTEXT_GRAPH.md |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Recovery of run `core-approval-lock-defects-20261017-01` | Needs the released runtime; this run's PRD excludes it | Owner, after merge and reinstall |
| Recovery of run `mcp-ergonomics-baseline-20261016-01` | Needs the released runtime; no writes to that run were allowed | Run owner, after merge and reinstall, with the guide in the shared session notes |
| Correction of evidence cells | Narrowed in review: evidence the approvals saw stays unchanged | none, by design |
| Commit, push and pull request | The owner commits | Owner |
| `test:performance` warm-dispatch budget (F09) | Pre-existing and machine-dependent | MCP ergonomics Phase 3 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| End-to-end cases A, B and C through the real writers, plus unit cases for every refusal | packages/core/test/review-findings-correction-test.js | D5 detection, correction, approvals | direct |
| Read-only check of the recorded reviews of both stuck runs against the correction rules | CD_TESTS.md Real-Data Check | recoverability of the real runs | direct |
| Every CI stage, all 73 smoke steps, mcp-server suites, test:verification | CD_TESTS.md | T-001 to T-008 | direct |
| Code Review with two independent rounds, CR-01 to CR-15 resolved | CODE_REVIEW.md | solution integrity | direct |
| TP Review and Clean Implementation Review pass | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md | TP fulfilment, structure | direct |
| QA pass and exact approvals of QA and UAT | QA_REPORT.md; RUN_STATE.md Approvals | delivery acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| GitHub CI has not run because nothing is committed | warn | Owner commits and opens a pull request; CI must pass before merge |
| The correction has not run against the two real stuck runs with an installed runtime | warn | After merge and reinstall, correct and close both runs |
| Reviews are agent reviews without a human code review | warn | Owner review of the pull request |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| A correction changes a recorded review after human approvals | warn | Limited to invalid next-step cells and proven by receipts; tests cover every refused variant |
| An older runtime reading a corrected run reports the approvals as changed | warn | Recover the stuck runs only with the released runtime |
| The earlier check refuses review and QA sources that used to record without error | warn | The refusal names finding, field and expected value |
| `test:performance` budget stays machine-dependent (F09) | warn | MCP ergonomics Phase 3 |
| The change is uncommitted in the worktree | warn | Owner commits |

## Retained Fallbacks And Exit Criteria

None. The OR correction path is a permanent, receipt-bound rule for reviews recorded with an invalid next step, not a fallback.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: The defect surfaced in run `core-approval-lock-defects-20261017-01` and affects `mcp-ergonomics-baseline-20261016-01`; neither is a Parent of this run and no reconciliation object exists.
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The existing node `CG-RUN-SCOPED-CONTROL-STATE` carries the new entry `review_findings_correction_20261019`, which links this run's evidence; no new node.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The recording-time finding rules and the receipt-bound OR correction are lasting control-state invariants; run-specific test runs stay in this run's evidence.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE

## Next Permissible Step

- next_allowed_action: The owner commits D1 to D5 on `fix/agdf-core-approval-defects-20261017` and opens a pull request; delivery-closeout may prepare the commit handoff.
- required_approval: none
- forbidden_until_then: commit, push, pull request, installation or publication without a separate explicit user instruction.

## Quality Outlook

After merge and reinstall, correct the reviews of `core-approval-lock-defects-20261017-01` and `mcp-ergonomics-baseline-20261016-01` at OR and close both runs.

## Approval

OR does not approve later gates. It records the next permissible step.
