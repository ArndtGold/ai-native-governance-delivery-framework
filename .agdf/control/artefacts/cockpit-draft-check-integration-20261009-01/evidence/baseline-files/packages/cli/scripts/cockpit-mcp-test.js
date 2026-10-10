import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { withStdioClient } from '../../mcp-server/test/helpers.js';
import { fixture, treeBytes } from '../../core/test/control-cockpit-fixtures.js';
import { COCKPIT_UI_URI, COCKPIT_MIME } from '../../core/lib/control-inspect/cockpit-contract.js';
import { evaluateGateCheck } from '../../core/lib/control-evaluation/gate-check.js';
import { projectCockpitAssessment } from '../../core/lib/control-inspect/cockpit.js';

// Tests can qualify an independently prepared owned runtime without replacing a
// runtime currently registered by the host. Startup still verifies its markers.
const preparation = JSON.parse(readFileSync(process.env.AGDF_COCKPIT_TEST_PREPARATION
  || new URL('../../../dist/local/codex-cockpit/preparation.json', import.meta.url), 'utf8'));
const observations = [];
for (const modern of [false, true]) {
  const f = fixture(), before = treeBytes(f.root);
  try {
    await withStdioClient({ modern, command: preparation.node,
      args: [preparation.entrypoint, '--surface', 'codex', '--cockpit-dir', f.root] }, async client => {
      const inventory = await client.listTools();
      assert.deepEqual(inventory.tools.map(t => t.name), ['agdf_cockpit', 'agdf_cockpit_read']);
      assert.equal(inventory.tools[0]._meta.ui.resourceUri, COCKPIT_UI_URI);
      assert.equal(inventory.tools[0].inputSchema.properties.run_id.pattern, '^[A-Za-z0-9_-]{1,128}$');
      assert.equal(inventory.tools[0].inputSchema.additionalProperties, false);
      assert.equal(inventory.tools[1]._meta.ui.resourceUri, undefined);
      const resources = await client.listResources(); assert.deepEqual(resources.resources.map(r => r.uri), [COCKPIT_UI_URI]);
      const resource = await client.readResource({ uri: COCKPIT_UI_URI });
      assert.equal(resource.contents[0].mimeType, COCKPIT_MIME); assert.match(resource.contents[0].text, /AGDF Cockpit/);
      assert.match(resource.contents[0].text, /Gespeicherter Arbeitsstand/);
      assert.deepEqual(resource.contents[0]._meta.ui.csp.connectDomains, []);
      const render = await client.callTool({ name: 'agdf_cockpit', arguments: {} });
      assert.equal(render.structuredContent.authorizes, false); assert.equal(render.structuredContent._meta, undefined);
      assert.equal(render._meta.agdf_cockpit.initial_run_id, undefined);
      const session_id = render._meta.agdf_cockpit.session_id;
      const call = args => client.callTool({ name: 'agdf_cockpit_read', arguments: { session_id, ...args } });
      const snapshot = (await call({ operation: 'snapshot' })).structuredContent;
      assert.equal(snapshot.authorizes, false); assert.ok(snapshot.snapshot_id);
      const detail = (await call({ operation: 'run', snapshot_id: snapshot.snapshot_id, run_id: 'fixture-a' })).structuredContent;
      assert.deepEqual(detail.data.run.evaluation.control_assessment,
        projectCockpitAssessment(evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true }), detail.data.run.lifecycle));
      const selected = detail.data.run.resources.find(r => r.type === 'UR');
      const docargs = { operation: 'document', snapshot_id: detail.snapshot_id, run_id: 'fixture-a', resource_id: selected.resource_id };
      const document=(await call(docargs)).structuredContent;
      assert.match(document.data.document.content, /Fixture document/); assert.notEqual(document.snapshot_id,detail.snapshot_id);
      const context = (await call({ operation: 'context', snapshot_id: document.snapshot_id, run_id: 'fixture-a' })).structuredContent;
      assert.equal(context.state, 'empty'); assert.deepEqual(context.data.context.references, []);
      const prepared = (await call({ operation: 'prepare_context', snapshot_id: context.snapshot_id, run_id: 'fixture-a',
        revision_id: context.data.run.revision_id, resource_id: context.data.document.resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 })).structuredContent;
      assert.equal(prepared.state, 'available'); const packet = prepared.data.packet;
      assert.equal(packet.run_id, 'fixture-a'); assert.equal(packet.authorizes, false);
      assert.equal(packet.artefact.content, readFileSync(new URL(selected.path, 'file://' + f.root + '/'), 'utf8'));
      assert.equal(prepared.data.byte_count, Buffer.byteLength(JSON.stringify(packet), 'utf8'));
      const validation = { operation: 'validate_context', context_id: packet.context_id, generation: 1 };
      assert.equal((await call(validation)).structuredContent.data.current, true);
      const release = (await call({ operation: 'invalidate_context' })).structuredContent.data;
      assert.equal(release.invalidated, true); assert.equal(release.host_publication_required, true);
      assert.equal((await call({ operation: 'invalidate_context' })).structuredContent.data.invalidation_id, release.invalidation_id);
      assert.equal((await call(validation)).structuredContent.code, 'context_superseded');
      assert.equal((await call({ ...docargs, run_id: 'fixture-completed' })).structuredContent.code, 'resource_denied');
      for (const args of [{ operation: 'snapshot', path: '/tmp' }, { operation: 'approve' }, { operation: 'snapshot', session_id: 'forged' }]) {
        assert.equal((await call(args)).isError, true);
      }
      for (const name of ['agdf_dispatch', 'agdf_inspect']) {
        let rejected = false;
        try { rejected = (await client.callTool({ name, arguments: {} })).isError === true; } catch { rejected = true; }
        assert.ok(rejected, 'writer/dispatch name must be unreachable');
      }
      const focused = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: 'fixture-a' } });
      assert.equal(focused._meta.agdf_cockpit.initial_run_id, 'fixture-a');
      assert.equal(focused.structuredContent.snapshot_id, undefined);
      const focusedSession = focused._meta.agdf_cockpit.session_id;
      const focusedDetail = (await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot', session_id: focusedSession, run_id: 'fixture-a' } })).structuredContent;
      assert.equal(focusedDetail.data.kind,'run'); assert.equal(focusedDetail.data.run.run_id, 'fixture-a');
      const callB = args => client.callTool({ name: 'agdf_cockpit_read', arguments: { session_id: focusedSession, ...args } });
      const sourceB = focusedDetail.data.run.resources.find(r => r.type === 'UR');
      const documentB=(await callB({ operation: 'document', snapshot_id: focusedDetail.snapshot_id, run_id: 'fixture-a', resource_id: sourceB.resource_id })).structuredContent;
      const contextB=(await callB({operation:'context',snapshot_id:documentB.snapshot_id,run_id:'fixture-a'})).structuredContent;
      const prepareB = { operation: 'prepare_context', snapshot_id: contextB.snapshot_id, run_id: 'fixture-a', revision_id: contextB.data.run.revision_id,
        resource_id: contextB.data.document.resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 };
      assert.equal((await callB(prepareB)).structuredContent.code, 'busy');
      assert.equal((await callB(validation)).structuredContent.code, 'resource_denied');
      assert.equal((await callB({ operation: 'invalidate_context' })).structuredContent.data.host_publication_required, false);
      assert.equal((await callB({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).structuredContent.code, 'resource_denied');
      for (const args of [{ operation: 'complete_context_invalidation', invalidation_id: 'forged' },
        { operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id, approval: 'TP' }]) assert.equal((await call(args)).isError, true);
      assert.equal((await call({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).structuredContent.data.completed, true);
      const nextPacket = (await callB(prepareB)).structuredContent.data.packet;
      assert.equal((await call({ operation: 'complete_context_invalidation', invalidation_id: release.invalidation_id })).structuredContent.data.completed, true);
      assert.equal((await callB({ operation: 'validate_context', context_id: nextPacket.context_id, generation: 1 })).structuredContent.data.current, true);
      const nextRelease = (await callB({ operation: 'invalidate_context' })).structuredContent.data;
      assert.equal((await callB({ operation: 'complete_context_invalidation', invalidation_id: nextRelease.invalidation_id })).structuredContent.data.completed, true);
      const unknown = await client.callTool({ name: 'agdf_cockpit', arguments: { run_id: 'unknown-run' } });
      assert.equal(unknown._meta.agdf_cockpit.initial_run_id, 'unknown-run');
      for (const args of [{ run_id: '' }, { run_id: '../foreign' }, { run_id: 'a'.repeat(129) }, { run_id: 'fixture-a', approval: 'TP' }]) {
        assert.equal((await client.callTool({ name: 'agdf_cockpit', arguments: args })).isError, true);
      }
      const expired = (await call({ operation: 'snapshot' })).structuredContent;
      assert.equal(expired.state, 'empty');
      await call({ operation: 'close' });
      assert.equal((await call({ operation: 'snapshot' })).structuredContent.code, 'session_expired');
      assert.deepEqual(treeBytes(f.root), before);
      observations.push({ protocol: modern ? '2026-07-28' : '2025-11-25', tools: inventory.tools.map(t => t.name), resource: COCKPIT_UI_URI,
        scenarios: ['SCN-011', 'SCN-013', 'SCN-020', 'SCN-026', 'SCN-036', 'SCN-039', 'SCN-041', 'SCN-042', 'SCN-046', 'SCN-050', 'SCN-052', 'SCN-053', 'SCN-054'], read_no_write: true, status: 'pass' });
    });
    await withStdioClient({ modern, command: preparation.node, args: [preparation.entrypoint, '--surface', 'codex'] }, async client => {
      assert.deepEqual((await client.listTools()).tools.map(t => t.name), ['agdf_dispatch', 'agdf_inspect']);
      assert.equal(client.getServerCapabilities().resources, undefined);
    });
  } finally { f.close(); }
}
console.log(JSON.stringify({ status: 'pass', evidence_class: 'actual_stdio_protocol_not_host_ui', observations,
  server_digest: preparation.server_digest, ui_digest: preparation.ui.digest }));
