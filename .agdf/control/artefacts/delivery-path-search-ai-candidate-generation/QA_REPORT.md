# QA Report: AI-Native Delivery Path Candidate Generation

Status: pass
Gate: QA
Date: 2026-07-11
Owner: agent
Tests: approved `TP.md`

## QA Gate

- decision: pass
- evidence:
  - Approved UR, PRD, SD and TP with passed pre-implementation Brownfield Analysis.
  - TP Review: 14 fully done, 0 partially done, 0 not done.
  - Clean Implementation Review and Code Review: pass after resolving all code findings.
  - Unit, integration, generator, both package smoke paths, runtime integrity, Astro check and `git diff --check` pass.
  - Real Codex read-only generator probe passed: 19.117 seconds, three schema-valid proposals, one abstract cost unit, zero worktree mutation.
  - Claude CLI authentication confirmed working: a real raw `-p` call using the exact generator prompt, disallowed-tools flags and output schema completed in 26.446s via `claude-haiku-4-5-20251001`, provider cost $0.0618, returning five schema-valid proposals.
  - Real authenticated Claude generator-path probe passed: 25.309 seconds via `claude-haiku-4-5-20251001`, two schema-valid proposals (cost_units=2), zero worktree mutation, satisfying PRD AC 22 and TP AICG-07/AICG-13.
  - Two earlier real generator-path attempts (default model, then Haiku) exceeded the approved 30000ms budget and were correctly terminated by the read-only guard with zero worktree mutation in both cases, confirming fail-closed mutation safety under timeout; the deterministic fallback path (AICG-08) is tested and covers this failure mode.
  - `CG-DELIVERY-PATH-SEARCH` updated to record the resolved authentication gap, the successful in-budget probe and the retained budget-marginality risk.
- missing_evidence: none.
- risks: The 30000ms per-call generator budget is marginal for real Claude latency: two of three real generator-path attempts (including the fastest available model) timed out at the cap before the third succeeded. This is advisory-only, mitigated by the tested deterministic fallback, and does not block the deterministic baseline; carried forward as a candidate SD-level follow-up (raise the cap or add bounded retry), not a QA blocker.
- required_next_step: Proceed to Orchestration Report / release-or.
- impact_codes: none

## Coverage Decision

- PRD AC 1-22: pass
- Brownfield fit: pass
- solution integrity: pass
- code review: pass
- documentation and Context Graph: pass
- QA pass allowed: yes
- release/UAT allowed: yes, with the budget-marginality risk carried forward as documented advisory evidence

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Delivered invariants, both real generator probes (Codex and Claude) and the retained budget-marginality risk are persisted in the existing node.
