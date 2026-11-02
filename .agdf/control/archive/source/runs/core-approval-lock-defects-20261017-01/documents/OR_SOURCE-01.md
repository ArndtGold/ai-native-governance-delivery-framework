# OR: Four AGDF approval-chain defects

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: core-approval-lock-defects-20261017-01
- related_ur: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/UR.md
- related_prd: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/PRD.md
- related_sd: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/SD.md
- related_tp: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/TP.md
- related_qa_report: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/PRD.md |
| SD | approved | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/SD.md |
| TP | approved | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/CODE_REVIEW.md |
| TP Review | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/TP_REVIEW.md |
| Clean Implementation Review | done | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/CLEAN_IMPLEMENTATION_REVIEW.md |
| QA | approved | .agdf/control/artefacts/core-approval-lock-defects-20261017-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-19 · revision 28 · presentation 2a2493ee-91c4-46d4-81fd-768d52c35b0a sha256:1cf75e24bf3612a96a233ba0350505c58a4e271fe2834301bd1b95470ce24cd0 |

The UR source revision `2a2f700b-05bf-42c1-9f28-a8d022314797` (2026-10-17) added the fourth defect (D4) by owner decision; the TP source revision `16da48f8-58e3-4f21-a8d3-cfecab369a28` (2026-10-17) added task T-010 (Copilot payload budget re-pin). UR, PRD, SD and TP were approved again on their current material and every later step was recorded afresh. TP Review and Clean Implementation Review were recorded before the QA report, so the QA and UAT approvals saw them. OR records completion; it grants no VCS, installation or publication authority.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Approved bounded delivery complete; this report is published by the canonical closeout transaction |
| Current gate | OR |
| Allowed now | Record exact OR and prepare the operational handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | The owner commits the change on `fix/agdf-core-approval-defects-20261017` and opens a pull request |
| Quality outlook | After merge and reinstall, the stuck run `mcp-ergonomics-baseline-20261016-01` can record its missing reviews and close out |

## Delivered

| Item | Evidence |
|---|---|
| D1: localized summary reader skips unknown and qualified labelled lines; UR and QA presentation and readiness reject unreadable required fields before approval with the expected line; UAT uses the same owner | CD_TESTS.md T-001, T-002; `approval-chain-defects-test.js` |
| D2: Quality Readiness maps a review recorded `done` to pass | CD_TESTS.md T-003 |
| D3: abandoned in-process MCP worker no longer leaves a stuck run write lock; release only after actual exit and only for the exact own token | CD_TESTS.md T-004, T-005; `run-lock-test.js`, `worker-lock-release.test.js` |
| D4: Approval: QA withheld until TP Review and Clean Implementation Review; receipt-proven late recording and closeout for runs already past QA/UAT | CD_TESTS.md T-006, T-007; `approval-chain-defects-test.js` |
| Fixture, eval fingerprint, host-compatibility evidence and Copilot payload baseline updates | CD_TESTS.md T-008 to T-010; CODE_REVIEW.md CR-17 to CR-19 |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Recovery of run `mcp-ergonomics-baseline-20261016-01` | No AGDF writes to that run were allowed in this run; the recovery needs the fix installed | Owner, after merge and reinstall of the fixed runtime |
| Reinstall or native host re-run with the fixed runtime | Out of the PRD verification scope (source and package suites only) | Owner, next release |
| Commit, push and pull request | The owner commits | Owner |
| `test:performance` warm-dispatch budget on this Windows machine (F09) | Pre-existing and machine-dependent; A/B shows no regression | MCP ergonomics Phase 3 (response budget and warm worker) |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Regression tests with the exact observed shapes and the emulated pre-fix dead end | packages/core/test/approval-chain-defects-test.js | D1, D2, D4 | direct |
| Lock release tests including a real terminated worker thread | packages/core/test/run-lock-test.js; packages/mcp-server/test/worker-lock-release.test.js | D3 | direct |
| Full CLI smoke chain, every verify-ci stage, mcp-server suites, test:verification | CD_TESTS.md | T-001 to T-010 | direct |
| Interleaved performance A/B against main 16d08888 | CD_TESTS.md Performance (F09) | no regression | direct |
| Code Review with two independent rounds, CR-01 to CR-19 resolved | CODE_REVIEW.md | solution integrity | direct |
| TP Review and Clean Implementation Review pass | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md | TP fulfilment, structure | direct |
| QA pass and exact approvals of QA and UAT | QA_REPORT.md; RUN_STATE.md Approvals | delivery acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| GitHub CI on Linux has not run because nothing is committed | warn | Owner commits and opens a pull request; CI must pass before merge |
| The fixed runtime has not run in an installed host session, and the stuck ergonomics run was not recovered | warn | After merge and reinstall, record the missing reviews in `mcp-ergonomics-baseline-20261016-01` and close it out |
| Reviews are agent reviews without a human code review | warn | Owner review of the pull request |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| A late-recorded review is evidence produced after a human QA or UAT decision; a late non-pass review keeps closeout refused with no recovery after Approval: UAT | warn | Decided by PRD AC-009; OR of such runs must disclose late recordings |
| A terminated worker leaks one lock file descriptor per abandoned dispatch (CR-12) | warn | Rare; the lock file itself is removed; revisit if abandoned dispatches become frequent |
| The D1 skip rule skips any colon-labelled prose line (CR-13) | warn | Readability is enforced before approval by the shared check |
| `test:performance` budget stays machine-dependent (F09) | warn | MCP ergonomics Phase 3 |
| The change is uncommitted in the worktree | warn | Owner commits |

## Retained Fallbacks And Exit Criteria

None. The late-recording path for required reviews is a permanent, receipt-bound rule for runs approved before this fix, not a fallback.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: The defects were reported from run `mcp-ergonomics-baseline-20261016-01`, which is not a Parent of this run; no reconciliation object exists.
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER; .agdf/control/CONTEXT_GRAPH.md#CG-RUN-STATUS-CARD
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The existing nodes carry the new entries `approval_chain_defects_20261019` (CG-RUN-SCOPED-CONTROL-STATE), `abandoned_worker_lock_release_20261019` (CG-MCP-DISPATCH-ADAPTER) and `summary_readability_and_review_status_20261019` (CG-RUN-STATUS-CARD), each linking this run's evidence; no new node.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The review-before-QA rule, the receipt-bound late-recording rule, the lock ownership channel and the summary readability owner are lasting control-state invariants; run-specific test runs stay in this run's evidence.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER; .agdf/control/CONTEXT_GRAPH.md#CG-RUN-STATUS-CARD

## Next Permissible Step

- next_allowed_action: The owner commits the change on `fix/agdf-core-approval-defects-20261017` and opens a pull request; delivery-closeout may prepare the commit handoff.
- required_approval: none
- forbidden_until_then: commit, push, pull request, installation or publication without a separate explicit user instruction.

## Quality Outlook

After merge and reinstall of the fixed runtime, recover `mcp-ergonomics-baseline-20261016-01` by recording its missing TP Review and Clean Implementation Review and closing it out.

## Approval

OR does not approve later gates. It records the next permissible step.
