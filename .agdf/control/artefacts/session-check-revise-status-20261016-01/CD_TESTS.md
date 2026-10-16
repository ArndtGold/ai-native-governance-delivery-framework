# CD+Tests: Report doctor status revise in session runtime facts

Gate: CD+Tests
Type: CD+Tests
Status: done
Decision: pass

## Result

The session-check template accepts exactly the statuses `doctor` returns; `revise` now reaches
`automatic_check.status` on every surface.

| File | Change |
|---|---|
| `scripts/sync-plugin-runtime.js` | `supportedStatuses` is `["pass", "warn", "revise", "block"]` (was `pass, warn, block, blocked, error, failed, unknown, unavailable`); other values still fall back to `unknown`, unparseable output to `unavailable`, no repository to `skipped`. |
| `packages/cli/scripts/repository-control-startup-test.js` | Two fixture repositories run through the generated session check: a sealed run without `next_allowed_action` (expects `revise` with findings) and a freshly initialized repository without active runs (expects `revise`); the existing blocked fixture now expects exactly `block`; both new fixtures stay byte-unchanged. Counts are not pinned, so unrelated doctor warnings do not break the test. |

Generated projections were rebuilt with `npm run build:prepare` (exit 0); both
`packages/cli/generated/plugins/agdf/runtime/agdf-session-check.js` and the Copilot copy carry the new list.

## Evidence

- Red before regeneration: `node scripts/repository-control-startup-test.js` against the previous build failed with
  `actual { status: 'unknown', findings: 3 }`, expected `revise`.
- Green after regeneration (`packages/cli`): `test:control-maintenance`, `test:runtime-check-consent`,
  `test:instruction-footprint`, `test:runtime-integrity-layout`, `test:runtime-integrity-negative`,
  `test:copilot-profile`, `test:claude-packaged-app-copy`, `test:claude-install-hardening`,
  `test:cli-modularization`, `test:lifecycle`, `skill-dispatch-binding-test.js`; repository
  `plugins/agdf/scripts/check-runtime-integrity.mjs`: ok (mode=source; 14 skills, 16 control files).
- This repository, regenerated Claude session check (`AGDF_SURFACE=claude`, hook input `cwd` = repository root):
  `automatic_check: {"status":"revise","findings":79}`, `repository_control.status: current`, no drift line.
- Copilot payload (`node scripts/payload-budget.js`): 260 files / 2256827 bytes against the unchanged baseline
  260 / 2256982; each session check is 46 bytes shorter. `sessionStartBase` budget unchanged (1912);
  footprint and runtime-integrity suites pass.
- Host-compatibility evidence: `compatibility:check` reported `source_snapshot_changed` after the runtime digest
  changed; re-recorded with `npm run compatibility:record` (56 scenarios, 0 failed, source fingerprint
  `d954371b…`), then `compatibility:check` passes, also after the final test edit. Changed evidence:
  `docs/compatibility/HOST_COMPATIBILITY.md`, `docs/compatibility/evidence/facts.json`,
  `docs/compatibility/evidence/snapshot.json`, new observation `evals/host-compatibility/observations/b67dd45c….json`;
  older observations stay as append-only history. `npm run test:host-compatibility`: pass (66 named checks).
- After the final test edit `test:control-maintenance` passes again.
- Full chain `node packages/cli/scripts/smoke-test.js`: pass (128 s, "create-agdf smoke test passed").
- Environment: Windows 11, Node 22.22.3, inside Claude Desktop (MSIX); no plugin reinstall.

## Risk

- The installed plugin still carries the old list until AGDF is reinstalled from a terminal outside Claude
  Desktop; a new Claude session shows `revise` only after that reinstall.
- A one-off session-check run under parallel test load reported `repository_control.inspection_state:
  unavailable` because the shared 10-second startup deadline was consumed; the unloaded rerun reported
  `complete`. Unrelated to this change.
