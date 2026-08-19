---
name: release-or
description: Use this skill at the end of every relevant run to produce a compact, auditable Orchestration Report. It summarizes gate status, delivered and intentionally not delivered work, TP coverage, Brownfield fit, solution integrity, open risks, and the next permissible step.
---

# release-or

## Purpose
Produce the Orchestration Report (OR) as the mandatory closeout for a relevant run.

It reports:

- current user gate
- whether the run is `pass`, `revise`, `block`, or not yet QA-decided
- what was delivered
- what was intentionally not delivered
- missing approvals
- TP coverage status
- Brownfield fit
- solution integrity
- documentation impact
- Context Graph impact
- evaluated Parent reconciliation and programme aggregation from Delivery Map
- open risks, blockers, retained fallbacks, and exit criteria
- next permissible step
- whether further quality follow-up or a separate delivery closeout is useful

## Runtime Contract
Use these focused runtime-contract modules:

- `../../meta/contracts/closeout.md`
- `../../meta/contracts/quality.md`
- `../../meta/contracts/context-graph.md`
- `../../meta/contracts/control-scaffold.md`

OR-specific output must make gate status, delivered and intentionally not delivered content, missing approvals, missing evidence, risks, retained fallbacks, and the next permissible step visible.
When `.agdf/control/` is present, persist or link the OR under `.agdf/control/artefacts/<key>/OR.md` and reference it from the selected canonical `RUN_STATE.md` or `MASTER_BACKLOG.md` when it is steering-relevant.
Use the Runtime Contract definition of `Relevant Run` to decide whether OR is mandatory or whether a Quick Task mini-closeout is enough.

## Rules
1. OR is always allowed and mandatory for relevant runs as defined in the Runtime Contract.
2. OR is an audit report, not a blocking gate.
3. Do not leak artefacts from blocked later gates.
4. Use OR-lite when early gates block.
5. Use OR-full only within the allowed scope.
6. Report status, not marketing language.
7. Name missing approvals, partial implementation, risks, fallbacks, Brownfield issues, and open defects.
8. Retained fallbacks require visible exit criteria and cleanup path.
9. End with the immediately permissible next step.
10. `CD+Tests` is not completion.
11. When moving a backlog item to Completed or Superseded, use the canonical human-readable table and link the final OR with a document-relative Markdown link.
12. For an executed `verified_change`, a lifecycle-consistent complete Mini-Closeout in the linked `VERIFIED_CHANGE.md` is the compact OR target; do not require a separate `OR.md` by ritual.
13. Keep machine status normalization in the CLI; do not write internal snake_case status values into the human-facing backlog.
14. Reconcile Context Graph impact before clean closeout: report `context_graph_reconciliation: resolved | not_applicable | open_gap`.
15. If Context Graph work remains unresolved, report it as an explicit open gap and do not describe the run as cleanly handoff-ready.
16. After writing or updating `MASTER_BACKLOG.md`, run `doctor --json` (or the locally available equivalent) and resolve any `AGDF_BACKLOG_STATUS_UNKNOWN` or `AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN` finding before closeout. See the AGDF control scaffold's `MASTER_BACKLOG.md` template Rules section for the canonical status/artefact label vocabulary.
17. When Delivery Map exposes `parent_reconciliation`, report that evaluated object without
    rediscovering or reclassifying the relationship. Keep Child completion and Parent coordination
    visibly separate. An `open` result retains exactly one next action and does not invalidate Child
    QA, UAT or OR completion.
18. Report `programme_aggregation` only when applicable. Preserve `startable` and `final_ready` as
    non-authorizing evidence values; never treat either as a gate or approval.

## When To Use
- at the end of every relevant run
- after artefact creation
- when a gate blocks
- after `CD+Tests`
- after `code-review`
- after QA
- after UAT
- whenever a compact audit closeout is needed

Do not force OR onto a pure explanation, read-only inspection, small review, or local debugging step that produces no durable state change and no gate consequence.

## Inputs
Use what is available:

- current gate
- existing approvals
- artefacts created in this run
- intentionally not delivered content
- Task Plan
- `task-plan-review`
- `brownfield-analysis`
- `clean-implementation-review`
- `code-review`
- QA Report
- UAT Report
- documentation impact review
- Context Graph impact
- known risks, defects, fallbacks, and open questions
- test/build status and relevant metrics

If information is missing, state the gap instead of guessing.

## Workflow
1. Determine the current gate and earliest blocker.
2. Determine report depth:
   - `OR-lite`: gate status, allowed/forbidden outputs, missing approval, next step
   - `OR-full`: also delivered artefacts, TP coverage, Brownfield fit, solution integrity, risks, fallbacks, QA/UAT status
3. Record the selected `Report mode` and durable OR target or link when `.agdf/control/` exists.
4. Record delivered vs intentionally not delivered content.
5. Summarize TP coverage if a TP exists.
6. Summarize Brownfield fit and solution integrity if reviewed.
7. Summarize tests and verification.
8. Summarize documentation and Context Graph impact if relevant.
9. Record Context Graph reconciliation as `resolved`, `not_applicable`, or `open_gap`.
10. Copy applicable evaluated Parent reconciliation and programme aggregation from Delivery Map into
    the OR without mutating another run.
11. Name retained fallbacks and exit criteria.
12. Set exactly one next permissible step.
13. Set exactly one quality outlook.
14. State whether `delivery-closeout` is the next operational handoff step when code changes exist and the delivery state allows it.

## Output
Use a compact structure:

```text
## OR
- gate:
- report_mode:
- artefact:
- status:
- delivered:
- intentionally_not_delivered:
- evidence:
- missing_evidence:
- risks:
- retained_fallbacks:
- required_next_step:
- quality_outlook:
```

When Context Graph impact is relevant, include the fields from `../../meta/contracts/context-graph.md`.
Include `context_graph_reconciliation` whenever Context Graph impact is present. If the value is `open_gap`, required next step must resolve or explicitly retain that gap before commit-ready or release-ready handoff.

## Forbidden
This skill must not:

- decide QA in place of `qa-gate`
- call `CD+Tests` complete, QA-ready, or release-ready
- hide missing approvals
- provide later-gate content while an earlier gate blocks
- produce the operative commit/PR handoff owned by `delivery-closeout`
- execute commit, push, or PR actions
- infer Parentage, scan sibling runs independently or mutate a Parent
