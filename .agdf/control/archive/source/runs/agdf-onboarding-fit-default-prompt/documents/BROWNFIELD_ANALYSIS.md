# Pre-Implementation Brownfield Analysis

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- source: `.agdf/control/artefacts/agdf-onboarding-fit-default-prompt/TP.md`

## Reuse Path And Owners

The approved implementation has one clear source-of-truth path:

1. `plugin/meta/agdf-plugin.definition.json` owns the Codex default-prompt list.
2. `create-agdf/scripts/sync-package-assets.js` propagates the canonical plugin definition and plugin assets.
3. `plugin/.codex-plugin/plugin.json` is validated against the canonical definition by `plugin/scripts/check-runtime-integrity.mjs`.
4. `agdf` and `create-agdf` smoke tests validate the installed/package surfaces.

No new owner, file family, runtime branch or generated-manifest mechanism is needed.

## Current Coverage

- `fully_done`: runtime-integrity equality check for `defaultPrompt`; canonical-to-generated package sync; package smoke coverage; clean current diff boundary.
- `partially_done`: approved PRD, SD and TP exist; the implementation itself is not started.
- `not_done`: first-position prompt update and its synchronized outputs.

## Implementation Readiness

- exact prompt wording is fixed in PRD, SD and TP;
- existing prompts must remain unchanged and follow the new first entry;
- the sync command is the only permitted propagation path;
- no unresolved owner, compatibility, migration, security or product-semantics question remains within scope.

## Regression And Test Impact

- direct contract check: `node plugin/scripts/check-runtime-integrity.mjs`;
- package regression: `npm --prefix agdf run smoke-test`;
- generated/package regression: `npm --prefix create-agdf run smoke-test`;
- control-state validation: `npx --yes @agdf/cli@latest doctor --json`;
- scope/format validation: `git diff --check` and final diff inspection.

No test shape or assertion needs to change because existing checks already compare the complete default-prompt array and validate generated package surfaces.

## Parallel-Structure And Drift Review

- parallel source-of-truth risk: none if the canonical definition is edited first and generated outputs are synchronized;
- runtime-contract drift: none; no runtime rule changes;
- gate-semantics drift: none; the prompt is advisory and does not grant authority;
- generated-surface drift: mechanically detectable by runtime-integrity and smoke tests.

## Minimal Clean Implementation Path

Proceed with CD+Tests using only the approved metadata edit, existing sync script and listed validation commands. Do not change skills, hooks, runtime contract, control templates, evaluators or CLI behavior.

## Required Next Step

Begin `CD+Tests` for tasks OFP-01 through OFP-08. Any unexpected file ownership or behavior change requires stopping and routing back through Brownfield/Scope review.
