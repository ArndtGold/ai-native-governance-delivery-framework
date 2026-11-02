# Clean Implementation Review: Shared Core Run Inventory from Stored Run State

Decision: pass
run_id: run-inventory-core-20261029-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-30

## Structure

- One owner for run lists: `packages/core/lib/control-state/run-inventory.js` derives title, attention, activity, closure facts, order, counts and labels; doctor, the inspect service, the CLI and the presentation consume it instead of computing their own.
- One owner each for shared rules: the template placeholder rule lives in `decision-content-placeholder.js` and the run-ID title in `run-inventory.js`; the former owners re-export them, so no copy exists.
- No parallel parser or reader: the module reuses `run-state-document.js` for Run Meta and tables and reads only the Objective lines itself; files are read once by `discoverRuns`, and the node-side reader only maps its result.
- No write path: the module returns data, the reader and consumers write nothing.
- Purity is enforced by a static import walk in the test, which keeps later edits from adding `node:` imports.
- Inspect, CLI and MCP share one selection rule (`validateReadSelection`) and one result classification (`mcp-tool-errors.js`).

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | emergent_risk | SD | resolved | The `agdf_inspect` definition has 11 bytes of headroom after this change; earliest-owner assessment: SD SDD-10 requires staying within 5000 bytes, which holds; any later operation needs schema factoring or a budget decision | none |
| CIR-F02 | emergent_risk | SD | resolved | The companion and the intake candidate list still use their own run-list rules; earliest-owner assessment: PRD non-goals assign both to follow-up runs, and the inventory module is ready for them | none |

## Result

The implementation follows the approved design with single owners and no duplicated state, parser, writer or evaluator; the two residual notes are recorded for later changes and need no correction in this run.
