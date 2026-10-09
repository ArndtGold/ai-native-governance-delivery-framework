import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`,state=`.agdf/control/runs/${run}/RUN_STATE.md`;
const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-8f578728e735/runtime/agdf-local.js';
const revision=()=>readFileSync(state,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(revision()!=='e7ba899d-e287-4e26-9570-90955ee9d088')throw Error('Changed reviewed binding');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const sources=Object.fromEntries(['UR','PRD','SD','TP'].map(k=>[k,sha(base+k+'.md')]));
const log=[];
function command(...args){const r=spawnSync(process.execPath,[cli,...args,'--dir',root,'--run',run,'--json'],{encoding:'utf8'});let value;try{value=JSON.parse(r.stdout)}catch{};log.push({args,exit_code:r.status,value,stderr:r.stderr});writeFileSync(base+'SUMMARY_REVIEW_RECORDING-01.json',JSON.stringify(log,null,2)+'\n');if(r.status!==0)throw Error(r.stdout+r.stderr);return value;}
const rows=[['CD+Tests','CD_TESTS.md','done','Affected checks and positive installed chain complete; native gaps retained'],['CR','CODE_REVIEW.md','done','Scoped Code Review pass; same-agent'],['TP Review','TASK_PLAN_REVIEW.md','done','Review completed; revise for remaining native evidence'],['Clean Implementation Review','CLEAN_IMPLEMENTATION_REVIEW.md','done','Review completed; revise for remaining native evidence'],['Summary fix evidence','EVIDENCE_SUMMARY_FIX-01.md','done','QF-002 source/package/actual positive recovery evidence'],['Current candidate evidence','SUMMARY_CANDIDATE-01.json','done','Exact checked source/runtime candidate'],['Current installation evidence','SUMMARY_INSTALLATION-01.json','done','Canonical installer healthy; separate cockpit unchanged'],['Current desktop evidence','SUMMARY_DESKTOP_IDENTITY-01.json','done','Actual selected MCP candidate matched']];
let content=readFileSync(state,'utf8');for(const [type,file,status,note] of rows)content=upsertTableRow(content,'Artefacts',0,type,[type,base+file,status,note]);writeFileSync(state,content);
command('run-update','--revision',revision());
command('run-step','--revision',revision(),'--step','review','--decision','pass','--source',base+'CODE_REVIEW.md','--evidence',base+'CODE_REVIEW.md');
// The review command records CR status/evidence; retain its actual report as the review source.
writeFileSync(state,upsertTableRow(readFileSync(state,'utf8'),'Artefacts',0,'CR',['CR',base+'CODE_REVIEW.md','done','Fresh scoped Code Review pass; same-agent']));
command('run-update','--revision',revision());
for(const [k,v] of Object.entries(sources))if(sha(base+k+'.md')!==v)throw Error('Approved source changed');
console.log(JSON.stringify({revision:revision(),review:'pass',TP:'revise',Clean:'revise',approved_sources:'unchanged'}));
