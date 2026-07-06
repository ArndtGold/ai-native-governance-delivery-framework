# AGDF Run State

## Run Meta

- run_id:
- started_at:
- mode: `quick_task | structured_delivery`
- current_gate: `none | UR | Brownfield Review | Mode/Slice Decision | PRD | SD | TP | Quick Task Execution | Brownfield Analysis | CD+Tests | CR | QA | UAT | OR`
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
| Brownfield Review |  | `missing | draft | done | not_applicable | superseded` |  |
| Review |  | `missing | done | not_applicable` |  |
| QA |  | `missing | pass | revise | block | not_applicable` |  |
| OR |  | `missing | done | not_applicable` |  |

## Mode / Slice Decision

Set this after Brownfield Review. Do not assume the full gate chain before the existing-system impact is understood.
Quick Task execution or implementation is not allowed until this decision is visible with scope reason and evidence.

- decision: `undecided | quick_task | structured_slice | structured_delivery | block`
- required_next_gate: `none | PRD | SD | TP | Brownfield Analysis`
- scope_reason:
- evidence:
- transparency_note:

## Artefact Chain

Keep the active work item traceable. A gate may open only when the previous gate has both exact approval and a durable or linked artefact.

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | `approved_by` | `Approval: UR` |  |
| PRD | `derived_from` | UR |  |
| SD | `derived_from` | PRD |  |
| TP | `derived_from` | SD |  |
| QA_REPORT | `tests` | TP |  |

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
