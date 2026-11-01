# AGDF Run State

Core creates the canonical version-4 document and its identity, revision and seals.
This template describes authored fields; do not copy it as an initialized Run.
Typed records are appended only by their owning current commands. Derived control,
approval, document, relationship and evidence tables are rendered on inspection.

## Objective

Describe the trustworthy outcome.

## Mode/Slice Decision

- scope_reason:
- evidence:

The Run Meta mode is the single routing fact, recorded with the Brownfield Review.

## Relationships

| From | Relationship | To | Evidence |
|---|---|---|---|

Only independent Parent/programme relationships are authored here. Document
source relationships and UR approval relationships derive from typed bindings.

## Parent Reconciliation Handoff

Optional: use only with an evidenced OR reconciles_with parent_run relationship.

- parent_reconciliation_disposition: `action_required | accepted_open`
- parent_reconciliation_next_action:

## Programme Aggregation Readiness

Optional: use only with evidenced Aggregate includes child_run relationships.

- programme_acceptance_ref:
- programme_aggregation_evidence:
- programme_aggregation_missing_evidence: `none`

## Closeout

- quality_outlook:
