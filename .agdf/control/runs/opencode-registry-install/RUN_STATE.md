# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-registry-install
- lifecycle: completed
- revision: 1
- revision_id: 14c896e7-a08c-4985-9a89-c4a96f08c8ff
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Stabilize OpenCode registry installation and repair parser/transition runtime integrity defects while preserving the global installation and repository activation boundaries.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | QA and real UAT evidence confirm exact registry migration, cache independence, package loadability and state preservation. |
| What is approved? | UR, PRD, SD, TP, QA and UAT are recorded in the canonical artefacts. |
| What is missing? | OR / delivery closeout. |
| What is the next allowed action? | Create the Orchestration Report and offer delivery closeout. |
| What is explicitly forbidden right now? | Commit, push, pull request and release without separate explicit instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/opencode-registry-install/UR.md` |
| PRD | approved | `.agdf/control/artefacts/opencode-registry-install/PRD.md` |
| SD | approved | `.agdf/control/artefacts/opencode-registry-install/SD.md` |
| TP | approved | `.agdf/control/artefacts/opencode-registry-install/TP.md` |
| QA | approved | `.agdf/control/artefacts/opencode-registry-install/QA_REPORT.md` |
| UAT | approved | `.agdf/control/artefacts/opencode-registry-install/UAT_REPORT.md` |

## Artefacts

| Type | Path | Status |
|---|---|---|
| UR | `.agdf/control/artefacts/opencode-registry-install/UR.md` | approved |
| Brownfield Review | `.agdf/control/artefacts/opencode-registry-install/BROWNFIELD_REVIEW.md` | done |
| PRD | `.agdf/control/artefacts/opencode-registry-install/PRD.md` | approved |
| SD | `.agdf/control/artefacts/opencode-registry-install/SD.md` | approved |
| TP | `.agdf/control/artefacts/opencode-registry-install/TP.md` | approved |
| Brownfield Analysis | `.agdf/control/artefacts/opencode-registry-install/BROWNFIELD_ANALYSIS.md` | done |
| CD+Tests | `.agdf/control/artefacts/opencode-registry-install/CD_TESTS.md` | done |
| TP Review | `.agdf/control/artefacts/opencode-registry-install/TP_REVIEW.md` | pass |
| Clean Implementation Review | `.agdf/control/artefacts/opencode-registry-install/CLEAN_IMPLEMENTATION_REVIEW.md` | pass |
| CR | `.agdf/control/artefacts/opencode-registry-install/CODE_REVIEW.md` | done | pass |
| QA | `.agdf/control/artefacts/opencode-registry-install/QA_REPORT.md` | pass |
| UAT Report | `.agdf/control/artefacts/opencode-registry-install/UAT_REPORT.md` | accepted |
| OR | `.agdf/control/artefacts/opencode-registry-install/OR.md` | pass |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Approved UR artefact and approval record |
| PRD | derived_from | UR | Approved PRD artefact |
| SD | derived_from | PRD | Approved SD artefact |
| TP | derived_from | SD | Approved TP artefact |
| CD+Tests | implements | TP | `.agdf/control/artefacts/opencode-registry-install/CD_TESTS.md` |
| QA_REPORT | tests | TP | `.agdf/control/artefacts/opencode-registry-install/QA_REPORT.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| QA and UAT reports | `.agdf/control/artefacts/opencode-registry-install/QA_REPORT.md`; `.agdf/control/artefacts/opencode-registry-install/UAT_REPORT.md` | Registry migration, runtime integrity and user acceptance | direct |

## Closeout

- next_allowed_action: Offer delivery closeout; VCS and release actions require separate explicit instruction.
- quality_outlook: UAT accepted; only auditable closeout remains.
