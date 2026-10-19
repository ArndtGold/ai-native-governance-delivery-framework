# Code Review: MCP ergonomics baseline evaluation

Gate: CR
Type: Code Review
Status: done
Decision: pass

## Run

- run_id: mcp-ergonomics-baseline-20261016-01
- related_tp: .agdf/control/artefacts/mcp-ergonomics-baseline-20261016-01/TP.md (approved)
- reviewer: Claude Code (claude-opus-5-5) with three independent read-only reviewers (native layer; protocol layer; aggregation, compare and CI)
- reviewed_at: 2026-10-16
- code_state: `main` `16d08888` plus this run's uncommitted changes
- supporting_evidence: `evidence/CR_FIX_VERIFICATION.json`, `evidence/CR13_NATIVE_SMOKE.md`; earlier `CD_TESTS.md`, `evidence/BASELINE_COMPARE.json`
- update: second recording at the QA gate; covers the CR-13 evidence and the changes made after the first recording (CR-14 to CR-16)

## Code Review

- scope: every changed or new file of the run: `evals/mcp-ergonomics/**` (lib, tests, call matrix, task set, findings map, baseline), `evals/scripts/*mcp-ergonomics*.js`, `scripts/native-probes/lib/claude-session.mjs`, `scripts/native-probes/claude-host-e2e.mjs`, root `package.json`, `scripts/verify-ci.mjs`, `scripts/verification-test.mjs`; generated compatibility evidence was checked through `compatibility:check` only.
- findings: fifteen implementation and risk findings and one evidence obligation, all resolved (see Normalized Findings).
- missing_evidence: signal cleanup (CR-08) and charging an unknown session cost (CR-07) cannot be triggered by a regular native run and are unit-tested only.
- risks:
  - T6 for native run 3 was re-evaluated from the recorded transcripts, not re-run. This is exact because none of the 8 T6 transcripts contains an evidence write; the re-evaluation script refuses transcripts that do.
  - Protocol runs used Node v22.22.3, native run 3 Node v24.19.0 (owner's external terminal); both are recorded in the baseline provenance.
  - `createRedactor` is shared with `claude-host-e2e.mjs`; it now redacts more forms and ignores case. The legacy-equivalence unit test passes; the native host E2E was not re-run.
  - Native runs default to a long-lived token; the copied credential file needs `--credentials-copy` (CR-16).
- required_next_step: QA gate.

### Changes made during this review

- T6 predicate implements TP T6: the stale write must be attempted and rejected with `stale_revision`; at most one evidence record follows; evidence writes are counted from the tool-call record. Native run 3 T6 re-evaluated: 8 of 8 verdicts changed from success to failure (no session attempted a write; all checked the revision first and asked).
- Compare: protocol compare includes per-tool `tools/list` metrics; native compare reports `incomplete` when metrics are not comparable; the command exits non-zero unless every layer is `unchanged`.
- Promote: the baseline drops launcher diagnostics; the fail-closed check also catches doubly escaped Windows, UNC, Git Bash and POSIX temp paths, e-mail addresses and connector names.
- Report: a failed or partial native run is stated as such; the re-evaluation is stated.
- Native runner: a cell error aborts only that cell with its known cost; unknown cost is charged with the session budget; the credential copy and the isolated home are removed on SIGINT, SIGTERM, SIGHUP and SIGBREAK; the credential removal is checked instead of asserted; an empty plan stops before install; predicates fail instead of throwing on unreadable run state.
- Protocol layer: normalization covers doubly JSON-escaped roots; fixture builds clean up on failure; the call matrix adds `agdf_cockpit_read` snapshot and unknown operation without UI capability (TP 1a). Protocol runs D and E are identical; run A differs from D only in the corrected call and the two added calls.
- Baseline re-promoted from protocol run D and re-evaluated native run 3; protocol run E and native run 3 compare `unchanged`; the raw pre-fix native output compares `changed` on the four T6 cells.
- Checks after the fixes: `test:mcp-ergonomics` (34 tests), `test:verification`, `test:host-compatibility`, `compatibility:check`, mcp-server `test:package` and `test:sdk-digest` pass; `tools/list` byte-identical to the T-002 capture; diff scope within SDD-014, nothing under `packages/`.

### Changes after the first CR record

The native smoke attempts for CR-13 (`evidence/CR13_NATIVE_SMOKE.md`) exposed three issues; each was fixed and re-reviewed:

- CR-14: the CR-05 fix stored task ids in `config.tasks`, which replaced the task objects in `planCells({ tasks, ...config })`; the plan now spreads the config first; a test checks the runner's dry-run plan.
- CR-15: sessions ending in an error result (failed authentication) were counted as `measured`; `sessionDisposition` in `native-run.js` now makes them `aborted`; tested with the observed error result. No baseline session ended in an error.
- CR-16: a copied credential file can be refreshed inside the isolated home during a long run, leaving the real login with a used refresh token (likely cause of the expired login on 2026-10-16). `withCopiedCredentials` uses `CLAUDE_CODE_OAUTH_TOKEN` when set; the native runner requires the token or the explicit `--credentials-copy` opt-in (owner decision 2026-10-16) and redacts the token value from every output; tests added.
- Checks after these changes: `test:mcp-ergonomics` 37 of 37, `test:verification`, `test:host-compatibility`, `compatibility:check`, mcp-server `test:package` and `test:sdk-digest` pass; diff scope within SDD-014; protocol run E and re-evaluated native run 3 still compare `unchanged` against the baseline.

### Observations, not findings

- `I-SEM-UNKNOWN-RUN` returns `inspect_result` with a blocked report status and counts as `ok`; the report shows it as matrix class `semantic_failure` against observed class `ok`. This is measured interface behavior (F01), not a classification defect.
- `K-SEM-UNKNOWN-OPERATION` and `K-NOUI-SEM-UNKNOWN-OPERATION` are rejected by the SDK schema, so no cockpit semantic failure reaches AGDF code.
- `CD_TESTS.md` figures for T6 success and the test count are superseded by this report.
- `evals/mcp-ergonomics/lib/report.js` and other files are partly staged; the owner stages the working tree as a whole before committing.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-01 | implementation_gap | CD+Tests | resolved | `evals/mcp-ergonomics/lib/native-tasks.js` `stale_write_guarded` counted a text marker that RUN_STATE.md never holds and passed without any write, against TP T6; fixed and run 3 T6 re-evaluated (`CR_FIX_VERIFICATION.json`) | none |
| CR-02 | implementation_gap | CD+Tests | resolved | `evals/mcp-ergonomics/lib/aggregate.js` `compareProtocol` ignored per-tool metrics (annotations, output schema, documented parameters), against METRICS.md; regression test added | none |
| CR-03 | implementation_gap | CD+Tests | resolved | `compareNative` reported `unchanged` when no metric was comparable; now `incomplete` with non-zero exit; tests added | none |
| CR-04 | implementation_gap | CD+Tests | resolved | promote kept launcher stderr and missed several path, e-mail and connector shapes, against SDD-012; `report.js` and `redaction.js` fixed with tests | none |
| CR-05 | implementation_gap | CD+Tests | resolved | `report.js` printed "All planned sessions were measured" for a failed native run; fixed with test | none |
| CR-06 | implementation_gap | CD+Tests | resolved | one exception in a cell rejected the whole schedule and lost all sessions; predicates threw on missing RUN_STATE.md; fixed with tests | none |
| CR-07 | implementation_gap | CD+Tests | resolved | a session with unknown cost was charged 0 USD, so the cap could be exceeded (SDD-009); now charged with its budget; test added | none |
| CR-08 | implementation_gap | CD+Tests | resolved | the credential copy survived SIGINT (SDD-006 isolation); signal cleanup added and removal checked; test added | none |
| CR-09 | implementation_gap | CD+Tests | resolved | an empty plan installed, copied credentials and reported `complete: true`; now stops before install | none |
| CR-10 | implementation_gap | CD+Tests | resolved | `normalize.js` missed doubly escaped roots, so bytes depended on the machine (SDD-004); fixed with test; protocol runs D and E recorded | none |
| CR-11 | implementation_gap | CD+Tests | resolved | fixture temp directories leaked when a build failed; cleanup added with test | none |
| CR-12 | implementation_gap | CD+Tests | resolved | the call matrix lacked `agdf_cockpit_read` calls without UI capability (TP 1a, AC-001); two entries added and measured | none |
| CR-13 | evidence_gap | evidence_obligation | resolved | `evidence/CR13_NATIVE_SMOKE.md`: attempt 3 ran the corrected runner in 4 native sessions (4 of 4 measured, complete, isolation unchanged, checked credential removal); signal cleanup and unknown-cost charging stay unit-tested | none |
| CR-14 | implementation_gap | CD+Tests | resolved | smoke attempt 1: every cell `runner_error` because `config.tasks` replaced the task objects in the plan; fixed in `run-mcp-ergonomics-native.js` with a dry-run plan test | none |
| CR-15 | implementation_gap | CD+Tests | resolved | smoke attempt 2: error results (failed authentication) counted as `measured`; `sessionDisposition` makes them `aborted`, with a test | none |
| CR-16 | emergent_risk | CD+Tests | resolved | earliest owner assessment: SDD-006 decides the credential copy and its removal but not token refresh inside the copy; the implementation avoids the refresh path without changing that decision. Token mode by default, `--credentials-copy` opt-in, token redaction; tests and README | none |

## Reassessment Under The Renewed TP

- reviewed_at: 2026-10-17
- trigger: UR source revision `ad5a4176-32d1-4b55-a42f-779bb2d8eaee` (2026-10-16) changed only the localized AGDF Approval Summary of the UR; UR, PRD, SD and TP were renewed with unchanged English content and approved again on 2026-10-17.
- result: the reviewed code and tests are unchanged since the second Code Review recording; findings CR-01 to CR-16 stay resolved and no new finding arises from the revision. Fresh checks under the renewed TP pass (37 of 37 unit tests, all suites, unchanged `tools/list` and baseline compare).
