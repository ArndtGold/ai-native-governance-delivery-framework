import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withStdioClient } from '../../mcp-server/test/helpers.js';
import { fixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { COCKPIT_UI_URI } from '../../core/lib/control-inspect/cockpit-contract.js';
import { recordBacklogSummary } from '../../core/lib/control-state/backlog-summary.js';
import { runWorkSummary } from '../../core/lib/control-evaluation/run-work-summary.js';
import { parseRunState } from '../../core/lib/control-state/run-state-parser.js';
const preparation = JSON.parse(readFileSync(process.env.AGDF_COCKPIT_TEST_PREPARATION, 'utf8'));
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
