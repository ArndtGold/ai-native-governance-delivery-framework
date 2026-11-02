# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: pages-narrow-bug-track-clarity
- lifecycle: completed
- revision: 1
- revision_id: 12e5c8ff-748c-4046-8aea-cd826ece046e
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Clarify the Narrow Bug Track as a bounded governance aid rather than an independent delivery-path bypass, while distinguishing it from Verified Change.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Approved Pages copy, QA evidence and user acceptance exist for the Narrow Bug Track scope. |
| What is approved? | UR, PRD, SD, TP, QA and UAT are recorded in the canonical artefacts. |
| What is missing? | OR / delivery closeout. |
| What is the next allowed action? | Create the Orchestration Report and offer delivery closeout. |
| What is explicitly forbidden right now? | Commit, push, pull request and release without separate explicit instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UR.md` |
| PRD | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/PRD.md` |
| SD | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/SD.md` |
| TP | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/TP.md` |
| QA | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/QA_REPORT.md` |
| UAT | approved | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UAT_REPORT.md` |

## Artefacts

| Type | Path | Status |
|---|---|---|
| UR | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UR.md` | approved |
| Brownfield Review | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/BROWNFIELD_REVIEW.md` | done |
| PRD | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/PRD.md` | approved |
| SD | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/SD.md` | approved |
| TP | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/TP.md` | approved |
| Brownfield Analysis | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/BROWNFIELD_ANALYSIS.md` | done |
| CD+Tests | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/CD_TESTS.md` | done |
| TP Review | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/TP_REVIEW.md` | pass |
| Clean Implementation Review | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/CLEAN_IMPLEMENTATION_REVIEW.md` | pass |
| CR | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/CODE_REVIEW.md` | done | pass |
| QA | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/QA_REPORT.md` | pass |
| UAT Report | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UAT_REPORT.md` | accepted |
| OR | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/OR.md` | pass |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Approved UR artefact and approval record |
| PRD | derived_from | UR | Approved PRD artefact |
| SD | derived_from | PRD | Approved SD artefact |
| TP | derived_from | SD | Approved TP artefact |
| CD+Tests | implements | TP | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/CD_TESTS.md` |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/QA_REPORT.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA and UAT reports | `.agdf/control/artefacts/pages-narrow-bug-track-clarity/QA_REPORT.md`; `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UAT_REPORT.md` | Approved public-copy scope and user acceptance | direct |

## Closeout

- next_allowed_action: Offer delivery closeout; VCS and release actions require separate explicit instruction.
- quality_outlook: UAT accepted; the approved Pages scope is ready for handoff.
