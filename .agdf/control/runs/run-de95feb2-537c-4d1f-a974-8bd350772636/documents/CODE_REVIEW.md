# Code Review

- decision: pass
- run_id: run-de95feb2-537c-4d1f-a974-8bd350772636
- mode: quick_task (Compact Delivery)
- reviewer: independent general-purpose review agent (read-only, given the diff and the seven acceptance criteria, not the author's conclusion); findings resolved and re-verified by the implementing agent
- reviewed_at: 2026-11-10

Reviewed diff: `packages/core/lib/companion/{events,figure-state,journal,run-view}.js`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/mcp-server/src/{server,generation-runtime,generation}.js`, `plugins/agdf/host-templates/claude/companion/{notice,register,run-state,view}.mjs` and the five changed test files.

## Code Review

- decision: pass
- findings: No open defect. The independent review of the first version judged criterion 4 not met and raised six findings; five are resolved in the final diff and one is recorded as missing evidence (normalized below).
- evidence: Final diff; verification evidence of this run with the reproduction of each finding before its fix and the passing suites `test:claude-companion`, `test:companion-run-view`, `test:plugin-mcp-runtime`, `test:claude-plugin-mcp`, MCP server `test:protocol`, `test:safety`, `test:generation`, `test:contract`, and `compatibility:check` after `compatibility:record`.
- missing_evidence: No test forces a failing `send` after journaling inside `generation-runtime.js`; the rule is tested at the server and the facade only. The follow-up cases added after the review were not observed failing first. No native Claude run against an installed build.
- risks: A facade failure after the generation replied is recognised through the `generationResult` property that `generation.js` attaches to the thrown error; a future throw site outside `invoke` would journal a second event again. A run that always exceeds the read budget now causes one run-view call per 30-second check. Unreadable runs are no longer evaluated unless requested by id, so the `run-view` JSON carries no status card fields for them by default.
- required_next_step: Record this review, then continue delivery to OR-lite closeout.

## Reviewed Behavior And Error Paths

- `observeNotice` announces only reasons with a catalog text (`waitingApproval`, `waitingDecision`, `blocked`); an unreadable run still updates the observation, so a later block of the same run is announced.
- `fingerprint` lists the run folder, `documents` and `evidence`; nested evidence folders are not listed, and `readRunDrift` compares only bound report paths.
- `snapshotFromRunView` keeps failing the whole view for a store-level `timeout` or `source_changed` and for a single run's `source_changed`; a single run's `timeout` stays that run's reason and sets `retry`, which makes `refresh` keep no fingerprint.
- `server.js`: `journaled` is true when the local journal wrote an event, or when the result the generation returned leaves an event (`observesOutcome`); the catch path journals a failure only otherwise. Failures that never produced a result are journaled once as before (covered by the existing lost-connection case and a new owning-facade case).
- `deriveFigureState`: the blocked check uses only copied status card fields of an evaluated entry; summarized completed runs stay `fertig`; ended lifecycles are unchanged.
- `needsEvaluation`: the inventory's `valid` is always boolean; the unreadable reason and figure come from the inventory findings.
- `successKind` and `commandGate` cover every kind that `run-command-service.js` routes to `recordRunStep`; `reviewFacts` reads `payload.source` for both new kinds.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | Reviewer: the production facade (`packages/mcp-server/src/generation.js`) marks every tool `parentOwned`, so the first fix never set `journaled` there and a second event was still written. The final `server.js` asks `generationJournaled` after either execution branch and for a failure carrying `generationResult`; `companion-journal.test.js` covers the owning facade and the late failure. | none |
| CR-F02 | implementation_gap | CD+Tests | resolved | Reviewer: `journaled = true` was set even when the result left no event, so a later failure was dropped. `journaled` now takes the journal's own answer; `companion-journal.test.js` asserts one failure event after a result without an event, and `companion-events-test.js` asserts `observes()`. | none |
| CR-F03 | evidence_gap | evidence_obligation | open | Reviewer: the `generation-runtime.js` change has no test of its own. Recorded as missing evidence in this review and in the verification evidence; the same rule is tested at the server and the facade. | Add a generation-child test with a failing send in a later run. |
| CR-F04 | implementation_gap | CD+Tests | resolved | Reviewer: after fix 3 a one-off timeout of a run stayed shown until a file changed. `snapshotFromRunView` now sets `retry` and `refresh` keeps no fingerprint for such a view; asserted in `claude-companion-test.js`. | none |
| CR-F05 | evidence_gap | evidence_obligation | resolved | Reviewer: `reviewFacts` for the two new recording kinds was untested. `companion-events-test.js` now asserts slot, source and source match for both. | none |
| CR-F06 | implementation_gap | CD+Tests | resolved | Reviewer: a completed, blocked run showed no next step. `view.mjs` keeps the next step for such a run; asserted in `claude-companion-test.js`. | none |

## Out-Of-Scope Observations

- The seven untracked observation files and `.agdf/control/maintenance/` that were in the working tree before this run are untouched; the approved UR excludes a decision about them.

## Context Graph Reconciliation

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The change corrects existing companion behaviour and adds no long-lived decision or source of truth.
