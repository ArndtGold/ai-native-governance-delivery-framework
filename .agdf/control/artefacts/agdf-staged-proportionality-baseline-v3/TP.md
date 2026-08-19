# TP: Staged Proportionality Baseline v3

Status: `approved`
Gate: TP
Gate approval: exact `Approval: TP` on 2026-08-19 after revalidation of run, gate, Revision 1 and durable artefact
Revision: 1
Based on: approved SD Revision 1
Date: 2026-08-19
Owner: user / agent
Run: `agdf-staged-proportionality-baseline-v3`

## 1. Execution Boundary

Implement the approved additive `staged-v3` profile in the existing proportionality benchmark,
protect all historical staged-v2/r3 evidence, centralize profile dispatch, add complete neutral v3
facts and prove behavior through deterministic repository evidence.

After exact `Approval: TP`, implementation still does not start immediately. `SPB3-T01` is the
mandatory pre-implementation Brownfield Analysis. Only a durable `pass` with a clean candidate-path
baseline and isolated unrelated work opens `CD+Tests`.

This TP does not authorize authenticated live recording, VCS actions, release, deployment, publish or
reinstall. A future live v3 series requires a separately reviewed bounded execution plan and explicit
authority after repository acceptance.

## 2. Task List

| task_id | Task | Acceptance mapping | Evidence required | Stop or escalation condition |
|---|---|---|---|---|
| `SPB3-T01` | Run pre-implementation Brownfield Analysis: revalidate approved scope, exact candidate/protected paths, current dirty worktree, existing owners, source fingerprints, test entry points and cleanest implementation sequence. | Brownfield; SD constraints | `BROWNFIELD_ANALYSIS.md` with `pass`, scoped baseline and reuse map | overlapping foreign changes cannot be isolated; protected history already drifted; approved design no longer fits |
| `SPB3-T02` | Capture deterministic SHA-256 inventory of every protected staged-v2 input and persisted r3 attempt, observation and report in new `staged-v3-history-provenance.json`; add independent inventory completeness verification. | PR-03; AD-02; E02 | stable sorted inventory, path-set and hash tests | any protected path must be edited, omitted or accepted without a hash |
| `SPB3-T03` | Add frozen `profiles.js` registry for legacy-v1, staged-v2 and staged-v3, including public selector, family, manifest, schema/protocol/adapter/runner versions and key/fixture strategies; retain compatibility aliases. | PR-01/02; AD-01; E01 | registry unit assertions, supported-selector list, unknown rejection and consumer scan | second profile owner or incompatible v1/v2 export removal is required |
| `SPB3-T04` | Refactor loader, recorder, evaluator, reporter and scripts to consume the registry instead of repeated staged-v2 string branches, without changing v1/v2 results. | AD-01/07/08/09; E01/E07/E09 | focused compatibility snapshots and branch-owner inspection | v3 needs a second pipeline or v2 output changes |
| `SPB3-T05` | Add v3 manifest, scenario index, fixture catalog and hidden baseline with independent versions, exactly 40 cases, the complete staged scenario set, all six paths and at least 10 adversarial cases. | PR-02/12; AD-02; E08 | loader/schema checks, identity bijection, version mismatch negatives | target counts/identities cannot be satisfied without editing v2 |
| `SPB3-T06` | Rewrite v3 PB-008 facts to separate effective control state, currently permitted clarification and mutation intent; retain no expected stage/path in visible data. | PR-04/07; UX-05; AD-03/06; E03/E06 | raw fixture, prompt snapshot and expected hidden-baseline traceability | clarification and blocked mutation state remain conflated |
| `SPB3-T07` | Rewrite v3 PB-010 and PB-011 with one explicit action/semantic-effect interpretation each and versioned hidden expectations derived from current canonical behavior. | PR-05/06/07; AD-03/06; E03/E06 | task-semantic assertions, prompt snapshots and rationale traceability | task text still supports two delivery interpretations or is tuned to a desired label |
| `SPB3-T08` | Replace v3 PB-016/PB-017/PB-020 evidence packs with the complete five-group Verified Change fact object, including explicit structured escalation targets. | PR-08/09; AD-04; E04 | three positive cases plus missing/conflicting negatives for every fact group | expected selected mode appears in visible facts or a required fact is inferred |
| `SPB3-T09` | Add complete versioned Structured Depth fact objects for all structured v3 cases, including PB-022/PB-028/PB-029: six trigger families and seven bounded checks, without expected reason/depth. | PR-10/11; AD-05; E05 | schema completeness, semantic target cases, one negative per missing/conflicting class | counts become decision proxies or Modes policy is copied into fixtures |
| `SPB3-T10` | Implement schema-version-3 agent-output contract and parameterized staged normalization while retaining exact v2 schema/axis behavior. | PR-02; AD-07; E07 | positive/negative v2/v3 schema and axis invariant matrix | v2 contract changes or v3 output can bypass requested-axis invariants |
| `SPB3-T11` | Generalize corpus loading for staged profile definitions; validate manifest/corpus/fixture/baseline versions, history inventory, coverage, symlink/path boundaries and all new neutral fact schemas. | PR-02/03/08–12; AD-02–05; E02/E04/E05/E08 | positive v3 load and targeted unknown/missing/mixed/drift/path-escape failures | any unknown or mixed fact/version set loads successfully |
| `SPB3-T12` | Extend recursive leakage validation for v3 raw scenarios/evidence packs and final prompt text, covering expected stage/path, reason code, target rationale, thresholds, grading values and baseline references. | PR-07; AD-06; E06 | all-scenario positive scan and adversarial key/value/variant negatives | necessary neutral facts cannot be expressed without target leakage |
| `SPB3-T13` | Make blind prompt construction registry/profile aware and pass only validated visible case facts plus canonical behavior sources; keep baseline structurally unreachable. | PR-04–11; AD-03–07; E03–E07 | prompt snapshots for targeted and representative cases; interface inspection | baseline or grader record is accepted by prompt construction |
| `SPB3-T14` | Generalize source fingerprints to bind selected profile metadata, neutral case/fixture input, adapter version, canonical behavior sources and shared implementation sources; preserve historical v1/v2 behavior. | PR-03/15; AD-02/07; E02/E07 | fresh/stale/historical and profile-drift tests | staged-v3 drift stays fresh or historical replay becomes a current-live claim |
| `SPB3-T15` | Generalize read-only recording for v3 schema/profile metadata, observation IDs, atomic persistence, safe errors, retries and attempt provenance; keep duplicate, mutation and redaction protection. | PR-01/02/15/16; UX-01/03/06/07; AD-07/09; E07/E09 | mocked recorder tests only; no authenticated call or persisted live series | invalid observation is counted, valid data overwritten or safety failure retried silently |
| `SPB3-T16` | Generalize staged evaluation for dynamic profile/protocol/versions while retaining stage/path consensus, freshness, ambiguity, coverage and unchanged threshold semantics. | PR-11–15; UX-04/05; AD-08; E05/E08/E09 | v2 snapshot parity, v3 synthetic pass and focused block reason tests | v2 result changes or any safety/ambiguity condition remains passable |
| `SPB3-T17` | Generalize staged report rendering for v3 and expose selected versions, evidence class, coverage, deviations, ambiguity, thresholds, pass/block and explicit replay/live-host non-claim. | PR-13/14; UX-03/04; AD-08; E08/E09 | deterministic JSON/Markdown snapshots for v2/v3 and evidence-label assertions | replay is presented as authenticated host evidence or v2 output drifts |
| `SPB3-T18` | Extend run/record CLI scripts to list and accept `staged-v3`, derive strategies from the registry, name mismatch dimensions and prohibit implicit fallback. | PR-01/02; UX-01–03; AD-01/09; E01/E09 | positive selectors, usage, unknown, missing, mixed and no-fallback tests | selector is inferred, usage drifts from registry or public v1/v2 behavior breaks |
| `SPB3-T19` | Build a complete in-memory/temporary three-repeat synthetic v3 series and prove deterministic evaluation/rendering twice without repository mutation. | PR-12–16; UX-04; AD-10; E08–E10 | complete pass series, identical normalized JSON/Markdown and clean worktree snapshot for candidate paths | fabricated output is labeled live, replay differs or repository data is persisted |
| `SPB3-T20` | Add negative synthetic series for missing coverage, duplicate repeat/ID, mixed profile/version/provenance, stale fingerprint, ambiguous axes, critical under-governance, stage deviation and 10%/over-10% small-path boundary. | PR-09/11–16; AD-07/08/10; E07–E10 | exact blocking reasons and exit behavior for every negative | any required blocker produces pass or a threshold is weakened |
| `SPB3-T21` | Add targeted safety/history negatives: protected file drift, inventory omission/addition, leakage variants, mutation, redaction, duplicate write and invalid retry behavior. | PR-03/07/15/16; UX-03/05–07; E02/E06/E07 | deterministic fail-closed assertions with unchanged fixtures | a safety/history failure is downgraded to warning or mutates evidence |
| `SPB3-T22` | Run focused benchmark tests, historical hash verification, exact-version doctor/gate-check, full create-agdf smoke, Runtime Integrity and diff checks; record results in `CD_TESTS.md`. | all; E01–E11 | all commands pass; evidence class and live non-claim recorded | any existing regression, validator finding, history drift or uncontrolled path change |
| `SPB3-T23` | Run Task Plan Review, Clean Implementation Review and mandatory Code Review; resolve findings or route normalized gaps to their earliest owner. | all | durable review reports; every task and applicable UX criterion mapped to evidence | any open relevant finding, parallel pipeline, workaround or unfulfilled task |
| `SPB3-T24` | Run QA gate using approved artefacts, Brownfield fit, implementation, tests and reviews; explicitly classify authenticated v3 live evidence as unperformed. | all | `QA_REPORT.md` with evidence-faithful `pass|revise|block` | false live-host claim, open finding, missing evidence or failed required test |

