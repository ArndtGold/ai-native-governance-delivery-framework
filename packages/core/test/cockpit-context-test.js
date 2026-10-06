import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { replaceFirstScalar } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { projectCockpitContext, composeCockpitPacket, CONTEXT_LIMIT } from '../lib/control-inspect/cockpit-context.js';
import { READ_LIMITS } from '../lib/control-read/snapshot.js';
const graphPath = '.agdf/control/CONTEXT_GRAPH.md';
const hash = value => createHash('sha256').update(value).digest('hex');
function setGraph(f, refs, content) {
  const source = fs.readFileSync(f.runPath, 'utf8');
  const edited = replaceFirstScalar(source, 'context_graph_refs', refs) ?? `${source}\n## Context Graph Impact\n\n- context_graph_refs: ${refs}\n`;
  fs.writeFileSync(f.runPath, sealRunState(f.root, edited));
  if (content !== null) fs.writeFileSync(join(f.root, graphPath), content);
  else fs.rmSync(join(f.root, graphPath), { force: true });
}
function inspect(f) {
  const reader = createCockpitReader(f.root), snapshot = reader.snapshot();
  const detail = reader.run('fixture-a', snapshot.snapshot_id), resource = detail.data.resources.find(r => r.type === 'UR');
  const document = reader.document(resource.resource_id, snapshot.snapshot_id);
  const context = reader.context('fixture-a', snapshot.snapshot_id);
  const input = { snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a', revision_id: detail.data.revision_id,
    resource_id: resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 };
  return { reader, snapshot, detail, resource, document, context, input };
}
test('SCN-007/008: exact references preserve passive node bytes, fences and section boundaries without recursive expansion', () => {
  const f = fixture(); try {
    const first = '### CG-A\r\n\r\nRelated CG-B; [external](https://example.invalid).\r\n#### Nested\r\n```md\r\n### CG-FORGED\r\n```\r\n';
    setGraph(f, '`CG-A`; `.agdf/control/CONTEXT_GRAPH.md#CG-B`', `## Nodes\r\n${first}### CG-B\r\nβ\r\n## End\r\nOutside\r\n`);
    const before = treeBytes(f.root), { context } = inspect(f);
    assert.equal(context.state, 'available'); assert.equal(context.data.references.length, 2);
    assert.equal(context.data.references[0].content, first);
    assert.equal(context.data.references[0].content_digest, hash(first));
    assert.equal(context.data.references[0].graph_digest, hash(fs.readFileSync(join(f.root, graphPath))));
    assert.equal(context.data.references[1].content, '### CG-B\r\nβ\r\n');
    assert.deepEqual(treeBytes(f.root), before);
    for (const [refs, content, states, codes] of [
      ['none', '### CG-A\n', [], []], ['', '### CG-A\n', [], []],
      [graphPath, '### CG-A\n', ['unsupported'], ['graph_file_reference']],
      ['CG-Z; malformed; https://example.invalid#CG-A', '### CG-A\n', ['missing','unresolved','unresolved'], ['node_missing','reference_unresolved','reference_unresolved']],
      ['CG-A', null, ['missing'], ['graph_missing']],
      ['CG-A', '### CG-A\nOne\n### CG-A\nTwo\n', ['blocked'], ['node_ambiguous']],
      ['CG-A', Buffer.from([255]), ['unsupported'], ['graph_unsupported']],
      ['CG-A', '### CG-A\n'+ 'x'.repeat(READ_LIMITS.preview), ['unsupported'], ['resource_limit']],
    ]) {
      setGraph(f, refs, content); const result = inspect(f).context.data.references;
      assert.deepEqual(result.map(r => r.state), states); assert.deepEqual(result.map(r => r.code), codes);
    }
    const denied = { existsSync() { throw Object.assign(Error(), { code: 'resource_denied' }); } };
    assert.equal(projectCockpitContext(denied, f.root, 'fixture-a', 'CG-A').references[0].code, 'resource_denied');
  } finally { f.close(); }
});
test('SCN-009/010/011: 64 refs, 16 selected, deliberate unavailable exclusion and scoped inspected-source packets', () => {
  const f = fixture(); try {
    const refs = Array.from({length:64},(_,i)=>`CG-N${i}`);
    setGraph(f, refs.join(';'), refs.map(id=>`### ${id}\nSource ${id}\n`).join(''));
    let s = inspect(f); assert.equal(s.context.data.references.length, 64);
    s.input.graph_ids = s.context.data.references.slice(0,16).map(r=>r.resource_id);
    const result = s.reader.prepareContext(s.input), packet = result.data.packet;
    assert.equal(packet.authorizes, false); assert.equal(packet.graph_nodes.length,16); assert.equal(packet.excluded.length,48);
    assert.equal(packet.artefact.content, fs.readFileSync(join(f.root,f.documentPath),'utf8'));
    assert.equal(packet.artefact.content_digest, hash(packet.artefact.content));
    assert.equal(packet.run_id,'fixture-a'); assert.equal(packet.revision_id,s.detail.data.revision_id);
    assert.equal(packet.snapshot_id,s.snapshot.snapshot_id); assert.equal(packet.source_digest,s.snapshot.source_digest);
    assert.equal(result.data.byte_count, Buffer.byteLength(JSON.stringify(packet),'utf8'));
    assert.equal(s.reader.validateContext(packet.context_id,1).data.current,true);
    assert.throws(()=>s.reader.prepareContext({...s.input, graph_ids:s.context.data.references.slice(0,17).map(r=>r.resource_id)}),/resource_denied/);
    assert.equal(s.reader.validateContext(packet.context_id,1).code,'context_superseded');
    assert.throws(()=>s.reader.prepareContext({...s.input,run_id:'fixture-completed'}),/resource_denied/);
    s.reader.run('fixture-a',s.snapshot.snapshot_id);
    assert.throws(()=>s.reader.prepareContext(s.input),/resource_denied/);
    setGraph(f, [...refs,'CG-65'].join(';'),'### CG-N0\n');
    assert.throws(()=>inspect(f),/resource_limit/);
    setGraph(f, 'CG-A; CG-MISSING', '### CG-A\nText\n'); s=inspect(f);
    assert.throws(()=>s.reader.prepareContext(s.input),/context_exclusion_required/);
    s.input.excluded_ids=[s.context.data.references[1].resource_id];
    const minimal=s.reader.prepareContext(s.input).data.packet;
    assert.equal(minimal.graph_nodes.length,0); assert.equal(minimal.excluded[1].reason,'deliberate_exclusion');
    assert.equal(minimal.excluded[1].code,'node_missing');
    assert.throws(()=>s.reader.prepareContext({...s.input,graph_ids:[s.input.excluded_ids[0]]}),/resource_denied/);
  } finally { f.close(); }
});
test('SCN-012: inclusive 64 KiB counts multibyte source plus all provenance, without truncation', () => {
  const input={generation:1,graph_ids:[],excluded_ids:[]}, graph={references:[]};
  const doc={resource:{resource_id:'registered',path:'source'},content:'日本語'};
  const metadata={schema_version:'1',target:{target_id:'target',display_path:'/fixture'},run_id:'run',revision_id:'revision'};
  const initial=composeCockpitPacket(metadata,doc,graph,input);
  doc.content+='a'.repeat(CONTEXT_LIMIT-initial.byte_count);
  const exact=composeCockpitPacket(metadata,doc,graph,input);
  assert.equal(exact.byte_count,CONTEXT_LIMIT); assert.equal(exact.packet.artefact.content,doc.content);
  doc.content+='β'; const excess=composeCockpitPacket(metadata,doc,graph,input);
  assert.equal(excess.byte_count,CONTEXT_LIMIT+2); assert.equal(excess.packet,null);
});
test('SCN-013/020: changed captures, generation, supersession and invalidation prevent packet reuse', t => {
  const f=fixture(); try {
    setGraph(f,'none','## Empty\n'); let s=inspect(f);
    const first=s.reader.prepareContext(s.input).data.packet;
    assert.equal(first.artefact.content_digest, hash(first.artefact.content));
    assert.equal(s.reader.validateContext(first.context_id,2).code,'context_superseded');
    const newer=s.reader.prepareContext({...s.input,generation:2}).data.packet;
    assert.equal(s.reader.validateContext(first.context_id,1).code,'context_superseded');
    s.reader.invalidateContext(); assert.equal(s.reader.validateContext(newer.context_id,2).code,'context_superseded');
    s=inspect(f); const packet=s.reader.prepareContext(s.input).data.packet;
    fs.appendFileSync(join(f.root,f.documentPath),'changed');
    assert.throws(()=>s.reader.validateContext(packet.context_id,1),/source_changed/);
    assert.equal(s.reader.validateContext(packet.context_id,1).code,'context_superseded');
    assert.throws(()=>s.reader.prepareContext(s.input),/source_changed/);
    s=inspect(f); s.reader.snapshot(); assert.throws(()=>s.reader.prepareContext(s.input),/source_changed/);
    // Composition is surrounded by revalidation: a mutation during JSON sizing
    // cannot be promoted as current, even if the captured content itself is stable.
    s=inspect(f);
    const original=Date.prototype.toISOString;
    t.mock.method(Date.prototype,'toISOString',function(){
      fs.appendFileSync(join(f.root,f.documentPath),'during composition');
      return original.call(this);
    });
    assert.throws(()=>s.reader.prepareContext(s.input),/source_changed/);
    t.mock.restoreAll();
    fs.writeFileSync(join(f.root,f.documentPath),'\uFEFF# Source\r\nOriginal 日本語\r\n');
    s=inspect(f); const bom=s.reader.prepareContext(s.input).data.packet;
    assert.equal(bom.artefact.content,fs.readFileSync(join(f.root,f.documentPath),'utf8'));
    assert.equal(bom.artefact.content_digest,hash(bom.artefact.content));
  } finally { f.close(); }
});
