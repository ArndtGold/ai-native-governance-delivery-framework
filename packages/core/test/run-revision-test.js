import assert from 'node:assert/strict';
import { mkdtempSync,readFileSync,writeFileSync,rmSync,cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initializeCurrentControl } from './fixtures/current-init.js';
import { createSdDefinitionTestRun } from '../../cli/scripts/fixtures/sd-definition.js';
import { createCoreServices } from '../lib/index.js';
import { artefactFileDigest,runSealState } from '../lib/control-state/run-seal.js';
import { earlyPrdConfirmation } from '../lib/control-state/run-operations.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { readRunState } from '../lib/control-evaluation/run-state.js';
const root=mkdtempSync(join(tmpdir(),'agdf-current-prd-revision-')),seed=mkdtempSync(join(tmpdir(),'agdf-current-prd-seed-'));
try {
  initializeCurrentControl(root);
  const f=createSdDefinitionTestRun(root,resolve(import.meta.dirname,'../../cli/bin/create-agdf.js'));
  const service=createCoreServices().command,target=resolveControlCommandTarget(root).target_id;
  const request=()=>{const operation_id=randomUUID(),expected_revision_id=f.revision(),prd={path:f.prefix+'PRD.md',digest:artefactFileDigest(root,f.prefix+'PRD.md')};return {schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:target,run_id:f.runId,expected_revision_id,operation_id,command:{kind:'prd_revision.reopen',payload:{prd,confirmation:earlyPrdConfirmation(f.runId,expected_revision_id,operation_id,prd.digest)}}};};
  cpSync(join(root,'.agdf'),join(seed,'control'),{recursive:true});
  const reset=()=>{rmSync(join(root,'.agdf'),{recursive:true});cpSync(join(seed,'control'),join(root,'.agdf'),{recursive:true});};
  for(const alter of [r=>r.expected_revision_id=randomUUID(),r=>r.command.payload.confirmation='Approval: PRD',r=>r.command.payload.prd.digest='sha256:'+'0'.repeat(64)]) {
    reset();const r=request();alter(r);const before=readFileSync(f.state);assert.equal(service('agdf_revise',r).outcome,'rejected');assert.deepEqual(readFileSync(f.state),before);
  }
  for(const missing of ['content_seal','approval_seal','both']) {
    reset();const r=request(),before=readFileSync(f.state,'utf8');const stripped=before.split('\n').filter(line=>!((missing==='both'||missing==='content_seal')&&line.startsWith('- content_seal:')||(missing==='both'||missing==='approval_seal')&&line.startsWith('- approval_seal:'))).join('\n');writeFileSync(f.state,stripped);
    assert.equal(service('agdf_revise',r).outcome,'rejected');assert.equal(readFileSync(f.state,'utf8'),stripped);
  }
  reset();const r=request();writeFileSync(f.canonicalFile('PRD.md'),'# Foreign changed source\n');const before=readFileSync(f.state);assert.equal(service('agdf_revise',r).outcome,'rejected');assert.deepEqual(readFileSync(f.state),before);
  reset();const accepted=request();assert.equal(service('agdf_revise',accepted).outcome,'accepted');assert.equal(readRunState(root,{runId:f.runId}).current_gate,'PRD');assert.equal(runSealState(root,readFileSync(f.state,'utf8')).status,'valid');const once=readFileSync(f.state);assert.equal(service('agdf_revise',accepted).outcome,'already_applied');assert.deepEqual(readFileSync(f.state),once);
  console.log('Current bounded PRD revision, exact confirmation/replay, stale source/revision and missing-seal refusal passed. Process interruption coverage remains in early-prd-command-test.');
}finally{rmSync(root,{recursive:true,force:true});rmSync(seed,{recursive:true,force:true});}
