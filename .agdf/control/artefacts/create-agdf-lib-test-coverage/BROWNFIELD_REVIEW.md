# Brownfield Review: Unit Test Coverage For create-agdf/lib

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: create-agdf-lib-test-coverage
- related_ur: .agdf/control/artefacts/create-agdf-lib-test-coverage/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Size and route the approved UR "Unit Test Coverage For create-agdf/lib" before choosing PRD depth or implementation.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | Test-only change; no CLI/behavior change in scope | none |
| Source of truth | none conflicting | No SoT document describes test-coverage policy for this code | none |
| Runtime path | `create-agdf/lib/delivery-path-search/{scoring,candidate-policy,contracts}.js` | Tests only import and call existing exported functions, no path change | low |
| UI / UX | none | No UI surface involved | none |
| Persistence / data | none | `persistence.js` already covered by existing `delivery-path-search-test.js` | none |
| Tests / QA | `create-agdf/scripts/delivery-path-search-test.js`, `smoke-test.js`, `test-routing.js` | Already asserts `search-engine.js` behavior end-to-end: gate-forbidden rejection, path-escape rejection, action-smuggling rejection, cost-budget exhaustion, invalid-evaluation rejection, no-safe-recommendation, persistence redaction — via `node:assert/strict`, wired into `create-agdf/package.json` (`test:delivery-path-search`, `smoke-test`) and `.github/workflows/agdf-guardrails.yml` | high |
| Release / operations | none | No release workflow change needed | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The UR's problem statement overstated the gap: `search-engine.js` already has solid integration-level edge-case coverage via the existing test file | `delivery-path-search-test.js` lines asserting `forbidden_by_gate`, `not_in_allowed_actions`, `cost_budget_exhausted`, `invalid_evaluation`, path-escape rejection and persistence redaction | warn | Narrow this run's scope to the real gap: isolated unit tests for `scoring.js` (weight/penalty math), `candidate-policy.js` (`candidateLegality` normalization and precedence, `candidatesFromInput` budget slicing), and `contracts.js` validators (`validateSearchInput`, `validateCandidate`, `validateEvaluation`, `validateEnforcement`) — these are only exercised indirectly today, never called or asserted in isolation |
| A new test framework or a parallel test-running mechanism could be introduced | Existing convention is plain `node:assert/strict` scripts under `create-agdf/scripts/`, wired via `package.json` scripts and CI, no framework dependency | warn | Reuse the exact existing convention (plain assert script, same directory, same wiring pattern into `package.json` and `smoke-test`); do not add a test framework dependency |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Narrow, local, test-only addition that reuses an already-established test convention and CI wiring; no new product semantics beyond the approved UR; no architecture, policy, persistence or contract expansion — the contracts themselves are being tested, not changed.
- evidence: Existing `delivery-path-search-test.js` demonstrates the exact reuse pattern (plain `node:assert/strict` script, wired into `create-agdf/package.json` and `agdf-guardrails.yml`); the identified gap (isolated unit coverage of `scoring.js`, `candidate-policy.js`, `contracts.js`) is purely additive.
- transparency_note: Quick Task Execution may now implement only this narrowed scope, run the relevant checks (`npm --prefix create-agdf run smoke-test`, `node plugin/scripts/check-runtime-integrity.mjs`), and record compact evidence plus OR-lite. No PRD, SD or TP ritual is required for this size of change.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Test-only addition to an existing, already-documented Delivery Path Search line (`CG-DELIVERY-PATH-SEARCH`); no new durable cross-run knowledge claim.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — implement isolated unit tests for `scoring.js`, `candidate-policy.js`, `contracts.js`, wired into the existing test/CI convention.
- forbidden_until_then: PRD, SD, TP, Brownfield Analysis (not required for quick_task), production-logic changes.

## Quality Outlook

- quality_outlook: Once implemented and passing in the existing CI entry points, this closes the largest self-consistency gap identified in the earlier project evaluation without introducing new process weight.
