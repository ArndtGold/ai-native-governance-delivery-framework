import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { describeArtifactReadiness, inspectArtifactReadiness } from '../lib/control-inspect/artifact-readiness.js';
import { approvalFixture, fixture, treeBytes } from './control-cockpit-fixtures.js';
import { artifactReadinessFixture, readyPrd } from './fixtures/artifact-readiness.js';
import { upsertTableRow } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
import { createHash } from 'node:crypto';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const row = result => result.data.run.document_states.find(s => s.type === 'UR');
function draftFixture(content = readyPrd) {
  const f = artifactReadinessFixture('PRD'); f.root = fs.realpathSync(f.root); fs.writeFileSync(f.path, content);
  const path = `.agdf/control/artefacts/${f.runId}/PRD.md`, statePath = join(f.root, `.agdf/control/runs/${f.runId}/RUN_STATE.md`);
  fs.writeFileSync(statePath, sealRunState(f.root, upsertTableRow(fs.readFileSync(statePath, 'utf8'), 'Artefacts', 0, 'PRD', ['PRD', path, 'draft', 'Disposable registered draft'])));
  return { ...f, close: () => fs.rmSync(f.root, { recursive: true, force: true }) };
}
test('SCN-001/009/014: actual gate registrations, bounded unavailable sources, no phantom entries or writes', () => {
  const f = fixture(); try {
    f.register('PRD', '.agdf/control/artefacts/fixture-a/absent.md');
    f.register('SD', '../outside.md');
    f.register('Brownfield Analysis', '.agdf/control/artefacts/fixture-a/analysis.md');
    const before = treeBytes(f.root), reader = createCockpitReader(f.root), r = reader.snapshot('fixture-a');
    assert.equal(r.state, 'available'); assert.equal(r.data.run.document_states.length, 3);
    assert.deepEqual(r.data.run.document_states.map(s => s.type), ['UR', 'PRD', 'SD']);
    assert.equal(r.data.run.document_states[1].source_state, 'missing'); assert.equal(r.data.run.document_states[2].source_state, 'blocked');
    assert.ok(r.data.run.document_states.every(s => s.authorizes === false));
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
});
test('SCN-003/004/014: actual canonical approval binds raw returned bytes; normalization-equivalent edits cannot inherit it', async () => {
  const f = await approvalFixture(); try {
    assert.equal(f.approve().outcome, 'approved'); const before = treeBytes(f.root);
    const reader = createCockpitReader(f.root), selected = reader.snapshot('fixture-a');
    assert.equal(row(selected).state, 'approved', JSON.stringify(row(selected)));
    const source = selected.data.run.resources.find(s => s.type === 'UR');
    const opened = reader.document(source.resource_id, selected.snapshot_id, 'fixture-a');
    let observation = opened;
    assert.equal(opened.data.document.content_digest, sha(fs.readFileSync(join(f.root, f.documentPath))));
    assert.deepEqual(opened.data.document.document_state, row(opened)); assert.equal(row(opened).version_kind, 'approved');
    assert.equal(opened.data.document.resource.status, 'registered'); assert.deepEqual(treeBytes(f.root), before);
    const original = fs.readFileSync(join(f.root, f.documentPath), 'utf8');
    for (const content of ['\ufeff' + original.replaceAll('\n', '\r\n'), original + '\nChanged source\n']) {
      fs.writeFileSync(join(f.root, f.documentPath), content);
      assert.throws(() => reader.freshness(observation.snapshot_id), /source_changed/);
      const fresh = reader.snapshot('fixture-a');
      observation = fresh;
      assert.equal(row(fresh).state, 'approval_unconfirmed'); assert.equal(row(fresh).version_kind, 'current');
      assert.ok(row(fresh).recorded_approval.evidence.includes('Approval: UR'));
      assert.equal(row(fresh).content_digest, sha(fs.readFileSync(join(f.root, f.documentPath))));
    }
  } finally { f.close(); }
});
test('SCN-004: missing or foreign/malformed approval presentation never confirms current version', async () => {
  for (const mutation of ['missing', 'malformed', 'foreign']) {
    const f = await approvalFixture(); try {
      assert.equal(f.approve().outcome, 'approved');
      const dir = join(f.root, '.agdf/control/runs/fixture-a/presentations'), path = join(dir, fs.readdirSync(dir)[0]);
      if (mutation === 'missing') fs.rmSync(path);
      else if (mutation === 'malformed') fs.writeFileSync(path, '{broken');
      else { const p = JSON.parse(fs.readFileSync(path, 'utf8')); p.record.run_id = 'foreign'; fs.writeFileSync(path, JSON.stringify(p)); }
      const fresh = createCockpitReader(f.root).snapshot('fixture-a'); assert.equal(row(fresh).state, 'approval_unconfirmed');
      assert.ok(row(fresh).recorded_approval); assert.equal(row(fresh).version_kind, 'current');
    } finally { f.close(); }
  }
});
test('SCN-005/007/008/014: real passed/correction reports survive fresh same-Run navigation only; reload, changes and other views clear', () => {
  for (const content of [readyPrd, readyPrd.replace('- AC-001: Die gewählte Quelle bleibt lesbar.\n', '')]) {
    const f = draftFixture(content); try {
      const reader = createCockpitReader(f.root), other = createCockpitReader(f.root); let s = reader.snapshot(f.runId);
      const before = treeBytes(f.root), checked = reader.artifactReadiness(f.runId, s.snapshot_id, 'PRD', f.revision);
      const result = checked.data.run.draft_check.result, expected = inspectArtifactReadiness(f.root, {runId:f.runId,gate:'PRD',expectedRevisionId:f.revision,presentationLanguage:'de'});
      assert.deepEqual(result, expected); assert.equal(result.authorizes, false);
      const state = checked.data.run.document_states.find(x => x.type === 'PRD');
      assert.equal(state.state, expected.ready ? 'draft_checked' : 'revision_required');
      assert.equal(other.snapshot(f.runId).data.run.draft_check.result, null);
      assert.throws(() => reader.document('foreign', checked.snapshot_id), /resource_denied/);
      const source = checked.data.run.resources.find(r => r.type === 'PRD');
      const opened = reader.document(source.resource_id, checked.snapshot_id, f.runId);
      assert.notEqual(opened.snapshot_id, checked.snapshot_id); assert.notEqual(opened.data.document.resource.resource_id, source.resource_id);
      assert.deepEqual(opened.data.document.document_state.check.result, result);
      const context = reader.context(f.runId, opened.snapshot_id);
      assert.deepEqual(context.data.run.draft_check.result, result);
      s = reader.run(f.runId, context.snapshot_id); assert.deepEqual(s.data.run.draft_check.result, result);
      assert.equal(reader.snapshot(f.runId).data.run.draft_check.result, null);
      s = reader.snapshot(f.runId); s = reader.artifactReadiness(f.runId, s.snapshot_id, 'PRD', f.revision);
      fs.writeFileSync(f.path, content + '\nChanged raw draft\n');
      assert.throws(() => reader.freshness(s.snapshot_id), /source_changed/);
      fs.writeFileSync(f.path, content);
      assert.throws(() => reader.run(f.runId, s.snapshot_id), /source_changed/, 'Restoring bytes does not revive the changed capture');
      assert.equal(reader.snapshot(f.runId).data.run.draft_check.result, null, 'Fresh recovery cannot resurrect cleared result');
      s = reader.snapshot(f.runId); s = reader.artifactReadiness(f.runId, s.snapshot_id, 'PRD', f.revision);
      s = reader.run('nonexistent-run', s.snapshot_id); assert.equal(s.state, 'missing');
      assert.equal(reader.run(f.runId, s.snapshot_id).data.run.draft_check.result, null);
      assert.deepEqual(treeBytes(f.root), before);
    } finally { f.close(); }
  }
});
test('SCN-006: explicit structured current authoring findings versus unsupported/prerequisite/technical failures', () => {
  const base = {ready:false,gate:'PRD',current_gate:'PRD',diagnostics:[{code:'artifact_gate_not_ready',message:'Original gate prerequisite'}],blocking_reason:'AGDF_PRD_DECISIONS_OPEN',readiness_details:{prd:{open_decisions:['Owner decision remains open']}}};
  const described = describeArtifactReadiness(base);
  assert.equal(described.state, 'corrections_required'); assert.deepEqual(described.findings, [{code:base.blocking_reason,message:'Owner decision remains open'}]);
  for (const change of [{blocking_reason:'AGDF_UNKNOWN'}, {current_gate:'SD'}, {readiness_details:{}}, {readiness_details:{prd:{open_decisions:[]}}}, {diagnostics:[{code:'artifact_read_timeout'}]},
    {diagnostics:[{code:'prd_readiness_unknown'}]}, {diagnostics:[{code:'approval_summary_unknown'}]}]) {
    const result = describeArtifactReadiness({...base,...change}); assert.equal(result.state,'unavailable'); assert.deepEqual(result.findings,[]);
  }
});

test('SCN-005/006: actual registered UR/PRD/SD/TP early authoring blockers preserve the original report and findings', () => {
  const broken = {
    UR: '# UR: Incomplete need\n\nRequirements clarification: complete\n',
    PRD: readyPrd.replace('before_prd | resolved', 'before_prd | open'),
    SD: '# SD: Open design\n\nDesign Decisions contract: sd-decisions-v1\n\n## Design Decisions\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|---|\n| Ownership | before_sd | open | Decide ownership | Synthetic design owner |\n',
    TP: '# TP: Missing scenario mapping\n\nTraceability contract: criteria-chain-v1\n',
  };
  for (const gate of Object.keys(broken)) {
    const f = artifactReadinessFixture(gate, 'en'); f.root = fs.realpathSync(f.root);
    try {
      fs.writeFileSync(f.path, broken[gate]);
      f.reseal(text => upsertTableRow(text, 'Artefacts', 0, gate, [gate, `${f.prefix}${gate}.md`, 'draft', 'Actual registered authoring draft']));
      const before = treeBytes(f.root), reader = createCockpitReader(f.root), selected = reader.snapshot(f.runId);
      assert.equal(selected.data.run.draft_check.source.available, true, JSON.stringify(selected));
      const checked = reader.artifactReadiness(f.runId, selected.snapshot_id, gate, f.revision), check = checked.data.run.draft_check;
      assert.deepEqual(check.result, inspectArtifactReadiness(f.root, {runId:f.runId,gate,expectedRevisionId:f.revision,presentationLanguage:'de'}));
      assert.equal(check.result.diagnostics[0].code, 'artifact_gate_not_ready', JSON.stringify(check));
      assert.equal(check.result.current_gate, gate); assert.equal(check.display.state, 'corrections_required');
      assert.ok(check.display.findings.length); assert.equal(checked.data.run.document_states.find(s => s.type === gate).state, 'revision_required');
      assert.deepEqual(treeBytes(f.root), before);
    } finally { fs.rmSync(f.root, {recursive:true,force:true}); }
  }
});

test('SCN-006: actual current SD traceability findings are shown without changing the original report', () => {
  const f=artifactReadinessFixture('SD','en'); f.root=fs.realpathSync(f.root);
  try {
    fs.writeFileSync(f.path,'# SD: Missing design mapping\n\nTraceability contract: criteria-chain-v1\n');
    f.reseal(text=>upsertTableRow(text,'Artefacts',0,'SD',['SD',`${f.prefix}SD.md`,'draft','Actual SD traceability fixture']));
    const before=treeBytes(f.root),reader=createCockpitReader(f.root),selected=reader.snapshot(f.runId);
    const checked=reader.artifactReadiness(f.runId,selected.snapshot_id,'SD',f.revision),check=checked.data.run.draft_check;
    assert.deepEqual(check.result,inspectArtifactReadiness(f.root,{runId:f.runId,gate:'SD',expectedRevisionId:f.revision,presentationLanguage:'de'}));
    assert.equal(check.display.state,'corrections_required');
    assert.ok(check.display.findings.some(x=>/Traceability|traceability/.test(x.message)));
    assert.equal(checked.data.run.document_states.find(s=>s.type==='SD').state,'revision_required');
    assert.deepEqual(treeBytes(f.root),before);
  } finally {fs.rmSync(f.root,{recursive:true,force:true});}
});
test('SCN-008: another existing Run and observed missing draft invalidate an already passed slot', () => {
  const f=draftFixture(),other=artifactReadinessFixture('PRD','de','another-run');
  try {
    for(const dir of ['artefacts','runs'])fs.cpSync(join(other.root,'.agdf/control',dir,other.runId),join(f.root,'.agdf/control',dir,other.runId),{recursive:true});
    const reader=createCockpitReader(f.root);let s=reader.snapshot(f.runId);
    s=reader.artifactReadiness(f.runId,s.snapshot_id,'PRD',f.revision);
    assert.equal(s.data.run.draft_check.display.state,'passed');
    const before=treeBytes(f.root),otherSelected=reader.run(other.runId,s.snapshot_id);
    assert.equal(otherSelected.state,'available');assert.equal(otherSelected.data.run.run_id,other.runId);
    s=reader.run(f.runId,otherSelected.snapshot_id);assert.equal(s.data.run.draft_check.result,null);assert.deepEqual(treeBytes(f.root),before);
    s=reader.artifactReadiness(f.runId,s.snapshot_id,'PRD',f.revision);
    fs.rmSync(f.path);assert.throws(()=>reader.freshness(s.snapshot_id),/source_changed/);
    fs.writeFileSync(f.path,readyPrd);assert.throws(()=>reader.run(f.runId,s.snapshot_id),/source_changed/);
    assert.equal(reader.snapshot(f.runId).data.run.draft_check.result,null);
  } finally {f.close();fs.rmSync(other.root,{recursive:true,force:true});}
});
test('SCN-008: failed publication, overview and observed lifecycle/gate/revision changes clear the slot', () => {
  for (const kind of ['overview', 'revision', 'lifecycle', 'gate', 'published']) {
    const f = draftFixture(); let armed = false;
    try {
      const reader = createCockpitReader(f.root, {checkpoint(stage) {
        if (armed && kind === 'published' && stage === 'published') { armed = false; fs.writeFileSync(f.path, readyPrd + '\nConcurrent change\n'); }
      }});
      let selected = reader.snapshot(f.runId);
      selected = reader.artifactReadiness(f.runId, selected.snapshot_id, 'PRD', f.revision);
      assert.ok(selected.data.run.draft_check.result);
      if (kind === 'overview') { selected = reader.snapshot(); }
      else if (kind === 'published') {
        armed = true; selected = reader.run(f.runId, selected.snapshot_id);
        assert.equal(selected.code, 'source_changed'); fs.writeFileSync(f.path, readyPrd);
      } else {
        const original = fs.readFileSync(f.runPath, 'utf8');
        const change = kind === 'revision' ? original.replace(f.revision, '00000000-0000-0000-0000-000000000001')
          : kind === 'lifecycle' ? original.replace('- lifecycle: active', '- lifecycle: completed')
          : original.replace('- current_gate: PRD', '- current_gate: QA');
        fs.writeFileSync(f.runPath, sealRunState(f.root, change));
        assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
        fs.writeFileSync(f.runPath, original);
      }
      assert.equal(reader.snapshot(f.runId).data.run.draft_check.result, null);
    } finally { f.close(); }
  }
});

test('SCN-009: real large authoring findings hit the slot/description bound without truncation or retained success', () => {
  const f=draftFixture();
  try {
    const reader=createCockpitReader(f.root);
    for(const length of [1024,140000]) {
      fs.writeFileSync(f.path,readyPrd.replace('| Scope | before_prd | resolved',`| ${'Large actual decision '.padEnd(length,'x')} | before_prd | open`));
      f.reseal(s=>s);const selected=reader.snapshot(f.runId),before=treeBytes(f.root);
      const checked=reader.artifactReadiness(f.runId,selected.snapshot_id,'PRD',f.revision);
      if(length===1024){assert.equal(checked.data.run.draft_check.display.state,'corrections_required');assert.ok(Buffer.byteLength(JSON.stringify(checked.data.run.document_states))<=256*1024);}
      else {assert.equal(checked.code,'resource_limit');assert.equal(checked.data,null);assert.equal(reader.snapshot(f.runId).data.run.draft_check.result,null);}
      assert.deepEqual(treeBytes(f.root),before);
    }
  }finally{f.close();}
});

test('SCN-009: actual unregistered authoring slot below, exactly at and above 256 KiB', () => {
  const limit=256*1024;let exact=false;
  for(const suffix of ['','x','xx']){
    const f=artifactReadinessFixture('PRD','de','bounded-draft'+suffix);f.root=fs.realpathSync(f.root);
    try{
      const content=n=>readyPrd.replace('| Scope | before_prd | resolved',`| ${'x'.repeat(n)} | before_prd | open`);
      fs.writeFileSync(f.path,content(1));const reader=createCockpitReader(f.root),s=reader.snapshot(f.runId);
      const result=inspectArtifactReadiness(f.root,{runId:f.runId,gate:'PRD',expectedRevisionId:f.revision,presentationLanguage:'de'});
      const size=Buffer.byteLength(JSON.stringify({target_id:s.target.target_id,source:s.data.run.draft_check.source,content_digest:sha(fs.readFileSync(f.path)),result,display:describeArtifactReadiness(result)}));
      const n=1+(limit-size)/3;if(!Number.isInteger(n))continue;
      exact=true;
      for(const delta of [-1,0,1]){
        fs.writeFileSync(f.path,content(n+delta));const selected=reader.snapshot(f.runId),before=treeBytes(f.root);
        const original=inspectArtifactReadiness(f.root,{runId:f.runId,gate:'PRD',expectedRevisionId:f.revision,presentationLanguage:'de'});
        const bytes=Buffer.byteLength(JSON.stringify({target_id:selected.target.target_id,source:selected.data.run.draft_check.source,content_digest:sha(fs.readFileSync(f.path)),result:original,display:describeArtifactReadiness(original)}));
        assert.equal(bytes,limit+delta*3);
        const checked=reader.artifactReadiness(f.runId,selected.snapshot_id,'PRD',f.revision);
        if(delta<=0){assert.equal(checked.state,'available',JSON.stringify(checked));assert.deepEqual(checked.data.run.draft_check.result,original);assert.equal(checked.data.run.resources.some(r=>r.type==='PRD'),false);}
        else{assert.equal(checked.code,'resource_limit');assert.equal(checked.data,null);assert.equal(reader.snapshot(f.runId).data.run.draft_check.result,null);}
        assert.deepEqual(treeBytes(f.root),before);
      }
      break;
    }finally{fs.rmSync(f.root,{recursive:true,force:true});}
  }
  assert.equal(exact,true,'One real fixture must exercise exactly 256 KiB; no skipped boundary');
});

test('SCN-009: Core document description array enforces its exact serialized limit',async()=>{
  const f=await approvalFixture();
  try{
    assert.equal(f.approve().outcome,'approved');const original=fs.readFileSync(f.runPath,'utf8');
    const evidence=original.split('\n').find(l=>l.startsWith('| UR | approved |')).split('|')[3].trim();
    const reader=createCockpitReader(f.root),set=n=>fs.writeFileSync(f.runPath,sealRunState(f.root,upsertTableRow(original,'Approvals',0,'UR',['UR','approved',evidence+' '+ 'x'.repeat(n)])));
    // First measure the actual final-state shape, including any integrity qualification.
    set(250000);const measured=reader.snapshot('fixture-a');assert.equal(measured.state,'available');
    const base=Buffer.byteLength(JSON.stringify(measured.data.run.document_states)),n=250000+(256*1024-base);
    for(const delta of [-1,0,1]){
      set(n+delta);const before=treeBytes(f.root),observed=reader.snapshot('fixture-a');
      if(delta<=0){assert.equal(observed.state,'available',JSON.stringify(observed));assert.equal(Buffer.byteLength(JSON.stringify(observed.data.run.document_states)),256*1024+delta);}
      else{assert.equal(observed.code,'resource_limit');assert.equal(observed.data,null);}
      assert.deepEqual(treeBytes(f.root),before);
    }
  }finally{f.close();}
});
