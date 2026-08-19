# AGDF Runtime Contract — Closeout

## Support Answer Bridge

When the user asks about a concrete ticket, issue, incident or support question, end with exactly one smallest useful next step.
Do not treat that next step as approval.
When the next step is gated, name the required approval or AGDF skill instead of implying work may proceed.


## Relevant Run

A relevant run is any run that changes durable state, creates or updates an AGDF artefact, changes code or runtime behaviour, performs a gate decision, blocks on a governance condition, produces QA/UAT/release evidence, or closes a delivery slice.

OR is not mandatory for a pure explanation, read-only inspection, small review, or local debugging step that produces no durable state change and no gate consequence.
When in doubt, use a short OR-lite only if it clarifies gate state, evidence, risk, or the next permissible step.

A `quick_task` fully inside the Non-Normative Trivial Change Boundary above stays exempt from the full
selected-run ceremony even when it is otherwise a relevant run. If a selected canonical
`RUN_STATE.md` currently reflects another scope, append exactly one line to that run's
`Prior Run Pointers` section noting what changed and that it is unrelated; do not edit any other
section or any other existing line.


## Parent Reconciliation Handoff

Parent reconciliation is an optional closeout coordination projection. It never grants, revokes or
blocks Child gates, QA, UAT, OR completion or an otherwise valid delivery handoff.

It activates only when the Child `Artefact Chain` contains exactly one evidenced row with:

- `From`: `OR`
- `Relationship`: `reconciles_with`
- `To`: `parent_run:<run_id>` using the canonical run-id grammar

Names, directories, branches, backlog proximity, chat history and evidence prose do not establish
Parentage. Delivery Map is the single deterministic evaluator. It compares the Child row with one
evidenced reciprocal Parent row `Aggregate | includes | child_run:<run_id>` and returns exactly one
outcome:

- `resolved`: the named Parent has exactly one evidenced reciprocal Child relationship;
- `not_applicable`: the Child declares no qualifying Parent relationship; or
- `open`: the explicit relationship is invalid, ambiguous, unavailable, stale or lacks reciprocal
  evidence.

An open outcome contains concrete evidence or missing evidence and exactly one next action. Optional
Child handling input is limited to `action_required | accepted_open`. `accepted_open` keeps the
outcome open and visible while allowing independently valid Child delivery to continue; it never
asserts Parent reconciliation. Evaluation is read-only and must never mutate a Parent.

`release-or` reports the evaluated result in the Child OR. `delivery-closeout` consumes that OR
projection only; it must not search sibling runs, infer a relationship, reevaluate evidence or repair
a Parent. Unresolved explicit reconciliation is warning-level coordination evidence, not a Child
gate failure. Legacy runs without the optional relationship remain unchanged and add no routine
visible ceremony.


## Programme Aggregation Readiness

An explicit Parent/programme run may project two independent evidence values:

- `startable: true` requires at least one evidenced `Aggregate | includes | child_run:<run_id>` row
  whose Child has a completed OR;
- `final_ready: true` additionally requires one valid declared acceptance artefact beneath
  `.agdf/control/artefacts/`, concrete aggregation evidence and
  `programme_aggregation_missing_evidence: none`.

`final_ready: true` always implies `startable: true`. Failed prerequisites stay false with explicit
missing evidence and one next action; they are never silently promoted. These values are evidence
projections only. They do not approve QA/UAT, create a gate or define the programme-specific
acceptance criteria, which remain owned by the referenced programme artefact.


## Do Not Duplicate

The explanatory framework lives in `docs/`.
The operating philosophy lives in `plugin/meta/agdf-constitution.md`.
The principles live in `plugin/meta/agdf-tenets.md`.
This contract is only the compact runtime interface for skills.
