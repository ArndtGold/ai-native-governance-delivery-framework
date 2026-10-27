# OR: Opt-in AGDF companion side panel for Claude

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: agdf-begleiter-companion-20261025-01
- related_ur: .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/UR.md
- related_prd: .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/PRD.md
- related_sd: .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/SD.md
- related_tp: .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP.md
- related_qa_report: .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/BROWNFIELD_REVIEW-input-02.md |
| PRD | approved | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/PRD.md |
| SD | approved | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/SD.md |
| TP | approved | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/agdf-begleiter-companion-20261025-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-27 · revision 53 · presentation 25d166d5-24e4-4572-bbdc-0951fbbe6820 sha256:149a6e9a99c7f5a41122d3503e61ff25c317be735aa764720d44ce28f1d089c7 |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open until this report is recorded, then completed |
| Current gate | OR |
| Allowed now | Record this report; then the operative commit/PR handoff through delivery-closeout |
| Blocked by | nothing |
| Missing approval | none |
| Next step | delivery-closeout handoff; commit, push and PR update only on the owner's explicit instruction |
| Quality outlook | Technical QA pass and UAT approved; the full repository verification of the merged tree runs in the PR CI |

## Delivered

| Item | Evidence |
|---|---|
| Opt-in AGDF companion in the Claude projection of the AGDF runtime plugin: `/agdf-companion` switches a side panel on and off; the choice, remembered selections and still pose live in the plugin data folder that uninstall removes | SD.md (SDD-01 to SDD-11); CD_TESTS.md; T-009_EVIDENCE.md |
| Four states with animated figure (läuft, wartet auf Freigabe, blockiert, fertig), one-line gate bar, origin, one-line expandable objective and localized next step; revise/block results in the Artefacts row read as blockiert | CD_TESTS.md; CODE_REVIEW.md (CR-F02); live screenshots 12 to 17 |
| Run assignment: the run changed in this session, otherwise the remembered selection, otherwise a choice among active runs only; superseded and abandoned runs are never offered | TP_REVIEW.md (TPR-F01); packages/cli/scripts/claude-companion-test.js |
| Missing control folder names the checked project folder; "läuft" without an observed turn names the next step | TP_REVIEW.md (TPR-F02); UAT_LIVE_RECHECK.md screenshots 13 and 16 |
| Observation only: the companion writes nothing but its own state file; all run files stayed byte-identical across four live desktop sessions | UAT_LIVE_RECHECK.md (Byte Identity); live/harness-ledger.json |
| AGDF core: Brownfield Analysis may initiate a bounded UR/PRD/SD/TP source revision | BROWNFIELD_ANALYSIS.md; CD_TESTS.md; packages/core/test/expanded-source-revision-test.js |
| INSTALL.md section "Optional AGDF companion panel" | T-008_EVIDENCE.md; INSTALL.md |
| Two layout corrections after QA, decided by the owner outside the AGDF process: run count and read time each on their own line, stepping buttons labelled with text | UAT_LIVE_RECHECK.md (Layout Fix Outside AGDF; screenshots 14 and 17) |
| Merge of origin/main (99aaf01b) into the branch; conflicts only in generated evidence, regenerated rather than hand-merged | UAT_LIVE_RECHECK.md (Verification); plugins/agdf/meta/copilot-payload-baseline.json; docs/compatibility/evidence/snapshot.json |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| CD+Tests mark in the gate bar and a "baut" figure animation during Brownfield Analysis, CD+Tests and CR | Owner decision 2026-10-26: keep this run unchanged | Follow-up run with its own UR after the PR |
| Gate bar following the per-mode path (quick-task runs) | New visible behaviour beyond the approved PRD | Same follow-up run |
| One brand name for all languages instead of the localized titles | Owner preference 2026-10-27; changes the approved PRD naming | Same follow-up run (UR) |
| Placeholder objective "Describe the trustworthy outcome." and English text in a folder without control state | Found in the live recheck after QA | Same follow-up run |
| Codex, Copilot, mobile and Claude Code versions other than 2.1.302 | Out of scope by owner decision (UR) or not qualified | Not planned |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| `npm run verify:ci`, all 27 stages, on the QA tree | CD_TESTS.md; QA_REPORT.md | Whole repository including the three companion suites | direct |
| Companion logic, adapter and integrity suites; native `claude plugin validate` and `claude plugin test` 3/3 on the final companion build | UAT_LIVE_RECHECK.md | Companion behaviour and both layout corrections | direct |
| Live desktop recheck with screenshots 12 to 17 and byte identity of six runs | UAT_LIVE_RECHECK.md; live/ | Visible behaviour on Claude desktop, Windows, Claude Code 2.1.302 | direct |
| Final branch tree before the merge: 23 of 27 verify:ci stages up to archives; cli-smoke, wrapper-smoke and pages not rerun after the layout corrections (owner chose a targeted check) | UAT_LIVE_RECHECK.md (Verification) | Payload, integrity, packages, compatibility | direct |
| Merged tree: build preparation, compatibility re-recorded (56 scenarios, 0 failed) and checked, 17 fast verify:ci stages, and the suites where main and this branch meet (companion, skill dispatch, control inspect, MCP lifecycle, plugin MCP runtime, control state, run revision, late source revision, interaction presentation, MCP server, core command contract and expanded source revision) | UAT_LIVE_RECHECK.md (Verification) | Interaction of main's MCP contract changes with the core revision fix | direct |
| UAT approval on the presented version | RUN_STATE.md (Approvals) | Owner acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Full verify:ci on the merged tree, including cli-smoke, wrapper-smoke and pages | warn | PR CI on Linux Node 22/24 and Windows Node 22 after the owner pushes the branch |
| Linux and macOS runs of the companion suites | warn | PR CI |
| Recorded CD+Tests, Code Review and QA still describe stepping buttons drawing ◀ ▶; the desktop draws the text labels | warn | Read together with UAT_LIVE_RECHECK.md; no re-record after UAT |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| The Claude mod API is early access; an update can change rendering or hooks | warn | Native checks per Claude Code release; documented in INSTALL.md |
| Runs revised from Brownfield Analysis need the same or a newer AGDF version on every host | warn | Mixed-version limit documented in gate-transition.md |
| The companion's own run-state reader is bound to the core only by tests | warn | Lifecycle parity test against the core reader in verify:ci |
| One earlier CLI replay in the MCP source-revision test failed once under load and was not reproducible | warn | Watch in PR CI |
| PR 36 shows merge conflicts until the merge commit is pushed | warn | Owner decides on the merge commit and push |

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
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-RUN-STATUS-CARD, CG-RUN-SCOPED-CONTROL-STATE
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: .agdf/control/CONTEXT_GRAPH.md entries claude_companion_20261027 (CG-PUBLIC-PLUGIN-DISTRIBUTION), companion_projection_20261027 (CG-RUN-STATUS-CARD) and brownfield_analysis_revision_initiator_20261025 (CG-RUN-SCOPED-CONTROL-STATE)

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Durable decisions on how the Claude companion ships and uninstalls, what it may read and show, and the new revision initiator in the core are reusable for later host and status work.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md (CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-RUN-STATUS-CARD, CG-RUN-SCOPED-CONTROL-STATE)

## Next Permissible Step

- next_allowed_action: Hand off through delivery-closeout; the merge commit, the closeout commit, the push and the PR update happen only on the owner's explicit instruction.
- required_approval: none
- forbidden_until_then: automatic commit, push, PR update, merge or release

## Approval

OR does not approve later gates. It records the next permissible step.
