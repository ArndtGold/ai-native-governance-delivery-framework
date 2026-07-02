---
name: agdf-clean-implementation-review
description: Use this skill to determine whether an implementation is a clean primary solution or whether fallbacks, workarounds, guards, defaults, shims, or parallel structures have made it unnecessarily complex. Use it after code changes, before QA, or whenever symptom treatment is suspected.
---

# clean-implementation-review

## Purpose
Evaluate implementation integrity.

This skill answers:

- was the task solved with a clean primary solution
- was the root cause fixed or only masked
- were unnecessary fallbacks, workarounds, guards, defaults, or shims introduced
- were unnecessary parallel structures introduced
- does the solution fit the existing architecture
- is it maintainable or workaround-heavy

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for Quality Contract output, Context Graph fields, gate terms, and non-duplication rules.

Clean-review-specific output must make the primary solution, fallbacks, workarounds, parallel structures, exit criteria, and next cleanup/review step visible.

## Rules
1. Clean primary solution before fallback.
2. Root cause before symptom masking.
3. Fallbacks are exceptions, not target architecture.
4. Every retained fallback needs rationale, target state, and exit condition.
5. No silent parallel structures.
6. Brownfield fit is mandatory.
7. Maintainability matters; "works somehow" is not enough.
8. Async execute paths must not decide product rules again.
9. Shared finalization or merge rules belong in one owner.

## When To Use
- after `CD+Tests`
- before QA
- when a solution contains many guards, defaults, or special paths
- when wrappers or helper layers were introduced
- when symptom treatment is suspected
- when fallback, retry, or compatibility-shim logic was added
- when code works but the architecture looks questionable

## Inputs
Use what is available:

- Task Plan
- Code Deliverables
- changed files
- tests and test results
- Code Review Report
- QA Report
- Brownfield Analysis findings
- PRD or SD architecture notes

If evidence is missing, mark it explicitly.

## Workflow
1. Understand the intended change.
2. Identify the primary implementation path.
3. Identify fallbacks, guards, defaults, shims, retries, wrappers, and catch-all branches.
4. Decide whether each is justified.
5. Check for parallel ownership.
6. Check Brownfield fit.
7. Assess whether the implementation fixes the root cause.
8. Assign a decision:
   - `pass`
   - `revise`
   - `block`
   - `not_applicable`

## Output
Use this compact structure:

```text
## Clean Implementation Review
- decision:
- primary_solution:
- evidence:
- fallbacks_retained:
- workaround_or_shim_risk:
- parallel_structure_risk:
- brownfield_fit:
- missing_evidence:
- required_next_step:
```

## Pass / Revise / Block Guidance
- `pass`: primary solution is clean, tested, and integrated with existing owners.
- `revise`: solution works but contains avoidable fallback, unclear ownership, or missing evidence.
- `block`: solution creates a second SoT, a second owner, unbounded fallback, or masks unresolved product semantics.

## Forbidden
This skill must not:

- accept fallback-heavy logic as target architecture
- hide unjustified workarounds
- treat green tests as proof of solution integrity
- decide final QA
