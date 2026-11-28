# TP Review: Lean Codex continuation handoff

Gate: TP Review
Type: TP Review
Status: `done`

## Run

- run_id: run-fc64e714-ce09-40f1-934f-5593fbeed84e
- approved_tp: sha256:c5e5d1a2892e92dc4aafbeebcb3916a669aa9f9d02e7324172642168662d576f
- approved_prd: sha256:7614327ddf066c1fe560d0bea8f2d7a2d789d16bbc59ce9d3a041e97b93f9d7b
- approved_sd: sha256:4a6bbfa53e099dbbe9d3dd4a0fc5aeaacc0111ad7ec5c41e609f5928c212ceb7
- reviewer: Claude (agent)
- reviewed_at: 2026-11-27
- evidence_state: the code after the Code Review fixes (CR-01, CR-03, CR-04, CR-05), with the suites re-run on that state (CODE_REVIEW.md, Re-verification After Fixes)

## Task Coverage

| task_id | Status | Evidence |
|---|---|---|
| T-001 | fulfilled | `codex-continuation.js` version-2 store with bounds, removal, legacy and unreadable handling, pruning, single claim; plus `release` from CR-04 and the future file-time rule from CR-03 |
| T-002 | fulfilled | three files byte-identical to 6e166cab; `contract.js` without `continuation_owner` |
| T-003 | fulfilled | `mcp-dispatch-runtime.js` attempt-only admission, new stale sentence, release on a terminal pickup (CR-04) |
| T-004 | fulfilled | `cockpit-session.js` activity check in `status` and `reserve`, shared clock, ended own reservation cleared (CR-01) |
| T-005 | fulfilled | `companion-continuation.ts`, `CompanionContinuationAction.tsx` without `stopping` |
| T-006 | fulfilled | `plugin-provenance.js` observation names |
| T-007 | fulfilled | `codex-continuation-admission-test.js` 7 cases including the dedicated pruning case from CR-05 |
| T-008 | fulfilled | `companion-continuation.test.js` 3 cases including the CR-01 and CR-04 regressions; `safety.test.js` write boundary |
| T-009 | fulfilled | contract test, control-ui unit test, browser fixture and cases (sharpened SCN-007 and SCN-009 per CR-05) |
| T-010 | fulfilled | `build:prepare` (no payload growth), `compatibility:record` (fingerprint 7812664f..., observation d0246518...), `compatibility:check` 56 of 56 after the CR fixes |

## Scenario Coverage

| scenario_id | criterion_id | design_decision_id | Status | Evidence |
|---|---|---|---|---|
| SCN-001 | AC-001 | SDD-001 | fulfilled | admission test case 1 pass (two processes, one permit, version-2 record) |
| SCN-002 | AC-001 | SDD-002 | fulfilled | admission test case 2 pass |
| SCN-003 | AC-002 | SDD-002 | fulfilled | admission test cases 3 (bounds, removal, future date) and 4 (pruning) pass |
| SCN-004 | AC-002 | SDD-003 | fulfilled | admission test case 5 pass, including the far-future file time |
| SCN-005 | AC-003 | SDD-004 | fulfilled | admission test case 6 pass, including `release` |
| SCN-006 | AC-003 | SDD-005 | fulfilled | MCP server case 2 pass: first pickup continues, repeat and foreign attempts terminal with the refusal sentence, terminal pickup releases its handoff |
| SCN-007 | AC-004 | SDD-005 | fulfilled | MCP server case 3 pass: ordinary continuation while pending, after pickup, with an unreadable record and during activity; outdated-revision approval rejected |
| SCN-008 | AC-005 | SDD-007 | fulfilled | MCP server case 3 pass (running from `observeCodexActivity`, ready after Stop, no reservation while running); control-ui running-notice case pass |
| SCN-009 | AC-006 | SDD-005 | fulfilled | MCP server cases 2 and 3 assert no `work_admission` and no owner in `resume_call` |
| SCN-010 | AC-006 | SDD-006 | fulfilled | `test:skill-dispatch` pass, `continuation_owner` rejected by schema and parser; `git diff 6e166cab` on the three files empty |
| SCN-011 | AC-007 | SDD-002 | fulfilled | admission test case 7 pass |
| SCN-012 | AC-007 | SDD-004 | fulfilled | MCP server case 2 pass: approval handoff opens `presentation_required`, tree unchanged |
| SCN-013 | AC-008 | SDD-008 | fulfilled | qualification case pass with the new names; suites of the Test Plan and `compatibility:check` pass; one cockpit-core host-limit failure (`cockpit-draft-check-test.js` symlink EPERM, untouched) documented in CD_TESTS.md |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | M1 two cards start the same Run | T-009 | vitest renders one waiting card and `sendMessage` called once ("binds the click to the selected Run and never sends it twice"); store permit proven by admission case 1 | fulfilled | none |
| AC-002 | M1 handoff ended by its bound | T-009 | vitest renders `Run fortsetzen` again once a status read reports `ready` ("keeps the running notice ... restores the action on confirmed readiness"); the store reports `ready` after the bound (admission case 3) | fulfilled | none |
| AC-005 | M1 Codex works on the shown agent step | T-009 | vitest renders `Codex arbeitet bereits an diesem Run.` for `running`, keeps it through a failed poll and shows no stopping text; Cockpit returns `running` from the activity lease (MCP server case 3) | fulfilled | none |
| AC-007 | M1 cancel, stale, approval handoff | T-009 | vitest cases for cancelled reservation, stale reload and approval request without an approval pass | fulfilled | none |

Visible evidence is rendered output of the real components in jsdom; the browser continuation cases (updated) and the live Codex app were not run on this host (stated gap since the PRD).

## Normalized Findings

No applicable finding: every task and scenario of the approved TP is fulfilled with the evidence above; native live-host checks and running the browser cases are out of the TP scope (TP section 5) and are not a plan gap.

## Decision

- decision: pass
