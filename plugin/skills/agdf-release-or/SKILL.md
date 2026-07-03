---
name: agdf-release-or
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
- open risks, blockers, retained fallbacks, and exit criteria
- next permissible step
- whether further quality follow-up is useful

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for Quality Contract output, Context Graph fields, gate terms, and non-duplication rules.

OR-specific output must make gate status, delivered and intentionally not delivered content, missing approvals, missing evidence, risks, retained fallbacks, and the next permissible step visible.

## Rules
1. OR is always allowed and mandatory for relevant runs.
2. OR is an audit report, not a blocking gate.
3. Do not leak artefacts from blocked later gates.
4. Use OR-lite when early gates block.
5. Use OR-full only within the allowed scope.
6. Report status, not marketing language.
7. Name missing approvals, partial implementation, risks, fallbacks, Brownfield issues, and open defects.
8. Retained fallbacks require visible exit criteria and cleanup path.
9. End with the immediately permissible next step.
10. `CD+Tests` is not completion.

## When To Use
- at the end of every relevant run
- after artefact creation
- when a gate blocks
- after `CD+Tests`
- after `agdf-code-review`
- after QA
- after UAT
- whenever a compact audit closeout is needed

## Inputs
Use what is available:

- current gate
- existing approvals
- artefacts created in this run
- intentionally not delivered content
- Task Plan
- `agdf-task-plan-review`
- `agdf-brownfield-analysis`
- `agdf-clean-implementation-review`
- `agdf-code-review`
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
3. Record delivered vs intentionally not delivered content.
4. Summarize TP coverage if a TP exists.
5. Summarize Brownfield fit and solution integrity if reviewed.
6. Summarize tests and verification.
7. Summarize documentation and Context Graph impact if relevant.
8. Name retained fallbacks and exit criteria.
9. Set exactly one next permissible step.
10. Set exactly one quality outlook.
11. Add a commit-ready handoff only when code changes exist and the delivery state allows it.

## Output
Use a compact structure:

```text
## OR
- gate:
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

When Context Graph impact is relevant, include the fields from `../../meta/agdf-runtime-contract.md`.

For code-changing closeouts that are commit-near, append:

```text
Commit title:
Commit body:
Migration/Rollout note:
```

## Forbidden
This skill must not:

- decide QA in place of `agdf-qa-gate`
- call `CD+Tests` complete, QA-ready, or release-ready
- hide missing approvals
- provide later-gate content while an earlier gate blocks
- execute commit, push, or PR actions
