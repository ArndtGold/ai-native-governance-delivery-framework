# QA Gate

## Quality Readiness (derived; non-authorizing)

| Dimension | Evidence owner | Outcome |
|---|---|---|
| Plan coverage | task-plan-review | revise — T-007/SCN-026 and AC-007 lack fresh current native evidence; TASK_PLAN_REVIEW.md BSC-NATIVE-001 |
| Solution integrity | clean-implementation-review | pass — existing Core/transaction/read owners, bounded documented compatibility |
| Code quality | code-review | pass — inspected baseline-separated production increment and affected regressions |
| QA decision | qa-gate — sole decision owner | revise — BSC-UI-002 is corrected and reviewed; applicable native evidence obligation remains open |

## Decision

- decision: revise
- run_id: backlog-status-flow-clarity-20261009-01
- assessed_revision_id: d105b24f-4f0e-4e71-b951-df5991ae2e3d
- reviewer: Codex agent; cooperative evidence-based assessment, not independent human acceptance
- evidence: Approved UR/PRD/SD/TP and their exact source bindings; BROWNFIELD_ANALYSIS.md; recorded CD_TESTS.md and CR pass; TASK_PLAN_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; evidence/IMPLEMENTATION.patch, SOURCE_DIGESTS.json, VERIFICATION.md and referenced concrete test/visual/protocol results.
- tp_review: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/TASK_PLAN_REVIEW.md
- clean_implementation_review: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/CLEAN_IMPLEMENTATION_REVIEW.md
- code_review: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/CODE_REVIEW.md
- missing_evidence: T-007/SCN-026/AC-007: fresh supported native Cockpit observation with exact current resource/runtime/UI identity and narrow/wide compact/expanded full action/limitation, keyboard sources/selection, delayed-title downward scrolling and retry/reload. TASK_PLAN_REVIEW.md has applicable partial fidelity. Its T-009 was pending this sole QA assessment at the review timestamp; this report records that assessment, preserving the native obligation.
- risks: Current installed bundle and stale native view are distinct from the qualified prepared source. Source, HTTP/MCP simulation and Chromium do not establish native rendering. Calling this QA pass would overstate applicable UX evidence. No critical prerequisite, unauthorized scope, security defect or second SoT was found requiring a block decision instead of an evidence revise.
- required_next_step: Collect the fresh identity-bound corrected native observation sequence described in evidence/NATIVE_OBSERVATION.md, then refresh affected review evidence and rerun qa-gate.
- impact_codes: none; no additional applicable registry code identified

## Evidence assessment

The real Core state/action fixtures cover missing/revise/evidence/correction/upstream/block/pass, exact approval and closeout, valid custom action and conservative invalid-source fallback. Summary and marker input/UTF-8/source/digest/row/target/revision bounds, actual writer revisions, source changes before commit, captured recovery bytes and concurrency/foreign preservation are verified through production owners. Saved overview remains a bounded one-file read without marker-path following; selected valid immutable comparison and optional DTO compatibility are verified independently of gate authority.

All final affected Core/writer/recovery/read tests passed; obsolete generic-status expectations and initial exact payload cap failures have explicit retained final passing corrections, not suppressed checks. Eight HTTP Service cases and 134 component tests passed. Seven fixed-build Chromium interactions passed, including long complete action/source limitation and narrow/wide wrapping, keyboard sources, delayed-title scroll/query/focus and failure recovery. Typecheck/build/build:mcp and integrated transaction verification passed. Qualified prepared-source legacy/modern MCP and contract/profile/payload checks passed; final focused retest after the last source bounds uses dispatcher 6fef7236c1216be01e53febb7d63b4625414f24edb0b66ca60b3137b399b14a1 and MCP UI sha256:b3d0dbb42dae141815bca1272f0a4e9030a74ab21f51dd2415f6857595ec91da. This is prepared protocol evidence, not an activated or installed/native claim.

Task Plan Review assesses T-001–T-006 and T-008 fully_done; T-007 remains partially_done. Applicable AC-007 fidelity remains partial/evidence_gap. The mandatory reviews were executed; this QA decision completes the assessment part of T-009/SCN-034 but does not resolve the native gap. No priority-labelled task can be treated as sufficiently verified while that applicable required evidence is absent. All other reviewed scenario mappings retain their stated source/browser/protocol bounds rather than being silently generalized to host behavior.

