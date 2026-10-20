# TP: Early detection and correct handling of four AGDF approval-chain defects

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-17
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | D1 reader: skip unknown and qualified labelled lines in the localized profile of `readAuthoredContent` (`packages/core/lib/control-evaluation/report-decision.js`) | Implementing agent (Claude Code) | none |
| T-002 | D1 readability: export `localizedDecisionFieldGaps` from `decision-content-readiness.js`, use it in `observeDecisionContent` and in `requiredLocalizedSummary` for UR and QA; reason `approval_summary_field_unreadable` with field and expected line through `evaluateApprovalSummaryReadiness`, `ur-readiness.js`, `artifact-readiness.js`, `renderApprovalSummaryIssue` and the presentation recovery | Implementing agent (Claude Code) | T-001 |
| T-003 | D2: map canonical `done` to `pass` in `statusFromReviewArtefact` (`gate-check.js`) | Implementing agent (Claude Code) | none |
| T-004 | D3 Core: publish `intent` and `released` on `agdf:owned-file-lock` in `withOwnedFileLock`; add guarded `releaseAbandonedOwnedLock` in `run-state-writer.js`; re-export it from `packages/cli/lib/mcp-dispatch-runtime.js` | Implementing agent (Claude Code) | none |
| T-005 | D3 MCP: forward lock events in `worker-entry.js`; track tokens and release after actual exit in `worker.js`; inject the release function in `server.js` | Implementing agent (Claude Code) | T-004 |
| T-006 | D4 prevention: `STRUCTURED_REQUIRED_REVIEWS` in `closeout-readiness.js`; gate-policy branch withholding the QA approval request while a required review is missing; en/de locale entries for the new next action | Implementing agent (Claude Code) | none |
| T-007 | D4 recovery: late-recording branch in `internalStepEligibility`; late-review exception in `approvedMaterialFindings` and in the closeout QA-association check via an exported per-source comparison in `evidence-bindings.js` | Implementing agent (Claude Code) | T-006 |
| T-008 | Update existing fixtures that the stricter summary and QA checks reject, without weakening assertions | Implementing agent (Claude Code) | T-002, T-006 |
| T-009 | Regenerate runtime copies through the existing build stages, run the named suites and record CD+Tests evidence | Implementing agent (Claude Code) | T-001 to T-008, T-010 |
| T-010 | After all code tasks, re-pin `plugins/agdf/meta/copilot-payload-baseline.json` with the existing `node scripts/payload-budget.js --accept --files N --bytes M --reason ...` to the exact measured final Copilot payload (no extra headroom) with a rationale, then rerun `node scripts/sync-package-assets.js` | Implementing agent (Claude Code) | T-001 to T-008 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | The exact observed UR summary text (`Problem (Messlücke):` before `Ziel:`) yields a readable `ziel` field | `packages/core/test/approval-chain-defects-test.js` output |
| AC-001 | SDD-002 | T-002 | SCN-002 | A UR summary without `Ziel`, with an empty or placeholder `Ziel`, or with a prose line before `Ziel` is not ready in UR readiness and artefact readiness and refused in presentation with `approval_summary_field_unreadable`, field `ziel` and expected `- Ziel:` | `packages/core/test/approval-chain-defects-test.js` output |
| AC-002 | SDD-001 | T-001 | SCN-003 | Qualified and unknown labels before and after required fields are skipped; a duplicate `Ziel` invalidates the summary; a prose line, heading or fence closes the block for good | `packages/core/test/approval-chain-defects-test.js` output |
| AC-002 | SDD-002 | T-002 | SCN-004 | For every summary in the case matrix, presentation readiness is ready exactly when `observeDecisionContent` reports no localized gap for the same field | `packages/core/test/approval-chain-defects-test.js` output |
| AC-003 | SDD-002 | T-002 | SCN-005 | A German QA summary without `Grenzen` is refused in QA presentation with field `grenzen` and expected `- Grenzen:`; a complete summary is presented | `packages/core/test/approval-chain-defects-test.js` output |
| AC-004 | SDD-003 | T-003 | SCN-006 | Rows `done` (with the observed note `Recorded exact internal result; operation ...`), `revise`, `block` and absent map to pass, revise, block and unknown; all-pass rows give overall pass | `packages/core/test/approval-chain-defects-test.js` output |
| AC-005 | SDD-004 | T-004 | SCN-007 | `withOwnedFileLock` publishes `intent` before the owner record exists and `released` after it is removed; `releaseAbandonedOwnedLock` returns `released` for an own-token lock and removes the token's staging file | `packages/core/test/run-lock-test.js` output |
| AC-005 | SDD-005 | T-005 | SCN-008 | After a timed-out or cancelled worker that announced a lock actually exits, the executor releases that lock before freeing capacity; a real worker thread terminated while holding the lock leaves no lock, and a following `withOwnedFileLock` succeeds | `packages/mcp-server/test/worker-lock-release.test.js` output |
| AC-006 | SDD-005 | T-004 | SCN-009 | `releaseAbandonedOwnedLock` returns `foreign` for another token or PID, `unknown` for a malformed record, `guarded` while the reclaim guard exists, `absent` without a lock, and leaves those files unchanged; a hung worker that never exits keeps its lock; existing lock assertions stay unchanged | `packages/core/test/run-lock-test.js` and `packages/mcp-server/test/worker-lock-release.test.js` output |
| AC-007 | SDD-009 | T-010 | SCN-015 | `node scripts/payload-budget.js` reports zero byte and zero file headroom against the re-pinned baseline, the baseline rationale names this run, and `node scripts/sync-package-assets.js` exits 0 | Command output recorded in CD+Tests evidence |
| AC-007 | SDD-009 | T-009 | SCN-010 | `npm run test:verification`, `npm --prefix packages/cli run smoke-test` and `npm --prefix packages/mcp-server test` pass | Command logs recorded in CD+Tests evidence |
| AC-008 | SDD-006 | T-006 | SCN-011 | A structured run at QA without TP Review or Clean Implementation Review gets `missing_approval: none` and a next action naming the missing review; with both reviews recorded the QA approval request appears as before | `packages/core/test/approval-chain-defects-test.js` output |
| AC-008 | SDD-007 | T-007 | SCN-012 | Eligibility matrix: reviews recordable at CR and QA as before; after QA approval only an absent review that the QA approval receipt did not include is recordable at UAT or OR; other internal steps and replacements stay refused | `packages/core/test/approval-chain-defects-test.js` output |
| AC-009 | SDD-007 | T-007 | SCN-013 | Reproduction of the observed state (QA and UAT approved with modern receipts, both reviews missing, gate OR) accepts both `step.record` internal recordings that were rejected with `internal_step_not_ready` before the fix | `packages/core/test/approval-chain-defects-test.js` output |
| AC-009 | SDD-008 | T-007 | SCN-014 | After the late recordings there is no `approved_material_sources_changed` finding and closeout readiness passes; a late non-pass TP Review keeps closeout refused with `closeout_review_result_unconfirmed:TP Review`; changing any source the approval saw still yields `approved_material_sources_changed` | `packages/core/test/approval-chain-defects-test.js` output |

## 3. Test Plan

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `node packages/core/test/approval-chain-defects-test.js` | Windows 11, Node 22.22.3, worktree `fix/agdf-core-approval-defects-20261017` | Root dependencies installed (`npm ci`) | Implementing agent | Passing assertion for the exact observed text | Stop and report the failing assertion; do not weaken it |
| AC-001 | SCN-002 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repositories under the OS temp directory | Implementing agent | Passing readiness, artefact-readiness and presentation refusals | Stop and report |
| AC-002 | SCN-003 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | none beyond the repository | Implementing agent | Passing reader matrix | Stop and report |
| AC-002 | SCN-004 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | none beyond the repository | Implementing agent | Passing agreement matrix | Stop and report |
| AC-003 | SCN-005 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repositories | Implementing agent | Passing QA presentation refusal and positive case | Stop and report |
| AC-004 | SCN-006 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | none beyond the repository | Implementing agent | Passing mapping assertions | Stop and report |
| AC-005 | SCN-007 | `node packages/core/test/run-lock-test.js` | Same worktree | Temporary directory | Implementing agent | Passing channel and release assertions | Stop and report |
| AC-005 | SCN-008 | `node packages/mcp-server/test/worker-lock-release.test.js` | Same worktree, Node worker threads | `node scripts/verify-ci.mjs --profile prepare` and `npm ci --ignore-scripts` in `packages/mcp-server` after Core changes | Implementing agent | Passing fake-worker and real-thread assertions | Rebuild the prepare profile and reinstall mcp-server dependencies, then rerun |
| AC-006 | SCN-009 | `node packages/core/test/run-lock-test.js` and `node packages/mcp-server/test/worker-lock-release.test.js` | Same worktree | As SCN-007 and SCN-008 | Implementing agent | Passing negative assertions with unchanged lock bytes | Stop and report |
| AC-007 | SCN-015 | `node scripts/payload-budget.js`, then `--accept` with the measured values, then `node scripts/sync-package-assets.js` | Same worktree | Generated Copilot profile from the current sources | Implementing agent | Zero headroom report and a clean sync | Stop and report the measured growth; do not raise the limit above the measurement |
| AC-007 | SCN-010 | `npm run test:verification`; `npm --prefix packages/cli run smoke-test`; `npm --prefix packages/mcp-server test` | Same worktree | Prepare profile built; mcp-server dependencies installed; long runs in the background | Implementing agent | Exit code 0 for each command with logs | Record the failing suite and its output in CD+Tests; fix before CR |
| AC-008 | SCN-011 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repositories built with the existing CLI fixtures | Implementing agent | Passing gate-policy assertions | Stop and report |
| AC-008 | SCN-012 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repositories | Implementing agent | Passing eligibility matrix | Stop and report |
| AC-009 | SCN-013 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repository reproducing the observed state | Implementing agent | Accepted late recordings | Stop and report |
| AC-009 | SCN-014 | `node packages/core/test/approval-chain-defects-test.js` | Same worktree | Temporary fixture repository | Implementing agent | Passing closeout and negative assertions | Stop and report |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Test file placement and fixture updates | SD: Test file placement and fixture updates | resolved | New Core regression file `packages/core/test/approval-chain-defects-test.js` added to the existing `test:run-command-flow` script; lock cases extend `packages/core/test/run-lock-test.js`; new `packages/mcp-server/test/worker-lock-release.test.js` added to the existing `test:safety` script; existing fixtures rejected by the stricter checks gain the missing summary lines or review rows without weakening assertions | Arndt Gold, TP owner |
| Copilot payload budget re-pin | TP | resolved | Owner decision 2026-10-17: the fixes grow the payload by about 13 KB against a zero-headroom baseline; T-010 re-pins it to the exact final measurement with the existing tool and a rationale naming this run, without extra headroom | Arndt Gold, TP owner |
| Rebuild order for MCP tests | TP | resolved | After Core changes run `node scripts/verify-ci.mjs --profile prepare`, then `npm ci --ignore-scripts` in `packages/mcp-server`, before running mcp-server tests | Implementing agent (Claude Code) |

## 4. Brownfield Scope

Before implementation inspect: `report-decision.js`, `decision-content-readiness.js`, `run-presentation-render.js`, `ur-readiness.js`, `control-inspect/artifact-readiness.js`, `gate-check.js`, `interaction-presentation.js`, `run-state-writer.js`, `approval-command.js`, `packages/cli/lib/mcp-dispatch-runtime.js`, `packages/mcp-server/src/worker.js`, `worker-entry.js`, `server.js`, `gate-policy.js`, `closeout-readiness.js`, `run-operation-proof.js`, `presentation-decision.js`, `evidence-bindings.js`, the locale packs and the existing tests that build structured runs to QA, UAT and OR.

## 5. Out Of Scope

Changes to run `mcp-ergonomics-baseline-20261016-01`, the fields UAT requires, the summary heading format or the lock record format; review findings F02 and F09; migration of existing runs; reinstalling the plugin, release, commit, push or pull request.

## 6. Risks And Blockers

- Fixture fallout from the stricter checks can be large; a fixture change that weakens an assertion blocks QA.
- The real-thread test depends on Node delivering posted messages before `exit`; a failure blocks AC-005.
- The integrity exception must not cover material an approval saw; SCN-014 negative case is mandatory.
- The installed runtime 0.14.5 governing this run does not contain the fix; no installed-runtime claim is made.

## 7. Next Step

Review this task and test plan and approve only with `Approval: TP`.

## AGDF Approval Summary (de; source=en)

- Ziel: Alle neun Abnahmekriterien und alle neun Designentscheidungen sind konkreten Aufgaben und Testszenarien zugeordnet, die mit den bestehenden Suites laufen.
- Aufgaben: T-010 setzt die Copilot-Payload-Grenze nach allen Code-Aufgaben exakt auf den gemessenen Endstand neu (ohne Puffer, mit Begründung). T-001 Leseregel, T-002 gemeinsame Lesbarkeitsprüfung mit Meldung, T-003 Status `done`, T-004 Core-Besitzmeldung und abgesicherte Sperrfreigabe, T-005 MCP-Worker-Verfolgung und Freigabe nach Worker-Ende, T-006 QA-Freigabe erst nach beiden Reviews, T-007 Nachtragen und enge Integritätsausnahme, T-008 Anpassung betroffener Fixtures ohne geschwächte Prüfungen, T-009 Neuaufbau, Suites und Nachweise.
- Tests: SCN-001 bis SCN-014 decken die exakte beobachtete Zusammenfassung, unbekannte und qualifizierte Feldnamen, Duplikate, QA-Felder, Review-Status, Diagnosekanal und Freigabeergebnisse, einen echten beendeten Worker-Thread, einen hängenden Worker, fremde Token, die Review-Pflicht vor QA, die Nachtragsmatrix, die Reproduktion der Sackgasse und Negativfälle ab. Neue Testdateien sind `approval-chain-defects-test.js` in Core und `worker-lock-release.test.js` im mcp-server, eingebunden in bestehende Skripte.
- Nachweise: `npm run test:verification`, die CLI-Smoke-Suite und die mcp-server-Suite mit Logs in CD+Tests.
- Risiken: Viele Fixtures könnten angepasst werden müssen; der Echt-Thread-Test hängt am Nachrichtenverhalten von Node; die Integritätsausnahme braucht den Negativfall.
- Nächster Schritt: Diesen TP prüfen und nur mit `Approval: TP` freigeben; danach folgt die Brownfield-Analyse vor der Implementierung.
