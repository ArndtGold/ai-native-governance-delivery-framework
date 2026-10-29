import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { MessageChannel, Worker } from 'node:worker_threads';
import { boundStdioOutput } from '../src/stdio-output.js';
import { createOwnerClient } from '../../cli/lib/mcp-lifecycle/owner-client.js';
import { acquireMcpExecutableClaim, inspectMcpServerPackage } from '../../cli/lib/mcp-lifecycle/package.js';
import { ensurePluginMcpRuntime } from '../../cli/lib/mcp-lifecycle/plugin-runtime.js';
import { finiteJson, ownerFrame, encodeOwnerFrame, decodeOwnerFrame, generationMessage, validGenerationMessage,
  OWNER_LIMITS, GENERATION_LIMITS, publicationSelector } from '../../core/lib/runtime/mcp-owner-protocol.js';
import { resolveControlCommandTarget } from '../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest, runSealState } from '../../core/lib/control-state/run-seal.js';
import { readRunOperations } from '../../core/lib/control-state/run-operations.js';
import { digestDirectory, digestMcpDispatcherPackage } from '../../core/lib/runtime/plugin-provenance.js';
import { pluginRoot, offlineNpm } from '../../../scripts/support/plugin-mcp-fixture.js';
import { createOwnedRuntimeFixture } from './owned-runtime.js';

// One canonical owner-thread test owner. Selectors are for focused engineering;
// the canonical MCP runner supplies no selector and executes every case.

