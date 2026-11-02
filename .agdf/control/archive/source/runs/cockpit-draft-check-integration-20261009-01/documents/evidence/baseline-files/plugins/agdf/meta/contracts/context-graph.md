# AGDF Runtime Contract — Context Graph

## Knowledge Persistence Decision

Every relevant run should decide what happens to new durable knowledge.
The decision is not a memory dump; it routes only reusable, evidenced information to the right owner.

Use:

- `memory_target: context_graph | sot_registry | scope_artifact | open_questions | none`
- `memory_reason`: short reason for the target
- `memory_refs`: paths or nodes affected

Guidance:

- Use `context_graph` for reusable Brownfield findings, decisions, risks, invariants and exit criteria.
- Use `sot_registry` when source-of-truth ownership changes or drift is found.
- Use `scope_artifact` for run-specific evidence, ticket details, screenshots, logs or local reproduction data.
- Use `open_questions` when a durable question should survive the run but no answer is evidenced yet.
- Use `none` for one-off observations without future decision value.


## Context Graph Output

When a run affects project memory or a Context Graph, use:

- `Situation:` short plain-language summary when the impact is non-trivial
- `context_graph_impact`: `none | link_only | update_existing_node | new_node_required | sot_drift`
- `context_graph_refs`
- `context_graph_reconciliation`: `resolved | not_applicable | open_gap`
- `context_graph_required_action`: `none | link | update | create | resolve_drift`
- `context_graph_gate_effect`: `none | warning | revise | block`
- `context_graph_evidence`

Do not create a new node for a mere version, a general chat summary, or a local observation without a concrete next clean step.
`sot_drift` must not pass silently as a warning.

### Context Graph Reconciliation

Relevant-run closeout must reconcile Context Graph impact before presenting a clean delivery handoff.

- Use `not_applicable` only when `context_graph_impact: none` and no durable graph knowledge is claimed.
- Use `resolved` when required graph work is complete and concrete refs are present.
- Use `open_gap` when graph work remains pending, refs are missing, or a node/update must still be curated.
- `link`, `update`, `create` and `resolve_drift` require either `resolved` evidence or an explicit `open_gap`.
- Resolved `link_only`, `update_existing_node` and `new_node_required` states require concrete `context_graph_refs`; `none`, empty refs or vague future-action language are not enough.
- OR and delivery-closeout must not present commit-ready, release-ready or otherwise clean handoff while `context_graph_reconciliation: open_gap` remains.

