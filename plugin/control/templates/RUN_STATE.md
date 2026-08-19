# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id:
- lifecycle: active
- revision: 1
- revision_id:
- mode: structured_delivery
- current_gate: UR
- decision: in_progress
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? |  |
| What is approved? |  |
| What is missing? |  |
| What is the next allowed action? |  |
| What is explicitly forbidden right now? |  |

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
| UR |  | draft |  |
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

- decision: `quick_task | verified_change | structured_slice | structured_delivery | block`
- required_next_gate:
- scope_reason:
- evidence:

## Parent Reconciliation Handoff

Optional. Omit this section when no explicit `OR | reconciles_with | parent_run:<run_id>` Artefact
Chain row exists. The relationship row owns the Parent ID and evidence; do not copy them here.

- parent_reconciliation_disposition: `action_required | accepted_open`
- parent_reconciliation_next_action:

## Programme Aggregation Readiness

Optional. Use only on an explicit Parent/programme run with evidenced
`Aggregate | includes | child_run:<run_id>` rows.

- programme_acceptance_ref:
- programme_aggregation_evidence:
- programme_aggregation_missing_evidence: `none`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|

## Closeout

- next_allowed_action: Draft the current allowed artefact and preserve evidence.
- quality_outlook: Keep one mutable authority for this run.
