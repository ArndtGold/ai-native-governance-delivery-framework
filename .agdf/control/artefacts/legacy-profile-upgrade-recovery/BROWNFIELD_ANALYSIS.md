# Brownfield Analysis: Release-Owned Historical Profile Compatibility

Status: done
Decision: pass
Mode: `pre_implementation_analysis`
Revision: 4
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved TP Revision 5

## Baseline And Scope

- baseline_commit: `e836571c7c11c99172f938edc4246e8a3650917b`
- baseline_scope: Revision 1 implementation and this run's control artefacts are the only dirty owners
  touched by the compatibility-catalogue work. Other active runs remain excluded.
- released_evidence: direct local-tag inspection establishes four-profile contracts at `0.13.6`,
  `0.13.7`, `0.13.8` and `0.14.1`, and five-profile contracts at `0.14.2` and `0.14.3`.
  `agdf-v0.14.0` instead contains definition, package and Codex versions `0.13.8`.
- decision: pass; approved PRD Revision 4, SD Revision 3 and TP Revision 5 now require the exact
  tag-evidenced support set and explicit `agdf-v0.14.0` mismatch rejection. Existing generic metadata
  copying, provenance classification, transaction, release-coherence and test owners support the
  approved path without a second authority or generator.

## Existing Owners And Reuse

| Concern | Existing owner | Revision 4 action |
|---|---|---|
| Canonical plugin metadata | `plugin/meta/` | add one JSON catalogue beside the definition |
| Generated metadata | `public-plugin/builder.js` and `sync-package-assets.js` | shared plugin copies `meta` generically; Copilot support list must add the catalogue and update its reviewed payload baseline |
| Current validation/provenance | `plugin-provenance.js` | replace incident hard-code with focused catalogue module; keep current validator first |
| Marketplace transaction | `local-marketplace.js` | no structural change; consume exact catalogue classification/evidence |
| Release preparation | `release/version-coherence.js` and release test | compose one focused history validator after sync |
| Package inventory | existing package build/contents tests | assert catalogue presence and parity |
| Runtime Integrity | existing canonical script | add source/generated/runtime catalogue invariants |
| Claude/lifecycle | Revision 1 owners | regression only; no design change |

## Call Path

1. `release:prepare` runs `sync-package-assets`, then release-version coherence and public-plugin tests.
2. Public builder copies all `plugin/meta`, so no bespoke catalogue generator is required.
3. Runtime packages already include `plugin-provenance.js`; one adjacent pure module can be included by
   the existing runtime payload copy and verified by Runtime Integrity.
4. `validateBuiltPlugin` invokes current profile validation first. Only existing-root migration enables
   historical inspection.
5. Catalogue bytes enter the existing normalized source/plugin digests automatically because metadata
   files are already traversed.
6. Release tag evidence belongs only to repository tests/release validation; package/runtime
   classification consumes the packaged catalogue and never Git.

## Minimal Clean Implementation

1. Add canonical catalogue with two deduplicated contracts, six exact supported release records and no
   `0.14.0` record.
2. Add one pure runtime validator/classifier with deterministic stable JSON digesting.
3. Replace the in-module `0.13.8` registry with validated catalogue lookup.
4. Extend migration fixtures across four historical old-shape releases and two current-shape
   predecessors; assert explicit `agdf-v0.14.0` mismatch rejection in release evidence.
5. Add one release validator that compares current source/generated copies and exact local tag
   definitions; wire into the existing release test/script.
6. Extend package/Runtime Integrity assertions and documentation.

## Risks And Stop Conditions

- Any need for runtime Git/network access: block.
- Any history lookup in current generated/runtime validation: block.
- Any catalogue format that accepts ranges, subsets or unknown keys: block.
- Any tag-dependent ordinary npm package test: block; use embedded unit fixtures there.
- Any bespoke second metadata copy/generator: revise before implementation.
- Any silent removal/retirement path: block.
- Any change to marker schema, marketplace transaction, cache authority or public commands: revise SD.

## Test Impact

- New focused history unit suite.
- Expanded release-version coherence, local marketplace, package contents/build and Runtime Integrity.
- Existing Claude cache, lifecycle, local development install and smoke suites remain mandatory.
- Known unrelated Windows CLI path and interaction-contract baseline failures remain explicit; they
  cannot be converted into success by this run.

## Context Graph

- impact: update_existing_node
- ref: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required update: record proactive release snapshots, packaged exact lookup and append-only support
  continuity after implementation evidence.
