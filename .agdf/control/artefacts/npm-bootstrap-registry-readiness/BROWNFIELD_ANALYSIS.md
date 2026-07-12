# Brownfield Analysis: Reliable npm Bootstrap Readiness

## Analysis Meta

- mode: pre_implementation_analysis
- decision: pass
- derived_from: `.agdf/control/artefacts/npm-bootstrap-registry-readiness/TP.md`
- scope: `npm-bootstrap-registry-readiness`
- owner: agent

## Reuse Path

The approved implementation can extend existing owners without introducing parallel structures:

1. `.github/workflows/publish-agdf.yml` remains the sole release sequencing and registry-readiness owner.
2. `create-agdf/scripts/smoke-test.js` remains the package-level workflow and command-contract test owner.
3. Existing `mkdtempSync`, fake executables, isolated target directories, and cleanup patterns in
   `create-agdf/scripts/smoke-test.js` provide the fixture conventions for clean bootstrap evidence.
4. `create-agdf/bin/create-agdf.js` remains the public command-string owner.
5. `create-agdf/scripts/sync-package-assets.js` and `plugin/scripts/check-runtime-integrity.mjs`
   remain the generated-asset and cross-surface consistency owners.

No new package, command registry, installer, or registry service is justified.

## Existing-System Findings

| Concern | Finding | Implementation implication |
|---|---|---|
| Package coupling | `@agdf/cli` depends on matching `create-agdf`; tag/version checks already enforce coupling. | Preserve the existing version and publication order. |
| Release readiness | Exact-version polling exists twice in the workflow and is asserted by package smoke tests. | Refactor carefully; retain bounded retries and clear output, then add `latest` verification. |
| Test isolation | Smoke tests already use temporary directories and fake Codex/Claude executables. | Reuse those helpers and isolate HOME/npm cache for registry bootstrap evidence. |
| Command ownership | Public preferred CLI commands are emitted by `create-agdf/bin/create-agdf.js`; documentation repeats them in several surfaces. | Add contract assertions; do not create a second source of truth. |
| Generated output | Package assets are synchronized by `sync-package-assets.js`; runtime integrity validates package and plugin relationships. | Change authoritative sources only and run synchronization checks. |
| Current worktree | Only the new AGDF artefact directory is untracked; no overlapping product-code edits are present. | Implementation can proceed without dirty-worktree collision after the next gate. |

## Coverage Before Implementation

- Publication order: fully covered.
- Exact-version readiness: fully covered, but duplicated.
- `latest` dist-tag verification: not covered explicitly.
- Clean npm-client bootstrap: not covered.
- Command immutability across all public references: partially covered.
- Real-user configuration safety: existing local fixture patterns are strong; registry bootstrap
  needs explicit disposable HOME/cache enforcement.

## Interfaces And Regression Risk

- Public CLI command strings are compatibility-sensitive and must remain unchanged.
- Release workflow output is consumed by maintainers/CI only; failure wording can be improved but
  must identify package, expected version, observed result, and phase.
- The clean-client smoke test must not invoke real Codex, Claude, Copilot, or OpenCode configuration.
- No data model, persistence, gate, package-name, or migration impact exists.

## Minimal Clean Implementation Path

1. Extract or consolidate the existing workflow readiness function without changing its observable
   bounded behavior.
2. Add an explicit `latest` assertion for `@agdf/cli`.
3. Add one isolated clean-client bootstrap fixture using existing test helpers and fake surfaces.
4. Add command-contract assertions over authoritative/generated/documented surfaces.
5. Run synchronization, package, runtime, and diff validation.

## Risks And Guards

- npm/CDN propagation remains external; readiness evidence must be bounded and must not claim control
  over arbitrary stale local caches.
- A clean-client test can become flaky if it relies on interactive tools; use deterministic fake
  surface executables and disposable paths.
- Repeated command references can drift; assertions must fail on extra flags or alternate syntax.
- Workflow refactoring can accidentally remove the dependency ordering; source-level ordering tests
  remain mandatory.

## Context Graph Impact

- context_graph_impact: no_new_node
- rationale: the existing package-readiness invariant is being hardened; no new reusable product or
  architecture invariant is established beyond the already approved scope.

## Implementation Readiness

Pass. Existing owners, fixtures, compatibility boundaries, and validation paths are understood.
The next permitted action is `CD+Tests` for TP tasks NBR-01 through NBR-08. Do not change the public
bootstrap command syntax.
