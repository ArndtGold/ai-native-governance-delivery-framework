import type { CockpitBridge } from './transport';

export type ContinuationSelection = { snapshot_id: string; run_id: string; revision_id: string };
type ServiceState = 'ready' | 'pending' | 'running' | 'unavailable' | 'stale';
export type ContinuationState = ServiceState | 'stopping';
export type CompanionContinuation = {
  status: (selection: ContinuationSelection, signal: AbortSignal) => Promise<ContinuationState>;
  start: (selection: ContinuationSelection, signal: AbortSignal) => Promise<ContinuationState>;
};

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const absolutePath = /^(?:\/|[A-Za-z]:[\\/]|\\\\)/;
const states: readonly ServiceState[] = ['ready', 'pending', 'running', 'unavailable', 'stale'];
type Reply = { state: ContinuationState; attempt_id?: string; run_id?: string; revision_id?: string;
  target?: { target_id: string; display_path: string }; operation_key?: string; reserved?: true; send?: true };

export function createCompanionContinuation(bridge: CockpitBridge, session: string, targetId: string): CompanionContinuation {
  const connected = () => bridge.session === session;
  const supported = () => {
    const capabilities = bridge.app.getHostCapabilities();
    return connected() && !!capabilities?.serverTools && !!capabilities?.message?.text && !!capabilities.updateModelContext;
  };
  async function call(selection: ContinuationSelection, operation: string, signal?: AbortSignal, attempt_id?: string): Promise<Reply> {
    const result = await bridge.request(() => bridge.app.callServerTool({ name: 'agdf_cockpit_continue',
      arguments: { ...selection, session_id: session, operation, ...(attempt_id && { attempt_id }) },
    }, { timeout: 10_000, signal }));
    const data = result.structuredContent as (Omit<Reply, 'state'> & { state: ServiceState; interrupt_requested?: boolean;
      schema_version: string; authorizes: boolean }) | undefined;
    if (result.isError || data?.schema_version !== '1' || data.authorizes !== false || !states.includes(data.state)) throw Error('continuation_unavailable');
    return data.state === 'running' && data.interrupt_requested === true ? { ...data, state: 'stopping' } : data;
  }
  function matches(reply: Reply, selection: ContinuationSelection, attempt: string) {
    return reply.attempt_id === attempt && reply.run_id === selection.run_id && reply.revision_id === selection.revision_id
      && reply.target?.target_id === targetId && absolutePath.test(reply.target.display_path);
  }
  return {
    async status(selection, signal) {
      if (!supported()) return 'unavailable';
      try { return (await call(selection, 'status', signal)).state; }
      catch { return 'unavailable'; }
    },
    async start(selection, signal) {
      if (!supported() || signal.aborted) return 'unavailable';
      let attempt: string | undefined;
      let publishing = false;
      try {
        const reserved = await call(selection, 'reserve', signal);
        if (reserved.reserved !== true) return reserved.state;
        attempt = reserved.attempt_id;
        if (!attempt || !uuid.test(attempt) || !matches(reserved, selection, attempt) || !reserved.target || !reserved.operation_key)
          throw Error('reservation_invalid');
        const dispatch = { skill_id: 'gate-check', run_id: selection.run_id, continue_delivery: true,
          working_directory: reserved.target.display_path, primary_target: reserved.target.display_path,
          target_source: 'continued_target', continuation_attempt_id: attempt };
        await bridge.request(() => bridge.app.updateModelContext({ structuredContent: { agdf_companion_continuation: {
          authorizes: false, target_id: targetId, revision_id: selection.revision_id, operation_key: reserved.operation_key,
          call: { tool: 'agdf_dispatch', arguments: dispatch },
          instruction: 'Use this exact dispatch only for the accompanying Companion request. Follow its current governed step. This request never records a human approval.',
        } } }, { timeout: 10_000, signal }));
        if (!supported() || signal.aborted) throw Error('view_changed');
        publishing = true;
        const grant = await call(selection, 'publish', signal, attempt);
        if (grant.send !== true) return grant.state;
        if (supported() && !signal.aborted && matches(grant, selection, attempt) && grant.operation_key === reserved.operation_key) {
          const request = reserved.operation_key === 'approval.record'
            ? `Zeig mir die aktuelle Entscheidung für den Run ${selection.run_id} aus dem AGDF-Begleiter.`
            : `Setze den Run ${selection.run_id} aus dem AGDF-Begleiter mit dem nächsten zulässigen Schritt fort.`;
          // Only the durable status confirms that Codex claimed the Run. Keep
          // reading it while the host message reply is outstanding.
          void bridge.request(() => bridge.app.sendMessage({ role: 'user', content: [{ type: 'text', text: request }] },
            { timeout: 10_000 })).catch(() => {});
        }
        return 'pending';
      } catch {
        if (!publishing && attempt && uuid.test(attempt)) {
          try { await call(selection, 'cancel', undefined, attempt); }
          catch { /* Reopening reads the original durable state. */ }
        }
        return publishing ? 'pending' : 'unavailable';
      }
    },
  };
}
