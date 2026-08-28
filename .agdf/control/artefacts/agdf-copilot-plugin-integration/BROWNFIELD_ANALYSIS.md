# Brownfield Analysis: Installable AGDF Plugin for GitHub Copilot

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md`

## Scope

Verify that the approved CPI-T01 through CPI-T15 implementation can extend existing AGDF plugin,
generation, runtime, consent, lifecycle, validation and documentation owners without creating a
parallel Copilot product or authority path.

## Evidence

- `plugin/meta/agdf-plugin.definition.json` already owns cross-surface identity, version, Copilot
  prefix, interaction semantics and automatic-runtime-check capability metadata.
- `create-agdf/lib/public-plugin/manifest.js` already renders canonical Codex and Claude manifests
  and is the clean owner for a third host projection.
- `create-agdf/scripts/sync-package-assets.js` already generates prefixed Copilot repository skills,
  rewrites shared contract paths, stages the complete shared plugin and owns release-built assets.
- `create-agdf/scripts/sync-plugin-runtime.js` already builds the exact-version local validator and a
  content-bound, read-only session check.
- `create-agdf/lib/runtime-check-consent/**` already owns capability identity, receipts, disclosure,
  manual mode, renewal and execution state for supported hosts.
- `create-agdf/lib/installers/plugin-installers.js`, `create-agdf/lib/lifecycle/**` and
  `create-agdf/scripts/install-local-plugin.js` already separate host adapters, lifecycle semantics,
  generated-source preparation and user-visible results.
- Existing manifest, package-content, routing, runtime, consent, lifecycle, installer, smoke and
  Runtime Integrity suites cover the owners that must be extended.
- The installed macOS GitHub Copilot app is an evidence surface only. No callable `copilot`
  executable is currently available on PATH, so CLI behavior cannot be inferred from the app.
- Pre-existing changes under `.agdf/control/artefacts/agdf-product-maturity-roadmap/` are unrelated
  and excluded.

## Current Coverage

| area | coverage | evidence |
|---|---|---|
| Copilot repository skills and routing | `fully_done` for repository bootstrap, `partially_done` for plugin packaging | Existing `.github/skills/agdf-*` generation and routing tests; no root Copilot plugin manifest. |
| Shared plugin bundle | `partially_done` | Complete Codex and Claude release-built bundle already contains canonical skills, contracts and runtime. |
| Copilot manifest and host adapter | `not_done` | No root `plugin.json`, Copilot-specific hook, lifecycle adapter or local-install command exists. |
| Exact runtime and provenance | `fully_done` as shared mechanism, `partially_done` for Copilot surface | Packaged validator and provenance exist; surface vocabularies exclude `copilot`. |
| Consent-bound session check | `fully_done` as shared mechanism, `partially_done` for Copilot surface | Content-bound receipt and no-op default exist; surface and hook schema need extension. |
| Repository preservation and precedence | `partially_done` | Bootstrap merge rules exist; plugin collision and uninstall observations are not yet covered. |
| Direct host evidence | `not_done` | App installation and fresh-session behavior remain unverified. |

## Reuse Strategy

- `extend` the canonical plugin definition and manifest renderer.
- `extend` the existing Copilot skill transform into the shared generated plugin root.
- `extend` the runtime and consent surface vocabularies without changing their schemas or authority.
- `extend` the plugin installer and shared lifecycle model through a focused Copilot adapter.
- `reuse` existing release preparation, provenance, Runtime Integrity, status presentation and
  repository scaffold tests.
- `new` only for the Copilot root manifest renderer, Copilot hook projection, focused host adapter
  and their direct tests.

No existing owner needs replacement or broad refactoring before implementation.

## Impact And Compatibility

- Canonical source changes affect plugin metadata, generator, runtime consent and lifecycle modules.
- Generated changes affect the shared plugin bundle and documentation projections.
- No data model or repository migration is required. Receipt schema version remains `1`; adding a
  recognized surface is backwards compatible with existing receipts.
- Existing Codex and Claude manifest discovery must be regression-tested because the shared bundle
  gains a root manifest that Copilot prefers.
- Existing OpenCode behavior must remain unchanged.
- Host install and status output parsing is compatibility-sensitive and must fail closed when the
  documented shape is unavailable or changes.

## Parallel Structure Risk

The main risk is a second Copilot-only bundle, installer state model, runtime or approval adapter.
The approved design avoids this by adding only projections and a focused host transport to the
existing owners. Implementation must stop if it requires a separate version, consent store,
repository activation rule or gate path.

## SoT And Product Semantics Drift

The earlier repository-only Copilot assumption is stale against the approved PRD and current
official plugin contract. The approved PRD and SD now own the intended product behavior. Source and
documentation must be updated together. No unresolved product decision remains for the initial
skills, validator, lifecycle, exact-text and optional-hook scope.

## Visible State Ownership

- Copilot owns installed, enabled, managed and loaded-session state.
- AGDF lifecycle presentation owns expected version, package verification, evidence plane and one
  recovery action.
- `.agdf/control/` owns selected run, gate and approval state.
- Manual app handoff must remain visibly unverified until direct rendered observation.

## Risks

- Root-manifest precedence could affect existing hosts if they inspect the same field unexpectedly.
- Copilot app support may differ from CLI documentation.
- `${PLUGIN_ROOT}` hook expansion and command output require executed proof.
- Missing CLI, Linux and native Windows environments limit support claims but do not force a second
  implementation path.

All risks have deterministic regressions, fail-closed states or explicit evidence obligations.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-TASK-TARGET-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Existing nodes own distribution evidence, approval authority, target
  authority and status projection. CPI-T15 will re-evaluate whether verified Copilot lifecycle
  behavior requires a curated update rather than a new parallel node.

## Required Next Step

Implement CPI-T01 through CPI-T15 through the identified existing owners, starting with canonical
metadata and generation, then runtime and consent, lifecycle integration, deterministic validation,
documentation and direct host evidence. Keep publication, VCS and unsupported-host claims excluded.