async function protocolCase() {
  const binding = { token: randomUUID(), connection_epoch: randomUUID(), publication_id: 'a'.repeat(64) };
  const row = { epoch: randomUUID(), generation: 1, publication_id: binding.publication_id };
  const requestId = randomUUID();
  const frame = ownerFrame(binding, 'send', generationMessage(row.epoch, 1, 'session_inspect', {}, {}, null, requestId), requestId, row);
  assert.deepEqual(decodeOwnerFrame(encodeOwnerFrame(frame, binding), binding), frame);
  for (const value of [NaN, Infinity, undefined, 1n, new Date(), new Map(), new Uint8Array(1), [, 1], { get secret() { throw Error('getter must not run'); } }]) assert.equal(finiteJson(value), false);
  const cyclic = {}; cyclic.self = cyclic; assert.equal(finiteJson(cyclic), false);
  assert.equal(finiteJson({ a: [1, true, null, 'x'] }), true);
  for (const bad of [{ ...frame, token: randomUUID() }, { ...frame, connection_epoch: randomUUID() },
    { ...frame, publication_id: '../outside' }, { ...frame, extra: true }, { ...frame, generation_id: 0 },
    { ...frame, payload: { raw: 'x'.repeat(GENERATION_LIMITS.input) } }, { ...frame, request_id: 'not-a-uuid' }]) assert.throws(() => encodeOwnerFrame(bad, binding));
  assert.throws(() => decodeOwnerFrame(Buffer.from('{}'), binding));
  assert.throws(() => decodeOwnerFrame('{', binding));
  for (const reply of [false, true]) {
    const limit = reply ? GENERATION_LIMITS.result : GENERATION_LIMITS.input;
    const message = generationMessage(row.epoch, 1, reply ? 'result' : 'invoke', { value: '' }, {}, null, randomUUID());
    message.payload.value = 'x'.repeat(limit - Buffer.byteLength(JSON.stringify(message)));
    assert.equal(Buffer.byteLength(JSON.stringify(message)), limit);
    const wrapped = ownerFrame(binding, reply ? 'message' : 'send', message, message.request_id, row);
    assert.deepEqual(decodeOwnerFrame(encodeOwnerFrame(wrapped, binding, { reply }), binding, { reply }), wrapped, 'fixed owner framing preserves the complete existing data budget');
    message.payload.value += 'x'; assert.throws(() => encodeOwnerFrame(wrapped, binding, { reply }), /generation_input_limit/u);
  }

  assert.equal(validGenerationMessage({ ...frame.payload, context: { client: NaN } }, { epoch: row.epoch, generation: 1 }), false);
  // The actual MessagePort exercises bounded client admission, late/wrong replies,
  // and genuine port loss without pretending to be a Worker or ChildProcess.
  const { port1, port2 } = new MessageChannel();
  const client = createOwnerClient(port1, binding);
  let opened;
  port2.on('message', wire => {
    const input = decodeOwnerFrame(wire, binding);
    if (input.kind === 'open') {
      opened = input;
      port2.postMessage(encodeOwnerFrame(ownerFrame(binding, 'opened', { opened: true }, input.request_id, row), binding, { reply: true }));
    }
  });
  const connection = await client.open({ packageInfo: { publication_id: row.publication_id, version: '0.20.2', digest: 'b'.repeat(64), dispatcherDigest: 'c'.repeat(64), sdkDigest: 'd'.repeat(64) }, epoch: row.epoch, generation: 1 });
  assert.equal(opened.payload.publication_id, binding.publication_id);
  let rejected = 0;
  for (let index = 0; index <= OWNER_LIMITS.frames; ++index) {
    const message = generationMessage(row.epoch, 1, 'session_inspect', {}, {}, null, randomUUID());
    connection.send(message, error => { if (error) ++rejected; });
  }
  assert.equal(rejected, 1, 'the 65th outstanding frame is rejected before sending');
  let actualExit = false, lost = false; connection.on('exit', () => { actualExit = true; }); connection.on('disconnect', () => { lost = true; });
  port2.close();
  await new Promise(resolve => port1.once('close', resolve));
  assert.equal(connection.connected, false); assert.equal(lost, true); assert.equal(actualExit, false);
  assert.equal(rejected, 1, 'callbacks report admission once; channel loss is a separate lifecycle event');
  // Byte admission is independent of frame count: fewer than 64 large valid
  // private requests must hit the fixed aggregate byte limit.
  const bytePorts = new MessageChannel(), byteClient = createOwnerClient(bytePorts.port1, binding);
  bytePorts.port2.on('message', wire => {
    const input = decodeOwnerFrame(wire, binding);
    if (input.kind === 'open') bytePorts.port2.postMessage(encodeOwnerFrame(ownerFrame(binding, 'opened', { opened: true }, input.request_id, row), binding, { reply: true }));
  });
  const byteConnection = await byteClient.open({ packageInfo: { publication_id: row.publication_id, version: '0.20.2', digest: 'b'.repeat(64), dispatcherDigest: 'c'.repeat(64), sdkDigest: 'd'.repeat(64) }, epoch: row.epoch, generation: 1 });
  let byteRejections = 0;
  for (let index = 0; index < 60; ++index) byteConnection.send(generationMessage(row.epoch, 1, 'invoke', { name: 'agdf_dispatch', arguments: { bounded: 'x'.repeat(60000) } }, {}, null, randomUUID()), error => { if (error) ++byteRejections; });
  assert.ok(byteRejections > 0 && byteRejections < 60, 'aggregate bytes reject before the frame cap without an unbounded queue');
  bytePorts.port2.close(); await new Promise(resolve => bytePorts.port1.once('close', resolve));
  // A blocked SDK wire receives one actual send; further responses are
  // bounded snapshots rather than parallel drain listeners or mutable aliases.
  const writes = [], waiters = [];
  const bounded = boundStdioOutput({ send(message) { writes.push(message); return new Promise(resolve => waiters.push(resolve)); }, async close() {} });
  const results = [], mutable = { jsonrpc: '2.0', id: 2, result: { value: 'original' } };
  results.push(bounded.send({ jsonrpc: '2.0', id: 1, result: {} }).catch(error => error.message));
  results.push(bounded.send(mutable).catch(error => error.message)); mutable.result.value = 'changed';
  for (let id = 3; id <= 64; ++id) results.push(bounded.send({ jsonrpc: '2.0', id, result: {} }).catch(error => error.message));
  await assert.rejects(bounded.send({ jsonrpc: '2.0', id: 65, result: {} }), /STDIO_CAPACITY/u);
  assert.equal(writes.length, 1);
  waiters.shift()();
  while (writes.length < 2) await new Promise(resolve => setImmediate(resolve));
  assert.equal(writes[1].result.value, 'original', 'capture the actual JSON at send time');
  await bounded.close(); waiters.shift()(); await Promise.all(results);
  let finishLarge;
  const sizeBounded = boundStdioOutput({ send() { return new Promise(resolve => { finishLarge = resolve; }); }, async close() {} });
  const large = sizeBounded.send({ result: 'x'.repeat(4 * 1024 ** 2) }).catch(error => error.message);
  await assert.rejects(sizeBounded.send({ result: 'x'.repeat(OWNER_LIMITS.bytes) }), /STDIO_CAPACITY/u);
  await sizeBounded.close(); finishLarge(); await large;
  console.log('owner-protocol: pass');
}

