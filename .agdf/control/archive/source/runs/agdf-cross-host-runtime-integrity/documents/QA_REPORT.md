# QA Report: Cross-Host Plugin Runtime Integrity

Status: revise
Decision: revise
Date: 2026-08-26
Revision: 5
Decision owner: qa-gate

## Quality Readiness

| dimension | result | evidence |
|---|---|---|
| Plan coverage | revise | TP Review revision 3 reports 15/18 tasks fully done. CRI-16 through CRI-18 remain partial because direct native-Windows CRI-H05 evidence is absent and QA therefore cannot close. |
| Solution integrity | pass | Brownfield Analysis and Clean Implementation Review revision 3 pass. One installer owns classification and canonical rebuild through the existing atomic transaction; no historical plugin content enters the target stage. |
| Code quality | pass | Code Review revision 4 has no open code finding. Focused tests, exact public 0.13.6 bootstrap, release preparation, Runtime Integrity, package checks and the full smoke suite pass. |
| QA decision | revise | `qa-gate` is the sole decision owner. The implementation gaps are resolved, but the open normalized evidence gap CRI-TPR-02 prevents pass. |

## QA Gate

- decision: revise
- evidence: eligible AGDF-owned pre-provenance roots are now separately classified and rebuilt only from canonical target content. Current-profile marker absence, malformed markers, digest tamper, incomplete runtime and unowned state block. Direct transaction rollback and simulated host-command failure restore the exact historical root. Injected platform paths use `path.win32` or `path.posix`. The release workflow verifies the `latest` dist-tag once, and the clean public bootstrap then executes exact `@agdf/cli@0.13.6`; this passed against npm. All declared macOS repository, package and generated-runtime checks pass.
- missing_evidence: direct native-Windows CRI-H05 execution of the complete local-marketplace suite and an owned pre-provenance rebuild, host-failure rollback and commit probe without manual filesystem intervention.
- risks: target-platform fixtures do not prove native-Windows filesystem locks, rename behavior or command execution. Human UAT and the separate Claude loaded-host obligation remain later gates and are not inferred here.
- required_next_step: run CRI-H05 on a native-Windows host and attach the direct output to this run, then rerun TP Review and QA.
- impact_codes: none assigned by the repository quality contract.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CRI-TPR-01 | evidence_gap | evidence_obligation | resolved | Historical CRI-H01 through CRI-H04 evidence remains recorded | none |
| CRI-CR-01 through CRI-CR-05 | implementation_gap | CD+Tests | resolved | Historical revision-2 corrections and regression evidence remain valid | none |
| CRI-QA-01 | emergent_risk | SD | resolved | Approved SD revision 3 defines owned pre-provenance rebuild as replacement rather than trusted migration; implementation and rollback fixtures fulfil it | none |
| CRI-QA-02 | implementation_gap | CD+Tests | resolved | Target-platform path construction and assertions use the matching standard path implementation; the complete test file passes without skipped assertions on macOS | none |
| CRI-CR-06 | implementation_gap | CD+Tests | resolved | Historical eligibility rejects non-semantic outer versions before rebuild | none |
| CRI-CR-07 | evidence_gap | evidence_obligation | resolved | Simulated host failure drives the real filesystem transaction and restores the exact old-root digest | none |
| CRI-QA-03 | emergent_risk | CD+Tests | resolved | CI exposed a second `@latest` resolution that could return CLI 0.13.5 after readiness had observed 0.13.6. The bootstrap now pins the verified expected version; public npm bootstrap and static regression pass | none |
| CRI-TPR-02 | evidence_gap | evidence_obligation | open | No post-change native-Windows execution of the complete local-marketplace suite and rebuild transaction is available | execute CRI-H05 on native Windows and attach direct evidence |

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-CREATE-AGDF-CLI-COMPOSITION` records that missing provenance remains untrusted and that only a separately classified, fully owned historical root may be atomically set aside for a canonical rebuild.

This revise decision supersedes QA Report revision 4. QA approval, UAT, release and VCS delivery remain forbidden until CRI-TPR-02 is resolved and QA is rerun.
