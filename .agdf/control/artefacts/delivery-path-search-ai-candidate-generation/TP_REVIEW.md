# Task Plan Review: AI-Native Delivery Path Candidate Generation

Status: revise
Date: 2026-07-11
Reference: approved `TP.md`

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| AICG-01 | fully_done | `BROWNFIELD_ANALYSIS.md` pass; worktree and owners inspected | none | none |
| AICG-02 | fully_done | additive generator/search contracts; positive/negative/unknown-field/budget fixtures pass | none | none |
| AICG-03 | fully_done | canonical `gate_action`, normalization, signature and similarity policy with regression fixtures | none | none |
| AICG-04 | fully_done | provider-neutral generator protocol and deterministic fixture generator | none | none |
| AICG-05 | fully_done | shared guard; success, mutation-on-failure and timeout fixtures; existing evaluators reuse guard and smoke tests pass | none | none |
| AICG-06 | fully_done | Codex adapter mocks pass; real read-only probe passed in 19.117s with three proposals, one abstract cost unit and unchanged worktree | provider-currency cost unavailable | advisory only |
| AICG-07 | partially_done | Claude adapter success/auth mocks pass; real CLI returned `Not logged in`, zero provider cost, before model invocation | authenticated live model response and measured successful duration | QA must retain caveat or obtain authenticated evidence |
| AICG-08 | fully_done | success, rejection, schema failure, stricter-budget failure and deterministic fallback integration fixtures pass | none | none |
| AICG-09 | fully_done | allowlisted request validation, redaction, additive JSON/Markdown output and legacy persistence tests pass | none | none |
| AICG-10 | fully_done | opt-in CLI flags, bounds, surface adapters, generator fixture smoke path and explicit unsupported error implemented | none | none |
| AICG-11 | fully_done | canonical Runtime Contract/skill updated; assets regenerated; runtime integrity passes | none | none |
| AICG-12 | fully_done | README, INSTALL, package README, CLI README and Pages capability text updated conservatively | none | none |
| AICG-13 | partially_done | all deterministic focused/runtime/package checks pass; Codex live pass; Claude authentication caveat remains | authenticated Claude live pass | QA cannot claim full live-surface evidence |
| AICG-14 | fully_done | `CG-DELIVERY-PATH-SEARCH` reconciled with delivered generator invariants and retained Claude evidence caveat | none | none |

## Acceptance Criteria

- PRD AC 1-21: done with deterministic, runtime-integrity and package-smoke evidence.
- PRD AC 22: partial. Codex measured probe passed; Claude probe was attempted but authentication was unavailable.
- Evidence confidence: high for deterministic contracts, policy, orchestration, CLI, persistence and propagation; medium for cross-surface live behavior because Claude lacks authenticated runtime evidence.

## Summary

- fully_done: 12 tasks
- partially_done: 2 tasks (`AICG-07`, `AICG-13`)
- not_done: 0
- out_of_scope_changes: none; the pre-existing gate-check Brownfield-Analysis projection defect was documented but not changed
- risks: Claude executable generation is deterministically tested but not live-verified in the current environment
- required_next_step: Carry the Claude authentication/live-probe gap explicitly into QA; do not present full cross-surface live verification as passed.
