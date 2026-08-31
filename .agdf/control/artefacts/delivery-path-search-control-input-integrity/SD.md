# SD: Delivery Path Search Control Input Integrity

Status: approved
Gate: SD
Gate approval: approved on 2026-08-30 with exact user response
Based on: approved PRD
Date: 2026-08-30
Owner: user / agent

## 1. Solution Overview

Delivery Path Search will stop reconstructing authority from a persisted `Run Status Card`.
`searchInputFromControl()` will consume the canonical `evaluateGateCheck()` result for the exactly
selected run, read the same canonical run only for non-policy scope content, and verify that run ID,
revision ID and current gate still match before constructing search input.

The search core will classify terminal results by the phase that actually ran:

1. canonical input resolution;
2. candidate legality;
3. evaluator execution;
4. evaluated search conclusion.

A phase that never ran cannot produce a later-phase conclusion. In particular, zero valid
evaluations cannot produce or persist a recommendation-facing decision.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design use |
|---|---|---|
| Run selection, doctor findings, current gate and legal actions | `create-agdf/lib/control-evaluation/gate-check.js` and existing control-evaluation dependencies | `state-adapter.js` consumes the evaluated report; it does not copy transition tables or parse presentation Markdown |
| Objective, risks and revision content | selected canonical `RUN_STATE.md` through `readRunState()` | read only after evaluated selection; identity must match the gate-check snapshot |
| Search-input validation | `delivery-path-search/contracts.js` | validate scope identity, objective, actions, enforcement and budgets |
| Candidate construction and legality | `delivery-path-search/candidate-policy.js` | unchanged exact action matching; expose candidate provenance counts |
| Terminal search semantics | `delivery-path-search/search-engine.js` | one normalized phase/status/failure classification |
| Surface orchestration and rendering | `cli/delivery-path-search-command.js` | catch/print normalized results without reclassification |
| Durable advisory summary | `delivery-path-search/persistence.js` | persist only evaluated recommendation-facing terminal results |
| Normative behavior | `plugin/meta/contracts/control-scaffold.md` and `plugin/skills/delivery-path-search/SKILL.md` | define phase boundary and scope-fit obligation once, then generate projections |

`Run Status Card` remains derived presentation and is not added to `RUN_STATE.md`.

## 3. Architecture Decisions

### AD-01: Canonical gate report as policy input

`searchInputFromControl(targetDir, options, dependencies)` calls the canonical gate evaluator with
the selected `runId`. It maps `current_gate`, `allowed`, `forbidden`, evidence and next action from
that report. It must not read `Allowed now` or other policy fields from Markdown.

For testability, the gate evaluator and run reader are injectable dependencies. Production defaults
remain the existing canonical owners.

### AD-02: Same-snapshot identity guard

Search input carries:

- `scope_key` as selected `run_id`;
- `scope_revision` as canonical `revision_id`;
- `objective` from the same run;
- `current_gate` from canonical gate evaluation.

After gate evaluation, the adapter reads the selected run and compares `run_id`, `revision_id` and
`current_gate`. A mismatch returns `input_unavailable` with `failure_code: stale_control_snapshot`
before candidate generation or evaluator invocation.

This is a consistency guard, not a new run resolver or approval mechanism.

### AD-03: Phase-explicit result contract

Every result exposes `outcome_phase`:

- `input`
- `candidate`
- `evaluation`
- `search`

Terminal status and required provenance are:

| Status | Phase | Required condition | Evaluator invoked | Persistable |
|---|---|---|---|---|
| `input_unavailable` | input | canonical selection/actions unavailable, empty or stale | no | no |
| `no_legal_candidates` | candidate | canonical input valid, but zero legal candidates remain | no | no |
| `evaluator_unavailable` | evaluation | evaluator preflight/transport unavailable | no or attempted as reported | no |
| `evaluator_error` | evaluation | mutation, invalid output or fatal evaluation failure prevents a valid evaluation | attempted as reported | no |
| `recommendation` | search | at least one valid evaluation and one scored leader | yes | yes |
| `no_safe_recommendation` | search | at least one valid evaluation, but the existing/future search policy intentionally selects no leader | yes | yes |

This change does not add a scoring threshold. Under the current scoring policy a valid evaluated
candidate produces a leader, so `no_safe_recommendation` may be unreachable until a separately
approved policy defines a safe-leader rejection rule. It remains in the contract for compatibility,
but cannot be used as a catch-all error.

### AD-04: Central terminal classifier

`search-engine.js` owns one pure classifier using baseline count, legal/rejected counts, valid
evaluation count, invalid evaluation count and leader presence. CLI and persistence consume its
result verbatim.

- Empty canonical `allowed_actions` stops at `input_unavailable`.
- Non-empty supplied candidates all rejected by legality stop at `no_legal_candidates`.
- Legal candidates with no valid evaluations because evaluator output failed validation stop at
  `evaluator_error`.
- Only a valid scored leader returns `recommendation`.

