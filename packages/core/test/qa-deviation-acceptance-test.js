import { withSyntheticQaContent } from './fixtures/decision-content.js';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createExpandedSourceRevisionFixture} from '../../cli/scripts/fixtures/expanded-source-revision.js';
import {artefactFileDigest,runSealState} from '../lib/control-state/run-seal.js';
import {readApprovalOperations} from '../lib/control-state/approval-operations.js';
import {readPresentationDocument} from '../lib/control-state/run-presentation.js';
import {qaDeviationPresentation,inspectQaDeviationAcceptance} from '../lib/control-state/qa-deviation-acceptance.js';
import {createDecisionActionService} from '../lib/control-state/decision-action-service.js';
import {runWorkSummary} from '../lib/control-evaluation/run-work-summary.js';
import {evaluateGateCheck} from '../lib/control-evaluation/gate-check.js';
import {createDecisionSessionService} from '../lib/control-inspect/decision-session.js';
import {closeoutConfirmation,evaluateCloseoutReadiness} from '../lib/control-evaluation/closeout-readiness.js';
import {validateRevisionHistory} from '../lib/control-state/run-revision-history.js';
import {readSourceRevisions} from '../lib/control-state/run-source-revisions.js';
import {approveRunGate} from '../lib/control-state/run-recording.js';
import {postApprovalTransition} from '../lib/control-evaluation/gate-check.js';

