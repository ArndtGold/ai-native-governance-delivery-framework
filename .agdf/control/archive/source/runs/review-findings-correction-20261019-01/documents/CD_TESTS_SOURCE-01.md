# CD+Tests: Detect invalid review finding rows at recording and correct them at OR

Gate: CD+Tests
Type: CD+Tests
Status: done
Decision: pass

## Run

- run_id: review-findings-correction-20261019-01
- related_tp: .agdf/control/artefacts/review-findings-correction-20261019-01/TP.md (approved)
- implementer: Claude Code (claude-opus-5-5)
- date: 2026-10-19
- code_state: branch `fix/agdf-core-approval-defects-20261017` at `main` `16d08888` plus the uncommitted D1 to D4 change of run `core-approval-lock-defects-20261017-01` and this run's D5 change (worktree `.claude/worktrees/agdf-core-approval-defects`)
- environment: Windows 11 Enterprise 10.0.26200, Node v22.22.3

## CD+Tests

- decision: pass
- scope: T-001 to T-008 of the approved TP.
- exception: the pre-existing machine-dependent `packages/mcp-server` `test:performance` budget (F09); see Test Evidence.

## Delivered Implementation

| task_id | Status | Result |
|---|---|---|
| T-001 | done | `normalized-gaps.js`: `normalizedGapProblems` (field-level problems with stable rule ids; `validNormalizedGap` = none), `readNormalizedFindings` (table scan extracted from `inspectQaReports`), `reviewFindingDiagnostics` (per-source closeout rules including the `- decision:` field rule) and `maskFindingCells`. `inspectQaReports` delegates and keeps its results and messages; an invalid row also carries its problems. QA report references have one owner, `qaReportReferences` in `qa-follow-up.js`. |
| T-002 | done | `run-steps.js` refuses, before any write, a TP Review, Clean Implementation Review or CR (internal step) and a quick-task `review` step whose rows are invalid, and a QA report whose rows, references, readability or report count fail the closeout rules; reason `review_findings_invalid` with at most 64 diagnostics `{ review, finding_id, field, expected, rule }` and `diagnostics_truncated`. |
| T-003 | done | `run-operation-proof.js`: `reviewCorrectionCandidate` (OR after Approval: UAT, review seen by the approvals through a material receipt at its canonical path, same status) in `internalStepEligibility`; `reviewCorrectionRefusal` allows only corrections of invalid `required_next_step` cells of readable rows and refuses everything else (`recorded_review_valid`, `recorded_review_uncorrectable`, `decision_changed`, `classification_changed`, `content_changed`, `recorded_review_unavailable`) with `internal_step_not_ready` and a `correction` detail. |
| T-004 | done | `presentation-decision.js`: `reviewRecordingChains` and `reviewCorrections` derive the proof from the existing Run Operations and Approval Operations receipts (CR includes the `review` step). `approvedMaterialFindings`, `bindingSourceAssociation` with `evidenceApplicability` (reason `current_with_corrected_reviews`) and `inspectApprovedArtefact` (closeout approved-source proof) accept exactly a proven correction; `run-state.js` passes it in. |
| T-005 | done | `closeout_quality_unconfirmed` detail names review, finding, field and expected value and, only where `reviewCorrectionAvailable` holds, the correction path. |
| T-006 | done | New `packages/core/test/review-findings-correction-test.js` (unit cases plus three end-to-end cases: A shaped like `core-approval-lock-defects-20261017-01`, B shaped like `mcp-ergonomics-baseline-20261016-01`, C with a CR recorded through the review step), wired into `packages/cli` `test:run-command-flow`. `approval-chain-defects-test.js`: emulation anchor names both eligibility branches; non-pass synthetic reviews carry one valid open finding. No other fixture needed a change. |
| T-007 | done | Rebuild, all suites and CI stages below; eval fingerprints unchanged (`eval:skills` 106/106); host-compatibility evidence re-recorded with `npm run compatibility:record` (only digests and dates changed). |
| T-008 | done | `plugins/agdf/meta/copilot-payload-baseline.json` re-pinned with `node scripts/payload-budget.js --accept` to the exact final measurement 260 files / 2290219 bytes, with a rationale naming both runs; `sync-package-assets` passes. |