async function claimsCase() {
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
  try {
    const runtime = inspectMcpServerPackage({ dataRoot: dirname(fixture.root), expectedVersion: '0.20.2' });
    assert.equal(runtime.status, 'matched'); assert.equal(runtime.executionModel, 'owner_threads_v1');
    const count = () => readdirSync(join(fixture.root, '.agdf-executable-claims')).length;
    // Rehashed negative images separate interface qualification from a mere
    // changed-byte failure. No invalid declaration can reach executable admission.
    const serverManifest = join(runtime.packageRoot, 'package.json');
    const dispatcherManifest = join(runtime.dispatcherRoot, 'package.json');
    const originalServer = readFileSync(serverManifest), originalDispatcher = readFileSync(dispatcherManifest), originalMarker = readFileSync(runtime.markerPath);
    for (const mode of ['unknown_model', 'owner_import_missing', 'owner_export_missing']) {
      try {
        const server = JSON.parse(originalServer), dispatcher = JSON.parse(originalDispatcher);
        if (mode === 'unknown_model') server.agdfExecutionModel = 'owner_threads_unknown';
        if (mode === 'owner_import_missing') delete server.imports['#agdf-owner-protocol'];
        if (mode === 'owner_export_missing') delete dispatcher.exports['./mcp-owner-protocol'];
        writeFileSync(serverManifest, JSON.stringify(server)); writeFileSync(dispatcherManifest, JSON.stringify(dispatcher));
        writeFileSync(runtime.markerPath, JSON.stringify({ ...JSON.parse(originalMarker), server_digest: digestDirectory(runtime.packageRoot), dispatcher_digest: digestMcpDispatcherPackage(runtime.dispatcherRoot) }));
        assert.equal(inspectMcpServerPackage({ dataRoot: dirname(fixture.root), expectedVersion: '0.20.2' }).status, 'mismatch', mode);
      } finally { writeFileSync(serverManifest, originalServer); writeFileSync(dispatcherManifest, originalDispatcher); writeFileSync(runtime.markerPath, originalMarker); }
    }
    let retained = 0;
    for (const mode of ['confirmed', 'no_ack', 'failed_exit']) {
      const claim = acquireMcpExecutableClaim(runtime);
      assert.throws(() => claim.bindOwnedWorker({ once() {} }), /CLAIM_INVALID/u, 'an event emitter is not Worker exit evidence');
      let acknowledged = false;
      const worker = new Worker(`const {parentPort}=require('node:worker_threads');parentPort.once('message',()=>{${mode === 'failed_exit' ? "parentPort.postMessage({kind:'closed'});process.exit(17)" : mode === 'no_ack' ? 'parentPort.close()' : "parentPort.postMessage({kind:'closed'});parentPort.close()"}});`, { eval: true });
      claim.bindOwnedWorker(worker, { confirmedEnd: () => acknowledged });
      assert.throws(() => claim.bindOwnedWorker(worker), /CLAIM_INVALID/u);
      worker.on('message', message => { acknowledged = message.kind === 'closed'; });
      const ended = once(worker, 'exit'); worker.postMessage('close');
      const [code] = await ended; assert.equal(code, mode === 'failed_exit' ? 17 : 0);
      assert.equal(acknowledged, mode !== 'no_ack');
      if (mode !== 'confirmed') ++retained;
      assert.equal(count(), retained, 'release requires acknowledgement and actual successful native Worker exit');
    }
    console.log('owner-claims: genuine Worker binding, one lifetime, actual successful exit plus acknowledgement pass');
  } finally { fixture.dispose(); }
}

