# Clean Implementation Review: Reliable MCP runtime and coherent Codex setup
Decision: pass
Reviewer: Codex cooperative solution-integrity review
Date: 2026-10-14

## Primary solution
The demonstrated faults are repaired at their existing owners: Core publishes complete lock records atomically; package/launcher use exact-live bounded contention and one unchanged publication/acquisition deadline; Worker completion retains occupancy through confirmed end; Codex adapter/reference transactions revalidate exact sources and guard rollback. Existing result/locale owners derive setup states. No persistent Worker, cross-request hash cache, scheduler, generic config writer or independent approval/QA authority is introduced.

## Fallbacks and exit conditions
- Original-operation recovery remains the primary required uncertainty policy, not a retry workaround: inspect original UUID and replay only identical request. Capacity/claims stay protected while execution end is unknown.
- Old Cockpit IDs and unmatched historical probe entries remain intact because namespace/live-consumer/wrapper ownership is unconfirmed. This is the approved SD compatibility branch. Target state is exact owned transition to agdf-cockpit and deliberate agdf-test-* usage. Exit requires verified compatibility/ownership and a supported deliberate affected-client refresh; no duplicate, arbitrary kill or broad cleanup.
- Native UI unobserved/unsupported retains existing target/Run/presentation-bound text/document fallback. Exit requires fresh exact host/server/dispatcher/SDK/UI tuple, initialize, render, interaction and teardown evidence. No probe override qualifies product.
- Immutable claimed roots remain conservatively retained until existing ownership/end proof permits retirement; no liveness-based garbage collector is added.

## Structural assessment
One existing publication lock, one existing Codex transaction owner and guarded runtime references remain authoritative. Role IDs are closed selections; descriptors bind exact source/command/target/lifetime rather than granting ownership from names. Derived host status recomputes after transitions without a mirror registry. Repeated preparation preserves historical descriptors. Source/private argv/canary errors stay out of normal diagnostics. Full provenance, Core capture/revalidation, fixed command schemas and gate/receipt semantics remain. Shared App storage and foreign config/processes are untouched.
The strict 30000ms allowance now reaches acquisition and publication rather than only lock waiting; actual baseline/candidate child evidence demonstrates root repair. Atomic publication removes the observed empty-record race; unchanged installer prewarm publishes fresh immutable generations and retains live old bytes. Root causes are not masked by larger timeouts, retries on corrupt state or test-only changes.

## Evidence
CD_TESTS.md, CODE_REVIEW.md, TASK_PLAN_REVIEW.md and checks.json; exact final source/cache/marketplace/SDK qualification; real three-client and separated diagnostic transports; real installed refusal/replay/deadline probes; source/local-package owned lifecycle and rollback regressions. Existing guards pass, exact payload growth carries no spare headroom. Prerequisite fixtures/source fingerprints are disclosed without weaker expectations or a live-model claim.

## Boundaries
No current required implementation/evidence gap or parallel owner remains. Individual historical incident attribution and native desktop/Windows/model-host proof are stronger-claim limits, not claimed successes. Cooperative self-review is explicit. Actual legacy cleanup/migration is retained, not reported complete. Future human QA/UAT and OR remain mandatory.
context_graph_impact: link_only
context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
context_graph_reconciliation: resolved
context_graph_required_action: none
context_graph_gate_effect: none
context_graph_evidence: Same authoritative owners and invariants; current implementation/probe facts remain linked run-local evidence, not another normative registry.
required_next_step: Register current review evidence, then obtain sole qa-gate decision.
