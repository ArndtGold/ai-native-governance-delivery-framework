# Clean Checkout Verification (AC-012, SCN-019)

Run: mcp-ergonomics-baseline-20261016-01 · Date: 2026-10-17 · Reviewer: Claude Code (claude-opus-5-5) during the TP Review

Obligation: TP SCN-019, "Root scripts for both layers and compare exist and run from a clean checkout
after build" (PRD AC-012). Until this review the commands had only run in the working tree.

## Method

Nothing of this run is committed yet, so a clean checkout of the delivered content was built as:
a fresh local `git clone` of `16d08888` in a temporary directory, plus the run's change set copied
on top (every path from `git diff HEAD --name-only` and `git ls-files --others --exclude-standard`,
114 paths, all within the SDD-014 allowed scope). No ignored file (dependencies, build output,
`probe-results`) was copied. The real working tree was not touched.

## Attempt 1: documented sequence before this review

`npm ci`, `npm run build`, then the documented commands.

| Step | Exit |
|---|---|
| `npm ci` | 0 |
| `npm run build` | 0 |
| `npm run test:mcp-ergonomics` | 1 (4 of 15 top-level test entries fail: two test files cannot load, two tests need the SDK) |
| `npm run eval:mcp-ergonomics:protocol` | 1 |
| `npm run eval:mcp-ergonomics:compare -- --baseline ... --protocol ...` | 1 |
| `npm run eval:mcp-ergonomics:native -- --dry-run` | 1 |

Every failure is `ERR_MODULE_NOT_FOUND` for `@modelcontextprotocol/client`, imported by
`packages/mcp-server/test/helpers.js` (the reused MCP test harness, SDD-002). That SDK comes from the
separate `packages/mcp-server` lock, which neither `npm ci` at the root nor `npm run build` installs.
`CONTRIBUTING.md` (Local validation) lists `npm --prefix packages/mcp-server ci --ignore-scripts`, but
`evals/mcp-ergonomics/README.md` named only `npm run build`.

CI is not affected: `scripts/verify-ci.mjs` runs the stage `mcp-dependencies` before `mcp-ergonomics`,
and `scripts/ci-plan.mjs` keeps `mcp-dependencies` as a prerequisite of every partition.

## Correction

`evals/mcp-ergonomics/README.md` gained a Setup section with the three install and build commands and
a link to `CONTRIBUTING.md#local-validation`. No code changed.

## Attempt 2: corrected README sequence, fresh clone

| Step | Exit | Result |
|---|---|---|
| `npm ci --ignore-scripts` | 0 | |
| `npm run build` | 0 | includes the stored host-compatibility snapshot check |
| `npm --prefix packages/mcp-server ci --ignore-scripts` | 0 | |
| `npm run test:mcp-ergonomics` | 0 | 37 of 37 tests pass |
| `npm run eval:mcp-ergonomics:protocol -- --out <tmp>/protocol.json` | 0 | 32 matrix calls, five executions each |
| `npm run eval:mcp-ergonomics:compare -- --baseline evals/mcp-ergonomics/baselines/2026-10-16-win32-x64 --protocol <tmp>/protocol.json` | 0 | `unchanged`, 0 differences |
| `npm run eval:mcp-ergonomics:native -- --dry-run --out <tmp>/native-dry.json` | 0 | plan of 48 cells, cap 25 USD, round 1 before round 2 |
| `git status --short --untracked-files=no` | 0 | only the copied change set; the commands changed no tracked file |

## Limits

- The native command ran with `--dry-run` only: module loading, task set, plan and cap are verified in
  the clean checkout, but no paid session started there. Installation into the isolated home and the
  sessions themselves are proven by native run 3 and the CR-13 smoke from the working tree, which has
  the same tracked content and rebuilds the same ignored outputs.
- A local clone of the working repository stands in for a clone from the remote, because nothing is
  pushed yet.
