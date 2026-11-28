# Brownfield Analysis: Recoverable Codex continuation leases

Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: `done`

## Run

- run_id: run-5fbcb71f-d164-46ce-9288-aa25d6a90642
- approved_tp: .agdf/control/runs/run-5fbcb71f-d164-46ce-9288-aa25d6a90642/documents/TP.md (sha256:2605894d5d87d3e963b004486f893c8a475e05491ca0ca91945e2e0b07013307)
- approved_sd: sha256:667f4bd7fdc3a7a7396347d029d87c0182f04c0dcbc372feba580fc407956b37
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27

## Scope

Implementation preparation for T-001 to T-006 on branch `agdf/pr84-continuation-locks` (base c0e0c600, head of `codex/agdf-companion-reader-and-continuation`, PR #84). No candidate code exists yet; the path below starts from the branch state.

## Existing Owners And Reuse Path

| Area | Existing owner | Reuse strategy | Evidence |
|---|---|---|---|
| Admission record and transitions | `packages/core/lib/companion/codex-continuation.js` `createCodexContinuationAdmission` (`change`, `observeRunning`, `inspect`, `reserve`, `publish`, `cancelReservation`, `claim`, `associateTurn`, `settleRunning`, `settleTurn`) | extend in place (SDD-001 to SDD-004): clock option, `updated_at`, expiry in `status`, removal in `change`, claim rules, `holds`, unbounded `settleTurn` | `status` lines 93-98, `change` 107-118, `claim` 167-186, `settleTurn` 197-212 with `names.length > 512` |
| Record validation and read | `validateRecord` lines 40-54, `readRecord` lines 56-76 (O_NOFOLLOW open, fstat identity, 4096-byte bound) | extend: optional `updated_at`; return the age source from the existing `fstat` | `readRecord` already holds `stat` from `fstatSync` |
| Lock and write | `owned-file-lock.js` `withOwnedFileLockWait` (lock file `path + '.lock'`), `atomicWrite` | reuse; removal uses `unlinkSync` of the record path inside the same lock | `withOwnedFileLock` line 221 builds the lock path; `recordPattern` only matches names ending in `.json` |
| Companion eligibility | `codex-continuation-binding.js` `isCurrentContinuation`, `continuationBinding` | reuse unchanged; called only for reservation, publication and attempt claims | `cockpit-session.js` `continue` passes `eligible` to `reserve` and `publish`; `mcp-dispatch-runtime.js` passes it to every `claim` today |
| Dispatch admission | `packages/cli/lib/mcp-dispatch-runtime.js` `admitCodexContinuation` (lines 97-113), `createMcpDispatchRuntime` (115-142), `postprocessToolResult` (161+) | extend (SDD-005, SDD-006): ordinary fail-open, owner map in the runtime closure, next-call injection in `postprocessToolResult` | the MCP server calls `postprocessToolResult` before projecting the result and building `next_action` (`packages/mcp-server/src/server.js` lines 244-253) |
| Next calls after canonical writes | `run-command-service.js` line 189 `continueDeliveryCall({ ...input, primary_target: root }, runId)` for `run.create`, `run.create_from_planned`, `step.record`, `artefact.record`, `ur_draft.replace`, `approval.record` | reuse unchanged; the owner is added afterwards | these kinds map to `agdf_run`, `agdf_record`, `agdf_revise` and `agdf_approve`; results carry `binding.target_id` |
| Hook observation | `codex-activity.js` `observeContinuation` (lines 96-115) creates the admission per hook | extend (SDD-007): pass `{ now: () => now }` | `observeCodexActivity(dataRoot, input, now)` already receives the hook time |
| Dispatch schema | `skill-dispatch/contract.js` `continuation_owner` with `dependentSchemas` | reuse unchanged | owner-bound `resume_call` already uses it (`mcp-continuation.js` line 92) |

## Comparison With The Approved SD

All seven SD decisions map onto existing owners without a new module. Implementation details that follow from the code and stay inside the SD:

- `status` is used by every transition for its projection; it gains the clock, so the module-level `status(record)` becomes a closure inside the admission (or takes `now` as a parameter).
- `observeRunning` writes `ended` and then `settled` when `canRelease` passes; with SDD-002 the settled write becomes a removal while an ended record that cannot be released yet is still written.
- `claim` for an attempt keeps its current order (eligibility first, then the record check) so the existing tests keep their projections.
- `settleRunning` stays exported as an alias because `companion-continuation.test.js` calls it.

## Regression Risk And Test Impact

- `codex-continuation-admission-test.js` (8 tests including the parametrized Stop/Interrupt pair) must pass unchanged in meaning; the case "a matching native turn and a clean mutation check are required to settle work" ends with a running record after Stop for a second attempt whose turn association happened after the earlier Stop; this stays valid because the new attempt is only associated, not ended.
- `companion-continuation.test.js` asserts that an ordinary dispatch is refused while a Companion admission is pending ("not confirmed") and running ("already working"); both remain live foreign admissions under the new rule.
- The existing test "unreadable durable admission never becomes a new reservation" uses a fresh unreadable record; it must stay `unavailable` because its file is younger than the running bound.
- No control-ui change; `companion-continuation.test.tsx` is unaffected.
- The Copilot payload grows by the added code; the baseline is raised per the change chain.

## Architecture And Parallel-Structure Risk

- architecture_relevance: relevant (runtime record format and dispatch admission), resolved by SDD-001 to SDD-007; no new owner, no second lease store.
- No parallel structure: the owner memory is a cache of admissions this runtime granted; the durable record stays the authority (`holds` re-reads it before the owner is used).

## Context Graph Impact

- context_graph_impact: link_only (CG-MCP-DISPATCH-ADAPTER, no node change)

## Minimal Clean Implementation Path

1. T-001 in `codex-continuation.js`, running the existing admission test after the change.
2. T-002 hook clock in `codex-activity.js`.
3. T-003 dispatch runtime changes.
4. T-004 and T-005 new cases, running each suite after its change.
5. T-006 change chain in the established order (`npm run build:prepare`, payload baseline, `npm run compatibility:record`), then the TP check list and `npm run compatibility:check`.

## Next Permissible Step

- next_allowed_action: CD+Tests for T-001 to T-006.
- forbidden_until_then: CR, QA, UAT, commit, push, PR.

## Decision

- decision: pass
