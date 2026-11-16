# CD+Tests: Companion shows planned URs instead of an empty state

Gate: CD+Tests
Type: CD+Tests
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- approved_tp: sha256:6254af66bc0d28ccac7c827da33d71fdb8d33323f71a584ac5a4617e657a2198
- branch: feat/companion-planned-ur (base 13c10af7), uncommitted working tree
- executed_by: Claude (agent)
- executed_at: 2026-11-16

## Tasks

| task_id | Result | Evidence |
|---|---|---|
| T-001 | done | `packages/core/lib/companion/run-view.js`: `readUrFacts`, `readPlannedView`, `planned` in `projectRunView`, captured read with `[]` fallback in `readRunView` |
| T-002 | done | `plugins/agdf/meta/agdf-interaction-locales.json` (`companion.planned`, `companion.statusStates.planned`, de/en); `packages/core/lib/interaction-catalog-validation.js` key set |
| T-003 | done | `run-state.mjs` `companionPlan` and snapshot `planned`; `assignment.mjs` `pickPlan` |
| T-004 | done | `view.mjs` planned branch and terminal lines; `register.mjs` `shownId`, note line |
| T-005 | done | `notice.mjs` observed kind `planned`, status text |
| T-006 | done | `register.mjs` fingerprint over `.agdf/control/planned` names and known planned folder files |
| T-007 | done | new cases in `packages/core/test/companion-run-view-test.js`, `packages/cli/scripts/claude-companion-test.js`, `packages/cli/scripts/claude-companion-adapter-test.js` |
| T-008 | done | `npm run build:mcp` (built), `node scripts/sync-package-assets.js` (decision UI digest sha256:8db1d442...), generated payload inventory stats 459 files / 4,825,942 bytes equal `copilot-payload-baseline.json` (max_files 459, max_bytes 4825942), `node scripts/host-compatibility/run.mjs record` and `check` (0 failed, source fingerprint e757cc4a...); new observation `evals/host-compatibility/observations/64ad0d2f...json` referenced by `docs/compatibility/evidence/snapshot.json`; the stale unreferenced candidate observation `e588831f...json` was removed |
| T-009 | done | PNG `begleiter-ur-planung-run.png` rendered from the real code path (temporary project with planned UR -> `readRunView` -> `snapshotFromRunView` -> `buildPanelView` -> `figureSvg`, `statusText`): three panels draft working, draft resting, ready; texts "schreibt am UR-Entwurf", "UR-Entwurf steht an", "UR bereit zur Übergabe", route "UR-Planung · noch kein Run", status "AGDF · UR-Planung" |

No source deviation from the SD was found in Brownfield Analysis, so no source correction was needed in this phase.

## Test Results

All commands run locally on Windows, Node from the repository, after the T-008 chain.

| Check | Scenarios | Result |
|---|---|---|
| `npm run test:claude-companion` (packages/cli) | SCN-002, SCN-003, SCN-004, SCN-006, SCN-009, SCN-010, SCN-011 | pass |
| `npm run test:companion-run-view` (packages/cli) | SCN-001, SCN-005, SCN-007, SCN-008, SCN-012 | pass |
| `node scripts/interaction-catalog-test.js` | SCN-010 | pass |
| `node scripts/payload-budget-test.js` | SCN-013 | pass |
| `node scripts/copilot-profile-test.js` | SCN-013 | pass |
| `node scripts/package-contents-test.js` | SCN-013 | pass |
| `npm run test:skill-evals` | SCN-013 | pass |
| `npm run eval:skills` | SCN-013 | pass |
| `npm run test:operational-localization` | SCN-013 | pass |
| `npm run test:interaction-presentation` | SCN-013 | pass |
| `node scripts/host-compatibility-test.js` | SCN-013 | pass |
| `node scripts/run-view-command-test.js` | SCN-012 | pass |
| `npm run test:planned-urs` | SCN-013 | pass |
| `npm run build:prepare` (root) | SCN-013 | pass (release coherence 49 surfaces at 0.32.0, public plugin tests, prepare passed) |
| `node scripts/check-community-health.mjs` | SCN-013 | pass |
| `node scripts/host-compatibility/run.mjs check` | SCN-013 | pass, 0 failed |
| packages/control-ui `npm run typecheck` | SCN-013 | pass |
| packages/control-ui `npm test` | SCN-013 | pass, 32 files, 353 of 353 tests |

## Gaps

- The live Claude companion pane was not exercised; visual evidence is the rendered PNG from the real code path.
- Symlink tests outside the TP list fail with EPERM on this Windows host (known host limit, unrelated).
- Browser tests of packages/control-ui (`npm run test:browser`) are not part of the TP list and were not run.

## Decision

- decision: pass
