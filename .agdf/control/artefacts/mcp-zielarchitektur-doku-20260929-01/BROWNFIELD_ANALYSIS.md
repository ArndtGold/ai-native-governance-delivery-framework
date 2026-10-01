# Brownfield Analysis: Fachliche MCP-Schnittstellen als Zielbild

Status: complete
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Decision: pass
Based on: approved TP, revision 13
Date: 2026-09-29
Reviewer: Codex

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/mcp-zielarchitektur-doku-20260929-01/BROWNFIELD_ANALYSIS.md`
- scope: TP T-001 through T-004; one additive German proposal document under `docs/architecture/` and one navigation link. No executable code, contracts, schema, policy, persisted runtime state, host configuration, or release behavior is in scope.
- evidence: `docs/architecture/README.md` already explains the host/AGDF boundary and current tool owners, while naming its dated baseline as 2026-09-09 and explicitly separating repository source from release and loaded-host behavior. `create-agdf/lib/skill-dispatch/contract.js` owns the sole `agdf_dispatch` definition. `create-agdf/lib/control-inspect/contract.js` and `selection.js` own read-only `agdf_inspect` operations and selection rules. `create-agdf/lib/mcp-dispatch-runtime.js` composes these contracts, and `agdf-mcp-server/src/server.js` registers the supplied definitions without adding domain policy. `create-agdf/lib/control-evaluation/` and `create-agdf/lib/control-state/` remain owners of evaluation and run state. `.agdf/control/CONTEXT_GRAPH.md` already contains `CG-MCP-DISPATCH-ADAPTER` with matching boundaries and risks.
- transparency: Repository contracts and implementation are the evidence for current source behavior; the dated overview, package release status, and any loaded host are distinct evidence lanes. This analysis does not infer live-host discovery or qualify a release. Existing unrelated dirty and untracked control files were present before this implementation step; preserve them and keep the product diff to the two approved documentation paths.
- missing_evidence: No live-host observation is required by the approved TP. If the proposal needs to claim released or loaded-host behavior, that evidence is absent and the claim must remain open or be excluded.
- current_coverage: `partially_done` — the implemented protocol adapter, current tool contracts, canonical evaluation/state owners, and architecture overview exist; the dedicated target discussion document and its navigation link do not.
- reuse_strategy: `extend` — add one explicitly non-normative discussion document and one link in the existing architecture overview; link canonical contracts/services rather than duplicating their schemas or policy. Add no tool, contract, evaluator, state owner, or parallel architecture register.
- risks: The overview describes a dated development baseline and explicitly says AGDF 0.14.5 lacks MCP support; the document must label its repository inspection date and avoid turning source presence into a release or live-host claim. Candidate capability names and primitive mappings must remain proposals. The current dirty worktree contains unrelated control changes that must not be rewritten or included in the product-doc scope.
- context_graph_impact: `link_only`; `context_graph_refs`: `.agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER`; `context_graph_reconciliation`: `resolved`; `context_graph_required_action`: `link`; `context_graph_gate_effect`: `none`; `context_graph_evidence`: the existing node already owns the MCP adapter and authority boundaries; the new discussion document links to that owner and does not change its decision.
- required_next_step: Proceed with approved TP tasks T-001 through T-004 in order. Keep changes to `docs/architecture/mcp-target-architecture.md` and `docs/architecture/README.md`, then perform the TP's manual source, criteria, link, and scope checks.

## Existing Owners And Reuse

| Concern | Existing owner | Observed behavior | Planned reuse |
|---|---|---|---|
| `agdf_dispatch` semantics | `create-agdf/lib/skill-dispatch/contract.js` and `service.js` | Single typed dispatch boundary; target source and execution context are separate; dispatcher is explicitly non-authorizing. | Describe the current boundary and link the exact contract/service; do not restate schemas. |
| `agdf_inspect` semantics | `create-agdf/lib/control-inspect/contract.js` and `selection.js` | Read-only operations are bounded to doctor, gate-check, delivery-map, and contract; shared selection validation applies across surfaces. | Describe existing read operations as source facts; leave their contract owner unchanged. |
| MCP adapter | `create-agdf/lib/mcp-dispatch-runtime.js`; `agdf-mcp-server/src/server.js` | Runtime composes the existing definitions; server registers definitions and forwards validated calls. | Explain MCP as an invocation adapter, not a domain-policy or state owner. |
| Gate evaluation and run state | `create-agdf/lib/control-evaluation/`; `create-agdf/lib/control-state/` | Evaluation and canonical persisted run/revision handling are separate owners from the transport adapter. | Link both source areas in the authority map. |
| Architecture overview | `docs/architecture/README.md` | Existing orientation covers implemented architecture and carries an explicit dated baseline. | Add one short navigation entry; preserve its existing explanation and historical framing. |
| Reusable MCP architecture context | `.agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER` | Records sole semantic ownership, non-authorizing adapter boundary, risks, and evidence limits. | Cite/link the existing node; do not create a competing policy node. |

## Change And Regression Impact

- Product files: add `docs/architecture/mcp-target-architecture.md`; add a relative link and non-normative label to `docs/architecture/README.md`.
- Interfaces and data: none changed. Candidate examples must not appear as registered tools or executable contracts.
- Compatibility and migration: none in this slice. Any adopted candidate requires its own approved scope, canonical owner, compatibility plan, and evidence.
- Tests: no automated or runtime tests are warranted for Markdown-only changes. The approved TP calls for manual source, criteria, link, and diff inspection; no live-host evidence is implied.
- Side effects: documentation navigation only.
- Parallel-structure risk: avoid duplicating full tool schemas, gate policy, approval rules, host support matrices, or runtime lifecycle contracts. The new document is a proposal and must link to their canonical owners.
