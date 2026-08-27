# QA Report: Installation Consent for Automatic Runtime Checks

Status: `revise`; revision 2

Gate: QA

Run: `installation-consent-runtime-checks`
Date: 2026-08-27

## Quality Readiness

| Dimension | Owner | Outcome | Evidence |
|---|---|---|---|
| Plan coverage | task-plan-review | revise | 15/16 fully done; IRC-12 remains partial for Windows |
| Solution integrity | clean-implementation-review | pass | root defects fixed in shared owners; no parallel authority |
| Code quality | code-review | pass | CR-01 and CR-02 resolved; complete regression green |
| QA decision | qa-gate, sole decision owner | revise | TPR-01 remains open |

Decisive reason: macOS now proves Claude and OpenCode behavior, but QA cannot infer Codex enabled
state, native Windows cells or the rendered public listing.

Permissible next action: the user completes exact Codex native trust, then the remaining Windows and
public-candidate evidence runs on their actual hosts.

## QA Gate

- decision: `revise`
- evidence: approved TP; Brownfield pass; CD+Tests; all reviews; full smoke; Runtime Integrity;
  66/66 skill cases; 313-file package; direct Claude hook, OpenCode enabled/manual sessions and Codex review
- missing_evidence: Codex trust plus enabled/change/disable cycle; IRC-H04 through H06; IRC-H07;
  deliberately induced managed conflict/rollback
- risks: Windows PowerShell, ACL and locked-file behavior cannot be inferred; rendered wording can drift;
  Codex native trust belongs to the user
- required_next_step: complete TPR-01 and rerun QA; do not request `Approval: QA` yet
- impact_codes: none registered

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | `HOST_EVIDENCE_MACOS.md` proves only its stated cells | Complete remaining direct-host cells without inferred parity. |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `update`
- context_graph_gate_effect: `none`
- context_graph_evidence: existing nodes retain receipt, native authority, verified-package and evidence-plane boundaries

## QA Boundary

QA Revision 2 does not authorize UAT, publication, release, commit, push or pull-request creation.
