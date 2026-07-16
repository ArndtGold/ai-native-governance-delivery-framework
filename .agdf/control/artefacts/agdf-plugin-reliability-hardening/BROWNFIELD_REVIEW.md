# Brownfield Review: Installed Plugin Runtime-Integrity Verification

Status: pass
Mode: post_ur_review
Date: 2026-07-16
Owner: agent

## Decision

- mode_slice_decision: structured_slice
- required_next_gate: PRD
- scope_reason: The defect is technically bounded, but the checker is a release guard and currently
  combines plugin-owned invariants with repository-only package, Pages, marketplace and active-run
  invariants. Correcting layout discovery therefore changes release-validation behavior across two
  ownership modes and needs an explicit small contract before implementation.
- evidence: `plugin/scripts/check-runtime-integrity.mjs` lines 5-43 and 197-220;
  `create-agdf/scripts/runtime-integrity-negative-test.js`; `create-agdf/package.json` smoke chain;
  `.github/workflows/agdf-guardrails.yml`; `.github/workflows/publish-agdf.yml`; installed 0.9.0
  cache reproduction.

## Existing-System Findings

- current_coverage: partially_done
- reuse_strategy: refactor
- canonical_owner: `plugin/scripts/check-runtime-integrity.mjs`
- test_owner: `create-agdf/scripts/runtime-integrity-negative-test.js` plus one focused
  installed-layout regression owner wired into the existing smoke chain
- release_owners: `.github/workflows/agdf-guardrails.yml` and `.github/workflows/publish-agdf.yml`

The checker already validates the complete canonical plugin surface. The failure comes from layout
resolution, not missing invariant coverage. Its current `repoRoot` is actually the plugin root when
derived from `import.meta.url`, after which the code appends another `plugin/` segment. Source mode
works only because execution happens in a checkout whose expected root is reconstructed by the old
relative assumption.

Repository-only checks include the root marketplace, npm package manifests, Pages data, asset-sync
implementation, CLI implementation, root-license parity and active repository control state.
Plugin-owned checks include manifests, metadata/contracts, locale registry, router, hooks, assets,
skills and control templates. Installed mode must validate the latter without pretending that
repository-only owners were shipped.

## Impact And Compatibility

- files/modules: runtime-integrity script, focused regression test, package smoke wiring, and only
  minimal documentation if needed to define override semantics
- interfaces: `AGDF_RUNTIME_INTEGRITY_ROOT` remains supported; it must accept either a repository
  root or a plugin root and reject partial/ambiguous layouts
- data_model_or_migration: none
- backwards_compatibility: existing source-tree command and failure messages must remain valid
  unless a clearer layout-resolution error is required
- regression_tests: source-mode pass, installed-mode pass, installed-mode missing invariant fail,
  source negative fixtures, full package smoke
- side_effects: none outside temporary test directories

## Risks

- Silently skipping repository-only checks in source mode would weaken release protection.
- Requiring repository-only files in installed mode would preserve the current false failure.
- Maintaining a second fixture copy would create a parallel plugin source; tests must stage the
  canonical `plugin/` tree dynamically.
- `verified_change` is not eligible because the change affects release-validation behavior.

## Context Graph And Knowledge Persistence

- context_graph_impact: link_only
- context_graph_refs: `CG-AGDF-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: link
- context_graph_gate_effect: warning
- memory_target: scope_artifact
- memory_reason: Layout-mode evidence and the source-only/plugin-owned split are specific to this
  implementation slice until QA proves a reusable invariant.
- memory_refs: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/BROWNFIELD_REVIEW.md`

## Transparency

Quick Task was rejected because this checker is part of release validation and the fix crosses
plugin-owned and repository-only validation boundaries. Verified Change was rejected because its
contract excludes release-behavior impact. A compact Structured Slice is sufficient: the expected
behavior is clear, no product semantics or architecture redesign is needed, and the existing owner
and test paths can be extended without a parallel validator.

## Required Next Step

Draft and approve a compact PRD defining layout detection, invariant ownership and regression
evidence. Do not implement before the later SD and TP gates are satisfied.
