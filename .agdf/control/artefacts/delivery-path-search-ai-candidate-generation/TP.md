# Task/Test Plan: AI-Native Delivery Path Candidate Generation

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Date: 2026-07-11
Owner: agent
Derived from: approved `SD.md`; approved `PRD.md`; `BROWNFIELD_REVIEW.md`

## 1. Delivery Strategy

Extend the existing Delivery Path Search runtime in dependency order: contracts and deterministic policy first, then orchestration and transports, then CLI/output, canonical runtime/documentation propagation, and finally full verification. Deterministic-only behavior remains the regression baseline throughout.

Implementation must stop for a pre-implementation Brownfield Analysis after `Approval: TP`. No code task starts directly from TP approval.

## 2. Tasks

| Task ID | Task | Depends on | PRD coverage | Required evidence |
|---|---|---|---|---|
| AICG-01 | Perform pre-implementation Brownfield Analysis against the approved TP and current dirty worktree; confirm owners, overlap, compatibility path and exact affected files | none | AC 2, 17, 20 | Persisted Brownfield Analysis with pass/revise/block decision and clean reuse path |
| AICG-02 | Add additive generation input/result fields, generator request/response contracts, schema helpers and validation limits in the existing contract owner | AICG-01 | AC 2-6, 12-14, 17-18 | Positive/negative unit fixtures; legacy input accepted; invalid versions, bounds, fields and executable payloads rejected |
| AICG-03 | Extend deterministic candidate policy with legacy defaults, `gate_action` legality, normalization, cosmetic-duplicate detection and structured material-diversity rules | AICG-02 | AC 1, 6-9 | Unit fixtures for exact, formatting, paraphrase-threshold, signature and illegal-action cases |
| AICG-04 | Add provider-neutral generator protocol and deterministic fixture generator without provider or gate policy | AICG-02 | AC 2-4, 10-11 | Protocol fixtures; adapter-policy isolation test; one-call and proposal-count enforcement |
| AICG-05 | Add shared read-only transport guard for repository snapshots, mutation detection, timeout/error normalization and cleanup; preserve existing evaluator behavior | AICG-01 | AC 15-16 | Focused guard tests; evaluator regression evidence; mutation and timeout fixtures |
| AICG-06 | Implement Codex candidate-generator adapter using schema output, ephemeral read-only execution and the shared guard | AICG-04, AICG-05 | AC 3, 12-15 | Mocked adapter contract/error tests; bounded live probe with zero mutation, observed duration and available cost metadata |
| AICG-07 | Implement Claude candidate-generator adapter using schema output, disallowed write/shell tools and the shared guard | AICG-04, AICG-05 | AC 3, 12-16 | Mocked adapter contract/error tests; bounded live probe with zero mutation, observed duration and available cost metadata |
| AICG-08 | Extend search orchestration to create deterministic baseline first, invoke generation once, validate/deduplicate proposals, enforce combined budgets and preserve typed fallback behavior | AICG-03, AICG-04 | AC 1, 4-11, 14, 19, 21 | Integration fixtures for success, partial/all rejection, timeout/auth/schema/context/cost failure, exhaustion, mutation invalidation and `no_safe_recommendation` |
| AICG-09 | Extend normalized state, capability wiring, persistence and compact/JSON output with allowlisted context, provenance, redaction, separate budgets and legacy result readability | AICG-02, AICG-08 | AC 12-18 | Redaction/request snapshots; persisted legacy/new result fixtures; capability matrix assertions |
| AICG-10 | Add opt-in CLI flags, generator selection and explicit unsupported behavior for instruction-only surfaces while preserving deterministic defaults | AICG-06, AICG-07, AICG-08, AICG-09 | AC 4-5, 15-17, 21 | CLI help/argument tests; deterministic-default and generated fixture runs; unsupported-surface failure evidence |
| AICG-11 | Update canonical Runtime Contract and Delivery Path Search skill, then regenerate derived Codex/Copilot/OpenCode assets through the existing sync owner | AICG-10 | AC 2-5, 10-16, 20-21 | Canonical diff; sync output; runtime integrity pass; no direct generated-source edits |
| AICG-12 | Update directly affected package and public documentation without overstating instruction-only support, performance, cost or MCTS capability | AICG-10, AICG-11 | AC 14-18, 21-22 | Cross-surface terminology review; CLI examples; capability claims matched to evidence |
| AICG-13 | Run focused, package, runtime and control-state verification; resolve failures without fallback structures | AICG-02 through AICG-12 | AC 1-22 | All required commands and outputs recorded; diff review; no unresolved blocking evidence |
| AICG-14 | Reconcile `CG-DELIVERY-PATH-SEARCH` with approved reusable generator invariants and close or explicitly retain remaining gaps | AICG-13 | AC 1-22 | Updated Context Graph node and reconciliation status/evidence |

## 3. Deterministic Test Matrix

### Contract compatibility

- legacy search input without `generation` validates and produces deterministic behavior
- disabled generation normalizes predictably without invoking an adapter
- generator limits reject zero, negative, non-integer and above-maximum values
- generator limits cannot exceed whole-run time or cost budgets
- historical persisted results without `generation` remain readable
- additive candidate fields default correctly for legacy deterministic and expanded candidates

### Request and response safety

- generator request contains only allowlisted keys
- arrays and strings enforce count/length limits
- secret, credential, environment, raw-prompt, source-snapshot and hidden-reasoning fields reject
- response version, required fields, ranges and maximum proposal count validate
- commands/executable payloads reject
- raw adapter output never reaches persistence

