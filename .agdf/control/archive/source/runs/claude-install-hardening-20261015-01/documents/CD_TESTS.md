# CD+Tests: Harden the Claude installer against stale and shadowed installations

Gate: CD+Tests
Type: CD+Tests
Status: done
Decision: pass

## Run

- run_id: claude-install-hardening-20261015-01
- related_tp: .agdf/control/artefacts/claude-install-hardening-20261015-01/TP.md
- branch: feat/claude-install-fix (base `42c42850`), changes uncommitted at recording time
- implementer: Claude Code (claude-opus-5-5)
- date: 2026-10-15

## Implemented Tasks

| task_id | Result | Files |
|---|---|---|
| T-001 | `host-installation.js` is the single owner of detection, comparison and drift inspection; drift now compares the loaded root with the installation record | `packages/core/lib/runtime/host-installation.js` |
| T-002 | Probe-based `detectPackagedAppProcess`; `preflightClaudeInstall` refuses with `packaged_app`; called first in `runGuidedInstall` for target `claude` and again at the start of `installClaudeGlobalPlugin` | `host-installation.js`, `packages/cli/lib/host-adapters/claude/plugin.js`, `packages/cli/lib/cli/application.js`, `packages/cli/lib/installers/plugin-installers.js` |
| T-003 | `writeClaudeInstallationRecord` writes `installation.json` atomically into the Claude plugin data root after commit; uninstall plan reports it | `host-installation.js`, `claude/plugin.js`, `packages/cli/lib/host-adapters/claude/uninstall.js` |
| T-004 | `verifyClaudeInstallation` compares committed digests with the marketplace plugin root, the record and, after a (re)install in this run, the Claude cache entry; any mismatch or unknown is not healthy | `claude/plugin.js` |
| T-005 | Same installed version on the owned directory marketplace: no uninstall, no install; missing plugin: install; version change: uninstall plus install | `claude/plugin.js` |
| T-006 | `readClaudePluginState` reads `claude plugin list --json`, falls back to the text listing with evidence | `claude/plugin.js` |
| T-007 | Generated session check: surface `claude` is consented by plugin enablement; Copilot projection keeps its original gate byte for byte | `scripts/sync-plugin-runtime.js` |
| T-008 | `commit({ tolerateCleanupFailure })` returns `cleanup: pending` and keeps the committed marker; recovery covers only pre-commit steps; post-commit steps are guarded; rollback after commit is reported as `not_applicable_committed` | `packages/cli/lib/installers/local-marketplace.js`, `packages/cli/lib/installers/plugin-command.js`, `claude/plugin.js` |
| T-009 | New suite `claude-install-hardening-test.js` in the smoke-test chain; existing suites adapted to the approved behaviour | `packages/cli/scripts/*`, `packages/cli/package.json` |
| T-010 | Native qualification pending (after CR) | — |

## Necessary Adjustments Beyond The Named Files

- `plugins/agdf/scripts/check-runtime-integrity.mjs`: the SessionStart footprint probe measures the base
  context only, because Claude now appends runtime facts; the `sessionStartBase` budget is unchanged.
- Existing tests encoded the replaced behaviour and were updated: reinstall on every run
  (`local-marketplace-test.js`, `cli-modularization-test.js`), no Claude runtime facts without receipt
  (`runtime-integrity-layout-test.js`), cache-based drift (`claude-packaged-app-copy-test.js`).
- Tests that call the Claude installer inject a passing preflight, because the probe correctly refuses
  inside Claude Desktop, where this run executed; `local-marketplace-test.js` now isolates
  `CLAUDE_CONFIG_DIR` so no record reaches the user's Claude home.
- `rollbackMarketplaceFilesystem` is shared: in the edge case of a rollback after commit, Codex evidence
  now reads `not_applicable_committed` instead of a false `restored`; Codex actions are unchanged.

## Rework After Code Review

The first Code Review (`CODE_REVIEW.md`, decision `revise`) found CR-001 to CR-007. Changes:

- CR-001 (copied loading, SDD-004): with an installed same version the installer now reinstalls when the
  cached copy listed by `claude plugin list --json` does not carry the committed digests or cannot be
  inspected (text-only listing); verification always includes a listed cache entry. An unchanged install
  with a current cache still issues no uninstall or install. The host-compatibility Claude fixture passes again.
- CR-002: the host-compatibility fixture isolates `CLAUDE_CONFIG_DIR` and the preflight; the fixture record that
  an earlier unisolated test run had written into the real Claude data root was removed.
- CR-003: `enabled: false` is reported (`plugin_enabled:false` plus the enable command) and never healthy; the
  installer does not re-enable the plugin. The user-scope entry is preferred.