async function stdioCase() {
  const { withStdioClient, unresolvedArguments } = await import('./helpers.js');
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: ['mcp-diagnostic-runtime-reliability-20261027-01'] });
  const candidateSource = mkdtempSync(join(tmpdir(), 'agdf-owner-replacement-source-'));
  cpSync(pluginRoot, candidateSource, { recursive: true });
  writeFileSync(join(candidateSource, 'mcp/server/NOTICE'), readFileSync(join(candidateSource, 'mcp/server/NOTICE'), 'utf8') + '\nSynthetic owner-thread replacement candidate.\n');
  const candidate = ensurePluginMcpRuntime({ pluginRoot: candidateSource, dataRoot: fixture.args.at(-1), exec: offlineNpm });
  assert.notEqual(candidate.root, fixture.root, 'replacement uses a genuinely different immutable publication');
  const claimCount = () => [fixture.root, candidate.root].reduce((n, root) => { try { return n + readdirSync(join(root, '.agdf-executable-claims')).length; } catch (e) { if (e.code === 'ENOENT') return n; throw e; } }, 0);
  try {
    for (const modern of [false, true]) {
      await withStdioClient({ ...fixture, modern }, async client => {
        const tools = await client.listTools(); assert.equal(tools.tools.length, 9);
        const claims = readdirSync(join(fixture.root, '.agdf-executable-claims'));
        assert.equal(claims.length, 2, 'actual owned facade and generation retain independent claims');
        const result = await client.callTool({ name: 'agdf_dispatch', arguments: unresolvedArguments });
        assert.equal(result.structuredContent.outcome, 'target_unresolved');
        const inspection = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'runtime-generations', presentation_language: 'en', working_directory: fixture.governanceTarget, primary_target: fixture.governanceTarget, target_source: 'explicit_target', run_id: 'mcp-diagnostic-runtime-reliability-20261027-01', expected_revision_id: readFileSync(join(fixture.governanceTarget, '.agdf/control/runs/mcp-diagnostic-runtime-reliability-20261027-01/RUN_STATE.md'), 'utf8').match(/^- revision_id: (.+)$/mu)[1] } });
        assert.ok(inspection.structuredContent, JSON.stringify(inspection));
        assert.equal(inspection.structuredContent.report.occupancy, 1);
        assert.equal(inspection.structuredContent.report.generations[0].usable, true);
        const runId = 'mcp-diagnostic-runtime-reliability-20261027-01';
        const revision = readFileSync(join(fixture.governanceTarget, `.agdf/control/runs/${runId}/RUN_STATE.md`), 'utf8').match(/^- revision_id: (.+)$/mu)[1];
        const path = `.agdf/control/artefacts/${runId}/OWNER_CANDIDATE.json`;
        writeFileSync(join(fixture.governanceTarget, path), JSON.stringify(publicationSelector(candidate)));
        const digest = artefactFileDigest(fixture.governanceTarget, path);
        const envelope = { schema_version: '1', presentation_language: 'en', working_directory: fixture.governanceTarget,
          primary_target: fixture.governanceTarget, target_source: 'explicit_target', target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id,
          run_id: runId, expected_revision_id: revision, assurance: 'cooperative_local' };
        for (let index = 0; index < 3; ++index) {
          const replacement = await client.callTool({ name: 'agdf_record', arguments: { ...envelope, operation_id: randomUUID(),
            command: { kind: 'runtime_generation.replace', payload: { candidate: { path, digest }, confirmation: `Replace owned runtime: ${digest}` } } } });
          assert.equal(replacement.structuredContent?.outcome, 'accepted', JSON.stringify(replacement));
          assert.equal(replacement.structuredContent.family_result?.effect?.generation_id ?? replacement.structuredContent.effect?.generation_id, index + 2);
          const status = replacement.structuredContent.family_result.current;
          assert.ok(status.occupancy <= 3, 'counted capacity includes actual closing Workers');
          assert.equal(status.generations.find(row => row.generation_id === status.current_generation).publication_id, candidate.publication_id);
        }

      });
      const deadline = performance.now() + 5000;
      while (claimCount() && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 25));
      assert.equal(claimCount(), 0, 'acknowledgement and successful actual Worker exit release claims');
    }
    console.log('owner-threads: both actual STDIO protocols and independent claim teardown pass');
  } catch (error) { fixture.onFailure?.(); throw error; }
  finally { fixture.dispose(); rmSync(candidateSource, { recursive: true, force: true }); }
}

