# PRD: Parent Reconciliation Handoff

Status: `approved`
Gate: `PRD`
Revision: `1`
Date: `2026-08-19`
Owner: user / agent
Based on: approved UR Revision 1, completed Brownfield Review and UX Intent Definition `ready`

## 1. Product Outcome

AGDF must make an explicitly related Parent or programme reconciliation visible when a Child closes,
without weakening or delaying the Child's independently valid QA, UAT and OR result. The handoff is
coordination evidence, not a new gate, approval or mutation authority.

## 2. Users And Primary Job

The primary users are delivery owners and maintainers coordinating independently gated Child runs
inside a Parent or programme scope. They need to know, at closeout, whether the Child is complete,
whether a named Parent still needs reconciliation and exactly what one coordination action remains.

## 3. Requirements

### PRH-1 — Explicit Relationship Boundary

Parent reconciliation activates only from an explicit durable relationship supported by concrete
evidence. Run names, directories, branches, backlog proximity and chat history must never establish
Parentage.

### PRH-2 — Canonical Reconciliation Outcome

The closeout semantic owner must expose exactly one normalized outcome:

- `resolved`: the explicit Parent/programme reference is current for the Child closeout;
- `not_applicable`: no explicit Parent/programme relationship exists;
- `open`: an explicit relationship exists but reconciliation is missing, stale or not verifiable.

An `open` outcome includes concrete Parent references, evidence or missing evidence and exactly one
next action.

### PRH-3 — Independent Child Completion

Parent reconciliation never grants, revokes or blocks Child gates. A Child with valid QA, UAT and OR
remains complete when the Parent handoff is open. The surface must not describe an open coordination
handoff as failed Child delivery.

### PRH-4 — Single Closeout Ownership

The existing Closeout Runtime Contract owns meanings and authority boundaries. `release-or` reports
the outcome in the OR. `delivery-closeout` consumes the reported state for operational handoff and
must not independently rediscover, reclassify or mutate Parent relationships.

### PRH-5 — Visible Interaction

The primary closeout surface must show Child completion separately from Parent reconciliation. An
open outcome shows one named target and one recovery action, without approval controls. Resolved and
not-applicable outcomes remain compact.

### PRH-6 — Programme Aggregation Readiness

An explicitly declared programme aggregation may be:

- `startable`: canonical Child evidence is sufficient to begin or maintain an aggregate; or
- `final_ready`: every programme-declared acceptance and evidence condition is complete.

These values are evidence projections only. They do not approve QA/UAT, create a gate or define a
universal programme schema. Incomplete critical evidence keeps `final_ready` false while allowing an
honest startable aggregate.

### PRH-7 — Deterministic Diagnostic

AGDF should provide a non-authorizing deterministic diagnostic when an explicit durable relationship
proves that a completed Child and its Parent state conflict. The diagnostic must:

- use an existing Doctor or Delivery Map owner selected in SD;
- avoid automatic Parent mutation;
- avoid name/path inference;
- report concrete source and target evidence;
- use severity proportional to the coordination impact without invalidating Child completion; and
- remain absent for legacy or unrelated runs without qualifying explicit evidence.

### PRH-8 — Compatibility And Propagation

Existing runs without the additive relationship/reconciliation fields retain current behavior.
Canonical source changes propagate through existing generated-surface tooling. Machine-readable
output changes must be additive, version-compatible and documented in design/test evidence.

### PRH-9 — Evidence And Quality

Deterministic tests must cover at least: no relationship, resolved relationship, stale/open Parent,
ambiguous or missing evidence, accepted open handoff, independent Child completion, startable versus
final-ready aggregation, legacy compatibility and generated-surface parity.

## 4. UX Acceptance Criteria

1. A user can identify Child completion, Parent reconciliation and the next action without reading
   internal control files.
2. Reconciliation never renders an approval request or suggests that Parent coordination can change
   Child approval.
3. An open state names exactly one Parent target and one recovery action; ambiguity fails closed.
4. Resolved and not-applicable states remain compact and do not add routine ceremony.
5. Programme readiness visibly distinguishes an aggregate that may start from one ready for final
   acceptance.
6. Transient or stale evidence provides a visible revalidation/retry action without automatic repair.

## 5. Evidence Classes And Non-Claims

- Repository checks can prove parsing, evaluation, projection and generated parity.
- Deterministic fixtures can prove state transitions and fail-closed behavior.
- Neither proves authenticated host rendering or real multi-run agent compliance.
- Historical Parent/Child examples remain evidence; they are not rewritten or retroactively graded.

## 6. Non-Goals

- automatic Parent discovery or mutation;
- blocking Child closeout on Parent availability;
- a new approval value, gate, dashboard, state store or Context Graph node;
- a universal programme-management model;
- retroactive migration of every historical run;
- changing unrelated active Parent or Child runs;
- VCS, release, deployment or reinstall.

## 7. Acceptance Boundary

The product scope is accepted only when the authority split, explicit relationship boundary,
programme readiness semantics, diagnostic non-claims, compatibility behavior and visible recovery
are all implemented through existing owners with deterministic evidence and no parallel evaluator.

## 8. Next Step

Draft and review the Solution Design. Implementation remains forbidden until SD and TP are
separately approved and the required pre-implementation Brownfield Analysis passes.
