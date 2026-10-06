import { randomUUID } from 'node:crypto';
import { ReadWorkerPool } from '../control-read/cockpit-pool.js';
import { READ_LIMITS, ControlReadError } from '../control-read/snapshot.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { COCKPIT_LIMITS, parseCockpitArguments } from './cockpit-contract.js';

// Ephemeral read ownership. No canonical writer, evaluator duplication or retained view store.
export function createCockpitSessionService(root, { poolFactory = () => new ReadWorkerPool(root), now = Date.now } = {}) {
  const target = { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  let current = null, renderGeneration = 0;
  const failure = code => ({ schema_version: '1', target, snapshot_id: null, observed_as_of: null,
    source_digest: null, state: 'blocked', code, retryable: code !== 'session_expired', data: null, authorizes: false });
  async function retire(session) {
    if (!session) return;
    if (current === session) current = null;
    clearTimeout(session.timer);
    session.documents.clear();
    await session.pool.close();
  }
  function schedule(session) {
    clearTimeout(session.timer);
    const remaining = Math.min(session.touched + COCKPIT_LIMITS.idle, session.created + COCKPIT_LIMITS.lifetime) - now();
    session.timer = setTimeout(() => { void retire(session); }, Math.max(0, remaining));
    session.timer.unref?.();
  }
  function active(id) {
    const session = current;
    if (!session || id !== session.id || now() - session.touched >= COCKPIT_LIMITS.idle
      || now() - session.created >= COCKPIT_LIMITS.lifetime) {
      if (session && id === session.id) void retire(session);
      throw new ControlReadError('session_expired');
    }
    session.touched = now(); schedule(session);
    return session;
  }
  return Object.freeze({
    failure,
    async render(input = {}) {
      input = parseCockpitArguments(input, true);
      const generation = ++renderGeneration;
      await retire(current);
      if (generation !== renderGeneration) return failure('session_expired');
      const session = { id: randomUUID(), created: now(), touched: now(), pool: poolFactory(), documents: new Map(), timer: null };
      current = session; schedule(session);
      return { schema_version: '1', authorizes: false, target,
        _meta: { agdf_cockpit: { session_id: session.id, target, render_generation: generation,
          ...(input.run_id ? { initial_run_id: input.run_id } : {}),
          idle_timeout_ms: COCKPIT_LIMITS.idle, lifetime_ms: COCKPIT_LIMITS.lifetime } } };
    },
    async read(input, signal) {
      let session;
      try {
        input = parseCockpitArguments(input);
        session = active(input.session_id);
        if (input.operation === 'close') { await retire(session); return { ...failure(null), state: 'available', retryable: false, data: { closed: true } }; }
        if (input.operation === 'snapshot') session.documents.clear();
        if (['document', 'prepare_context'].includes(input.operation) && session.documents.get(input.resource_id) !== `${input.snapshot_id}:${input.run_id}`) return failure('resource_denied');
        const result = await session.pool.request({ operation: input.operation, snapshot: input.snapshot_id,
          selector: ['run', 'context'].includes(input.operation) ? input.run_id : input.resource_id, input }, signal);
        if (current !== session) return failure('session_expired');
        const response = { ...result, authorizes: false };
        if (Buffer.byteLength(JSON.stringify(response), 'utf8') > READ_LIMITS.response) throw new ControlReadError('resource_limit');
        if (input.operation === 'run' && result.data?.resources) for (const resource of result.data.resources) {
          session.documents.set(resource.resource_id, `${input.snapshot_id}:${input.run_id}`);
        }
        return response;
      } catch (error) {
        const code = error instanceof ControlReadError || error.code === 'resource_denied' ? error.code : 'read_failed';
        if (current === session && ['timeout', 'read_failed', 'source_changed'].includes(code)) session?.documents.clear();
        return failure(code);
      }
    },
    async close() { renderGeneration += 1; await retire(current); },
  });
}
