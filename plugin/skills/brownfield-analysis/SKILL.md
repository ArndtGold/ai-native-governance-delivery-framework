---
name: brownfield-analysis
description: Use this skill before implementation in an existing codebase, especially for feature extensions, bug fixes, refactorings, or changes to existing modules. It analyzes existing artefacts, current coverage, reuse strategy, risks, and the minimal clean implementation path. Use it before CD+Tests.
---

# brownfield-analysis

## Purpose
Ensure implementation in an existing system is Brownfield-oriented, not Greenfield-style.

The skill answers:

- which existing artefacts matter
- what already exists fully or partially
- what can be reused, extended, or refactored
- whether new artefacts are really needed
- architecture, compatibility, migration, and regression impact
- the minimal clean implementation path
- whether Context Graph impact exists without automatically creating a node

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for Quality Contract output, Context Graph fields, gate terms, and non-duplication rules.

Brownfield-specific output must make evidence, missing existing-system view, parallel-structure risk, reuse strategy, and the minimal next step visible.

## Rules
1. Brownfield first: understand the existing codebase before implementation.
2. Reuse-before-create: prefer existing modules, services, components, tables, endpoints, tests, and configuration.
3. Minimal clean slice: choose the smallest durable intervention, not merely the smallest technical diff.
4. No silent parallel structures.
5. Existing architecture, naming, error handling, logging, security, and test conventions are binding unless deviation is justified.
6. What is not visibly evidenced does not count as existing.
7. Async execute paths must not become a second product-policy decision point.
8. Visible state ownership must be checked for chat, rendering, scrolling, recovery, and status problems.
9. SoT/runtime/product-semantics drift must be named; if official behaviour must be decided first, recommend UR or equivalent product direction.
10. Large UI surfaces and state hooks must be checked for mixed render, view-model, derived state, orchestration, persistence, and recovery ownership.
11. Context Graph impact must be curated; it is not a review log or version index.
12. Specification archive migrations must follow the archive index if present.

## When To Use
- before `CD+Tests`
- before changes to an existing repository
- bug fixes in existing modules
- feature extensions in existing architecture
- refactorings
- unclear existing coverage
- risk of new parallel structures
- a TP is clear but its connection to the existing system is not

## Inputs
Use what is available:

- Task Plan, `task_id`, `story_id`
- project structure
- affected files, modules, services, APIs, data models
- existing tests
- architecture notes from PRD or SD
- repository conventions

If inputs are missing, work only from observable evidence and mark gaps explicitly.

## Workflow
1. Identify affected tasks and scope.
2. Find relevant existing artefacts.
3. Assess current coverage before new implementation:
   - `fully_done`
   - `partially_done`
   - `not_done`
4. Choose reuse strategy:
   - `extend`
   - `refactor`
   - `replace`
   - `new`
5. Assess change impact:
   - files/modules
   - interfaces
   - data model/migrations
   - backwards compatibility
   - regression tests
   - side effects
6. Check parallel-structure risk.
7. Check SoT/runtime/product-semantics drift.
8. Check primary visible ownership for UI/status/recovery paths.
9. Check UI monolith risk for large surfaces or central hooks.
10. Check Context Graph impact according to `../../meta/agdf-runtime-contract.md`.
11. Recommend the minimal clean implementation path.

## Output
Use a concise structure:

```text
## Brownfield Analysis
- decision: pass | revise | block | not_applicable
- scope:
- evidence:
- missing_evidence:
- current_coverage:
- reuse_strategy:
- risks:
- context_graph_impact:
- required_next_step:
```

## Pass / Revise / Block Guidance
- `pass`: existing owners are understood, reuse path is clear, and no blocking drift or parallel structure risk remains.
- `revise`: relevant evidence, tests, ownership, or reuse path is incomplete.
- `block`: implementation would create a second SoT, second owner, unresolved product semantics, or hard unmitigated risk.

## Forbidden
This skill must not:

- propose a Greenfield replacement without evidence
- silently accept overlapping ownership
- convert product-semantics drift into a mere refactor
- create Context Graph nodes automatically
- treat archive links as active current specification signals
