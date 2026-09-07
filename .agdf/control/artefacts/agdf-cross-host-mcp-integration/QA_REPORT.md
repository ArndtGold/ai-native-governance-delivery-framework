# QA Report: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: approved  
Decision owner: `qa-gate`  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Revision: 1

Gate approval: Exact `Approval: QA` accepted on 2026-09-07 after same-target, same-run, same-gate
and run revision `084A94EE-FB7B-433F-968C-CEF41C75AEF6` revalidation.

## Quality Readiness

| Dimension | Owner | Status | Decisive evidence |
|---|---|---|---|
| Plan coverage | `task-plan-review` | pass | 22/22 approved TP tasks are `fully_done`; bounded host records satisfy the explicit task scope without creating support claims. |
| Solution integrity | `clean-implementation-review` | pass | Existing semantic, lifecycle, package, locale and installer owners were extended without a second source of truth or silent fallback. |
| Code quality | `code-review` | pass | Three in-scope implementation findings were corrected and their focused plus aggregate regressions pass. |
| QA decision | `qa-gate` | pass | All required reviews, Brownfield fit, acceptance coverage, direct bounded evidence, documentation and Context Graph reconciliation are complete. |

## QA Gate

- decision: `pass`
- evidence: Approved TP Revision 1; passing pre-implementation Brownfield Analysis; 22/22 Task Plan Review; passing Clean Implementation Review and Code Review; complete CHMCP-C01 through C20 mapping in `CD_TESTS.md`; final serial `npm --prefix create-agdf run smoke-test` exit 0; MCP cold tools/list p95 545.143 ms and warm dispatch p95 314.568 ms; 83/83 deterministic skill evals; 467-file release package; four hashed direct project-scope host records; exact cleanup and baseline restoration; four machine-validated `unverified` qualification outcomes; updated documentation and Context Graph.
- missing_evidence: The public `@agdf/mcp-server@0.14.5` package is unpublished. Codex and OpenCode lack direct failure-path qualification evidence. Claude lacks authenticated discovery/call evidence. Copilot lacks a callable CLI or observable fresh Desktop MCP session. Windows, Linux, OpenCode 2.x and other client tuples are unobserved.
- risks: No exact host tuple is release-qualified. A later host configuration or policy change can make a currently compatible path unavailable. These risks are contained by fail-closed native inspection, immutable exact-tuple qualification and the absence of any `supported` claim.
- required_next_step: Prepare UAT evidence and request exact `Approval: UAT`; release remains gated.
- impact_codes: none

The missing direct and publication evidence limits later support, release and UAT claims. It does not invalidate this QA decision because the approved TP explicitly required honest bounded unavailable or blocked records for the direct lanes and excluded publication. No open normalized finding remains.

## Context Graph

- Situation: The common four-host lifecycle is implemented and tested, while exact host qualification remains deliberately unverified until every tuple has complete direct evidence.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` records the final owners, shared runtime, direct outcomes, non-authorizing boundary, qualification limits and future release conditions.

## Knowledge Persistence

- memory_target: `context_graph`
- memory_reason: The common lifecycle ownership, adapter boundary, evidence separation and exact qualification conditions are reusable cross-run architecture facts.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`
