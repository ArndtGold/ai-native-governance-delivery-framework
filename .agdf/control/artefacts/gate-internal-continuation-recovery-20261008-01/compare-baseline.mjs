// Read-only source comparison with synthetic control dependencies; not native host evidence.
import assert from 'node:assert/strict';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,rmSync,unlinkSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const repo=process.cwd(), out=join(repo,'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01');
const base=JSON.parse(readFileSync(join(out,'BASELINE-01.json'))), temp=mkdtempSync(join(tmpdir(),'agdf-gate-baseline-'));
try {
 const old=join(temp,'core'); mkdirSync(old);
 for(const path of ['lib','generated','package.json']) cpSync(join(repo,'packages/core',path),join(old,path),{recursive:true});
 for(const [path,digest] of Object.entries(base.files)) {
  if(!path.startsWith('packages/core/')&&!path.startsWith('plugins/agdf/meta/')) continue;
  const bytes=execFileSync('git',['show',base.head+':'+path]);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),digest,path+' baseline identity');
  const dest=path.startsWith('packages/core/')?join(old,path.slice('packages/core/'.length)):join(old,'generated',path);
  mkdirSync(join(dest,'..'),{recursive:true}); writeFileSync(dest,bytes);
 }
 const root=join(temp,'project'), run='synthetic-comparison', prefix=`.agdf/control/artefacts/${run}/`;
 mkdirSync(join(root,prefix),{recursive:true});
 writeFileSync(join(root,prefix,'UR.md'),'# UR: Synthetic filter requirement\n');
 writeFileSync(join(root,prefix,'BROWNFIELD_REVIEW.md'),'- ux_intent_definition_required: yes\n');
 const state={content:'- revision_id: synthetic-revision\n',approvals:new Map([['UR',{status:'approved'}]]),artefacts:new Map([['UR',{status:'approved',path:prefix+'UR.md'}],['Brownfield Review',{status:'done',path:prefix+'BROWNFIELD_REVIEW.md'}]]),mode_slice_decision:{decision:'structured_delivery'}};
 const target={schema_version:'1',resolution_state:'resolved',reason_code:'continued_target',primary_target:root,governance_target:root,working_directory:root,target_changed:false,next_action:'',authorizes:false};
 const traces=[];
 for(const [label,dir] of [['baseline',old],['candidate',join(repo,'packages/core')]]) {
  const {createSkillDispatchService}=await import(pathToFileURL(join(dir,'lib/skill-dispatch/service.js')));
  const {renderOperationalStatusCard}=await import(pathToFileURL(join(dir,'lib/interaction-presentation.js')));
  const registry=JSON.parse(readFileSync(join(dir,'generated/plugins/agdf/meta/agdf-interaction-locales.json')));
  const definition=JSON.parse(readFileSync(join(dir,'generated/plugins/agdf/meta/agdf-plugin.definition.json')));
  let report={status:'open',current_gate:'PRD',blocking_reason:'none',missing_approval:'Approval: PRD',status_card:{run_id:run,runState:state},doctor_report:{findings:[]},approval_presentation:null,status_presentation:{markdown:'Synthetic status',authorizes:false}};
  const dispatch=createSkillDispatchService({resolveTaskTarget:()=>target,renderTaskTargetOrientation:()=>({markdown:'target'}),evaluateGateCheck:()=>report,env:{}});
  const input={expectedVersion:definition.version,skillSet:definition.skillSet,interactionLocales:registry,skillId:'gate-check',surface:'codex',presentationLanguage:'de',workingDirectory:root,targetSource:'explicit_target',primaryTarget:root,runId:run,continueDelivery:true};
  try{unlinkSync(join(root,prefix,'UX_INTENT_DEFINITION.md'));}catch{}
  const missing=dispatch(input);
  writeFileSync(join(root,prefix,'UX_INTENT_DEFINITION.md'),'Decision: ready\n'); const malformed=dispatch(input);
  writeFileSync(join(root,prefix,'UX_INTENT_DEFINITION.md'),'- decision: blocked\n'); const blocked=dispatch(input);
  const qState={...state,approvals:new Map(['UR','PRD','SD','TP'].map(g=>[g,{status:'approved'}])),artefacts:new Map(['UR','PRD','SD','TP'].map(g=>[g,{status:'approved',path:prefix+g+'.md'}]))};
  for(const step of ['Brownfield Analysis','CD+Tests','CR']) qState.artefacts.set(step,{status:'done',path:step==='CR'?prefix+'CR.md':''});
  writeFileSync(join(root,prefix,'CR.md'),'- decision: pass\n');
  writeFileSync(join(root,prefix,'QA_REPORT.md'),'- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F-01 | implementation_gap | CD+Tests | open | Approved filter test fails | Correct the declared filter assertion |\n');
  qState.artefacts.set('QA',{status:'revise',path:prefix+'QA_REPORT.md'});
  report={...report,current_gate:'QA',missing_approval:'none',blocking_reason:'qa_revise_required',status_card:{run_id:run,runState:qState}};
  if(label==='candidate') {const {evaluateQaFollowUp}=await import(pathToFileURL(join(dir,'lib/control-evaluation/qa-follow-up.js')));Object.defineProperty(report,'qaFollowUp',{value:evaluateQaFollowUp(root,qState,run)});}
  const qa=dispatch(input);
  const card=renderOperationalStatusCard({run_id:run,presentation_language:'de',current_gate:'CD+Tests',status:'open',allowed_now:['implement the approved TP tasks'],forbidden_now:['claim QA pass'],blocking_condition:'none',missing_approval:'none',next_user_gate:'none',user_action_required:'no',internal_next_step:'implement the approved TP tasks',next_step:registry.locales.en.operationalValues.nextCdTestsAfterTpApproval,allowed_after_approval:'none',next_gate_after_approval:'none',quality_outlook:'none'},{registry,humanPresentation:{}});
  assert.ok(card);
  writeFileSync(join(out,`baseline-debug-${label}.json`),JSON.stringify({missing,malformed,blocked,qa,status:card},null,2));
  assert.equal(missing.terminal,label==='baseline');assert.equal(malformed.terminal,label==='baseline');assert.equal(blocked.terminal,true);assert.equal(qa.terminal,label==='baseline');
  assert.equal(card.markdown.includes('Ich arbeite weiter'),label==='baseline');
  traces.push({label,lane:'source behavior; injected synthetic control/target dependencies',missing,malformed,blocked,qa,status:card});
 }
 writeFileSync(join(out,'baseline-comparison.json'),JSON.stringify({at:new Date().toISOString(),base_head:base.head,traces},null,2));
 console.log('Baseline/candidate missing UX, exact-field, QA revise and terminal wording comparison passed.');
} finally {rmSync(temp,{recursive:true,force:true});}