### Legality and diversity

- `gate_action` must match an allowed canonical action
- forbidden and out-of-scope actions reject before evaluation
- equal normalized intent rejects
- punctuation/formatting-only variants reject
- token similarity at or above `0.8` plus identical signature rejects
- similar wording with a materially different structured signature is handled by the approved rule and fixtures
- different wording without a material signature difference rejects
- stable input order yields stable accepted/rejected order
- fewer than five diverse proposals is a valid partial result, not padding failure

### Orchestration and budgets

- baseline candidates are created first and remain present
- exactly one generator call occurs
- accepted generated candidates append after baseline candidates
- generation time/cost is recorded separately and charged to whole-run budgets
- no evaluation starts after generation exhausts whole-run budget
- generator failure retains baseline and reports typed failure
- mutation detection invalidates the whole run
- no automatic provider fallback occurs
- no legal/evaluable candidate returns `no_safe_recommendation`

### Surfaces and output

- Codex reports evidenced `tool_enforced`
- Claude reports evidenced `tool_enforced`
- Copilot, OpenCode and generic remain `instruction_only` without a conforming external adapter
- unsupported executable generation fails visibly
- JSON and compact output expose status, provenance, counts, budgets and failure code
- persisted output contains no prompts, raw responses, secrets or full sources

## 4. Live Probe Plan

Run at most one bounded generation probe per executable surface after deterministic adapter tests pass.

For Codex and Claude record:

- exact command shape with secrets omitted
- surface, runtime/model identity when observable
- configured 30-second and five-cost-unit generation limits
- observed wall duration
- provider-reported cost metadata when available, otherwise explicitly `unavailable`
- returned/accepted/rejected proposal counts
- repository status before and after
- zero-mutation result
- schema and enforcement result

A live probe failure does not authorize a workaround or weaker hidden transport. Record the failure and route to SD/TP revision if the approved enforcement contract cannot be met.

## 5. Required Verification Commands

Run the smallest focused tests during implementation, then before QA run at minimum:

```bash
npm --prefix create-agdf run test:delivery-path-search-unit
npm --prefix create-agdf run test:delivery-path-search
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node create-agdf/bin/create-agdf.js doctor --json
node create-agdf/bin/create-agdf.js gate-check --json
node create-agdf/bin/create-agdf.js delivery-map --json
git diff --check
```

If implementation adds a focused generator test script, wire it into `create-agdf` smoke testing and run it explicitly before the broader smoke test.

## 6. Acceptance-Criteria Traceability

| PRD AC | Primary tasks | Primary evidence |
|---:|---|---|
| 1 | AICG-03, AICG-08 | baseline immutability/integration fixtures |
| 2-3 | AICG-02, AICG-04 | contract ownership and adapter-isolation tests |
| 4-5 | AICG-02, AICG-08, AICG-10 | limits, CLI bounds and budget tests |
| 6-9 | AICG-02, AICG-03, AICG-08 | schema, legality, duplicate and diversity fixtures |
| 10-11 | AICG-08 | typed fallback and no-provider-switch tests |
| 12-13 | AICG-02, AICG-09 | request allowlist and redaction evidence |
| 14 | AICG-09, AICG-10 | JSON/compact/persistence snapshots |
| 15-16 | AICG-05 through AICG-07, AICG-09 | transport enforcement and capability fixtures/live probes |
| 17-18 | AICG-02, AICG-09, AICG-10 | deterministic and historical compatibility tests |
| 19 | AICG-03, AICG-08 | full failure/diversity integration matrix |
| 20 | AICG-11, AICG-13 | runtime integrity and package smoke passes |
| 21 | AICG-08, AICG-11, AICG-12 | advisory-only/non-MCTS checks |
| 22 | AICG-06, AICG-07, AICG-13 | bounded measured live-probe evidence |

## 7. Review And QA Sequence

After implementation and tests:

1. `agdf:task-plan-review` maps every AICG task and PRD AC to actual diff and evidence.
2. `agdf:clean-implementation-review` checks for duplicated policy, silent fallbacks, provider forks and parallel structures.
3. `agdf:code-review` reviews correctness, regression, security and maintainability.
4. Resolve review findings and rerun affected checks.
5. `agdf:qa-gate` decides pass, revise or block.
6. Reconcile the Context Graph before clean OR/closeout.

## 8. Explicit Stop Conditions

Stop and revise rather than improvise if:

- additive search contract v1 fields cannot remain unambiguous for legacy callers;
- generated proposals cannot map to exact canonical gate actions without new product semantics;
- deterministic diversity cannot satisfy the PRD without hidden model judgement;
- Codex or Claude cannot meet the approved technical read-only contract;
- safe timeout termination or mutation detection is not reliable;
- normalized context cannot exclude full source/artefact content;
- implementation requires provider-specific policy or automatic fallback;
- dirty-worktree overlap makes ownership of changes ambiguous.

## 9. Scope Exclusions

- no deterministic-baseline replacement
- no additional generator calls or recursive generation
- no native Copilot/OpenCode generator
- no provider-specific scoring, legality, diversity or persistence
- no default-on external generation
- no publishing, release, commit, push or PR

## 10. Next Step

TP approved on 2026-07-11. The persisted pre-implementation Brownfield Analysis passed; CD+Tests may begin with AICG-02.
