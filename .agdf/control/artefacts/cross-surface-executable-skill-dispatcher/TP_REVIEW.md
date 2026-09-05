# Task Plan Review: Cross-surface Executable Skill Dispatcher

Revision: 10
Status: revise
Date: 2026-09-05
Plan: TP Revision 2
Review mode: direct review by the implementing agent, not independent-agent or loaded-host evidence.
Evidence: CD_TESTS.md Revision 10 and HOST_EVIDENCE.md Revision 10.


## Codex Follow-up Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-04 | fully_done | repository projection done | native Codex/Claude/Copilot environment fixtures and explicit override | fresh host tracked by TP-16 | no loaded-host pass |
| TP-06 | fully_done | repository locale AC done | canonical recovery equality; German ambiguous-run output; unknown-text negative | visible host fidelity | CSED-QA-01 remains open |
| TP-14 | partially_done | portable four-surface cases done | 40 cases now include actual German ambiguous control | native OS and model-owned host attempts | no cross-host conformance claim |
| TP-15 | fully_done | source generation and focused replay done | source-generated runtime and registry; aggregate result in CD_TESTS | installation separate | no shipped-fix claim |
| TP-16 | partially_done | evidence and reviews refreshed | actual Codex failure trace plus bounded source correction | corrected fresh host | prevents QA pass |

The remaining historical task rows retain their evidence boundaries. Overall coverage remains
12/16 repository tasks complete and four external-evidence tasks partial.

## TP Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-01 | fully_done | done | retained registry and strict dispatcher contract tests | none in foundation | none |
| TP-02 | fully_done | done | terminal target spies, immutable continuation, unchanged exact host_action and error tests | none in foundation | none |
| TP-03 | fully_done | done for retained portable foundation | unchanged CLI v1 and wrapper/provenance regression tests | native OS evidence tracked by TP-09/14 | no native conformance claim |
| TP-04 | fully_done | done for repository projection | shared v2 producer, generated SessionStart, active/inactive OpenCode and missing-runtime negatives | loaded-host proof tracked by TP-09/16 | no host-parity claim |
| TP-05 | fully_done | done | ten dispatch-only skill edits, unchanged judgement bodies and reviewed offline baseline | model adherence tracked by TP-09/16 | no model claim |
| TP-06 | fully_done | done | unchanged locale, target, gate, approval and terminality regressions | visible fidelity tracked below | no UI pass |
| TP-07 | fully_done | done | package and profile tests, current payload measurement, idempotent complete builds | user installation tracked separately | none in repository scope |
| TP-08 | fully_done | done | all focused and complete smoke suites pass | native host evidence separate | none in repository scope |
| TP-09 | partially_done | partial | historical CSED-HOST-01 through 08 and real CSED-RUNTIME-01 | coherent fresh installs/restarts, four-host matrix, native Windows/Linux, first-visible timing | prevents QA pass |
| TP-10 | partially_done | partial | current reviews, Context Graph, isolated rollback and OR | completion of external evidence obligations | prevents complete closeout |
| TP-11 | fully_done | done | shared v2 validation, derived grammar, old/new skew rejection, same protocol 1 | none | none |
| TP-12 | fully_done | done for available runtime slice | injected failures and cache identity, real Node, actual Electron launch and wrapper chain, child env unchanged | unavailable runtimes are not claimed | none in observed slice |
| TP-13 | fully_done | done for adapter/projection slice | 40 adapter cases, consent/lifecycle/hardening, source-composed validator path explicitly labelled, runtime-free public profile | fresh host loading tracked by TP-16 | no installed-host claim |
| TP-14 | partially_done | partial | 40 reference scenarios, missing/earlier/ambiguous control, synthetic QA input, POSIX shell, structured argv and Windows string fixtures | native Windows/Linux execution and first model-owned attempt without improvisation | prevents transport conformance claim across all hosts |
| TP-15 | fully_done | done | coherent generation, full smoke, current budgets, package inventories, isolated v1/v1-v2/v2 rollback and mixed-generation rejection | none in repository scope | none |
| TP-16 | partially_done | partial | current direct reviews, QA revise, OR and explicit evidence matrix | separately authorized lifecycle and fresh loaded-host observations | prevents QA pass |

## Summary

- fully_done: 12/16.
- partially_done: 4/16.
- not_done: 0/16.
- evidence_confidence: high for direct code/process and deterministic tests, insufficient for fresh host behavior.
- out_of_scope_changes: none. The pre-existing unrelated image is preserved. No other run was mutated.
- required_next_step: obtain bounded lifecycle authorization for coherent installation/restart and fresh host testing.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| Repo-less direct invocation | terminal target orientation | TP-14/16 | exact German process output, historical hosts, no new model rendering | partial | evidence_gap |
| Deterministic status path | resolved target/control | TP-14/16 | generated canonical terminal text, no current four-host render matrix | partial | evidence_gap |
| Review skill | bounded judgement continuation | TP-14/16 | synthetic QA-input fixture and retained judgement contract, fresh host absent | partial | evidence_gap |
| Missing/stale runtime | unavailable recovery | TP-11/13/16 | missing-entrypoint and schema-skew negatives, no fresh host recovery observation | partial | evidence_gap |
| Unproved execution | instruction_only disclosure | TP-13/16 | retained skills/public profile boundary, model compliance unobserved | not_verifiable | evidence_gap |
| Changed target/run/gate | fresh revalidation | TP-02/14/16 | unchanged resolver/evaluator tests and explicit run transport, new model turn absent | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-TP-EVIDENCE-01 | evidence_gap | evidence_obligation | open | TP-09/10/14/16 and the UX matrix lack current native-OS and loaded-host observations | Obtain bounded lifecycle authorization, then record the required matrix. |

No missing product, design or plan decision was invented to cover the evidence gap.
