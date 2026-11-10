// Actual production-launcher/SDK reconnections in disposable owned packages.
// This is synthetic protocol evidence, never native-host or human acceptance.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pluginRoot } from '../../../scripts/support/plugin-mcp-fixture.js';
import { clarifiedUr } from '../../core/test/planned-fixtures.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { createMcpDeliveryHarness } from './delivery-harness.js';
import { parseEventLines } from '../../core/lib/companion/events.js';
import { journalPath } from '../../core/lib/companion/journal.js';

for (const modern of [false, true]) {
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
  const root = fixture.governanceTarget;
  const dataRoot = fixture.args[fixture.args.indexOf('--data') + 1];
  assert.ok(dataRoot, 'Use the real installed launcher data root selected by the fixture.');
  const journal = join(dataRoot, 'mcp/prepared-calls');
  const common = { presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  const title = 'PRIVATE_RECONNECT_INPUT_' + randomUUID();
  const runDirectory = join(root, '.agdf/control/runs');
  const runs = () => readdirSync(runDirectory).filter(name => name !== '.gitkeep').sort();
  const call = async (client, name, args) => {
    const response = await client.callTool({ name, arguments: args });
    assert.notEqual(response.isError, true, JSON.stringify(response));
    assert.ok(response.structuredContent, JSON.stringify(response));
    return response.structuredContent;
  };
  function journalEntries() {
    const entries = [];
    for (const namespace of readdirSync(journal).filter(name => name !== 'owner.json')) {
      assert.match(namespace, /^[0-9a-f]{64}$/u);
      const directory = join(journal, namespace);
      if (process.platform !== 'win32') {
        assert.equal(statSync(directory).mode & 0o077, 0);
        assert.equal(statSync(join(directory, 'key')).mode & 0o077, 0);
      }
      // Never read the HMAC key. Only templates and ownership metadata are
      // inspected; submitted author values are not part of this journal.
      const owner = JSON.parse(readFileSync(join(directory, 'owner.json'), 'utf8'));
      assert.equal(owner.identity.surface, 'codex');
      for (const name of readdirSync(directory).filter(name => !['owner.json', 'key'].includes(name))) {
        const path = join(directory, name), bytes = readFileSync(path);
        if (process.platform !== 'win32') assert.equal(statSync(path).mode & 0o077, 0);
        assert.equal(bytes.includes(Buffer.from(title)), false, 'The supplied private title is never journaled as an input.');
        const record = JSON.parse(bytes);
        assert.equal(record.namespace, namespace);
        assert.match(record.mac, /^[0-9a-f]{64}$/u);
        if (record.state === 'available') {
          const template = JSON.parse(record.value);
          assert.equal(Object.hasOwn(template.call.arguments, 'inputs'), false);
          assert.ok(Array.isArray(template.required));
        }
        entries.push({ path, bytes, record });
      }
    }
    return entries;
  }
  let savedRead, savedCreate, originalCreate, created, staleStage, staleRevision, tpPrepare, tpDelivery;
  const requestCount = operation => parseEventLines(readFileSync(journalPath(dataRoot), 'utf8'))
    .filter(row => row.kind === 'approval_requested' && row.operation_id === operation).length;
  try {
    assert.equal(existsSync(journal), false, 'Preparing an owned runtime does not create the lazy transport journal.');
    // Each helper constructs and closes a distinct STDIO child process. No
    // in-memory transport or hand-created journal capability is substituted.
    await withStdioClient({ ...fixture, modern }, async client => {
      await client.listTools();
      assert.equal(existsSync(journal), false, 'Discovery alone does not create the journal.');
      const state = await call(client, 'agdf_inspect', { ...common, operation: 'project-state' });
      assert.equal(state.report.status, 'initialized');
      savedRead = structuredClone(state.next_action.call);
      assert.equal(savedRead.tool, 'agdf_inspect');
      assert.deepEqual(savedRead.arguments.inputs, {});
      const help = await call(client, savedRead.tool, savedRead.arguments);
      savedCreate = structuredClone(help.next_action.call);
      originalCreate = structuredClone(help.next_action.recovery_only.original_call.arguments);
      assert.equal(savedCreate.tool, 'agdf_run');
      assert.equal(help.next_action.operation.kind, 'run.create');
      assert.deepEqual(help.next_action.required_inputs, ['title']);
      assert.deepEqual(runs(), []);
      const entries = journalEntries();
      assert.ok(entries.some(row => row.record.id === savedRead.arguments.prepared_call_id));
      assert.ok(entries.some(row => row.record.id === savedCreate.arguments.prepared_call_id));
    });

    await withStdioClient({ ...fixture, modern }, async client => {
      const reboundRead = await call(client, savedRead.tool, savedRead.arguments);
      assert.equal(reboundRead.report.kind, 'run.create', 'The exact prior-process read reference remains usable.');
      const before = runs();
      for (const [name, args, reason] of [
        ['agdf_inspect', { prepared_call_id: randomUUID(), inputs: {} }, 'prepared_call_unknown'],
        ['agdf_record', savedCreate.arguments, 'command_schema_invalid'],
        ['agdf_run', { ...savedCreate.arguments, inputs: { title, expected_revision_id: randomUUID() } }, 'command_schema_invalid'],
      ]) {
        const rejected = await client.callTool({ name, arguments: args });
        assert.equal(rejected.isError, true, JSON.stringify(rejected));
        if (name === 'agdf_inspect') {
          assert.equal(rejected.structuredContent?.diagnostics?.[0]?.code, reason, JSON.stringify(rejected));
          assert.equal(rejected.structuredContent?.terminal, true);
          assert.match(rejected.structuredContent?.prepared_call_help, /no operation was dispatched/iu);
        } else {
          assert.equal(rejected.structuredContent?.reason, reason, JSON.stringify(rejected));
          assert.equal(rejected.structuredContent?.dispatch, 'not_dispatched');
        }
        assert.deepEqual(runs(), before);
      }
      const mixed = await client.callTool({ name: savedCreate.tool,
        arguments: { ...savedCreate.arguments, primary_target: root, inputs: { title } } });
      assert.equal(mixed.isError, true, 'Raw target overrides cannot be mixed into a prepared call.');
      assert.deepEqual(runs(), before);
      const create = structuredClone(savedCreate); create.arguments.inputs = { title };
      created = await call(client, create.tool, create.arguments);
      assert.equal(created.outcome, 'accepted');
      assert.equal(created.operation_id, originalCreate.operation_id);
      assert.equal(created.receipt.operation_id, originalCreate.operation_id);
      assert.equal(created.receipt.target_id, originalCreate.target_id);
      assert.deepEqual(runs(), [created.binding.run_id]);
      staleRevision = created.current.revision_id;
      const authoring = await call(client, 'agdf_inspect', { ...common, operation: 'authoring-inputs', bundle: true,
        run_id: created.binding.run_id, expected_revision_id: staleRevision });
      staleStage = structuredClone(authoring.next_action.call);
      assert.equal(authoring.next_action.operation.expected_revision_id, staleRevision);
      journalEntries();
    });

    await withStdioClient({ ...fixture, modern }, async client => {
      const replayCall = structuredClone(savedCreate); replayCall.arguments.inputs = { title };
      const replay = await call(client, replayCall.tool, replayCall.arguments);
      assert.equal(replay.outcome, 'already_applied');
      assert.equal(replay.operation_id, originalCreate.operation_id);
      assert.deepEqual(replay.receipt, created.receipt);
      assert.equal(replay.binding.run_id, created.binding.run_id);
      assert.deepEqual(runs(), [created.binding.run_id], 'Replaying the original creation never creates another Run.');

      // Only an unused argument TEMPLATE crossed the connection boundary. The
      // following private transfer and its consuming canonical write both run
      // on this new connection; no buffer/material capability is rehydrated.
      const authoring = await call(client, 'agdf_inspect', { ...common, operation: 'authoring-inputs', bundle: true,
        run_id: created.binding.run_id, expected_revision_id: staleRevision });
      const stage = structuredClone(authoring.next_action.call); stage.arguments.inputs = { content: clarifiedUr };
      const staged = await call(client, stage.tool, stage.arguments);
      const record = structuredClone(staged.next_action.call); record.arguments.inputs = { title: 'Synthetic reconnect UR' };
      const recorded = await call(client, record.tool, record.arguments);
      assert.equal(recorded.outcome, 'accepted');
      assert.notEqual(recorded.current.revision_id, staleRevision);
      const statePath = join(runDirectory, created.binding.run_id, 'RUN_STATE.md'), before = readFileSync(statePath, 'utf8');
      const oldTemplate = structuredClone(staleStage); oldTemplate.arguments.inputs = { content: clarifiedUr };
      const stale = await client.callTool({ name: oldTemplate.tool, arguments: oldTemplate.arguments });
      assert.equal(stale.isError, true);
      assert.equal(stale.structuredContent?.reason, 'stale_revision', JSON.stringify(stale));
      assert.equal(readFileSync(statePath, 'utf8'), before, 'Durable references never refresh a selected revision.');

      const entry = journalEntries().find(row => row.record.id === savedRead.arguments.prepared_call_id);
      assert.ok(entry);
      try {
        writeFileSync(entry.path, JSON.stringify({ ...entry.record, created: entry.record.created + 1 }));
        const tampered = await client.callTool({ name: savedRead.tool, arguments: savedRead.arguments });
        assert.equal(tampered.isError, true);
        assert.equal(tampered.structuredContent?.diagnostics?.[0]?.code, 'runtime_provenance_invalid', JSON.stringify(tampered));
        assert.equal(tampered.structuredContent?.terminal, true);
        assert.match(tampered.structuredContent?.prepared_call_help, /no operation was dispatched/iu);
        assert.equal(readFileSync(statePath, 'utf8'), before);
      } finally { writeFileSync(entry.path, entry.bytes); }
      journalEntries();

      const tp = await createMcpDeliveryHarness(client, root, 'Synthetic TP replay across launcher processes');
      await tp.startStructured('structured_delivery', { beforeTpApproval: true });
      tpPrepare = { ...tp.bound(), command: { kind: 'presentation.prepare', payload: { gate: 'TP' } } };
      const prepared = await call(client, 'agdf_prepare', tpPrepare);
      tpDelivery = { ...tp.bound(), command: { kind: 'presentation.deliver', payload: {
        gate: 'TP', presentation_id: prepared.family_result.presentation_id, route: 'markdown' } } };
      const delivered = await call(client, 'agdf_prepare', tpDelivery);
      assert.equal(delivered.outcome, 'accepted');
      assert.equal(delivered.presentation_delivery.historical_delivery, false);
      assert.equal(requestCount(tpDelivery.operation_id), 1);
    });

    await withStdioClient({ ...fixture, modern }, async client => {
      const absent = await client.callTool({ name: 'agdf_prepare', arguments: tpDelivery });
      assert.equal(absent.structuredContent?.outcome, 'rejected');
      assert.equal(absent.structuredContent?.reason, 'delivery_state_unavailable');
      assert.equal(requestCount(tpDelivery.operation_id), 1);

      const prepared = await call(client, 'agdf_prepare', tpPrepare);
      assert.equal(prepared.outcome, 'already_applied');
      assert.equal(prepared.family_result.presentation_id, tpDelivery.command.payload.presentation_id);
      const replay = await call(client, 'agdf_prepare', tpDelivery);
      assert.equal(replay.outcome, 'accepted');
      assert.equal(replay.operation_id, tpDelivery.operation_id);
      assert.equal(replay.presentation_delivery.historical_delivery, false, 'restored delivery has no in-memory selection history');
      assert.equal(requestCount(tpDelivery.operation_id), 1, 'the journal remembers the request across producers');

      const otherPrepare = { ...tpPrepare, operation_id: randomUUID() };
      const independent = await call(client, 'agdf_prepare', otherPrepare);
      const otherDelivery = { ...tpDelivery, operation_id: randomUUID(), command: { ...tpDelivery.command, payload: {
        ...tpDelivery.command.payload, presentation_id: independent.family_result.presentation_id } } };
      assert.equal((await call(client, 'agdf_prepare', otherDelivery)).outcome, 'accepted');
      assert.equal(requestCount(otherDelivery.operation_id), 1);
    });
    console.log(`Owned launcher references and TP request identity survive SDK/STDIO process changes (${modern ? 'modern' : 'legacy'}).`);
  } finally { fixture.dispose(); }
}
