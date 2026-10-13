# TP Review: renewed evidence coverage
- decision: revise

Run: core-mcp-flow-coherence-20261010-01
Revision at review: 18791d0d-f411-4727-a424-5ff4a20af203
Approved TP digest: sha256:f64d2aa07acead86ce8176a9062f43c87b0d2df7b4d7df82851db1b18fcb5ce3

## Review basis

All 19 approved tasks and 78 scenarios retain the exact prior automated/source-process mapping in SCENARIO_EVIDENCE_24.json. The plan and acceptance sources have not been revised. Existing completed checks are retained; this review refreshes actual observations and removes superseded claims that no current candidate/iPad sequence exists. It does not reclassify missing native/host/corpus evidence as pass.

Additional evidence: post-approval-retirement-30/VERIFICATION.json and NATIVE_FLOW_33.md; remaining-qa-34/IPAD_CHAT_APPROVAL_36.md, IPAD_READABILITY_37.md, QA_PROGRESS_38.md, MATRIX_PREFLIGHT_38.json and IPAD_DISCUSSION_APPROVAL_39.md. These are exact scoped proofs, not transferable whole-host qualification. All paths are relative to evidence/renewed-tp-15/.

## TP Coverage
| task_id | status | AC coverage / evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | partially_done | SCN-001; original protected baseline and retained process proofs | Complete matched baseline/current transition corpus and measured model traces are absent. | Prevents QA pass. |
| T-002 | partially_done | SCN-002..004; canonical writer/Inspect parity retained | Complete current cross-view native traversal remains incomplete. | Prevents QA pass. |
| T-003 | fully_done | SCN-005..006; exact prior automated/process logs retained | None within its automated/source-process scope. | No native qualification inferred. |
| T-004 | fully_done | SCN-007..012; exact prior operation/guard/recovery logs retained | None within its automated/source-process scope. | No native qualification inferred. |
| T-005 | fully_done | SCN-013..018; prior Core guards plus actual inert iPad question and later exact SD reply | None within its defined decision-owner/guard scope. | Native matrix is separately open. |
| T-006 | fully_done | SCN-019..023; exact prior lifecycle process logs retained | None within its automated/source-process scope. | Native teardown is separately open. |
| T-007 | fully_done | SCN-024..026; exact prior replacement/recovery process logs retained | None within its automated/source-process scope. | No native qualification inferred. |
| T-008 | fully_done | SCN-027..030; exact prior bounded retention/cleanup process logs retained | None within its automated/source-process scope. | No native qualification inferred. |
| T-009 | partially_done | SCN-031..035/077; retained guards; actual German native SD/TP handoffs and new iPad Chat SD-to-TP authoring stop at the fresh human boundary | Complete required registered-locale and affected-native handoff matrix remains incomplete. | Prevents QA pass. |
| T-010 | partially_done | SCN-036..038; vR2jT8 actually loaded, exact b923b7e UI bytes/manifest confirmed; all 24 Core cases inventoried | Actual all-gate/locale native rendering/accessibility/affected-surface matrix remains incomplete. | Prevents QA pass. |
| T-011 | partially_done | SCN-039..043/060/065; exact native post-approval retirement and handoff; actual iPad complete reading, discussion, later same-material formula and automatic TP authoring | Actual permission denial, undecided graceful host close and remaining native locale/keyboard/layout/replacement observations are incomplete. | Prevents QA pass. |
| T-012 | partially_done | SCN-044..045; existing ordered review/sole QA ownership retained; fresh coverage review here | Whole-run pass still lacks applicable native/host/corpus proof. | Prevents QA pass. |
| T-013 | partially_done | SCN-046..053/068; prior exact source/process coverage retained | Required current native qualification and complete affected-surface/whole-flow evidence are incomplete. | Prevents QA pass. |
| T-014 | fully_done | SCN-054..055; exact prior automated/process logs retained | None within its automated/source-process scope. | No native qualification inferred. |
| T-015 | partially_done | SCN-056..057; guarded incomplete/foreign qualification negatives retained | Actual matched production qualification publication is absent. | Prevents QA pass. |
| T-016 | partially_done | SCN-058..059/061..062/076/078; actual unconfirmed-display full Chat on iPad and inert discussion/later deliberate SD approval; all-gate exact archives | Confirmed qualified native companion and remaining all-human-gate/locale/surface variants need actual observation. | Prevents QA pass. |
| T-017 | partially_done | SCN-063..064; shared projection/browser evidence retained; complete iPad Chat access and fresh actor/next-step binding observed | Whole list/detail/document-return/native-or-Chat traversal, selection/focus and affected-view native comparison remain incomplete. | Prevents QA pass. |
| T-018 | partially_done | SCN-066..067; all twelve families inventoried and bounded comparison retained | Exact matched baseline/current full transition corpus and real model workflow counters are absent. | Prevents QA pass. |
| T-019 | fully_done | SCN-069..075; exact prior expanded-revision/immutability process logs retained | None within its automated/source-process scope. | No native qualification inferred. |

