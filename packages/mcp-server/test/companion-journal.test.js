// Companion events through the real MCP tool paths (companion core T-008, T-009; SCN-010, SCN-012,
// SCN-013, SCN-015, SCN-021). The executing process journals each final command result once below
// the data root: through the facade (legacy and modern era) and the plugin generation, both of which
// execute in the generation, and through the directly executing server. Journal failures never change
// a tool result. run_completed and recovery_required are derived from real projected results in
// packages/core/test/companion-events-test.js; a full closeout run is outside this suite's budget.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';
import { parseEventLines } from '../../core/lib/companion/events.js';
import { COMPANION_DATA_ROOT_ENV, journalPath } from '../../core/lib/companion/journal.js';
import { artefactFileDigest } from '../../core/lib/control-state/run-seal-compute.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { fixture as cockpitFixture } from '../../core/test/control-cockpit-fixtures.js';
import { buildAgdfServer } from '../src/server.js';
import { DispatchExecutionError } from '../src/worker.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { createTestRuntime } from './runtime-fixture.js';
import { renderEvents } from '../../core/test/fixtures/host-neutral-harness.js';

const eventsOf = dataRoot => (existsSync(journalPath(dataRoot)) ? parseEventLines(readFileSync(journalPath(dataRoot), 'utf8')) : []);
const ofOperation = (dataRoot, operationId) => eventsOf(dataRoot).filter(event => event.operation_id === operationId);
const lines = count => Array.from({ length: count }, (_, index) => `Requirement line ${index + 1}.`).join('\n');
const UR = '# UR: Companion journal\n## Problem\nThe owner misses AGDF outcomes.\n## Goal\nOutcomes reach the companion.\n## Scope\nOnly this fixture.\n';

