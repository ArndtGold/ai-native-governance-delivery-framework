# QA Report: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: ready for approval
Decision owner: `qa-gate`  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Revision: 2

Previous approval: Exact `Approval: QA` for Revision 1 was accepted on 2026-09-07 after same-target,
same-run, same-gate and run revision `084A94EE-FB7B-433F-968C-CEF41C75AEF6` revalidation. The user's
subsequent UAT revision request added the entry-level architecture documentation and refreshed its
dependent evidence. The previous approval remains historical and does not approve Revision 2.

## Quality Readiness

| Dimension | Owner | Status | Decisive evidence |
|---|---|---|---|
| Plan coverage | `task-plan-review` | pass | Revision 2 confirms 22/22 approved TP tasks `fully_done`; TP-16 now includes the complete entry-level architecture projection and six verified diagrams. |
| Solution integrity | `clean-implementation-review` | pass | The documentation derives from the existing semantic, lifecycle, package, adapter, locale and evidence owners without becoming a second normative source. |
| Code quality | `code-review` | pass | The implementation review remains valid, the CLI example was corrected, and generated Copilot state was reconciled before fresh compatibility evidence was recorded. |
| QA decision | `qa-gate` | pass | Required reviews, Brownfield fit, acceptance coverage, direct bounded evidence, beginner-level architecture documentation, Context Graph reconciliation and all applicable checks are complete. |

## QA Gate

- decision: `pass`
- evidence: Approved TP Revision 1; passing pre-implementation Brownfield Analysis; Task Plan Review Revision 2 with 22/22 tasks `fully_done`; passing Clean Implementation Review and Code Review Revision 2; complete CHMCP-C01 through C20 mapping in `CD_TESTS.md`; implementation commit `c95874957ac78bbccd8b7b31a90b71dbe50ce677`; final serial `npm --prefix create-agdf run smoke-test` exit 0; MCP cold tools/list p95 545.143 ms and warm dispatch p95 314.568 ms; 83/83 deterministic skill evals; 467-file release package; four hashed direct project-scope host records; exact cleanup and baseline restoration; four machine-validated `unverified` qualification outcomes; architecture guide with six visually inspected DOT/SVG diagrams, 55 resolving local links and exact CLI examples; serial `release:prepare` pass; byte-identical package build pass; refreshed host compatibility record with 56/56 scenarios; compatibility and community-health checks pass.
- missing_evidence: The public `@agdf/mcp-server@0.14.5` package is unpublished. Codex and OpenCode lack direct failure-path qualification evidence. Claude lacks authenticated discovery/call evidence. Copilot lacks a callable CLI or observable fresh Desktop MCP session. Windows, Linux, OpenCode 2.x and other client tuples are unobserved.
- risks: No exact host tuple is release-qualified. A later host configuration or policy change can make a currently compatible path unavailable. Generated Copilot conflict siblings can recur when external filesystem synchronization overlaps generation. The canonical in-place pruning and serial evidence workflow contain this risk, and exact tuple qualification continues to fail closed.
- required_next_step: Review QA Report Revision 2 and provide exact `Approval: QA` or request another revision. Do not request UAT approval until this QA revision is approved.
- impact_codes: none

The missing direct and publication evidence limits later support, release and UAT claims. It does not
invalidate the QA decision because the approved TP explicitly requires honest bounded unavailable or
blocked records for the direct lanes and excludes publication. The post-commit documentation adds no
product or runtime semantics. No normalized finding remains open.

## Documentation Evidence

- `docs/architecture/README.md` now starts with a five-term entry model and one short end-to-end flow.
- The guide distinguishes Skill invocation, MCP invocation and the separate MCP lifecycle.
- Component ownership, canonical tool semantics, four native adapters, shared runtime references,
  rollback, source precedence, distribution and non-authorizing boundaries are explained in order.
- Five existing DOT/SVG diagrams were revised and `06-mcp-lifecycle.dot/.svg` was added.
- Six Graphviz renders, SVG XML validation and visual inspection passed.
- The architecture audit resolved 55 local links across 45 unique targets with zero missing targets.
- `npm run test:community-health`, `npm run compatibility:check` and
  `npm run check:community-health` pass.

## Context Graph

- Situation: The common four-host lifecycle is implemented and tested. Its public architecture guide now explains the same owners, flows and evidence limits for a first-time reader. Exact host qualification remains deliberately unverified until every tuple has complete direct evidence.
- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: `.agdf/control/CONTEXT_GRAPH.md` links the implementation, entry-level architecture guide, refreshed deterministic compatibility record, direct outcomes, non-authorizing boundary, qualification limits and future release conditions.

## Knowledge Persistence

- memory_target: `context_graph`
- memory_reason: The common lifecycle ownership, adapter boundary, two invocation paths, evidence separation and exact qualification conditions are reusable cross-run architecture facts.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`
