# QA Report: Cross-Host AGDF Dispatch Through MCP

Status: approved
Decision: pass
Revision: 2
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Based on: approved TP Revision 2, Brownfield Analysis Revision 2, current CD+Tests, Task Plan Review Revision 2, Clean Implementation Review Revision 2 and Code Review Revision 2
QA approval: exact `Approval: QA` accepted on 2026-09-06 after same-target, same-run,
same-gate and run revision 26 (`66315C86-EA37-4571-A93E-4B64D8A95391`) revalidation

Current boundary: this report evaluates approved TP Revision 2. Direct host qualification uses only
directly observable host behavior. Controlled clients independently prove both required protocol
generations against the production server definition. Host-selected protocol telemetry is optional
and is not inferred.

## Quality Readiness

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | pass | Task Plan Review Revision 2 records 18/18 tasks `fully_done`; direct host and controlled protocol evidence satisfy their separate approved obligations. |
| Solution integrity | pass | Clean Implementation Review Revision 2 confirms one canonical semantic owner, one bounded runtime adapter, one SDK v2 server, one locale owner and thin lifecycle adapters without parallel governance. |
| Code quality | pass | Code Review Revision 2 has no open correctness, security, regression or maintainability finding after six resolved corrections. |
| QA decision | pass | `qa-gate` consumes complete TP coverage, passing Brownfield and solution-integrity evidence, resolved review findings and the complete exact-snapshot regression suite. |

Sole decision owner: `qa-gate`.

## QA Gate

- decision: pass
- evidence: approved TP Revision 2 has 18/18 tasks fully done. The exact canonical contract, controlled MCP `2026-07-28` and `2025-11-25` negotiation, read-only/offline boundary, provenance, worker lifecycle, transactional host adapters, Node 18/20 separation, package closure, public-candidate exclusion, German gate presentation and performance budgets pass. OpenCode 1.18.3 and Codex CLI 0.145.0 with `gpt-5.6-sol` directly pass registration, discovery, valid and controlled-failure calls, terminal transfer, bounded continuation and full removal on macOS x64. The complete exact-TP2 aggregate suite passes with 83/83 skill evaluations. Brownfield fit, solution integrity and code quality pass.
- missing_evidence: none for the approved first-release scope. Claude model execution, OpenCode 2.x and native Linux/Windows remain separate unclaimed future lanes. Generic capability metadata remains `unverified` and no broader support is inferred.
- risks: OpenCode added a harmless prefix to the requested visible continuation line. Codex CLI 0.145.0 rejected the configured default model and required the recorded compatible `gpt-5.6-sol` override. Claude model behavior and unobserved host/OS tuples may differ from fixtures.
- required_next_step: QA approval is accepted; review UAT Report Revision 1 and provide exact
  `Approval: UAT`, request revision or decline. Delivery remains gated.
- impact_codes: `qa_pass`, `bounded_host_support_only`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| MCP-TPR-01 | evidence_gap | evidence_obligation | resolved | approved PRD4, SD3 and TP2 separate the completed direct host lane from the independently completed controlled dual-protocol lane; host telemetry is optional and not inferred |
| MCP-CR-01 | implementation_gap | CD+Tests | resolved | ambiguous Codex TOML ownership forms now fail closed and the focused lifecycle suite passes |
| MCP-CR-02 | implementation_gap | CD+Tests | resolved | semantic input errors now remain canonical `invalid_input` results across the worker boundary |
| MCP-CR-03 | implementation_gap | CD+Tests | resolved | OpenCode removes only AGDF-created config shells and preserves pre-existing configuration |
| MCP-CR-04 | implementation_gap | CD+Tests | resolved | Codex removes only AGDF-created empty config containers and preserves pre-existing directories and content |
| MCP-CR-05 | implementation_gap | CD+Tests | resolved | the dispatcher serializes the canonical ordered approval presentation into exact non-empty terminal text |
| MCP-CR-06 | implementation_gap | CD+Tests | resolved | one locale registry owns German gate and post-TP transition values, and dependent tests consume that owner |

## Evidence Boundaries

- Green repository, protocol, package and fixture tests prove the delivered core and adapter contracts. They do not prove loaded-host or model behavior.
- `DIRECT_HOST_EVIDENCE.md` records qualified functional OpenCode 1.18.3 and Codex CLI 0.145.0 tuples on macOS x64 with the exact local-development runtime. Controlled clients independently prove both required protocol generations; unavailable host-selected telemetry is not inferred.
- Claude Code 2.1.193 connects to the real project registration, but the fresh model process is unauthenticated. Configuration and connection do not qualify model calls or terminal behavior.
- Direct Copilot Skills-only evidence shows that `mai-code-1.1-flash` ignored a valid schema-2
  dispatcher binding and made 17 other tool calls, including broad filesystem searches. This is a
  negative instruction-conformance result and does not qualify Copilot or test MCP.
- Capability metadata correctly keeps generic host values `unverified`; bounded exact observations do not become universal cross-host support claims.
- Exact `Approval: QA` is recorded for this pass report. UAT approval, publication, release, commit,
  push and pull request remain unavailable.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`; `CG-REQUEST-ACTIVATION-AUTHORITY`; `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`; `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: the node names the delivered owners, completed OpenCode-plus-Codex functional matrix, independent controlled dual-protocol evidence, Claude authentication boundary, corrected presentation, worker and cleanup behavior, and bounded residual support risks.
