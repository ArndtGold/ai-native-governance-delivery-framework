# Brownfield Review

## Review Meta

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- workstream: `agdf-onboarding-fit-readme-clarity`
- related_ur: `.agdf/control/artefacts/agdf-onboarding-fit-readme-clarity/UR.md`

## Scope

Make the existing AGDF suitability assessment both more proportionate and more discoverable: add one focused root-README entry before setup guidance, and refine the already-present first Codex default prompt. The work must preserve the canonical metadata owner and the existing generated-surface propagation path.

## Existing Owners And Evidence

| Owner | Existing artefact | Finding |
|---|---|---|
| Public project entry point | `README.md` | Owns the German-first project introduction; `In einem Satz` is followed directly by `Status`, so no visible fit-decision entry exists yet. |
| Canonical plugin metadata | `plugin/meta/agdf-plugin.definition.json` | Owns the first Codex `defaultPrompt`; it already requests purpose, practical value, governance overhead, risk fit and a smallest suitable path. |
| Codex plugin surface | `plugin/.codex-plugin/plugin.json` | Mirrors the canonical default-prompt list exactly. |
| Package propagation | `create-agdf/scripts/sync-package-assets.js` | Generates package surfaces from canonical plugin metadata. |
| Drift validation | `plugin/scripts/check-runtime-integrity.mjs` | Fails when the Codex manifest and canonical default-prompt list differ. |
| Prior delivery | `artefacts/agdf-onboarding-fit-default-prompt/OR.md` | Delivered the first suitability prompt but intentionally did not add a README entry or an explicit proportionate opt-out recommendation. |

## Current Coverage

- `fully_done`: canonical prompt ownership, derived manifest synchronization, drift validation, package propagation, and advisory fit assessment as the first default prompt.
- `partially_done`: the default prompt covers overhead and risk fit, but does not explicitly permit a recommendation against AGDF where overhead outweighs value.
- `not_done`: an early, human-visible README entry that lets users assess fit before installation.

## Reuse Strategy

- strategy: `extend`
- reuse: the root README as the public decision entry point; the canonical `defaultPrompt` array and its existing sync/validation path for runtime wording.
- new runtime owner: none.
- parallel-structure risk: high if the prompt becomes independently maintained in README, manifest and generated surfaces. Mitigate by presenting the README text as explanatory/copyable onboarding content and retaining canonical runtime wording only in `agdf-plugin.definition.json`.

## Impact Assessment

- files/modules: `README.md`, canonical plugin definition, Codex manifest, generated package metadata.
- interfaces: first visible project-decision guidance and first suggested Codex interaction.
- data model/migrations: none.
- backwards compatibility: existing default prompts remain available in their present relative order after the first prompt; README additions do not alter commands.
- regression tests: documentation link/structure review, runtime integrity, generated-surface synchronization and package smoke coverage.
- side effects: users may deliberately choose a lighter path or decline AGDF; this is the intended honest-onboarding behavior.

## SoT And Product-Semantics Findings

This is a user-visible product-semantics change, not merely a documentation edit: it deliberately reframes the suggested first interaction from generic suitability to a proportionate decision that may decline AGDF. The existing gate model remains authoritative; neither the README nor the prompt can grant implementation authority.

## Context Graph Impact

- context_graph_impact: `none`
- rationale: this refines onboarding wording and discoverability without adding a reusable architecture decision, new invariant or source-of-truth relationship.

## Transparency

`structured_slice` is the smallest safe path. The documentation addition alone would be a quick task, but the same scope intentionally changes canonical, user-visible plugin metadata and generated package surfaces. Those normative paths require focused PRD/SD/TP treatment; a full delivery is not proportionate because no runtime behavior, data model, command or gate semantics change.

## Missing Evidence

- No blocker for PRD drafting.
- The PRD must settle the exact English runtime wording and the concise German README framing, including how the README avoids becoming a second runtime source of truth.

## Required Next Step

Draft the focused PRD for this onboarding-clarity slice. Do not edit README, plugin metadata or generated assets before `Approval: PRD`.