## 3. Phases And Ordering

### Phase A — Pre-Implementation Brownfield

Only `SPB3-T01`. No benchmark code, corpus, baseline or provenance file may change before its durable
`pass`.

### Phase B — Historical Boundary And Profile Owner

`SPB3-T02` through `SPB3-T04`:

1. freeze the protected history inventory;
2. introduce one profile owner;
3. refactor existing consumers under v1/v2 compatibility tests.

### Phase C — V3 Corpus And Contracts

`SPB3-T05` through `SPB3-T13`: create new v3 data, resolve targeted task semantics, provide complete
Verified Change/Depth facts, implement schema/loading/leakage and then build prompts from validated
visible inputs.

### Phase D — Recording, Grading, Reporting And CLI

`SPB3-T14` through `SPB3-T18`: extend existing shared owners only. No second executable or live call.

### Phase E — Deterministic Evidence

`SPB3-T19` through `SPB3-T22`: complete synthetic pass and negative matrices, then full regression,
integrity and control-state checks. Any valid block remains evidence; do not tune inputs or thresholds
to remove it.

### Phase F — Reviews And QA

`SPB3-T23` and `SPB3-T24`. QA follows all three mandatory reviews and cannot infer live evidence.

## 4. Test Plan

| test_id | Test area | Command or mechanism | Expected result |
|---|---|---|---|
| `SPB3-PT01` | Run control state | `node create-agdf/generated/plugins/agdf/runtime/agdf-local.js gate-check --run agdf-staged-proportionality-baseline-v3 --json` | exact-version validator; no findings; gate matches current phase |
| `SPB3-PT02` | Focused benchmark suite | `npm --prefix create-agdf run test:proportionality` | all v1/v2 compatibility and new v3 tests pass |
| `SPB3-PT03` | Profile registry/CLI | focused assertions plus run/record invocations for three profiles and invalid inputs | registry is sole selector owner; no fallback; actionable mismatch dimension |
| `SPB3-PT04` | Protected history | inventory completeness and SHA-256 verification inside focused suite | every declared staged-v2/r3 path exists and matches; no extra protected path omitted |
| `SPB3-PT05` | V3 corpus | loader/schema checks | exactly 40 cases, six paths, adversarial minimum and complete scenario-baseline identity |
| `SPB3-PT06` | PB-008/010/011 semantics | raw facts and rendered prompt snapshots | stage/action/mutation semantics unambiguous and target-free |
| `SPB3-PT07` | Verified Change facts | PB-016/017/020 positives and five-group missing/conflicting matrix | complete cases eligible by facts; every gap fails closed to declared escalation evidence |
| `SPB3-PT08` | Structured Depth facts | all structured cases, six triggers, seven checks and missing/conflicting matrix | complete neutral facts; no expected depth/reason leakage; unresolved gaps block |
| `SPB3-PT09` | Output contracts | schema v2/v3 and requested-axis matrix | valid outputs normalize; unknown/contradictory axes fail |
| `SPB3-PT10` | Blindness | recursive visible-data scan and all final prompts | no expected stage/path/reason/rationale/threshold/baseline reference reaches agent input |
| `SPB3-PT11` | Recorder safety | mocked transient, mutation, redaction, duplicate, replacement and provenance cases | bounded retry only for recoverable transient; all safety cases stop and remain auditable |
| `SPB3-PT12` | Fingerprint/freshness | current, stale, historical and mixed profiles | v3 current facts are fresh, drift is stale, history remains historical, mixes fail |
| `SPB3-PT13` | Complete synthetic v3 replay | three temporary observations per mandatory scenario, evaluated twice | pass fixture deterministic; no repository observation written |
| `SPB3-PT14` | Grading/threshold negatives | missing/mixed/ambiguous/critical-under/stage-deviation and 10% boundary series | exact block reasons; 10% passes and above 10% blocks; zero critical under/stage deviation |
| `SPB3-PT15` | Report/evidence classes | JSON and Markdown v2/v3 snapshots | selected versions and evidence class visible; replay/live non-claim present; v2 stable |
| `SPB3-PT16` | Full regression | `npm --prefix create-agdf run smoke-test` | all package tests pass without skipped/weakened assertions |
| `SPB3-PT17` | Runtime integrity | `node plugin/scripts/check-runtime-integrity.mjs` | pass; no plugin/runtime distribution drift |
| `SPB3-PT18` | Generated runtime integrity | `AGDF_RUNTIME_INTEGRITY_ROOT="$PWD/create-agdf/generated/plugins/agdf" node create-agdf/generated/plugins/agdf/scripts/check-runtime-integrity.mjs` | pass against generated package surface |
| `SPB3-PT19` | Control-state regression | `npm --prefix create-agdf run test:control-state` | pass including backlog vocabulary |
| `SPB3-PT20` | Diff quality/scope | `git diff --check`; scoped path inventory against T01 baseline | no whitespace errors, protected edits or unrelated new implementation paths |
| `SPB3-PT21` | Mandatory reviews | `task-plan-review`, `clean-implementation-review`, `code-review` | no open relevant findings; task/UX coverage complete |
| `SPB3-PT22` | QA | `qa-gate` | evidence-faithful decision; live v3 series remains an explicit non-claim |

