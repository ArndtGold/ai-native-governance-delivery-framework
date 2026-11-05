# Code Review

Run: run-8ede6acb-e0ce-4072-907a-aedad626635c
Mode: quick_task (Compact Delivery)
Reviewed diff: `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/mcp-server/test/pre-dispatch-failure.test.js` (new), `packages/mcp-server/package.json` (`test:protocol` registration)
Reviewers: independent general-purpose review agent (read-only, given code and acceptance criteria, not the author's conclusion) on 2026-11-05; findings resolved and re-verified by the implementing agent.

## Code Review

- decision: pass
- findings: No open defect. Eight review findings were raised on the first version; five are resolved in the final diff (normalized below). Two pre-existing classification remarks and one readability nit are outside this run's approved scope or already absorbed.
- evidence: Final diff; `node ./test/pre-dispatch-failure.test.js` passes for facade legacy, facade modern and plugin generation (the production `generation-runtime.js` path) and failed with `effect_unknown` against the previous build; MCP server suites `test:protocol`, `test:run-command-flow`, `test:generation`, `test:contract`, `test:safety` pass; CLI `test:mcp-lifecycle`, `test:plugin-mcp-runtime` (222 tool-error classification cases), `control-inspect-test`, `active-run-inventory-test`, `control-command-package-test`, `test:claude-plugin-mcp` pass.
- missing_evidence: No native Claude CLI re-run against an installed build of this change; the native evidence of 2026-11-05 shows the defect on the released 0.30.0 runtime only.
- risks: `PREPARATION_REASONS` maps four Core reason families onto existing tool-error codes; a future Core reason without a classified code still falls back to `dispatch_worker_failed` with `not_dispatched` (honest, but with generic guidance). Pre-existing: `material_transfer_expired` sits in the `retry_after_prerequisite` category, so the rejected envelope does not say "restage"; `material_binding_invalid` and `stale_revision` cover more than one cause in the material store. Both are outside this run's non-goals.
- required_next_step: Record the verification evidence and this review, then continue delivery to OR-lite closeout.

## Reviewed Behavior And Error Paths

- Both call sites evaluate `prepareDispatch` as an argument expression before `executor.execute` (`packages/mcp-server/src/server.js:137-138`, `packages/mcp-server/src/generation-runtime.js:74`); nothing is dispatched or written before a preparation failure. `inputContextFor` is a lookup; `grants()` and `current()` only read control state and touch in-memory staging rows.
- `preDispatchFailure` returns typed facts accepted by `validExecutionFacts`; `normalizeFailure` (`packages/cli/lib/mcp-protocol-runtime.js:65-66`) uses them before any phase rule, so `failure()` projects `outcome: rejected`, `dispatch: not_dispatched` and "No command was dispatched by this attempt." for both protocol eras.
- `generation-runtime.js:82` adds an operation to its `unknown` set only when `dispatch !== 'not_dispatched'`; a preparation failure therefore no longer protects the generation from retirement indefinitely.
- Failures after dispatch are untouched: the try/catch covers only the preparation body.
- Errors that already carry valid facts keep their details (`field`, `diagnostic`); only `dispatch` is forced to `not_dispatched`.
- A pending run step is refused earlier by input resolution with `original_operation_unconfirmed` / `not_dispatched`; the new test pins that behavior.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | Reviewer: Core reasons without a classified code (`run_step_recovery_required`, `AGDF_PLANNED_RECOVERY_REQUIRED`, `AGDF_PLANNED_SOURCE_STALE`, `run_state_invalid`, `run_id_invalid`, `AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED`) collapsed to `dispatch_worker_failed`. Final `PREPARATION_REASONS` in `packages/cli/lib/mcp-dispatch-runtime.js` maps them onto the existing codes `recovery_required`, `planning_source_stale`, `invalid_run`, `control_layout_unsupported`; asserted directly in `pre-dispatch-failure.test.js`. | none |
| CR-F02 | evidence_gap | evidence_obligation | resolved | Reviewer: the production plugin generation path (`generation-runtime.js`) was not exercised. The final test runs a third variant with `pluginSourceRoot` and passes. | none |
| CR-F03 | evidence_gap | evidence_obligation | resolved | Reviewer: unclassified fallback, facts passthrough and `material_binding_mismatch` were unproven. The final test asserts the fallback (`TypeError` → `dispatch_worker_failed`/`not_dispatched`), the passthrough and a cross-Run `material_binding_mismatch` through the MCP path. | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | Reviewer: passthrough could forward `dispatch: unknown` facts. `preDispatchFailure` now forces `dispatch: 'not_dispatched'` while preserving the error object and its other fields; asserted in the test. | none |
| CR-F05 | evidence_gap | evidence_obligation | resolved | Reviewer: the control digest ignored directory entries. `controlDigest` in the test now hashes directory and file entries. | none |

## Out-Of-Scope Observations

- Reviewer nit (readability): use `knownExecutionCode` instead of a duplicate check; applied.
- Reviewer note: `material_transfer_expired` guidance category and multi-cause `material_binding_invalid` / `stale_revision` are pre-existing classification semantics; changing them is a declared non-goal of the approved UR and is left for a separate run.

## Context Graph Reconciliation

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The change restores existing error-contract behavior and adds no long-lived decision or source of truth.
