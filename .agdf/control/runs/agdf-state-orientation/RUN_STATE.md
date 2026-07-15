# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-state-orientation
- lifecycle: active
- revision: 7
- revision_id: A7B8C9D0-E1F2-3456-789A-E78901234567
- mode: structured_slice
- current_gate: QA
- decision: pass
- owner: agent

## Objective

Make the AGDF state model visible in the compact human Run Status Card so users can
self-orient without reading the full Runtime Contract: a path-derived breadcrumb, a
post-acceptance transition micro-narration, and a clean human projection of internal
sub-states — without changing approval authority, gate logic, interaction kinds, or the
machine contract.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | All four user gates approved (UR, PRD, SD, TP). Brownfield Review: `structured_slice`. Pre-implementation Brownfield Analysis: `pass`. Implementation path verified — all target functions confirmed at expected locations, no parallel-structure conflict, regression risk low (all additive). |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD` and `Approval: TP` provided on 2026-07-15 after revalidation. |
| What is missing? | Implementation of SO-01 through SO-10; test evidence BT-01 through BT-14; verification bundle (SO-11); review chain (SO-12). |
| What is the next allowed action? | Implement SO-01 through SO-10, run tests, record CD+Tests evidence. |
| What is explicitly forbidden right now? | QA pass, UAT and release claims before CD+Tests, reviews and QA gate. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/agdf-state-orientation/UR.md`; `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md`
- competing_scope_lines: `agdf-human-decision-surface` is a related in-progress slice (UAT revise) covering the approval-time two-card envelope; it does not overlap with status-time breadcrumb, post-acceptance narration or internal-state collapse. Slice B (Gate Rationale Registry, on-demand "Why?", block-rationale guarantee) is separately tracked and not yet requested.

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | QA |
| Allowed now | Request `Approval: QA`; prepare UAT after QA pass |
| Blocked by | Missing `Approval: QA` |
| Missing approval | `Approval: QA` |
| Next gate after approval | UAT |
| Allowed after approval | Request `Approval: UAT`; prepare non-operative delivery summary |
| Next step | Request exact `Approval: QA` |
| Quality outlook | Context Graph update at OR closeout; sequencing risk with agdf-human-decision-surface monitored |

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Three additive, non-behavioural improvements to the compact human Run Status Card projection layer. Touches normative spec files (`plugin/meta/`, `plugin/skills/`), CLI presentation layer (`create-agdf/bin/`, `create-agdf/lib/`) and locale registry — all excluded from the Trivial Change Boundary, so quick_task is not eligible. No broad architecture/policy/persistence/release impact, so structured_delivery is not required. Resolved design decisions keep the slice intentionally small.
- evidence: `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md`; `plugin/meta/agdf-runtime-contract.md` (§Run Status Card, §Gate Transition Card, §derived-projection principle); `plugin/skills/gate-check/SKILL.md:69` (existing TP narration pattern); `plugin/meta/agdf-interaction-locales.json` (existing gateTitles, afterApproval); `create-agdf/bin/create-agdf.js:2336` (buildStatusCard); `create-agdf/lib/interaction-presentation.js`; `.agdf/control/CONTEXT_GRAPH.md:15` (CG-RUN-STATUS-CARD)
- transparency_note: Quick Task is not appropriate because normative UX presentation semantics and multiple generated surfaces are affected. Full structured delivery is not required before the PRD defines the exact presentation boundary and non-overlapping file sections with the in-progress human-decision-surface slice.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-15 for revision 1 after same-run, same-gate and revision revalidation. |
| Brownfield Review | sizes | `structured_slice` | Existing Runtime Contract, gate-check skill, locale registry, CLI presentation layer and Context Graph node `CG-RUN-STATUS-CARD` cover the owners; reuse path is extend; parallel-structure risk to `agdf-human-decision-surface` mitigated by sequencing. |
| PRD | derived_from | UR | Revision 1 derives from approved UR revision 1 and recorded Brownfield Review. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-07-15 for revision 1 after the PRD artefact was persisted and same-run, same-gate and revision revalidation. |
| SD | derived_from | PRD | Revision 1 derives from approved PRD revision 1. Defines breadcrumb derivation, narration output, collapse mapping, locale-key structure, implementation plan and regression-test plan. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-15 for revision 1 after the SD artefact was persisted and same-run, same-gate and revision revalidation. |
| TP | derived_from | SD | Revision 1 derives from approved SD revision 1. Defines 12 tasks (SO-01–SO-12), 14 tests (BT-01–BT-14), acceptance matrix and verification sequence. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-15 for revision 1 after same-run, same-gate and revision revalidation. |
| Brownfield Analysis | verifies | TP | Revision 1 passed: implementation path confirmed, reuse paths valid, no parallel-structure conflict, regression risk low (all additive). |
| CD+Tests | implements | TP | Done — SO-01 through SO-10 implemented; BT-01 through BT-14 pass; all verification bundles green; 3 advisory findings fixed. |
| TP Review | verifies | TP | Pass — 12/12 tasks fully_done. |
| Clean Implementation Review | verifies | CD+Tests | Pass — clean primary solution, no fallbacks/parallel structures. |
| CR | reviews | CD+Tests | Pass — 3 advisory findings fixed. |
| QA Report | tests | TP | Revision 1 pass — all evidence strong, no blocking risk. |

## Next Allowed Action

