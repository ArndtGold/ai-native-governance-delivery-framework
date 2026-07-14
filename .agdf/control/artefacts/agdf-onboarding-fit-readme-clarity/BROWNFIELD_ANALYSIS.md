# Brownfield Analysis

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- artefact: `.agdf/control/artefacts/agdf-onboarding-fit-readme-clarity/BROWNFIELD_ANALYSIS.md`
- related_tp: `.agdf/control/artefacts/agdf-onboarding-fit-readme-clarity/TP.md`

## Scope And Existing Owners

| Area | Verified owner / insertion point | Result |
|---|---|---|
| Human onboarding | `README.md` → `## Runtime und Setup` → `### AGDF als Plugin mit einem Coding Agent anwenden` | The current installation-reference paragraph directly follows the subsection heading; inserting the new fourth-level fit heading before it is clean and does not alter conceptual sections or commands. |
| Runtime prompt | `plugin/meta/agdf-plugin.definition.json` → `codex.defaultPrompt[0]` | The current suitability prompt is the sole canonical runtime wording and has the expected first position. |
| Derived Codex manifest | `plugin/.codex-plugin/plugin.json` | Its prompt list presently matches the canonical definition. |
| Propagation path | `create-agdf/scripts/sync-package-assets.js` | Existing generated-surface path is available; no new generator, script or owner is required. |
| Drift protection | `plugin/scripts/check-runtime-integrity.mjs` | Existing exact-list comparison protects the manifest/canonical relationship. |

## Current Coverage

- `fully_done`: established README runtime/setup region, canonical runtime metadata owner, derived-manifest relationship, synchronization path and runtime-integrity validation.
- `partially_done`: first prompt assesses suitability but lacks the explicit disproportionate/no-AGDF result; README lacks human-visible fit guidance at the plugin-use entry point.
- `not_done`: approved README subsection and refined canonical first prompt.

## Reuse Strategy

- strategy: `extend`
- primary path: add the bounded README subsection, edit only `codex.defaultPrompt[0]` in the canonical definition, then run the existing sync script.
- rejected path: hand-editing `plugin/.codex-plugin/plugin.json` or generated assets. It would create drift and a second writable owner.
- rejected path: creating a new documentation page or installation branch. It would fragment the first-contact flow without need.

## Regression And Compatibility Assessment

- interfaces: README structure and first suggested Codex interaction only.
- backwards compatibility: prompts two through four remain present and ordered; commands, installation links and runtime behavior remain unchanged.
- data/persistence/migration: none.
- test impact: existing runtime-integrity and package smoke checks cover the metadata propagation; targeted text/JSON inspection covers wording and placement.
- UI/state ownership: not applicable; this change has no interactive UI state, renderer, recovery or hook ownership.
- parallel-structure risk: controlled by canonical-only runtime edit and deterministic synchronization.

## SoT, Context Graph And Risk

- source_of_truth: `plugin/meta/agdf-plugin.definition.json` for runtime wording; `README.md` for human onboarding context.
- product_semantics: the advisory first prompt now explicitly permits a no-AGDF recommendation. It does not grant gates or implementation authority.
- context_graph_impact: `none`; no reusable architecture/policy/ownership relationship changes.
- remaining risk: wording may be misread as an implementation approval. Mitigation is the explicit `before proposing any implementation` boundary and unchanged gate model.

## Required Next Step

Proceed with approved TP tasks AFC-01 through AFC-06 in CD+Tests. Do not claim QA or request UAT until the implementation and required reviews are complete.