- CR-004: after a failed record write the previous record is removed (`installation_record:failed:<code>:stale_removed`);
  the drift notice names reinstalling AGDF for Claude as the remedy.
- CR-005: `scripts/fixtures/claude-plugin-list-json.json` records real `claude 2.1.268 plugin list --json` output
  (user paths anonymized) and is used by the tests.
- CR-006: remains an evidence obligation for native qualification (AC-014).
- CR-007: a retired copy with pending cleanup carries `cleanup_pending=<path>` in its evidence.
- CR-008 (re-review): when listing entries carry a scope, only a user-scope entry counts as installed; a plugin
  listed only for one project is installed at user scope (test `project-only`).

Rework evidence: `test:claude-install-hardening`, `test:claude-packaged-app-copy`, `test:local-marketplace`,
`test:cli-modularization`, `test:runtime-integrity-layout`, `test:copilot-profile`, `test:local-development-install`,
`test:lifecycle`, `host-compatibility-test.js`, `scripts/host-compatibility/test.mjs` (66 checks) and
`scripts/smoke-test.js` pass; no file was written into the real Claude data root.

Host-compatibility evidence was re-recorded after the final source change (`npm run build:prepare`,
`npm run compatibility:record`, source fingerprint `9f9da6f9…`): 56 checks evaluated, 0 failed;
`npm run compatibility:check` passes. Changed evidence: `docs/compatibility/HOST_COMPATIBILITY.md`,
`docs/compatibility/evidence/facts.json`, `docs/compatibility/evidence/snapshot.json` and the new observation
`evals/host-compatibility/observations/f8a2cdcf….json`; an intermediate unreferenced observation was removed.

## Test Evidence

| Scenario | Route | Result |
|---|---|---|
| SCN-001, SCN-003, SCN-006, SCN-007, SCN-009, SCN-010, SCN-013, SCN-016, SCN-019 to SCN-023 | `npm run test:claude-install-hardening` | pass |
| SCN-005, SCN-014, SCN-024 | `npm run test:claude-packaged-app-copy` | pass |
| SCN-011 | `npm run test:runtime-integrity-layout`, `test:claude-install-hardening` | pass |
| SCN-025 | `npm run test:copilot-profile`, `sync-package-assets` payload budget | pass (Copilot payload unchanged at 260 files / 2256982 bytes) |
| Regression | `test:local-marketplace`, `test:cli-modularization`, `test:local-development-install`, `test:lifecycle`, `test:mcp-lifecycle`, `test:local-validator`, `test:claude-plugin-mcp`, `test:package-contents`, `test:runtime-check-consent`, `test:claude-cache-recovery` | pass |
| SCN-017 | `npm run smoke-test` | pass (see Smoke Test) |
| Live observation | the preflight refused a test install inside this Claude Desktop session with package `Claude_pzs8sxrjxfjjc` before the tests injected a passing preflight | confirms the probe in the real MSIX container |

## Smoke Test

- result: pass across the whole chain, executed in parts on this Windows host:
  - first chain run: the 16 entries up to `test:skill-dispatch` passed; `test:skill-dispatch` stopped on a
    file-symlink `EPERM` (environment), so the `&&` chain did not continue;
  - the remaining 56 entries ran one by one: 52 passed at once; `test:control-inspect` and
    `test:run-command-flow` failed only on file-symlink `EPERM` and pass after run
    `symlink-test-robustness-20261015-01` (also `test:skill-dispatch`); `test:mcp-server` failed on a
    stale `dist/npm` build and a stale `packages/mcp-server/node_modules/create-agdf` copy from 2026-10-08
    and passes after `node scripts/assemble-npm.mjs` and refreshing that copy; `node scripts/smoke-test.js`
    passes after adapting its Claude update phase to SCN-006/SCN-007 and isolating `LOCALAPPDATA` for the
    CLI under test (the preflight refused correctly inside Claude Desktop before).
- smoke phases `claude install`, `claude update` (unchanged and version change) and `Claude installer
  scenarios` pass.

## Session-Check Duration

- method: generated `agdf-session-check.js`, surface `claude`, five runs each, no parallel load, Windows 11,
  Node 22.22.3.
- repository-bound session in this repository (129 runs): 7465 to 8812 ms; `doctor --all-active` alone 5827 ms.
- session without repository: 768 ms; base context without facts (previous Claude behaviour): 724 ms.
- assessment: above the TP warning threshold of 2 s for this repository; the cost is the existing
  automatic check (`doctor --all-active` plus startup compatibility inspection), which Codex already runs
  under its receipt consent. QA warning per TP planning decision.

## Open Items

- T-010 native qualification (SCN-002, SCN-004, SCN-008, SCN-012, SCN-015, SCN-018) after CR.
