import assert from 'node:assert/strict';
import { generationFailureReason } from '../src/generation-protocol.js';
assert.equal(generationFailureReason(Error('PRIVATE_PAYLOAD_AND_PATH')), 'generation_runtime_failed');
assert.equal(generationFailureReason(Error('AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED')), 'AGDF_MCP_EXECUTABLE_CLAIM_CONTENDED');
import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync, fork } from 'node:child_process';
import { createMcpGenerationPublisher } from '../../cli/lib/mcp-lifecycle/package.js';
import { ensurePluginMcpRuntime } from '../../cli/lib/mcp-lifecycle/plugin-runtime.js';
import { offlineNpm, pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../cli/scripts/fixtures/sd-definition.js';
import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { MCP_APP_UI_EXTENSION } from '../src/ui-capability.js';
const root = mkdtempSync(join(tmpdir(), 'agdf-owned-generation-'));
let facade, client, server, clean = false;
try {
  const base = ensurePluginMcpRuntime({ pluginRoot, dataRoot: join(root, 'runtime'), exec: offlineNpm });
  const dispatcher = await import(pathToFileURL(join(base.dispatcherRoot, 'lib/mcp-dispatch-runtime.js')));
  const { createOwnedGenerationFacade } = await import(pathToFileURL(join(base.packageRoot, 'src/generation.js')));
  const { loadCockpitResource } = await import(pathToFileURL(join(base.packageRoot, 'src/cockpit-resource.js')));
  let runtime = dispatcher.createMcpDispatchRuntime({ surface: 'codex' });
  const ui = { uri: dispatcher.DECISION_UI_URI, mimeType: 'text/html;profile=mcp-app', limit: 4194304, kind: 'decision' };
  ui.digest = loadCockpitResource(ui).digest; runtime = await dispatcher.createMcpDecisionRuntime({ runtime, ui });
  const publisher = createMcpGenerationPublisher(base), trace = [];
  const lostOperation = randomUUID();
  const ownedFork = (entry, args, options) => {
    const child = fork(entry, args, options), emit = child.emit;
    child.emit = function(kind, ...values) {
      if (kind === 'message' && values[0]?.kind === 'result' && values[0]?.original_operation_id === lostOperation) return true;
      return emit.call(this, kind, ...values);
    }; return child;
  };
  facade = await createOwnedGenerationFacade({ runtime, publisher, surface: 'codex',
    Fork: ownedFork, createControlRuntime: runtimeControl => dispatcher.createMcpDispatchRuntime({ surface: 'codex', runtimeControl }),
    onEvent: event => trace.push(event) });
  assert.equal(facade.runtimeControl.status().occupancy, 1);
  const target = join(root, 'target'), cli = resolve(import.meta.dirname, '../../cli/bin/create-agdf.js');
  execFileSync('git', ['init', '-q', target]); execFileSync(process.execPath, [cli, 'init', '--dir', target, '--language', 'en']);
  const f = createSdDefinitionTestRun(target, cli, 'generation-test', process.env, { typedApprovals: true });
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const { resolveControlCommandTarget } = await import('../../core/lib/control-state/approval-command-contract.js');
  const envelope = () => ({ schema_version: '1', presentation_language: 'en', working_directory: target,
    primary_target: target, target_source: 'explicit_target', target_id: resolveControlCommandTarget(target).target_id,
    run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  const state = readFileSync(f.state, 'utf8');
  const candidate = { schema_version: '1', publication_id: base.publication_id, version: base.version,
    server_digest: base.digest, dispatcher_digest: base.dispatcherDigest, sdk_digest: base.sdkDigest };
  const { buildAgdfServer } = await import(pathToFileURL(join(base.packageRoot, 'src/server.js')));
  server = buildAgdfServer({ runtime: facade });
  client = new Client({ name: 'synthetic-generation-test', version: '1' },
    { capabilities: { extensions: { [MCP_APP_UI_EXTENSION]: { mimeTypes: [ui.mimeType] } } } });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport); await client.connect(clientTransport);
  const invoke = async (name, input) => {
    const reply = await client.callTool({ name, arguments: input });
    assert.ok(reply.structuredContent, JSON.stringify(reply));
    if (reply.structuredContent.presentation_delivery) assert.equal(reply.content[0].text, reply.structuredContent.presentation_delivery.text);
    if (reply.structuredContent.outcome === 'effect_unknown' && reply.structuredContent.reason === 'generation_response_unknown') throw Error('generation_response_unknown');
    return { ...reply.structuredContent, ...(reply._meta ? { _meta: reply._meta } : {}) };
  };
  const open = () => invoke('agdf_prepare', { ...envelope(), command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } });
  const { artefactFileDigest } = await import('../../core/lib/control-state/run-seal.js');
  const candidatePath = f.prefix + 'CANDIDATE.json', alternatePath = f.prefix + 'CANDIDATE_ALTERNATE.json';
  writeFileSync(join(target, candidatePath), JSON.stringify(candidate, null, 2) + '\n');
  writeFileSync(join(target, alternatePath), JSON.stringify(candidate) + '\n');
  const replace = (id = randomUUID(), alternate = false) => {
    const path = alternate ? alternatePath : candidatePath, digest = artefactFileDigest(target, path);
    return invoke('agdf_record', { ...envelope(), operation_id: id, command: { kind: 'runtime_generation.replace',
      payload: { candidate: { path, digest }, confirmation: `Replace owned runtime: ${digest}` } } });
  };
  const first = await open(); assert.ok(first._meta?.agdf_decision, JSON.stringify(first));
  const firstSession = first._meta.agdf_decision;
  const operation = randomUUID(), second = await replace(operation); assert.equal(second.outcome, 'accepted', JSON.stringify(second));
  assert.equal((await replace(operation)).outcome, 'already_applied');
  assert.equal((await replace(operation, true)).reason, 'operation_payload_conflict');
  assert.equal((await invoke('agdf_prepare', { ...envelope(), operation_id: operation,
    command: { kind: 'presentation.prepare', payload: { gate: 'SD' } } })).reason, 'operation_payload_conflict');
  assert.equal((await replace(first.operation_id)).reason, 'operation_payload_conflict');
  assert.ok((await open())._meta?.agdf_decision);
  assert.equal((await replace()).outcome, 'accepted'); assert.ok((await open())._meta?.agdf_decision);
  const refused = await replace(); assert.equal(refused.reason, 'generation_capacity_protected', JSON.stringify(refused));
  assert.equal(facade.runtimeControl.status().occupancy, 3); assert.equal(Math.max(...trace.map(e => e.occupancy)), 3);
  const oldDocument = await invoke('agdf_cockpit_read', { operation: 'document', session_id: firstSession.read_session_id,
    snapshot_id: firstSession.snapshot_id, run_id: f.runId, resource_id: firstSession.resource_id });
  assert.equal(oldDocument.state, 'available', JSON.stringify(oldDocument));
  assert.equal(readFileSync(f.state, 'utf8'), state, 'Replacement and read views never approve or mutate a Run.');
  const lostInput = { ...envelope(), operation_id: lostOperation, command: { kind: 'presentation_decision.record', payload: {
    gate: 'SD', presentation_id: firstSession.binding.presentation_id, action: 'reject', comment: 'Synthetic deliberate rejection; lost IPC acknowledgement.' } } };
  await assert.rejects(invoke('agdf_record', lostInput), /generation_response_unknown/u);
  assert.notEqual(readFileSync(f.state, 'utf8'), state, 'The deliberately lost response must follow an actual recorded effect.');
  const saved = readFileSync(f.state, 'utf8');
  const closed = await invoke('agdf_cockpit_read', { operation: 'close', session_id: firstSession.read_session_id });
  assert.equal(closed.data.closed, true);
  assert.equal((await replace()).reason, 'generation_capacity_protected', 'Unknown business effect pins its original generation after the view closes.');
  const observed = await invoke('agdf_inspect', { operation: 'operation-status', presentation_language: 'en', working_directory: target,
    primary_target: target, target_source: 'explicit_target', run_id: f.runId,
    expected_revision_id: lostInput.expected_revision_id, module: lostOperation });
  assert.equal(observed.report.status, 'recorded', JSON.stringify(observed));
  assert.equal(observed.report.receipt.operation_id, lostOperation);
  assert.equal((await replace()).outcome, 'accepted');
  assert.ok(trace.some(e => e.generation_id === 1 && e.kind === 'confirmed_exit'));
  assert.equal(facade.runtimeControl.status().occupancy, 3);
  assert.equal(readFileSync(f.state, 'utf8'), saved, 'Inspection and retirement neither replay nor change the lost operation.');
  await facade.close(); assert.equal(facade.runtimeControl.status().occupancy, 0);
  // A real child acknowledges orderly shutdown but deliberately keeps its own
  // event loop alive. No forced signal may substitute for actual exit.
  const wrapper = join(root, 'delayed-owned-exit.mjs');
  writeFileSync(wrapper, `process.on('message', message => { if (message?.kind === 'shutdown') setTimeout(() => {}, 800); });\nawait import(process.env.AGDF_SYNTHETIC_ENTRY);\n`);
  const delayedFork = (entry, args, options) => fork(wrapper, args, { ...options,
    env: { ...process.env, AGDF_SYNTHETIC_ENTRY: pathToFileURL(entry).href } });
  const headless = dispatcher.createMcpDispatchRuntime({ surface: 'copilot' });
  const delayed = await createOwnedGenerationFacade({ runtime: headless, publisher, surface: 'copilot', closeMs: 40, Fork: delayedFork,
    createControlRuntime: runtimeControl => dispatcher.createMcpDispatchRuntime({ surface: 'copilot', runtimeControl }),
    onEvent: event => trace.push(event) });
  await delayed.close();
  assert.equal(delayed.runtimeControl.status().occupancy, 1);
  assert.equal(delayed.runtimeControl.status().generations[0].state, 'close_unconfirmed');
  assert.equal(delayed.runtimeControl.status().generations[0].confirmed_exit, false);
  await new Promise(resolve => setTimeout(resolve, 1000));
  assert.equal(delayed.runtimeControl.status().occupancy, 0, 'Acknowledgement retained the slot; actual natural owned exit released it.');

  // Independent real connections retain distinct direct handles. Corrupt one
  // candidate's actual qualification reply, then race two valid replacements.
  let corruptCandidate = true;
  const qualificationFork = (entry, args, options) => {
    const child = fork(entry, args, options), emit = child.emit;
    child.emit = function(kind, ...values) {
      const reply = values[0];
      if (kind === 'message' && reply?.kind === 'qualified' && reply.generation_id > 1) {
        if (corruptCandidate) reply.payload.manifest.sdk_digest = '0'.repeat(64);
        else { setTimeout(() => emit.call(this, kind, ...values), 200); return true; }
      }
      return emit.call(this, kind, ...values);
    }; return child;
  };
  const independent = await createOwnedGenerationFacade({ runtime: headless, publisher, surface: 'copilot',
    createControlRuntime: runtimeControl => dispatcher.createMcpDispatchRuntime({ surface: 'copilot', runtimeControl }), onEvent: event => trace.push(event) });
  const faulted = await createOwnedGenerationFacade({ runtime: headless, publisher, surface: 'copilot', Fork: qualificationFork,
    createControlRuntime: runtimeControl => dispatcher.createMcpDispatchRuntime({ surface: 'copilot', runtimeControl }), onEvent: event => trace.push(event) });
  try {
    assert.notEqual(independent.runtimeControl.status().owner_epoch, faulted.runtimeControl.status().owner_epoch);
    const callReplacement = () => {
      const tool = faulted.tool('agdf_record');
      return tool.execute(tool.parse({ ...envelope(), command: { kind: 'runtime_generation.replace', payload: {
        candidate: { path: candidatePath, digest: artefactFileDigest(target, candidatePath) },
        confirmation: `Replace owned runtime: ${artefactFileDigest(target, candidatePath)}` } } }));
    };
    const failed = await callReplacement();
    assert.equal(failed.reason, 'generation_manifest_incompatible', JSON.stringify(failed));
    assert.equal(faulted.runtimeControl.status().current_generation, 1);
    assert.equal(faulted.runtimeControl.status().generations[0].usable, true);
    assert.equal(faulted.runtimeControl.status().occupancy, 1, 'Failed idle candidate requires acknowledged real exit before release.');
    corruptCandidate = false;
    const raced = await Promise.all([callReplacement(), callReplacement()]);
    assert.equal(raced.filter(row => row.outcome === 'accepted').length, 1);
    assert.equal(raced.filter(row => row.reason === 'generation_replacement_busy').length, 1);
    assert.equal(independent.runtimeControl.status().occupancy, 1, 'Another connection is untouched.');
    assert.equal(independent.runtimeControl.status().current_generation, 1);
    assert.equal(readFileSync(f.state, 'utf8'), saved, 'Qualification failures and concurrent replacement never mutate business control.');
  } finally { await Promise.all([faulted.close(), independent.close()]); }
  assert.equal(faulted.runtimeControl.status().occupancy, 0);
  assert.equal(independent.runtimeControl.status().occupancy, 0);

  if (process.env.AGDF_GENERATION_TRACE_PATH) writeFileSync(process.env.AGDF_GENERATION_TRACE_PATH, JSON.stringify({ evidence_kind: 'actual_child_process_synthetic_host', events: trace }, null, 2) + '\n');
  console.log('Actual owned child IPC, exact manifest qualification, three live-view slots, original-view routing, capacity refusal, control replay/conflict and acknowledged real-exit retirement passed; synthetic host only.');
  // Real child qualification and IPC must use the plugin render schema, never the bound or Decision runtime.
  const cockpitRuntime = await dispatcher.createMcpCockpitRuntime({ surface: 'codex', cockpitMode: 'plugin' });
  const cockpitFacade = await createOwnedGenerationFacade({ runtime: cockpitRuntime, publisher,
    surface: 'codex', cockpitMode: 'plugin',
    createControlRuntime: runtimeControl => dispatcher.createMcpDispatchRuntime({ surface: 'codex', runtimeControl }) });
  try {
    assert.deepEqual(cockpitFacade.tools.map(tool => tool.name), ['agdf_cockpit', 'agdf_cockpit_read']);
    const render = cockpitFacade.tool('agdf_cockpit'), reader = cockpitFacade.tool('agdf_cockpit_read');
    assert.throws(() => render.parse({}), /resource_denied/);
    const sessions = [];
    for (let n = 0; n < 4; n++) {
      const opened = await render.execute(render.parse({ working_directory: target, primary_target: target,
        target_source: 'explicit_target', run_id: f.runId }), undefined, { uiSupported: true });
      assert.ok(opened._meta?.agdf_cockpit, JSON.stringify(opened));
      sessions.push(opened._meta.agdf_cockpit.session_id);
    }
    const limit = await render.execute(render.parse({ working_directory: target, primary_target: target,
      target_source: 'explicit_target' }), undefined, { uiSupported: true });
    assert.equal(limit.code, 'resource_limit');
    const result = await reader.execute(reader.parse({ operation: 'snapshot', session_id: sessions[0], run_id: f.runId }), undefined, { uiSupported: true });
    assert.equal(result.data.run.run_id, f.runId);
    for (const session_id of sessions) assert.equal((await reader.execute(reader.parse({ operation: 'close', session_id }), undefined, { uiSupported: true })).data.closed, true);
  } finally { await cockpitFacade.close(); await cockpitRuntime.close(); }
  assert.equal(cockpitFacade.runtimeControl.status().occupancy, 0);
  clean = true;
} finally {
  await client?.close(); await server?.closeAgdfRuntime(); await server?.close();
  await facade?.close();
  if (clean || !facade) rmSync(root, { recursive: true, force: true });
  else console.error('Retained diagnostic fixture after unconfirmed cleanup:', root);
}
