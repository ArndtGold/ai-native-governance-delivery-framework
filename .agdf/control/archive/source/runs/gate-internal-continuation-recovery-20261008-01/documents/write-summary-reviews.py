from pathlib import Path
from datetime import datetime, timezone
import json
p=Path('.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01')
c=json.loads((p/'SUMMARY_CANDIDATE-01.json').read_text())
at=datetime.now(timezone.utc).isoformat()
header=f'''- assessed_at: {at}
- run: gate-internal-continuation-recovery-20261008-01
- candidate: {c['codex_install_version']}
- runtime_digest: {c['runtime_digest']}
- mcp_dispatcher_digest: {c['mcp_dispatcher_digest']}
- reviewer: Codex; same-agent review, no independent reviewer claimed
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- memory_target: scope_artifact
- memory_reason: bounded run evidence; no source-of-truth ownership change
'''
for name in ['CD_TESTS.md','CODE_REVIEW.md','TASK_PLAN_REVIEW.md','CLEAN_IMPLEMENTATION_REVIEW.md','QA_REPORT.md']:
    dest=p/('BEFORE_SUMMARY_REASSESSMENT-'+name)
    if dest.exists(): raise RuntimeError('Backup already exists')
    dest.write_bytes((p/name).read_bytes())
gap='| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_SUMMARY_FIX-01.md: new loaded candidate and one positive summary chain observed; native unchanged-stop, terminal safety, interruption, displayed readability and complete QA fixture remain unobserved | Collect the remaining affected native obligations in QUALIFICATION_PLAN-01.md with the current exact candidate and complete fixture scope |'
(p/'EVIDENCE_SUMMARY_FIX-01.md').write_text(f'''# Summary validation and recovery fix

{header}
## Cause and approved scope

EVIDENCE_NATIVE-03.md records the prior actual extra user turn. The own unapproved summary existed, but combined `Ziel und Umfang:` and `Entscheidungskontext:` labels did not meet the canonical parser. PRD product readiness omitted summary validation; presentation therefore failed late and generic recovery incorrectly implied an absent summary. This corrects approved AC-002/AC-004 and TP T-002/T-004/T-005/T-006, with no approved source edit or new requirement.

## Primary solution

PRD readiness invokes the existing presentation summary validator with resolved languages before taking the registered-ready route. Its diagnosis uses the existing renderer/locale owner, exact source path, canonical reason and required field. A malformed own unapproved summary remains in existing prd_definition continuation. Existing typed canonical replacement and fresh reevaluation remain mandatory. Existing instructions require validation before recording, one condition-specific correction and stopping unchanged failure. This instruction-level attempt boundary is not a new persistent retry counter. Ready drafts retain explicit human editing intent; approved/foreign/unsafe sources and status retain their restrictions. Public schema, phase and approval transport are unchanged.

## Final checks and applicability

SUMMARY_CHECKS-01.json contains twelve passing affected checks; summary-check-prd.log records the additional final packaged PRD suite pass and SUMMARY_PRD_CHAIN-01.json its canonical chain. These cover early diagnosis, localized invalid/missing/duplicate/incomplete/overlong summaries, typed replacement, protected sources, explicit status and full control path/byte inventories. Eight new actual locale renders in SUMMARY_LOCALE_RENDERS-01.json were inspected across all registered packs en/de for goal/scope/decisions/missing block. They are source render evidence, not native displayed screenshots. sync-package-assets completed on the final source and exact payload inventory was reviewed (208 files, 1,758,095 bytes, no threshold headroom). Previous growth-guard failures during incomplete sync are preserved; no waiver was introduced.

Prior CHECKS-01.json evidence remains applicable only to unchanged named mechanisms. Source binding, contract, locale, control, instruction, runtime and package checks affected by this correction were rerun. No unrelated cockpit/UI deltas were changed. The complete previous run baseline remains historical; no earlier model timing is reconstructed.

## Installed and actual desktop chain

QUALIFICATION_PLAN-02.md and SUMMARY_NATIVE_FIXTURE-01.json were prepared before the switch. SUMMARY_INSTALLATION-01.json records the canonical installer healthy result and unchanged separate cockpit config. SUMMARY_FRESH_CONNECTION-01.json proves fresh actual stdio provenance. SUMMARY_DESKTOP_IDENTITY-01.json and SUMMARY_NATIVE_BEFORE-01.json prove that the real desktop MCP loaded dispatcher {c['mcp_dispatcher_digest']} before behavior was attributed to it.

The new disposable saved-filter fixture has complete resolved synthetic scope, a no-UX test route and synthetic setup receipts only. They never authorize this production run. Actual desktop before: registered malformed PRD at ee2f7b84-a089-4e99-8f8a-d30aacb40d18 returns nonterminal prd_definition with exact approval_summary_user_goal_missing and `- Ziel:` diagnosis. One editorial correction preserves the full substantive body and approved UR. Installed canonical validation observes goal then decisions failure, then ready=true before writing. SUMMARY_NATIVE_RECORDING-01.json records typed replacement to 6392b041-1dc0-431f-8c15-6785d616cfca. Actual fresh desktop after: SUMMARY_NATIVE_AFTER-01.json returns nonterminal presentation_required. The test stops at that pending boundary; no test-product approval is requested or fabricated.

| Observation | Prior actual failure | Corrected actual case |
|---|---|---|
| Bound malformed own summary | terminal presentation failure | nonterminal existing authoring continuation |
| Diagnosis | generic missing summary | exact canonical reason, source and required label |
| Correction and recording | required additional explicit revise steering | one validated typed replacement within the same authorized turn |
| Avoidable additional user restart prompts for this case | one observed extra user turn | zero |
| Real pending decision | preserved | preserved, no approval given |

These are actual desktop model/tool actions in this existing session, not an independent fresh model session or visual proof. The fresh stdio connection is separately identified. This one corrected positive case does not satisfy every native case of the complete approved plan. No claim is made that all gates or all runs now need zero extra prompts.

## Remaining obligations

QF-002 is resolved by early validation, exact diagnosis, source/package checks and the installed actual positive chain. QF-001 remains open: current-candidate actual unchanged-failure stop, post-terminal no-tool sequence, interruption/changed-revision behavior, representative displayed readability, full QA implementation/evidence fixture and consolidated complete native ledger remain missing. Old native partial observations are historical or narrowly applicable; they are not automatically upgraded to this changed candidate. Baseline timing and same-agent limits remain explicit. QA remains revise, no Approval: QA/UAT/release.
''')
(p/'CD_TESTS.md').write_text(f'''# Implementation and verification

- status: done
{header}
- scope: approved TP source implementation and QF-002 correction
- evidence: original CHECKS-01.json and source ledgers for unchanged paths; SUMMARY_CHECKS-01.json, summary-check-prd.log, SUMMARY_PRD_CHAIN-01.json, SUMMARY_LOCALE_RENDERS-01.json, SUMMARY_CANDIDATE-01.json
- actual_host_status: partial; exact installed desktop candidate and positive own-summary recovery observed, remaining native obligations open
- evidence_boundary: source/package checks and actual observations are separately named in EVIDENCE_SUMMARY_FIX-01.md
- required_next_step: consume refreshed mandatory reviews and have qa-gate assess the remaining native evidence obligation

The common PRD readiness now reuses the canonical summary validator before presentation. Precise diagnosis and existing authoring recovery fix the observed cause. The actual desktop chain reaches presentation_required after one validated typed replacement and zero additional user restart prompts. No approved source, public contract, gate, permission boundary, installer implementation or unrelated cockpit code changed. CD+Tests done does not mean every TP task is complete, QA pass or release readiness.
''')
cr=(p/'BEFORE_SUMMARY_REASSESSMENT-CODE_REVIEW.md').read_text()
body=cr[cr.index('The review checked'):]
(p/'CODE_REVIEW.md').write_text(f'''# Code Review

- decision: pass
{header}
- evidence: actual scoped final diff and impacted validator/readiness/dispatcher/presentation/resource owners; SUMMARY_CHECKS-01.json; final packaged PRD suite; EVIDENCE_SUMMARY_FIX-01.md; original passing unchanged-path proof
- findings: no remaining actionable source defect identified in reviewed scope
- missing_evidence: full native qualification remains QF-001; this source-diff pass does not grant overall QA pass
- risks: same-agent review; one-correction stop remains an execution-instruction boundary requiring native negative observation
- required_next_step: qa-gate assesses all refreshed dimensions and QF-001

New review checks: readiness resolves the same artifact/presentation languages as presentation; canonical validation is reused without parser duplication; exact reasons survive early run-present refusal; required-field diagnosis describes accepted preferred syntax without loosening it. Existing registered-ready editing restriction, upstream source precedence, read-only path/byte checks and typed source binding remain intact. Negative tests remain active. The actual installed positive chain supports this exact recovery claim only.

{body}
''')
(p/'CLEAN_IMPLEMENTATION_REVIEW.md').write_text(f'''# Clean Implementation Review

- decision: revise
{header}
- primary_solution: existing common PRD readiness calls existing canonical presentation validator; existing renderer/locales provide exact diagnosis; existing authoring and typed recording owners handle eligible correction
- evidence: actual scoped diff; CODE_REVIEW.md; SUMMARY_CHECKS-01.json; SUMMARY_PRD_CHAIN-01.json; EVIDENCE_SUMMARY_FIX-01.md
- fallbacks_retained: existing unsupported-locale English fallback and terminal safety for unsafe/protected/invalid conditions
- workaround_or_shim_risk: no new shim, retry state or terminal suppression; attempt limit remains instruction-level and actual unchanged-stop compliance is unobserved
- parallel_structure_risk: no second parser, gate, phase, public field, policy store, recording owner or quality route table
- brownfield_fit: existing contained reads, resolved language owner, canonical summary parser, authoring route, typed writer, renderer and sync/installer owners reused
- exit_criteria: remaining required native observations supplied or explicitly open, consumed by qa-gate
- missing_evidence: QF-001 current-candidate native negative/interruption/display and complete QA-chain obligations
- required_next_step: collect the remaining native evidence obligations with the prepared exact candidate

The root cause is fixed before the ready route rather than masked at the renderer. Installed desktop observation confirms the eligible correction chain, while the explicit native gaps prevent a broader integrity/QA claim. No new architecture or source-owner decision is required. Same-agent review is disclosed.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
{gap}
''')
tp=(p/'BEFORE_SUMMARY_REASSESSMENT-TASK_PLAN_REVIEW.md').read_text()
# Preserve the complete original criterion/scenario inventory; reassess changed native claims below.
sections=tp[tp.index('## Acceptance Evidence'):tp.index('## Normalized Findings')]
sections=sections.replace('actual N-001 through N-008 candidate/session','remaining actual N-001 through N-008 obligations')
sections=sections.replace('No fresh actual native candidate session N001-N008','Current positive desktop chain observed; remaining native cases missing')
sections=sections.replace('| SCN-017 | not_verifiable | N001/N008 actual new candidate session absent |','| SCN-017 | partial | Current actual desktop digest and positive chain observed; independent fresh model session and full N008 absent |')
sections=sections.replace('| SCN-021 | not_verifiable | N008 actual prompt/action/recording ledger absent |','| SCN-021 | partial | Summary positive case has actual zero-extra-user-prompt ledger; complete native ledger absent |')
sections=sections.replace('fresh supported host absent','actual desktop candidate match and positive chain recorded; remaining native cases absent')
sections=sections.replace('fresh supported host absent','remaining complete session absent')
sections=sections.replace('actual loaded identity/session remains N001/N008','actual loaded desktop identity is matched; complete native sequence remains N008')
sections=sections.replace('N001/N008 actual new candidate session absent','remaining current-candidate native sequence absent')
sections=sections.replace('current older skill and MCP identities separated; changed candidate policy prepared, native countercase absent','current installed and desktop MCP identity matched; native mismatch countercase absent')
(p/'TASK_PLAN_REVIEW.md').write_text(f'''# Task Plan Review

- decision: revise
{header}
## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | partially_done | BROWNFIELD_ANALYSIS.md; BASELINE-01.json; SUMMARY_FIX_BASELINE-01.json before this correction | Original historical full model timing unavailable; earlier reconstructed source comparisons remain disclosed | No invented baseline timing |
| T-002 | fully_done | Existing contained source facts; shared summary validator now early in readiness; final core/PRD tests | none at source level | QF-002 corrected |
| T-003 | fully_done | Existing qa-follow-up.js and original C007/C013/C019; affected control/capture checks green | native QA chain under T008 | Source-level fulfilled |
| T-004 | fully_done | Canonical authoring/interaction contracts and source instructions; final dispatch/instruction tests | native unchanged-stop under T008 | Instruction-level fulfilled |
| T-005 | fully_done | Existing renderer/locales; eight new locale renders and affected checks | displayed readability under T008 | Exact reason and required field inspected |
| T-006 | partially_done | Original canonical suites plus final packaged summary correction/protection/status chains and locale renders | complete native negative/interruption ledger | Prevents broad behavior pass |
| T-007 | fully_done | Synced final candidate; SUMMARY_CANDIDATE-01.json; all affected checks; QUALIFICATION_PLAN-02.md and explicit fixture prepared before switch | none | Candidate prepared in one sequence |
| T-008 | partially_done | SUMMARY_INSTALLATION-01.json; fresh stdio; actual desktop identity and positive summary chain | current-candidate unchanged-stop, terminal/no-tool, interruption, displayed readability and complete QA fixture | QF-001 remains open |
| T-009 | partially_done | Updated CD+Tests, mandatory CR and Clean/TP reviews; qa-gate current reassessment | full native completion and final QA readiness | No Approval: QA |

## Summary

- fully_done: 5 of 9, T002/T003/T004/T005/T007
- partially_done: 4 of 9, T001/T006/T008/T009
- not_done: 0 tasks wholly unstarted; specified native observations themselves remain unperformed
- out_of_scope_changes: none introduced; unrelated cockpit/UI/projection deltas preserved
- risks: baseline historical timing unavailable; same-agent review; one positive current native chain cannot prove all cases
- required_next_step: collect remaining current-candidate native obligations and reassess qa-gate

The following complete criterion/scenario inventory retains the original source evidence for unchanged mechanisms. Statements about absent native observations refer to the specific remaining scenario, not the now-proved installed identity or positive summary chain. EVIDENCE_SUMMARY_FIX-01.md supersedes blanket earlier absence statements. AC002/AC004 gain exact early-summary diagnosis and one actual positive correction; AC005 gains current candidate installation/fresh connection/desktop identity; AC006 gains zero extra restart prompts for that one case only. The broader criteria stay partial where required countercases/display/full QA chains are missing. No acceptance is relaxed.

{sections}
## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
{gap}
''')
print('CD+Tests and three scoped reviews refreshed; QA not yet reassessed or canonically recorded.')
