# PRD: <Title>

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date:
Owner:
Traceability contract: criteria-chain-v1

## 1. Product Scope

What exactly must be delivered?

## 2. UX Intent And Success

- ui_ux_impact: none | low | medium | high
- ux_intent_definition: <ready analysis reference | directly defined low-impact semantics | justified not_applicable>
- primary_user_intent:
- success_signal:
- primary_decision_or_action:

Every field must be populated or explicitly justified as `not_applicable`. Medium/high impact requires
a `ready` UX Intent Definition result before this PRD is ready.

## 3. Working Modes And Effective State

For every user-relevant working mode, define:

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
|  |  |  |  |  |

Product/system authority decides what is effectively true. Presentation ownership identifies the
primary surface that communicates state and next action. Technical storage, derivation and component
ownership remain Solution Design concerns.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation:
- blockers_and_visible_next_actions:
- recovery_paths: <include visible retry for recoverable transient failure>
- relevant_state_transitions: <trigger, source, target, visible feedback, next action, failure/rollback>

## 5. Acceptance Criteria

Give every acceptance criterion a unique, stable `criterion_id` (for example `AC-001`) so SD, TP
and QA can refer to the same requirement without copying or renaming it. Every applicable UX
criterion must also include `working_mode`, `source_state`, trigger/action, expected effective state,
visible feedback, blocker/failure behavior, recovery/next action, observable success and required
evidence. Specify observable behavior, not implementation. Do not leave the section empty or retain
placeholders when requesting approval.

## 6. Non-Goals

What remains out of scope?

## 7. Users And Roles

Who is affected and who decides?

## 8. Constraints

Which business, operational, legal, security or compatibility constraints apply?

## 9. Evidence Requirements

Which evidence must later support QA?

## 10. Risks And Open Questions

Record risks and questions that can be answered later. Move every decision that changes product
scope, acceptance, accountable ownership or release acceptance into Approval Decisions below.

## Approval Decisions

Before presenting this PRD, collect all `before_prd` answers in one request and record their
resolution here. Use `later_sd` or `later_tp` only for genuine design or planning decisions;
name the responsible owner in the final column. Keep at least one explicit row.

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| <product decision or none> | before_prd | open | <answer> | <accountable owner> |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and
the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`
