import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { writeFileSync } from 'node:fs';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { DECISION_UI_URI } from '../../core/lib/control-state/decision-action-contract.js';
import { COCKPIT_MIME } from '../../core/lib/control-inspect/cockpit-contract.js';
import { MCP_APP_UI_EXTENSION } from '../src/ui-capability.js';
import { readDecisionUiBuild } from '../../../scripts/cockpit-ui-build.mjs';
import { DECISION_APP_OBSERVATIONS } from '../../core/lib/runtime/plugin-provenance.js';
const fixture = createOwnedRuntimeFixture(), root = fixture.governanceTarget, cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
try {
  const f = createSdDefinitionTestRun(root, cli, 'actual-package-decision', process.env, { typedApprovals: true });
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const before = readFileSync(f.state, 'utf8'), ui = { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [COCKPIT_MIME] } } };
  for (const modern of [false, true]) {
    const input = { schema_version: '1', presentation_language: 'de', working_directory: root, target_source: 'explicit_target', primary_target: root,
      target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
    await withStdioClient({ ...fixture, modern, capabilities: ui }, async client => {
      const { tools } = await client.listTools();
      assert.equal(tools.length, 9);
      const facade = tools.find(tool => tool.name === 'agdf_decision_action');
      assert.deepEqual(facade._meta.ui.visibility, ['app']); assert.equal(facade._meta.ui.resourceUri, DECISION_UI_URI);
      assert.deepEqual(facade.annotations, { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false });
      const { resources } = await client.listResources(); assert.deepEqual(resources.map(resource => resource.uri), [DECISION_UI_URI]);
      const resource = await client.readResource({ uri: DECISION_UI_URI }), content = resource.contents[0];
      assert.equal(content.mimeType, COCKPIT_MIME); assert.equal(content.text, readDecisionUiBuild().files['decision.html'].toString('utf8'));
      assert.equal('sha256:' + createHash('sha256').update(content.text).digest('hex'), readDecisionUiBuild().manifest.digest);
      const prepared = await client.callTool({ name: 'agdf_prepare', arguments: input });
      assert.equal(prepared.structuredContent.outcome, 'accepted', JSON.stringify(prepared));
      assert.equal(prepared.structuredContent.app_capability, 'not_qualified');
      const view = prepared._meta.agdf_decision; assert.ok(view); assert.deepEqual(view.enabled_actions, []);
      assert.equal(prepared.structuredContent.session_id, undefined);
      assert.equal(prepared.structuredContent.presentation_delivery.mode, 'full_chat');
      assert.equal(prepared.content[0].text, prepared.structuredContent.presentation_delivery.text);
      assert.equal(prepared.content[0].text, prepared.structuredContent.family_result.text, 'An unconfirmed surface receives the exact complete Core Chat decision.');
      assert.ok(prepared.content[0].text.includes(view.summary.trim()), 'The complete reviewed summary remains available in Chat.');
      assert.equal(prepared.content[0].text.includes(view.session_id), false, 'Decision nonce is withheld from model-visible content.');
      for (const action of ['approve', 'request_change', 'reject']) {
        const result = await client.callTool({ name: facade.name, arguments: { session_id: view.session_id, operation_id: randomUUID(),
          presentation_id: view.binding.presentation_id, expected_revision_id: view.binding.expected_revision_id, action, comment: 'Synthetic non-authorizing intent' } });
        assert.equal(result.structuredContent.outcome, 'rejected'); assert.equal(result.structuredContent.reason, 'app_only_mediation_not_qualified');
      }
      const document = await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'document', session_id: view.read_session_id,
        snapshot_id: view.snapshot_id, run_id: f.runId, resource_id: view.resource_id } });
      assert.equal(document.structuredContent.state, 'available', JSON.stringify(document));
      assert.equal('sha256:' + document.structuredContent.data.document.content_digest, view.document_digest);
      // The immutable App metadata must remain usable after the reader rotates
      // its internal snapshot/resource selectors on each document projection.
      for (let attempt = 0; attempt < 3; ++attempt) {
        const reopened = await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'document', session_id: view.read_session_id,
          snapshot_id: view.snapshot_id, run_id: f.runId, resource_id: view.resource_id } });
        assert.equal(reopened.structuredContent.state, 'available', JSON.stringify(reopened));
        assert.equal(reopened.structuredContent.data.document.content, document.structuredContent.data.document.content);
      }
      const closed = await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'close', session_id: view.read_session_id } });
      assert.equal(closed.structuredContent.data.closed, true);
      const expired = await client.callTool({ name: facade.name, arguments: { session_id: view.session_id, operation_id: randomUUID(),
        presentation_id: view.binding.presentation_id, expected_revision_id: view.binding.expected_revision_id, action: 'reject' } });
      assert.equal(expired.structuredContent.reason, 'session_expired');
    });
    await withStdioClient({ ...fixture, modern }, async client => {
      assert.equal((await client.listTools()).tools.some(tool => tool.name === 'agdf_decision_action'), false);
      assert.equal((await client.listResources()).resources.length, 0);
      const result = await client.callTool({ name: 'agdf_decision_action', arguments: { session_id: randomUUID(), operation_id: randomUUID(),
        presentation_id: randomUUID(), expected_revision_id: f.revision(), action: 'reject' } });
      assert.equal(result.structuredContent.outcome, 'rejected'); assert.equal(result.structuredContent.reason, 'host_ui_unsupported');
    });
  }
  await withStdioClient({ ...fixture, capabilities: ui, env: { AGDF_MCP_COMMAND_GROUPS: '' } }, async client => {
    const names = (await client.listTools()).tools.map(tool => tool.name);
    assert.deepEqual(names, ['agdf_dispatch', 'agdf_inspect', 'agdf_cockpit_read']);
    assert.equal(names.includes('agdf_decision_action'), false);
  });
  assert.equal(readFileSync(f.state, 'utf8'), before, 'Preparation, capability advertisement, read, non-qualified choices and teardown cannot decide.');
  // Positive loader contract on an explicitly synthetic host/evidence tuple.
  // This does not qualify the real Codex app, its mediation or human decisions.
  const markerPath = join(fixture.root, '.agdf-mcp-owned.json'), marker = JSON.parse(readFileSync(markerPath, 'utf8'));
  mkdirSync(join(fixture.root, 'qualification'));
  const evidence = 'Synthetic entrypoint contract data; no native qualification.';
  writeFileSync(join(fixture.root, 'qualification', 'synthetic.log'), evidence);
  marker.decision_app_qualification = { schema_version: 1, result: 'qualified', surface: 'codex',
    host: { name: 'agdf-mcp-test', version: '1.0.0', os: process.platform, arch: process.arch },
    candidate: { server_digest: marker.server_digest, dispatcher_digest: marker.dispatcher_digest, sdk_digest: marker.sdk_digest,
      resource_digest: readDecisionUiBuild().manifest.digest.slice(7) }, observations: [...DECISION_APP_OBSERVATIONS],
    evidence: [{ path: 'qualification/synthetic.log', digest: createHash('sha256').update(evidence).digest('hex') }], assurance: 'cooperative_local', authorizes: false };
  writeFileSync(markerPath, JSON.stringify(marker));
  for (const modern of [false, true]) await withStdioClient({ ...fixture, modern, capabilities: ui }, async client => {
    const input = { schema_version: '1', presentation_language: 'de', working_directory: root, target_source: 'explicit_target', primary_target: root,
      target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local',
      command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } };
    const qualification = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'native-qualification',
      presentation_language: 'de', working_directory: root, primary_target: root, target_source: 'explicit_target',
      run_id: f.runId, expected_revision_id: f.revision() } });
    assert.equal(qualification.structuredContent.report.ui_rendering_support, 'supported');
    assert.equal(qualification.structuredContent.report.action_qualification.qualified, true, 'Synthetic protocol tuple, not native proof');
    assert.equal(qualification.structuredContent.report.authorizes, false);
    const prepared = await client.callTool({ name: 'agdf_prepare', arguments: input });
    assert.equal(prepared.structuredContent.app_capability, 'available', JSON.stringify(prepared));
    assert.deepEqual(prepared._meta.agdf_decision.enabled_actions, ['approve']);
    // Evidence revocation after opening must reject before Core decision effects.
    writeFileSync(join(fixture.root, 'qualification', 'synthetic.log'), 'Evidence changed after view opened');
    const v = prepared._meta.agdf_decision;
    const rejected = await client.callTool({ name: 'agdf_decision_action', arguments: { session_id: v.session_id, operation_id: randomUUID(),
      presentation_id: v.binding.presentation_id, expected_revision_id: v.binding.expected_revision_id, action: 'approve' } });
    assert.equal(rejected.structuredContent.reason, 'app_only_mediation_not_qualified');
    assert.equal(readFileSync(f.state, 'utf8'), before);
    writeFileSync(join(fixture.root, 'qualification', 'synthetic.log'), evidence);
    await client.callTool({ name: 'agdf_cockpit_read', arguments: { operation: 'close', session_id: v.read_session_id } });
  });
  console.log('Exact owned generated package UI resource, private nonce, model/App discovery, unqualified enforcement, disabled groups, document bytes and teardown passed over both actual STDIO eras; native qualification remains absent.');
} finally { fixture.dispose(); }
