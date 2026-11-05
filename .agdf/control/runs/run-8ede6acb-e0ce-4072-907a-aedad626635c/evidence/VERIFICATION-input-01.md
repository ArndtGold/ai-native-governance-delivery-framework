# Verification Evidence: Report pre-dispatch MCP command failures as not dispatched

Run: run-8ede6acb-e0ce-4072-907a-aedad626635c
Recorded: 2026-11-05, Windows 11 (win32/x64), Node v22.22.3, repository main 575d6df9 plus the uncommitted diff below.

## Changed Paths

- `packages/cli/lib/mcp-dispatch-runtime.js`: `preDispatchFailure` and `PREPARATION_REASONS`; `prepareDispatch` rethrows preparation failures with typed `not_dispatched` facts.
- `packages/mcp-server/test/pre-dispatch-failure.test.js` (new) and its registration in `packages/mcp-server/package.json` (`test:protocol`).
- Derived, re-recorded by existing tooling: `docs/compatibility/HOST_COMPATIBILITY.md`, `docs/compatibility/evidence/facts.json`, `docs/compatibility/evidence/snapshot.json`, `evals/host-compatibility/observations/f1cc2d1d2d3c8c1638c6579e452d97c3160bcfcc7e2f9f58da8c8e62c3ebdc4d.json`.
- Unchanged: `plugins/agdf/meta/copilot-payload-baseline.json` (observed 442 files / 4,509,357 bytes within 453 / 4,717,872).

## Defect Reproduction

- Native Claude CLI 2.1.302 probe against released AGDF 0.30.0 (ignored `probe-results/cli-mcp-20261105/`): reused consumed material reference returned `effect_unknown` / `dispatch_worker_failed` for `step.record` and `source_revision.preview`.
- `node ./test/pre-dispatch-failure.test.js` against the build before the fix: failed with `actual: 'effect_unknown', expected: 'rejected'`.

## Checks After The Fix (final diff, rebuilt with `npm run build:prepare`)

| Command | Result |
|---|---|
| `npm run build:prepare` | pass (116 s) |
| `node packages/mcp-server/test/pre-dispatch-failure.test.js` | pass: facade legacy, facade modern, plugin generation |
| `npm --prefix packages/mcp-server run test:protocol` | pass (695 s) |
| `npm --prefix packages/mcp-server run test:run-command-flow` | pass (2108 s) |
| `npm --prefix packages/mcp-server run test:generation` | pass (240 s) |
| `npm --prefix packages/mcp-server run test:contract` | pass (22 s) |
| `npm --prefix packages/mcp-server run test:safety` | pass (9 s) |
| `npm --prefix packages/cli run test:mcp-lifecycle` | pass (238 s) |
| `npm --prefix packages/cli run test:plugin-mcp-runtime` | pass (360 s; 222 tool-error classification cases) |
| `node packages/cli/scripts/control-inspect-test.js` | pass |
| `node packages/cli/scripts/active-run-inventory-test.js` | pass |
| `node packages/cli/scripts/control-command-package-test.js` | pass (1509 packed files) |
| `npm --prefix packages/cli run test:claude-plugin-mcp` | pass |
| `npm --prefix packages/cli run test:copilot-profile` | pass (inventory, drift, exclusions, growth) |
| `node scripts/payload-budget.js` | 442 files / 4,509,357 bytes, headroom 11 files / 208,515 bytes |
| `npm run compatibility:check` before re-record | fail `source_snapshot_changed`; only `mcp-dispatch-runtime.js`, `packages/mcp-server/package.json` and derived payload digests differed |
| `npm run compatibility:record`, then `npm run compatibility:check` | pass; 56 deterministic scenarios, 0 unexpected failures; source fingerprint a9cfdd1b189dc72103c8d847cb3a95034c8214f27df2d20e099ab3a76f3ea531 |

## Acceptance Signal Mapping

| UR acceptance signal | Evidence |
|---|---|
| Consumed reference, current revision → `rejected` / `material_transfer_expired` / `not_dispatched` / `isError` | `pre-dispatch-failure.test.js`, `agdf_record` and `agdf_revise`, all three variants |
| Outdated `expected_revision_id` → `rejected` / `stale_revision` / `not_dispatched` | same test |
| Unexpected preparation exception → `not_dispatched` / `dispatch_worker_failed` | direct `preDispatchFailure` assertion (`TypeError`) |
| Failure after dispatch still `effect_unknown` | unchanged code path; existing `tool-errors.test.js` effect-unknown assertions pass in `test:protocol` |
| Control folder byte-identical after rejected calls | `controlDigest` (files and directories) compared around every rejected call |
| Existing MCP server, tool-error and material tests green | suites listed above |

## Limits

- The compatibility record was previously produced on macOS (2026-11-04) and is now re-recorded on native Windows; it remains a deterministic simulated-host record without fresh-host or native-host proof.
- No native Claude CLI re-run against an installed build of this change.
