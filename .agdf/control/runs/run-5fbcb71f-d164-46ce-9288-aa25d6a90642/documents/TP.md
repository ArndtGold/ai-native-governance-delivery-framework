# TP: Recoverable Codex continuation leases

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
| T-001 | In `packages/core/lib/companion/codex-continuation.js`: add the `{ now }` option to `createCodexContinuationAdmission`; set `updated_at` on every write; accept an optional non-negative safe integer `updated_at` in `validateRecord`; let `readRecord` return the record with its age source (`updated_at` or the file modification time from `fstat`); add the bounds (2, 10, 60 minutes) and expiry to `status`; treat settled or expired records as absent inside `change()` and remove them; replace every write of `phase: 'settled'` by removal; treat an unreadable record older than the running bound as absent; restrict `eligible` to attempt claims; admit the same owner at an unchanged binding and refresh its time; refresh the time in `associateTurn`; add `holds(scope, owner)`; make `settleTurn` visit all record names and remove finished, expired and aged-out unreadable records | Claude (agent) | none |
| T-002 | In `packages/core/lib/companion/codex-activity.js`: `observeContinuation` creates the admission with `{ now: () => now }` | Claude (agent) | T-001 |
| T-003 | In `packages/cli/lib/mcp-dispatch-runtime.js`: `admitCodexContinuation` passes the eligibility callback only for attempt claims, lets an ordinary continuation proceed unchanged on `unavailable`, and records admitted owners in a map owned by `createMcpDispatchRuntime`; `postprocessToolResult` adds `continuation_owner` to `agdf_dispatch` `continue_delivery` next calls of `agdf_run`, `agdf_record`, `agdf_revise` and `agdf_approve` results for the same target and Run while `holds` confirms the owner, and forgets owners that no longer hold | Claude (agent) | T-001 |
| T-004 | Extend `packages/core/test/codex-continuation-admission-test.js` with the cases of SCN-001, SCN-004, SCN-005, SCN-006, SCN-007, SCN-008 and SCN-010, keeping all existing cases | Claude (agent) | T-001, T-002 |
| T-005 | Extend `packages/mcp-server/test/companion-continuation.test.js` with the cases of SCN-002, SCN-003 and SCN-009 through the real dispatch and Cockpit runtimes, keeping the existing cases | Claude (agent) | T-003 |
| T-006 | Contract text change chain and verification: `npm run build:prepare` (raise the Copilot payload baseline with a rationale naming this run if `AGDF_COPILOT_PAYLOAD_GROWTH`), `npm run compatibility:record`, then the suites of the Test Plan and `npm run compatibility:check` | Claude (agent) | T-001 to T-005 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-004 | SCN-001 | With a controlled clock a reservation older than 2 minutes, a pending handoff older than 10 minutes, a running admission without a turn and one whose last confirmation is older than 60 minutes each report `ready`; a record without `updated_at` is aged by its file time (set with `utimesSync`); before each bound the state stays; afterwards both a reservation and an ordinary claim succeed; the local running bound equals `codexTurnBound` | Admission test output |
| AC-001 | SDD-002 | T-004 | SCN-004 | An expired or settled record touched by a transition is removed or replaced, and `publish` after a removed reservation returns `ready` without `send` | Admission test output |
| AC-002 | SDD-006 | T-005 | SCN-002 | After an admitted ordinary dispatch, an `agdf_record` canonical write for the same Run returns an `agdf_dispatch` next call with `continuation_owner` equal to the admitted owner; dispatching it is admitted at the new revision; a write for another Run carries no owner | MCP server test output |
| AC-002 | SDD-004 | T-004 | SCN-005 | `holds` is true only for a running, not ended, not interrupted record with that owner and false after Stop, Interrupt or replacement by another claim | Admission test output |
| AC-003 | SDD-004 | T-004 | SCN-006 | A same-owner claim at an unchanged binding returns `admitted: true` with the same attempt and owner and a refreshed `updated_at`; a claim without owner or with another owner is refused with `running`; an ended or interrupted admission still refuses its owner | Admission test output |
| AC-004 | SDD-002 | T-004 | SCN-007 | After cancel, stale publication, Stop with a clean release and expiry the record file no longer exists; an unreadable record older than the running bound no longer blocks a reservation | Admission test output |
| AC-004 | SDD-003 | T-004 | SCN-008 | With 600 record files present (other targets or runs, settled or expired) a Stop of the turn settles its running record, and the finished files visited by the scan are removed | Admission test output |
| AC-005 | SDD-004 | T-004 | SCN-010 | An ordinary claim with an eligibility callback returning false is admitted when no live admission exists and refused with the live state when one exists | Admission test output |
| AC-005 | SDD-005 | T-005 | SCN-009 | An ordinary dispatch with an unreadable admission record returns the governed continuation without `work_admission`; an ordinary dispatch against a live foreign `running` admission stops with "Codex is already working on this Run." | MCP server test output |
| AC-006 | SDD-004 | T-005 | SCN-003 | The existing scoped-action case passes unchanged: stale input, one send permit, the attempt claimed once, no approval recorded, competing ordinary dispatch refused while pending and running | MCP server test output |
| AC-006 | SDD-007 | T-004 | SCN-011 | The existing hook cases pass with the hook time as clock: native turn settlement, Stop or Interrupt before the tool result, open write keeps the admission | Admission test output |
| AC-007 | none — verification of SDD-001 to SDD-007, no separate design decision | T-006 | SCN-012 | All suites of the Test Plan pass and `npm run compatibility:check` passes after `npm run compatibility:record` | Command output recorded in the run evidence |

