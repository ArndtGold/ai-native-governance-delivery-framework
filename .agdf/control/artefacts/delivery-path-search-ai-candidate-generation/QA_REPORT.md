# QA Report: AI-Native Delivery Path Candidate Generation

Status: revise
Gate: QA
Date: 2026-07-11
Owner: agent
Tests: approved `TP.md`

## QA Gate

- decision: revise
- evidence:
  - Approved UR, PRD, SD and TP with passed pre-implementation Brownfield Analysis.
  - TP Review: 12 fully done, 2 partially done, 0 not done; partial items are authenticated Claude live evidence and the aggregate evidence task.
  - Clean Implementation Review and Code Review: pass after resolving all code findings.
  - Unit, integration, generator, both package smoke paths, runtime integrity, Astro check and `git diff --check` pass.
  - Real Codex read-only generator probe passed: 19.117 seconds, three schema-valid proposals, one abstract cost unit, zero worktree mutation.
  - Real Claude invocation reached the installed CLI but stopped before model execution with `Not logged in`; provider cost was $0. Deterministic Claude success/authentication/guard tests pass.
  - `CG-DELIVERY-PATH-SEARCH` records delivered invariants and the retained live-evidence caveat.
- missing_evidence: One successful authenticated Claude generator probe with observed duration, available cost metadata and zero worktree mutation, required by PRD AC 22 and TP AICG-07/AICG-13.
- risks: Full executable cross-surface behavior cannot be claimed from mocks plus an unauthenticated invocation. Instruction-only surfaces remain correctly unsupported for native execution.
- required_next_step: Authenticate the local Claude CLI, rerun exactly one bounded Claude generator probe, record the result, then rerun TP Review and QA Gate.
- impact_codes: `QA_RUNTIME_EVIDENCE_INCOMPLETE`

## Coverage Decision

- PRD AC 1-21: pass
- PRD AC 22: partial
- Brownfield fit: pass
- solution integrity: pass
- code review: pass
- documentation and Context Graph: pass with explicit Claude caveat retained
- QA pass allowed: no
- release/UAT allowed: no

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Delivered invariants and the exact unauthenticated Claude evidence gap are persisted in the existing node.
