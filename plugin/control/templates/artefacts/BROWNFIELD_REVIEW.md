# Brownfield Review: <Title>

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `draft | done | not_applicable | superseded`

## Run

- run_id:
- related_ur:
- current_gate:
- reviewer:
- reviewed_at:

## Objective

What approved UR scope is being sized and routed?

## UI / UX Impact Routing

- delivery_context: `greenfield | brownfield`
- ui_ux_impact: `none | low | medium | high`
- ui_ux_impact_reason:
- ux_intent_definition_required: `yes | no`
- ux_intent_definition_result: `ready | blocked | not_applicable`

Use the single classification contract in `meta/contracts/gate-transition.md`. A required `blocked`
result prevents PRD readiness. Greenfield explicitly marks existing-system evidence not applicable;
Brownfield cites repository evidence.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics |  |  | `none | low | medium | high` |
| Source of truth |  |  | `none | low | medium | high` |
| Runtime path |  |  | `none | low | medium | high` |
| UI / UX |  |  | `none | low | medium | high` |
| Persistence / data |  |  | `none | low | medium | high` |
| Tests / QA |  |  | `none | low | medium | high` |
| Release / operations |  |  | `none | low | medium | high` |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
|  |  | `none | warn | revise | block` |  |

## Mode / Slice Decision

- decision: `quick_task | verified_change | structured_slice | structured_delivery | block`
- required_next_gate: `none | PRD | SD | TP | Brownfield Analysis`
- scope_reason:
- evidence:
- transparency_note:

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete | missing | conflicting | not_applicable`
- primary_reason_code:
- decisive_full_depth_triggers:
- rejected_alternative:
- missing_or_conflicting_facts:
- depth_evidence_refs:

Use `not_applicable` only when an unchanged Quick/Compact or Verified Change path is selected before
Structured Depth. A positive structured decision requires complete facts. Missing or conflicting
decisive facts without an already-evidenced full-depth trigger persist `decision: block` and name
the evidence owner and precise Brownfield/Mode-Slice re-evaluation action.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass | fail | unknown | not_applicable` |  |
| authority_boundary | `pass | fail | unknown | not_applicable` |  |
| owner_consumer_coordination | `pass | fail | unknown | not_applicable` |  |
| full_depth_impacts_absent | `pass | fail | unknown | not_applicable` |  |
| migration_propagation_bounded | `pass | fail | unknown | not_applicable` |  |
| failure_recovery_local | `pass | fail | unknown | not_applicable` |  |
| independently_acceptable | `pass | fail | unknown | not_applicable` |  |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
|  | `none | PRD | SD | TP` | `warn | revise | block` |

## Context Graph Impact

- context_graph_impact: `none | link_only | update_existing_node | new_node_required | sot_drift`
- context_graph_refs:
- context_graph_required_action: `none | link | update | create | resolve_drift`
- context_graph_gate_effect: `none | warning | revise | block`
- context_graph_evidence:

## Next Permissible Step

- next_allowed_action:
- forbidden_until_then:

## Quality Outlook

- quality_outlook:
