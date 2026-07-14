# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: surface-native-interactions
- lifecycle: completed
- revision: 11
- revision_id: 88B5DE46-B884-4F0B-AC00-BDD295794F73
- mode: structured_slice
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Add a portable AGDF interaction layer that uses native Codex, Claude Code and OpenCode controls while preserving exact approvals, durable repository-owned gate state and fail-closed behavior.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UR, PRD, SD, TP, QA and UAT are approved; Brownfield Analysis, CD+Tests and all mandatory reviews are done. QA decision is pass with strong deterministic AC-01 through AC-18 evidence; SNI-14 remains partial only for supporting interactive UI observations. |
| What is approved? | UR, PRD, SD, TP, valid post-report QA approval and `Approval: UAT`, all on 2026-07-14. |
| What is missing? | Delivery Orchestration Report; explicit delivery authorization if desired. |
| What is the next allowed action? | Produce the Orchestration Report and offer delivery closeout. |
| What is explicitly forbidden right now? | Release and VCS delivery actions; any parallel interaction policy, custom approval persistence or automatic overwrite of user-owned configuration. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/MASTER_BACKLOG.md`; `.agdf/control/artefacts/surface-native-interactions/UR.md`
- competing_scope_lines: `agdf-self-maintenance-overhead-reduction` remains lifecycle-active but is OR-complete and awaiting delivery closeout; it does not overlap this product scope
- branch_workspace_evidence: current user conversation and durable UR draft
- branch_workspace_scope_effect: supports

## Run Status Card

| Run status | Value |
|---|---|
| Status | OR ready |
| Current gate | OR |
| Allowed now | Produce the Orchestration Report and offer delivery closeout |
| Blocked by | none |
| Missing approval | none |
| Next step | Produce the Orchestration Report; commit, push, PR and release require separate explicit instruction |
| Quality outlook | Preserve one canonical interaction contract and prove each surface mapping without coupling AGDF to host-owned UI internals |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-14 |
| PRD | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-14 |
| SD | approved | Valid post-artefact `Approval: SD` provided on 2026-07-14 |
| TP | approved | Valid post-artefact `Approval: TP` provided on 2026-07-14 |
| QA | approved | Valid post-report `Approval: QA` provided on 2026-07-14 |
| UAT | approved | `Approval: UAT` provided on 2026-07-14 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/surface-native-interactions/UR.md | approved | Exact `Approval: UR` provided on 2026-07-14 |
| Brownfield Review | .agdf/control/artefacts/surface-native-interactions/BROWNFIELD_REVIEW.md | done | Passed; selected `structured_slice` with `extend` strategy |
| Verified Change |  | missing | Mode not decided |
| PRD | .agdf/control/artefacts/surface-native-interactions/PRD.md | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-14 |
| SD | .agdf/control/artefacts/surface-native-interactions/SD.md | approved | Valid post-artefact `Approval: SD` provided on 2026-07-14 |
| TP | .agdf/control/artefacts/surface-native-interactions/TP.md | approved | Valid post-artefact `Approval: TP` provided on 2026-07-14 |
| Brownfield Analysis | .agdf/control/artefacts/surface-native-interactions/BROWNFIELD_ANALYSIS.md | done | Passed; existing owners, OpenCode merge/protection split and regression path verified |
| CD+Tests | .agdf/control/artefacts/surface-native-interactions/CD_TESTS.md | done | SNI-01 through SNI-14 delivered; SNI-15 review inputs prepared; focused and aggregate tests pass |
| CR | .agdf/control/artefacts/surface-native-interactions/CODE_REVIEW.md | done | TP Review pass_with_disclosure; Clean Review pass; Code Review pass with no findings |
| QA | .agdf/control/artefacts/surface-native-interactions/QA_REPORT.md | passed | QA gate decision pass and exact QA approval recorded |
| UAT | .agdf/control/artefacts/surface-native-interactions/UAT_REPORT.md | approved | Exact `Approval: UAT` provided on 2026-07-14; SNI-14 live UI limitation accepted as disclosed supporting evidence gap |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Cross-surface approval semantics are user-visible and security-relevant, but existing Runtime Contract, gate-check, selected-run validation and generation owners provide a bounded extension path without custom UI or a parallel approval system.
- evidence: `.agdf/control/artefacts/surface-native-interactions/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User intent | motivates | UR draft | Current conversation on 2026-07-14 |
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-14 |
| Brownfield Review | sizes | UR | Passed; selected `structured_slice` and existing owners mapped |
| PRD | derived_from | UR | Focused product behavior and AC-01 through AC-18 derive from the approved UR |
| PRD | informed_by | Brownfield Review | Trigger, ownership and reuse boundaries reflect the passed review |
| Pre-artefact approval text | does_not_approve | PRD | `Approval: PRD` preceded durable PRD creation and must be renewed |
| PRD | approved_by | `Approval: PRD` | Valid renewed approval provided after PRD persistence on 2026-07-14 |
| SD | derived_from | PRD | Two-layer contract and surface adapter design persisted on 2026-07-14 |
| SD | approved_by | `Approval: SD` | Valid post-artefact approval provided on 2026-07-14 |
| TP | derived_from | SD | Fifteen implementation and evidence tasks persisted on 2026-07-14 |
| TP | approved_by | `Approval: TP` | Valid post-artefact approval provided on 2026-07-14 |
| Brownfield Analysis | validates | TP | Passed pre-implementation analysis with `extend` strategy and no blocking overlap |
| CD+Tests | implements | TP | Canonical/runtime, generated-surface, OpenCode config, docs and Context Graph work completed with passing tests |
| TP Review | verifies | TP | Fourteen tasks fully done; SNI-14 partial for supporting UI evidence only |
| Clean Implementation Review | validates | CD+Tests | Pass; one canonical extension path and justified permanent text fallback |
| CR | reviews | CD+Tests | Pass; no correctness, security, compatibility or maintainability findings |
| QA_REPORT | tests | TP | Pass decision based on deterministic AC-01 through AC-18 evidence and disclosed supporting UI limitation |
| QA_REPORT | approved_by | `Approval: QA` | Valid post-report approval provided on 2026-07-14 |
| UAT_REPORT | approved_by | `Approval: UAT` | Exact approval provided on 2026-07-14 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| User chose to proceed after reviewing the concept and cross-surface impact | current Codex task conversation | Product intent | direct |
| Existing AGDF runtime requires exact approval plus durable artefact | `plugin/meta/agdf-runtime-contract.md` | Gate boundary | direct |
| Existing repository already owns Codex, Claude Code and OpenCode generated surfaces | `plugin/meta/agdf-plugin.definition.json`; `create-agdf/scripts/sync-package-assets.js` | Brownfield starting point | direct |
| Deterministic implementation and test evidence | `.agdf/control/artefacts/surface-native-interactions/CD_TESTS.md` | SNI-01 through SNI-14 and AC-01 through AC-18 | direct |
| Mandatory review evidence | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | TP coverage, solution integrity and actual diff | direct |
| QA gate decision passes | `.agdf/control/artefacts/surface-native-interactions/QA_REPORT.md` | Formal QA decision | direct |

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The reusable native-interaction authority invariant is persisted with passing deterministic implementation evidence.

## Closeout

- delivered: Canonical cross-surface interaction contract, adapter mappings, fail-closed gate rules, generated propagation, OpenCode permission preservation, deterministic tests and Context Graph authority invariant.
- not_delivered: Authenticated live native-UI probes, custom host UI, commit, push, PR or release.
- verification_performed: TP Review, Clean Implementation Review, Code Review, QA, UAT, selected-run gate-check and doctor with zero findings.
- next_allowed_action: Offer delivery closeout; VCS and release actions require separate explicit instruction.
- quality_outlook: Contract and deterministic evidence are complete; authenticated live UI observation remains optional supporting follow-up.
