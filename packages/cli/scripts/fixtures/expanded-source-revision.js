import { withSyntheticQaContent } from '../../../core/test/fixtures/decision-content.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createPrdDefinitionTestRun, syntheticPrd } from './prd-definition.js';
import { syntheticSd } from './sd-definition.js';
import { syntheticTp, sourceRevisionTestProposal } from './late-source-revision.js';
import { createCoreServices } from '../../../core/lib/index.js';
import { readRunState } from '../../../core/lib/control-evaluation/run-state.js';
import { sourceRevisionQualityFacts } from '../../../core/lib/control-state/run-source-revisions.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../../../core/lib/control-state/run-seal.js';
import { relationshipForGate } from '../../../core/lib/control-evaluation/delivery-relationships.js';

// Disposable canonical phase seeds shared by Core, CLI and actual STDIO transport tests.
export function createExpandedSourceRevisionFixture(root, cli, seeds) {
  const f = createPrdDefinitionTestRun(root, cli, 'expanded-revision', process.env, {typedApprovals:true,typedRoute:true});
  const service = createCoreServices().command, state = () => readRunState(root, {runId:f.runId});
  const read = path => { try {return readFileSync(join(root,path),'utf8');} catch {return undefined;} };
  const envelope = () => ({schema_version:'1',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',
    target_id:resolveControlCommandTarget(root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),assurance:'cooperative_local'});
  const record = (gate, text) => {
    const relation = relationshipForGate(gate), type = gate === 'QA' ? 'QA_REPORT' : gate, path = f.prefix+type+'.md';
    writeFileSync(join(root,path),text);
    const proof = f.prefix+randomUUID()+'.json', request = f.prefix+randomUUID()+'.json';
    const input = {schema_version:'1',target_id:envelope().target_id,run_id:f.runId,expected_revision_id:f.revision(),
      destination:{type,path,digest:artefactFileDigest(root,path),status:gate === 'QA' ? 'pass' : 'draft'},
      source:{type:relation.to,path:f.prefix+relation.to+'.md',digest:artefactFileDigest(root,f.prefix+relation.to+'.md')},
      relationship:{from:relation.from,relationship:relation.relationship,to:relation.to},review:{reviewer:'Synthetic expanded-revision reviewer',path:proof,digest:''},update_draft:false};
    const {schema_version,target_id,run_id,destination,source,relationship}=input;
    writeFileSync(join(root,proof),JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer:input.review.reviewer,reviewed:true}));
    input.review.digest=artefactFileDigest(root,proof);writeFileSync(join(root,request),JSON.stringify(input));
    const r=service('agdf_record',{...envelope(),command:{kind:'artefact.record',payload:{gate,reviewed_request:{path:request,digest:artefactFileDigest(root,request)}}}});
    assert.equal(r.outcome,'accepted',JSON.stringify(r));
  };
  const approve = gate => {const p=service('agdf_prepare',{...envelope(),command:{kind:'presentation.prepare',payload:{gate}}});assert.equal(p.outcome,'accepted',JSON.stringify(p));
    const r=service('agdf_approve',{...envelope(),command:{kind:'approval.record',payload:{gate,presentation_id:p.family_result.presentation_id,response:'Approval: '+gate}}});assert.equal(r.outcome,'accepted',JSON.stringify(r));};
  const save = phase => { assert.equal(state().current_gate,phase);cpSync(join(root,'.agdf'),join(seeds,phase.replace('+','_')),{recursive:true}); };
  const restore = phase => {rmSync(join(root,'.agdf'),{recursive:true});cpSync(join(seeds,phase.replace('+','_')),join(root,'.agdf'),{recursive:true});};
  save('PRD');record('PRD',syntheticPrd());approve('PRD');save('SD');record('SD',syntheticSd());approve('SD');save('TP');record('TP',syntheticTp());approve('TP');
  for (const step of ['Brownfield Analysis','CD+Tests','TP Review','Clean Implementation Review','CR']) {
    const path=f.prefix+randomUUID()+'.md';writeFileSync(join(root,path),'# '+step+'\n- decision: pass\nSynthetic actual fixture result.\n');
    const r=service('agdf_record',{...envelope(),command:{kind:'step.record',payload:{step:'internal',internal_step:step,decision:'pass',source:{path,digest:artefactFileDigest(root,path)}}}});
    assert.equal(r.outcome,'accepted',JSON.stringify(r));if(step==='Brownfield Analysis')save('CD+Tests');
  }
  save('QA');record('QA',withSyntheticQaContent('# QA: Synthetic expanded-revision report\n- decision: pass\n\n## Scope\nFixture scope fulfilled.\n## Evidence\nActual fixture results registered.\n## Risks\nNo applicable open finding.\n'));approve('QA');save('UAT');
  const prepare = gate => {
    const s=state(), p=sourceRevisionTestProposal(root,{...f,control:()=>s},gate,'reassess');
    const source=p.value.sources.find(row=>row.type===gate), statement=read(source.path).replace(/^\uFEFF/,'').split('\n').find(line=>line.trim());
    Object.assign(p.value,{schema_version:'2',policy_version:2,initiating_phase:s.current_gate,
      changed_statements:[{...source,statement,intended_change:'Clarify the concrete fixture statement',reason:'Actual fixture source change'}],
      quality_assessment:sourceRevisionQualityFacts(s,read).map(row=>({...row,disposition:'reassess',reason:'Renew affected or unassociated current proof under the changed source'}))});
    writeFileSync(join(root,p.input.evidence),JSON.stringify(p.value));
    const input={...envelope(),operation_id:p.input.operationId,command:{kind:'source_revision.preview',payload:{source_gate:gate,proposal:{path:p.input.evidence,digest:artefactFileDigest(root,p.input.evidence)}}}};
    return {p,input,preview:service('agdf_revise',input)};
  };
  return {f,service,state,read,envelope,record,approve,save,restore,prepare};
}
export const SOURCE_PHASE_MATRIX={UR:['PRD','SD','TP','CD+Tests','QA','UAT'],PRD:['SD','TP','CD+Tests','QA','UAT'],SD:['TP','CD+Tests','QA','UAT'],TP:['CD+Tests','QA','UAT']};
