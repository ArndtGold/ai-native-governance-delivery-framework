---
language: en
chapter_role: gates_and_approvals
translation_of: ../de/02-gates-und-freigaben.md
source_revision: sha256:7d4216d704cc894d4aee7dd2d31b7935ae56b4f44fe9a65ef98a6faab212bba4
translation_status: reviewed
---

# Gates and approvals

A gate is a deliberate decision point. The agent stops there and shows you:

- what is already available;
- what is still missing;
- which decision is needed;
- which step becomes permitted next;
- which work remains forbidden.

An approval and its corresponding artefact are separate requirements. An approval line alone does
not open the next step when the required artefact is missing, incomplete or unreliable.

## User gates and internal steps

The user gates are:

- **UR:** User Requirement
- **PRD:** Product Requirements Document
- **SD:** Solution Design
- **TP:** Task and Test Plan
- **QA:** Quality Assurance
- **UAT:** User Acceptance Testing

Mandatory internal steps occur between the user gates. Depending on the path, these include Brownfield Review,
the Mode/Slice Decision, Pre-Implementation Brownfield Analysis, CD+Tests, mandatory Code Review and
other quality reviews. They do not need a separate approval line, but they must not be skipped
silently.

## Your role

You decide the objective, product direction and user gates. The agent prepares content and evidence,
evaluates the current state and names the next permitted step.

| Your approval | What it permits next |
|---|---|
| `Approval: UR` | Brownfield Review and a reasoned choice of delivery path. No implementation yet. |
| `Approval: PRD` | Creation of the Solution Design. No implementation yet. |
| `Approval: SD` | Creation of the Task and Test Plan. No implementation yet. |
| `Approval: TP` | Pre-Implementation Brownfield Analysis. CD+Tests may begin only after that analysis passes. |
| `Approval: QA` | Preparation of UAT when the associated QA report is `pass`. No publication yet. |
| `Approval: UAT` | Orchestration Report and Delivery Closeout may be prepared. Git and release actions still require separate instructions. |

The authoritative transition logic is in the
[Runtime Contract](../../../plugin/meta/agdf-runtime-contract.md).

## Exact approval

Every approval uses this format:

```text
Approval: <GateName>
```

For example:

```text
Approval: UR
```

Additional text changes the value. `Approval: UR (Recommended)` is therefore not valid. An
instruction such as `Leg los`, `Mach weiter`, `Approved` or `Sieht gut aus` also does not replace an
approval line.

A host interface may offer buttons or another selection control. Authority still comes from the
unchanged exact value, validated against the selected run, gate and artefact revision.

## Why the agent stops

A stop is often an intentional safety measure, not a technical fault. Typical reasons include:

- A requirement or gate artefact has not been approved.
- Several runs are active and the intended work is ambiguous.
- A QA report is `pass`, but `Approval: QA` is missing.
- A review contains an open finding.
- Required evidence or a Context Graph action is missing.
- Installation, repository activation or version state has not been verified.

The agent should name the blocker, the missing evidence and exactly one permitted next step.

## Requesting changes and routing findings

If a draft is not right, describe the required correction instead of approving the gate. The
finding is routed back to the earliest responsible step:

- missing or contradictory product requirement → PRD, or UR if user intent changed;
- missing architecture or ownership decision → SD;
- missing task, check or evidence plan → TP;
- incomplete implementation → CD+Tests;
- missing proof → the responsible Evidence Obligation.

The agent must not silently repair or reclassify a finding in a later gate.

## QA is not UAT

**Quality Assurance evaluates the delivery.** `qa-gate` decides exactly `pass`, `revise` or `block`.
A green test run alone is not enough. Plan coverage, solution integrity, Code Review, Brownfield fit
and relevant visible evidence must agree.

**User Acceptance Testing checks whether the result meets the user need.** You decide from a
business or human perspective whether it satisfies the intended requirement. A successful QA
decision does not replace that acceptance.

The QA report and `Approval: QA` are separate. `Approval: UAT` is likewise a deliberate human
decision.

Next: [Common workflows](03-common-workflows.md).
