# UR: Payload budget CLI resolves the repository root

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: payload-budget-root-resolution-20261008-01
Language: en

## 1. Problem

`node scripts/payload-budget.js` fails with `ENOENT: no such file or directory, open 'C:\Workspace\plugins\agdf\meta\copilot-payload-baseline.json'`. The script computes its repository root as `fileURLToPath(new URL("../../", import.meta.url))` (`scripts/payload-budget.js:36`). The script lives directly in `scripts/`, so `../../` resolves to the parent of the repository. The two-level path dates from the script's former location `create-agdf/scripts/`; commit 89e87cbf moved it to `scripts/` without adjusting the path. As a result the maintainer cannot read the Copilot payload budget report or review a new budget through the CLI, and `npm --prefix packages/cli run payload:budget` fails the same way.

## 2. Goal

The payload budget CLI resolves the repository root from its own location. It prints the Copilot budget report and keeps its review guard for accepting new limits. An automated test fails if the CLI's root resolution regresses.

## Affected Users

AGDF maintainers who check or review the Copilot plugin payload budget, for example when a change adds plugin payload and the budget must be measured or re-reviewed.

## 3. Scope

- Correct the repository-root resolution in `scripts/payload-budget.js` to one level above `scripts/` (`new URL("../", import.meta.url)`), consistent with other scripts in `scripts/` such as `scripts/sync-plugin-mcp.js` (`resolve(scriptsRoot, "..")`).
- Verify that `node scripts/payload-budget.js` without `--accept` prints the budget report with observed values, limits, headroom and components.
- Verify that `--accept` still requires `--files`, `--bytes` and a meaningful `--reason` and refuses without writing when they are missing or insufficient.
- Extend the existing test `packages/cli/scripts/payload-budget-test.js` (covers `budgetReport` and `reviewedBudget`) so that it also covers the CLI's repository-root resolution.

## 4. Non-Goals

- No change to `plugins/agdf/meta/copilot-payload-baseline.json`. Its current working-tree modification belongs to other work and stays untouched; no verification step may write to it.
- No change to budget limits, `budgetReport`/`reviewedBudget` semantics, argument names or the `validateCopilotPayload` checks in `scripts/public-plugin/copilot-profile.js`.
- No change to other scripts, the generated Copilot profile or the plugin build.
- No Git commit, push or release in this scope.

## 5. Acceptance Signals

1. `node scripts/payload-budget.js` run from the repository root, and from another working directory, exits successfully and prints JSON with `profile`, `observed`, `limits`, `headroom`, `components` and `largest`; `limits` match the current baseline file.
2. `node scripts/payload-budget.js --accept` without `--files`/`--bytes`/`--reason`, or with a reason shorter than the required length, fails with `AGDF_PAYLOAD_BUDGET_REVIEW_REQUIRED`. `plugins/agdf/meta/copilot-payload-baseline.json` stays byte-identical.
3. `node packages/cli/scripts/payload-budget-test.js` passes and contains an assertion that fails with the old `../../` resolution.
4. `git diff` shows no change to `plugins/agdf/meta/copilot-payload-baseline.json` caused by this run.

## 6. Existing Source Of Truth

- The user's request in this conversation, including the observed error, the diagnosed cause and the explicit constraint on the baseline file.
- `scripts/payload-budget.js` (CLI and exported `budgetReport`/`reviewedBudget`).
- `packages/cli/scripts/payload-budget-test.js`, wired into root `test:maintenance-contracts` and `packages/cli` `test:payload-budget`; `packages/cli/package.json` script `payload:budget`.
- `scripts/public-plugin/copilot-profile.js` (`validateCopilotPayload`) and the generated profile `packages/cli/generated/plugins/copilot/agdf`.
- Root-resolution idiom in `scripts/sync-plugin-mcp.js`.

## 7. Risks And Unknowns

The full CLI report depends on a built Copilot profile under `packages/cli/generated/plugins/copilot/agdf` and on that profile matching the baseline. The working tree currently contains uncommitted changes to the baseline and plugin build scripts from another run, so a report failure for those reasons must be separated from the root-resolution fix. A CLI-level test must not depend on a build that a clean checkout or CI step does not provide, and must never run `--accept` with valid arguments against the real baseline. Brownfield Review should confirm the test placement and whether an exported root/baseline path or a child-process check fits the existing test style.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
