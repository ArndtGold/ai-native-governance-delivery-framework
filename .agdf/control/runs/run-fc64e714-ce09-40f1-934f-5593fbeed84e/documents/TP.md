# TP: Lean Codex continuation handoff

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
| T-001 | Rewrite `packages/core/lib/companion/codex-continuation.js` as the handoff store of SDD-001 to SDD-004: version-2 record (`target_id`, `run_id`, `revision_id`, `operation_key`, `attempt_id`, `view_id`, `phase`, `since`), clock option `createCodexContinuationAdmission(dataRoot, { now })`, bounds 120000 / 600000 / 60000 ms, liveness including the future-date rule, removal instead of settled writes, version-1 records treated as absent and removed, unreadable records blocking until their file time passes the pending bound, pruning of other record files older than the pending bound after a reservation, `claim(scope, attemptId, eligible)` with the claimed phase; remove `owner`, `turn`, `associateTurn`, `observeRunning`, `settleRunning`, `settleTurn` and the release check | Claude (agent) | none |
| T-002 | Remove the owner chain (SDD-006): restore `packages/core/lib/companion/codex-activity.js`, `packages/core/lib/control-state/prepared-control-calls.js` and `packages/core/lib/skill-dispatch/mcp-continuation.js` to their content at base 6e166cab; remove `continuation_owner` from `packages/core/lib/skill-dispatch/contract.js` (property, `dependentSchemas` entry, `not` clause, custody check, normalized and parsed fields) while keeping `continuation_attempt_id` | Claude (agent) | none |
| T-003 | Change `packages/cli/lib/mcp-dispatch-runtime.js` (SDD-005): `admitCodexContinuation` acts only with `continuationAttemptId`, claims for every operation with `isCurrentContinuation`, returns admitted results unchanged (no `work_admission`, no instruction suffix); `stopCodexContinuation` keeps only the `stale` sentence of the SD (English and German) and the `unavailable` sentence | Claude (agent) | T-001, T-002 |
| T-004 | Change `packages/core/lib/control-inspect/cockpit-session.js` (SDD-007): `status` returns `running` when the store reports `ready` and `readCodexObservation(companionDataRoot, session.companionBinding, now())` reports activity; `reserve` returns `running` without reserving in the same case | Claude (agent) | T-001 |
| T-005 | Remove the `stopping` state from `packages/control-ui/src/mcp/companion-continuation.ts` (type and `interrupt_requested` mapping) and `packages/control-ui/src/mcp/CompanionContinuationAction.tsx` (state checks and text) (SDD-007) | Claude (agent) | none |
| T-006 | Replace `competing_normal_continuation` with `ordinary_continuation_unblocked` and `native_terminal` with `running_from_activity` in `CODEX_CONTINUATION_OBSERVATIONS` of `packages/core/lib/runtime/plugin-provenance.js` (SDD-008) | Claude (agent) | none |
| T-007 | Rewrite `packages/core/test/codex-continuation-admission-test.js` for SCN-001 to SCN-005 and SCN-011 with a controlled clock and file times set by `utimesSync`; drop the shared-authority and turn-settlement cases | Claude (agent) | T-001 |
| T-008 | Rewrite the dispatch case of `packages/mcp-server/test/companion-continuation.test.js` for SCN-006 to SCN-009 and SCN-012 through the real dispatch and Cockpit runtimes, using `observeCodexActivity` to record activity; keep the qualification case with the new names (SCN-013) | Claude (agent) | T-002 to T-004, T-006 |
| T-009 | Update `packages/cli/scripts/skill-dispatch-function-contract-test.js` (SCN-010), `packages/control-ui/test/companion-continuation.test.tsx` (stopping case removed, running kept) and the browser files `packages/control-ui/test/browser/companion-continuation-cases.mjs` and `companion-continuation-fixture.mjs` (no `work_admission`, no stopping, ordinary continuation not refused, running from activity) | Claude (agent) | T-002, T-003, T-005 |
| T-010 | Change chain and verification: `npm run build:prepare` (exact Copilot payload baseline with a rationale naming this run if `AGDF_COPILOT_PAYLOAD_GROWTH`), `npm run compatibility:record`, the suites of the Test Plan and `npm run compatibility:check` | Claude (agent) | T-001 to T-009 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-007 | SCN-001 | Two independent processes reserving and publishing the same Run yield exactly one send permit and one reservation; the stored record is version 2 with the eight fields; another Run can still be reserved | Admission test output |
| AC-001 | SDD-002 | T-007 | SCN-002 | A second reservation while a live reservation or pending handoff exists returns `pending` without `reserved`; after a lost publication response a reopened store still reports `pending` and gives no second send permit | Admission test output |
| AC-002 | SDD-002 | T-007 | SCN-003 | With a controlled clock a reservation reports `pending` at 119999 ms and `ready` at 120000 ms, a published handoff `pending` at 599999 ms and `ready` at 600000 ms; the next transition removes the old file and a new reservation succeeds; a record dated more than its bound in the future counts as absent; a reservation removes another Run's record file whose modification time is older than 600000 ms and keeps a younger live one | Admission test output |
| AC-002 | SDD-003 | T-007 | SCN-004 | A version-1 record of the PR #84 format reports `ready`, a reservation succeeds and replaces it; a non-JSON record reports `unavailable` and blocks reservation until its file time is 600000 ms old, then reports `ready` and is removed by the next reservation | Admission test output |
| AC-003 | SDD-004 | T-007 | SCN-005 | Claiming a published attempt returns `running` with `admitted: true` once; a second claim of the same attempt, a claim with another attempt and a claim at another revision return `stale`; a claim whose eligibility check fails removes the handoff; the claimed record reports `running` until 60000 ms and `ready` afterwards | Admission test output |
| AC-003 | SDD-005 | T-008 | SCN-006 | Through the dispatch runtime the first dispatch with the attempt returns the governed continuation; the second returns `terminal: true` with "This Companion handoff was already used, has expired or the Run has changed." in `host_action.text` | MCP server test output |
| AC-004 | SDD-005 | T-008 | SCN-007 | An ordinary `continue_delivery` returns its continuation (not terminal, no refusal) while a handoff is pending, after it was claimed, while activity is recorded and with an unreadable record; an approval recorded against an outdated revision is rejected by Core | MCP server test output |
| AC-005 | SDD-007 | T-008 | SCN-008 | After `observeCodexActivity` records a PostToolUse work result for the shown Run, the Cockpit `status` and `reserve` operations return `running` and no reservation is created; after the turn's Stop they return `ready` and `reserve` succeeds; the control-ui unit test shows `running` text and no stopping text | MCP server and control-ui test output |
| AC-006 | SDD-005 | T-008 | SCN-009 | No dispatch result contains `work_admission`, and the `resume_call` of a claimed continuation has no `continuation_owner` | MCP server test output |
| AC-006 | SDD-006 | T-009 | SCN-010 | The dispatch schema keys end with `continuation_attempt_id` only; the schema validator and `normalizeSkillDispatchInput` reject `continuation_owner`; `git diff 6e166cab -- codex-activity.js prepared-control-calls.js mcp-continuation.js` is empty | Contract test output and Git diff |
| AC-007 | SDD-002 | T-007 | SCN-011 | Cancelling a reservation removes its file and returns `ready`; a publication whose eligibility fails removes the file and returns `stale`; publishing after cancel gives no send permit | Admission test output |
| AC-007 | SDD-004 | T-008 | SCN-012 | The approval handoff (`approval.record`) is claimed once and returns `presentation_required` with an `agdf_prepare` next call, and the repository tree is byte-identical before and after (no approval recorded) | MCP server test output |
| AC-008 | SDD-008 | T-010 | SCN-013 | The qualification case passes with the new observation names and fails `qualification_observations_incomplete` without `ordinary_continuation_unblocked`; all suites of the Test Plan and `npm run compatibility:check` pass | Command output recorded in the run evidence |

