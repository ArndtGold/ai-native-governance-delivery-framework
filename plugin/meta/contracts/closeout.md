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


## Do Not Duplicate

The explanatory framework lives in `docs/`.
The operating philosophy lives in `plugin/meta/agdf-constitution.md`.
The principles live in `plugin/meta/agdf-tenets.md`.
This contract is only the compact runtime interface for skills.
