import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFileSync,writeFileSync,rmSync,symlinkSync,renameSync,lstatSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const repository="/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework";
const {createPreviewPresentationFixture}=await import(pathToFileURL(join(repository,'packages/core/test/preview-presentation-test.js')));
const {createDecisionSessionService}=await import(pathToFileURL(join(repository,'packages/core/lib/control-inspect/decision-session.js')));
const {root,f,preview,input,command}=createPreviewPresentationFixture('qa-preview-matrix');
const sessions=createDecisionSessionService();
const rows=[];
try {
  const prepared=command('agdf_prepare',input);
  assert.equal(prepared.outcome,'accepted',JSON.stringify(prepared));
  const text=prepared.family_result.text;
  for(const value of [preview.descriptor.review_task,preview.descriptor.version,...preview.descriptor.scenarios,...preview.descriptor.criterion_ids,...preview.descriptor.open_questions])
    assert.ok(text.includes(value),'Text presentation omits '+value);
  const view=(await sessions.open(input,prepared))._meta.agdf_decision;
  assert.equal(view.preview.task,preview.descriptor.review_task);
  assert.deepEqual(view.preview.scenarios,preview.descriptor.scenarios);
  assert.deepEqual(view.preview.criterion_ids,preview.descriptor.criterion_ids);
  assert.deepEqual(view.preview.open_questions,preview.descriptor.open_questions);
  rows.push({scenario:'SCN-002',result:'pass',assertion:'Text and actual decision-session metadata agree on task/version/scenarios/criteria/open questions'});
  const before=readFileSync(f.state);
  const approve=()=>command('agdf_approve',{...input,operation_id:randomUUID(),command:{kind:'approval.record',payload:{gate:'PRD',presentation_id:prepared.family_result.presentation_id,response:'Approval: PRD'}}});
  const deny=(name,mutate,restore,expected='rejected')=>{
    try{mutate();const result=approve();assert.equal(result.outcome,expected,JSON.stringify(result));if(expected==='recovery_required')assert.equal(result.reason,'seal_invalid');assert.equal(result.receipt,null);assert.deepEqual(readFileSync(f.state),before);rows.push({scenario:'SCN-010/021',case:name,result:'pass',outcome:result.outcome,reason:result.reason,run_unchanged:true});}
    finally{restore();}
  };
  const entry=join(root,preview.descriptor.entry),entryBytes=readFileSync(entry);
  const asset=join(root,preview.descriptor.files.find(row=>row.path.endsWith('main.js')).path),assetBytes=readFileSync(asset);
  const prd=f.file('PRD.md'),prdBytes=readFileSync(prd);
  deny('missing entry',()=>rmSync(entry),()=>writeFileSync(entry,entryBytes));
  deny('missing asset',()=>rmSync(asset),()=>writeFileSync(asset,assetBytes));
  deny('changed asset',()=>writeFileSync(asset,'changed asset'),()=>writeFileSync(asset,assetBytes));
  const symlinkTarget=join(root,'qa-asset-copy.js');writeFileSync(symlinkTarget,assetBytes);
  deny('symlinked asset',()=>{rmSync(asset);symlinkSync(symlinkTarget,asset);assert.equal(lstatSync(asset).isSymbolicLink(),true);},()=>{rmSync(asset,{force:true});writeFileSync(asset,assetBytes);});
  const directory=join(root,f.prefix+'previews/review-v1'),saved=directory+'-saved';
  deny('symlinked version ancestor',()=>{renameSync(directory,saved);symlinkSync(saved,directory,'dir');},()=>{rmSync(directory,{force:true});renameSync(saved,directory);});
  for(const [name,mutate] of [
    ['wrong run',d=>{d.entry=d.entry.replace('/qa-preview-matrix/','/foreign/');d.files.forEach(row=>row.path=row.path.replace('/qa-preview-matrix/','/foreign/'));}],
    ['unsafe path',d=>{d.files[0].path='../outside.js';}],
    ['UR-source mismatch',d=>{d.source_ur_digest='sha256:'+'0'.repeat(64);}],
    ['incomplete asset manifest',d=>{d.files=d.files.filter(row=>!row.path.endsWith('main.js'));}]
  ])deny(name,()=>{const d=structuredClone(preview.descriptor);mutate(d);writeFileSync(prd,preview.prd(d));},()=>writeFileSync(prd,prdBytes),'recovery_required');
  const accepted=approve();assert.equal(accepted.outcome,'accepted',JSON.stringify(accepted));
  rows.push({scenario:'SCN-010/021',case:'unchanged valid basis',result:'pass',receipt_schema:accepted.receipt.schema_version});
  const report={environment:{node:process.version,platform:process.platform,arch:process.arch},assurance:'actual Core command and session, disposable synthetic Run; no native host or human approval',rows};
  writeFileSync(new URL('approval-matrix.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}finally{await sessions.close();rmSync(root,{recursive:true,force:true});}