async function faultsCase() {
  const { withStdioClient, unresolvedArguments } = await import('./helpers.js');

  // Test-only, fully rehashed candidate: pause under an actual canonical write
  // lock and exit one genuine Worker. No production flags or native fixture edits.
  for (const role of ['facade', 'generation']) {
    const work = realpathSync(mkdtempSync(join(tmpdir(), `agdf-owner-${role}-fault-`)));
    const candidate = join(work, 'plugin'), lockWitness = join(work, 'lock.json'), exitWitness = join(work, 'exit.json'), disarmed = join(work, 'disarmed');
    cpSync(pluginRoot, candidate, { recursive: true });
    const lockSource = join(candidate, 'runtime/create-agdf/runtime/core/lib/owned-file-lock.js');
    let source = readFileSync(lockSource, 'utf8');
    const anchor = '    checkpoint("lock_acquired");'; assert.ok(source.includes(anchor));
    source = source.replace(anchor, `${anchor}\n    if (lockPath.includes('.create-') && !existsSync(${JSON.stringify(disarmed)})) {\n      writeFileSync(${JSON.stringify(lockWitness)}, JSON.stringify({ lock_path: lockPath, token: owner.token, pid: process.pid }));\n      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);\n    }`);
    writeFileSync(lockSource, source);
    const entry = role === 'facade' ? join(candidate, 'runtime/create-agdf/lib/mcp-lifecycle/facade-thread-entry.js') : join(candidate, 'mcp/server/src/generation-thread-entry.js');
    writeFileSync(entry, `import { existsSync as faultExists } from 'node:fs';\nconst faultTimer = setInterval(() => { if (faultExists(${JSON.stringify(lockWitness)}) && !faultExists(${JSON.stringify(disarmed)})) process.exit(17); }, 5); faultTimer.unref();\n` + readFileSync(entry, 'utf8'));
    const owner = join(candidate, 'runtime/create-agdf/lib/mcp-lifecycle/thread-owner.js');
    source = readFileSync(owner, 'utf8');
    const exitAnchor = role === 'facade' ? "facade.once('exit', code => {" : "worker.once('exit', code => {";
    assert.ok(source.includes(exitAnchor));
    source = `import { writeFileSync as faultWrite } from 'node:fs';\n` + source.replace(exitAnchor,
      `${exitAnchor}\n      faultWrite(${JSON.stringify(exitWitness)}, JSON.stringify({ role: ${JSON.stringify(role)}, code, observed_by: 'actual-owner-worker-exit-event' }));`);
    writeFileSync(owner, source);
    const runtimeManifest = join(candidate, 'runtime/runtime-manifest.json');
    const metadata = JSON.parse(readFileSync(runtimeManifest, 'utf8')); metadata.digest = digestDirectory(join(candidate, 'runtime/create-agdf'));
    writeFileSync(runtimeManifest, JSON.stringify(metadata, null, 2) + '\n');
    const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: candidate, controlRuns: [] });
    const id = randomUUID();
    const original = { schema_version: '1', presentation_language: 'en', working_directory: fixture.governanceTarget,
      primary_target: fixture.governanceTarget, target_source: 'explicit_target',
      target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id,
      assurance: 'cooperative_local', operation_id: id, command: { kind: 'run.create', payload: { title: 'Actual owner fault creation' } } };
    let result;
    try {
      await withStdioClient(fixture, async client => {
        await client.listTools();
        const reply = await client.callTool({ name: 'agdf_run', arguments: original });
        result = reply.structuredContent;
      }).catch(error => { if (role !== 'facade') throw error; console.log(JSON.stringify({ role, transport_failure: error.message })); });
      const deadline = performance.now() + 5000;
      const runFile = join(fixture.governanceTarget, '.agdf/control/runs', `run-${id}`, 'RUN_STATE.md');
      const expectedClaims = role === 'facade' ? 1 : 2;
      while (performance.now() < deadline && (!existsSync(exitWitness)
        || readdirSync(join(fixture.root, '.agdf-executable-claims')).length !== expectedClaims
        || role === 'facade' && !existsSync(runFile))) await new Promise(resolve => setTimeout(resolve, 25));
      assert.ok(existsSync(lockWitness), 'fault is triggered after actual lock acquisition: ' + JSON.stringify(result));
      assert.deepEqual(JSON.parse(readFileSync(exitWitness, 'utf8')), { role, code: 17, observed_by: 'actual-owner-worker-exit-event' });
      assert.equal(readdirSync(join(fixture.root, '.agdf-executable-claims')).length, expectedClaims);
      const lock = JSON.parse(readFileSync(lockWitness, 'utf8'));
      if (role === 'facade') {
        const state = readFileSync(runFile, 'utf8');
        assert.equal(runSealState(fixture.governanceTarget, state).status, 'valid');
        const receipts = readRunOperations(state).receipts.filter(receipt => receipt.operation_id === id);
        assert.equal(receipts.length, 1, 'original canonical write finishes once, without replay');
        assert.equal(receipts[0].kind, 'run.create');
        assert.equal(existsSync(lock.lock_path), false, 'surviving generation owns and releases its completed write lock');
        // Disarm only this synthetic fault after its actual exit/effect proof.
        // Recover through a fresh actual MCP connection with the ORIGINAL UUID,
        // observe the durable receipt, then deliberately verify safe replay.
        writeFileSync(disarmed, 'synthetic fault observed');
        await withStdioClient(fixture, async client => {
          const observed = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'operation-status', module: id,
            presentation_language: 'en', working_directory: fixture.governanceTarget, primary_target: fixture.governanceTarget, target_source: 'explicit_target' } });
          assert.equal(observed.structuredContent?.report?.status, 'recorded', JSON.stringify(observed));
          assert.equal(observed.structuredContent.report.receipt.operation_id, id);
          const replay = await client.callTool({ name: 'agdf_run', arguments: original });
          assert.equal(replay.structuredContent?.outcome, 'already_applied', JSON.stringify(replay));
        });
        assert.equal(readRunOperations(readFileSync(runFile, 'utf8')).receipts.filter(receipt => receipt.operation_id === id).length, 1);

      } else {
        assert.ok(existsSync(lock.lock_path), 'generation death never clears a shared-PID nested-worker lock');
        assert.equal(JSON.parse(readFileSync(lock.lock_path, 'utf8')).token, lock.token);
        assert.equal(existsSync(runFile), false, 'no success-shaped creation after interrupted actual lock');
        assert.ok(!result || !['accepted', 'already_applied'].includes(result.outcome));
      }
      console.log(JSON.stringify({ test: 'owner-fault', role, original_operation_id: id, retained_claims: expectedClaims,
        actual_exit: 17, unique_effect: role === 'facade', protected_lock: role === 'generation', native_qualified: false }));
    } finally {
      fixture.dispose(); rmSync(work, { recursive: true, force: true });
    }
  }
}

