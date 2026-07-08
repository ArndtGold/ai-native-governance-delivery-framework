# OR: <Title>

Gate: OR
Type: Orchestration Report
Report mode: `OR-lite | OR-full`
Status: `draft | done | superseded`

## Run

- run_id:
- related_ur:
- related_prd:
- related_sd:
- related_tp:
- related_qa_report:
- mode_slice_decision:
- current_gate:
- decision: `pass | revise | block | in_progress`

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR |  |  |
| Brownfield Review |  |  |
| Mode/Slice Decision |  |  |
| PRD |  |  |
| SD |  |  |
| TP |  |  |
| Brownfield Analysis |  |  |
| CD+Tests |  |  |
| CR |  |  |
| QA |  |  |
| UAT |  |  |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

- status:
- allowed_now:
- forbidden_now:
- blocking_condition:
- next_skill:
- next_step:
- quality_outlook:

## Delivered

| Item | Evidence |
|---|---|
|  |  |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
|  |  |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
|  |  |  | `direct | indirect | weak` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
|  | `warn | revise | block` |  |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
|  | `warn | revise | block` |  |

## Context Graph Impact

- context_graph_impact: `none | link_only | update_existing_node | new_node_required | sot_drift`
- context_graph_refs:
- context_graph_required_action: `none | link | update | create | resolve_drift`
- context_graph_gate_effect: `none | warning | revise | block`
- context_graph_evidence:

## Next Permissible Step

- next_allowed_action:
- required_approval:
- forbidden_until_then:

## Quality Outlook

- quality_outlook:

## Approval

OR does not approve later gates. It records the next permissible step.
