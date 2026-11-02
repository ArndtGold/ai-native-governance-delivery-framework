# Brownfield Analysis: MCP inspection implementation preparation

Decision: pass
Mode: pre_implementation_analysis
Date: 2026-10-20
Owner: Codex
Based on: approved TP @ sha256:e6cedc82d181424cdc8e3751f77fbfef3acb0529e5f205b0e12670ed4d176ed6

## Scope and current coverage

T-001 through T-009 are bound to the one inspection/document outcome. UR/PRD/SD/TP are approved in this run; the recorded human answer selects exactly one Codex CLI session and removes Claude. No product implementation has changed at this preparation baseline. Foreign core-model-handoff-simplification artefacts remain outside this run.

| Concern | Coverage | Existing owner and reuse |
|---|---|---|
| Inspection schema/normalization | partially_done | control-inspect/contract.js and selection.js own fourteen parameters, operation guards and the 5000-byte ceiling. Refactor declarations together; no adapter-local validator. |
| Exact existing presentation discovery | not_done | Extend run-presentation.js beside its checked directories, bounded no-follow record reads and envelope/snapshot validators. Attach metadata only in service.js preparation operation-contract branch. |
| Frozen document paging | fully_done for existing semantics | readPresentationDocument already validates original identity, digest, UTF-8 pages and history. Reuse it; regressions extend presentation-document-test.js. No new file-reader API. |
| Read status/error projection | fully_done for Phase 1 | Existing service and mcp-tool-errors.js retain genuine errors versus successful blocked/absence observations. Catalog warnings are supplemental and non-authorizing. |
| SDK/generation/packing | partially_done | CLI composition consumes Core; actual SDK input and successful output validation stay in server.js. protocol.test.js tests both eras; package.test.js packs actual archives. |
| Payload space | partially_done | syncCopilotPluginContract currently copies the locale JSON. Its existing writeCopilot inventory supports an explicit transform string; compact only the skills locale projection, assert parsed equality and measure actual cap/baseline. |
| Native T4 evidence | partially_done | Existing Codex host-e2e owner has isolated auth/candidate setup and JSONL/rollout capture but currently invokes multiple sessions and tests dispatch. Add a single-T4 mode there; reuse unchanged F4/task/predicate and supplemental strict audit in the existing eval component. |

## Regression and security boundaries

Catalog observations must validate the current run seal/revision and each original immutable record/snapshot. Bound 16 candidates/page, 256 record files and 1 MiB record bytes; reject corrupt/foreign/symlink/racing/overflow observations without false none/unique. Page cursors bind target/run/current revision/module/gate/candidate-set identity with a distinct domain from document/preview cursors. UUID sort is pagination only. Existing explicit historical reads and ordinary gate-check/CLI parity remain intact. Directory traversal and record reading stay within the existing presentation owner; no persistent catalog/index/cache.

Contract factoring must retain every existing type/bound/selector rejection and output schema, with only the SD-approved optional catalog cursor combination added. Actual SDK tools/list and runtime tests establish representation compatibility. The 5000-byte definition and 395-file/3442564-byte profile caps are hard stops; if representation/compaction cannot fit, return to SD rather than weaken validation or raise caps.

The single Codex task requires a fresh exact candidate, safe account authentication, read-only sandbox, scoped inspect permissions, complete traces, exact page bytes and final user delivery. The existing host's default multi-session sequence must never execute in the single-T4 branch. Authentication/configuration availability checks are read-only and no native model session has run. Any access/trace/model failure remains failed/unavailable evidence; no retry or substitute host is authorized. Do not treat known local Codex login as proof of isolated access or successful task completion.

## Minimal implementation and verification path

First prove the declarative schema and discovered-definition budget through the real pinned SDK. Then extend the existing presentation owner and service branch, preserving the existing reader and Phase 1 errors. Extend production-path tests at existing owners, compact the one generated locale projection and regenerate normally. Add the single-T4 branch to the existing Codex owner and strict trace/content auditing within the existing evaluation component; protect historical inputs and original predicate. Run the approved deterministic/packaged/build/integrity checks before the one actual Codex session, then perform required reviews and route QA. No source migration, personal runtime replacement, release or merge is included.

## Decision and limits

The existing owners and safe reuse path are understood; no blocking architecture drift or parallel owner remains. This pass establishes preparation only, not implementation, native success or QA acceptance. Required evidence is planned in the approved TP and must be produced or remain explicitly unsatisfied.

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter
- context_graph_required_action: link
- context_graph_gate_effect: warning
- memory_target: scope_artifact
- memory_reason: This preparation is specific to the exact approved run; final reusable scope/qualification linkage belongs to existing graph closeout.
- required_next_step: Execute approved CD+Tests through the existing owners, beginning with schema/SDK budget feasibility.
