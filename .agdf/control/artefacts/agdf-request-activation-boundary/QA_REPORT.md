# QA Report: AGDF Request Activation Boundary

Status: revise
Decision: revise
Revision: 3
Date: 2026-09-05
Run: `agdf-request-activation-boundary`
Based on: approved TP Revision 3, Brownfield Analysis Revision 3, final CD+Tests,
Task Plan Review Revision 3, Clean Implementation Review Revision 5 and Code Review Revision 3

## Quality Readiness

| Dimension | Owner | Status | Decisive evidence |
|---|---|---|---|
| Plan coverage | task-plan-review | revise | `RAB-TP-20` is partial and `RAB-TP-15` is not done |
| Solution integrity | clean-implementation-review | pass | One bounded two-stage activation solution; justified evidence-bound fallbacks and no parallel owner |
| Code quality | code-review | pass | `RAB-CR-01` is corrected, independently re-reviewed and covered by focused plus full smoke evidence |
| QA decision | qa-gate | revise | Two required evidence gaps remain open |

Sole decision owner: `qa-gate`. Decisive reason: required model-backed composed-profile and fresh
loaded-host evidence is unavailable. Permissible next action: obtain separate authorization for
external model-profile transfer and each host lifecycle change, then complete those evidence
obligations without treating deterministic results as host proof.

## QA Gate

- decision: `revise`
- evidence: The activation kernel, no-callback semantics, callback order, two-stage projections,
  instruction budgets, Runtime Integrity, package build, package contents, local development install,
  OpenCode hardening, 83/83 deterministic skill evals and the isolated aggregate smoke pass. The
  post-activation router is deterministically reachable in source, generated and packaged profiles.
- missing_evidence: Four TP-required external model-backed composed-profile runs did not execute.
  No exact Revision 3 profile was installed, read back, restarted and observed in fresh Codex,
  Claude Code, GitHub Copilot or OpenCode sessions; all required host families and both OpenCode
  compaction probes remain `unavailable`.
- risks: Model interpretation, automatic skill selection and loaded-host instruction ordering may
  differ from deterministic source-composed evidence. A QA pass would falsely infer that parity.
- required_next_step: Obtain separate authorization for external model-profile transfer and each
  host lifecycle change, then execute and record the four TP-required composed-profile runs and the
  exact install/readback/restart/fresh-session matrix for all four hosts before refreshing TP Review
  and rerunning QA.
- impact_codes: `qa_revise_required`, `behavioral_evidence_missing`, `host_evidence_missing`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| `RAB-CR-01` | implementation_gap | CD+Tests | resolved | strict valid-run snapshots, security matrix, public retry reproduction, independent re-review and final full smoke pass |
| `RAB-TPR-01` | evidence_gap | evidence_obligation | open | prevents QA pass and UAT until all four host chains and case families are observed |
| `RAB-TPR-02` | evidence_gap | evidence_obligation | open | prevents complete TP behavioral evidence until separately authorized external transfer and all four composed-profile runs complete |
| `RAB-CIR-02` | emergent_risk | SD | resolved | accepted only because SD Revision 5 and the final implementation prove the two-stage correction |

## Evidence Boundaries

- Source, deterministic evaluator, generated profile, package, temporary install, installed host and
  fresh loaded-host evidence remain separate planes.
- The 83/83 skill eval result and composed-profile stubs are deterministic replay, not model-backed
  or installed-host proof.
- External profile transmission and each host lifecycle mutation require separate authorization
  before their evidence runs may execute.
- `HOST_OBSERVATION_MATRIX.json` records `unavailable` rather than inferred zero or pass.
- No QA approval, UAT, release, commit, push or pull request is authorized by this report.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
