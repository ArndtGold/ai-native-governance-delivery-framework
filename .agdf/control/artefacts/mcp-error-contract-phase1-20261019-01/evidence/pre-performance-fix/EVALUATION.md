# MCP error contract Phase 1 evaluation

Status: protocol measurement complete; CD+Tests requires revision because local timing qualification remains open. No final QA decision is made by this document.
Run: mcp-error-contract-phase1-20261019-01
Date: 2026-10-19

## Method and source identity

The unchanged matrix v1 and its existing classifier, normalization, aggregation and comparison functions remain the measurement owner. The pre-change checkout capture is protocol-before.json; the historical baseline remains evals/mcp-ergonomics/baselines/2026-10-16-win32-x64/. The final capture and comparisons are retained beside this report with their actual exit codes. No promotion or replacement of the historical baseline is performed.

The current-checkout baseline contains 32 matrix rows with five executions per call: 14 successful rows, nine SDK-validation rows and nine AGDF-failure rows. All nine AGDF failures lack isError before implementation. The relevant IDs are D-SEM-RELATIVE-DIRECTORY, D-SEM-UNRESOLVED-TARGET, P-SEM-STALE-REVISION, R-SEM-TARGET-MISMATCH, A-SEM-UNKNOWN-PRESENTATION, V-SEM-PROPOSAL-DIGEST, C-SEM-NOT-AT-OR, K-NOUI-RENDER and K-NOUI-SNAPSHOT. The final measurement must preserve their semantic outcome while changing the missing error signal and adding corrective text.

source-baseline.json records preparation HEAD, input/source hashes, platform and original dirtiness. source-final.json records the final 37-file source set, assembled dispatcher/server/SDK hashes and both built UI hashes. The checkout is a8a867a3578a2d8b16853860276c401ddd04db28 with scoped unstaged changes; this is not a commit, installation or release claim. The local platform is darwin-x64 under Node 22.22.3, using the pinned SDK 2.0.0. The current chat's installed runtime is separate from this candidate and is not used as evidence that edited code is loaded.

## Source comparison

The approved UR documents the source check performed before planning:

