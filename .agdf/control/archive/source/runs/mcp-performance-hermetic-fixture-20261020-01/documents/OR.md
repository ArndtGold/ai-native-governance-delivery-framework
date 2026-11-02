# OR-lite: Hermetic control fixture for the MCP performance test

Report mode: OR-lite
Run: `mcp-performance-hermetic-fixture-20261020-01`
Route: `quick_task` (Compact Delivery)
Date: 2026-10-20

## Result

packages/mcp-server test:performance now measures the unchanged budgets (cold tools/list p95 <= 1500 ms, warm agdf_dispatch p95 <= 1000 ms, 20 runs) on a hermetic control: run agdf-mcp-dispatch-server plus control root files without AGDF_RUN.md (31 files instead of 9,365); fixture size is recorded in the evidence line; createOwnedRuntimeFixture default unchanged for its 13 other consumers.

## Evidence

CD_TESTS.md and evidence/PERFORMANCE_EVIDENCE.json: new test 7/7 pass locally (warm p95 662-849 ms), interleaved A/B previous full-control test failed 2/3 (warm p95 1062/1073 ms); gate-check result content identical on both fixtures; test:continuation, test:protocol, test:provenance, test:late-source-revision, test:package pass; Code Review pass (CODE_REVIEW.md, CR-01/CR-02 resolved).

## Risk

CI confirmation on Win22/Linux pending; the test no longer reflects dispatch latency growth with run history (product follow-up on per-dispatch cost proposed); fixture still depends on run agdf-mcp-dispatch-server and the control root files; local cold p95 reached 1493 ms once under load (unchanged by this run).

## Next Step

Owner commits this branch and opens the pull request; CI must confirm the Win22 warm p95 reduction. No VCS action was performed by AGDF.