## 3. Test Plan

Reuse: the two-process permit, lost-publication, cancel and stale cases of the admission test and the qualification case of the MCP server test keep their meaning with the new store. New proof covers the changed behaviour: bounds and removal with a controlled clock instead of waiting, version-1 and unreadable records, single pickup, ordinary continuations in every handoff state, running from the activity lease and the removed owner field. Expected results come from PRD AC-001 to AC-008 and SD SDD-001 to SDD-008. All checks run locally on Windows in this worktree before CR; CI repeats them on the pull request. Checking is sufficient when every scenario passes and `compatibility:check` reports no mismatch. Gaps: the browser continuation cases run only in the native release probe and are checked here by review and `node --check`; native Codex host behaviour is not re-qualified in this run.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `npm --prefix packages/cli run test:companion-run-view` (includes `codex-continuation-admission-test.js`) | Local worktree, Windows | Writable temp directory | Claude (agent) | Passing permit case | Fix and rerun; CR blocked |
| AC-001 | SCN-002 | same command | Local worktree | Writable temp directory | Claude (agent) | Passing pending and reopen cases | Fix and rerun; CR blocked |
| AC-002 | SCN-003 | same command | Local worktree | Writable temp directory | Claude (agent) | Passing expiry, future-date and prune cases | Fix and rerun; CR blocked |
| AC-002 | SCN-004 | same command | Local worktree | Writable temp directory | Claude (agent) | Passing version-1 and unreadable cases | Fix and rerun; CR blocked |
| AC-003 | SCN-005 | same command | Local worktree | Writable temp directory | Claude (agent) | Passing claim cases | Fix and rerun; CR blocked |
| AC-003 | SCN-006 | `npm --prefix packages/mcp-server run test:continuation` | Local worktree | mcp-server dependencies installed | Claude (agent) | Passing pickup case | Fix and rerun; CR blocked |
| AC-004 | SCN-007 | same mcp-server command | Local worktree | mcp-server dependencies installed | Claude (agent) | Passing ordinary-continuation case | Fix and rerun; CR blocked |
| AC-005 | SCN-008 | same mcp-server command, then `npm --prefix packages/control-ui run build` and `npm --prefix packages/control-ui test` | Local worktree | control-ui dependencies installed | Claude (agent) | Passing activity case and control-ui suite | Fix and rerun; CR blocked |
| AC-006 | SCN-009 | same mcp-server command | Local worktree | mcp-server dependencies installed | Claude (agent) | Passing no-owner assertions | Fix and rerun; CR blocked |
| AC-006 | SCN-010 | `npm --prefix packages/cli run test:skill-dispatch` and `git diff 6e166cab -- packages/core/lib/companion/codex-activity.js packages/core/lib/control-state/prepared-control-calls.js packages/core/lib/skill-dispatch/mcp-continuation.js` | Local worktree | Git history with base 6e166cab | Claude (agent) | Passing contract test, empty diff | Fix and rerun; CR blocked |
| AC-007 | SCN-011 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Passing cancel and stale cases | Fix and rerun; CR blocked |
| AC-007 | SCN-012 | mcp-server command | Local worktree | mcp-server dependencies installed | Claude (agent) | Passing approval handoff case | Fix and rerun; CR blocked |
| AC-008 | SCN-013 | Suites above plus `npm --prefix packages/cli run test:cockpit-core`, `node --check` on both browser files, `npm run build:prepare`, `npm run compatibility:record`, `npm run compatibility:check` | Local worktree | Build prepared | Claude (agent) | All commands exit 0 | Report the failing command with output; CR blocked |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Exact split of new tests across files and fixtures | SD: Exact split of new tests across files and fixtures | resolved | Store cases (SCN-001 to SCN-005, SCN-011) in `codex-continuation-admission-test.js` with a controlled clock; dispatch and Cockpit cases (SCN-006 to SCN-009, SCN-012, SCN-013) in `companion-continuation.test.js` through the real runtimes; contract case (SCN-010) in `skill-dispatch-function-contract-test.js`; the stopping case leaves `companion-continuation.test.tsx`; the browser cases that assert `work_admission`, stopping or a refused ordinary continuation are rewritten to the new behaviour | Claude (agent) |
| Copilot payload baseline | TP | resolved | Raised to the observed values only if `build:prepare` reports growth, with a rationale naming this run | Claude (agent) |

