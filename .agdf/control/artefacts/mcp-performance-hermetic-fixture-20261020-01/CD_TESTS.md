# CD+Tests: Hermetic control fixture for the MCP performance test

Gate: CD+Tests
Type: Compact Delivery evidence
Status: done
Decision: pass

## Run

- run_id: mcp-performance-hermetic-fixture-20261020-01
- related_ur: .agdf/control/artefacts/mcp-performance-hermetic-fixture-20261020-01/UR.md (approved)
- mode: `quick_task` (Compact Delivery), see BROWNFIELD_REVIEW.md
- implemented_at: 2026-10-20
- code_state: branch `claude/zealous-dijkstra-767443` on main `a8a867a3`, plus the cherry-picked owner-decided removal of the partial run (`3d3c62ff` from PR #22, here `fbb73a73`), plus this run's uncommitted changes
- machine: Windows 11 Enterprise 10.0.26200, Node v22.22.3, win32-x64; local developer machine, not a CI runner

## Changes

- `packages/mcp-server/test/owned-runtime.js`: new opt-in option `controlRuns` for `createOwnedRuntimeFixture`. When set, the governance target's `.agdf/control` holds only the listed runs (`runs/<id>`, `artefacts/<id>`) and the regular control root files, without the legacy projection `AGDF_RUN.md`. Without the option the previous whole-tree copy runs unchanged.
- `packages/mcp-server/test/performance.test.js`: uses `controlRuns: ["agdf-mcp-dispatch-server"]`; asserts that `runs/` and `artefacts/` hold exactly that run and that `AGDF_RUN.md` is absent; adds `fixture` (control kind, runs, file count, byte count) to the JSON evidence line. Budgets unchanged: cold `tools/list` p95 <= 1500 ms, warm `agdf_dispatch` p95 <= 1000 ms, 20 runs each.

## Acceptance Signals

| Acceptance signal (UR section 5) | Result | Evidence |
|---|---|---|
| Governance target holds only the target run and the root files without `AGDF_RUN.md`, independent of the repository's run count | pass | Assertions in `performance.test.js`; evidence line `fixture`: 1 run, 31 files, 728,744 bytes (full control: 137 runs, 9,365 files, about 337 MB). |
| Gate-check result for the target run identical in content to the full control (excluding timing, paths, runtime evidence) | pass | `evidence/PERFORMANCE_EVIDENCE.json` `result_equivalence`: both `control_result`, `blocked`, `AGDF_RUN_SEAL_INVALID`; content identical; `control_ms` 343 (full) vs 84 (hermetic). |
| Evidence line records runs, files and bytes | pass | `fixture` object in every recorded run. |
| Budgets unchanged; test passes repeatedly on the local Windows machine | pass | 7 of 7 runs of the new test pass: warm p95 666, 730, 811, 662, 779, 849, 711 ms; cold p95 741-1493 ms. |
| Other consumers of `createOwnedRuntimeFixture` still receive the full control | pass | Default path unchanged in the diff; `test:continuation`, `test:protocol`, `test:provenance`, `test:late-source-revision` and `test:package` pass. |

## Measurements

Interleaved A/B on the same build and machine (previous test with full repository control vs new test), 20 warm dispatches each:

| pair | previous: warm p50 / p95 (result) | new: warm p50 / p95 (result) |
|---|---|---|
| 1 | 864 / 1062 ms (fail) | 563 / 662 ms (pass) |
| 2 | 871 / 928 ms (pass) | 572 / 779 ms (pass) |
| 3 | 882 / 1073 ms (fail) | 599 / 849 ms (pass) |

The previous test failed 2 of 3 times on this machine; the new test passed every time. Warm p50 dropped by about 290 ms. Raw samples are in `evidence/PERFORMANCE_EVIDENCE.json`.

## Commands

- `npm --prefix packages/mcp-server run test:performance` (7 runs, all pass)
- `node ./test/performance.test.js` from the previous commit in `packages/mcp-server` (3 runs, A/B baseline; temporary copy removed)
- `npm --prefix packages/mcp-server run test:continuation`, `test:protocol`, `test:provenance`, `test:late-source-revision`, `test:package` (all pass)
- one-off equivalence script comparing in-process gate-check results on both fixtures (result in `evidence/PERFORMANCE_EVIDENCE.json`)
- `git diff --check` (pass)

## Missing Evidence

- CI confirmation on the Win22, Linux 22 and Linux 24 runners; expected after the pull request runs.
- The cold `tools/list` p95 reached 1493 ms once locally while this machine was under load; cold start does not read control and is unchanged by this run (CI Win22 measured 556-884 ms).

## Risks

- The test no longer measures dispatch latency growth with run history; this product signal belongs to the proposed follow-up on per-dispatch cost.
- The fixture still depends on the content of run `agdf-mcp-dispatch-server` and the control root files.
