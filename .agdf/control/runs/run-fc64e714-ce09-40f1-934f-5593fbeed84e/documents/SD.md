# SD: Lean Codex continuation handoff

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-27
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The admission module `packages/core/lib/companion/codex-continuation.js` becomes a small handoff store: one record per target and Run with the phases `reserved`, `pending` and `claimed`, each with a fixed bound counted from the time of its last phase change. Every finishing transition removes the record file; an expired record counts as absent and is removed on the next access. There is no `running` phase, no owner token and no turn association any more.

The dispatch runtime only touches the store when a dispatch names a Companion `continuation_attempt_id`: it claims that attempt once or stops with one sentence. Every other `continue_delivery` returns the Core result unchanged. The owner chain introduced by PR #84 is removed from the dispatch contract, the continuation builder, the prepared next calls and the Codex hook observation, which return to their pre-PR-#84 form.

The Companion continuation operations in the Cockpit session combine two sources: the handoff store for `pending` and a just claimed handoff, and the existing Codex activity lease (`readCodexObservation`) for running work on the shown Run's current agent step. The control-ui drops the `stopping` state.

## 2. Ownership And Source Of Truth

- Handoff state: `packages/core/lib/companion/codex-continuation.js` (sole writer of `codex-continuation/` below the companion data root).
- Running work: the Codex activity lease, `packages/core/lib/companion/codex-activity.js` (writer, hook driven) and `packages/core/lib/companion/activity.js` (`matchesActivity`, `codexTurnBound`); unchanged and only read here.
- Companion start eligibility: `packages/core/lib/companion/codex-continuation-binding.js` (`continuationBinding`, `isCurrentContinuation`); unchanged.
- Consistency of concurrent continuations: the revision binding of every canonical write in Core (`expected_revision_id`); unchanged.
- Dispatch admission and refusal texts: `packages/cli/lib/mcp-dispatch-runtime.js` (`admitCodexContinuation`, `stopCodexContinuation`).
- Dispatch input contract: `packages/core/lib/skill-dispatch/contract.js`.
- Companion continuation operations: `packages/core/lib/control-inspect/cockpit-session.js` (`continue`).
- Companion UI states: `packages/control-ui/src/mcp/companion-continuation.ts` and `packages/control-ui/src/mcp/CompanionContinuationAction.tsx`.
- Native qualification observation list: `packages/core/lib/runtime/plugin-provenance.js` (`CODEX_CONTINUATION_OBSERVATIONS`).

## 3. Architecture Decisions

