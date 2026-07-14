# Clean Implementation Review: Surface-Native AGDF Interactions

Status: done
Date: 2026-07-14

## Clean Implementation Review

- decision: `pass`
- primary_solution: Extend the canonical Runtime Contract and gate-check workflow, describe host adapters in canonical metadata, derive generated surfaces through the existing sync path, and keep existing control-state evaluation/persistence as the sole approval authority.
- evidence: No new service, UI, command, hook interceptor, response parser, persistence record or policy file was introduced. OpenCode changes reuse the existing permission map, global missing-only merge and repository fragment/protection paths. Positive/negative integrity, config fixtures, package smoke and idempotent generation pass.
- fallbacks_retained: Exact-text interaction is intentionally permanent compatibility behavior for unavailable, denied, unsafe-timeout or non-interactive native controls. It is the canonical backwards-compatible path, not a temporary workaround; it exits only for an individual interaction when a safe deliberate native question adapter is callable.
- workaround_or_shim_risk: low. The existing `gate_check_agent` OpenCode status alias and other unrelated compatibility behavior were not changed or expanded.
- parallel_structure_risk: none observed. Surface metadata is descriptive; normative semantics remain in Runtime Contract/gate-check and durable authority remains in selected run state.
- brownfield_fit: pass. All changes use the owners and fixture patterns identified by Brownfield Analysis, including non-destructive existing OpenCode configuration behavior.
- missing_evidence: interactive host UI probes are supporting and incomplete, but no solution-integrity decision depends on them.
- required_next_step: Proceed to mandatory Code Review, retaining the live-probe disclosure for QA.