Source inspection substantiates Brownfield fit: one Core descriptive owner; existing permission/approval policy; existing writers and journals; saved-only read list; same-snapshot selected comparison; transport/presentation validation without a second evaluator. Updated architecture and existing template document the actual final flow, old-row compatibility, skip/recovery and freshness limits. Protected baseline evidence verifies all 2174 foreign/approved sources unchanged and excludes earlier opt-out UI work. Context Graph/SoT ownership does not change. No additional upstream requirement/design/plan decision or implementation correction was identified.

## Fresh native follow-up at revision 18

The restarted native view has the exact qualified module identity recorded in evidence/native-module-identity-after-restart.json. Source disclosure and reload were observed in the narrow/wide view. Native keyboard/scroll verification is still pending, not passed. The user supplied the Run-detail screenshot and the fresh native capture reproduces “Nachweise und offene Punkte · 0” plus “Keine offenen Nachweise ausgewiesen” while the current Core work summary contains two open registered report observations. Inspection traces the upper count to evaluation.missing_evidence from RUN_STATE.md, and the lower count to normalized QA/review findings. BSC-NATIVE-001 occurs in both QA and TP Review; stable IDs are report-local, so there is no authority to infer two distinct user tasks or deduplicate globally. The surface must identify the count as report findings and disclose the source scopes without a second policy evaluator or changed gate semantics. This is a newly observed implementation gap under approved AC-002/AC-003/AC-007 and T-007, not a new requirement or reclassification of BSC-NATIVE-001. Previous review pass statements apply to their earlier inspected snapshot; affected reviews must be refreshed after correction.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| BSC-NATIVE-001 | evidence_gap | evidence_obligation | open | TASK_PLAN_REVIEW.md T-007/SCN-026/AC-007; evidence/NATIVE_OBSERVATION.md: older stale native view lacks qualified candidate resource/runtime/UI identity and current visible sequence | Collect the fresh identity-bound native observation sequence described in evidence/NATIVE_OBSERVATION.md, then refresh affected review evidence and rerun qa-gate. |
| BSC-UI-002 | implementation_gap | CD+Tests | resolved | CODE_REVIEW.md resolved row; evidence/REPORT_FINDINGS_CORRECTION.md; final source/component/browser evidence proves the approved correction; native proof remains separately open under BSC-NATIVE-001 | Retain the reviewed correction and its implementation/test evidence before final QA reassessment. |
| BSC-WRITER-003 | implementation_gap | CD+Tests | resolved | CODE_REVIEW.md resolved row and evidence/SAME_TEXT_WRITER_CORRECTION.md prove unchanged visible cells with actual typed resulting revision and captured recovery; final matching observation is checked separately | Retain the corrected implementation and test/review evidence before final QA reassessment. |

This preserves the prior review finding without reclassification or closure and adds the fresh approved-scope surface defect. It is local to this Run; the older Run's QF-001 stays untouched. Native evidence is applicable and unavailable, not not_applicable. The TP excludes installation/host configuration; any prerequisite rollout needs its own explicitly authorized scope. No QA approval is requested while revise remains; UAT, OR, installation, commit, PR and release are not authorized by this assessment.

- memory_target: scope_artifact
- memory_reason: exact Run evidence and judgment remain with their existing scope owners
- memory_refs: this report; TASK_PLAN_REVIEW.md; evidence/NATIVE_OBSERVATION.md; evidence/VERIFICATION.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: existing architecture/Core authority preserved; no global memory, graph or SoT change claimed

## Corrective progress update

This records the permitted correction progress and consumes the refreshed Code Review evidence for BSC-UI-002 without reclassification. The existing QA revise decision is retained; final QA reassessment remains pending the applicable native obligation. CD+Tests, mandatory reviews, source hashes and actual browser captures are refreshed in evidence/REPORT_FINDINGS_CORRECTION.md. BSC-NATIVE-001 is not resolved by a green build, fresh stdio or the earlier native view. The corrected UI digest requires fresh supported native observation after the already-authorized local connection update. No QA or UAT approval is requested or inferred.

## Newly observed same-text writer gap

Fresh final MCP verification detected a stale saved revision after typed QA recording. BSC-WRITER-003 is a bounded violation of approved exact-revision/update requirements, not an upstream source decision or permission change. Final readiness remains revise. Correct the existing writer before collecting dependent native qualification. The earlier UI correction remains resolved.

## Same-text correction progress update

The permitted BSC-WRITER-003 implementation/tests and affected reviews are refreshed. This consumes its resolved Code Review finding without reclassification. The existing QA revise decision is retained; BSC-NATIVE-001 remains open. Dependent native observation uses the corrected owned runtime and exact resource identity after final canonical recording. No QA/UAT approval or final readiness reassessment is inferred.
