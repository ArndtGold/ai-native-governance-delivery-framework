# UAT Report: OpenCode Registry Installation and Runtime Integrity

## Status

- decision: `pass`
- gate: `UAT`
- gate_approval: `Approval: UAT`
- date: `2026-07-15`

## Acceptance Evidence

| Acceptance area | Result | Evidence |
|---|---|---|
| Real legacy-state reproduction | pass | Before UAT, `~/.config/opencode/package.json` contained `create-agdf: file:../../.npm/_npx/5114e6c1491aac60/node_modules/create-agdf`; the lock entry was a linked path to the same npx cache. |
| Exact registry migration | pass | Running the working-source `opencode` command changed the dependency and lock root to exact `0.6.9`; the installed lock entry resolves to `https://registry.npmjs.org/create-agdf/-/create-agdf-0.6.9.tgz`, contains integrity metadata and is not a link. |
| Cache independence | pass | The installed plugin realpath is `~/.config/opencode/node_modules/create-agdf/opencode-plugin.js`; package and lock inspection contains no `file:`, `.npm/_npx`, temporary-folder or workspace-source reference. |
| Package loadability | pass | Direct ESM loading of the configured plugin passed and exposed `AGDFPlugin` and `default`; `opencode-status --json` reports the same config-local resolved path and `loadable: true`. |
| Version transparency | pass | Installer and JSON status report installed version `0.6.9`, expected version `0.6.9` and version status `current`. |
| Existing state preservation | pass | `@opencode-ai/plugin: 1.17.11`, plugin registration `create-agdf`, instruction `AGDF.md` and skill permission `agdf-* = allow` remain present. |
| Global native surface | pass | Status reports all 9 expected global skills, the global instruction file and Runtime Contract as complete. |
| Repository activation boundary | pass | Status continues to state that this repository has no `.opencode` repository surface and gives `opencode-repo` as the explicit activation step; global installation did not silently create repository-owned state. |

## Findings

- UAT decision: `pass`.
- The reported fragile npx-cache `file:` dependency was reproduced in the user's real global OpenCode configuration and repaired by the new installer path.
- No acceptance defect remains.
- OpenCode reports no active AGDF session signal in the status subprocess. Restarting OpenCode is still required for an already-running app process to reload the updated global package state; this is expected session behavior, not an installation defect.

## Boundaries And Residual Risks

- Native Windows execution remains outside this macOS UAT. The cross-platform fake npm seam and automated regression evidence remain the accepted QA evidence for that platform boundary.
- The installed registry package version is `0.6.9`, matching the working source's canonical version. UAT validates the new local installer's migration behavior against the published package; publication of a future version remains a separate release action.
- No repository-local OpenCode surface was installed, because `opencode-repo` is intentionally a separate opt-in action.
- No commit, push, pull request or release was performed.

## Required Next Step

UAT accepted. Perform delivery closeout. VCS and release actions remain separately authorized operations.
