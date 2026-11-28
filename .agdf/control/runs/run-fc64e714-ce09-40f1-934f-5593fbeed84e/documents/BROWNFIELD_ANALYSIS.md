# Brownfield Analysis: Lean Codex continuation handoff

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- approved_tp: .agdf/control/runs/run-fc64e714-ce09-40f1-934f-5593fbeed84e/documents/TP.md (sha256:c5e5d1a2892e92dc4aafbeebcb3916a669aa9f9d02e7324172642168662d576f)
- approved_sd: sha256:4a6bbfa53e099dbbe9d3dd4a0fc5aeaacc0111ad7ec5c41e609f5928c212ceb7
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27

## Scope

Implementation preparation for T-001 to T-010 on branch `agdf/pr84-continuation-locks` (head c0e0c600 of `codex/agdf-companion-reader-and-continuation`, PR #84; PR #84 base on main is 6e166cab). The working tree holds no code of the superseded run-5fbcb71f.

## Existing Owners And Reuse Path

| Area | Existing owner | Reuse strategy | Evidence |
|---|---|---|---|
| Handoff record | `packages/core/lib/companion/codex-continuation.js` `createCodexContinuationAdmission` | rewrite in place (SDD-001 to SDD-004); keep `runFile`, `readRecord` (O_NOFOLLOW, fstat identity, 4096-byte bound), `readyRoot`, `change` with `withOwnedFileLockWait(..., { waitMs: 250 })` and `atomicWrite` | `validateRecord` lines 40-54 and `status` 93-98 carry the running/owner/turn rules that go away; `canRelease` 84-91 and `settleTurn` 197-212 go away |
| Callers of the store | `packages/core/lib/control-inspect/cockpit-session.js` line 22-23 (creation), `continue` 77-111 (`inspect`, `reserve`, `cancelReservation`, `publish`); `packages/cli/lib/mcp-dispatch-runtime.js` 136-137 (creation), `admitCodexContinuation` 97-113 (`claim`); `packages/core/lib/companion/codex-activity.js` 96-115 (`associateTurn`, `observeRunning`, `settleTurn`) | keep the cockpit calls with their signatures; change `claim` to `(scope, attemptId, eligible)`; remove the hook caller by restoring `codex-activity.js` to 6e166cab | `grep createCodexContinuationAdmission` lists exactly these three callers |
| Running work | `codex-activity.js` `readCodexObservation(dataRoot, binding, now)`; `activity.js` `matchesActivity` (target, Run, gate) | reuse read-only in `cockpit-session.js`; `session.companionBinding` (lines 300-303) already has target, Run, revision and current gate for agent steps | the same binding drives `companion_observation` (lines 305-316) and `CompanionCard.tsx` `matchesActivity` |
| Session clock | `createCockpitSessionService(..., { now = Date.now })` | pass the same `now` to the store as `{ now }` so status and activity reads share one clock | `now` is already used for idle and lifetime and for `readCodexObservation` |
| Dispatch contract | `packages/core/lib/skill-dispatch/contract.js` lines 80-86 (properties, `dependentSchemas`), 292-296 (custody), 315-316 and 356-357 (normalized and parsed fields) | remove only the `continuation_owner` parts; keep `continuation_attempt_id` and its single-value Codex check | PR #84 diff against 6e166cab adds exactly these lines |
| Continuation builders | `mcp-continuation.js` lines 37 and 92, `prepared-control-calls.js` lines 13-14 | restore to 6e166cab | PR #84 diff adds only the owner lines in both files |
| Qualification | `plugin-provenance.js` line 19-20 `CODEX_CONTINUATION_OBSERVATIONS` | rename two entries | only `companion-continuation.test.js` and the validator read the list |
| UI | `companion-continuation.ts` lines 5 and 27-30; `CompanionContinuationAction.tsx` lines 43, 50 and 83 | remove `stopping`; `running` stays a holding state for polling | `mcp-tool-errors.js` validator for `agdf_cockpit_continue` already allows only the five states |

## Comparison With The Approved SD

All eight SD decisions map onto existing owners without a new module. Details that follow from the code and stay inside the SD:

- `status` becomes a closure over the clock; `change` maps a non-live, version-1 or aged unreadable record to absent before calling the transition and removes the file when the transition writes nothing.
- Removing the record file happens inside the record lock; the lock file itself (`path + '.lock'`) is removed by `withOwnedFileLock` as today.
- Pruning on reservation lists `codex-continuation/` once, skips the own file and names not matching `recordPattern`, and takes each other lock with `waitMs: 0`, ignoring busy locks.
- `cockpit-session.js` `reserve` keeps its current session reservation check; the activity check runs before it calls `reserve` on the store.
- The browser fixture creates the Cockpit session with a clock offset so the claimed phase can be passed without waiting; the dispatch runtime keeps `Date.now`.

## Regression Risk And Test Impact

- `packages/core/test/codex-continuation-admission-test.js`: the shared-authority test and both turn-settlement tests are removed with their behaviour; the two-process, lost-publication, cancel/stale and unreadable cases are kept and adapted (unreadable now ages out after 10 minutes).
- `packages/mcp-server/test/companion-continuation.test.js`: the competing-ordinary-dispatch assertions ("not confirmed", "already working") invert by design; `associateTurn` and `settleRunning` calls go away.
- `packages/cli/scripts/skill-dispatch-function-contract-test.js` lines 68 and 165-170 list and validate `continuation_owner`; they change to the attempt only.
- `packages/control-ui/test/companion-continuation.test.tsx` line 82-101 tests the stopping notice; it becomes the same holding behaviour for `running`.
- `packages/core/test/cockpit-session-test.js` covers `companion_observation` and stays unchanged; `test:cockpit-core` guards it.
- Browser cases SCN-006, SCN-007, SCN-009 and SCN-010 and the fixture's `receive` read `work_admission`, stopping or refused ordinary continuations; they are rewritten and checked with `node --check` only.
- The Copilot payload size changes (likely shrinks); the exact baseline follows `build:prepare`.

## Architecture And Parallel-Structure Risk

- architecture_relevance: relevant (record format, dispatch contract, Companion state source), resolved by SDD-001 to SDD-008; the change removes the second authority for running work instead of adding one.
- No parallel structure: the store owns handoffs only; running work stays with the activity lease.

## Context Graph Impact

- context_graph_impact: link_only (CG-MCP-DISPATCH-ADAPTER, no node change)

## Minimal Clean Implementation Path

1. T-001 store rewrite with T-007 store tests, run the admission test.
2. T-002 owner-chain removal and T-003 dispatch runtime, then T-006 names.
3. T-004 Cockpit session and T-005 UI.
4. T-008 MCP server tests, T-009 contract, UI and browser updates, running each suite after its change.
5. T-010 change chain (`npm run build:prepare`, payload baseline if reported, `npm run compatibility:record`), then the TP check list and `npm run compatibility:check`.

## Next Permissible Step

- next_allowed_action: CD+Tests for T-001 to T-010.
- forbidden_until_then: CR, QA, UAT, commit, push, PR.

## Decision

- decision: pass
