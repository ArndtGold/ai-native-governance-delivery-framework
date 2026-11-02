# CD+Tests: Pinned and verified plugin MCP SDK acquisition

Status: done
Gate: CD+Tests
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01
Based on: approved TP

## Implemented Tasks

| task_id | Change |
|---|---|
| T-001 | `packages/mcp-server/sdk-runtime-digest.json` (committed expected digest and locked package list), `scripts/write-mcp-sdk-digest.mjs`, root script `mcp:sdk-digest`, drift test `packages/mcp-server/test/sdk-digest.test.js` (`test:sdk-digest`, part of `npm test`) |
| T-002 | `scripts/sync-plugin-mcp.js`: `runtimeSdkClosure`, `renderPluginMcpSdkBundle`; writes `mcp/sdk/{package.json,package-lock.json,expected-sdk.json}` and refuses a stale digest source |
| T-003 | `packages/cli/lib/mcp-lifecycle/package.js`: `installLocked` (`npm ci --ignore-scripts --no-audit --no-fund --omit=dev`), optional `expectedSdk` with exact package-set check before any digest and digest check, marker field `sdk_verification`, `inspectMcpServerPackage` exposes `sdkVerification` |
| T-004 | `packages/cli/lib/mcp-lifecycle/plugin-runtime.js`: `readPluginSdkBundle`, `AGDF_MCP_ALLOW_UNVERIFIED_SDK` override, re-verification of existing runtimes against the expected digest, same check in the concurrent-session fallback |
| T-005 | `launcherFailureLine`: one stderr line with code, cause, recovery; override warning on prepare and start |
| T-006 | `scripts/support/plugin-mcp-fixture.js` accepts only the locked `ci` form (lock equality, `--omit=dev`, `--ignore-scripts`) or the override `install` form; scenario tests in `packages/cli/scripts/plugin-mcp-runtime-test.js`; adjusted assertions in Claude and Codex plugin MCP tests |
| T-007 | `docs/architecture/README.md` §6.1, `PRIVACY.md` |
| T-008 | Payloads regenerated (`sync-package-assets.js`, `assemble-npm.mjs`); `check-runtime-integrity.mjs` requires the three `mcp/sdk/*` files |

## Test Evidence

| scenario_id | Evidence | Result |
|---|---|---|
| SCN-001 | `plugin-mcp-runtime-test.js` fresh preparation: npm calls `["ci"]`, fixture asserts shipped lock, marker `verified`, digest equals `expected-sdk.json` | pass |
| SCN-002 | extra package `left-pad` → `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH`, no runtime | pass |
| SCN-003 | missing `zod` → `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH`, no runtime | pass |
| SCN-004 | changed `zod/package.json` → `AGDF_MCP_SDK_DIGEST_MISMATCH`, no runtime | pass |
| SCN-005 | npm failure (`EINTEGRITY`) → `AGDF_MCP_PACKAGE_ACQUISITION_FAILED`, no runtime | pass |
| SCN-006 | verified runtime reused with an exec that throws | pass |
| SCN-007 | tampered SDK file → one `ci` reinstall | pass |
| SCN-008 | override: install form, marker `unverified_override`, one stderr warning on `--prepare` | pass |
| SCN-009 | override removed → `ci` reinstall, marker `verified` | pass |
| SCN-010 | `sdk-digest.test.js`: committed digest equals installed tree; altered digest differs | pass |
| SCN-011 | `sdk-digest.test.js`: bundle lock holds exactly server, core, zod, no dev entry; stale source refused | pass |
| SCN-012 | refused start prints one line with code, cause and recovery; `launcherFailureLine` for unowned root | pass |
| SCN-013 | inspection: generated hooks, skills, `agdf-session-check.js`, `agdf-local.js` do not reference the launcher or `plugin-runtime.js` | pass |
| SCN-014 | doc diff; 106 relative links and anchors in README and PRIVACY resolve | pass |
| SCN-015 | `check-runtime-integrity.mjs` (source and generated) pass; `mcp-lifecycle`, `plugin-mcp-runtime`, `claude-plugin-mcp`, `codex-plugin-mcp`, `cli-modularization`, `local-development-install` pass; `packages/mcp-server` `npm test` (incl. protocol) pass; `community-health`, `check-package-boundaries` pass | pass |

## Notes

- `local-development-install-test.js` failed once with Windows `EPERM` renaming `dist/local/codex/.npm-stage-*`;
  the immediate rerun passed. No code path of this run is involved; recorded as environment flake.
- Prerequisite executed: `npm ci` in `packages/mcp-server` (dev install from the reviewed lock).
- Not executed: a real npm-backed `--prepare` against the registry (host evidence, optional per TP).
