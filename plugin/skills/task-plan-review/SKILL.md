---
name: task-plan-review
description: Use this skill after code changes and before QA to verify whether the approved Task Plan was actually fulfilled. It checks each task_id against implementation, acceptance criteria, tests, visible evidence, and deviations, and provides TP coverage for QA.
---

# task-plan-review

## Purpose
Verify whether implementation actually satisfies the approved Task Plan.

For each relevant task, this skill determines:

- whether the task is fully, partially, or not completed
- which acceptance criteria are done, partial, missing, or not verifiable
- which files, tests, runtime evidence, or UI evidence support the finding
- evidence strength
- which gaps must be handed to `qa-gate`

This skill provides TP coverage. It is not the final QA decision.

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for Quality Contract output, Context Graph fields, gate terms, and non-duplication rules.

TP-specific output must evaluate every relevant `task_id` with completion status, AC coverage, evidence, missing evidence, and QA-relevant gaps.
If `context_graph_required_action` is not `none`, the affected task is complete only if follow-up, evidence, or an intentionally open gap is visible.

## Rules
1. The Task Plan is the reference, not plausible code.
2. No assumptions without evidence.
3. Evaluate each relevant `task_id` individually.
4. `fully_done` requires strong evidence.
5. A green build alone does not prove TP completion.
6. UI/state/render/recovery tasks need visible evidence, not only code.
7. Partial implementation must be marked `partially_done`.
8. P0/P1 gaps must be handed to QA.
9. Out-of-scope changes must be reported.
10. When evidence is unclear, fail closed to at least `partially_done`.

## Clarifications
### TP Slice Before Target State
If the TP explicitly defines a preparatory, additive, or limited slice, evaluate that exact scope.
`fully_done` is allowed for a completed slice even if the larger target state remains open.

### Missing Priorities
If no priorities are defined, do not invent them. Mark the gap and treat QA relevance conservatively.

### Missing Acceptance Criteria
If ACs are unclear, derive only obvious expectations from title, goal, and scope. Mark AC basis as incomplete and lower evidence confidence as needed.

## When To Use
- after `CD+Tests`
- before `QA`
- when TP completion is unclear
- when the user asks for TP fulfilment
- when UI/state/runtime invariants are affected
- when several agents or work steps touched the same TP

## Inputs
Use what is available:

- Task Plan
- `task_id`, `story_id`, priorities
- acceptance criteria or success goals
- changed files
- tests and test results
- build results
- runtime/UI evidence
- known deviations and scope decisions

If TP or relevant tasks are missing, do not claim reliable TP coverage.

## Output
Use this compact structure:

```text
## TP Coverage
| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|

## Summary
- fully_done:
- partially_done:
- not_done:
- out_of_scope_changes:
- risks:
- required_next_step:
```

Completion status:

- `fully_done`
- `partially_done`
- `not_done`

AC status:

- `done`
- `partial`
- `missing`
- `not_verifiable`

Evidence confidence:

- `high`
- `medium`
- `low`

### Compact Chat Output

At `pass`: one line — `TP Review: pass — <X>/<total> tasks fully_done`.
At `revise`/`block`: show incomplete tasks with missing evidence.

## Forbidden
This skill must not:

- decide final QA
- mark tasks fully done from code existence alone
- hide partial work
- upgrade missing evidence into confidence
- reinterpret the TP scope
