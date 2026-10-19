# Brownfield Analysis: MCP ergonomics baseline evaluation

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: pre_implementation_analysis
Status: done
Decision: pass

## Run

- run_id: mcp-ergonomics-baseline-20261016-01
- related_tp: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md (approved)
- reviewer: Claude Code (claude-opus-5-5)
- reviewed_at: 2026-10-16
- baseline: branch `feat/mcp-ergonomics-baseline` created from `main` at `5ff1b512`, clean worktree

## Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- scope: T-001 to T-013 of the approved TP.
- evidence: inspected `packages/mcp-server/test/helpers.js` (`withStdioClient` with `modern`, `capabilities`, `env`, `cwd`), `packages/mcp-server/test/owned-runtime.js` (`createOwnedRuntimeFixture`), `packages/mcp-server/test/performance.test.js`, `packages/cli/scripts/fixtures/prd-definition.js` (`createPrdDefinitionTestRun`), `packages/cli/scripts/fixtures/expanded-source-revision.js`, `packages/cli/scripts/fixtures/late-source-revision.js` (`sourceRevisionTestProposal`), `scripts/native-probes/claude-host-e2e.mjs`, `evals/lib/skill-evals/workspace.js`, `evals/scripts/`, root `package.json`, `scripts/verify-ci.mjs`, `scripts/verification-test.mjs`, `scripts/host-compatibility/run.mjs`, `docs/compatibility/evidence/snapshot.json`; Claude Code 2.1.268 `--help`.
- missing_evidence: actual Claude Code behavior of `--disable-slash-commands` and `disableAllHooks` and the exact stream-json fields; both are the explicit subject of the T-003 spike.
- current_coverage: per-call latency for one `agdf_dispatch` shape exists (`performance.test.js`) — `partially_done`; native single-call probe exists but cannot install (see below) — `partially_done`; evaluation owner, metrics, task set, baseline — `not_done`.
- reuse_strategy: `extend` by import (MCP client harness, owned-runtime fixture, fixture builders, workspace snapshots) and `refactor` by extraction (Claude session parsing, redaction, isolation and install into `scripts/native-probes/lib/claude-session.mjs`).
- risks: see Regression Risks.
- context_graph_impact: `link_only` at closeout, if the promoted baseline becomes the reference for later MCP phases.
- required_next_step: CD+Tests along the implementation path below.

## Owners And Reuse

| Area | Existing owner | Reuse |
|---|---|---|
| MCP client | `packages/mcp-server/test/helpers.js` `withStdioClient` | import; pass `modern: true`, `capabilities` with the MCP App UI extension for the cockpit-with-UI measurement, and an explicit `command`/`args` |
| Owned runtime | `packages/mcp-server/test/owned-runtime.js` `createOwnedRuntimeFixture` | import; it returns `args` with `--surface codex`, so the protocol runner builds its own args with `--surface claude` and `--cockpit-dir`; its copied repository control under `governance-target` is never a measured target (SDD-003) |
| Fixture states | `packages/cli/scripts/fixtures/prd-definition.js`, `expanded-source-revision.js`, `late-source-revision.js` | import for F2/F3/F4 (run with approved UR and registered PRD, presentation), F5 (chain to UAT) and the reviewed UR proposal for `agdf_revise` |
| Native host isolation and parsing | inline in `scripts/native-probes/claude-host-e2e.mjs` | extract into `scripts/native-probes/lib/claude-session.mjs`; the probe imports it |
| Fixture mutation proof | `evals/lib/skill-evals/workspace.js` (`snapshotWorkspace`, `changedPaths`, `mutationViolations`) | import |
| CI registration | `scripts/verify-ci.mjs` stage list; `scripts/verification-test.mjs` | add a repository-lane stage `mcp-ergonomics` after `host-compatibility` and one assertion |
| Compatibility evidence | `scripts/host-compatibility/run.mjs`; `docs/compatibility/evidence/snapshot.json` | re-record after the root `package.json` change |

## Findings

- The native probe installs through `create-agdf/bin/create-agdf.js` (line 93), which no longer exists since commit `89e87cbf` moved the CLI to `packages/cli/bin/create-agdf.js`; `npm run native:claude-e2e` therefore cannot install today. The shared module from T-004 uses `packages/cli/bin/create-agdf.js`; the probe keeps its output format and regains a working install step. This is a pre-existing defect corrected inside SDD-006, not new scope. `codex-host-e2e.mjs` has the same stale path and stays out of scope (Codex follow-up slice).
- `dist/npm/create-agdf` was assembled at 08:57, before the merge `5ff1b512` at 09:43; the owned-runtime fixture copies it, so T-002 must run `npm run build` first.
- The compatibility snapshot hashes the root `package.json` but not `scripts/verify-ci.mjs`, `scripts/native-probes/` or new `evals/mcp-ergonomics/` files; only the root `package.json` change requires re-recording. The recorder now normalizes CR bytes (`run.mjs` line 22), which removes the earlier Windows CRLF trap.
- `npm run build` runs the `compatibility-freshness` stage, which fails between the root `package.json` change and the re-recording; T-013 re-records before the final build check.

## Implementation Path

1. T-002: `npm run build`, then the capture script writes normalized `tools/list` for `agdf` (`--surface claude`) and `agdf-cockpit` (without and with UI capability) to `probe-results/`.
2. T-003: spike in an isolated home through the shared module's install helper (first slice of T-004).
3. T-004 to T-009 in TP order; root `package.json` scripts and the verify-ci stage last within T-009.
4. T-010 to T-012 measurements and promote; T-013 capture, diff scope, suites, `compatibility:record` and `check`.

## Regression Risks

- Probe refactor: verified on a recorded synthetic stream (identical parsed summary) and by one native probe run in the spike.
- `scripts/verification-test.mjs` asserts stage order; the new stage carries no `build` flag, so the build-profile assertion stays unchanged.
- SDK input-validation text from `@modelcontextprotocol/server` 2.0.0 is pinned by a unit test so an SDK update surfaces as a test failure.
- Native runs read the real `~/.claude/.credentials.json`; the copy is deleted in `finally`, and the isolation manifests verify the real configuration subset.

## Test Impact

New `test:mcp-ergonomics` suite (offline); `scripts/verification-test.mjs` gains one assertion; `npm --prefix packages/mcp-server test` and `npm run test:verification` must stay green; no existing assertion is weakened.

## Reassessment Under The Renewed TP

- reviewed_at: 2026-10-17
- reviewer: Claude Code (claude-opus-5-5)
- trigger: UR source revision `ad5a4176-32d1-4b55-a42f-779bb2d8eaee` (2026-10-16) changed only the localized AGDF Approval Summary of the UR; UR, PRD, SD and TP were renewed with unchanged English content and approved again on 2026-10-17.
- result: the pre-implementation analysis above still holds for the renewed TP, which is byte-identical to the previously approved TP. Owners, reuse path, regression risks and the implementation path are unchanged; the implementation that now exists followed this path, and nothing under `packages/` changed.
