# Task/Test Plan: Surface Bootstrap and Registry Readiness

## Status

- status: approved
- approval: Approval: TP (2026-07-10)
- derived_from: PRD and SD for `codex-bootstrap-release-readiness`
- created_at: 2026-07-10

## Objective

Implement the approved cross-surface bootstrap and release-readiness design with focused regression coverage.

## Task Plan

| Task ID | Area | Task | Acceptance Evidence |
|---|---|---|---|
| T01 | Codex bootstrap | Extend `create-agdf/bin/create-agdf.js` so the Codex global bootstrap adds the AGDF marketplace, refreshes it with `codex plugin marketplace upgrade agdf`, installs `agdf --marketplace agdf`, then inspects `codex plugin list` for `agdf@agdf`. | Stubbed Codex smoke test records add, upgrade, add-plugin, list ordering and confirms expected version success. |
| T02 | Codex mismatch failure | Add installed-version extraction and actionable failure when Codex does not expose the expected `pluginDefinition.version` or exposes a different version. | Stubbed Codex smoke test exits non-zero on mismatch and asserts the error names expected version, observed version or missing evidence, and the corrective command. |
| T03 | Claude bootstrap | Replace the unsupported Claude `plugin add` flow with supported marketplace add/update plus `plugin install agdf@agdf` for absent plugins and `plugin update agdf@agdf` for existing plugins. | Stubbed Claude smoke tests cover first install and update paths and assert `plugin add` is not invoked. |
| T04 | Claude verification limits | Verify Claude plugin version when exposed by `claude plugin list`; when not exposed, report the limitation and the supported verification command without claiming a verified version. | Stubbed Claude smoke tests cover exposed-version success and no-version informational output. |
| T05 | Copilot safe rerun | Add target-aware overwrite policy for Copilot reruns: refresh AGDF-owned generated files, preserve `.agdf/control/config.json`, preserve user-owned or ambiguous `AGENTS.md`, and refresh `AGENTS.agdf.md`. | Smoke fixtures show a second Copilot bootstrap succeeds without `--force`, preserves user `AGENTS.md`, preserves config language, refreshes AGDF-owned files, and reports preserved/refreshed files. |
| T06 | Copilot AGDF-owned root | Allow root `AGENTS.md` refresh only when canonical AGDF ownership is positively identified. | Smoke fixture shows canonical AGDF root `AGENTS.md` is refreshed and user/ambiguous root files are not overwritten. |
| T07 | Atomic write planning | Precompute Copilot write permissions before writing any file, avoiding partial update results. | Smoke fixture verifies an unsafe ambiguous case leaves already-existing files unchanged except allowed AGDF fragment refresh. |
| T08 | Publish readiness | Extend `.github/workflows/publish-agdf.yml` after both publish steps with bounded exact-version npm polling for `create-agdf@<version>` and `@agdf/cli@<version>`. | Static smoke assertion verifies both exact package checks, retry bounds, timeout failure, and diagnostics for package, version, attempts and last error. |
| T09 | Source synchronization | Keep generated package content derived from canonical `plugin/` and existing sync scripts; do not manually edit generated output as an independent source. | Smoke/runtime validation confirms generated assets remain synchronized. |
| T10 | Documentation and messages | Keep user-facing command output explicit about refresh, installed version, preserved files, and verification limits. | Smoke tests assert key diagnostic text for version mismatch, Claude no-version limitation, Copilot preservation and npm timeout. |

## Test Plan

| Test ID | Covers | Method | Expected Result |
|---|---|---|---|
| TT01 | T01, T02 | Extend `create-agdf/scripts/smoke-test.js` with fake `codex` executable on temporary `PATH`. | Codex command sequence and mismatch failure are deterministic and isolated from real user config. |
| TT02 | T03, T04 | Extend smoke test with fake `claude` executable on temporary `PATH`. | Claude uses supported verbs, chooses install/update correctly, and reports version verification truthfully. |
| TT03 | T05, T06, T07 | Extend Copilot temporary-directory fixtures for first run, rerun, user-owned root, AGDF-owned root and language config preservation. | Rerun updates only AGDF-owned files and does not require blanket `--force`. |
| TT04 | T08 | Add static workflow assertion in smoke test for exact npm readiness polling. | Publish workflow cannot pass smoke coverage without both exact package checks and bounded retry controls. |
| TT05 | T09 | Run existing package sync through the smoke-test path. | Generated package assets remain derived and consistent. |

## Required Validation

- `npm --prefix create-agdf run smoke-test`
- `node plugin/scripts/check-runtime-integrity.mjs`
- `git diff --check`

## Review Gates After Implementation

After `Approval: TP`, implementation must be preceded by implementation-prep Brownfield Analysis because the slice touches existing bootstrappers, generated-file ownership, external CLI adapters and release workflow behavior. After code changes, run Task Plan Review, Clean Implementation Review and Code Review before QA.

## Out Of Scope

- Publishing, tagging or releasing packages.
- Changing Codex, Claude Code or npm registry behavior.
- Adding a second bootstrap executable, second release workflow or parallel generated-source authority.
- Overwriting user-owned root `AGENTS.md` without explicit `--force`.

## Approval Request

Exact approval required to start implementation:

`Approval: TP`
