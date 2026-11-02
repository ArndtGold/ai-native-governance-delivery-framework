import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
import {parseRunState,parseControlState} from '../../../../packages/core/lib/control-state/run-state-parser.js';
import {inspectDefinitionSources} from '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-8f578728e735/runtime/create-agdf/runtime/core/lib/control-evaluation/definition-sources.js';
const base='.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/',manifest=JSON.parse(readFileSync(base+'FINAL_NATIVE_FIXTURES-01.json')),name=process.argv[2],e=manifest.entries.find(x=>x.name===name);if(!e||name.startsWith('qa-'))throw Error('Unknown UX test');
const state=e.target+`/.agdf/control/runs/${e.run_id}/RUN_STATE.md`,file=e.target+'/'+e.prefix+'UX_INTENT_DEFINITION.md',revision=()=>readFileSync(state,'utf8').match(/^- revision_id: (.+)$/m)[1];
if(revision()!==e.revision_id)throw Error('Changed prepared current binding');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),ur=sha(e.target+'/'+e.prefix+'UR.md'),stateBefore=readFileSync(state,'utf8'),log=[];
const facts=()=>inspectDefinitionSources(e.target,parseControlState(parseRunState(readFileSync(state,'utf8'),e.run_id).content,{userGates:['UR','PRD','SD','TP','QA','UAT'],internalSteps:['Brownfield Review','UX Intent Definition','Brownfield Analysis','CD+Tests','CR']}),e.run_id,'PRD',['UR','Brownfield Review']);
const before=facts();
if(name==='unchanged-ux'){
 const original=readFileSync(file,'utf8');
 // Deliberate ineffective correction is the prepared negative test input, not a production fix.
 writeFileSync(file,original.replace('Decision: ready','- Decision: ready'));
 const after=facts();if(before.issue?.code!=='ux_decision_malformed'||after.issue?.code!==before.issue.code)throw Error('Failure injection did not remain unchanged');
 if(readFileSync(state,'utf8')!==stateBefore)throw Error('Unexpected progress recording');
 writeFileSync(base+'FINAL_UNCHANGED_STOP-01.json',JSON.stringify({at:new Date().toISOString(),target:e.target,run:e.run_id,revision:e.revision_id,validator:'installed exact candidate definition-source owner',before,after,correction_attempts:1,decision:'stop this fixture; no canonical recording, dependent PRD or redispatch',control_unchanged:true,UR_unchanged:sha(e.target+'/'+e.prefix+'UR.md')===ur},null,2)+'\n');
 console.log('Unchanged correction diagnosed; this fixture stops without recording or redispatch.');
}else{
 const approvedInputs=readFileSync(e.target+'/'+e.prefix+'TEST_SCENARIO.json','utf8');if(!approvedInputs.includes('One operator'))throw Error('Complete explicit scenario absent');
 const analysis=readFileSync('/private/tmp/agdf-gate-qualification-414UKY/missing-ux/.agdf/control/artefacts/native-missing-ux/UX_INTENT_DEFINITION.md','utf8').replaceAll('TEST_SCENARIO-02.json','TEST_SCENARIO.json');
 writeFileSync(file,analysis);
 const validated=facts();if(validated.issue?.code!=='ux_source_unrecorded')throw Error('Ready analysis not validated before recording: '+JSON.stringify(validated));
 writeFileSync(state,upsertTableRow(stateBefore,'Artefacts',0,'UX Intent Definition',['UX Intent Definition',e.prefix+'UX_INTENT_DEFINITION.md','done','Actual same-agent analysis from complete explicit synthetic scenario']));
 const cli='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-8f578728e735/runtime/agdf-local.js';
 const r=spawnSync(process.execPath,[cli,'run-update','--dir',e.target,'--run',e.run_id,'--revision',e.revision_id,'--json'],{encoding:'utf8'});if(r.status!==0)throw Error(r.stdout+r.stderr);log.push(JSON.parse(r.stdout));
 const after=facts();if(after.issue)throw Error(JSON.stringify(after));
 if(name==='resume-ux'){
  const checkpoint=readFileSync(state,'utf8');
  const stale=spawnSync(process.execPath,[cli,'run-step','--dir',e.target,'--run',e.run_id,'--revision',e.revision_id,'--step','evidence','--evidence','Attempted stale checkpoint replay; must reject','--json'],{encoding:'utf8'});
  const value=JSON.parse(stale.stdout);if(stale.status===0||readFileSync(state,'utf8')!==checkpoint)throw Error('Stale replay mutated current control');log.push({stale_replay:value,exit_code:stale.status});
 }
 if(sha(e.target+'/'+e.prefix+'UR.md')!==ur)throw Error('Approved source changed');
 writeFileSync(base+'FINAL_UX_'+name+'-01.json',JSON.stringify({at:new Date().toISOString(),target:e.target,run:e.run_id,revision_before:e.revision_id,revision_after:revision(),before,validated,after,canonical:log,checkpoint:'stop before reevaluation; next actual tool must bind current revision',UR_unchanged:true,lane:'actual same-agent desktop execution; not independent fresh model interruption'},null,2)+'\n');
 console.log(JSON.stringify({name,revision:revision(),validation:'ready and canonically recorded',stale_replay:name==='resume-ux'?'rejected without write':'not_applicable'}));
}
