# Brownfield Review: OpenCode Version Transparency

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/opencode-version-transparency/BROWNFIELD_REVIEW.md`
- scope: Extend the existing OpenCode installer/status path so human and JSON output expose installed, expected and transition-aware AGDF package version information.
- evidence:
  - `create-agdf/bin/create-agdf.js` owns `installOpenCodeGlobalPlugin()`, `resolveOpenCodePackage()`, `evaluateOpenCodeStatus()` and `printOpenCodeStatus()`.
  - `plugin/meta/agdf-plugin.definition.json` already owns the canonical expected package version.
  - `create-agdf/package.json` and the installed global package are currently `0.6.9`; the current CLI output exposes only the resolved path.
  - Existing Codex/Claude bootstrap paths already implement version verification and mismatch messaging that can provide reusable wording and test conventions.
  - `create-agdf/scripts/smoke-test.js` already contains isolated OpenCode install/status coverage and is the correct regression owner.
- transparency: A PRD is required because this changes a user-visible CLI status contract and adds additive machine-readable version fields; no SD/TP or implementation is justified before the exact compatibility and transition semantics are approved.
- missing_evidence: The precise previous-version retention mechanism and stale-package fixture shape must be decided in PRD/SD; current runtime evidence proves only the present package path/version.
- current_coverage: `partially_done` for package loadability/path reporting; `not_done` for installed-vs-expected version output, mismatch classification and transition reporting.
- reuse_strategy: `extend` the existing package resolver, installer return value, status report and OpenCode smoke fixtures; reuse canonical plugin definition and existing Codex/Claude version-verification helpers/wording where compatible.
- risks:
  - JSON schema-v1 compatibility requires additive fields only.
  - The previous version may be unavailable after an external package replacement; output must report `unknown` rather than infer a transition.
  - Version reporting must not conflate CLI version, plugin package version and active session signal.
  - No second version source or global state file should be introduced without explicit product justification.
- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install status and package-loadability invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`
- required_next_step: Draft PRD for version fields, mismatch/transition semantics and additive status compatibility.

