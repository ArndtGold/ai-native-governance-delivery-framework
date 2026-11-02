# Brownfield Review: Fresh-Checkout Local Plugin Install Fix

- mode: post_ur_review
- decision: pass
- mode_slice_decision: verified_change
- required_next_gate: none
- date: 2026-08-26
- run_id: install-scripts-fresh-checkout-fix

## Scope

Fix the module-load-order defect in `create-agdf/scripts/install-local-plugin.js` so that `npm run install:<surface>` works on a checkout without `create-agdf/generated/`. No installer semantics, marketplace format, CLI surface or product behavior changes.

## UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: CLI startup failure path only; no user-visible product surface, rendering or state ownership is touched.
- ux_intent_definition_required: not_applicable

## Current Coverage

| Concern | Status | Evidence |
|---|---|---|
| Local install entry point | fully_done (but defective on fresh checkouts) | `create-agdf/scripts/install-local-plugin.js`, delivered by run `agdf-local-plugin-install-scripts` |
| Generation of `generated/` | fully_done | `release:prepare` → `sync-package-assets.js`, reads only `plugin/meta/` sources; standalone-viable |
| Fresh-checkout regression coverage | not_done | `test:local-development-install` chains `release:prepare` first, so the fresh-checkout load path is never exercised |

## Root Cause And Owners

- `install-local-plugin.js:7-8` imports `runCli` (→ `application.js:35` → `runtime-context.js`) and `pluginDefinition` eagerly; `install-local-plugin.js:9-14` imports `local-marketplace.js`, which also imports `runtime-context.js` (line 13).
- `runtime-context.js:18` executes `readFileSync` on `generated/plugins/agdf/meta/agdf-plugin.definition.json` during module evaluation.
- `generated/` is gitignored (`.gitignore:29`) and produced only by the `release:prepare` step that `installLocalPlugin()` runs at `install-local-plugin.js:34-35` — unreachable because the module graph crashes first.
- `local-development.js` imports only node builtins and is not part of the defect chain.

## Reuse Strategy

- strategy: refactor (load order only), single owner retained
- Keep `runtime-context.js` eager for all other consumers (wide blast radius if made lazy; ~15 importers across `lib/` and `scripts/`).
- In `install-local-plugin.js`, keep only node-builtin imports at top level and load the AGDF-lib modules (`application.js`, `runtime-context.js`, `local-marketplace.js`, `local-development.js`) via dynamic `await import()` inside `installLocalPlugin()` after the `release:prepare` exec has completed.
- Extend the existing installer test owner with one focused regression: import/spawn the script module with `generated/` absent and assert it does not throw at load; importing is side-effect-free because main only runs when `argv[1]` matches the module path (`install-local-plugin.js:61-62`).

## Parallel-Structure Risk

None. No second installer, no second definition loader, no second prepare path. The fix moves existing imports later in time within the same owner.

## SoT / Runtime / Product-Semantics Drift

None. The documented contract ("one command installs from source") is restored, not changed. Prior run's QA/UAT evidence remains valid for the built-checkout path; its fresh-checkout gap is named, not rewritten.

## Risks

- Dynamic imports change error timing: syntax errors in lib modules would now surface after `release:prepare` runs. Acceptable; `release:prepare` is idempotent.
- Test consumers (`local-development-install-test.js`) import `installLocalPlugin` top-level; they run post-prepare and stay valid.

## Mode/Slice Decision

- decision: verified_change
- scope_reason: `bounded_regression_fix`; one file's load order plus one focused regression test, no product-semantics or interface change, single retained owner, locally reversible and independently verifiable through the existing test suite. Quick Task cannot carry the required regression evidence; PRD/SD/TP depth has no trigger (no new scope, no cross-surface semantic change).
- evidence: direct ENOENT reproduction (2026-08-26); import-chain analysis above; `sync-package-assets.js` source-only reads; existing test chain ordering in `create-agdf/package.json`.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required_action: note the load-order boundary (installer entry points must not eagerly import generated-definition consumers) at closeout.
- gate_effect: none

## Required Next Step

Execute the Verified Change: defer the four lib imports in `install-local-plugin.js` until after `release:prepare`, add the fresh-checkout load regression, run the relevant test suites, and record `VERIFIED_CHANGE.md`.
