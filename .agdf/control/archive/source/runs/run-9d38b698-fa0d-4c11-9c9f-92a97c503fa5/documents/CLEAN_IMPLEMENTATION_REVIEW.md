# Clean Implementation Review: Run overview and worktree convention

- decision: pass
Date: 2026-10-31
Owner: Codex, implementation-integrity reviewer; cooperative self-review
Run: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5

## Clean Implementation Review

- primary_solution: The existing canonical Run inventory supplies bounded Cockpit membership. The same shared overview component serves desktop and compact; ordinary mutations use existing Run transactions with no backlog output. The task-target-resolution contract alone owns worktree placement. The conflict cause is removed at the normal writer and required-file owners, not hidden by Git conflict tooling or a replacement shared index.
- evidence: Approved SD and TP, actual diff against c79972c2, new RunOverview and run-only-writer tests, CD_TESTS.md and its hashed evidence, existing CG/SoT descriptions. Reviewed readRunInventory/discovery, selected-Run evaluation, snapshot/session/parser/transport/DTO boundaries, transaction and source-revision/closure owners, initialization/projection and package surfaces. Review-time malformed directory repair is a serialization/selection boundary using the existing canonical RUN_ID_PATTERN, not another inventory algorithm.
- fallbacks_retained: Explicit optional legacy mode reuses the old parser and original source bytes for planning/history without a Run. Existing journals v1-v5 retain captured old outputs, decoded and recovered only by the current explicit recovery owner. Compatibility function names such as withRunBacklogLock remain for existing imports but now acquire only the Run lock during normal work. Historical completed Verified Change execution snapshots retain original scope. Each retained path has approved SD rationale and a bounded responsibility; none is a new normal backlog write.
- fallback_target_and_exit: New ordinary work uses canonical Run records and null-backlog transactions. A specific legacy pending transaction exits when its exact original outputs have been recovered and its journal retired; conflicting/unknown bytes stay recovery-required. Optional old information remains as long as deliberately retained, with no migration, deletion deadline or automatic cleanup invented. A future contract-removal/deprecation requires its own scope; these compatibility obligations are not claimed to disappear in this Run.
- workaround_or_shim_risk: No budget/time-limit increase, forced global configuration flag, automatic conversion, host reinstall or baseline override was added. The review-time invalid-identity repair preserves accounted diagnostics while withholding unsafe selection; it does not silently omit an entry or fall back to another Run.
- parallel_structure_risk: No second inventory, durable cache, global registry, gate evaluator, control store or worktree manager. UI grouping/search consumes the ordered inventory and presentation-only helper. Old legacy title enrichment remains confined to legacy reading. Bootstrap/decision/context packets keep independent published v1 formats while the reader/resource pair is v2.
- brownfield_fit: Per-Run locks, exact revisions/receipt replay, source/material/presentation validation, seals and atomic commit points retain their existing owners. The only shared backlog lock is for an actually captured historical shared output during explicit recovery. Same-Run concurrency remains protected; independent null-backlog journals no longer cause global contention. Other required SoT, graph and registered-source checks remain.
- missing_evidence: Exact feature-head platform/performance CI remains unqualified before integration under TP T-011; native host rollout is outside the bounded local claim. These are explicit later obligations, not proof of architecture quality.
- required_next_step: Submit the completed required review set to qa-gate; no automatic integration, publication or host cutover.

## Finding consumption

RUNOV-CR-001 is resolved by the current identity-boundary tests and actual rendered observations in Code Review. RUNOV-DOCS-001 is resolved by the deliberate human documentation confirmation plus its actual passing check. RUNOV-PERF-001 retains its original open normalized row in CD and its future integration/merge decision point. No new current design, ownership or retained-fallback gap was identified; this review does not change approved sources or make a technical QA decision.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes and normative references describe actual primary owners and preserved legacy responsibility; historical entries remain historical.
- memory_target: scope_artifact
- memory_reason: This structural review and its candidate limits are Run-specific.
- memory_refs: this report; CD_TESTS.md; approved SD

## Current evidence binding

Registered review-time evidence: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/EVIDENCE-a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03.md, sha256:a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03. Review manifest sha256:a18ee1fddfcd605ef6f7f0637a2a9e99a59664a2b2eabac7061ea97be891379c; current compatibility 56/56, fingerprint 0103db4de2473a79bc9eebb989a28eb26c02960a4ab54c6a0f080bdbf9a9e618. Current paired UI 9ec5ac5c... is distinct from the original 1ff747df...; both source bindings remain explicit. Reuse the completed pre-review bound authoring-input sources, unchanged approved digests and current additive evidence; no source approval is inferred.
