# Context Graph Reconciliation

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: ARCHITECTURE_REVIEW.md; FINAL_SHARED_VERIFICATION.json; CI_MATRIX_FINAL.json; PERFORMANCE.json; late_source_revision_extension_2026_10_05 in the existing node
- memory_target: context_graph
- memory_reason: Curate reusable source-revision authority, archive/recovery invariants and observed qualification limits under the existing Run owner
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state

Situation: The existing node retains source-revision and recovery invariants plus the completed
exact platform observations. CI_MATRIX_FINAL.json binds all required native lanes and the bounded
Windows comparison correction to d3683df. Actual results are separate from human QA approval,
installation, fresh-model evidence and release. The Windows archive-read counter limitation is
explicit; Linux/macOS instrumentation and reviewed shared code carry the zero-unrelated-read
assertion. No SoT owner, approved product source or external model memory changed.
