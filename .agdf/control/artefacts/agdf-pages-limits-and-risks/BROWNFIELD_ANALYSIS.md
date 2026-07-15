# Pre-Implementation Brownfield Analysis

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- revalidated: `2026-07-15`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- source: `.agdf/control/artefacts/agdf-pages-limits-and-risks/TP.md`

## Reuse Path And Owners

The approved implementation has two clear existing owners:

1. `pages/src/data/site.ts` owns public positioning data, including `notFor` and `aiActFit`.
2. `pages/src/pages/index.astro` owns the page section composition and existing responsive card patterns.

The existing Pages package scripts provide the verification path: `astro check` and `astro build`.

No new route, component system, navigation entry or runtime owner is needed.

## Current Coverage

- `fully_done`: the paired limits/dependencies model, all required responsibility and operating-condition copy, process-overhead framing, and the existing non-certification boundary are present in the current Pages owners.
- `partially_done`: none.
- `not_done`: the current composition order does not match the approved flow. `What AGDF Is Not` is separated from the limits and governance-evidence sections, while `AI Governance Needs Evidence` precedes the limits section.

## Implementation Readiness

- exact content requirements are fixed in PRD, SD and TP;
- the approved placement is fixed and the current ordering gap can be corrected by moving existing sections without introducing a new owner or changing their content;
- existing styling, responsive grid and reveal conventions are available for reuse;
- no unresolved ownership, migration, security or legal-claim question remains within scope.

## Regression And Test Impact

- direct content/type validation: `npm --prefix pages run check`;
- static build validation: `npm --prefix pages run build`;
- control-state validation: `npx --yes @agdf/cli@latest doctor --json`;
- scope/format validation: `git diff --check` and final diff inspection;
- rendered evidence: inspect the generated page at responsive widths.

## Parallel-Structure And Drift Review

- parallel content owner risk: none; the existing copy remains owned by `site.ts` and rendered from `index.astro` only;
- duplicate boundary risk: manageable through a direct cross-section copy review;
- legal/compliance drift: no new certification claim is permitted;
- runtime/gate drift: none; this is Pages-only public copy and composition.

## Minimal Clean Implementation Path

Proceed with CD+Tests by correcting the existing section order to `What AGDF Is Not` → `Limits and operating conditions` → `AI Governance Needs Evidence`, then verify the already-present content and responsive presentation. Do not rewrite the copy or change plugin, runtime, control or gate files beyond the approved delivery artefacts.

## Required Next Step

Begin `CD+Tests` for tasks PLR-01 through PLR-08. Any unexpected route, component, runtime or claim change requires stopping and routing back through scope review.
