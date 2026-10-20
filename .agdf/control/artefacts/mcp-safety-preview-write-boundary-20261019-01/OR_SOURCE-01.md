# OR-lite: Declare the preview snapshot writer in the MCP safety write boundary

Report mode: OR-lite
Run: mcp-safety-preview-write-boundary-20261019-01
Mode: quick_task (Compact Delivery)
Decision: pass

## Result

`packages/mcp-server/test/safety.test.js` declares the Core writer `preview-snapshot.js` in the reviewed MCP write boundary with exactly `writeFileSync`, `openSync` and `fsyncSync`, and asserts that the module opens files only once, for exclusive non-following creation, with a positive control and three negative cases. Commit 2595f362 on `fix/agdf-core-approval-defects-20261017` (PR #22). No other file, module or runtime behaviour changed.

## Evidence

- UR approved (`Approval: UR`, revision 3); Brownfield Review selected `quick_task` (BROWNFIELD_REVIEW.md).
- EVIDENCE: `test:safety` passes locally; the mcp-server suites pass without parallel load except the known machine-dependent `test:performance` limit F09 (local warm p95 1064.6 ms); `test:verification` 15/15, `build:prepare` and `compatibility:check` pass (EVIDENCE.md).
- Code Review: pass with an independent read-only review; CR-02 and CR-03 fixed before the commit, CR-04 assessed as residual (CODE_REVIEW.md).
- CI on the merge ref c9b4e3f5 (2595f362 into `main` a8a867a3): all 11 MCP partitions pass, including `test:safety` and the performance partition MCP · Win22 5of5 that failed on 6bf406ec. An in-process A/B benchmark shows no dispatch regression of this branch.

## Risk

- CI is not fully green, for a cause outside this run: `main` a8a867a3 commits run `mcp-error-contract-phase1-20261019-01` without its listed artefacts (UR.md, BROWNFIELD_REVIEW.md, UX_INTENT_DEFINITION.md), so `delivery-map --all-active` blocks with `AGDF_RUN_SEAL_MISMATCH` (Run safety · Linux22) and `late-source-revision.test.js` dispatches to that run (Revision · Linux22 1of2, Linux24 1of2, Win22 1of4). The same commit adds 40 duplicate files named `* 2.*`. This needs the owner of that run on `main`.
- Residual from CR-04: a write by path inside `preview-snapshot.js` would not be caught; no test asserts that Inspect presentation reads leave the tree unchanged.
- `test:performance` stays sensitive to runner speed at the 1000 ms limit (F09).

## Next Step

The owner commits the missing artefacts of run `mcp-error-contract-phase1-20261019-01` to `main` (or removes the partial run) and removes the `* 2.*` duplicates; then PR #22's CI re-runs on the corrected merge ref. No further action in this run.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: CG-MCP-DISPATCH-ADAPTER (entry preview_snapshot_write_boundary_20261019)
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md, node CG-MCP-DISPATCH-ADAPTER, entry preview_snapshot_write_boundary_20261019

## Knowledge Persistence Decision

- memory_target: `context_graph`
- memory_reason: The declared write boundary and its residual coverage are reusable knowledge for later changes to the MCP-reachable Core graph.
- memory_refs: CG-MCP-DISPATCH-ADAPTER
