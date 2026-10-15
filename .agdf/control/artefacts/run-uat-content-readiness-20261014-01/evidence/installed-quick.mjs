// Actual installed Quick writer/closeout qualification; synthetic disposable scope only.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
const pluginRoot='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const installedCore=pluginRoot+'/runtime/create-agdf/runtime/core/lib';
const {resolveControlCommandTarget}=await import(new URL('file://'+installedCore+'/control-state/approval-command-contract.js'));
const {artefactFileDigest,runSealState}=await import(new URL('file://'+installedCore+'/control-state/run-seal.js'));
const {parseRunState}=await import(new URL('file://'+installedCore+'/control-state/run-state-parser.js'));
const {closeoutConfirmation}=await import(new URL('file://'+installedCore+'/control-evaluation/closeout-readiness.js'));
const transcript=new URL('./installed-quick-stdio.jsonl',import.meta.url);
const root=mkdtempSync(join(tmpdir(),'agdf-report-quick-'));
try {
  execFileSync('git',['init','-q',root]);
  // Source init supplies only the disposable scaffold; all subsequent operations are installed.
  execFileSync(process.execPath,['/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/bin/create-agdf.js','init','--dir',root,'--language','en']);
  const run='quick-content-readiness',prefix=`.agdf/control/artefacts/${run}/`,state=join(root,`.agdf/control/runs/${run}/RUN_STATE.md`);
  execFileSync(process.execPath,[pluginRoot+'/runtime/agdf-local.js','run-create','--dir',root,'--run',run]);
  mkdirSync(join(root,prefix),{recursive:true});
  const target=resolveControlCommandTarget(root).target_id;
  const revision=()=>parseRunState(readFileSync(state,'utf8'),run).meta.revision_id;
  const bound=()=>({schema_version:'1',presentation_language:'en',working_directory:root,target_source:'explicit_target',primary_target:root,
    target_id:target,run_id:run,expected_revision_id:revision(),operation_id:randomUUID(),assurance:'cooperative_local'});
  const source=(name,text)=>{const path=prefix+name;writeFileSync(join(root,path),text);return {path,digest:artefactFileDigest(root,path)};};
  const snapshot=()=>{const value={};const walk=p=>{for(const e of readdirSync(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())walk(f);else value[f]=readFileSync(f).toString('base64');}};
    walk(join(root,`.agdf/control/runs/${run}`));walk(join(root,prefix));value.backlog=readFileSync(join(root,'.agdf/control/MASTER_BACKLOG.md')).toString('base64');return value;};
  const config=JSON.parse(readFileSync(pluginRoot+'/mcp.json','utf8')).mcpServers.agdf;
  await withStdioClient({command:config.command,args:config.args,cwd:root,modern:false},async client=>{
    const call=async(name,input)=>{const before=snapshot();const out=await client.callTool({name,arguments:input});
      appendFileSync(transcript,JSON.stringify({kind:'actual_installed_quick_stdio',name,input,result:out,native_model_observed:false})+'\n');
      assert.ok(out.structuredContent,JSON.stringify(out));if(out.structuredContent.outcome==='rejected')assert.deepEqual(snapshot(),before);return out.structuredContent;};
    const record=async payload=>{const result=await call('agdf_record',{...bound(),command:{kind:'step.record',payload}});assert.equal(result.outcome,'accepted',JSON.stringify(result));return result;};
    await record({step:'ur',title:'Synthetic single-function fix',source:source('UR_CANDIDATE.md','# UR: Synthetic single-function fix\n\n## Problem\nA bounded function has a defect.\n## Goal\nCorrect that defect with its regression.\n## Scope\nOne function and its direct test.\n\n## AGDF Approval Summary (en; source=en)\n- Problem: One bounded function has a defect.\n- Goal: Correct the defect with its regression.\n- Scope: One function and its direct test.\n')});
    await record({step:'route',route:'quick_task',reason:'Synthetic narrow function fix and its test, no policy or architecture change.',source:source('BROWNFIELD_CANDIDATE.md','# Brownfield Review\nSynthetic disposable narrow function scope.\n')});
    const prepared=await call('agdf_prepare',{...bound(),command:{kind:'presentation.prepare',payload:{gate:'UR'}}});assert.equal(prepared.outcome,'accepted');
    assert.equal((await call('agdf_approve',{...bound(),command:{kind:'approval.record',payload:{gate:'UR',presentation_id:prepared.family_result.presentation_id,response:'Approval: UR'}}})).outcome,'accepted');
    for(const text of ['~~~\nDecision: pass\n~~~\n','> Example:\nDecision: pass\n','## Examples\nDecision: pass\n','<blockquote>\n## QA Decision\nDecision: pass\n</blockquote>\n']){
      const submitted=source('CR_CANDIDATE.md',text);
      assert.equal((await call('agdf_record',{...bound(),command:{kind:'step.record',payload:{step:'review',decision:'pass',source:submitted}}})).outcome,'rejected');
    }
    await record({step:'review',decision:'pass',source:source('CR_CANDIDATE.md','# Code Review\nStatus: pass\n- decision: pass\nActual synthetic fixture review.\n\n## Examples\nDecision: block\n> Example:\nDecision: unknown\n')});
    const or=source('OR_CANDIDATE.md',`# OR-lite: Synthetic report-field fixture\nReport mode: OR-lite\nRun: ${run}\n\n## Result\nSynthetic bounded scope reviewed.\n## Evidence\nActual installed canonical report recording observed.\n## Risk\nnone\n## Next Step\nnone\n`);
    const request={...bound(),command:{kind:'closeout.record',payload:{or,confirmation:''}}};
    request.command.payload.confirmation=closeoutConfirmation(run,request.expected_revision_id,request.operation_id,or.digest);
    const closed=await call('agdf_closeout',request);assert.equal(closed.outcome,'accepted',JSON.stringify(closed));assert.equal(closed.current.lifecycle,'completed');
    assert.equal((await call('agdf_closeout',request)).outcome,'already_applied');assert.equal(runSealState(root,readFileSync(state,'utf8')).status,'valid');
    const summaryPath=new URL('./installed-qualification.json',import.meta.url),summary=JSON.parse(readFileSync(summaryPath,'utf8'));
    summary.flows.push({route:'quick_task',protocol:'default-negotiation',outcome:'pass',negative_canonical_state_unchanged:true,completed:true,replay:'already_applied'});
    writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
    console.log('Actual installed Quick review context refusal/acceptance, OR-lite completion, valid seal and exact replay passed. Synthetic fixture only; no VCS action.');
  });
} finally {rmSync(root,{recursive:true,force:true});}
