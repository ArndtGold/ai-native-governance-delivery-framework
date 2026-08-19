# UR: Parent Reconciliation Handoff

Status: `approved`
Gate: `UR`
Revision: `1`
Date: `2026-08-19`
Owner: user / agent
Gate approval: exact `Approval: UR` accepted on 2026-08-19 after same-run, same-gate and Revision 1 revalidation.

## Problem

A separately accepted Child run can close cleanly while an explicitly linked Parent or programme run
still describes the Child at an earlier gate. AGDF currently has Context Graph reconciliation for
knowledge closeout, but no general closeout handoff that makes this Parent-state obligation visible.
This leaves stale next actions, delayed aggregation and avoidable manual cleanup without invalidating
the Child delivery itself.

## Desired Outcome

When a Child closeout has an explicit durable Parent or programme relationship, AGDF should expose a
single, non-authorizing reconciliation handoff. The handoff must make the Parent target, current
reconciliation state and one next action visible while preserving the Child's independent QA, UAT
and OR result.

## Scope

- define the canonical Parent-reconciliation outcome in the existing closeout Runtime Contract;
- make `release-or` report the outcome for explicitly related Parent/programme runs;
- let `delivery-closeout` consume the recorded outcome without owning a second rule set;
- define how programme aggregation distinguishes an aggregate that may start from one that is ready
  for final acceptance;
- evaluate a deterministic Doctor or Delivery Map diagnostic for stale explicit Child-to-Parent
  relationships without inferring relationships from names or directory structure;
- add focused contract, skill, control-state and regression evidence for the selected design.

## Acceptance Signals

1. A Child OR with an explicit durable Parent relationship reports reconciliation as resolved, not
   applicable or open, with concrete Parent references and exactly one next action.
2. An open Parent reconciliation never revokes or blocks an independently valid Child QA, UAT or OR.
3. `release-or` and the closeout Runtime Contract remain the semantic owners; `delivery-closeout`
   consumes their result and does not duplicate evaluation logic.
4. Programme aggregation can record `startable` separately from `final-ready` without creating a new
   approval gate or decision authority.
5. Any machine diagnostic relies only on explicit durable relationships, remains non-authorizing
   and does not mutate the Parent automatically.
6. Existing runs without a Parent/programme relationship retain their current closeout behavior.
7. Generated surfaces, Runtime Integrity, control-state tests and focused closeout evaluations remain
   deterministic and green.

## Non-Goals

- making every Child discover or mutate a Parent automatically;
- blocking Child completion until a Parent run is updated;
- inferring Parentage from run IDs, filenames, folders, branches or chat history;
- creating another gate, approval value, state store, Context Graph owner or aggregation authority;
- retroactively rewriting historical completed runs;
- changing unrelated roadmap requirements, runtime behavior or active runs;
- commit, push, pull request, release, deployment or reinstall.

## Known Evidence

- `agdf-staged-proportionality-baseline-v3` completed with QA/UAT and OR while its explicit Parent
  `agdf-product-maturity-roadmap` still pointed to the Child TP approval step.
- The subsequent manual Parent reconciliation corrected BL-14, WS-02, RMP-10 readiness, backlog and
  Parent control state without changing Child authority.
- `plugin/meta/contracts/closeout.md`, `release-or` and `delivery-closeout` already own adjacent
  closeout and operational handoff semantics.
- Context Graph reconciliation proves that a resolved/open/non-applicable closeout projection can be
  enforced without turning a report into a new gate.

## Open Questions For Brownfield Review

- Which existing explicit Artefact Chain relationship shapes are reliable enough for deterministic
  Parent detection?
- Should the diagnostic live in Doctor, Delivery Map, or both, and at what severity?
- Which minimum programme-run evidence justifies `startable` and `final-ready` aggregation states?
- Which templates and generated surfaces must change to preserve one semantic owner?

## Approval Boundary

This UR authorizes only Brownfield Review and proportional Mode/Slice selection after exact approval.
It does not authorize PRD, SD, TP, implementation, validation changes or Parent mutation.

Exact approval required: `Approval: UR`
