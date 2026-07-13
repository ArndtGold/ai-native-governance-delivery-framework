# Clean Implementation Review: Global Native OpenCode Surface

## Clean Implementation Review

- decision: `pass`
- primary_solution: Extend the existing `opencode` installer and status owner to generate global adapters from the canonical OpenCode skill assets, using the collision-safe `agdf-global-*` namespace.
- evidence: `create-agdf/bin/create-agdf.js`, `plugin/meta/agdf-plugin.definition.json`, synchronized generated assets, smoke tests, runtime-integrity checks, installed OpenCode probes and `IMPLEMENTATION_EVIDENCE.md`.
- fallbacks_retained: None as target architecture. The fail-closed boundary is the required safety behavior, not a fallback path.
- workaround_or_shim_risk: Low. The initial same-name design was rejected after runtime evidence showed global masking; `agdf-global-*` is now a canonical surface-definition rule that removes the collision by construction.
- parallel_structure_risk: None identified. No global `.agdf/control/`, second gate calculator, duplicate router policy or skill-body owner was introduced. `create-agdf/opencode-plugin.js` remains lifecycle/status/compaction-only.
- brownfield_fit: Pass. Existing command shape, config merge behavior, repository-local `.opencode/` surface, schema-v1 status fields, canonical skill sources and `instruction_only` capability classification are preserved.
- missing_evidence: None for this review. QA evidence and final code-review findings remain separate required gates.
- required_next_step: `Code Review`

## Root-cause assessment

The original asymmetry was caused by the global installer configuring only the npm plugin while native skills were generated only per repository. The implementation extends that installer and reuses canonical generated assets. It does not mask the asymmetry with status text or duplicate policy content.

## Exit criteria

- no avoidable fallback, retry, shim or parallel policy owner remains;
- global files are generated from canonical sources and protected by ownership markers;
- local repository control state remains authoritative;
- runtime collision behavior is handled by namespace separation;
- Code Review is the next required review before QA Gate.

