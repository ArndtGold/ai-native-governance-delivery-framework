# Brownfield Analysis: Single Core reader for the companion event journal

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: `done`

## Run

- run_id: run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320
- approved_tp: .agdf/control/runs/run-71aa7dbb-78a4-4c4c-ab92-aabb14ea2320/documents/TP.md (sha256:07fee34825864b4c8fa4f54c3987d65952fed6f9fd0793e08d5ba6001271d08d)
- approved_sd: sha256:2934a7c419645896a9ce640accb97ad8fcf12d2ea08125fbe5bc07ab8ac1c06f
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27

## Scope

Implementation preparation for T-001 to T-008 on branch `agdf/companion-journal-reader` (base b10fec4a, head of `codex/companion-run-events`, PR #85). No candidate code exists yet; the path below starts from the branch state.

## Existing Owners And Reuse Path

| Area | Existing owner | Reuse strategy | Evidence |
|---|---|---|---|
| Journal reader | `packages/core/lib/companion/read-cockpit-events.js` `readCockpitEvents`, `journalEvents` | extend and rename (SDD-001): keep `journalEvents` (lstat, O_NOFOLLOW/O_NONBLOCK open, fstat identity, bound, signature cache) unchanged; generalize filtering and item shaping | file on b10fec4a, 93 lines; only callers `cockpit-session.js:312` and `cockpit-session-test.js:11` |
| Line parsing | `packages/core/lib/companion/events.js` `parseEventLines`, `validEvent`, `SOURCE_MATCHES` | reuse unchanged | used by the reader; writer untouched |
| Run view | `packages/core/lib/companion/run-view.js` `readRunView`, `projectRunView` | extend (SDD-003): events read before `readRealpath`/inventory; early returns pass events | `readRunView` returns early for a missing root and an unresolvable root before the inventory read |
| CLI | `parse-args.js` flag loop and project-read allow-list (lines 106-114, 368-371), `command-registry.js:37`, `project-read-command.js` `executeRunView` | extend | `--run` is the only repeatable run-view flag; a new unique flag goes through the same allow-list |
| Cockpit observation | `cockpit-session.js` lines 309-321 | extend: call the renamed reader with `{ runId, limit: 32 }`, sort newest first by time | observation is only added when its serialized bytes fit `READ_LIMITS.response` (8 MiB) |
| Run detail | `cockpit.js` `detail()` returns `run_id, revision_id, lifecycle, ...`; `run.content` is available | extend with `last_activity` | `run-inventory.js` `lastActivity(receipts(text))` is module-private; export a thin `runLastActivity(text)` |
| Copilot projection | `scripts/core-projection.mjs` removes `companion/read-cockpit-events.js` for Copilot | change: remove the entry (SDD-002) | `run-view.js` is not in the removal list, so it ships to Copilot |
| Claude run view | `run-state.mjs` `runViewArgv`, `snapshotFromRunView`, `readSnapshot` | extend (argv option, `events` mapping) | adapter test asserts argv prefix `node <validator> run-view` only, so an added option is compatible |
| Claude poll | `register.mjs` `refresh` (142-180), `pollEvents` (194-246), `startObservation` (resets cursor/stamp), retry entry (`startObservation`), turn reset (sticky filter) | refactor: event handling moves from `pollEvents` into `refresh`; `pollEvents` keeps the stamp check; resets stay | the observer `companion-observe` signals `ready`, `run`, `journal`, `journal-unavailable`; `ready` runs `refresh` then `pollEvents` |
| Claude rules | `events.mjs` `isConfirmed`, `isStillUncertain`, `unseenEvents`, `eventText`, `latestReview` | reuse; remove parser and root code; add `historyEvents` | `parseJournal`, `normalizeRoot`, `sameRoot`, `JOURNAL_READ_LIMIT` are used only by `register.mjs` and `claude-companion-test.js` (git grep) |
| Pane time | `view.mjs` `clockText`, `eventFields` | extend with `eventTimeText`; `buildPanelView` already accepts `input.now` | `view.mjs:275` builds `clockText(Date.parse(event.at)) + text` |
| Codex card | `CompanionCard.tsx` local `eventTimeText`, event filter (lines 74-80) | replace with shared functions from the templates | the card already imports `eventText`, `clockText`, `gateTitle` from the templates |

## Comparison With The Approved SD

All eight SD decisions map onto existing owners without a new module besides the renamed reader and the contract test. Two implementation details follow from the code and stay inside the SD:

- The reader currently calls `realpathSync(projectRoot)` inside its outer `try`, so a missing project root returns `unavailable`; SDD-001 requires exact-spelling matching instead, so the project realpath moves into its own `try`.
- `readRunView` resolves `readRoot` with `realpathSync(root)`; events are read before that call so the early return paths can carry them (SDD-003).

## Regression Risk And Test Impact

- Claude poll flow (SDD-004): `claude-companion-adapter-test.js` lines 1134-1330 assert today's behaviour; expected changes are (a) a foreign-root or malformed line now costs one run-view call, (b) a missing journal shows no hint, (c) an effect-unknown dated 2000-01-01 shows a dated line, (d) the root-change scenario announces the new root's event at the `ready` read. The RV-1 scenario (durable event while the run view fails) keeps its expectation through the cursor not advancing on a failed read.
- Unit parity tests in `claude-companion-test.js` lines 735-775 for parser and root comparison are removed per the TP planning decision; kind parity and `JOURNAL_FILE`/`journalDirectory` parity stay.
- `cockpit-session-test.js` lines 476-551: the five-item expectation becomes the full history of that run (up to 32), items gain `run_id`; the oversized-file cases stay.
- control-ui `companion-reading.test.tsx` lines 590-620 use `approval_recorded` and `run_completed` with a run detail that does not confirm them; the test data must confirm them or the assertion changes.
- `companion-host-neutral-test.js` and `companion-run-view-test.js` run `readRunView` without the data root and must stay unchanged.
- Host limit: plain symlinks fail with EPERM on this Windows host; the contract test uses a junction on Windows.
- The worktree has no `node_modules`; `npm ci` is a prerequisite before any suite.

## Architecture And Parallel-Structure Risk

- architecture_relevance: relevant (runtime/host contract of `run-view`), resolved by SDD-002 to SDD-004; no new owner, no second reader after the change.
- Parallel structure removed: the Claude template's parser, root normalization and read bound. Core `events.js` `sameRoot` stays for the host-neutral test harness only.

## Context Graph Impact

- context_graph_impact: none

## Minimal Clean Implementation Path

1. `npm ci` in the worktree.
2. T-001 reader rename and generalization, Cockpit switch, Copilot projection; T-003 `runLastActivity` and detail field.
3. T-002 run-view option and field.
4. T-004 Claude templates, then T-005 Codex card.
5. T-006 contract test, T-007 test adaptations, running each suite after its change.
6. T-008 change chain in the established order (`npm run build:prepare`, payload baseline, eval fingerprints if reported, `npm run compatibility:record`), then the full TP check list and `npm run compatibility:check`.

## Next Permissible Step

- next_allowed_action: CD+Tests for T-001 to T-008.
- forbidden_until_then: CR, QA, UAT, commit, push, PR.

## Decision

- decision: pass
