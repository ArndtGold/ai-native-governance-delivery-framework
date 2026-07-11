# Brownfield Analysis: AI-Native Delivery Path Candidate Generation

Status: done
Mode: pre_implementation_analysis
Decision: pass
Date: 2026-07-11
Derived from: approved `TP.md`; approved `SD.md`; `BROWNFIELD_REVIEW.md`

## Scope

Verify the exact implementation path for AICG-01 through AICG-14 before `CD+Tests`. This analysis does not implement code or revise approved product semantics.

## Worktree And Scope Evidence

- The pre-analysis worktree contains only `.agdf/control/AGDF_RUN.md`, `.agdf/control/MASTER_BACKLOG.md` and the new scope artefact directory.
- No existing runtime, package, documentation or test file has an uncommitted change.
- There is no observed overlap with unrelated implementation work.
- The active scope matches the approved UR, PRD, SD and TP and the single active backlog row.
- multi_scope_state: clear

## Current Coverage

- current_coverage: partially_done
- The provider-neutral Delivery Path Search core, deterministic candidate policy, versioned contracts, state adapter, evaluator protocol, Codex/Claude adapters, capability matrix, persistence and focused tests already exist.
- Deterministic candidates currently come from exact allowed actions. The approved `gate_action` extension is necessary so concrete generated intents can remain tied to canonical gate legality.
- Search orchestration already accepts injected candidate fixtures, which provides a low-risk seam for generator integration without replacing ranking or stopping.
- Codex and Claude evaluator adapters duplicate repository snapshots, mutation checks, subprocess timeouts and provider-specific command construction. Only the first three concerns are suitable for a shared guard; provider command/prompt/schema handling must remain in adapters.
- Existing persistence redacts by key name only. Generator request validation must reject disallowed context before invocation; persistence redaction remains defense in depth, not the primary privacy boundary.
- Focused unit and integration scripts already cover contracts, candidate legality, budgets, invalid evaluation, persistence redaction and capability declarations and can be extended without creating a parallel test harness.

## Existing Owners And Reuse Path

