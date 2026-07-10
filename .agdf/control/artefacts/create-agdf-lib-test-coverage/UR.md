# UR: Unit Test Coverage For create-agdf/lib

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`create-agdf/lib` — in particular the Delivery Path Search core (`scoring.js`, `search-engine.js`,
`candidate-policy.js`, `contracts.js`) — has only smoke- and fixture-level coverage
(`create-agdf/scripts/smoke-test.js`, `test-routing.js`, `delivery-path-search-test.js`). There are
no unit tests asserting scoring, search-termination, tie-breaking or contract-validation behavior at
the logic level, including edge cases such as empty candidate sets, tied scores or missing evidence.

## 2. Goal

Give the Delivery Path Search core and other `create-agdf/lib` logic real unit-test coverage with
assertions, so a silent regression in scoring, search termination or contract validation is caught
before it can affect gate-legality decisions.

## 3. Scope

- In scope: unit tests for `create-agdf/lib/delivery-path-search/scoring.js`, `search-engine.js`,
  `candidate-policy.js`, `contracts.js`, and any other `create-agdf/lib` module with logic-level
  behavior not already covered by smoke/fixture tests.
- Test-only change: no modification of existing production logic in this UR.

## 4. Non-Goals

- No behavior change to scoring, search or contract-validation logic. If the new tests surface a
  real bug, it is reported separately rather than fixed inside this UR.
- No change to `gate-state-clarity`, the Claude-evaluator enforcement-level decision, or the
  npm-publish QA caveat — these are separate, parked backlog items.
- No new test framework decision assumed; framework/tooling choice (e.g. plain `node:test` vs. an
  added dependency) is a Brownfield Review / SD question, not decided here.

## 5. Acceptance Signals

- Each in-scope module has unit tests covering at least its documented normal-case and known
  edge cases (empty input, tie-breaking, invalid contract shape).
- Tests run via an existing or newly wired `npm test`/`smoke-test`-style script and pass in CI
  (`agdf-guardrails.yml`).
- No change to observable behavior of `create-agdf` or `agdf` CLI commands.

## 6. Existing Source Of Truth

- `create-agdf/lib/delivery-path-search/contracts.js` (validation contracts to test against)
- `create-agdf/scripts/smoke-test.js`, `delivery-path-search-test.js`, `test-routing.js` (existing
  coverage boundary, to avoid duplicating what smoke tests already check)
- `.github/workflows/agdf-guardrails.yml` (CI entry points that must keep passing)

## 7. Risks And Unknowns

- Whether a test framework/dependency is needed or plain `node:test` (Node 22, already the CI
  runtime) is sufficient — for Brownfield Review / SD to confirm.
- Whether writing these tests surfaces an existing latent bug in scoring or search termination,
  which would need separate handling per Non-Goals.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
