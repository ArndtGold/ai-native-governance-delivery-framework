# SD: <Title>

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date:
Owner:
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

How will the approved PRD be solved?

## 2. Ownership And Source Of Truth

Which existing modules, documents, services or owners remain authoritative?

## 3. Architecture Decisions

Use one bullet per binding decision in the form `SDD-...: <decision>; rationale: <why>; consequence: <trade-off>`.
Use stable IDs. If no binding design decision is needed, record one reasoned bullet beginning
`none —`. The Acceptance Traceability table below must reference every listed ID and no others.

## 4. Integration Points

Which APIs, data flows, UI surfaces, jobs, queues or external systems are affected?

## 5. Constraints And Compatibility

Which constraints must implementation preserve?

## 6. Test And Evidence Strategy

Which evidence must TP and QA later collect?

## 7. Acceptance Traceability

Copy each approved PRD `criterion_id` exactly once. Keep PRD as the source of product acceptance;
record only its technical realization here. Point to the existing source of truth and accountable
owner. Use stable `SDD-001` decision IDs where design decisions are needed; otherwise write
`none — <why no new design decision is needed>`. Include compatibility, migration and material risk
or a reasoned `none` for each criterion. Do not restate or silently change acceptance.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| <AC-001> | <design element> | <existing owner and authoritative module> | <SDD-001 or reasoned none> | <impact/mitigation or reasoned none> |

## 8. Risks And Open Questions

Which risks remain before task planning?

## Design Decisions

Use one table in this same SD. Every material architecture/design question is before_sd and
must have status resolved, a concrete Resolution and named Owner before presentation. later_tp
may defer execution/test/evidence detail with a named owner and concrete reason; it cannot hide
binding architecture or product choices. With no material unknown, record a resolved applicability
decision instead of leaving an empty table. Never remove the declaration/table to conceal gaps.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| <unique decision> | before_sd | open | <answer needed or confirmed choice> | <named owner> |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`
