# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: automatic-version-asset-sync
- lifecycle: active
- revision: 11
- revision_id: DF754A76-D5BF-4231-B8DC-8A6ECB1BEA9C
- mode: structured_delivery
- current_gate: UAT
- decision: ready
- owner: agent

## Objective

Keep the Git source plugin free of generated runtime bytes and make the release build produce and
install the complete exact-version plugin for Codex and Claude.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The publish action can generate runtime inside the package workspace, but current Codex/Claude adapters register the GitHub repository and load `./plugin/` directly. Removing source `plugin/runtime` therefore also requires built-plugin staging and installer migration. |
| What is approved? | Exact UR, PRD, SD, TP and QA approvals; Brownfield Review selected structured delivery. |
| What is missing? | Exact `Approval: UAT`. |
| What is the next allowed action? | Review the UAT evidence and decide whether repository conformance with the disclosed live-evidence limits is acceptable. |
| What is explicitly forbidden right now? | Live host mutation, publication, release and VCS delivery actions. |

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UAT |
| Allowed now | Review the UAT evidence; approve, request revision or decline |
| Blocked by | Missing exact UAT approval |
| Missing approval | `Approval: UAT` |
| Next step | User reviews the disclosed evidence boundary and decides the UAT gate |
| Quality outlook | Do not convert repository proof into claims of authenticated host, native Windows or live publish execution |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-18 after revision-2 revalidation |
| PRD | approved | `Approval: PRD` provided on 2026-07-18 after revision-3 revalidation |
| SD | approved | `Approval: SD` provided on 2026-07-18 after revision-4 revalidation |
| TP | approved | `Approval: TP` provided on 2026-07-18 after revision-5 revalidation |
| QA | approved | `Approval: QA` provided on 2026-07-18 after revision-10 revalidation |
| UAT | missing | UAT evidence is ready; exact approval not yet provided |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/automatic-version-asset-sync/UR.md | approved | Exact approval recorded |
| Brownfield Review | .agdf/control/artefacts/automatic-version-asset-sync/BROWNFIELD_REVIEW.md | done | Structured delivery selected after host/install inspection |
| Verified Change |  | missing | Routing not yet decided |
| PRD | .agdf/control/artefacts/automatic-version-asset-sync/PRD.md | approved | Exact approval recorded |
| SD | .agdf/control/artefacts/automatic-version-asset-sync/SD.md | approved | Exact approval recorded |
| TP | .agdf/control/artefacts/automatic-version-asset-sync/TP.md | approved | Exact approval recorded |
| Brownfield Analysis | .agdf/control/artefacts/automatic-version-asset-sync/BROWNFIELD_ANALYSIS.md | done | Pass; existing owners, overlap and minimal clean path confirmed |
| CD+Tests | .agdf/control/artefacts/automatic-version-asset-sync/CD_TESTS.md | done | RBP-01 through RBP-13 and RBP-T01 through RBP-T13 pass |
| TP Review | .agdf/control/artefacts/automatic-version-asset-sync/TASK_PLAN_REVIEW.md | done | Pass; 13/13 tasks fully done |
| Clean Implementation Review | .agdf/control/artefacts/automatic-version-asset-sync/CLEAN_IMPLEMENTATION_REVIEW.md | pass | One build owner and one staging owner; bounded compatibility paths only |
| CR | .agdf/control/artefacts/automatic-version-asset-sync/CODE_REVIEW.md | done | Pass after review-found recovery and integrity gaps were fixed and retested |
| QA | .agdf/control/artefacts/automatic-version-asset-sync/QA_REPORT.md | pass | qa-gate pass and exact approval recorded |
| UAT | .agdf/control/artefacts/automatic-version-asset-sync/UAT_EVIDENCE.md | ready | Repository conformance and explicit live-evidence limits are ready for decision |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: UAT
- scope_reason: Source/build separation is bounded, but global Codex/Claude marketplace migration, durable staging, rollback and release packaging require full design and planning.
- evidence: `.agdf/control/artefacts/automatic-version-asset-sync/BROWNFIELD_REVIEW.md`

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| User request | motivates | UR | approved | Automatic synchronization requested on 2026-07-18 |
| UR | approved_by | `Approval: UR` | approved | Exact approval after revision-2 revalidation |
| Brownfield Review | sizes | UR | done | Existing package, host and migration owners inspected |
| PRD | derived_from | UR | approved | Source/build/install requirements and migration acceptance criteria |
| PRD | approved_by | `Approval: PRD` | approved | Exact approval after revision-3 revalidation |
| SD | derived_from | PRD | approved | Source-only plugin, package build, durable staging, migration and rollback design |
| SD | approved_by | `Approval: SD` | approved | Exact approval after revision-4 revalidation |
| TP | derived_from | SD | approved | Thirteen bounded tasks and tests cover build, integrity, staging, migration, publication and evidence |
| TP | approved_by | `Approval: TP` | approved | Exact approval after revision-5 revalidation |
| Brownfield Analysis | verifies | TP | pass | Existing owners, overlap, compatibility and regression seams confirmed |
| QA_REPORT | tests | TP | pass | 13/13 task coverage, Brownfield fit, clean review, code review and aggregate evidence pass |
| QA_REPORT | approved_by | `Approval: QA` | approved | Exact approval after revision-10 revalidation |
| UAT_EVIDENCE | accepts | QA_REPORT | ready | Repository conformance and explicit live-evidence limits prepared for user decision |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Source plugin is runtime-free while two complete package builds are byte-identical | package-build test; source/installed Runtime Integrity | Source/build ownership and reproducibility | direct |
| Durable staging, five-state classification and rollback pass without real host mutation | `local-marketplace.js`; local-marketplace and CLI smoke tests | Ownership-safe Codex/Claude distribution | direct |
| Dry-run tarball contains one complete runtime-bearing plugin | package-contents test | Release artifact completeness | direct |
| Publish validate and publish jobs build and verify before npm publication | workflow order assertions | Automatic release synchronization | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Authenticated Codex/Claude installation, migration and restart observation | UAT only | Run explicit live UAT after QA approval and user authorization |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: `CG-CREATE-AGDF-CLI-COMPOSITION` now records runtime-free source, release-built plugin composition, durable marketplace staging, fail-closed migration and UAT evidence limits.

## Closeout

- delivered: approved UR/PRD/SD/TP/QA, Brownfield Review/Analysis, CD+Tests, mandatory reviews and UAT evidence.
- not_delivered: exact UAT approval, authenticated live host migration/restart, native Windows interruption, live publication, release and VCS actions.
- next_allowed_action: Request exact `Approval: UAT` for the prepared evidence boundary.
- quality_outlook: Keep authenticated host, native Windows and live publication claims explicitly unproven unless separately observed.
