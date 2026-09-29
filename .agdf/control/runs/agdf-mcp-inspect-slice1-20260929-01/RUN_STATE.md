# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-mcp-inspect-slice1-20260929-01
- lifecycle: active
- revision: 17
- revision_id: be45263a-52ce-4135-9263-84392138c1b2
- content_seal: sha256:c0993d828e4311659eb662a9fda3503975b2c94380fafe5f953e1566c6a6220a
- approval_seal: sha256:484d2412e731f151b03d848c7ff9fdd0801aa422033a74eea25778403a8b8509
- mode: structured_slice
- current_gate: QA
- decision: in_progress
- owner: agent

## Objective

Read-only AGDF control operations (doctor, gate-check, delivery-map, contract) are reachable through the MCP tool `agdf_inspect` with CLI parity, and a `presentation_required` dispatch carries the read-only approval preview; no write path moves to MCP.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Code Review decision `pass`. |
| What is approved? | Approval: UR, Approval: PRD, Approval: SD, Approval: TP |
| What is missing? | Exact Approval: QA. |
| What is the next allowed action? | Run the QA gate, persist the QA report, and request exact approval: Approval: QA |
| What is explicitly forbidden right now? | request UAT approval; release; claim delivery readiness before QA approval and report evidence |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` sha256:2bd2100d1afde28b · presentation cf703087-a6a3-4de0-830b-26dcb76e11de sha256:3d298e22955982074202bd2cd34524a54597d33098426c8c83813a23c7410292 |
| PRD | approved | `Approval: PRD` · 2026-09-29 · revision 6 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/PRD.md` sha256:fca39eb37ca65e46 · presentation c4024f03-59f8-45ec-90ba-eea600fa2e6e sha256:de8b66da50b1d8ef9d2ba8790710200c785029f811092ecded202cf3a2861f67 |
| SD | approved | `Approval: SD` · 2026-09-29 · revision 9 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/SD.md` sha256:ebc0b9508e52e0f7 · presentation 5b69fbc4-739b-45ed-828a-9eafb1816c22 sha256:1876ac3df72427476fa89373a25fdae87f375de4125d983c1bc5c3b02b2550cd |
| TP | approved | `Approval: TP` · 2026-09-29 · revision 11 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/TP.md` sha256:ef12ed46fdb479c9 · presentation e906aeb9-6688-402f-aaab-f07fcaefc1b7 sha256:e576e20a5785cf5d98355da808eec05507add8980560fa029d50c9ee8b7ae7a5 |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/PRD.md` | approved | criteria-chain-v1 |
| SD | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/SD.md` | approved | criteria-chain-v1; maps AC-001–AC-007 exactly once to SDD-001–SDD-005 |
| TP | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/TP.md` | approved | criteria-chain-v1; maps AC-001–AC-007 and SDD-001–SDD-005 through six tasks and nine scenarios |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_ANALYSIS.md` | done | `pre_implementation_analysis` pass against approved TP revision 11; owners and reuse path confirmed; precondition: green control-state-test.js from run agdf-actionable-card-ux-20260928-01 |
| CD+Tests | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/CD_TESTS.md` | done | Implementation and repository checks passed; AC-007 measurement open as evidence obligation; precondition work attributed to run agdf-actionable-card-ux-20260928-01 |
| CR | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/CODE_REVIEW.md` | done | Code Review pass; CR-01 and CR-02 resolved in review |
| QA |  | missing |  |

## Mode/Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: one coherent outcome exposes read-only control operations and the approval preview via the existing MCP server; no write path, authority, persistence, migration, adapter or rollout change; rejected structured_delivery (no full-depth trigger)
- evidence: .agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_REVIEW.md; agdf-mcp-server/src/server.js; create-agdf/lib/mcp-dispatch-runtime.js; create-agdf/lib/skill-dispatch/service.js; create-agdf/lib/control-evaluation/gate-check.js; create-agdf/lib/cli/command-registry.js; plugin/meta/contracts/interaction.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-09-29 · revision 2 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` sha256:2bd2100d1afde28b · presentation cf703087-a6a3-4de0-830b-26dcb76e11de sha256:3d298e22955982074202bd2cd34524a54597d33098426c8c83813a23c7410292 |
| PRD | derived_from | UR | approved UR revision 2 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` sha256:2bd2100d1afde28b2791e42720f0a21f64f77feacc3da4dcc84199f40d84d044 · `Approval: UR` presentation cf703087-a6a3-4de0-830b-26dcb76e11de · PRD `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/PRD.md` sha256:fca39eb37ca65e46e846af520b6b2c2a3c142be701ad387b68dd71cd0b6fae2c · criteria-chain-v1 · Brownfield Review `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_REVIEW.md` structured_slice |
| SD | derived_from | PRD | approved PRD revision 6 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/PRD.md` sha256:fca39eb37ca65e46e846af520b6b2c2a3c142be701ad387b68dd71cd0b6fae2c · `Approval: PRD` presentation c4024f03-59f8-45ec-90ba-eea600fa2e6e · SD draft `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/SD.md` · criteria-chain-v1 |
| TP | derived_from | SD | approved SD revision 9 · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/SD.md` sha256:ebc0b9508e52e0f74b6f060844debaaa025ce653006a61c4e965b98a26c4ad4b · `Approval: SD` presentation 5b69fbc4-739b-45ed-828a-9eafb1816c22 · TP draft `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/TP.md` · criteria-chain-v1 |
| Brownfield Analysis | verifies | TP revision 11 | Pass · `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_ANALYSIS.md` · six approved tasks; existing evaluator, runtime, dispatcher and validator owners confirmed; parity defined as JSON.stringify equality of the CLI --json report |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `structured_slice` | direct |
| PRD | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/PRD.md` | seven stable acceptance criteria AC-001–AC-007, resolved before_prd decisions (strictly read-only slice, core operation set, one tool with operation enum, step target as measurement) | direct |
| SD | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/SD.md` | SDD-001–SDD-005; every criterion mapped exactly once; parity limitation for verified_change documented | direct |
| TP | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/TP.md` | six tasks, nine scenarios; green control-state-test.js as CD+Tests precondition | direct |
| Brownfield Analysis | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/BROWNFIELD_ANALYSIS.md` | pre_implementation_analysis pass; owners, reuse path, parity definition | direct |
| CD+Tests | `.agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/CD_TESTS.md` | control-inspect parity/read-only/preview suite, dispatch and MCP server suites, footprint, evals 90/90, package and budget checks; full smoke chain green at the final code state | direct |
| Stale fixtures on main | `create-agdf/scripts/control-state-test.js`, `cli-gate-scenarios-test.js`, `intake-continuation-test.js`, `smoke-test.js` | assertions aligned to the approved card UX of run agdf-actionable-card-ux-20260928-01 as CD+Tests precondition | direct |
| Code Review | code-review | decision pass: .agdf/control/artefacts/agdf-mcp-inspect-slice1-20260929-01/CODE_REVIEW.md; findings CR-01 (oversize inspect fallback) and CR-02 (CLI variant rejection) resolved in review; worker e2e reproduction; test:control-inspect, mcp-server, skill-dispatch, cli-gates, package, footprint green | direct |

## Closeout

- next_allowed_action: Run the QA gate, persist the QA report, and request exact approval: Approval: QA
- quality_outlook: Keep one evaluator and one validation rule set; measure steps and tokens on a host before claiming the benefit; record the fixture alignment in the owning run.