### Deviations from the SD

- `reviewCorrections` lives in `presentation-decision.js`, not `evidence-bindings.js`: placing it in `evidence-bindings.js` would pull that module into the existing import cycle through `approval-operations.js`; `presentation-decision.js` already owns both ledgers and the approval material (CR-09, CIR-01).
- `inspectApprovedArtefact` (`artefact-binding-proof.js`) also compares approval material at closeout and gained the same exception (CR-08).
- The correction is narrower than the PRD allowed: only `required_next_step` cells may change, evidence cells stay as the approvals saw them (CR-11).

## Real-Data Check (read-only)

The recorded TP Review, Clean Implementation Review and Code Review of run `core-approval-lock-defects-20261017-01` and the recorded Code Review of run `mcp-ergonomics-baseline-20261016-01` were checked with `reviewCorrectionRefusal` against copies in which only the `none` next-step cells were replaced: all four are accepted as corrections (refusal `null`), and the copies have no remaining diagnostics. The QA report and both corrected review sources of the ergonomics run have no diagnostics. Nothing was written to either run.

## Test Evidence

All commands ran in the worktree on the final code (no source change after the final run started).

- `node packages/core/test/review-findings-correction-test.js` and `node packages/core/test/approval-chain-defects-test.js` → pass; the affected Core tests (`run-closeout-command-test.js`, `qa-deviation-acceptance-test.js`, `backlog-work-summary-test.js`, `control-read-provider-test.js`, `tp-readiness-test.js`, `presentation-decision-test.js`, `evidence-bindings-test.js`, `run-closeout-slice-test.js`, `control-state-test.js`) → pass.
- `npm run build:prepare` → pass; `npm run compatibility:record` then `npm run compatibility:check` → pass (only digests and dates changed).
- `node scripts/verify-ci.mjs --stage <id>` for every CI stage: dependencies, maintenance, shell, ui-dependencies, ui-build, generate, build-contracts, evals (106/106), compatibility-freshness, assemble, prepare, mcp-dependencies, runtime, community, host-compatibility, built-runtime, cli-package, wrapper-package, transactions, delivery-map, mcp-package, archives, wrapper-smoke, pages-install, pages → pass. `cli-smoke` stopped at its step `test:mcp-server` on the `test:performance` budget (F09, below); its 24 steps before passed, and the 48 steps after it were run one by one → all pass (including `test:run-command-flow` with the new D5 test).
- mcp-server suites, each on its own: contract, continuation, late-source-revision, protocol, cockpit-gating, generation, safety, provenance, package, sdk-digest → pass; performance → F09 (warm dispatch p95 1152.8 ms against 1000 ms, cold 983.3 ms); run-command-flow → in the full run one approval in `structured-flow.test.js` exceeded the 10 s dispatch deadline (`effect_unknown`, approval not committed) under machine load; rerun in isolation → pass (all six test files, 1049 s).
- `npm run test:verification` → pass.
- `git diff --check` → pass; `pages/.astro/content.d.ts`, rewritten by `astro check` (path format only), was restored.

### Performance (F09)

`test:performance` fails its warm-dispatch budget on this Windows machine with and without these changes; the interleaved A/B against `main` `16d08888` in run `core-approval-lock-defects-20261017-01` showed no slowdown. D5 adds no measurable cost: `reviewCorrections` takes under 0.1 ms per call on the D1 to D4 run, a full gate check about 0.6 s.

## Intentionally Not Performed

- No recovery of the two stuck runs; both need the released runtime (non-goal of the PRD). A recovery guide for the ergonomics run owner is in the shared session notes.
- No commit, push, pull request, release or reinstall; the owner commits.
- No change to the quality contract or to any receipt, approval or binding schema.

## Next Step

Record Code Review, TP Review and Clean Implementation Review, then the QA report.
