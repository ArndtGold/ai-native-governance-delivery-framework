import assert from 'node:assert/strict';
import {createExpandedSourceRevisionFixture,SOURCE_PHASE_MATRIX} from '../../cli/scripts/fixtures/expanded-source-revision.js';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { syntheticPrd } from '../../cli/scripts/fixtures/prd-definition.js';
import { syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { syntheticTp } from '../../cli/scripts/fixtures/late-source-revision.js';
import { readSourceRevisions } from '../lib/control-state/run-source-revisions.js';
import { sourceRevisionBoundary } from '../lib/control-state/run-revision-boundary.js';
import { artefactFileDigest, runSealState } from '../lib/control-state/run-seal.js';
import { validateRevisionHistory } from '../lib/control-state/run-revision-history.js';

const root = mkdtempSync(join(tmpdir(), 'agdf-expanded-revision-')), seeds = mkdtempSync(join(tmpdir(), 'agdf-expanded-seeds-'));
try {
  const cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const {f,service,state,read,envelope,record,approve,restore,prepare}=createExpandedSourceRevisionFixture(root,cli,seeds);
  const matrix=SOURCE_PHASE_MATRIX;let cells=0;
  for(const [gate,phases] of Object.entries(matrix))for(const phase of phases){
    restore(phase);const before=readFileSync(f.state,'utf8'), old=state();const {p,input,preview}=prepare(gate);
    assert.equal(preview.outcome,'accepted',JSON.stringify({gate,phase,preview}));assert.equal(readFileSync(f.state,'utf8'),before,'Preview is read-only');
    if(phase==='UAT')assert.equal(sourceRevisionBoundary(old,gate),null,'Legacy predicate must not acquire expanded authority');
    const applied={...input,command:{kind:'source_revision.apply',payload:{...input.command.payload,preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}};
    const result=service('agdf_revise',applied);assert.equal(result.outcome,'accepted',JSON.stringify({gate,phase,result}));
    const after=state(), receipt=readSourceRevisions(after.content).receipts.at(-1);
    assert.equal(receipt.schema_version,'3');assert.equal(receipt.policy_version,2);assert.equal(receipt.initiating_phase,phase);assert.equal(validateRevisionHistory(root,receipt),true);
    assert.equal(runSealState(root,after.content).status,'valid');assert.equal(after.approvals.get('QA').status,'missing');assert.equal(after.approvals.get('UAT').status,'missing');
    for(const type of ['UR','PRD','SD','TP'].slice(0,['UR','PRD','SD','TP'].indexOf(gate)))assert.deepEqual(after.approvals.get(type),old.approvals.get(type));
    assert.equal(service('agdf_revise',applied).outcome,'already_applied');assert.equal(readSourceRevisions(state().content).receipts.length,1);cells++;
    const tampered={...receipt,initiating_phase:phase==='QA'?'CD+Tests':'QA'};assert.equal(validateRevisionHistory(root,tampered),false,'Archive pins original phase');
  }
  assert.equal(cells,18);
  for(const mutate of [p=>p.initiating_phase='QA',p=>p.policy_version=1,p=>p.changed_statements[0].statement='Not in source',p=>p.changed_statements=[],p=>p.quality_assessment=[],p=>p.quality_assessment[0].disposition='retain',p=>p.impact_assessment.upstream[0].rationale='',p=>p.impact_assessment.earliest_source='UR']){
    restore('CD+Tests');const {p,input}=prepare('TP');mutate(p.value);writeFileSync(join(root,p.input.evidence),JSON.stringify(p.value));input.command.payload.proposal.digest=artefactFileDigest(root,p.input.evidence);
    const before=readFileSync(f.state,'utf8');assert.equal(service('agdf_revise',input).outcome,'rejected');assert.equal(readFileSync(f.state,'utf8'),before);
  }
  restore('CD+Tests');
  {
    const {p,input}=prepare('TP');
    const analysis=p.value.impact_assessment.analyses.find(row=>row.type==='Brownfield Review');
    const quality=p.value.quality_assessment.find(row=>row.record.type==='Brownfield Review');
    assert.equal(quality.association,'current');assert.deepEqual(quality.sources.map(row=>row.type),['UR']);
    analysis.disposition='retain';analysis.reason='Exact current analysis consumes unchanged approved UR only; task wording leaves its route unchanged.';
    quality.disposition='retain';quality.reason=analysis.reason;
    writeFileSync(join(root,p.input.evidence),JSON.stringify(p.value));input.command.payload.proposal.digest=artefactFileDigest(root,p.input.evidence);
    const preview=service('agdf_revise',input);assert.equal(preview.outcome,'accepted',JSON.stringify(preview));
    const result=service('agdf_revise',{...input,command:{kind:'source_revision.apply',payload:{...input.command.payload,
      preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}});
    assert.equal(result.outcome,'accepted',JSON.stringify(result));assert.equal(state().artefacts.get('Brownfield Review').status,'done');
    assert.equal(state().current_gate,'TP');assert.equal(validateRevisionHistory(root,readSourceRevisions(state().content).receipts.at(-1)),true);
  }
  for (const gate of ['PRD','SD','TP']) {
    restore('UAT');
    const oldPresentation=service('agdf_prepare',{...envelope(),command:{kind:'presentation.prepare',payload:{gate:'UAT'}}});
    assert.equal(oldPresentation.outcome,'accepted');
    const {input,preview}=prepare(gate);
    const applied=service('agdf_revise',{...input,command:{kind:'source_revision.apply',payload:{...input.command.payload,
      preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}});
    assert.equal(applied.outcome,'accepted',JSON.stringify(applied));
    const stale=service('agdf_approve',{...envelope(),command:{kind:'approval.record',payload:{gate:'UAT',
      presentation_id:oldPresentation.family_result.presentation_id,response:'Approval: UAT'}}});
    assert.equal(stale.outcome,'rejected','Old UAT material never grants renewed authority');
    const review=f.prefix+randomUUID()+'.md';writeFileSync(join(root,review),'# Brownfield Review\n- ux_intent_definition_required: no\nFresh synthetic applicability review under retained UR.\n');
    const routed=service('agdf_record',{...envelope(),command:{kind:'step.record',payload:{step:'route',route:'structured_delivery',reason:'Renew exact analytical proof for changed source',source:{path:review,digest:artefactFileDigest(root,review)}}}});
    assert.equal(routed.outcome,'accepted',JSON.stringify(routed));
    for(const type of ['PRD','SD','TP'].slice(['PRD','SD','TP'].indexOf(gate))){
      record(type,({PRD:syntheticPrd,SD:syntheticSd,TP:syntheticTp}[type])()+'\nFresh synthetic renewed source statement.\n');approve(type);
    }
    for(const step of ['Brownfield Analysis','CD+Tests','TP Review','Clean Implementation Review','CR']){
      const path=f.prefix+randomUUID()+'.md';writeFileSync(join(root,path),'# '+step+'\n- decision: pass\nFresh observed fixture result against renewed source.\n');
      const r=service('agdf_record',{...envelope(),command:{kind:'step.record',payload:{step:'internal',internal_step:step,decision:'pass',source:{path,digest:artefactFileDigest(root,path)}}}});assert.equal(r.outcome,'accepted',JSON.stringify(r));
    }
    record('QA','# QA: Fresh renewed fixture\n- decision: pass\n\n## Scope\nRenewed source fulfilled.\n## Evidence\nFresh exact checks and reviews recorded.\n## Risks\nNo applicable open finding.\n');approve('QA');
    const freshUat=service('agdf_prepare',{...envelope(),command:{kind:'presentation.prepare',payload:{gate:'UAT'}}});assert.equal(freshUat.outcome,'accepted',JSON.stringify(freshUat));
    assert.notEqual(freshUat.family_result.presentation_id,oldPresentation.family_result.presentation_id);assert.equal(state().current_gate,'UAT');
    assert.equal(state().evidence_applicability.by_step.get('QA').applicability,'current');
  }
  restore('UAT');approve('UAT');const denied=prepare('TP');assert.equal(denied.preview.outcome,'rejected','Deliberate UAT prohibits revision');
  console.log('SCN-069/070/072/073/074: all 18 canonical phase/source cells, exact upstream retention, post-QA withdrawal, version-pinned archive/replay and invalid proof rejection passed (synthetic only).');
} finally {rmSync(root,{recursive:true,force:true});rmSync(seeds,{recursive:true,force:true});}
