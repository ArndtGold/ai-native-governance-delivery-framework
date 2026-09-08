# Task Plan Review: Cross-surface Executable Skill Dispatcher

Revision: 15
Status: revise
Date: 2026-09-08
Plan: TP Revision 2
Review mode: direct review by the implementing agent, not independent-agent or loaded-host evidence.
Evidence: CD_TESTS.md Revision 15 and HOST_EVIDENCE.md Revision 15.


## Host-native Plugin-root Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-04 | fully_done | host-specific SessionStart projection uses the native root first | canonical Codex and Claude POSIX/Windows commands plus exact hook integrity | loaded-host behavior remains under TP-16 | none in repository scope |
| TP-08 | fully_done | affected and complete repository regression done | focused suites and complete serial smoke pass | native host evidence separate | none in repository scope |
| TP-13 | fully_done | source, generated and installed Codex profile are coherent | installed cache `880e88555405`, Runtime Integrity and byte-identical hooks | fresh loaded-host task | no repository gap |
| TP-14 | partially_done | cross-platform command contract is covered | POSIX execution, Windows command fixtures and no-concatenation invariant | native Windows execution and wider host matrix | existing evidence gap remains |
| TP-15 | fully_done | generated and packaged state is coherent | release projection, 95-file payload, complete smoke and installed replay | none in repository scope | none |
| TP-16 | partially_done | reviews, installed runtime and QA refreshed | CD/TP/Clean/Code/QA/Host revisions current | fresh loaded Codex model and native Windows evidence | prevents QA pass |

Coverage remains 12/16 fully done and four external-evidence tasks partial. The two implementation
findings are resolved. The remaining gap concerns direct host evidence, not repository behavior.

## QA Candidate And Terminal-response Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-05 | fully_done | judgement continuation carries one bounded canonical QA inventory | immutable `candidate_runs`; exact function and QA-skill projections | model adherence remains under TP-16 | none in repository scope |
| TP-08 | fully_done | affected and complete repository regression done | complete serial smoke plus final affected suites | native host evidence separate | none in repository scope |
| TP-11 | fully_done | semantic output contract has one owner | whole-response terminal rule and QA-candidate rule in function schema | none | none |
| TP-13 | fully_done | source, generated and installed Codex profile are coherent | Runtime Integrity and installed cache `e464297ddcc5` | fresh loaded-host task | no repository gap |
| TP-14 | partially_done | deterministic candidate and terminal paths pass | 23 candidates, exactly 13 QA, both omitted IDs restored, exact terminal replay | model-owned fresh attempt and native OS matrix | existing evidence gap remains |
| TP-15 | fully_done | generated and installed package state is coherent | public payload, footprints, integrity and installed plugin listing pass | other hosts separate | none in repository scope |
| TP-16 | partially_done | reviews, installed runtime and QA refreshed | CD/TP/Clean/Code/QA/Host revisions current | fresh loaded-host observation | prevents QA pass |

The correction does not change the overall plan count. Coverage remains 12/16 fully done and four
external-evidence tasks partial. Installation is now observed; loaded-model behavior remains open.


## Semantic Function Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-05 | fully_done | compact executable guidance retains precise target semantics | one canonical projection in every skill, checked byte-for-byte | model adherence remains under TP-16 | none in repository scope |
| TP-11 | fully_done | public argument grammar has one semantic owner | `SKILL_DISPATCH_FUNCTION_DEFINITION`, derived command/binding grammar and compatibility re-export | none | none |
| TP-13 | fully_done | all generated host profiles receive the same meaning | source and installed Runtime Integrity plus four generated surfaces | fresh loaded-host behavior | no repository gap |
| TP-15 | fully_done | package and footprint budgets retained | 91 files, 696479/696486 Copilot bytes, 437 package files and byte-identical builds | installation separate | none |
| TP-16 | partially_done | mandatory reviews and QA refreshed | CD/TP/Clean/Code/QA/OR current revisions | corrected fresh installed-host observation | prevents QA pass |

Overall coverage remains 12/16 fully done and four external-evidence tasks partial.


## Typed Failure Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-01 | fully_done | strict shared target-source validation done | one validator, typed target-check error and dispatcher allowed values | none | none |
| TP-02 | fully_done | bounded terminal failure semantics done | five stable runtime failure codes, no raw downstream error text and one-action recovery | none | none |
| TP-03 | fully_done | JSON failure and exit behavior done | exact target-check and skill-dispatch exit-2 replays | none | none |
| TP-06 | fully_done | localized visible recovery done | German/English locale entries, allowed-values row and fail-closed registry fallback | visible host fidelity remains under TP-16 | no repository gap |
| TP-08 | fully_done | focused and affected regression done | target, dispatch, binding, interaction, CLI, package, integrity and source-smoke suites pass | native host evidence separate | none |
| TP-14 | partially_done | repository failure paths done | 40 adapter cases and typed evaluator/renderer negative fixtures | native OS and model-owned attempts | existing evidence gap remains |
| TP-15 | fully_done | coherent generated and package output done | 437-file package, byte-identical builds and Runtime Integrity | installation separate | none in repository scope |
| TP-16 | partially_done | reviews and QA refreshed | CD/TP/Clean/Code/QA/OR revisions updated | corrected fresh installed-host observation | prevents QA pass |

Overall coverage remains 12/16 fully done and four external-evidence tasks partial.


## Target-source Recovery Coverage

| task_id | status | AC coverage | evidence | missing_evidence | QA impact |
|---|---|---|---|---|---|
| TP-01 | fully_done | input contract and derived values done | one exported target-source list, strict error metadata and negative alias test | none | none |
| TP-02 | fully_done | bounded localized invalid-input outcome done | existing locale renderer, exact terminal host action and no raw invalid-value echo | none | none |
| TP-03 | fully_done | public invocation grammar done | usage and binding grammar expose all three canonical values | none | none |
| TP-06 | fully_done | locale and fail-closed behavior done | reviewed English/German registry entries and invalid-registry recovery boundary | fresh host fidelity remains under TP-16 | no repository gap |
| TP-11 | fully_done | canonical invocation grammar done | binding grammar derives from the target owner; `<source>` regression rejected | none | none |
| TP-14 | partially_done | repository argument and terminal recovery paths done | exact failing call, 40 adapter cases and injection-safe visible recovery | native OS and model-owned first attempt | existing evidence gap remains |
| TP-15 | fully_done | coherent generated/package regression done | 437-file package contents, both Runtime Integrity modes and serial smoke stages | installation separate | none in repository scope |
| TP-16 | partially_done | reviews and QA refreshed | CD/TP/Clean/Code/QA/OR revisions updated | corrected fresh installed-host observation | prevents QA pass |

The correction changes no overall task count. Coverage remains 12/16 fully done and four external
evidence tasks partial.


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
- out_of_scope_changes: none. No other run, installed profile, hook, permission or release state was mutated.
- required_next_step: open a new Codex task after the completed installation, rerun the two reported
  QA paths and then continue the separately authorized four-host and native-OS evidence matrix.

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
| CSED-TP-EVIDENCE-01 | evidence_gap | evidence_obligation | open | TP-09/10/14/16 and the UX matrix lack current native-OS and fresh loaded-host observations; installed Codex runtime is current | Start a new Codex task and record the corrected two-path result, then complete the remaining matrix. |

No missing product, design or plan decision was invented to cover the evidence gap.
