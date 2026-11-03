import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createCoreServices, resources } from '../../../packages/core/lib/index.js';
import { parseControlInspectFunctionArguments } from '../../../packages/core/lib/control-inspect/contract.js';
import { loadEdgeTasks, buildEdgeFixture, edgeContext, edgeBinding, renderEdgePrompt, evaluateEdge, receipts } from '../lib/edge-tasks.js';
import { createProtocolRuntime } from '../lib/protocol-harness.js';
import { withStdioClient } from '../../../packages/mcp-server/test/helpers.js';
import { CLI } from '../lib/fixtures.js';
import { PassThrough } from 'node:stream';
import { consumeUtf8Output, deliveredDocumentPages, rolloutDates } from '../lib/edge-output.js';

const prefix='mcp__plugin_agdf_agdf__';
const parsed=calls=>({calls,trace_complete:true,detours:[]});
const call=(name,input,value)=>({name:prefix+name,input,result:{text:JSON.stringify(value),is_error:false}});
const inspect=(f,input)=>createCoreServices().inspect(parseControlInspectFunctionArguments({...edgeContext(f),...input},
  {surface:'codex',interactionLocales:resources.interactionLocales,expectedVersion:resources.pluginDefinition.version}));
const bound=f=>({...edgeContext(f),schema_version:'1',target_id:f.targetId,run_id:f.runId,expected_revision_id:f.initialRevision,operation_id:randomUUID(),assurance:'cooperative_local'});

test('scoped rollout lookup retains session start and finish dates across midnight',()=>{
  const dates=rolloutDates(Date.parse('2026-11-02T23:59:59Z'),Date.parse('2026-11-03T00:00:01Z'));
  assert.ok(dates.includes('2026/11/02'));assert.ok(dates.includes('2026/11/03'));
  assert.ok(dates.length<=4);assert.equal(new Set(dates).size,dates.length);
});

test('native output preserves UTF-8 split across pipe chunks; only ordered actual messages prove delivery',async()=>{
  const text='ä界🙂\n{"content":"Ö🧭"}\n',pipe=new PassThrough();let output='';
  const done=new Promise(resolve=>pipe.once('end',resolve));consumeUtf8Output(pipe,chunk=>{output+=chunk});
  for(const byte of Buffer.from(text))pipe.write(Buffer.from([byte]));pipe.end();await done;
  assert.equal(output,text);
  const pages=['ä界🙂','öß'];
  assert.equal(deliveredDocumentPages(pages,['prefix '+pages.join('')+' suffix']),true);
  assert.equal(deliveredDocumentPages(pages,pages),true);
  for(const messages of [[],['I read all pages'],[pages[1],pages[0]],[pages[0]],[pages[0],pages[1].slice(1)]])
    assert.equal(deliveredDocumentPages(pages,messages),false);
});

test('frozen edge catalog, positive controls and exact Unicode pages reject empty/truncated/wrong-version evidence',()=>{
  const catalog=loadEdgeTasks();assert.equal(catalog.repetitions,3);assert.equal(catalog.tasks.length,8);
  for(const task of catalog.tasks) {
    const f=buildEdgeFixture(task);
    try {
      assert.equal(evaluateEdge({task,fixture:f,parsed:parsed([]),finalText:''}).success,false,task.id+' empty trace');
      assert.equal(evaluateEdge({task,fixture:f,parsed:parsed([]),finalText:''}).protection_passed,true,task.id+' no effect is safe, not successful');
      const prompt=renderEdgePrompt(task,f);assert.ok(prompt.length>30);
      if(task.fixture==='paged'||task.fixture==='quoted') {
        if(task.fixture==='quoted')assert.match(f.expectedDocument.toString(),/Approval: UR/u);
        const calls=[],binding=edgeBinding(f);let cursor;
        do {
          const input={...edgeContext(f),operation:'presentation-document',...binding,...(cursor?{cursor}:{})};
          const value=inspect(f,input);assert.equal(value.report?.available,true,JSON.stringify(value));
          calls.push(call('agdf_inspect',input,value));cursor=value.report.next_cursor;
        }while(cursor);
        const args={task,fixture:f,parsed:parsed(calls),finalText:f.expectedDocument.toString()};
        const good=evaluateEdge(args);assert.equal(good.success,true,JSON.stringify(good));
        if(task.fixture==='paged') {
          assert.ok(good.detail.pages>=2);assert.notEqual(f.selectedRevision,f.revision());
          assert.equal(evaluateEdge({...args,parsed:parsed(calls.slice(0,-1))}).success,false);
          assert.equal(evaluateEdge({...args,finalText:'summary only'}).success,false);
          const bad=structuredClone(calls);bad[0].input.presentation_id=f.newerPresentationId;
          assert.equal(evaluateEdge({...args,parsed:parsed(bad)}).success,false);
        }
        assert.equal(evaluateEdge({...args,changes:['src/foreign.js']}).protection_passed,false);
      }
      if(task.fixture==='status') {
        const input={...edgeContext(f),operation:'gate-check',run_id:f.runId},value=inspect(f,input);
        const grade=evaluateEdge({task,fixture:f,parsed:parsed([call('agdf_inspect',input,value)]),finalText:'PRD'});
        assert.equal(grade.success,true,JSON.stringify({grade,value}));
      }
      if(task.fixture==='unknown') {
        const input={...edgeContext(f),operation:'gate-check',run_id:'demo-run-0l'},value=inspect(f,input);
        const grade=evaluateEdge({task,fixture:f,parsed:parsed([call('agdf_inspect',input,value)]),finalText:'Run existiert nicht.'});
        assert.equal(grade.success,true,JSON.stringify({grade,value}));
      }
      if(task.fixture==='approval') {
        const input={...edgeContext(f),operation:'gate-check',run_id:f.runId};
        const current=call('agdf_inspect',input,inspect(f,input));
        const request={...bound(f),command:{kind:'approval.record',payload:{gate:'UR',presentation_id:f.presentationId,response:'Approval: UR'}}};
        const accepted=call('agdf_approve',request,createCoreServices().command('agdf_approve',request));
        const grade=evaluateEdge({task,fixture:f,parsed:parsed([current,accepted]),finalText:'Recorded.'});
        assert.equal(grade.success,true,JSON.stringify(grade));
      }
    }finally{f.dispose()}
  }
});

