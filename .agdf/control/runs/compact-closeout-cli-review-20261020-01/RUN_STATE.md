# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: compact-closeout-cli-review-20261020-01
- lifecycle: active
- revision: 5
- revision_id: 76479136-b994-4b0d-9fe7-e8751abe8ec1
- content_seal: sha256:6acb6ffe08d5e41218583aa99c8ab20d6d9ae49c4b23712d05ea0b61321f7038
- approval_seal: sha256:2c31129fd8bf0c9821042c303e0707fc0c3e42574aaa7ca80f371586b3f0d9b3
- updated_at: 2026-10-20T08:41:47.293Z
- mode: quick_task
- current_gate: Quick Task Execution
- decision: in_progress
- owner: agent

## Objective

After a Code Review recorded through the CLI step, `gate-check` with `continue_delivery` returns the regular compact closeout continuation for `release-or`, so the run can be closed without a workaround. Fail-closed behaviour for registered sources that are missing, replaced or redirected stays unchanged.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Brownfield Review at `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/BROWNFIELD_REVIEW.md` selected `quick_task`. |
| What is approved? | Approval: UR |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Proceed as a Quick Task within the Brownfield Review scope and record verification evidence. |
| What is explicitly forbidden right now? | expand scope beyond the Brownfield Review decision; create broad PRD/SD/TP artefacts by ritual; claim QA or release readiness without evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-20 · revision 3 · `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md` sha256:394a9639fac79fac · presentation 8a3bfbe5-2b65-44ed-98c6-36ca78c86699 sha256:f96bfbf47993f0526ba08684c9831d1b1424d7eeff8417c1a384d9bad0c253f8 |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |

## Mode/Slice Decision

- decision: quick_task
- required_next_gate: Quick Task Execution
- scope_reason: Compact Delivery under the Narrow Code-Fix Criterion: the change is confined to compactContinuation in packages/core/lib/skill-dispatch/compact-continuation.js and restores the approved Compact Delivery closeout for the documented CLI review lane, with a new regression test; no PRD, SD, TP, gate, approval formula or CLI flag/output change.
- evidence: .agdf/control/artefacts/compact-closeout-cli-review-20261020-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-20 · revision 3 · `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md` sha256:394a9639fac79fac · presentation 8a3bfbe5-2b65-44ed-98c6-36ca78c86699 sha256:f96bfbf47993f0526ba08684c9831d1b1424d7eeff8417c1a384d9bad0c253f8 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/compact-closeout-cli-review-20261020-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `quick_task` | direct |

## Closeout

- next_allowed_action: Proceed as a Quick Task within the Brownfield Review scope and record verification evidence.
- quality_outlook:
