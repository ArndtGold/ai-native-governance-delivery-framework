# CD+Tests: Shared Core Run Inventory from Stored Run State

Decision: pass
run_id: run-inventory-core-20261029-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-29

## Scope

Implementation of the approved TP revision 10, tasks T-001 to T-009, in the working tree of `main` at `356cc4ee` (uncommitted).

## Delivered

- T-001: `packages/core/lib/control-evaluation/decision-content-placeholder.js` owns `isDecisionContentPlaceholder`; `decision-content-readiness.js` re-exports it.
- T-002: `packages/core/lib/control-state/run-inventory.js` with `buildRunInventory`, `runAttention`, `normalizedRunTitle`, labels, basis note and history line. `interaction-presentation.js` now re-exports `normalizedRunTitle` from it, so the run-ID title has one owner.
- T-003: `packages/core/lib/control-state/run-inventory-reader.js` `readRunInventory` over `discoverRuns`.
- T-004: `doctor.js` all-active report adds `inventory.counts` and `inventory.runs`; existing fields unchanged.
- T-005: inspect operation `inventory` in `selection.js` and `service.js`, `renderRunInventory` in `interaction-presentation.js`; `validateReadSelection` rejects a run selection for it; `gate` and `all_active` descriptions shortened; definition 4989 of 5000 bytes.
- T-006: CLI command `inventory` in `command-registry.js` and `validation-handlers.js`.
- T-007: catalog entry `control.inventory` and section text in `request-activation.md`, router line, gate-check skill line, evaluation cases de/en, `request-activation-test.js` expected operation list, request-activation manifest source fingerprint.
- T-008: handbook `de/04-mehrere-runs.md` and `en/04-multiple-runs.md`, `docs/architecture/07-ui-konzept.md` section 9 addendum; Copilot payload baseline 402 files/3595545 bytes; compatibility record refreshed; skill-eval manifest and replay fingerprints refreshed for all 14 skills (router and contract text changed; routing, gate and action expectations unchanged and passing).
- T-009: new `packages/core/test/run-inventory-test.js` registered in `test:control-inspect`; extended `control-inspect-test.js` and `active-run-inventory-test.js`.

## Verification (2026-10-29, final tree, Node 22.22.3 on Windows)

| Check | Result | Scenarios |
|---|---|---|
| `node packages/core/test/run-inventory-test.js` | pass | SCN-001 to SCN-010 |
| `node packages/cli/scripts/control-inspect-test.js` | pass | SCN-011, SCN-013, SCN-014 |
| `node packages/cli/scripts/active-run-inventory-test.js` | pass | SCN-012, SCN-015 |
| `npm --prefix packages/cli run test:control-inspect` | pass | regression and registration |
| `npm --prefix packages/cli run test:control-state` | pass | regression, SCN-004 |
| `npm --prefix packages/cli run test:run-close` | pass | regression for ended runs |
| `node packages/cli/scripts/claude-companion-test.js` | pass | placeholder parity with the companion |
| `npm --prefix packages/cli run test:request-activation` (footprint, projections, 39-case corpus, callbacks, host schema) | pass | SCN-015 |
| `npm run sync-package-assets`, `node scripts/assemble-npm.mjs`, `npm --prefix packages/mcp-server ci`, `npm --prefix packages/mcp-server test` | pass | SCN-014 |
| `npm run build:prepare` | pass | SCN-018 |
| `npm run compatibility:record` | pass, 0 failed | SCN-018 |
| `node evals/scripts/run-skill-evals.js` | pass, 113/113 | SCN-018 |
| Measurement on this repository, `evidence/measurement.json` | see below | SCN-016, SCN-017 |

## Measurement on this repository (SCN-016, SCN-017)

- 152 run folders, 152 entries, each folder exactly once; lifecycle counts equal the Run Meta counts (57 active, 95 completed); state `complete`.
- No title equals a template prompt; no last activity equals any `updated_at` value.
- Attention: 27 decision required, 16 clarification required, 2 blocked, 12 in progress, 0 unclear, 95 history.
- CLI `inventory --json` 894 ms; MCP `agdf_inspect` operation `inventory` 361 ms in-process, same order as the CLI.
- `doctor --all-active --json`: 12176, 13199 and 12342 ms; its inventory equals the CLI inventory. The added work, `readRunInventory`, measured 188, 208 and 177 ms.

## Evidence Limits

- SCN-017 used the TP fallback method: a temporary worktree of `main` could not be built without a full dependency installation (`AGDF_CORE_DEPENDENCY_LOCK_MISMATCH: parse5` in `sync-package-assets`), so doctor time is compared with the 11.7 s UR measurement plus the directly timed added work. Doctor runs are noisy under load; the directly measured addition stays well below 1 s.
- In the CLI, outside a capture read view, doctor runs one more `discoverRuns` pass for the inventory; inside the MCP read view the discovery is memoized.
- `npm --prefix packages/cli run eval:request-activation` (live behavioral evaluation) needs a Codex CLI on PATH and failed with `spawnSync codex ENOENT`; the deterministic corpus validation inside `test:request-activation` passed.
- No native host observation of the changed route (PRD non-goal).

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CDT-01 | evidence_gap | CD+Tests | resolved | evidence/measurement.json records the fallback method and the directly timed added work of 177 to 208 ms | none |
