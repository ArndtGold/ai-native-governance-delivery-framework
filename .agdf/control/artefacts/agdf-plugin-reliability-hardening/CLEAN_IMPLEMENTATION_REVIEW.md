# Clean Implementation Review: Dual-Layout Runtime-Integrity Validation

Status: pass
Date: 2026-07-16
Owner: agent

## Decision

- decision: pass
- primary_solution: Correct the root cause by resolving the script's real plugin root, classify one
  supported layout, and condition only repository-owned checks on source mode.
- evidence: canonical checker diff; focused staged-layout tests; retained source negative suite;
  aggregate smoke pass
- fallbacks_retained: none
- workaround_or_shim_risk: none; the environment override uses the same classifier and cannot force
  a permissive mode
- parallel_structure_risk: none; no second validator or persisted fixture copy exists
- brownfield_fit: pass; existing assertion helpers, canonical definition and smoke chain remain the
  owners
- missing_evidence: none before QA
- required_next_step: mandatory Code Review, then QA Gate

The `sourceMode` branch is an ownership boundary, not a fallback: plugin-owned invariants always run,
while repository-only checks run only where their authoritative files exist. Partial and ambiguous
layouts fail before traversal.
