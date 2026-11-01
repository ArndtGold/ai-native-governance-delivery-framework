# TP: <Title>

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date:
Owner:
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

Use a stable task ID for each implementation or preparation task.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 |  |  |  |

## 2. Verification Traceability

Map every approved PRD criterion and every SD design decision to one or more concrete scenarios.
Reference IDs exactly; do not duplicate acceptance text. Each scenario has one task, a stable
`SCN-001` ID, an observable expected result and a specific evidence source or artifact. Include
boundary or failure scenarios where they matter to the criterion.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| <AC-001> | <SDD-001 or reasoned none> | <T-001> | <SCN-001> | <observable result> | <test/report/log or manual observation> |

## 3. Test Plan

Apply quality.md Proportionate Tests And Evidence and Verification Effectiveness And
Completion. Reuse applicable proof before planning new collection; record grouped
scope/risk, validity and timing rationale here or in existing evidence fields. Derive
expected outcomes from requirements, retain gaps and define when checking is sufficient.
For each applicable verification scenario name its concrete execution prerequisites and failure action.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| <AC-001> | <SCN-001> | <command/check> | <actual environment> | <required access> | <responsible owner> | <output/observation> | <action if unavailable> |

## Planning Decisions

Resolve each approved SD later_tp decision exactly once, using Source `SD: <exact decision label>`.
Local execution choices use Source `TP`. Open rows block approval. With no material question, record
one concrete resolved applicability row. Never defer product or design authority as planning detail.

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| <planning decision> | TP | open | <answer or concrete blocking context> | <named owner> |

For a material question add `## Clarification Requests` with the existing quality.md normalized
finding columns, and `## Clarification Details` with finding_id, planning_decision, question,
blocking_reason, required_answer, owner, source_ref, resolution_evidence. Use the focused
TP contract for exact source/evidence references, responsible-owner handoff and protected-source
revision. Omit both clarification sections when no material finding exists.

## 4. Brownfield Scope

Which existing owners, modules or artefacts must be inspected before implementation?

## 5. Out Of Scope

Which implementation work is explicitly not part of this TP?

## 6. Risks And Blockers

Which risks must block, revise or warn later QA?

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
