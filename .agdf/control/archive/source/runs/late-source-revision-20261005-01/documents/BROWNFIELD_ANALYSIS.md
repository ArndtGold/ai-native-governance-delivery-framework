# Brownfield Analysis: late source revision

- mode: pre_implementation_analysis
- decision: pass
- scope: approved TP T-000 through T-009; valid sealed active structured CD+Tests after TP only
- evidence: IMPLEMENTATION_BASELINE.json; CURRENT_PROOF_CONSUMERS.json; approved UR/PRD/SD/TP; actual existing Core and CLI source inspection
- current_coverage: partially_done for exact locks, seals, append-only approval/binding receipts, source recording and early PRD revision; not_done for late impact, exact historical bytes, effective invalidation and archive-aware transaction
- reuse_strategy: extend existing revision, writer, seal, pending journal, projection, parser and consumer owners; subordinate history modules only; no new workflow/MCP write authority
- risks: missed proof consumers, source replacement history loss, unsafe archive closure, post-commit durability/concurrency/replay, stale analysis, growth constraints and independent dirty work
- missing_evidence: actual new behavior, fault/concurrency/replay and packaged/runtime/platform evidence; all planned in approved TP, no implementation claim
- parallel_structure_risk: mitigated by one Run receipt authority, existing transaction journal, shared effective projection and original-path immutable subordinate evidence; acceptance remains approved PRD
- visible_state_owner: Core evaluated current state and existing CLI/interaction output; history is explicitly evidence only, pending outcome stays recovery-required
- compatibility: retain existing no-options early boundary and version-1 transactions, no bulk migration; no new protocol write tool
- scope_protection: approved original design run/artifacts, independent CI paths and current package baseline matched captured hashes; shared dirty source bytes saved before modification
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: run-specific implementation baseline and proof-consumer inventory; canonical architectural documentation updated later under T-007
- required_next_step: record completed preparation in selected canonical control, redispatch then execute T-001 onward within approved source/plan boundaries

## Reuse And Parallel-Structure Risk

| Boundary | Finding | Treatment | Owner | Exit condition |
|---|---|---|---|---|
| Evidence history | trade-off: exact archive adds I/O and validation cost | Existing subordinate evidence with immutable raw bytes and pinned manifest; no recursive archive copies or unrelated eager reads | Core revision/seal owner | T-006 historical integrity cases and T-008 performance evidence pass before QA |
| Transaction | problem: current journal covers Run/Backlog/OR only | Extend existing journal variant and explicit recovery; no second commit point | Core transaction owner | T-006 before/after-commit, competition and replay evidence pass |
| Current proof | problem: latest receipt alone can become obsolete | Shared effective projection plus validated current pointers across enumerated consumers | Core binding/evaluation owners | Every consumer has current-versus-historical evidence before review/QA |

No unresolved product/design decision prevents implementation preparation. Numeric package growth remains a future exact reviewed maintainer decision, not silently accepted debt or threshold headroom.
