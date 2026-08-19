# SD: Parent Reconciliation Handoff

Status: `approved`
Gate: `SD`
Revision: `1`
Date: `2026-08-19`
Owner: user / agent
Based on: approved PRD Revision 1 and completed Brownfield/UX analysis

## 1. Design Decision

Extend the existing closeout path with one optional, explicit Child-to-Parent reconciliation record.
The Closeout Runtime Contract owns its meaning, a selected Child `RUN_STATE.md` owns its mutable
declaration, `release-or` projects it into the Child OR, and `delivery-closeout` consumes that OR
without rediscovery. Delivery Map owns deterministic evaluation and exposes the same result
additively to Doctor and Gate Check through their existing composition.

This design does not create a gate, approval, state store, scanner or Parent mutation path.

## 2. Canonical Ownership

| Concern | Canonical owner | Responsibility | Explicit non-owner |
|---|---|---|---|
| Outcome semantics and authority | `plugin/meta/contracts/closeout.md` | Define `resolved | not_applicable | open`, independent Child completion, accepted-open handling and programme readiness | skills and validators must not redefine meaning |
| Mutable Child declaration | selected Child `RUN_STATE.md` | Record one optional explicit Parent run relationship and one reconciliation next action | chat, names, branches and directories are not authority |
| Audit projection | `release-or` and the existing OR template | Report the evaluated handoff and evidence in the Child OR | OR does not infer or mutate relationships |
| Operational handoff | `delivery-closeout` | Consume the reported OR outcome and retain the Parent note in delivery text | no filesystem search, reclassification or Parent update |
| Deterministic evaluation | Delivery Map | Qualify explicit relationships, compare reciprocal evidence and emit additive JSON/findings | Doctor and Gate Check consume; they do not reevaluate |
| Programme readiness | Parent/programme `RUN_STATE.md` plus its declared acceptance artefact | Project `startable | final_ready` from explicit Child and acceptance evidence | no universal programme workflow or approval authority |

## 3. Durable Relationship Model

### 3.1 Child declaration

The existing `Artefact Chain` is reused. A Child relationship qualifies only when exactly one row has:

- `From`: `OR`
- `Relationship`: `reconciles_with`
- `To`: `parent_run:<run_id>` where `<run_id>` satisfies the existing run-id grammar
- non-empty concrete evidence that names the intended Parent scope

An optional `## Parent Reconciliation Handoff` section in the Child `RUN_STATE.md` records only the
operator-controlled handling input:

- `parent_reconciliation_disposition`: `action_required | accepted_open`
- `parent_reconciliation_next_action`: exactly one concrete action

It does not persist a second Parent ID, outcome or evidence copy. Delivery Map derives those values
from the single qualifying Artefact Chain row and reciprocal Parent state; the final Child OR stores
the evaluated audit projection. Missing, duplicate, invalid or conflicting relationship rows
evaluate to `open`; the evaluator never chooses among candidates.

### 3.2 Reciprocal Parent evidence

A relationship is `resolved` only when the named Parent run exists and its `Artefact Chain` contains
exactly one evidenced reciprocal row:

- `From`: `Aggregate`
- `Relationship`: `includes`
- `To`: `child_run:<child_run_id>`
- non-empty evidence that references the Child OR or its accepted closeout evidence

No qualifying Child relationship means `not_applicable`. A qualifying Child relationship without
valid reciprocal evidence means `open`. Parent state is read-only during evaluation; repair remains
a separately authorized Parent action.

### 3.3 Accepted open handoff

`accepted_open` records a deliberate coordination boundary without changing the normalized `open`
outcome. It permits the independently complete Child to proceed through delivery closeout while the
OR retains the named Parent, evidence gap and one next action. It never asserts Parent reconciliation
or programme final readiness.

## 4. Evaluation And Public Projection

Add a focused pure evaluator under `create-agdf/lib/control-evaluation/` and invoke it only from
Delivery Map. Extend `run-state-parser.js` with optional reconciliation and aggregation fields; empty
legacy state returns the existing behavior.

Delivery Map JSON gains two additive top-level objects:

- `parent_reconciliation`: normalized outcome, target run ID, disposition, evidence, missing evidence
  and next action;
- `programme_aggregation`: independent `startable` and `final_ready` booleans, acceptance reference,
  evidence and missing evidence. `final_ready: true` always implies `startable: true`.

An unresolved explicit relationship emits warning-level
`AGDF_PARENT_RECONCILIATION_OPEN`. Invalid or conflicting explicit evidence emits warning-level
`AGDF_PARENT_RECONCILIATION_EVIDENCE_INVALID` and normalizes to `open`. Warning severity is
deliberate: the issue stays visible but cannot revoke or block valid Child QA, UAT or OR completion.
Doctor and Gate Check inherit these findings through the current Delivery Map composition and add no
second logic.

The human-facing diagnostic names the Child, exactly one Parent target when valid, the evidence gap
and one recovery action. It renders no approval control. No relationship means no new finding or
routine legacy output.

## 5. Programme Aggregation Readiness

An optional `## Programme Aggregation Readiness` section on an explicit Parent/programme run records
the programme-owned inputs:

- `programme_acceptance_ref`: one declared acceptance artefact beneath `.agdf/control/artefacts/`
- `programme_aggregation_evidence`: concrete Child/aggregate evidence
- `programme_aggregation_missing_evidence`: concrete gaps or `none`

