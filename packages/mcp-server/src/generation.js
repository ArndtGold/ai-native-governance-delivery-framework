import { fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { generationMessage, validGenerationMessage, generationManifest, manifestDigest, GENERATION_LIMITS as L } from './generation-protocol.js';
import { loadCockpitResource } from './cockpit-resource.js';
import { DispatchExecutionError } from './worker.js';

// One live facade, three directly owned children, no process registry or PID
// discovery. Capacity includes startup and unconfirmed cleanup, not just current.
export async function createOwnedGenerationFacade({ runtime, publisher, createControlRuntime, surface, cockpitDir,
  Fork = fork, qualifyMs = L.qualify, closeMs = L.close, invokeMs = L.qualify, onEvent = () => {} } = {}) {
  if (![qualifyMs, closeMs, invokeMs].every(value => Number.isSafeInteger(value) && value > 0)
    || qualifyMs > L.qualify || closeMs > L.close || invokeMs > L.qualify) throw Error('generation_deadline_invalid');
  const epoch = randomUUID(), slots = new Map(), routes = new Map(), presentations = new Map(), operations = new Map(), receipts = new Map();
  let current, nextGeneration = 0, replacing = false, closed = false, actualContext = {}, nativeRequired = false;
  const uiDigest = runtime.ui ? loadCockpitResource(runtime.ui).digest : undefined;
  const expected = manifestDigest(generationManifest(runtime, uiDigest, publisher.initial.sdkDigest));
  const event = (row, kind, reason) => onEvent({ owner_epoch: epoch, generation_id: row?.id ?? null, kind, reason: reason ?? null, occupancy: slots.size });
  const failure = (reason, extra = {}) => ({ outcome: 'rejected', reason, authorizes: false, ...extra });
  function status() {
    return { available: true, owner_epoch: epoch, maximum: L.slots, occupancy: slots.size, current_generation: current?.id ?? null,
      candidate_active: replacing, generations: [...slots.values()].map(row => ({ generation_id: row.id,
        publication_id: row.package.publication_id, state: row.state, active_requests: row.inflight,
        uncertain_operations: row.unknown.size, views: row.observed?.views ?? null,
        confirmed_exit: row.exited, usable: row === current && row.state === 'current' && !row.exited })), authorizes: false };
  }
  function request(row, kind, payload, context = {}, original = null, timeout = qualifyMs) {
    if (row.exited || !row.child?.connected) return Promise.reject(new DispatchExecutionError('generation_unavailable', 'not_dispatched'));
    const id = randomUUID(), message = generationMessage(epoch, row.id, kind, payload, context, original, id);
    if (!validGenerationMessage(message, { epoch, generation: row.id })) return Promise.reject(new DispatchExecutionError('generation_input_limit', 'not_dispatched'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { row.pending.delete(id); reject(new DispatchExecutionError('generation_response_unknown')); }, timeout);
      row.pending.set(id, { kind, original, resolve, reject, timer });
      row.child.send(message, error => { if (error) { clearTimeout(timer); row.pending.delete(id); reject(new DispatchExecutionError('generation_connection_lost')); } });
    });
  }
  async function observe(row) {
    try { const reply = await request(row, 'session_inspect', {}); row.observed = reply.payload; return row.observed; }
    catch { row.state = 'close_unconfirmed'; return null; }
  }
  async function retire(row, teardown = false) {
    if (row === current || row.inflight || row.unknown.size || row.state === 'closing' || row.state === 'close_unconfirmed') return false;
    const work = await observe(row);
    if (!work || !teardown && work.views || work.inflight || work.executor || work.uncertain) return false;
    row.state = 'closing'; event(row, 'orderly_close');
    let exitTimer;
    const ended = new Promise(resolve => {
      if (row.exited) { resolve(false); return; }
      row.end = resolve; exitTimer = setTimeout(() => { row.state = 'close_unconfirmed'; event(row, 'close_unconfirmed'); resolve(false); }, closeMs);
    });
    try { const ack = await request(row, 'shutdown', {}, {}, null, closeMs);
      row.closeAck = ack.kind === 'closed' && !ack.payload.views && !ack.payload.inflight && !ack.payload.executor && !ack.payload.uncertain;
    } catch { row.state = 'close_unconfirmed'; event(row, 'close_unconfirmed'); }
    const confirmed = await ended; clearTimeout(exitTimer); return confirmed;
  }
  async function reserve(packageInfo, context) {
    if (slots.size >= L.slots) {
      const candidates = [...slots.values()].filter(row => row !== current && !row.inflight && !row.unknown.size
        && !['starting', 'qualifying', 'closing', 'close_unconfirmed'].includes(row.state)).sort((a, b) => a.id - b.id);
      for (const row of candidates) { if (await retire(row)) break; }
    }
    if (slots.size >= L.slots) throw Error('generation_capacity_protected');
    const row = { id: ++nextGeneration, package: packageInfo, state: 'starting', pending: new Map(),
      unknown: new Set(), inflight: 0, exited: false, closeAck: false, observed: null };
    slots.set(row.id, row); event(row, 'reserved'); // Reservation precedes acquisition/load/spawn.
    try {
      const claim = publisher.acquire(packageInfo, { ownerEpoch: epoch, generation: row.id });
      row.child = Fork(join(packageInfo.packageRoot, 'src/generation-entry.js'), [epoch, String(row.id)],
        { stdio: ['ignore', 'ignore', 'ignore', 'ipc'], serialization: 'json', execArgv: [] });
      claim.bindOwnedChild(row.child, { confirmedEnd: () => row.closeAck && !row.inflight && !row.unknown.size });
      row.child.on('message', reply => {
        if (!validGenerationMessage(reply, { epoch, generation: row.id, reply: true })) { event(row, 'invalid_reply'); return; }
        const pending = row.pending.get(reply.request_id);
        if (!pending || pending.original !== reply.original_operation_id) { event(row, 'unknown_reply'); return; }
        const expectedKind = { qualify: 'qualified', invoke: 'result', session_inspect: 'status', shutdown: 'closed' }[pending.kind];
        if (reply.kind !== expectedKind && reply.kind !== 'failure') return;
        clearTimeout(pending.timer); row.pending.delete(reply.request_id);
        if (reply.kind === 'failure') pending.reject(new DispatchExecutionError(reply.payload.reason));
        else {
          if (reply.kind === 'closed') row.closeAck = !reply.payload.views && !reply.payload.inflight && !reply.payload.executor && !reply.payload.uncertain;
          pending.resolve(reply);
        }
      });
      row.child.once('exit', () => {
        row.exited = true;
        for (const pending of row.pending.values()) { clearTimeout(pending.timer); pending.reject(new DispatchExecutionError('generation_connection_lost')); }
        row.pending.clear();
        if (row.closeAck && !row.inflight && !row.unknown.size) { slots.delete(row.id); row.state = 'closed'; event(row, 'confirmed_exit'); row.end?.(true); }
        else { row.state = 'close_unconfirmed'; event(row, 'unexpected_exit'); row.end?.(false); }
      });
      row.child.once('error', () => { row.state = 'close_unconfirmed'; event(row, 'spawn_failed'); });
      row.state = 'qualifying'; event(row, 'qualifying');
      const qualified = (await request(row, 'qualify', { surface, commandGroups: [...(runtime.trustedContext.commandGroups ?? [])],
        ...(cockpitDir ? { cockpitDir } : {}) }, context)).payload;
      if (manifestDigest(qualified.manifest) !== expected || qualified.producer.server_digest !== packageInfo.digest
        || qualified.producer.dispatcher_digest !== packageInfo.dispatcherDigest || qualified.producer.sdk_digest !== packageInfo.sdkDigest
        || nativeRequired && !qualified.support.app_mediation) throw Error('generation_manifest_incompatible');
      row.state = 'qualified'; event(row, 'qualified'); return row;
    } catch (error) {
      event(row, 'qualification_failed', error.message);
      if (!row.child) { slots.delete(row.id); event(row, 'not_spawned'); }
      else { row.state = 'draining'; await retire(row); }
      throw error;
    }
  }
  const control = {
    status,
    async refresh() { await Promise.all([...slots.values()].filter(row => !row.exited).map(observe)); return status(); },
    inspect(id, input) { const record = receipts.get(id);
      if (record && (record.input.run_id !== input.run_id || record.input.primary_target !== input.primary_target
        || record.input.expected_revision_id !== input.expected_revision_id)) return { status: 'unknown', reason: 'connection_control_binding_invalid', authorizes: false };
      return record ? { status: record.result ? 'recorded' : 'pending',
      request_digest: record.digest, result: record.result, current: status(), authorizes: false }
      : { status: 'unknown', reason: 'connection_control_record_unavailable', current: status(), authorizes: false }; },
    async replace({ input, candidate, requestDigest, revalidate }) {
      const prior = receipts.get(input.operation_id);
      if (prior) return prior.digest !== requestDigest ? failure('operation_payload_conflict')
        : prior.result ? { ...prior.result, outcome: prior.result.outcome === 'accepted' ? 'already_applied' : prior.result.outcome, historical_effect: true, current: status() }
        : { outcome: 'effect_unknown', reason: 'generation_replacement_pending', current: status(), authorizes: false };
      if (receipts.size >= L.receipts) return failure('connection_control_capacity');
      if (closed || replacing) return failure(closed ? 'connection_closed' : 'generation_replacement_busy');
      const record = { digest: requestDigest, input, result: null }; receipts.set(input.operation_id, record); replacing = true;
      let candidateRow;
      try {
        revalidate(); const packageInfo = publisher.resolve(candidate);
        candidateRow = await reserve(packageInfo, actualContext); revalidate();
        const previous = current; current = candidateRow; current.state = 'current';
        if (previous) previous.state = previous.exited ? 'close_unconfirmed' : 'draining';
        event(current, 'admitted'); record.result = { outcome: 'accepted', reason: null, operation_id: input.operation_id,
          request_digest: requestDigest, effect: { runtime_replaced: true, generation_id: current.id }, current: status(), authorizes: false };
      } catch (error) {
        if (candidateRow && candidateRow !== current) { candidateRow.state = 'draining'; await retire(candidateRow); }
        record.result = failure(error.message, { operation_id: input.operation_id, current: status() });
      } finally { replacing = false; }
      record.result.current = status(); return record.result;
    },
  };
  const controlRuntime = createControlRuntime(control);
  function operationKey(input, id = input.operation_id) { return JSON.stringify([input.primary_target, input.run_id, id]); }
  async function invoke(name, args, host = {}, signal) {
    if (signal?.aborted) throw new DispatchExecutionError('dispatch_cancelled', 'not_dispatched');
    if (closed) throw new DispatchExecutionError('connection_closed', 'not_dispatched');
    actualContext = { client: host.client, uiSupported: host.uiSupported === true };
    if (args.operation_id && name === 'agdf_record' && args.command?.kind === 'runtime_generation.replace'
      && operations.has(operationKey(args))) throw new DispatchExecutionError('operation_payload_conflict', 'not_dispatched');
    if (args.operation_id && args.command?.kind !== 'runtime_generation.replace' && receipts.has(args.operation_id))
      throw new DispatchExecutionError('operation_payload_conflict', 'not_dispatched');
    if (name === 'agdf_record' && args.command?.kind === 'runtime_generation.replace'
      || name === 'agdf_inspect' && args.operation === 'runtime-generations') {
      const result = await controlRuntime.tool(name).execute(controlRuntime.tool(name).parse(args));
      return name === 'agdf_inspect' && result.report?.available ? { ...result, report: await control.refresh() } : result;
    }
    if (name === 'agdf_inspect' && args.operation === 'operation-status' && receipts.has(args.module)) {
      const validated = await controlRuntime.tool(name).execute(controlRuntime.tool(name).parse(args));
      if (validated.report?.status === 'unknown' || validated.report?.status === 'absent') return { ...validated, report: control.inspect(args.module, args) };
      return validated;
    }
    const knownSession = args.session_id && routes.get(args.session_id);
    if (args.session_id && !knownSession) throw new DispatchExecutionError('session_expired', 'not_dispatched');
    const id = name === 'agdf_inspect' && args.operation === 'operation-status' ? args.module : args.operation_id;
    const key = id && operationKey(args, id), original = key && operations.get(key);
    const presentationId = args.command?.payload?.presentation_id ?? args.presentation_id;
    const presentationOwner = presentationId && presentations.get(operationKey(args, presentationId));
    const row = knownSession ?? original ?? presentationOwner ?? current;
    if (!row || row.exited) throw new DispatchExecutionError('generation_unavailable', 'not_dispatched');
    if (args.operation_id && !original) {
      if (operations.size >= L.routes) throw new DispatchExecutionError('generation_route_capacity', 'not_dispatched');
      operations.set(key, row);
    }
    ++row.inflight; event(row, 'invoke', name);
    try {
      const result = (await request(row, 'invoke', { name, arguments: args }, actualContext, args.operation_id ?? null, invokeMs)).payload;
      if (args.operation_id && result.outcome === 'effect_unknown') row.unknown.add(key);
      if (name === 'agdf_inspect' && args.operation === 'operation-status' && result.report?.status === 'recorded'
        && result.report.receipt?.operation_id === args.module) row.unknown.delete(key);
      if (result.app_capability === 'available') nativeRequired = true;
      if (result.family_result?.presentation_id && ['accepted', 'already_applied'].includes(result.outcome)) {
        const presentationKey = operationKey(args, result.family_result.presentation_id);
        if (!presentations.has(presentationKey) && presentations.size >= L.routes) throw Error('generation_route_capacity');
        presentations.set(presentationKey, row);
      }
      for (const meta of [result._meta?.agdf_decision, result._meta?.agdf_cockpit]) {
        for (const selector of [meta?.session_id, meta?.read_session_id]) {
          if (selector) { if (routes.size >= L.routes) throw Error('generation_route_capacity'); routes.set(selector, row); }
        }
      }
      return result;
    } catch (error) { if (args.operation_id && error.dispatch !== 'not_dispatched') row.unknown.add(key); throw error; }
    finally { --row.inflight; if (closed && !row.inflight && !row.unknown.size) void retire(row, true); }
  }
  current = await reserve(publisher.initial, {}); current.state = 'current'; event(current, 'admitted');
  // Validate the public request here, but transport that exact public shape.
  // Core parse results contain trusted runtime context and are executable inputs,
  // not wire requests; parsing them again in a child both breaks the contract
  // and copies the entire locale registry into a bounded private message.
  const tools = runtime.tools.map(tool => ({ ...tool, parentOwned: true,
    parse: input => { tool.parse(input); return input; }, execute: input => invoke(tool.name, input) }));
  // The server supplies actual initialize/request context only at this seam.
  for (const tool of tools) tool.execute = (input, signal, host) => invoke(tool.name, input, host, signal);
  return Object.freeze({ ...runtime, tools, tool: name => tools.find(tool => tool.name === name),
    postprocessToolResult: undefined, inspectOwnership: status, runtimeControl: control,
    async close() {
      if (closed) return; closed = true;
      const previous = current; current = null; if (previous && !previous.exited) previous.state = 'draining';
      await Promise.allSettled([...slots.values()].map(row => retire(row, true)));
    },
  });
}
