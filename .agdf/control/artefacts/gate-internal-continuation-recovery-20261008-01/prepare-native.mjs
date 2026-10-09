// Preparation only. Synthetic fixture approvals never authorize the production Run.
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createPrdDefinitionTestRun} from '../../../../packages/cli/scripts/fixtures/prd-definition.js';
import {createLateSourceRevisionTestRun} from '../../../../packages/cli/scripts/fixtures/late-source-revision.js';
import {upsertTableRow} from '../../../../packages/core/lib/control-state/run-state-edits.js';
import {artefactFileDigest} from '../../../../packages/core/lib/control-state/run-seal.js';
import {resolveControlCommandTarget} from '../../../../packages/core/lib/control-state/approval-command-contract.js';
const repo=process.cwd(), out=join(repo,'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01');
const bundle=mkdtempSync('/private/tmp/agdf-gate-qualification-');
const plugin=join(bundle,'plugins/agdf');
cpSync(join(repo,'packages/cli/generated/plugins/agdf'),plugin,{recursive:true});
cpSync(join(repo,'packages/cli/generated/.agents/plugins/marketplace.json'),join(bundle,'.agents/plugins/marketplace.json'),{recursive:true});
const validator=join(plugin,'runtime/agdf-local.js'), env={...process.env,PLUGIN_ROOT:plugin,AGDF_SURFACE:'codex'};delete env.AGDF_RUN_ID;
const cases=[];
for(const name of ['missing-ux','malformed-ux','unchanged-ux','resume-ux','qa-implementation','qa-internal-evidence','qa-external-evidence','qa-upstream','qa-invalid']) {
 const root=join(bundle,name);mkdirSync(root);execFileSync('git',['init','-q',root]);
 execFileSync(process.execPath,[join(repo,'packages/cli/bin/create-agdf.js'),'init','--dir',root,'--language','en']);
 const run='native-'+name;
 const f=name.startsWith('qa-')?createLateSourceRevisionTestRun(root,validator,run,env):createPrdDefinitionTestRun(root,validator,run,env);
 if(!name.startsWith('qa-')) {
  writeFileSync(f.file('BROWNFIELD_REVIEW.md'),readFileSync(f.file('BROWNFIELD_REVIEW.md'),'utf8').replace('required: no','required: yes'));
  if(name!=='missing-ux'&&name!=='resume-ux')writeFileSync(f.file('UX_INTENT_DEFINITION.md'),'# Synthetic UX intent\nDecision: ready\n');
  const u=f.run('run-update','--revision',f.revision());if(u.code!==0)throw Error(u.text);
 } else {
  writeFileSync(join(root,'filter.mjs'),name==='qa-implementation'?'export const restore = saved => ({});\n':'export const restore = saved => ({...saved});\n');
  writeFileSync(join(root,'filter.test.mjs'),"import assert from 'node:assert/strict'; import {restore} from './filter.mjs'; assert.deepEqual(restore({status:'active'}),{status:'active'});\n");
  writeFileSync(f.file('CD_TESTS.md'),'# Synthetic implementation evidence\nThe declared filter implementation exists; QA identifies remaining obligation.\n');
  for(const file of ['CODE_REVIEW.md','TASK_PLAN_REVIEW.md','CLEAN_IMPLEMENTATION_REVIEW.md'])writeFileSync(f.file(file),'# Synthetic completed review\n- decision: pass\nFixture upstream scope and current remaining QA obligation retained.\n');
  let content=readFileSync(f.state,'utf8');
  for(const [type,file] of [['CD+Tests','CD_TESTS.md'],['CR','CODE_REVIEW.md'],['TP Review','TASK_PLAN_REVIEW.md'],['Clean Implementation Review','CLEAN_IMPLEMENTATION_REVIEW.md']]) content=upsertTableRow(content,'Artefacts',0,type,[type,f.prefix+file,'done','Synthetic preparation']);
  writeFileSync(f.state,content);let u=f.run('run-update','--revision',f.revision());if(u.code!==0)throw Error(u.text);
  const gap=name==='qa-implementation'?'implementation_gap':name==='qa-upstream'?'design_gap':name==='qa-invalid'?'unknown_gap':'evidence_gap';
  const target=name==='qa-implementation'?'CD+Tests':name==='qa-upstream'?'SD':'evidence_obligation';
  const obligation=name==='qa-internal-evidence'?'Run the prepared local filter.test.mjs and record its actual output':name==='qa-external-evidence'?'Observe the loaded candidate and full prepared native sequence; inaccessible host stays missing':name==='qa-upstream'?'Request the existing SD revision decision before code':'Correct only the approved filter restore behavior; run the prepared test and refresh affected reviews';
  writeFileSync(f.file('QA_REPORT.md'),`# QA: Synthetic ${name}\n- decision: revise\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n| Q-001 | ${gap} | ${target} | open | ${name==='qa-implementation'?'Approved AC-001 restore assertion fails':name==='qa-upstream'?'An ownership policy was not decided in the synthetic SD':'Required observation output is absent'} | ${obligation} |\n`);
  const mapping=f.prefix+'native-review-'+randomUUID()+'.json', evidence=f.prefix+'native-record-'+randomUUID()+'.json';
  const value={schema_version:'1',target_id:resolveControlCommandTarget(root).target_id,run_id:run,expected_revision_id:f.revision(),destination:{type:'QA_REPORT',path:f.prefix+'QA_REPORT.md',digest:artefactFileDigest(root,f.prefix+'QA_REPORT.md'),status:'revise'},source:{type:'TP',path:f.prefix+'TP.md',digest:artefactFileDigest(root,f.prefix+'TP.md')},relationship:{from:'QA_REPORT',relationship:'tests',to:'TP'},review:{reviewer:'synthetic native fixture preparer',path:mapping,digest:''},update_draft:false};
  const {schema_version,target_id,run_id,destination,source,relationship}=value;
  writeFileSync(join(root,mapping),JSON.stringify({schema_version,target_id,run_id,destination,source,relationship,reviewer:value.review.reviewer,reviewed:true}));value.review.digest=artefactFileDigest(root,mapping);writeFileSync(join(root,evidence),JSON.stringify(value));
  u=f.run('run-step','--revision',f.revision(),'--step','artefact','--gate','QA','--evidence',evidence);if(u.code!==0)throw Error(u.text);
 }
 cases.push({name,target:root,run_id:run,revision_id:f.revision(),lane:'isolated synthetic fixture setup; not human gate approval',commands:f.log});
 writeFileSync(join(out,'native-fixtures.json'),JSON.stringify({prepared_at:new Date().toISOString(),bundle,plugin,validator,cases},null,2));
 console.log('Prepared '+name);
}
