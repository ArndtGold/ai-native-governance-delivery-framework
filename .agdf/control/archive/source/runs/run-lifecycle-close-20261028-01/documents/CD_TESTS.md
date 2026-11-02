# CD+Tests: Close Active Runs as Superseded or Abandoned

Decision: pass
run_id: run-lifecycle-close-20261028-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-29

## Scope

Implementation of the approved TP revision 15, tasks T-001 to T-009, on branch `feat/run-lifecycle-close` (uncommitted working tree, base `main` at `af0634d3`).

## Delivered

- T-001: `packages/core/lib/control-state/run-closure.js` (preview, apply, validation, facts, closability, immutable 8-hex preview file with digest, exact phrase, repository-wide pending-journal refusal, sequential per-run closure, de/en rendering) and `packages/core/lib/control-state/git-identity.js` (pure config parser, no child process).
- T-002: internal step `lifecycle_close` in `run-steps.js`, Run Operations kind `lifecycle_close.record` with validation, journal kind with zero outputs, backlog move with final status `Superseded`/`Abandoned`, deterministic per-run operation id.
- T-003: `assertRunNotEnded` in `writeRunLocked` and `writeRunRecoveryLocked`, `lifecycle_ended` rejection with closure facts, early checks in artefact recording, run-present, approvals, presentation decisions, relationship correction, revisions, run-update, legacy run-step and recovery; continuation requires `active`; backlog-only `run-update` on unchanged ended runs.
- T-004: ended branch in `gate-policy.js` (status `closed`), `gate-check.js` delivery state, summary kind `run_ended`, ended handling in `interaction-presentation.js` and `next-action.js`; locale entries in `plugins/agdf/meta/agdf-interaction-locales.json`.
- T-005: `agdf_closeout` kinds `closure.preview` and `closure.apply` with a kind-limited target envelope enforced in `validateRunCommand`; tool count 7; byte budgets kept by shortening descriptions (command tool definitions about 24473 of 24576 bytes).
- T-006: CLI `run-close` in registry, parser, handler and surface-local validator set.
- T-007: cockpit assessment `ended` with closure projection; control-ui renders outcome, reason, successor, person and time.
- T-008: closure text in `control-scaffold.md`, `gate-transition.md`, `interaction.md`, `packages/cli/README.md`, `packages/mcp-server/README.md`, handbook `de/04-mehrere-runs.md` and `en/04-multiple-runs.md`; Copilot payload baseline raised to 399 files / 3576187 bytes; compatibility snapshot re-recorded; eval fingerprints of 11 skills replaced.

## Verification (2026-10-29, final tree, Node 22.22.3 on Windows)

| Check | Result | Scenarios |
|---|---|---|
| `node packages/core/test/run-closure-test.js` | pass | SCN-001, 003, 004, 005, 006, 007, 009, 014, 017, 022, 023, 024, 025, 028 |
| `node packages/core/test/run-lifecycle-guard-test.js` | pass | SCN-010, 011, 013, 015, 026 |
| `node packages/core/test/git-identity-test.js` | pass | SCN-008 |
| `node packages/cli/scripts/run-close-test.js` | pass | SCN-002, 020 |
| SCN-012 negative-first | failing before the guard, passing after | `evidence/scn-012-before.txt`, `evidence/scn-012-after.txt` |
| `node packages/core/test/run-closeout-command-test.js` | pass | regression |
| `npm --prefix packages/cli run test:run-step-transaction` | pass | regression |
| `node packages/core/test/run-command-contract-test.js` | pass | SCN-018 |
| `npm --prefix packages/cli run test:mcp-server` (13 scripts incl. protocol, run-command, safety, performance) | pass | SCN-010, 018 |
| `node packages/cli/scripts/cockpit-mcp-test.js` | pass | SCN-016, 027 |
| `npm --prefix packages/control-ui test` (8 service, 280 vitest) | pass | SCN-016 |
| `node packages/cli/scripts/claude-companion-test.js` | pass | SCN-015 |
| `node scripts/check-community-health.mjs` | pass | SCN-021 |
| `npm run build:prepare` | pass | SCN-021 |
| `npm run compatibility:record` then `compatibility:check` (56/56) | pass | SCN-021 |
| `npm --prefix packages/cli run eval:skills` (113/113) | pass | SCN-021 |
| Native observation in Claude Code Desktop through MCP on a scratch repository | observed | SCN-019, `evidence/scn-019-native-observation.md` with screenshots and preview file |

## Missing Evidence

- Codex, Copilot and OpenCode were not observed natively.
- The full pull-request CI lanes have not run; the implementing agent saw two MCP test files fail once under parallel load and pass alone, and the final serial run was green.

## Risks

- About 100 bytes of headroom remain in the MCP command tool budget.
- Older AGDF runtimes in the same repository fail closed on the new receipt kind.