| Concern | Existing owner | Reuse decision |
|---|---|---|
| Search input and budgets | `state-adapter.js`; `contracts.js` | extend with optional generation config and allowlisted request projection |
| Gate legality and baseline candidates | `candidate-policy.js` | extend with `gate_action`, normalization and diversity; keep as sole policy owner |
| Search sequencing and total budgets | `search-engine.js` | extend with one pre-evaluation generator phase |
| Evaluation and scoring | `evaluators/`; `scoring.js` | preserve behavior; do not add generation policy |
| Provider generation | none | add generator adapters beside evaluators using the approved protocol |
| Read-only process guard | duplicated in Codex/Claude evaluators | extract only snapshot, mutation, timeout normalization and cleanup |
| Capability claims | `surfaces/capabilities.js` | reuse unchanged semantic owner |
| Persistence/output | `persistence.js`; CLI printer | extend additively with redacted generation summary |
| CLI parsing/orchestration | `create-agdf/bin/create-agdf.js` | extend current command and help; no second executable |
| Tests | existing DPS unit/integration and smoke scripts | extend and add one focused generator script only if it improves separation |
| Canonical runtime and skill | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/delivery-path-search/SKILL.md` | change source first and regenerate derived surfaces |
| Packages | `create-agdf`; `@agdf/cli` wrapper | implementation stays in `create-agdf`; wrapper verifies delegation |

## Minimal Clean Implementation Path

1. Implement contracts and deterministic policy fixtures first.
2. Add the provider-neutral generator protocol and fixture adapter.
3. Extract the narrow read-only guard while preserving evaluator regression tests.
4. Add Codex and Claude generator adapters.
5. Extend search orchestration, state projection, persistence and output.
6. Wire opt-in CLI arguments with deterministic defaults.
7. Update canonical runtime/skill sources and regenerate derived assets.
8. Update only directly affected public/package documentation.
9. Run deterministic tests before bounded live probes.
10. Complete reviews, QA evidence and Context Graph reconciliation.

This is an extension strategy. No refactor or replacement beyond the narrow duplicated guard is justified.

## Compatibility And Regression Impact

- `validateSearchInput` currently returns a clone equal to legacy input; normalizing absent generation fields into the returned object would break that assertion and possibly callers. Preserve absence for legacy input or update only through an explicitly tested compatibility projection.
- Existing candidate objects omit defaulted optional fields. Apply legacy defaults at policy/orchestration read time rather than mutating validated legacy objects unless fixtures approve the additive shape.
- `candidateLegality` currently compares `action` exactly. The extension must use `gate_action ?? action`, keeping forbidden precedence and substring-smuggling rejection.
- `runDeliveryPathSearch` currently accepts explicit candidate fixtures. Preserve this deterministic seam and define precedence clearly when both fixture candidates and a generator are supplied; tests should use fixture generator input rather than silently mixing both.
- Existing evaluator `child_actions` expansion remains evaluation behavior and must not be routed through initial-generation diversity policy unless the approved SD is revised.
- `safeResult` key-name filtering is not sufficient for outbound privacy. Request schema rejection must occur before adapter invocation.
- CLI parsing currently exits on invalid input and is primarily exercised through subprocess smoke tests. New limit/flag failures should follow the same convention rather than introduce a separate parser framework.
- The current gate-check transition function does not consume persisted pre-implementation Brownfield Analysis evidence: after approved TP it always returns the Brownfield Analysis permission list. `effectiveCurrentGate` and durable `next_allowed_action` still project this run as `CD+Tests`, consistent with the Runtime Contract, but the machine-readable `allowed` list remains stale. This is an observed pre-existing projection defect, not candidate-generation implementation evidence; do not copy or depend on that defect in new code.
- Generated package assets are sync output and must not be edited directly.

## Parallel-Structure Risks

- second legality or diversity policy inside generator adapters: block
- generator implementation inside evaluator `child_actions`: block
- provider-specific budgets or fallback behavior: block
- separate CLI command or persistence root for generation: block
- duplicated capability matrix for generator surfaces: block
- direct generated-asset edits: block
- new general subprocess framework beyond the narrow read-only guard: revise unless evidence requires it

## Test Impact

- Extend `delivery-path-search-unit-test.js` for contracts, defaults, `gate_action`, normalization, similarity, signatures and capability reuse.
- Extend `delivery-path-search-test.js` for orchestration, fallback, combined budgets and persistence.
- Add mocked adapter/guard tests that do not require installed provider CLIs.
- Extend `smoke-test.js` for CLI help, opt-in generation fixtures, deterministic default and unsupported surfaces.
- Preserve all current fixtures before adding generated variants.
- Run bounded live Codex/Claude probes only after deterministic suites pass; record them as run evidence, not CI dependencies.

## Risks And Required Controls

| Risk | Control |
|---|---|
| Normalized legacy output changes unexpectedly | compatibility fixtures before orchestration changes |
| Text similarity behaves inconsistently across languages | versioned deterministic normalization fixtures; fail ambiguous variants closed |
| Subprocess timeout leaves work behind | guard-level timeout/cleanup tests and mutation snapshot |
| Shared guard changes evaluator behavior | evaluator regression tests before generator adapters |
| Generator sees excessive context | construct a new bounded allowlisted request and reject disallowed fields before invocation |
| Generated candidate bypasses current gate | validate exact `gate_action` before any evaluator call |
| Dirty control artefacts confuse mutation detection | mutation snapshot compares stable pre/post state; expected pre-existing dirty state is allowed only when unchanged |
| Gate-check `allowed` list remains at Brownfield Analysis after persisted pass | Treat Runtime Contract and durable pass evidence as authoritative; retain as an explicit control-projection caveat and do not broaden this implementation silently |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: open_gap
- required_action: Reconcile after implementation and review evidence establishes which approved generator invariants are actually delivered.
- gate_effect: none for starting CD+Tests; block clean closeout if unresolved.

## Decision

- decision: pass
- mode_slice_decision: structured_delivery
- reuse_strategy: extend
- missing_evidence: implementation/test results and bounded live-probe measurements, all assigned in the approved TP
- required_next_step: Begin CD+Tests with AICG-02 after recording AICG-01 complete. Stop on any TP stop condition.
- transparency: The existing architecture and tests provide a clear implementation seam. Pass means implementation may begin; it does not claim that compatibility, enforcement, privacy or quality are already verified.
