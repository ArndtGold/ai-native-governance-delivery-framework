---
name: code-review
description: Use this skill after code changes and before QA to produce the mandatory Code Review Report for correctness, regression, security, and maintainability findings in the actual diff. It standardizes the CR step without replacing TP review, clean review, or QA.
---

# code-review

## Purpose
Produce the mandatory Code Review Report (CR) for a relevant run.

It answers:

- whether the changed code shows functional defects, security issues, regression risks, or maintainability problems that matter
- whether findings are blocking, revisable, or advisory
- which concrete evidence in files, diffs, tests, or runtime observations supports each finding
- which issues must be fixed before QA
- whether Brownfield, TP, or clean-review follow-up remains open

## Runtime Contract
Use these focused runtime-contract modules:

- `../../meta/contracts/quality.md`
- `../../meta/contracts/context-graph.md`

Code-review-specific output must make actual findings, missing review scope, evidence strength, and the next required step visible.

## Rules
1. Review the actual diff and impacted code, not intent alone.
2. Findings require concrete evidence.
3. Prioritize correctness, safety, data integrity, compatibility, and maintainability over style.
4. Do not generate style-only noise.
5. Missing review scope or evidence must stay visible.
6. Brownfield owners and existing conventions are binding unless deviation is justified.
7. Distinguish blocking defects from fixable review findings.
8. CR does not grant QA pass.

## When To Use
- after `CD+Tests`
- before `QA`
- when code changes exist
- when multiple agents or contributors touched the same area
- when a commit-near change needs explicit review evidence

## Inputs
Use what is available:

- changed files and diff
- affected neighbouring code
- test/build results
- Brownfield Analysis
- Task Plan and TP Review
- Clean Implementation Review
- runtime or UI evidence
- known risks or follow-up decisions

If no code changes are present, do not invent a CR result.

## Workflow
1. Inspect the changed files and directly impacted neighbours.
2. Check correctness, edge cases, and error paths.
3. Check security, data handling, and state ownership risks.
4. Check regression and compatibility risks.
5. Check maintainability only where it creates real defect or change-risk exposure.
6. Classify the overall result:
   - `pass`
   - `revise`
   - `block`
   - `not_applicable`
7. Set exactly one required next step.

## Output
Use this compact structure:

```text
## Code Review
- decision: pass | revise | block | not_applicable
- findings:
  - [severity] file/path - issue - evidence
- missing_evidence:
- risks:
- required_next_step:
```

## Decision Guidance
- `pass`: no meaningful review finding remains evident in reviewed scope.
- `revise`: fixable correctness, regression, or maintainability issues remain.
- `block`: a hard defect, security risk, data-integrity risk, or unresolved critical uncertainty remains.
- `not_applicable`: no code changes were present for review.

### Compact Chat Output

At `pass`: one line — `Code Review: pass — <one-line summary>`.
At `revise`/`block`: show blocking findings with file references. Full report remains in durable file or inline evidence as specified.

## Forbidden
This skill must not:

- decide final QA
- accept a green build as sufficient review evidence
- hide missing review scope
- generate style-only findings
- duplicate TP Review or QA as if they were the same step
