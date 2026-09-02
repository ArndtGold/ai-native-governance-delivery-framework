# Task Plan Review: Projektbezogener Plugin-Opt-out über alle Oberflächen

Status: revise
Revision: 1
Date: 2026-09-02

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CSO-T01 | fully_done | Brownfield Analysis revision 1, clean candidate-path inventory and owner map | none | none |
| CSO-T02 | fully_done | parser, registry, help and option-matrix tests pass | none | none |
| CSO-T03 | fully_done | one settings planner, personal/shared path and merge tests pass | none | none |
| CSO-T04 | fully_done | invalid JSON, JSONC, type, target and parent-symlink fixtures pass fail-closed | none | none |
| CSO-T05 | fully_done | injected and real-Git ignore tests, including tracked-local rejection | none | none |
| CSO-T06 | fully_done | atomic rename cleanup, postcondition and exact-byte rollback tests pass | none | none |
| CSO-T07 | fully_done | surface-aware lifecycle and unchanged Codex regression pass | none | none |
| CSO-T08 | fully_done | structured failure, `pending_restart`, audience, retention and one-next-action assertions pass | none | none |
| CSO-T09 | fully_done | Copilot retention integration passes for personal/shared and failure paths | none | none |
| CSO-T10 | fully_done | three public documents plus help are synchronized and asserted | fresh-host observation is intentionally later UAT | none before UAT |
| CSO-T11 | partially_done | focused suites, package builds, integrity and most aggregate components pass | full smoke and skill evals cannot pass on the combined foreign release/gate-validation baseline | prevents QA pass |
| CSO-T12 | fully_done | Task Plan, Clean Implementation and Code Review exist; QA revision 1 records `revise` | none | QA decision remains revise |

## Summary

- fully_done: 11/12
- partially_done: 1/12 (`CSO-T11`)
- not_done: 0/12
- out_of_scope_changes: pre-existing `legacy-profile-upgrade-recovery`, status-card/gate-validation
  and image changes remain outside this run
- risks: combined-worktree aggregate failure can mask a cross-scope regression until its baseline is repaired
- required_next_step: resolve the foreign aggregate baseline in its owning run, then rerun full smoke
  and skill evaluations without changing this approved implementation scope

## UX Intent Fidelity

UI/UX impact is `none`. CLI-visible product behavior in PRD-01 through PRD-09 is implemented and
covered by focused tests. Fresh-host claims remain intentionally absent.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSO-TPR-01 | evidence_gap | evidence_obligation | open | aggregate smoke and skill evaluations fail in named foreign version/gate fixtures | reconcile the foreign baseline, then rerun the complete aggregate evidence bundle |
