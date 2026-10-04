# CD+Tests Evidence

Run: ur-definition-separation-20261004-01
Candidate source digest: sha256:942dbb2b44a6b34031daf1af21ab4aff815d4e1adcb0f74d9c64024f40135200
Review: current Codex author and reviewer are the same cooperative instance; no independent review or new native installation.

The approved UR separation is implemented. Tests were executed against an exact source overlay in a clean local checkout after the Documents checkout exhibited generated-file timeouts and inconsistent ignored dependency files. No production workaround or dependency/version change was added.

CANDIDATE_CHECKS.json preserves every actual exit code and identifies cumulative CLI coverage after corrected fixtures and installed-integrity findings. It does not turn an initial failed full command into a passing command. Source/profile contracts, real built stdio, packed/generated consumers, revisions/approvals, localized rendering and behavior observations are separately identified.

Final performance qualification: pass.

## Context Graph Reconciliation

- memory_target: context_graph
- memory_reason: Reusable requirement-authoring ownership and revision/approval boundaries.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing dispatch node and source registry now point to the canonical UR skill/contract, not a second requirement store.
