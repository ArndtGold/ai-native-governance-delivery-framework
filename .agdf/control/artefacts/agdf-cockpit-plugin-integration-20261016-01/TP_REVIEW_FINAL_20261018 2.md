# Task Plan Review: Cockpit plugin integration

Decision: revise
Reviewer: Codex
Date: 2026-10-18
run_id: agdf-cockpit-plugin-integration-20261016-01
source_revision: b9a2eab9-4f1f-46ca-acc3-94bfaa16080f

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | Preserved source/control baseline and isolated snapshot in SDK instrumentation evidence; actual Host/config/provenance inventories | none for preparation | high confidence |
| T-002 | fully_done | Core contract/session implementation reviewed in CODE_REVIEW_SOURCE; automated target/selector/quota/context ownership scenarios and actual bound native session | Cross-host production generalization not claimed | high confidence in scoped implementation |
| T-003 | fully_done | Launcher/facade/generation implementation; native provider UUID/module and public context/close trace; regular governance record operations | Broader native Decision coexistence is retained under T-008 | high confidence |
| T-004 | fully_done | Normal generated/installed stable/cache/runtime tuple; exact UI digest; profile/package checks and reviewed measured payload budget | none for recorded package snapshots | high confidence |
| T-005 | fully_done | Actual project-scoped inventory defect repaired; 12 probe/config regressions, plugin MCP suite, lifecycle suite; guard accepts qualified record and retires exact distinct-key Legacy; config preservation and rollback marker | Post-retirement Desktop reload is covered as T-008 evidence limit | high confidence |
| T-006 | fully_done | Context/freshness and closure repairs, 259 UI cases, actual correct-target PRD/context journey and human final-card confirmation | Broader native negative-state rendering not fully observed | high confidence in tested UI; limits in T-008 |
| T-007 | fully_done | Historical complete 26-stage isolated repository lane and 45-browser pass; subsequent impacted UI/protocol/build/CLI suites passed and exact candidates retained | No new full-lane pass against every later delta is claimed | high for impacted tests; historical full-lane provenance explicit |
| T-008 | partially_done | Actual installed replacement render/read/Host-confirmed context/invalidation/close/teardown; guarded migration; fresh project CLI only replacement connected; isolated CLI lifecycle and same-key scenarios | Complete final native clean/same-key/destructive lifecycle/Decision coexistence and post-cutover Desktop reload evidence are not all observed | medium evidence-only gap CPI-E01; user accepts existing evidence without another restart |
| T-009 | fully_done | Updated architecture/host compatibility docs and complete indexed run evidence, registered CD+Tests/CR, explicit missing-evidence handoff | Release/OR is outside this review's completed handoff claim | medium confidence; no release-ready assertion |

## Summary

- fully_done: 8
- partially_done: 1
- not_done: 0
- out_of_scope_changes: Other Runs' control artefacts are excluded. The user-authorized same-byte runtime replacement is bounded recovery of a stranded lock, not a product contract change.
- risks: Existing native qualification limits remain; no concrete uncorrected implementation defect is identified. Priorities are not invented where the approved TP supplies task IDs without a P0/P1 field.
- required_next_step: qa-gate evaluates the explicit medium evidence-only deviation proposal for bounded internal use, without another Desktop test loop.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | Normal plugin setup and clean opening | T-004/T-008 | Actual installed plugin/native opening; clean CLI setup, incomplete clean native lane | partial | evidence_gap |
| AC-002 | Checked project and explicit Run | T-002/T-006 | Actual native selected target/Run/PRD and Host-confirmed context | fulfilled | none |
| AC-003 | Governance and Cockpit offering coexist | T-003/T-008 | Actual regular AGDF record calls and distinct plugin Cockpit route; final native Decision coexistence not separately completed | partial | evidence_gap |
| AC-004 | Owned Legacy transition | T-005/T-008 | Actual guarded retirement, preserved original config, fresh CLI replacement only; no post-cutover Desktop reload | partial | evidence_gap |
| AC-005 | Foreign/conflicting origin preservation | T-005 | Actual failed partial transition preserved bytes; full project origin inventory, exact owner preservation and negative regression cases | fulfilled | none |
| AC-006 | Plugin update/disable/remove | T-004/T-008 | Actual isolated CLI lifecycle readback; complete final native destructive lifecycle not performed | partial | evidence_gap |
| AC-007 | Failure/unsupported/recovery presentation | T-006/T-008 | Observed discovery/context/close recovery plus tested UI states; not every negative mode observed natively | partial | evidence_gap |
| AC-008 | Honest qualification and documentation | T-009 | Source/package/install/native/CLI boundaries and user accepted limits visible in durable reports | fulfilled | none |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CPI-E01 | evidence_gap | evidence_obligation | open | T-008 and partial UX rows above; native replacement journey and fresh CLI migration result exist, but broader native production qualification is incomplete | QA prepares one medium evidence-only deviation proposal for bounded internal use under the user's no-restart constraint |

The direct user acceptance is not a fabricated missing test or QA approval. No native qualification or technical QA pass follows from this report.

## Context Graph

- memory_target: scope_artifact
- memory_reason: Run-specific task/evidence qualification.
- memory_refs: TP.md; CD_TESTS.md; USER_EVIDENCE_ACCEPTANCE_20261018.md
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
