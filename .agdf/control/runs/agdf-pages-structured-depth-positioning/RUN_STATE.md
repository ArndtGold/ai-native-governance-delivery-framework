# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-pages-structured-depth-positioning
- lifecycle: completed
- revision: 2
- revision_id: 10A25281-29A0-4DA3-966E-3B804D6A8B41
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Explain the canonical Structured Depth product semantics on AGDF Pages accurately and accessibly without creating a second normative policy owner.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The July 2026 detailed Structured Depth Pages projection was implemented, QA-approved and UAT-accepted, then deliberately removed by the later seven-section landing-page simplification. The historical implementation remains evidenced by commit `2f0afc1`; the current public projection is owned by `agdf-pages-landing-simplification`, and canonical depth semantics remain in the Modes Contract. |
| What is approved? | Exact approvals are recorded for UR, PRD, SD, TP, QA and UAT. OR-full closes the accepted historical scope with its successor relationship explicit. |
| What is missing? | Nothing required to close this run as superseded. The original absence of a separate durable SDP-13/14 manual-observation report remains disclosed rather than reconstructed. |
| What is the next allowed action? | No work remains in this run; use the landing-page successor for current public copy and the Modes Contract or a separately approved successor for canonical depth changes. |
| What is explicitly forbidden right now? | Treating the historical detailed section as current Pages behavior, treating its removal as removal of canonical depth semantics, or performing automatic VCS, deployment, release or reinstall actions. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-29 after same-run, same-gate and durable-artefact revalidation. |
| Brownfield Review | done | Existing Pages owners assessed; `structured_slice` selected with no full-depth trigger. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-07-29 after revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-07-29 after revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-07-29 after revalidation. |
| Brownfield Analysis | done | Reuse path, owners, regression risk and test impact passed. |
| QA | approved | QA report `pass`; exact `Approval: QA` accepted on 2026-07-29. |
| UAT | approved | Exact `Approval: UAT` accepted on 2026-07-29 after run, gate and revision revalidation. |
| OR | done | OR-full `pass`; lifecycle completed and historical Pages projection marked superseded by `agdf-pages-landing-simplification`. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/UR.md` | approved | Defines the bounded public-copy and recovery scope. |
| Brownfield Review | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/BROWNFIELD_REVIEW.md` | done | Existing owners inventoried; `structured_slice` selected. |
| Verified Change |  | missing | Not selected; structured slice was the approved path. |
| PRD | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/PRD.md` | approved | Twelve requirements and acceptance criteria. |
| SD | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/SD.md` | approved | Data, rendering, copy and responsive design. |
| TP | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/TP.md` | approved | Eight implementation and eleven verification tasks. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation decision `pass`. |
| CD+Tests | `pages/src/data/site.ts` | done | Historical implementation delivered in commit `2f0afc1`; later removed from current Pages by successor commit `c6d9313`. |
| CR | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/CR.md` | done | Pass with one non-blocking content advisory. |
| QA | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/QA_REPORT.md` | pass | Approved QA decision with original SDP-13/14 manual-observation limit disclosed. |
| UAT | `Approval: UAT` | approved | Exact acceptance recorded on 2026-07-29. |
| OR | `.agdf/control/artefacts/agdf-pages-structured-depth-positioning/OR.md` | pass | OR-full records historical delivery, evidence limits, successor and resolved Context Graph impact. |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: Public product communication and visible UX were affected, compact paths were insufficient, and no full-depth trigger applied.
- evidence: Brownfield Review; Modes Contract; approved UR; historical Pages data and composition.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Historical implementation | commit `2f0afc1` | accepted detailed Structured Depth Pages projection | direct repository history |
| Historical QA and UAT | QA report; exact approvals | quality decision and acceptance | authoritative historical evidence |
| Successor replacement | commit `c6d9313`; `agdf-pages-landing-simplification` OR | deliberate removal and current public projection | direct and authoritative |
| Canonical semantics | `plugin/meta/contracts/modes.md` | current Structured Depth policy authority | canonical source |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval accepted on 2026-07-29. |
| Brownfield Review | selects_mode | structured_slice | Seven bounded-slice checks passed; no full-depth trigger. |
| PRD | derived_from | UR | Twelve approved requirements realize the bounded public-copy scope. |
| PRD | approved_by | `Approval: PRD` | Exact approval accepted on 2026-07-29. |
| SD | derived_from | PRD | Data, rendering and copy design derive from approved requirements. |
| SD | approved_by | `Approval: SD` | Exact approval accepted on 2026-07-29. |
| TP | derived_from | SD | Approved tasks map design and verification obligations. |
| TP | approved_by | `Approval: TP` | Exact approval accepted on 2026-07-29. |
| QA_REPORT | tests | TP | QA report verifies the approved implementation and automated evidence with SDP-13/14 limits disclosed. |
| QA | approved_by | `Approval: QA` | Exact approval accepted on 2026-07-29. |
| UAT | approved_by | `Approval: UAT` | Exact approval accepted on 2026-07-29. |
| Historical implementation | superseded_by | `agdf-pages-landing-simplification` | Commit `c6d9313` replaced the detailed composition with the accepted seven-section public projection. |
| OR | reconciles | historical run and successor | OR-full preserves delivery evidence without claiming current Pages behavior. |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`; `CG-UX-INTENT-BEFORE-PRD`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: canonical depth invariants remain linked, while `CG-PUBLIC-PLUGIN-DISTRIBUTION` owns the successor seven-section public projection boundary.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Historical public projection, current composition and canonical policy authority must remain distinct.
- memory_refs: Modes Contract; historical and successor commits; both ORs.

## Closeout

- delivered: UAT-accepted historical Structured Depth Pages projection and complete durable gate chain.
- intentionally_not_delivered: current-page persistence after the later simplification, new VCS action, deployment, release or reinstall.
- next_allowed_action: No work remains in this superseded run; route future work to the current owner or a separately approved successor.
- quality_outlook: Preserve the historical/current/canonical authority distinction.
