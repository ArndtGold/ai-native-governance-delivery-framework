# OR: Companion core in Core: host-neutral run view, MCP events and figure states

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: run-d2818184-27fc-40ae-9195-70d080d3e926
- related_ur: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/UR.md
- related_prd: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/PRD.md
- related_sd: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md
- related_tp: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md
- related_qa_report: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/UR.md |
| Brownfield Review | done | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/BROWNFIELD_REVIEW.md |
| UX Intent Definition | done (ready) | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/UX_INTENT_DEFINITION.md |
| PRD | approved | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/PRD.md |
| SD | approved | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md |
| TP | approved | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP.md |
| Brownfield Analysis | done | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/CD_TESTS.md |
| CR | done | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/CODE_REVIEW.md |
| TP Review | done (pass) | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/TP_REVIEW.md |
| Clean Implementation Review | done (pass) | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/CLEAN_IMPLEMENTATION_REVIEW.md |
| QA | approved | .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-11-07 · presentation e796cb2d-f5d2-4763-998b-4d6a58aa40a1 sha256:2820d961658cd4d629ae14e3ee28a80ddeb387544b2af121011a6e64d9eeb47e |

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | open until this report is recorded, then completed |
| Current gate | OR |
| Allowed now | Record this report; then the commit and pull-request handoff through delivery-closeout on the owner's instruction |
| Blocked by | nothing |
| Missing approval | none |
| Next step | delivery-closeout handoff: commit the branch feat/companion-core-run-view with the run folder and open a pull request on the owner's instruction |
| Quality outlook | Technical QA pass, UAT approved; the full packages/mcp-server suite and PR CI run before merge |

## Delivered

| Item | Evidence |
|---|---|
| Host-neutral Core run view projected from the unchanged evaluateGateCheck report inside captured control snapshots, with store and per-run diagnosis (including the run-folder count of an unsupported store) and figure states | SD.md (SDD-001 to SDD-004); CD_TESTS.md; TP_REVIEW.md (T-002, T-004, T-005) |
| Read-only runtime command run-view with the optional run selector and schema run-view/1 | CD_TESTS.md (T-003); TP_REVIEW.md (SCN-002) |
| Event model companion-event/1, journaled once by the executing MCP process at the final result projection, with review facts and drift warnings for bound run documents | SD.md (SDD-005 to SDD-008); CD_TESTS.md (T-007 to T-009) |
| Claude companion rebuilt on the run view and the journal without any Core import, loadable by the desktop host, with event and notice texts that name a run only where needed | CD_TESTS.md (T-006, T-010, T-014, T-015); CODE_REVIEW.md (NC-F1, DR-01, DR-02) |
| Host-neutral harness, generated assets, payload and compatibility record | CD_TESTS.md (T-011, T-012) |
| Native check in the Claude desktop app on Windows 11 with screenshots, measured refresh and run-view times and the legacy store showing 189 unreadable runs with their reason | evidence/T-013-NATIVE_CHECK-02.md; evidence/T-013-native-check |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Wording points F4 of the native check: events-unavailable hint before the first journal entry, a dash for unknown bytes, the raw reason code stale_revision, the singular form of the run count | Cosmetic, outside the approved TP revision | Separate follow-up run |
| Codex UI and event consumption, run-view exposure through agdf_inspect | UR non-goal and TP out of scope | Separate Codex run |
| Drift detection of a recording's input file after recording | PRD decision P5 | Later run that persists the declared input path |
| Re-qualification of the Claude CLI and Codex hosts | TP native evidence scope | Next release qualification |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approved sources after the TP source revision of 2026-11-07 | PRD.md, SD.md, TP.md; evidence/TP-revision-proposal-02.json | UR, PRD, SD, TP | direct |
| Implementation and targeted verification with red checks | CD_TESTS.md | T-001 to T-015 | direct |
| Code Review with independent reviewers and an independent delta review | CODE_REVIEW.md | CR | direct |
| TP Review with UX Intent Fidelity AC-001 to AC-010 and Clean Implementation Review | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md | QA dimensions | direct |
| Native desktop check with 15 screenshots and measured latencies | evidence/T-013-NATIVE_CHECK-02.md | T-013, SCN-005, AC-002 live check | direct |
| QA and UAT approvals on the presented versions | RUN_STATE.md (Approvals) | Owner acceptance | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Full npm run verify:ci with the Linux and macOS lanes and the full packages/mcp-server suite | warn | Pull-request CI after the owner's commit and push |
| Native evidence beyond the Claude desktop app on Windows 11 | warn | Next release qualification |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| A run-view call costs 1.2 to 2.8 s per refresh on the measured stores | warn | Owner accepted (C2); calls happen only on change |
| The desktop app draws plugin toasts only in its main window | warn | Host behavior, documented in the TP known limits |
| The Claude mod API is early access; a host update can change the module rule or rendering | warn | Parser-based host checks and claude plugin validate in the companion tests; native checks per release |
| Code, run folder and evidence are uncommitted on the branch | warn | delivery-closeout handoff on the owner's instruction |

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

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: The Brownfield Review and both Brownfield Analyses found no curated Context Graph node that owns the companion, the run view or run discovery; the SD integration points carry the ownership.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: The run view, the event model, the host module rule for Claude mods and the native-check method are documented in this run's approved SD, TP and evidence, which later companion and Codex runs reuse.
- memory_refs: .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/documents/SD.md; .agdf/control/runs/run-d2818184-27fc-40ae-9195-70d080d3e926/evidence/T-013-NATIVE_CHECK-02.md

## Next Permissible Step

- next_allowed_action: Hand off through delivery-closeout: commit the branch feat/companion-core-run-view with the run folder and open a pull request when the owner instructs it; merging stays with the owner after PR CI.
- required_approval: none
- forbidden_until_then: merge or release

## Approval

OR does not approve later gates. It records the next permissible step.