- SDD-001: Handoff records use `schema_version: 2` with exactly the fields `target_id`, `run_id`, `revision_id`, `operation_key`, `attempt_id`, `view_id`, `phase` (one of `reserved`, `pending`, `claimed`) and `since` (integer milliseconds); the file location, name pattern, 4096-byte read bound, symlink checks and per-record lock with a 250 ms wait stay as they are; `root`, `owner`, `turn`, `ended` and `interrupt_requested` are dropped; rationale: the record only has to identify one handoff and its age, and keeping the location and lock reuses the proven one-writer path; consequence: a build with this change cannot read records of the PR #84 build, which SDD-003 handles.
- SDD-002: Bounds are module constants `reserved` 120000 ms, `pending` 600000 ms and `claimed` 60000 ms, counted from `since`, which every phase change sets from the admission clock `createCodexContinuationAdmission(dataRoot, { now = Date.now })`; a record is live when `since` lies within its bound before now and not more than its bound after now; a record that is not live counts as absent, every transition that finds it removes its file under the record lock, and a finishing transition (cancel, stale publication, stale claim of the same attempt) removes the file instead of writing a settled phase; after a successful reservation the store removes other record files whose modification time is older than the pending bound, each under its own lock taken without waiting and only after re-reading that the record is not live; rationale: fixed bounds from the approved PRD, a future-dated record cannot lock beyond its bound, and pruning on reservation keeps the directory to live handoffs without a turn hook; consequence: a record of a Run nobody touches again stays until the next reservation anywhere, and it never blocks.
- SDD-003: A record that parses as JSON with `schema_version: 1` (PR #84 format) counts as absent and is removed under the lock on the next transition; any other unreadable record makes Companion operations of that Run report `unavailable` until the file's modification time is older than the pending bound, after which it counts as absent and is removed on the next transition; ordinary continuations never read the store; rationale: PRD AC-002 forbids PR #84 records from blocking, and an unknown file is only trusted to block for the longest handoff bound; consequence: a corrupted live handoff can lose its protection after 10 minutes, which equals its own bound.
- SDD-004: `claim(scope, attemptId, eligible)` admits only when a live `pending` record has the same `attempt_id`, `revision_id` and `operation_key` and `eligible()` confirms the current Companion eligibility; it then writes `phase: 'claimed'` with a new `since` and returns `{ state: 'running', attempt_id, admitted: true }`; a matching attempt whose Run is no longer eligible removes the record; every other case returns `{ state: 'stale' }` without touching another handoff, and read or lock failures return `{ state: 'unavailable' }`; the `owner` option, `associateTurn`, `observeRunning`, `settleRunning` and `settleTurn` are removed; rationale: one pickup per handoff (PRD AC-003) needs only the attempt identity, and the claimed phase carries the running display until the activity lease takes over; consequence: a lost pickup response cannot be repeated with the same attempt, and the person continues in chat instead.
- SDD-005: `admitCodexContinuation` returns the Core result unchanged unless the dispatch carries `continuation_attempt_id`; with an attempt it returns the result unchanged when it is terminal or has no continuation, stops with `unavailable` when no store is configured, and otherwise always claims, for every operation, with `isCurrentContinuation` as the eligibility check; an admitted claim returns the result without `work_admission` and without an instruction suffix; `stopCodexContinuation` keeps two sentences: `stale` gives "This Companion handoff was already used, has expired or the Run has changed. Continue the Run in chat to proceed." (German: "Diese Übergabe aus dem Begleiter wurde schon verwendet, ist abgelaufen oder der Run hat sich geändert. Setze den Run im Chat fort, um weiterzumachen.") and `unavailable` keeps "Continuation is unavailable for this Run."; rationale: PRD AC-004 and AC-006, and claiming for every operation makes a non-matching operation key a refusal instead of an unclaimed continuation; consequence: the running, pending and interrupt sentences disappear from chat.
- SDD-006: `continuation_owner` is removed from the `agdf_dispatch` definition, its `dependentSchemas`, the `not` clause of `continuation_attempt_id`, `normalizeSkillDispatchInput` and `parseSkillDispatchFunctionArguments`, so the existing `additionalProperties: false` rejects it; `continuation_attempt_id` and its single-value Codex check stay; `mcp-continuation.js` (`resume_call`), `prepared-control-calls.js` (`continueDeliveryCall`) and `codex-activity.js` (no `observeContinuation`, no admission import) return to their content before PR #84 (base 6e166cab); rationale: nothing consumes the owner once ordinary continuations are not gated, and reverting to the previous form avoids new code; consequence: the public dispatch schema changes, which is acceptable because PR #84 is unreleased.
- SDD-007: In `cockpit-session.js` the `status` operation returns the store state, and when that state is `ready` it reads `readCodexObservation(companionDataRoot, session.companionBinding, now())` and returns `running` if it reports activity; `reserve` performs the same activity check before reserving and returns `running` without a reservation; `publish` and `cancel` are unchanged; the store itself does not read the activity lease; in the control-ui the `stopping` state, its mapping from `interrupt_requested` and its text are removed, and the polling keeps treating `running` as a state that holds the start back; rationale: `companionBinding` already carries target, Run and current gate exactly as the card's activity display uses them, so both views agree; consequence: without a sign of life of the Companion hooks the card shows only the handoff state (PRD risk), and an approval step, which has no agent activity, shows `running` only during the 1-minute claimed phase.
- SDD-008: `CODEX_CONTINUATION_OBSERVATIONS` replaces `competing_normal_continuation` with `ordinary_continuation_unblocked` and `native_terminal` with `running_from_activity`; the other seven names stay; rationale: the native record must prove the new behaviour (an ordinary chat continuation passes while a handoff is pending, and the card shows Codex work from the activity lease), while turn-end settlement no longer exists; consequence: an existing native qualification record no longer matches and must be recorded again on a real Codex host, as the UR already states.

## 4. Integration Points

- `agdf_dispatch` input: `continuation_owner` removed; output: no `work_admission`, `resume_call` without owner.
- `agdf_cockpit_continue`: states stay `ready`, `pending`, `running`, `stale`, `unavailable`; `interrupt_requested` is no longer returned; the existing result validator in `packages/core/lib/mcp-tool-errors.js` stays valid.
- Companion data root: `codex-continuation/` records in the version-2 format; `companion/codex-activity.json` is read only.
- Codex hooks: `observeCodexActivity` no longer touches the handoff store.
- control-ui: `companion-continuation.ts`, `CompanionContinuationAction.tsx`; the handoff message and model context sent by `start` are unchanged.
- Generated runtime copies under `packages/cli/runtime` and `packages/cli/generated`, the Copilot payload baseline and the host compatibility record follow through the existing build chain.

## 5. Constraints And Compatibility

- Handoff results stay `authorizes: false`; the Companion never records an approval, and the approval handoff still only opens the decision presentation.
- Only this unreleased branch wrote version-1 records; SDD-003 makes them harmless.
- No change to the activity lease, its bounds or its hook profile (`CODEX_HOOK_PROFILE` stays `2`, because the hook entries do not change).
- The change chain is `npm run build:prepare`, the exact Copilot payload baseline acceptance if growth is reported, `npm run compatibility:record` and `npm run compatibility:check`.
- The branch is merged upward into PR #85 and PR #86 afterwards; their baseline and compatibility conflicts are resolved there.

## 6. Test And Evidence Strategy

- Reuse: the existing two-process send-permit test, the cancel and stale-publication test and the lost-publication test in `packages/core/test/codex-continuation-admission-test.js` stay in meaning; the qualification test in `packages/mcp-server/test/companion-continuation.test.js` stays with the new observation names.
- Replace: the shared-authority test with ordinary claims, both turn-settlement tests and the owner assertions are removed with the behaviour they covered.
- New Core admission tests with a controlled clock: expiry per phase and removal, future-dated record, version-1 record, unreadable record before and after the pending bound, single claim and stale second claim, prune of old records on reservation.
- New or changed MCP server tests through the real dispatch and Cockpit runtimes: pickup once and refused second pickup with the sentence, ordinary continuation while a handoff is pending and while activity runs, a write against an outdated revision still rejected, no `work_admission` and no owner in `resume_call`, running from a recorded activity via `observeCodexActivity` and ready after its Stop, approval handoff unchanged.
- Contract: `packages/cli/scripts/skill-dispatch-function-contract-test.js` lists the schema keys without `continuation_owner` and shows the field is rejected.
- control-ui: `packages/control-ui/test/companion-continuation.test.tsx` loses the stopping case and keeps running, pending and stale.
- Browser cases `packages/control-ui/test/browser/companion-continuation-cases.mjs` and the fixture are updated (no owner, no stopping, ordinary continuation not refused); they run only in the native release probe, not on this Windows host and not in CI, so their update is checked by review and a syntax check.
- Run-level proof before CR: Core test suite, MCP server tests, control-ui unit tests, the dispatch contract test and `npm run compatibility:check`; CI on the pushed branch repeats them.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Reservation stays a locked read and write per record; one live record per Run gives one send permit | `codex-continuation.js` | SDD-001, SDD-002 | none: lock and location unchanged |
| AC-002 | Fixed bounds from `since`, absent when not live, removal on access and pruning on reservation; version-1 records absent | `codex-continuation.js` | SDD-002, SDD-003 | Records of the PR #84 build are removed; no other consumer |
| AC-003 | Claim of a live pending attempt writes `claimed` once; every later or non-matching claim is stale with one chat sentence | `codex-continuation.js`, `mcp-dispatch-runtime.js` | SDD-004, SDD-005 | A lost pickup response cannot be replayed; chat continuation remains |
| AC-004 | Dispatch without attempt bypasses the store; Core revision checks keep writes consistent | `mcp-dispatch-runtime.js`, Core write services | SDD-005 | Duplicate work possible without hooks, stated as residual risk |
| AC-005 | Cockpit status and reserve add the activity lease for the shown agent step; `stopping` removed in the UI | `cockpit-session.js`, `codex-activity.js`, control-ui | SDD-007 | Without hook liveness only the handoff state is shown |
| AC-006 | `continuation_owner` removed from contract and builders; no `work_admission` | `contract.js`, `mcp-continuation.js`, `prepared-control-calls.js`, `mcp-dispatch-runtime.js` | SDD-005, SDD-006 | Public schema change on an unreleased branch |
| AC-007 | Cancel, stale publication and approval handoff keep their behaviour with the new store; no approval recording path is added | `codex-continuation.js`, `cockpit-session.js`, `companion-continuation.ts` | SDD-002, SDD-004 | none: existing tests keep their meaning |
| AC-008 | Suites, contract test, build chain and compatibility check; qualification list updated | test suites, `plugin-provenance.js`, build scripts | SDD-008 | Native qualification record must be recorded again later |

## 8. Risks And Open Questions

- Clock jumps shift record ages; the future-date rule limits a backward jump to one bound.
- The 1-minute claimed display can end before the first activity is recorded on a slow host; the card then shows ready briefly and a second click would reserve a new handoff while Codex already works. Consistency still holds through the revision check.
- Without trusted Companion hooks the card cannot see chat work; duplicate work is possible.
- The browser cases cannot be executed here.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Record format and where the age is kept | before_sd | resolved | Version 2 with `since` set on each phase change (SDD-001) | Arndt Gold |
| How expired and finished records disappear | before_sd | resolved | Removal on access under the record lock and pruning of files older than 10 minutes on reservation (SDD-002) | Arndt Gold |
| Treatment of PR #84 records and unreadable records | before_sd | resolved | Version 1 absent and removed; unreadable blocks Companion operations for at most 10 minutes by file time (SDD-003) | Arndt Gold |
| Where the activity lease is combined with the handoff state | before_sd | resolved | In the Cockpit session status and reserve operations; the store stays independent (SDD-007) | Arndt Gold |
| Which dispatches touch the store | before_sd | resolved | Only dispatches with `continuation_attempt_id`, for every operation (SDD-005) | Arndt Gold |
| New qualification observation names | before_sd | resolved | `ordinary_continuation_unblocked` and `running_from_activity` replace `competing_normal_continuation` and `native_terminal` (SDD-008) | Arndt Gold |
| Exact split of new tests across files and fixtures | later_tp | deferred | TP assigns each test to a file and names the browser case changes | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Die Begleiter-Übergabe wird ein kleiner Speicher mit drei Phasen und festen Ablaufzeiten; gewöhnliche Fortsetzungen berühren ihn nicht, und „Codex arbeitet“ kommt aus dem Aktivitätsnachweis.
- Umfang: neues Datensatzformat Version 2 mit Zeitstempel (SDD-001); Ablauf 2 / 10 / 1 Minuten, Löschen beim Zugriff und Aufräumen alter Dateien bei jeder Reservierung (SDD-002); PR-#84-Dateien gelten als nicht vorhanden, unlesbare Dateien blockieren den Begleiter höchstens 10 Minuten (SDD-003); einmaliges Abholen per Versuchskennung, sonst „veraltet“ (SDD-004); Dispatch prüft nur noch Aufrufe mit Versuchskennung, neuer Abweisungssatz, kein `work_admission` (SDD-005); `continuation_owner` entfernt, Folgeaufruf-Bau und Hook-Beobachtung auf den Stand vor PR #84 zurückgesetzt (SDD-006); Laufanzeige und gesperrte Reservierung aus dem Aktivitätsnachweis in der Cockpit-Sitzung, Zustand „Abbruch angefordert“ entfernt (SDD-007); Qualifizierungsliste mit `ordinary_continuation_unblocked` und `running_from_activity` (SDD-008).
- Nachweis: neue Core-Tests mit gesteuerter Uhr, MCP-Server-Tests durch echten Dispatch und Cockpit, Vertragstest, control-ui-Test, angepasste Browserfälle (hier nicht ausführbar), Build-Kette und Kompatibilitätsprüfung.
- Entscheidungen: alle Designfragen sind geklärt; nur die genaue Aufteilung der Tests legt der TP fest.
- Risiken: Uhrsprünge, eine zu kurze Abholanzeige auf langsamen Hosts, fehlende Hook-Lebenszeichen und nicht ausführbare Browserfälle; die Konsistenz sichert jeweils die Revisionsprüfung.
