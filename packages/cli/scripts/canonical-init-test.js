// Current-format initialization through its canonical command owner. Historical
// repair, conversion, unowned adoption and old marker/receipt codecs are retired.
import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentFixture } from '../../core/test/fixtures/current-run.js';
import { inspectCanonicalProject, readInitializationReceipt } from '../../core/lib/control-state/canonical-initialization.js';
import { resolutionRecord, recordedInputResolution } from '../../core/lib/control-state/input-resolution.js';
function bytes(root) {
  const result = {};
  const scan = (path, relative) => {
    if (!existsSync(path)) return;
    for (const name of readdirSync(path).sort()) {
      const file = join(path,name), key = relative + '/' + name, info = lstatSync(file);
      if (info.isDirectory()) { result[key] = 'directory'; scan(file,key); }
      else result[key] = readFileSync(file).toString('base64');
    }
  }; scan(join(root,'.agdf'),'.agdf'); return result;
}
const request = f => f.request('project.initialize', { language: 'en' });
function safe(f,input) { try { return f.execute(input); } catch (error) { return { outcome: 'rejected', reason: error.message }; } }
test('canonical init: current seed is atomic, wrapped, replayable and creates neither a Run nor approval', t => {
  const f = currentFixture(t, { initialize: false }), input = request(f), result = f.execute(input);
  assert.equal(result.outcome,'accepted',JSON.stringify(result));
  const control = join(f.root,'.agdf/control'), config = JSON.parse(readFileSync(join(control,'config.json'),'utf8'));
  assert.equal(config.control_layout,'run-folders-v1'); assert.deepEqual(readdirSync(join(control,'runs')),['.gitkeep']); assert.deepEqual(readdirSync(join(control,'planned')),['.gitkeep']);
  assert(!existsSync(join(control,'MASTER_BACKLOG.md'))); assert(!existsSync(join(control,'AGDF_RUN.md'))); assert(!existsSync(join(control,'artefacts')));
  const receipt = readInitializationReceipt(control);
  assert.equal(resolutionRecord(receipt).schema_version,2); assert.equal(resolutionRecord(receipt).created_run,false); assert.equal(resolutionRecord(receipt).created_gate_approval,false);
  assert.equal(recordedInputResolution(receipt).configuration.control,'inactive');
  const before = bytes(f.root); assert.equal(f.execute(input).outcome,'already_applied'); assert.deepEqual(bytes(f.root),before);
  assert.equal(inspectCanonicalProject(f.root,{operationId:input.operation_id}).operation_status,'recorded');
});
for (const phase of ['project_before_prospective_receipt','project_after_prospective_receipt','project_before_publish','project_after_publish','project_after_receipt','project_before_marker_cleanup']) {
  test(`canonical init: interruption at ${phase} retains exact original setup semantics`, t => {
    let failed = false;
    const f = currentFixture(t,{initialize:false,checkpoint(point) { if (!failed && point===phase) { failed=true; throw Error('synthetic_setup_interruption'); } }});
    const input=request(f), first=f.execute(input); assert.equal(failed,true); assert.notEqual(first.outcome,'accepted');
    if (phase === 'project_before_prospective_receipt') {
      const before=bytes(f.root); assert.equal(safe(f,input).outcome,'rejected'); assert.deepEqual(bytes(f.root),before);
      return; // No durable receipt exists yet: an unproven directory is never adopted.
    }
    const retry=f.execute(input); assert(['accepted','already_applied'].includes(retry.outcome),JSON.stringify(retry));
    assert.equal(inspectCanonicalProject(f.root,{operationId:input.operation_id}).status,'initialized');
    assert(readdirSync(join(f.root,'.agdf')).every(name=>!name.startsWith('.control-stage-')));
    assert.deepEqual(readdirSync(join(f.root,'.agdf/control/runs')),['.gitkeep']);
  });
}
for (const phase of ['project_after_prospective_receipt','project_before_publish','project_after_publish']) {
  test(`canonical init: real SIGKILL at ${phase} recovers only its captured original operation`, t => {
    const f=currentFixture(t,{initialize:false}),input=request(f),path=join(f.root,'setup-intent.json');writeFileSync(path,JSON.stringify(input));
    const child=spawnSync(process.execPath,[fileURLToPath(new URL('../../core/test/fixtures/current-init-process.mjs',import.meta.url)),f.root,path,phase],{encoding:'utf8',timeout:20000});
    assert.equal(child.error,undefined);assert.equal(child.stdout,'AGDF_KILL_CHECKPOINT');assert.equal(child.stderr,'');
    if(process.platform==='win32')assert(child.signal==='SIGKILL'||child.status!==null&&child.status!==0);else assert.equal(child.signal,'SIGKILL');
    const result=f.execute(input);assert(['accepted','already_applied'].includes(result.outcome),JSON.stringify(result));
    assert.equal(inspectCanonicalProject(f.root,{operationId:input.operation_id}).operation_status,'recorded');
  });
}
test('canonical init: an unconfirmed Git target cannot acquire project control', t=>{
  const f=currentFixture(t,{initialize:false});rmSync(join(f.root,'.git'),{recursive:true,force:true});
  const result=safe(f,request(f));assert.equal(result.outcome,'rejected');assert(!existsSync(join(f.root,'.agdf')));
});
test('canonical init: foreign partial state is preserved without fill, merge or reset',t=>{
  const f=currentFixture(t,{initialize:false}),control=join(f.root,'.agdf/control');mkdirSync(control,{recursive:true});writeFileSync(join(control,'README.md'),'Foreign authored state.\n');
  const before=bytes(f.root);assert.equal(safe(f,request(f)).outcome,'rejected');assert.deepEqual(bytes(f.root),before);
});
for (const layout of ['master-backlog-v1','planned-urs-v1',null]) test(`canonical init: unsupported layout ${layout} remains unchanged`,t=>{
  const f=currentFixture(t),path=join(f.root,'.agdf/control/config.json'),config=JSON.parse(readFileSync(path,'utf8'));
  if(layout===null)delete config.control_layout;else config.control_layout=layout;writeFileSync(path,JSON.stringify(config));
  const before=bytes(f.root);assert.equal(safe(f,request(f)).outcome,'rejected');assert.deepEqual(bytes(f.root),before);
});
test('canonical init: altered terminal receipt cannot be adopted or reset',t=>{
  const f=currentFixture(t),path=join(f.root,'.agdf/control/.agdf-canonical-init.json'),row=JSON.parse(readFileSync(path,'utf8'));
  row.input_resolution.record_version=1;writeFileSync(path,JSON.stringify(row));const before=bytes(f.root);
  assert.equal(safe(f,request(f)).outcome,'rejected');assert.deepEqual(bytes(f.root),before);
});
for (const defect of ['foreign_stage_file','old_marker_version','altered_prospective_receipt']) test(`canonical init: ${defect} blocks recovery without adoption or deletion`, t=>{
  let interrupted=false;
  const phase=defect==='altered_prospective_receipt'?'project_after_prospective_receipt':'project_before_publish';
  const f=currentFixture(t,{initialize:false,checkpoint(point){if(!interrupted&&point===phase){interrupted=true;throw Error('synthetic_interruption');}}});
  const input=request(f);assert.notEqual(f.execute(input).outcome,'accepted');assert.equal(interrupted,true);
  const agdf=join(f.root,'.agdf'),stage=join(agdf,readdirSync(agdf).find(name=>name.startsWith('.control-stage-')));
  if(defect==='foreign_stage_file')writeFileSync(join(stage,'foreign.bin'),'Foreign bytes must survive.');
  else {
    const path=join(stage,defect==='old_marker_version'?'.agdf-canonical-init-stage.json':'.agdf-canonical-init.json');
    const row=JSON.parse(readFileSync(path,'utf8'));
    if(defect==='old_marker_version')row.input_resolution.record_version=2;else row.receipt_digest='sha256:'+'0'.repeat(64);
    writeFileSync(path,JSON.stringify(row));
  }
  const before=bytes(f.root);assert.equal(safe(f,input).outcome,'rejected');assert.deepEqual(bytes(f.root),before);
});
