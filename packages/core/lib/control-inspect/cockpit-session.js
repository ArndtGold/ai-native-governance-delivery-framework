import { randomUUID } from 'node:crypto';
import { relative, sep } from 'node:path';
import { COMPANION_DATA_ROOT_ENV } from '../companion/journal.js';
import { readCodexObservation } from '../companion/codex-activity.js';
import { createCodexContinuationAdmission } from '../companion/codex-continuation.js';
import { continuationBinding, isCurrentContinuation } from '../companion/codex-continuation-binding.js';
import { ReadWorkerPool } from '../control-read/cockpit-pool.js';
import { READ_LIMITS, ControlReadError } from '../control-read/snapshot.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { resolveTaskTarget } from '../task-target-resolution.js';
import { runPath } from '../control-state/run-state-reader.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { COCKPIT_LIMITS, parseCockpitArguments, parseCockpitContinuationArguments, parsePluginCockpitArguments } from './cockpit-contract.js';

// One connection owns bounded independent read views. Retiring workers still occupy slots.
export function createCockpitSessionService(root, {
  budget, poolFactory = viewRoot => new ReadWorkerPool(viewRoot, { limits: { total: COCKPIT_LIMITS.capture },
    maxOldGenerationSizeMb: COCKPIT_LIMITS.workerOldGeneration, budget }), now = Date.now, pluginMode = false, integrationSurface,
  continuationQualified = false, companionDataRoot = process.env[COMPANION_DATA_ROOT_ENV], continuationRuntimeRoot, continuationBootId,
} = {}) {
  const target = pluginMode ? null : { target_id: resolveControlCommandTarget(root).target_id, display_path: root };
  const continueRun = pluginMode && integrationSurface === 'codex' && continuationQualified === true && companionDataRoot
    ? createCodexContinuationAdmission(companionDataRoot, { runtimeRoot: continuationRuntimeRoot, bootId: continuationBootId }) : null;
  const sessions = new Map();
  let closed = false, renderGeneration = 0, publication = null, resourceIdentity = null;
  const failure = (code, viewTarget = target) => ({ schema_version: '2', target: viewTarget, snapshot_id: null, observed_as_of: null,
    source_digest: null, state: 'blocked', code, retryable: code !== 'session_expired', data: null, authorizes: false });
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
  function cancelContinuationReservation(session) {
    const reservation = session.reservation;
    if (!reservation) return;
    const result = continueRun.cancelReservation(reservation.scope, session.id, reservation.attempt);
    if (result.state !== 'unavailable') session.reservation = null;
  }
  function retire(session) {
    if (session.retirement) return session.retirement;
    session.retired = true; ++session.generation;
    cancelContinuationReservation(session);
    losePublication(session);
    clearTimeout(session.timer); session.documents.clear(); session.rows.clear(); session.snapshot = null; session.draft = null;
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
    continuationAvailable: continueRun !== null,
    continue(input, signal) {
      const response = data => ({ schema_version: '1', authorizes: false, ...data });
      try {
        input = parseCockpitContinuationArguments(input);
        const session = active(input.session_id);
        const scope = session.continuationBinding;
        if (!session.continuation || signal?.aborted || !scope || session.snapshot !== input.snapshot_id
          || scope.run_id !== input.run_id || scope.revision_id !== input.revision_id)
          return response({ state: 'stale' });
        // First paint may not have acknowledged this exact snapshot yet. Reading
        // status can retry; a gesture still requires the display acknowledgement.
        if (!session.displayed) return response({ state: input.operation === 'status' ? 'unavailable' : 'stale' });
        if (input.operation === 'status') return response(continueRun.inspect(scope));
        const eligible = () => !signal?.aborted && isCurrentContinuation(session.root, scope);
        if (input.operation === 'reserve') {
          if (session.reservation) {
            const held = continueRun.inspect(scope);
            return response(held.state === 'ready' ? { state: 'unavailable' } : held);
          }
          const result = continueRun.reserve({ ...scope, root: session.root }, session.id, eligible);
          if (result.reserved) session.reservation = { scope, attempt: result.attempt_id };
          return response(result.reserved ? { ...result, target: session.target, ...scope } : result);
        }
        if (input.operation === 'cancel') {
          const result = continueRun.cancelReservation(scope, session.id, input.attempt_id);
          if (result.state === 'ready') session.reservation = null;
          return response(result);
        }
        const result = continueRun.publish(scope, session.id, input.attempt_id, eligible);
        if (result.send || result.state === 'stale') session.reservation = null;
        return response(result.send ? { ...result, target: session.target, ...scope } : result);
      } catch { return response({ state: 'unavailable' }); }
    },
    bindResourceIdentity({ digest, version } = {}) {
      if (resourceIdentity || sessions.size || !/^[a-f0-9]{64}$/u.test(digest ?? '')
        || typeof version !== 'string' || !/^[0-9A-Za-z.+-]{1,80}$/u.test(version)) throw Error('resource_identity_invalid');
      resourceIdentity = Object.freeze({ schema_version: '1', version, resource_digest: `sha256:${digest}`,
        resource_scope: 'server_validated', host_display: 'unconfirmed', candidate_match: 'unverified' });
    },
    inspectOwnership() {
      return { views: sessions.size, active: [...sessions.values()].filter(row => !row.retired).length,
        uncertain: publication?.phase === 'uncertain' ? 1 : 0 };
    },
    async render(input = {}, { continuation = true } = {}) {
      input = pluginMode ? parsePluginCockpitArguments(input) : parseCockpitArguments(input, true);
      const companionStart = input.view === 'companion';
      let viewRoot = root, viewTarget = target;
      if (pluginMode) {
        const resolved = resolveTaskTarget({ workingDirectory: input.working_directory,
          primaryTarget: input.primary_target, targetSource: input.target_source });
        if (resolved.resolution_state !== 'resolved') return { ...failure('resource_denied'),
          target_resolution: resolved, next_action: resolved.next_action };
        viewRoot = resolved.governance_target;
        viewTarget = { target_id: resolveControlCommandTarget(viewRoot).target_id, display_path: viewRoot };
        if (input.run_id && !companionStart) {
          // Admission only: the worker still captures and evaluates fresh canonical bytes.
          let path;
          try { path = relative(viewRoot, runPath(viewRoot, input.run_id)).split(sep).join('/'); }
          catch { return failure('invalid_run', viewTarget); }
          const file = containedRegularFile(viewRoot, path);
          if (hasSymlinkComponent(viewRoot, path) || file.status !== 'valid') return {
            ...failure(file.status === 'missing' ? 'run_missing' : 'resource_denied', viewTarget),
            data: { kind: 'run', requested_run_id: input.run_id, run: null },
            next_action: 'Select an existing Run in the confirmed project; no alternative Run was selected.' };
        }
      }
      if (closed) return failure('session_expired');
      for (const session of sessions.values()) {
        if (!session.retired && (now() - session.touched >= COCKPIT_LIMITS.idle
          || now() - session.created >= COCKPIT_LIMITS.lifetime)) void retire(session);
      }
      if (sessions.size >= COCKPIT_LIMITS.sessions) return failure('resource_limit', viewTarget);
      // No await between capacity check and ownership publication.
      const session = { id: randomUUID(), displayId: randomUUID(), initialRunId: input.run_id ?? null,
        displayed: null, displaySnapshot: null, companionStart, root: viewRoot, target: viewTarget,
        continuation: continueRun !== null && continuation === true,
        created: now(), touched: now(), pool: poolFactory(viewRoot),
        documents: new Map(), rows: new Set(), snapshot: null, run_id: null, draft: null, generation: 0, retired: false, retirement: null, timer: null,
        completion: null };
      sessions.set(session.id, session); schedule(session);
      if (companionStart) {
        try {
          const result = await session.pool.request({ operation: 'companion_start', input });
          active(session.id);
          if (result.state !== 'available') throw new ControlReadError(result.code ?? 'read_failed');
          session.initialRunId = result.data.run_id;
        } catch (error) {
          void retire(session);
          return failure(error instanceof ControlReadError ? error.code : 'read_failed', viewTarget);
        }
      }
      return { schema_version: '1', authorizes: false, target: viewTarget,
        display: { state: 'pending', run_id: session.initialRunId },
        next_calls: [{ tool: 'agdf_cockpit_read', arguments: { operation: 'display_status', display_id: session.displayId },
          instruction: 'Check this receipt before saying the Cockpit was shown. If pending, allow a short interval for the UI to load and check once more. Only ui_reported_visible confirms the first visible render. If display.presentation is present, use it to report what the Companion showed on opening.' }],
        _meta: { agdf_cockpit: { session_id: session.id, target: viewTarget, render_generation: ++renderGeneration,
          display_ack: true,
          ...(session.continuation ? { continuation: true } : {}),
          ...(['codex', 'claude'].includes(integrationSurface) ? { integration_surface: integrationSurface } : {}),
          ...(resourceIdentity ? { provenance: resourceIdentity } : {}),
          ...(session.initialRunId ? { initial_run_id: session.initialRunId } : {}),
          ...(companionStart && (session.initialRunId === null ? { companion_empty: true }
            : session.initialRunId !== input.run_id ? { companion_fallback: true } : {})),
          idle_timeout_ms: COCKPIT_LIMITS.idle, lifetime_ms: COCKPIT_LIMITS.lifetime } } };
    },
    async read(input, signal) {
      let session, generation, reservation;
      const fail = code => failure(code, session?.target ?? target);
      const accepted = data => ({ ...fail(null), state: 'available', retryable: false, data });
      try {
        input = parseCockpitArguments(input);
        if (input.operation === 'display_status') {
          const view = [...sessions.values()].find(row => row.displayId === input.display_id);
          if (!view) return fail('session_expired');
          session = active(view.id);
          return accepted({ display: session.displayed ?? { state: 'pending', run_id: session.initialRunId } });
        }
        session = active(input.session_id);
        generation = session.generation;
        if (input.operation === 'close') { await retire(session); return accepted({ closed: true }); }
        if (input.operation === 'display_ack') {
          if (signal?.aborted) return fail('cancelled');
          if (session.snapshot !== input.snapshot_id || session.displaySnapshot?.id !== input.snapshot_id) return fail('resource_denied');
          const title = session.displaySnapshot.title;
          if (input.presentation && title === undefined && (!session.companionStart || input.presentation.gate)) return fail('resource_denied');
          session.displayed ??= { state: 'ui_reported_visible', run_id: session.initialRunId, observed_at: new Date(now()).toISOString(),
            ...(input.presentation && { presentation: { ...input.presentation, ...(title === undefined ? {} : { title }) } }) };
          return accepted({ display: session.displayed });
        }
        // These transitions belong solely to this connection, never the worker
        // or a mutable client-side current session.
        if (input.operation === 'complete_context_invalidation') {
          if (session.completion === input.invalidation_id) {
            touch(session); return accepted({ completed: true, invalidation_id: input.invalidation_id });
          }
          if (publication?.session_id !== session.id || publication.invalidation_id !== input.invalidation_id) return fail('resource_denied');
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
          if (publication.phase === 'uncertain' && !publication.invalidation_id) return fail('context_cleanup_uncertain');
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
          if (active(session.id) !== session || publication !== pending) return fail('session_expired');
          touch(session);
          return accepted({ invalidated: true, host_publication_required: true, invalidation_id: pending.invalidation_id });
        }
        if (input.operation === 'snapshot') { discardPacket(session); ++session.generation; session.documents.clear(); session.snapshot = null; session.draft = null; }
        else if (input.snapshot_id && session.snapshot !== input.snapshot_id) return fail('resource_denied');
        if (input.operation === 'changes') {
          const result = await session.pool.waitForChange(input.snapshot_id, signal);
          if (active(session.id) !== session || generation !== session.generation) return fail('session_expired');
          touch(session); return result;
        }
        if (['planned', 'archive'].includes(input.operation) && !session.rows.has(input.row_id)) return fail('resource_denied');
        if (['document', 'preview', 'prepare_context'].includes(input.operation)
          && session.documents.get(input.resource_id) !== `${input.snapshot_id}:${input.run_id}`) return fail('resource_denied');
        if (['context', 'artifact_readiness'].includes(input.operation) && input.run_id !== session.run_id) return fail('resource_denied');
        if (input.operation === 'artifact_readiness' && (!session.draft?.available || session.draft.gate !== input.gate
          || session.draft.revision_id !== input.expected_revision_id)) return fail('resource_denied');
        if (input.operation === 'prepare_context') {
          if (publication) return fail(publication.phase === 'uncertain' ? 'context_cleanup_uncertain' : 'busy');
          reservation = { session_id: session.id, phase: 'preparing', packet: null, invalidation_id: null, begin: null };
          publication = reservation;
        }
        if (input.operation === 'validate_context') {
          if (publication?.session_id !== session.id) return fail(publication ? 'resource_denied' : 'context_superseded');
          if (!publication.packet) return fail('context_superseded');
          if (publication.packet.context_id !== input.context_id || publication.packet.generation !== input.generation) return fail('resource_denied');
          if (publication.phase !== 'prepared') return fail('context_superseded');
        }
        if (input.operation === 'artifact_readiness' && publication) return fail(publication.phase === 'uncertain' ? 'context_cleanup_uncertain' : 'busy');
        const replacement = ['snapshot', 'run', 'document', 'context', 'artifact_readiness'].includes(input.operation);
        if (['run', 'document', 'context', 'artifact_readiness'].includes(input.operation)) {
          discardPacket(session); ++session.generation; session.documents.clear(); session.snapshot = null; session.draft = null;
        }
        generation = session.generation;
        if (replacement) session.rows.clear();
        const result = await session.pool.request({ operation: input.operation, snapshot: input.snapshot_id,
          selector: ['planned', 'archive'].includes(input.operation) ? input.row_id : ['run', 'context'].includes(input.operation) ? input.run_id : input.resource_id, input }, signal);
        if (active(session.id) !== session || generation !== session.generation) return fail('session_expired');
        const response = { ...result, authorizes: false };
        const responseBytes = Buffer.byteLength(JSON.stringify(response), 'utf8');
        if (responseBytes > READ_LIMITS.response) throw new ControlReadError('resource_limit');
        if (reservation) {
          if (publication !== reservation) return fail('context_superseded');
          if (result.state === 'available' && result.data?.packet) {
            reservation.phase = 'prepared'; reservation.packet = { context_id: result.data.packet.context_id, generation: result.data.packet.generation };
          } else publication = null;
        }
        if (!['resource_denied', 'context_superseded', 'busy', 'context_cleanup_uncertain'].includes(result.code)) touch(session);
        if (replacement && result.snapshot_id) {
          if (session.snapshot !== result.snapshot_id) cancelContinuationReservation(session);
          session.snapshot = result.snapshot_id;
        }
        if (replacement && !session.displayed) {
          const initialView = session.initialRunId === null
            ? ['work', 'runs'].includes(result.data?.kind) && !result.data.removed_run_id
            : result.data?.kind === 'run' && result.data.run?.run_id === session.initialRunId;
          const run = result.data?.run;
          session.displaySnapshot = initialView && result.snapshot_id && ['available', 'empty', 'partial'].includes(result.state)
            ? { id: result.snapshot_id, title: run ? run.title ?? run.run_id : undefined } : null;
        }
        if (replacement && result.data?.kind === 'work') for (const row of result.data.entries) session.rows.add(row.row_id);
        if (replacement) {
          const run = result.data?.run;
          session.run_id = run?.run_id ?? null;
          session.draft = run?.draft_check?.source ?? null;
          session.continuationBinding = session.continuation && continuationBinding(session.target.target_id, run);
          session.companionBinding = run?.revision_id && run.lifecycle === 'active'
            && run.evaluation?.next_operation?.actor === 'agent' ? {
              target_id: session.target.target_id, run_id: run.run_id, revision_id: run.revision_id, gate: run.evaluation.current_gate,
            } : null;
        }
        if (integrationSurface === 'codex' && session.companionBinding && response.data
          && (replacement || input.operation === 'freshness')) {
          const binding = session.companionBinding;
          // Confirmed work, or that activity is unknown when the Codex Companion hooks of this build gave no
          // sign of life (also without a readable data root); a resting step with live hooks attaches nothing.
          const seen = companionDataRoot ? readCodexObservation(companionDataRoot, binding, now()) : null;
          const observation = seen?.activity ? { activity: { ...binding, expires_at: seen.activity.expires_at } }
            : seen?.liveness === 'observed' ? null : { liveness: 'unknown' };
          // The key is appended last, so it adds exactly its own serialized bytes to the measured response.
          if (observation && responseBytes + Buffer.byteLength(`,"companion_observation":${JSON.stringify(observation)}`, 'utf8')
            <= READ_LIMITS.response) response.companion_observation = observation;
        }
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
          ++session.generation; session.documents.clear(); session.snapshot = null; session.draft = null;
        }
        return fail(code);
      }
    },
    async close() {
      closed = true;
      await Promise.allSettled([...sessions.values()].map(retire));
      publication = null;
    },
  });
}
