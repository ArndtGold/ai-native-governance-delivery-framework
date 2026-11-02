# Brownfield Analysis: Canonical Scope Classification Card

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: `done`

## Run

- run_id: agdf-scope-classification-card
- related_tp: `.agdf/control/artefacts/agdf-scope-classification-card/TP.md` (approved 2026-07-21)
- current_gate: Brownfield Analysis
- reviewer: agent
- reviewed_at: 2026-07-21

## Objective

Verify the reuse path, owners and regression risk for implementing tasks T1–T9 before CD+Tests.

## Existing-System View

| Area | Existing owner | Evidence | Impact |
|---|---|---|---|
| Renderer | `renderOperationalStatusCard` in `create-agdf/lib/interaction-presentation.js:299-348` — validates with `plainObject`, resolves locale, builds rows, returns frozen `{ schema_version, semantic_block, run_id, revision_id, current_gate, presentation_language, markdown, authorizes: false }`, `null` on invalid input | Read 2026-07-21 | `low` — `renderScopeClassificationCard` mirrors the pattern exactly |
| Locale parity | `validateLocaleRegistry` (`interaction-presentation.js:49-65`) derives the baseline from `flattenKeys(locales.en)` and deep-compares each pack | Read 2026-07-21 | `low` — adding `primary.scopeClassification.*` to `en` and `de` with identical key structure preserves parity automatically |
| Test fixture | `interaction-presentation-test.js` imports the **generated** registry `generated/plugins/agdf/meta/agdf-interaction-locales.json`, not the source | Read 2026-07-21 | `low` — T2 source edit + T8 sync feeds the test fixture; no parallel fixture |
| Integrity assertions | `check-runtime-integrity.mjs:373,899` asserts gate-check contains `` `status_presentation.markdown` verbatim `` and `Do not maintain or render a skill-local table template` | Read 2026-07-21 | `low` — T5 mirrors the assertion pattern for `scope_classification.markdown` |
| Generated surfaces | `sync-package-assets.js:24,289,320-339` reads the source locale registry and writes generated copies for Copilot/OpenCode with path rewrites | Read 2026-07-21 | `low` — T8 sync propagates; no hand-edits |
| Runtime packaging | `create-agdf/generated/plugins/agdf/runtime/runtime-manifest.json` carries a digest; `interaction-presentation.js` ships in the runtime subset (used by validation-handlers) | Read 2026-07-21 | `medium` — T8 must regenerate the digest; built-plugin integrity must pass |
| Eval corpus | `evals/cases`, `fixtures`, `observations`, `manifest` mechanics exercised 2026-07-21 (36 cases green) | Prior run evidence | `low` — T7 reuses the infrastructure |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Renderer must mirror `renderOperationalStatusCard`, not a new module | Single-owner contract; pattern read | `none` | T1 places `renderScopeClassificationCard` as an additive export in the existing owner |
| Locale section must reuse the derived baseline, not a hand-maintained parity file | `validateLocaleRegistry` derives from `en` | `none` | T2 adds mirrored `en`/`de` keys; no baseline file edit |
| Skill must not gain a second card template | Integrity pattern at lines 373/899 | `warn` | T4 consume-verbatim section; T5 asserts canonical reference + no local template |
| Runtime digest must regenerate or built-plugin integrity fails | `runtime-manifest.json` carries a digest | `revise` | T8 runs `sync-package-assets` (which regenerates the digest) before integrity |

## Mode / Slice Decision

- decision: `pass`
- mode_slice_decision: `structured_slice` (unchanged from Brownfield Review)
- required_next_gate: `CD+Tests`
- scope_reason: Reuse path is clean and bounded; additive export, additive registry section, additive assertions, additive tests, additive eval cases; no parallel structure; one real risk (runtime digest) is owned by T8.
- evidence: Existing-System View above; `renderOperationalStatusCard` source; `validateLocaleRegistry` source; sync and integrity patterns; eval corpus green run 2026-07-21.

## Current Coverage

- `fully_done`: locale parity mechanism, renderer pattern, integrity assertion pattern, sync propagation, eval infrastructure.
- `partially_done`: runtime digest regeneration (works via sync, but must be executed in T8).
- `not_done`: the additive renderer, registry section, contract section, skill section, assertions, tests, eval cases.

## Reuse Strategy

- `extend` `interaction-presentation.js` with `renderScopeClassificationCard`.
- `extend` the locale registry with `primary.scopeClassification.*`.
- `extend` `interaction.md`, `gate-check/SKILL.md`, `check-runtime-integrity.mjs`, `interaction-presentation-test.js`, `evals/cases/gate-check.json`.
- `new` only the scope-classification semantic block and its input contract.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Runtime digest not regenerated → built-plugin integrity fails | medium | T8 runs sync before integrity; CI catches |
| Prose-adjacent integrity assertion false positives | low | T5 uses presence-of-canonical-reference checks (lesson from `activation-diagnosis-determinism`) |
| Agent-side input drift over time | low | Validated input contract + fail-closed `null`; future CLI-side evaluation deferred (UR) |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: none
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: `link after UAT`
- context_graph_gate_effect: `none`
- context_graph_evidence: Candidate node for the "ungated scope classification is code-owned and non-authorizing" invariant; curated at closeout.

## Required Next Step

- required_next_step: Begin CD+Tests: implement T1–T9 in order, run unit tests, integrity, evals, sync, smoke and Pages checks; then CR.
