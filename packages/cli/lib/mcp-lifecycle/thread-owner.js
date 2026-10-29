import { Worker } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import { createMcpGenerationPublisher } from './package.js';
import { GENERATION_LIMITS as L, OWNER_LIMITS, generationMessage, validGenerationMessage,
  generationFailureReason, ownerFrame, encodeOwnerFrame, decodeOwnerFrame, publicationSelector } from '../mcp-owner-protocol.js';

// The detached retention owner alone owns actual Worker objects and claims.
// It imports no SDK or domain factory. Protected slots survive uncertain exits.
export function superviseThreadMcpFacade({ runtime, surface, cockpitDir, cockpitMode, pluginRoot,
  env, claim, signals = process, deadlineNs } = {}) {
  const binding = { token: claim.token, connection_epoch: randomUUID(), publication_id: runtime.publication_id };
  const publicationDeadline = performance.now() + Math.max(0, Number(BigInt(deadlineNs) - process.hrtime.bigint()) / 1e6);
  const publisher = createMcpGenerationPublisher(runtime, { publicationDeadline });
  const rows = new Map(), seen = new Set();
  let generationEpoch, highestGeneration = 0;
  let facade, facadeExited = false, facadeAck = false, failed = false, pendingBytes = 0, pendingCount = 0;
  const post = (kind, payload, id, row) => {
    if (facadeExited) return;
    facade.postMessage(encodeOwnerFrame(ownerFrame(binding, kind, payload, id, row), binding, { reply: true }));
  };
  function release(row, id) {
    const entry = row.pending.get(id);
    if (entry) { row.pending.delete(id); pendingBytes -= entry.bytes; --pendingCount; clearTimeout(entry.timer); }
    return entry;
  }
  function transmit(row, message, { orphan = false, bytes = 0 } = {}) {
    if (!row.worker || row.exited || row.pending.has(message.request_id)
      || pendingCount >= OWNER_LIMITS.frames || pendingBytes + bytes > OWNER_LIMITS.bytes) throw Error('generation_request_capacity');
    const entry = { message, orphan, bytes };
    row.pending.set(message.request_id, entry); ++pendingCount; pendingBytes += bytes;
    // An expired call is protected, not removed/replayed. A late reply can still
    // settle ownership; until then its credit and slot remain occupied.
    entry.timer = setTimeout(() => {
      // The still-pending exact request protects the slot and claim. A later
      // validated matching reply can prove completion; timeout alone cannot.
      if (!orphan) post('failure', { reason: 'generation_response_unknown' }, message.request_id, row);
    }, message.kind === 'shutdown' ? L.close : L.qualify);
    row.worker.postMessage(JSON.stringify(message));
  }
  function drain(row) {
    if (!facadeExited || row.exited || row.draining || row.pending.size || row.uncertain) return;
    row.draining = true;
    try { transmit(row, generationMessage(row.epoch, row.generation, 'session_inspect', {}, {}, null, randomUUID()), { orphan: true }); }
    catch { row.uncertain = true; }
  }
  function receive(row, wire) {
    if (typeof wire !== 'string' || Buffer.byteLength(wire) > L.result) { row.uncertain = true; return; }
    let reply; try { reply = JSON.parse(wire); } catch { row.uncertain = true; return; }
    if (!validGenerationMessage(reply, { epoch: row.epoch, generation: row.generation, reply: true })) { row.uncertain = true; return; }
    const entry = row.pending.get(reply.request_id);
    const expected = { qualify: 'qualified', invoke: 'result', session_inspect: 'status', shutdown: 'closed' }[entry?.message.kind];
    if (!entry || reply.original_operation_id !== entry.message.original_operation_id
      || reply.kind !== expected && reply.kind !== 'failure') { row.uncertain = true; return; }
    release(row, reply.request_id);
    if (reply.kind === 'closed') row.closeAck = !reply.payload.views && !reply.payload.inflight && !reply.payload.executor && !reply.payload.uncertain;
    if (entry.message.original_operation_id && (reply.kind === 'failure' || reply.payload?.outcome === 'effect_unknown')) row.unknown.add(entry.message.original_operation_id);
    const args = entry.message.payload?.arguments;
    if (entry.message.payload?.name === 'agdf_inspect' && args?.operation === 'operation-status' && reply.payload?.report?.status === 'recorded'
      && (reply.payload.report.receipt?.operation_id ?? reply.payload.report.receipt?.operation?.operation_id) === args.module.split('/').at(-1)) row.unknown.delete(args.module.split('/').at(-1));
    if (entry.orphan) {
      if (reply.kind === 'status' && !reply.payload.inflight && !reply.payload.executor && !reply.payload.uncertain && !row.unknown.size) {
        try { transmit(row, generationMessage(row.epoch, row.generation, 'shutdown', {}, {}, null, randomUUID()), { orphan: true }); }
        catch { row.uncertain = true; }
      } else if (reply.kind !== 'closed') row.uncertain = true;
    } else {
      try { post('message', reply, reply.request_id, row); } catch { row.uncertain = true; }
      drain(row);
    }
  }
  function open(frame) {
    if (rows.size >= L.slots || rows.has(frame.generation_id) || !frame.generation_epoch
      || generationEpoch && frame.generation_epoch !== generationEpoch || frame.generation_id <= highestGeneration
      || highestGeneration === 0 && (frame.generation_id !== 1 || frame.publication_id !== binding.publication_id)
      || frame.payload?.publication_id !== frame.publication_id) throw Error('generation_capacity_protected');
    // Re-resolve the actual candidate every time, never reuse the initial image
    // across async boundaries or accept caller-selected paths.
    generationEpoch ??= frame.generation_epoch; highestGeneration = frame.generation_id;
    const initial = frame.generation_id === 1;
    const expected = publicationSelector(runtime);
    if (initial && (Object.keys(frame.payload).sort().join() !== Object.keys(expected).sort().join()
      || Object.keys(expected).some(key => frame.payload[key] !== expected[key]))) throw Error('runtime_candidate_manifest_invalid');
    // Initial identity is already bound, but never trusted across this async
    // boundary: acquire below repeats the full fresh inspection under lock.
    // Replacements additionally resolve through the existing publisher.
    const selected = initial ? runtime : publisher.resolve(frame.payload);
    if (selected.executionModel !== 'owner_threads_v1') throw Error('generation_manifest_incompatible');
    const row = { epoch: frame.generation_epoch, generation: frame.generation_id, publication_id: frame.publication_id,
      pending: new Map(), unknown: new Set(), uncertain: false, exited: false, closeAck: false };
    rows.set(row.generation, row);
    try {
      const owned = publisher.acquire(selected, { ownerEpoch: row.epoch, generation: row.generation, ...(row.generation === 1 ? { publicationDeadline } : {}) });
      row.claim = owned;
      const worker = new Worker(pathToFileURL(join(selected.packageRoot, 'src/generation-thread-entry.js')),
        { workerData: { epoch: row.epoch, generation: row.generation }, stdin: false, stdout: true, stderr: true, env: { ...env, AGDF_DISPATCH_PLUGIN_ROOT: pluginRoot }, execArgv: [] });
      row.worker = worker;
      // Domain output cannot contaminate the facade's public MCP STDOUT.
      worker.stdout.resume(); worker.stderr.pipe(process.stderr, { end: false });
      owned.bindOwnedWorker(worker, { confirmedEnd: () => row.closeAck && !row.pending.size && !row.unknown.size && !row.uncertain });
      worker.on('message', wire => receive(row, wire));
      worker.once('error', () => { row.uncertain = true; });
      worker.once('exit', code => {
        row.exited = true;
        for (const entry of row.pending.values()) clearTimeout(entry.timer);
        if (code === 0 && row.closeAck && !row.pending.size && !row.unknown.size && !row.uncertain) rows.delete(row.generation);
        else { row.uncertain = true; failed = true; }
        try { post('exit', { code }, randomUUID(), row); } catch { failed = true; }
      });
      post('opened', { opened: true }, frame.request_id, row);
    } catch (error) {
      if (!row.claim) rows.delete(row.generation);
      else { row.uncertain = true; failed = true; }
      throw error;
    }
  }
  return new Promise((resolve, reject) => {
    facade = new Worker(pathToFileURL(join(runtime.dispatcherRoot, 'lib/mcp-lifecycle/facade-thread-entry.js')),
      { workerData: { input: { runtime, surface, ...(cockpitDir ? { cockpitDir } : {}), ...(cockpitMode ? { cockpitMode } : {}),
        pluginRoot, token: claim.token, deadline_ns: deadlineNs }, binding }, env, stdin: true, stdout: true, stderr: true, execArgv: [] });
    claim.bindOwnedWorker(facade, { confirmedEnd: () => facadeAck && !failed && rows.size === 0 });
    // Native streams implement actual backpressure in both directions.
    facade.stdout.pipe(process.stdout, { end: false }); facade.stderr.pipe(process.stderr, { end: false }); process.stdin.pipe(facade.stdin);
    facade.stdin.on('error', () => {});
    const stop = () => { try { post('stop', {}, randomUUID()); } catch { failed = true; } };
    const detach = () => {
      signals.off('SIGTERM', stop); signals.off('SIGINT', stop); signals.off('disconnect', stop); process.stdin.unpipe(facade.stdin);
    };
    signals.on('SIGTERM', stop); signals.on('SIGINT', stop); signals.on('disconnect', stop);
    facade.on('message', wire => {
      let frame;
      try {
        frame = decodeOwnerFrame(wire, binding);
        if (seen.has(frame.request_id) || seen.size >= OWNER_LIMITS.history) throw Error('generation_request_capacity');
        seen.add(frame.request_id);
        if (frame.kind === 'closed' && frame.generation_id === null && frame.publication_id === binding.publication_id
          && Object.keys(frame.payload).join() === 'confirmed' && typeof frame.payload.confirmed === 'boolean') {
          facadeAck = frame.payload.confirmed;
          // A signalled client may keep public stdin open. After the facade's
          // own close acknowledgement, finish its real input stream so the
          // Worker can exit naturally and supply actual lifetime evidence.
          process.stdin.unpipe(facade.stdin); process.stdin.pause(); facade.stdin.end(); return;
        }
        if (frame.kind === 'open') { open(frame); return; }
        const row = rows.get(frame.generation_id);
        if (!row || row.epoch !== frame.generation_epoch || row.publication_id !== frame.publication_id
          || frame.kind !== 'send' || !validGenerationMessage(frame.payload, { epoch: row.epoch, generation: row.generation })
          || frame.request_id !== frame.payload.request_id) throw Error('generation_input_limit');
        transmit(row, frame.payload, { bytes: Buffer.byteLength(wire) });
      } catch (error) {
        if (frame) try { post('failure', { reason: generationFailureReason(error) }, frame.request_id,
          { epoch: frame.generation_epoch, generation: frame.generation_id, publication_id: frame.publication_id }); } catch { failed = true; }
      }
    });
    facade.once('error', () => { failed = true; });
    facade.once('exit', code => {
      facadeExited = true; detach();
      for (const row of rows.values()) drain(row);
      if (code === 0 && facadeAck && !failed && rows.size === 0) resolve({ closed: true, confirmed_exit: true });
      else reject(Error('AGDF_MCP_FACADE_CLOSE_UNCONFIRMED'));
    });
  });
}
