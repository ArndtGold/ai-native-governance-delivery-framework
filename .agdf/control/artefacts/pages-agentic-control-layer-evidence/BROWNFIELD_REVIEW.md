# Brownfield Review: External Agentic Control-Layer Evidence

- mode: post_ur_review
- decision: pass
- mode_slice_decision: quick_task
- required_next_gate: none
- artefact: `.agdf/control/artefacts/pages-agentic-control-layer-evidence/BROWNFIELD_REVIEW.md`
- date: 2026-07-15

## Scope And Existing Owners

- target composition: `pages/src/pages/index.astro`, immediately after `#race-control` and before `#proof`
- canonical implementation owner for this bounded card: `pages/src/pages/index.astro`
- optional shared copy owner: `pages/src/data/site.ts` is not needed for one non-reused card
- existing visual path: current surface/card borders, typography and `data-reveal`; no component or route is needed
- source evidence: Mozilla launch article and `stateofopensource.ai`

## Current Coverage

- fully_done: the race-car/control-system analogy already establishes that AGDF is the control layer around a coding-agent engine
- partially_done: existing copy already discusses delivery authority, approved scope, evidence, human decisions and next-step control, but has no independent external evidence card
- not_done: the Mozilla label, `Beyond the model` card, two-paragraph evidence bridge and source link

## Reuse Strategy

- reuse_strategy: extend the existing `index.astro` composition with one inline bounded evidence card using the established surface, typography, link and `data-reveal` conventions
- parallel_structure_risk: low; no new component, route, navigation item, content registry or second source of truth is needed

## Resolved Overlap Evidence

- `agdf-pages-limits-and-risks` is completed with exact approvals through UAT, a passing QA report and a full OR.
- Its run-owned corrective diff in `pages/src/pages/index.astro` remains uncommitted but is fully attributable and closed; the Mozilla insertion point is a distinct adjacent block after `#race-control`.
- `pages/src/data/site.ts` is clean and does not need modification for this single-use card.
- The Mozilla UR fixes label, heading, paragraph limit, link target, placement and endorsement boundary, leaving no unresolved product decision.

## Risks

- The shared `index.astro` worktree diff requires narrow hunk review so the completed run's section-order correction remains distinguishable.
- Mozilla must remain independent evidence for the problem, not an endorsement or effectiveness claim for AGDF.
- The external link and responsive card flow require direct verification.

## Transparency

The earlier overlap is closed. This is a narrow, local, single-owner presentation change with complete approved semantics, no architecture/policy/persistence/runtime impact and deterministic Pages validation. A `quick_task` is therefore proportionate; PRD, SD and TP would duplicate the already precise UR without reducing material risk. `verified_change` is not selected because the canonical page owner is already dirty from the completed adjacent run.

## Quality Contract

- decision: pass
- evidence: approved precise UR; current `#race-control` → `#proof` composition; completed overlapping run with QA/UAT/OR; isolated current owner diff; existing visual conventions
- missing_evidence: rendered card, link and responsive verification remain execution evidence
- risks: shared-file hunk attribution and external-evidence wording
- required_next_step: Execute the approved quick task in `pages/src/pages/index.astro`, then run Pages, rendered-content, link, visual and diff checks.
- impact_codes: none

## Context Graph

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: This is a source-backed Pages positioning addition, not a new reusable AGDF invariant.