async function boundaryCase() {
  const { withStdioClient } = await import('./helpers.js');
  const source = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-owner-boundary-source-')));
  cpSync(pluginRoot, source, { recursive: true });
  const entry = join(source, 'runtime/create-agdf/lib/mcp-lifecycle/facade-thread-entry.js');
  const code = readFileSync(entry, 'utf8'), anchor = 'const client = createOwnerClient(parentPort, workerData.binding);';
  assert.ok(code.includes(anchor));
  const injection = `
    const boundary = { schema_version: '1', token: workerData.binding.token, connection_epoch: workerData.binding.connection_epoch,
      request_id: boundaryId(), kind: 'open', generation_epoch: boundaryId(), generation_id: 1,
      publication_id: workerData.input.runtime.publication_id, payload: {} };
    for (const bad of [ { ...boundary, extra: true }, { ...boundary, token: boundaryId() },
      { ...boundary, connection_epoch: boundaryId() }, { ...boundary, request_id: 'unknown' },
      { ...boundary, publication_id: '../foreign' }, { ...boundary, generation_id: 0 },
      { ...boundary, kind: 'unknown' }, { ...boundary, publication_id: 'f'.repeat(64) } ]) parentPort.postMessage(JSON.stringify(bad));
    parentPort.postMessage(new Map([['not', 'json']]));
    parentPort.postMessage('{"non_json":NaN}');
    parentPort.postMessage(' '.repeat(66049));
  `;
  writeFileSync(entry, "import {randomUUID as boundaryId} from 'node:crypto';\n" + code.replace(anchor, anchor + injection));
  const manifestPath = join(source, 'runtime/runtime-manifest.json'), metadata = JSON.parse(readFileSync(manifestPath, 'utf8'));
  metadata.digest = digestDirectory(join(source, 'runtime/create-agdf')); writeFileSync(manifestPath, JSON.stringify(metadata));
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: source, controlRuns: [] });
  try {
    await withStdioClient(fixture, async client => {
      assert.equal((await client.listTools()).tools.length, 9, 'invalid real owner-channel input cannot poison valid SDK admission');
      assert.equal(readdirSync(join(fixture.root, '.agdf-executable-claims')).length, 2, 'no extra generation can be spawned by rejected real Worker frames');
      assert.deepEqual(readdirSync(join(fixture.governanceTarget, '.agdf/control/runs')), [], 'rejected owner frames have no canonical Run effect');
    });
    console.log('owner-boundary: real facade Worker rejects stale/unknown/extra/non-JSON/oversized frames before extra execution');
  } finally { fixture.dispose(); rmSync(source, { recursive: true, force: true }); }
}

