---
name: qa-gate
description: Use this skill before any QA decision to determine whether implementation can be classified as pass, revise, or block based on TP coverage, Brownfield fit, solution integrity, evidence, and open blockers. Use it after CD+Tests, after reviews, and before UAT or release decisions.
---

# qa-gate

## Purpose
Make the formal QA gate decision.

This skill is the only final QA decision point for `pass | revise | block`.

It answers:

- whether `QA pass` is allowed
- whether the implementation must be revised
- whether a hard blocker remains
- whether relevant TP tasks are sufficiently verified
- whether P0/P1 tasks are complete
- whether Brownfield fit is sufficient
- whether solution integrity is sufficient
- whether blockers, critical risks, or missing evidence remain

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for Quality Contract output, Context Graph fields, gate terms, and non-duplication rules.

QA-specific `decision` is exactly `pass | revise | block`.
`pass` is allowed only when TP coverage, Brownfield fit, solution integrity, and relevant documentation/Context Graph impact are sufficiently evidenced.
`sot_drift` must not pass silently as a warning.

When post-CD+Tests review evidence exists, present the Runtime Contract's derived Quality
Readiness projection before the detailed QA report: Plan coverage, Solution integrity, Code
quality and QA decision in that order. Name `qa-gate` as the sole decision owner, show one
decisive reason and one permissible next action, and keep detailed reports as evidence links or
on-demand detail. The projection is non-authorizing and must not replace the Run Status Card,
Gate Transition Card or the durable QA report.

## Rules
1. No QA pass without strong evidence.
2. TP is the reference, not merely working code.
3. P0/P1 gaps block `pass`.
4. Brownfield fit is mandatory.
5. UI surface integrity is mandatory for UI-impacting changes.
6. Solution integrity is mandatory.
7. Always output exactly one decision: `pass`, `revise`, or `block`.
8. Open risks, missing tests, partial TP coverage, or side effects must be visible.

## When To Use
- after `CD+Tests`
- after `code-review`
- after `task-plan-review`
- after `clean-implementation-review`
- before UAT
- before any claim that implementation is done, releasable, or QA-ready
- when evidence from Brownfield, TP, or clean-review skills exists

Important:

- `CD+Tests` is implementation and test status only.
- Without review evidence and TP coverage, `QA pass` is not allowed.

## Inputs
Use what is available:

- approved TP and TP Review
- Brownfield Analysis
- Clean Implementation Review
- `code-review` or Code Review Report
- test/build results
- documentation impact review
- runtime or UI evidence
- known blockers and risks

If evidence is missing, lower the decision accordingly.

## Workflow
1. Confirm the relevant gate context.
2. Verify TP coverage.
3. Verify P0/P1 completion.
4. Verify Brownfield fit.
5. Verify solution integrity.
6. Verify tests and evidence strength.
7. Verify documentation and Context Graph impact if relevant.
8. Decide:
   - `pass`
   - `revise`
   - `block`
9. State the single required next step.

## Output
Use this shape:

```text
## QA Gate
- decision: pass | revise | block
- evidence:
- missing_evidence:
- risks:
- required_next_step:
- impact_codes:
```

If Context Graph impact is relevant, include the fields from `../../meta/agdf-runtime-contract.md`.

### Compact Chat Output

At `pass`: one line — `QA: pass — <one-line summary>`. Reference the durable QA report
path. Do not show the Quality Readiness projection or evidence inventory in chat.
At `revise`/`block`: show the decisive dimension, reason and next action.

## Decision Guidance
- `pass`: required TP tasks are done, evidence is strong, no blocking Brownfield or solution-integrity risk remains.
- `revise`: implementation is plausible but missing evidence, partial tasks, UX gaps, or fixable integrity issues remain.
- `block`: hard prerequisite, approval, product semantics, security/compliance, SoT drift, or critical behaviour is unresolved.

## Forbidden
This skill must not:

- grant QA pass from a green build alone
- hide partial task completion
- replace UAT
- treat missing reviews as completed
- downgrade SoT drift to harmless warning
