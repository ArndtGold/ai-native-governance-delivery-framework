# Code Review: AGDF Companion in the Claude Projection of the AGDF Plugin

Decision: pass
Status: `pass`

## Scope

- run_id: `agdf-begleiter-companion-20261025-01`
- reviewed_at: 2026-10-26
- reviewer: Claude Code implementing agent. The first review (`CODE_REVIEW-input-01.md`, decision revise) combined the agent's own pass with an independent read-only review by a separate agent instance. This re-review checks each correction and its test.
- diff: the same change set as review 01, plus the corrections in:
  - `plugins/agdf/host-templates/claude/companion/{register,run-state,state,persistence}.mjs`;
  - `packages/cli/scripts/claude-companion-{test,adapter-test}.js`;
  - `plugins/agdf/meta/contracts/gate-transition.md`, `plugins/agdf/meta/copilot-payload-baseline.json`, `docs/maintenance/payload-budget-history.md`;
  - eval fingerprints and compatibility evidence.

## Code Review

- decision: pass
- findings: none open. The table below lists all eleven findings from review 01 as resolved, with their evidence.
- owner decisions (2026-10-26):
  - CR-F02 is fixed in the companion without an SD source revision. This is a documented deviation from the enumerated SDD-04 parser fields. A source revision from gate CR is not supported by the AGDF core: no `sourceRevisionBoundary` for UR, PRD, SD or TP at CR.
  - CR-F11 is handled as a documented mixed-version limit instead of a new receipt policy version.
- verification:
  - `claude-companion-test`, `claude-companion-adapter-test`, `claude-companion-integrity-test`, `runtime-integrity-negative-test`, `public-plugin-test` and `claude-plugin-mcp-test` pass.
  - The runtime integrity check passes in source and installed mode.
  - The instruction-footprint, request-activation, skill-eval and proportionality suites pass.
  - `expanded-source-revision-test` (22 cells) and the source-revision, run-revision and early-UR revision tests pass.
- mutation check: each of the eleven defects was re-introduced one at a time (twelve mutations, including the timer order) and failed its owning suite.
- native:
  - `claude plugin validate` on the generated runtime plugin passed. It lists the six hooks, with `.catch` on `command.run` and `ui.close`.
  - `claude plugin test` passed 2/2 on a scratch copy of the corrected generated plugin. The test file's session clock was moved after its fixtures, so freshly written runs no longer count as changed in the session.
- payload and evidence:
  - The Copilot inventory is 397 files / 3,495,901 bytes (+362 for the CR-F11 contract note), reviewed with a cumulative rationale and a history entry.
  - Seven skill-eval fingerprints were moved again for the gate-transition text; 113/113 pass.
  - Compatibility was re-recorded (56 scenarios, 0 failed) and the check passes. The superseded observation `dca12bd7…` was removed.
- missing_evidence:
  - A full `npm run verify:ci` on the corrected change set is running; QA must see its result.
  - Linux and macOS CI run with the pull request.
  - The installed desktop build predates these corrections. A renewed live check of the hidden-pane and blocked states belongs to UAT.
- risks:
  - Runs revised from Brownfield Analysis need the same or newer AGDF on every host (documented).
  - The blockiert reading depends on the canonical writers' row and control-table texts. The logic suite binds both to the real writers.
- required_next_step: Run the QA gate with the completed `verify:ci` result.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-F01 | implementation_gap | CD+Tests | resolved | `register.mjs` compares `e.origin?.kind === 'person'`; the adapter test fires `{ kind: 'plugin' }` and `{ kind: 'person' }` and checks the timer; the mutation back to the string comparison fails the suite | none |
| CR-F02 | design_gap | SD | resolved | `run-state.mjs` reads the current gate's Artefacts row (CR for Quick Task Execution) and the control-table presentation decision; `state.mjs` maps revise, block and blocked rows, `reject` to decline and `request_change` to revise. The logic suite uses the canonical `recordRunStep` review revise and `recordRunPresentationDecision` reject with core-reader parity. Real runs at CR and QA revise now read blockiert. Resolved in the companion by the owner decision of 2026-10-26, without an SD source revision, as a documented SDD-04 deviation | none |
| CR-F03 | implementation_gap | CD+Tests | resolved | `parseCompanionState` returns `defaultCompanionState()`; the logic suite asserts mutable defaults; the adapter suite selects a run after an invalid state file | none |
| CR-F04 | implementation_gap | CD+Tests | resolved | `persist` re-reads `companion-state.json` and writes only the change; the two-session adapter test keeps the other session's still pose and selection | none |
| CR-F05 | implementation_gap | CD+Tests | resolved | `turn.complete` clears the overlay on every main-loop completion; the adapter test switches off and on during a turn | none |
| CR-F06 | implementation_gap | CD+Tests | resolved | `command.run` shows a hidden pane again without changing the stored choice; covered by an adapter test | none |
| CR-F07 | implementation_gap | CD+Tests | resolved | `refresh` applies only the newest read; `startRefreshing` replaces the timer before reading; adapter tests cover overlapping reads and overlapping starts (one live timer) | none |
| CR-F08 | implementation_gap | CD+Tests | resolved | `refresh` reads `$.session.root()` each time; the adapter test switches the root to another project and back | none |
| CR-F09 | implementation_gap | CD+Tests | resolved | the selection is dropped only when the snapshot has runs; the adapter test hides the `runs/` folder and keeps the selection | none |
| CR-F10 | implementation_gap | CD+Tests | resolved | `turn.complete` starts the read with `void refresh($)`; the adapter test proves the hook returns before the delayed read finishes | none |
| CR-F11 | emergent_risk | CD+Tests | resolved | owner decision of 2026-10-26: documented limit instead of a new receipt policy; `gate-transition.md` states that runtimes released before Brownfield Analysis became an initiating phase treat such Runs as damaged and that all hosts need the same or newer AGDF; payload, history, fingerprints and compatibility were renewed | none |
