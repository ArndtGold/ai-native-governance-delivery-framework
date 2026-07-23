# Task Plan Review: OpenCode Surface Hardening and Evaluator Parity

Status: revise
Revision: 2
Date: 2026-07-23

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| OHP-01 | fully_done | Generic manifest resolver, SDK fixtures and package smoke | none | none |
| OHP-02 | fully_done | JSON/human status matrix and live 1.18.3/1.17.11 probe | none | none |
| OHP-03 | fully_done | Static boundary, defensive-hook lifecycle cases, 39/39 skill evals | none | none |
| OHP-04 | fully_done | Clean/repeat install, owned uninstall, user-agent preservation and collision tests | none | none |
| OHP-05 | fully_done | Exact deny environment, required flags, Primary Agent and terminal-deny preflight tests | none | none |
| OHP-06 | fully_done | Shared prompt, strict event parser, shared evaluator contract and guarded transport | none | none |
| OHP-07 | fully_done | Conditional enforcement, typed failures, no-search/no-persist and mutation-hard-failure cases | none | none |
| OHP-08 | fully_done | INSTALL, package README, Runtime Contract, CLI examples and synced generated assets | none | none |
| OHP-09 | fully_done | Full smoke, Runtime Integrity, Pages check/build, doctor, gate-check and diff check | none | none |
| OHP-10 | partially_done | Installed SDK and real Primary-Agent preflight passed; zero-mutation proof captured | Authenticated evaluator response unavailable: host returned 401 `No provider available` | prevents QA pass |
| OHP-11 | fully_done | Existing installer owns exact-version validation, matching no-op, registry/install path, mandatory post-probe and lifecycle recovery; focused matrix, CLI smoke, full smoke and Runtime Integrity pass | Live global divergent-to-aligned run not executed because the installed SDK was already matching; deterministic evidence satisfies the implementation task | none |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| Declaration evidence is not live proof | Status inspection | OHP-02, OHP-08 | JSON/human status and docs retain `sdk_declaration` and `live_invocation_observed: false` | fulfilled | none |
| Versions stay separate and warning-only | Status inspection | OHP-02, OHP-11 | Live status reports host/SDK 1.18.3 matching; no-npm fixture proves status remains read-only while divergent fixtures retain warning-only state | fulfilled | none |
| Install repairs resolvable drift safely | OpenCode installation | OHP-11 | Matching no-op, exact 1.18.3 alignment, unavailable/failed/post-verification fixtures and partial JSON/human recovery output | fulfilled | none |
| Static guidance remains fail-closed | Active plugin guidance | OHP-03 | Static boundary plus hook-absent deterministic replay | fulfilled | none |
| `tool_enforced` is invocation-scoped | Executable evaluator | OHP-05, OHP-07, OHP-10 | Preflight and stale-evidence tests pass; no-evaluation result downgrades | partial | evidence_gap |
| Failure stops executable evaluation | Degraded recovery | OHP-07 | Typed result, null recommendation, exit 2 and no persistence | fulfilled | none |
| Mutation is a hard failure | Degraded recovery | OHP-06, OHP-07 | Fatal mutation result has no instruction-only execution fallback | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-01 | evidence_gap | evidence_obligation | open | Real OpenCode evaluator returned HTTP 401 before a contract-valid payload | Configure an authenticated OpenCode provider and rerun one bounded evaluator invocation under the proven deny profile |

## Summary

- fully_done: 10
- partially_done: 1
- not_done: 0
- out_of_scope_changes: none
- risks: Live `tool_enforced` availability is intentionally unclaimed until TPR-01 is resolved.
- required_next_step: Run QA with OHP-11 fully covered and TPR-01 retained as the sole open evidence obligation.
