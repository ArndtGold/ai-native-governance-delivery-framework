# Clean Implementation Review: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`

## Clean Implementation Review

- decision: `pass`
- primary_solution: Extend the existing lifecycle service through one validated profile/result contract, one closed adapter registry, four native leaves and the existing package/provenance owner. Keep `create-agdf/lib/skill-dispatch/contract.js` as the sole semantic function owner and share one exact runtime per project or user scope.
- evidence: The final diff follows the Brownfield dependency direction. Adapters return native facts and transactions but do not own semantic dispatch, package acquisition or localization. `mcp-lifecycle-test.js` proves source conformance, precedence, shared references, legacy migration, every transaction fault phase and reverse rollback. The final serial smoke suite passes with the server contract and package boundaries unchanged.
- fallbacks_retained: The version-matched CLI dispatch path is a visible, non-automatic compatible path required by the PRD. The `host-config.js` facade is retained for release compatibility and can exit after consumers use the registry contract in a future breaking release. Exact legacy runtime migration is retained for the compatibility window and can exit only after supported installations no longer contain schema-v1 surface roots.
- workaround_or_shim_risk: `low`. The compatibility facade delegates to the canonical registry and has no independent policy. Legacy migration recognizes exact owned markers and does not scan or maintain a second active runtime model. No fallback executes silently.
- parallel_structure_risk: `none evident`. There is one service, one profile owner, one result/presentation owner, one package/ref owner and one semantic function owner. Plugin installation and MCP lifecycle remain separate on purpose and neither duplicates the other.
- brownfield_fit: `pass`. Existing CLI, lifecycle, package, locale, installer and server owners were extended in place. The Copilot profile generator was corrected at its ownership root by synchronizing and pruning computed entries rather than masking conflict-named files in the payload validator.
- missing_evidence: Direct qualification is incomplete for all four exact host tuples, and the server package is unpublished. These are explicit evidence and release boundaries, not solution-integrity defects.
- required_next_step: Supply this pass result to `qa-gate`; preserve the compatibility facade and legacy migration exit conditions in the Context Graph until a separately approved removal.

No normalized finding remains open.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The node records the canonical owners, compatibility boundaries, exact host evidence and release conditions.
