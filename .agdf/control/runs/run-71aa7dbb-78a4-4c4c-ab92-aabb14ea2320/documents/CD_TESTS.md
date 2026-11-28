# CD+Tests: Single Core reader for the companion event journal

Gate: CD+Tests
Type: CD+Tests
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- approved_tp: sha256:07fee34825864b4c8fa4f54c3987d65952fed6f9fd0793e08d5ba6001271d08d
- branch: agdf/companion-journal-reader (base b10fec4a, head of codex/companion-run-events, PR #85), uncommitted working tree
- executed_by: Claude (agent)
- executed_at: 2026-11-27

## Tasks

| task_id | Result | Evidence |
|---|---|---|
| T-001 | done | `git mv` to `packages/core/lib/companion/read-companion-events.js`: `readCompanionEvents(dataRoot, projectRoot, { runId, limit, review })`, `COMPANION_EVENTS_READ_LIMIT` (2 x 256 KiB), `COMPANION_EVENT_HISTORY_LIMIT` (32), unchanged `journalEvents` (lstat, O_NOFOLLOW/O_NONBLOCK, identity check, bound, signature cache), item shaping, first review fact sanitized, root matcher without requiring the project root to exist; `cockpit-session.js` `selectedRunEvents` (run scope, newest first by time, `run_id`, no review); `scripts/core-projection.mjs` no longer removes the reader for Copilot |
| T-002 | done | `run-view.js` reads events first with `companionDataRoot` (also on early returns), `projectRunView` adds `events` only when given; `parse-args.js` unique absolute `--companion-data` limited to run-view; usage text in `command-registry.js`; pass-through in `project-read-command.js` |
| T-003 | done | `run-inventory.js` `runLastActivity(text)`; `cockpit.js` detail `last_activity`; `types.ts` `Detail.last_activity`, `CompanionEvent.run_id` |
| T-004 | done | `run-state.mjs` argv option and `eventHistory`; `register.mjs` `refresh` takes the journal stamp before its read and handles events (`receiveEvents`, `showEvents`), `pollEvents` compares the stamp only; `events.mjs` without `parseJournal`, `EVENT_SCHEMA`, `normalizeRoot`, `sameRoot`, `JOURNAL_READ_LIMIT`, `JOURNAL_ROTATED_FILE`, `unseenEvents` without root, new `historyEvents`; `view.mjs` `eventTimeText` and dated pane lines |
| T-005 | done | `CompanionCard.tsx` uses `historyEvents` with the detail's path, lifecycle and `last_activity`, the shared `eventTimeText`, and `shownRunId` so the selected run's events name no run; `companion-figure.d.ts` declarations |
| T-006 | done | `packages/core/test/companion-journal-contract-test.js`, `packages/core/test/fixtures/companion-journal-fixtures.js`, registered in `test:companion-run-view` |
| T-007 | done | adapted `cockpit-session-test.js`, `claude-companion-test.js`, `claude-companion-adapter-test.js` (incl. new shared-read case), `run-view-command-test.js` (new SCN-007 test), `companion-reading.test.tsx` (new confirmation/sticky test), `package-contents-test.js` (reader in every profile) |
| T-008 | done | Copilot payload growth reported by `npm run build:prepare` (`AGDF_COPILOT_PAYLOAD_GROWTH`, 462 files / 4,875,947 bytes) accepted with `node scripts/payload-budget.js --accept` and a rationale naming this run in `plugins/agdf/meta/copilot-payload-baseline.json`; `npm run build:prepare` pass (twice, the second after the control-ui change); eval fingerprints not reported stale (no skill or contract source changed); `npm run compatibility:record` pass (new observation `evals/host-compatibility/observations/1a7ebd3d...json`, source fingerprint ce633876...); `npm run compatibility:check` pass, 56 scenarios, 0 failed |

## Test Results

All commands run locally on Windows 11, Node 22.22.3, after `npm ci` and `npm run build:prepare` in this worktree.

| Check | Scenarios | Result |
|---|---|---|
| `node --test packages/core/test/companion-journal-contract-test.js` (in `test:companion-run-view`) | SCN-001, SCN-003, SCN-004, SCN-005, SCN-012 | pass, 5 of 5 (junction alias and drive-letter case exercised, nothing skipped) |
| `npm --prefix packages/cli run test:companion-run-view` incl. `scripts/run-view-command-test.js` | SCN-007, SCN-003 to SCN-005, SCN-012 | pass, 83 pass, 1 pre-existing symlink skip |
| `npm --prefix packages/cli run test:claude-companion` (logic, adapter, integrity, parity, observer) | SCN-002, SCN-008, SCN-009, SCN-010 | pass |
| `node --test packages/core/test/cockpit-session-test.js` | SCN-004, SCN-011 | pass, 21 of 21 |
| packages/control-ui `npx vitest run` and `npx tsc --noEmit` | SCN-010, SCN-011 | pass, 35 files, 442 of 442 tests; typecheck clean |
| `npm --prefix packages/cli run test:copilot-profile`, `test:package-contents` | SCN-006 | pass |
| `npm --prefix packages/cli run test:plugin-mcp-runtime`, `test:mcp-server`, `test:project-read`, `test:local-validator`, `test:cli-modularization` | SCN-013 | pass (mcp-server after `npm ci` in packages/mcp-server and a rebuilt decision UI) |
| `npm --prefix packages/cli run test:cockpit-core` | SCN-013 | 114 pass, 2 fail on host limits: `cockpit-draft-check-test.js` symlink EPERM (fails on this host independent of the change), `cockpit-changes-test.js` rename EPERM under parallel load (passes 2 of 2 in isolation) |
| `npm run compatibility:record`, `npm run compatibility:check` | SCN-013 | pass, 56 scenarios, 0 failed |

## Gaps

- The live Claude companion pane and the Codex app were not exercised; the adapter test drives the real template module against the real in-process `run-view` command, the existing evidence level.
- `cockpit-changes-test.js` failed once under parallel load with Windows `EPERM` on a rename (file lock) and passed twice in isolation; the test does not touch the journal or the changed modules.

## Decision

- decision: pass
