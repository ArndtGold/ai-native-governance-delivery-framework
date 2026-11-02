# Task Plan Review: Close Active Runs as Superseded or Abandoned

Decision: pass
run_id: run-lifecycle-close-20261028-01
Reviewer: Claude Code implementing agent
reviewed_at: 2026-10-29

## TP Coverage

| task_id | status | evidence |
|---|---|---|
| T-001 | fully_done | `run-closure.js`, `git-identity.js`; `run-closure-test.js`, `git-identity-test.js` pass |
| T-002 | fully_done | `run-steps.js`, `run-operations.js`, `run-operation-proof.js`, `run-step-transaction.js`, `run-backlog.js`; closure, replay, crash-recovery and backlog cases pass |
| T-003 | fully_done | `run-state-writer.js` guard and early checks; `run-lifecycle-guard-test.js` passes; SCN-012 before/after evidence recorded |
| T-004 | fully_done | `gate-policy.js`, `gate-check.js`, `run-work-summary.js`, `backlog-vocabulary.js`, `interaction-presentation.js`, `next-action.js`; guard and companion suites pass |
| T-005 | fully_done | `run-command-contract.js`, `run-command-service.js`; contract test and full MCP server suite pass, tool count 7 |
| T-006 | fully_done | CLI registry, parser, handler, surface-local validator; `run-close-test.js` passes |
| T-007 | fully_done | `cockpit.js` and control-ui components; `cockpit-mcp-test.js` and control-ui tests (8 + 280) pass |
| T-008 | fully_done | contracts, READMEs, handbook de/en; payload baseline, compatibility snapshot, eval fingerprints refreshed; community-health passes |
| T-009 | fully_done | suites on the final tree; native observation `evidence/scn-019-native-observation.md` |

All 28 scenarios SCN-001 to SCN-028 map to passing tests or recorded evidence as listed in `CD_TESTS.md`; the Code Review corrections added tests and changed no planned scenario.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | Prepare and Review: runs unchanged, preview stored | T-001 | Preview text with per-run fields and warnings in `run-closure-test.js`; native preview in `scn-019-after.png` | fulfilled | none |
| AC-002 | Review: header with count, finality, phrase | T-001 | Header assertions in core and CLI tests; native phrase `Close runs: 68826cf4` | fulfilled | none |
| AC-003 | Prepare: refusal before writing | T-001 | Refusal messages per case in `run-closure-test.js` and `run-close-test.js` | fulfilled | none |
| AC-004 | Confirm and apply: exact phrase only | T-001 | Rejection texts for missing, different, foreign phrase and unknown preview in tests | fulfilled | none |
| AC-005 | Confirm and apply: changed run skipped | T-001 | Per-run result "not closed: changed since preview" in tests | fulfilled | none |
| AC-006 | Confirm and apply: receipt fields | T-002 | Receipt assertions in tests; native receipts with identity and preview digest | fulfilled | none |
| AC-007 | Prepare and apply: not closable runs | T-001 | "not closable" with reason and recovery hint in tests | fulfilled | none |
| AC-008 | Attempted continuation: rejection naming closure | T-003 | `lifecycle_ended` messages per operation in guard test; gate-check closed status | fulfilled | none |
| AC-009 | Confirm and apply: seal valid, artefacts identical | T-002 | Seal and digest assertions; native seals `valid` | fulfilled | none |
| AC-010 | History: absent from active lists | T-004 | doctor and delivery-map selection tests; native companion "Keine offenen Runs in diesem Projekt" | fulfilled | none |
| AC-011 | History: cockpit archive and run detail | T-007 | Cockpit projection and control-ui rendering tests | fulfilled | none |
| AC-012 | Confirm and apply: backlog move or skip reported | T-002 | Linked, unlinked, skipped and path-invalid cases; native result "not linked" for both runs | fulfilled | none |
| AC-013 | Prepare and apply through MCP | T-005 | MCP run-command tests; native MCP preview and apply in Claude Code | fulfilled | none |
| AC-014 | Documentation | T-008 | Contract, README and handbook diffs; community-health pass | fulfilled | none |
| AC-015 | Prepare and apply: pending recovery blocks all | T-001 | Blocked preview and apply naming the run in `run-closure-test.js` | fulfilled | none |

## Findings

No open finding. Native observation covers Claude Code Desktop on Windows only; Codex, Copilot and OpenCode remain without native observation, which the TP allowed with protocol tests as substitute.