`candidate_queue_exhausted` remains a stopping reason, not a user-facing status decision.

### AD-05: Explicit candidate/evaluation provenance

The result adds one `provenance` object:

```text
baseline_candidates
generated_candidates
legal_candidates
rejected_candidates
evaluation_attempts
valid_evaluations
invalid_evaluations
```

Existing `budgets.evaluations` remains the number of valid contract-accepted evaluations for
compatibility. `provenance.evaluation_attempts` makes failed attempts visible without changing
budget accounting silently.

### AD-06: Scope-fit boundary

The result exposes `scope_key`, `scope_revision` and `objective` in JSON and concise terminal output.
The Delivery Path Search skill must compare the requested decision with that objective before
invocation and must not apply the result to another product question.

No free-form objective flag is added. A new or unrelated decision first needs the correct governed
scope; the search command does not become a second task-target resolver.

### AD-07: Presentation and persistence

`delivery-path-search-command.js` prints:

- selected scope and revision;
- outcome phase and status;
- recommendation only for recommendation-facing statuses;
- candidate/evaluation provenance;
- stopping/failure reason;
- one recovery or canonical next-gate action.

Persistence remains allowed only for `recommendation` and a contract-valid
`no_safe_recommendation`. `persistSearchResult()` validates those preconditions and refuses
zero-evaluation or unavailable/error results even if called directly.

### AD-08: Compatibility

The search contract stays at version `1` because fields are additive and existing recommendation
results retain their fields. The set of `status` values is explicitly broadened and documented.
Consumers must branch on known status rather than treating every non-recommendation as
`no_safe_recommendation`.

The previous zero-evaluation `no_safe_recommendation` behavior is corrected, not preserved through
a compatibility alias, because retaining it would preserve the false product claim.

### AD-09: Projection propagation

Canonical changes are made only under `create-agdf/lib/**`, `plugin/meta/**` and
`plugin/skills/**`. Existing release preparation regenerates package/plugin projections. No
generated file becomes a hand-edited owner.

## 4. Integration Points

- `control-evaluation/gate-check.js`: existing canonical evaluated report, consumed without new policy.
- `control-evaluation/run-state.js`: selected run content and identity verification.
- `delivery-path-search/state-adapter.js`: primary defect location and snapshot mapper.
- `delivery-path-search/contracts.js`: additive `scope_revision` validation and result invariants.
- `delivery-path-search/candidate-policy.js`: legal/rejected provenance.
- `delivery-path-search/search-engine.js`: phase classifier and result construction.
- `cli/delivery-path-search-command.js`: normalized orchestration and human projection.
- `delivery-path-search/persistence.js`: recommendation-only persistence guard.
- Delivery Path Search skill/runtime contract and generated host packages.
- Focused unit, generator, CLI, control-state, package and release tests.

## 5. Constraints And Compatibility

- No import from presentation rendering into search policy.
- No second gate table, run resolver, approval validator or mutable status projection.
- No automatic provider fallback and no reduction of mutation guards.
- Fixture mode remains supported but must satisfy the same phase/result invariants.
- A stale selected revision fails closed before external evaluator/generator work.
- Error/unavailable results contain no recommendation and are never persisted as decisions.
- Repository tests prove source behavior only; installed and fresh-host claims remain separate.

## 6. Test And Evidence Strategy

1. Unit-test empty canonical actions as `input_unavailable` with zero evaluator calls.
2. Unit-test all-illegal supplied candidates as `no_legal_candidates`.
3. Unit-test invalid evaluator output as `evaluator_error` with visible attempts and invalid count.
4. Preserve recommendation, budget, generator-fallback and legality tests.
5. Create a temporary canonical run without `Run Status Card`; assert parity with gate-check actions,
   run/revision identity and successful evaluator invocation.
6. Simulate a revision change between gate evaluation and run read; assert
   `stale_control_snapshot` and zero external calls.
7. Assert CLI JSON/text phase and provenance parity for all statuses.
8. Assert persistence rejects unavailable/error/zero-valid-evaluation results.
9. Assert skill/runtime wording forbids cross-objective application.
10. Run focused Delivery Path Search suites, CLI/control-state regressions, `release:prepare`, package
    checks, full smoke in proportion to the affected generated runtime surface, doctor and diff checks.

## 7. Risks And Open Questions

- Importing full `evaluateGateCheck()` increases adapter work but preserves one policy owner; TP must
  include a regression for cycles and CLI modularization.
- `scope_revision` is additive but downstream strict consumers may reject unknown fields; release
  notes must identify the corrected status contract.
- `no_safe_recommendation` is retained but not currently produced by the scoring policy after error
  paths are removed. It must not regain catch-all semantics without a separately approved policy.
- Fixture injection could bypass production snapshot resolution; fixture results must still satisfy
  the same terminal invariants.

## 8. Next Step

Create and review the Task/Test Plan. Implementation remains forbidden until TP approval and a
passing pre-implementation Brownfield Analysis.
