# OR: AGDF Companion Chat-Run Navigation and Panel Changes of 2026-10-28

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: agdf-companion-chat-run-navigation-20261028-01
- related_ur: .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/UR.md
- related_prd: .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/PRD.md
- related_sd: .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/SD.md
- related_tp: .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/TP.md
- related_qa_report: .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/BROWNFIELD_REVIEW.md |
| UX Intent Definition | done (ready) | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/UX_INTENT_DEFINITION.md |
| PRD | approved | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/PRD.md |
| SD | approved | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/SD.md |
| TP | approved | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/agdf-companion-chat-run-navigation-20261028-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-28 · revision 21 · presentation 02f95f6e-5226-4eec-a70e-8c1c51768ed6 sha256:18f7e2fc33cd84e822044fb1790de8d5536cab02b013b0565e0263756a172b0d |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open until this report is recorded, then completed |
| Current gate | OR |
| Allowed now | Record this report; then the commit and push handoff through delivery-closeout |
| Blocked by | nothing |
| Missing approval | none |
| Next step | delivery-closeout handoff: commit and push into pull request #40 on the owner's instruction |
| Quality outlook | Technical QA pass and UAT approved; the full repository verification runs in the pull-request CI |

## Delivered

| Item | Evidence |
|---|---|
| Chat run: the last open run id that a main-loop prompt or final answer names as a whole token, ordered against the newest change in this session; subagent turns, ids inside longer ids and completed runs change nothing | SD.md (SDD-01, SDD-02); CD_TESTS.md (SCN-001 to SCN-004); live/11 |
| Browsing with "Von dir ausgewählt" and the stored selection; the stepping row under every shown run | SD.md (SDD-04); CD_TESTS.md (SCN-006); live/12 |
| Automatic return to the chat run at the next main-loop turn | SD.md (SDD-04); CD_TESTS.md (SCN-007, SCN-008); live/14 |
| "Zurück zum Chat-Run" as a plain button under the stepping row and as the first menu entry, only while browsing | SD.md (SDD-05, SDD-09); CD_TESTS.md (SCN-009, SCN-010); live/12, live/13 |
| Status line and toasts stay with the chat run while browsing | SD.md (SDD-06); CD_TESTS.md (SCN-011); CODE_REVIEW.md (CR-F02, CR-F04) |
| Waiting and building runs keep their state during a turn | SD.md (SDD-07); CD_TESTS.md (SCN-012, SCN-013); live/11, live/16 |
| Footer flush at the pane's bottom edge (body reserve 0) | SD.md (SDD-08); T-001_HOST_PROBE.md; live/10, live/15 |
| A new conversation (`/clear`, resume) starts without a chat run | CODE_REVIEW.md (CR-F03) |
| Panel changes of commits 3444befe and 2f54fbcc recorded as the delivered baseline: framed footer with icon and menu, About, run list sized to the pane, gate bars per run | SD.md (SDD-10); CD_TESTS.md (SCN-017, SCN-018); live/00 to live/04 |
| `INSTALL.md` companion section: which run it shows, browsing, return, the waiting rule and the panel of 2026-10-28 with separated evidence | CD_TESTS.md (SCN-023); CODE_REVIEW.md (CR-F10) |
| Context graph entry `companion_chat_run_navigation_20261028` in CG-RUN-STATUS-CARD | .agdf/control/CONTEXT_GRAPH.md |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| A marker of the chat run in the position line or the run list | Out of scope per TP | Later run if wanted |
| Recognition of open questions in the chat, a new hook or `tool.call` observation | UR non-goal | Not planned |
| CD+Tests mark and "baut" animation parity for the quick-task path | Follow-up named before this run | Separate follow-up run |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Host probe of the turn texts and the body reserve on the Windows desktop | T-001_HOST_PROBE.md; live/05 to live/09 | T-001 | direct |
| Companion logic, adapter and integrity suites; 12 mutation checks | CD_TESTS.md; CODE_REVIEW.md; CODE_REVIEW_VERIFICATION.md | T-002 to T-007 | direct |
| `build:prepare`, compatibility record and check (56/0), `claude plugin validate`, `claude plugin test` 6/6 on Claude Code 2.1.308 on the final tree | CODE_REVIEW_VERIFICATION.md | T-008 | direct |
| Live desktop check with screenshots `live/10` to `live/16`, 150 run states byte-identical; corrected build installed byte-identically | T-009_EVIDENCE.md; CODE_REVIEW_VERIFICATION.md | T-009 | direct |
| Independent Code Review with ten corrected findings and one owner-accepted deviation | CODE_REVIEW.md | CR | direct |
| TP Review with UX Intent Fidelity AC-001 to AC-012, Clean Implementation Review | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md | QA dimensions | direct |
| QA and UAT approvals on the presented versions | RUN_STATE.md (Approvals) | Owner acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Full `npm run verify:ci` and the Linux and macOS lanes | warn | Pull-request CI after the push |
| Live captures on the tree after the Code Review corrections | warn | None planned; native host test and the byte-identical installation cover the final tree |
| A live terminal session of the companion | warn | None planned; the native test covers the terminal tree |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| The Claude mod API is early access; an update can change turn texts, rendering or the status line | warn | Native checks per Claude Code release; documented in INSTALL.md |
| Recognition reads text, not intent: a quoted run id also counts, and a run named only between tool calls counts once the final answer or the next prompt names it | warn | Documented in INSTALL.md; the return button and the next turn correct it |
| The chat run lives in session memory only; a mod reload starts without one | warn | Documented in INSTALL.md |
| Reading `e.answer` before `next(e).text` deviates from the SDD-02 wording | warn | Owner decision 2026-10-28, recorded in CLEAN_IMPLEMENTATION_REVIEW.md and QA_REPORT.md |

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
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md entry companion_chat_run_navigation_20261028 (CG-RUN-STATUS-CARD)

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: How the companion recognizes the chat's run without a new hook, how browsing and the return work, and which host texts it reads are reusable for later companion and host work.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md (CG-RUN-STATUS-CARD)

## Next Permissible Step

- next_allowed_action: Hand off through delivery-closeout: commit the run on its branch and push it into pull request #40 when the owner instructs it; merging stays with the owner.
- required_approval: none
- forbidden_until_then: merge or release

## Approval

OR does not approve later gates. It records the next permissible step.
