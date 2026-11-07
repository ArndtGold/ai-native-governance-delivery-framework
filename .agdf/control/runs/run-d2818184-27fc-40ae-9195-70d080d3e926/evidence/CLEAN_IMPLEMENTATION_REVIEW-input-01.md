# Clean Implementation Review: Companion core in Core (run view, MCP events, figure states)

Decision: revise
Gate: QA
Type: Clean Implementation Review
Reviewer: Claude (reviewing agent for Arndt Gold), with an independent read-only scan by a separate agent whose candidates were each re-checked in the code
reviewed_at: 2026-11-06
run_id: run-d2818184-27fc-40ae-9195-70d080d3e926

## Scope

The uncommitted change on branch `feat/companion-core-run-view` against main `53e8e900` after the CR corrections (CR pass, revision 34), judged against the approved SD (SDD-001 to SDD-010, section 2 ownership statements and section 4 integration points), the approved TP and the Brownfield Analysis reuse path. This review assesses solution integrity: primary solution, fallbacks, catch-alls, mirrors of owner values, parallel structures and Brownfield fit. Defects already corrected in CR (CR-A1 to CR-C6) and the owner-decided items C1 to C5 are not repeated.

## Clean Implementation Review

- decision: revise
- primary_solution: Sound. The run view is projected from the unchanged `evaluateGateCheck` report (status fields copied from the status card, `gate-check.js` byte-identical to `53e8e900`); the companion obtains it only through the read-only `run-view` command via `$.process.run` and imports no Core module; events are derived by one pure function and journaled once by the executing process at the final result projection; review facts and drift reuse the node digest owner `artefactFileDigest`; companion texts live in the central catalog.
- evidence: `packages/core/lib/companion/run-view.js`, `figure-state.js`, `events.js`, `journal.js`; `packages/mcp-server/src/server.js`, `generation-runtime.js`; `packages/cli/lib/mcp-dispatch-runtime.js`, `mcp-lifecycle/plugin-runtime.js`, `cli/project-read-command.js`; `plugins/agdf/host-templates/claude/companion/*.mjs`; `packages/core/lib/interaction-catalog.js`; the TP test routes executed for the TP Review on the same tree.
- fallbacks_retained: Journal write and observation errors are swallowed (`journal.js` append/observe, `server.js` and `generation-runtime.js` hook wrappers): justified by SDD-006 (notification channel, tool result unchanged). The companion keeps the last good view marked stale on a failed read: justified by SDD-010. A thrown run evaluation is shown as an unreadable run with a bounded reason (`run-view.js`, CR-A7): visible, not masked. Two fallbacks have no rationale (CIR-05, CIR-06).
- workaround_or_shim_risk: The journal data root reaches Core as the ambient environment variable `AGDF_COMPANION_DATA_ROOT` (default parameter of `createCompanionJournal`) instead of an explicit runtime-context argument; accepted because forked generations inherit it and the launcher sets it in the facade environment only, but the dependency is implicit. Timeout detection by message text in the companion (CIR-06).
- parallel_structure_risk: Run-view entries carry two unused extra state classifications next to the status card fields and the figure state (CIR-02). Several owner values are copied instead of imported or pinned (CIR-04). The unreadable-run reason is re-derived from code strings instead of the existing classification rule (CIR-03).
- brownfield_fit: Good for the evaluator, digest owner, run inventory, tool-result projection and the `project-state` command pattern. Deviates from the TP/SD integration point `captureControlScope` for the reader (CIR-01).
- missing_evidence: none beyond the TP Review; this review needs no additional runtime proof.
- required_next_step: Correct CIR-01 to CIR-06 in CD+Tests with targeted re-verification, then re-record CD+Tests, CR for the delta and this review.

## Findings

