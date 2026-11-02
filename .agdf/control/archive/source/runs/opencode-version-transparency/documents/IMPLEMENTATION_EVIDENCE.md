# Implementation Evidence: OpenCode Version Transparency

## Outcome

OpenCode now reports the installed AGDF package version, canonical expected version and deterministic version status in both human and JSON status output. The installer captures an operation-only previous/current transition without persistent version history or changes to governance, skill or enforcement ownership.

## Task coverage

| task_id | status | evidence |
|---|---|---|
| OVT-01 | done | `resolveOpenCodePackage()` reads the installed package manifest associated with the resolved OpenCode package entrypoint and returns an explicit unknown state when metadata is unavailable. |
| OVT-02 | done | `openCodePackageVersionStatus()` classifies current, outdated, unknown and unloadable states against `pluginDefinition.version`. |
| OVT-03 | done | `opencode-status --json` adds `installed_version`, `expected_version` and `version_status` under the existing `package` object. |
| OVT-04 | done | Human installer/status output now shows package version, expected version and status, with actionable repair wording for non-current states. |
| OVT-05 | done | Installer captures previous/current state and reports new-install, updated, unchanged or unknown transition without persistent history. |
| OVT-06 | done | Existing global native surface, repository boundary, ownership preflight, permissions and `instruction_only` classification remain unchanged. |
| OVT-07 | done | Smoke fixtures cover current, outdated, versionless/unknown and unloadable packages, plus new-install output and schema compatibility. |
| OVT-08 | done | Aggregate package/CLI/Pages/integrity/doctor/diff validation completed successfully. |

## Runtime evidence

- Installed OpenCode package: `0.6.9`
- Expected canonical version: `0.6.9`
- Runtime status: `current`
- Resolved package path: `/Users/arndtgold/.npm/_npx/5114e6c1491aac60/node_modules/create-agdf/opencode-plugin.js`
- Global native surface remains complete at 9/9 skills.

## Verification

| Check | Result |
|---|---|
| `node create-agdf/scripts/smoke-test.js` | pass |
| `npm --prefix create-agdf run smoke-test` | pass; aggregate suite and routing render pass |
| `npm --prefix agdf run smoke-test` | pass |
| `npm --prefix pages run check` | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass |
| current installed OpenCode status probe | pass; installed/expected `0.6.9`, status `current` |
| `node create-agdf/bin/create-agdf.js doctor --json` | pass; 0 findings |
| `git diff --check` | pass |

## Boundaries and deviations

- No persistent version history or second package/version source was created.
- No new command or required parameter was added.
- No global `.agdf/control/` state, skill namespace or enforcement claim changed.
- No commit, push, pull request or release was performed.

## Required next review

Run Task Plan Review, then Clean Implementation Review, Code Review and QA Gate.

