# TP: Single Core reader for the companion event journal

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Rename `packages/core/lib/companion/read-cockpit-events.js` to `read-companion-events.js` (git mv) and implement `readCompanionEvents(dataRoot, projectRoot, { runId, limit, review })`, `COMPANION_EVENTS_READ_LIMIT`, `COMPANION_EVENT_HISTORY_LIMIT`, item shaping, review-fact sanitizing and root matching without requiring the project root to exist; switch `cockpit-session.js` to it (run scope, limit 32, no review, newest first by time, `run_id` per item); remove the reader from the Copilot exclusion list in `scripts/core-projection.mjs` | Claude (agent) | none |
| T-002 | Extend `run-view`: `readRunView(root, { language, runIds, companionDataRoot })` reads events first (also on the early return paths), `projectRunView` adds `events` only with the input; CLI `--companion-data` (unique, absolute) in `parse-args.js`, usage text in `command-registry.js`, pass-through in `project-read-command.js` | Claude (agent) | T-001 |
| T-003 | Add `runLastActivity(text)` to `packages/core/lib/control-state/run-inventory.js` and `last_activity` to the Cockpit run detail in `cockpit.js`; add `last_activity` to `Detail` and `run_id` to `CompanionEvent` in `packages/control-ui/src/types.ts` | Claude (agent) | none |
| T-004 | Claude templates: `run-state.mjs` (argv with `--companion-data`, `snapshot.events` mapping), `register.mjs` (`journalStamp`, `refresh` consumes events of its read, stamp-only `pollEvents`, imports cleaned), `events.mjs` (remove parser, `EVENT_SCHEMA`, root normalization, read bound, rotation file name; `unseenEvents` without root; add `historyEvents`), `view.mjs` (`eventTimeText`, pane line) | Claude (agent) | T-002 |
| T-005 | Codex card: `CompanionCard.tsx` uses `historyEvents` with a run built from the detail and the shared `eventTimeText`; local `eventTimeText` removed | Claude (agent) | T-003, T-004 |
| T-006 | Contract test `packages/core/test/companion-journal-contract-test.js` with fixtures `packages/core/test/fixtures/companion-journal-fixtures.js`, registered in `packages/cli/package.json` `test:companion-run-view` | Claude (agent) | T-001, T-002, T-004 |
| T-007 | Adapt existing tests: `cockpit-session-test.js`, `claude-companion-test.js`, `claude-companion-adapter-test.js`, `claude-companion-parity-test.js`, `claude-companion-integrity-test.js`, `scripts/run-view-command-test.js`, control-ui `companion-reading.test.tsx` | Claude (agent) | T-001 to T-005 |
| T-008 | Contract text change chain and verification: `npm run build:prepare` (raise the Copilot payload baseline with a rationale naming this run if `AGDF_COPILOT_PAYLOAD_GROWTH`), update eval fingerprints if `eval:skills` reports stale observations, `npm run compatibility:record`, then run all suites of the Test Plan and `npm run compatibility:check` | Claude (agent) | T-001 to T-007 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-004 | T-006 | SCN-001 | The contract test finds no journal file read (`$.fs.read` of the journal), no line parsing and no read bound in `register.mjs`, `run-state.mjs` and `events.mjs` | Contract test output |
| AC-001 | SDD-005 | T-007 | SCN-002 | `events.mjs` exports none of `parseJournal`, `EVENT_SCHEMA`, `normalizeRoot`, `sameRoot`, `JOURNAL_READ_LIMIT`, `JOURNAL_ROTATED_FILE`; `JOURNAL_FILE`, `journalDirectory` and the kind lists still equal Core's | `claude-companion-test.js` output |
| AC-002 | SDD-001 | T-006 | SCN-003 | For a mixed journal the reader returns only valid events of the root in journal order, each id once, skipping cut, malformed, foreign-schema and foreign-root lines; `runId` narrows to that run; `limit` keeps the newest | Contract test output |
| AC-002 | SDD-001 | T-006 | SCN-004 | An oversized current file gives `unavailable`; an oversized or unreadable rotation file is skipped while the current file's events are returned; rotation-file events come before current-file events; a missing folder or journal gives `available` with no items; a relative data root gives `unavailable` | Contract test output and `cockpit-session-test.js` output |
| AC-002 | SDD-001 | T-006 | SCN-005 | Events whose root is a junction (Windows) or symlink (POSIX) alias of the project root, or on Windows the drive letter in the other case, are matched; another directory is not | Contract test output |
| AC-003 | SDD-002 | T-008 | SCN-006 | After `npm run build:prepare` the Copilot runtime projection contains `companion/read-companion-events.js` and the Copilot payload baseline records the new size | `build:prepare` output, payload baseline diff, `test:copilot-profile` output |
| AC-003 | SDD-003 | T-002 | SCN-007 | `run-view` with `--companion-data` returns `events` (`available`, empty for a missing journal; `unavailable` for an oversized one); without it the document has no `events` key; a relative or repeated value is a usage error | `scripts/run-view-command-test.js` output |
| AC-004 | SDD-004 | T-007 | SCN-008 | A journal change starts exactly one run-view call carrying `--companion-data`; the same toasts and pane lines as before appear (baseline without toast, approval requested, effect unknown, confirmed approval only, rotation between reads); an unchanged journal starts no call; another root's line costs one call and no toast; an oversized journal shows "events unavailable", a missing one does not; a run signal followed by the journal signal of the same write share one read | `claude-companion-adapter-test.js` output |
| AC-005 | SDD-007 | T-007 | SCN-009 | `eventTimeText` gives `14:05` for today, `26.11. 14:05` and `26.11.2025 14:05` in German, `2026-11-26 14:05` in English and empty text for an invalid time; the pane shows dated lines for earlier days | `claude-companion-test.js` output |
| AC-006 | SDD-006 | T-007 | SCN-010 | The Codex card lists approval recorded only when the detail's gate path shows that gate fulfilled and run completed only when the lifecycle is completed; `historyEvents` drops unconfirmed durable events | control-ui vitest output and `claude-companion-test.js` output |
| AC-007 | SDD-006 | T-007 | SCN-011 | With five newer events, a still-uncertain effect unknown stays in the card while the detail's `last_activity` is not later than the event, and leaves the five lines after a later operation; the Cockpit detail carries `last_activity` and the observation up to 32 items with `run_id` | control-ui vitest output and `cockpit-session-test.js` output |
| AC-008 | SDD-008 | T-006 | SCN-012 | For the shared fixtures the reader's items, the events of `readRunView` mapped through `snapshotFromRunView`, and the Cockpit observation items of one run have the same ids, kinds, gates, reasons and times (Cockpit restricted to that run) | Contract test output |
| AC-009 | none — verification of SDD-001 to SDD-008, no separate design decision | T-008 | SCN-013 | All suites of the Test Plan pass and `npm run compatibility:check` passes after `npm run compatibility:record` | Command output recorded in the run evidence |

