# CD+Tests: Reliable MCP runtime and coherent Codex setup
Decision: pass
Owner: Codex cooperative implementation and verification
Date: 2026-10-14

## Delivered scope
Implemented the exact approved TP at the existing package/launcher, Core lock, Worker/generation and Codex lifecycle owners. Valid live claim contention waits at most 5550ms within the unchanged shared 30000ms publication budget. Complete owner metadata is atomically published, with inode/token guarded cleanup; unknown, malformed, foreign and oversized records remain refused. The directly owned acquisition child and publication share that same deadline. Fresh per-request Worker/full provenance stays; occupancy is retained until termination is confirmed, and uncertain effects require the original UUID.
Closed Codex roles, exact config/wrapper revalidation and guarded rollback preserve foreign content/shared references. Setup is derived, bounded and distinguishes declarations from native observations. Optional Cockpit preparation uses immutable generations and the new agdf-cockpit ID; diagnostics use agdf-test-* and exact descriptors. Preparation and repeat never overwrite historical descriptors. The scoped regular-registration status now directs plugin users to the plugin rather than suggesting a duplicate registration.

## Verification
checks.json and scenario-evidence-index.json cover the 32 approved scenarios, 14 criteria and 10 design decisions. Normal preparation/build, 56 compatibility source scenarios and 102 unchanged deterministic eval outputs pass. The complete MCP suite passes; final owner/launcher hardening is additionally covered by targeted regressions and actual installed functions/CLI/STDIO. Applicable performance/instruction/size guards pass unchanged; exact legitimate payload growth is reviewed at 253 files/2218869 bytes with zero headroom.
Final installed candidate: 0.14.5+codex.local-0e4bdc1df572; normalized source 0e4bdc1df572158e7ea7dddb23cb83cdacb13705dd3141f9ce64bdc90d0d3422; marketplace, cache, generated source and frozen owner bytes match. Actual producer: dispatcher 99ba11c32405acfb2445da5227d7049be836f3988789c2ee658838af79dcaece, server 57e00b512994b060995ff5875e89620f87bf5a275857ea217f87f2ba6f1dd6b1, SDK b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb. Twenty cold, twenty warm, ten three-client waves and ten separate product/diagnostic waves pass with all 120 samples retained. Product cold p95 2052.847ms/max 2133.938ms; warm p95 552.899ms/max 742.024ms; three-client combined p95 2529.540ms/max 2568.420ms. Final fixture guards: cold p95 895.219ms, warm p95 799.051ms.
Actual installed surface-local CLI/STDIO records one disposable effect, queries its original status and replays identical UUID/request without another write; changed payload/stale revision refuse. Installed corruption/unknown-owner/symlink probes use only full own runtime copies. Baseline original acquisition published after 33427ms; the installed candidate supplies a 29970ms remaining child timeout and returns deadline failure after 30006.759ms including observed exit/cleanup overhead, without extending the configured budget.

## Counterevidence and boundaries
Earlier normal three-client claim failure is retained and led to the atomic publication repair. Two earlier performance failures overlapped heavy verification/installation; the clean measurement and complete-suite success do not erase them. A new 250ms child-focused probe correctly expired during full source proof under concurrent verification; its assertion about reaching the child was invalid. The corrected fixture gives source proof room with a 3000ms test budget; production stays 30000ms, short claim tests stay 5550/300ms, and actual installed full-budget proof passes. Raw recovery evidence retains a collector key collision; reviewed evidence explicitly separates the operation-status object from the passing case verdict without fabricating a new execution.
Historical broad startup/timeout codes lack the original private exception/phase traces. Reproductions prove current mechanisms and counterevidence, not individual historical incidents. Fresh native desktop rendering, interaction, teardown, effective host policy and Windows/model-host qualification remain unobserved and are not claimed. Actual legacy IDs/wrappers/live consumers stay retained under approved SD compatibility conditions. Full local CLI setup projection and actual installed surface-local validator are distinct surfaces.

## Preservation and next step
Actual user/project config hashes are unchanged; no second product registration, automatic host restart, shared App-data purge, foreign process kill, other-Run repair, commit, push or release occurred. Source fixture corrections retain existing expectations. Unrelated architecture/UI changes remain user-owned. Approved UR/PRD/SD/TP bytes remain immutable.
context_graph_impact: link_only
context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter; .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
context_graph_reconciliation: resolved
context_graph_required_action: none
context_graph_gate_effect: none
context_graph_evidence: Same existing owners and authority edges; stronger implementation of existing bounded execution/ownership, with current evidence kept run-local.
memory_target: scope_artifact
memory_reason: Current candidate and qualification facts, no memory store change.
required_next_step: Bound TP Review, Clean Implementation Review and mandatory Code Review, then sole qa-gate; no human QA/UAT/OR decision is inferred.