## 5. Requirement, UX And Design Coverage

| Approved area | Tasks | Evidence |
|---|---|---|
| PR-01/02; AD-01/09 | T03/T04/T10/T11/T15/T18 | E01/E07/E09; PT03/PT09 |
| PR-03; AD-02 | T01/T02/T05/T11/T14/T21/T22 | E02; PT04/PT12/PT20 |
| PR-04/05/06; AD-03 | T06/T07/T13 | E03; PT06 |
| PR-07; AD-06 | T06/T07/T12/T13/T21 | E06; PT10 |
| PR-08/09; AD-04 | T08/T11/T20 | E04; PT07 |
| PR-10/11; AD-05 | T09/T11/T16/T20 | E05; PT08/PT14 |
| PR-12/13; AD-08/10 | T05/T16/T19/T20 | E08/E10; PT05/PT13/PT14 |
| PR-14; AD-08 | T16/T17/T22/T24 | E08/E09/E11; PT15/PT22 |
| PR-15/16; AD-07 | T10/T14/T15/T20/T21 | E07; PT09/PT11/PT12 |
| UX-01/02 | T03/T04/T18 | PT03/PT15 |
| UX-03 | T02/T11/T14/T18/T21 | PT03/PT04/PT12 |
| UX-04 | T16/T17/T19/T20 | PT13/PT14/PT15 |
| UX-05 | T08/T09/T11/T16/T20 | PT07/PT08/PT14 |
| UX-06/07 | T15/T21 | PT11 |
| Full regression/reviews/QA | T22/T23/T24 | E11; PT16–PT22 |

