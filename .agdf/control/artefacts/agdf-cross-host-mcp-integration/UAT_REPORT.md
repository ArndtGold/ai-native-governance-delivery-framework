# UAT Report: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: accepted
Decision: bounded acceptance approved
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
Revision: 4
Based on: approved QA Report Revision 6

Gate approval: Exact `Approval: UAT` accepted on 2026-09-08 after same-target, same-run, same-gate,
UAT Revision 4 and run revision `C8CD4D2B-CC33-4294-B149-2C01C4B43BCF` revalidation.

QA Report Revision 6 passed and received exact `Approval: QA` on 2026-09-08 after revalidation of
target, run, gate `QA` and run revision `910C5F55-6AA0-4FE4-BD70-D3C8A8174DCA`. The user selected a
bounded UAT decision: accept directly observed and deterministic outcomes while retaining Claude
Code, Copilot and incomplete OpenCode argument fidelity as explicit qualification limits.

## Acceptance scope

This UAT may accept the common local AGDF MCP lifecycle, one read-only `agdf_dispatch` tool, strict
presentation-language contract, reversible project registration and the separation between MCP
results and AGDF approval authority. It covers the final repository implementation, both production
MCP protocol versions, five fresh Codex language cases and the five final OpenCode language results
after controlled retries.

Acceptance does not qualify all four hosts for release. Claude Code lacks an authenticated callable
session, Copilot lacks a callable local MCP lane, OpenCode retains discovery and argument-fidelity
variance, and neither Codex nor OpenCode has a complete direct failure-and-recovery qualification
tuple. Commit, push, publication and release remain separate actions.

## User-visible outcomes

| Outcome | Evidence | UAT assessment |
|---|---|---|
| One project-first `mcp status | enable | disable` family covers Copilot, Codex, Claude Code and OpenCode without moving host ownership into the server. | Lifecycle contract, adapter tests and architecture documentation | ready |
| Missing or invalid public language input fails before activation, target resolution or gate evaluation. | Shared negative fixture, service zero-call spies and both protocol suites | ready |
| Supported tags and regional variants render one complete exact or primary language pack. | Registry, renderer, service, CLI and protocol tests | ready |
| A valid unsupported language such as `fr-FR` renders one complete English pack. | Dual-protocol, Codex and OpenCode evidence | ready |
| Explicit CLI language overrides project configuration; an omitted parameter preserves the configured chat language. | Focused CLI regression and final full smoke | ready |
| MCP responses remain non-authorizing and exact `Approval: <Gate>` remains the only gate authority. | Semantic contract, direct results and approval revalidation | ready |
| Disable removes owned registrations and retires the isolated runtime after its final reference. | Lifecycle tests, native post-removal checks and hashed cleanup evidence | ready |
| Configuration, tool discovery, successful dispatch and release qualification remain separate evidence states. | Capability metadata, direct host report and Context Graph | ready |

## Direct host observations

| Host | Accepted observed fact | Deliberate limit |
|---|---|---|
| Codex CLI `0.145.0` | Five fresh `gpt-5.6-sol` sessions selected German, English, dominant German, mixed-to-English and unsupported-to-English correctly; target and run fidelity passed. | The configured newer model was incompatible with this CLI, and no complete direct failure-and-recovery qualification path was captured. |
| OpenCode CLI `1.18.3` | The final five language results passed after controlled retries, and successful results remained non-authorizing. | First attempts exposed missing discovery, a wrong skill id and a wrong mixed-language choice. The successful mixed retry omitted the requested run and used `current_repository`. |
| Claude Code CLI `2.1.193` | The registration attempt and cleanup path were directly observed. | Registration verification did not produce a usable project entry, and authentication was unavailable for a fresh discovery and dispatch call. |
| GitHub Copilot Desktop `1.1.15` | The local client boundary was inspected without creating a follow-up registration. | No callable local MCP client was available, so loaded language behavior remains unverified. |

## Validation basis

- QA Report Revision 6: `pass`, approved with exact `Approval: QA` on 2026-09-08.
- Task Plan Review Revision 5: 30/30 tasks `fully_done`; C21 through C26 traced.
- Clean Implementation Review Revision 6 and Code Review Revision 6: `pass`; CR-07 through CR-13
  resolved.
- Final full serial smoke: exit 0, 83/83 deterministic Skill evals, both production MCP protocols,
  467 release-package files and plugin-only Copilot routing passed.
- MCP performance on the final Darwin x64 run: cold `tools/list` p95 `529.683 ms`; warm dispatch p95
  `295.288 ms`.
- Direct evidence: 25/25 files match their SHA-256 manifest. Native post-removal checks report no
  AGDF registration for Codex, Claude Code or OpenCode; project configuration and isolated runtime
  files are absent.

## Open limits

- `@agdf/mcp-server@0.14.5` is not published for ordinary registry acquisition.
- Claude Code and Copilot loaded behavior is not qualified.
- OpenCode fresh-session discovery and full target/run argument fidelity are not qualified.
- Codex and OpenCode lack complete direct controlled failure-and-recovery qualification evidence.
- No direct qualification exists for Windows, Linux, OpenCode 2.x or other client/model tuples.
- The separate `opencode-native-dispatch-tool` draft stays open until comparative permission
  evidence is conclusive.
- UAT acceptance does not authorize publication or any Git operation.

## Decision record

The bounded acceptance scope and disclosed limits were accepted through exact `Approval: UAT` on
2026-09-08. This approval permits OR or delivery closeout. It does not authorize commit, push,
publication or release.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node records lifecycle ownership, the strict language
  boundary, dual-protocol proof, direct host variance and exact qualification limits.

## Closeout

- next_allowed_action: Produce the OR and delivery closeout; keep every four-host qualification
  limit and VCS or release boundary explicit.
- quality_outlook: The bounded implementation is accepted; four-host release qualification remains
  explicitly incomplete.
