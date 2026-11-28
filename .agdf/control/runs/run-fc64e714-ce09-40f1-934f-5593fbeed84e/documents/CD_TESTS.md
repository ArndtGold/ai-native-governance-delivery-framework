# CD+Tests: Lean Codex continuation handoff

Gate: CD+Tests
Type: CD+Tests
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- approved_tp: sha256:c5e5d1a2892e92dc4aafbeebcb3916a669aa9f9d02e7324172642168662d576f
- branch: agdf/pr84-continuation-locks (base c0e0c600, head of codex/agdf-companion-reader-and-continuation, PR #84), uncommitted working tree
- executed_by: Claude (agent)
- executed_at: 2026-11-27

## Tasks

| task_id | Result | Evidence |
|---|---|---|
| T-001 | done | `packages/core/lib/companion/codex-continuation.js` rewritten: version-2 record with the nine fields, `HANDOFF_BOUNDS` (reserved 120000, pending 600000, claimed 60000 ms), clock option `{ now }`, liveness with the future-date rule, `current()` maps missing, legacy (version 1), non-live and aged unreadable records to absent and removes them inside the record lock, young unreadable records block as `unavailable`, `removeFile` instead of settled writes, `prune` of other records older than the pending bound after a reservation (lock without waiting), `claim(scope, attemptId, eligible)` writes `claimed`; owner, turn, release check, `associateTurn`, `observeRunning`, `settleRunning` and `settleTurn` removed |
| T-002 | done | `codex-activity.js`, `prepared-control-calls.js`, `mcp-continuation.js` restored to 6e166cab (`git diff 6e166cab` on the three files is empty); `contract.js` without `continuation_owner` (property, `dependentSchemas`, `not` clause, normalized and parsed fields), attempt check now single-valued |
| T-003 | done | `mcp-dispatch-runtime.js` `admitCodexContinuation` acts only with `continuationAttemptId`, claims for every operation with `isCurrentContinuation`, returns admitted results unchanged; `stopCodexContinuation` keeps the new stale sentence (English and German) and the unavailable sentence |
| T-004 | done | `cockpit-session.js` passes its `now` to the store; `status` returns `running` when the store is ready and `readCodexObservation` reports activity for `session.companionBinding`; `reserve` returns `running` without reserving in that case; the store call no longer passes `root` |
| T-005 | done | `companion-continuation.ts` single `ContinuationState` without `stopping` and without the `interrupt_requested` mapping; `CompanionContinuationAction.tsx` without the stopping checks and text |
| T-006 | done | `CODEX_CONTINUATION_OBSERVATIONS` with `ordinary_continuation_unblocked` and `running_from_activity` |
| T-007 | done | `packages/core/test/codex-continuation-admission-test.js` rewritten: SCN-001 (two processes, version-2 record), SCN-002 (pending, lost publication), SCN-003 (bounds per phase, removal, future date, prune), SCN-004 (version-1 and unreadable records), SCN-005 (single pickup, claimed bound, changed revision, ineligible), SCN-011 (cancel, stale publication) |
| T-008 | done | `packages/mcp-server/test/companion-continuation.test.js`: qualification with the new names (SCN-013), approval handoff picked up once with the refusal sentence on repeat and no owner (SCN-006, SCN-009, SCN-012), ordinary continuations while pending, after pickup, with an unreadable record and during activity, running from `observeCodexActivity` and ready after Stop, stale write rejected (SCN-007, SCN-008, SCN-009); `packages/mcp-server/test/safety.test.js` declares `unlinkSync` for the store and pins its single `removeFile` helper |
| T-009 | done | `skill-dispatch-function-contract-test.js` (schema keys, `continuation_owner` rejected by schema and parser, malformed attempt rejected); `companion-continuation.test.tsx` running notice kept through a failed poll; browser fixture `receive` without `work_admission`, ordinary events, Cockpit clock offset `advance`; browser cases SCN-006 (ordinary continuation never refused), SCN-007 (grant by attempt), SCN-009 (running follows activity until Stop or Interrupt), SCN-010 (claimed phase passed by clock offset) |
| T-010 | done | `npm run build:prepare` pass (no Copilot payload growth reported, baseline unchanged); `npm run compatibility:record` pass (new observation `evals/host-compatibility/observations/b0c4805e...json`, source fingerprint afc97c7a...); `npm run compatibility:check` pass, 56 scenarios, 0 failed |

## Test Results

All commands run locally on Windows 11, Node 22.22.3, in this worktree after `npm run build:prepare`.

| Check | Scenarios | Result |
|---|---|---|
| `node --test packages/core/test/codex-continuation-admission-test.js` | SCN-001 to SCN-005, SCN-011 | pass, 6 of 6 |
| `npm --prefix packages/cli run test:companion-run-view` (includes the admission test and `codex-companion-activity-test.js`) | SCN-001 to SCN-005, SCN-011 | pass, 76 pass, 1 pre-existing symlink skip |
| `node --test packages/mcp-server/test/companion-continuation.test.js` | SCN-006 to SCN-009, SCN-012, SCN-013 | pass, 3 of 3 |
| `npm --prefix packages/mcp-server test` (contract, continuation, protocol, cockpit gating, generation, safety, provenance, performance, package, SDK digest) | SCN-006 to SCN-009, SCN-012, SCN-013 | pass, exit 0 |
| `npm --prefix packages/cli run test:skill-dispatch` and `git diff 6e166cab` on the three restored files | SCN-010 | pass; diff empty |
| packages/control-ui `npm run build`, `npm test` (service and vitest), `npx tsc --noEmit` | SCN-008 | pass, 35 files, 441 of 441 tests; typecheck clean |
| `node --check` on `companion-continuation-cases.mjs` and `companion-continuation-fixture.mjs` | SCN-013 | pass (syntax only; the browser cases are not run on this host) |
| `npm --prefix packages/cli run test:cockpit-core` | SCN-013 | 112 pass, 1 fail on a host limit: `cockpit-draft-check-test.js` symlink EPERM, fails on this host independent of the change (file untouched) |
| `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` | SCN-013 | pass, 56 scenarios, 0 failed |

## Gaps

- The browser continuation cases run only in the native release probe; here they are checked by review and `node --check`.
- No native Codex host was exercised; the existing continuation qualification record no longer matches and must be recorded again on a real Codex host.

## Decision

- decision: pass
