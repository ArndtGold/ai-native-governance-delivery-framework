# AGDF Run State

## Run Meta

- run_id:
- started_at:
- mode: `quick_task | structured_delivery`
- current_gate: `none | UR | PRD | SD | TP | CD+Tests | CR | QA | UAT | OR`
- decision: `pass | revise | block | in_progress`
- owner:

## Objective

What outcome is this run trying to make trustworthy?

## Current Control State

| Question | Answer |
|---|---|
| What is known? |  |
| What is approved? |  |
| What is missing? |  |
| What is the next allowed action? |  |
| What is explicitly forbidden right now? |  |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | `missing | approved | not_applicable` |  |
| PRD | `missing | approved | not_applicable` |  |
| SD | `missing | approved | not_applicable` |  |
| TP | `missing | approved | not_applicable` |  |
| QA | `missing | approved | not_applicable` |  |
| UAT | `missing | approved | not_applicable` |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR |  | `draft | approved | superseded | not_applicable` |  |
| PRD |  | `draft | approved | superseded | not_applicable` |  |
| SD |  | `draft | approved | superseded | not_applicable` |  |
| TP |  | `draft | approved | superseded | not_applicable` |  |
| Review |  | `missing | done | not_applicable` |  |
| QA |  | `missing | pass | revise | block | not_applicable` |  |
| OR |  | `missing | done | not_applicable` |  |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
|  |  |  | `direct | indirect | weak` |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
|  | `warn | revise | block` |  |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
|  | `warn | revise | block` |  |

## Context Graph Impact

- context_graph_impact: `none | link_only | update_existing_node | new_node_required | sot_drift`
- context_graph_refs:
- context_graph_required_action: `none | link | update | create | resolve_drift`
- context_graph_gate_effect: `none | warning | revise | block`
- context_graph_evidence:

## Closeout

- delivered:
- not_delivered:
- verification_performed:
- unverified:
- next_allowed_action:
- quality_outlook:
