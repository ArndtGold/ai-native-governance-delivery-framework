# UAT Evidence: Parent Reconciliation Handoff

Status: `approved`
Gate: `UAT`
Revision: `1`
Date: `2026-08-19`
Owner: user
Based on: approved QA Report Revision 1

Exact `Approval: UAT` accepted on `2026-08-19` after same-run, same-gate and Revision 6
revalidation, with the evidence boundary below retained.

## Acceptance Decision

Decide whether to accept the repository-proven Parent reconciliation handoff with the disclosed
live-host and real cross-repository evidence limits.

## User-Visible Outcome

- A completed Child remains complete even when an explicitly related Parent still needs
  reconciliation.
- Parentage activates only from an explicit durable Child relationship and an exact reciprocal
  Parent relationship; names, paths, chat history and proximity do not infer it.
- The closeout outcome is exactly `resolved`, `not_applicable` or `open`. An open outcome names one
  target and one next action without creating an approval or blocking Child delivery.
- `release-or` reports the evaluated result and `delivery-closeout` consumes it without
  rediscovery, reclassification or Parent mutation.
- Programme aggregation distinguishes `startable` from `final_ready` as evidence projections, not
  gates or approval values.
- Doctor, Gate Check and Delivery Map expose the same additive, non-authorizing diagnostic from one
  evaluator.

## Acceptance Evidence

| Acceptance area | Result | Evidence |
|---|---|---|
| Explicit-only Parent relationship | pass | focused evaluator suite covers absent, valid, invalid, duplicate, traversal, self and missing reciprocal evidence |
| Independent Child completion | pass | accepted-open cases preserve Child delivery authority and delivery-closeout handoff |
| One semantic owner and one evaluator | pass | Closeout contract owns meaning; release-or reports; delivery-closeout consumes; Doctor/Gate/Map parity passes |
| Compact visible recovery | pass | open state produces one named target, one action and one deterministic human diagnostic |
| Programme aggregation readiness | pass | startable/final-ready implications, acceptance-root and evidence-completeness cases pass |
| Compatibility and propagation | pass | legacy runs remain `not_applicable`; Runtime Integrity, package proof, public plugin and generated parity pass |
| Approved plan and quality | pass | 17/17 TP tasks, 12/12 acceptance obligations, 6/6 UX rows, mandatory reviews and QA pass |

## Evidence Boundary

Repository evidence proves deterministic parsing, evaluation, projection, generated-surface parity
and package completeness. It does not prove authenticated host rendering, installed-cache freshness,
human compliance or a live relationship spanning two real repositories. Acceptance may acknowledge
these as explicit post-release observation limits; it must not relabel them as performed evidence.

## Intentionally Not Delivered

- automatic Parent discovery or mutation;
- a new gate, approval value, state store or universal programme schema;
- migration or retroactive grading of historical runs;
- authenticated-host or real cross-repository observation;
- commit, push, PR, release, deployment or plugin reinstall.

## Decision Options

- Approve with exact `Approval: UAT` to accept the repository behavior and disclosed evidence
  boundary, then prepare the final Orchestration Report.
- Request revision and name the unmet acceptance outcome.
- Decline UAT.
