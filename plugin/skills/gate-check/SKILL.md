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

## Native Control Path

AGDF is applied natively through this skill, the agent router, and live `.agdf/control/` state.

First inspect the durable control state directly:

- `.agdf/control/AGDF_RUN.md`
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

Use the executable control path when a machine-readable check is requested, when the gate state is ambiguous, or when a repository-local automation needs JSON evidence:

```bash
npm create agdf@latest doctor --json
npm create agdf@latest gate-check --json
npm create agdf@latest delivery-map --json
```

`doctor` checks whether `.agdf/control/` is actionable. `gate-check` consumes that result and `AGDF_RUN.md` to report the operative process decision: `open | blocked`, current gate, blocking reason, missing approval, allowed outputs, forbidden outputs, next allowed action and evidence references.
`delivery-map` reports the durable delivery picture: active artefacts, approvals, Artefact Chain relationships, evidence refs, missing evidence, risks, Context Graph gate effect and machine-readable findings.

The CLI reports are validators and JSON evidence, not the primary user experience and not a second rule system. If a report says `blocked`, do not continue with later-gate artefacts until the reported blocker is resolved.

## Rules
1. Fail closed when a required approval or artefact status is missing.
2. The earliest blocking gate wins.
3. A user approval is valid only as `Approval: <GateName>`.
4. Treat `Freigabe: <GateName>` as a legacy alias only when reviewing older German runs.
5. Implicit consent is not approval. "ok", "go ahead", "do it", "approved", "continue", "leg los" and similar phrases do not unlock gates.
6. Do not preview later artefacts while a gate blocks.
7. Internal process steps are not user approval gates.
8. OR-lite is allowed if it does not leak blocked content.
9. SoT/runtime/product-semantics drift can trigger an early product gate, usually `UR`.
10. Approval of one user gate permits work on the next allowed gate artefact or required internal step only; it never skips directly to implementation.
11. New product semantics, functional change or user-visible behaviour change requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before Brownfield Review, PRD, SD, TP, Brownfield Analysis or implementation.
12. Approval text and durable artefact presence are separate requirements for UR, PRD, SD, TP and QA report decisions. Approval text without the corresponding persisted or linked artefact keeps the current gate at that gate.
13. After Brownfield Review, decide the process size before drafting PRD or implementing: `quick_task | structured_slice | structured_delivery | block`.

## Gate Order
User gates:

`UR -> PRD -> SD -> TP -> QA -> UAT`

Internal mandatory steps:

`Brownfield Review -> Mode/Slice Decision -> Brownfield Analysis -> CD+Tests -> CR -> OR`

## Gate Transitions

Use this transition model for Structured Delivery:

| State | Current gate or step | Allowed | Forbidden | Missing approval |
|---|---|---|---|---|
| No approved UR | `UR` | clarify user need, formulate and persist UR, request `Approval: UR` | PRD, SD, TP, Brownfield Analysis, implementation, QA, release | `Approval: UR` |
| `UR` approved and UR artefact persisted or linked, Brownfield Review missing | `Brownfield Review` | classify workstream, existing owners, SoT, reuse risks, change size and PRD/SD open questions; mark review done or not_applicable | PRD, SD, TP, implementation, QA, release | none |
| Brownfield Review done or not_applicable, Mode/Slice Decision missing | `Mode/Slice Decision` | decide `quick_task`, `structured_slice`, `structured_delivery` or `block`; record evidence and required next gate depth | PRD, SD, TP, implementation, QA, release | none |
| Mode/Slice Decision is `quick_task` | `Quick Task Execution` | implement only the narrow approved UR scope, run relevant checks, record evidence and OR-lite | broad PRD/SD/TP by ritual, scope expansion, QA or release claims without evidence | none |
| Mode/Slice Decision is `structured_slice` or `structured_delivery`, PRD missing or draft | `PRD` | draft/refine PRD at the smallest justified depth, define scope, acceptance criteria and non-goals, persist/link PRD, request `Approval: PRD` | SD, TP, implementation-preparation Brownfield Analysis, implementation, QA, release | `Approval: PRD` |
| `PRD` approved and PRD artefact persisted or linked, SD missing or draft | `SD` | draft/refine Solution Design, ownership and architecture, persist/link SD, request `Approval: SD` | TP, implementation, QA, release | `Approval: SD` |
| `SD` approved and SD artefact persisted or linked, TP missing or draft | `TP` | draft/refine Task/Test Plan, task IDs, evidence plan, persist/link TP, request `Approval: TP` | implementation, QA, release | `Approval: TP` |
| `TP` approved and TP artefact persisted or linked, Brownfield missing | `Brownfield Analysis` | run Brownfield Analysis for approved TP scope | implementation, QA, release | none |
| Brownfield passed for approved TP | `CD+Tests` | implement approved TP tasks and run tests | QA pass, UAT, release | none |
| `QA` approved but QA report missing or not pass | `QA` | persist/link QA report with `pass` decision or revise/block evidence | UAT, release | none |

If `Approval: UR` is present, do not say implementation is the next step.
The next step is Brownfield Review when Brownfield, ownership, runtime, policy, persistence, architecture, UI or UX impact is possible; after that, the next step is a Mode/Slice Decision. Do not assume the full PRD/SD/TP chain before the existing-system impact is understood.

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
- Brownfield Review status
- Mode/Slice Decision
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
8. Treat a generic "start", "continue" or "leg los" request as a request to perform only the current next allowed action.
9. After Brownfield Review, choose the smallest safe process path before creating later artefacts.

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
- create PRD before required Brownfield Review is done or explicitly not_applicable
- create PRD before Mode/Slice Decision is recorded
- create SD before PRD approval
- create TP while earlier gates block
- suggest implementation immediately after `Approval: UR`
- suggest implementation before Brownfield Review has explicitly selected `quick_task`
- suggest implementation immediately after `Approval: PRD`
- suggest implementation immediately after `Approval: SD`
- treat "ok", "leg los", "go ahead", "approved" or similar wording as gate approval
- perform full Brownfield Analysis unless explicitly requested
- provide implementation snippets while implementation is gated
- present QA or UAT as passed without evidence
- present release as allowed without QA pass and UAT approval where required
