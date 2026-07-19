# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: prd-ux-intent-requirements
- lifecycle: active
- revision: 20
- revision_id: EC4EDB95-007B-4C0E-92C9-C87B25F1A22E
- mode: structured_delivery
- current_gate: UAT
- decision: ready_for_approval
- owner: agent

## Objective

Move UX-intent definition into pre-implementation requirements and give all review skills one shared
gap taxonomy so missing requirements, design, plan, implementation and evidence route to their
authoritative owner instead of becoming retrospective review inventions.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The completed UX-intent slice exposed the same upstream-authority problem across Task Plan, Clean and Code Review; one shared Quality Contract can own the taxonomy. |
| What is approved? | Revision-14 UR, revision-15 PRD, revision-16 SD, revision-17 TP and revision-19 QA are approved; all implementation and reviews pass. |
| What is missing? | Exact `Approval: UAT`. |
| What is the next allowed action? | Review the refreshed UAT evidence and accept or request revision. |
| What is explicitly forbidden right now? | Release and automatic VCS work before UAT acceptance. |

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | UAT |
| Allowed now | Review the refreshed UAT evidence and decide acceptance |
| Blocked by | exact UAT approval |
| Missing approval | `Approval: UAT` |
| Next gate after completion | OR + delivery closeout |
| Allowed after completion | Produce final Orchestration Report and offer an explicit delivery action |
| Next step | Approve with exact `Approval: UAT` or request revision |
| Quality outlook | A shared gap contract can prevent every review skill from inventing missing upstream obligations independently |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-19 after same-run, same-gate and revision-14 revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-19 after same-run, same-gate and revision-15 revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-19 after same-run, same-gate and revision-16 revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-19 after same-run, same-gate and revision-17 revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-07-19 after canonical presentation and same-run/gate/revision-19 revalidation. |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/prd-ux-intent-requirements/UR.md | approved | Revision 14 approved exactly on 2026-07-19. |
| Brownfield Review | .agdf/control/artefacts/prd-ux-intent-requirements/BROWNFIELD_REVIEW.md | done | Revision 15 passes; extend the shared Quality Contract and existing review/QA consumers. |
| PRD | .agdf/control/artefacts/prd-ux-intent-requirements/PRD.md | approved | Revision 15 approved exactly on 2026-07-19. |
| SD | .agdf/control/artefacts/prd-ux-intent-requirements/SD.md | approved | Revision 16 approved exactly on 2026-07-19. |
| TP | .agdf/control/artefacts/prd-ux-intent-requirements/TP.md | approved | Revision 17 approved exactly on 2026-07-19. |
| Brownfield Analysis | .agdf/control/artefacts/prd-ux-intent-requirements/BROWNFIELD_ANALYSIS.md | done | Revision 18 passes for UXI-T13..19; one contract owner and existing consumers. |
| CD+Tests | .agdf/control/artefacts/prd-ux-intent-requirements/CD_TESTS.md | done | UXI-T13..19 implementation and approved tests pass. |
| TP Review | .agdf/control/artefacts/prd-ux-intent-requirements/TASK_PLAN_REVIEW.md | done | Revision 18 passes; 7/7 affected and 19/19 total tasks fully done. |
| Clean Review | .agdf/control/artefacts/prd-ux-intent-requirements/CLEAN_IMPLEMENTATION_REVIEW.md | done | Revision 18 passes with one taxonomy owner and no fallback/parallel structure. |
| CR | .agdf/control/artefacts/prd-ux-intent-requirements/CODE_REVIEW.md | done | Revision 18 passes with no findings. |
| QA | .agdf/control/artefacts/prd-ux-intent-requirements/QA_REPORT.md | pass | Revision 18 QA pass received exact revision-19 approval. |
| UAT Evidence | .agdf/control/artefacts/prd-ux-intent-requirements/UAT_EVIDENCE.md | ready | Refreshed for UX intent, Pages and normalized review-gap acceptance. |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Normative Quality Contract semantics, three review consumers, QA, tests and generated multi-surface skill content change; existing owners are reusable but a formal artefact chain is required.
- evidence: `.agdf/control/artefacts/prd-ux-intent-requirements/BROWNFIELD_REVIEW.md` revision 15

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User intent | drafted_as | UR revision 1 | User critique and recommendation in chat on 2026-07-19 |
| UR revision 2 | supersedes | UR revision 1 | Integrates UX Intent Fidelity into Task Plan Review with PRD-to-TP-to-surface traceability |
| UR revision 3 | supersedes | UR revision 2 | Adds conditional pre-PRD skill routing, explicit analytical decisions and state-owner separation |
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-07-19 after same-run/gate/revision-3 revalidation |
| Brownfield Review | sizes | UR revision 3 | Pass; existing owners support extension but cross-surface lifecycle impact requires `structured_delivery` |
| PRD | derived_from | UR | Ready PRD carries the approved UX definition and fidelity scope into 25 observable acceptance criteria |
| PRD | constrained_by | Brownfield Review | Reuses canonical inventory, routing, sync, integrity, review and QA owners |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-07-19 after same-run/gate/revision-5 revalidation |
| SD | derived_from | PRD | Ready SD assigns one routing, analysis, PRD, fidelity, QA, propagation and evidence owner |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-07-19 after same-run/gate/revision-6 revalidation |
| TP | derived_from | SD | Ready TP maps all 25 approved criteria to tasks, tests, visible evidence and Brownfield reuse checks |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-07-19 after same-run/gate/revision-7 revalidation |
| Brownfield Analysis | validates | TP | Pass; existing routing, template, review, QA, sync, evaluation, integrity and Pages owners support the clean extension path |
| CD+Tests | implements | TP | 12/12 tasks fully done; Runtime Integrity, 30/30 evals, routing, package, Pages, idempotence and smoke evidence pass |
| QA_REPORT | tests | TP | Ready pass QA Report consumes 25/25 fulfilled UX Intent Fidelity rows and all mandatory reviews |
| QA_REPORT | approved_by | `Approval: QA` | Renewed exact approval accepted on 2026-07-19 after same-run/gate/revision-12 revalidation |
| UAT Evidence | evidenced_by | QA_REPORT | Ready acceptance summary preserves the repository-versus-live-host evidence boundary |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Sparse UX requirement prompt | `plugin/control/templates/artefacts/PRD.md` | Current PRD requirement depth | direct |
| Existing UI/state/recovery review checks | `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/skills/task-plan-review/SKILL.md` | Current downstream ownership | direct |
| Existing Task Plan Review contract | `plugin/skills/task-plan-review/SKILL.md` | Task, acceptance-criteria and visible-evidence coverage | direct |
| Proposed skill contract | User-provided `ux-intent-definition` draft and accepted refinements | Conditional analysis, outputs, authority and fail-closed behavior | direct |
| Canonical propagation and evaluation owners | `plugin/meta/agdf-plugin.definition.json`; `create-agdf/scripts/sync-package-assets.js`; `evals/`; `plugin/scripts/check-runtime-integrity.mjs` | Multi-surface scope and deterministic evidence | direct |

## Missing Evidence

- Exact UAT approval.

## Risks

- Requirement prompts could become disproportionate for low-impact work.
- Task Plan Review must gain PRD-to-TP traceability without becoming a second requirements owner.
- Greenfield and Brownfield routing could diverge unless they share one impact-classification contract.
- Canonical skill-count and generated-surface drift could break installation or Pages evidence.

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: CG-UX-INTENT-BEFORE-PRD
- context_graph_reconciliation: resolved
- context_graph_required_action: create
- context_graph_gate_effect: none
- context_graph_evidence: CG-UX-INTENT-BEFORE-PRD records the reusable pre-PRD definition, PRD authority, fidelity-review and QA-consumption invariant.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The UX definition, PRD authority and fidelity chain is a reusable cross-run governance invariant.
- memory_refs: CG-UX-INTENT-BEFORE-PRD

## Closeout

- next_allowed_action: Review the refreshed UAT evidence and provide exact `Approval: UAT` or request revision.
- quality_outlook: Normalize review gaps once, keep upstream artefacts authoritative and preserve reviews as evidence rather than retrospective specification owners.
