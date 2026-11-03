import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Readable, Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCoreServices, resources } from '../../../packages/core/lib/index.js';
import { parseControlInspectFunctionArguments } from '../../../packages/core/lib/control-inspect/contract.js';
import { buildEdgeFixture, edgeContext, edgeBinding, loadEdgeTasks, fixtureCommand } from '../lib/edge-tasks.js';
import { CLI, writeEvidenceNote } from '../lib/fixtures.js';
import { readCodexDocument, renderCodexDocument, createCodexDocumentRequest } from '../../../packages/cli/lib/host-adapters/codex/document-renderer.js';
import { pureInspectWrapper } from '../lib/native-run.js';
import { parseArgs } from '../../../packages/cli/lib/cli/parse-args.js';
import { validateCommandOptions } from '../../../packages/cli/lib/cli/command-registry.js';

const fixture = () => buildEdgeFixture(loadEdgeTasks().tasks.find(t => t.id === 'E4'));
const options = f => ({dir:f.root, runId:f.runId, gate:'UR', revisionId:f.selectedRevision, presentationId:f.presentationId});
const args = f => ['render-document', '--dir', f.root, '--run', f.runId, '--gate', 'UR', '--revision', f.selectedRevision, '--presentation', f.presentationId];
const jsonl = events => events.map(e => JSON.stringify(e)).join('\n') + '\n';
function frames(f) {
  const events = [{type:'thread.started', thread_id:randomUUID()}, {type:'turn.started'}];
  let cursor, n = 0;
  do {
    const input = {...edgeContext(f), ...edgeBinding(f), operation:'presentation-document', ...(cursor ? {cursor} : {})};
    const parsed = parseControlInspectFunctionArguments(input, {surface:'codex', interactionLocales:resources.interactionLocales, expectedVersion:resources.pluginDefinition.version});
    const value = createCoreServices({observers:{runtimeEvidence:{machine_validation:'local_exact_version_digest',provenance_status:'matched',runtime_digest:'a'.repeat(64)}}}).inspect(parsed);
    assert.equal(value.report?.available,true,JSON.stringify(value));
    const item = {id:'page-'+n++,type:'mcp_tool_call',server:'agdf',tool:'agdf_inspect',arguments:input};
    events.push({type:'item.started',item:structuredClone(item)});
    events.push({type:'item.completed',item:{...item,status:'completed',error:null,result:{structured_content:value,content:[{type:'text',text:JSON.stringify(value)}]}}});
    cursor = value.report.next_cursor;
  } while(cursor);
  events.push({type:'turn.completed',usage:{}});
  return events;
}
const input = events => Readable.from([Buffer.from(jsonl(events))]);
const completed = events => events.filter(e => e.type === 'item.completed' && e.item.type === 'mcp_tool_call');
function mutateDomain(event, update) {
  update(event.item.result.structured_content);
  event.item.result.content[0].text = JSON.stringify(event.item.result.structured_content);
}
function capture() {
  const chunks=[];
  return {chunks, stream:new Writable({write(chunk,encoding,next){chunks.push(Buffer.from(chunk));next();}})};
}

test('terminal renderer delivers the historical UTF-8 bytes through the actual CLI without an added newline', async()=>{
  const f=fixture();try {
    const events=frames(f), output=capture(), errors=capture();
    // Every multi-byte character and every JSON frame may cross a pipe boundary.
    const bytes=Buffer.from(jsonl(events));
    await renderCodexDocument(options(f),{input:Readable.from([...bytes].map(b=>Buffer.from([b]))),output:output.stream,errors:errors.stream});
    assert.deepEqual(Buffer.concat(output.chunks),f.expectedDocument);
    const receipt=JSON.parse(Buffer.concat(errors.chunks).toString().replace(/^AGDF_DOCUMENT_DELIVERY /u,''));
    assert.equal(receipt.mode,'verified_terminal');assert.equal(receipt.authorizes,false);
    assert.equal(receipt.revision_id,f.selectedRevision);assert.notEqual(f.selectedRevision,f.revision());
    assert.equal(receipt.bytes,f.expectedDocument.length);assert.ok(receipt.pages>1);
    for(const executable of [CLI,fileURLToPath(new URL('../../../dist/npm/create-agdf/bin/create-agdf.js',import.meta.url))]) {
      const cli=spawnSync(process.execPath,[executable,...args(f)],{input:bytes,maxBuffer:4*1024**2});
      assert.equal(cli.status,0,cli.stderr.toString());assert.deepEqual(cli.stdout,f.expectedDocument);
      assert.match(cli.stderr.toString(),/^AGDF_DOCUMENT_DELIVERY /u);
    }
  }finally{f.dispose()}
});

