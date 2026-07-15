# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: verified-change-path
- lifecycle: completed
- revision: 1
- revision_id: 66514732-8a1f-4a76-9f95-6ecdbe98ecc1
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Maintain the fail-closed Verified Change path between Trivial Change and Structured Slice without weakening scope, ownership, evidence or escalation controls.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved Verified Change implementation, QA and UAT evidence already exist in `.agdf/control/artefacts/verified-change-path/`. |
| What is approved? | UR, PRD, SD, TP, QA and UAT are recorded in the canonical artefacts. |
| What is missing? | OR / delivery closeout. |
| What is the next allowed action? | Create the Orchestration Report and offer delivery closeout. |
| What is explicitly forbidden right now? | Commit, push, pull request and release without separate explicit instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/verified-change-path/UR.md` |
| PRD | approved | `.agdf/control/artefacts/verified-change-path/PRD.md` |
| SD | approved | `.agdf/control/artefacts/verified-change-path/SD.md` |
| TP | approved | `.agdf/control/artefacts/verified-change-path/TP.md` |
| QA | approved | `.agdf/control/artefacts/verified-change-path/QA_REPORT.md` |
| UAT | approved | `.agdf/control/artefacts/verified-change-path/UAT_REPORT.md` |

## Artefacts

| Type | Path | Status |
|---|---|---|
| UR | `.agdf/control/artefacts/verified-change-path/UR.md` | approved |
| Brownfield Review | `.agdf/control/artefacts/verified-change-path/BROWNFIELD_REVIEW.md` | done |
| PRD | `.agdf/control/artefacts/verified-change-path/PRD.md` | approved |
| SD | `.agdf/control/artefacts/verified-change-path/SD.md` | approved |
| TP | `.agdf/control/artefacts/verified-change-path/TP.md` | approved |
| Brownfield Analysis | `.agdf/control/artefacts/verified-change-path/BROWNFIELD_ANALYSIS.md` | done |
| CD+Tests | `.agdf/control/artefacts/verified-change-path/CD_TESTS.md` | done |
| TP Review | `.agdf/control/artefacts/verified-change-path/TP_REVIEW.md` | pass |
| Clean Implementation Review | `.agdf/control/artefacts/verified-change-path/CLEAN_IMPLEMENTATION_REVIEW.md` | pass |
| CR | `.agdf/control/artefacts/verified-change-path/CODE_REVIEW.md` | done | pass |
| Code Review | `.agdf/control/artefacts/verified-change-path/CODE_REVIEW.md` | pass |
| QA | `.agdf/control/artefacts/verified-change-path/QA_REPORT.md` | pass |
| UAT Report | `.agdf/control/artefacts/verified-change-path/UAT_REPORT.md` | accepted |
| OR | `.agdf/control/artefacts/verified-change-path/OR.md` | pass |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Approved UR artefact and approval record |
| PRD | derived_from | UR | Approved PRD artefact |
| SD | derived_from | PRD | Approved SD artefact |
| TP | derived_from | SD | Approved TP artefact |
| CD+Tests | implements | TP | `.agdf/control/artefacts/verified-change-path/CD_TESTS.md` |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/verified-change-path/QA_REPORT.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA and UAT reports | `.agdf/control/artefacts/verified-change-path/QA_REPORT.md`; `.agdf/control/artefacts/verified-change-path/UAT_REPORT.md` | Approved framework scope and user acceptance | direct |
| Orchestration Report | `.agdf/control/artefacts/verified-change-path/OR.md` | Final delivery outcome and closeout boundary | direct |

## Closeout

- next_allowed_action: Create the Orchestration Report and offer delivery closeout.
- quality_outlook: UAT accepted; only auditable closeout remains.
