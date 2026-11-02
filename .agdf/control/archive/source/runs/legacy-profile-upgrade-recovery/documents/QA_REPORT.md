# QA Report: Release-Owned Historical Profile Compatibility

Status: done
Decision: revise
Revision: 5
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 9, Brownfield Analysis Revision 8, CD+Tests Revision 6 and mandatory
reviews Revision 5

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise | 15/16 tasks fully done; CAT-T12 remains partial because complete aggregate and remote evidence are open |
| Solution integrity | pass | one immutable snapshot inside the existing digest and marketplace transaction owners; no fallback, schema drift or parallel structure |
| Code quality | pass | Code Review Revision 5 has no open correctness, error-path, security, compatibility or maintainability finding |
| QA decision | revise | `qa-gate` cannot pass while normalized finding TPR-5-01 remains open |

Sole decision owner: `qa-gate`.

## QA Gate

- decision: revise
- evidence: Brownfield, Clean and Code Review pass. Stable source identity, injected source change,
  cleanup retry, zero-host-call, Codex/Claude/Copilot versions, existing marketplace recovery,
  lifecycle, release preparation and source Runtime Integrity all pass.
- missing_evidence: a complete green `create-agdf smoke-test` and an affected remote GitHub Actions
  rerun.
- risks: the implementation-specific behavior is strongly evidenced, but release readiness would
  overstate the repository while the unchanged generated-runtime layout fixture still fails. Later
  aggregate checks were not reached, and remote workflow behavior is not proven by local YAML or
  release preparation alone.
- required_next_step: route TPR-5-01 to its evidence obligation. Reconcile the separately owned
  runtime-packaging baseline and any later aggregate blockers, rerun complete smoke, then rerun the
  affected GitHub Actions workflow.
- impact_codes: `qa_revise_required`, `evidence_gap`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| TPR-5-01 | evidence_gap | evidence_obligation | open | prevents QA pass; classification and route retained unchanged |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: the node records one immutable local source snapshot, explicit per-surface
  versions, pre-swap cleanup and fail-closed no-host behavior.

## Evidence Boundaries

- No QA approval is requested while decision is `revise`.
- No direct host/cache mutation, UAT, loaded-session, publication, tag, push or release claim is made.
- Unrelated worktree changes and untracked assets remain untouched.
