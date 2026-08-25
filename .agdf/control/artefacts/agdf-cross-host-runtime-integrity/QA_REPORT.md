# QA Report: Cross-Host Plugin Runtime Integrity

Status: pass  
Decision: pass  
Date: 2026-08-25  
Revision: 2  
Decision owner: qa-gate

## Quality Readiness

| dimension | result | evidence |
|---|---|---|
| Plan coverage | pass | Task Plan Review confirms 12/12 tasks fully done and all applicable UX Intent Fidelity rows fulfilled. |
| Solution integrity | pass | One runtime/provenance owner, exact legacy migration, no missing-marker migration and no parallel runtime, installer or status engine. |
| Code quality | pass | Five review findings were corrected and independently regression-tested; no open finding remains. |
| QA decision | pass | `qa-gate` is the sole decision owner. Repository, package, installed-root and final fresh-host evidence are sufficient. |

## QA Gate

- decision: pass
- evidence: approved TP revision 2; Brownfield Analysis pass; refreshed `CD_TESTS.md`; two final full smoke-suite exit-0 runs after host-driven corrections; Runtime Integrity and registry-free exact-version probes; Task Plan Review, Clean Implementation Review and Code Review pass; explicitly authorized supported installs and final fresh sessions for Codex, Claude Code and OpenCode; portable candidate runtime absence; resolved Context Graph update.
- missing_evidence: none required for QA. Human UAT remains a separate later gate. Claude model-response evidence is unavailable because that CLI is not logged in, but its plugin discovery, version, enabled state, `SessionStart` hook, loaded root and skill inventory are directly observed.
- risks: the currently open Codex app task predates the reinstall; a new isolated Codex CLI session loaded the final cache successfully. The separate Claude cache path still contains an earlier same-semver copy, while the actual fresh Claude host `init.plugins` and hook load the final durable marketplace root; the evidence planes are intentionally not conflated.
- required_next_step: request exact `Approval: QA` for this pass report; do not start UAT before that approval is accepted and revalidated.
- impact_codes: none assigned by the repository quality contract.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CRI-TPR-01 | evidence_gap | evidence_obligation | resolved | CRI-H01 through CRI-H04 direct host and portable evidence is recorded | none |
| CRI-CR-01 | implementation_gap | CD+Tests | resolved | Claude manifest version coherence is enforced | none |
| CRI-CR-02 | implementation_gap | CD+Tests | resolved | Exact old-definition legacy migration passes; non-owned migration fails | none |
| CRI-CR-03 | implementation_gap | CD+Tests | resolved | OpenCode absolute local tarball installation passes with spaces | none |
| CRI-CR-04 | implementation_gap | CD+Tests | resolved | Codex prompt count and length limits are tested and host-clean | none |
| CRI-CR-05 | implementation_gap | CD+Tests | resolved | Missing provenance cannot become migration authority | none |

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: the existing CLI/installer node now records source non-installability, shared runtime profiles, exact legacy migration and separated evidence planes; the public-distribution node now reflects the observed Codex three-prompt/128-character host limits.

This pass report is ready for exact `Approval: QA`. It does not grant UAT or release authority.