## 4. Brownfield Scope

Before implementation (Brownfield Analysis) inspect: `codex-continuation.js` and all its callers (`cockpit-session.js`, `mcp-dispatch-runtime.js`, `codex-activity.js`, tests), `codex-continuation-binding.js`, `activity.js` (`matchesActivity`, `workBinding`), `owned-file-lock.js` (lock file naming, `withOwnedFileLockWait`), `contract.js` dispatch definition and normalization, `mcp-continuation.js`, `prepared-control-calls.js`, `plugin-provenance.js`, the control-ui continuation port and action, and the browser fixture and cases.

## 5. Out Of Scope

- Changes to the activity lease, its hook profile or its bounds.
- New Companion actions or settings; texts beyond the removed stopping state and the new pickup refusal sentence.
- Native re-qualification on a real Codex host and running the browser cases.
- Merging PR #84, #85 or #86; release notes and version bumps.

## 6. Risks And Blockers

- Block CR and QA: any failing scenario of the Test Plan or a `compatibility:check` mismatch.
- Revise: an expiry case that depends on real waiting instead of the controlled clock; a removal that leaves a lock file behind; a browser file that fails `node --check`.
- Warn: the native continuation qualification record no longer matches; PR #85 and PR #86 must merge this base again.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Aufgaben: T-001 Übergabespeicher in `codex-continuation.js` neu (Version 2, Uhr-Option, 2/10/1 Minuten, Löschen, alte und unlesbare Dateien, Aufräumen, einmaliges Abholen); T-002 Owner-Kette entfernt (drei Dateien auf Stand vor PR #84, `continuation_owner` aus dem Vertrag); T-003 Dispatch nur mit Versuchskennung, neuer Abweisungssatz; T-004 Laufanzeige aus dem Aktivitätsnachweis in der Cockpit-Sitzung; T-005 „Abbruch angefordert“ aus der UI; T-006 neue Qualifizierungsnamen; T-007 bis T-009 Tests (Speicher, MCP-Server, Vertrag, UI, Browserfälle); T-010 Änderungskette und Prüfungen.
- Nachweise: SCN-001/002 ein Sendeschein und Wartezustand (AC-001); SCN-003/004 Ablauf, Zukunftsdatum, Aufräumen, alte und unlesbare Dateien (AC-002); SCN-005/006 einmaliges Abholen im Speicher und im Dispatch (AC-003); SCN-007 gewöhnliche Fortsetzung in jedem Zustand, Revisionsprüfung greift (AC-004); SCN-008 Laufanzeige aus dem Aktivitätsnachweis (AC-005); SCN-009/010 kein Owner, Vertrag ohne `continuation_owner`, drei Dateien unverändert gegenüber der Basis (AC-006); SCN-011/012 Abbrechen, veralteter Run, Freigabe-Übergabe (AC-007); SCN-013 Qualifizierungsnamen, alle Suiten, Kompatibilitätsprüfung (AC-008).
- Prüfplan: lokal unter Windows in diesem Worktree vor dem Code-Review mit gesteuerter Uhr statt Warten, CI wiederholt im Pull Request; Browserfälle nur per Review und Syntaxprüfung, native Codex-Prüfung bleibt eine benannte Lücke.
- Planungsentscheidungen: Speicherfälle im Admission-Test, Dispatch- und Cockpit-Fälle im MCP-Server-Test, Vertragsfall im Vertragstest; Payload-Baseline nur bei gemeldetem Wachstum mit Begründung anheben.
- Nicht enthalten: Änderungen am Aktivitätsnachweis, neue Aktionen, native Neuqualifizierung, Ausführen der Browserfälle, Merge, Release-Notizen.
- Risiken: fehlschlagende Szenarien oder `compatibility:check` blockieren; der native Qualifizierungsnachweis passt nicht mehr; #85 und #86 müssen erneut nachgezogen werden.
