# Brownfield Review

## Review Meta

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- workstream: `agdf-onboarding-fit-default-prompt`
- related_ur: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/UR.md`

## Scope

Add one onboarding-oriented Codex `defaultPrompt` before the existing governance prompts. The prompt must assess AGDF suitability, practical value, governance overhead and risk fit, then recommend a proportional AGDF path without implying implementation authority.

## Existing Owners And Evidence

| Owner | Existing artefact | Finding |
|---|---|---|
| Canonical plugin metadata | `plugin/meta/agdf-plugin.definition.json` | Owns the Codex default prompt list used to generate package surfaces. |
| Codex plugin surface | `plugin/.codex-plugin/plugin.json` | Mirrors the canonical definition; runtime integrity compares `interface.defaultPrompt` exactly. |
| Package propagation | `create-agdf/scripts/sync-package-assets.js` | Generates packaged plugin metadata from the canonical definition. |
| Runtime validation | `plugin/scripts/check-runtime-integrity.mjs` | Fails on Codex/canonical default-prompt drift. |
| Package validation | `create-agdf/scripts/smoke-test.js`, `create-agdf/package.json` | Verifies generated package structure and package routing/smoke behavior. |

## Current Coverage

- `fully_done`: canonical ownership, manifest equality check, generated-surface sync and package smoke coverage.
- `partially_done`: onboarding suitability guidance exists only as conversation wording; it is not exposed as a default prompt.
- `not_done`: first-position default prompt for suitability assessment.

## Reuse Strategy

- strategy: `extend`
- reuse: existing canonical `defaultPrompt` array and generated sync path.
- new artefacts: no new runtime owner, skill, gate rule, control template or evaluator.
- parallel-structure risk: low if only the canonical list is changed and generated surfaces are synchronized; high if manifests are edited independently.

## Impact Assessment

- files/modules: canonical plugin definition, Codex manifest and generated package metadata.
- interfaces: visible plugin onboarding prompt list only.
- data model/migrations: none.
- backwards compatibility: existing prompts remain available; ordering changes the first suggested interaction.
- regression tests: runtime-integrity and `create-agdf` smoke tests remain applicable; no new test framework is needed unless the exact first prompt is not covered by existing equality checks.
- side effects: the first suggested user action becomes an assessment rather than immediate governance initiation.

## SoT And Product-Semantics Findings

The change is intentionally user-visible product semantics, not a documentation-only edit. The prompt must remain advisory and must not grant gate or implementation authority. The runtime contract and gate model remain unchanged.

## Context Graph Impact

- context_graph_impact: `none`
- rationale: the wording is run-specific onboarding copy and does not introduce a reusable architecture decision, invariant, risk rule or source-of-truth relationship.

## Transparency

`structured_slice` is selected because the change is small and bounded but touches normative `plugin/meta/**` and generated plugin surfaces, which are outside the fail-closed trivial-change boundary. A focused PRD is required before implementation; full SD/TP depth should be reassessed after PRD based on the final acceptance criteria.

## Missing Evidence

- No blocker for PRD drafting.
- Exact first-prompt placement and wording must be fixed in the PRD before implementation.

## Required Next Step

Draft the focused PRD for the onboarding default-prompt slice. Do not edit plugin manifests or generated assets yet.