## 3. Test Plan

Reuse: the existing Cockpit, Claude companion, run-view and control-ui suites already exercise the event flow end to end; they are adapted, not duplicated. New proof is limited to the reader contract test (SCN-001, SCN-003 to SCN-005, SCN-012), which closes the gap that caused the 256 KiB defect: no test ran both consumers on the same journal. Expected results come from PRD AC-001 to AC-009 and SD SDD-001 to SDD-008. All checks run locally on Windows in this worktree before QA; CI repeats them on the pull request. Checking is sufficient when every scenario below passes and `compatibility:check` reports no mismatch; native live-host checks of the Claude companion are out of scope and remain an explicit gap.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node --test packages/core/test/companion-journal-contract-test.js` | Local worktree, Windows, Node from nvm4w | Dependencies installed (`npm ci` state of the worktree) | Claude (agent) | Passing assertion on template sources | Fix the test or templates; QA blocked until it passes |
| AC-001 | SCN-002 | `node packages/cli/scripts/claude-companion-test.js` | Local worktree | none beyond installed dependencies | Claude (agent) | Passing export assertions | Fix and rerun; QA blocked |
| AC-002 | SCN-003 | `node --test packages/core/test/companion-journal-contract-test.js` | Local worktree | Writable temp directory | Claude (agent) | Passing reader cases | Fix and rerun; QA blocked |
| AC-002 | SCN-004 | contract test plus `node --test packages/core/test/cockpit-session-test.js` | Local worktree | Writable temp directory | Claude (agent) | Passing bound and rotation cases | Fix and rerun; QA blocked |
| AC-002 | SCN-005 | contract test (junction via `fs.symlinkSync(..., 'junction')` on Windows, `'dir'` symlink elsewhere) | Local worktree, Windows | Junction creation needs no elevation; if the platform refuses, the test reports the case as skipped with the reason | Claude (agent) | Passing alias and drive-letter cases | A skipped alias case is recorded as an evidence gap in QA, not as a pass |
| AC-003 | SCN-006 | `npm run build:prepare`; `npm --prefix packages/cli run test:copilot-profile` | Local worktree | Network not required | Claude (agent) | Build log, baseline diff, passing profile test | Raise the baseline per the change chain; if the build still fails, stop and report |
| AC-003 | SCN-007 | `npm --prefix packages/cli run test:companion-run-view` (includes `scripts/run-view-command-test.js`) | Local worktree | none | Claude (agent) | Passing option and output cases | Fix and rerun; QA blocked |
| AC-004 | SCN-008 | `npm --prefix packages/cli run test:claude-companion` | Local worktree | Writable temp directory | Claude (agent) | Passing adapter scenarios | Fix and rerun; QA blocked |
| AC-005 | SCN-009 | `node packages/cli/scripts/claude-companion-test.js` | Local worktree, local time zone | none | Claude (agent) | Passing time text cases with a fixed `now` | Fix and rerun; QA blocked |
| AC-006 | SCN-010 | `npm --prefix packages/control-ui test` (vitest) and `claude-companion-test.js` | Local worktree | control-ui dependencies installed | Claude (agent) | Passing card and selection cases | Fix and rerun; QA blocked |
| AC-007 | SCN-011 | `npm --prefix packages/control-ui test` and `node --test packages/core/test/cockpit-session-test.js` | Local worktree | control-ui dependencies installed | Claude (agent) | Passing sticky and detail cases | Fix and rerun; QA blocked |
| AC-008 | SCN-012 | `node --test packages/core/test/companion-journal-contract-test.js` | Local worktree | Writable temp directory | Claude (agent) | Passing cross-consumer comparison | Fix and rerun; QA blocked |
| AC-009 | SCN-013 | Suites above plus `npm --prefix packages/cli run test:cockpit-core`, `npm --prefix packages/cli run test:plugin-mcp-runtime`, `npm run compatibility:record`, `npm run compatibility:check` | Local worktree | Build prepared (SCN-006) | Claude (agent) | All commands exit 0 | Report the failing command with output; QA blocked |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Exact fixture contents and test file split | SD: Exact fixture contents and test file split | resolved | Fixture cases are those of SCN-001, SCN-003 to SCN-005 and SCN-012, built in `companion-journal-fixtures.js`. The parser and root mirror checks in `claude-companion-test.js` are removed (their subject no longer exists); the Cockpit transport cases for oversized files stay in `cockpit-session-test.js` because they cover the session response; reader-level bound and rotation cases live in the contract test | Claude (agent) |
| Copilot payload baseline and eval fingerprints | TP | resolved | Raised to the observed values only if `build:prepare` or `eval:skills` report them, with a rationale naming this run, as established for earlier companion runs | Claude (agent) |

## 4. Brownfield Scope

Before implementation (Brownfield Analysis) inspect: `read-cockpit-events.js` and its two callers and tests; `run-view.js` and `project-read-command.js`, `parse-args.js`, `command-registry.js`; `cockpit-session.js` observation building and `cockpit.js` `detail`; `run-inventory.js` `lastActivity`; `scripts/core-projection.mjs`; the Claude templates `register.mjs` (`refresh`, `pollEvents`, `startObservation`, retry entry, turn reset), `run-state.mjs`, `events.mjs`, `view.mjs`; `CompanionCard.tsx` and `types.ts`; and the tests named in T-007.

## 5. Out Of Scope

- Journal writer, line format, bound, rotation and event kinds.
- Core `events.js` `sameRoot` (test-harness use only).
- Merging PR #84 or PR #85, release notes and version bumps.
- Native live-host checks of the Claude companion and the Codex app (`native:claude-e2e`).

## 6. Risks And Blockers

- Block QA: any failing scenario of the Test Plan or a `compatibility:check` mismatch.
- Revise: an adapter scenario that only passes with weakened assertions; a skipped alias case without recorded reason.
- Warn: recorded native Claude evidence becomes stale through the change chain; one run-view read per journal change from other roots (accepted); PR #85 conflicts with its base.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Aufgaben: T-001 Core-Leser umbenennen und verallgemeinern, Cockpit umstellen, Copilot-Projektion anpassen; T-002 `run-view` mit `--companion-data` und Feld `events`; T-003 `last_activity` im Cockpit-Run-Detail und Typen; T-004 Claude-Templates (`run-state.mjs`, `register.mjs`, `events.mjs`, `view.mjs`); T-005 Codex-Karte mit `historyEvents` und `eventTimeText`; T-006 Contract-Test mit gemeinsamen Fixtures; T-007 bestehende Tests anpassen; T-008 Änderungskette (`build:prepare`, Payload-Baseline, Eval-Fingerprints, `compatibility:record`) und alle Prüfungen.
- Nachweise: SCN-001/002 kein Journal-Parser mehr in den Claude-Templates (AC-001); SCN-003 bis SCN-005 Leserfälle mit Zeilenfiltern, Grenzen, Rotation, Alias und Laufwerksbuchstabe (AC-002); SCN-006/007 Copilot-Projektion und `run-view`-Option (AC-003); SCN-008 Poll-Ablauf im Adapter-Test (AC-004); SCN-009 Datumsanzeige (AC-005); SCN-010/011 Bestätigung und haftende Ereignisse in der Codex-Karte (AC-006, AC-007); SCN-012 gleiche Ereignisse bei beiden Verbrauchern (AC-008); SCN-013 alle Suiten und `compatibility:check` (AC-009).
- Prüfplan: lokal unter Windows in diesem Worktree vor QA, CI wiederholt im Pull Request; native Live-Prüfungen des Claude-Begleiters bleiben eine benannte Lücke; ein übersprungener Alias-Fall gilt als Nachweislücke, nicht als bestanden.
- Planungsentscheidungen: Fixture-Fälle wie in den Szenarien; Paritätsprüfungen für Parser und Root-Vergleich entfallen, Cockpit-Transportfälle bleiben im Cockpit-Test; Payload-Baseline und Eval-Fingerprints werden nur bei gemeldetem Bedarf mit Begründung angehoben.
- Nicht enthalten: Schreiber und Format, Core-`sameRoot`, Merge von PR #84/#85, Release-Notizen, native Live-Prüfungen.
- Risiken: fehlschlagende Szenarien oder `compatibility:check` blockieren QA; native Claude-Evidenz veraltet; ein `run-view` je Journaländerung auch aus anderen Projekten (akzeptiert).
