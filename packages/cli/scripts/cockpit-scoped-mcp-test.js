import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { withStdioClient } from '../../mcp-server/test/helpers.js';
import { approvalFixture, fixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { COCKPIT_UI_URI } from '../../core/lib/control-inspect/cockpit-contract.js';
import { recordBacklogSummary } from '../../core/lib/control-state/backlog-summary.js';
import { runWorkSummary } from '../../core/lib/control-evaluation/run-work-summary.js';
import { parseRunState } from '../../core/lib/control-state/run-state-parser.js';
import { artifactReadinessFixture, readyPrd } from '../../core/test/fixtures/artifact-readiness.js';
import { upsertTableRow } from '../../core/lib/control-state/run-state-edits.js';
const preparation = JSON.parse(readFileSync(process.env.AGDF_COCKPIT_TEST_PREPARATION, 'utf8'));
for (const modern of [false, true]) {
  const f = await approvalFixture(); f.root=realpathSync(f.root);
  try {
    assert.equal(f.approve().outcome,'approved'); const before=treeBytes(f.root);
    await withStdioClient({modern,command:preparation.node,args:[preparation.entrypoint,'--surface','codex','--cockpit-dir',f.root]},async client=>{
      const session_id=(await client.callTool({name:'agdf_cockpit',arguments:{run_id:'fixture-a'}}))._meta.agdf_cockpit.session_id;
      const call=async args=>(await client.callTool({name:'agdf_cockpit_read',arguments:{session_id,...args}})).structuredContent;
      const selected=await call({operation:'snapshot',run_id:'fixture-a'});
      const state=selected.data.run.document_states.find(s=>s.type==='UR'); assert.equal(state.state,'approved');
      const opened=await call({operation:'document',snapshot_id:selected.snapshot_id,run_id:'fixture-a',resource_id:state.resource_id});
      assert.equal(opened.data.document.document_state.version_kind,'approved');
      assert.equal(opened.data.document.content,readFileSync(join(f.root,f.documentPath),'utf8'));
      const {createHash}=await import('node:crypto');
      assert.equal(opened.data.document.content_digest,createHash('sha256').update(readFileSync(join(f.root,f.documentPath))).digest('hex'));
      assert.equal(opened.authorizes,false);
      await call({operation:'close'});
      assert.equal((await call({operation:'snapshot',run_id:'fixture-a'})).code,'session_expired');
      console.log(JSON.stringify({modern,actual_canonical_approval:true,raw_reader_version:'approved',native_ui_observation:false}));
    });
    assert.deepEqual(treeBytes(f.root),before);
  } finally { f.close(); }
}
for (const modern of [false, true]) {
  const f = artifactReadinessFixture(); f.root = realpathSync(f.root); writeFileSync(f.path, readyPrd);
  f.reseal(s => upsertTableRow(s, 'Artefacts', 0, 'PRD', ['PRD', `${f.prefix}PRD.md`, 'draft', 'Real registered draft read through STDIO']));
  const before = treeBytes(f.root);
  try {
    await withStdioClient({ modern, command: preparation.node, args: [preparation.entrypoint, '--surface', 'codex', '--cockpit-dir', f.root] }, async client => {
      const definition = (await client.listTools()).tools.find(row => row.name === 'agdf_cockpit_read');
      const branch = definition.inputSchema.oneOf.find(row => row.properties.operation.const === 'artifact_readiness');
      assert.equal(branch.additionalProperties, false); assert.deepEqual(branch.properties.gate.enum, ['UR', 'PRD', 'SD', 'TP']);
      const session_id = (await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: f.runId } }))._meta.agdf_cockpit.session_id;
      const call = async args => (await client.callTool({ name: 'agdf_cockpit_read', arguments: { session_id, ...args } })).structuredContent;
      const selected = await call({ operation: 'snapshot', run_id: f.runId });
      const checked = await call({ operation: 'artifact_readiness', snapshot_id: selected.snapshot_id, run_id: f.runId, gate: 'PRD', expected_revision_id: f.revision });
      assert.equal(checked.data.run.draft_check.display.state, 'passed'); assert.equal(checked.data.run.draft_check.result.authorizes, false);
      const description=checked.data.run.document_states.find(s=>s.type==='PRD');assert.equal(description.state,'draft_checked');
      const document=await call({operation:'document',snapshot_id:checked.snapshot_id,run_id:f.runId,resource_id:description.resource_id});
      assert.deepEqual(document.data.document.document_state.check.result,checked.data.run.draft_check.result);
      assert.equal(document.data.document.content,readyPrd);
      assert.equal(document.data.document.content_digest,document.data.document.document_state.content_digest);
      const returned=await call({operation:'run',snapshot_id:document.snapshot_id,run_id:f.runId});
      assert.equal(returned.data.run.document_states.find(s=>s.type==='PRD').state,'draft_checked');
      assert.deepEqual(returned.data.run.draft_check.result,checked.data.run.draft_check.result);
      const resource=await client.readResource({uri:COCKPIT_UI_URI});
      const {createHash}=await import('node:crypto');
      assert.equal('sha256:'+createHash('sha256').update(resource.contents[0].text).digest('hex'),preparation.ui.digest);
      const reloaded=await call({operation:'snapshot',run_id:f.runId});assert.equal(reloaded.data.run.draft_check.result,null);
      assert.equal((await call({ operation: 'freshness', snapshot_id: selected.snapshot_id })).code, 'resource_denied');
      await call({ operation: 'close' });
      assert.equal((await call({operation:'snapshot',run_id:f.runId})).code,'session_expired');
      console.log(JSON.stringify({ modern, operation: 'artifact_readiness', actual_authoring_pass: true, ui_digest: preparation.ui.digest, native_ui_observation: false }));
    });
    assert.deepEqual(treeBytes(f.root), before);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
}
for (const modern of [false, true]) {
  const f = fixture();
  writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), '# Master Backlog\n## Active Backlog\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n| 1 | fixture-a | Stored fixture title | In progress | [UR](artefacts/fixture-a/UR.md) | [UR](artefacts/fixture-a/UR.md) | next |\n## Planned / Parking Lot\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n## Completed / Superseded Pointers\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n');
  const backlogPath = join(f.root, '.agdf/control/MASTER_BACKLOG.md'), runContent = readFileSync(f.runPath, 'utf8');
  writeFileSync(backlogPath, recordBacklogSummary(f.root, readFileSync(backlogPath, 'utf8'), 'fixture-a', 'Active Backlog',
    runWorkSummary(f.root, runContent, f.runPath), parseRunState(runContent).meta.revision_id));
  const before = treeBytes(f.root);
  try {
    await withStdioClient({ modern, command: preparation.node, args: [preparation.entrypoint, '--surface', 'codex', '--cockpit-dir', f.root] }, async client => {
      const tools = await client.listTools(); assert.deepEqual(tools.tools.map(t => t.name), ['agdf_cockpit', 'agdf_cockpit_read']);
      const snapshotBranch = tools.tools[1].inputSchema.oneOf.find(row => row.properties.operation.const === 'snapshot');
      assert.deepEqual(snapshotBranch.required, ['operation', 'session_id']); assert.ok(snapshotBranch.properties.run_id);
      const resource = await client.readResource({ uri: COCKPIT_UI_URI }); assert.match(resource.contents[0].text, /Gespeicherte Vorhaben/);
      const a = (await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: 'fixture-a' } }))._meta.agdf_cockpit.session_id;
      const b = (await client.callTool({ name: 'agdf_cockpit', arguments: {} }))._meta.agdf_cockpit.session_id;
      const call = async (session_id, args) => (await client.callTool({ name: 'agdf_cockpit_read', arguments: { session_id, ...args } })).structuredContent;
      const first = await call(a, { operation: 'snapshot', run_id: 'fixture-a' }); assert.equal(first.data.run.run_id, 'fixture-a');
      let overview = await call(b, { operation: 'snapshot' }); assert.equal(overview.data.kind, 'backlog'); assert.equal(overview.data.file_count, 1);
      assert.equal(overview.data.entries[0].saved_summary.provenance_state, 'recorded');
      assert.equal(overview.data.entries[0].saved_summary.authorizes, false);
      assert.equal(first.data.run.backlog_comparison.state, 'matching');
      const titleBranch = tools.tools[1].inputSchema.oneOf.find(row => row.properties.operation.const === 'backlog_titles');
      assert.equal(titleBranch.properties.row_ids.maxItems, 12); assert.equal(titleBranch.additionalProperties, false);
      const row = overview.data.entries.find(row => row.source_links.includes('[UR]'));
      assert.ok(row?.row_id);
      const titles = await call(b, { operation: 'backlog_titles', snapshot_id: overview.snapshot_id, row_ids: [row.row_id] });
      assert.equal(titles.data.file_count, 2); assert.equal(titles.data.entries.find(entry => entry.key === row.key).title_observation.state, 'available');
      assert.equal(titles.authorizes, false);
      assert.equal((await call(b, { operation: 'backlog_titles', snapshot_id: overview.snapshot_id, row_ids: [row.row_id] })).code, 'resource_denied');
      overview = titles;
      const old = first.data.run.resources.find(r => r.type === 'UR');
      const doc = await call(a, { operation: 'document', snapshot_id: first.snapshot_id, run_id: 'fixture-a', resource_id: old.resource_id });
      assert.equal(doc.data.kind, 'document'); assert.match(doc.data.document.content, /日本語/); assert.equal(doc.authorizes, false);
      assert.notEqual(doc.snapshot_id, first.snapshot_id);
      assert.equal((await call(a, { operation: 'document', snapshot_id: first.snapshot_id, run_id: 'fixture-a', resource_id: old.resource_id })).code, 'resource_denied');
      assert.equal((await call(b, { operation: 'freshness', snapshot_id: overview.snapshot_id })).data.unchanged, true);
      const context = await call(a, { operation: 'context', snapshot_id: doc.snapshot_id, run_id: 'fixture-a' });
      assert.equal(context.data.kind, 'context'); assert.equal(context.data.document.resource.run_id, context.data.run.run_id);
      for (const bad of [{ operation: 'snapshot', run_id: '../outside' }, { operation: 'snapshot', path: '/tmp' }]) {
        const result = await client.callTool({ name: 'agdf_cockpit_read', arguments: { session_id: a, ...bad } });
        assert.ok(result.isError || result.structuredContent?.code === 'resource_denied');
      }
      await assert.rejects(client.callTool({ name: 'agdf_dispatch', arguments: {} }), /Tool agdf_dispatch not found/);
      assert.equal((await call(a, { operation: 'freshness', snapshot_id: context.snapshot_id })).data.unchanged, true);
      await call(a, { operation: 'close' });
      assert.equal((await call(b, { operation: 'freshness', snapshot_id: overview.snapshot_id })).data.unchanged, true);
      console.log(JSON.stringify({ modern, named_run: first.data.run.run_id, backlog_files: overview.data.file_count, independent_sessions: true, resource_digest: preparation.ui.digest, authorizes: false }));
    });
    assert.deepEqual(treeBytes(f.root), before);
  } finally { f.close(); }
}
