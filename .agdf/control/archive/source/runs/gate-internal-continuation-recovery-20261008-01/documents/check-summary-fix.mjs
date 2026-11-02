import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const base='.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/';
const checks=[
 ['core-control','packages/core/test/control-state-test.js'],
 ['dispatch','packages/cli/scripts/skill-dispatch-test.js'],
 ['function-contract','packages/cli/scripts/skill-dispatch-function-contract-test.js'],
 ['localization','packages/cli/scripts/operational-localization-test.js'],
 ['presentation','packages/core/test/interaction-presentation-test.js'],
 ['readonly','packages/cli/scripts/control-inspect-test.js'],
 ['source-revision','packages/cli/scripts/late-source-revision-test.js'],
 ['instruction','packages/cli/scripts/instruction-footprint-test.js'],
 ['runtime-integrity','plugins/agdf/scripts/check-runtime-integrity.mjs'],
 ['package','packages/cli/scripts/package-contents-test.js'],
 ['capture','packages/core/test/control-read-provider-test.js'],
 ['sd','packages/cli/scripts/sd-definition-test.js'],
];
const results=[];let cursor=0;
async function worker(){while(cursor<checks.length){const [id,path]=checks[cursor++],start=new Date().toISOString();await new Promise(resolve=>{
 const child=spawn(process.execPath,[path],{env:{...process.env,PATH:'/usr/local/Cellar/node@22/22.22.3/bin:'+process.env.PATH},stdio:['ignore','pipe','pipe']});let output='';
 child.stdout.on('data',v=>output+=v);child.stderr.on('data',v=>output+=v);
 child.on('close',code=>{writeFileSync(base+'summary-check-'+id+'.log',output);results.push({id,path,start,finished:new Date().toISOString(),exit_code:code});writeFileSync(base+'SUMMARY_CHECKS-01.json',JSON.stringify(results,null,2)+'\n');console.log(id+': '+(code===0?'pass':'FAIL')+(code===0?'':'\n'+output.slice(-3500)));resolve();});
});}}
await Promise.all([worker(),worker()]);if(results.some(r=>r.exit_code!==0))process.exitCode=1;
