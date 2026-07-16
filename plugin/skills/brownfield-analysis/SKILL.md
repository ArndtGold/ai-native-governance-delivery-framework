---
name: brownfield-analysis
description: "Use this skill after gate-check or live AGDF control state confirms that Brownfield Review or implementation preparation is allowed. Use it after Approval: UR as the lightweight Brownfield Review after G-00 before PRD when existing systems may be affected, and again before non-trivial implementation after TP. Do not use it as the first AGDF skill for a fresh \"I want to build/change X\" prompt when approval, scope, or next allowed action is unclear."
---

# brownfield-analysis

## Purpose
Ensure delivery in an existing system is Brownfield-oriented, not Greenfield-style.

The skill answers:

- which existing artefacts matter
- what already exists fully or partially
- what can be reused, extended, or refactored
- whether new artefacts are really needed
- architecture, compatibility, migration, and regression impact
- the minimal clean next step
- whether Context Graph impact exists without automatically creating a node

## Runtime Contract
Use these focused runtime-contract modules:

- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/context-graph.md`
- `../../meta/contracts/quality.md`

Brownfield-specific output must make evidence, missing existing-system view, parallel-structure risk, reuse strategy, and the minimal next step visible.
When `.agdf/control/` is present, persist or link `post_ur_review` output under `.agdf/control/artefacts/<key>/BROWNFIELD_REVIEW.md`.

## Modes

- `post_ur_review`: use after approved durable UR to size and route the work. Output must decide `quick_task`, `verified_change`, `structured_slice`, `structured_delivery`, or `block` with scope reason and evidence.
- `pre_implementation_analysis`: use after approved durable TP to verify the implementation path before `CD+Tests`. Output must focus on reuse path, owners, regression risk, test impact and minimal clean implementation.

Do not mix both modes silently. Name the active mode in the output.

## Rules
1. Brownfield first: understand the existing codebase before PRD/SD decisions when existing-system impact is possible, and again before implementation.
2. Brownfield Review after `Approval: UR` is a sizing and routing step. It must visibly decide `quick_task`, `verified_change`, `structured_slice`, `structured_delivery`, or `block` before PRD depth or implementation is chosen.
3. Reuse-before-create: prefer existing modules, services, components, tables, endpoints, tests, and configuration.
4. Minimal clean slice: choose the smallest durable intervention, not merely the smallest technical diff.
5. No silent parallel structures.
6. Existing architecture, naming, error handling, logging, security, and test conventions are binding unless deviation is justified.
7. What is not visibly evidenced does not count as existing.
8. Async execute paths must not become a second product-policy decision point.
9. Visible state ownership must be checked for chat, rendering, scrolling, recovery, and status problems.
10. SoT/runtime/product-semantics drift must be named; if official behaviour must be decided first, recommend UR or equivalent product direction.
11. Large UI surfaces and state hooks must be checked for mixed render, view-model, derived state, orchestration, persistence, and recovery ownership.
12. Context Graph impact must be curated; it is not a review log or version index.
13. Specification archive migrations must follow the archive index if present.

## When To Use
- after `gate-check` permits `Brownfield Review` or the selected canonical run record names Brownfield Review as the next allowed action
- after `gate-check` permits implementation preparation or the selected canonical run record already names Brownfield Analysis as the next allowed action
- after `Approval: UR` when existing owners, SoT, contracts, policies, persistence, runtime paths, tests, UI, UX or architecture may affect PRD/SD scope
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

- approved UR, Task Plan, `task_id`, `story_id`
- project structure
- affected files, modules, services, APIs, data models
- existing tests
- architecture notes from PRD or SD
- repository conventions

If inputs are missing, work only from observable evidence and mark gaps explicitly.
If gate status, approval, scope or next allowed action is unclear, stop and route to `gate-check` instead of recommending PRD/SD detail or starting implementation.
When used as Brownfield Review after `Approval: UR`, do not recommend PRD, SD, TP, or implementation until the Mode/Slice Decision is explicit, evidenced and recorded.

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
10. Check Context Graph impact according to `../../meta/contracts/context-graph.md`.
11. Recommend the minimal clean implementation path.

## Output
Use a concise structure:

```text
## Brownfield Analysis
- mode: post_ur_review | pre_implementation_analysis
- decision: pass | revise | block | not_applicable
- mode_slice_decision: quick_task | verified_change | structured_slice | structured_delivery | block
- required_next_gate: none | PRD | SD | TP | Brownfield Analysis
- artefact: .agdf/control/artefacts/<key>/BROWNFIELD_REVIEW.md | none
- scope:
- evidence:
- transparency: why later artefacts are skipped, shortened or required
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
- recommend broad PRD/SD/TP or implementation by reflex before Mode/Slice Decision is recorded
