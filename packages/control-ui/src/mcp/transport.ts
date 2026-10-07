import { App as McpApp } from '@modelcontextprotocol/ext-apps';
import { validateEnvelope, validateData, type ReadTransport } from '../api';
import type { Envelope } from '../types';

export class CockpitBridge {
  readonly app = new McpApp({ name: 'AGDF Cockpit', version: '1.0.0' }, {}, { autoResize: true });
  private pending = 0;
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([action(), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(Error('timeout')), 10_000);
      })]);
    } finally { clearTimeout(timer); this.pending -= 1; }
  }
  async operation(argumentsValue: Record<string, unknown>, signal?: AbortSignal, boundSession?: string) {
    const session = boundSession ?? this.session;
    if (!this.app.getHostCapabilities()?.serverTools || !session) throw Error('session_invalid');
    const result = await this.request(() => this.app.callServerTool({ name: 'agdf_cockpit_read', arguments: { ...argumentsValue, session_id: session } }, { timeout: 10_000, signal }));
    if ((boundSession === undefined && session !== this.session) || signal?.aborted) throw Error('session_invalid');
    if (result.isError || !result.structuredContent) throw Error('read_failed');
    return result.structuredContent;
  }
  readForSession(session: string): ReadTransport { return this.reader(new Map(), session); }
  readonly read: ReadTransport = this.reader(this.resourceRuns);
  private reader(resourceRuns: Map<string, string>, session?: string): ReadTransport {
    return async <T>(path: string, signal: AbortSignal, expected?: { target: string; snapshot: string }): Promise<Envelope<T>> => {
    const url = new URL(path, 'https://local.invalid');
    const snapshot_id = url.searchParams.get('snapshot');
    let argumentsValue: Record<string, unknown>;
    if (url.pathname === '/api/snapshot') { resourceRuns.clear(); argumentsValue = { operation: 'snapshot' }; }
    else if (url.pathname === '/api/freshness') argumentsValue = { operation: 'freshness', snapshot_id };
    else if (url.pathname.startsWith('/api/runs/')) argumentsValue = { operation: 'run', snapshot_id, run_id: url.pathname.slice(10) };
    else if (url.pathname.startsWith('/api/context/')) argumentsValue = { operation: 'context', snapshot_id, run_id: url.pathname.slice(13) };
    else if (url.pathname.startsWith('/api/documents/')) {
      const resource_id = url.pathname.slice(15), run_id = resourceRuns.get(resource_id);
      if (!run_id) throw Error('resource_denied');
      argumentsValue = { operation: 'document', snapshot_id, run_id, resource_id };
    } else throw Error('resource_denied');
    const value = await this.operation(argumentsValue, signal, session);
    validateEnvelope(value, expected); validateData(path, value);
    if (argumentsValue.operation === 'run' && value.data) {
      const data = value.data as { run_id: string; resources: { resource_id: string }[] };
      for (const resource of data.resources) resourceRuns.set(resource.resource_id, data.run_id);
    }
    return value as Envelope<T>;
    };
  }
}
