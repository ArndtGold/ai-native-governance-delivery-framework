# OR: AGDF Companion follow-up: build phase, mode paths, notifications and status line

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: agdf-companion-followup-20261027-01
- related_ur: .agdf/control/artefacts/agdf-companion-followup-20261027-01/UR.md
- related_prd: .agdf/control/artefacts/agdf-companion-followup-20261027-01/PRD.md
- related_sd: .agdf/control/artefacts/agdf-companion-followup-20261027-01/SD.md
- related_tp: .agdf/control/artefacts/agdf-companion-followup-20261027-01/TP.md
- related_qa_report: .agdf/control/artefacts/agdf-companion-followup-20261027-01/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/agdf-companion-followup-20261027-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/agdf-companion-followup-20261027-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/artefacts/agdf-companion-followup-20261027-01/BROWNFIELD_REVIEW.md |
| UX Intent Definition | done (ready) | .agdf/control/artefacts/agdf-companion-followup-20261027-01/UX_INTENT_DEFINITION.md |
| PRD | approved | .agdf/control/artefacts/agdf-companion-followup-20261027-01/PRD.md |
| SD | approved | .agdf/control/artefacts/agdf-companion-followup-20261027-01/SD.md |
| TP | approved | .agdf/control/artefacts/agdf-companion-followup-20261027-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/agdf-companion-followup-20261027-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/agdf-companion-followup-20261027-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/agdf-companion-followup-20261027-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/agdf-companion-followup-20261027-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-28 · revision 20 · presentation 93284533-8cbb-4792-a65c-0ef231bdbd4c sha256:bbb66c007d78c21dc7f58c2019a59a5f9eccef49d6b18a80e968dc3ca2e29037 |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open until this report is recorded, then completed |
| Current gate | OR |
| Allowed now | Record this report; then the commit and pull-request handoff through delivery-closeout |
| Blocked by | nothing |
| Missing approval | none |
| Next step | delivery-closeout handoff; commit, push and pull request as instructed by the owner's task (pull request open) |
| Quality outlook | Technical QA pass and UAT approved; the full repository verification runs in the pull-request CI |

## Delivered

