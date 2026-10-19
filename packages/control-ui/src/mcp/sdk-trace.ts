import type { Transport } from '@modelcontextprotocol/client';

// Keep the Host's small console allowance for lifecycle traffic. The full,
// bounded per-view buffer and SDK logging retain their existing behavior.
export function lifecycleConsole(emit: (row: string) => void) {
  const replies = new Set<string>();
  let inlineSeen = false, terminalSizes = 0;
  return (row: string) => {
    const value = JSON.parse(row), packet = value.message;
    if (value.truncated) { emit(row); return; }
    if (!packet) return;
    if (!inlineSeen && value.direction === 'out' && packet.method === 'ui/request-display-mode' && packet.params?.mode === 'inline') {
      inlineSeen = true; terminalSizes = 1;
    }
    const terminalSize = value.direction === 'out' && packet.method === 'ui/notifications/size-changed' && terminalSizes > 0;
    if (terminalSize) terminalSizes -= 1;
    const key = JSON.stringify([value.direction, packet.id]);
    const relevant = terminalSize || replies.delete(key) || ['ui/initialize', 'ui/notifications/initialized',
      'ui/notifications/request-teardown', 'ui/resource-teardown', 'ui/update-model-context', 'ui/request-display-mode'].includes(packet.method)
      || packet.method === 'tools/call' && ['prepare_context', 'validate_context', 'invalidate_context',
        'complete_context_invalidation', 'close'].includes(packet.params?.arguments?.operation);
    if (!relevant) return;
    if (packet.method && packet.id !== undefined) replies.add(JSON.stringify([value.direction === 'out' ? 'in' : 'out', packet.id]));
    emit(row);
  };
}

// Per-view diagnostic memory only. No files, network destination, model context,
// protocol handler replacement, session selection or qualification authority.
export class SdkTrace {
  private rows: string[] = [];
  private bytes = 0;
  private enabled = false;
  private truncated = false;
  private listeners = new Set<() => void>();
  private initializeId: unknown;
  readonly id = crypto.randomUUID();
  constructor(private emit: (row: string) => void, private maxBytes = 1024 * 1024, private maxEvents = 256) {}
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private changed() { for (const listener of this.listeners) { try { listener(); } catch { /* Diagnostics cannot break the SDK. */ } } }
  private publish(row: string) { try { this.emit(row); } catch { /* A logging failure is not a transport failure. */ } }
  private opening(message: unknown) {
    if (!message || typeof message !== 'object') return false;
    const packet = message as { method?: string; id?: unknown; params?: { _meta?: { agdf_cockpit?: unknown } } };
    if (packet.method === 'ui/initialize') { this.initializeId = packet.id; return true; }
    return packet.id !== undefined && packet.id === this.initializeId
      || ['ui/notifications/initialized', 'ui/notifications/tool-input'].includes(packet.method ?? '')
      || packet.method === 'ui/notifications/tool-result' && !!packet.params?._meta?.agdf_cockpit;
  }
  observe(direction: 'in' | 'out' | 'error' | 'closed', message: unknown) {
    // Logging our own trace must not recursively trace the logging notification.
    if (message && typeof message === 'object' && 'method' in message && message.method === 'notifications/message') return;
    // Before deliberate collection, retain only opening/handshake evidence.
    // Background polling must neither collect source text nor exhaust this buffer.
    if (!this.enabled && !this.opening(message)) return;
    if (this.truncated) return;
    try {
      const row = JSON.stringify({ trace_id: this.id, sequence: this.rows.length + 1,
        observed_at: new Date().toISOString(), direction, message });
      const size = new TextEncoder().encode(row).length;
      if (this.rows.length >= this.maxEvents || size + this.bytes > this.maxBytes) {
        this.truncated = true;
        if (this.enabled) this.publish(JSON.stringify({ trace_id: this.id, truncated: true, authorizes: false }));
      } else {
        this.rows.push(row); this.bytes += size;
        if (this.enabled) this.publish(row);
      }
      this.changed();
    } catch { this.truncated = true; this.changed(); }
  }
  start() {
    if (this.enabled) return;
    this.enabled = true;
    for (const row of this.rows) this.publish(row);
    if (this.truncated) this.publish(JSON.stringify({ trace_id: this.id, truncated: true, authorizes: false }));
    this.changed();
  }
  snapshot() {
    return JSON.stringify({ schema_version: 1, kind: 'agdf_sdk_trace', authorizes: false,
      trace_id: this.id, capture_scope: 'opening_and_explicit_recording', logging: this.enabled, truncated: this.truncated,
      events: this.rows.map(row => JSON.parse(row)) }, null, 2);
  }
  wrap(inner: Transport): Transport {
    const trace = this;
    const outer: Transport = {
      get sessionId() { return inner.sessionId; },
      set sessionId(value) { inner.sessionId = value; },
      setProtocolVersion(version) { inner.setProtocolVersion?.(version); },
      async start() {
        inner.onmessage = (message, extra) => { trace.observe('in', message); outer.onmessage?.(message, extra); };
        inner.onerror = error => { trace.observe('error', { name: error.name }); outer.onerror?.(error); };
        inner.onclose = () => { trace.observe('closed', null); outer.onclose?.(); };
        return inner.start();
      },
      async send(message, options) {
        trace.opening(message); // Correlate a fast initialize response before send resolves.
        try { await inner.send(message, options); trace.observe('out', message); }
        catch (error) { trace.observe('error', { operation: 'send', name: error instanceof Error ? error.name : 'Error' }); throw error; }
      },
      close() { return inner.close(); },
    };
    return outer;
  }
}
