# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: approval-card-decision-focus
- lifecycle: active
- revision: 1
- revision_id: abb0dab3-319c-4923-a277-100534cecb75
- content_seal: sha256:484f29e9079ceb28efbd5365dcab1bd0a098d12d5575e88ee454c40b88c7cd63
- approval_seal: sha256:1a12f3626da09769bb507d5e9b17ea96172d8ee951f7c05ca7c39d37db56a2ea
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | New run created. |
| What is approved? | Nothing yet. |
| What is missing? | Durable UR and exact approval. |
| What is the next allowed action? | Draft the UR. |
| What is explicitly forbidden right now? | Later artefacts and implementation. |

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
| UR |  | missing |  |
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

## Closeout

- next_allowed_action: Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.
- quality_outlook:
