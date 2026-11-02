# CD+Tests: Four AGDF approval-chain defects

Gate: CD+Tests
Type: CD+Tests
Status: done
Decision: pass

## Run

- run_id: core-approval-lock-defects-20261017-01
- related_tp: .agdf/control/artefacts/core-approval-lock-defects-20261017-01/TP.md (approved, renewed after TP source revision 16da48f8)
- implementer: Claude Code (claude-opus-5-5)
- date: 2026-10-19
- code_state: branch `fix/agdf-core-approval-defects-20261017` at `main` `16d08888` plus this run's uncommitted changes (worktree `.claude/worktrees/agdf-core-approval-defects`)
- environment: Windows 11 Enterprise 10.0.26200, Node v22.22.3

## CD+Tests

- decision: pass
- scope: T-001 to T-010 of the approved TP.
- exception: the pre-existing `packages/mcp-server` `test:performance` budget failure on this Windows machine (F09) also fails here; see Test Evidence and Open.

## Delivered Implementation

| task_id | Status | Result |
|---|---|---|
| T-001 | done | `report-decision.js`: the localized profile of `readAuthoredContent` skips unknown and qualified labelled lines (for example `Problem (Messlücke):`) instead of ending the block; non-label lines still end it; duplicates still fail closed. Any well-formed source tag is accepted, fields stay keyed by the display locale (CR-07). |
| T-002 | done | `decision-content-readiness.js` exports `localizedDecisionFields` (fields plus gaps with the expected `- Label:` line) for UR (`Ziel`/`Goal`) and QA (`Ergebnis`, `Grenzen`, `Risiken` / English labels). `observeDecisionContent` (UAT) and `requiredLocalizedSummary` (UR and QA presentation and readiness) use the same function; reason `approval_summary_field_unreadable` with every expected line flows through `evaluateApprovalSummaryReadiness`, `renderApprovalSummaryIssue`, `ur-readiness.js` and the presentation recovery. `artifact-readiness.js` receives the reason through its existing `evaluateApprovalSummaryReadiness` call, so it needed no change. The ur-definition instruction in `delivery-intake.js` passes the readiness findings as source data. |
| T-003 | done | `gate-check.js` `statusFromReviewArtefact` maps the canonical writer status `done` to `pass` for Quality Readiness. |
| T-004 | done | `run-state-writer.js` publishes `intent` and `released` on the diagnostics channel `agdf:owned-file-lock` (only with subscribers) and adds `releaseAbandonedOwnedLock`: exact own token, same PID, unchanged bytes, under the existing reclaim guard; outcomes `released`, `absent`, `foreign`, `guarded`, `unknown`. Re-exported by `packages/cli/lib/mcp-dispatch-runtime.js`. |
| T-005 | done | `worker-entry.js` forwards lock events through the shared `ownedLockForwarder`; `worker.js` tracks held tokens per worker and releases them only after actual exit or confirmed termination. The release function is injected where the executor is created: `main.js` and `generation-entry.js` (the TP named `server.js`; the executor is not created there). |
| T-006 | done | `STRUCTURED_REQUIRED_REVIEWS` (owned by `evidence-bindings.js`, re-exported by `closeout-readiness.js`); gate policy withholds the QA approval request while a required review is missing (alias-aware `reviewArtefactType`), and while the QA association is not current after the reviews; en/de locale entries for both next actions. |
| T-007 | done | `internalStepEligibility` allows recording a missing required review after QA/UAT approval only when the QA approval receipt proves the review was unseen; `approvedMaterialFindings` and the QA association in `evidenceApplicability` exempt exactly those unseen review types (`bindingSourceAssociation`); closeout consumes the shared association result (CR-03), so no closeout-local exception exists. |
| T-008 | done | Fixtures updated without weakening assertions: `control-state-test.js` ready-gate fixture gains both reviews; `backlog-work-summary-test.js` asserts `work_pending` and then `approval_pending`; `run-lock-test.js` failure-path expectation; `runtime-check-consent-test.js` normalizes the JSON-escaped checkout path (CR-17); the late-gate fixture in `build-contract-checks.js` records both reviews and gains the case `qa-reviews-missing` (CR-18). |
| T-009 | done | Runtime copies regenerated through the existing build stages; all suites below run on the final code. The deterministic `ur-definition` eval fingerprint was re-pinned (CR-19) and the host-compatibility evidence was re-recorded with `npm run compatibility:record` (only digests and dates changed; 56 scenarios, 0 unexpected failures). |
| T-010 | done | `plugins/agdf/meta/copilot-payload-baseline.json` re-pinned with `node scripts/payload-budget.js --accept` to the exact final measurement 260 files / 2273618 bytes; `sync-package-assets` passes. |

New tests: `packages/core/test/approval-chain-defects-test.js` (D1 reader matrix with the exact observed shape, readiness, presentation, UAT agreement; D2; D4 units, the dead end reproduced on an emulated pre-fix Core, late review at UAT with a non-pass result, normal flow with QA rerun), `packages/mcp-server/test/worker-lock-release.test.js` with `lock-holder-worker.js` (fake and real terminated workers, foreign lock, entrypoint wiring), and new cases in `run-lock-test.js`. They run in `test:run-command-flow` (CLI) and `test:safety` (mcp-server).

## Test Evidence

All commands ran in the worktree on the final code.

- `npm run build:prepare` → pass.
- `npm --prefix packages/cli run smoke-test` chain, all 73 steps → pass. The steps ran one by one; the three that first failed were fixed and rerun: `test:runtime-check-consent` (CR-17), `test:skill-evals` and `eval:skills` (CR-19, now 106/106), and `scripts/smoke-test.js` (CR-18, full run passes).
- `node scripts/verify-ci.mjs --stage <id>` for every CI stage except `cli-smoke` (covered by the chain above): dependencies, maintenance, shell, ui-dependencies, ui-build, generate, build-contracts, evals, compatibility-freshness, assemble, prepare, mcp-dependencies, runtime, community, host-compatibility, built-runtime, cli-package, wrapper-package, transactions, delivery-map, mcp-package, archives, wrapper-smoke, pages-install, pages → all pass.
- `npm run compatibility:check` → pass after the re-recording.
- `npm --prefix packages/mcp-server test` → every suite passes up to and including `test:provenance` (contract, continuation, late source revision, run-command flow, protocol, cockpit gating, generation, safety with the abandoned-worker lock release test, provenance); `test:performance` fails on the warm-dispatch budget (F09, below); `test:package` and `test:sdk-digest`, which the npm chain skipped after that failure, pass when run on their own.
- `npm run test:verification` → pass.
- `git diff --check` → pass.

### Performance (F09)

`test:performance` asserts cold `tools/list` p95 ≤ 1500 ms and warm `agdf_dispatch` p95 ≤ 1000 ms over 20 runs. On this machine the warm budget fails intermittently, also without this change (F09; the MCP ergonomics run measured 2477.8 ms on unchanged code). In the suite run above it measured 1189.6 ms, in a single run on the idle machine 1449.1 ms.

To separate machine noise from a regression, the test ran interleaved three times each against `main` `16d08888` (extracted with `git archive` and built with the same toolchain) and against this change:

| Side | Passing runs | warm p95 per run (ms) | warm median, 60 samples (ms) | warm p95, 60 samples (ms) | cold p95, 60 samples (ms) |
|---|---|---|---|---|---|
| `main` `16d08888` | 1 of 3 | 1467.0, 890.2, 1258.2 | 792 | 1305 | 950 |
| this change | 3 of 3 | 990.2, 771.9, 840.2 | 765 | 914 | 884 |

Result: no measurable slowdown from the change; the failure is the pre-existing machine-dependent F09, not a regression.

## Environment Notes

- An earlier verification attempt was invalid: test loops orphaned by a stopped background task ran concurrently, causing a local-marketplace `ENOENT` race and slower timings. The orphans were terminated and every step was rerun cleanly; no result above comes from that attempt.
- `pages/.astro/content.d.ts` was rewritten by `astro check` (path format only) and restored; it is not part of the change.

## Intentionally Not Performed

- No commit, push, pull request or release; the owner commits.
- No change to the lock record format, receipts, evidence bindings, RUN_STATE sections or the summary heading.
- No AGDF write to run `mcp-ergonomics-baseline-20261016-01`; its recovery uses the delivered fix after release.

## Open

- F09: the warm-dispatch budget of `test:performance` stays machine-dependent on this Windows machine, with and without this change; it is the existing owner's follow-up (MCP ergonomics Phase 3), not part of this run.

## Next Step

Record Code Review, TP Review and Clean Implementation Review, then the QA report.