test('byte-identical rereads are counted once; failed read corrections remain visible as friction',async()=>{
  const f=fixture();try {
    const events=frames(f), pair=structuredClone(events.slice(2,4));
    for(const event of pair)event.item.id='reread';
    events.splice(4,0,...pair);
    const failed=structuredClone(pair);for(const e of failed)e.item.id='failed-read';
    failed[1].item.status='failed';failed[1].item.error={message:'invalid arguments'};
    events.splice(2,0,...failed);
    const result=await readCodexDocument(input(events),options(f));
    assert.deepEqual(result.document,f.expectedDocument);assert.equal(result.receipt.duplicate_reads,1);
    assert.equal(result.receipt.failed_reads,1);
  }finally{f.dispose()}
});

test('missing, reordered, changed, foreign and incomplete streams fail before any output',async()=>{
  const f=fixture();try {
    const good=frames(f);
    const mutations={
      'truncated':e=>e.splice(-3,2),
      'out-of-order':e=>e.splice(2,2),
      'changed-bytes':e=>mutateDomain(completed(e)[0],v=>{v.report.content='x'+v.report.content.slice(1)}),
      'wrong-revision':e=>{completed(e)[0].item.arguments.expected_revision_id=f.revision()},
      'wrong-presentation':e=>{completed(e)[0].item.arguments.presentation_id=f.newerPresentationId},
      'wrong-target':e=>{completed(e)[0].item.arguments.primary_target='/tmp/foreign'},
      'wrong-report-target':e=>mutateDomain(completed(e)[0],v=>{v.target.governance_target='/tmp/foreign'}),
      'wrong-digest':e=>mutateDomain(completed(e)[0],v=>{v.report.content_digest='sha256:'+'b'.repeat(64)}),
      'wrong-runtime':e=>mutateDomain(completed(e)[0],v=>{v.runtime.provenance_status='unavailable'}),
      'changing-runtime':e=>mutateDomain(completed(e)[1],v=>{v.runtime.runtime_digest='b'.repeat(64)}),
      'wrong-cursor':e=>{completed(e)[1].item.arguments.cursor='forged:8192'},
      'false-end':e=>mutateDomain(completed(e)[0],v=>{v.report.complete=true;v.report.next_cursor=null}),
      'conflicting-channels':e=>{completed(e)[0].item.result.content[0].text='{}'},
      'unexpected-write':e=>{e[2].item.tool='agdf_approve'},
      'foreign-server':e=>{e[2].item.server='foreign'},
      'shell':e=>e.splice(2,0,{type:'item.completed',item:{type:'command_execution',command:'cat secret'}}),
      'no-completed-turn':e=>e.pop(),
      'failed-turn':e=>{e.at(-1).type='turn.failed'},
      'second-thread':e=>e.splice(2,0,{type:'thread.started',thread_id:randomUUID()}),
      'post-completion':e=>e.push({type:'turn.started'}),
      'unstarted-tool':e=>e.splice(2,1),
      'duplicate-conflict':e=>{const pair=structuredClone(e.slice(2,4));for(const v of pair)v.item.id='duplicate';mutateDomain(pair[1],v=>{v.report.content='x'+v.report.content.slice(1)});e.splice(4,0,...pair)},
    };
    for(const [name,mutate] of Object.entries(mutations)) {
      const e=structuredClone(good);mutate(e);const output=capture(),errors=capture();
      await assert.rejects(renderCodexDocument(options(f),{input:input(e),output:output.stream,errors:errors.stream}),undefined,name);
      assert.equal(Buffer.concat(output.chunks).length,0,name);assert.equal(Buffer.concat(errors.chunks).length,0,name);
    }
    await assert.rejects(readCodexDocument(Readable.from([Buffer.from([0xff])]),options(f)),/encoded data/u);
    await assert.rejects(readCodexDocument(Readable.from(['{"type":bad}\n']),options(f)),/json_invalid/u);
    await assert.rejects(readCodexDocument(Readable.from(['x'.repeat(4*1024**2+1)]),options(f)),/stream_limit/u);
  }finally{f.dispose()}
});