async function pressureCase() {
  const { spawn } = await import('node:child_process');
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
  let child;
  try {
    await new Promise((resolve, reject) => {
      let pending = '', stderr = '', paused = false;
      const replies = new Set();
      child = spawn(fixture.command, fixture.args, { stdio: ['pipe', 'pipe', 'pipe'] });
      const timer = setTimeout(() => { child.stdin.end(); child.kill(); reject(Error('owner_pressure_deadline:' + stderr)); }, 10000);
      const send = message => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');
      child.stderr.on('data', value => { stderr += value; }); child.stdin.on('error', () => {});
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', (code, signal) => {
        clearTimeout(timer);
        try { assert.equal(code, 0, stderr); assert.equal(signal, null); assert.equal(stderr, ''); assert.equal(replies.size, 17); resolve(); } catch (error) { reject(error); }
      });
      child.stdout.on('data', value => {
        pending += value;
        let at;
        while ((at = pending.indexOf('\n')) >= 0) {
          const line = pending.slice(0, at); pending = pending.slice(at + 1);
          let reply; try { reply = JSON.parse(line); } catch (error) { reject(error); return; }
          if (reply.id === 1) {
            assert.ok(reply.result); send({ method: 'notifications/initialized' }); send({ id: 2, method: 'tools/list', params: {} });
          } else if (reply.id >= 2 && reply.id <= 18) {
            assert.ok(reply.result?.tools?.some(tool => tool.name === 'agdf_dispatch'));
            assert.equal(replies.has(reply.id), false); replies.add(reply.id);
            if (reply.id === 2 && !paused) {
              paused = true; child.stdout.pause();
              for (let id = 3; id <= 18; ++id) send({ id, method: 'tools/list', params: {} });
              // Deliberate slow reader, solely a pressure test, never a latency sample.
              setTimeout(() => child.stdout.resume(), 100);
            }
            if (replies.size === 17) child.stdin.end();
          }
        }
      });
      send({ id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'owner-pressure-fixture', version: '1' } } });
    });
    console.log('owner-pressure: real owned STDIO survives a paused reader with complete unique MCP replies and acknowledged exit');
  } finally { child?.stdin.end(); fixture.dispose(); }
}