## Summary
- fully_done: 8 of 19 within their source/automated/process obligations.
- partially_done: 11 of 19; no task is upgraded solely from Core preparation or readable Chat.
- evidence_strength: high for exact automated/receipt observations; human-reported iPad reading/decision; bounded current German native observations; incomplete whole native/host/corpus qualification.
- out_of_scope_changes: three previously observed concurrent docs/architecture link/index changes remain excluded from this repair; no new implementation or main gate change was made during the iPad tests.
- required_next_step: complete the remaining actual native/host/cross-view observations and matched comparison obligation through the existing evidence owners; do not repeat the successful German iPad discussion/formula sequence.

## UX Intent Fidelity
| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-016..020 | Exact document, discussion, single approval and automatic continuation | T-009/T-011/T-016 | Actual bound German iPad inert question, complete SD reading, later exact reply and automatic recorded TP; native German retirement/handoff retained; broader locale/native matrix incomplete | partial | evidence_gap |
| AC-025..027 | Native/Chat/iPad and affected-view states | T-010/T-011/T-015..018 | Actual complete private iPad Chat with unconfirmed-native full-card selection; whole list/detail/native/registered-locale comparison incomplete | partial | evidence_gap |

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TP24-NATIVE | evidence_gap | evidence_obligation | open | Current vR2jT8 is loaded and all 24 Core preparations inventoried; German native handoff/retirement retained; current all-gate/locale/accessibility/affected-surface matrix is incomplete | Complete the remaining exact native observation matrix without redoing fulfilled Chat/Core checks. |
| TP24-REMOTE | evidence_gap | evidence_obligation | open | Actual German iPad complete document/discussion/later exact formula is fulfilled in IPAD_DISCUSSION_APPROVAL_39.md; SCN-058/063 broader actual surface/display/return traversal remains partial | Complete the remaining matched surface/display/return observations on the actual devices while retaining the fulfilled German Chat sequence. |
| TP24-HOST | evidence_gap | evidence_obligation | open | No actual permission-denial event or undecided graceful native close-before-disconnect; approved-and-handed-off retirement and natural expiry remain separate positive evidence | Obtain the required actual host permission/lifecycle observations or retain their exact external qualification gap. |
| TP24-CORPUS | evidence_gap | evidence_obligation | open | RENEWED_FLOW_COMPARISON.json remains bounded/non-pass with null model metrics; exact historical before bytes/traces are not fully retained | Execute the matched reproducible baseline/current corpus with real traces, or keep the exact missing-baseline obligation open. |

## Knowledge Persistence
- memory_target: scope_artifact
- memory_reason: Exact scenario observations and remaining qualification gaps belong to this Run.
- memory_refs: evidence/renewed-tp-15/SCENARIO_EVIDENCE_24.json; evidence/renewed-tp-15/remaining-qa-34/IPAD_DISCUSSION_APPROVAL_39.md; evidence/renewed-tp-15/remaining-qa-34/MATRIX_PREFLIGHT_38.json
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing source/approval/evidence owners retained; no graph node or new SoT authority created.
