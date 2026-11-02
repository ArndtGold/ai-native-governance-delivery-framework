# Brownfield Review: Clarify the Narrow Bug Track on Pages

## Review Meta

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- workstream: `pages-narrow-bug-track-clarity`
- related_ur: `.agdf/control/artefacts/pages-narrow-bug-track-clarity/UR.md`

## Existing Owners And Evidence

| Owner | Existing artefact | Finding |
|---|---|---|
| Public requirement-path copy | `pages/src/data/site.ts` `requirementPaths` | Owns the three-card section, including the misleading `Bug Lightweight` wording. |
| Section rendering | `pages/src/pages/index.astro` | Renders the data-driven cards; no new component or layout owner is needed. |
| Canonical semantics | `plugin/meta/agdf-runtime-contract.md` `Bug Lightweight Track` and `Verified Change` | Bug Lightweight is a narrow defect scope with durable evidence; it does not remove QA, OR or repository approvals. Verified Change is the separately machine-validated compact change path. |
| Pages validation | `pages/package.json` | Existing Pages check/build path covers the data-driven copy change. |

## Current Coverage

- fully_done: existing data-driven card layout and canonical Bug Lightweight semantics.
- partially_done: public card identifies a narrow defect, but its label/outcome imply a peer delivery path and omit retained controls.
- not_done: precise public separation of Narrow Bug Track, required controls and Verified Change.

## Reuse Strategy

- strategy: `extend`
- reuse: change the existing `requirementPaths` data only; retain the rendered card count, order, markup and styles.
- parallel-structure risk: low if the distinction is stated within the existing card instead of adding a parallel explainer or route.

## Impact Assessment

- files/modules: `pages/src/data/site.ts`; inspect `pages/src/pages/index.astro` only for rendering fit.
- interfaces: public positioning only.
- data model/migrations: none.
- backwards compatibility: section shape, anchors and navigation remain unchanged.
- side effects: clearer expectation that a narrow defect does not bypass required controls.

## SoT And Product-Semantics Findings

This is a public product-positioning correction. The Runtime Contract remains the sole semantic owner; Pages must summarize it without reproducing the full transition model or implying a new delivery mode.

## Context Graph Impact

- context_graph_impact: `none`
- rationale: this reconciles existing public copy with an already-established Runtime Contract boundary; it adds no reusable architecture decision or invariant.

## Transparency

`structured_slice` is selected because the edit is small but changes public governance semantics. A focused PRD must lock the exact wording and non-goals before Pages source changes.

## Missing Evidence

- No blocker for PRD drafting.
- The PRD should preserve the three-card layout and decide the exact compact phrase used to distinguish Verified Change without turning the card into a detailed rule table.

## Required Next Step

Draft the focused PRD, then request `Approval: PRD`. Do not edit Pages source yet.
