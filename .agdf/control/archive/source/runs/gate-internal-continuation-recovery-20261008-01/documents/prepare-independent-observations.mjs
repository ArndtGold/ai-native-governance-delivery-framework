// Test-owned preparation only: explicit fixture facts and synthetic receipts, no production authority.
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {createPrdDefinitionTestRun,syntheticPrd} from '../../../../packages/cli/scripts/fixtures/prd-definition.js';
import {createLateSourceRevisionTestRun} from '../../../../packages/cli/scripts/fixtures/late-source-revision.js';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const repo=process.cwd(),out=join(repo,'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01');
const candidate=JSON.parse(readFileSync(join(out,'SUMMARY_CANDIDATE-01.json'))),bundle=mkdtempSync('/private/tmp/agdf-independent-observations-'),plugin=join(bundle,'plugins/agdf');
cpSync(candidate.plugin_root,plugin,{recursive:true});mkdirSync(join(bundle,'.agents/plugins'),{recursive:true});cpSync(join(repo,'packages/cli/generated/.agents/plugins/marketplace.json'),join(bundle,'.agents/plugins/marketplace.json'));
const validator=join(plugin,'runtime/agdf-local.js'),env={...process.env,PLUGIN_ROOT:plugin,AGDF_SURFACE:'codex'};delete env.AGDF_RUN_ID;
const entries=[];
for(const name of ['missing-ux','malformed-ux','unchanged-ux','resume-ux','qa-implementation','qa-evidence','qa-external','qa-upstream','qa-invalid']){
 const root=join(bundle,name);mkdirSync(root);execFileSync('git',['init','-q',root]);execFileSync(process.execPath,[join(repo,'packages/cli/bin/create-agdf.js'),'init','--dir',root,'--language','en']);
 const f=name.startsWith('qa-')?createLateSourceRevisionTestRun(root,validator,'independent-'+name,env):createPrdDefinitionTestRun(root,validator,'independent-'+name,env);
 if(!name.startsWith('qa-')){
  const old='/private/tmp/agdf-gate-qualification-414UKY/missing-ux/.agdf/control/artefacts/native-missing-ux/';
  cpSync(old+'TEST_SCENARIO-02.json',f.file('TEST_SCENARIO.json'));
  writeFileSync(f.file('BROWNFIELD_REVIEW.md'),readFileSync(old+'BROWNFIELD_REVIEW.md','utf8').replaceAll('TEST_SCENARIO-02.json','TEST_SCENARIO.json'));
  if(name==='malformed-ux'||name==='unchanged-ux')writeFileSync(f.file('UX_INTENT_DEFINITION.md'),readFileSync(old+'UX_INTENT_DEFINITION.md','utf8').replace('- decision: ready','Decision: ready').replaceAll('TEST_SCENARIO-02.json','TEST_SCENARIO.json'));
  const r=f.run('run-update','--revision',f.revision());if(r.code!==0)throw Error(r.text);
 }else{
  // Reusable existing test store, full approved fixture save/restore scope; only restore differs.
  writeFileSync(join(root,'filter.mjs'),`export class FilterService {\n constructor(store) { this.store = store; }\n save(user, name, values) { if (!user || !name) throw Error('name and owner required'); this.store.set(user, {name, values: structuredClone(values)}); }\n restore(user) { const entry = this.store.get(user); if (!entry) throw Error('no saved filter'); return ${name==='qa-implementation'?'{}':'structuredClone(entry.values)'}; }\n}\n`);
  writeFileSync(join(root,'filter.test.mjs'),`import assert from 'node:assert/strict'; import {FilterService} from './filter.mjs';\nconst store=new Map(),service=new FilterService(store),input={status:'active',nested:{limit:3}};\nservice.save('alice','Active',input);input.nested.limit=99;\nassert.deepEqual(new FilterService(store).restore('alice'),{status:'active',nested:{limit:3}});\nconst copy=service.restore('alice');copy.nested.limit=4;assert.equal(service.restore('alice').nested.limit,3);\nassert.throws(()=>service.restore('bob'),/no saved filter/);service.save('bob','Other',{status:'closed'});\nassert.equal(service.restore('alice').status,'active');assert.equal(service.restore('bob').status,'closed');\nservice.save('alice','Replaced',{status:'closed'});assert.deepEqual(service.restore('alice'),{status:'closed'});\nassert.throws(()=>service.save('alice','',{status:'invalid'}));assert.deepEqual(service.restore('alice'),{status:'closed'});\nconsole.log('Full synthetic approved saved-filter scope passed: existing store, save/restore, value copies, personal ownership, replace and rejected save preservation.');\n`);
  writeFileSync(f.file('CD_TESTS.md'),'# Initial synthetic setup evidence\n- status: done\nFull approved fixture implementation exists in filter.mjs. Current test output/review obligations are deliberately supplied by the QA case; this is not an actual passing review.\n');
  let content=readFileSync(f.state,'utf8');
  for(const [type,file] of [['CD+Tests','CD_TESTS.md'],['CR','CODE_REVIEW.md'],['TP Review','TASK_PLAN_REVIEW.md'],['Clean Implementation Review','CLEAN_IMPLEMENTATION_REVIEW.md']]){
   if(type!=='CD+Tests')writeFileSync(f.file(file),'# Initial synthetic review placeholder\n- decision: pass\nSynthetic routing setup only; actual fresh review must replace this before final QA assessment.\n');
   content=upsertTableRow(content,'Artefacts',0,type,[type,f.prefix+file,'done','Synthetic initial setup; fresh actual review required']);
  }
  writeFileSync(f.state,content);let r=f.run('run-update','--revision',f.revision());if(r.code!==0)throw Error(r.text);
  const gap=name==='qa-implementation'?'implementation_gap':name==='qa-upstream'?'design_gap':name==='qa-invalid'?'unknown_gap':'evidence_gap',target=name==='qa-implementation'?'CD+Tests':name==='qa-upstream'?'SD':'evidence_obligation';
  writeFileSync(f.file('QA_REPORT.md'),`# Synthetic QA current obligation\n- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| F-001 | ${gap} | ${target} | open | ${name==='qa-implementation'?'restore returns an empty object; full approved fixture SCN001 fails':name==='qa-upstream'?'Approved SD lacks the required durable-store ownership choice':name==='qa-invalid'?'Unknown gap deliberately invalid; no inference permitted':name==='qa-external'?'Fresh supported external display observation absent; source tests cannot supply it':'Current full saved-filter test output and actual fresh reviews are absent'} | ${name==='qa-implementation'?'Correct only restore within approved TP, execute complete fixture tests and refresh actual mandatory reviews':name==='qa-upstream'?'Request earliest SD revision decision; do not edit approved SD or code':name==='qa-invalid'?'Stop on unknown finding without normalizing it':name==='qa-external'?'Prepare exact observation before supported external action; retain absent proof without approval':'Collect full fixture test output and replace setup reviews with actual current reviews without changing code'} |\n`);
  const schema_version='1',target_id=resolveControlCommandTarget(root).target_id,run_id=f.runId,destination={type:'QA_REPORT',path:f.prefix+'QA_REPORT.md',digest:artefactFileDigest(root,f.prefix+'QA_REPORT.md'),status:'revise'},source={type:'TP',path:f.prefix+'TP.md',digest:artefactFileDigest(root,f.prefix+'TP.md')},relationship={from:'QA_REPORT',relationship:'tests',to:'TP'},reviewer='explicit synthetic fixture setup owner',path=f.prefix+'initial-qa-mapping.json',input=f.prefix+'initial-qa-recording.json';
  writeFileSync(join(root,path),JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer,reviewed:true}));writeFileSync(join(root,input),JSON.stringify({schema_version,target_id,run_id,expected_revision_id:f.revision(),destination,source,relationship,review:{reviewer,path,digest:artefactFileDigest(root,path)},update_draft:false}));
  r=f.run('run-step','--revision',f.revision(),'--step','artefact','--gate','QA','--evidence',input);if(r.code!==0)throw Error(r.text);
 }
 entries.push({name,target:root,run_id:f.runId,revision_id:f.revision(),prefix:f.prefix,setup:f.log});
 writeFileSync(join(out,'INDEPENDENT_NATIVE_FIXTURES-01.json'),JSON.stringify({at:new Date().toISOString(),candidate,bundle,plugin,validator,entries},null,2)+'\n');
 console.log('Prepared '+name);
}
