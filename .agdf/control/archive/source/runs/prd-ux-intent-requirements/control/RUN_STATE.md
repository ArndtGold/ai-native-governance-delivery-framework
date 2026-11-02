# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: prd-ux-intent-requirements
- lifecycle: completed
- revision: 22
- revision_id: FC79E4A9-BE83-4CB1-A296-7BAFA1E0F289
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Move UX-intent definition into pre-implementation requirements and give all review skills one shared
gap taxonomy so missing requirements, design, plan, implementation and evidence route to their
authoritative owner instead of becoming retrospective review inventions.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | UX intent is defined proportionally before PRD readiness, one shared Quality Contract owns review-gap routing, and QA consumes fidelity/findings without becoming a requirements owner. |
| What is approved? | UR, PRD, SD, TP, QA and UAT are approved; OR-full records `pass`. |
| What is missing? | No governance artefact or approval; authenticated host behavior remains intentionally unclaimed. |
| What is the next allowed action? | Use delivery closeout only when a VCS handoff is explicitly requested. |
| What is explicitly forbidden right now? | Automatic commit, push, PR or release without separate explicit instruction. |

## Run Status Card

| Run status | Value |
|---|---|
| Status | pass |
| Current gate | OR |
| Allowed now | Report completed delivery state; use delivery closeout only on explicit VCS instruction |
| Blocked by | none |
| Missing approval | none |
| Next gate after completion | none |
| Allowed after completion | Offer an explicit delivery action; VCS and release remain separately authorized |
| Next step | No governance work remains; VCS and release actions require separate explicit instruction |
| Quality outlook | A shared gap contract can prevent every review skill from inventing missing upstream obligations independently |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-19 after same-run, same-gate and revision-14 revalidation. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-19 after same-run, same-gate and revision-15 revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-19 after same-run, same-gate and revision-16 revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-19 after same-run, same-gate and revision-17 revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-07-19 after canonical presentation and same-run/gate/revision-19 revalidation. |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-08-20 after selected-run, same-gate, revision-20 and durable-evidence revalidation. |

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
| UAT Evidence | .agdf/control/artefacts/prd-ux-intent-requirements/UAT_EVIDENCE.md | approved | Exact UAT acceptance recorded with the repository-versus-live-host evidence boundary retained. |
| OR | .agdf/control/artefacts/prd-ux-intent-requirements/OR.md | pass | OR-full closes the run with 19/19 tasks, passing reviews, approved QA/UAT and resolved Context Graph impact. |

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
| UAT | approved_by | `Approval: UAT` | Exact approval accepted on 2026-08-20 after selected-run, same-gate, revision-20 and durable-evidence revalidation |
| OR | verifies | full run | OR-full records delivered and intentionally deferred scope, accepted evidence boundaries and `pass` closeout |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Sparse UX requirement prompt | `plugin/control/templates/artefacts/PRD.md` | Current PRD requirement depth | direct |
| Existing UI/state/recovery review checks | `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/skills/task-plan-review/SKILL.md` | Current downstream ownership | direct |
| Existing Task Plan Review contract | `plugin/skills/task-plan-review/SKILL.md` | Task, acceptance-criteria and visible-evidence coverage | direct |
| Proposed skill contract | User-provided `ux-intent-definition` draft and accepted refinements | Conditional analysis, outputs, authority and fail-closed behavior | direct |
| Canonical propagation and evaluation owners | `plugin/meta/agdf-plugin.definition.json`; `create-agdf/scripts/sync-package-assets.js`; `evals/`; `plugin/scripts/check-runtime-integrity.mjs` | Multi-surface scope and deterministic evidence | direct |

## Missing Evidence

- No missing evidence within the accepted repository-contract scope; authenticated live-host execution remains explicitly unclaimed.

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

- next_allowed_action: No further governance step; use delivery closeout only after explicit VCS instruction.
- quality_outlook: Normalize review gaps once, keep upstream artefacts authoritative and preserve reviews as evidence rather than retrospective specification owners.
