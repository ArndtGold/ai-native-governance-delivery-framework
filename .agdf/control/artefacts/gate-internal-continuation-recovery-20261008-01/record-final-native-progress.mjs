// qa-gate owner assessment and canonical revise recording; never an approval.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`,state=`.agdf/control/runs/${run}/RUN_STATE.md`,expected='46f0a95b-c441-4c6e-8450-82fe515cc683';
const revision=()=>readFileSync(state,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(revision()!==expected)throw Error('Changed qa-gate binding');
const candidate=JSON.parse(readFileSync(base+'OWNER_CANDIDATE-01.json'));
const sources={UR:'47b5049fcdc03dce6c2968e8f972a7122d1be195529d1d7242d09207941d55c1',PRD:'4c78b38f0588e0784a2d2fb849995301d2bced94799a6deb87613ebe6bd2cb0b',SD:'cbba6550d7daf05f3233cb31dd4d1a9d587f41637e41f442372003a09005f596',TP:'7de5565692e344eaf8df8b2d5a0ba87605dc7492a2d88a09750c7794e6b6d957'};
function verifySources(){for(const [k,v] of Object.entries(sources))if(createHash('sha256').update(readFileSync(base+k+'.md')).digest('hex')!==v)throw Error('Approved source changed: '+k);}
verifySources();
const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-9816859c8401/runtime/agdf-local.js',log=[];
function command(...args){const r=spawnSync(process.execPath,[cli,...args,'--dir',root,'--run',run,'--json'],{encoding:'utf8'});let value;try{value=JSON.parse(r.stdout)}catch{};log.push({args,exit_code:r.status,value,stderr:r.stderr});writeFileSync(base+'FINAL_NATIVE_QA_RECORDING-01.json',JSON.stringify(log,null,2)+'\n');if(r.status!==0)throw Error(r.stdout+r.stderr);return value;}
let stateText=readFileSync(state,'utf8');
for(const [type,file,comment] of [
 ['Native qualification evidence','EVIDENCE_NATIVE-05.md','Complete applicable native chains; current display remains open'],
 ['Current candidate evidence','OWNER_CANDIDATE-01.json','Exact new affected candidate identity'],
 ['Current installation evidence','OWNER_INSTALLATION-01.json','Canonical healthy update; cockpit unchanged'],
 ['Current desktop evidence','OWNER_ACTUAL_QA_DISPATCH-01.json','Actual selected new MCP candidate matched'],
 ['Fresh connection evidence','OWNER_FRESH_CONNECTION-01.json','Fresh selected new MCP provenance matched'],
 ['Upstream diagnosis proof','INDEPENDENT_TERMINAL_OWNER_CORRECTED_PROOF-01.json','SD named; exact terminal/no later tool; source bytes unchanged']])
 stateText=upsertTableRow(stateText,'Artefacts',0,type,[type,base+file,'done',comment]);
writeFileSync(state,stateText);
command('run-update','--revision',expected);
command('run-step','--revision',revision(),'--step','review','--decision','pass','--source',base+'CODE_REVIEW.md','--evidence',base+'CODE_REVIEW.md');
// Existing review operation records its decision and deliberately clears CR path. Restore the
// concrete reviewed evidence pointer as an own run update, never handcraft a seal/receipt.
stateText=upsertTableRow(readFileSync(state,'utf8'),'Artefacts',0,'CR',['CR',base+'CODE_REVIEW.md','done','Fresh scoped Code Review pass; same-agent; QF-003 resolved']);
writeFileSync(state,stateText);
command('run-update','--revision',revision());
const schema_version='1',target_id=resolveControlCommandTarget(root).target_id,run_id=run,destination={type:'QA_REPORT',path:base+'QA_REPORT.md',digest:artefactFileDigest(root,base+'QA_REPORT.md'),status:'revise'},source={type:'TP',path:base+'TP.md',digest:artefactFileDigest(root,base+'TP.md')},relationship={from:'QA_REPORT',relationship:'tests',to:'TP'},reviewer='Codex qa-gate reassessment; same-agent review';
const path=base+'FINAL_NATIVE_QA_SOURCE_REVIEW-01.json',input=base+'FINAL_NATIVE_QA_RECORDING_INPUT-01.json';
writeFileSync(path,JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer,reviewed:true},null,2)+'\n');
writeFileSync(input,JSON.stringify({schema_version,target_id,run_id,expected_revision_id:revision(),destination,source,relationship,review:{reviewer,path,digest:artefactFileDigest(root,path)},update_draft:false},null,2)+'\n');
command('run-step','--revision',revision(),'--step','artefact','--gate','QA','--evidence',input);
const doctor=command('doctor');verifySources();
console.log(JSON.stringify({revision:revision(),QA:'revise',QF002:'resolved',QF001:'open',QF003:'resolved with affected source/package/native proof',doctor:doctor.status,approved_sources:'unchanged'}));
