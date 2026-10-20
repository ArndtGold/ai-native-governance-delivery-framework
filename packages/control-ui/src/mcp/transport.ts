import { App as McpApp } from '@modelcontextprotocol/ext-apps';
import { validateEnvelope, validateData, type ReadTransport } from '../api';
import type { Envelope } from '../types';

export class CockpitBridge {
  readonly app: McpApp;
  constructor(name = 'AGDF Cockpit', options = { autoResize: true }) { this.app = new McpApp({ name, version: '1.0.0' }, {}, options); }
  private pending = 0;
  private closing = new Map<string, ReturnType<McpApp['callServerTool']>>();
  private sessionId = '';
  private resourceRuns = new Map<string, string>();
  get session() { return this.sessionId; }
  set session(value: string) {
    if (value !== this.sessionId) this.resourceRuns.clear();
    this.sessionId = value;
  }
  async request<T>(action: () => Promise<T>): Promise<T> {
    if (this.pending >= 8) throw Error('busy');
    this.pending += 1;
    try { return await this.deadline(action); }
    finally { this.pending -= 1; }
  }
  private async deadline<T>(action: () => Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([action(), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Error('timeout')), 10_000);
      })]);
    } finally { clearTimeout(timer); }
  }
  private close(session: string, signal?: AbortSignal) {
    const previous = this.closing.get(session);
    if (previous) return previous;
    // Retirement releases existing resources. Reads must not starve it, and
    // simultaneous lifecycle signals must not dispatch duplicate closes.
    // The separate lane is bounded and keeps the existing RPC deadline.
    if (this.closing.size >= 8) throw Error('busy');
    const pending = this.deadline(() => this.app.callServerTool({ name: 'agdf_cockpit_read',
      arguments: { operation: 'close', session_id: session } }, { timeout: 10_000, signal }));
    this.closing.set(session, pending);
    void pending.finally(() => { if (this.closing.get(session) === pending) this.closing.delete(session); }).catch(() => {});
    return pending;
  }
  async operation(argumentsValue: Record<string, unknown>, signal?: AbortSignal, boundSession?: string) {
    const session = boundSession ?? this.session;
    if (!this.app.getHostCapabilities()?.serverTools || !session) throw Error('session_invalid');
    const isClose = argumentsValue.operation === 'close';
    if (isClose && Object.keys(argumentsValue).length !== 1) throw Error('resource_denied');
    const result = await (isClose ? this.close(session, signal) : this.request(() => this.app.callServerTool({ name: 'agdf_cockpit_read',
      arguments: { ...argumentsValue, session_id: session } }, { timeout: 10_000, signal })));
    if ((boundSession === undefined && session !== this.session) || signal?.aborted) throw Error('session_invalid');
    if (!result.structuredContent) throw Error('read_failed');
    if (result.isError) {
      const value = result.structuredContent as Record<string, unknown>;
      // Decision session reads have a bounded negative envelope, distinct from
      // Cockpit DTOs. A negative reply can never become closure or read data.
      if (value.schema_version === '1' && value.outcome === 'rejected' && value.authorizes === false
        && ['session_expired', 'source_changed', 'resource_denied'].includes(String(value.reason))) {
        if (isClose && value.reason === 'session_expired') return value;
        throw Error(String(value.reason));
      }
      validateEnvelope(value);
      if (!['invalid', 'missing', 'unsupported', 'blocked', 'stale', 'error'].includes(value.state)
        || value.data !== null || typeof value.code !== 'string' || !/^[a-z][a-z0-9_]{0,127}$/.test(value.code)) throw Error('read_failed');
    }
    return result.structuredContent;
  }
  readForSession(session: string): ReadTransport { return this.reader(new Map(), session); }
  readonly read: ReadTransport = this.reader(this.resourceRuns);
  private reader(resourceRuns: Map<string, string>, session?: string): ReadTransport {
    const read: ReadTransport = async <T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string; replacement?: boolean }): Promise<Envelope<T>> => {
    const url = new URL(path, 'https://local.invalid');
    const snapshot_id = url.searchParams.get('snapshot');
    let argumentsValue: Record<string, unknown>;
    if (url.pathname === '/api/snapshot') { resourceRuns.clear(); argumentsValue = { operation: 'snapshot', ...(url.searchParams.has('run_id') ? { run_id: url.searchParams.get('run_id') } : {}) }; }
    else if (url.pathname === '/api/changes') argumentsValue = { operation: 'changes', snapshot_id };
    else if (url.pathname === '/api/freshness') argumentsValue = { operation: 'freshness', snapshot_id };
    else if (url.pathname === '/api/backlog-titles') argumentsValue = { operation: 'backlog_titles', snapshot_id, row_ids: url.searchParams.get('rows')?.split(',') };
    else if (url.pathname.startsWith('/api/runs/')) argumentsValue = { operation: 'run', snapshot_id, run_id: url.pathname.slice(10) };
    else if (url.pathname.startsWith('/api/context/')) argumentsValue = { operation: 'context', snapshot_id, run_id: url.pathname.slice(13) };
    else if (/^\/api\/draft-check\/[A-Za-z0-9_-]{1,128}$/.test(url.pathname)) {
      const keys = [...url.searchParams.keys()];
      if (keys.length !== 3 || new Set(keys).size !== 3 || !['snapshot', 'gate', 'expected_revision'].every(key => keys.includes(key))) throw Error('resource_denied');
      argumentsValue = { operation: 'artifact_readiness', snapshot_id, run_id: url.pathname.slice(17),
        gate: url.searchParams.get('gate'), expected_revision_id: url.searchParams.get('expected_revision') };
    }
    else if (url.pathname.startsWith('/api/documents/')) {
      const resource_id = url.pathname.slice(15), run_id = resourceRuns.get(resource_id);
      if (!run_id) throw Error('resource_denied');
      argumentsValue = { operation: 'document', snapshot_id, run_id, resource_id };
    } else throw Error('resource_denied');
    const value = await this.operation(argumentsValue, signal, session);
    validateEnvelope(value, expected); validateData(path, value);
    if (['snapshot', 'backlog_titles', 'run', 'document', 'context', 'artifact_readiness'].includes(String(argumentsValue.operation))) {
      resourceRuns.clear();
      const data = value.data as { run?: { run_id: string; resources: { resource_id: string }[] } } | null;
      if (data?.run) for (const resource of data.run.resources) resourceRuns.set(resource.resource_id, data.run.run_id);
    }
    return value as Envelope<T>;
    };
    read.waitForChanges = (snapshot, signal, target) => read('/api/changes?snapshot=' + snapshot, signal, { target, snapshot });
    return read;
  }
}
