# Context reconciliation: Local read-only control cockpit

Status: done
Situation: A new read consumer needs durable separation of source identity, observed snapshots, Core authority and browser mediation.
memory_target: context_graph
memory_reason: Reuse the scoped read boundary and prevent browser projections becoming authority or parallel storage.
memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/SOT_REGISTRY.md#Physical-Package-Ownership; packages/control-ui/README.md
context_graph_impact: update_existing_node
context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE
context_graph_reconciliation: resolved
context_graph_required_action: update
context_graph_gate_effect: none
context_graph_evidence: CD_TESTS.md; EVIDENCE/real-approved-run-parity.json; EVIDENCE/playwright-results.json

Existing Core/control/policy owners retain authority. The two additive physical ownership rows identify the private read consumer and new Core read seam. Scope-specific logs/screenshots remain with this run. No external Codex memory folder was changed.