const root=mkdtempSync(join(tmpdir(),'agdf-qa-deviations-')), seeds=mkdtempSync(join(tmpdir(),'agdf-qa-deviation-seeds-'));
try {
  const cli=resolve(import.meta.dirname,'../../cli/bin/create-agdf.js');
  execFileSync('git',['init','-q',root]);execFileSync(process.execPath,[cli,'init','--dir',root,'--language','en']);
  const {f,service,state,envelope,restore,prepare}=createExpandedSourceRevisionFixture(root,cli,seeds);
  const proposal=()=>({schema_version:'1',reviewer:'Disposable QA reviewer',usage_scope:'Internal Chat use; no native production qualification.',
    deviations:[{finding_id:'MISSING-NATIVE',severity:'medium',risk:'Native teardown was not observed.',consequence:'A bounded reader may remain until expiry.',follow_up:'Observe native closure on the exact candidate.',owner:'Runtime evidence owner'}]});
  const report=(value,decision='revise',target='evidence_obligation')=>withSyntheticQaContent('# QA: Disposable exact deviation proposal\n- decision: '+decision+'\n\n## Scope\nOwned fixture only.\n## Evidence\nCore and review checks retained.\n## Risks\nNative closure remains unobserved.\n\n## Normalized Findings\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| MISSING-NATIVE | '+(target==='CD+Tests'?'implementation_gap':'evidence_gap')+' | '+target+' | open | No native close observation in this fixture | Collect the exact native observation |\n'+(value?'\n## QA Deviation Acceptance\n```json\n'+JSON.stringify(value,null,2)+'\n```\n':'')+'\n## AGDF Approval Summary (de; source=en)\n- Umfang: Begrenzte interne Nutzung des Wegwerf-Projekts; Nachweis der nativen Ansicht steht aus.\n- Nachweise: Core- und Review-Prüfungen sind dokumentiert.\n- Risiken: Native Sitzungsbeendigung ist nicht beobachtet; ein begrenzter Leser kann bis zum Ablauf bleiben. Der Nachweisowner muss den Schließtest nachholen. Freigabe akzeptiert diese Abweichung und erlaubt anschließend UAT; keine native Produktionsqualifikation.\n', { risks: 'Native closure remains unobserved and accepted only in the declared bounded scope.' });
  const recordQa=(text,expected='accepted')=>{
    const path=f.prefix+'QA_REPORT.md';writeFileSync(join(root,path),text);
    const old=state().artefacts.get('QA');
    const request={schema_version:'1',target_id:envelope().target_id,run_id:f.runId,expected_revision_id:f.revision(),
      destination:{type:'QA_REPORT',path,digest:artefactFileDigest(root,path),status:text.match(/^- decision: (\w+)/m)[1]},
      source:{type:'TP',path:f.prefix+'TP.md',digest:artefactFileDigest(root,f.prefix+'TP.md')},
      relationship:{from:'QA_REPORT',relationship:'tests',to:'TP'},review:{reviewer:'Disposable QA derivation reviewer',path:f.prefix+randomUUID()+'.json',digest:''},update_draft:Boolean(old?.path)};
    const {schema_version,target_id,run_id,destination,source,relationship}=request;
    writeFileSync(join(root,request.review.path),JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer:request.review.reviewer,reviewed:true}));
    request.review.digest=artefactFileDigest(root,request.review.path);const input=f.prefix+randomUUID()+'.json';writeFileSync(join(root,input),JSON.stringify(request));
    const result=service('agdf_record',{...envelope(),command:{kind:'artefact.record',payload:{gate:'QA',reviewed_request:{path:input,digest:artefactFileDigest(root,input)}}}});
    assert.equal(result.outcome,expected,JSON.stringify(result));return expected==='accepted'?path:result;
  };
  for(const mutate of [p=>p.deviations[0].severity='critical',p=>p.deviations=[],p=>p.deviations.push({...p.deviations[0]}),p=>p.deviations[0].finding_id='UNKNOWN',p=>p.deviations[0].owner='',p=>p.override=true]) {
    restore('QA');const p=proposal();mutate(p);recordQa(report(p));assert.equal(state().qa_acceptance.eligible,false);
    assert.equal(service('agdf_prepare',{...envelope(),command:{kind:'presentation.prepare',payload:{gate:'QA'}}}).outcome,'rejected');
  }
  for(const [decision,target] of [['block','evidence_obligation'],['revise','CD+Tests']]) {
    restore('QA');recordQa(report(proposal(),decision,target));assert.equal(state().qa_acceptance.eligible,false);
  }
  restore('QA');recordQa(report(null));assert.equal(state().qa_acceptance.eligible,false);
  recordQa(report(proposal()));assert.equal(runSealState(root,readFileSync(f.state,'utf8')).status,'valid','Unapproved QA report refresh preserves the other seals');
  assert.equal(state().qa_acceptance.eligible,true,JSON.stringify(state().qa_acceptance));
  const captured=state(), planPath=captured.artefacts.get('TP Review').path;
  const readCaptured=p=>p===planPath?'# TP Review\n- decision: pass\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| MISSING-NATIVE | evidence_gap | evidence_obligation | open | A different missing obligation under the same ID | Observe that other obligation |\n':readFileSync(join(root,p),'utf8');
  assert.equal(inspectQaDeviationAcceptance(root,captured,readCaptured).reason,'qa_deviation_scope_ambiguous','Conflicting report-local IDs cannot collapse into one accepted risk');
  for(const [language,actionLabel] of [['de','Mit Abweichungen freigeben'],['en','Approve with deviations']]) {
    restore('QA');const path=recordQa(report(proposal())), bytes=readFileSync(join(root,path));
    const e={...envelope(),presentation_language:language};
    const prepared=service('agdf_prepare',{...e,command:{kind:'presentation.prepare',payload:{gate:'QA'}}});
    assert.equal(prepared.outcome,'accepted',JSON.stringify(prepared));
    assert.ok(prepared.family_result.text.includes('MISSING-NATIVE'));
    assert.ok(prepared.family_result.text.includes('Approval: QA'));
    assert.equal(qaDeviationPresentation(state().qa_acceptance,language).approve_label,actionLabel);
    const presentation=prepared.family_result.presentation_id;
    const document=readPresentationDocument(root,{runId:f.runId,gate:'QA',revisionId:e.expected_revision_id,presentationId:presentation,targetId:e.target_id});
    assert.equal(document.available,true);assert.equal(document.content,bytes.toString());
    const beforeLegacy=readFileSync(f.state);
    const legacy=approveRunGate(root,{runId:f.runId,gate:'QA',revisionId:e.expected_revision_id,presentationId:presentation,response:'Approval: QA'},
      {evaluateGateCheck,postApprovalTransition});
    assert.equal(legacy.reason,'qa_deviation_requires_typed_approval',JSON.stringify(legacy));assert.deepEqual(readFileSync(f.state),beforeLegacy);
    const input={...e,operation_id:randomUUID(),command:{kind:'approval.record',payload:{gate:'QA',presentation_id:presentation,response:'Approval: QA'}}};
    const quote=service('agdf_approve',{...input,operation_id:randomUUID(),command:{...input.command,payload:{...input.command.payload,response:'Is "Approval: QA" a quote?'}}});
    assert.equal(quote.outcome,'rejected');assert.equal(state().approvals.get('QA').status,'missing');
    const binding={target_id:e.target_id,run_id:f.runId,gate:'QA',expected_revision_id:e.expected_revision_id,presentation_id:presentation,presentation_language:language};
    const action=createDecisionActionService({appOnlyMediationQualified:true});
    let approved;
    if(language==='de') approved=service('agdf_approve',input);
    else {
      const view=createDecisionSessionService({appOnlyMediationQualified:true});
      try {
        const opened=await view.open({...e,command:{kind:'presentation.prepare',payload:{gate:'QA'}}},prepared);
        assert.equal(opened.app_capability,'available',JSON.stringify(opened));
        const meta=opened._meta.agdf_decision;
        assert.equal(meta.labels.approve,actionLabel);assert.ok(meta.decision_brief.includes('A bounded reader may remain until expiry.'));
        assert.deepEqual(meta.enabled_actions,['approve']);
        const read=await view.read({operation:'document',session_id:meta.read_session_id,run_id:f.runId,snapshot_id:meta.snapshot_id,resource_id:meta.resource_id});
        assert.equal(read.state,'available',JSON.stringify(read));assert.equal(read.data.document.content,bytes.toString());
        approved=await view.action({session_id:meta.session_id,operation_id:input.operation_id,presentation_id:presentation,expected_revision_id:e.expected_revision_id,action:'approve'});
      } finally {await view.close();}
    }
    assert.equal(approved.outcome,'accepted',JSON.stringify(approved));assert.equal(approved.receipt.schema_version,'3');
    assert.equal(approved.receipt.effect.qa_acceptance.qa_outcome,'revise');assert.equal(approved.current.gate,'UAT');
    assert.equal(state().qa_acceptance.accepted,true,JSON.stringify(state().qa_acceptance));
    assert.deepEqual(readFileSync(join(root,path)),bytes,'Acceptance never edits the QA result');
    assert.equal(state().artefacts.get('QA').status,'revise');assert.equal(evaluateGateCheck(root,{runId:f.runId}).status,'open');
    const beforeRefresh=readFileSync(f.state);const noRefresh=recordQa(bytes.toString(),'rejected');
    assert.equal(noRefresh.reason,'artefact_recording_gate_invalid',JSON.stringify(noRefresh));assert.deepEqual(readFileSync(f.state),beforeRefresh);
    const duplicate=language==='de' ? action(root,binding,{session_id:randomUUID(),operation_id:randomUUID(),presentation_id:presentation,expected_revision_id:e.expected_revision_id,action:'approve'})
      : service('agdf_approve',{...input,operation_id:randomUUID()});
    assert.equal(duplicate.outcome,'rejected');assert.equal(readApprovalOperations(readFileSync(f.state,'utf8')).receipts.filter(row=>row.binding.gate==='QA').length,1);
    if(language==='de')assert.equal(service('agdf_approve',input).outcome,'already_applied');
    const summary=runWorkSummary(root,readFileSync(f.state,'utf8'));
    assert.equal(summary.qa_outcome,'revise');assert.equal(summary.qa_acceptance.kind,'accepted_with_deviations');assert.equal(summary.phase,'UAT');
    const uat=service('agdf_prepare',{...envelope(),presentation_language:language,command:{kind:'presentation.prepare',payload:{gate:'UAT'}}});
    assert.equal(uat.outcome,'accepted',JSON.stringify(uat));assert.ok(uat.family_result.summary.includes('MISSING-NATIVE'));
    const uatDoc=readPresentationDocument(root,{runId:f.runId,gate:'UAT',revisionId:f.revision(),presentationId:uat.family_result.presentation_id,targetId:e.target_id});
    assert.equal(uatDoc.available,true);assert.ok(uatDoc.content.includes('A bounded reader may remain until expiry.'));
    assert.ok(uatDoc.content.includes(language==='de'?'wurden für die vorgelegte Fassung ausdrücklich akzeptiert':'were explicitly accepted for the presented version'));
    assert.ok(!uatDoc.content.includes(language==='de'?'Mit deiner Freigabe akzeptierst':'Your approval accepts'));
    if(language==='de') {
      const {input:revision,preview}=prepare('TP');assert.equal(preview.outcome,'accepted',JSON.stringify(preview));
      const revised=service('agdf_revise',{...revision,command:{kind:'source_revision.apply',payload:{...revision.command.payload,
        preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}});
      assert.equal(revised.outcome,'accepted',JSON.stringify(revised));
      assert.equal(validateRevisionHistory(root,readSourceRevisions(state().content).receipts.at(-1)),true,'New QA receipt and immutable snapshot remain verifiable in revision history');
      assert.equal(state().approvals.get('QA').status,'missing');
      continue;
    }
    const accepted=service('agdf_approve',{...envelope(),command:{kind:'approval.record',payload:{gate:'UAT',presentation_id:uat.family_result.presentation_id,response:'Approval: UAT'}}});
    assert.equal(accepted.outcome,'accepted',JSON.stringify(accepted));
    const s=state(), rows=['UR','Brownfield Review','PRD','SD','TP','Brownfield Analysis','CD+Tests','CR','QA','UAT'].map(type=>`| ${type} | ${s.approvals.get(type)?.status??s.artefacts.get(type).status} | ${s.artefacts.get(type)?.path||s.approvals.get(type).evidence} |`).join('\n');
    const or=`# OR: Disposable accepted deviations
Report mode: OR-full
Status: done
## Run
- run_id: ${f.runId}
- related_ur: ${f.prefix}UR.md
- related_prd: ${f.prefix}PRD.md
- related_sd: ${f.prefix}SD.md
- related_tp: ${f.prefix}TP.md
- related_qa_report: ${path}
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass
- qa_acceptance: accepted_with_deviations
- accepted_qa_deviations_digest: ${s.qa_acceptance.digest}
## Gate State
| Gate or step | Status | Evidence |
|---|---|---|
${rows}
## Delivered
Bounded fixture implementation and passing protected reviews.
## Not Delivered / Intentionally Deferred
MISSING-NATIVE: Native closure observation remains deferred.
## Evidence
Exact QA receipt accepts the listed deviations; original QA decision remains revise.
## Missing Evidence
MISSING-NATIVE: Native closure is unobserved, not passed.
## Risks And Open Items
MISSING-NATIVE: A bounded reader may remain until expiry. Runtime evidence owner must observe native closure on the exact candidate. Internal Chat scope only.
## Context Graph Impact
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Disposable isolated scope changes no graph owner.
## Knowledge Persistence Decision
- memory_target: none
- memory_reason: Disposable fixture creates no persistent project knowledge.
- memory_refs: none
## Next Permissible Step
- next_allowed_action: Optional explicitly requested handoff.
- required_approval: none
- forbidden_until_then: Automatic Git or release action.
`;
    const read=p=>readFileSync(join(root,p),'utf8');
    for(const invalid of [or.replace('- qa_acceptance: accepted_with_deviations',''),or.replace(s.qa_acceptance.digest,'sha256:'+'0'.repeat(64))]) {
      assert.ok(evaluateCloseoutReadiness(s,invalid,read,{prepared:true}).findings.includes('closeout_qa_deviations_not_disclosed'));
    }
    assert.equal(evaluateCloseoutReadiness(s,or,read,{prepared:true}).ready,true,JSON.stringify(evaluateCloseoutReadiness(s,or,read,{prepared:true})));
    const orPath=f.prefix+'OR_ACCEPTED.md';writeFileSync(join(root,orPath),or);
    const close={...envelope(),command:{kind:'closeout.record',payload:{or:{path:orPath,digest:artefactFileDigest(root,orPath)},confirmation:''}}};
    close.command.payload.confirmation=closeoutConfirmation(f.runId,close.expected_revision_id,close.operation_id,close.command.payload.or.digest);
    const closed=service('agdf_closeout',close);assert.equal(closed.outcome,'accepted',JSON.stringify(closed));
    assert.equal(state().artefacts.get('QA').status,'revise');assert.equal(state().qa_acceptance.accepted,true);
    writeFileSync(join(root,path),bytes.toString().replace('bounded reader','changed risk'));
    assert.equal(evaluateGateCheck(root,{runId:f.runId}).missing_approval,'none','Changed accepted material cannot authorize continuation');
    assert.equal(state().qa_acceptance.accepted,false,'Changed risks lose current acceptance authority');
  }
  console.log('QA deviations: de/en Chat and assembled decision-session parity, one-effect/legacy guards, immutable report and UAT disclosure, exact revision archive, approved-update rejection, truthful OR closeout, refresh and stale/critical/malformed negatives passed (disposable only; no native qualification).');
} finally {rmSync(root,{recursive:true,force:true});rmSync(seeds,{recursive:true,force:true});}
