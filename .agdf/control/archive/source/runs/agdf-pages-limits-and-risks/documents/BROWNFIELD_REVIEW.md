# Brownfield Review

## Review Meta

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- workstream: `agdf-pages-limits-and-risks`
- related_ur: `.agdf/control/artefacts/agdf-pages-limits-and-risks/UR.md`

## Existing Owners And Evidence

| Owner | Existing artefact | Finding |
|---|---|---|
| Public content data | `pages/src/data/site.ts` | Already owns `notFor`, `aiActFit`, principles and public positioning copy. |
| Page composition | `pages/src/pages/index.astro` | Already renders the `What AGDF Is Not` section and the governance-evidence section. |
| Page verification | `pages/package.json`, Pages build/check scripts and repository guardrails | Existing Pages validation path can cover the copy/layout integration. |
| Existing boundary messaging | `site.ts:notFor`, `site.ts:aiActFit` | Partially covers human responsibility and non-certification, but not architecture/security/testing/UAT/process-overhead dependencies as a coherent group. |

## Current Coverage

- `fully_done`: public section ownership and existing non-certification boundary.
- `partially_done`: AGDF is described as not replacing product responsibility, but the critical engineering and evidence limits are distributed and incomplete.
- `not_done`: explicit paired communication of what AGDF does not replace and what AGDF depends on, including process overhead.

## Reuse Strategy

- strategy: `extend`
- reuse: `site.ts` data ownership and the existing `index.astro` boundary/evidence section pattern.
- new artefacts: no new page framework, component system or runtime owner.
- parallel-structure risk: low if the new copy is placed as one coherent boundary section and existing claims are deduplicated rather than repeated.

## Impact Assessment

- files/modules: `pages/src/data/site.ts` and `pages/src/pages/index.astro`; likely Pages test/build evidence.
- interfaces: visible public positioning and expectations only.
- data model/migrations: none.
- backwards compatibility: additive copy; existing navigation and section anchors should remain stable.
- side effects: clearer qualification of AGDF claims; no runtime behavior change.

## SoT And Product-Semantics Findings

This is public product positioning, not a technical-only documentation edit. The wording must remain precise: AGDF supports governed delivery but does not certify compliance, replace human responsibility or make engineering quality automatic.

## Context Graph Impact

- context_graph_impact: `none`
- rationale: the copy clarifies existing product boundaries and does not introduce a reusable architecture decision, invariant or governance rule.

## Transparency

`structured_slice` is selected because the change is bounded to existing Pages content owners but changes public product semantics. A focused PRD is required before implementation; no runtime or plugin work is implied.

## Missing Evidence

- No blocker for PRD drafting.
- The PRD should decide whether the new content is a single paired section or two adjacent subsections to avoid duplication with `notFor` and `aiActFit`.

## Required Next Step

Draft the focused PRD for the Pages limits-and-risks slice. Do not edit Pages source yet.
