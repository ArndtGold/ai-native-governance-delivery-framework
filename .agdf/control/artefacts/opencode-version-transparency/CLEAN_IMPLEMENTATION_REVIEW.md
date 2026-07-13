# Clean Implementation Review: OpenCode Version Transparency

## Clean Implementation Review

- decision: `pass`
- primary_solution: Extend the existing OpenCode package resolver, status classifier and installer output; read installed version from the resolved package manifest and expected version from the canonical plugin definition.
- evidence: `create-agdf/bin/create-agdf.js`, `create-agdf/scripts/smoke-test.js`, `SD.md`, `BROWNFIELD_ANALYSIS.md` and `IMPLEMENTATION_EVIDENCE.md`.
- fallbacks_retained: The explicit `unknown` state for unreadable package metadata and operation-only unknown transition are bounded compatibility states, not alternate policy paths.
- workaround_or_shim_risk: Low. No persistent history, second package registry or version-specific special case was introduced.
- parallel_structure_risk: None. Expected version remains in `pluginDefinition.version`; installed version remains in the configured package manifest; the existing CLI remains the sole comparison/output owner.
- brownfield_fit: Pass. Existing command shape, package loadability semantics, schema-v1 fields, global skill surface, repository boundary and `instruction_only` classification are preserved.
- missing_evidence: None for this review; Code Review and QA remain separate decisions.
- required_next_step: `Code Review`

## Root-cause assessment

The visibility gap was caused by status reporting stopping at package path/loadability. The implementation adds version evidence at that existing owner and distinguishes current package state from the session signal. It does not infer version history after the fact and does not alter governance activation.

## Exit criteria

- one expected-version source and one installed-version source remain;
- unknown metadata is explicit and bounded;
- transition output is operation-only and never inferred when the previous version is unavailable;
- all version states are covered by isolated tests;
- Code Review is the next required step.

