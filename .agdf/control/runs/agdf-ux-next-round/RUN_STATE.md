# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-ux-next-round
- lifecycle: active
- revision: 1
- revision_id: 0545f7f2-b65a-4267-a5cc-05f4c9ac287f
- mode: structured_delivery
- current_gate: QA
- decision: pass
- owner: agent

## Objective

Improve AGDF's next-round user experience by making ambiguous-run selection understandable,
shortening first-contact orientation, grouping skills by when users encounter them, and making
fallback and version evidence more visible without changing gate authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The prior UX review identified four prioritized improvements: ambiguous-run choice, first-contact flow, skill grouping, and fallback/version evidence visibility. Technical interaction presentation tests and runtime-integrity checks currently pass. |
| What is approved? | Durable UR, PRD, SD and TP approved with exact gate approvals on 2026-07-15. |
| What is missing? | Exact QA approval; direct live-host rendering remains intentionally unverified and is not claimed. |
| What is the next allowed action? | Request exact post-report `Approval: QA`. |
| What is explicitly forbidden right now? | UAT, release and VCS claims before exact QA approval. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-15 |
| PRD | approved | `Approval: PRD` provided on 2026-07-15 |
| SD | approved | `Approval: SD` provided on 2026-07-15 |
| TP | approved | `Approval: TP` provided on 2026-07-15 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-ux-next-round/UR.md` | approved | `Approval: UR` provided on 2026-07-15. |
| Brownfield Review | `.agdf/control/artefacts/agdf-ux-next-round/BROWNFIELD_REVIEW.md` | done | `structured_slice` selected; existing owners and reuse boundaries are evidenced. |
| PRD | `.agdf/control/artefacts/agdf-ux-next-round/PRD.md` | approved | `Approval: PRD` provided on 2026-07-15. |
| SD | `.agdf/control/artefacts/agdf-ux-next-round/SD.md` | approved | `Approval: SD` provided on 2026-07-15. |
| TP | `.agdf/control/artefacts/agdf-ux-next-round/TP.md` | approved | `Approval: TP` provided on 2026-07-15. |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-ux-next-round/BROWNFIELD_ANALYSIS.md` | done | Pre-implementation analysis passed; extend existing projections only. |
| CD+Tests | `.agdf/control/artefacts/agdf-ux-next-round/CD_TESTS.md` | done | Deterministic focused, integrity, Pages and aggregate smoke evidence passed; declared task coverage is partial. |
| TP Review | `.agdf/control/artefacts/agdf-ux-next-round/TP_REVIEW.md` | done | `revise`: UX-01/07 fully done; UX-02–05/08 partial; UX-06 not done. |
| Clean Implementation Review | `.agdf/control/artefacts/agdf-ux-next-round/CLEAN_IMPLEMENTATION_REVIEW.md` | done | `pass`: one-owner extension; no workaround, shim or parallel authority. |
| CR | `.agdf/control/artefacts/agdf-ux-next-round/CODE_REVIEW.md` | done | `pass`: no implementation defect remains; TP scope gaps are QA inputs. |
| QA | `.agdf/control/artefacts/agdf-ux-next-round/QA_REPORT.md` | pass | Refreshed QA pass; exact `Approval: QA` is still missing. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Prior UX review | Current repository UX assessment and validated interaction checks | Scope rationale, prioritized UX concerns and existing technical baseline | direct |
| CD+Tests | `.agdf/control/artefacts/agdf-ux-next-round/CD_TESTS.md` | Implementation and deterministic checks | direct |
| Reviews | `TP_REVIEW.md`; `CLEAN_IMPLEMENTATION_REVIEW.md`; `CODE_REVIEW.md` | Task coverage, solution integrity and code findings | direct |
| QA gate | `.agdf/control/artefacts/agdf-ux-next-round/QA_REPORT.md` | Formal QA decision | direct |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Bounded but normative UX changes across run selection, onboarding, skill discovery and fallback/version presentation; existing owners can be extended without a new authority model.
- evidence: `.agdf/control/artefacts/agdf-ux-next-round/BROWNFIELD_REVIEW.md`; `plugin/meta/agdf-runtime-contract.md`; `create-agdf/bin/create-agdf.js`; `pages/src/data/skills.ts`; `pages/src/pages/index.astro`.

## Artefact Chain

| From | Relationship | To | Status | Evidence |
|---|---|---|---|---|
| UR | approved_by | `Approval: UR` | approved | Exact approval recorded on 2026-07-15. |
| PRD | derived_from | UR | approved | `.agdf/control/artefacts/agdf-ux-next-round/PRD.md` |
| PRD | approved_by | `Approval: PRD` | approved | Exact approval recorded on 2026-07-15. |
| SD | derived_from | PRD | approved | `.agdf/control/artefacts/agdf-ux-next-round/SD.md` |
| SD | approved_by | `Approval: SD` | approved | Exact approval recorded on 2026-07-15. |
| TP | derived_from | SD | approved | `.agdf/control/artefacts/agdf-ux-next-round/TP.md` |
| TP | approved_by | `Approval: TP` | approved | Exact approval recorded on 2026-07-15. |
| CD+Tests | implements | TP | done | `.agdf/control/artefacts/agdf-ux-next-round/CD_TESTS.md` |
| TP Review | verifies | TP | revise | `.agdf/control/artefacts/agdf-ux-next-round/TP_REVIEW.md` |
| Clean Implementation Review | verifies | CD+Tests | pass | `.agdf/control/artefacts/agdf-ux-next-round/CLEAN_IMPLEMENTATION_REVIEW.md` |
| CR | reviews | CD+Tests | pass | `.agdf/control/artefacts/agdf-ux-next-round/CODE_REVIEW.md` |
| QA_REPORT | tests | TP | revise | `.agdf/control/artefacts/agdf-ux-next-round/QA_REPORT.md` |

## Closeout

- next_allowed_action: Request exact post-report `Approval: QA`.
- quality_outlook: QA pass is evidenced; wait for exact approval before UAT.
