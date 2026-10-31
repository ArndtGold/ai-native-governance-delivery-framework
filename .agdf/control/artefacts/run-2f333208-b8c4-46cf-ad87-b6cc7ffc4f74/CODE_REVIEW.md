# Code Review: Planned URs and backlog replacement

Decision: pass
Reviewer: Codex code-review owner; AI self-review, not independent human review
Date: 2026-10-31
Run: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74

## Code Review

- decision: pass
- findings: four concrete defects found during implementation/native/review were corrected and reverified below; no open correctness, data-integrity or security finding remains evident in reviewed scope.
- evidence: actual tracked diff and new files, approved PRD/SD/TP, current MCP authoring manifest b6d3f1ef9f4709baecf83ee5fd777626db696fc92f7b2390d08176ae46029e94 (all 14 pages), CD_TESTS.md, IMPLEMENTATION_STATUS.md, NATIVE_QUALIFICATION_REPORT.md and evidence/implementation/qa-source-snapshot-summary.json.
- missing_evidence: remote current-head CI and independent human acceptance are future merge/acceptance obligations, not claimed performed; native final-package execution is not claimed (unchanged feature proof reuse assessed below).
- risks: explicit migration capacity/refusal and retained unverified legacy history; no distributed lock/security-sandbox claim; other-host/native Windows and Desktop remain outside native qualification.
- required_next_step: complete mandatory TP/Clean evidence dimensions and the sole qa-gate assessment.

## Reviewed owners and failure paths

Reviewed planned-entry parsing/containment/CAS and create/replace recovery; handoff intent, deterministic Run publication, immutable origin/snapshot and original-UUID replay; independent mutation claims, freeze/drain and exact claim ownership; v3/v6 journal admission/legacy decode, revision/approval/output/closeout integration; migration preview byte/line accounting, source manifest, closed recovery journal, Run locks and commit/rollback; derived inventory and snapshot-bound passive UI/session projections; pre-Run command/material scopes, schema parity, shared result classification and optional package/install ownership. Reviewed affected tests and generated/package/CI registration. Existing prerequisite PRD-routing repair is retained, not silently folded into a new product decision.

The new-layout path does not lock or recreate the backlog. Same-resource revision and source bindings remain exact. Legacy branches retain old transaction schemas and shared projection until explicit cutover. Unknown claims/foreign bytes remain unrepaired. Planning material accepts only UR and exact planning identity, without Run/revision fields; handoff does not confer UR approval. Optional package has no runtime/server/template and native observations demonstrate actual Core delegation. Core and UI ownership remain shared rather than adapter-specific saved state.

## Post-CD review correction and evidence applicability

CR-004 was found after the initial CD+Tests record: a self-consistent replacement migration report could escape the confirmed marker, including its Run lock set. Production validateIntent now binds marker operation/request/preview/config and validates safe unique bounded Run IDs, captured source digest/revision/version/lifecycle and complete lock membership before any Run lock/archive. The new regression had 2/4 failures against the original implementation; all 17 migration cases pass after correction, including preserved tampered bytes/marker, no foreign lock/archive, and recovery after exact fixture restoration. Process/version 10/10, assembled actual STDIO 2/2, package 1538 files, generation/assembly and compatibility 56/56 plus freshness pass. Logs: journal-binding-before.log, journal-binding-after.log, journal-boundaries.log, review-stdio.log, review-package.log, review-generation.log, review-assembly.log, review-compatibility.log and review-compatibility-check.log.

Final package source a679e02c1b680ba3d6c0eb82a0d2e80b1917d6d8f42a205662cba99a782fb95f is distinct from actual native-tested 826ca9884801. native-final-applicability.json compares all candidate files and generated-worker AST: only migration validateIntent changed in the worker (899 bytes); canonical migration owner adds 1059 bytes. Other changes are generated provenance/version stamps and reviewed payload metadata. Exercised UR/authoring/material/schema/read/handoff/status/replay/direct-Run paths and optional package remain unchanged. Reuse those exact native feature observations under TP's affected-proof rule; do not relabel them as a fresh installation or native migration proof. Final candidate metadata explicitly keeps native_qualified false. No completed native case was redundantly repeated after this unrelated guard change. The measured payload increase is accounted through the existing budget owner, not an unexplained timeout/assertion relaxation.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | Native planned-entry tool_result_invalid; existing MCP classifier and Inspect availability fixed. Actual old-runtime STDIO 0/2 reproduction, corrected 2/2 with stale/unreadable negatives; both native feature configurations pass. native-read-regression-before.log, native-read-regression-after.log, native traces | none |
| CR-002 | implementation_gap | CD+Tests | resolved | Verified Change misclassified active own admission claims as foreign. Exact owner-byte filtering only; 8/8 targeted regression including real Git and foreign claim preservation in verified-change.log | none |
| CR-003 | implementation_gap | CD+Tests | resolved | Duplicate UI close after confirmed handoff fixed by completed-view guard; visibility regression and actual browser/Core cases pass in browser-final-candidate.log and decision-entry tests | none |
| CR-004 | implementation_gap | CD+Tests | resolved | Migration journal/marker and closed Run lock-set gap reproduced (2/4 fail), fixed in planned-layout.validateIntent, 17/17 migration and 10/10 boundaries pass; tampered bytes retained and no foreign lock/archive. journal-binding-before.log, journal-binding-after.log, journal-boundaries.log | none |

## Knowledge and boundaries

- memory_target: context_graph
- memory_reason: existing inventory/closure nodes now describe verified new ownership and legacy boundaries
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; run_inventory_20261030; run_closure_20261029
- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: two existing nodes updated; IMPLEMENTATION_STATUS.md and actual source/tests support them

No approval, actual repository cutover, permanent installation, VCS action or release follows from this review. CONTRIBUTING.md and GOVERNANCE.md retain maintainer authority. This report assesses code quality only; qa-gate remains the sole final QA decision owner.
