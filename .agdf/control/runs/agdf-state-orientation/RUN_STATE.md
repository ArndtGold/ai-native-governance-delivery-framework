# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-state-orientation
- lifecycle: active
- revision: 2
- revision_id: B2C3D4E5-F6A7-8901-BCDE-F23456789012
- mode: structured_slice
- current_gate: PRD
- decision: in_progress
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
| What is known? | UR revision 1 approved. Brownfield Review done: `pass`, `structured_slice`. Three design decisions resolved as specification. Existing owners, reuse paths and parallel-structure risk to `agdf-human-decision-surface` identified. |
| What is approved? | `Approval: UR` provided on 2026-07-15 for revision 1 after revalidation. |
| What is missing? | Compact PRD defining the exact presentation boundary, breadcrumb derivation, narration template and collapse rules. |
| What is the next allowed action? | Draft the compact PRD and request `Approval: PRD`. |
| What is explicitly forbidden right now? | SD, TP, Brownfield Analysis, implementation, QA and release claims before approved PRD. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/artefacts/agdf-state-orientation/UR.md`; `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md`
- competing_scope_lines: `agdf-human-decision-surface` is a related in-progress slice (UAT revise) covering the approval-time two-card envelope; it does not overlap with status-time breadcrumb, post-acceptance narration or internal-state collapse. Slice B (Gate Rationale Registry, on-demand "Why?", block-rationale guarantee) is separately tracked and not yet requested.

## Run Status Card

| Run status | Value |
|---|---|
| Status | open |
| Current gate | PRD |
| Allowed now | Draft and refine the compact PRD; request exact PRD approval |
| Blocked by | Missing approved PRD |
| Missing approval | `Approval: PRD` |
| Next gate after approval | SD |
| Allowed after approval | Draft the compact Solution Design; implementation remains forbidden |
| Next step | Draft the PRD and request exact `Approval: PRD` |
| Quality outlook | Define non-overlapping file sections with `agdf-human-decision-surface`; add regression coverage for breadcrumb, narration and collapse |

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
| PRD | derived_from | UR | Pending — draft PRD to derive from approved UR and recorded Brownfield Review. |

## Next Allowed Action

- next_allowed_action: Draft the compact PRD and request exact `Approval: PRD`.
- forbidden_until_then: SD, TP, Brownfield Analysis, implementation, QA and release claims before approved PRD.

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-15 after same-run, same-gate and revision revalidation. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-state-orientation/UR.md` | approved | Exact approval recorded after revalidation. Three design questions resolved as specification. |
| Brownfield Review | `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md` | done | `pass`; `structured_slice` selected; existing owners and reuse paths confirmed; parallel-structure risk to `agdf-human-decision-surface` identified and mitigated. |

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
| Approved PRD | Not yet drafted |
| Regression-test coverage | Expected at TP/CD+Tests |
| Live CLI rendering evidence | Expected at CD+Tests |
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

- next_step: Draft the compact PRD and request `Approval: PRD`
- quality_outlook: Define non-overlapping file sections with `agdf-human-decision-surface`; add regression coverage for breadcrumb, narration and collapse
