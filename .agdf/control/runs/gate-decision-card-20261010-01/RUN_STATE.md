# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: gate-decision-card-20261010-01
- lifecycle: active
- revision: 2
- revision_id: ae9a3522-0c26-49a0-8ebc-aa9a01149535
- content_seal: sha256:4da58e59bef956e43707a6e52847fb4b02bc7a0f2de328c4637eb7f31c72bfc5
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- updated_at: 2026-10-10T11:35:47.013Z
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR drafted at `.agdf/control/artefacts/gate-decision-card-20261010-01/UR.md`. |
| What is approved? | Nothing yet. |
| What is missing? | Exact Approval: UR. |
| What is the next allowed action? | Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR. |
| What is explicitly forbidden right now? | create later-gate artefacts beyond the current allowed gate; run Brownfield Analysis as implementation preparation; implement code; claim QA or release readiness |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | missing |  |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/gate-decision-card-20261010-01/UR.md` | draft |  |
| Brownfield Review |  | missing |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | missing |  |
| QA |  | missing |  |

## Mode/Slice Decision

- decision:
- required_next_gate:
- scope_reason:
- evidence:

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/gate-decision-card-20261010-01/UR.md` | problem, goal, scope and acceptance signals | direct |

## Closeout

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook:
