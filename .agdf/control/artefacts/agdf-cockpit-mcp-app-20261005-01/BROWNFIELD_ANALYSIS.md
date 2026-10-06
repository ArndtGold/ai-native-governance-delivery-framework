# Brownfield Analysis: Embedded AGDF Cockpit

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery (unchanged approved route)
- required_next_gate: CD+Tests
- run: agdf-cockpit-mcp-app-20261005-01
- preparation_revision: 06128ac9-99ea-4aab-9f8b-f6c8767b44c2
- scope: approved TP tasks T-001 through T-012; source/protocol/local setup and actual-host qualification remain distinct
- evidence: IMPLEMENTATION_BASELINE.json; approved PRD/SD/TP; current source inspection of the owners below
- missing_evidence: exact SDK registry/build and actual-host capability proof are planned early implementation obligations, not completed evidence
- transparency: TP approved; preparation supports starting the minimal implementation path only; no QA/UAT/release claim

## Coverage, Reuse And Parallel-Structure Risk

| Concern | Current coverage | Existing owner and strategy | Regression/exit condition |
|---|---|---|---|
| Captured reads and canonical evaluations | fully_done for browser reading | Extend packages/core/lib/control-inspect/cockpit.js; reuse captureControl/revalidate and existing evaluators | One evaluation/containment owner; HTTP/MCP fixture parity |
| Read-worker execution | partially_done, browser-owned bounded implementation | Refactor packages/control-ui/server/pool.mjs and read-worker.mjs into Core; browser modules delegate | Preserve active/queue limits, cancellation, response bounds, reset and selector invalidation |
| Runtime composition | partially_done for dispatch/inspection | Extend packages/core/lib/index.js and packages/cli/lib/mcp-dispatch-runtime.js with explicit read composition | Ordinary tools/runtime remain unchanged; no writer reachable in cockpit mode |
| SDK resource/bridge | not_done | Extend existing MCP registration/main/bin; new private frontend entry under packages/control-ui | Exact pinned SDK/build/manifest verification; no handwritten general bridge |
| Frontend reading | fully_done browser, partially_done transport reuse | Refactor App construction to injected shared read interface; reuse reducer/views/api validation | Do not put host publication or persistence into generic reducer; browser tests retained |
| Graph and checked context | not_done | Extend Core cockpit projection; exact canonical run refs and maintained Markdown only | Bounded selectors/packet, mutation/race negatives and no recursive file access |
| Local assembly/provenance | partially_done ordinary surface profiles | Extend scripts/assemble-npm.mjs, existing local-source packaging and mcp-lifecycle/package.js | Separate codex-cockpit output; UI inside existing server digest; no relaxed/handwritten trust marker |
| Named host connection | not_done | Generate reviewable project entry in owned local output; use supported authorized host workflow | No silent global/plugin-cache writes; precise loaded identity, rollback/reconnect evidence |

All parallel-structure risks are avoided through these established owners. There is no accepted debt exception, second dashboard, separate graph store, copied evaluator or second governance connection. Existing canonical writer/approval semantics and persistent schema are unchanged. New MCP mode/session/read interfaces are bounded by the approved SD. New private frontend dependencies must not enter owned server runtime or public/default profile payloads.

## Baseline And Regression Evidence

Baseline commit: 67a97ae80d1fcd286b4b4d5e21e8606fb3c31f26. Only MASTER_BACKLOG and this run's artefacts/control are dirty; candidate implementation sources are clean. Approved-source hashes are captured in IMPLEMENTATION_BASELINE.json. Current control-inspect suite passed; private UI suite passed five service and eight reading tests outside the restricted sandbox. Initial sandbox-only failures are recorded as environment evidence, not product defects. Existing browser service is outside cleanup scope.

Reuse existing tests, fixtures, SDK registration and assembler prerequisites. New tests exercise actual boundaries and source/host publication races. No tests/approval evidence from the completed browser run qualify this embedded run. Formal prerequisite and review owners remain canonical; own review is cooperative.

## Minimal Safe Implementation Path

Complete T-002 to T-005 minimally: exact private dependency resolution; shared worker/read composition; fixed inline UI resource, strict cockpit-only tool inventory/session; isolated owned local profile and reviewable connection. T-006 then verifies actual Codex loading/display/read/context/message feasibility before T-007 through T-010 extensive product work. Package incompatibility routes SD revision; inaccessible/unsupported host methods remain an explicit evidence/design gap and halt dependent features. No fallback version, alias bridge or browser-only completion is allowed.

## Context Graph And Knowledge Persistence

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: approved SD ownership plus this analysis; verified implementation knowledge is not available yet
- memory_target: context_graph
- memory_reason: curate reusable verified reader/runtime/host-boundary facts after implementation, before clean closeout
- memory_refs: the existing nodes above; run-specific logs remain in this run's scope artefacts

## Next Step

Record this analysis done through canonical run-update, redispatch bound gate-check, then begin the approved minimal CD+Tests path if permitted. No extra human preparation approval is required.
