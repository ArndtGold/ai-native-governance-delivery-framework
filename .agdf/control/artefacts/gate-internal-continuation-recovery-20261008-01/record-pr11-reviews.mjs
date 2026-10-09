import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
const root=process.cwd(),run='gate-internal-continuation-recovery-20261008-01',base=`.agdf/control/artefacts/${run}/`,state=`.agdf/control/runs/${run}/RUN_STATE.md`,expected='f265f6c1-aa58-4f76-8917-a794c51114d8';
const revision=()=>readFileSync(state,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(revision()!==expected)throw Error('Changed bound review revision');
const hashes={UR:'47b5049fcdc03dce6c2968e8f972a7122d1be195529d1d7242d09207941d55c1',PRD:'4c78b38f0588e0784a2d2fb849995301d2bced94799a6deb87613ebe6bd2cb0b',SD:'cbba6550d7daf05f3233cb31dd4d1a9d587f41637e41f442372003a09005f596',TP:'7de5565692e344eaf8df8b2d5a0ba87605dc7492a2d88a09750c7794e6b6d957'};
function verify(){for(const [k,v] of Object.entries(hashes))if(createHash('sha256').update(readFileSync(base+k+'.md')).digest('hex')!==v)throw Error('Approved source changed: '+k);}
verify();const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-9816859c8401/runtime/agdf-local.js',log=[];
function cmd(...args){const r=spawnSync(process.execPath,[cli,...args,'--dir',root,'--run',run,'--json'],{encoding:'utf8'});let value;try{value=JSON.parse(r.stdout)}catch{};log.push({args,exit_code:r.status,value,stderr:r.stderr});writeFileSync(base+'PR11_REVIEW_RECORDING-01.json',JSON.stringify(log,null,2)+'\n');if(r.status!==0)throw Error(r.stdout+r.stderr);return value;}
cmd('run-update','--revision',revision());
cmd('run-step','--step','review','--decision','pass','--source',base+'CODE_REVIEW.md','--evidence',base+'CODE_REVIEW.md','--revision',revision());
const restored=upsertTableRow(readFileSync(state,'utf8'),'Artefacts',0,'CR',['CR',base+'CODE_REVIEW.md','done','Scoped Code Review pass; CI QF-005/QF-006 resolved; exact report pointer retained']);if(!restored)throw Error('CR pointer restoration failed');writeFileSync(state,restored);
cmd('run-update','--revision',revision());const doctor=cmd('doctor');verify();console.log(JSON.stringify({revision:revision(),code_review:'pass',doctor:doctor.status,approved_sources:'unchanged'}));
