# Evidence: Declare the preview snapshot writer in the MCP safety write boundary

Run: mcp-safety-preview-write-boundary-20261019-01
Date: 2026-10-19
Change: commit 2595f362 on `fix/agdf-core-approval-defects-20261017` (PR #22), `packages/mcp-server/test/safety.test.js` only

## Change

- `continuationWriteOwners` declares `runtime/core/lib/control-state/preview-snapshot.js` with `writeFileSync`, `openSync`, `fsyncSync`.
- `assertExclusiveCreate` asserts exactly one `openSync(` call using `constants.O_CREAT | constants.O_EXCL | (constants.O_NOFOLLOW ?? 0)`; a positive control and three negative cases (missing `O_EXCL`, missing `O_NOFOLLOW`, a second `openSync`) expect `assert.AssertionError`.

## Local checks (Windows 11, Node 22.22.3)

| Check | Result |
|---|---|
| `npm --prefix packages/mcp-server run test:safety` | pass (static safety tests and abandoned-worker lock release) |
| Scan of the reachable graph with the test's own symbol rule | only `preview-snapshot.js` was beyond its declared boundary before the change (full graph 121 modules, read-only graph 89 modules) |
| mcp-server `npm test`, first full run | stopped in `structured-flow.test.js` at the `effect_unknown` branch while benchmarks and a review agent loaded the machine |
| mcp-server suites re-run without parallel load | `structured-flow`, `revision-command`, `expanded-source-revision`, `test:protocol`, `test:cockpit-gating`, `test:generation`, `test:safety`, `test:provenance`, `test:package`, `test:sdk-digest` pass; `test:performance` fails with warm p95 1064.6 ms > 1000 ms (known machine-dependent finding F09; cold p95 910.9 ms) |
| Earlier in the same tree: `test:contract`, `test:continuation`, `test:late-source-revision`, `run-command.test.js`, `decision-resource.test.js`, `whole-flow.test.js` | pass |
| `npm run test:verification` | pass (15/15) |
| `npm run build:prepare` | pass; no tracked file changed |
| `npm run compatibility:check` | pass; source fingerprint unchanged (`6a8e62db…`), the test file is not part of it |

## Performance comparison

The CI job "MCP · Win22 5of5" on 6bf406ec failed `test:performance` with warm p95 1043 ms and cold p95 860 ms; on `main` a66a14ca the same partition measured 612 ms and 556 ms. An in-process A/B of 15 warm `gate-check` dispatches (same fixture shape as `performance.test.js`) with branch or `main` Core code and branch or `main` control state gave medians of 300 to 385 ms in all four combinations, with no consistent difference. The cold `tools/list` time, which the branch's code does not touch, was 55 % slower in the failing job too. The failure is runner variance at the 1000 ms limit, not a regression of this branch.

## CI on the pushed commit

- GitHub tests the merge ref `refs/pull/22/merge` = c9b4e3f5 (2595f362 merged into `main` a8a867a3).
- "CI / Run safety · Linux22" fails at `delivery-map --dir . --all-active` with `AGDF_RUN_SEAL_MISMATCH`. Cause on `main` a8a867a3, not in this change: its run `mcp-error-contract-phase1-20261019-01` lists `UR.md`, `BROWNFIELD_REVIEW.md` and `UX_INTENT_DEFINITION.md` under `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/`, but none of them is committed. The same commit adds 40 duplicate files named `* 2.*`. Locally, without a8a867a3, `delivery-map --all-active` reports `revise` with no block.
- The MCP partitions of that CI run were still pending when this evidence was recorded.
