<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->
<!-- canonical_source: .agdf/control/runs/agdf-run-scoped-control-state/RUN_STATE.md -->
<!-- run_id: agdf-run-scoped-control-state -->
<!-- revision_id: 3badaf88-4e64-4ff7-85b2-542a33f36ecb -->
<!-- sha256: daaac27e378664a8d47fa0d14d09a085cad140f5a0986e54ebaf11b7ede22fd2 -->
# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-run-scoped-control-state
- lifecycle: active
- revision: 4
- revision_id: 3badaf88-4e64-4ff7-85b2-542a33f36ecb
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Replace the single mutable `AGDF_RUN.md` authority with run-scoped control state so independent users,
machines and agent sessions can work concurrently without cross-run control-state conflicts.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Canonical mutable state is isolated at this run-scoped `RUN_STATE.md`; legacy `AGDF_RUN.md` is an explicit non-authoritative projection. |
| What is approved? | UR, PRD, SD and TP approvals were provided on 2026-07-11; `Approval: QA` was provided on 2026-07-12 after a passing QA decision. |
| What is missing? | User Acceptance Testing and exact `Approval: UAT`. |
| What is the next allowed action? | Conduct UAT against the approved behavior and request `Approval: UAT` only after acceptance. |
| What is explicitly forbidden right now? | OR, release, commit, push and PR before UAT approval and applicable explicit delivery authorization. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/MASTER_BACKLOG.md`; `.agdf/control/artefacts/agdf-run-scoped-control-state/UR.md`
- competing_scope_lines: none; the unapproved `agdf-scaffold-gitattributes-default` draft is superseded by this scope
- branch_workspace_evidence: User explicitly selected the sustainable solution; durable UR and backlog now reflect that direction.
- branch_workspace_scope_effect: supports

## Run Status Card

| Run status | Value |
|---|---|
| Status | QA approved; UAT open |
| Current gate | UAT |
| Allowed now | Conduct User Acceptance Testing |
| Blocked by | none |
| Missing approval | `Approval: UAT` |
| Next step | Validate the delivered behavior from the user perspective, then approve or request revision |
| Quality outlook | Prevent parallel sources of truth by making migration and legacy precedence mechanically enforceable |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-11 |
| PRD | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-11 |
| SD | approved | `Approval: SD` provided on 2026-07-11 |
| TP | approved | `Approval: TP` provided on 2026-07-11 |
| QA | approved | `Approval: QA` provided on 2026-07-12 after persisted QA pass |
| UAT | missing | Blocked by earlier gates |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-run-scoped-control-state/UR.md | approved | `Approval: UR` provided on 2026-07-11 |
| Brownfield Review | .agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md | done | Passed; selected `structured_delivery` and existing owners mapped |
| PRD | .agdf/control/artefacts/agdf-run-scoped-control-state/PRD.md | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-11 |
| SD | .agdf/control/artefacts/agdf-run-scoped-control-state/SD.md | approved | `Approval: SD` provided on 2026-07-11 |
| TP | .agdf/control/artefacts/agdf-run-scoped-control-state/TP.md | approved | `Approval: TP` provided on 2026-07-11; twenty traceable tasks |
| Brownfield Analysis | .agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_ANALYSIS.md | done | Passed; clean reuse path and worktree/index boundary confirmed |
| TP Review | .agdf/control/artefacts/agdf-run-scoped-control-state/TP_REVIEW.md | done | Pass; all 20 tasks fully done with high-confidence evidence |
| Clean Review | .agdf/control/artefacts/agdf-run-scoped-control-state/CLEAN_IMPLEMENTATION_REVIEW.md | done | Pass; one primary state core with justified legacy compatibility |
| Review | .agdf/control/artefacts/agdf-run-scoped-control-state/CODE_REVIEW.md | done | Pass; no unresolved correctness, regression, security or maintainability finding |
| QA | .agdf/control/artefacts/agdf-run-scoped-control-state/QA_REPORT.md | pass | QA gate passed and `Approval: QA` was provided on 2026-07-12 |
| OR |  | missing | Not yet allowed |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Durable state ownership, migration, CLI/CI selection, Delivery Path Search, package scaffolding and cross-surface behavior are affected.
- evidence: `.agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md`
- transparency_note: A focused PRD is required; implementation remains forbidden.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User direction | supersedes | `agdf-scaffold-gitattributes-default` | User selected the sustainable run-scoped solution on 2026-07-11 |
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-11 |
| Brownfield Review | sizes | UR | Passed and selected `structured_delivery`; focused PRD required |
| PRD | derived_from | UR | Draft derived from approved UR and Brownfield Review |
| PRD | approved_by | `Approval: PRD` | Valid post-artefact approval provided on 2026-07-11 |
| SD | derived_from | PRD | Draft implements approved PRD behavior through one shared state core |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-11 |
| TP | derived_from | SD | Draft maps approved SD and PRD AC 1-22 to twenty tasks and evidence |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-11 |
| Brownfield Analysis | verifies | TP | Passed; CD+Tests may begin with RSC-01 |
| TP Review | verifies | TP | Passed 20/20 on final implementation and evidence |
| Clean Review | verifies | implementation | Passed; no workaround or parallel-owner finding remains |
| Code Review | verifies | implementation | Passed; no actionable finding remains |
| QA Report | verifies | TP and implementation | QA decision passed with complete evidence |
| QA_REPORT | tests | TP | QA Report section 2 records 20/20 TP coverage; section 3 records the complete validation suite |
| QA Report | approved_by | `Approval: QA` | Exact approval provided on 2026-07-12 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Legacy union mitigation was superseded | `.gitignore`; `plugin/control/README.md`; canonical run state implementation | Structural solution selection | direct |
| Runtime, CLI and Delivery Path Search consume selected canonical state | `plugin/meta/agdf-runtime-contract.md`; `create-agdf/bin/create-agdf.js`; state adapter | Final ownership | direct |
| Full final validation suite passes | control-state/DPS tests; both package smoke suites; Pages check/build; runtime integrity; package dry-run; `git diff --check` | RSC-01 through RSC-20 | direct |
| Fresh two-run CLI fixture evaluates both runs and rejects unselected single-run gate-check | temp-repository subprocess evidence on 2026-07-12 | Selection and CI aggregation | direct |
| QA gate decision passes | `.agdf/control/artefacts/agdf-run-scoped-control-state/QA_REPORT.md` | Formal QA decision | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: `CG-RUN-SCOPED-CONTROL-STATE` records the final isolation, selector, migration and conflict-visibility invariants with implementation and test references.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Brownfield findings are persisted in the scope artefact until approved PRD/SD establishes reusable architecture invariants.
- memory_refs: `.agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md`

## Closeout

- delivered: Approved TP implementation complete; TP Review 20/20 pass; Clean and Code reviews pass; QA decision pass and QA approval recorded; final validation and Context Graph reconciliation complete.
- not_delivered: UAT approval, OR, commit, push, PR or release.
- verification_performed: Control-state, selector, CLI, migration, projection, concurrency and Git-conflict tests; DPS suites; both package smoke suites; Pages check/build; runtime integrity; two-run aggregate probe; tarball inspection; diff check.
- unverified: UAT and downstream release behavior.
- next_allowed_action: Conduct UAT and request exact `Approval: UAT` only after user acceptance.
- quality_outlook: Run-scoped authority removes cross-run contention by construction while preserving deterministic gate legality and explicit legacy migration safety.
