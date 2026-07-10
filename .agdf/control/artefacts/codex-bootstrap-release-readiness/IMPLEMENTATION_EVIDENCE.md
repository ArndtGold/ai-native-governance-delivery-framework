# Implementation Evidence: Surface Bootstrap and Registry Readiness

## Status

- status: completed
- gate: CD+Tests
- implemented_at: 2026-07-10

## Implemented Tasks

| Task ID | Status | Evidence |
|---|---|---|
| T01 | completed | `create-agdf/bin/create-agdf.js` now runs Codex marketplace add, `plugin marketplace upgrade agdf`, plugin add, then `plugin list`; smoke test stubs assert exact ordering. |
| T02 | completed | Codex install compares `agdf@agdf` list version with `pluginDefinition.version` and exits with expected/observed/corrective command on mismatch; smoke test covers mismatch. |
| T03 | completed | Claude bootstrap now uses marketplace add/update and `plugin install agdf@agdf` or `plugin update agdf@agdf`; smoke tests assert both paths and absence of `plugin add`. |
| T04 | completed | Claude version is verified when exposed; no-version list output reports the verification limitation without claiming a version; smoke test covers the limitation. |
| T05 | completed | Copilot rerun refreshes AGDF-owned generated files, preserves existing `.agdf/control/config.json`, preserves user-owned root `AGENTS.md`, and refreshes `AGENTS.agdf.md`. |
| T06 | completed | Root `AGENTS.md` refresh occurs only when canonical AGDF ownership markers are present; user-owned or ambiguous root files are preserved. |
| T07 | completed | `assertGeneratedWritePlan` checks generated writes before writing, preventing partial updates from blocked overwrite cases. |
| T08 | completed | `.github/workflows/publish-agdf.yml` now waits after both publish steps for exact `create-agdf@<version>` and `@agdf/cli@<version>` npm resolvability with bounded attempts and diagnostics. |
| T09 | completed | Existing `sync-package-assets` path remains the source for generated package content; smoke test ran through that sync path. |
| T10 | completed | CLI output names verified versions, Claude verification limitation, refreshed files and preserved files; smoke tests assert key diagnostics. |

## Changed Files

| File | Change |
|---|---|
| `create-agdf/bin/create-agdf.js` | Added Codex/Claude refresh and version checks, conservative Copilot ownership handling, precomputed write-plan validation and clearer generated/preserved output. |
| `create-agdf/scripts/smoke-test.js` | Added fake Codex/Claude executable tests, Copilot rerun ownership fixtures and publish workflow readiness assertions. |
| `.github/workflows/publish-agdf.yml` | Added bounded post-publish npm readiness polling for both packages. |

## Validation

| Check | Result |
|---|---|
| `npm --prefix create-agdf run smoke-test` | pass |
| `npm --prefix agdf run smoke-test` | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass |
| `npx --yes @agdf/cli@latest doctor --json` | pass, 0 findings |
| `git diff --check` | pass |

## Known Limits

- Real Codex and Claude Code CLI output can evolve. Parsing is intentionally tolerant and tests use stubbed executables rather than private cache paths.
- The GitHub Actions publish polling step is validated statically through smoke coverage; it was not executed against a live release in this implementation.

## Required Next Step

Perform Task Plan Review, Clean Implementation Review and Code Review before QA.
