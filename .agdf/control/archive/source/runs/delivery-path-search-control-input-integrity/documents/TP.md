# TP: Delivery Path Search Control Input Integrity

Status: approved
Gate: TP
Gate approval: approved on 2026-08-30 with exact user response
Based on: approved SD
Date: 2026-08-30
Owner: user / agent

## 1. Delivery Boundary

Implement the approved canonical-input, phase-status, provenance and projection design for Delivery
Path Search. The work corrects the reproduced zero-candidate conclusion without adding scoring
policy, provider fallback, a second gate evaluator or persistence for failed searches.

Implementation may begin only after exact TP approval and a passing pre-implementation Brownfield
Analysis. Every task below must preserve the approved run/revision identity, mutation guards and
source/generated ownership boundary.

## 2. Task Plan

| task_id | owner / paths | implementation obligation | acceptance criteria | required evidence |
|---|---|---|---|---|
| DPSI-T01 | `create-agdf/lib/delivery-path-search/state-adapter.js`; canonical control-evaluation imports | Replace Run Status Card Markdown-derived actions with an injected canonical `evaluateGateCheck()` result for the selected run. Keep objective/risk reads in the canonical run reader and introduce no copied gate table. | DPSI-01, DPSI-02, DPSI-07 | Unit test proves exact action parity and absence of presentation parsing; module-boundary test passes. |
| DPSI-T02 | `state-adapter.js`; `contracts.js` | Bind `scope_key`, `scope_revision`, objective and current gate to one evaluated snapshot. Compare run ID, revision ID and gate after the run read; return `input_unavailable` with `stale_control_snapshot` before external work on mismatch. | DPSI-01, DPSI-02, DPSI-06 | Same-snapshot success test and deterministic stale-revision negative test with zero evaluator/generator calls. |
| DPSI-T03 | `contracts.js` | Add version-1-compatible validation for `scope_revision`, `outcome_phase`, typed terminal statuses and provenance invariants. Reject recommendation-facing results with zero valid evaluations. | DPSI-04, DPSI-05, DPSI-06, DPSI-09 | Contract matrix covers every status/phase pair and rejects contradictory counts, phase and recommendation fields. |
| DPSI-T04 | `candidate-policy.js`; `search-engine.js` | Record baseline, generated, legal and rejected candidate counts. Add one pure terminal classifier: unavailable canonical input, no legal candidates, evaluator unavailable/error, recommendation and contract-valid evaluated no-safe outcome. Keep `candidate_queue_exhausted` as a stopping reason only. | DPSI-02, DPSI-03, DPSI-04, DPSI-05 | Focused unit matrix proves phase ownership and that the evaluator is not called for input/candidate terminal states. |
| DPSI-T05 | `search-engine.js`; evaluator protocol boundary | Track evaluation attempts, valid and invalid evaluations without weakening mutation validation. Preserve valid-evaluation budget semantics and prohibit automatic weaker/provider fallback. | DPSI-04, DPSI-05, DPSI-08 | Tests cover valid, invalid, unavailable and fatal evaluator responses, including attempts/counts/enforcement evidence. |
| DPSI-T06 | `create-agdf/lib/cli/delivery-path-search-command.js` | Project the normalized result without reclassification in JSON and terminal output: scope/revision/objective, phase/status, provenance, failure/stopping reason and one recovery/canonical next action. Print recommendation content only for recommendation-facing results. | DPSI-02 through DPSI-09 | JSON/text parity assertions for every terminal status; snapshot contains no false recommendation at zero evaluations. |
| DPSI-T07 | `create-agdf/lib/delivery-path-search/persistence.js` | Persist only contract-valid `recommendation` or evaluated `no_safe_recommendation`; reject unavailable/error/no-candidate/zero-valid-evaluation input even on direct invocation. | DPSI-04, DPSI-05, DPSI-09 | Direct persistence tests prove accepted and rejected matrices plus unchanged canonical run mutation guard. |
| DPSI-T08 | `plugin/meta/contracts/control-scaffold.md`; `plugin/skills/delivery-path-search/SKILL.md` | Document phase ownership, recommendation provenance and the scope-fit obligation once in canonical sources. Require a fresh governed scope for unrelated objectives; do not make search a task-target or gate authority. | DPSI-06, DPSI-07, DPSI-10 | Skill-eval/runtime-contract checks prove the unrelated-objective result is rejected and gate-check remains authoritative. |
| DPSI-T09 | `create-agdf/scripts/delivery-path-search-unit-test.js` | Replace legacy assertions that treat illegal/invalid zero-evaluation paths as `no_safe_recommendation`. Add the complete status/phase/provenance unit matrix while preserving scoring, budgets, legality, generation and read-only mutation tests. | DPSI-03, DPSI-04, DPSI-05, DPSI-08 | `test:delivery-path-search-unit` passes with explicit evaluator call-count assertions. |
| DPSI-T10 | focused integration fixtures/tests | Build a temporary canonical run with no persisted Run Status Card. Prove action parity with gate-check, successful evaluator invocation and selected run/revision identity. Simulate a changed revision between evaluation and read. | DPSI-01, DPSI-02, DPSI-05, DPSI-06 | `test:delivery-path-search` passes; fixture proves the original defect and stale-snapshot recovery. |
| DPSI-T11 | CLI, generator and control-state regression suites | Verify fixture mode, generator fallbacks, CLI modularization and control-state behavior preserve the same normalized contract without cycles or duplicate policy. | DPSI-07, DPSI-08, DPSI-09 | Focused CLI/generator/control-state commands pass; no skipped or weakened invariant. |
| DPSI-T12 | generated assets, package projections and release notes | Run canonical projection generation, document the additive fields and corrected status semantics, and verify package/source version coherence. Never hand-edit a generated owner. | DPSI-09, DPSI-10 | `release:prepare`, package-contents and package-build pass; generated diff traces to canonical sources. |
| DPSI-T13 | run evidence and Context Graph | Record changed paths, test results, deviations, compatibility evidence and the final control-input invariant. Reconcile `CG-DELIVERY-PATH-SEARCH` only from verified implementation evidence. | DPSI-01 through DPSI-10 | Durable CD+Tests evidence, review inputs and resolved Context Graph evidence before QA. |

