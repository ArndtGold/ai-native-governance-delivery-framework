# Brownfield Analysis: Close Active Runs as Superseded or Abandoned

Decision: pass
Mode: pre_implementation_analysis
run_id: run-lifecycle-close-20261028-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-28

## Scope

Approved TP revision 15 (T-001 to T-009) for the approved SD revision 13 and PRD revision 11.

## Current Coverage

| Task | Coverage | Evidence |
|---|---|---|
| T-001 closure module and identity helper | not_done | No module writes `superseded` or `abandoned`; no Git identity helper in lib code (`packages/cli/lib/control-evaluation/git-observation.js:14-20` spawns `git` and is CLI-only) |
| T-002 run-step integration | partially_done | Closeout commit, receipt, journal and backlog move exist for `completed` (`packages/core/lib/control-state/run-steps.js:355-475`, `run-operations.js:7-80`, `run-step-transaction.js:67-75,278-284,303-336`); the new kind and step are missing |
| T-003 ended-run guard | partially_done | Several writers reject non-active runs (`run-steps.js:238,357`, `run-operation-proof.js:91`, `run-revision-boundary.js:14,24,44`, `run-recovery.js:132`, `run-state-writer.js:436`, `control-maintenance/repair.js:68`); artefact recording, run-present, approvals, presentation decisions, relationship correction, run-update, legacy run-step and `writeRunLocked` do not |
| T-004 Core readers | partially_done | All-active selection already filters `active` (`run-state-resolver.js:12`, `skill-dispatch/delivery-run-assignment.js:17`, `interaction-presentation.js:267`); `gate-policy.js:407-425`, `gate-check.js:224`, `run-work-summary.js:25` and `interaction-presentation.js:319` know only `completed` |
| T-005 MCP kinds | not_done | `agdf_closeout` has `closeout.record` and `operation.recover` only (`run-command-contract.js:55,63`); the envelope binds one run (`run-command-contract.js:65-70`) |
| T-006 CLI command | not_done | Pattern available in `run-recovery` (`packages/cli/lib/cli/command-registry.js:54`, `parse-args.js:161-172`, `validation-handlers.js:218-233`) |
| T-007 cockpit and UI | partially_done | Labels "Ersetzt" and "Beendet" exist (`packages/control-ui/src/feedback.tsx:25`) and `presentation.ts:54` labels non-active lifecycles; the assessment maps ended runs to `unconfirmed` (`control-inspect/cockpit.js:36-37`) |
| T-008 documentation | not_done | No text describes closure |
| T-009 verification | not_done | Suites listed in the TP exist and pass on the current tree |

## Reuse Strategy

- extend: `run-steps.js` closeout path for the new internal step, `run-operations.js` kinds, the journal allow-lists, the backlog closeout move and `recordBacklogSummary`.
- extend: `run-command-contract.js` and `run-command-service.js` with the two kinds and a kind-limited target-scoped envelope; tool registration in `packages/cli/lib/mcp-dispatch-runtime.js:250-265` derives tools from groups and needs no change.
- extend: `gate-policy.js` with an ended branch beside `completed`; `gate-check.js:224` delivery state follows it.
- new: `packages/core/lib/control-state/run-closure.js` and a pure identity helper; previews are written only through `atomicWrite` (`run-state-writer.js:48`) because the MCP safety test limits file-writing modules (`packages/mcp-server/test/safety.test.js:74-91`) and forbids `node:child_process` (`:35-44`).
- reuse: `run-recovery.js:17-36` digest and phrase approach as a pattern, not as code to share; recovery previews are tracked in Git, so closure previews are versioned the same way.

## Change Impact

- Files: as listed in TP section 4, plus `gate-check.js` for the delivery state.
- Interfaces: CLI gains `run-close`; MCP `agdf_closeout` gains two kinds; the run command envelope gains a kind-limited variant.
- Data: new Run Operations kind `lifecycle_close.record`; new directory `.agdf/control/closure-previews/`; `RUN_STATE.md` lifecycle values `superseded` and `abandoned` become reachable.
- Backwards compatibility: `completed` behavior unchanged; older runtimes fail closed on the new receipt kind.
- Regression tests: closeout command, run-step transaction, MCP protocol, run-command, safety and tool-error tests, cockpit MCP test, companion suite, doctor and delivery-map tests.
- Side effects: tool lists in READMEs stay valid because the tool count does not change; `verified-change.js:88,109`, `control-maintenance/compatibility.js:94-101` and `decision-content-readiness.js:68` only distinguish `completed` or `active` and need no change; companion `gate-bar.mjs:27,37` and `state.mjs:26` never see ended runs because `assignment.mjs:12` lists only active runs.

## Parallel-Structure And SoT Risks

- No parallel writer: closure commits through the existing run-step transaction.
- No second identity source: one pure helper serves CLI and MCP.
- The preview file is non-authorizing; the receipt in the sealed run is the record.

## Risks

- Schema budget of `agdf_closeout` (8192 bytes per tool, 24576 aggregate) may be reached.
- The kind-limited envelope must not relax `run_id` and `expected_revision_id` for existing kinds.
- The writer guard must not block the closure write itself, which runs while the lifecycle is still `active`.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE
- context_graph_required_action: update at closeout with the closure transition, receipt kind and ended-run guard

## Required Next Step

Start CD+Tests with the lifecycle guard test written first and recorded failing against the current writer (SCN-012), then T-001 to T-008.
