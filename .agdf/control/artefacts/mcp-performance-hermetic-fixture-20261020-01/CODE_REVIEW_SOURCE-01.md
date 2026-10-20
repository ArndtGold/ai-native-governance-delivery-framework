# Code Review: Hermetic control fixture for the MCP performance test

Gate: CR
Type: Code Review
Status: done
Decision: pass

## Run

- run_id: mcp-performance-hermetic-fixture-20261020-01
- related_ur: .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md (approved)
- reviewer: Claude Code (claude-opus-5-5) plus one independent read-only reviewer agent
- reviewed_at: 2026-10-20
- code_state: branch `claude/zealous-dijkstra-767443` (main `a8a867a3` plus `fbb73a73`) and this run's uncommitted changes
- supporting_evidence: `CD_TESTS.md`, `evidence/PERFORMANCE_EVIDENCE.json`

## Code Review

- scope: the actual diff in `packages/mcp-server/test/owned-runtime.js` and `packages/mcp-server/test/performance.test.js`; the legacy projection check in `packages/core/lib/control-evaluation/doctor.js` and `packages/core/lib/control-state/legacy-projection-reader.js`; the 13 other consumers of `createOwnedRuntimeFixture`.
- findings: two implementation findings, both resolved during this review (see Normalized Findings).
- missing_evidence: CI runs on Win22, Linux 22 and Linux 24 are pending until the pull request runs.
- risks: the fixture still depends on the content of run `agdf-mcp-dispatch-server` and the control root files; the test no longer reflects latency growth with run history.
- required_next_step: OR-lite closeout.

### Review evidence

- Default path unchanged: without `controlRuns` the fixture runs the same whole-tree `cpSync` as before; none of the 13 other consumers passes the option. `test:continuation`, `test:protocol`, `test:provenance`, `test:late-source-revision` and `test:package` pass.
- Budgets and assertions unchanged: cold p95 <= 1500 ms and warm p95 <= 1000 ms over 20 runs; the p95 formula, the `tools/list` name check, `outcome === "control_result"` and the 1 MiB size check are identical.
- An absent `AGDF_RUN.md` is valid: `verifyLegacyProjection` returns `absent`, `doctor.js` accepts `absent | valid` and skips the required-file check for `AGDF_RUN.md` when `runs/` exists. The gate-check result on the hermetic fixture equals the full-control result in content.
- The copied run is self-contained: `agdf-mcp-dispatch-server` is tracked and unmodified and references no parent, child or other run.
- Node and paths: `Dirent.parentPath` with recursive `withFileTypes` is available on Node 22 and 24 (engines `>=22`); all paths use `join`.
- Security: test-only code; no shipped file changes (`packages/mcp-server/package.json` `files` excludes `test/`), no new input surface.

### Observations, not findings

- A string passed as `controlRuns` would be iterated per character. The option is internal to tests and the only caller passes an array; no guard added.
- A future subfolder at the control root other than `runs/` and `artefacts/` would not be copied into the hermetic control. The current layout has none; the test's shape assertions keep the measured control explicit.
- The fixture is created outside `try` in `performance.test.js`, so a failed copy leaves the temporary root behind. This is unchanged pre-existing behaviour.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | `performance.test.js`: `control_bytes` was computed with `statSync` after the timing loop from a file list taken before it, so a changed control file could skew the figure or throw. | No further action; resolved in CD+Tests by computing `controlBytes` before the measurement loop. |
| CR-02 | implementation_gap | CD+Tests | resolved | `performance.test.js`: the hermetic-shape assertion covered only `runs/`, not `artefacts/`. | No further action; resolved in CD+Tests by also asserting that `artefacts/` holds exactly the target run. |
