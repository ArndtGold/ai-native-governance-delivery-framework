# Closeout blocker: accepted QA report and strict decision count

Run: compact-execution-continuation-20261014-01
Current revision: 2eeac5d7-d7a3-4ac6-93e5-2ad9947275b7
Current gate: OR
Lifecycle: active; completion pending
QA approval: recorded
UAT approval: recorded

## Observed failure

The installed Core agdf_closeout/closeout.record owner rejected operation b7e1d5af-1be1-4aaf-9f7e-611f4c4418f7 with closeout_obligations_unfulfilled, finding closeout_qa_pass_unconfirmed. No completion effect occurred; the exact revision remains unchanged.

QA_REPORT.md contains Status: pass on line 3 and Decision: pass on line 13. Both values agree and the report was registered, presented, and deliberately approved at QA; UAT was subsequently recorded. I authored the redundant status/decision declarations. The existing evaluateCloseoutReadiness decisive() collector includes both and requires exactly one matching declaration. Its prepared-report checks therefore reject this accepted report.

OR_CANDIDATE.md passes every other prepared closeout obligation. It is an unregistered candidate, not a completed OR. QA_REPORT.md, its approval material, recorded receipts and UAT are preserved byte-for-byte. Code repair and actual installed Quick/Verified qualification remain completed as documented; formal live-Run closeout is not complete.

## Authority boundary

The approved SD preserves existing evidence/revision/closeout writers and does not authorize widening the closeout validator. Existing approved-source revision excludes deliberate UAT and supports UR/PRD/SD/TP, not a post-UAT QA metadata replacement. An ordinary draft replacement cannot overwrite approved QA material. Editing or resealing the report by hand, transferring old replies to a changed report, or bypassing the refused closeout is not an acceptable correction.

## Concrete bounded follow-up proposal

A separate scoped Core correctness repair should reconcile the existing accepted QA decision with closeout observation. Proposed minimal technical direction: the existing closeout decision collector normalizes consistent supported decisive values to one result; it continues to reject no decision or conflicting pass/revise/block declarations. Keep all exact approval/material/source-set/revision/containment checks unchanged. No new gate, approval, state store or post-UAT source-mutation owner.

Before implementing, review whether this consistent-value interpretation preserves the intended ambiguity policy; use the existing governed owner for the new scope. Required regression cases: accepted QA report with matching Status and Decision pass can close; pass/revise conflict cannot close; missing decision cannot close; altered approved bytes remain refused; current genuine QA/UAT and review/source obligations remain required. Requalify the source, installed Core and this unchanged accepted report through the actual closeout owner.

Alternative prevention: authoring/QA readiness should detect redundant decisive report declarations before presentation. That does not alone repair this already accepted Run, and is not represented as recovery of the current closeout.

No validator change or approval reset is performed by this proposal. User authorization for this extra writer correctness scope is needed because it exceeds the approved implementation design. Current report explicitly retains the blocked formal completion.