## 3. Test Plan

Reuse: the existing admission and MCP server continuation tests already cover one send permit, competition, lost publication, cancellation, unreadable records and native turn settlement; they stay and run with the new clock. New proof covers only the reviewed gaps: expiry, removal, unbounded turn-end scan, same-owner re-admission, owner continuity after a canonical write and ordinary continuations without eligibility or with an unreadable record. Expected results come from PRD AC-001 to AC-007 and SD SDD-001 to SDD-007. All checks run locally on Windows in this worktree before QA; CI repeats them on the pull request. Checking is sufficient when every scenario passes and `compatibility:check` reports no mismatch; native Codex host checks and the browser continuation cases are out of scope and remain an explicit gap.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node --test packages/core/test/codex-continuation-admission-test.js` | Local worktree, Windows | Writable temp directory | Claude (agent) | Passing expiry cases | Fix and rerun; QA blocked |
| AC-001 | SCN-004 | same command | Local worktree | Writable temp directory | Claude (agent) | Passing removal-on-touch cases | Fix and rerun; QA blocked |
| AC-002 | SCN-002 | `npm --prefix packages/mcp-server test` (includes `test/companion-continuation.test.js`) | Local worktree | mcp-server dependencies installed (`npm ci --prefix packages/mcp-server` after `build:prepare`) | Claude (agent) | Passing owner-continuity case | Fix and rerun; QA blocked |
| AC-002 | SCN-005 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Passing `holds` cases | Fix and rerun; QA blocked |
| AC-003 | SCN-006 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Passing same-owner cases | Fix and rerun; QA blocked |
| AC-004 | SCN-007 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Passing removal cases | Fix and rerun; QA blocked |
| AC-004 | SCN-008 | admission test command | Local worktree | Writable temp directory with 600 small files | Claude (agent) | Passing scan case | Fix and rerun; QA blocked |
| AC-005 | SCN-010 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Passing ordinary-claim cases | Fix and rerun; QA blocked |
| AC-005 | SCN-009 | mcp-server test command | Local worktree | mcp-server dependencies installed | Claude (agent) | Passing ordinary-dispatch cases | Fix and rerun; QA blocked |
| AC-006 | SCN-003 | mcp-server test command | Local worktree | mcp-server dependencies installed | Claude (agent) | Existing case passing | Fix and rerun; QA blocked |
| AC-006 | SCN-011 | admission test command | Local worktree | Writable temp directory | Claude (agent) | Existing hook cases passing | Fix and rerun; QA blocked |
| AC-007 | SCN-012 | Suites above plus `npm --prefix packages/cli run test:companion-run-view`, `npm --prefix packages/control-ui test`, `npm --prefix packages/cli run test:package-contents`, `npm --prefix packages/cli run test:copilot-profile`, `npm run compatibility:record`, `npm run compatibility:check` | Local worktree | Build prepared | Claude (agent) | All commands exit 0 | Report the failing command with output; QA blocked |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Exact test file split and fixture sizes | SD: Exact test file split and fixture sizes | resolved | Record-level cases (SCN-001, SCN-004 to SCN-008, SCN-010, SCN-011) live in `codex-continuation-admission-test.js` with a controlled clock and file times set by `utimesSync`; dispatch-level cases (SCN-002, SCN-003, SCN-009) live in `companion-continuation.test.js` through the real runtimes; the scan case uses 600 files of other run ids, half settled and half expired | Claude (agent) |
| Copilot payload baseline | TP | resolved | Raised to the observed values only if `build:prepare` reports growth, with a rationale naming this run | Claude (agent) |

## 4. Brownfield Scope

Before implementation (Brownfield Analysis) inspect: `codex-continuation.js` (all transitions and callers), `codex-continuation-binding.js`, `codex-activity.js` `observeContinuation`, `cockpit-session.js` `continue`, `mcp-dispatch-runtime.js` (`admitCodexContinuation`, `createMcpDispatchRuntime`, `postprocessToolResult`), `run-command-service.js` next calls, `owned-file-lock.js` lock file naming, and the two test files named in T-004 and T-005.

## 5. Out Of Scope

- Companion card texts and the control-ui continuation flow.
- The qualification observation list and native re-qualification on a real Codex host.
- The browser continuation cases (not runnable on this Windows host).
- Merging PR #84, release notes and version bumps.

## 6. Risks And Blockers

- Block QA: any failing scenario of the Test Plan or a `compatibility:check` mismatch.
- Revise: an expiry case that passes only with real waiting instead of the controlled clock; a removal case that leaves a lock file behind.
- Warn: the native continuation qualification record no longer matches the new server digest; PR #85 and PR #86 must merge this base again.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Aufgaben: T-001 Sperrlogik in `codex-continuation.js` (Uhr-Option, `updated_at`, Grenzen, Ablauf, Löschen statt Ablegen, gealterte unlesbare Dateien, Eignung nur für Begleiter-Claims, gleicher Owner, `holds`, `settleTurn` ohne Obergrenze); T-002 Hook-Zeit in `codex-activity.js`; T-003 Dispatch-Runtime (gewöhnliche Fortsetzung ohne Abbruch bei unlesbarer Datei, Owner-Speicher, Owner im Folgeaufruf nach Schreibvorgängen); T-004 neue Sperr-Tests; T-005 neue MCP-Server-Tests; T-006 Änderungskette und alle Prüfungen.
- Nachweise: SCN-001/004 Ablauf je Phase, alte Datei nach Dateizeit, Löschen beim Zugriff (AC-001); SCN-002/005 Owner im Folgeaufruf nach `agdf_record` und `holds` (AC-002); SCN-006 gleicher Owner bei gleicher Revision (AC-003); SCN-007/008 Löschen erledigter Dateien und Stop bei 600 Dateien (AC-004); SCN-009/010 gewöhnliche Fortsetzung ohne Eignung, bei unlesbarer Datei und gegen fremde Sperre (AC-005); SCN-003/011 bestehende Begleiter- und Hook-Fälle unverändert (AC-006); SCN-012 alle Suiten und `compatibility:check` (AC-007).
- Prüfplan: lokal unter Windows in diesem Worktree vor QA mit kontrollierter Uhr statt Warten, CI wiederholt im Pull Request; native Codex-Prüfungen und Browserfälle bleiben eine benannte Lücke.
- Planungsentscheidungen: Satzfälle im Sperr-Test, Dispatch-Fälle im MCP-Server-Test, Scan-Fall mit 600 Dateien anderer Runs (je zur Hälfte erledigt und abgelaufen); Payload-Baseline nur bei gemeldetem Wachstum mit Begründung anheben.
- Nicht enthalten: Kartentexte und UI-Ablauf, Qualifizierungsliste und native Neuqualifizierung, Browserfälle, Merge von PR #84, Release-Notizen.
- Risiken: fehlschlagende Szenarien oder `compatibility:check` blockieren QA; der native Qualifizierungsnachweis passt nicht mehr zum neuen Server-Digest; #85 und #86 müssen erneut nachgezogen werden.