Every PRD product requirement, applicable UX criterion and SD architecture decision is covered. A
Task Plan Review must verify the mapping against the actual diff and durable evidence before QA.

## 6. Brownfield Scope And Allowed Paths

`SPB3-T01` must inspect and may narrow these candidate paths:

- `create-agdf/lib/proportionality-benchmark/profiles.js` (new);
- existing files under `create-agdf/lib/proportionality-benchmark/**`;
- `create-agdf/scripts/run-proportionality-benchmark.js`;
- `create-agdf/scripts/record-proportionality-benchmark.js`;
- `create-agdf/scripts/proportionality-benchmark-test.js`;
- `evals/proportionality/staged-v3-manifest.json` (new);
- `evals/proportionality/staged-v3-scenarios.json` (new);
- `evals/proportionality/fixtures/staged-v3-catalog.json` (new);
- `evals/proportionality/staged-v3-history-provenance.json` (new);
- run-owned files under
  `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/**`;
- selected run state, backlog and Parent coordination links.

`create-agdf/package.json` may change only if an existing proportionality test/script entry requires an
additive adjustment; no new executable is planned. Any need to modify Modes, Gate Transition,
Verified Change, Interaction, unrelated plugin/runtime code or another run's artefact is a stop and
routes to the earliest owning gate.

