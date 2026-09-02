# Task Plan Review: Copilot-Specific AGDF Payload

Status: done
Decision: revise
Revision: 5
Date: 2026-09-02
Reference: approved `TP.md` Revision 3 and QA finding CPI-QA4-01

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| CPI3-T01 | fully_done | Brownfield Analysis Revision 3 remains applicable; the correction stays in the existing installer owner | none | none |
| CPI3-T02 | fully_done | generated Copilot-only artifact and ten prefixed skills remain unchanged | none | none |
| CPI3-T03 | fully_done | semantic inventory owner remains unchanged | none | none |
| CPI3-T04 | fully_done | profile negative and growth matrices pass | none | none |
| CPI3-T05 | fully_done | profile-aware Runtime Integrity and provenance remain unchanged | none | none |
| CPI3-T06 | fully_done | isolated marketplace and transaction regression pass | none | none |
| CPI3-T07 | fully_done | both process `ENOENT` and the exact official missing-binary launcher prefix use the same pinned npm fallback; unrelated verification failures remain fail-closed | none | none |
| CPI3-T08 | fully_done | marketplace coexistence and rollback regression pass | none | none |
| CPI3-T09 | fully_done | local development, lifecycle, Copilot profile, marketplace and CLI modularization tests pass | none | none |
| CPI3-T10 | fully_done | public command and documentation contract remain unchanged | none | none |
| CPI3-T11 | partially_done | focused suites and release preparation pass | complete smoke remains blocked by separately owned combined-worktree runtime packaging baseline | prevents QA pass |
| CPI3-T12 | fully_done | corrected real install succeeds; official CLI lists `agdf@agdf` 0.14.4 and installed validator reports matched provenance with ten skills | fresh-session behavior remains the explicit UAT boundary | none |
| CPI3-T13 | fully_done | revised Task Plan, Clean Implementation and Code Reviews plus QA Revision 5 are persisted | none | none |

## Summary

- fully_done: 12/13
- partially_done: 1/13 (`CPI3-T11`)
- not_done: 0/13
- out_of_scope_changes: none in the reviewed fallback correction
- risks: deterministic and current installed-state behavior are corrected, but complete combined
  aggregate evidence remains open
- required_next_step: retain the separately owned aggregate evidence gap and rerun QA

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-TPR4-01 | evidence_gap | evidence_obligation | open | corrected real installation and installed-state read-back pass; combined-worktree full smoke still has a separately owned runtime-packaging blocker | refresh aggregate evidence after the foreign baseline is repaired |