## 3. Test Matrix

| test_id | level | scenario | expected result | mapped tasks / criteria |
|---|---|---|---|---|
| DPSI-UT01 | unit | canonical report has legal actions; RUN_STATE has no Run Status Card | actions exactly equal gate-check; input is ready | T01, T10 / DPSI-01 |
| DPSI-UT02 | unit | canonical actions missing/empty | `input_unavailable`; zero candidates and evaluator calls | T01, T03, T04 / DPSI-02, DPSI-05 |
| DPSI-UT03 | unit | supplied candidates all fail exact legality | `no_legal_candidates`; rejected count visible; zero evaluator calls | T04, T09 / DPSI-03 |
| DPSI-UT04 | unit | evaluator produces one valid scored result | `recommendation`; valid evaluations and leader provenance greater than zero | T03, T05, T09 / DPSI-04 |
| DPSI-UT05 | unit | evaluator output is invalid or mutation-tainted | `evaluator_error`; attempts/invalid counts visible; no recommendation | T03, T05, T09 / DPSI-05, DPSI-08 |
| DPSI-UT06 | unit | evaluator transport/preflight unavailable | `evaluator_unavailable`; enforcement preserved; no weaker fallback | T05, T09 / DPSI-08 |
| DPSI-UT07 | unit | run revision or gate changes after canonical evaluation | `input_unavailable` plus `stale_control_snapshot`; zero external calls | T02, T10 / DPSI-01, DPSI-02 |
| DPSI-UT08 | unit | direct persistence receives each terminal status | only valid recommendation-facing evaluated outcomes persist | T07 / DPSI-04, DPSI-05, DPSI-09 |
| DPSI-IT01 | integration | real temporary canonical run without persisted status projection | gate action parity, scope/revision identity and evaluator invocation | T01, T02, T10 / DPSI-01, DPSI-06 |
| DPSI-IT02 | CLI | JSON and human output for all terminal phases | identical status, counts, reason and next action; recommendation only where valid | T06, T11 / DPSI-02 through DPSI-09 |
| DPSI-IT03 | skill/runtime | selected objective differs from requested decision | result is not applied; correct governed scope is required | T08 / DPSI-06, DPSI-07 |
| DPSI-RT01 | regression | focused search, generator, CLI and control-state suites | existing scoring, budgets, mutation and authority invariants pass | T09, T10, T11 / DPSI-07, DPSI-08 |
| DPSI-DT01 | distribution | canonical sources regenerate packages | source/generated/package contract is coherent | T08, T12 / DPSI-10 |

## 4. Verification Commands

Run focused checks first, then generated/distribution checks:

```bash
npm --prefix create-agdf run test:delivery-path-search-unit
npm --prefix create-agdf run test:delivery-path-search
npm --prefix create-agdf run test:delivery-path-search-generator
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:control-state
npm --prefix create-agdf run release:prepare
npm --prefix create-agdf run test:package-contents
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run smoke-test
node create-agdf/bin/agdf-validator.js doctor --all-active --json
node create-agdf/bin/agdf-validator.js gate-check --run delivery-path-search-control-input-integrity --json
git diff --check
```

The full smoke suite is required because canonical skill/contract changes propagate across generated
host/runtime/package surfaces. A writable temporary npm cache may be used only if the default cache
fails with a permissions error.

## 5. Task Order And Stop Conditions

1. Complete pre-implementation Brownfield Analysis and stop if canonical ownership, dependency
   direction or baseline paths differ from SD.
2. Implement T01–T05 with their negative tests before changing presentation or persistence.
3. Implement T06–T08, then T09–T11 and resolve any contract mismatch at its canonical owner.
4. Run focused checks before T12 projection generation; do not mask a failure with generated edits.
5. Complete T13 only from passing evidence, then run mandatory TP Review, Clean Implementation
   Review and Code Review before QA.

Stop and route back to the earliest affected gate if implementation requires a new status meaning,
scoring threshold, provider fallback, public compatibility policy, task-target authority or a second
gate-policy owner. Do not weaken assertions, mutation guards or freshness checks to obtain a pass.

## 6. Completion Evidence

The implementation is TP-complete only when:

- all DPSI-T01 through DPSI-T13 obligations are fulfilled or an approved deviation is recorded;
- every DPSI-01 through DPSI-10 criterion has passing visible evidence;
- zero-evaluation states cannot be recommendation-facing or persistable;
- source, generated and package projections are coherent without claiming installed-host behavior;
- TP Review, Clean Implementation Review and Code Review have no open applicable gaps;
- the pre-QA canonical gate-check identifies QA preparation as the next permitted step.

## 7. Next Step

Pre-implementation Brownfield Analysis passed on 2026-08-30. Implement only the approved tasks and
tests; QA, UAT, release and VCS actions remain separate.
