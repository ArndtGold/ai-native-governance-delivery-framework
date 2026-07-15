# Brownfield Analysis: Guided AGDF UX Interaction Delivery

Gate: Brownfield Analysis
Type: Pre-implementation Analysis
Status: pass

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-ux-next-round/BROWNFIELD_ANALYSIS.md`
- scope: UX-01 through UX-08 in the approved TP.

## Existing Owners And Coverage

| Owner | Current coverage | Reuse path | Implementation impact |
|---|---|---|---|
| `create-agdf/lib/control-state/run-state-repository.js` | `partially_done`: safe active-run discovery and canonical parsing exist; no display-safe candidate projection | extend discovery output; no selection persistence | low |
| `create-agdf/bin/create-agdf.js` | `partially_done`: ambiguity fails closed and gate/status projections exist | extend ambiguity detail output without changing `--run`, environment selection or authority | medium |
| `create-agdf/lib/interaction-presentation.js` | `partially_done`: locale, title, artefact-link and outcome helpers exist | extend with pure candidate/attempt/receipt validation and formatting helpers | medium |
| `create-agdf/scripts/interaction-presentation-test.js` | `partially_done`: locale and approval outcome coverage exists | extend fixtures in the same script; no new test framework | medium |
| Runtime Contract, gate-check skill, plugin definition and locale registry | `partially_done`: native-first and fallback invariants exist | refine one shared contract and synchronize generated surfaces | high |
| `pages/src/data/skills.ts`, `pages/src/pages/index.astro`, `pages/src/data/site.ts` | `partially_done`: one skill list/family and screenshot boundary exist | add canonical discovery classification and evidence labels; keep host-owned limits explicit | medium |

## Reuse Strategy And Parallel-Structure Check

- reuse_strategy: `extend`
- Existing title derivation, gate evaluation, exact approval validation, locale resolution and
  generated-package synchronization are reusable.
- No new run selector, interaction ledger, approval validator, skill catalogue or host UI is
  permitted. Candidate and receipt data remain derived, bounded and non-authoritative.
- The primary parallel-structure risk is duplicating interaction policy between Runtime Contract,
  gate-check guidance, plugin definition and generated files. Runtime integrity and negative drift
  tests are therefore mandatory for UX-03 and UX-07.

## Change And Regression Impact

- interfaces: additive detail JSON fields only; existing status fields, `--run`, `AGDF_RUN_ID` and
  exact approval values remain unchanged.
- persistence: no migration and no new durable interaction record. Canonical run state remains
  unchanged except for normal delivery artefacts/evidence.
- UI/visible ownership: AGDF controls chat copy, Pages and package metadata; Codex/Claude/OpenCode
  own their native question/catalogue chrome. The implementation must disclose rather than emulate
  host limitations.
- regression tests: control-state, interaction presentation, runtime integrity/negative, routing,
  package smoke and Pages checks/build. Live native rendering needs separate observed evidence.
- compatibility: locale fallback, existing output consumers, non-approval semantics and
  fail-closed ambiguity behavior are protected boundaries.

## Risks And Missing Evidence

- A deterministic test can prove a requested native attempt payload, but not host rendering. This
  remains an explicit live-evidence requirement, not a blocker for narrow implementation.
- Host option-count and label-length limits are not yet measured across all surfaces. Implement a
  conservative bounded projection and record unverified surface behavior rather than guessing.
- Additive JSON changes require inspection of existing control-state fixtures to avoid strict
  consumer regressions.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: existing native interaction authority and human decision presentation
  decisions
- context_graph_required_action: link existing entries if implementation introduces a reusable
  receipt/candidate projection invariant
- context_graph_gate_effect: none

## Required Next Step

- required_next_step: Implement the approved TP tasks narrowly, collect test evidence and keep
  live host observations separate from deterministic checks.

## Quality Outlook

The clean implementation is an extension of the current projection layer. Any new persistence,
automatic selection, silent fallback or host-UI imitation is a revise/block condition.

## QA-Revise Control Delta (2026-07-15)

- decision: `pass`
- scope: Make a persisted QA artefact row with status `revise` fail closed in
  the existing `transitionDecisionForRunState` and `buildStatusCard` path.
- reuse_strategy: `extend`; no new decision store, evaluator or presentation
  model is needed.
- regression_boundary: A revise report must return no missing approval, no
  post-approval transition and no approval action. The normal missing-QA-report
  path remains unchanged.
- parallel_structure_risk: none when the existing QA artefact status is the
  single condition; duplicating QA-report parsing or adding a separate status
  policy is forbidden.
- required_next_step: Implement the bounded transition guard and a hermetic CLI
  regression fixture, then refresh CD+Tests and reviews.
