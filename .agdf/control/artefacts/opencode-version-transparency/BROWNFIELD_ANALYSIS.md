# Brownfield Analysis: OpenCode Version Transparency

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/opencode-version-transparency/BROWNFIELD_ANALYSIS.md`

## Scope

Verify the approved TP against the existing OpenCode package resolver, installer/status output, canonical plugin definition and smoke-test owners before implementation.

## Existing owners and reuse path

| TP tasks | Existing owner | Coverage before implementation | Action |
|---|---|---|---|
| OVT-01 | `resolveOpenCodePackage()` in `create-agdf/bin/create-agdf.js` | partially_done | Extend the existing resolver with safe package-manifest/version reading. |
| OVT-02 | `evaluateOpenCodeStatus()` and `pluginDefinition.version` | not_done | Add one canonical comparison/status classifier; preserve configured/loadable semantics. |
| OVT-03 | existing `package` JSON object in `evaluateOpenCodeStatus()` | not_done | Additive fields only; retain schema-v1 and session signals. |
| OVT-04 | `printOpenCodeStatus()` and `opencode` installer output | partially_done | Extend existing output lines; keep command shape and actionable next-step wording. |
| OVT-05 | `installOpenCodeGlobalPlugin()` | not_done | Capture pre-install package state and return an operation-only transition result. |
| OVT-06 | global surface installer/preflight and capability contract | fully_done as regression boundary | Do not alter global skill, repository boundary, ownership or `instruction_only` behavior. |
| OVT-07 | `create-agdf/scripts/smoke-test.js` | partially_done | Add isolated version fixtures without duplicating package resolution logic. |
| OVT-08 | package smoke, Pages check, runtime integrity, doctor and diff checks | partially_done | Re-run the existing aggregate validation chain and record evidence. |

## Runtime and source-of-truth evidence

- `plugin/meta/agdf-plugin.definition.json` and `create-agdf/package.json` currently report expected/package version `0.6.9`.
- The configured global package is loadable, but current status output exposes only `resolved_path`; installed version is not returned by `resolveOpenCodePackage()`.
- Existing Codex and Claude bootstrap code already contains version-verification and mismatch-message conventions; wording may be reused where it fits OpenCode without coupling surfaces.
- The OpenCode global installer already has a pre-install safety boundary for owned files; version capture must occur before npm mutation and must not weaken that boundary.

## Implementation path

- overall: `extend`
- resolver: read the installed package manifest associated with the already resolved package; do not import plugin code or create a second version registry;
- status: add a single deterministic version classifier and additive JSON fields;
- installer: capture previous state, run the existing install/surface flow, then capture the installed state for an operation-only transition;
- output: reuse one status rendering helper for installer and status commands;
- tests: use isolated temporary config/package fixtures and preserve existing global-surface tests.

## Change impact and regression risk

- `opencode-status --json` changes additively under `package`; existing fields and status meaning must remain compatible.
- Installer output gains information but no command or parameter changes.
- A package that loads but has malformed/missing metadata must be reported as `unknown`, not treated as absent.
- An external update may make the previous version unavailable; no transition may be inferred.
- No repository files, global skill names, permission rules, `.agdf/control/` state or capability classification change.
- No UI, persistence schema or cross-surface policy owner is affected.

## Parallel-structure and source-of-truth check

The implementation remains clean if the canonical definition owns the expected version, the installed package manifest owns the installed version, and the existing CLI owns comparison/output. No persistent version history, second package registry, plugin hook version policy or governance state is permitted.

## Test obligations

- current, outdated, unknown and unloadable version fixtures;
- previous/current/unchanged/unknown install transitions;
- additive JSON compatibility and human output wording;
- existing global skill completeness, ownership preflight, repository separation, preservation and `instruction_only` regression coverage;
- package smoke, aggregate CLI smoke, Pages check, runtime integrity, doctor and diff check.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- rationale: the change sharpens observable package status only and creates no reusable governance or enforcement knowledge.

## Minimal clean implementation path

Extend the existing resolver, status classifier, installer transition capture and smoke fixtures in place; synchronize no new surface; keep version evidence separate from session and governance state; then run the approved validation chain.

## Required next step

Proceed to `CD+Tests` for the approved TP.

