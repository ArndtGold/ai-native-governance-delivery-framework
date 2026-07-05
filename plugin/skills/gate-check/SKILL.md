---
name: gate-check
description: Use this skill as the default first AGDF skill for any new build, change, extension, refactor, feature, CLI, app, fix with product semantics, Structured Delivery request, unclear approval, later-gate artefact request, or unclear next permissible step. Use it before brownfield-analysis, implementation, formal artefacts, QA, or release when approval/evidence/next action is not already explicit.
---

# gate-check

## Purpose
Determine the earliest blocking user approval gate and derive:

- the active or blocking gate
- whether the process is open or blocked
- currently allowed outputs
- currently forbidden outputs
- the exact missing approval
- the next permissible step

This skill must not create later artefacts such as PRD, SD, TP, CD, CR, QA, or UAT when the gate does not allow them.

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for gate terms, closeout discipline, and non-duplication rules.

## Machine-Readable Control Path

When the target repository contains live AGDF control files, prefer the executable control path before deriving a gate decision manually:

```bash
npm create agdf@latest doctor --json
npm create agdf@latest gate-check --json
```

`doctor` checks whether `.agdf/control/` is actionable. `gate-check` consumes that result and `AGDF_RUN.md` to report the operative process decision: `open | blocked`, current gate, blocking reason, missing approval, allowed outputs, forbidden outputs, next allowed action and evidence references.

The CLI report is evidence for this skill, not a second rule system. If the report says `blocked`, do not continue with later-gate artefacts until the reported blocker is resolved.

## Rules
1. Fail closed when a required approval or artefact status is missing.
2. The earliest blocking gate wins.
3. A user approval is valid only as `Approval: <GateName>`.
4. Treat `Freigabe: <GateName>` as a legacy alias only when reviewing older German runs.
5. Implicit consent is not approval.
6. Do not preview later artefacts while a gate blocks.
7. Internal process steps are not user approval gates.
8. OR-lite is allowed if it does not leak blocked content.
9. SoT/runtime/product-semantics drift can trigger an early product gate, usually `UR`.
10. Approval of one user gate permits work on the next gate artefact only; it never skips directly to implementation.
11. New product semantics, functional change or user-visible behaviour change requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before PRD, SD, TP, Brownfield Analysis or implementation.
12. Approval text and durable artefact presence are separate requirements for UR, PRD, SD, TP and QA report decisions. Approval text without the corresponding persisted or linked artefact keeps the current gate at that gate.

## Gate Order
User gates:

`UR -> PRD -> SD -> TP -> QA -> UAT`

Internal mandatory steps:

`Brownfield Analysis -> CD+Tests -> CR -> OR`

## Gate Transitions

Use this transition model for Structured Delivery:

| State | Current gate or step | Allowed | Forbidden | Missing approval |
|---|---|---|---|---|
| No approved UR | `UR` | clarify user need, formulate and persist UR, request `Approval: UR` | PRD, SD, TP, Brownfield Analysis, implementation, QA, release | `Approval: UR` |
| `UR` approved and UR artefact persisted or linked, PRD missing or draft | `PRD` | draft/refine PRD, define scope, acceptance criteria and non-goals, persist/link PRD, request `Approval: PRD` | SD, TP, Brownfield Analysis, implementation, QA, release | `Approval: PRD` |
| `PRD` approved and PRD artefact persisted or linked, SD missing or draft | `SD` | draft/refine Solution Design, ownership and architecture, persist/link SD, request `Approval: SD` | TP, implementation, QA, release | `Approval: SD` |
| `SD` approved and SD artefact persisted or linked, TP missing or draft | `TP` | draft/refine Task/Test Plan, task IDs, evidence plan, persist/link TP, request `Approval: TP` | implementation, QA, release | `Approval: TP` |
| `TP` approved and TP artefact persisted or linked, Brownfield missing | `Brownfield Analysis` | run Brownfield Analysis for approved TP scope | implementation, QA, release | none |
| Brownfield passed for approved TP | `CD+Tests` | implement approved TP tasks and run tests | QA pass, UAT, release | none |
| `QA` approved but QA report missing or not pass | `QA` | persist/link QA report with `pass` decision or revise/block evidence | UAT, release | none |

If `Approval: UR` is present, do not say implementation is the next step.
The next step is PRD work unless the run is explicitly classified as a Quick Task with no new product semantics and no formal artefact requirement.

## When To Use
- new user intent to build, add, change, extend, refactor or deliver something
- Structured Delivery before first artefact creation
- unclear current gate
- user says "continue" or similar without exact approval
- code or a later-gate artefact is requested
- implementation permission is unclear
- QA, UAT, or release permission is unclear

Not required for simple Quick Tasks without new product scope and without formal artefacts.

For a fresh prompt such as "I want to build a small CLI", use this skill first.
Do not route directly to `brownfield-analysis` or implementation until this skill or live AGDF control state says that implementation preparation is the next allowed action.

## Inputs
Use what is available:

- current user request
- existing exact approvals
- status of UR, PRD, SD, TP
- Brownfield Analysis status
- CD+Tests, CR, QA, UAT status
- signs of documentation/runtime/product-semantics drift

If a status is not explicit, do not assume it is satisfied.

## Workflow
1. Check exact approvals.
2. Check artefact status.
3. Determine the earliest blocking user gate or internal mandatory step.
4. Derive allowed and forbidden outputs.
5. Name the exact missing approval, if any.
6. If consent was only implicit, say it is not yet approval and provide the exact formula.
7. Ensure the next step follows the gate transition table. In particular, never jump from `Approval: UR` to implementation.

## Output
Keep the result short and operational:

- **Current gate:** `<GateName or internal step>`
- **Status:** `open | blocked`
- **Allowed:** `<allowed outputs>`
- **Forbidden:** `<forbidden outputs>`
- **Missing approval:** `Approval: <GateName> | none`
- **Next step:** `<single permissible next step>`

## Forbidden
This skill must not:

- create PRD before UR approval
- create SD before PRD approval
- create TP while earlier gates block
- suggest implementation immediately after `Approval: UR`
- suggest implementation immediately after `Approval: PRD`
- suggest implementation immediately after `Approval: SD`
- perform full Brownfield Analysis unless explicitly requested
- provide implementation snippets while implementation is gated
- present QA or UAT as passed without evidence
- present release as allowed without QA pass and UAT approval where required
