import { expect, it, vi } from 'vitest';
import type { Transport } from '@modelcontextprotocol/client';
import { SdkTrace, lifecycleConsole } from '../src/mcp/sdk-trace';
import { App, LATEST_PROTOCOL_VERSION, PostMessageTransport } from '@modelcontextprotocol/ext-apps';

it('keeps the limited native console for lifecycle packets and correlated replies, excluding polling', () => {
  const emit = vi.fn(), sink = lifecycleConsole(emit);
  const row = (direction: string, message: unknown) => JSON.stringify({ trace_id: 'one-view', direction, message });
  for (let id = 1; id <= 100; id++) {
    sink(row('out', { method: 'tools/call', id, params: { arguments: { operation: 'freshness' } } }));
    sink(row('in', { id, result: {} }));
  }
  expect(emit).not.toHaveBeenCalled();
  sink(row('out', { method: 'tools/call', id: 101, params: { arguments: { operation: 'close' } } }));
  sink(row('in', { id: 101, result: { closed: true } }));
  sink(row('in', { id: 101, result: {} }));
  sink(row('out', { method: 'ui/notifications/request-teardown' }));
  sink(row('in', { method: 'ui/resource-teardown', id: 0 }));
  sink(row('out', { id: 0, result: {} }));
  expect(emit).toHaveBeenCalledTimes(5);
});

it('records immutable SDK packets, replays only after deliberate start, and never loops over its logging notifications', () => {
  const emit = vi.fn(), trace = new SdkTrace(emit), packet = { jsonrpc: '2.0', id: 1, result: { value: 'original' } };
  trace.observe('out', { method: 'ui/initialize', id: 1 });
  trace.observe('in', packet); packet.result.value = 'changed';
  expect(emit).not.toHaveBeenCalled();
  trace.start(); trace.start();
  expect(emit).toHaveBeenCalledTimes(2);
  expect(JSON.parse(emit.mock.calls[1][0]).message.result.value).toBe('original');
  trace.observe('out', { method: 'notifications/message', params: { data: 'recursive' } });
  expect(emit).toHaveBeenCalledTimes(2);
  expect(JSON.parse(trace.snapshot())).toMatchObject({ authorizes: false, logging: true, truncated: false });
});

it('reports byte or event truncation explicitly without evicting initialization or emitting unbounded logs', () => {
  for (const [bytes, events] of [[20000, 1], [200, 200]]) {
    const emit = vi.fn(), trace = new SdkTrace(emit, bytes, events);
    trace.observe('out', { method: 'ui/initialize' }); trace.start();
    for (let i = 0; i < 1000; i++) trace.observe('in', { id: i, result: { text: 'x'.repeat(1000) } });
    const value = JSON.parse(trace.snapshot());
    expect(value.truncated).toBe(true); expect(value.events).toHaveLength(1);
    expect(value.events[0].message.method).toBe('ui/initialize');
    expect(emit).toHaveBeenCalledTimes(2);
  }
});

it('preserves public transport lifecycle, metadata and send errors even when the diagnostic sink throws', async () => {
  const trace = new SdkTrace(() => { throw Error('unavailable log sink'); }); trace.start();
  const inner: Transport = { start: vi.fn(async () => {}), send: vi.fn(async () => {}),
    close: vi.fn(async () => { inner.onclose?.(); }), setProtocolVersion: vi.fn(), sessionId: 'sdk-session' };
  const outer = trace.wrap(inner), receive = vi.fn(), close = vi.fn(), error = vi.fn();
  outer.onmessage = receive; outer.onclose = close; outer.onerror = error;
  await outer.start();
  const packet = { jsonrpc: '2.0' as const, id: 1, result: {} }, extra = { authInfo: undefined };
  inner.onmessage?.(packet, extra); expect(receive).toHaveBeenCalledWith(packet, extra);
  await outer.send(packet); expect(inner.send).toHaveBeenCalledWith(packet, undefined);
  outer.sessionId = 'next-session'; expect(inner.sessionId).toBe('next-session'); expect(outer.sessionId).toBe('next-session');
  outer.setProtocolVersion?.('2026-07-28'); expect(inner.setProtocolVersion).toHaveBeenCalledWith('2026-07-28');
  const failure = Error('transport unavailable'); inner.onerror?.(failure); expect(error).toHaveBeenCalledWith(failure);
  vi.mocked(inner.send).mockRejectedValueOnce(failure);
  await expect(outer.send(packet)).rejects.toBe(failure);
  await outer.close(); expect(close).toHaveBeenCalledOnce();
  expect(JSON.parse(trace.snapshot()).events.map((row: { direction: string }) => row.direction)).toEqual(['in', 'out', 'error', 'error', 'closed']);
});

