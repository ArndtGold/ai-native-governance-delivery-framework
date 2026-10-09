// qa-gate owner assessment and canonical revise recording; never an approval.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`,state=`.agdf/control/runs/${run}/RUN_STATE.md`,expected='803f18f1-1db3-467e-a281-686e7af73792';
const revision=()=>readFileSync(state,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(revision()!==expected)throw Error('Changed qa-gate binding');
const candidate=JSON.parse(readFileSync(base+'SUMMARY_CANDIDATE-01.json'));
const sources={UR:'47b5049fcdc03dce6c2968e8f972a7122d1be195529d1d7242d09207941d55c1',PRD:'4c78b38f0588e0784a2d2fb849995301d2bced94799a6deb87613ebe6bd2cb0b',SD:'cbba6550d7daf05f3233cb31dd4d1a9d587f41637e41f442372003a09005f596',TP:'7de5565692e344eaf8df8b2d5a0ba87605dc7492a2d88a09750c7794e6b6d957'};
function verifySources(){for(const [k,v] of Object.entries(sources))if(createHash('sha256').update(readFileSync(base+k+'.md')).digest('hex')!==v)throw Error('Approved source changed: '+k);}
verifySources();
writeFileSync(base+'QA_REPORT.md',`# QA Gate: Reliable internal continuation and actionable recovery

## Quality Readiness

| Dimension | Evidence owner | Result |
|---|---|---|
| Plan coverage | task-plan-review | revise: 5/9 tasks fully done; native countercases and original timing limits explicit |
| Solution integrity | clean-implementation-review | revise: clean integrated solution and positive installed chain; complete native evidence remains open |
| Code quality | code-review | pass: no actionable scoped source defect identified |
| QA decision | qa-gate — sole decision owner | revise: QF-002 resolved, QF-001 remaining native obligations open |

## QA Decision

- decision: revise
- assessed_at: ${new Date().toISOString()}
- assessed_revision_id: ${expected}
- run: ${run}
- candidate: ${candidate.codex_install_version}
- runtime_digest: ${candidate.runtime_digest}
- mcp_dispatcher_digest: ${candidate.mcp_dispatcher_digest}
- evidence: approved UR/PRD/SD/TP source chain; passed Brownfield Analysis; refreshed CD_TESTS.md; final actual scoped diff; SUMMARY_CHECKS-01.json twelve passes; final packaged PRD pass/chain; eight new locale renders; current candidate/install/fresh stdio/actual desktop identity and positive recovery; EVIDENCE_SUMMARY_FIX-01.md; retained original named unchanged-path checks
- code_review: ${base}CODE_REVIEW.md
- tp_review: ${base}TASK_PLAN_REVIEW.md
- clean_implementation_review: ${base}CLEAN_IMPLEMENTATION_REVIEW.md
- missing_evidence: QF-001 current-candidate actual unchanged-failure stop, post-terminal no-tool sequence, interruption/changed-revision, representative displayed readability, complete QA implementation/evidence fixture and full categorized native ledger
- risks: same-agent reviews; positive native case is in the existing desktop model session, fresh stdio is separately identified; no independent fresh-model/full-native qualification claimed; original historical model baseline timing unavailable
- required_next_step: collect the remaining affected native obligations from QUALIFICATION_PLAN-01.md using current exact candidate, complete fixture scope and consolidated ledger
- impact_codes: not_applicable; no extra registry
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: run-specific qualification and correction evidence; canonical owner policy unchanged

## Assessment

qa-gate consumed all three refreshed review dimensions, their valid normalized findings and the complete TP task/criterion/scenario inventory. Exact binding doctor passes; approved sources remain byte-identical. Code Review pass is scoped source evidence. Plan coverage and solution integrity retain QF-001 without reclassification. Applicable UX rows remain partial/not_verifiable until their specific native observations exist. Source tests and rendered source text cannot replace displayed behavior or model terminal/interruption compliance.

QF-002 is resolved: common PRD readiness now invokes the existing canonical localized summary validator before ready routing, provides the exact source/reason/required field and keeps the own unapproved format repair with the existing authoring owner. Final packaged tests cover invalid summaries, unchanged reinspection, explicit status, typed replacement and protected source/control inventories. Actual installed desktop before/after observations show nonterminal prd_definition, one validated canonical correction and then presentation_required, with zero additional user restart prompts for this exact positive case. Approved UR and substantive draft body are unchanged. That case stops at pending presentation with no approval. Required negative native compliance remains QF-001; no persistent retry mechanism or expanded edit authority was added.

Installation and connection are now evidenced for the current candidate under the existing user-authorized update lane. Separate cockpit configuration is unchanged. Historical old candidate observations are preserved, not represented as current-candidate qualification. QUALIFICATION_PLAN-02.md and exact summary fixture were prepared before the new switch. Unchanged source proof is retained only by named applicability; affected control/contract/instruction/localization/runtime/package/PRD checks were rerun.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_SUMMARY_FIX-01.md and TASK_PLAN_REVIEW.md: current candidate and one positive recovery observed; specified native negative/interruption/display and complete QA fixture obligations remain missing | Collect remaining affected native obligations with the current candidate and complete prepared fixture scope |
| QF-002 | implementation_gap | CD+Tests | resolved | EVIDENCE_SUMMARY_FIX-01.md, final affected tests and SUMMARY_NATIVE_BEFORE/VALIDATION/RECORDING/AFTER-01.json prove early canonical validation, exact diagnosis and actual installed positive recovery | Retain this proof and reassess if the candidate or affected paths change |

Current gate remains QA. No Approval: QA is ready; UAT/release and clean delivery handoff remain forbidden. This report approves no gate, installation, source revision or VCS action.
`);
const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-8f578728e735/runtime/agdf-local.js',log=[];
function command(...args){const r=spawnSync(process.execPath,[cli,...args,'--dir',root,'--run',run,'--json'],{encoding:'utf8'});let value;try{value=JSON.parse(r.stdout)}catch{};log.push({args,exit_code:r.status,value,stderr:r.stderr});writeFileSync(base+'SUMMARY_FINAL_QA_RECORDING-01.json',JSON.stringify(log,null,2)+'\n');if(r.status!==0)throw Error(r.stdout+r.stderr);return value;}
command('run-update','--revision',expected);
const schema_version='1',target_id=resolveControlCommandTarget(root).target_id,run_id=run,destination={type:'QA_REPORT',path:base+'QA_REPORT.md',digest:artefactFileDigest(root,base+'QA_REPORT.md'),status:'revise'},source={type:'TP',path:base+'TP.md',digest:artefactFileDigest(root,base+'TP.md')},relationship={from:'QA_REPORT',relationship:'tests',to:'TP'},reviewer='Codex qa-gate reassessment; same-agent review';
const path=base+'QA_SOURCE_REVIEW-03.json',input=base+'QA_RECORDING_INPUT-03.json';
writeFileSync(path,JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer,reviewed:true},null,2)+'\n');
writeFileSync(input,JSON.stringify({schema_version,target_id,run_id,expected_revision_id:revision(),destination,source,relationship,review:{reviewer,path,digest:artefactFileDigest(root,path)},update_draft:false},null,2)+'\n');
command('run-step','--revision',revision(),'--step','artefact','--gate','QA','--evidence',input);
const doctor=command('doctor');verifySources();
console.log(JSON.stringify({revision:revision(),QA:'revise',QF002:'resolved',QF001:'open',doctor:doctor.status,approved_sources:'unchanged'}));