The evaluator derives `startable: true` only when at least one evidenced reciprocal
`Aggregate | includes | child_run:<run_id>` row points to a Child with a completed OR. It derives
`final_ready: true` only when startable is true, the declared acceptance artefact exists beneath the
canonical control artefact root and
`programme_aggregation_missing_evidence: none`. Failed prerequisites remain explicit as false with a
warning and precise next action; they are never silently promoted. These values are evidence status
only and never satisfy QA, UAT or another user gate.

The design intentionally defines only this readiness boundary. Programme-specific criteria, owners
and acceptance matrices remain in the referenced programme artefact.

## 6. OR And Delivery Handoff

Extend the existing OR template with one optional `Parent Reconciliation Handoff` section containing
the evaluated fields and one optional `Programme Aggregation Readiness` section for Parent runs.
`release-or` must report the Delivery Map result verbatim in meaning and keep Child delivery status
separate from Parent coordination.

`delivery-closeout` reads the final OR section when present. For `open`, it includes the Parent target
and next action in the operational summary but does not withhold an otherwise valid commit offer.
For `resolved` or `not_applicable`, it stays compact. It must not inspect sibling runs, evaluate
reciprocal evidence or edit a Parent.

## 7. Compatibility, Failure And Recovery

- Existing runs without the optional sections or qualifying Artefact Chain row remain
  `not_applicable` internally and produce no new warning or mandatory visible ceremony.
- All JSON additions are optional/additive; existing keys and exit behavior remain intact except
  that a genuinely open explicit relationship may raise the existing aggregate status to `warn`.
- Duplicate candidates, invalid run IDs, missing Parent runs, unreadable Parent state, missing
  reciprocal evidence and contradictory disposition inputs fail to `open`, never to inferred success.
- The evaluator reads only repository-local canonical run state and validates every derived path
  before access; no arbitrary evidence path becomes a filesystem target.
- Recovery is always one of: repair the Child relationship declaration, reconcile the named Parent
  through its own governed scope, provide the declared programme evidence, or deliberately retain
  `accepted_open` in the Child closeout.
- No automatic migration is required. Optional template additions guide new records only.

## 8. Propagation And Change Surface

Expected canonical implementation owners:

- `plugin/meta/contracts/closeout.md`
- `plugin/meta/contracts/control-scaffold.md`
- `plugin/skills/release-or/SKILL.md`
- `plugin/skills/delivery-closeout/SKILL.md`
- `plugin/control/templates/RUN_STATE.md`
- `plugin/control/templates/artefacts/OR.md`
- `create-agdf/lib/control-state/run-state-parser.js`
- `create-agdf/lib/control-evaluation/delivery-map.js`
- one focused reconciliation evaluator in `create-agdf/lib/control-evaluation/`
- focused control-state/evaluator tests, skill eval cases, smoke assertions and Runtime Integrity
- `CG-DOCUMENTATION-CEREMONY-BOUNDARY` and `CG-RUN-STATUS-CARD`

Canonical plugin sources propagate through the existing package asset synchronizer. Generated Codex,
Claude, Copilot and OpenCode copies are derived outputs and must pass Runtime Integrity; the installed
plugin cache is not an implementation target.

## 9. Verification Design

Deterministic fixtures must prove:

1. legacy/no relationship produces no finding and no visible ceremony;
2. one valid reciprocal relationship resolves;
3. missing, stale or unavailable Parent evidence yields `open` with one action;
4. duplicate, invalid or contradictory evidence fails closed without choosing a Parent;
5. `accepted_open` preserves both open coordination and independently complete Child delivery;
6. Parent reconciliation never changes gate satisfaction, QA, UAT or OR completion;
7. `startable` requires canonical completed-Child evidence;
8. `final_ready: true` requires `startable: true`, the declared acceptance reference and no missing
   evidence;
9. `release-or` reports and `delivery-closeout` consumes without reclassification;
10. Delivery Map, Doctor and Gate Check expose one shared finding/result;
11. repository path validation blocks traversal or arbitrary evidence access; and
12. canonical/generated surfaces, package contents, smoke and Runtime Integrity remain in parity.

Repository evidence can prove parser, evaluation, projection and generated parity. Authenticated host
rendering, real cross-repository coordination and operator compliance remain explicit UAT/non-claims.

## 10. Requirement Traceability

| PRD requirement | Design owner |
|---|---|
| PRH-1 explicit relationship | Section 3.1 and repository-local path validation in Section 7 |
| PRH-2 normalized outcome | Sections 3.2 and 4 |
| PRH-3 independent Child completion | Sections 3.3, 4 and 6 |
| PRH-4 single closeout ownership | Sections 1 and 2 |
| PRH-5 visible interaction | Sections 4 and 6 |
| PRH-6 programme readiness | Section 5 |
| PRH-7 deterministic diagnostic | Section 4 |
| PRH-8 compatibility and propagation | Sections 7 and 8 |
| PRH-9 evidence and quality | Section 9 |

## 11. Rejected Alternatives

- **A new Parent reconciliation skill as semantic owner:** rejected because it would duplicate
  Closeout/OR authority and make delivery-closeout rediscover state.
- **Name or directory inference:** rejected because proximity is not authority.
- **Doctor-specific scanner:** rejected because Delivery Map already owns relationship evaluation and
  Doctor consumes it.
- **Automatic Parent mutation:** rejected because it transfers scope and authority across runs.
- **Blocking Child completion:** rejected because reconciliation is coordination evidence, not a gate.
- **A universal programme schema:** rejected; only the two-state readiness projection is shared.

## 12. Next Step

Draft and review the Task/Test Plan. Implementation remains forbidden until TP is separately
approved and the required pre-implementation Brownfield Analysis passes.
