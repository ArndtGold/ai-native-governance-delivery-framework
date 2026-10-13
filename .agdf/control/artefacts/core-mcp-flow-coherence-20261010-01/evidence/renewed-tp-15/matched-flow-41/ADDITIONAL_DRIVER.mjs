import fs from 'node:fs';import {join} from 'node:path';import {tmpdir} from 'node:os';import {spawnSync} from 'node:child_process';import {randomUUID,createHash} from 'node:crypto';
const repo='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework',before='/private/tmp/agdf-flow-baseline-40';
const home=fs.mkdtempSync(join(tmpdir(),'agdf-matched-corpus-40-'));const events=[];const cases=[];
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const neutral=await import('/private/tmp/agdf-neutral-flow-fixture-40.mjs');
const prd=await import(before+'/packages/cli/scripts/fixtures/prd-definition.js');
const sd=await import(before+'/packages/cli/scripts/fixtures/sd-definition.js');
const edits=await import(before+'/packages/core/lib/control-state/run-state-edits.js');
const parser=await import(before+'/packages/core/lib/control-state/run-state-parser.js');
for(const lane of [process.env.CORPUS_LANE]){
 const source=lane==='before'?before:repo;const dir=join(home,lane);fs.mkdirSync(dir,{recursive:true});
 const core=await import(source+'/packages/core/lib/index.js');const seal=await import(source+'/packages/core/lib/control-state/run-seal.js');
 const stateReader=await import(source+'/packages/core/lib/control-evaluation/run-state.js');const fullPolicy=await import(source+'/packages/core/lib/control-evaluation/gate-policy.js');const writerPolicy=await import(source+'/packages/core/lib/control-evaluation/run-step-policy.js');
 const target=await import(source+'/packages/core/lib/control-state/approval-command-contract.js');const service=core.createCoreServices();
 const traceFile=join(dir,'cli-trace.jsonl');const wrapper=join(dir,'cli-observed.mjs');
 fs.writeFileSync(wrapper,`import {spawnSync} from 'node:child_process';import {appendFileSync} from 'node:fs';
import {readRunState} from ${JSON.stringify(source+'/packages/core/lib/control-evaluation/run-state.js')};import {transitionDecisionForRunState} from ${JSON.stringify(source+'/packages/core/lib/control-evaluation/gate-policy.js')};import {policyForRunContent} from ${JSON.stringify(source+'/packages/core/lib/control-evaluation/run-step-policy.js')};
const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1],root=get('--dir'),run=args.includes('--run')?get('--run'):null;
const out=spawnSync(process.execPath,[${JSON.stringify(source+'/packages/cli/bin/create-agdf.js')},...args],{encoding:'utf8',timeout:30000});let value;try{value=JSON.parse(out.stdout)}catch{};let observation;
try{if(run){const s=readRunState(root,{runId:run}),a=transitionDecisionForRunState(s),w=policyForRunContent(root,s.content,s.path);const pick=x=>({status:x.status,gate:x.current_gate,missing_approval:x.missing_approval});observation={reader:pick(a),writer:pick(w),parity:JSON.stringify(pick(a))===JSON.stringify(pick(w)),lifecycle:(s.content.match(/^- lifecycle: (.+)$/mu)||[])[1]}}}catch(e){observation={unavailable:e.message}}
appendFileSync(${JSON.stringify(traceFile)},JSON.stringify({at:new Date().toISOString(),command:args[0],run,gate:args.includes('--gate')?get('--gate'):null,step:args.includes('--step')?get('--step'):null,operation:args.includes('--operation')?get('--operation'):null,outcome:value?.outcome,reason:value?.reason,exit:out.status,observation})+'\\n');
process.stdout.write(out.stdout??'');process.stderr.write(out.stderr??'');process.exit(out.status??1);`);
 const observe=(f,label,result)=>{let s,a,w;try{s=stateReader.readRunState(f.root,{runId:f.runId});a=fullPolicy.transitionDecisionForRunState(s);w=writerPolicy.policyForRunContent(f.root,s.content,s.path);}catch(e){events.push({lane,case:f.case,label,error:e.message});return;}
  const pick=x=>({status:x.status,gate:x.current_gate,missing_approval:x.missing_approval});events.push({lane,case:f.case,label,outcome:result?.outcome,reason:result?.reason,reader:pick(a),writer:pick(w),parity:JSON.stringify(pick(a))===JSON.stringify(pick(w)),lifecycle:(s.content.match(/^- lifecycle: (.+)$/mu)||[])[1]});};
 const init=name=>{const root=join(dir,name);fs.mkdirSync(root,{recursive:true});fs.mkdirSync(join(root,'.git'));const git=spawnSync('git',['init','-q',root],{encoding:'utf8'});if(git.status!==0)throw Error(git.stderr);const out=spawnSync(process.execPath,[wrapper,'init','--dir',root,'--language','en'],{encoding:'utf8',timeout:30000});if(out.status!==0)throw Error(out.stderr);return root;};
 const own=f=>({...f,case:f.runId,root:f.root,manual_control_edits:1});
 const recordGate=(f,gate,status='draft')=>{const from=gate==='QA'?'QA_REPORT':gate,to=gate==='PRD'?'UR':gate==='SD'?'PRD':gate==='TP'?'SD':'TP',relationship={from,relationship:gate==='QA'?'tests':'derived_from',to};
  const destination={type:from,path:f.prefix+from+'.md',digest:seal.artefactFileDigest(f.root,f.prefix+from+'.md'),status},src={type:to,path:f.prefix+to+'.md',digest:seal.artefactFileDigest(f.root,f.prefix+to+'.md')};
  const proof=f.prefix+'mapping-'+randomUUID()+'.json',request=f.prefix+'record-'+randomUUID()+'.json',reviewer='neutral matched corpus reviewer';
  fs.writeFileSync(join(f.root,proof),JSON.stringify({schema_version:'1',target_id:target.resolveControlCommandTarget(f.root).target_id,run_id:f.runId,relationship,destination,source:src,reviewer,reviewed:true}));
  const input={schema_version:'1',target_id:target.resolveControlCommandTarget(f.root).target_id,run_id:f.runId,expected_revision_id:f.revision(),destination,source:src,relationship,review:{reviewer,path:proof,digest:seal.artefactFileDigest(f.root,proof)},update_draft:false};fs.writeFileSync(join(f.root,request),JSON.stringify(input));
  const r=f.run('run-step','--revision',f.revision(),'--step','artefact','--gate',gate,'--evidence',request);if(r.value?.outcome!=='recorded')throw Error(r.text);observe(f,'record '+gate,r.value);return r.value;};
 const envelope=f=>({schema_version:'1',presentation_language:'en',working_directory:f.root,primary_target:f.root,target_source:'explicit_target',target_id:target.resolveControlCommandTarget(f.root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),assurance:'cooperative_local'});
 const internal=(f,step)=>{const path=f.prefix+step.replaceAll(' ','_').replaceAll('+','_')+'.md';fs.writeFileSync(join(f.root,path),'# '+step+'\n- decision: pass\nSynthetic neutral fixture fact; no real delivery or human approval.\n');let r;
  if(lane==='after'){r=service.command('agdf_record',{...envelope(f),command:{kind:'step.record',payload:{step:'internal',internal_step:step,decision:'pass',source:{path,digest:seal.artefactFileDigest(f.root,path)}}}});if(r.outcome!=='accepted')throw Error(JSON.stringify(r));}
  else{fs.writeFileSync(f.state,edits.upsertTableRow(fs.readFileSync(f.state,'utf8'),'Artefacts',0,step,[step,path,'done','Neutral synthetic fixture result']));f.manual_control_edits++;r=f.run('run-update','--revision',f.revision()).value;if(r?.outcome!=='updated')throw Error(JSON.stringify(r));}
  observe(f,'internal '+step,r);};
 const finish=f=>{for(const step of ['CD+Tests','TP Review','Clean Implementation Review','CR'])internal(f,step);
  fs.writeFileSync(f.file('QA_REPORT.md'),'# QA: Neutral synthetic completed checks\n- decision: pass\n\n## Evidence\nThe neutral fixture records its planned synthetic checks and reviews. No actual delivery QA is approved.\n');recordGate(f,'QA','pass');
  for(const gate of ['QA','UAT']){const p=f.present(gate);if(p.value?.outcome!=='prepared')throw Error(p.text);const a=f.approve(gate,p.value.presentation_id);if(a.value?.outcome!=='accepted')throw Error(a.text);observe(f,'approve '+gate,a.value);}
  const s=stateReader.readRunState(f.root,{runId:f.runId});const rows=['UR','Brownfield Review','PRD','SD','TP','Brownfield Analysis','CD+Tests','CR','QA','UAT'].map(t=>`| ${t} | ${s.approvals.get(t)?.status??s.artefacts.get(t)?.status} | ${s.artefacts.get(t)?.path||s.approvals.get(t)?.evidence} |`).join('\n');
  const report=`# OR: Neutral matched full chain\nReport mode: OR-full\nStatus: done\n## Run\n- run_id: ${f.runId}\n- related_ur: ${f.prefix}UR.md\n- related_prd: ${f.prefix}PRD.md\n- related_sd: ${f.prefix}SD.md\n- related_tp: ${f.prefix}TP.md\n- related_qa_report: ${f.prefix}QA_REPORT.md\n- mode_slice_decision: structured_delivery\n- current_gate: OR\n- decision: pass\n## Gate State\n| Gate or step | Status | Evidence |\n|---|---|---|\n${rows}\n## Delivered\nSynthetic common fixture intent.\n## Not Delivered / Intentionally Deferred\nnone\n## Evidence\nSynthetic source-bound checks and gate replies.\n## Missing Evidence\nnone\n## Risks And Open Items\nnone\n## Context Graph Impact\n- context_graph_impact: none\n- context_graph_refs: none\n- context_graph_reconciliation: not_applicable\n- context_graph_required_action: none\n- context_graph_gate_effect: none\n- context_graph_evidence: Isolated fixture changes no graph.\n## Knowledge Persistence Decision\n- memory_target: none\n- memory_reason: Disposable synthetic fixture.\n- memory_refs: none\n## Next Permissible Step\n- next_allowed_action: No VCS action.\n- required_approval: none\n- forbidden_until_then: Any automatic Git or release action.\n`;const path=f.prefix+'OR_CANDIDATE.md';fs.writeFileSync(join(f.root,path),report);let r;
  if(lane==='after'){const {closeoutConfirmation}=awaitedClose;const input={...envelope(f),command:{kind:'closeout.record',payload:{or:{path,digest:seal.artefactFileDigest(f.root,path)},confirmation:''}}};input.command.payload.confirmation=closeoutConfirmation(f.runId,input.expected_revision_id,input.operation_id,input.command.payload.or.digest);r=service.command('agdf_closeout',input);if(r.outcome!=='accepted')throw Error(JSON.stringify(r));const replay=service.command('agdf_closeout',input);observe(f,'closeout original UUID replay',replay);}
  else{fs.writeFileSync(f.file('OR.md'),report);let txt=fs.readFileSync(f.state,'utf8');txt=edits.upsertTableRow(txt,'Artefacts',0,'OR',['OR',f.prefix+'OR.md','done','Neutral full closeout']);txt=edits.replaceFirstScalar(txt,'lifecycle','completed');txt=edits.replaceFirstScalar(txt,'status','done')??txt;txt=edits.replaceFirstScalar(txt,'current_gate','OR')??txt;fs.writeFileSync(f.state,txt);f.manual_control_edits++;r=f.run('run-update','--revision',f.revision()).value;if(r?.outcome!=='updated')throw Error(JSON.stringify(r));}
  observe(f,'structured closeout',r);return {run:f.runId,manual_control_edits:f.manual_control_edits,lifecycle:parser.parseRunState(stateReader.readRunState(f.root,{runId:f.runId}).content,f.runId).meta.lifecycle};};
 const awaitedClose=lane==='after'?await import(source+'/packages/core/lib/control-evaluation/closeout-readiness.js'):null;
 const revOwner=await import(source+'/packages/core/lib/control-state/run-revision.js');
 const historyOwner=await import(source+'/packages/core/lib/control-state/run-revision-history.js');
 const approvalOwner=await import(source+'/packages/core/lib/control-state/approval-command.js');
 const approvalLedger=await import(source+'/packages/core/lib/control-state/approval-operations.js');
 const gateCheck=await import(source+'/packages/core/lib/control-evaluation/gate-check.js');
 const early=await import(before+'/packages/cli/scripts/fixtures/early-ur-revision.js');
 const revisionReceipts=await import(source+'/packages/core/lib/control-state/run-source-revisions.js');
 const ensure=(value,message)=>{if(!value)throw Error(message);};
 const proposalRevision=(f,p)=>{
  let preview,applied,replay;
  if(lane==='before'){
   preview=f.run('run-revise','--preview','--revision',p.input.revisionId,'--source-gate',p.input.sourceGate,'--operation',p.input.operationId,'--evidence',p.input.evidence).value;
   ensure(preview?.outcome==='preview',JSON.stringify(preview));
   applied=f.run('run-revise','--apply','--revision',p.input.revisionId,'--source-gate',p.input.sourceGate,'--operation',p.input.operationId,'--evidence',p.input.evidence,'--preview-digest',preview.preview_digest).value;
   ensure(applied?.outcome==='reopened',JSON.stringify(applied));
   replay=f.run('run-revise','--apply','--revision',p.input.revisionId,'--source-gate',p.input.sourceGate,'--operation',p.input.operationId,'--evidence',p.input.evidence,'--preview-digest',preview.preview_digest).value;
   ensure(replay?.outcome==='replayed',JSON.stringify(replay));
  }else{
   const base={...envelope(f),operation_id:p.input.operationId},payload={source_gate:p.input.sourceGate,proposal:{path:p.input.evidence,digest:seal.artefactFileDigest(f.root,p.input.evidence)}};
   preview=service.command('agdf_revise',{...base,command:{kind:'source_revision.preview',payload}});ensure(preview.outcome==='accepted',JSON.stringify(preview));
   const command={...base,command:{kind:'source_revision.apply',payload:{...payload,preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}};
   applied=service.command('agdf_revise',command);ensure(applied.outcome==='accepted',JSON.stringify(applied));
   replay=service.command('agdf_revise',command);ensure(replay.outcome==='already_applied',JSON.stringify(replay));
  }
  observe(f,'source revision applied',applied);observe(f,'source revision same UUID replay',replay);
  const inspected=revOwner.inspectSourceRevision(f.root,{...p.input,revisionId:f.revision()});ensure(inspected.outcome==='historical',JSON.stringify(inspected));
  const receipt=revisionReceipts.readSourceRevisions(fs.readFileSync(f.state,'utf8')).receipts.find(x=>x.operation_id===p.input.operationId);ensure(historyOwner.validateRevisionHistory(f.root,receipt),'archive validation failed');
  const manifest=inspected.history.manifest;const archived=manifest.files.find(x=>x.path===f.prefix+p.input.sourceGate+'.md');ensure(!!archived,'source archive missing');
  const original=historyOwner.readHistoryBytes(f.root,archived.snapshot);const archiveDigest=digest(original);
  events.push({lane,case:f.case,label:'current/history lookup',operation:p.input.operationId,archive_digest:archiveDigest,archive_valid:true,authorizes:inspected.authorizes});
  return {receipt,archiveDigest,archived};
 };
 const approveLostAndConflict=(f,gate)=>{
  const prepared=f.present(gate).value;ensure(prepared?.outcome==='prepared',JSON.stringify(prepared));
  const original={schema_version:'1',action:'record_gate_approval',target_id:target.resolveControlCommandTarget(f.root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),assurance:'cooperative_local',gate,presentation_id:prepared.presentation_id,response:'Approval: '+gate};
  let lost,replay;
  if(lane==='before'){
   lost=approvalOwner.executeApprovalCommand(f.root,original,{evaluateGateCheck:gateCheck.evaluateGateCheck,packageVersion:'0.14.5',checkpoint(stage){if(stage==='before_response')throw Error('matched synthetic acknowledgement loss');}});
   ensure(lost.outcome==='recovery_required'&&lost.reason==='commit_acknowledgement_unconfirmed',JSON.stringify(lost));
   const observed=approvalLedger.readApprovalOperations(fs.readFileSync(f.state,'utf8')).receipts.filter(x=>x.operation_id===original.operation_id);ensure(observed.length===1,'lost acknowledgement receipt not singular');
   replay=approvalOwner.executeApprovalCommand(f.root,original,{evaluateGateCheck:gateCheck.evaluateGateCheck,packageVersion:'0.14.5'});
  }else{
   const commands=awaitedCommands;const input={...envelope(f),operation_id:original.operation_id,expected_revision_id:original.expected_revision_id,command:{kind:'approval.record',payload:{gate,presentation_id:original.presentation_id,response:original.response}}};
   lost=commands.createRunCommandService({checkpoint(stage){if(stage==='before_result')throw Error('matched synthetic acknowledgement loss');}})('agdf_approve',input);ensure(lost.outcome==='effect_unknown',JSON.stringify(lost));
   const status=awaitedStatus.inspectRunOperation(f.root,{runId:f.runId,operationId:original.operation_id,targetId:original.target_id});ensure(status.status==='recorded',JSON.stringify(status));
   replay=service.command('agdf_approve',input);
  }
  ensure(replay.outcome==='already_applied',JSON.stringify(replay));observe(f,'lost acknowledgement original UUID recovery',replay);
  const second={...original,operation_id:randomUUID()};const conflict=approvalOwner.executeApprovalCommand(f.root,second,{evaluateGateCheck:gateCheck.evaluateGateCheck,packageVersion:'0.14.5'});
  ensure(conflict.outcome==='rejected',JSON.stringify(conflict));
  const receipts=approvalLedger.readApprovalOperations(fs.readFileSync(f.state,'utf8')).receipts.filter(x=>x.binding.presentation_id===original.presentation_id);ensure(receipts.length===1,'duplicate effect');
  events.push({lane,case:f.case,label:'two caller same material conflict',outcome:conflict.outcome,reason:conflict.reason,receipt_count:receipts.length,evidence_class:'synthetic_core_callers_not_actual_native_click'});
  return {recovery:replay.outcome,conflict:conflict.reason,receipts:receipts.length};
 };
 const awaitedCommands=lane==='after'?await import(source+'/packages/core/lib/control-state/run-command-service.js'):null;
 const awaitedStatus=lane==='after'?await import(source+'/packages/core/lib/control-state/run-operation-status.js'):null;
 const runCase=(name,work)=>{if(process.env.CORPUS_CASE&&process.env.CORPUS_CASE!==name)return;try{const result=work();cases.push({lane,case:name,status:'executed',...result});}catch(e){cases.push({lane,case:name,status:'failed',error:e.message});}fs.writeFileSync(join(home,'PROGRESS.json'),JSON.stringify({home,cases,events},null,2)+'\n');};
 runCase('revised-source-completed-ux',()=>{
  const root=init('revised-source-completed-ux'),f=own(neutral.createLateSourceRevisionTestRun(root,wrapper,'revised-source-completed-ux'));
  const ux=f.prefix+'UX_INTENT_DEFINITION.md';fs.writeFileSync(join(root,ux),'# UX Intent Definition\n- decision: ready\nSynthetic saved-filter intent; personal ownership and restore remain unchanged.\n');
  // Shared neutral pre-existing analytical input belongs to fixture setup, not a routine current writer.
  fs.writeFileSync(f.state,edits.upsertTableRow(fs.readFileSync(f.state,'utf8'),'Artefacts',0,'UX Intent Definition',['UX Intent Definition',ux,'done','Neutral pre-existing analytical fixture input']));f.manual_control_edits++;ensure(f.run('run-update','--revision',f.revision()).value.outcome==='updated','initial UX registration failed');
  const p=f.proposal('TP','reassess'),history=proposalRevision(f,p);
  ensure(f.run('run-step','--revision',f.revision(),'--step','route','--route','structured_delivery','--reason','Renewed synthetic analytical context','--evidence',f.prefix+'BROWNFIELD_REVIEW.md').value.outcome==='recorded','renewed route failed');observe(f,'renewed route pending UX');
  const ux2=f.prefix+'UX_RENEWED.md';fs.writeFileSync(join(root,ux2),'# UX Intent Definition\n- decision: ready\nFresh synthetic saved-filter intent under the renewed TP.\n');
  if(lane==='before'){fs.writeFileSync(f.state,edits.upsertTableRow(fs.readFileSync(f.state,'utf8'),'Artefacts',0,'UX Intent Definition',['UX Intent Definition',ux2,'done','Renewed synthetic analytical input']));f.manual_control_edits++;ensure(f.run('run-update','--revision',f.revision()).value.outcome==='updated','renewed UX record failed');}
  else{const result=service.command('agdf_record',{...envelope(f),command:{kind:'step.record',payload:{step:'internal',internal_step:'UX Intent Definition',decision:'ready',source:{path:ux2,digest:seal.artefactFileDigest(root,ux2)}}}});ensure(result.outcome==='accepted',JSON.stringify(result));}
  observe(f,'renewed completed UX before TP');
  fs.writeFileSync(f.file('TP.md'),neutral.syntheticTp()+'\nRenewed test intent: cover restoring after a second saved value.\n');recordGate(f,'TP');
  const decision=approveLostAndConflict(f,'TP');
  ensure(digest(historyOwner.readHistoryBytes(root,history.archived.snapshot))===history.archiveDigest,'history rewritten by renewed TP');ensure(historyOwner.validateRevisionHistory(root,history.receipt),'history invalid after renewal');
  if(lane==='before')f.prepareImplementation();else internal(f,'Brownfield Analysis');
  const done=finish(f);return {...done,history_preserved:true,decision};
 });
 runCase('early-ur-at-sd',()=>{
  const root=init('early-ur-at-sd'),f=own(early.createEarlyUrRevisionTestRun(root,wrapper,'early-ur-at-sd')),previous=f.revision(),p=f.proposal();
  const history=proposalRevision(f,p);ensure(gateCheck.evaluateGateCheck(root,{runId:f.runId}).current_gate==='UR','early revision did not return UR');
  fs.writeFileSync(f.file('UR.md'),fs.readFileSync(f.file('UR.md'),'utf8')+'\nRenewed synthetic need: name the personal saved filter clearly.\n');ensure(f.run('run-step','--revision',f.revision(),'--step','ur','--title','Renewed synthetic personal filter').value.outcome==='recorded','new UR not recorded');
  const prepared=f.present('UR').value;ensure(prepared.outcome==='prepared','UR not presentable');ensure(f.approve('UR',prepared.presentation_id).value.outcome==='accepted','new UR decision failed');observe(f,'renewed UR approval');
  ensure(historyOwner.validateRevisionHistory(root,history.receipt),'early archived history invalid');return {previous_revision:previous,gate:gateCheck.evaluateGateCheck(root,{runId:f.runId}).current_gate,history_preserved:true,manual_control_edits:0};
 });
 runCase('quick-closeout',()=>{
  const root=init('quick-closeout'),run='quick-closeout',prefix='.agdf/control/artefacts/'+run+'/',state=join(root,'.agdf/control/runs/'+run+'/RUN_STATE.md');
  const call=(command,...args)=>{const r=spawnSync(process.execPath,[wrapper,command,'--dir',root,'--run',run,'--json',...args],{encoding:'utf8'});let value;try{value=JSON.parse(r.stdout)}catch{value={non_json_output:true,exit:r.status}};return {value,text:r.stdout+r.stderr};};
  const created=call('run-create');ensure(created.value.exit===0&&fs.existsSync(state),'quick run not created');fs.mkdirSync(join(root,prefix),{recursive:true});
  const f={root,runId:run,prefix,state,case:'quick-closeout',manual_control_edits:0,file:n=>join(root,prefix+n),run:call,revision:()=>fs.readFileSync(state,'utf8').match(/^- revision_id: (.+)$/mu)[1]};
  fs.writeFileSync(f.file('UR.md'),'# UR: Synthetic subtraction\n## Problem\nOne bounded subtraction operation is missing.\n## Goal\nProvide the operation with a direct regression.\n## Scope\nOne function and its test.\n');ensure(call('run-step','--revision',f.revision(),'--step','ur','--title','Synthetic subtraction').value.outcome==='recorded','quick UR failed');
  fs.writeFileSync(f.file('BROWNFIELD_REVIEW.md'),'# Brownfield Review\nSynthetic one-function scope; no policy, public contract or shared ownership change.\n');ensure(call('run-step','--revision',f.revision(),'--step','route','--route','quick_task','--reason','One bounded function and its direct regression','--evidence',prefix+'BROWNFIELD_REVIEW.md').value.outcome==='recorded','quick route failed');
  const presented=call('run-present','--revision',f.revision(),'--gate','UR','--language','en').value;ensure(presented.outcome==='prepared','quick UR not presentable');ensure(call('run-approve','--revision',f.revision(),'--gate','UR','--presentation',presented.presentation_id,'--response','Approval: UR','--operation',randomUUID()).value.outcome==='accepted','quick decision failed');
  fs.writeFileSync(f.file('CR.md'),'# Code Review\n- decision: pass\nSynthetic bounded operation and direct regression.\n');
  if(lane==='before')ensure(call('run-step','--revision',f.revision(),'--step','review','--decision','pass','--evidence','Synthetic bounded checks passed','--source',prefix+'CR.md').value.outcome==='recorded','quick CR failed');
  else{const r=service.command('agdf_record',{...envelope(f),command:{kind:'step.record',payload:{step:'review',decision:'pass',source:{path:prefix+'CR.md',digest:seal.artefactFileDigest(root,prefix+'CR.md')}}}});ensure(r.outcome==='accepted',JSON.stringify(r));}
  let result;
  if(lane==='before')result=call('run-step','--revision',f.revision(),'--step','closeout','--result','Synthetic bounded operation and regression complete','--evidence','Disposable synthetic result','--risk','none','--next','No automatic VCS action').value;
  else{const path=prefix+'OR_CANDIDATE.md';fs.writeFileSync(join(root,path),'# OR-lite: Synthetic subtraction\nReport mode: OR-lite\nRun: '+run+'\n## Result\nSynthetic bounded operation and regression complete.\n## Evidence\nDisposable synthetic result.\n## Risk\nnone\n## Next Step\nNo automatic VCS action.\n');const input={...envelope(f),command:{kind:'closeout.record',payload:{or:{path,digest:seal.artefactFileDigest(root,path)},confirmation:''}}};input.command.payload.confirmation=awaitedClose.closeoutConfirmation(run,input.expected_revision_id,input.operation_id,input.command.payload.or.digest);result=service.command('agdf_closeout',input);}
  ensure(['recorded','accepted'].includes(result.outcome),JSON.stringify(result));observe(f,'Quick closeout',result);return {lifecycle:parser.parseRunState(fs.readFileSync(state,'utf8'),run).meta.lifecycle,manual_control_edits:0};
 });
 fs.writeFileSync(join(home,'PROGRESS.json'),JSON.stringify({home,cases,events},null,2)+'\n');
}
const allCli=[];for(const lane of [process.env.CORPUS_LANE]){const p=join(home,lane,'cli-trace.jsonl');if(fs.existsSync(p))for(const l of fs.readFileSync(p,'utf8').trim().split('\n'))if(l)allCli.push({lane,...JSON.parse(l)});}
const out={schema_version:'1',evidence_class:'actual_controlled_baseline_current_flow_traces_not_native_or_model_benchmark',home,cases,events,cli:allCli,model_metrics:{undocumented_invocation_searches:null,parser_searches:null,weak_model_improvement:null},full_fixed_corpus_complete:false};fs.writeFileSync(join(home,'RESULT.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync('/private/tmp/agdf-matched-corpus-root-41-'+process.env.CORPUS_LANE+(process.env.CORPUS_CASE?'-'+process.env.CORPUS_CASE:'')+'.txt',home);console.log(JSON.stringify({home,cases,trace_events:events.length,cli_invocations:allCli.length}));
