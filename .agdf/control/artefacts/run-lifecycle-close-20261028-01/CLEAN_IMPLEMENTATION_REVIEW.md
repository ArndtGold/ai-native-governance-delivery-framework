# Clean Implementation Review: Close Active Runs as Superseded or Abandoned

Decision: pass
run_id: run-lifecycle-close-20261028-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-29

## Structure

- One owner for the new behavior: `packages/core/lib/control-state/run-closure.js`; identity in one pure helper `git-identity.js` used by CLI and MCP alike.
- No parallel writer: each closure commits through `recordRunStep` with the internal step `lifecycle_close`, the v3 journal and `commitRunStepLocked`; previews are written through `atomicWrite`.
- One central protection point: `assertRunNotEnded` in `writeRunLocked` and `writeRunRecoveryLocked`; early checks only add readable reasons.
- One evaluation owner: the ended branch in `gate-policy.js`; readers (`gate-check.js`, `run-work-summary.js`, `interaction-presentation.js`, cockpit) consume it instead of computing their own status.
- Shared outcome and record texts for closure and backlog repair live in `run-operations.js`, so both paths render the same archive row.
- MCP tools derive from the command groups; the tool count and the error catalog are unchanged.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-F01 | emergent_risk | SD | resolved | The MCP command tool definitions use about 24473 of 24576 bytes after shortening shared descriptions; earliest-owner assessment: SD SDD-09 requires staying within the budget, which holds, and the next schema addition will need further cuts or a budget decision by the SD owner of that change | none |
| CIR-F02 | emergent_risk | SD | resolved | A test seam `beforeFacts` was added to the preview for CR-F07; earliest-owner assessment: it is an optional injection used only by tests, has no effect when absent and does not change the SD design | none |

## Result

The implementation follows the approved design without duplicated state, writers or evaluators; the two residual notes are recorded for later changes and need no correction in this run.
