# Brownfield Review: Pages Skill Evaluation Evidence

## Decision

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `verified_change`
- required_next_gate: `none`
- related_ur: `.agdf/control/artefacts/pages-skill-evaluation-evidence/UR.md`

## Scope And Existing Ownership

The approved scope is a bounded extension of the existing self-hosting proof in
`pages/src/pages/index.astro`. The repository already provides the authoritative evidence:

- `plugin/meta/agdf-plugin.definition.json` owns the canonical skill inventory;
- `evals/cases/*.json` owns the behavioral case corpus and case classes;
- `evals/manifest.json` owns the corpus version and deterministic thresholds;
- `pages/src/pages/index.astro` owns the visible self-hosting proof;
- `pages/package.json` owns Astro check and production build validation.

No new route, service, API, persistence layer, permission, runtime integration or design system is
needed.

## Current Coverage

- status: `partially_done`
- existing: Pages already presents AGDF's self-hosting claim and three compact proof cards.
- missing: a repository-derived evaluation evidence owner and one compact visible proof point with
  the approved replay/live boundary.

## Reuse Strategy

- strategy: `extend`
- canonical data owner: new focused `pages/src/data/evaluationEvidence.ts`, derived directly from
  the existing plugin definition and versioned eval case files at build time.
- visible owner: existing `self-hosting-proof` section in `pages/src/pages/index.astro`.
- implementation boundary: one data module and one existing page section.

## Impact And Compatibility

- interfaces: additive internal build-time data only.
- data model or migration: none.
- backwards compatibility: existing sections, anchors, navigation and proof cards remain intact.
- security and privacy: no external request, user input, tracking or data processing is introduced.
- regression evidence: Astro check/build; rendered assertions for the approved copy, 9 skills and
  27 cases; deterministic skill eval; whitespace validation.

## Risk Review

- parallel structure risk: low; the new Pages module is a read-only projection of canonical owners,
  not a second skill or eval inventory.
- source-of-truth drift: fail-closed because the build-time projection derives counts and validates
  normal/boundary/adversarial coverage for every canonical skill.
- UI ownership risk: none; the existing self-hosting section remains the sole visible owner.
- UI monolith risk: none; one compact evidence block is added to an existing static section.
- residual risk: numeric claims describe the current repository corpus, not universal future host or
  model behavior; the approved boundary copy makes that explicit.

## Mode / Slice Decision

`verified_change` is selected because the change has one canonical read-only projection owner, two
bounded source paths, no prohibited impact, deterministic validation and a declared
`structured_slice` escalation target. PRD, SD and TP would add no material decision value.

Implementation-preparation Brownfield Analysis is not required unless eligibility fails or scope
expands.

## Context Graph Impact

- impact: `link_only`
- refs: `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- reconciliation: `resolved`
- reason: the existing public-evidence boundary is reused; no new durable framework policy is created.

## Required Next Step

Validate `.agdf/control/artefacts/pages-skill-evaluation-evidence/VERIFIED_CHANGE.md`. Execute only
while every eligibility condition remains passing.
