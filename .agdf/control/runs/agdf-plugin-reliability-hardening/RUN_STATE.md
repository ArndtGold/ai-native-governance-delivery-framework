# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-plugin-reliability-hardening
- lifecycle: completed
- revision: 11
- revision_id: 0ad1f500-6fb8-474e-8023-1a376240b7c1
- mode: structured_slice
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make runtime-integrity verification work from both the AGDF source repository and the installed
plugin layout, with permanent regression coverage for the published artifact boundary.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The source-tree integrity check passes, while direct execution from the installed 0.9.0 Codex cache fails with `ENOENT` because root resolution assumes a nested `plugin/` directory. |
| What is approved? | UR, PRD, SD, TP, QA and UAT via exact approvals on 2026-07-16. |
| What is missing? | No delivery evidence is missing for the accepted repository slice. |
| What is the next allowed action? | Offer the commit-ready handoff and wait for explicit delivery instruction. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, publication, release, reinstall or cache mutation. |

## Source And Scope State

- normative_instruction_source: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/UR.md`; AGDF Runtime Contract
- multi_scope_state: clear
- active_scope_evidence: Installed-cache failure reproduced on 0.9.0; source integrity, package smoke tests and installed/source bundle comparison pass.
- competing_scope_lines: Existing active runs own installer parity, native approval UX and state orientation; none owns installed-layout runtime-integrity verification.
- branch_workspace_evidence: The branch was clean before this run; current changes are limited to this run's UR, run state and backlog pointer.
- branch_workspace_scope_effect: Later implementation must remain limited to integrity-root resolution and focused regression/release wiring unless a new approved scope expands it.

## Run Status Card

| Run status | Value |
|---|---|
| Status | pass |
| Current gate | OR |
| Allowed now | Offer commit-ready delivery handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Wait for explicit commit, push, PR, release or reinstall instruction |
| Quality outlook | No further technical follow-up for this slice; release/reinstall remains a separate delivery action |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided in session on 2026-07-16 after same-run/same-gate revalidation. |
| PRD | approved | Exact `Approval: PRD` provided in session on 2026-07-16 after same-run/same-gate revalidation. |
| SD | approved | Exact `Approval: SD` provided in session on 2026-07-16 after same-run/same-gate revalidation. |
| TP | approved | Exact `Approval: TP` provided in session on 2026-07-16 after same-run/same-gate revalidation. |
| QA | approved | Exact `Approval: QA` provided in session on 2026-07-16 after same-run/same-gate revalidation. |
| UAT | approved | Exact `Approval: UAT` provided in session on 2026-07-16 after same-run/same-gate revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/UR.md` | approved | Exact approval recorded after artefact persistence and revalidation |
| Brownfield Review | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md` | done | Structured Slice selected because the fix changes release-validation behavior across source and installed ownership modes |
| PRD | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/PRD.md` | approved | Exact approval recorded after artefact persistence and revalidation |
| SD | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/SD.md` | approved | Exact approval recorded after artefact persistence and revalidation |
| TP | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/TP.md` | approved | Exact approval recorded after artefact persistence and revalidation |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_ANALYSIS.md` | done | Existing owners, reuse path, regression boundary and minimal clean implementation passed |
| CD+Tests | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/CD_TESTS.md` | done | AIRH-01 through AIRH-07 implemented; focused and aggregate validation pass |
| TP Review | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/TP_REVIEW.md` | done | 7/7 tasks fully done |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/CLEAN_IMPLEMENTATION_REVIEW.md` | pass | Root cause fixed through one canonical validator; no fallback or parallel structure |
| CR | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/CODE_REVIEW.md` | done | No correctness, security, compatibility or maintainability finding remains |
| QA | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/QA_REPORT.md` | pass | qa-gate pass and exact QA approval recorded |
| UAT | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/UAT_REPORT.md` | approved | Exact acceptance recorded with explicit non-deployment boundary |
| OR | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/OR.md` | pass | Final OR records delivered scope, exclusions, evidence and commit-ready handoff |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: The change is bounded but release-critical; it separates plugin-owned from repository-only integrity checks and therefore needs a compact approved contract before implementation.
- evidence: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`; `plugin/scripts/check-runtime-integrity.mjs`; existing source and installed-cache reproduction.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Installed checker exits with `ENOENT` for `<cache-parent>/plugin/skills` | Direct execution from `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.9.0/scripts/check-runtime-integrity.mjs` on 2026-07-16 | Installed-layout defect | direct |
| Source checker reports `ok (9 skills and 15 control files checked)` | `node plugin/scripts/check-runtime-integrity.mjs` on 2026-07-16 | Existing source validation | direct |
| Installed plugin tree matches source `plugin/` | `diff -qr plugin /Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.9.0` | Published artifact parity | direct |
| Package smoke, CLI smoke and Pages check pass | Local validation on 2026-07-16 | Regression baseline | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-16 after artefact persistence and same-run/same-gate revalidation |
| PRD | derived_from | UR | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/PRD.md` derives from the approved UR and passed Brownfield Review |
| SD | derived_from | PRD | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/SD.md` derives from the approved PRD and preserves one canonical integrity owner |
| TP | derived_from | SD | `.agdf/control/artefacts/agdf-plugin-reliability-hardening/TP.md` maps AIRH-01 through AIRH-07 to the approved design and PRD requirements |
| QA_REPORT | tests | TP | Passing QA report covers 7/7 TP tasks, mandatory reviews and the complete validation bundle; exact QA approval recorded |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-AGDF-RUN-SCOPED-CONTROL-STATE`; `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`
- context_graph_required_action: link
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- context_graph_evidence: Existing invariant linkage is recorded in this run and the Brownfield artefact; QA found no need for a new graph node.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Preserve the source-only/plugin-owned ownership split in this run until implementation and QA establish whether it belongs in the shared Context Graph.
- memory_refs: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`

## Closeout

- next_allowed_action: Offer the commit-ready delivery handoff and wait for explicit instruction.
- quality_outlook: No further technical follow-up for this slice; release/reinstall remains separate.
