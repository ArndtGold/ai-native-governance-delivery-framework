// QA owner: refresh reviewed revise findings, then record the exact QA_REPORT-tests-TP mapping.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`;
const state=`.agdf/control/runs/${run}/RUN_STATE.md`,expected='96db69de-e64b-43c2-9cf7-75b90d85408f';
if(!readFileSync(state,'utf8').includes(`- revision_id: ${expected}\n`))throw Error('Changed run');
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const sources=Object.fromEntries(['UR','PRD','SD','TP'].map(k=>[k,sha(base+k+'.md')]));
const old=readFileSync(base+'QA_REPORT.md','utf8');
writeFileSync(base+'QA_REPORT_BEFORE_SUMMARY_FIX-01.md',old);
let report=old.replace('assessed_revision_id: 30619fa1-0189-4dff-bdb9-047849cb95c9','assessed_revision_id: '+expected)
 .replace('revise: required native evidence remains missing','revise: native own-summary validation and recovery defect plus remaining native evidence')
 .replace('- risks: current declared skill/CLI and live MCP bindings both precede this prepared candidate;','- risks: installed candidate and desktop MCP now match; native attempt exposed a summary prevalidation/diagnosis defect;')
 .replace('- required_next_step: execute QUALIFICATION_PLAN-01.md after separate installation/connection authorization, record actual observations and reassess affected reviews through qa-gate','- required_next_step: correct QF-002 within approved TP, run affected checks and refresh candidate/evidence applicability before remaining native observations')
 .replace('| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_NATIVE-01.md: actual N-001 through N-008 observations absent; TASK_PLAN_REVIEW.md and CLEAN_IMPLEMENTATION_REVIEW.md retain this obligation | Execute QUALIFICATION_PLAN-01.md after separate installation/connection authorization and record the actual observations |','| QF-001 | evidence_gap | evidence_obligation | open | EVIDENCE_NATIVE-02.md and EVIDENCE_NATIVE-03.md: exact installed desktop candidate and partial chains observed; complete native obligations remain missing | Prepare the revised exact candidate and collect the remaining affected native observations after source correction |\n| QF-002 | implementation_gap | CD+Tests | open | EVIDENCE_NATIVE-03.md and NATIVE_SUMMARY_VALIDATION-01.json: own unapproved PRD summary lacks recognized labels; validator runs too late and generic recovery hides known field cause; approved AC-002 and AC-004 | Reuse canonical summary validation before ready routing and return the permitted existing authoring continuation with precise diagnosis, then verify protected/status/unchanged cases |');
report+='\n## Current native reassessment\n\nThe previous absence-of-installation statements above are historical. INSTALLATION-01.json, DESKTOP_CONNECTION-01.json and EVIDENCE_NATIVE-02.md establish the installed candidate and actual desktop MCP match. EVIDENCE_NATIVE-03.md proves an actual internal summary-format failure followed by an additional user turn. The editorial fixture correction is verified, but production early validation, diagnosis and permitted recovery remain QF-002. This is an implementation defect within existing approved PRD AC-002/AC-004 and TP T-002/T-004/T-005/T-006, not a new requirement or source revision. Existing review evidence and native gaps remain applicable; no source-only pass closes this live finding. QA decision remains revise.\n';
writeFileSync(base+'QA_REPORT.md',report);
const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-0ad3b168da8e/runtime/agdf-local.js';
function command(...args){const r=spawnSync(process.execPath,[cli,...args,'--dir',root,'--run',run,'--json'],{encoding:'utf8'});if(r.status!==0)throw Error(r.stdout+r.stderr);return JSON.parse(r.stdout);}
const reviewedChange=command('run-update','--revision',expected);
writeFileSync(base+'SUMMARY_QA_UPDATE-01.json',JSON.stringify(reviewedChange,null,2)+'\n');
for(const [k,v] of Object.entries(sources))if(sha(base+k+'.md')!==v)throw Error('Approved source changed');
const schema_version='1',target_id=resolveControlCommandTarget(root).target_id,run_id=run;
const destination={type:'QA_REPORT',path:base+'QA_REPORT.md',digest:artefactFileDigest(root,base+'QA_REPORT.md'),status:'revise'},source={type:'TP',path:base+'TP.md',digest:artefactFileDigest(root,base+'TP.md')},relationship={from:'QA_REPORT',relationship:'tests',to:'TP'},reviewer='Codex QA reassessment; same-agent evidence';
const path=base+'QA_SOURCE_REVIEW-02.json',input=base+'QA_RECORDING_INPUT-02.json';
writeFileSync(path,JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer,reviewed:true},null,2)+'\n');
writeFileSync(input,JSON.stringify({schema_version,target_id,run_id,expected_revision_id:reviewedChange.revision_id,destination,source,relationship,review:{reviewer,path,digest:artefactFileDigest(root,path)},update_draft:false},null,2)+'\n');
const recorded=command('run-step','--revision',reviewedChange.revision_id,'--step','artefact','--gate','QA','--evidence',input);
writeFileSync(base+'SUMMARY_QA_RECORDING-01.json',JSON.stringify(recorded,null,2)+'\n');
console.log(JSON.stringify(recorded));
