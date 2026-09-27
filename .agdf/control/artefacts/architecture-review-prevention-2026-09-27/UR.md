# UR: Prevent Architecture Debt Before Implementation

Status: draft
Gate: UR
Gate approval: open
Date: 2026-09-27
Owner: TBD

## 1. Problem

Architecture choices that introduce avoidable coupling, duplicate ownership, parallel sources of truth, or workaround-heavy paths can become expensive to change once implemented. Brownfield Analysis considers architecture in the context of a delivery, but it does not yet make this debt-prevention purpose and the handling of architecture trade-offs explicit enough.

## 2. Goal

Before implementation choices are committed, make architecture risks and trade-offs visible so the smallest durable solution fits the existing system and avoidable technical debt is prevented.

## 3. Scope

- Strengthen the existing Brownfield Analysis for architecture-impacting or architecturally uncertain changes.
- Assess relevant ownership and module boundaries, interfaces, coupling, data and source-of-truth ownership, compatibility, and migration impact using repository evidence.
- Distinguish evidence-backed architecture problems from intentional trade-offs.
- For a justified trade-off that creates or retains debt, record its rationale, owner, mitigation, and review or exit condition.
- Use an architecture diagram only when it clarifies affected boundaries or dependencies.
- Route unresolved product, architecture, or implementation decisions to their existing authoritative phase and owner.

## 4. Non-Goals

- Add a new gate, approval authority, or parallel architecture finding registry.
- Run an exhaustive architecture audit for every delivery.
- Replace Code Review, Clean Implementation Review, or QA.
- Remediate all existing technical debt as part of this change.
- Import ASE's checklist or findings format wholesale.

## 5. Acceptance Signals

- For relevant changes, Brownfield Analysis explicitly states the architecture impact, evidence, and missing evidence before implementation planning proceeds.
- Relevant findings distinguish a problem from a justified trade-off and identify the appropriate owner and next step.
- Any accepted debt has a documented rationale, mitigation, and review or exit condition.
- Low-impact changes can be marked architecture-not-applicable with a reason and without added ceremony.
- Findings remain in existing run artefacts and route through existing gates and owners.

## 6. Existing Source Of Truth

- `plugin/skills/brownfield-analysis/SKILL.md`
- `plugin/skills/clean-implementation-review/SKILL.md`
- `plugin/skills/code-review/SKILL.md`
- `plugin/meta/contracts/quality.md`
- `plugin/meta/contracts/gate-transition.md`
- `plugin/meta/contracts/modes.md`
- `plugin/meta/contracts/context-graph.md`

## 7. Risks And Unknowns

- The applicable architecture checks and trigger threshold must add useful evidence without duplicating existing Brownfield and Clean Implementation Review responsibilities.
- A trade-off record must not create a second debt backlog or imply that documentation makes an avoidable workaround acceptable.
- Architecture analysis can surface risks, but cannot guarantee that future change will not create debt; acceptance signals should measure earlier identification and prevention opportunities rather than promise zero debt.
- Determine whether any architecture map can be derived from existing evidence or should remain an optional review aid.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
