# Orchestration Report: AGDF Request Activation Boundary

Status: revise
Decision: revise
Revision: 2
Date: 2026-09-05
Run: `agdf-request-activation-boundary`

## OR

- gate: `QA`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/agdf-request-activation-boundary/OR.md`
- status: `revise`
- delivered: One compact canonical Request Activation Kernel; silent abstention for ordinary
  read-only work; positive routing only for delivery, binding artefacts, explicit AGDF/control
  operations and unambiguous active-run actions; compact skill discovery; two-stage SessionStart and
  OpenCode loading; definition-owned byte budgets; deterministic composed-profile tooling; package
  and handbook projections; strict canonical-init exact-match preservation and drift protection.
- intentionally_not_delivered: No second hook or classifier, dispatcher v2, raw-prompt transport,
  host-specific activation policy, OpenCode permission widening, global installation, live host
  mutation, external model-profile transmission, QA approval request, UAT, release, commit, push or
  pull request.
- missing_approvals: QA is not approved and must not be requested while the report decision is
  `revise`; UAT is missing and unavailable before QA pass plus exact QA approval.
- TP_coverage: 6/8 relevant tasks are `fully_done`; `RAB-TP-20` is `partially_done` and
  `RAB-TP-15` is `not_done` because their external evidence is unavailable.
- brownfield_fit: `pass`; the final implementation reuses the approved contract, router, skill,
  SessionStart, OpenCode, package, lifecycle and integrity owners without a competing authority.
- solution_integrity: `pass`; Clean Implementation Review Revision 5 and Code Review Revision 3
  have no open solution or code finding. `RAB-CIR-02`, `RAB-BA-01` and `RAB-CR-01` are resolved.
- evidence: Focused Request Activation and callback suites, all final instruction budgets, Runtime
  Integrity positive/negative paths, package build and contents, local development install,
  canonical-init security and public retry reproduction, 83/83 deterministic skill evals and the
  final isolated aggregate smoke all pass.
- missing_evidence: `RAB-TPR-02` requires four external model-backed composed-profile runs.
  `RAB-TPR-01` requires exact install/readback/restart/fresh-session evidence for Codex, Claude Code,
  GitHub Copilot and OpenCode, including direct/automatic selection and both compaction probes.
- risks: Source-composed and deterministic behavior may differ from model-backed or loaded-host
  interpretation. Host parity and compaction retention must not be inferred.
- retained_fallbacks: Every selected skill retains one marker-bounded kernel until all four hosts
  prove common eager-kernel availability. OpenCode retains one maximum 1,100-byte kernel-only
  compaction block until same-version/digest evidence proves system-transform reapplication and
  current-binding availability after compaction.
- required_next_step: Obtain separate authorization for external model-profile transfer and each
  host lifecycle change, then execute both evidence sets, refresh TP Review and rerun QA.
- quality_outlook: Repository, deterministic, package, solution and code evidence pass; QA remains
  `revise` until both evidence obligations are complete.
- delivery_closeout: not permitted while QA is `revise`.

## Documentation And Context

- documentation_impact: complete for repository documentation; README and German/English handbooks
  describe the two-stage model and evidence boundary.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-REQUEST-ACTIVATION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `update`
- context_graph_gate_effect: `warning`