- next_allowed_action: Request exact `Approval: QA`.
- forbidden_until_then: UAT, release and automatic VCS actions before QA approval.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-15 after same-run, same-gate and revision revalidation. |
| PRD | approved | Exact `Approval: PRD` provided on 2026-07-15 after the PRD artefact was persisted and same-run, same-gate and revision revalidation. |
| SD | approved | Exact `Approval: SD` provided on 2026-07-15 after the SD artefact was persisted and same-run, same-gate and revision revalidation. |
| TP | approved | Exact `Approval: TP` provided on 2026-07-15 after same-run, same-gate and revision revalidation. |
| QA | pending | QA Report revision 1 pass; exact `Approval: QA` requested. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-state-orientation/UR.md` | approved | Exact approval recorded after revalidation. Three design questions resolved as specification. |
| Brownfield Review | `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md` | done | `pass`; `structured_slice` selected; existing owners and reuse paths confirmed; parallel-structure risk to `agdf-human-decision-surface` identified and mitigated. |
| PRD | `.agdf/control/artefacts/agdf-state-orientation/PRD.md` | approved | 11 functional requirements, 13 acceptance criteria, non-overlapping file sections defined. Exact approval recorded after artefact persistence and revalidation. |
| SD | `.agdf/control/artefacts/agdf-state-orientation/SD.md` | approved | Breadcrumb derivation algorithm, narration output logic, collapse mapping, locale-key structure, 8-task implementation plan, 14-test regression plan. Exact approval recorded after artefact persistence and revalidation. |
| TP | `.agdf/control/artefacts/agdf-state-orientation/TP.md` | approved | 12 tasks (SO-01–SO-12), 14 tests (BT-01–BT-14), acceptance matrix, verification sequence. Exact approval recorded after revalidation. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_ANALYSIS.md` | done | Implementation path verified; all target functions confirmed; no parallel-structure conflict; regression risk low. |
| CD+Tests | `.agdf/control/artefacts/agdf-state-orientation/CD_TESTS.md` | done | 11 tasks implemented, 14 tests pass, 3 advisories fixed, release note recorded. |
| QA Report | `.agdf/control/artefacts/agdf-state-orientation/QA_REPORT.md` | pass | All evidence strong; no blocking risk; decision: pass. |
| TP Review | inline (TP Coverage in chat) | done | 12/12 tasks fully_done. |
| Clean Implementation Review | inline (Clean Review in chat) | done | Pass — clean primary solution, no fallbacks/parallel structures. |
| CR | inline (Code Review in chat) | done | Pass — 3 advisory findings fixed. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| UR revision 1 | `.agdf/control/artefacts/agdf-state-orientation/UR.md` | Problem, user need, scope, resolved design decisions | high |
| Brownfield Review | `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md` | Owners, coverage, reuse strategy, change impact, parallel-structure risk, Context Graph impact | high |
| Existing card spec | `plugin/meta/agdf-runtime-contract.md` (§Run Status Card, §Gate Transition Card, §derived-projection principle) | Current projection contract; H5 extends existing principle | direct |
| Existing TP narration | `plugin/skills/gate-check/SKILL.md:69` | Seed pattern for H4 generalization | direct |
| Existing status card builder | `create-agdf/bin/create-agdf.js:2336` `buildStatusCard()` | Current machine projection; H3/H4/H5 extend without changing JSON | direct |
| Locale registry | `plugin/meta/agdf-interaction-locales.json` | Existing gateTitles, afterApproval, statusCard keys; H3/H4/H5 add new keys | direct |
| Context Graph | `.agdf/control/CONTEXT_GRAPH.md:15` `CG-RUN-STATUS-CARD` | Existing node covering status projection; H3/H4/H5 update it | direct |

## Missing Evidence

| Missing | Reason |
|---|---|
| `Approval: QA` | Requested |
| `Approval: UAT` | After QA pass |
| Context Graph update (CG-RUN-STATUS-CARD) | Deferred to OR closeout |
| `agdf-human-decision-surface` UAT pass | Sequencing risk remains open |

## Risks

- Sequencing risk: concurrent modification of `interaction-presentation.js` and `agdf-interaction-locales.json` with `agdf-human-decision-surface`. Mitigated by sequencing or explicit section ownership in SD.
- Breadcrumb path derivation: verified_change path has no PRD/SD/TP; derivation must use Mode/Slice Decision + Approvals table, tested for all four path types.
- Narration non-overlap: post-acceptance narration must not duplicate Gate Transition Card. SD must define temporal/structural separation.
- Locale budget: new breadcrumb and narration keys must stay within declared `lengthBudgets`.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-RUN-STATUS-CARD` (CONTEXT_GRAPH.md:15)
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: `CG-RUN-STATUS-CARD` already covers compact status projection; Slice A extends it with path visibility, transition narration and internal-state collapse. Node update deferred to OR closeout.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Reusable Brownfield findings about card-projection owners, reuse paths and parallel-structure boundaries.
- memory_refs: `CG-RUN-STATUS-CARD`; `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md`

## Prior Run Pointers

- `agdf-human-decision-surface` is a related in-progress slice (UAT revise) covering the approval-time two-card envelope; it does not overlap with this slice's status-time, post-acceptance and internal-state-projection scope, but shares files. Sequencing or explicit section ownership is required.

## Closeout

- next_step: Request `Approval: QA`
- quality_outlook: Context Graph update at OR closeout; sequencing risk with agdf-human-decision-surface monitored
