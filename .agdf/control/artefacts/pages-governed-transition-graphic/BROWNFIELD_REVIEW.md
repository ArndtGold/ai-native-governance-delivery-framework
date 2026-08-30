# Brownfield Review: Add the Governed Transition Graphic to Pages

- revision: 1
- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `quick_task`
- required_next_gate: `none`

## Scope And Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The visual adds a bounded explanatory layout inside the existing problem section without changing navigation, primary actions, working modes, effective state, activation, blockers or recovery behaviour.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing Owners And Coverage

- `pages/src/pages/index.astro` owns the problem-section rendering and is the canonical insertion point.
- `pages/src/data/site.ts` owns the exact public wording and can provide visual labels without creating a second content source.
- `pages/src/styles/global.css` owns reusable Pages presentation primitives and narrow-screen behaviour.
- `pages/scripts/landing-page-test.mjs` owns deterministic structure, copy, boundary and payload assertions.
- The existing problem comparison and following control-loop section already explain related ideas; the visual must bridge them without adding another top-level section or repeating the four-step loop.
- current_coverage: `partially_done`
- reuse_strategy: `extend`

## Baseline And Overlap

- Branch `main` is at `3aa985e`.
- `pages/src/data/site.ts` and `pages/scripts/landing-page-test.mjs` already contain two exact uncommitted positioning hunks owned by `agdf-pages-positioning-clarity`.
- The graphic may add separate, attributable hunks to those files but must preserve the existing positioning hunks byte-for-byte.
- `pages/src/pages/index.astro` and `pages/src/styles/global.css` are clean and available as graphic-owned paths.
- The shared `MASTER_BACKLOG.md` delta is steering state, not product implementation evidence.

## Impact And Reuse Assessment

- interfaces: no API, CLI, runtime, plugin, installation or public data-contract change
- persistence_and_migration: none
- compatibility: static HTML/CSS only; essential meaning remains available without JavaScript
- responsive_owner: existing Tailwind breakpoints and `global.css` media patterns
- accessibility: ordered semantic groups, visible labels and one complete screen-reader description; colour is supplementary
- regression: extend the existing landing regression and capture direct desktop/mobile rendering evidence
- parallel_structure_risk: low when labels remain in `site.ts` and the visual stays inside `#problem`
- ui_monolith_risk: none; the page remains a small static composition

## Mode / Slice Decision

- decision: `quick_task`
- scope_reason: The approved outcome is one bounded static visual inside an existing section, reuses all current owners, changes no authority or external contract, and has deterministic build, structural and responsive evidence.
- transparency: PRD, SD and TP are skipped because the UR fixes meaning, placement, non-claims, responsiveness and accessibility, while this review identifies every owner and overlap boundary.
- rejected_alternative: `verified_change` is ineligible because two candidate paths are already dirty from the separately executed positioning refinement.
- structured_escalation: required if implementation needs a new section, JavaScript state, a second content owner, host-enforcement claims or cannot preserve the prior hunks.

## Context Graph And Knowledge Persistence

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The visual projects the approved public positioning and introduces no reusable runtime, architecture or authority decision.
- memory_target: `scope_artifact`
- memory_reason: Exact visual copy, overlap evidence and rendered checks remain specific to this Pages change.
- memory_refs: `.agdf/control/artefacts/pages-governed-transition-graphic/UR.md`; `.agdf/control/artefacts/pages-governed-transition-graphic/BROWNFIELD_REVIEW.md`.

## Required Next Step

Implement the Compact Delivery within the four identified Pages owners, preserve the prior positioning hunks, run focused build and structural checks, inspect desktop and mobile rendering, and record an OR-lite closeout.