async function deadlineCase() {
  const { withStdioClient } = await import('./helpers.js');
  const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-owner-late-proof-'))), source = join(work, 'plugin');
  const lock = join(work, 'locked.json'), release = join(work, 'release'), completed = join(work, 'completed.json'), id = randomUUID();
  cpSync(pluginRoot, source, { recursive: true });
  const lockSource = join(source, 'runtime/create-agdf/runtime/core/lib/owned-file-lock.js');
  let code = readFileSync(lockSource, 'utf8'), anchor = '    checkpoint("lock_acquired");';
  assert.ok(code.includes(anchor));
  code = code.replace(anchor, `${anchor}\n    if (lockPath.includes('.create-')) {\n      writeFileSync(${JSON.stringify(lock)}, JSON.stringify({lock_path:lockPath,token:owner.token}));\n      const until=Date.now()+5000;\n      while(!existsSync(${JSON.stringify(release)})){if(Date.now()>until)throw Error('synthetic_gate_not_released');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}\n    }`);
  writeFileSync(lockSource, code);
  const owner = join(source, 'runtime/create-agdf/lib/mcp-lifecycle/thread-owner.js');
  code = readFileSync(owner, 'utf8');
  const deadline = "}, message.kind === 'shutdown' ? L.close : L.qualify);";
  assert.ok(code.includes(deadline));
  code = code.replace(deadline, "}, message.kind === 'invoke' && message.original_operation_id ? 750 : message.kind === 'shutdown' ? L.close : L.qualify);");
  const proof = '    release(row, reply.request_id);'; assert.ok(code.includes(proof));
  code = "import {writeFileSync as proofWrite} from 'node:fs';\n" + code.replace(proof,
    `${proof}\n    if(reply.kind==='result'&&reply.original_operation_id===${JSON.stringify(id)}&&reply.payload?.outcome==='accepted')proofWrite(${JSON.stringify(completed)},JSON.stringify({original_operation_id:reply.original_operation_id,outcome:reply.payload.outcome}));`);
  writeFileSync(owner, code);
  const manifest = join(source, 'runtime/runtime-manifest.json'), metadata = JSON.parse(readFileSync(manifest, 'utf8'));
  metadata.digest = digestDirectory(join(source, 'runtime/create-agdf')); writeFileSync(manifest, JSON.stringify(metadata));
  const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: source, controlRuns: [] });
  const claims = () => readdirSync(join(fixture.root, '.agdf-executable-claims')).length;
  const waitFor = async predicate => { const until = performance.now() + 5000; while (!predicate() && performance.now() < until) await new Promise(resolve => setTimeout(resolve, 10)); assert.ok(predicate(), 'actual fixture phase did not complete'); };
  try {
    await withStdioClient(fixture, async client => {
      const args = { schema_version: '1', presentation_language: 'en', working_directory: fixture.governanceTarget,
        primary_target: fixture.governanceTarget, target_source: 'explicit_target', target_id: resolveControlCommandTarget(fixture.governanceTarget).target_id,
        assurance: 'cooperative_local', operation_id: id, command: { kind: 'run.create', payload: { title: 'Late actual write proof' } } };
      const unknown = await client.callTool({ name: 'agdf_run', arguments: args });
      assert.equal(unknown.structuredContent?.outcome, 'effect_unknown', JSON.stringify(unknown));
      await waitFor(() => existsSync(lock));
      assert.equal(existsSync(completed), false); assert.equal(claims(), 2, 'deadline alone cannot release either genuine lifetime');
      assert.ok(existsSync(JSON.parse(readFileSync(lock, 'utf8')).lock_path));
      writeFileSync(release, 'finish the original synthetic write');
      await waitFor(() => existsSync(completed));
      assert.equal(JSON.parse(readFileSync(completed, 'utf8')).original_operation_id, id);
      const observed = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'operation-status', module: id,
        presentation_language: 'en', working_directory: fixture.governanceTarget, primary_target: fixture.governanceTarget, target_source: 'explicit_target' } });
      assert.equal(observed.structuredContent?.report?.status, 'recorded', JSON.stringify(observed));
      assert.equal(observed.structuredContent.report.receipt.operation_id, id);
    });
    await waitFor(() => claims() === 0);
    console.log('owner-deadline: genuine unresolved write stays protected, validated late reply/original receipt and actual exits permit retirement');
  } catch (error) { fixture.onFailure?.(); throw error; }
  finally { writeFileSync(release, 'release owned synthetic gate'); fixture.dispose(); rmSync(work, { recursive: true, force: true }); }
}

const cases = new Map([['protocol', protocolCase], ['claims', claimsCase], ['stdio', stdioCase], ['faults', faultsCase], ['boundary', boundaryCase], ['pressure', pressureCase], ['deadline', deadlineCase]]);
const selectors = process.argv.slice(2);
assert.ok(selectors.length === 0 || selectors.length === 2 && selectors[0] === '--case' && cases.has(selectors[1]), 'invalid focused owner-thread selector');
for (const [name, run] of cases) if (selectors.length === 0 || selectors[1] === name) await run();
