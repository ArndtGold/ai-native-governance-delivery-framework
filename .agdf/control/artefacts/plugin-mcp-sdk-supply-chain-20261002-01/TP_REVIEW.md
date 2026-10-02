# Task Plan Review: Pinned and verified plugin MCP SDK acquisition

Status: done
Date: 2026-10-02
Run: plugin-mcp-sdk-supply-chain-20261002-01
Decision: pass

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | `packages/mcp-server/sdk-runtime-digest.json`, `scripts/write-mcp-sdk-digest.mjs`, root `mcp:sdk-digest`, `test/sdk-digest.test.js` pass (SCN-010) — high | none | none |
| T-002 | fully_done | `renderPluginMcpSdkBundle` and `runtimeSdkClosure` in `scripts/sync-plugin-mcp.js`; generated `mcp/sdk/*` present; bundle lock = server, core, zod; stale source refused (SCN-011) — high | none | none |
| T-003 | fully_done | `verifyStageSdk`, `installLocked`, `sdk_verification` in `package.js`; SCN-002/003/004 pass; registered path unchanged (`mcp-lifecycle-test.js`) — high | none | none |
| T-004 | fully_done | `readPluginSdkBundle`, `usable` predicate, override in `plugin-runtime.js`; SCN-001, SCN-005 to SCN-009 pass; real `npm ci` on the bundle matched the expected digest — high | none | none |
| T-005 | fully_done | `launcherFailureLine` and override warning; SCN-012 pass, reuse warning added after CR-001 — high | loaded-host log rendering not observed | none (stderr text captured in tests) |
| T-006 | fully_done | `plugin-mcp-fixture.js` asserts `ci` form, lock equality, `--omit=dev`, `--ignore-scripts`; scenario tests in `plugin-mcp-runtime-test.js` — high | none | none |
| T-007 | fully_done | `docs/architecture/README.md` §6.1 and `PRIVACY.md` updated; 106 links/anchors resolve (SCN-014) — high | none | none |
| T-008 | fully_done | payload regenerated; integrity (source and generated) pass; suites in `CD_TESTS.md` pass (SCN-015) — high | none | none |

## Acceptance Coverage

| criterion_id | status | scenarios |
|---|---|---|
| AC-001 | done | SCN-001, real `npm ci` check |
| AC-002 | done | SCN-002, SCN-003, SCN-004 |
| AC-003 | done | SCN-005 (simulated npm failure); npm integrity enforcement itself is npm behaviour |
| AC-004 | done | SCN-006, SCN-007 |
| AC-005 | done | SCN-008, SCN-009, reuse-warning test |
| AC-006 | done | SCN-010, SCN-011 |
| AC-007 | done | SCN-012, SCN-013 |
| AC-008 | done | SCN-014 |
| AC-009 | done | SCN-015 |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-007 | first or later server start / start refused | T-005 | captured launcher stderr line with code, cause and recovery (`plugin-mcp-runtime-test.js` SCN-012) | fulfilled | none |
| AC-005 | override active | T-004 | captured stderr warning on `--prepare`, including reuse (`plugin-mcp-runtime-test.js`) | fulfilled | none |

## Summary

- fully_done: T-001, T-002, T-003, T-004, T-005, T-006, T-007, T-008 (8/8)
- partially_done: none
- not_done: none
- out_of_scope_changes: test assertion updates in `claude-plugin-mcp-test.js` and `codex-plugin-mcp-test.js`
  follow SDD-006 and the new `env` pass-through (within T-006). Other uncommitted worktree changes
  (`packages/core/lib/control-state/run-presentation-render.js`, `resources/context.js`,
  `skill-dispatch/service.js`, `docs/architecture/dispatcher.md`, artifact-language tests) predate this run
  and belong to other runs.
- risks: loaded-host observation under Claude Code/Codex not done (optional per TP).
- required_next_step: QA gate.