- Normative MCP: [2026-07-28 tools / error handling](https://modelcontextprotocol.io/specification/2026-07-28/server/tools#error-handling). Operation failures use the tool-error channel and useful content. AGDF applies this distinction to retain successful reports of governance blockers.
- Official implementation behavior: [TypeScript SDK v2 errors](https://ts.sdk.modelcontextprotocol.io/v2/servers/errors), checked against the locally pinned SDK and both supported protocol eras. SDK input-validation behavior remains owned by the SDK; output-schema validation is skipped on error results, so this change adds independent domain/descriptor checks.
- Advisory guidance: [Anthropic: writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents). Concrete, actionable corrections inform the copy; the advice supplies no approval or retry authority.

Core outcomes, receipts and current guards remain the domain authority. Trusted runtime facts establish only known dispatch boundaries. Unknown write effects require the original operation/UUID and exact payload; a failure flag does not establish rollback. The new private transport contract is not a second gate evaluator or effect store.

## Supplementary evidence

The unchanged matrix does not cover the entire approved Phase 1 boundary. Additional tests are labeled separately and remain registered in their existing npm/CI owners:

- Pure classification/correction, language, bounds and malformed-domain cases in the Core projector test.
- Actual owned SDK/stdio calls for seven regular tool families in both protocol eras, typed worker parsing, SDK/schema/protocol distinctions, independent error-path validation and complete-response fallback.
- Actual owned child generation replacement, incompatible manifests, old-view routing and retirement; command status/replay and real rejected stale-write attempts on disposable Runs.
- Exact npm-packed CLI/MCP archive execution with matched ownership/provenance and pinned SDK.
- Component/browser negative-envelope feedback, forged accepted data under isError, late replies and successful blocked-run observation. visible-evidence.json and screenshots/ retain the visible state; browser-disposition.json distinguishes the original full run and corrected teardown recheck.

The new browser fixture initially closed its SDK connection before a pending Core long poll. All behavior assertions had completed. It now follows the adjacent existing teardown order; the first 61/62 result, four-case passing teardown recheck and 15-case final-candidate recheck are retained. A recovery-suite attempt also hit the unchanged 10-second worker deadline and returned effect_unknown/dispatch_worker_termination_unconfirmed with the original UUID and safe status guidance. Its original result remains in command-recovery.log; the affected unchanged structured-flow file passed in a fresh disposable fixture, and both skipped successor files passed separately. recovery-disposition.json records that composite coverage; no rollback or recovery of the original discarded fixture is inferred.

The additional existing performance check initially measured cold p95 2237.487 ms and warm p95 2514.183 ms, exceeding its 1500/1000 ms limits. This is an actual failed check, not a pass or a demonstrated regression caused by this change. The limits remain unchanged. An isolated repeat also failed: cold p95 4135.718 ms and warm p95 2648.552 ms. Both actual results remain open for assessment. A paired HEAD/candidate diagnostic uses unchanged performance tests and one identical captured control tree; its result is recorded separately in timing-pair.json.

Earlier cancelled/failed development attempts remain under superseded-attempt/, superseded-parallel-attempt/ and superseded-preview-attempt/. Only explicit final command results and documented targeted rechecks can satisfy coverage. No cancelled run is counted as passed.

## Qualification limits

All new evidence is local Core/SDK/protocol/package or browser evidence under a synthetic host. No native Codex/Claude model recovery, model success rate, token/cost saving, native Windows behavior or broad host reliability is measured. Historical native observations remain the dated Windows/Claude baseline with two repetitions. Historical versus current machine timings are not comparable. New human decisions used in tests belong only to disposable synthetic fixtures.

The distribution inventory baseline was updated through its supported recorder to the exact generated payload: 395 files / 3,438,545 bytes, one new Core file and 31,650 bytes over HEAD, without spare headroom. This is distinct from the immutable evaluation baseline. Response limits, worker deadlines, generation capacity and existing test assertions were not increased or removed.

## Final comparison

| Unchanged matrix metric | Current checkout before | Final candidate |
|---|---:|---:|
| Successful rows | 14 | 14 |
| SDK-validation rows | 9 | 9 |
| AGDF-failure rows | 9 | 9 |
| AGDF failures missing isError | 9 | 0 |
| Other tool-error / protocol-error rows | 0 / 0 | 0 / 0 |
| Total matrix rows, five executions each | 32 | 32 |

The current-checkout comparison exits 1 as intended: exactly nine changes each to is_error, failure_without_isError, normalized text_bytes and est_tokens. Class, domain outcome and normalized structured_bytes remain unchanged for every row. The added explanation costs 196–270 normalized UTF-8 text bytes, or 49–67 harness-estimated tokens per affected row. These estimates are not measured model consumption or cost.

The exact tools/list comparison exits 0 with identical names and normalized definitions. Both protocol capture and tools capture exit 0. The historical-baseline comparison exits 1; it is retained as changed, not called a passing unchanged comparison. Its additional structured/text sizes and existing agdf_inspect/agdf_cockpit_read definition-size differences were already present in the pre-change current-checkout capture. compare-historical-before.json establishes the same four definition-budget differences before Phase 1. Cross-source/machine timing and historical native metrics are not compared as performance evidence.

All 30 tracked evaluation inputs, including the matrix, tasks, metrics, classifier, comparators and historical baseline files, are byte-identical to HEAD; immutable-evaluation-inputs.json records their hashes. No baseline was promoted. Supplemental recovery/UI/package checks remain separate from matrix v1. The measurable Phase 1 conclusion is the corrected error channel and bounded correction text; native model recovery, broad reliability and local performance qualification are separate claims.

The final QA decision belongs only to qa-gate after the actual checks and reviews are assessed. The failed timing checks cannot be relabeled as passes by this comparison.

## Timing disposition

| Unchanged 20/20 benchmark run | Cold p95 ms (limit 1500) | Warm p95 ms (limit 1000) | Actual result |
|---|---:|---:|---|
| Candidate, checkout run | 2237.487 | 2514.183 | failed |
| Candidate, isolated repeat | 4135.718 | 2648.552 | failed |
| Captured HEAD, common-fixture diagnostic | 1285.834 | 840.706 | passed |
| Exact candidate, common-fixture diagnostic | 1815.426 | 861.416 | failed cold |
| Captured HEAD, controlled original environment + 45 s idle | 1238.056 | 912.717 | passed |
| Exact candidate, controlled original environment + 45 s idle | 1103.312 | 1316.565 | failed warm |

Both diagnostic pairs use the same captured 9560-file control tree and identical unchanged performance-test bytes. Candidate dispatcher/server/SDK hashes exactly match source-final.json. The final pair restores the original test environment, waits the same 45 seconds after build/setup on each side and performs no warmup calls. It does not change sample counts, thresholds, fixtures or test code. The earlier archive preparation failed only because release-tag history was absent; immutable Git objects/refs were copied into that temporary archive, after which canonical preparation passed. No project Git/index, installed runtime or production source was changed by the diagnostic.

The final controlled run passes cold startup but fails warm dispatch. Earlier failures affect different dimensions. The factory import comparison finds only one additional pure module (134 to 135), with no added private/IO/SDK dependency graph. This is useful diagnosis, not proof that code has no performance impact. No exact causal defect, stable performance qualification or pre-existing-only explanation is established. All failed benchmark exits remain actual failures. The original CI limits stay intact.

SCN-023 and the full CD+Tests acceptance therefore remain incomplete. Functional protocol/recovery/package/browser evidence does not erase this regression/qualification gap. Formal CR, TP Review, Clean Review and QA are not claimed complete; canonical control must remain at CD+Tests until the applicable failure is resolved or routed through its existing approved-source owner. A general worker-performance project remains outside this TP. No new gate approval is requested by this report.
