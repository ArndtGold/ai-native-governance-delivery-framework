# QA Report: Common AGDF MCP Lifecycle Across Coding-Agent Hosts

Status: pass
Decision owner: `qa-gate`
Date: 2026-09-08
Run: `agdf-cross-host-mcp-integration`
Revision: 6

Previous approval: Exact `Approval: QA` approved historical Revision 1 on 2026-09-07. Later
architecture and language-contract revisions superseded that approval.

Current approval: Exact `Approval: QA` for Revision 6 was accepted on 2026-09-08 after revalidating
target, run `agdf-cross-host-mcp-integration`, gate `QA` and run revision
`910C5F55-6AA0-4FE4-BD70-D3C8A8174DCA`.

## Quality readiness

| Dimension | Owner | Status | Decisive evidence |
|---|---|---|---|
| Requirements | PRD Revision 2 | pass | Approved contract defines four language states, current-request precedence, strict public tag input, complete English fallback and ownership boundaries. |
| Solution fit | Brownfield Analysis Revision 2 | pass | Existing semantic, registry, presentation, CLI and MCP owners support the correction without a parallel source of truth. |
| Plan coverage | Task Plan Review Revision 5 | pass | CHMCP-TP-01 through CHMCP-TP-30 are `fully_done`; C21 through C26 map to direct evidence. |
| Solution integrity | Clean Implementation Review Revision 6 | pass | One primary path, deliberate whole-pack fallback, isolated system-locale adapter and no host-specific detector or language list. |
| Code quality | Code Review Revision 6 | pass | CR-07 through CR-13 are resolved; no correctness, regression, security or maintainability finding is open. |
| Test evidence | CD+Tests Revision 6 | pass | Final full serial smoke, separate dual-protocol reports, strict registry/service matrix and hashed direct host evidence. |

## QA gate

- decision: `pass`
- evidence: Missing and invalid language values fail before activation, target and gate work. Exact
  and regional supported tags render one complete matching pack. Valid unsupported `fr-FR` renders
  one complete English pack. Invalid registry metadata fails closed. The exact function-owned
  precedence projects to every generated binding. Production MCP protocol versions `2025-11-25`
  and `2026-07-28` pass the same matrix separately with empty STDERR and non-authorizing results.
- TP coverage: 30 of 30 tasks fulfilled; six of six Revision 2 acceptance checks pass within their
  approved evidence boundaries.
- Brownfield fit: pass; existing owners were extended and no migration or competing validator was
  introduced.
- solution integrity: pass; strict boundary and complete-pack resolution are the primary path.
- required_next_step: Review UAT Report Revision 4 and provide exact `Approval: UAT`, request
  revision or decline. Release remains gated.
- impact_codes: none

## Language decision evidence

| State | QA result | Evidence |
|---|---|---|
| missing | pass | Required schema and service validation stop with no governance card and zero downstream callbacks. |
| invalid | pass | Wrong type, empty, padded, underscore, POSIX suffix, list and malformed tags fail without coercion or repair. |
| supported or regional | pass | Exact or primary registry pack renders all fields; Codex and OpenCode direct German/English cases agree. |
| valid unsupported | pass | `fr-FR` is retained as host input and resolves to the complete English pack in protocol, Codex and OpenCode evidence. |
| mixed or ambiguous | pass with bounded host evidence | Codex supplied `en` directly. OpenCode supplied `en` on controlled retry; the first attempt supplied `de-DE` and remains recorded. |

The MCP server does not receive conversation text. It can enforce tag validity and pack resolution,
but it cannot prove whether a model selected the tag that the user's request implied. That selection
is therefore direct host evidence rather than deterministic server evidence.

## Verification

The final serial `npm --prefix create-agdf run smoke-test` passed on Node.js `v22.22.3`, Darwin x64.
The run included release preparation, generated profiles, lifecycle and installer suites, both MCP
protocol versions, runtime integrity, package build and contents, 83/83 deterministic Skill evals and
plugin-only Copilot routing. The final run also proves that explicit CLI language overrides the
project setting while an omitted parameter preserves it. MCP performance passed at cold p95
`529.683 ms` and warm p95 `295.288 ms`. `git diff --check` passed.

## Direct host qualification boundary

- Codex CLI `0.145.0` passed five fresh-session language cases with exact target/run arguments.
- OpenCode CLI `1.18.3` passed the five language selections after controlled retries. First-attempt
  missing-tool, wrong-skill and mixed-language variance remains visible. The successful mixed retry
  did not preserve the requested run argument, so complete argument fidelity is still unverified.
- Claude Code CLI `2.1.193` remains unverified because registration/read-back and authentication did
  not yield a callable language lane.
- GitHub Copilot Desktop `1.1.15` remains unverified because no callable local MCP client was
  available.

These limits prevent a claim of four-host release qualification. They do not block QA of the strict
shared contract because the approved TP explicitly separates production protocol evidence from
loaded-host observations and requires unavailable clients to remain explicit.

## Cleanup

All temporary project registrations and the isolated runtime were removed. Native Codex and Claude
lookups report no AGDF server, OpenCode reports no configured MCP server, `.codex/config.toml` and
`opencode.json` are absent, and the isolated runtime root no longer exists. The cleanup evidence is
hashed with the direct language observations.

## Normalized findings

| finding_id | gap_type | status | Evidence |
|---|---|---|---|
| CHMCP-QA-01 | requirements_gap | resolved | Approved PRD Revision 2 defines all four states and precedence. |
| CHMCP-QA-02 | design_gap | resolved | Approved SD Revision 2 separates host choice, validation, resolution and detected locale. |
| CHMCP-QA-03 | design_gap | resolved | Complete English fallback and registry/function ownership are invariant. |
| CHMCP-QA-04 | implementation_gap | resolved | Malformed values fail before governance work on service and both protocols. |
| CHMCP-QA-05 | evidence_gap | resolved | One shared table drives service, registry, renderer and separate production protocol reports. |

No revise-level or block-level finding remains open.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-MCP-DISPATCH-ADAPTER`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Final strict input, English registry invariant, dual-protocol evidence,
  direct host variance and cleanup proof are recorded.

## Knowledge persistence

- memory_target: `context_graph`
- memory_reason: Semantic language selection, strict transport validation, whole-pack resolution and
  loaded-host evidence are separate reusable MCP boundaries.
- memory_refs: `CG-MCP-DISPATCH-ADAPTER`
