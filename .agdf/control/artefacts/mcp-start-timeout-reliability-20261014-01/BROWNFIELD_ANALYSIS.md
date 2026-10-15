# Brownfield Analysis: MCP reliability and Codex setup
Decision: pass
Mode: pre_implementation_analysis
Owner: Codex cooperative analysis
Date: 2026-10-14

## Scope and evidence
Exact approved TP/SD of mcp-start-timeout-reliability-20261014-01; implementation-baseline.json freezes HEAD, 31 production owner files, 16 protected approved/unrelated files and dirty-path inventory. No production edits preceded this capture.
SD source/installed claim experiments prove valid live-lock misclassification; TP real complete-runtime-copy timing supplies the fixed 5550ms wait bound. An actual existing executor with deferred termination proves capacity freed before termination and overlapping second Worker. Neither is automatically a historical incident root cause.

## Existing-system assessment
- Claim/package owner: partially_done; full fresh proofs, durable immutable claims and shared publication lock exist. Extend this owner with exact-live bounded waiting, same deadline accounting and safe classified errors at both callers.
- Executor: partially_done; fresh per-request Worker/full provenance and timeout exist. Refactor only completion/draining occupancy and bounded confirmation; retain unknown effect and original operation identity.
- Codex topology/transactions: partially_done; adapters/codex.js currently handles exact agdf only. Its local file-utils.js is under adapters/, not the parent lifecycle directory. Existing snapshot rollback is unconditional and apply lacks current-byte revalidation. Extend the same transaction owner with closed roles, exact snapshots/locks, proven-owned specs and guarded rollback. No generic section writer.
- Cockpit/probe preparation: partially_done; opt-in package assembly and reviewable snippets exist. Reuse them for agdf-cockpit and exact diagnostics descriptors, leaving activated:false until owned transaction. Legacy namespace/ownership evidence remains necessary before live removal.
- Host observation and App: partially_done; CLI readback/provenance/UI gates exist. Compose bounded declared facts and observed/unavailable stages within the same Codex lifecycle/result/presentation owner. No mutable mirror, capability override or synthetic native promotion.
- Build/install/tests: fully existing owners; normal preparation/build, supported installer/prewarm and targeted fixtures reused. Qualified source, package, fresh transport and native host remain separate lanes.

## Minimal clean implementation
T-002/T-003/T-004 first with baseline regressions, then T-005/T-006/T-007/T-008/T-009 at current owners, followed by T-010 supported serial build/install/qualification and T-011 reviews/sole QA.
Safe same-invocation optimization requires measured duplicate proof; none is justified yet. Do not alter Core capture/revalidation to hide concurrent-source refusals.
New runtime/property additions stay internal or bounded additive lifecycle evidence; public fixed MCP command envelopes remain unchanged. Named closed-role input is supported through current lifecycle composition rather than another setup owner.
No architecture replacement, cross-request cache, new process authority, second scheduler, wider permission or deadline is authorized.

## Risks and required evidence
Historical startup/timeout attribution, final-candidate workloads, native rendering and exact legacy cleanup proof remain execution/evidence obligations, not preparation blockers. Unknown required normal-path failures block later QA. Actual legacy unproven entry/consumer blocks that specific removal/migration; retain explicitly. A repair outside SD requires existing approved-source reassessment before that edit. Existing claimed generation/session bytes and all unrelated dirty paths stay protected.

## Context Graph
context_graph_impact: link_only
context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#MCP-DISPATCH-ADAPTER; .agdf/control/CONTEXT_GRAPH.md#NATIVE-INTERACTION-AUTHORITY; .agdf/control/CONTEXT_GRAPH.md#RUN-SCOPED-CONTROL-STATE
context_graph_reconciliation: resolved
context_graph_required_action: none
context_graph_gate_effect: none
context_graph_evidence: Approved SD/TP owner mapping; final reusable invariant changes reassessed at closeout.
memory_target: scope_artifact
memory_reason: Current-run preparation and measured regression facts.
memory_refs: evidence/implementation-baseline.json; evidence/TP_CLAIM_BASELINE.json

## Next step
Record this preparation through the existing internal-step owner, then redispatch exact Run before CD+Tests. Preparation pass is not a technical QA result.
