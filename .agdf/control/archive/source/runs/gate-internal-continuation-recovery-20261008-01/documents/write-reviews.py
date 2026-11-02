from pathlib import Path
import json,datetime
b=Path('.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01')
c=json.loads((b/'CANDIDATE-01.json').read_text())
common=f"- assessed_at: {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n- run: gate-internal-continuation-recovery-20261008-01\n- candidate: {c['candidate']['codex_install_version']}\n- runtime_digest: {c['candidate']['runtime_digest']}\n- reviewer: Codex; same-agent review, no independent reviewer claimed\n- context_graph_impact: none\n- context_graph_reconciliation: not_applicable\n- memory_target: scope_artifact\n- memory_reason: bounded run-specific evidence; canonical source ownership unchanged\n"
gap='''## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_NATIVE-01.md: actual N-001 through N-008 candidate/session, agent correction/stop, native rendering and prompt ledger absent | Execute QUALIFICATION_PLAN-01.md after separate installation/connection authorization and record the actual observations |
'''
(b/'CODE_REVIEW.md').write_text('# Code Review\n\n- decision: pass\n'+common+'''
- evidence: actual diff/new files and affected neighbors in Core readiness, contained file/seal readers, controlled-read seam, canonical runtime resource reader, dispatcher phase helpers, renderer/locales/contracts and existing CLI/Core tests; CHECKS-01.json C001-C019; prepared-fixture-protocol.json
- findings: no remaining actionable source defect identified in the scoped final candidate
- missing_evidence: actual native host qualification is explicitly outside this source-diff pass and prevents overall QA pass
- risks: same-agent review; actual model behavior cannot be inferred from scripted calls; normative contract table format is a declared dependency and fails closed if unavailable
- required_next_step: have qa-gate assess the complete reviews and outstanding native evidence obligation

The review checked actual control flow, not only task intent. Source facts use the existing contained-file/digest readers and immutable controlled-read seam. Ready UX bytes alone do not satisfy canonical registration. PRD readiness and dispatch share those facts; SD diagnoses cannot correct analytical input behind an approved PRD. Existing source-analysis reassessment takes precedence. No new public phase/input/schema/approval value is added.

The QA consumer reads the sole quality.md route table from the existing trusted runtime-resource owner, while reports use the captured data-reader. C019 proves that boundary: captured QA bytes remain fixed after live mutation and unrelated data access stays denied. QA decision, current sources, complete implementation/review state, normalized headers/values and contained report references fail closed. Source-sensitive findings stop dependent implementation. Evidence routes forbid code. Report excerpts are quoted data, not instructions/authority.

Checks cover unknown/conflicting/missing normalized inputs, duplicate/second headers, unsafe/absent review references, explicit block, resolved rows with a remaining revise decision, foreign/stale authority and unchanged read-only path inventories/bytes. The implementation fixture repairs a real failing approved filter assertion, refreshes evidence and reevaluates canonically. Follow-up keeps revise non-approvable.

Renderer changes retain the single localization owner, exact Approval transport and registered locale validation. Explicit inspection uses a next-permitted-action label; only actual continue disposition uses the working label. Negative render fixtures use valid localized control actions. Earlier review findings (unrecorded ready UX, SD correction boundary, source-reassessment precedence, report references and captured runtime-contract access) were fixed and affected checks rerun before this pass.

Unrelated dirty cockpit changes listed in BASELINE-01.json were preserved. Shared payload baseline records the exact generated growth and existing rationale; no headroom or policy threshold was introduced. The unrelated payload CLI root defect was attributed, not included as a hidden repair. Full smoke was not rerun; the TP-named focused suites and runtime/package checks were completed.
''')
(b/'CLEAN_IMPLEMENTATION_REVIEW.md').write_text('# Clean Implementation Review\n\n- decision: revise\n'+common+'''
- primary_solution: shared Core source facts and one Core normalized-finding consumer, consumed by existing gate evaluation/dispatch; the existing renderer and shared interaction contract own wording/execution behavior
- evidence: CODE_REVIEW.md; CHECKS-01.json; EVIDENCE_SOURCE-01.md; EVIDENCE_PROTECTION-01.md; EVIDENCE_BUILD-01.md
- fallbacks_retained: existing unknown-locale English fallback; existing terminal safety for explicit blocked, unsafe sources, invalid binding and unknown normalized findings; no speculative recovery fallback
- workaround_or_shim_risk: no runtime shim or persistent retry store; one-correction limit is an instruction boundary, so actual model compliance is still unobserved
- parallel_structure_risk: no second normative route table, parser in dispatcher, renderer, source of truth, installer or gate; diagnostic condition vocabulary is local fact output, not a replacement quality taxonomy
- brownfield_fit: source facts share existing fs/containment/seal ownership; trusted runtime contract and captured data paths remain distinct; existing source-revision, late-source-recovery and canonical recording owners retain precedence
- exit_criteria: approved TP implementation plus affected checks/reviews and complete actual native obligations; no gap may be hidden by green source/build tests
- missing_evidence: required actual N-001 through N-008 observations, loaded candidate match and native model/rendered behavior
- required_next_step: execute the complete prepared qualification sequence after separately authorized installation/connection

The structural solution is integrated and compatible with approved SD. Generated runtime/resources and the marketplace snapshot came from existing build/provenance owners. Two older loaded bindings are recorded separately from the final candidate; prepared package/protocol checks do not certify either native connection. This review remains revise because the approved solution includes an actual host qualification obligation, not because a new architecture decision is needed.

'''+gap)
tasks=[
('T-001','partially_done','BROWNFIELD_ANALYSIS.md; BASELINE-01.json; baseline-prd.log; baseline-comparison.json','Other baseline source comparisons reconstructed after edits from verified captured pre-edit bytes; no historical host timing','Do not claim pre-edit full-chain timing'),
('T-002','fully_done','definition-sources.js; C002/C003/C012; EVIDENCE_SOURCE-01.md','none','Source-level fulfilled'),
('T-003','fully_done','qa-follow-up.js; C007/C013/C019; EVIDENCE_CHAINS-01.md','none','Source-level fulfilled'),
('T-004','fully_done','interaction.md and existing skill references; C004/C005/C015','Actual model compliance tracked under T008','Instruction/source-level fulfilled'),
('T-005','fully_done','interaction-presentation.js and locale registry; C008/C009/C010; EVIDENCE_LOCALES-01.md','Native displayed readability tracked under T008','Renderer-level fulfilled'),
('T-006','partially_done','C002-C014/C019; packaged canonical chains; source-comparison and locale ledgers','Actual model unchanged-stop, interruption and prompt ledger not observed','Native observation required'),
('T-007','fully_done','C001/C015-C018; CANDIDATE-01.json; nine prepared fixtures and QUALIFICATION_PLAN-01.md','none','Candidate/sequence prepared before external handoff'),
('T-008','partially_done','EVIDENCE_NATIVE-01.md explicit gap; candidate identity; entire isolated sequence prepared','No fresh actual native candidate session N001-N008','Prevents overall QA pass'),
('T-009','partially_done','CD_TESTS.md; CODE_REVIEW.md; this review; CLEAN_IMPLEMENTATION_REVIEW.md','Native proof/reassessment remains; QA alone records current decision','No Approval: QA from revise')]
text='# Task Plan Review\n\n- decision: revise\n'+common+'\n## TP Coverage\n\n| task_id | status | evidence | missing_evidence | QA impact |\n|---|---|---|---|---|\n'+'\n'.join('| '+' | '.join(x)+' |' for x in tasks)
text+='''

## Summary

- fully_done: 5 of 9 (T002,T003,T004,T005,T007)
- partially_done: 4 of 9 (T001,T006,T008,T009)
- not_done: 0; required actual native observations themselves remain not performed
- out_of_scope_changes: none introduced; unrelated pre-existing cockpit/UI/projection deltas preserved
- risks: baseline historical observation cannot be recreated; source comparison is limited to verified reconstructed bytes; same-agent review; native behavior unavailable
- required_next_step: execute QUALIFICATION_PLAN-01.md after separate installation/connection authorization, then refresh affected reviews and qa-gate

The pre-edit baseline capture and original PRD reproduction happened before changes. Other failure comparisons were executed later against exact verified pre-edit source bytes. This is a disclosed T001 timing deviation, not a historical host baseline. Repeating local comparisons cannot recover earlier actual model events. Retain this limit when comparing the prepared native session; do not invent old prompt counts or silently relax acceptance.

## Acceptance Evidence

| criterion_id | status | confidence | evidence and remaining limit |
|---|---|---|---|
| AC-001 | partial | medium | Missing UX and canonical ready-registration chain pass; native zero-extra-prompt behavior remains N002 |
| AC-002 | partial | medium | Exact diagnostics/protected sources pass; actual one-correction and unchanged-stop behavior remains N003 |
| AC-003 | partial | medium | QA implementation/internal/external/upstream/invalid deterministic chains pass; actual N004/N005 missing |
| AC-004 | partial | medium | Invocation rejection, actor/disposition and 26 locale/state renders pass; actual terminal tool sequence/display remains N003/N006 |
| AC-005 | partial | medium | Complete prepared candidate/sequence exists; actual loaded identity/session remains N001/N008 |
| AC-006 | partial | medium | Canonical/source comparison and source-binding checks pass; actual interruption/prompt ledger remains N007/N008 |
| AC-007 | done | high | Existing authority/integrity, forbidden action and complete no-write path/byte tests pass; no native broader claim |
| AC-008 | partial | medium | Single owners and all-locale output reviewed; native claims remain explicitly unqualified |

## Scenario Assessment

| scenario_id | status | evidence and limit |
|---|---|---|
| SCN-001 | done | C002 missing/ready facts |
| SCN-002 | partial | prd-chain.json canonical scripted chain; native prompts missing |
| SCN-003 | done | C002 explicit blocked/unsafe prerequisite controls |
| SCN-004 | done | C002 absent/malformed/duplicate/nonready/ready matrix |
| SCN-005 | partial | canonical correction tested; actual model unchanged-stop missing |
| SCN-006 | done | C002 symlink/source/output protection and complete inventory/byte checks |
| SCN-007 | done | C007 failing filter assertion corrected and tests/reviews refreshed canonically |
| SCN-008 | done | C007 evidence route retains revise; evidence does not grant implementation |
| SCN-009 | partial | C007 route plus prepared full plan; actual external observation missing |
| SCN-010 | done | C007 requirements/design/plan/assessed-emergent target controls |
| SCN-011 | done | C007 unknown/missing/conflict/header/decision/reference failures |
| SCN-012 | done | C004/C005 supported strict arguments and rejection |
| SCN-013 | not_verifiable | N003/N006 actual agent input correction/post-terminal behavior absent |
| SCN-014 | done | C008 actual renderer outputs with explicit disposition |
| SCN-015 | partial | C008/C009/C010 registered packs/Approval; native clipping missing |
| SCN-016 | done | plan and exact candidate prepared before request |
| SCN-017 | not_verifiable | N001/N008 actual new candidate session absent |
| SCN-018 | partial | current older skill and MCP identities separated; changed candidate policy prepared, native countercase absent |
| SCN-019 | partial | C002/C012 canonical resume/stale binding; actual interrupted model session absent |
| SCN-020 | partial | verified reconstructed baseline/source ledgers; historical model/prompt/timing unavailable |
| SCN-021 | not_verifiable | N008 actual prompt/action/recording ledger absent |
| SCN-022 | done | C007 negative gaps/QA block and approval suppression |
| SCN-023 | done | C005/C006/C012/C013 protected authority/runtime/run inputs |
| SCN-024 | done | C008 explicit status does not promise work; C011 stays read-only |
| SCN-025 | done | C002/C007/C011 and nine protocol routes complete no-write inventories/bytes |
| SCN-026 | done | code/clean review shared source owner; schema/phase/input conformance |
| SCN-027 | done | sole normative quality contract consumer; C019 trusted resource boundary |
| SCN-028 | partial | all 26 actual renderer outputs inspected; native display missing |
| SCN-029 | done | source/package/protocol/native claims separately identified; unobserved host unqualified |
| SCN-030 | partial | complete task/scenario/review/gap assessment; QA recording and native reassessment required |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | pre-PRD preparation | T-002/T-006/T-008 | canonical scripted routing recorded; actual host sequence absent | partial | evidence_gap |
| AC-002 | own-input correction/unchanged stop | T-004/T-006/T-008 | exact diagnostics rendered; actual model stop absent | partial | evidence_gap |
| AC-003 | QA follow-up | T-003/T-008 | scripted code/evidence/source routes recorded; native chain absent | partial | evidence_gap |
| AC-004 | status/continuation/terminal | T-005/T-008 | 26 actual renderer outputs inspected; native display/tool sequence absent | partial | evidence_gap |
| AC-005 | external qualification | T-007/T-008 | complete plan visible as artefact; fresh supported host absent | partial | evidence_gap |
| AC-006 | interruption and reduced chat loops | T-006/T-008 | deterministic comparisons only; actual prompt ledger absent | not_verifiable | evidence_gap |
| AC-007 | protected authority/read-only | T-006 | canonical authority/protection/inventory results, no new UX acceptance added | fulfilled | none |
| AC-008 | ownership/evidence clarity | T-009/T-008 | separated durable evidence and rendered diagnostic inventory; host observation absent | partial | evidence_gap |

'''+gap
(b/'TASK_PLAN_REVIEW.md').write_text(text)
print('Source CR pass; Clean Review and TP Review revise for explicit native evidence gap.')
