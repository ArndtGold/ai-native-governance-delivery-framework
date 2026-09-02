# QA Report: Projektbezogener Plugin-Opt-out über alle Oberflächen

Status: revise
Gate: QA
Gate approval: not requestable
Revision: 1
Date: 2026-09-02
Based on: approved TP revision 1, CD+Tests revision 1 and mandatory reviews revision 1

## Quality Readiness

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | revise | Task Plan Review: 11/12 fully done; `CSO-T11` partial |
| Solution integrity | pass | Clean Implementation Review: one primary settings/lifecycle path, no fallback or parallel owner |
| Code quality | pass | Code Review: no open scoped finding |
| QA decision | revise | `qa-gate` is sole decision owner; open aggregate evidence gap `CSO-TPR-01` prevents pass |

Decisive reason: the complete repository aggregate and skill evaluation bundle is not green on the
combined dirty worktree. Next action: reconcile the named foreign baseline in its owning run, then
rerun the full evidence bundle.

## QA Gate

- decision: revise
- evidence: personal/shared Copilot behavior, Git-ignore protection, tracked-file rejection, strict
  JSON and path safety, atomic rollback, retention, Codex regression, documentation, package builds,
  Runtime Integrity and broad component regressions pass
- missing_evidence: one clean complete `smoke-test` and `test:skill-evals`/`eval:skills` result on the
  combined current worktree
- risks: accepting QA now could hide integration drift between this valid scoped change and the active
  release/gate-validation changes
- required_next_step: the owning parallel run reconciles its local-development version rule,
  Gate Check fingerprints and revision-id fixture, then this run reruns aggregate smoke and skill evals
- impact_codes: none registered for this run

## Consumed Normalized Findings

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| CSO-TPR-01 | evidence_gap | evidence_obligation | open | prevents pass |

## Gate Boundary

Exact `Approval: QA` must not be requested while this report is `revise`. UAT, release, commit, push
and PR claims remain forbidden.
