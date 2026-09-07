# UAT Report: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: ready for acceptance  
Decision: pending  
Date: 2026-09-07  
Run: `agdf-cross-host-mcp-integration`  
Revision: 1  
Based on: approved QA Report Revision 1

## Acceptance Scope

Accept the delivered common AGDF MCP lifecycle for Copilot, Codex, Claude Code and OpenCode as the
approved bounded first release implementation. Acceptance covers one project-first command family,
native host configuration, exact shared runtime ownership, reversible enable/disable behavior,
non-authorizing results and honest separation between configuration, discovery and qualification.

Acceptance does not qualify every host for release. All four exact qualification tuples remain
`unverified`: Codex and OpenCode lack direct controlled failure-path evidence, Claude lacks an
authenticated fresh discovery/call, and Copilot lacks a callable or observable fresh client lane.
Publication, commit, push and release are outside this acceptance decision.

## User-Visible Outcomes

| Outcome | Evidence | UAT assessment |
|---|---|---|
| One `mcp status | enable | disable` family accepts all four host names and defaults to project scope. | CLI contract, help, lifecycle tests and direct enable/status output | ready |
| Every result names host, requested/effective scope, native source, runtime, permission effect, discovery state and one next action. | Result/presentation tests and direct JSON records | ready |
| Human and JSON output preserve the same meaning in English and German. | Exhaustive locale and interaction-presentation tests; direct German terminal result | ready |
| Plugin installation cannot silently activate or qualify MCP. | Installer separation and public Skills-only Copilot payload tests | ready |
| Disable removes only the owned registration and retires the runtime after its final reference. | Transaction fixtures and four direct cleanup lanes | ready |
| Configuration, discovery and release qualification remain distinct. | Four direct records, exact evidence validator and `unverified` capability tuples | ready |
| MCP registration and dispatch never count as AGDF gate approval. | Semantic contract, lifecycle envelopes and direct `authorizes: false` results | ready |

## Direct Host Observations

| Host | Accepted observed fact | Deliberate limit |
|---|---|---|
| Codex CLI 0.145.0 | Project registration, native read-back, fresh `gpt-5.6-sol` session, one bounded `agdf_dispatch`, disable and cleanup passed. | No controlled direct failure path; tuple remains `unverified`. |
| OpenCode 1.18.3 | Project registration, native list, one bounded MCP dispatch, unchanged unrelated permissions, disable and cleanup passed. | No controlled direct failure path and no 2.x observation; tuple remains `unverified`. |
| Claude Code 2.1.193 | Local registration, native read-back and cleanup passed; fresh initialization exposed the server as pending. | Authentication failed before discovery or call; tuple remains `unverified`. |
| GitHub Copilot Desktop 1.1.15 | Project file registration, lifecycle status, disable and cleanup passed. | No callable CLI or automatable fresh Desktop session; tuple remains `unverified`. |

## Validation Basis

- QA Report Revision 1: `pass`, approved on 2026-09-07 after same-run, same-gate and revision
  `084A94EE-FB7B-433F-968C-CEF41C75AEF6` revalidation.
- Task Plan Review: 22/22 tasks `fully_done`.
- Clean Implementation Review and Code Review: `pass`; all normalized findings resolved.
- Final serial aggregate: exit 0, 83/83 skill evals and 467 release-package files.
- MCP performance: cold tools/list p95 545.143 ms; warm dispatch p95 314.568 ms.
- Direct evidence: four machine-valid `unverified` records, 25/25 retained hashes and exact project
  registration cleanup.

## Open Limits

- `@agdf/mcp-server@0.14.5` is not published for ordinary registry acquisition.
- No direct qualification exists for Windows, Linux, OpenCode 2.x or other client/model tuples.
- The separate `opencode-native-dispatch-tool` draft stays open until comparative permission
  evidence is conclusive.
- Acceptance does not authorize publication or any Git operation.

## Required Decision

Review this bounded acceptance scope and provide exact `Approval: UAT`, request revision or decline.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node already records the accepted implementation boundary,
  observed host facts and exact qualification limits.
