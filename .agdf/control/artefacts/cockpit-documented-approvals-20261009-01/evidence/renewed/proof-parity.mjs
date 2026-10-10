// Run-specific differential evidence, comparing the captured actual pre-edit module.
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const repo=resolve(import.meta.dirname,'../../../../../..');
const current=await import(pathToFileURL(join(repo,'packages/core/lib/control-state/artefact-binding-proof.js')));
const baseline=await import('./baseline-files/packages/core/lib/control-state/artefact-binding-proof.js');
const {createLateSourceRevisionTestRun}=await import(pathToFileURL(join(repo,'packages/cli/scripts/fixtures/late-source-revision.js')));
const {previewSourceRevision,applySourceRevision}=await import(pathToFileURL(join(repo,'packages/core/lib/control-state/run-revision.js')));
const {approvalFixture}=await import(pathToFileURL(join(repo,'packages/core/test/control-cockpit-fixtures.js')));
const {parseRunState,parseControlState}=await import(pathToFileURL(join(repo,'packages/core/lib/control-state/run-state-parser.js')));
const results=[];
function compare(root,control,label){
  for(const historical of [false,true]) for(const gate of [null,'UR','PRD','SD','TP','QA','UAT']){
    const c=gate?{...control,approvals:new Map([[gate,gate==='UAT'?{status:'approved',evidence:'Recorded UAT has no source digest'}:control.approvals.get(gate)??{status:'missing'}]])}:control;
    const old=baseline.exactApprovedArtefacts(root,c,{historical}), fresh=current.exactApprovedArtefacts(root,c,{historical});
    assert.equal(fresh,old,`${label}/${gate??'aggregate'}`);
    if(gate==='UAT') assert.equal(current.inspectApprovedArtefact(root,c,gate).confirmed,false,'Aggregate UAT omission never certifies bytes');
    results.push({label,historical,gate:gate??'aggregate',baseline:old,current:fresh});
  }
}
const legacy=await approvalFixture();
try{
  assert.equal(legacy.approve().outcome,'approved');
  const r=parseRunState(fs.readFileSync(legacy.runPath,'utf8'),'fixture-a');
  compare(legacy.root,{...parseControlState(r.content),content:r.content,meta:r.meta},'legacy canonical approval without typed receipt');
}finally{legacy.close();}
const temp=fs.mkdtempSync(join(tmpdir(),'agdf-doc-proof-parity-')),root=join(temp,'project'),cli=join(repo,'packages/cli/bin/create-agdf.js');
try{
  fs.mkdirSync(root);execFileSync('git',['init','-q',root]);execFileSync(process.execPath,[cli,'init','--dir',root,'--language','en']);
  const f=createLateSourceRevisionTestRun(root,cli,'document-proof-parity',process.env,{tpEncoding:'crlf_bom'});
  const control=()=>({...f.control(),content:f.readState().content,meta:f.readState().meta});
  compare(root,control(),'typed all approved CRLF/BOM');
  const p=f.proposal('TP'),v=previewSourceRevision(root,p.input);assert.equal(v.outcome,'preview');
  assert.equal(applySourceRevision(root,{...p.input,previewDigest:v.preview_digest}).outcome,'reopened');
  compare(root,control(),'historical source revision with approved upstream');
  fs.appendFileSync(f.file('TP.md'),'\nReviewed renewed TP\n');f.recordSource('TP');f.approveSource('TP');
  compare(root,control(),'renewed typed approval and active derivation binding');
  const seed=join(temp,'seed');fs.cpSync(join(root,'.agdf'),seed,{recursive:true});
  for(const mutation of ['normalized_raw','changed','moved','missing_presentation','malformed_presentation','foreign_presentation','damaged_receipt']){
    fs.rmSync(join(root,'.agdf'),{recursive:true});fs.cpSync(seed,join(root,'.agdf'),{recursive:true});
    const c=control(),e=c.approvals.get('TP').evidence,id=e.match(/presentation ([0-9a-f-]{36})/)[1];
    const presentation=join(root,`.agdf/control/runs/${f.runId}/presentations/${id}.json`);
    if(mutation==='normalized_raw') fs.writeFileSync(f.file('TP.md'),fs.readFileSync(f.file('TP.md'),'utf8').replace(/^\ufeff/,'').replaceAll('\r\n','\n'));
    if(mutation==='changed') fs.appendFileSync(f.file('TP.md'),'\nchanged\n');
    if(mutation==='moved') fs.renameSync(f.file('TP.md'),f.file('moved.md'));
    if(mutation==='missing_presentation') fs.rmSync(presentation);
    if(mutation==='malformed_presentation') fs.writeFileSync(presentation,'{');
    if(mutation==='foreign_presentation'){const p=JSON.parse(fs.readFileSync(presentation));p.record.run_id='foreign';fs.writeFileSync(presentation,JSON.stringify(p));}
    if(mutation==='damaged_receipt'){const old=c.content;c.content=c.content.replace('## Approval Operations', '## Approval Operations\n\ninvalid receipt');assert.notEqual(c.content,old);}
    compare(root,c,mutation);
  }
  fs.writeFileSync(join(import.meta.dirname,'PROOF_PARITY.json'),JSON.stringify({schema_version:'1',baseline_module:'baseline-files/packages/core/lib/control-state/artefact-binding-proof.js',fixture_authority:'disposable canonical services; no production approval',results},null,2));
  console.log(`${results.length} actual before/after proof comparisons passed.`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
