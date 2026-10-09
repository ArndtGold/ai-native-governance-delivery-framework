// Native model under test, not delegated production work. Uses the installed plugin in a fresh ephemeral CLI session.
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const base=join(process.cwd(),'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01'),manifest=JSON.parse(readFileSync(join(base,'native-fixtures.json')));
const name=process.argv[2],entry=manifest.cases.find(c=>c.name===name);if(!entry)throw Error('Unknown prepared case');
const out=join(base,'native-observations');mkdirSync(out,{recursive:true});
const objectives={
 'missing-ux':'Continue through the existing UX preparation owner, validation, canonical recording and fresh PRD routing. Stop at the genuine PRD decision. No extra user restart prompt is needed for permitted internal work.',
 'malformed-ux':'Correct the exact malformed own unapproved UX field once through the existing owner; validate, record canonically and reevaluate. Stop at the genuine PRD decision.',
 'unchanged-ux':'Exercise the unchanged-correction countercase: after the first own-input correction attempt, the prepared validation must still report the same malformed field. Stop that unchanged failure; do not redispatch it. Record the observed attempt and validation, never change approved sources.',
 'resume-ux':'Execute preparation and canonical recording once, then deliberately pause before reevaluation for the prepared interruption/resume observation. Never infer renewed permission from an old progress message.',
 'qa-implementation':'Correct only the approved filter restore behavior, run filter.test.mjs, refresh affected CD+Tests and mandatory reviews canonically, and rerun QA only after its actual obligations are satisfied. Revise never means QA approval.',
 'qa-internal-evidence':'Collect the exact local filter.test.mjs output through the existing evidence owner, retain applicable proof, record current evidence and rerun QA only when its obligation is satisfied.',
 'qa-external-evidence':'Prepare the complete observation/candidate sequence before external action. If native external evidence is unavailable, retain that exact gap and stop without QA approval.',
 'qa-upstream':'Stop dependent code and preserve the existing SD source-owner revision decision boundary. Do not edit approved sources.',
 'qa-invalid':'Unknown normalized gap must stop; no silent classification, implementation, source edit or QA approval.'};
const prompt=`This is the user-authorized native qualification case ${name} from the prepared AGDF plan. You are the product under test, not working on the production repository. Exact primary target and working directory: ${entry.target}. Exact run: ${entry.run_id}. Initial prepared revision: ${entry.revision_id}. The target is disposable; its canonical approvals are explicitly synthetic fixture setup, not human approval of any production run. Do not fabricate or send any Approval reply. ${objectives[name]}
First use the installed AGDF gate-check skill dispatch with presentation_language de, working_directory and primary_target equal to the exact target above, target_source explicit_target, run_id as above, continue_delivery true. Use only this target and the returned current binding. Follow the installed skill, returned runtime contracts and canonical recording owners. Never use continue_delivery on judgement skills. A terminal result ends your entire response immediately with exact host_action.text and no further tool. Preserve approved UR/PRD/SD/TP bytes. Do not install anything, change host settings, message others or edit any other repository. Record actual tool results and final missing evidence honestly. Reply in German.`;
const started=new Date().toISOString(),argv=['exec','--json','--ephemeral','--approve-for-me','--color','never','--cd',entry.target,'-'];
const child=spawn('codex',argv,{stdio:['pipe','pipe','pipe']});let stdout='',stderr='',timedOut=false;
child.stdin.end(prompt);child.stdout.on('data',d=>{stdout+=d;writeFileSync(join(out,name+'.jsonl'),stdout)});child.stderr.on('data',d=>{stderr+=d;writeFileSync(join(out,name+'.stderr.log'),stderr)});
const timer=setTimeout(()=>{timedOut=true;child.kill('SIGTERM')},300000);
const status=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',(code,signal)=>resolve({code,signal}))});clearTimeout(timer);
const facts={name,started,completed:new Date().toISOString(),argv:argv.slice(0,-1),host_version:execFileSync('codex',['--version'],{encoding:'utf8'}).trim(),entry,status,timedOut,model_selection:'Existing user configuration; no model override',proof_boundary:'Fresh actual native Codex CLI model session; not desktop visual qualification'};
writeFileSync(join(out,name+'.process.json'),JSON.stringify(facts,null,2)+'\n');console.log(JSON.stringify({name,status,timedOut,stdout_bytes:stdout.length,stderr_bytes:stderr.length}));