- [medium] `packages/core/lib/companion/run-view.js:125-149` - `readRunView` evaluates inside `withControlReadMemo` (the CLI read seam) although TP T-002 and SD section 4 name `captureControlScope` as the reader's integration point; the memo seam gives no bounded read (`READ_LIMITS`) and no `source_changed` revalidation, and the deviation is recorded nowhere (CIR-01).
- [medium] `run-view.js:49,72` - every entry carries `attention` (inventory) and `assessment` (`projectCockpitAssessment`) besides `figure`; no consumer, harness or test reads them, `assessment` classifies a pending approval as `blocked` while the figure says `wartet`, and the module itself states it never re-derives a gate rule (SDD-001); as part of `run-view/1` they would become host-neutral API (CIR-02).
- [low] `run-view.js:19-28` - `diagnosisReason` maps finding code strings through `boundedCode` plus a local `MISSING_CODES` set; the owner rule elsewhere uses `finding.classification` (`run-state-resolver.js:15`, `cockpit.js:241`), and `AGDF_RUN_STATE_MISSING` is produced nowhere in Core (CIR-03).
- [low] mirrors without owner import or pin (CIR-04): `events.js:21-23` `COMMAND_TOOLS` (copy of `commandNames` in `mcp-tool-errors.js:17`) and `STEP_SLOTS` (copy of the slot map in `run-steps.js:135`); `interaction-catalog.js` `COMPANION_UNREADABLE_REASONS` (mirror of the `boundedCode` set and `DIAGNOSIS_REASONS`); companion `events.mjs` journal file and directory names and `JOURNAL_READ_LIMIT` (512 KiB) against the writer's 256 KiB; companion `run-state.mjs` `BUILD_GATES`/`isStructured` used by the gate bar's build mark. Pinned already: `EVENT_KINDS`, `TOAST_KINDS`, parse parity, `TOOL_RESULT_META_KEY`, the launcher's `COMPANION_JOURNAL`.
- [low] `packages/cli/lib/cli/project-read-command.js:8-11` - `readLanguage` turns an invalid `config.json` into English with exit 0, unlike `executeProjectRead` beside it, which leaves the language to Core so the invalid configuration is reported; no SD rationale and no test (CIR-05).
- [low] `plugins/agdf/host-templates/claude/companion/run-state.mjs:69-70` - a rejected `$.process.run` is labelled `timeout` when its message matches `/time/iu` (also "runtime"); the host API documents rejection on timeout without a message format, and the tests use an invented message (CIR-06).

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CIR-01 | implementation_gap | CD+Tests | open | TP T-002 ("evaluates every active run with the unchanged `evaluateGateCheck` inside `captureControlScope`") and SD section 4 (`captureControlScope` for the reader) against `run-view.js:125-149`, which uses `withControlReadMemo`; no contradiction entry, CD+Tests or CR record names the deviation; the cockpit's multi-run read uses `captureControlScope` (`cockpit.js:254`) | Run the `readRunView` evaluation inside `captureControlScope` as T-002 requires, then re-run SCN-001, SCN-002, the golden test and the run-view timing on this repository's store |
| CIR-02 | implementation_gap | CD+Tests | open | `run-view.js` `projectRunEntry` emits `attention` and `assessment` (cockpit rule) beside the status card fields; grep finds no reader in the companion, the host-neutral harness or any test; the assessment classifies state differently from the status card and the figure (SDD-001, SDD-004) | Remove `attention` and `assessment` from the run-view entries (and the then unused import), then re-run SCN-001, SCN-002 and SCN-007 |
| CIR-03 | implementation_gap | CD+Tests | open | `run-view.js` `diagnosisReason`/`MISSING_CODES` re-derives the per-run reason from code strings; the owner rule is `finding.classification === 'unsupported_version'` (`run-state-resolver.js:15`, `cockpit.js:241`); `AGDF_RUN_STATE_MISSING` has no producer in `packages/core/lib` | Derive the per-run reason from the inventory findings' classification like the existing owners, drop the dead code, and re-run SCN-004 and SCN-006 |
| CIR-04 | implementation_gap | CD+Tests | open | Unpinned copies of owner values: `events.js` `COMMAND_TOOLS` and `STEP_SLOTS`, `interaction-catalog.js` `COMPANION_UNREADABLE_REASONS`, companion `events.mjs` journal names and read limit, companion `run-state.mjs` `BUILD_GATES`/`isStructured`; Brownfield Analysis requires reuse of existing owners, and SDD-010 allows mirrors only where the companion cannot import Core | Import the Core-side copies from their owners (exporting the owner sets where needed) and add parity assertions for each remaining companion mirror, then re-run `test:claude-companion` and `companion-events-test.js` |
| CIR-05 | implementation_gap | CD+Tests | open | `project-read-command.js:8-11` swallows an invalid configuration into `en` with exit 0; the sibling `executeProjectRead` and the `gate-check` handler let Core report it; no SDD covers this fallback | Remove the catch so an invalid configuration is reported as in `executeProjectRead`, and add the negative case to `run-view-command-test.js` |
| CIR-06 | implementation_gap | CD+Tests | open | `run-state.mjs:69-70` classifies a rejected process call by `/time/iu` on its message; `$.process.run` documents a rejection on timeout but no message, and the adapter tests feed an invented text; SDD-010 requires the reason of a failed read to be shown | Classify a timeout by the elapsed time against `RUN_VIEW_TIMEOUT_MS` instead of the message text, and add a case whose message contains "runtime" |

## Reviewer Observations Not Adopted

| Observation | Why not adopted |
|---|---|
| `run-view.js` returns `evaluation_error: boundedCode(error)`, so an evaluator `TypeError` shows as `read_failed` | The run is shown as unreadable with a reason instead of idle (CR-A7) and the other runs stay readable; the status card command still surfaces the exception itself. No masking of state, only of the diagnostic text |
| The data root as environment variable inside Core | Recorded under workaround risk above; it reaches forked generations without a new runtime parameter, the launcher sets it in the facade environment only (CD+Tests defect correction) and tests pin the variable name to the launcher |
| `server.js` early denial (`resource_denied`, `host_ui_unsupported`) returns without a journal line | The path is reached only in cockpit mode with a required UI capability (`server.js:75`, Codex), which this run excludes (Codex UI and event consumption are out of scope) |
| The gate bar adds a build-phase mark in the companion | Presentation of the run view's gate and mode carried over from the earlier companion run; its constants are covered by CIR-04 |

## Required Next Step

Correct CIR-01 to CIR-06 in CD+Tests with targeted re-verification, then re-record CD+Tests, CR for the delta and this review.
