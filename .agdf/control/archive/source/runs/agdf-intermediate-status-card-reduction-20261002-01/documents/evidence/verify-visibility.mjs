import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const repo=resolve(process.argv[2]), out=dirname(fileURLToPath(import.meta.url));
const load=path=>import(pathToFileURL(join(repo,path)).href);
const {createSkillDispatchService}=await load('packages/core/lib/skill-dispatch/service.js');
const {sealRunState}=await load('packages/core/lib/control-state/run-seal.js');
const {appendTableRow}=await load('packages/core/lib/control-state/run-state-edits.js');
const locales=JSON.parse(readFileSync(join(repo,'plugins/agdf/meta/agdf-interaction-locales.json')));
const frozen=JSON.parse(readFileSync(join(out,'baseline-inputs.json'))),root=mkdtempSync(join(tmpdir(),'agdf-card-visibility-'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const save=(name,value)=>writeFileSync(join(out,name),JSON.stringify(value,null,2)+'\n');
try {
  cpSync(join(out,'fixture'),root,{recursive:true});execFileSync('git',['init','-q',root]);
  const input={...frozen.input,workingDirectory:root,primaryTarget:root,interactionLocales:locales};
  const state=join(root,`.agdf/control/runs/${input.runId}/RUN_STATE.md`), before=readFileSync(state,'utf8');
  const emit=createSkillDispatchService({env:{}}),first=emit(input),repeat=emit(input);
  assert.equal(first.terminal,false);assert.equal(repeat.terminal,false);
  assert.equal(first.presentation,null);assert.equal(repeat.presentation,null);
  const status=emit({...input,continueDelivery:false});assert.equal(status.terminal,true);
  assert.equal(status.control.revision_id,repeat.control.revision_id);assert.ok(status.host_action.text);
  assert.equal(readFileSync(state,'utf8'),before);
  const changed=sealRunState(root,before.replaceAll('Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR.','Resolve the newly recorded scope uncertainty before further work.'));
  writeFileSync(state,changed);const resumed=emit(input);
  assert.equal(resumed.terminal,true);assert.ok(resumed.host_action.text);
  assert.equal(readFileSync(state,'utf8'),changed);
  save('repeat-status-resume.json',{lane:'deterministic source only',synthetic_non_authorizing:true,
    unchanged_repeat:{first,repeat,extra_cards:0},explicit_fresh_status:status,
    changed_resumption:resumed,read_only_hash_parity:{before:hash(before),after_unchanged_reads:hash(before),after_changed_read:hash(changed)},actual_model_observation:false});
  const renders=[];
  for(const locale of Object.keys(locales.locales)) {
    const value=emit({...input,presentationLanguage:locale});assert.equal(value.terminal,true);
    renders.push({locale,case:'changed_resumption',markdown:value.host_action.text});
  }
  save('rendered-resumption.json',{lane:'source renderer; not host/model',renders});
  const maintenance=appendTableRow(before,'Evidence',['Relationship correction','synthetic reviewed mapping','synthetic renderer case; actual correction is covered separately by control-state tests','source renderer']);
  const conflict=before.replace(/^(\| SD \| derived_from \| PRD \|[^\n]*\n)/mu,'$1$1');
  assert.notEqual(conflict,before);
  for(const [name,text,key] of [['maintenance',maintenance,'relationshipCorrected'],['conflicting_relationship',conflict,'blockedRelationshipConflict']]) {
    writeFileSync(state,sealRunState(root,text));
    for(const locale of Object.keys(locales.locales)) {
      const value=emit({...input,continueDelivery:false,presentationLanguage:locale});
      assert.equal(value.terminal,true);assert.ok(value.host_action.text.includes(locales.locales[locale].operationalValues[key]));
      renders.push({locale,case:name,synthetic_renderer_fixture:true,markdown:value.host_action.text});
    }
  }
  save('rendered-locales.json',{lane:'source renderer only; actual recording/correction tested in control-state',locales:Object.keys(locales.locales),renders});
  process.stdout.write('repeat, fresh explicit status and changed-resumption source checks passed\n');
} finally {rmSync(root,{recursive:true,force:true});}
