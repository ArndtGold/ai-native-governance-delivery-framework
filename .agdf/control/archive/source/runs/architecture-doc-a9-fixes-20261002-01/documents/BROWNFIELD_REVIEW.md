# Brownfield Review: Architecture docs match plugin MCP distribution

Status: done
Mode: post_ur_review
Date: 2026-10-02
Run: architecture-doc-a9-fixes-20261002-01

## Decision

- decision: pass
- mode_slice_decision: quick_task
- required_next_gate: none
- scope_reason: Documentation-only correction of three statements plus one diagram; code is the
  source of truth and stays unchanged, no new product semantics.

## Routing Fields

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: No user-facing capability, state or recovery behaviour changes; only
  architecture and privacy prose and one diagram are corrected.
- ux_intent_definition_required: no (not_applicable)

## Architecture Impact

architecture-not-applicable. The change touches no module, interface, data, runtime, host contract
or policy authority. It aligns documentation with existing owners:

- `mcp` command: `packages/cli/lib/cli/command-registry.js:28`, `packages/cli/lib/cli/application.js:211`.
- Plugin-bundled MCP: `packages/cli/lib/host-adapters/claude/plugin-mcp.js:7-27` (server declared in
  `mcp/claude.mcp.json`, prewarm or `deferred_to_first_start`).
- First-start npm acquisition: `packages/cli/lib/mcp-lifecycle/plugin-runtime.js:8-12,95-97`
  (`@modelcontextprotocol/server@2.0.0`; Claude uses `${CLAUDE_PLUGIN_DATA}`, Codex an absolute
  AGDF-owned data root written by the installer).
- Existing user-facing description: `INSTALL.md:340-346`.

## Current Coverage

- `INSTALL.md`: fully_done for the Claude plugin MCP path.
- `docs/architecture/README.md:132`, `:309-311`: contradict code (not_done).
- `docs/architecture/diagrams/04-distribution.dot` note and missing plugin MCP path: not_done.
- `PRIVACY.md:28-30`: partially_done (npx covered, plugin first start missing).

## Reuse Strategy

extend: edit the existing README rows/section, the existing diagram source and regenerate its SVG
with the locally available Graphviz `dot`; reference `INSTALL.md` instead of duplicating details.

## Reuse And Parallel-Structure Risk

| Finding | Class | Treatment |
|---|---|---|
| Plugin MCP details could be copied from INSTALL.md into architecture docs | problem | Describe structure briefly, link INSTALL.md for operation details |

## Structured Depth Evidence

Not applicable: the compact path is eligible (Modes: Non-Normative Trivial Change Boundary; the diff
stays outside `plugins/agdf/**`, `packages/cli/lib/**`, `packages/cli/bin/**` and executable code).

## Risks

- Text pins: `packages/cli/scripts/cli-modularization-test.js:320-324` asserts README phrases that
  must stay; `packages/mcp-server/test/protocol.test.js:18-29` binds the tool list. No pin found on the
  sentences being replaced.
- SVG regeneration may alter layout of diagram 04; review visually.

## Context Graph Impact

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: none

## Required Next Step

Execute the Quick Task within this scope, then run the two pinning tests and a relative-link check.
