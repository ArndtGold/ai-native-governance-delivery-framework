---
name: gate-check
description: Use this skill when the active gate is unclear, when a later-gate artefact is requested, when an exact approval may be missing, or when the next permissible step must be determined. Use it before creating formal artefacts in Structured Delivery and whenever implicit consent might be mistaken for approval.
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

## Gate Order
User gates:

`UR -> PRD -> SD -> TP -> QA -> UAT`

Internal mandatory steps:

`Brownfield Analysis -> CD+Tests -> CR -> OR`

## When To Use
- Structured Delivery before first artefact creation
- unclear current gate
- user says "continue" or similar without exact approval
- code or a later-gate artefact is requested
- implementation permission is unclear
- QA, UAT, or release permission is unclear

Not required for simple Quick Tasks without new product scope and without formal artefacts.

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
- perform full Brownfield Analysis unless explicitly requested
- provide implementation snippets while implementation is gated
- present QA or UAT as passed without evidence
- present release as allowed without QA pass and UAT approval where required
