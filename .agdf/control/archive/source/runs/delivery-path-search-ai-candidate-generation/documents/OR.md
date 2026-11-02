# Orchestration Report: AI-Native Delivery Path Candidate Generation

## OR

- gate: QA approved (`Approval: QA` provided on 2026-07-11); next user gate is UAT
- report_mode: OR-full
- artefact: .agdf/control/artefacts/delivery-path-search-ai-candidate-generation/OR.md
- status: pass
- delivered:
  - Approved artefact chain UR -> PRD -> SD -> TP, each with exact `Approval:` evidence dated 2026-07-11.
  - Pre-implementation Brownfield Analysis pass; TP Review 14/14 tasks fully_done.
  - Implementation: additive generator/search contracts, provider-neutral generator protocol, shared read-only guard, Codex and Claude generator adapters, candidate policy (legality, dedup, similarity), diversity/orchestration, allowlisted context/redaction, opt-in CLI flags and surface adapters, deterministic fallback on generator failure.
  - Clean Implementation Review: pass. Code Review: pass, all findings resolved.
  - Documentation propagation: canonical Runtime Contract/skill, README/INSTALL/package README/CLI README/Pages capability text.
  - Real read-only Codex generator probe: 19.117s, three schema-valid proposals, one abstract cost unit, zero worktree mutation.
  - Real authenticated Claude generator-path probe: 25.309s (within the 30000ms budget), two schema-valid proposals, cost_units=2, zero worktree mutation, via `claude-haiku-4-5-20251001`.
  - `CG-DELIVERY-PATH-SEARCH` Context Graph node reconciled with delivered invariants and both real provider probes.
- intentionally_not_delivered:
  - UAT, release, commit, push and PR — blocked until `Approval: UAT` and, where relevant, further approvals.
  - Any change to the 30000ms generator budget cap or retry logic — retained as a candidate SD-level follow-up, not applied ad hoc in this run.
- evidence:
  - `TP_REVIEW.md`: 14 fully_done, 0 partially_done, 0 not_done.
  - `QA_REPORT.md`: decision `pass`, PRD AC 1-22 pass, Brownfield fit pass, solution integrity pass, code review pass, documentation and Context Graph pass.
  - Two earlier real Claude generator-path attempts (default model, then explicit Haiku) exceeded the 30000ms budget and were correctly terminated by the read-only guard with zero worktree mutation, before the third real attempt succeeded within budget — evidencing both the timeout fail-closed path and the success path.
- missing_evidence: none for QA; UAT evidence (user acceptance) is the next required input.
- risks: The fixed 30000ms per-call generator budget is marginal for real Claude latency (2 of 3 real attempts timed out before one succeeded). Advisory-only impact: the deterministic baseline and gate legality are never weakened, and the tested deterministic fallback (AICG-08) covers generator failure/timeout gracefully. Carried forward as a candidate SD-level follow-up (raise the cap or add bounded retry), not a blocker to this run's closeout.
- retained_fallbacks: Deterministic candidate generation and evaluation remain the sole baseline; AI-native generation is strictly additive, opt-in, and falls back to the deterministic path on any generator failure, schema violation, budget breach, or timeout, with tested fixture coverage (AICG-08). Exit criteria for the fallback: none required to close now — it is the designed, permanent safety net for this feature, not a temporary workaround.
- required_next_step: Present this delivered scope for UAT and request `Approval: UAT`.
- quality_outlook: Carry the 30000ms budget-marginality risk forward as a candidate SD-level follow-up (raise the cap or add bounded retry) for a future scope; do not raise it ad hoc.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Node updated with delivered invariants, both real Codex and Claude generator-path probes (success and timeout cases), and the retained budget-marginality risk as a candidate SD-level follow-up.