it('observes the real Apps SDK initialization, read result and teardown acknowledgement without replacing its handlers', async () => {
  const trace = new SdkTrace(vi.fn()), hostPackets: unknown[] = [];
  const inner: Transport = {
    async start() {}, async close() { inner.onclose?.(); },
    async send(message) {
      hostPackets.push(message);
      if (!('id' in message) || !('method' in message)) return;
      const result = message.method === 'ui/initialize' ? { protocolVersion: LATEST_PROTOCOL_VERSION,
        hostInfo: { name: 'synthetic-host', version: 'test' }, hostCapabilities: { serverTools: {} }, hostContext: {} }
        : { content: [], structuredContent: { closed: true }, _meta: { 'agdf/provider': { connection_id: 'fixture-only' } } };
      queueMicrotask(() => inner.onmessage?.({ jsonrpc: '2.0', id: message.id, result }));
    },
  };
  const app = new App({ name: 'trace-test', version: 'test' }, {}, { autoResize: false });
  app.onteardown = async () => { await app.callServerTool({ name: 'agdf_cockpit_read', arguments: { operation: 'close' } }); return {}; };
  try {
    await app.connect(trace.wrap(inner), { timeout: 1000 });
    trace.start();
    await app.callServerTool({ name: 'agdf_cockpit_read', arguments: { operation: 'snapshot' } });
    inner.onmessage?.({ jsonrpc: '2.0', id: 'native-teardown-fixture', method: 'ui/resource-teardown', params: {} });
    await vi.waitFor(() => expect(hostPackets).toContainEqual({ jsonrpc: '2.0', id: 'native-teardown-fixture', result: {} }));
    const rows = JSON.parse(trace.snapshot()).events;
    expect(rows.some((row: { direction: string; message: { method?: string } }) => row.direction === 'out' && row.message.method === 'ui/initialize')).toBe(true);
    expect(rows.some((row: { direction: string; message: { result?: { _meta?: object } } }) => row.direction === 'in' && row.message.result?._meta)).toBe(true);
    expect(rows.some((row: { direction: string; message: { id?: string; result?: object } }) => row.direction === 'out' && row.message.id === 'native-teardown-fixture' && row.message.result)).toBe(true);
  } finally { await app.close(); }
});

it('retains the public PostMessageTransport source check before a packet is recorded or delivered', async () => {
  const trace = new SdkTrace(vi.fn()), outer = trace.wrap(new PostMessageTransport(window.parent, window.parent)), receive = vi.fn();
  trace.start();
  outer.onmessage = receive;
  await outer.start();
  try {
    const data = { jsonrpc: '2.0', id: 42, result: {} };
    window.dispatchEvent(new MessageEvent('message', { data, source: null }));
    expect(receive).not.toHaveBeenCalled(); expect(JSON.parse(trace.snapshot()).events).toHaveLength(0);
    window.dispatchEvent(new MessageEvent('message', { data, source: window.parent }));
    expect(receive).toHaveBeenCalledOnce(); expect(JSON.parse(trace.snapshot()).events).toHaveLength(1);
  } finally { await outer.close(); }
});

it('does not collect background read content or exhaust the opening buffer before deliberate recording', () => {
  const trace = new SdkTrace(vi.fn()); trace.observe('out', { method: 'ui/initialize', id: 1 });
  for (let i = 0; i < 1000; i++) trace.observe('in', { id: i + 2, result: { source_text: 'not opted in' } });
  trace.observe('in', { method: 'ui/notifications/tool-result', params: { structuredContent: { source_text: 'not an opening' } } });
  expect(JSON.parse(trace.snapshot())).toMatchObject({ truncated: false, logging: false });
  expect(JSON.parse(trace.snapshot()).events).toHaveLength(1);
  trace.start(); trace.observe('in', { id: 1002, result: { source_text: 'explicit recording' } });
  expect(JSON.parse(trace.snapshot()).events).toHaveLength(2);
});

it('retains inline request/ack and one terminal size without filling the console with resize traffic', () => {
  const emit=vi.fn(),sink=lifecycleConsole(emit);
  const row=(direction:string,message:unknown)=>JSON.stringify({direction,message});
  const size=row('out',{method:'ui/notifications/size-changed',params:{width:736,height:112}});
  sink(size);expect(emit).not.toHaveBeenCalled();
  sink(row('out',{method:'ui/request-display-mode',id:4,params:{mode:'inline'}}));
  sink(row('in',{id:4,result:{mode:'inline'}}));sink(size);
  for(let i=0;i<100;i++)sink(size);
  expect(emit).toHaveBeenCalledTimes(3);
});
