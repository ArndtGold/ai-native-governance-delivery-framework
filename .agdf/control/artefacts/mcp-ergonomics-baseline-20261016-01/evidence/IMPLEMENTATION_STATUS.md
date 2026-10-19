# Implementation Status (CD+Tests in progress)

Run: mcp-ergonomics-baseline-20261016-01 · Branch: `feat/mcp-ergonomics-baseline` (from `main` `5ff1b512`) · Date: 2026-10-16

## Done

| task_id | Result |
|---|---|
| T-001 | Branch created from `main`; the former work on `feat/claude-install-fix` was already merged as PR #16. This run's control files were committed earlier by the owner in `0db0fae0` and are on `main`. |
| T-002 | Pre-change `tools/list` captured (`TOOLS_LIST_BEFORE.json`): 7 `agdf` tools, 31,889 definition bytes; cockpit hidden without UI capability, 2 tools with it. |
| T-003 | Spike done (`SPIKE_T003.json`, `SPIKE_T003_FINDINGS.md`); native runs need an external terminal; owner decisions recorded. |
| T-004 | `scripts/native-probes/lib/claude-session.mjs` extracted; `claude-host-e2e.mjs` uses it with an identical parsed summary (unit test) and the corrected install path `packages/cli/bin/create-agdf.js`. |
| T-005 | `evals/mcp-ergonomics/` with `METRICS.md`, normalization and classification; cockpit `state: blocked` counted as `agdf_failure`. |
| T-006 | Fixtures F1–F5 (F5 through the expanded builder plus UAT approval and OR-full), `call-matrix.v1.json`, protocol runner. |
| T-007 | `tasks.v1.json`, success predicates, native runner with rounds, cost cap, variant verification and isolation manifests. |
| T-008 | Report, `findings-map.v1.json`, promote with fail-closed redaction, compare (protocol, native, tools/list). |
| T-009 | 24 unit tests (`npm run test:mcp-ergonomics`); root scripts; verify-ci repository-lane stage `mcp-ergonomics` with its assertion; stage run passes. |
| T-010 | Two protocol runs identical in every non-timing metric (`PROTOCOL_RUN_A.json`, `PROTOCOL_RUN_B.json`, `COMPARISONS.json`): 30 calls; 14 ok, 8 sdk_validation, 8 agdf_failure, all 8 failures without `isError`. |
| T-013 (partial) | Post-change `tools/list` byte-identical (`TOOLS_LIST_AFTER.json`); diff scope within allowed paths (no change under `packages/`); compatibility evidence re-recorded, `compatibility:check` passes (56 scenarios); `npm run build`, `npm run test:verification`, `npm run test:host-compatibility`, mcp-server `test:package` and `test:sdk-digest` pass. |

## Open

- T-011 native run: must be executed by the owner from a terminal outside Claude Desktop after updating Claude Code (owner decision, `SPIKE_T003_FINDINGS.md`); the native runner has not yet run end to end.
- T-012 promote and compare against the promoted baseline, after T-011.
- Pre-existing failure, unchanged by this run: `packages/mcp-server` `test:performance` reports warm dispatch p95 2,477.8 ms against its 1,000 ms budget on this Windows machine (review finding F09). No file under `packages/` changed in this run.