test('canonical envelope is rechecked after consumption; a new valid binding cannot replace the original',async()=>{
  const f=fixture();try {
    const events=frames(f),path=join(f.root,'.agdf/control/runs',f.runId,'control/presentations',f.presentationId+'.json');
    const before=readFileSync(path);
    const chunks=async function*(){yield Buffer.from(jsonl(events));writeFileSync(path,'{}');};
    await assert.rejects(readCodexDocument(chunks(),options(f)),/presentation_unavailable/u);
    writeFileSync(path,before);
    // Missing body cannot be backfilled from disk by this renderer.
    await assert.rejects(readCodexDocument(input([{type:'thread.started',thread_id:randomUUID()},{type:'turn.started'},{type:'turn.completed'}]),options(f)),/incomplete/u);
  }finally{f.dispose()}
});

test('document selection is explicit and command flags cannot introduce write or force scopes',()=>{
  const f=fixture();try {
    validateCommandOptions(parseArgs(args(f)).options);
    for(const extra of [['--force'],['--json'],['--intake'],['--run',f.runId],['--server','agdf','--server','other'],['--response','Approval: UR']])
      assert.throws(()=>validateCommandOptions(parseArgs([...args(f),...extra]).options));
    for(const change of [{dir:'.'},{runId:'../other'},{revisionId:'latest'},{presentationId:'latest'},{gate:'all'},{documentServer:'bad\nserver'}])
      assert.throws(()=>validateCommandOptions({...parseArgs(args(f)).options,...change}));
    assert.throws(()=>parseArgs(['status','--server','agdf']));
    assert.throws(()=>validateCommandOptions(parseArgs(args(f).filter((v,i,a)=>v!=='--dir'&&a[i-1]!=='--dir')).options));
  }finally{f.dispose()}
});

test('production request generator binds the original selection and exposes an auditable complete read loop without document text',async()=>{
  const f=fixture();try {
    const request=createCodexDocumentRequest(options(f));
    assert.ok(request.includes(f.selectedRevision));assert.ok(request.includes(f.presentationId));assert.ok(request.includes(f.targetId));
    assert.ok(!request.includes(f.revision()));assert.ok(!request.includes('ä'.repeat(100)));
    const loop=request.split('\n\n')[1];
    assert.equal(pureInspectWrapper(loop,new Set(),['agdf_inspect'],{literalTermination:true}),true);
    assert.equal(pureInspectWrapper(loop,new Set(),['agdf_approve'],{literalTermination:true}),false,'Request never grants another tool.');
    const output=capture(),errors=capture();
    await renderCodexDocument({...options(f),documentRequest:true},{input:{isTTY:true},output:output.stream,errors:errors.stream});
    assert.equal(Buffer.concat(output.chunks).toString(),request);assert.equal(Buffer.concat(errors.chunks).length,0);
    for(const executable of [CLI,fileURLToPath(new URL('../../../dist/npm/create-agdf/bin/create-agdf.js',import.meta.url))]) {
      const cli=spawnSync(process.execPath,[executable,...args(f),'--request'],{encoding:'utf8',maxBuffer:1024**2});
      assert.equal(cli.status,0,cli.stderr);assert.equal(cli.stdout,request);assert.equal(cli.stderr,'');
    }
    assert.throws(()=>parseArgs(['status','--request']));
    assert.throws(()=>parseArgs([...args(f),'--request','--request']));
  }finally{f.dispose()}
});

test('a correctly bound document containing terminal escape commands is rejected without sanitizing or emitting it',async()=>{
  const f=fixture();try {
    const ur=readFileSync(join(f.root,'.agdf/control/runs',f.runId,'documents/UR.md'),'utf8');
    const source=writeEvidenceNote(f,'TERMINAL_UR.md',ur+'\n- Terminal probe: \x1b[31m injected control.\n');
    fixtureCommand(f,'agdf_revise','ur_draft.replace',{title:'Terminal control rejection',source});
    f.presentationId=fixtureCommand(f,'agdf_prepare','presentation.prepare',{gate:'UR'}).family_result.presentation_id;
    f.selectedRevision=f.revision();
    const output=capture(),errors=capture();
    await assert.rejects(renderCodexDocument(options(f),{input:input(frames(f)),output:output.stream,errors:errors.stream}),/terminal_controls/u);
    assert.equal(Buffer.concat(output.chunks).length,0);assert.equal(Buffer.concat(errors.chunks).length,0);
  }finally{f.dispose()}
});