// Real tool paths. The facade and plugin variants both execute in a generation child.
const variants = [
  { label: 'facade legacy', modern: false, options: {} },
  { label: 'facade modern', modern: true, options: {} },
  { label: 'plugin generation', modern: true, options: { pluginSourceRoot: process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT ?? pluginRoot } },
];
for (const { label, modern, options } of variants) {
  const fixture = createOwnedRuntimeFixture({ controlRuns: [], ...options }), root = fixture.governanceTarget;
  // The plugin launcher hands its --data root over itself; the facade gets it as the launcher would.
  const launcherData = fixture.args.includes('--data') ? fixture.args[fixture.args.indexOf('--data') + 1] : null;
  const dataRoot = launcherData ?? mkdtempSync(join(tmpdir(), 'agdf-journal-data-'));
  const env = launcherData ? undefined : { [COMPANION_DATA_ROOT_ENV]: dataRoot };
  try {
    await withStdioClient({ ...fixture, modern, env }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic companion journal');
      assert.deepEqual(eventsOf(dataRoot), [], 'contract reads and run creation journal nothing');

      // SCN-013: a UR recorded from a run-local path carries preview, size, recorded digest and match.
      const urPath = `.agdf/control/runs/${h.runId}/evidence/UR-source.md`;
      mkdirSync(join(root, `.agdf/control/runs/${h.runId}/evidence`), { recursive: true });
      writeFileSync(join(root, urPath), UR);
      const urDigest = artefactFileDigest(root, urPath);
      const ur = await h.call('agdf_record', { ...h.bound(), command: { kind: 'step.record', payload: { step: 'ur', title: 'Synthetic companion journal', source: { path: urPath, digest: urDigest } } } });
      assert.equal(ur.outcome, 'accepted', JSON.stringify(ur));
      const [recorded] = ofOperation(dataRoot, ur.receipt?.operation_id ?? ur.operation_id);
      assert.deepEqual([recorded?.kind, recorded?.run_id, recorded?.gate], ['document_recorded', h.runId, 'UR'], JSON.stringify(eventsOf(dataRoot)));
      assert.deepEqual(recorded.review, [{ slot: 'UR', source: 'path', path: urPath, digest: urDigest, bytes: Buffer.byteLength(UR),
        preview: UR, truncated: false, source_match: 'match' }]);

      // SCN-015: a staged transfer whose bytes were changed in transit (same length) shows the changed
      // text in the preview, with source_match not_determinable and no mismatch claim (decision P4).
      const intended = `# Brownfield Review\n\nSmall isolated fixture with value 42.\n`;
      const corrupted = intended.replace('42', '4Z');
      assert.equal(corrupted.length, intended.length);
      const before = eventsOf(dataRoot).length;
      const reference = await h.stage('Brownfield Review', corrupted);
      const staged = eventsOf(dataRoot).slice(before);
      assert.deepEqual(staged.map(event => event.kind), ['material_staged'], 'begin and append journal nothing; the seal journals once');
      assert.deepEqual(staged[0].review, [{ slot: 'Brownfield Review', source: 'staged', path: null, digest: reference.digest,
        bytes: Buffer.byteLength(corrupted), preview: corrupted, truncated: false, source_match: 'not_determinable' }]);
      assert.equal(staged[0].gate, 'Brownfield Review');
      assert.ok(!JSON.stringify(staged).includes('mismatch'));
      const route = await h.invoke('agdf_record', 'step.record', { step: 'route', route: 'quick_task', reason: 'Companion journal fixture', source: reference });
      assert.deepEqual(ofOperation(dataRoot, route.receipt?.operation_id ?? route.operation_id).map(event => [event.kind, event.gate, event.review[0].source_match]),
        [['document_recorded', 'Brownfield Review', 'not_determinable']]);

      // SCN-013: a long staged document gets a truncated preview with its full size.
      const long = lines(60);
      const longStart = eventsOf(dataRoot).length;
      await h.stage('EVIDENCE', long);
      const [longSeal] = eventsOf(dataRoot).slice(longStart);
      assert.deepEqual([longSeal.review[0].truncated, longSeal.review[0].bytes, longSeal.review[0].preview.split('\n').length - 1],
        [true, Buffer.byteLength(long), 40]);

      // SCN-010 / SCN-012: approval requested and recorded, each once, present when the result returns.
      const prepared = await h.invoke('agdf_prepare', 'presentation.prepare', { gate: 'UR' });
      const deliverArgs = { ...h.bound(), command: { kind: 'presentation.deliver', payload: { gate: 'UR', presentation_id: prepared.family_result.presentation_id, route: 'markdown' } } };
      const started = performance.now();
      const delivered = await h.call('agdf_prepare', deliverArgs);
      const requested = ofOperation(dataRoot, deliverArgs.operation_id);
      const elapsed = performance.now() - started;
      assert.equal(delivered.outcome, 'accepted');
      assert.deepEqual(requested.map(event => [event.kind, event.gate, event.run_id]), [['approval_requested', 'UR', h.runId]], 'the line exists when the result returns');
      assert.ok(elapsed < 30_000, `the event is available after ${Math.round(elapsed)} ms`);
      console.log(`approval_requested journaled ${Math.round(elapsed)} ms after the call started (${label}).`);
      const approveArgs = { ...h.bound(), command: { kind: 'approval.record', payload: { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' } } };
      assert.equal((await h.call('agdf_approve', approveArgs)).outcome, 'accepted');
      assert.deepEqual(ofOperation(dataRoot, approveArgs.operation_id).map(event => [event.kind, event.gate]), [['approval_recorded', 'UR']]);
      // A replay of the same request is already applied and journals nothing more.
      assert.equal((await h.call('agdf_approve', approveArgs)).outcome, 'already_applied');
      assert.equal(ofOperation(dataRoot, approveArgs.operation_id).length, 1);

      // SCN-021: a not-dispatched rejection (the consumed reference is no longer granted) journals
      // exactly one write_rejected line in the executing process.
      const rejectArgs = { ...h.bound(), command: { kind: 'step.record', payload: { step: 'route', route: 'quick_task', reason: 'again', source: reference } } };
      const rejected = await client.callTool({ name: 'agdf_record', arguments: rejectArgs });
      assert.deepEqual([rejected.structuredContent.outcome, rejected.structuredContent.dispatch], ['rejected', 'not_dispatched']);
      assert.deepEqual(ofOperation(dataRoot, rejectArgs.operation_id).map(event => [event.kind, event.reason, event.outcome]),
        [['write_rejected', 'material_transfer_expired', 'rejected']]);

      // Read-only inspect calls journal nothing.
      const count = eventsOf(dataRoot).length;
      await h.call('agdf_inspect', { presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target', operation: 'gate-check', run_id: h.runId });
      assert.equal(eventsOf(dataRoot).length, count);
      assert.ok(eventsOf(dataRoot).every(event => event.root === root), 'every line names the governance root');
      assert.ok(!existsSync(join(root, '.agdf', 'control', 'companion')), 'nothing is written under .agdf/control');
      // SCN-009: the host-neutral harness reads these tool-path events with the Core event module only.
      assert.deepEqual([...new Set(renderEvents(readFileSync(journalPath(dataRoot), 'utf8'), root).map(event => event.kind))].sort(),
        ['approval_recorded', 'approval_requested', 'document_recorded', 'material_staged', 'write_rejected']);
    });

    // SCN-010: an unwritable journal directory leaves the tool results unchanged.
    rmSync(join(dataRoot, 'companion'), { recursive: true, force: true });
    writeFileSync(join(dataRoot, 'companion'), 'a file where the journal directory belongs');
    await withStdioClient({ ...fixture, modern, env }, async client => {
      const h = await createMcpDeliveryHarness(client, root, 'Synthetic unwritable journal');
      const reference = await h.stage('UR', UR);
      const ur = await h.invoke('agdf_record', 'step.record', { step: 'ur', title: 'Synthetic unwritable journal', source: reference });
      assert.equal(ur.outcome, 'accepted');
    });
    console.log(`Companion journal lines are written once by the executing process (${label}).`);
  } finally {
    fixture.dispose();
    if (!launcherData) rmSync(dataRoot, { recursive: true, force: true });
  }
}

// The directly executing server: a thrown failure of unknown effect and a thrown not-dispatched
// failure each journal exactly one line, reads none, and the replies are byte-identical with the
// journal working, unwritable or absent.
{
  const target = cockpitFixture();
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-journal-direct-'));
  const blocked = mkdtempSync(join(tmpdir(), 'agdf-journal-blocked-'));
  writeFileSync(join(blocked, 'companion'), 'a file where the journal directory belongs');
  const runtimeWith = value => {
    const previous = process.env[COMPANION_DATA_ROOT_ENV];
    if (value === undefined) delete process.env[COMPANION_DATA_ROOT_ENV]; else process.env[COMPANION_DATA_ROOT_ENV] = value;
    try { return createTestRuntime(); } finally { if (previous === undefined) delete process.env[COMPANION_DATA_ROOT_ENV]; else process.env[COMPANION_DATA_ROOT_ENV] = previous; }
  };
  const call = async (runtime, executor, name, args) => {
    const server = buildAgdfServer({ runtime, executor }), client = new Client({ name: 'companion-journal', version: '1' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    try { await server.connect(b); await client.connect(a); return await client.callTool({ name, arguments: args }); }
    finally { await client.close(); await server.closeAgdfRuntime(); await server.close(); }
  };
  const throwing = error => ({ execute: async () => { throw error; }, close: async () => {} });
  const write = { schema_version: '1', presentation_language: 'en', working_directory: target.root, primary_target: target.root,
    target_source: 'explicit_target', target_id: resolveControlCommandTarget(target.root).target_id, run_id: 'fixture-a', expected_revision_id: target.revision(),
    operation_id: randomUUID(), assurance: 'cooperative_local',
    command: { kind: 'step.record', payload: { step: 'evidence', reason: 'fixture', covers: 'fixture', source: { path: 'artefacts/evidence.md', digest: `sha256:${'b'.repeat(64)}` } } } };
  try {
    for (const [error, kind] of [[new DispatchExecutionError('dispatch_timeout'), 'effect_unknown'], [new DispatchExecutionError('dispatch_busy', 'not_dispatched'), 'write_rejected']]) {
      const args = { ...write, operation_id: randomUUID() };
      const replies = [];
      for (const root of [dataRoot, blocked, undefined]) replies.push(await call(runtimeWith(root), throwing(error), 'agdf_record', args));
      assert.deepEqual(replies[1], replies[0], 'an unwritable journal leaves the reply byte-identical');
      assert.deepEqual(replies[2], replies[0], 'no journal leaves the reply byte-identical');
      assert.deepEqual(ofOperation(dataRoot, args.operation_id).map(event => [event.kind, event.reason, event.gate]), [[kind, error.code, 'EVIDENCE']]);
    }
    // Behind the generation facade (CR finding A2): a failure the facade throws itself, such as a lost
    // generation connection, is journaled once by the facade; a result the generation produced and
    // the facade only relays (the generation journaled it) adds no line.
    const facade = root => ({ ...runtimeWith(root), requiresProjectedResult: true });
    const lost = { ...write, operation_id: randomUUID() };
    await call(facade(dataRoot), throwing(new DispatchExecutionError('generation_connection_lost')), 'agdf_record', lost);
    assert.deepEqual(ofOperation(dataRoot, lost.operation_id).map(event => [event.kind, event.reason, event.gate]),
      [['effect_unknown', 'generation_connection_lost', 'EVIDENCE']]);
    const relayed = { ...write, operation_id: randomUUID() }, relaying = facade(dataRoot);
    const generationResult = { execute: async args => relaying.projectToolResult('agdf_record', args,
      relaying.failure('dispatch_busy', 'agdf_record', args, { code: 'dispatch_busy', dispatch: 'not_dispatched' }), { code: 'dispatch_busy', dispatch: 'not_dispatched' }), close: async () => {} };
    const relayedReply = await call(relaying, generationResult, 'agdf_record', relayed);
    assert.equal(relayedReply.isError, true, JSON.stringify(relayedReply));
    assert.deepEqual(ofOperation(dataRoot, relayed.operation_id), [], 'a relayed generation result is journaled by the generation only');
    const reads = eventsOf(dataRoot).length;
    await call(runtimeWith(dataRoot), undefined, 'agdf_inspect', { presentation_language: 'en', working_directory: target.root, primary_target: target.root,
      target_source: 'explicit_target', operation: 'gate-check', run_id: 'fixture-a' });
    assert.equal(eventsOf(dataRoot).length, reads, 'a read journals nothing');
    console.log('Companion journal lines are written once by the directly executing server.');
  } finally {
    target.close();
    rmSync(dataRoot, { recursive: true, force: true });
    rmSync(blocked, { recursive: true, force: true });
  }
}
