import { randomUUID } from 'node:crypto';
import { ReadWorkerPool } from '../control-read/cockpit-pool.js';
import { READ_LIMITS, ControlReadError } from '../control-read/snapshot.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { COCKPIT_LIMITS, parseCockpitArguments } from './cockpit-contract.js';

// One connection owns bounded independent read views. Retiring workers still occupy slots.
export function createCockpitSessionService(root, {
  poolFactory = () => new ReadWorkerPool(root, { limits: { total: COCKPIT_LIMITS.capture },
    maxOldGenerationSizeMb: COCKPIT_LIMITS.workerOldGeneration }), now = Date.now,
} = {}) {
  const target = { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  const sessions = new Map();
  let closed = false, renderGeneration = 0, publication = null;
  const failure = code => ({ schema_version: '1', target, snapshot_id: null, observed_as_of: null,
    source_digest: null, state: 'blocked', code, retryable: code !== 'session_expired', data: null, authorizes: false });
  const accepted = data => ({ ...failure(null), state: 'available', retryable: false, data });
  function losePublication(session) {
    if (publication?.session_id !== session.id) return;
    // A reservation which never returned a packet could not be published. All
    // other owner loss is quarantined; elapsed time never grants takeover.
    if (publication.phase === 'preparing') publication = null;
    else { publication.phase = 'uncertain'; publication.packet = null; }
  }
  function discardPacket(session) {
    if (publication?.session_id !== session.id) return;
    if (publication.phase === 'preparing') publication = null;
    else publication.packet = null;
  }
  function retire(session) {
    if (session.retirement) return session.retirement;
    session.retired = true; ++session.generation;
    losePublication(session);
    clearTimeout(session.timer); session.documents.clear(); session.rows.clear(); session.snapshot = null;
    session.retirement = Promise.resolve().then(() => session.pool.close()).then(() => {
      if (sessions.get(session.id) === session) sessions.delete(session.id);
    });
    // Failed cleanup retains the counted slot; never allocate past a worker still retiring.
    void session.retirement.catch(() => {});
    return session.retirement;
  }
  function schedule(session) {
    clearTimeout(session.timer);
    const remaining = Math.min(session.touched + COCKPIT_LIMITS.idle, session.created + COCKPIT_LIMITS.lifetime) - now();
    session.timer = setTimeout(() => { void retire(session); }, Math.max(0, remaining));
    session.timer.unref?.();
  }
  function active(id) {
    const session = sessions.get(id);
    if (closed || !session || session.retired) throw new ControlReadError('session_expired');
    if (now() - session.touched >= COCKPIT_LIMITS.idle || now() - session.created >= COCKPIT_LIMITS.lifetime) {
      void retire(session); throw new ControlReadError('session_expired');
    }
    return session;
  }
  function touch(session) { session.touched = now(); schedule(session); }
  return Object.freeze({
    failure,
    async render(input = {}) {
      input = parseCockpitArguments(input, true);
      if (closed) return failure('session_expired');
      for (const session of sessions.values()) {
        if (!session.retired && (now() - session.touched >= COCKPIT_LIMITS.idle
          || now() - session.created >= COCKPIT_LIMITS.lifetime)) void retire(session);
      }
      if (sessions.size >= COCKPIT_LIMITS.sessions) return failure('resource_limit');
      // No await between capacity check and ownership publication.
      const session = { id: randomUUID(), created: now(), touched: now(), pool: poolFactory(),
        documents: new Map(), rows: new Set(), snapshot: null, run_id: null, generation: 0, retired: false, retirement: null, timer: null,
        completion: null };
      sessions.set(session.id, session); schedule(session);
      return { schema_version: '1', authorizes: false, target,
        _meta: { agdf_cockpit: { session_id: session.id, target, render_generation: ++renderGeneration,
          ...(input.run_id ? { initial_run_id: input.run_id } : {}),
          idle_timeout_ms: COCKPIT_LIMITS.idle, lifetime_ms: COCKPIT_LIMITS.lifetime } } };
    },
    async read(input, signal) {
      let session, generation, reservation;
      try {
        input = parseCockpitArguments(input);
        session = active(input.session_id);
        generation = session.generation;
        if (input.operation === 'close') { await retire(session); return accepted({ closed: true }); }
        // These transitions belong solely to this connection, never the worker
        // or a mutable client-side current session.
        if (input.operation === 'complete_context_invalidation') {
          if (session.completion === input.invalidation_id) {
            touch(session); return accepted({ completed: true, invalidation_id: input.invalidation_id });
          }
          if (publication?.session_id !== session.id || publication.invalidation_id !== input.invalidation_id) return failure('resource_denied');
          session.completion = input.invalidation_id; publication = null;
          touch(session); return accepted({ completed: true, invalidation_id: input.invalidation_id });
        }
        if (input.operation === 'invalidate_context') {
          if (publication?.session_id !== session.id) {
            touch(session); return accepted({ invalidated: true, host_publication_required: false });
          }
          if (publication.phase === 'preparing') {
            publication = null; touch(session);
            return accepted({ invalidated: true, host_publication_required: false });
          }
          if (publication.phase === 'uncertain' && !publication.invalidation_id) return failure('context_cleanup_uncertain');
          if (!publication.invalidation_id) {
            publication.packet = null; publication.phase = 'invalidating'; publication.invalidation_id = randomUUID();
            publication.begin = session.pool.request({ operation: 'invalidate_context', input }, signal);
            // Retain the pending token even if the response is lost. The local
            // packet is already invalid and the owner remains exclusive.
            void publication.begin.catch(() => {});
          }
          const pending = publication;
          if (pending.begin) {
            const request = pending.begin;
            try { await request; } finally { if (pending.begin === request) pending.begin = null; }
          }
          if (active(session.id) !== session || publication !== pending) return failure('session_expired');
          touch(session);
          return accepted({ invalidated: true, host_publication_required: true, invalidation_id: pending.invalidation_id });
        }
        if (input.operation === 'snapshot') { discardPacket(session); ++session.generation; session.documents.clear(); session.snapshot = null; }
        else if (input.snapshot_id && session.snapshot !== input.snapshot_id) return failure('resource_denied');
        if (input.operation === 'backlog_titles' && input.row_ids.some(id => !session.rows.has(id))) return failure('resource_denied');
        if (['document', 'prepare_context'].includes(input.operation)
          && session.documents.get(input.resource_id) !== `${input.snapshot_id}:${input.run_id}`) return failure('resource_denied');
        if (input.operation === 'context' && input.run_id !== session.run_id) return failure('resource_denied');
        if (input.operation === 'prepare_context') {
          if (publication) return failure(publication.phase === 'uncertain' ? 'context_cleanup_uncertain' : 'busy');
          reservation = { session_id: session.id, phase: 'preparing', packet: null, invalidation_id: null, begin: null };
          publication = reservation;
        }
        if (input.operation === 'validate_context') {
          if (publication?.session_id !== session.id) return failure(publication ? 'resource_denied' : 'context_superseded');
          if (!publication.packet) return failure('context_superseded');
          if (publication.packet.context_id !== input.context_id || publication.packet.generation !== input.generation) return failure('resource_denied');
          if (publication.phase !== 'prepared') return failure('context_superseded');
        }
        const replacement = ['snapshot', 'backlog_titles', 'run', 'document', 'context'].includes(input.operation);
        if (['backlog_titles', 'run', 'document', 'context'].includes(input.operation)) {
          discardPacket(session); ++session.generation; session.documents.clear(); session.snapshot = null;
        }
        generation = session.generation;
        if (replacement) session.rows.clear();
        const result = await session.pool.request({ operation: input.operation, snapshot: input.snapshot_id,
          selector: ['run', 'context'].includes(input.operation) ? input.run_id : input.resource_id, input }, signal);
        if (active(session.id) !== session || generation !== session.generation) return failure('session_expired');
        const response = { ...result, authorizes: false };
        if (Buffer.byteLength(JSON.stringify(response), 'utf8') > READ_LIMITS.response) throw new ControlReadError('resource_limit');
        if (reservation) {
          if (publication !== reservation) return failure('context_superseded');
          if (result.state === 'available' && result.data?.packet) {
            reservation.phase = 'prepared'; reservation.packet = { context_id: result.data.packet.context_id, generation: result.data.packet.generation };
          } else publication = null;
        }
        if (!['resource_denied', 'context_superseded', 'busy', 'context_cleanup_uncertain'].includes(result.code)) touch(session);
        if (replacement && result.snapshot_id) session.snapshot = result.snapshot_id;
        if (replacement && result.data?.kind === 'backlog') for (const row of result.data.entries) session.rows.add(row.row_id);
        if (replacement) session.run_id = result.data?.run?.run_id ?? null;
        if (replacement && result.data?.run?.resources) for (const resource of result.data.run.resources) {
          session.documents.set(resource.resource_id, `${result.snapshot_id}:${result.data.run.run_id}`);
        }
        return response;
      } catch (error) {
        if (reservation && publication === reservation && reservation.phase === 'preparing') publication = null;
        const code = error instanceof ControlReadError || error.code === 'resource_denied' ? error.code : 'read_failed';
        if (session && ['timeout', 'read_failed'].includes(code)) losePublication(session);
        else if (session && code === 'source_changed') discardPacket(session);
        if (session && !session.retired && generation === session.generation
          && ['timeout', 'read_failed', 'source_changed'].includes(code)) {
          ++session.generation; session.documents.clear(); session.snapshot = null;
        }
        return failure(code);
      }
    },
    async close() {
      closed = true;
      await Promise.allSettled([...sessions.values()].map(retire));
      publication = null;
    },
  });
}