## 7. Protected And Out-Of-Scope Paths

Protected byte-for-byte:

- `evals/proportionality/staged-manifest.json`;
- `evals/proportionality/staged-scenarios.json`;
- `evals/proportionality/fixtures/staged-catalog.json`;
- `.agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_BASELINE.json`;
- `evals/proportionality/observations/codex-gpt-5.6-sol-agdf-0.11.4-staged-v2-20260729-r3/**`;
- staged-v2 r3 JSON/Markdown report and its completed QA/OR evidence.

Also out of scope:

- authenticated or billable live-agent execution and persisted v3 live observations;
- changes to canonical delivery-path, gate, approval, Verified Change or Structured Depth semantics;
- Unified Journey, Task Target, Interaction, OpenCode or other active workstreams;
- threshold weakening, fixture tuning or retroactive regrading;
- commit, push, PR, release, deployment, publish or reinstall.

## 8. Risks And QA Routing

- `block`: protected history drift, missing inventory path, target leakage, second pipeline/policy
  owner, v1/v2 compatibility regression, invalid evidence counted, critical under-governance, stage
  deviation, small-path over-governance above 10%, unresolved candidate-path overlap, or failed
  mandatory test/review.
- `revise`: incomplete task/UX mapping, unclear mismatch recovery, insufficient deterministic proof,
  maintainability finding, or missing explicit live-evidence non-claim.
- `warn`: authenticated staged-v3 live behavior remains unperformed after repository QA, provided no
  claim depends on it and a later execution plan remains separate.

Normalized review gaps route to the earliest approved owner: requirements to PRD, design to SD, plan
coverage to TP, implementation defects to CD+Tests and missing runtime/live proof to the explicit
evidence obligation. No review may silently rewrite an approved artefact.

## 9. Global Stop Conditions

- Pre-implementation Brownfield Analysis is not `pass`.
- Candidate benchmark paths are dirty from an unowned overlapping scope.
- Any protected v2/r3 hash or declared protected path set differs from the baseline inventory.
- Implementation requires a second runner, recorder, evaluator, reporter, profile authority or
  routing policy.
- Agent-visible v3 input contains an expected stage/path/reason/rationale/threshold or hidden
  baseline reference.
- A required Verified Change or Depth fact is omitted, inferred or represented by a count proxy.
- Legacy-v1 or staged-v2 output/behavior changes outside an explicitly approved compatible extension.
- Any focused, smoke, Runtime Integrity, control-state or diff check fails.
- Any applicable mandatory review finding remains open.
- A live-series invocation becomes necessary for repository acceptance without separate authority.
- Any required gate approval is missing.

## 10. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
