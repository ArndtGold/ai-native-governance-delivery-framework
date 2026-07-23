# Clean Implementation Review: OpenCode Surface Hardening and Evaluator Parity

Status: pass
Revision: 2
Date: 2026-07-23

## Clean Implementation Review

- decision: pass
- primary_solution: Existing OpenCode installer/status, global instruction generator, lifecycle
  ownership, shared evaluator contract, capability projection and CLI dispatch remain the sole
  owners. SDK alignment extends the existing installer and reuses its npm invocation plus the
  read-only host/SDK probe; the new adapter translates only OpenCode transport and evidence.
- evidence: Full revision-2 diff; passing alignment-state matrix, lifecycle tests, full smoke suite,
  package checks and source-mode Runtime Integrity; live matching host/SDK status.
- fallbacks_retained: One explicit fail-closed result points to the existing instruction-only
  workflow after evaluator failure. SDK alignment failures retain the observed final state and one
  retry action; they do not introduce a second installer, rollback loop or status mutation.
- workaround_or_shim_risk: low; manifest resolution handles packages without a root export through
  Node's own module search paths rather than a registry or hard-coded installation path.
- parallel_structure_risk: none; scoring, candidate policy, validation, mutation guard and gate
  authority remain shared.
- brownfield_fit: pass; all changes extend the owners named by the approved Brownfield Analysis.
- missing_evidence: Authenticated live evaluator success is a QA evidence obligation, not a clean
  implementation defect. A live divergent SDK install was intentionally not manufactured because
  the current global SDK already matches; deterministic fixtures cover the transition.
- required_next_step: Continue to refreshed Code Review.
- context_graph_impact: update_existing_node
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing node now records the instruction-only OpenCode baseline,
  invocation-scoped conditional enforcement and unresolved live-evidence boundary.