| Item | Evidence |
|---|---|
| `CD+Tests` mark between TP and QA on structured paths: current during Brownfield Analysis, CD+Tests and CR, done from QA on | SD.md (SDD-02); CD_TESTS.md (SCN-001, SCN-002); live/04 |
| Build state „baut“ with a hammer-and-bricks figure inside the accessory region, still pose and terminal face `(o_o) ⚒`; kept during turns; „wartet“ and „blockiert“ take precedence | SD.md (SDD-03, SDD-04); CD_TESTS.md (SCN-003 to SCN-005); live/04 |
| Gate bar per Mode/Slice Decision equal to the status card's path and marks (structured, verified change, quick task, block, undecided) | SD.md (SDD-01, SDD-02); CD_TESTS.md (SCN-006, SCN-007); live/06, live/10 |
| One toast per transition of the shown run into or within „wartet auf Freigabe“ and „blockiert“; optional soft chime only with a shown toast; switches „Meldung aus/an“ and „Ton an/aus“ (toast on, sound off by default) persisted in `companion-state.json` | SD.md (SDD-05, SDD-06, SDD-09, SDD-10); CODE_REVIEW.md (CR-F01, CR-F02); live/05, live/03 |
| Status line `AGDF · {gate} · {state}` from the run-derived state, also with the panel closed, set again after every read, cleared on switch-off | SD.md (SDD-07, SDD-08); T-009_EVIDENCE.md (LT-F01); CODE_REVIEW.md (CR-F03, CR-F06); live/09 |
| One brand „AGDF Companion“ in every language, command `/agdf-companion` unchanged | SD.md (SDD-10); live/03; INSTALL.md |
| Template placeholder objectives hidden; language fallback to Claude's `language` setting without AGDF config | SD.md (SDD-11); live/07 |
| Failure isolation of the new host channels; one new module `notice.mjs` in the runtime integrity file list | SD.md (SDD-12); CD_TESTS.md (SCN-023, SCN-024) |
| `INSTALL.md` companion section with behaviour, switches, limits and the live evidence of 2026-10-27 | T-007_T-008_EVIDENCE.md; INSTALL.md |
| Context graph entry `companion_followup_20261028` in CG-RUN-STATUS-CARD | .agdf/control/CONTEXT_GRAPH.md |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Run timeline, recognition of long checks such as `verify:ci`, cleanup hint for long-untouched runs, completion animation at OR | Owner decision 2026-10-26/27: later candidates, not in this run | Later run with its own UR |
| CD+Tests mark in the core status card | UR non-goal: a core change for all hosts | Separate core run if wanted |
| Native operating-system notifications and spoken output | UR non-goal | Not planned |
| A shorter gate-bar mark for the default panel width | Owner accepted the condensed form at UAT (LT-O01) | Not planned |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Host probe of toast, status line, language setting and audio on the Windows desktop | T-001_HOST_PROBE.md; live/01, live/02 | T-001 | direct |
| Companion logic, adapter and integrity suites; seven mutation checks | T-002_T-006_EVIDENCE.md; CODE_REVIEW.md; CODE_REVIEW_VERIFICATION.md | T-002 to T-006 | direct |
| `build:prepare`, compatibility record and check (56/0), Windows CI lanes with the companion suites on the final tree | T-007_T-008_EVIDENCE.md; CODE_REVIEW_VERIFICATION.md | T-007 | direct |
| `claude plugin validate` and `claude plugin test` 5/5 on Claude Code 2.1.302 | T-009_EVIDENCE.md; CODE_REVIEW_VERIFICATION.md | T-009 native | direct |
| Live desktop session with screenshots `live/00` to `live/10` and byte identity of the read run states; installed branch build byte-identical to the generated plugin | T-009_EVIDENCE.md; CODE_REVIEW_VERIFICATION.md | T-009 live | direct |
| Independent Code Review with five corrected findings and one owner-accepted deviation | CODE_REVIEW.md | CR | direct |
| TP Review with UX Intent Fidelity AC-001 to AC-012, Clean Implementation Review | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md | QA dimensions | direct |
| QA and UAT approvals on the presented versions | RUN_STATE.md (Approvals) | Owner acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Full `npm run verify:ci` and the Linux and macOS lanes | warn | Pull-request CI after the push |
| The companion's chime heard live; the status line at the start of an idle session after the LT-F01 fix observed live | warn | None planned; Windows plays no clip and the owner waived the re-check |
| A live terminal session of the companion | warn | None planned; the native test covers the terminal tree |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| The Claude mod API is early access; an update can change rendering, toasts or the status line | warn | Native checks per Claude Code release; documented in INSTALL.md |
| The companion mirrors three core rules it cannot import | warn | Parity tests against the core in the companion suite |
| The status line relies on being set after every read because the desktop drops the first set | warn | Documented deviation from SDD-07; adapter and native tests |
| Completed historical runs can show OR done where the status card waits for its completion check | warn | Deliberate SDD-02 simplification; documented in CODE_REVIEW.md |

## Parent Reconciliation Handoff

Optional evaluated projection. Keep Child delivery status separate.

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: The Artefact Chain declares no reconciles_with parent relationship.
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

Optional Parent/programme projection. It is evidence, not approval.

- startable: false
- final_ready: false
- acceptance_ref: not applicable; this run is no programme run
- evidence: No Aggregate includes rows exist for this run.
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-RUN-STATUS-CARD
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md entry companion_followup_20261028 (CG-RUN-STATUS-CARD)

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: How the companion mirrors the status-card path, what it announces outside the pane and which host behaviours it works around are reusable for later status and host work.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md (CG-RUN-STATUS-CARD)

## Next Permissible Step

- next_allowed_action: Hand off through delivery-closeout: commit the run on its branch, push it and open the pull request, as the owner's task for this run requires; merging stays with the owner.
- required_approval: none
- forbidden_until_then: merge or release

## Approval

OR does not approve later gates. It records the next permissible step.
