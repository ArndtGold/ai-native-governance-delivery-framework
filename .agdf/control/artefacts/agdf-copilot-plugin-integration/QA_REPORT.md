# QA Report: Copilot-Specific AGDF Payload

Status: pending_approval
Decision: pass
Revision: 3
Date: 2026-08-30
Gate approval: not yet granted for revision 3

## Quality Readiness

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | pass | Task Plan Review revision 3 records 13/13 tasks fully done. |
| Solution integrity | pass | Clean Implementation Review revision 3 confirms one canonical source, one generated Copilot projection and bounded legacy recovery. |
| Code quality | pass | Code Review revision 3 has no open findings after real-host defects were corrected and retested. |
| QA decision | pass | `qa-gate` finds the approved TP fulfilled with strong deterministic, installed-root and bounded host evidence. |

## QA Gate

- decision: pass
- evidence: Approved TP revision 3; Brownfield Analysis pass; 13/13 TP tasks; Clean and Code Review pass; deterministic inventory digest; exact baseline of 78 files and 539607 bytes; full smoke; package inventory; Runtime Integrity; 66/66 skill evals; Pages checks; GitHub-conformant local Marketplace; installed `agdf@agdf` 0.14.1; installed-root provenance matched; unchanged shared-root digest; `git diff --check`.
- missing_evidence: Fresh restarted Copilot app behavior and native Linux/Windows lifecycle remain unverified. These are explicit UAT/support boundaries and no loaded-session or platform-parity claim is made.
- risks: Copilot CLI and app plugin contracts may drift. The adapter fails closed on foreign Marketplace state, invalid inventory, provenance mismatch and unsupported output.
- required_next_step: obtain exact `Approval: QA` for revision 3, then request bounded UAT with a fresh Copilot session where available.
- impact_codes: none

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node now records the isolated Copilot payload, semantic inventory, dedicated Marketplace root, real 0.14.1 installation and separate installed-root versus loaded-session evidence.

## Approval Boundary

The technical QA decision is `pass`, but revision 3 is not QA-approved until the exact user value
`Approval: QA` is accepted after same-run, same-gate and revision revalidation. QA does not grant
UAT, publication, release or automatic VCS authority.
