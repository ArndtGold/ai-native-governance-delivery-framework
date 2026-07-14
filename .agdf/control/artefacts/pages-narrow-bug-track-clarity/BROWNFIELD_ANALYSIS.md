# Brownfield Analysis: Clarify the Narrow Bug Track on Pages

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- workstream: `pages-narrow-bug-track-clarity`
- based_on: `TP.md`, `SD.md`, `BROWNFIELD_REVIEW.md`

## Reuse Path

- primary owner: edit the existing second `requirementPaths` object in `pages/src/data/site.ts`.
- renderer: `pages/src/pages/index.astro` maps `requirementPaths` directly and already owns card count, order and visual layout.
- validation owner: existing `pages` package scripts `check` and `build`.
- canonical semantics: read `plugin/meta/agdf-runtime-contract.md`; do not edit or reproduce its full policy in Pages.

## Fit And Risk Assessment

- affected files: `pages/src/data/site.ts`; `pages/src/pages/index.astro` is inspection-only unless the existing data shape proves insufficient.
- interfaces, data, migration and persistence: none.
- UI ownership: a single data-driven renderer owns the section; no view-model, status, recovery or interaction state is involved.
- parallel-structure risk: low. A new explanatory block, fourth card or runtime copy would create unnecessary duplicate ownership and is prohibited by the TP.
- regression risk: limited to public copy and text wrapping; preserve the existing four string fields and card position.
- worktree boundary: the workspace contains unrelated active Verified Change and control artefact work. CD+Tests for this scope must restrict source changes to its declared Pages data owner plus its own evidence artefacts.

## Current Coverage

- fully_done: existing three-card renderer and Pages validation commands.
- partially_done: public card wording does not state the retained-controls boundary or Verified Change distinction.
- not_done: approved copy update and validation evidence.

## Context Graph

- context_graph_impact: `none`
- context_graph_reconciliation: `not_applicable`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

## Required Next Step

Proceed with CD+Tests: update the existing data object only, run the TP checks and record evidence.