test('transport faults follow real canonical effects; stale write rejected and lost acknowledgement recovered exactly once',async()=>{
  const runtime=createProtocolRuntime(),dir=mkdtempSync(join(tmpdir(),'agdf-edge-fault-test-'));
  try {
    for(const id of ['E2','E6']) {
      const task=loadEdgeTasks().tasks.find(t=>t.id===id),f=buildEdgeFixture(task),journal=join(dir,id+'.json'),config=join(dir,id+'-config.json');
      try {
        writeFileSync(config,JSON.stringify({serverMain:join(runtime.fixture.serverRoot,'src/main.js'),fault:task.fixture,root:f.root,runId:f.runId,revision:f.initialRevision,cli:CLI,evidencePath:f.evidence?join(f.root,f.evidence.path):null,journal}));
        await withStdioClient({...runtime.fixture,modern:true,args:[fileURLToPath(new URL('../lib/edge-transport.mjs',import.meta.url)),config]},async client=>{
          const calls=[];
          const invoke=async(name,input)=>{const r=await client.callTool({name,arguments:input});calls.push(call(name,input,r.structuredContent));return r.structuredContent;};
          const gate=await invoke('agdf_inspect',{...edgeContext(f),operation:'gate-check',run_id:f.runId});
          assert.equal(gate.outcome,'inspect_result');
          if(id==='E2') {
            const result=await invoke('agdf_record',{...bound(f),command:{kind:'step.record',payload:{step:'evidence',source:f.evidence,reason:'Synthetic unit checks passed',covers:'AC-001'}}});
            assert.equal(result.reason,'stale_revision');
          }else {
            const original={...bound(f),command:{kind:'approval.record',payload:{gate:'UR',presentation_id:f.presentationId,response:'Approval: UR'}}};
            await assert.rejects(client.callTool({name:'agdf_approve',arguments:original},{timeout:5000}),/timeout|timed out/iu);
            calls.push({name:prefix+'agdf_approve',input:original,result:{text:'request timed out',is_error:true}});
            const status=await invoke('agdf_inspect',{...edgeContext(f),operation:'operation-status',module:original.operation_id,run_id:f.runId,expected_revision_id:f.initialRevision});
            assert.equal(status.report.status,'recorded');
            const replay=await invoke('agdf_approve',original);assert.equal(replay.outcome,'already_applied');
            assert.equal(receipts(f).filter(r=>r.kind==='approval.record').length,1);
          }
          const fault=JSON.parse(readFileSync(journal,'utf8'));
          const grade=evaluateEdge({task,fixture:f,parsed:parsed(calls),finalText:'resolved',changes:['.agdf/control/runs/'+f.runId+'/RUN_STATE.md'],fault});
          assert.equal(grade.success,true,JSON.stringify(grade));
          if(id==='E6')assert.equal(grade.detail.exact_replay,true);
        });
      }finally{f.dispose()}
    }
  }finally{runtime.dispose();rmSync(dir,{recursive:true,force:true})}
});
